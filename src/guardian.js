/* Mải Mê Ráp — Hộ Vệ Lăng Kính. Original, bounded, per-world encounter. */
(() => {
 'use strict';
 const V=globalThis.Voxel||={},MAX_HP=96,SIGIL=184,CORE=185,COIN=123,INV_MAX=99999;

 const PROFILES=Object.freeze([
  {id:'prism',title:'Hộ Vệ Lăng Kính',description:'Giáp gốm, lõi tím và các mảnh tinh thể quay quanh thân.',hint:'Rời vòng sáng trước khi nó bùng lên.',attackName:'Vòng lăng kính',pattern:'disc',
   phaseNames:['Thức tỉnh','Vòng lăng kính','Tim bão'],phaseHints:['Vòng nổ quanh chân Hộ Vệ; lùi ra ngoài vòng.','Vòng khóa vị trí bạn đang đứng; tiếp tục di chuyển.','Vòng rộng hơn và báo ngắn hơn; giữ đường thoát trống.'],
   radius:[2.8,2.6,3.2],inner:[0,0,0],length:[0,0,0],halfWidth:[0,0,0],duration:[1.4,1.2,1],damage:[3,4,5],cooldown:[2.4,2.2,1.6],speed:[1.25,1.5,2.05]},
  {id:'stone',title:'Hộ Vệ Thạch Giáp',description:'Thân thấp, vai đá xếp lớp và hai nắm tay nặng; đòn chấn lan thành vành.',hint:'Vào vùng tâm hoặc ra ngoài vành chấn.',attackName:'Vành chấn thạch',pattern:'annulus',
   phaseNames:['Giáp thức giấc','Vành đá lan','Địa chấn dồn'],phaseHints:['Khoảng giữa tâm và vòng ngoài sẽ chịu chấn; tâm sáng là chỗ tránh.','Vành mở rộng; chọn vào tâm hoặc lùi hẳn ra ngoài.','Chấn đến nhanh hơn; đừng đứng giữa hai đường viền.'],
   radius:[3.4,3.8,4.2],inner:[1,1.25,1.5],length:[0,0,0],halfWidth:[0,0,0],duration:[1.65,1.5,1.35],damage:[4,5,6],cooldown:[2.8,2.6,2.3],speed:[.90,1.05,1.15]},
  {id:'wind',title:'Hộ Vệ Phong Dực',description:'Thân lơ lửng, cánh phiến và đuôi tinh thể; đòn gió khóa thành dải thẳng.',hint:'Né ngang ra khỏi hai cạnh dải gió.',attackName:'Dải phong kích',pattern:'lane',
   phaseNames:['Cánh mở','Phong tuyến','Gió dồn'],phaseHints:['Dải gió khóa hướng khi hiện; bước sang một bên.','Dải dài và rộng hơn; tránh hai cạnh, không chỉ lùi thẳng.','Thời gian báo ngắn hơn; sẵn đường né ngang trước mỗi đòn.'],
   radius:[0,0,0],inner:[0,0,0],length:[9,10,11],halfWidth:[.7,.85,1],duration:[1.55,1.35,1.15],damage:[3,4,5],cooldown:[2.55,2.25,1.95],speed:[1.30,1.55,1.80]}
 ].map(p=>{for(const k of Object.keys(p))if(Array.isArray(p[k]))Object.freeze(p[k]);return Object.freeze(p);}));
 const PROFILE_BY_ID=Object.freeze(Object.fromEntries(PROFILES.map(p=>[p.id,p])));
 const PROFILE_VIEWS=Object.freeze(PROFILES.map(p=>Object.freeze({id:p.id,title:p.title,description:p.description,hint:p.hint,attackName:p.attackName,pattern:p.pattern,phases:Object.freeze(p.phaseNames.map((name,i)=>Object.freeze({name,hint:p.phaseHints[i]})))})));
 const bossProfile=b=>PROFILE_BY_ID[b?.profileId||'prism'];
 const nextProfile=data=>PROFILE_BY_ID[data.selection]||PROFILES[data.attempts%PROFILES.length];
 const profileView=id=>PROFILE_VIEWS.find(p=>p.id===id);
 function attackSpec(id,stage){const p=PROFILE_BY_ID[id],i=stage-1;return{pattern:p.pattern,radius:p.radius[i],innerRadius:p.inner[i],halfLength:p.length[i]/2,halfWidth:p.halfWidth[i],duration:p.duration[i],damage:p.damage[i],phase:stage};}
 function upgradeLegacy(raw){
  const data=copy(raw);data.version=2;data.selection='auto';
  if(data.active){data.active.profileId='prism';if(data.active.telegraph)Object.assign(data.active.telegraph,{pattern:'disc',innerRadius:0,angle:0,halfLength:0,halfWidth:0});}
  return data;
 }

 const states=new WeakMap(),renders=new WeakMap();
 const finite=(n,a,b)=>typeof n==='number'&&Number.isFinite(n)&&n>=a&&n<=b;
 const integer=(n,a,b)=>Number.isInteger(n)&&finite(n,a,b);
 const plain=x=>x&&typeof x==='object'&&!Array.isArray(x)&&[Object.prototype,null].includes(Object.getPrototypeOf(x));
 const keys=(o,allowed)=>plain(o)&&Object.keys(o).every(k=>allowed.includes(k))&&allowed.every(k=>Object.hasOwn(o,k));
 const copy=x=>JSON.parse(JSON.stringify(x));
 const phase=hp=>hp>64?1:hp>32?2:3;
 function defaults(){return{version:2,wins:0,attempts:0,active:null,pending:null,lastOutcome:'',selection:'auto'};}
 function validateLegacySaved(raw,profile=V.coordinates.LEGACY){
  if(raw===undefined)return defaults();
  const fail=()=>{throw new TypeError('Dữ liệu thử thách Hộ Vệ không hợp lệ.');};
  if(!keys(raw,['version','wins','attempts','active','pending','lastOutcome'])||raw.version!==1||!integer(raw.wins,0,1000000)||!integer(raw.attempts,0,1000000)||raw.wins>raw.attempts||!['','active','victory','defeat','abandoned'].includes(raw.lastOutcome))fail();
  const validPos=(x,y,z)=>finite(x,-1e9,1e9)&&finite(y,0,92)&&finite(z,-1e9,1e9)&&V.coordinates.validBlock(Math.floor(x),Math.floor(y),Math.floor(z),profile,0,95);
  if(raw.active!==null){
   const b=raw.active;
   if(!keys(b,['attempt','x','y','z','health','yaw','age','cooldown','telegraph'])||!integer(b.attempt,1,1000000)||b.attempt!==raw.attempts||!validPos(b.x,b.y,b.z)||!finite(b.health,.000001,MAX_HP)||!finite(b.yaw,-Math.PI,Math.PI)||!finite(b.age,0,10000000)||!finite(b.cooldown,0,8)||raw.lastOutcome!=='active'||raw.pending!==null||raw.wins>=raw.attempts)fail();
   if(b.telegraph!==null){
    const t=b.telegraph;
    if(!keys(t,['x','y','z','radius','remaining','duration','damage','phase'])||!validPos(t.x,t.y,t.z)||![2.8,2.6,3.2].includes(t.radius)||!finite(t.remaining,0,1.6)||![1.4,1.2,1].includes(t.duration)||t.remaining>t.duration||![3,4,5].includes(t.damage)||!integer(t.phase,1,3))fail();
    if(t.radius!==[0,2.8,2.6,3.2][t.phase]||t.duration!==[0,1.4,1.2,1][t.phase]||t.damage!==t.phase+2)fail();
   }
  } else if(raw.lastOutcome==='active')fail();
  if(raw.pending!==null){
   const p=raw.pending;
   if(!keys(p,['attempt','cores','coins'])||!integer(p.attempt,1,1000000)||p.attempt!==raw.attempts||p.cores!==3||p.coins!==6||raw.active!==null||raw.lastOutcome!=='victory'||raw.wins<1)fail();
  }
  return copy(raw);
 }
 function validateSaved(raw,profile=V.coordinates.LEGACY){
  if(raw===undefined)return defaults();
  if(plain(raw)&&raw.version===1)return upgradeLegacy(validateLegacySaved(raw,profile));
  const fail=()=>{throw new TypeError('Dữ liệu thử thách Hộ Vệ không hợp lệ.');};
  if(!keys(raw,['version','wins','attempts','active','pending','lastOutcome','selection'])||raw.version!==2||!['auto','prism','stone','wind'].includes(raw.selection))fail();
  const legacy={version:1,wins:raw.wins,attempts:raw.attempts,active:null,pending:raw.pending,lastOutcome:raw.lastOutcome};
  if(raw.active!==null){
   const b=raw.active;
   if(!keys(b,['attempt','x','y','z','health','yaw','age','cooldown','telegraph','profileId'])||!Object.hasOwn(PROFILE_BY_ID,b.profileId))fail();
   legacy.active={attempt:b.attempt,x:b.x,y:b.y,z:b.z,health:b.health,yaw:b.yaw,age:b.age,cooldown:b.cooldown,telegraph:null};
   if(b.telegraph!==null){
    const t=b.telegraph;
    if(!keys(t,['x','y','z','radius','remaining','duration','damage','phase','pattern','innerRadius','angle','halfLength','halfWidth'])||!integer(t.phase,1,3))fail();
    const a=attackSpec(b.profileId,t.phase);
    if(!finite(t.x,-1e9,1e9)||!finite(t.y,0,92)||!finite(t.z,-1e9,1e9)||!V.coordinates.validBlock(Math.floor(t.x),Math.floor(t.y),Math.floor(t.z),profile,0,95))fail();
    for(const k of ['radius','duration','damage','pattern','innerRadius','halfLength','halfWidth'])if(t[k]!==a[k])fail();
    if(!finite(t.remaining,0,t.duration)||!finite(t.angle,-Math.PI,Math.PI)||(t.pattern!=='lane'&&t.angle!==0))fail();
   }
  }
  validateLegacySaved(legacy,profile);
  return copy(raw);
 }
 function chooseProfile(app,id){
  const s=state(app);
  if(typeof id!=='string'||!['auto','prism','stone','wind'].includes(id))return result(false,'profile','Loại Hộ Vệ không hợp lệ.');
  if(!s||app.inHome||app.starting||app.contextLost||!(app.player?.health>0))return result(false,'inactive','Hãy vào một thế giới đang hoạt động để chọn Hộ Vệ.');
  if(s.data.active||s.data.pending)return result(false,'busy','Hoàn tất thử thách hoặc nhận thưởng đang chờ trước khi đổi Hộ Vệ.');
  s.data.selection=id;
  return result(true,'selected',id==='auto'?'Đã chọn luân phiên ba Hộ Vệ.':'Ấn tiếp theo sẽ gọi '+PROFILE_BY_ID[id].title+'.');
 }

 function init(app,saved){
  const s=validateSaved(saved,app.world?.coordinateProfile);
  states.set(app,{worldId:app.id,data:s,hitFlash:0,pulseFlash:0,lastPulse:null});
  renders.delete(app);return snapshot(app);
 }
 function state(app){const s=states.get(app);return s&&s.worldId===app.id?s:null;}
 function snapshot(app){return copy(state(app)?.data||defaults());}
 function runnable(app){return!!(app.playing&&!app.inHome&&!app.starting&&!app.contextLost&&!app.panel&&app.player?.health>0);}
 function get(world,x,y,z){return world.get(Math.floor(x),Math.floor(y),Math.floor(z),true);}
 function safeStand(app,x,y,z){
  const w=app.world;
  if(!finite(y,1,91)||!V.coordinates.validBlock(Math.floor(x),Math.floor(y),Math.floor(z),w.coordinateProfile,1,91))return false;
  for(let zz=Math.floor(z-.66);zz<=Math.floor(z+.66);zz++)for(let xx=Math.floor(x-.66);xx<=Math.floor(x+.66);xx++){
   const base=get(w,xx,y-1,zz),def=V.blocks[base];
   if(!def?.solid||def.leaf||(def.shape&&def.shape!=='cube')||[7,30,71,72,77,78].includes(base))return false;
   for(let yy=Math.floor(y);yy<Math.ceil(y+3.4);yy++)if(get(w,xx,yy,zz)!==0)return false;
  }
  return true;
 }
 function standNear(app,x,z,y){
  for(const dy of[0,1,-1,-2]){const yy=Math.floor(y)+dy;if(safeStand(app,x,yy,z))return yy;}
  return null;
 }
 function say(app,text){app.api?.toast?.(text,4200);}
 function refresh(app){app.api?.renderHotbar?.();app.api?.updateHUD?.();}
 function result(ok,code,message,extra={}){return{ok,code,message,...extra};}
 function summon(app,target,requestedProfile){
  const s=state(app);
  if(!s||!runnable(app))return result(false,'inactive','Hãy trở lại thế giới để dùng ấn.');
  if(requestedProfile!==undefined&&(typeof requestedProfile!=='string'||!Object.hasOwn(PROFILE_BY_ID,requestedProfile)))return result(false,'profile','Loại Hộ Vệ không hợp lệ.');
  const profile=requestedProfile===undefined?nextProfile(s.data):PROFILE_BY_ID[requestedProfile];
  if(app.dimension!=='overworld')return result(false,'realm','Ấn này dùng ở thế giới chính.');
  if(s.data.active)return result(false,'active','Hộ Vệ đang chờ. Hoàn tất hoặc kết thúc thử thách hiện tại.');
  if(s.data.pending)return result(false,'pending','Hãy nhận phần thưởng còn chờ trong Sổ Gió trước.');
  if(s.data.attempts>=1000000)return result(false,'limit','Ô lưu đã đạt giới hạn số thử thách.');
  if(app.mode==='survival'&&!(app.inventory[SIGIL]>0))return result(false,'empty','Bạn chưa có Ấn gọi Hộ Vệ.');
  if(!target||!Number.isInteger(target.x)||!Number.isInteger(target.y)||!Number.isInteger(target.z)||!V.blocks[target.id]?.solid)return result(false,'target','Nhìn vào nền khô, rộng để dùng ấn.');
  const x=target.x+.5,y=target.y+1,z=target.z+.5;
  const reach=app.mode==='creative'?6:5;if(Math.hypot(x-app.player.x,target.y+.5-(app.player.y+1.62),z-app.player.z)>reach+.9)return result(false,'reach','Chọn một mặt nền trong tầm tay.');
  if(!safeStand(app,x,y,z))return result(false,'space','Cần nền khô 3 × 3, phía trên trống ít nhất 4 khối.');
  if(Math.hypot(x-app.player.x,z-app.player.z)<2.8)return result(false,'near','Lùi lại ít nhất 3 khối để chừa chỗ cho Hộ Vệ.');
  if((app.mobs||[]).some(m=>!m.dead&&m.health>0&&Math.hypot(x-m.x,z-m.z)<2.6))return result(false,'crowded','Vị trí này đang có sinh vật; chọn chỗ trống.');
  if(app.mode==='survival'){
   app.inventory[SIGIL]--;
   if(!app.inventory[SIGIL])app.hotbar=app.hotbar.map(id=>id===SIGIL?0:id);
  }
  const attempt=++s.data.attempts;
  s.data.active={attempt,x,y,z,health:MAX_HP,yaw:0,age:0,cooldown:2.5,telegraph:null,profileId:profile.id};
  s.data.lastOutcome='active';s.hitFlash=0;s.pulseFlash=0;s.lastPulse=null;
  refresh(app);app.api?.save?.(false);
  return result(true,'summoned',profile.title+' thức giấc. '+profile.hint,{attempt,profileId:profile.id});
 }
 function collect(app){
  const s=state(app),p=s?.data.pending;
  if(!p)return result(false,'empty','Không có phần thưởng đang chờ.',{grants:[]});
  if(app.mode!=='survival')return result(false,'creative','Thử thách Sáng tạo không cấp vật phẩm thưởng.',{grants:[]});
  const grants=[[CORE,p.cores],[COIN,p.coins]];
  if(grants.some(([id,n])=>!integer(app.inventory[id]||0,0,INV_MAX)||(app.inventory[id]||0)+n>INV_MAX))return result(false,'full','Túi đầy. Dùng bớt lõi/ngọc rồi nhận thưởng trong Sổ Gió.',{grants:[]});
  for(const[id,n]of grants)app.inventory[id]=(app.inventory[id]||0)+n;
  s.data.pending=null;refresh(app);
  return result(true,'collected','Đã nhận 3 Lõi lăng kính và 6 ngọc.',{grants});
 }
 function finish(app,kind){
  const s=state(app),b=s?.data.active;if(!b)return;
  s.data.active=null;s.data.lastOutcome=kind;s.hitFlash=0;s.pulseFlash=0;s.lastPulse=null;
  if(kind==='victory'){
   s.data.wins++;
   if(app.mode==='survival'){
    s.data.pending={attempt:b.attempt,cores:3,coins:6};
    const r=collect(app);say(app,r.ok?'Đã hạ Hộ Vệ! 3 Lõi lăng kính mở đường chế tạo giáp mới.':r.message);
   }else say(app,'Đã hoàn tất thử thách Sáng tạo. Phần thưởng dành cho Sinh tồn.');
  }else if(kind==='defeat')say(app,'Hộ Vệ đã ngủ lại. Chuẩn bị thêm trang bị rồi dùng một ấn mới.');
  app.api?.save?.(false);
 }
 function abandon(app){
  const s=state(app);if(!s?.data.active)return result(false,'empty','Không có thử thách đang diễn ra.');
  finish(app,'abandoned');return result(true,'abandoned','Đã kết thúc thử thách. Ấn đã dùng không được hoàn lại.');
 }
 function onDeath(app){if(state(app)?.data.active)finish(app,'defeat');}
 function rayBox(o,d,lo,hi,limit){
  let near=0,far=limit;
  for(let i=0;i<3;i++){
   if(Math.abs(d[i])<1e-8){if(o[i]<lo[i]||o[i]>hi[i])return null;continue;}
   let a=(lo[i]-o[i])/d[i],b=(hi[i]-o[i])/d[i];if(a>b)[a,b]=[b,a];
   near=Math.max(near,a);far=Math.min(far,b);if(near>far)return null;
  }return near<=limit?near:null;
 }
 function targetDistance(app,origin,dir,limit=5){
  const b=state(app)?.data.active;
  if(!b||app.dimension!=='overworld'||!finite(limit,0,6)||!Array.isArray(origin)||!Array.isArray(dir)||origin.length!==3||dir.length!==3||![...origin,...dir].every(Number.isFinite))return null;
  const length=Math.hypot(...dir);if(!Number.isFinite(length)||length<1e-9)return null;const unit=dir.map(n=>n/length);
  return rayBox(origin,unit,[b.x-.85,b.y,b.z-.85],[b.x+.85,b.y+3.4,b.z+.85],limit);
 }
 function attack(app,origin,dir,limit=5){
  const s=state(app),b=s?.data.active;
  if(!b||!runnable(app)||targetDistance(app,origin,dir,limit)===null)return false;
  const requested=app.hotbar?.[app.selected]||0,held=app.mode==='survival'&&!(app.inventory[requested]>0)?0:requested;
  const amount=app.mode==='creative'?b.health:(held===107?5:held===194?4:V.items[held]?.kind==='tool'?2:1)*(V.equipment?.bonuses(app).melee||1);
  const old=phase(b.health);b.health=Math.max(0,b.health-amount);s.hitFlash=.22;
  if(b.health<=0)finish(app,'victory');
  else if(phase(b.health)!==old)say(app,bossProfile(b).title+' đổi nhịp: '+bossProfile(b).phaseNames[phase(b.health)-1]+'. '+bossProfile(b).hint);
  return true;
 }
 function canSee(app,b){
  const p=app.player,o=[b.x,b.y+2.3,b.z],to=[p.x,p.y+1.2,p.z],v=to.map((x,i)=>x-o[i]),d=Math.hypot(...v);
  if(d<.01)return true;
  const hit=app.world.ray(o,v.map(x=>x/d),d);
  return !hit||hit.distance>=d-.2;
 }
 function move(app,b,dt,stage){
  const p=app.player,dx=p.x-b.x,dz=p.z-b.z,dist=Math.hypot(dx,dz),profile=bossProfile(b);
  b.yaw=Math.atan2(dx,-dz);
  const desired=profile.id==='prism'?(stage===2?4:1.9):profile.id==='stone'?2.6:4.6;
  if(dist<desired||dist>36)return;
  const speed=profile.speed[stage-1];let ux=dx/dist,uz=dz/dist;
  if(profile.id==='wind'&&dist<9){const a=Math.sin(b.age*.7)>=0?.58:-.58,ca=Math.cos(a),sa=Math.sin(a),x=ux;ux=x*ca-uz*sa;uz=x*sa+uz*ca;}
  for(const angle of[0,.7,-.7,1.3,-1.3]){
   const ca=Math.cos(angle),sa=Math.sin(angle),x=b.x+(ux*ca-uz*sa)*speed*dt,z=b.z+(ux*sa+uz*ca)*speed*dt;
   const y=standNear(app,x,z,b.y);
   if(y!==null){b.x=x;b.y=y;b.z=z;break;}
  }
 }
 function insideAttack(t,p){
  if(Math.abs(p.y-t.y)>=3.2)return false;
  const dx=p.x-t.x,dz=p.z-t.z;
  if(t.pattern==='lane'){
   const along=dx*Math.sin(t.angle)-dz*Math.cos(t.angle),across=dx*Math.cos(t.angle)+dz*Math.sin(t.angle);
   return Math.abs(along)<t.halfLength&&Math.abs(across)<t.halfWidth;
  }
  const radius=Math.hypot(dx,dz);
  return radius<t.radius&&(t.pattern!=='annulus'||radius>=t.innerRadius);
 }
 function tick(app,dt){
  const s=state(app),b=s?.data.active;if(!s||!finite(dt,0,.2))return;
  s.hitFlash=Math.max(0,s.hitFlash-dt);s.pulseFlash=Math.max(0,s.pulseFlash-dt);
  if(!b||!runnable(app)||app.dimension!=='overworld')return;
  if(Math.hypot(b.x-app.player.x,b.z-app.player.z)>48)return;
  b.age=Math.min(10000000,b.age+dt);
  const stage=phase(b.health),profile=bossProfile(b);
  if(b.telegraph){
   const t=b.telegraph;t.remaining=Math.max(0,t.remaining-dt);
   if(t.remaining===0){
    s.lastPulse={...t};s.pulseFlash=.4;b.telegraph=null;b.cooldown=profile.cooldown[t.phase-1];
    if(insideAttack(t,app.player))app.api?.damage?.(t.damage,profile.id==='prism'?'Bạn chưa kịp tránh vòng lăng kính của Hộ Vệ.':profile.id==='stone'?'Bạn đang đứng trong vành chấn của Thạch Giáp.':'Bạn chưa né ngang khỏi dải gió của Phong Dực.','explosion');
   }
  }else{
   move(app,b,dt,stage);b.cooldown=Math.max(0,b.cooldown-dt);
   const dist=Math.hypot(b.x-app.player.x,b.z-app.player.z);
   const trigger=profile.id==='prism'?(stage===1?5:14):profile.id==='stone'?[5.8,6.4,7][stage-1]:14;
   if(b.cooldown<=0&&dist<=trigger&&canSee(app,b)){
    const targeted=profile.id==='prism'&&stage>1,p=app.player,a=attackSpec(profile.id,stage);
    let x=targeted?p.x:b.x,z=targeted?p.z:b.z,y=Math.min(91,Math.max(1,targeted?Math.floor(p.y):b.y)),angle=0;
    if(profile.id==='wind'){
     angle=Math.atan2(p.x-b.x,-(p.z-b.z));x+=Math.sin(angle)*a.halfLength;z-=Math.cos(angle)*a.halfLength;
    }
    if(V.coordinates.validBlock(Math.floor(x),Math.floor(y),Math.floor(z),app.world.coordinateProfile,0,95))b.telegraph={x,y,z,...a,angle,remaining:a.duration};
    else b.cooldown=.5;
   }
  }
 }

 function view(app){
  const s=state(app),data=s?.data||defaults(),b=data.active,p=data.pending,next=nextProfile(data),profile=b?bossProfile(b):next;
  const title=profile.title;
  return{title,wins:data.wins,attempts:data.attempts,lastOutcome:data.lastOutcome,profiles:PROFILE_VIEWS,selection:data.selection,nextProfile:profileView(next.id),selectionLocked:!s||!!b||!!p||!!app.inHome||!!app.starting||!!app.contextLost||!(app.player?.health>0),
   active:b?{title,profileId:profile.id,description:profile.description,hint:profile.hint,attackName:profile.attackName,health:b.health,maxHealth:MAX_HP,phase:phase(b.health),phaseName:profile.phaseNames[phase(b.health)-1],phases:profileView(profile.id).phases,position:[b.x,b.y,b.z],distance:Math.hypot(b.x-app.player.x,b.z-app.player.z),paused:app.dimension!=='overworld'||Math.hypot(b.x-app.player.x,b.z-app.player.z)>48,telegraph:b.telegraph?{remaining:b.telegraph.remaining,duration:b.telegraph.duration,radius:b.telegraph.radius,position:[b.telegraph.x,b.telegraph.y,b.telegraph.z],pattern:b.telegraph.pattern,innerRadius:b.telegraph.innerRadius,angle:b.telegraph.angle,halfLength:b.telegraph.halfLength,halfWidth:b.telegraph.halfWidth,attackName:profile.attackName,hint:profile.hint}:null}:null,
   pending:p?{grants:[[CORE,p.cores],[COIN,p.coins]],canCollect:app.mode==='survival'&&[[CORE,p.cores],[COIN,p.coins]].every(([id,n])=>(app.inventory[id]||0)+n<=INV_MAX)}:null};
 }

 function cubes(app){
  const s=state(app),b=s?.data.active;
  if(!b||app.dimension!=='overworld'||Math.hypot(b.x-app.player.x,b.z-app.player.z)>72)return[];
  const M=V.RigidCubeMath,profile=bossProfile(b);
  let cache=renders.get(app);
  if(!cache||cache.attempt!==b.attempt||b.age<cache.lastAge){
   cache={pool:[],out:[],attempt:b.attempt,lastX:b.x,lastZ:b.z,lastAge:b.age,stride:0,step:0};
   renders.set(app,cache);
  }
  const dt=Math.max(0,Math.min(.2,b.age-cache.lastAge)),distance=Math.hypot(b.x-cache.lastX,b.z-cache.lastZ);
  if(dt>0){const moving=distance<2?Math.min(1,distance/dt/1.4):0;cache.stride+=(moving-cache.stride)*Math.min(1,dt*10);if(distance<2)cache.step+=distance*5.6;}
  cache.lastX=b.x;cache.lastZ=b.z;cache.lastAge=b.age;
  const out=cache.out;out.length=0;let count=0;
  const stage=phase(b.health),rootQ=M.fromEuler(b.yaw),identity=[0,0,0,1],walk=Math.sin(cache.step),stride=cache.stride;
  const bob=Math.abs(walk)*.026*stride;
  const charge=b.telegraph?1-b.telegraph.remaining/b.telegraph.duration:0;
  const cast=b.telegraph?Math.sin(Math.min(1,charge*1.5)*Math.PI/2):Math.min(1,s.pulseFlash*2);
  const flash=Math.min(1,s.hitFlash/.22)*.48;
  const palette={shadow:[.075,.13,.15],joint:[.14,.23,.24],teal:[.20,.39,.39],edge:[.30,.51,.48],ivory:[.79,.81,.70],ivoryLight:[.91,.91,.79],copper:[.67,.39,.20],copperLight:[.91,.65,.32],violet:[.37,.23,.57],amethyst:[.68,.47,.85]};
  const core=stage===3?[.94,.48,.71]:stage===2?[.60,.58,.96]:[.39,.91,.85];
  const point=(base,q,v)=>{const a=M.rotate(q,v);return[base[0]+a[0],base[1]+a[1],base[2]+a[2]];};
  const root=[b.x,b.y,b.z];
  const emit=(p,size,q,color,emissive=0,kind=null)=>{
   let part=cache.pool[count];
   if(!part){part={p:[0,0,0],s:[1,1,1],rotationQuaternion:[0,0,0,1],tint:[1,1,1],id:20,kind:-1,rigid:true,light:1,emissive:0,uvScale:0};cache.pool[count]=part;}
   for(let i=0;i<3;i++){part.p[i]=p[i];part.s[i]=size[i];part.tint[i]=color[i]*(1-flash)+[1,.25,.20][i]*flash;}
   for(let i=0;i<4;i++)part.rotationQuaternion[i]=q[i];
   part.kind=kind??(emissive>=.65?-3:-2);part.uvScale=1;
   part.emissive=emissive;out.push(part);count++;
  };
  const body=(x,y,z,w,h,d,color,roll=0,pitch=0,turn=0,emissive=0)=>{
   const q=roll||pitch||turn?M.multiply(rootQ,M.fromEuler(turn,pitch,roll)):rootQ;
   emit(point(root,rootQ,[x,y+bob,z]),[w,h,d],q,color,emissive);
  };
  const limb=(base,q,x,y,z,w,h,d,color,roll=0,emissive=0)=>emit(point(base,q,[x,y,z]),[w,h,d],roll?M.multiply(q,M.fromEuler(0,0,roll)):q,color,emissive);
  if(profile.id==='prism'){
  // Stepped ceramic plates and patinated metal make one deliberate silhouette.
  body(0,1.86,0,.83,.96,.55,palette.shadow);
  body(0,1.48,0,.66,.31,.58,palette.teal);
  body(0,2.20,0,1.00,.30,.65,palette.teal);
  body(0,2.34,-.025,.93,.105,.68,palette.ivoryLight);
  body(-.325,1.98,-.285,.25,.46,.16,palette.ivory);
  body(.325,1.98,-.285,.25,.46,.16,palette.ivory);
  body(-.29,1.61,-.265,.21,.23,.15,palette.edge);
  body(.29,1.61,-.265,.21,.23,.15,palette.edge);
  body(0,1.34,0,.76,.075,.62,palette.copperLight);
  body(0,1.20,0,.84,.20,.58,palette.joint);
  body(-.29,1.13,-.25,.24,.27,.15,palette.teal);
  body(.29,1.13,-.25,.24,.27,.15,palette.teal);
  body(0,1.15,-.31,.22,.24,.12,palette.ivory);
  // The prism outline follows a visible1/16-block pixel staircase.
  const pixel=1/16;
  body(0,2,-.375,.50,.50,.0625,palette.shadow);
  for(let row=-3;row<=3;row++)body(0,2+row*pixel,-.4375,(7-2*Math.abs(row))*pixel,pixel,.0625,palette.copperLight);
  for(let row=-2;row<=2;row++)body(0,2+row*pixel,-.484375,(5-2*Math.abs(row))*pixel,pixel,.03125,palette.violet);
  for(let row=-1;row<=1;row++)body(0,2+row*pixel,-.515625,(3-2*Math.abs(row))*pixel,pixel,.03125,core,0,0,0,.72+cast*.24);
  body(0,2.0625,.315,.625,.625,.10,palette.teal);
  body(0,2.0625,.3825,.25,.3125,.035,palette.shadow);
  body(0,2.0625,.408,.0625,.1875,.025,core,0,0,0,.50);
  body(0,2.0625,.410,.1875,.0625,.025,core,0,0,0,.50);
  // A carved voxel head with square eyes and a small cluster of crystal blocks.
  body(0,2.46,0,.25,.19,.24,palette.joint);
  body(0,2.75,0,.72,.58,.64,palette.ivory);
  body(0,2.9375,0,.78,.0625,.69,palette.edge);
  for(const side of[-1,1]){
   body(side*.15625,2.765625,-.3359375,.15625,.15625,.03125,palette.shadow);
   body(side*.15625,2.765625,-.3671875,.09375,.09375,.03125,core,0,0,0,.82);
  }
  body(0,2.65625,-.3515625,.09375,.125,.0625,palette.ivoryLight);
  body(0,2.5625,-.3359375,.1875,.03125,.03125,palette.joint);
  body(0,3.09375,0,.1875,.125,.1875,palette.copper);
  body(0,3.21875,0,.125,.25,.125,palette.violet);
  body(0,3.25,-.078125,.0625,.125,.03125,palette.amethyst,0,0,0,.22);
  // Upper and lower limbs rotate around real joints; idle feet do not march.
  for(const side of[-1,1]){
   const step=walk*side*stride;
   const hip=point(root,rootQ,[side*.255,1.13+bob,.015]);
   const thighQ=M.multiply(rootQ,M.fromEuler(0,step*.27,0));
   limb(hip,thighQ,0,-.235,0,.32,.47,.34,palette.joint);
   limb(hip,thighQ,0,-.22,-.195,.30,.36,.075,palette.ivory);
   const knee=point(hip,thighQ,[0,-.48,0]);
   const shinQ=M.multiply(thighQ,M.fromEuler(0,-Math.max(0,-step)*.33,0));
   limb(knee,shinQ,0,0,0,.26,.18,.28,palette.copper);
   limb(knee,shinQ,0,-.005,-.20,.31,.18,.10,palette.ivoryLight);
   limb(knee,shinQ,0,-.255,0,.33,.40,.34,palette.teal);
   limb(knee,shinQ,0,-.245,-.202,.25,.31,.07,palette.ivory);
   const ankle=point(knee,shinQ,[0,-.45,0]);
   // Keep the sole level as the shin flexes, so the long toe never dips into the floor.
   limb(ankle,rootQ,0,-.105,-.115,.48,.19,.66,palette.shadow);
   limb(ankle,rootQ,0,-.065,-.30,.43,.09,.26,palette.ivory);
   limb(ankle,rootQ,0,-.105,-.426,.45,.045,.045,palette.copperLight);
   const shoulder=point(root,rootQ,[side*.75,2.25+bob,0]);
   const upperQ=M.multiply(rootQ,M.fromEuler(0,-step*.22+cast*.82,side*(cast*.16)));
   limb(shoulder,upperQ,side*.055,.035,0,.43,.25,.62,palette.teal);
   limb(shoulder,upperQ,side*.055,.16,0,.47,.075,.66,palette.copperLight);
   limb(shoulder,upperQ,side*.075,.09,-.07,.41,.17,.54,palette.ivory);
   limb(shoulder,upperQ,side*.025,-.33,0,.255,.42,.31,palette.joint);
   limb(shoulder,upperQ,side*.025,-.32,-.185,.24,.32,.07,palette.ivory);
   const elbow=point(shoulder,upperQ,[side*.025,-.60,0]);
   const foreQ=M.multiply(upperQ,M.fromEuler(0,.10+cast*.48,0));
   limb(elbow,foreQ,0,0,0,.25,.19,.27,palette.copper);
   limb(elbow,foreQ,0,-.245,0,.37,.39,.40,palette.teal);
   limb(elbow,foreQ,0,-.065,0,.40,.055,.43,palette.copperLight);
   limb(elbow,foreQ,0,-.24,-.235,.27,.28,.065,palette.ivory);
   limb(elbow,foreQ,0,-.49,-.005,.30,.21,.35,palette.shadow);
   limb(elbow,foreQ,0,-.46,-.205,.27,.07,.06,palette.copper);
  }
  // Small orbit shards keep the palette focused; phase identity lives in the core.
  for(let i=0;i<stage+2;i++){
   const a=b.age*.60+i*Math.PI*2/(stage+2),radius=1.38+stage*.035;
   const center=[b.x+Math.cos(a)*radius,b.y+2.14+Math.sin(b.age*1.25+i)*.13,b.z+Math.sin(a)*radius];
   const q=M.fromEuler(-a,.20,Math.PI/4+Math.sin(b.age+i)*.13);
   emit(center,[.12,.255,.12],q,palette.violet,.12);
   emit(point(center,q,[0,.012,-.071]),[.055,.14,.025],q,core,.85);
  }

  }else if(profile.id==='stone'){
   const rock=[.28,.31,.29],plate=[.48,.49,.41],edge=[.69,.66,.48],dark=[.13,.18,.17],rune=[.94,.63,.24];
   body(0,1.52,0,1.05,1.05,.73,rock);body(0,1.96,0,1.18,.31,.83,plate);body(0,1.20,0,.88,.30,.69,dark);
   for(const side of[-1,1]){
    body(side*.34,1.70,-.41,.31,.57,.14,plate,side*.045);body(side*.37,1.30,-.39,.28,.22,.12,edge);
    body(side*.32,.82,.015,.40,.53,.45,rock);body(side*.32,.52,-.07,.46,.29,.48,plate);
    body(side*.35,.15,-.15,.58,.28,.78,dark);body(side*.35,.23,-.39,.55,.12,.28,edge);
    const shoulder=point(root,rootQ,[side*.77,2.04+bob,0]);
    const arm=M.multiply(rootQ,M.fromEuler(0,cast*.62,side*(.08+cast*.16)));
    limb(shoulder,arm,side*.02,.02,0,.52,.36,.78,plate);limb(shoulder,arm,side*.02,.24,.02,.43,.10,.65,edge);
    limb(shoulder,arm,0,-.31,0,.35,.39,.40,dark);limb(shoulder,arm,0,-.58,-.03,.50,.46,.55,rock);
    limb(shoulder,arm,0,-.84,-.13,.55,.32,.63,plate);limb(shoulder,arm,0,-.87,-.48,.46,.16,.09,edge);
    for(let j=0;j<3;j++)limb(shoulder,arm,(j-1)*.14,-.83,-.493,.10,.20,.04,dark);
    body(side*.49,2.13,.04,.18,.26,.34,dark);body(side*.57,2.30,.03,.15,.20,.28,plate,side*.28);
    body(side*.38,2.83,.025,.17,.32,.23,plate,side*.25);body(side*.43,3.04,.025,.12,.19,.18,edge,side*.37);
   }
   body(0,2.22,0,.36,.20,.37,dark);body(0,2.54,-.02,.69,.49,.59,rock);body(0,2.78,-.01,.74,.12,.63,plate);
   body(0,2.39,-.34,.49,.16,.10,plate);body(0,2.48,-.403,.24,.05,.025,dark);
   for(const side of[-1,1]){body(side*.18,2.60,-.337,.19,.12,.05,dark);body(side*.18,2.60,-.374,.115,.055,.025,rune,0,0,0,.85);}
   body(0,1.68,-.425,.38,.50,.055,dark);
   const px=1/24;for(let row=-4;row<=4;row++){const w=1+2*Math.min(2,4-Math.abs(row));body(0,1.68+row*px,-.47,w*px,px,.035,rune,0,0,0,.5+cast*.4);}
   for(let j=0;j<3;j++)body((j-1)*.22,1.13,-.39,.10,.07,.05,edge);
   body(0,1.72,.42,.73,.59,.12,plate);body(0,1.72,.495,.28,.34,.04,dark);
  }else{
   const teal=[.13,.40,.49],ice=[.66,.87,.85],shadow=[.08,.19,.27],silver=[.78,.84,.78],violet=[.37,.32,.63],glow=[.37,.96,.91];
   const floatY=.10+Math.sin(b.age*1.6)*.06;
   body(0,1.76+floatY,0,.51,.92,.44,shadow);body(0,2.13+floatY,0,.64,.28,.51,teal);
   body(0,1.48+floatY,-.025,.42,.35,.40,teal);body(0,1.23+floatY,.025,.30,.24,.32,silver);
   body(0,.99+floatY,.09,.20,.28,.23,violet);body(0,.72+floatY,.12,.12,.27,.15,ice,0,0,0,.3);
   body(0,2.35+floatY,0,.25,.20,.24,shadow);body(0,2.64+floatY,-.015,.57,.48,.49,silver);
   body(0,2.80+floatY,-.015,.64,.10,.54,teal);body(0,2.47+floatY,-.31,.22,.14,.18,ice);
   for(const side of[-1,1]){
    body(side*.14,2.66+floatY,-.282,.15,.10,.035,shadow);body(side*.14,2.66+floatY,-.307,.095,.045,.02,glow,0,0,0,.9);
    body(side*.20,2.97+floatY,.015,.10,.28,.13,violet,side*.18);body(side*.24,3.13+floatY,.02,.07,.13,.10,ice,side*.25);
    const shoulder=point(root,rootQ,[side*.40,2.08+bob+floatY,.035]);
    const wing=M.multiply(rootQ,M.fromEuler(-side*(.16+cast*.13),-.12+cast*.30,side*(.20+Math.sin(b.age*1.3)*.035-cast*.30)));
    limb(shoulder,wing,side*.20,0,.015,.43,.20,.34,teal);
    for(let j=0;j<4;j++){
     const xx=side*(.36+j*.12),yy=.06-j*.14,zz=.04+j*.07;
     limb(shoulder,wing,xx,yy,zz,.19,.42-j*.025,.37-j*.025,j%2?ice:silver,side*(.08+j*.04));
     limb(shoulder,wing,xx,yy-.21,zz+.02,.09,.13,.23,violet,side*(.08+j*.04));
    }
    body(side*.23,1.58+floatY,-.265,.14,.37,.08,silver,side*.08);
    body(side*.19,1.19+floatY,.25,.10,.36,.12,ice,side*.24,.35);
   }
   body(0,1.88+floatY,-.25,.30,.43,.05,shadow);
   const px=1/24;for(let row=-3;row<=3;row++)body(0,1.89+floatY+row*px,-.286,(7-2*Math.abs(row))*px,px,.025,glow,0,0,0,.66+cast*.30);
   for(let j=0;j<3;j++)body(0,1.45+floatY-j*.15,.34+j*.16,.18-j*.035,.16,.24, j===2?ice:teal,0,.30+j*.08);
  }

  const ring=(t,burst)=>{
   const segments=48,ratio=burst?1:1-t.remaining/t.duration;
   const color=burst?[1,.63,.22]:ratio>.76?[.98,.43,.28]:[.72,.31,.88];
   for(let i=0;i<segments;i++){
    const a=i*Math.PI*2/segments,r=t.radius;
    emit([t.x+Math.cos(a)*r,t.y+.048,t.z+Math.sin(a)*r],[.105,burst?.12:.065,Math.PI*2*r/segments*.91],M.fromEuler(a),color,burst?1:.56+ratio*.30,-1);
   }
   if(!burst){
    emit([t.x,t.y+.05,t.z],[.42,.045,.065],identity,core,.74,-1);
    emit([t.x,t.y+.05,t.z],[.065,.045,.42],identity,core,.74,-1);
   }
  };

  const renderAttack=(t,burst)=>{
   if(t.pattern==='disc'){ring(t,burst);return;}
   const ratio=burst?1:1-t.remaining/t.duration,color=burst?[1,.70,.29]:ratio>.76?[1,.48,.25]:profile.id==='stone'?[.93,.67,.25]:[.30,.88,.91];
   if(t.pattern==='annulus'){
    for(const [r,n,inner]of[[t.radius,48,false],[t.innerRadius,32,true]])for(let i=0;i<n;i++){
     const a=i*Math.PI*2/n;emit([t.x+Math.cos(a)*r,t.y+.05,t.z+Math.sin(a)*r],[.10,burst?.12:.06,Math.PI*2*r/n*.91],M.fromEuler(a),inner&&!burst?[.40,.87,.65]:color,burst?1:.70,-1);
    }
    if(!burst){emit([t.x,t.y+.055,t.z],[.36,.045,.065],identity,[.40,.87,.65],.72,-1);emit([t.x,t.y+.055,t.z],[.065,.045,.36],identity,[.40,.87,.65],.72,-1);}
   }else{
    const q=M.fromEuler(t.angle),ux=Math.sin(t.angle),uz=-Math.cos(t.angle),rx=Math.cos(t.angle),rz=Math.sin(t.angle);
    for(const side of[-1,1])emit([t.x+rx*t.halfWidth*side,t.y+.05,t.z+rz*t.halfWidth*side],[.09,burst?.14:.065,t.halfLength*2],q,color,burst?1:.75,-1);
    for(const side of[-1,1])emit([t.x+ux*t.halfLength*side,t.y+.05,t.z+uz*t.halfLength*side],[t.halfWidth*2,.065,.09],q,color,.75,-1);
    if(!burst)for(let i=0;i<7;i++){
     const d=(i/6-.5)*t.halfLength*1.75;
     emit([t.x+ux*d,t.y+.055,t.z+uz*d],[.08,.045,.23],q,color,.72,-1);
    }
   }
  };
  if(b.telegraph)renderAttack(b.telegraph,false);else if(s.pulseFlash>0&&s.lastPulse)renderAttack(s.lastPulse,true);

  return out;
 }
 V.guardian=Object.freeze({MAX_HP,SIGIL,CORE,PROFILES,validateSaved,init,snapshot,chooseProfile,summon,collect,abandon,onDeath,targetDistance,attack,tick,view,cubes});
})();
