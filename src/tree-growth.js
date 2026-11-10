/* MảiMêRáp — bounded, deterministic sapling growth.
 * Integration: init(app, saved?.trees || []); onPlace AFTER a successful sapling
 * placement; onBreak AFTER a successful removal; update from active simulation;
 * persist snapshot(app) as the save's trees array. This module performs no I/O.
 * All five family saplings must be registered in the catalog before integration.
 * On load, missing pending records are derived from already stored sapling
 * edits at age zero. Supplied ages take priority; no chunks or blocks change.
 *
 * Growth age advances only in loaded chunks within 48 horizontal blocks of the
 * player, while gameplay is active. A blocked mature plant remains pending and
 * retries after five active nearby seconds. At most two growth attempts occur
 * per update. Only its own sapling, air, flowers and tall grass may be replaced.
 * All cells, player clearance and both save limits are checked before writing.
 */
(() => {
  'use strict';
  const V=globalThis.Voxel ||= {};
  const OAK=36,SPRUCE=37,BIRCH=46,ACACIA=50,CHERRY=54,MAX_PLANTS=256,HEIGHT=96,RADIUS2=48*48;
  const MAX_EDITS=100000,MAX_EDIT_CHUNKS=4096,RETRY_SECONDS=5;
  const key=(x,y,z)=>x+','+y+','+z;
  const chunkKey=(x,z)=>Math.floor(x/16)+','+Math.floor(z/16);
  const validId=id=>id===OAK||id===SPRUCE||id===BIRCH||id===ACACIA||id===CHERRY;
  const validPosition=(x,y,z,profile=V.coordinates.LEGACY)=>V.coordinates.validBlock(x,y,z,profile,1,HEIGHT-1);
  function mix(h){h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);return(h^(h>>>16))>>>0;}
  function worldSeed(app){
    if(typeof app.world?.seed==='number'&&Number.isFinite(app.world.seed))return app.world.seed>>>0;
    const text=String(app.seed??'');let h=2166136261;
    for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);
    return mix(h);
  }
  function hash(seed,x,y,z,salt){return mix(seed^salt^Math.imul(x,0x632be5ab)^Math.imul(y,0x9e3779b1)^Math.imul(z,0x85157af5));}
  function duration(seed,p){return 90+hash(seed,p.x,p.y,p.z,p.id*4093)%61;}
  function state(app){return app.treeGrowth || init(app,[]).state;}
  function loaded(world,x,y,z){
    if(!V.coordinates.validBlock(x,y,z,world?.coordinateProfile,0,HEIGHT-1))return null;
    const cx=Math.floor(x/16),cz=Math.floor(z/16),k=cx+','+cz,c=world.chunks?.get(k);
    if(!c?.data||c.data.length!==16*16*HEIGHT)return null;
    const index=x-cx*16+16*(z-cz*16+16*y);
    return{chunk:c,key:k,index,id:c.data[index]};
  }
  function nearbyLoaded(app,p){
    const player=app.player;
    if(!player||![player.x,player.y,player.z].every(Number.isFinite))return false;
    const dx=p.x+.5-player.x,dz=p.z+.5-player.z;
    return dx*dx+dz*dz<=RADIUS2&&!!app.world.chunks?.get(chunkKey(p.x,p.z))?.data;
  }
  function remove(s,k){
    if(!s.plants.delete(k))return false;
    const i=s.order.indexOf(k);
    if(i>=0){s.order.splice(i,1);if(i<s.cursor)s.cursor--;}
    if(s.cursor>=s.order.length)s.cursor=0;
    return true;
  }
  function restoreEditedSaplings(app,s){
    const edits=app.world?.edits;
    if(s.plants.size>=MAX_PLANTS||!edits||typeof edits[Symbol.iterator]!=='function')return 0;
    // The save codec already enforces these limits. Bound work here too, for
    // callers that supply a World directly. Store at most one chunk's candidate
    // indices at a time, not an unbounded list of all saplings in the world.
    const chunks=[];let seenChunks=0,seenCells=0,derived=0;
    for(const [k,cells] of edits){
      if(seenChunks++>=MAX_EDIT_CHUNKS)break;
      if(typeof k!=='string'||!cells||typeof cells[Symbol.iterator]!=='function')continue;
      const parts=k.split(',');if(parts.length!==2)continue;
      const cx=Number(parts[0]),cz=Number(parts[1]);
      if(!Number.isInteger(cx)||!Number.isInteger(cz)||!V.coordinates.validEditChunk(cx,cz,app.world?.coordinateProfile)||k!==cx+','+cz)continue;
      chunks.push({cx,cz,cells});
    }
    chunks.sort((a,b)=>a.cx-b.cx||a.cz-b.cz);
    for(const {cx,cz,cells} of chunks){
      const candidates=[];
      for(const [index,id] of cells){
        if(seenCells>=MAX_EDITS)break;seenCells++;
        if(validId(id)&&Number.isInteger(index)&&index>=0&&index<16*16*HEIGHT)candidates.push({index,id});
      }
      candidates.sort((a,b)=>a.index-b.index);
      for(const {index,id} of candidates){
        const x=cx*16+index%16,y=Math.floor(index/256),z=cz*16+Math.floor(index/16)%16,k=key(x,y,z);
        if(!validPosition(x,y,z,app.world?.coordinateProfile)||s.plants.has(k))continue;
        s.plants.set(k,{x,y,z,id,age:0,retry:0});s.order.push(k);derived++;
        if(s.plants.size>=MAX_PLANTS)return derived;
      }
      if(seenCells>=MAX_EDITS)break;
    }
    return derived;
  }
  function init(app,saved){
    const s={plants:new Map(),order:[],cursor:0,lastAttempts:0,totalGrown:0,lastBlocked:null};
    app.treeGrowth=s;
    const rows=Array.isArray(saved)?saved:Array.isArray(saved?.trees)?saved.trees:[];
    const seed=worldSeed(app);let rejected=0;
    for(const row of rows){
      if(s.plants.size>=MAX_PLANTS){rejected++;continue;}
      if(!row||!validId(row.id)||!validPosition(row.x,row.y,row.z,app.world?.coordinateProfile)||!Number.isFinite(row.age)||row.age<0){rejected++;continue;}
      const k=key(row.x,row.y,row.z);
      if(s.plants.has(k)){rejected++;continue;}
      const p={x:row.x,y:row.y,z:row.z,id:row.id,age:0,retry:0};
      p.age=Math.min(row.age,duration(seed,p));s.plants.set(k,p);s.order.push(k);
    }
    const derived=restoreEditedSaplings(app,s);
    s.order.sort((a,b)=>{const p=s.plants.get(a),q=s.plants.get(b);return p.x-q.x||p.y-q.y||p.z-q.z;});
    return{accepted:s.plants.size,rejected,derived,state:s};
  }
  function onPlace(app,x,y,z,id){
    if(!validId(id)||!validPosition(x,y,z,app.world?.coordinateProfile))return false;
    const cell=loaded(app.world,x,y,z);
    if(!cell||cell.id!==id)return false;
    const s=state(app),k=key(x,y,z);
    if(!s.plants.has(k)&&s.plants.size>=MAX_PLANTS)return false;
    if(!s.plants.has(k))s.order.push(k);
    s.plants.set(k,{x,y,z,id,age:0,retry:0});
    return true;
  }
  function onBreak(app,x,y,z,id){
    const s=app.treeGrowth;if(!s)return false;
    const k=key(x,y,z),p=s.plants.get(k);
    if(!p||(id!==undefined&&id!==p.id))return false;
    return remove(s,k);
  }
  function shape(seed,p){
    if(p.id===BIRCH||p.id===ACACIA||p.id===CHERRY)return V.core.treeShape(seed,p);
    const spruce=p.id===SPRUCE,h=hash(seed,p.x,p.y,p.z,0x51a7b31);
    const tall=spruce?7+(h%4):4+(h%3),wood=spruce?24:5,leaf=spruce?25:6,cells=new Map();
    const add=(x,y,z,id)=>{
      const k=key(x,y,z),old=cells.get(k);
      if(!old||id===wood)cells.set(k,{x,y,z,id});
    };
    for(let dy=0;dy<tall;dy++)add(p.x,p.y+dy,p.z,wood);
    if(spruce){
      for(let dy=2;dy<=tall;dy++){
        const fromTop=tall-dy,r=fromTop===0?0:Math.min(3,Math.floor((fromTop+1)/2));
        for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
          if(r>0&&Math.abs(dx)===r&&Math.abs(dz)===r)continue;
          if(r>1&&dy%2===0&&Math.abs(dx)+Math.abs(dz)>r+1)continue;
          add(p.x+dx,p.y+dy,p.z+dz,leaf);
        }
      }
    }else{
      for(let dy=tall-3;dy<=tall;dy++){
        const r=dy===tall?1:2;
        for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
          if(Math.abs(dx)===r&&Math.abs(dz)===r&&(dy>=tall-1||hash(seed,p.x+dx,p.y+dy,p.z+dz,0x291fab1)%3!==0))continue;
          add(p.x+dx,p.y+dy,p.z+dz,leaf);
        }
      }
    }
    return Array.from(cells.values());
  }
  function intersectsPlayer(player,cell){
    if(!player||![player.x,player.y,player.z].every(Number.isFinite))return false;
    return player.x+.3>cell.x&&player.x-.3<cell.x+1&&player.z+.3>cell.z&&player.z-.3<cell.z+1&&
      player.y+1.8>cell.y&&player.y<cell.y+1;
  }
  function prepare(app,p,seed){
    const world=app.world,base=loaded(world,p.x,p.y,p.z),soil=loaded(world,p.x,p.y-1,p.z);
    if(!base||base.id!==p.id)return{reason:'sapling-missing-or-unloaded'};
    if(!soil||(soil.id!==1&&soil.id!==2))return{reason:'soil'};
    if(!world.edits||typeof world.set!=='function')return{reason:'world-not-ready'};
    const writes=[],groups=new Map();let addedEdits=0,addedChunks=0;
    for(const cell of shape(seed,p)){
      const old=loaded(world,cell.x,cell.y,cell.z);
      if(!old)return{reason:'space-unloaded-or-out-of-bounds'};
      const own=cell.x===p.x&&cell.y===p.y&&cell.z===p.z;
      if(!(old.id===0||old.id===22||old.id===23||(own&&old.id===p.id)))return{reason:'occupied'};
      if(intersectsPlayer(app.player,cell))return{reason:'player'};
      let group=groups.get(old.key);
      if(!group){
        const edits=world.edits.get(old.key);
        group={key:old.key,edits,journal:[]};groups.set(old.key,group);if(!edits)addedChunks++;
      }
      const hadEdit=!!group.edits?.has(old.index);
      if(!hadEdit)addedEdits++;
      const entry={...cell,chunk:old.chunk,index:old.index,oldId:old.id,hadEdit,oldEdit:group.edits?.get(old.index)};
      writes.push(entry);group.journal.push(entry);
    }
    const editCount=Number.isInteger(world.editCount)?world.editCount:Array.from(world.edits.values()).reduce((sum,m)=>sum+m.size,0);
    if(editCount+addedEdits>Math.min(MAX_EDITS,world.editLimit??MAX_EDITS)||world.edits.size+addedChunks>Math.min(MAX_EDIT_CHUNKS,world.chunkEditLimit??MAX_EDIT_CHUNKS))return{reason:'save-capacity'};
    return{writes,groups,editCount,oldError:world.lastEditError};
  }
  function commit(app,plan){
    const world=app.world;
    try{
      for(const c of plan.writes)if(!world.set(c.x,c.y,c.z,c.id))throw Error('Tree write rejected');
      return true;
    }catch{
      // JavaScript does not interleave world edits during this synchronous commit.
      // Restore the complete journal if a future setter adds another rejection.
      for(const group of plan.groups.values()){
        if(group.edits){
          world.edits.set(group.key,group.edits);
          for(const c of group.journal){if(c.hadEdit)group.edits.set(c.index,c.oldEdit);else group.edits.delete(c.index);}
        }else world.edits.delete(group.key);
        for(const c of group.journal)c.chunk.data[c.index]=c.oldId;
      }
      world.editCount=plan.editCount;world.lastEditError=plan.oldError;
      // Restored air can uncover a lava light below a rolled-back canopy cell.
      // Reconcile only journal cells and their immediate lower neighbors after
      // every voxel has been restored; retain the monotonic revision counter.
      if(typeof world.isLightCell==='function'){
        const affected=new Map();let lightChanged=false;
        for(const c of plan.writes){let indices=affected.get(c.chunk);if(!indices){indices=new Set();affected.set(c.chunk,indices);}indices.add(c.index);if(c.index>=256)indices.add(c.index-256);}
        for(const[chunk,indices]of affected){const lights=chunk.lights||(chunk.lights=new Map());for(const index of indices){const next=world.isLightCell(chunk,index)?chunk.data[index]:undefined;if(next===undefined){if(lights.delete(index))lightChanged=true;}else if(lights.get(index)!==next){lights.set(index,next);lightChanged=true;}}}
        if(lightChanged)world.lightRevision=(world.lightRevision||0)+1;
      }
      const touched=new Set();
      for(const c of plan.writes){
        const cx=Math.floor(c.x/16),cz=Math.floor(c.z/16);
        for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)touched.add((cx+dx)+','+(cz+dz));
      }
      for(const k of touched){const c=world.chunks.get(k);if(c?.data){c.revision++;c.dirty=true;}}
      return false;
    }
  }
  function update(app,dt){
    const s=app.treeGrowth;if(!s)return 0;s.lastAttempts=0;
    if(app.playing===false||app.started===false||app.inHome||app.panel||app.starting||app.contextLost||!Number.isFinite(dt)||dt<=0)return 0;
    const step=Math.min(dt,1),seed=worldSeed(app);
    for(const p of s.plants.values())if(nearbyLoaded(app,p)){
      p.age=Math.min(duration(seed,p),p.age+step);p.retry=Math.max(0,p.retry-step);
    }
    let examined=0,grown=0;const count=s.order.length;
    while(examined<count&&s.order.length&&s.lastAttempts<2){
      if(s.cursor>=s.order.length)s.cursor=0;
      const k=s.order[s.cursor++],p=s.plants.get(k);examined++;
      if(!p||p.retry>0||!nearbyLoaded(app,p)||p.age<duration(seed,p))continue;
      s.lastAttempts++;
      const plan=prepare(app,p,seed);
      if(!plan.reason&&commit(app,plan)){remove(s,k);s.totalGrown++;grown++;}
      else{p.retry=RETRY_SECONDS;s.lastBlocked={x:p.x,y:p.y,z:p.z,reason:plan.reason||'write-rejected'};}
    }
    return grown;
  }
  function snapshot(app){
    const s=app.treeGrowth;if(!s)return[];
    return Array.from(s.plants.values()).map(p=>({x:p.x,y:p.y,z:p.z,id:p.id,age:p.age}))
      .sort((a,b)=>a.x-b.x||a.y-b.y||a.z-b.z).slice(0,MAX_PLANTS);
  }
  function inspect(app){const s=app.treeGrowth;return s?{pending:s.plants.size,lastAttempts:s.lastAttempts,totalGrown:s.totalGrown,lastBlocked:s.lastBlocked}:{pending:0,lastAttempts:0,totalGrown:0,lastBlocked:null};}
  V.trees=Object.freeze({init,onPlace,onBreak,update,snapshot,inspect,MAX_PLANTS,OAK,SPRUCE,BIRCH,ACACIA,CHERRY});
})();
