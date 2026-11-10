/* MảiMêRáp — optional ore vision over authoritative loaded CPU chunks.
 * No terrain remeshing, generation, world edits, inventory changes or saved fields.
 * Markers use the existing renderer's restored-context instanced cube batch.
 */
(() => {
'use strict';
const V=globalThis.Voxel||={},RADIUS=32,LIMIT=512,PER_TYPE=64,SCAN_CHUNKS=2,CELLS=16*16*96;
const TYPES=Object.freeze([
 Object.freeze({id:14,name:'Than',hex:'#bac7d6',color:Object.freeze([186/255,199/255,214/255])}),
 Object.freeze({id:15,name:'Sắt',hex:'#ed996a',color:Object.freeze([237/255,153/255,106/255])}),
 Object.freeze({id:16,name:'Vàng',hex:'#ffe168',color:Object.freeze([1,225/255,104/255])}),
 Object.freeze({id:17,name:'Kim cương',hex:'#52e7dc',color:Object.freeze([82/255,231/255,220/255])}),
 Object.freeze({id:205,name:'Đồng',hex:'#df9561',color:Object.freeze([223/255,149/255,97/255])}),
 Object.freeze({id:207,name:'Thạch anh',hex:'#e8dce8',color:Object.freeze([232/255,220/255,232/255])})
]);
const BY_ID=new Map(TYPES.map(t=>[t.id,t])),SIZE=Object.freeze([.74,.74,.74]);
const order=(a,b)=>a.d2-b.d2||a.x-b.x||a.y-b.y||a.z-b.z||a.id-b.id;
function nearest(heap,row,limit){
 if(heap.length<limit){heap.push(row);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(order(heap[p],heap[i])>=0)break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}return;}
 if(order(row,heap[0])>=0)return;heap[0]=row;let i=0;
 for(;;){const left=i*2+1,right=left+1;if(left>=heap.length)return;let child=right<heap.length&&order(heap[right],heap[left])>0?right:left;if(order(heap[i],heap[child])>=0)return;[heap[i],heap[child]]=[heap[child],heap[i]];i=child;}
}
class OreVision {
 constructor(){this.reset();}
 reset(){
  this.enabled=false;this.world=null;this.epoch=null;this.cache=new Map();this.selection=[];this.drawList=[];this.visibleRows=[];this.queryKey='';this.queryEye=null;this.queryAt=-Infinity;
  this.pending=0;this.eligible=0;this.capped=false;this.counts=Object.fromEntries(TYPES.map(t=>[t.id,0]));this.marked=Object.fromEntries(TYPES.map(t=>[t.id,0]));
  this.scans=0;this.scannedCells=0;this.refreshes=0;this.draws=0;this.lastScanCells=0;this.lastDrawn=0;
 }
 setEnabled(value){
  const next=value===true;if(next===this.enabled)return this.enabled;this.enabled=next;
  this.cache.clear();this.selection.length=0;this.drawList.length=0;this.visibleRows.length=0;this.queryKey='';this.queryEye=null;this.pending=0;this.eligible=0;this.capped=false;this.lastDrawn=0;
  for(const t of TYPES){this.counts[t.id]=0;this.marked[t.id]=0;}return this.enabled;
 }
 update(world,eye){
  this.lastScanCells=0;this.lastDrawn=0;
  if(!this.enabled){this.drawList.length=0;return this.drawList;}
  if(!world?.chunks||typeof world.chunks.get!=='function'||!Array.isArray(eye)||eye.length!==3||!eye.every(Number.isFinite)){
   this.cache.clear();this.selection.length=0;this.drawList.length=0;this.visibleRows.length=0;this.pending=0;this.eligible=0;this.capped=false;for(const t of TYPES){this.counts[t.id]=0;this.marked[t.id]=0;}return this.drawList;
  }
  let dirty=false;
  if(this.world!==world||this.epoch!==world.epoch){this.world=world;this.epoch=world.epoch;this.cache.clear();this.selection.length=0;this.queryKey='';dirty=true;}
  const active=new Set(),missing=[];
  const x0=Math.floor((eye[0]-RADIUS)/16),x1=Math.floor((eye[0]+RADIUS)/16),z0=Math.floor((eye[2]-RADIUS)/16),z1=Math.floor((eye[2]+RADIUS)/16);
  for(let cz=z0;cz<=z1;cz++)for(let cx=x0;cx<=x1;cx++){
   const dx=Math.max(cx*16-eye[0],0,eye[0]-(cx+1)*16),dz=Math.max(cz*16-eye[2],0,eye[2]-(cz+1)*16);
   if(dx*dx+dz*dz>RADIUS*RADIUS)continue;
   const key=cx+','+cz,ch=world.chunks.get(key);if(!ch?.data||ch.data.length!==CELLS)continue;active.add(key);
   const prior=this.cache.get(key);
   if(prior&&prior.chunk===ch&&prior.data===ch.data&&prior.revision===ch.revision)continue;
   if(prior){this.cache.delete(key);dirty=true;}
   missing.push({key,ch,d2:(cx*16+8-eye[0])**2+(cz*16+8-eye[2])**2});
  }
  for(const key of this.cache.keys())if(!active.has(key)){this.cache.delete(key);dirty=true;}
  missing.sort((a,b)=>a.d2-b.d2||a.ch.cx-b.ch.cx||a.ch.cz-b.ch.cz);
  for(let n=0;n<Math.min(SCAN_CHUNKS,missing.length);n++){
   const {key,ch}=missing[n],indices=[];for(let i=0;i<CELLS;i++)if(BY_ID.has(ch.data[i]))indices.push(i);
   this.cache.set(key,{chunk:ch,data:ch.data,revision:ch.revision,indices:new Uint16Array(indices)});
   this.scans++;this.scannedCells+=CELLS;this.lastScanCells+=CELLS;dirty=true;
  }
  this.pending=Math.max(0,missing.length-SCAN_CHUNKS);
  const key=eye.map(n=>Math.floor(n*2)).join(','),now=globalThis.performance?.now?.()??0,moved=this.queryEye&&eye.some((n,i)=>n!==this.queryEye[i]);
  if(dirty||key!==this.queryKey||(moved&&now-this.queryAt>=150)){this.rebuild(eye);this.queryKey=key;this.queryEye=eye.slice();this.queryAt=now;}
  this.drawList.length=0;this.visibleRows.length=0;for(const t of TYPES)this.marked[t.id]=0;
  // Revalidate selected source cells every frame. Even before a rescan slot is
  // available, an edited/unloaded/replaced chunk cannot leave a ghost marker.
  for(const row of this.selection){
   const ch=world.chunks.get(row.key),entry=this.cache.get(row.key);
   if(!entry||ch!==entry.chunk||ch.data!==entry.data||ch.revision!==entry.revision||ch.data[row.index]!==row.id)continue;
   const d2=(row.x-eye[0])**2+(row.y-eye[1])**2+(row.z-eye[2])**2;if(d2>RADIUS*RADIUS)continue;
   row.d2=d2;this.visibleRows.push(row);
  }
  this.visibleRows.sort((a,b)=>order(b,a));for(const row of this.visibleRows){this.drawList.push(row.cube);this.marked[row.id]++;}
  return this.drawList;
 }
 rebuild(eye){
  const all=[],byType=new Map(TYPES.map(t=>[t.id,[]]));this.eligible=0;for(const t of TYPES)this.counts[t.id]=0;
  for(const [key,entry] of this.cache){const ch=entry.chunk;
   for(const index of entry.indices){
    const id=entry.data[index];if(!BY_ID.has(id))continue;
    const x=ch.cx*16+index%16+.5,y=Math.floor(index/256)+.5,z=ch.cz*16+Math.floor(index/16)%16+.5,d2=(x-eye[0])**2+(y-eye[1])**2+(z-eye[2])**2;
    if(d2>RADIUS*RADIUS)continue;const row={key,index,id,x,y,z,d2};this.eligible++;this.counts[id]++;nearest(all,row,LIMIT);nearest(byType.get(id),row,PER_TYPE);
   }
  }
  const selected=[],used=new Set();const append=row=>{const key=row.key+':'+row.index;if(used.has(key)||selected.length>=LIMIT)return;used.add(key);selected.push(row);};
  // Reserve up to 64 nearest blocks of each ore, then use remaining slots for
  // the nearest overall. Dense coal never silently crowds out every diamond.
  for(const t of TYPES)for(const row of byType.get(t.id).sort(order))append(row);
  for(const row of all.sort(order))append(row);
  selected.sort((a,b)=>order(b,a));
  this.selection=selected.map(row=>({...row,cube:{p:[row.x,row.y,row.z],s:SIZE,id:row.id,yaw:0,tint:BY_ID.get(row.id).color,emissive:1,light:1,kind:-1,uvScale:1}}));
  this.capped=this.eligible>LIMIT;this.refreshes++;
 }
 draw(renderer,world,eye,managedState=null){
  this.lastDrawn=0;const gl=renderer?.gl;if(!this.enabled||!gl||gl.isContextLost())return 0;
  const rows=this.update(world,eye);if(!rows.length)return 0;const u=renderer.terrain.u;
  // The managed caller supplies uniforms from its current frame, not a
  // cross-frame cache; invalidation is therefore unnecessary after resize/loss.
  // Canonical bindings are safe because outline/hand bind their own geometry.
  const before=managedState?{program:renderer.terrain.p,vao:null,array:null,depth:true,depthMask:true,blend:false,cull:true,fog:managedState.fog,underwater:managedState.underwater,mine:managedState.mine,offset:[0,0,0],instanced:0}:{program:gl.getParameter(gl.CURRENT_PROGRAM),vao:gl.getParameter(gl.VERTEX_ARRAY_BINDING),array:gl.getParameter(gl.ARRAY_BUFFER_BINDING),depth:gl.isEnabled(gl.DEPTH_TEST),depthMask:gl.getParameter(gl.DEPTH_WRITEMASK),blend:gl.isEnabled(gl.BLEND),cull:gl.isEnabled(gl.CULL_FACE),fog:gl.getUniform(renderer.terrain.p,u.uFogRange),underwater:gl.getUniform(renderer.terrain.p,u.uUnderwater),mine:gl.getUniform(renderer.terrain.p,u.uMineProgress),offset:gl.getUniform(renderer.terrain.p,u.uOffset),instanced:gl.getUniform(renderer.terrain.p,u.uInstanced)};
  try{
   gl.useProgram(renderer.terrain.p);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);
   gl.uniform2f(u.uFogRange,1000000,2000000);gl.uniform1f(u.uUnderwater,0);gl.uniform1f(u.uMineProgress,0);
   const count=renderer.cubeBatch.draw(rows,renderer.renderOrigin||[0,0,0]);this.lastDrawn=count;this.draws++;
   renderer.stats.oreVisionInstances=count;renderer.stats.cubeInstances=(renderer.stats.cubeInstances||0)+count;
   renderer.stats.cubeUploadBytes=(renderer.stats.cubeUploadBytes||0)+count*V.CUBE_BATCH_FORMAT.bytesPerInstance;return count;
  }finally{
   gl.useProgram(renderer.terrain.p);gl.uniform2fv(u.uFogRange,before.fog);gl.uniform1f(u.uUnderwater,before.underwater);gl.uniform1f(u.uMineProgress,before.mine);gl.uniform3fv(u.uOffset,before.offset);gl.uniform1i(u.uInstanced,before.instanced);
   gl.bindVertexArray(before.vao);gl.bindBuffer(gl.ARRAY_BUFFER,before.array);gl.depthMask(before.depthMask);
   for(const [cap,value] of [[gl.DEPTH_TEST,before.depth],[gl.BLEND,before.blend],[gl.CULL_FACE,before.cull]])if(value)gl.enable(cap);else gl.disable(cap);
   gl.useProgram(before.program);
  }
 }
 inspect(){return{enabled:this.enabled,radius:RADIUS,limit:LIMIT,reservedPerType:PER_TYPE,cachedChunks:this.cache.size,pendingChunks:this.pending,eligible:this.eligible,shown:this.drawList.length,capped:this.capped,scans:this.scans,scannedCells:this.scannedCells,lastScanCells:this.lastScanCells,refreshes:this.refreshes,draws:this.draws,lastDrawn:this.lastDrawn,types:TYPES.map(t=>({id:t.id,name:t.name,color:t.hex,found:this.counts[t.id],marked:this.marked[t.id]}))};}
}
V.ORE_VISION_INFO=Object.freeze({radius:RADIUS,limit:LIMIT,reservedPerType:PER_TYPE,maxChunksScannedPerFrame:SCAN_CHUNKS,types:TYPES});
V.createOreVision=()=>new OreVision();
})();
