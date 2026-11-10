/* MảiMêRáp — transient horse riding. Player physics owns movement; this module owns binding and safe transitions. */
(()=>{
 'use strict';
 const V=globalThis.Voxel||={},sessions=new WeakMap();
 // Full collision width, not radius. Conservative body bounds are checked with real horse/armored rider poses.
 const PROFILE=Object.freeze({height:2.8,width:2.8,walkSpeed:6.5,sprintSpeed:9.5,jumpSpeed:8.5,eyeHeight:2.40});
 const controlsText=Object.freeze({mount:'Nhìn ngựa và nhấn chuột phải',move:'WASD / cần điều khiển',jump:'Space / Nhảy',dismount:'G / Xuống ngựa',bypass:'Shift + chuột phải bỏ qua cưỡi'});
 const finite=Number.isFinite,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const answer=(ok,code,message,extra={})=>({ok,code,message,...extra});
 function live(app){return !!(app&&app.started&&app.playing&&!app.inHome&&!app.starting&&!app.contextLost&&app.player&&app.player.health>0&&app.world&&Array.isArray(app.mobs));}
 function resolve(app){
  const b=app&&sessions.get(app);if(!b||b.id!==app.id||b.world!==app.world||b.epoch!==app.world?.epoch||b.dimension!==app.dimension||!app.player||app.player.health<=0)return null;
  const mob=app.mobs?.find(m=>m.serial===b.serial&&m.type==='horse'&&!m.dead&&m.health>0);return mob?{b,mob}:null;
 }
 function reset(app,reason='reset'){const changed=!!(app&&sessions.has(app));if(app)sessions.delete(app);return answer(true,'reset','',{changed,reason});}
 function active(app){return !!resolve(app);}
 function controls(app,mob){const r=resolve(app);return !!r&&r.mob===mob;}
 function profile(app){return active(app)?PROFILE:null;}
 function valid(world,x,y,z,width=.6){
  if(![x,y,z,width].every(finite)||width<=0||y< -10||y>512)return false;
  const r=width/2;return V.coordinates.validHorizontal(x-r,z-r,world.coordinateProfile)&&V.coordinates.validHorizontal(x+r,z+r,world.coordinateProfile);
 }
 function loaded(world,x,z,width=.6){
  const r=width/2-1e-5;for(const [dx,dz]of[[-r,-r],[r,-r],[-r,r],[r,r]]){
   if(world.chunks){if(!world.chunks.get(Math.floor((x+dx)/16)+','+Math.floor((z+dz)/16))?.data)return false;}
   else if(world.get(x+dx,95,z+dz,true)===13)return false;
  }return true;
 }
 function empty(world,x,y,z,height=1.8,width=.6){return valid(world,x,y,z,width)&&loaded(world,x,z,width)&&!world.collides(x,y,z,height,width);}
 function drySupport(world,x,y,z,width=.6){
  if(!loaded(world,x,z,width)||!V.respawnSupport.supported(world,x,y,z,width,.045))return false;const r=width/2-.015;
  for(const[dx,dz]of[[0,0],[-r,-r],[r,-r],[-r,r],[r,r]]){
   const id=world.get(x+dx,y-.045,z+dz,true),b=V.blocks[id],above=world.get(x+dx,y+.04,z+dz,true);
   if(!b?.solid||b.leaf||b.lava||[71,72,77,78].includes(id)||above===7||V.blocks[above]?.lava||[71,72,77,78].includes(above))return false;
  }return true;
 }
 function standing(world,x,y,z){return empty(world,x,y,z)&&drySupport(world,x,y,z);}
 function safePath(world,from,to){
  const dx=to[0]-from[0],dy=to[1]-from[1],dz=to[2]-from[2],n=Math.max(1,Math.ceil(Math.hypot(dx,dy,dz)/.18));
  for(let i=1;i<=n;i++){const t=i/n;if(!empty(world,from[0]+dx*t,from[1]+dy*t,from[2]+dz*t))return false;}return true;
 }
 function exitHeights(world,x,z,referenceY,playerY){
  // Preserve ordinary exits and their order, then try real fractional box tops.
  const candidates=new Set([0,1,-1].map(delta=>Math.round(referenceY)+delta)),extra=new Set(),r=.3,e=1e-5;
  for(let by=Math.floor(playerY-1.05)-1;by<=Math.floor(playerY+1.05);by++)
   for(let bz=Math.floor(z-r+e);bz<=Math.floor(z+r-e);bz++)for(let bx=Math.floor(x-r+e);bx<=Math.floor(x+r-e);bx++){
    const id=world.get(bx,by,bz,true);
    for(const box of V.blockGeometry.boxesFor(id)){
     const top=by+box[4];
     if(Math.abs(top-playerY)<=1.05&&x-r<bx+box[3]-e&&x+r>bx+box[0]+e&&z-r<bz+box[5]-e&&z+r>bz+box[2]+e)extra.add(top);
    }
   }
  for(const top of [...extra].sort((a,b)=>Math.abs(a-referenceY)-Math.abs(b-referenceY)||b-a))candidates.add(top);
  return candidates;
 }
 function exitPoint(app,mob){
  const world=app.world,p=app.player,r0=PROFILE.width/2+.42;
  for(const radius of[r0,r0+.5,r0+1])for(const angle of[Math.PI/2,-Math.PI/2,0,Math.PI,Math.PI/4,-Math.PI/4,3*Math.PI/4,-3*Math.PI/4]){
   const yaw=mob.yaw+angle,x=mob.x+Math.sin(yaw)*radius,z=mob.z-Math.cos(yaw)*radius;
   if(Math.abs(x-mob.x)<PROFILE.width/2+.31&&Math.abs(z-mob.z)<PROFILE.width/2+.31)continue;
   for(const y of exitHeights(world,x,z,mob.y,p.y)){if(Math.abs(y-p.y)>1.05||!standing(world,x,y,z))continue;
    if((app.mobs||[]).some(m=>m!==mob&&!m.dead&&m.health>0&&Math.hypot(m.x-x,m.z-z)<.75&&Math.abs(m.y-y)<1.8))continue;
    if(safePath(world,[p.x,p.y,p.z],[x,y,z]))return [x,y,z];
   }
  }return null;
 }
 function tryMount(app,origin,direction,maxDistance=4.5){
  if(!live(app)||app.panel)return answer(false,'inactive','Trở lại thế giới để cưỡi ngựa.',{handled:false});
  if(active(app))return answer(false,'already','Nhấn G hoặc Xuống ngựa để xuống.',{handled:false});
  if(app.keys?.has('ShiftLeft')||app.keys?.has('ShiftRight'))return answer(false,'bypass','',{handled:false});
  const mob=V.entities.mountTarget(app,origin,direction,maxDistance);if(!mob)return answer(false,'target','',{handled:false});
  if(!empty(app.world,mob.x,mob.y,mob.z,PROFILE.height,PROFILE.width)||!drySupport(app.world,mob.x,mob.y,mob.z,PROFILE.width))return answer(false,'space','Ngựa cần nền khô, đủ rộng và khoảng trống phía trên để lên yên.',{handled:true});
  const p=app.player;sessions.set(app,{id:app.id,world:app.world,epoch:app.world.epoch,dimension:app.dimension,serial:mob.serial});
  p.x=mob.x;p.y=mob.y;p.z=mob.z;p.yaw=mob.yaw;p.fly=false;p.crouch=false;p.vx=p.vy=p.vz=0;p.grounded=true;p.fallStart=p.y;
  mob.vy=0;mob.grounded=true;mob.moving=0;mob.panic=0;mob.knockX=mob.knockZ=0;mob.desiredYaw=mob.yaw;
  app.api?.clearInput?.();app.api?.resetPresentation?.();
  return answer(true,'mounted','Đã lên ngựa · WASD để đi, Space để nhảy, G hoặc Xuống ngựa để xuống.',{handled:true,horseSerial:mob.serial});
 }
 function dismount(app){
  const r=resolve(app);if(!r)return answer(false,'unmounted','Bạn đang đi bộ.');
  if(!live(app)||app.panel)return answer(false,'inactive','Đóng bảng để xuống ngựa.');
  if(!app.player.grounded)return answer(false,'airborne','Chờ ngựa chạm đất rồi xuống.');
  const point=exitPoint(app,r.mob);if(!point)return answer(false,'blocked','Chưa có chỗ xuống an toàn. Đưa ngựa tới nền khô, trống và thử lại.');
  const p=app.player;reset(app,'dismount');[p.x,p.y,p.z]=point;p.vx=p.vy=p.vz=0;p.fly=false;p.crouch=false;p.grounded=true;p.fallStart=p.y;
  r.mob.moving=0;r.mob.panic=0;r.mob.rest=.8;r.mob.homeX=r.mob.x;r.mob.homeZ=r.mob.z;r.mob.knockX=r.mob.knockZ=0;
  app.api?.clearInput?.();app.api?.resetPresentation?.();return answer(true,'dismounted','Đã xuống ngựa.',{position:point.slice(),horseSerial:r.mob.serial});
 }
 function sync(app,dt=0){
  const r=resolve(app);if(!r){if(app&&sessions.has(app))reset(app,'invalid-binding');return false;}
  if(!live(app)||app.panel||!finite(dt)||dt<0)return false;
  const p=app.player,m=r.mob,distance=Math.hypot(p.x-m.x,p.y-m.y,p.z-m.z);
  if(!valid(app.world,p.x,p.y,p.z,PROFILE.width)||distance>4){reset(app,'teleport-or-bounds');return false;}
  if(!empty(app.world,p.x,p.y,p.z,PROFILE.height,PROFILE.width)){
   if(empty(app.world,m.x,m.y,m.z,PROFILE.height,PROFILE.width)){p.x=m.x;p.y=m.y;p.z=m.z;p.vx=p.vy=p.vz=0;}
   else{reset(app,'blocked-volume');return false;}
  }
  const travelled=Math.hypot(p.x-m.x,p.z-m.z),seconds=Math.min(.1,Math.max(.001,dt));
  m.x=p.x;m.y=p.y;m.z=p.z;m.yaw=Math.atan2(Math.sin(p.yaw),Math.cos(p.yaw));m.desiredYaw=m.yaw;m.vy=p.vy;m.grounded=!!p.grounded;m.floorY=Math.floor(p.y+.03);
  m.moving+=(clamp(travelled/seconds/PROFILE.walkSpeed,0,1)-m.moving)*Math.min(1,seconds*12);if(m.grounded)m.walk+=travelled*7;
  m.panic=app.sprinting&&travelled>.001?1:0;m.rest=0;m.knockX=m.knockZ=0;m.blocked=0;m.homeX=m.x;m.homeZ=m.z;
  p.fly=false;p.crouch=false;return true;
 }
 function savePose(app){
  const r=resolve(app);if(!r)return null;const p=app.player;
  const point=exitPoint(app,r.mob);if(point)return{x:point[0],y:point[1],z:point[2],fly:false};
  // The ordinary on-foot collider is a subset of the mounted volume. Preserve local swimming/falling saves.
  if(empty(app.world,p.x,p.y,p.z))return{x:p.x,y:p.y,z:p.z,fly:false};
  const error=new Error('Chưa có vị trí đi bộ trống gần ngựa để lưu. Hãy tới chỗ thoáng hoặc xuống ngựa rồi lưu lại.');error.code='MOUNT_SAVE_POSITION';throw error;
 }
 function view(app){const r=resolve(app);return{mounted:!!r,horseSerial:r?.mob.serial??null,position:r?[r.mob.x,r.mob.y,r.mob.z]:null,speed:r?Math.hypot(app.player.vx||0,app.player.vz||0):0,controls:{...controlsText},resumeOnFoot:true,message:r?'Đang cưỡi ngựa · G / Xuống ngựa':'Nhìn ngựa và nhấn chuột phải để cưỡi.'};}
 V.mounts=Object.freeze({VERSION:1,PROFILE,active,controls,profile,tryMount,dismount,sync,reset,savePose,view});
})();
