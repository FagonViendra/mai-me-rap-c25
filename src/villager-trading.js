/* MảiMêRáp — villager trading. Inventory commits are synchronous and all-or-nothing. */
(() => {
'use strict';
const V=globalThis.Voxel||={};
const REACH=4.5,MAX_BATCH=16,MAX_STACK=99999,COOLDOWN_MS=350,EPS=1e-5;
const ROLES=Object.freeze(['Nông dân','Thợ xây','Thợ rèn']);
const HITBOXES=Object.freeze({
 pig:Object.freeze([.44,1.08,.96]),sheep:Object.freeze([.44,1.24,.96]),
 cow:Object.freeze([.43,1.46,.78]),chicken:Object.freeze([.30,1.02,.52]),rabbit:Object.freeze([.28,1.02,.49]),
 wolf:Object.freeze([.30,1.34,.89]),fox:Object.freeze([.30,1.04,1.06]),horse:Object.freeze([.35,2.21,1.08]),
 walker:Object.freeze([.53,1.91,.34]),villager:Object.freeze([.53,1.95,.34])
});
const definitions=[
 ['farmer_wheat',0,'Bán lúa mì',[[121,20]],[[123,1]]],
 ['farmer_bread',0,'Mua bánh mì',[[123,1]],[[122,6]]],
 ['farmer_seeds',0,'Mua hạt giống',[[123,1]],[[120,12]]],
 ['builder_oak',1,'Bán thân sồi',[[5,16]],[[123,1]]],
 ['builder_stone',1,'Bán đá cuội',[[9,32]],[[123,1]]],
 ['builder_planks',1,'Mua ván gỗ',[[123,1]],[[8,24]]],
 ['smith_coal',2,'Bán than',[[109,16]],[[123,1]]],
 ['smith_iron',2,'Bán thỏi sắt',[[110,4]],[[123,1]]],
 ['smith_ingots',2,'Mua thỏi sắt',[[123,3]],[[110,2]]],
 ['smith_raw_copper',2,'Mua đồng thô',[[123,3]],[[141,6]]],
 ['builder_quartz',1,'Mua mảnh thạch anh',[[123,2]],[[143,4]]],
 ['builder_amethyst',1,'Mua tinh thạch tím',[[123,4]],[[144,4]]]
];
const OFFERS=Object.freeze(definitions.map(([id,role,name,need,out])=>Object.freeze({id,role,name,
 need:Object.freeze(need.map(row=>Object.freeze(row))),out:Object.freeze(out.map(row=>Object.freeze(row)))})));
const messages=Object.freeze({closed:'Cuộc trao đổi đã kết thúc.',no_target:'Hãy nhìn một dân làng ở gần.',
 unavailable:'Dân làng không còn ở gần để trao đổi.',blocked:'Có vật cản giữa bạn và dân làng.',
 changed:'Dân làng đã đổi công việc. Hãy mở lại trao đổi.',quantity:'Chọn từ 1 đến 16 lượt trao đổi.',
 offer:'Lựa chọn trao đổi không còn phù hợp.',items:'Chưa đủ vật phẩm để trao đổi.',
 overflow:'Túi đồ không còn chỗ cho vật phẩm nhận được.',inventory:'Túi đồ chưa hợp lệ. Hãy tải lại bản lưu.',
 catalog:'Vật phẩm này chưa sẵn sàng.',cooldown:'Chờ một chút rồi trao đổi tiếp.',busy:'Giao dịch trước đang hoàn tất.',internal:'Chưa thể hoàn tất trao đổi. Hãy thử lại.'});
const sessions=new WeakMap(),finite=Number.isFinite;
const vector=a=>Array.isArray(a)&&a.length===3&&a.every(finite),copyRows=rows=>rows.map(([id,count])=>[id,count]);
const fail=(reason,extra={})=>({ok:false,reason,message:messages[reason]||messages.internal,...extra});
const now=()=>globalThis.performance?.now?globalThis.performance.now():Date.now();
function state(app){let s=sessions.get(app);if(!s){s={session:null,lastTrade:-Infinity,busy:false,transactions:0};sessions.set(app,s);}return s;}
function gameReady(app){return !!(app&&app.started&&app.playing&&!app.inHome&&!app.starting&&!app.contextLost&&app.player&&finite(app.player.health)&&app.player.health>0&&[app.player.x,app.player.y,app.player.z].every(finite)&&app.world&&typeof app.world.ray==='function'&&Array.isArray(app.mobs)&&app.mobs.length<=64);}
function eye(app){const actual=app.api?.eye?.();return vector(actual)?actual.slice():[app.player.x,app.player.y+1.62,app.player.z];}
function direction(app){const p=app.player,c=Math.cos(p.pitch||0);return[Math.sin(p.yaw||0)*c,Math.sin(p.pitch||0),-Math.cos(p.yaw||0)*c];}
function unit(d){if(!vector(d))return null;const n=Math.hypot(...d);return n>1e-9&&finite(n)?d.map(v=>v/n):null;}
function loaded(world,m){if(world.chunks&&typeof world.chunks.get==='function'){const r=m.type==='villager'?.35:.32;for(const dx of[-r,r])for(const dz of[-r,r])if(!world.chunks.get(Math.floor((m.x+dx)/16)+','+Math.floor((m.z+dz)/16))?.data)return false;return true;}return typeof world.get==='function'&&world.get(Math.floor(m.x),95,Math.floor(m.z),true)!==13;}
function live(m){return !!(m&&!m.dead&&finite(m.health)&&m.health>0&&[m.x,m.y,m.z,m.yaw].every(finite));}
function roleOf(m){if(Number.isInteger(m.role)&&m.role>=0&&m.role<3)return m.role;return Number.isInteger(m.homeIndex)&&m.homeIndex>=0&&m.homeIndex<4?m.homeIndex%3:null;}
function hitBox(m,o,d){
 const box=Object.hasOwn(HITBOXES,m.type)?HITBOXES[m.type]:null;if(!box)return null;
 const [rx,h,rz]=box;
 const c=Math.cos(m.yaw),s=Math.sin(m.yaw),dx=o[0]-m.x,dz=o[2]-m.z;
 const ro=[dx*c+dz*s,o[1]-m.y,-dx*s+dz*c],rd=[d[0]*c+d[2]*s,d[1],-d[0]*s+d[2]*c],lo=[-rx,0,-rz],hi=[rx,h,rz];
 let near=0,far=REACH;
 for(let axis=0;axis<3;axis++){if(Math.abs(rd[axis])<1e-10){if(ro[axis]<lo[axis]||ro[axis]>hi[axis])return null;continue;}let a=(lo[axis]-ro[axis])/rd[axis],b=(hi[axis]-ro[axis])/rd[axis];if(a>b)[a,b]=[b,a];near=Math.max(near,a);far=Math.min(far,b);if(near>far+EPS)return null;}
 return far>=0&&near<=REACH+EPS?Math.max(0,near):null;
}
function nearest(app,o,d){
 const wall=app.world.ray(o,d,REACH);if(wall&&(!finite(wall.distance)||wall.distance<0))return null;
 let distance=Math.min(REACH,wall?.distance??REACH)+EPS,best=null;
 for(const mob of app.mobs){if(!live(mob)||!loaded(app.world,mob))continue;const hit=hitBox(mob,o,d);if(hit!==null&&hit<=distance){best=mob;distance=hit;}}
 return best;
}
function target(app,origin,dir){
 if(!gameReady(app))return null;
 const actualEye=eye(app),o=origin===undefined?actualEye:origin,d=unit(dir===undefined?direction(app):dir);
 if(!vector(o)||!d||Math.hypot(...o.map((v,i)=>v-actualEye[i]))>.05)return null;
 const mob=nearest(app,o,d);return mob?.type==='villager'&&roleOf(mob)!==null&&Math.hypot(mob.x-app.player.x,mob.y-app.player.y,mob.z-app.player.z)<=REACH+EPS?mob:null;
}
function validate(app){
 const s=state(app),v=s.session;if(!v)return fail('closed');const mob=v.mob;
 if(!gameReady(app)||app.world!==v.world||app.id!==v.worldId||app.player!==v.player||!app.mobs.includes(mob)||mob.type!=='villager'||!live(mob)||!loaded(app.world,mob)||Math.hypot(mob.x-app.player.x,mob.y-app.player.y,mob.z-app.player.z)>REACH+EPS){s.session=null;return fail('unavailable');}
 if(roleOf(mob)!==v.role){s.session=null;return fail('changed');}
 const o=eye(app),d=unit([mob.x-o[0],mob.y+.95-o[1],mob.z-o[2]]);
 if(!d||nearest(app,o,d)!==mob){s.session=null;return fail('blocked');}
 return{ok:true,s,v};
}
function inventoryCopy(app){
 const inventory=app.inventory;if(!inventory||typeof inventory!=='object'||Array.isArray(inventory))return null;
 const keys=Object.keys(inventory);if(keys.length>255)return null;const copy={};
 for(const key of keys){const descriptor=Object.getOwnPropertyDescriptor(inventory,key);
  if(!/^[1-9][0-9]{0,2}$/.test(key)||!Object.hasOwn(V.items||{},key)||!descriptor||!('value'in descriptor)||!Number.isInteger(descriptor.value)||descriptor.value<0||descriptor.value>MAX_STACK)return null;
  copy[key]=descriptor.value;
 }
 return copy;
}
function prepare(app,validated,offerId,batch){
 if(!Number.isInteger(batch)||batch<1||batch>MAX_BATCH)return fail('quantity');
 const offer=OFFERS.find(o=>o.id===offerId&&o.role===validated.v.role);if(!offer)return fail('offer');
 if([...offer.need,...offer.out].some(([id])=>!Object.hasOwn(V.items||{},id)))return fail('catalog');
 const next=inventoryCopy(app);if(!next)return fail('inventory');let maxBatch=MAX_BATCH;
 for(const[id,count]of offer.need)maxBatch=Math.min(maxBatch,Math.floor((next[id]||0)/count));
 for(const[id,count]of offer.out)maxBatch=Math.min(maxBatch,Math.floor((MAX_STACK-(next[id]||0))/count));
 const consumed=offer.need.map(([id,count])=>[id,count*batch]),grants=offer.out.map(([id,count])=>[id,count*batch]);
 const details={offerId:offer.id,batch,consumed,grants,maxBatch};
 for(const[id,count]of consumed)if((next[id]||0)<count)return fail('items',details);
 for(const[id,count]of consumed)next[id]=(next[id]||0)-count;
 for(const[id,count]of grants){const n=(next[id]||0)+count;if(!Number.isInteger(n)||n>MAX_STACK)return fail('overflow',details);next[id]=n;}
 if(Object.keys(next).length>255)return fail('overflow',details);
 const timestamp=now();if(!finite(timestamp))return fail('internal',details);
 const remainingMs=Math.max(0,Math.ceil(COOLDOWN_MS-(timestamp-validated.s.lastTrade)));
 if(remainingMs)return fail('cooldown',{...details,remainingMs});
 return{ok:true,...details,next,timestamp};
}
function publicQuote(q){const{next,timestamp,...answer}=q;return answer;}
V.trading=Object.freeze({
 REACH,MAX_BATCH,MAX_STACK,COOLDOWN_MS,roles:ROLES,offers:OFFERS,target,
 open(app,origin,dir){const s=state(app);if(s.busy)return fail('busy');s.session=null;const mob=target(app,origin,dir);if(!mob)return fail('no_target');s.session={mob,world:app.world,worldId:app.id,player:app.player,role:roleOf(mob)};return V.trading.view(app);},
 close(app){state(app).session=null;return{ok:true,open:false};},
 view(app){
  const valid=validate(app);if(!valid.ok)return{...valid,open:false};const{v}=valid;
  return{ok:true,open:true,role:v.role,roleName:ROLES[v.role],homeIndex:v.mob.homeIndex,maxBatch:MAX_BATCH,unlimited:true,
   offers:OFFERS.filter(o=>o.role===v.role).map(offer=>{const q=prepare(app,valid,offer.id,1);return{id:offer.id,name:offer.name,need:copyRows(offer.need),out:copyRows(offer.out),available:q.ok,maxBatch:q.maxBatch||0,reason:q.reason||null,message:q.message||'',remainingMs:q.remainingMs||0};})};
 },
 quote(app,offerId,batch=1){const valid=validate(app);return valid.ok?publicQuote(prepare(app,valid,offerId,batch)):valid;},
 trade(app,offerId,batch=1){
  const s=state(app);if(s.busy)return fail('busy');s.busy=true;
  try{
   const valid=validate(app);if(!valid.ok)return valid;
   const prior=app.inventory,q=prepare(app,valid,offerId,batch);if(!q.ok)return publicQuote(q);if(app.inventory!==prior)return fail('inventory');
   const answer={ok:true,offerId:q.offerId,batch:q.batch,consumed:q.consumed,grants:q.grants,transaction:s.transactions+1,message:'Trao đổi thành công.'};
   app.inventory=q.next;s.lastTrade=q.timestamp;s.transactions++;try{V.journey?.observe(app,'trade',{offerId:q.offerId});}catch(e){app.api?.record?.('error','Journey trade observation failed',String(e));}return answer;
  }catch{return fail('internal');}finally{s.busy=false;}
 }
});
})();
