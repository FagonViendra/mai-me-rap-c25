/* MảiMêRáp — three bounded realms, one inventory and an atomic travel boundary. */
(() => {
 'use strict';
 const V=globalThis.Voxel,base=V.saveCodec;
 const REALMS=Object.freeze({overworld:'Thế giới chính',inferno:'Vực Lửa',sky:'Thiên Giới'});
 const MAX_EDITS=100000,MAX_CHUNKS=4096;
 const LOCAL_KEYS=['vegetationVersion','spawn','pose','edits','mobs','villageMask','trees','crops','furnaces'];
 const POSE_KEYS=['x','y','z','yaw','pitch','fly'];
 const localFields=['vegetationVersion','spawn','edits','mobs','villageMask','trees','crops','furnaces'];
 const own=(o,k)=>Object.hasOwn(o,k),plain=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
 const clone=o=>JSON.parse(JSON.stringify(o));
 const realmName=d=>REALMS[d]||REALMS.overworld;
 function count(state){let edits=0;for(const row of state.edits)edits+=row[2].length;return{edits,chunks:state.edits.length};}
 function capture(s){
  const o={pose:{}};
  for(const k of localFields)o[k]=clone(s[k]??(k==='villageMask'?0:[]));
  for(const k of POSE_KEYS)o.pose[k]=s.player[k];
  return o;
 }
 function decode(text){
  // The original decoder checks the original envelope checksum before this
  // extension examines realm metadata. Its accepted schema list includes 4.
  const s=base.decode(text);
  if(s.version<4){
   if(own(s,'dimension')||own(s,'realmStates'))throw Error('Bản lưu cũ chứa trường dimension không hợp lệ.');
   s.dimension='overworld';s.realmStates={};return s;
  }
  if(!own(REALMS,s.dimension)||!plain(s.realmStates))throw Error('Dimension của bản lưu không hợp lệ.');
  if(s.dimension==='sky'&&s.mobs.some(m=>m.eggSpawned!==true))throw Error('Sinh vật ở Thiên Giới phải được gọi bằng trứng.');
  const keys=Object.keys(s.realmStates);
  if(keys.length>2||keys.some(k=>!own(REALMS,k)||k===s.dimension))throw Error('Danh sách dimension bị lặp hoặc không được hỗ trợ.');
  const validated={};let total=count(s);
  for(const dimension of keys){
   const state=s.realmStates[dimension];
   if(dimension==='sky'&&Array.isArray(state?.mobs)&&state.mobs.some(m=>m?.eggSpawned!==true))throw Error('Sinh vật ở Thiên Giới phải được gọi bằng trứng.');
   if(!plain(state)||Object.keys(state).length!==LOCAL_KEYS.length||Object.keys(state).some(k=>!LOCAL_KEYS.includes(k)))throw Error('Trạng thái dimension chứa trường không hợp lệ.');
   if(!plain(state.pose)||Object.keys(state.pose).length!==POSE_KEYS.length||Object.keys(state.pose).some(k=>!POSE_KEYS.includes(k)))throw Error('Vị trí dimension không hợp lệ.');
   // Use the same real item/edit/crop/furnace validator for the inactive realm.
   // This surrogate contains no nested realm records and no second inventory.
   const witness={...s,version:s.version===5?5:3,dimension:undefined,realmStates:undefined,player:{...s.player,...state.pose}};
   for(const k of localFields)witness[k]=state[k];
   const checked=base.decode(base.encode(witness));
   validated[dimension]=capture(checked);
   const n=count(checked);total.edits+=n.edits;total.chunks+=n.chunks;
  }
  if(s.dimension!=='overworld'&&!own(validated,'overworld'))throw Error('Thiếu trạng thái thế giới chính để trở về.');
  if(total.edits>MAX_EDITS||total.chunks>MAX_CHUNKS)throw Error('Ba dimension vượt giới hạn chung 100.000 ô sửa / 4.096 vùng.');
  s.realmStates=validated;return s;
 }
 function upgradeToWide(saved,newId){
  const input=clone(saved);
  if(input.version<4&&input.dimension==='overworld'&&plain(input.realmStates)&&Object.keys(input.realmStates).length===0){delete input.dimension;delete input.realmStates;}
  const source=decode(base.encode(input));
  if(source.version>=5)throw new TypeError('World is already wide');
  if(typeof newId!=='string'||!/^mk-[a-z0-9-]{1,70}$/.test(newId)||newId===source.id)throw new TypeError('Upgrade requires a distinct valid world ID');
  const next={...source,id:newId,version:5,coordinateProfile:V.coordinates.WIDE,generationProfile:V.coordinates.GENERATION,trees:source.trees||[],crops:source.crops||[],furnaces:source.furnaces||[]};
  return decode(base.encode(next));
 }
 V.saveCodec=Object.freeze({...base,decode,upgradeToWide});
 function applyBudget(app){
  let edits=0,chunks=0;
  for(const state of Object.values(app.realmStates||{})){const n=count(state);edits+=n.edits;chunks+=n.chunks;}
  app.world.editLimit=Math.max(0,MAX_EDITS-edits);
  app.world.chunkEditLimit=Math.max(0,MAX_CHUNKS-chunks);
 }
 function prepare(app,saved){
  app.coordinateProfile=saved?V.coordinates.fromSave(saved).id:V.coordinates.WIDE;
  app.dimension=saved?.dimension||'overworld';
  app.realmStates=saved?.realmStates?clone(saved.realmStates):{};
  app.lavaAge=0;app.lavaContact=false;
 }
 function touchesLava(world,p,height=1.8){
  const edge=1e-5;
  for(let y=Math.floor(p.y+edge);y<=Math.floor(p.y+height-edge);y++)
   for(let z=Math.floor(p.z-.3+edge);z<=Math.floor(p.z+.3-edge);z++)
    for(let x=Math.floor(p.x-.3+edge);x<=Math.floor(p.x+.3-edge);x++)
     if(V.blocks[world.get(x,y,z)]?.lava)return true;
  return false;
 }
 function admit(saved){
  if(saved)V.coordinates.fromSave(saved);
  if(!saved||saved.dimension==='overworld')return{saved,recovery:null};
  if(!own(REALMS,saved.dimension))throw Error('Dimension không được hỗ trợ.');
  // A bounded CPU-only view validates the destination before the live world,
  // its GPU resources or services are reset. No worker or render target exists.
  const view=Object.create(V.World.prototype),edits=new Map(saved.edits.map(r=>[r[0]+','+r[1],new Map(r[2])]));
  view.coordinateProfile=V.coordinates.fromSave(saved).id;view.seed=V.core.hashSeed(saved.seed);view.dimension=saved.dimension;view.vegetationVersion=saved.vegetationVersion;view.chunks=new Map();
  view.ensure=(cx,cz)=>{
   const key=cx+','+cz;let chunk=view.chunks.get(key);if(chunk)return chunk;
   if(view.chunks.size>=18)throw Error('Vượt giới hạn kiểm tra điểm đến.');
   const data=Uint16Array.from(V.generateChunk(view.seed,cx,cz,view.vegetationVersion,saved.dimension,view.coordinateProfile));
   for(const[index,id]of edits.get(key)||[])data[index]=id;
   chunk={cx,cz,key,data};view.chunks.set(key,chunk);return chunk;
  };
  const p=saved.player;
  for(let z=Math.floor((p.z-.3)/16);z<=Math.floor((p.z+.3)/16);z++)
   for(let x=Math.floor((p.x-.3)/16);x<=Math.floor((p.x+.3)/16);x++)view.ensure(x,z);
  const supported=saved.dimension!=='sky'||(saved.mode==='creative'&&p.fly)||V.respawnSupport.supported(view,p.x,p.y,p.z);
  if(p.y>1&&p.y<94&&supported&&!view.collides(p.x,p.y,p.z)&&!touchesLava(view,p))return{saved,recovery:null};
  const finder=saved.dimension==='sky'?V.findSkySafeRespawn:V.findInfernoSafeRespawn;
  const safe=finder(view,[p.x,p.y,p.z]);
  if(safe){const next={...saved,player:{...p,x:safe.position[0],y:safe.position[1],z:safe.position[2]}};return{saved:next,recovery:safe};}
  const home=saved.realmStates.overworld;
  if(!home)throw Error('Không còn điểm đến an toàn hoặc trạng thái thế giới chính.');
  const inactive=clone(saved.realmStates);delete inactive.overworld;inactive[saved.dimension]=capture(saved);
  const next={...saved,dimension:'overworld',realmStates:inactive,player:{...p,...home.pose}};
  for(const k of localFields)next[k]=clone(home[k]);
  const checked=V.saveCodec.decode(V.saveCodec.encode(next));
  return{saved:checked,recovery:{reason:saved.dimension+'-no-safe-floor-return',position:[checked.player.x,checked.player.y,checked.player.z],checkedChunks:view.chunks.size}};
 }
 function initialInferno(){
  return{vegetationVersion:3,spawn:[8.5,35.01,8.5],pose:{x:8.5,y:35.01,z:8.5,yaw:0,pitch:-.06,fly:false},edits:[],mobs:[],villageMask:0,trees:[],crops:[],furnaces:[]};
 }
 function initialSky(){
  return{vegetationVersion:3,spawn:[8.5,57.01,8.5],pose:{x:8.5,y:57.01,z:8.5,yaw:0,pitch:-.06,fly:false},edits:[],mobs:[],villageMask:0,trees:[],crops:[],furnaces:[]};
 }
 function portalInSight(app,target){
  if(!app.player||!app.world||!app.api)return false;
  const hit=app.world.ray(app.api.eye(),app.api.direction(),5),ids=target==='sky'?[77,78]:[71,72];
  return !!hit&&ids.includes(hit.id);
 }
 function allowed(app,target=app.dimension==='overworld'?'inferno':'overworld'){
  if(app.world?.importedWorld)return false;if(!own(REALMS,target)||target===app.dimension||!app.playing||app.inHome||app.starting||app.contextLost||app.dimensionTransit||!app.player||app.player.health<=0)return false;
  if((app.portalReadyAt||0)>performance.now())return false;
  if(app.mode==='creative')return true;
  if(app.dimension!=='overworld')return target==='overworld';
  return portalInSight(app,target);
 }
 function refresh(app){
  if(typeof document==='undefined')return;
  const button=document.getElementById('dimensionBtn'),sky=document.getElementById('skyDimensionBtn'),hint=document.getElementById('dimensionHint');
  const target=app.dimension==='overworld'?'inferno':'overworld';
  if(button){button.textContent=target==='overworld'?'Trở về thế giới chính':'Đến Vực Lửa';button.disabled=!allowed(app,target);}
  if(sky){sky.textContent='Đến Thiên Giới';sky.disabled=!allowed(app,'sky');sky.classList.toggle('hidden',app.dimension==='sky'||(app.dimension!=='overworld'&&app.mode!=='creative'));}
  if(hint)hint.textContent=app.world?.importedWorld?'Vùng Minecraft nhập được giữ trong ô lưu riêng. Chuyển chiều chưa hỗ trợ ở bản nhập này.':app.dimension!=='overworld'?'Túi đồ đi cùng bạn; cả ba dimension được giữ riêng trong cùng ô lưu.':app.mode==='creative'?'Vực Lửa dưới lòng đá; Thiên Giới trên những đảo nổi.':'Đặt rồi nhìn đúng Neo chuyển giới hoặc Neo thiên giới. Có thể trở về thế giới chính từ menu.';
 }
 function travel(app,target,respawn=false){
  if(app.world?.importedWorld){app.api.toast('Vùng nhập đang dùng ô lưu riêng; chưa chuyển chiều trong bản này.');return false;}
  const rescue=respawn&&app.dimension!=='overworld'&&target==='overworld'&&app.panel==='death'&&app.player?.health<=0&&!app.starting&&!app.contextLost;
  if(!own(REALMS,target)||target===app.dimension||(!allowed(app,target)&&!rescue))return false;
  const current=app.api.snapshot(),source=current.dimension;
  const epoch=app.world.epoch;let restored=false;
  try{
   const destination=current.realmStates[target]||(target==='inferno'?initialInferno():target==='sky'?initialSky():null);
   if(!destination)throw Error('Không tìm thấy trạng thái dimension đích.');
   const inactive=clone(current.realmStates);delete inactive[target];inactive[source]=capture(current);
   const next={...current,version:current.version===5?5:4,dimension:target,realmStates:inactive,player:{...current.player,...destination.pose,health:rescue?20:current.player.health,hunger:rescue?16:current.player.hunger,fly:current.mode==='creative'?!!destination.pose.fly:false}};
   for(const k of localFields)next[k]=clone(destination[k]);
   const checked=V.saveCodec.decode(V.saveCodec.encode(next));
   // Save the complete current realm before any generation/reset occurs.
   if(!app.api.save(false)){app.api.toast('Không thể lưu. Hãy xuất bản sao trước khi chuyển dimension.');app.api.openPanel('backup');return false;}
   app.dimensionTransit=true;
   if(!app.api.start(current.seed,current.mode,checked,true))throw Error('Không thể mở dimension đích.');
   if(app.dimension!==target)throw Error('Điểm đến đã bị lấp kín; không thay đổi địa hình để ép chỗ xuất hiện.');
   if(current.mode==='survival'){const observed=V.journey.observe(app,'realm',{from:source,to:target});if(!observed.ok)throw Error('Không thể ghi nhận chuyến đi vào Sổ Gió: '+observed.message);}
   if(!app.api.save(false))throw Error('Không thể lưu trạng thái sau khi chuyển dimension.');
   app.portalReadyAt=performance.now()+1500;
   app.api.toast('Đã đến '+realmName(target)+'. Túi đồ được giữ nguyên.');
   app.api.record('dimension','Travel completed',{from:source,to:target,id:app.id});
   return true;
  }catch(error){
   // start(..., true) suppresses the ordinary save of an intermediate state.
   // The pre-travel durable record remains the recovery point on any failure.
   try{restored=app.world.epoch===epoch||!!app.api.start(current.seed,current.mode,current,true);}catch{}
   app.api.record('dimension-error','Dimension transition failed',{message:String(error?.message||error),restored});
   app.api.toast(restored?'Chưa chuyển dimension; đã trở lại trạng thái trước đó.':'Không mở được dimension. Bản lưu trước khi đi vẫn được giữ.');
   return false;
  }finally{app.dimensionTransit=false;refresh(app);}
 }
 function interact(app,hit){
  if(!hit||![71,72,77,78].includes(hit.id))return false;
  return travel(app,app.dimension!=='overworld'?'overworld':hit.id>=77?'sky':'inferno');
 }
 function tick(app,dt){
  if(!app.player||!app.world||!Number.isFinite(dt)||dt<=0)return;
  const p=app.player;
  if(app.world.importedWorld&&p.y<-16){app.api.clearInput();p.x=app.spawn[0];p.z=app.spawn[2];p.y=Math.max(app.spawn[1],98);p.vx=p.vy=p.vz=0;p.fly=true;p.fallStart=p.y;app.api.toast('Đã trở lại phía trên vùng nhập. Dùng F để bay.');return;}
  if(app.dimension==='sky'&&p.y<1){
   if(app.mode!=='creative'){app.api.damage(20,'Rơi khỏi đảo trên Thiên Giới','void');return;}
   const safe=V.findSkySafeRespawn(app.world,app.spawn);
   if(safe){app.api.clearInput();[p.x,p.y,p.z]=safe.position;p.vx=p.vy=p.vz=0;p.fallStart=p.y;p.grounded=false;app.api.toast('Đã trở lại đảo an toàn.');app.api.record('sky-void-rescue','Creative void recovery without changing terrain.',safe);}
   else travel(app,'overworld');
   return;
  }
  const lava=touchesLava(app.world,p,p.crouch?1.5:1.8);
  app.lavaContact=lava;
  if(!lava||app.mode==='creative'){app.lavaAge=0;return;}
  app.lavaAge=Math.min(1,(app.lavaAge||0)+Math.min(dt,.1));
  if(app.lavaAge>=.5){app.lavaAge-=.5;app.api.damage(2,'Bị bỏng bởi dung nham','lava');}
 }
 function respawn(app){
  if(app.dimension==='overworld'||app.panel!=='death'||app.contextLost)return false;
  const finder=app.dimension==='sky'?V.findSkySafeRespawn:V.findInfernoSafeRespawn;
  const safe=finder(app.world,app.spawn);
  if(!safe)return travel(app,'overworld',true);
  const p=app.player;app.api.clearInput();[p.x,p.y,p.z]=safe.position;
  p.vx=p.vy=p.vz=0;p.grounded=false;p.health=20;p.hunger=16;p.air=12;p.fallStart=p.y;
  app.hurt=0;app.regen=0;app.drown=0;app.lavaAge=0;app.lavaContact=false;app.pendingDeath=false;app.lastRespawn=safe;
  app.api.resetPresentation?.();app.api.closePanel();app.api.record('respawn','Returned to safe ground in '+app.dimension+'.',safe);app.api.save(false);return true;
 }
 function install(app){
  if(typeof document!=='undefined'){
   const button=document.getElementById('dimensionBtn');
   if(button)button.onclick=()=>travel(app,app.dimension==='overworld'?'inferno':'overworld');
   const sky=document.getElementById('skyDimensionBtn');if(sky)sky.onclick=()=>travel(app,'sky');
  }
  refresh(app);
 }
 function inspect(app){
  const inactive=Object.keys(app.realmStates||{}),budget={edits:app.world.editLimit??MAX_EDITS,chunks:app.world.chunkEditLimit??MAX_CHUNKS};
  return{active:app.dimension||'overworld',inactive,canTravel:allowed(app),lavaContact:!!app.lavaContact,budget};
 }
 V.dimensions=Object.freeze({names:REALMS,allowed,decode,capture,prepare,applyBudget,admit,touchesLava,refresh,travel,interact,tick,respawn,install,inspect});
})();
