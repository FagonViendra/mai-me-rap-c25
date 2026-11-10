/* MảiMêRáp — bounded, persistent three-slot furnaces. No DOM or rendering dependency. */
(() => {
 'use strict';const V=globalThis.Voxel||={};
 const MAX=128,STACK=64,INV_MAX=99999,COOK=10,RANGE=64,EPS=1e-8;
 const FUELS=Object.freeze({202:720,109:80,191:80,5:15,24:15,8:15,33:15,43:15,45:15,47:15,49:15,51:15,53:15,101:5});
 const MAX_BURN=Math.max(...Object.values(FUELS));
 const RECIPES=Object.freeze({205:142,5:191,24:191,43:191,47:191,51:191,195:196,111:110,113:114,9:3,4:10,26:11,115:116,117:118,125:126,127:128,129:130,141:142,174:175});
 const stores=new WeakMap(),integer=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b,finite=(n,a,b)=>typeof n==='number'&&Number.isFinite(n)&&n>=a&&n<=b;
 const key=p=>p.x+','+p.y+','+p.z,coord=(p,profile=V.coordinates.LEGACY)=>p&&V.coordinates.validBlock(p.x,p.y,p.z,profile,0,95);
 const fail=(code,message)=>({ok:false,code,message});
 function blank(p){return{x:p.x,y:p.y,z:p.z,inputId:0,inputCount:0,fuelId:0,fuelCount:0,outputId:0,outputCount:0,progress:0,burnLeft:0,burnTotal:0,burnItem:0};}
 function publicRow(r){const out=blank(r);for(const k of Object.keys(out))out[k]=r[k];return out;}
 function hasContents(r){return r.inputCount>0||r.fuelCount>0||r.outputCount>0||r.burnLeft>0;}
 function validateSaved(rows,profile=V.coordinates.LEGACY){
  if(!Array.isArray(rows)||rows.length>MAX)throw Error('Danh sách lò nung không hợp lệ.');
  const seen=new Set(),out=[];
  for(const x of rows){
   if(!x||typeof x!=='object'||Array.isArray(x)||!coord(x,profile)||seen.has(key(x)))throw Error('Vị trí lò nung không hợp lệ hoặc bị lặp.');
   const r=publicRow(x);
   for(const slot of ['input','fuel','output']){
    const id=r[slot+'Id'],n=r[slot+'Count'];
    if(!integer(n,0,STACK)||!integer(id,0,V.BLOCK_ID_MAX)||(n===0)!==(id===0))throw Error('Ô chứa của lò nung không hợp lệ.');
    if(n&&((slot==='input'&&!Object.hasOwn(RECIPES,id))||(slot==='fuel'&&!Object.hasOwn(FUELS,id))||(slot==='output'&&!Object.values(RECIPES).includes(id))))throw Error('Vật phẩm trong lò nung không hợp lệ.');
   }
   if(!finite(r.progress,0,COOK)||r.progress>=COOK||(!r.inputCount&&r.progress!==0)||!finite(r.burnLeft,0,MAX_BURN)||!finite(r.burnTotal,0,MAX_BURN)||!integer(r.burnItem,0,V.BLOCK_ID_MAX))throw Error('Đồng hồ lò nung không hợp lệ.');
   if(r.burnLeft>0){if(!Object.hasOwn(FUELS,r.burnItem)||r.burnTotal!==FUELS[r.burnItem]||r.burnLeft>r.burnTotal)throw Error('Nhiên liệu đang cháy không hợp lệ.');}
   else if(r.burnTotal!==0||r.burnItem!==0)throw Error('Lò đã tắt còn đồng hồ nhiên liệu.');
   seen.add(key(r));out.push(r);
  }
  return out;
 }
 function init(app,saved=[]){const rows=validateSaved(saved,app.world?.coordinateProfile),s={world:app.world,id:app.id,records:new Map(rows.map(r=>[key(r),r])),tick:0,revision:0,lights:[],visible:[],lightKey:''};stores.set(app,s);return inspect(app);}
 function state(app){let s=stores.get(app);if(!s||s.world!==app.world||s.id!==app.id){init(app,[]);s=stores.get(app);}return s;}
 function loaded(app,p){return !!app.world?.chunks?.get(Math.floor(p.x/16)+','+Math.floor(p.z/16))?.data;}
 function distance2(p,q){return (p.x+.5-q.x)**2+(p.y+.5-q.y)**2+(p.z+.5-q.z)**2;}
 function access(app,p){
  if(!coord(p,app.world?.coordinateProfile))return fail('position','Vị trí lò không hợp lệ.');
  const a=app.player;if(!app.playing||app.inHome||app.starting||app.contextLost||!a||!finite(a.health,0,20)||a.health<=0||![a.x,a.y,a.z].every(Number.isFinite))return fail('inactive','Hiện không thể dùng lò.');
  if(distance2(p,a)>25)return fail('range','Hãy đứng trong tầm 5 khối của lò.');
  if(!loaded(app,p)||app.world.get(p.x,p.y,p.z)!==32)return fail('missing','Lò không còn ở vị trí này.');
  return {ok:true};
 }
 function record(app,p,create=false){
  const s=state(app),k=key(p);let r=s.records.get(k);
  if(!r&&create){
   if(s.records.size>=MAX)for(const[k2,r2]of s.records)if(!hasContents(r2))s.records.delete(k2);
   if(s.records.size>=MAX)return null;r=blank(p);s.records.set(k,r);
  }return r||null;
 }
 function inventory(app){
  const inv=app.inventory;if(!inv||typeof inv!=='object'||Array.isArray(inv))return null;
  for(const [id,n]of Object.entries(inv))if(!Object.hasOwn(V.items||{},id)||!integer(n,0,INV_MAX))return null;
  return {...inv};
 }
 function give(inv,id,n){if(!integer(inv[id]||0,0,INV_MAX)||(inv[id]||0)+n>INV_MAX)return false;inv[id]=(inv[id]||0)+n;return true;}
 function keepHotbar(app){if(app.mode==='survival'&&Array.isArray(app.hotbar))app.hotbar=app.hotbar.map(id=>id&&!(app.inventory[id]>0)?0:id);}
 function view(app,p){
  const a=access(app,p);if(!a.ok)return a;const r=record(app,p,true);if(!r)return fail('limit','Đã có 128 lò chứa dữ liệu. Hãy lấy hết đồ ở một lò trước.');
  const output=RECIPES[r.inputId]||0,room=!!output&&(!r.outputCount||r.outputId===output)&&r.outputCount<STACK;
  return{ok:true,...publicRow(r),cookSeconds:COOK,outputForInput:output,canProcess:room,lit:r.burnLeft>0,
   status:!r.inputCount?'Chờ nguyên liệu':!room?'Hãy lấy thành phẩm ra':r.burnLeft>0?'Đang nung':r.fuelCount?'Sẵn sàng nhóm lò':'Chờ nhiên liệu'};
 }
 function put(app,p,slot,id,n=1){
  const a=access(app,p);if(!a.ok)return a;if(!['input','fuel'].includes(slot)||!integer(n,1,STACK)||!integer(id,1,V.BLOCK_ID_MAX))return fail('argument','Số lượng hoặc ô chứa không hợp lệ.');
  const table=slot==='input'?RECIPES:FUELS;if(!Object.hasOwn(table,id))return fail('item',slot==='input'?'Vật phẩm này không nung được.':'Vật phẩm này không dùng làm nhiên liệu.');
  const inv=inventory(app);if(!inv)return fail('inventory','Túi đồ không hợp lệ.');if((inv[id]||0)<n)return fail('stock','Không đủ vật phẩm trong túi.');
  const r=record(app,p,true);if(!r)return fail('limit','Đã đạt giới hạn lò chứa dữ liệu.');
  if(r[slot+'Count']&&r[slot+'Id']!==id)return fail('occupied','Lấy vật phẩm cũ ra trước khi đổi loại.');
  if(r[slot+'Count']+n>STACK)return fail('capacity','Mỗi ô của lò chứa tối đa 64 vật phẩm.');
  inv[id]-=n;r[slot+'Id']=id;r[slot+'Count']+=n;app.inventory=inv;keepHotbar(app);return{ok:true,slot,id,count:n,state:view(app,p)};
 }
 function take(app,p,slot,n=STACK){
  const a=access(app,p);if(!a.ok)return a;if(!['input','fuel','output'].includes(slot)||!integer(n,1,STACK))return fail('argument','Ô chứa hoặc số lượng không hợp lệ.');
  const r=record(app,p,false);if(!r||!r[slot+'Count'])return fail('empty','Ô này đang trống.');
  const id=r[slot+'Id'],amount=Math.min(n,r[slot+'Count']),inv=inventory(app);if(!inv||!give(inv,id,amount))return fail('overflow','Túi đồ không còn chỗ cho số lượng này.');
  r[slot+'Count']-=amount;if(!r[slot+'Count']){r[slot+'Id']=0;if(slot==='input')r.progress=0;}app.inventory=inv;if(slot==='output'){try{V.journey?.observe(app,'smelt',{id,count:amount});}catch(e){app.api?.record?.('error','Journey smelt observation failed',String(e));}}return{ok:true,slot,id,count:amount,state:view(app,p)};
 }
 function returnContents(app,r){
  const inv=inventory(app);if(!inv)return null;
  for(const slot of ['input','fuel','output'])if(r[slot+'Count']&&!give(inv,r[slot+'Id'],r[slot+'Count']))return null;
  return inv;
 }
 function breakBlock(app,p,changeWorld){
  if(!coord(p,app.world?.coordinateProfile)||typeof changeWorld!=='function')return fail('argument','Không thể tháo lò.');
  const s=state(app),r=s.records.get(key(p)),inv=r?returnContents(app,r):null;
  if(r&&!inv)return fail('overflow','Lấy bớt đồ trong lò trước khi phá để tránh mất vật phẩm.');
  if(!changeWorld())return fail('world',app.world.lastEditError||'Chưa thể sửa khối này.');
  if(r){app.inventory=inv;s.records.delete(key(p));rebuildLights(app,s);}
  return{ok:true,returned:!!r};
 }
 function canCook(r){const out=RECIPES[r.inputId]||0;return r.inputCount>0&&out>0&&(!r.outputCount||r.outputId===out)&&r.outputCount<STACK;}
 function advance(r,dt){
  let left=dt,guard=0;
  while(left>EPS&&guard++<8){
   const cook=canCook(r);
   if(r.burnLeft<=EPS){
    r.burnLeft=r.burnTotal=r.burnItem=0;
    if(cook&&r.fuelCount>0){const fuel=r.fuelId;r.fuelCount--;if(!r.fuelCount)r.fuelId=0;r.burnLeft=r.burnTotal=FUELS[fuel];r.burnItem=fuel;}
    else{r.progress=cook?Math.max(0,r.progress-left*2):0;break;}
   }
   const step=Math.min(left,r.burnLeft,cook?COOK-r.progress:Infinity);
   if(step<=EPS){if(cook&&r.progress>=COOK-EPS){finish(r);continue;}break;}
   r.burnLeft=Math.max(0,r.burnLeft-step);left-=step;r.progress=cook?r.progress+step:0;
   if(cook&&r.progress>=COOK-EPS)finish(r);
   if(r.burnLeft<=EPS)r.burnLeft=r.burnTotal=r.burnItem=0;
  }
 }
 function finish(r){const out=RECIPES[r.inputId];r.inputCount--;if(!r.inputCount)r.inputId=0;r.outputId=out;r.outputCount++;r.progress=0;}
 function rebuildLights(app,s){
  const list=[];s.visible=[];for(const r of s.records.values())if(r.burnLeft>0&&loaded(app,r)&&app.world.get(r.x,r.y,r.z)===32){if(!r.point)r.point=[r.x+.5,r.y+.6,r.z+.8];list.push(r.point);s.visible.push(r);}
  const signature=list.map(p=>p.join(',')).join(';');if(signature!==s.lightKey){s.lightKey=signature;s.lights=list;s.revision++;}
 }
 function update(app,dt){
  if(!Number.isFinite(dt)||dt<=0)return;const s=state(app);s.tick+=Math.min(dt,.25);if(s.tick<.1-EPS)return;const elapsed=Math.min(s.tick,.5);s.tick=0;
  for(const[k,r]of s.records){
   r.active=false;if(!app.player||distance2(r,app.player)>RANGE*RANGE||!loaded(app,r))continue;
   if(app.world.get(r.x,r.y,r.z)!==32){
    const inv=returnContents(app,r);if(inv){app.inventory=inv;s.records.delete(k);}continue;
   }
   r.active=true;advance(r,elapsed);
  }rebuildLights(app,s);
 }
 function snapshot(app){return [...state(app).records.values()].filter(hasContents).map(publicRow).sort((a,b)=>a.x-b.x||a.y-b.y||a.z-b.z);}
 function inspect(app){const s=state(app);return{registered:s.records.size,stored:snapshot(app).length,burning:[...s.records.values()].filter(r=>r.burnLeft>0).length,lightRevision:s.revision,maxFurnaces:MAX,stackLimit:STACK};}
 function effects(app,clock=0){
  const result=[],p=app.player;if(!p)return result;
  for(const r of state(app).visible){
   if(!r.effects)r.effects=[
    {p:[r.x+.5,r.y+.30,r.z+1.012],s:[.38,.15,.025],id:19,kind:-1,yaw:0,tint:[1,.29,.035],emissive:1,light:1},
    {p:[r.x+.5,r.y+.35,r.z+1.032],s:[.16,.23,.028],id:19,kind:-1,yaw:0,tint:[1,.78,.19],emissive:1,light:1}
   ];
   r.effects[1].s[1]=.21+.025*Math.sin(clock*17+r.x*1.7+r.z);result.push(...r.effects);
  }return result;
 }
 V.furnaces=Object.freeze({MAX_FURNACES:MAX,STACK,COOK_SECONDS:COOK,FUELS,RECIPES,init,validateSaved,view,put,take,breakBlock,update,snapshot,inspect,effects,
  lights(app){return state(app).lights;},lightRevision(app){return state(app).revision;}});
})();