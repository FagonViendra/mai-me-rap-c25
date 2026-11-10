/* MảiMêRáp — bounded farming. Inventory, UI and persistence I/O belong to game.js. */
(() => {
  'use strict';
  const V=globalThis.Voxel ||= {};
  const FARMLAND=38,FIRST=39,MATURE=42,SEEDS=120,WHEAT=121,HOE=124;
  const MAX_CROPS=256,HEIGHT=96,MAX_EDITS=100000,MAX_CHUNKS=4096,QUANTUM=.5,MAX_WRITES=4;
  const crop=id=>Number.isInteger(id)&&id>=FIRST&&id<=MATURE;
  const pending=id=>Number.isInteger(id)&&id>=FIRST&&id<MATURE;
  const key=(x,y,z)=>x+','+y+','+z;
  const position=(x,y,z,minY=1,maxY=95,profile=V.coordinates.LEGACY)=>V.coordinates.validBlock(x,y,z,profile,minY,maxY);
  const active=a=>a&&a.playing!==false&&a.started!==false&&!a.inHome&&!a.panel&&!a.starting&&!a.contextLost;
  const creative=a=>a.mode==='creative';
  function mix(h){h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);return(h^(h>>>16))>>>0;}
  function seedOf(value){return V.core.hashSeed(value);}
  const appSeed=a=>seedOf(typeof a.world?.seed==='number'?a.world.seed:a.seed);
  function duration(seed,p){return 60+mix(seed^Math.imul(p.x,0x632be5ab)^Math.imul(p.y,0x9e3779b1)^Math.imul(p.z,0x85157af5)^0x57484541)%31;}
  function address(x,y,z){const cx=Math.floor(x/16),cz=Math.floor(z/16);return{k:cx+','+cz,i:x-cx*16+16*(z-cz*16+16*y)};}
  function cell(world,x,y,z){if(!position(x,y,z,0,95,world?.coordinateProfile))return null;const a=address(x,y,z),c=world?.chunks?.get(a.k);return c?.data?.length===24576?{...a,c,id:c.data[a.i]}:null;}
  function edited(edits,x,y,z,cache=new Map()){
    const a=address(x,y,z);
    if(edits&&typeof edits.get==='function')return edits.get(a.k)?.get(a.i);
    if(!Array.isArray(edits))return undefined;
    if(!cache.has(a.k)){const row=edits.find(r=>Array.isArray(r)&&r[0]+','+r[1]===a.k);cache.set(a.k,row&&Array.isArray(row[2])?new Map(row[2]):null);}
    return cache.get(a.k)?.get(a.i);
  }
  function validate(rows,edits,seedInput,profile=V.coordinates.LEGACY){
    if(rows===undefined)return[];
    if(!Array.isArray(rows)||rows.length>MAX_CROPS)throw Error('Danh sách cây trồng không hợp lệ hoặc vượt 256 cây.');
    const seen=new Set(),lookup=new Map(),seed=seedOf(seedInput),out=[];
    for(const p of rows){
      if(!p||typeof p!=='object'||Array.isArray(p)||!pending(p.id)||!position(p.x,p.y,p.z,1,95,profile)||!Number.isFinite(p.age)||p.age<0||p.age>90)throw Error('Một cây trồng không hợp lệ.');
      const k=key(p.x,p.y,p.z);if(seen.has(k))throw Error('Cây trồng bị lặp.');seen.add(k);
      if(edited(edits,p.x,p.y,p.z,lookup)!==p.id)throw Error('Cây trồng không khớp khối đã lưu.');
      const d=duration(seed,p);out.push({x:p.x,y:p.y,z:p.z,id:p.id,age:Math.max((p.id-FIRST)*d/3,Math.min(d,p.age))});
    }
    return out.sort((a,b)=>a.x-b.x||a.y-b.y||a.z-b.z);
  }
  function state(app){return app.cropGrowth||init(app,[]).state;}
  function derive(app,s){
    const edits=app.world?.edits;if(s.plants.size>=MAX_CROPS||!edits||typeof edits[Symbol.iterator]!=='function')return 0;
    const chunks=[];let seen=0,visited=0,derived=0;
    for(const[k,cells]of edits){
      if(seen++>=MAX_CHUNKS)break;
      const parts=typeof k==='string'?k.split(','):[],cx=Number(parts[0]),cz=Number(parts[1]);
      if(parts.length!==2||!Number.isInteger(cx)||!Number.isInteger(cz)||!V.coordinates.validEditChunk(cx,cz,app.world?.coordinateProfile)||k!==cx+','+cz||!cells||typeof cells[Symbol.iterator]!=='function')continue;
      chunks.push({cx,cz,cells});
    }
    chunks.sort((a,b)=>a.cx-b.cx||a.cz-b.cz);
    for(const{cx,cz,cells}of chunks){
      const candidates=[];
      for(const[i,id]of cells){if(visited>=MAX_EDITS)break;visited++;if(pending(id)&&Number.isInteger(i)&&i>=0&&i<24576)candidates.push([i,id]);}
      candidates.sort((a,b)=>a[0]-b[0]);
      for(const[i,id]of candidates){
        if(s.plants.size>=MAX_CROPS)return derived;
        const p={x:cx*16+i%16,y:Math.floor(i/256),z:cz*16+Math.floor(i/16)%16,id,age:0},k=key(p.x,p.y,p.z);
        if(!position(p.x,p.y,p.z,1,95,app.world?.coordinateProfile)||s.plants.has(k))continue;
        p.age=(id-FIRST)*duration(appSeed(app),p)/3;s.plants.set(k,p);derived++;
      }
      if(visited>=MAX_EDITS)break;
    }
    return derived;
  }
  function init(app,saved){
    const s={plants:new Map(),queue:[],head:0,accumulator:0,lastChecked:0,lastAttempts:0,lastWrites:0,totalMatured:0,totalHarvested:0,lastBlocked:null};
    app.cropGrowth=s;let rejected=0;
    const rows=Array.isArray(saved)?saved:[];
    for(const row of rows){
      if(s.plants.size>=MAX_CROPS){rejected++;continue;}
      try{const p=validate([row],app.world?.edits,appSeed(app),app.world?.coordinateProfile)[0],k=key(p.x,p.y,p.z);if(s.plants.has(k))rejected++;else s.plants.set(k,p);}catch{rejected++;}
    }
    const derived=derive(app,s),sorted=[...s.plants].sort((a,b)=>a[1].x-b[1].x||a[1].y-b[1].y||a[1].z-b[1].z);s.plants=new Map(sorted);
    return{accepted:s.plants.size,rejected,derived,state:s};
  }
  function held(app){const id=app.hotbar?.[app.selected]||0;return !creative(app)&&!(app.inventory?.[id]>0)?0:id;}
  function nearby(app,p){const a=app.player;if(!a||![a.x,a.y,a.z].every(Number.isFinite))return false;return(p.x+.5-a.x)**2+(p.z+.5-a.z)**2<=48*48;}
  function hydrated(world,p){for(let dz=-4;dz<=4;dz++)for(let dx=-4;dx<=4;dx++)if(cell(world,p.x+dx,p.y-1,p.z+dz)?.id===7)return true;return false;}
  function blocked(app,p){
    if(!nearby(app,p))return'far';
    const at=cell(app.world,p.x,p.y,p.z),soil=cell(app.world,p.x,p.y-1,p.z);
    if(!at||!soil)return'unloaded';if(at.id!==p.id)return'changed';if(soil.id!==FARMLAND)return'soil';
    const above=p.y===95?{id:0}:cell(app.world,p.x,p.y+1,p.z);
    if(!above)return'unloaded';if(V.blocks[above.id]?.solid)return'covered';
    return hydrated(app.world,p)?null:'dry';
  }
  const result=(ok,reason,extra={})=>({ok,reason,changed:ok,consume:[],wear:0,drops:[],...extra});
  function actionGuard(app,x,y,z,minY=1,maxY=95){
    if(!active(app))return'inactive';if(!position(x,y,z,minY,maxY,app.world?.coordinateProfile))return'coordinates';
    const p=app.player;if(!p||![p.x,p.y,p.z].every(Number.isFinite))return'player';
    const eye=p.y+(p.crouch?1.30:1.62);if((x+.5-p.x)**2+(y+.5-eye)**2+(z+.5-p.z)**2>49)return'reach';
    return null;
  }
  function write(app,at,x,y,z,id){
    const w=app.world,edits=w?.edits;
    if(!edits||typeof edits.get!=='function'||typeof w.set!=='function'||!Number.isInteger(w.editCount))return'world-not-ready';
    const row=edits.get(at.k),had=!!row?.has(at.i),prior=row?.get(at.i),count=w.editCount,old=at.id;
    if((!row&&edits.size>=MAX_CHUNKS)||(!had&&count>=MAX_EDITS))return'edit-capacity';
    let ok=false;try{ok=w.set(x,y,z,id)===true;}catch{}
    if(ok&&at.c.data[at.i]===id&&edited(edits,x,y,z)===id)return null;
    at.c.data[at.i]=old;
    if(row){edits.set(at.k,row);if(had)row.set(at.i,prior);else row.delete(at.i);}else edits.delete(at.k);
    w.editCount=count;
    const cx=Math.floor(x/16),cz=Math.floor(z/16);
    for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const c=w.chunks.get((cx+dx)+','+(cz+dz));if(c?.data){c.revision++;c.dirty=true;}}
    return'write-rejected';
  }
  function register(app,x,y,z,id,age){
    const s=state(app),k=key(x,y,z),old=s.plants.get(k);
    if(!pending(id)||!position(x,y,z,1,95,app.world?.coordinateProfile)||(!old&&s.plants.size>=MAX_CROPS)||edited(app.world?.edits,x,y,z)!==id)return false;
    const p={x,y,z,id,age:0},d=duration(appSeed(app),p);
    p.age=Math.max((id-FIRST)*d/3,Math.min(d,age??old?.age??0));s.plants.set(k,p);return true;
  }
  function prepare(app,x,y,z){
    const guard=actionGuard(app,x,y,z,0,94);if(guard)return result(false,guard);
    if(held(app)!==HOE)return result(false,'hoe-required');
    if(!V.blocks[FARMLAND]?.solid)return result(false,'farmland-shape');
    const at=cell(app.world,x,y,z),above=cell(app.world,x,y+1,z);if(!at||!above)return result(false,'unloaded');
    if(at.id!==1&&at.id!==2)return result(false,at.id===FARMLAND?'already-farmland':'soil');
    if(![0,22,23].includes(above.id))return result(false,'occupied');
    const error=write(app,at,x,y,z,FARMLAND);if(error)return result(false,error);
    return result(true,null,{coords:[x,y,z],from:at.id,to:FARMLAND,wear:creative(app)?0:HOE});
  }
  function plant(app,x,y,z){
    const guard=actionGuard(app,x,y,z);if(guard)return result(false,guard);
    if(held(app)!==SEEDS)return result(false,'seeds-required');
    const at=cell(app.world,x,y,z),soil=cell(app.world,x,y-1,z);if(!at||!soil)return result(false,'unloaded');
    if(soil.id!==FARMLAND)return result(false,'soil');if(![0,22,23].includes(at.id))return result(false,'occupied');
    if(![39,40,41,42].every(id=>V.blocks[id]&&!V.blocks[id].solid))return result(false,'crop-shape');
    const s=state(app),k=key(x,y,z);if(!s.plants.has(k)&&s.plants.size>=MAX_CROPS)return result(false,'plant-limit');
    const error=write(app,at,x,y,z,FIRST);if(error)return result(false,error);
    register(app,x,y,z,FIRST,0);
    return result(true,null,{coords:[x,y,z],from:at.id,to:FIRST,consume:creative(app)?[]:[[SEEDS,1]]});
  }
  function harvest(app,x,y,z){
    const guard=actionGuard(app,x,y,z);if(guard)return result(false,guard);
    const at=cell(app.world,x,y,z);if(!at)return result(false,'unloaded');if(!crop(at.id))return result(false,'not-crop');
    const error=write(app,at,x,y,z,0);if(error)return result(false,error);
    const s=state(app);s.plants.delete(key(x,y,z));s.totalHarvested++;
    return result(true,null,{coords:[x,y,z],from:at.id,to:0,mature:at.id===MATURE,drops:creative(app)?[]:at.id===MATURE?[[WHEAT,1],[SEEDS,2]]:[[SEEDS,1]]});
  }
  function onBlockChanged(app,x,y,z,oldId,newId){
    if(!position(x,y,z,0,95,app.world?.coordinateProfile))return false;
    const s=state(app),k=key(x,y,z);
    if(pending(newId)&&y>=1){const at=cell(app.world,x,y,z);return !!at&&at.id===newId&&register(app,x,y,z,newId,newId<oldId?0:undefined);}
    return s.plants.delete(k);
  }
  function update(app,dt){
    const s=app.cropGrowth;if(!s)return{checked:0,attempts:0,writes:0,matured:0};
    s.lastAttempts=0;s.lastWrites=0;
    if(!active(app)||!Number.isFinite(dt)||dt<=0)return{checked:0,attempts:0,writes:0,matured:0};
    s.accumulator+=Math.min(dt,1);let checked=0,matured=0;
    while(s.accumulator+1e-9>=QUANTUM){
      s.accumulator=Math.max(0,s.accumulator-QUANTUM);s.queue=[];s.head=0;
      for(const[k,p]of s.plants){
        checked++;const at=cell(app.world,p.x,p.y,p.z);
        if(at&&!pending(at.id)){s.plants.delete(k);continue;}
        if(at&&at.id!==p.id){p.id=at.id;p.age=Math.max(p.age,(p.id-FIRST)*duration(appSeed(app),p)/3);}
        const reason=blocked(app,p);if(reason){s.lastBlocked={x:p.x,y:p.y,z:p.z,reason};continue;}
        const d=duration(appSeed(app),p);p.age=Math.min(d,p.age+QUANTUM);
        const desired=FIRST+Math.min(3,Math.floor(p.age/d*3+1e-9));
        if(desired>p.id)s.queue.push(k);
      }
      s.lastChecked=checked;
    }
    let examined=0;
    while(s.head<s.queue.length&&s.lastAttempts<MAX_WRITES&&examined++<MAX_CROPS){
      const k=s.queue[s.head++],p=s.plants.get(k);if(!p)continue;
      const reason=blocked(app,p);if(reason){s.lastBlocked={x:p.x,y:p.y,z:p.z,reason};continue;}
      const d=duration(appSeed(app),p),id=FIRST+Math.min(3,Math.floor(p.age/d*3+1e-9));if(id<=p.id)continue;
      s.lastAttempts++;const at=cell(app.world,p.x,p.y,p.z),error=write(app,at,p.x,p.y,p.z,id);
      if(error){s.lastBlocked={x:p.x,y:p.y,z:p.z,reason:error};continue;}
      s.lastWrites++;p.id=id;
      if(id===MATURE){s.plants.delete(k);s.totalMatured++;matured++;}
    }
    if(s.head>=s.queue.length){s.queue=[];s.head=0;}
    return{checked,attempts:s.lastAttempts,writes:s.lastWrites,matured};
  }
  function snapshot(app){
    const s=app.cropGrowth;if(!s)return[];
    return [...s.plants.values()].filter(p=>pending(p.id)&&edited(app.world?.edits,p.x,p.y,p.z)===p.id)
      .map(p=>({x:p.x,y:p.y,z:p.z,id:p.id,age:p.age})).sort((a,b)=>a.x-b.x||a.y-b.y||a.z-b.z).slice(0,MAX_CROPS);
  }
  function inspect(app){const s=app.cropGrowth;return s?{pending:s.plants.size,queued:s.queue.length-s.head,lastChecked:s.lastChecked,lastAttempts:s.lastAttempts,lastWrites:s.lastWrites,totalMatured:s.totalMatured,totalHarvested:s.totalHarvested,lastBlocked:s.lastBlocked}:{pending:0,queued:0,lastChecked:0,lastAttempts:0,lastWrites:0,totalMatured:0,totalHarvested:0,lastBlocked:null};}
  V.farming=Object.freeze({init,update,prepare,plant,harvest,onBlockChanged,snapshot,validate,inspect,duration:(seed,p)=>duration(seedOf(seed),p),MAX_CROPS,FARMLAND,FIRST,MATURE,SEEDS,WHEAT,HOE});
})();
