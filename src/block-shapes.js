/* MảiMêRáp — bounded, authored construction geometry shared by collision and rays. */
(() => {
'use strict';
const V=globalThis.Voxel||={},MAX_ID=511,ID_BITS=9,EPS=1e-9;
const EMPTY=Object.freeze([]),FULL=Object.freeze([Object.freeze([0,0,0,1,1,1])]),profiles=new Map();
for(const [key,def] of Object.entries(V.blocks)){
 const id=Number(key);if(!Number.isInteger(id)||id<0||id>MAX_ID)throw Error('Block ID outside the reviewed nine-bit range');
 if(def.shape!=='boxes')continue;
 const parts=def.boxes;
 if(!Array.isArray(parts)||parts.length<1||parts.length>12||parts.some(b=>!Array.isArray(b)||b.length!==6||b.some(v=>!Number.isInteger(v)||v<0||v>16)||[0,1,2].some(a=>b[a]>=b[a+3])))throw Error('Invalid authored block boxes: '+id);
 for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++)if([0,1,2].every(a=>Math.min(parts[i][a+3],parts[j][a+3])>Math.max(parts[i][a],parts[j][a])))throw Error('Overlapping authored block interiors: '+id);
 if(def.boxTiles!==undefined&&(!Array.isArray(def.boxTiles)||def.boxTiles.length!==parts.length||def.boxTiles.some(t=>!Array.isArray(t)||t.length!==6||t.some(n=>!Number.isInteger(n)||n<0))))throw Error('Invalid authored face materials: '+id);
 profiles.set(id,Object.freeze(parts.map(b=>Object.freeze(b.map(n=>n/16)))));
}
function boxesFor(id){return profiles.get(id)||(V.blocks[id]?.solid?FULL:EMPTY);}
function intersectsAABB(id,lo,hi,epsilon=1e-5){return boxesFor(id).some(b=>[0,1,2].every(a=>lo[a]<b[a+3]-epsilon&&hi[a]>b[a]+epsilon));}
function rayHit(id,origin,direction,enter=0,leave=Infinity,minInterval=0){
 const vector=v=>(Array.isArray(v)||ArrayBuffer.isView(v))&&v.length===3&&Array.from(v).every(Number.isFinite);
 if(!vector(origin)||!vector(direction)||!direction.some(v=>v!==0)||!Number.isFinite(enter)||enter<0||!(leave>=enter)||!Number.isFinite(minInterval)||minInterval<0)return null;
 let closest=null;
 for(const [part,box] of boxesFor(id).entries()){
  let first=-Infinity,last=Infinity,normal=[0,0,0],possible=true;
  for(let a=0;a<3;a++){
   const d=direction[a];
   if(Math.abs(d)<=EPS){if(origin[a]<box[a]-EPS||origin[a]>box[a+3]+EPS){possible=false;break;}}
   else{
    let t0=(box[a]-origin[a])/d,t1=(box[a+3]-origin[a])/d;
    if(t0>t1)[t0,t1]=[t1,t0];
    if(t0>first){first=t0;normal=[0,0,0];normal[a]=d>0?-1:1;}
    last=Math.min(last,t1);if(last<first-EPS){possible=false;break;}
   }
  }
  const near=Math.max(0,enter,first),far=Math.min(leave,last);
  if(!possible||far<near-EPS||far-near<minInterval||near>leave+EPS)continue;
  if(!closest||near<closest.distance-EPS)closest={distance:near,exitDistance:far,normal:first>=Math.max(0,enter)-EPS?normal:[0,0,0],part};
 }
 return closest;
}
function supportHeight(id,u=.5,v=.5){let top=null;for(const b of boxesFor(id))if(u>=b[0]-EPS&&u<=b[3]+EPS&&v>=b[2]-EPS&&v<=b[5]+EPS)top=top===null?b[4]:Math.max(top,b[4]);return top;}
function faceCoversRect(id,axis,sign,lo,hi){
 if(!Number.isInteger(axis)||axis<0||axis>2||![1,-1].includes(sign)||!Array.isArray(lo)||!Array.isArray(hi)||lo.length!==2||hi.length!==2||![...lo,...hi].every(Number.isFinite)||lo.some((v,i)=>v<0||hi[i]>1||v>=hi[i])||!V.blocks[id]?.solid)return false;
 const other=[0,1,2].filter(a=>a!==axis),plane=sign>0?1:0,rects=[],cuts=new Set([lo[0],hi[0]]);
 for(const b of boxesFor(id)){
  if(Math.abs(b[axis+(sign>0?3:0)]-plane)>EPS)continue;
  const r=[Math.max(lo[0],b[other[0]]),Math.max(lo[1],b[other[1]]),Math.min(hi[0],b[other[0]+3]),Math.min(hi[1],b[other[1]+3])];
  if(r[2]-r[0]<=EPS||r[3]-r[1]<=EPS)continue;
  rects.push(r);cuts.add(r[0]);cuts.add(r[2]);
 }
 const ordered=[...cuts].sort((a,b)=>a-b);
 // Exact rectangle-union coverage in bounded strips, not a few corner probes
 // that could overlook a hole inside the attachment plate.
 for(let i=1;i<ordered.length;i++){
  if(ordered[i]-ordered[i-1]<=EPS)continue;
  const mid=(ordered[i]+ordered[i-1])/2,intervals=rects.filter(r=>r[0]<mid&&r[2]>mid).sort((a,b)=>a[1]-b[1]);
  let covered=lo[1];
  for(const r of intervals){if(r[1]>covered+EPS)break;covered=Math.max(covered,r[3]);}
  if(covered<hi[1]-EPS)return false;
 }
 return true;
}
function stepUpHeight(world,from,target,height=1.8,width=.6,maxRise=.5){
 if(!world||typeof world.get!=='function'||typeof world.collides!=='function'||!from||!target||from.length!==3||target.length!==3||![...from,...target,height,width,maxRise].every(Number.isFinite)||height<=0||width<=0||maxRise<=0||maxRise>.5||Math.abs(from[1]-target[1])>1e-8)return null;
 const [x,y,z]=target,r=width/2,e=1e-5,candidates=new Set();
 // Only an authored part can offer a step. Ordinary one-block walls retain their behavior.
 for(let by=Math.floor(y)-1;by<=Math.floor(y+maxRise);by++)for(let bz=Math.floor(z-r+e);bz<=Math.floor(z+r-e);bz++)for(let bx=Math.floor(x-r+e);bx<=Math.floor(x+r-e);bx++){
  const id=world.get(bx,by,bz,true);if(V.blocks[id]?.shape!=='boxes')continue;
  for(const b of boxesFor(id)){
   const top=by+b[4];
   if(top>y+e&&top-y<=maxRise+e&&x-r<bx+b[3]-e&&x+r>bx+b[0]+e&&z-r<bz+b[5]-e&&z+r>bz+b[2]+e)candidates.add(top);
  }
 }
 for(const top of [...candidates].sort((a,b)=>a-b))if(!world.collides(from[0],top,from[2],height,width)&&!world.collides(x,top,z,height,width)&&world.collides(x,top-.02,z,height,width))return top;
 return null;
}
function outlineVertices(id,cell,renderOrigin=[0,0,0],epsilon=.003){
 const out=[],edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
 for(const b of boxesFor(id)){
  const lo=[0,1,2].map(a=>cell[a]-renderOrigin[a]+b[a]-epsilon),hi=[0,1,2].map(a=>cell[a]-renderOrigin[a]+b[a+3]+epsilon);
  const points=[[lo[0],lo[1],lo[2]],[hi[0],lo[1],lo[2]],[hi[0],hi[1],lo[2]],[lo[0],hi[1],lo[2]],[lo[0],lo[1],hi[2]],[hi[0],lo[1],hi[2]],[hi[0],hi[1],hi[2]],[lo[0],hi[1],hi[2]]];
  for(const [a,c] of edges)out.push(...points[a],...points[c]);
 }
 return new Float32Array(out);
}
V.BLOCK_ID_MAX=MAX_ID;
V.blockGeometry=Object.freeze({maxId:MAX_ID,idBits:ID_BITS,boxesFor,intersectsAABB,rayHit,supportHeight,faceCoversRect,stepUpHeight,outlineVertices,profileCount:profiles.size,maximumParts:12});
})();
