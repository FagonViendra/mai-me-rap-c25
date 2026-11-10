/* MảiMêRáp — opt-in near-field voxel ray-traced solar shadows.
 * Resident world geometry; 24 crossings per ray, eleven-block range.
 * R8UI material codes; filtered outer leaf surfaces and bounded cone rays.
 * No dynamic-actor shadows, GI, reflections or RTX API.
 */
(() => {
'use strict';
const V=globalThis.Voxel||={},STEPS=24,RANGE=11,STRENGTH=.40;
// Code10 follows the eight existing foliage codes2..9. Shape data is the
// same bounded catalog geometry consumed by the mesh worker and item icon.
const WORKTABLE_CODE=10;
const WORKTABLE_BOXES=Object.freeze((V.blocks[18]?.tableBoxes||[]).map(b=>Object.freeze(b.map(n=>n/16))));
if(WORKTABLE_BOXES.length!==13||WORKTABLE_BOXES.some(b=>b.length!==6||b.some(n=>!Number.isFinite(n)||n<0||n>1)||[0,1,2].some(k=>b[k]>=b[k+3])))throw Error('Expected thirteen bounded worktable shadow boxes');
// One bounded integer lookup holds the same authored boxes as collision and terrain.
const SHAPE_PROFILES=Object.freeze(Object.keys(V.blocks).map(Number).filter(id=>V.blocks[id]?.shape==='boxes').sort((a,b)=>a-b).map((id,i)=>Object.freeze({id,code:11+i,boxes:V.blockGeometry.boxesFor(id)})));
if(SHAPE_PROFILES.length>245)throw Error('Authored shape shadow codes exceed R8UI capacity');
const SHAPE_BY_ID=new Map(SHAPE_PROFILES.map(p=>[p.id,p])),SHAPE_BY_CODE=new Map(SHAPE_PROFILES.map(p=>[p.code,p]));
const SHAPE_TEX_WIDTH=24,SHAPE_TEX_HEIGHT=Math.max(1,SHAPE_PROFILES.length),SHAPE_TEXELS=new Uint8Array(SHAPE_TEX_WIDTH*SHAPE_TEX_HEIGHT*4);
SHAPE_PROFILES.forEach((profile,row)=>profile.boxes.forEach((box,part)=>{const offset=4*(row*SHAPE_TEX_WIDTH+part*2);for(let axis=0;axis<3;axis++){SHAPE_TEXELS[offset+axis]=Math.round(box[axis]*16);SHAPE_TEXELS[offset+4+axis]=Math.round(box[axis+3]*16);}SHAPE_TEXELS[offset+3]=profile.boxes.length;}));

const WIND_DECL='uniform float uPlantWind;uniform float uClock;uniform vec2 uWindOriginPhase;';
const WIND_CODE=`
  if(uPlantWind>.5&&!uInstanced&&(vKind>2.5&&vKind<3.5||vKind>5.5&&vKind<6.5)){
    float weight=vKind<3.5?clamp(fract(aPosition.y)/.86,0.,1.):.48;
    float phase=vWorld.x*.73+vWorld.z*.51+vWorld.y*.21;
    vWorld.x+=sin(uClock*1.7+phase+uWindOriginPhase.x)*.065*weight;
    vWorld.z+=cos(uClock*1.31+phase*.87+uWindOriginPhase.y)*.035*weight;
  }
`;
const VS=`#version 300 es
precision highp float;
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0,1);}`;
const FS=`#version 300 es
precision highp float;precision highp int;precision highp sampler2DArray;
uniform highp sampler2D uScene,uDepth;
uniform highp usampler3D uVoxel;
uniform highp usampler2D uShapeBounds;
uniform highp sampler2DArray uFoliage;
uniform int uLeafLayers[48],uSamples;
uniform vec3 uGridOrigin;
uniform mat4 uVP,uInverseVP;
uniform vec3 uEye,uSun,uForward,uFog;
uniform vec2 uSize,uFogRange;
uniform float uDay,uDebug,uUnderwater;
out vec4 outColor;
vec3 worldAt(vec2 uv,float depth){vec4 p=uInverseVP*vec4(uv*2.-1.,depth*2.-1.,1.);return p.xyz/p.w;}
float depthAt(ivec2 p){return texelFetch(uDepth,clamp(p,ivec2(0),textureSize(uDepth,0)-1),0).r;}
vec3 pointAt(ivec2 p,float d){return worldAt((vec2(clamp(p,ivec2(0),textureSize(uDepth,0)-1))+.5)/uSize,d);}
bool surfaceNormal(ivec2 c,float depth,vec3 p,out vec3 normal){
  float dl=depthAt(c+ivec2(-1,0)),dr=depthAt(c+ivec2(1,0));
  float dd=depthAt(c+ivec2(0,-1)),du=depthAt(c+ivec2(0,1));
  vec3 l=p-pointAt(c+ivec2(-1,0),dl),r=pointAt(c+ivec2(1,0),dr)-p;
  vec3 d=p-pointAt(c+ivec2(0,-1),dd),u=pointAt(c+ivec2(0,1),du)-p;
  bool vl=dl<.999999&&dot(l,l)>1e-14,vr=dr<.999999&&dot(r,r)>1e-14;
  bool vd=dd<.999999&&dot(d,d)>1e-14,vu=du<.999999&&dot(u,u)>1e-14;
  if((!vl&&!vr)||(!vd&&!vu))return false;
  vec4 err=vec4(abs(dot(l,uForward)),abs(dot(r,uForward)),abs(dot(d,uForward)),abs(dot(u,uForward)));
  if(uSamples>1){
    // Raw perspective depth is affine over a projected planar triangle.
    // Extrapolate each two-pixel segment to avoid choosing the other side
    // of a foreground/background discontinuity at convex corners.
    vec4 farDepth=vec4(depthAt(c+ivec2(-2,0)),depthAt(c+ivec2(2,0)),depthAt(c+ivec2(0,-2)),depthAt(c+ivec2(0,2)));
    vec4 nearDepth=vec4(dl,dr,dd,du),planeError=abs(2.*nearDepth-farDepth-vec4(depth));
    for(int i=0;i<4;i++)if(farDepth[i]>=.999999)planeError[i]=1e10;
    // For exact/quantized ties, the nearest valid depth remains the fallback.
    if(abs(planeError.x-planeError.y)>1e-8){err.x=planeError.x;err.y=planeError.y;}
    if(abs(planeError.z-planeError.w)>1e-8){err.z=planeError.z;err.w=planeError.w;}
  }
  if(!vl)err.x=1e20;if(!vr)err.y=1e20;if(!vd)err.z=1e20;if(!vu)err.w=1e20;
  vec3 dx=err.x<=err.y?l:r,dy=err.z<=err.w?d:u;
  normal=cross(dx,dy);float lengthSquared=dot(normal,normal);
  if(lengthSquared<1e-16)return false;
  normal*=inversesqrt(lengthSquared);if(dot(normal,uEye-p)<0.)normal=-normal;
  return true;
}
float leafCoverage(uint code,vec3 hit,int axis,int face){
  int slot=int(code)-2;if(slot<0||slot>=8)return 0.;
  vec2 uv=axis==0?fract(hit.zy):axis==1?fract(hit.xz):fract(hit.xy);
  // Existing alpha mip: stable filtered coverage, not noisy binary sampling.
  return textureLod(uFoliage,vec3(uv,float(uLeafLayers[slot*6+face])),1.).a;
}
const vec3 worktableLo[13]=vec3[13](${WORKTABLE_BOXES.map(b=>'vec3('+b.slice(0,3).map(n=>n.toFixed(6)).join(',')+')').join(',')});
const vec3 worktableHi[13]=vec3[13](${WORKTABLE_BOXES.map(b=>'vec3('+b.slice(3).map(n=>n.toFixed(6)).join(',')+')').join(',')});
bool worktableHit(vec3 origin,vec3 direction,ivec3 cell,float enter,float leave){
  vec3 local=origin-vec3(cell);
  for(int part=0;part<13;part++){
    float lo=max(0.,enter),hi=min(11.,leave);bool possible=hi>lo;
    for(int axis=0;axis<3;axis++){
      if(abs(direction[axis])<1e-8){
        if(local[axis]<worktableLo[part][axis]||local[axis]>worktableHi[part][axis])possible=false;
      }else{
        float a=(worktableLo[part][axis]-local[axis])/direction[axis];
        float b=(worktableHi[part][axis]-local[axis])/direction[axis];
        lo=max(lo,min(a,b));hi=min(hi,max(a,b));
      }
    }
    if(possible&&hi>lo+1e-6)return true;
  }
  return false;
}
bool authoredShapeHit(uint code,vec3 origin,vec3 direction,ivec3 cell,float enter,float leave){
  int profile=int(code)-11;if(profile<0||profile>=${SHAPE_PROFILES.length})return false;
  int count=int(texelFetch(uShapeBounds,ivec2(0,profile),0).a);vec3 local=origin-vec3(cell);
  for(int part=0;part<12;part++){
    if(part>=count)break;
    vec3 lower=vec3(texelFetch(uShapeBounds,ivec2(part*2,profile),0).rgb)/16.;
    vec3 upper=vec3(texelFetch(uShapeBounds,ivec2(part*2+1,profile),0).rgb)/16.;
    float lo=max(0.,enter),hi=min(11.,leave);bool possible=hi>lo;
    for(int axis=0;axis<3;axis++){
      if(abs(direction[axis])<1e-8){if(local[axis]<lower[axis]||local[axis]>upper[axis])possible=false;}
      else{float a=(lower[axis]-local[axis])/direction[axis],b=(upper[axis]-local[axis])/direction[axis];lo=max(lo,min(a,b));hi=min(hi,max(a,b));}
    }
    if(possible&&hi>lo+1e-6)return true;
  }
  return false;
}
float voxelShadow(vec3 p,vec3 n,vec3 direction){
  float visibility=1.-smoothstep(40.,48.,length((p-uEye).xz));
  if(visibility<=0.)return 0.;
  vec3 origin=p-uGridOrigin+n*.035+direction*.025;
  ivec3 cell=ivec3(floor(origin)),limit=ivec3(128,96,128);
  if(any(lessThan(cell,ivec3(0)))||any(greaterThanEqual(cell,limit)))return 0.;
  ivec3 stepCell=ivec3(sign(direction));
  vec3 delta=vec3(1e30),next=vec3(1e30);
  for(int axis=0;axis<3;axis++)if(abs(direction[axis])>1e-8){
    delta[axis]=1./abs(direction[axis]);
    next[axis]=(float(cell[axis])+(direction[axis]>0.?1.:0.)-origin[axis])/direction[axis];
  }
  uint initial=texelFetch(uVoxel,cell,0).r;
  if(initial==10u&&worktableHit(origin,direction,cell,0.,min(next.x,min(next.y,next.z))))return visibility;
  if(initial>=11u&&authoredShapeHit(initial,origin,direction,cell,0.,min(next.x,min(next.y,next.z))))return visibility;
  uint previousLeaf=initial>=2u&&initial<=9u?initial:0u;
  bool receiverLeafRun=previousLeaf>=2u;float transmission=1.;
  for(int i=0;i<24;i++){
    float t=min(next.x,min(next.y,next.z));if(t>11.)break;
    int faceAxis=0,crossedAxes=0;float dominant=-1.;
    for(int axis=0;axis<3;axis++)if(next[axis]<=t+1e-6){
      if(abs(direction[axis])>dominant){faceAxis=axis;dominant=abs(direction[axis]);}
      cell[axis]+=stepCell[axis];next[axis]+=delta[axis];crossedAxes++;
    }
    bool outside=any(lessThan(cell,ivec3(0)))||any(greaterThanEqual(cell,limit));
    uint code=outside?0u:texelFetch(uVoxel,cell,0).r;
    if(code==1u)return visibility;
    if(code==10u&&worktableHit(origin,direction,cell,t,min(next.x,min(next.y,next.z))))return visibility;
    if(code>=11u&&authoredShapeHit(code,origin,direction,cell,t,min(next.x,min(next.y,next.z))))return visibility;
    bool leaf=code>=2u&&code<=9u;vec3 hit=origin+direction*t;
    int exitFace=faceAxis*2+(direction[faceAxis]<0.?1:0),enterFace=exitFace^1;
    // Adjacent leaf species form one canopy. Internal faces were removed
    // by the mesher, so only an outer entry/exit surface attenuates a ray.
    if(previousLeaf>=2u&&(!leaf||crossedAxes>1)){
      if(!receiverLeafRun)transmission*=1.-.68*leafCoverage(previousLeaf,hit,faceAxis,exitFace);
      receiverLeafRun=false;
    }
    if(leaf&&(previousLeaf==0u||crossedAxes>1)){transmission*=1.-.68*leafCoverage(code,hit,faceAxis,enterFace);receiverLeafRun=false;}
    previousLeaf=leaf?code:0u;
    if(outside||transmission<=.02)break;
  }
  return visibility*(1.-transmission);
}
float solarOcclusion(vec3 p,vec3 n,vec3 direction){
  if(uSamples<=1)return voxelShadow(p,n,direction);
  vec3 tangent=vec3(direction.z,0.,-direction.x);
  tangent=dot(tangent,tangent)>1e-10?normalize(tangent):vec3(1.,0.,0.);
  vec3 bitangent=normalize(cross(direction,tangent));float sum=0.;
  const vec2 kernel[4]=vec2[4](vec2(-.5,-.5),vec2(.5,-.5),vec2(-.5,.5),vec2(.5,.5));
  for(int i=0;i<4;i++){vec3 ray=normalize(direction+.012*(tangent*kernel[i].x+bitangent*kernel[i].y));sum+=voxelShadow(p,n,ray);}
  return sum*.25;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uSize;float depth=texture(uDepth,uv).r;
  vec4 color=texture(uScene,uv);gl_FragDepth=depth;
  if(uDebug>2.5){uint d=uint(clamp(depth,0.,1.)*16777215.);outColor=vec4(vec3((d>>16u)&255u,(d>>8u)&255u,d&255u)/255.,1.);return;}
  if(uDebug>1.5){outColor=color;return;}
  if(depth>=.999999||uSun.y<=.02){outColor=uDebug>.5?vec4(0,0,0,1):color;return;}
  vec3 p=worldAt(uv,depth);float distanceToEye=length(p-uEye);
  float fogFactor=uUnderwater>.5?1.-exp(-distanceToEye*.10):smoothstep(uFogRange.x,uFogRange.y,distanceToEye);
  if(fogFactor>=.9999){outColor=uDebug>.5?vec4(0,0,0,1):color;return;}
  vec3 n;if(!surfaceNormal(ivec2(gl_FragCoord.xy),depth,p,n)){outColor=uDebug>.5?vec4(0,0,0,1):color;return;}
  vec3 direction=normalize(uSun);float facing=dot(n,direction),occlusion=0.;
  if(facing>.02)occlusion=solarOcclusion(p,n,direction);
  if(uDebug>.5){outColor=vec4(vec3(occlusion),1.);return;}
  float shadow=.40*occlusion*uDay*smoothstep(.02,.22,facing);
  vec3 fogColor=uUnderwater>.5?vec3(.055,.29,.40):uFog;
  vec3 visibleScene=max(color.rgb-fogColor*fogFactor,vec3(0.));
  outColor=vec4(color.rgb-visibleScene*(shadow*vec3(1.,.94,.80)),color.a);
}`;

function transform(m,p){const o=[];for(let r=0;r<4;r++)o[r]=m[r]*p[0]+m[4+r]*p[1]+m[8+r]*p[2]+m[12+r]*p[3];return o;}
function inverse4(m){
 if(!m||m.length!==16||!Array.from(m).every(Number.isFinite))throw Error('Finite 4x4 matrix required');
 const a=Array.from({length:4},(_,r)=>[m[r],m[4+r],m[8+r],m[12+r],r===0?1:0,r===1?1:0,r===2?1:0,r===3?1:0]);
 for(let c=0;c<4;c++){let pivot=c;for(let r=c+1;r<4;r++)if(Math.abs(a[r][c])>Math.abs(a[pivot][c]))pivot=r;if(Math.abs(a[pivot][c])<1e-12)throw Error('Singular view-projection matrix');[a[c],a[pivot]]=[a[pivot],a[c]];const d=a[c][c];for(let k=0;k<8;k++)a[c][k]/=d;for(let r=0;r<4;r++)if(r!==c){const f=a[r][c];for(let k=0;k<8;k++)a[r][k]-=f*a[c][k];}}
 const out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)out[c*4+r]=a[r][c+4];return out;
}
function project(vp,p){const q=transform(vp,[...p,1]);return{uv:[q[0]/q[3]*.5+.5,q[1]/q[3]*.5+.5],depth:q[2]/q[3]*.5+.5,w:q[3]};}
function unproject(inv,uv,depth){const p=transform(inv,[uv[0]*2-1,uv[1]*2-1,depth*2-1,1]);return p.slice(0,3).map(n=>n/p[3]);}
function windPoint(p,localY,kind,clock,instanced=false,enabled=true){if(!enabled||instanced||!(kind===3||kind===6))return p.slice();const weight=kind===3?Math.max(0,Math.min(1,(localY-Math.floor(localY))/.86)):.48,phase=p[0]*.73+p[2]*.51+p[1]*.21;return[p[0]+Math.sin(clock*1.7+phase)*.065*weight,p[1],p[2]+Math.cos(clock*1.31+phase*.87)*.035*weight];}
// Bounded world occupancy. No generation, meshing, World.get or World.ensure.
const GRID=[128,96,128],VOXEL_BYTES=128*96*128,FADE_START=40,FADE_END=48;
const LEAF_IDS=Object.keys(V.blocks).map(Number).filter(id=>{const b=V.blocks[id];return b?.leaf&&b.solid&&b.shape==='cube';}).sort((a,b)=>a-b);
if(LEAF_IDS.length>8)throw Error('Shadow foliage registry exceeds eight slots');
const LEAF_LAYERS=new Int32Array(48);LEAF_IDS.forEach((id,slot)=>{for(let f=0;f<6;f++)LEAF_LAYERS[slot*6+f]=V.blocks[id].tiles[f];});
function opaqueLookup(blocks,denseLeaves){
 const mask=new Uint8Array(V.BLOCK_ID_MAX+1);
 for(let id=1;id<mask.length;id++){const b=blocks[id];if(!b||!b.solid)continue;if(b.shape==='boxes'){mask[id]=SHAPE_BY_ID.get(id)?.code||0;continue;}if(b.shape==='worktable'){mask[id]=WORKTABLE_CODE;continue;}if(b.shape!=='cube')continue;if(b.opaque||denseLeaves&&b.leaf)mask[id]=1;else if(b.leaf){const slot=LEAF_IDS.indexOf(id);if(slot>=0)mask[id]=slot+2;}}
 return mask;
}
function prepareGrid(owner,world,eye,denseLeaves=true){
 if(!world||!world.chunks||!eye||eye.length!==3||!eye.every(Number.isFinite))throw Error('Voxel shadow requires a resident world and finite eye');
 const origin=[Math.round(eye[0]/8)*8-64,0,Math.round(eye[2]/8)*8-64],refs=[];
 for(let cz=Math.floor(origin[2]/16);cz<=Math.floor((origin[2]+127)/16);cz++)for(let cx=Math.floor(origin[0]/16);cx<=Math.floor((origin[0]+127)/16);cx++){const c=world.chunks.get(cx+','+cz);refs.push({cx,cz,chunk:c,data:c?.data,revision:c?.revision});}
 const old=owner.voxelCache;
 if(old&&old.world===world&&old.epoch===world.epoch&&old.dimension===world.dimension&&old.denseLeaves===denseLeaves&&old.origin[0]===origin[0]&&old.origin[2]===origin[2]&&old.refs.length===refs.length&&refs.every((r,i)=>r.chunk===old.refs[i].chunk&&r.data===old.refs[i].data&&r.revision===old.refs[i].revision))return false;
 const data=owner.voxelData||(owner.voxelData=new Uint8Array(VOXEL_BYTES)),mask=opaqueLookup(V.blocks,denseLeaves);data.fill(0);let occupied=0,foliage=0,resident=0;
 for(const r of refs){if(!r.data)continue;resident++;const wx=r.cx*16,wz=r.cz*16,x0=Math.max(0,origin[0]-wx),x1=Math.min(16,origin[0]+128-wx),z0=Math.max(0,origin[2]-wz),z1=Math.min(16,origin[2]+128-wz);
  for(let z=z0;z<z1;z++)for(let y=0;y<96;y++)for(let x=x0;x<x1;x++){const v=mask[r.data[x+16*(z+16*y)]];data[(wx+x-origin[0])+128*(y+96*(wz+z-origin[2]))]=v;occupied+=v!==0?1:0;foliage+=v>=2&&v<=9?1:0;}
 }
 owner.voxelOrigin=origin;owner.voxelCache={world,epoch:world.epoch,dimension:world.dimension,denseLeaves,origin,refs};owner.voxelBuilds=(owner.voxelBuilds||0)+1;owner.voxelChunks=resident;owner.voxelOccupied=occupied;owner.voxelFoliage=foliage;owner.voxelDirty=true;return true;
}
// Exact same slab intervals as the shader. Only code10 invokes these13 boxes.
function worktableRayHit(origin,direction,cell,enter,leave){
 let closest=null;
 const local=origin.map((n,k)=>n-cell[k]);
 for(const box of WORKTABLE_BOXES){
  let lo=Math.max(0,enter),hi=Math.min(RANGE,leave),possible=hi>lo;
  for(let axis=0;axis<3;axis++){
   if(Math.abs(direction[axis])<1e-8){if(local[axis]<box[axis]||local[axis]>box[axis+3])possible=false;}
   else{const a=(box[axis]-local[axis])/direction[axis],b=(box[axis+3]-local[axis])/direction[axis];lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));}
  }
  if(possible&&hi>lo+1e-6&&(closest===null||lo<closest))closest=lo;
 }
 return closest;
}
function shapeRayHit(code,origin,direction,cell,enter,leave){
 const profile=SHAPE_BY_CODE.get(code);if(!profile)return null;
 const hit=V.blockGeometry.rayHit(profile.id,origin.map((v,a)=>v-cell[a]),direction,Math.max(0,enter),Math.min(RANGE,leave),1e-6);
 return hit?hit.distance:null;
}
function traceCPU({point,eye=point,normal,sun,gridOrigin=[0,0,0],gridSize=GRID,voxels,occupied,leafCoverage=()=>1}){
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),l=Math.hypot(...sun),direction=sun.map(v=>v/l);
 if(!Number.isFinite(l)||l===0||direction[1]<=.02||dot(normal,direction)<=.02)return{occluded:false,steps:0,reason:'sun-or-face',occlusion:0,transmission:1};
 const o=point.map((v,i)=>v-gridOrigin[i]+normal[i]*.035+direction[i]*.025),cell=o.map(Math.floor);
 const inside=()=>cell.every((v,i)=>v>=0&&v<gridSize[i]);
 if(!inside())return{occluded:false,steps:0,reason:'outside-grid',occlusion:0,transmission:1};
 const sample=()=>Number(occupied?occupied(...cell):voxels?.[cell[0]+gridSize[0]*(cell[1]+gridSize[1]*cell[2])])||0;
 const step=direction.map(Math.sign),delta=direction.map(v=>Math.abs(v)>1e-8?1/Math.abs(v):1e30),next=direction.map((v,i)=>Math.abs(v)>1e-8?((v>0?cell[i]+1:cell[i])-o[i])/v:1e30);
 const d=Math.hypot(point[0]-eye[0],point[2]-eye[2]),f=Math.max(0,Math.min(1,(FADE_END-d)/(FADE_END-FADE_START))),fade=f*f*(3-2*f);
 if(fade<=0)return{occluded:false,steps:0,reason:'distance-fade',occlusion:0,transmission:1};
 const initial=sample();
 if(initial===WORKTABLE_CODE){const hit=worktableRayHit(o,direction,cell,0,Math.min(...next));if(hit!==null)return{occluded:true,steps:0,reason:'worktable-hit',distance:hit,cell:cell.slice(),worldCell:cell.map((v,a)=>v+gridOrigin[a]),occlusion:fade,transmission:0,surfaceEvents:[]};}
 if(initial>=11){const hit=shapeRayHit(initial,o,direction,cell,0,Math.min(...next));if(hit!==null)return{occluded:true,steps:0,reason:'authored-box-hit',distance:hit,cell:cell.slice(),worldCell:cell.map((v,a)=>v+gridOrigin[a]),occlusion:fade,transmission:0,surfaceEvents:[]};}
 let previousLeaf=initial>=2&&initial<=9?initial:0;
 let receiverLeafRun=previousLeaf>=2,transmission=1,steps=0,lastDistance=0,reason='budget',surfaceEvents=[];
 const attenuate=(code,axis,face,t,entering)=>{const hit=o.map((v,i)=>v+direction[i]*t),coverage=leafCoverage({code,axis,face,point:hit,worldPoint:hit.map((v,i)=>v+gridOrigin[i]),entering});if(!Number.isFinite(coverage)||coverage<0||coverage>1)throw Error('Leaf coverage must be finite in [0,1]');transmission*=1-.68*coverage;surfaceEvents.push({code,axis,face,distance:t,coverage,entering});};
 for(let i=0;i<STEPS;i++){
  const t=Math.min(...next);if(t>RANGE){reason='range';break;}
  let axis=0,dominant=-1,crossedAxes=0;for(let a=0;a<3;a++)if(next[a]<=t+1e-6){if(Math.abs(direction[a])>dominant){dominant=Math.abs(direction[a]);axis=a;}cell[a]+=step[a];next[a]+=delta[a];crossedAxes++;}
  steps=i+1;lastDistance=t;const outside=!inside(),code=outside?0:sample();
  if(code===1)return{occluded:true,steps,reason:'voxel-hit',distance:t,cell:cell.slice(),worldCell:cell.map((v,a)=>v+gridOrigin[a]),occlusion:fade,transmission:0,surfaceEvents};
  if(code===WORKTABLE_CODE){const hit=worktableRayHit(o,direction,cell,t,Math.min(...next));if(hit!==null)return{occluded:true,steps,reason:'worktable-hit',distance:hit,cell:cell.slice(),worldCell:cell.map((v,a)=>v+gridOrigin[a]),occlusion:fade,transmission:0,surfaceEvents};}
  if(code>=11){const hit=shapeRayHit(code,o,direction,cell,t,Math.min(...next));if(hit!==null)return{occluded:true,steps,reason:'authored-box-hit',distance:hit,cell:cell.slice(),worldCell:cell.map((v,a)=>v+gridOrigin[a]),occlusion:fade,transmission:0,surfaceEvents};}
  const leaf=code>=2&&code<=9,exitFace=axis*2+(direction[axis]<0?1:0);
  if(previousLeaf>=2&&(!leaf||crossedAxes>1)){if(!receiverLeafRun)attenuate(previousLeaf,axis,exitFace,t,false);receiverLeafRun=false;}
  if(leaf&&(previousLeaf===0||crossedAxes>1)){attenuate(code,axis,exitFace^1,t,true);receiverLeafRun=false;}
  previousLeaf=leaf?code:0;
  if(outside){reason='grid-exit';break;}if(transmission<=.02){reason='transmission-cutoff';break;}
 }
 return{occluded:transmission<1,steps,reason,distance:lastDistance,occlusion:fade*(1-transmission),transmission,surfaceEvents};
}
function softSunDirections(sun,samples=1,angularRadius=.012){
 const l=Math.hypot(...sun);if(!Number.isFinite(l)||l<=0||sun.length!==3||!sun.every(Number.isFinite))throw Error('Finite nonzero sun required');
 const d=sun.map(v=>v/l);if(samples<=1)return[d];
 let t=[d[2],0,-d[0]],tl=Math.hypot(...t);t=tl>1e-5?t.map(v=>v/tl):[1,0,0];
 const b=[d[1]*t[2]-d[2]*t[1],d[2]*t[0]-d[0]*t[2],d[0]*t[1]-d[1]*t[0]];
 return[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]].map(([x,y])=>{const r=d.map((v,i)=>v+angularRadius*(t[i]*x+b[i]*y)),n=Math.hypot(...r);return r.map(v=>v/n);});
}

class ScreenSunShadows {
 constructor(renderer){this.renderer=renderer;this.gl=renderer.gl;this.generation=renderer.generation;this.width=0;this.height=0;this.framebuffer=null;this.color=null;this.depth=null;this.program=null;this.vao=null;this.active=false;this.windEnabled=true;this.samples=1;this.quality='balanced';this.voxelFoliage=0;this.debugMode=0;this.error='';this.failedSize='';this.allocations=0;this.resolves=0;this.bytes=0;this.frameTarget=null;this.shapeTexture=null;this.shapeBytes=0;this.shapeAllocations=0;this.voxelTexture=null;this.voxelData=new Uint8Array(VOXEL_BYTES);this.voxelOrigin=[0,0,0];this.voxelCache=null;this.voxelDirty=true;this.voxelAllocations=0;this.voxelUploads=0;this.voxelBuilds=0;this.voxelBytes=0;this.voxelChunks=0;this.voxelOccupied=0;}
 static patchVertex(main){const anchor='  gl_Position=uVP*vec4(vWorld,1.);';if(main.split(anchor).length!==2)throw Error('Unexpected terrain vertex source');return main.replace(anchor,WIND_CODE+anchor);}
 ensure(width,height){
  const gl=this.gl;if(!this.program){this.program=this.renderer.program(VS,FS);this.vao=gl.createVertexArray();}
  if(this.width===width&&this.height===height&&this.framebuffer)return;
  if(this.color)gl.deleteTexture(this.color);if(this.depth)gl.deleteTexture(this.depth);
  this.framebuffer||=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);
  const texture=(format,type,internal,attachment)=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,internal,width,height,0,format,type,null);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);gl.framebufferTexture2D(gl.FRAMEBUFFER,attachment,gl.TEXTURE_2D,t,0);return t;};
  this.color=texture(gl.RGBA,gl.UNSIGNED_BYTE,gl.RGBA8,gl.COLOR_ATTACHMENT0);this.depth=texture(gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,gl.DEPTH_COMPONENT24,gl.DEPTH_ATTACHMENT);
  gl.drawBuffers([gl.COLOR_ATTACHMENT0]);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('RT color/depth framebuffer incomplete');
  this.width=width;this.height=height;this.bytes=width*height*8;this.allocations++;
 }
 prepare(world,eye,denseLeaves=true){
  try{prepareGrid(this,world,eye,denseLeaves);return true;}catch(e){this.error=String(e.message||e);return false;}
 }
 uploadVoxels(managedState){
  if(this.voxelTexture&&!this.voxelDirty)return;
  const gl=this.gl;
  // Managed renderer owns unit5, the pixel-unpack buffer and default unpack
  // layout. Arbitrary standalone callers receive their exact state back.
  const unpack=[[gl.UNPACK_ALIGNMENT,4],[gl.UNPACK_ROW_LENGTH,0],[gl.UNPACK_IMAGE_HEIGHT,0],[gl.UNPACK_SKIP_PIXELS,0],[gl.UNPACK_SKIP_ROWS,0],[gl.UNPACK_SKIP_IMAGES,0],[gl.UNPACK_FLIP_Y_WEBGL,false],[gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false]];
  gl.activeTexture(gl.TEXTURE5);
  const binding=managedState?null:gl.getParameter(gl.TEXTURE_BINDING_3D),pbo=managedState?null:gl.getParameter(gl.PIXEL_UNPACK_BUFFER_BINDING),saved=managedState?null:unpack.map(([p])=>gl.getParameter(p));
  try{
   gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER,null);for(const[p,v]of unpack)gl.pixelStorei(p,v);
   if(!this.voxelTexture){
    this.voxelTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_3D,this.voxelTexture);gl.texStorage3D(gl.TEXTURE_3D,1,gl.R8UI,128,96,128);
    for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_3D,p,gl.NEAREST);
    for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T,gl.TEXTURE_WRAP_R])gl.texParameteri(gl.TEXTURE_3D,p,gl.CLAMP_TO_EDGE);
    this.voxelAllocations++;this.voxelBytes=VOXEL_BYTES;
   }else gl.bindTexture(gl.TEXTURE_3D,this.voxelTexture);
   gl.texSubImage3D(gl.TEXTURE_3D,0,0,0,0,128,96,128,gl.RED_INTEGER,gl.UNSIGNED_BYTE,this.voxelData);
   this.voxelUploads++;this.voxelDirty=false;
  }finally{
   for(let i=0;i<unpack.length;i++)gl.pixelStorei(unpack[i][0],managedState?unpack[i][1]:saved[i]);
   gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER,pbo);gl.bindTexture(gl.TEXTURE_3D,binding);
  }
 }
 uploadShapes(){
  if(this.shapeTexture)return;
  const gl=this.gl,active=gl.getParameter(gl.ACTIVE_TEXTURE);gl.activeTexture(gl.TEXTURE8);
  const binding=gl.getParameter(gl.TEXTURE_BINDING_2D),pbo=gl.getParameter(gl.PIXEL_UNPACK_BUFFER_BINDING);
  const unpack=[[gl.UNPACK_ALIGNMENT,4],[gl.UNPACK_ROW_LENGTH,0],[gl.UNPACK_IMAGE_HEIGHT,0],[gl.UNPACK_SKIP_PIXELS,0],[gl.UNPACK_SKIP_ROWS,0],[gl.UNPACK_SKIP_IMAGES,0],[gl.UNPACK_FLIP_Y_WEBGL,false],[gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false]],saved=unpack.map(([key])=>gl.getParameter(key));
  try{
   gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER,null);for(const [key,value]of unpack)gl.pixelStorei(key,value);
   this.shapeTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.shapeTexture);
   gl.texStorage2D(gl.TEXTURE_2D,1,gl.RGBA8UI,SHAPE_TEX_WIDTH,SHAPE_TEX_HEIGHT);
   for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.NEAREST);
   for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
   gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,SHAPE_TEX_WIDTH,SHAPE_TEX_HEIGHT,gl.RGBA_INTEGER,gl.UNSIGNED_BYTE,SHAPE_TEXELS);
   this.shapeBytes=SHAPE_TEXELS.byteLength;this.shapeAllocations++;
  }catch(error){if(this.shapeTexture)gl.deleteTexture(this.shapeTexture);this.shapeTexture=null;this.shapeBytes=0;throw error;}
  finally{for(let i=0;i<unpack.length;i++)gl.pixelStorei(unpack[i][0],saved[i]);gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER,pbo);gl.bindTexture(gl.TEXTURE_2D,binding);gl.activeTexture(active);}
 }
 begin(managedState=false){
  const gl=this.gl;this.active=false;if(gl.isContextLost()||this.generation!==this.renderer.generation)return false;const size=gl.drawingBufferWidth+'x'+gl.drawingBufferHeight;if(this.failedSize===size)return false;this.error='';
  // Renderer-owned unit 0 uses TEXTURE_2D_ARRAY; its 2D binding is free.
  // Keep real framebuffer queries: Renderer.frame may target a caller's FBO.
  if(managedState){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,null);}
  const state={draw:gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING),read:gl.getParameter(gl.READ_FRAMEBUFFER_BINDING),active:managedState?gl.TEXTURE0:gl.getParameter(gl.ACTIVE_TEXTURE),texture:managedState?null:gl.getParameter(gl.TEXTURE_BINDING_2D)};
  try{this.ensure(gl.drawingBufferWidth,gl.drawingBufferHeight);this.uploadVoxels(managedState);this.uploadShapes();this.failedSize='';gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);this.frameTarget=state;this.active=true;return true;}
  catch(e){this.failedSize=size;this.error=String(e.message||e);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,state.draw);gl.bindFramebuffer(gl.READ_FRAMEBUFFER,state.read);return false;}
  finally{gl.activeTexture(state.active);gl.bindTexture(gl.TEXTURE_2D,state.texture);}
 }
 resolve({vp,eye,sun,forward,day,projection,basis,fog=[0,0,0],fogRange=[1e5,1e5+1],underwater=false,quality='balanced',managedState=false,renderOrigin=this.renderer.renderOrigin||[0,0,0]}){
  if(!this.active)return false;const gl=this.gl,frame=this.frameTarget;this.quality=quality==='high'?'high':'balanced';this.samples=this.quality==='high'?4:1;
  // Renderer-owned units 3/4 (2D),5 (3D),7 (borrowed foliage array).
  // Standalone effect callers retain the complete arbitrary-state fallback.
  const state=managedState?{program:this.renderer.terrain.p,vao:null,active:gl.TEXTURE0,depth:true,depthMask:true,depthFunc:gl.LEQUAL,blend:false,cull:true,viewport:[0,0,this.width,this.height],textures:[{unit:3,texture:null,sampler:null},{unit:4,texture:null,sampler:null},{unit:5,texture:null,sampler:null,target:gl.TEXTURE_3D},{unit:7,texture:null,sampler:null,target:gl.TEXTURE_2D_ARRAY},{unit:8,texture:null,sampler:null,target:gl.TEXTURE_2D}]}:{program:gl.getParameter(gl.CURRENT_PROGRAM),vao:gl.getParameter(gl.VERTEX_ARRAY_BINDING),active:gl.getParameter(gl.ACTIVE_TEXTURE),depth:gl.isEnabled(gl.DEPTH_TEST),depthMask:gl.getParameter(gl.DEPTH_WRITEMASK),depthFunc:gl.getParameter(gl.DEPTH_FUNC),blend:gl.isEnabled(gl.BLEND),cull:gl.isEnabled(gl.CULL_FACE),viewport:gl.getParameter(gl.VIEWPORT),textures:[]};
  if(!managedState)for(const unit of [3,4,5,7,8]){gl.activeTexture(gl.TEXTURE0+unit);const target=unit===5?gl.TEXTURE_3D:unit===7?gl.TEXTURE_2D_ARRAY:gl.TEXTURE_2D,binding=unit===5?gl.TEXTURE_BINDING_3D:unit===7?gl.TEXTURE_BINDING_2D_ARRAY:gl.TEXTURE_BINDING_2D;state.textures.push({unit,target,texture:gl.getParameter(binding),sampler:gl.getParameter(gl.SAMPLER_BINDING)});}
  try{
   // Trace in world axes relative to the eye, avoiding large world translations.
   let traceVP=vp,traceEye=Array.from(eye,(v,i)=>v-renderOrigin[i]);if(projection&&basis){const view=basis.view.slice();view[12]=view[13]=view[14]=0;traceVP=V.math.multiply(projection,view);traceEye=[0,0,0];}
   gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,frame.draw);gl.bindFramebuffer(gl.READ_FRAMEBUFFER,frame.read);gl.viewport(0,0,this.width,this.height);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.ALWAYS);gl.depthMask(true);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
   const u=this.program.u;gl.useProgram(this.program.p);gl.bindVertexArray(this.vao);
   gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,this.color);gl.bindSampler(3,null);gl.uniform1i(u.uScene,3);
   gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D,this.depth);gl.bindSampler(4,null);gl.uniform1i(u.uDepth,4);
   gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_3D,this.voxelTexture);gl.bindSampler(5,null);gl.uniform1i(u.uVoxel,5);
   gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D_ARRAY,this.renderer.texture);gl.bindSampler(7,null);gl.uniform1i(u.uFoliage,7);gl.uniform1iv(u['uLeafLayers[0]'],LEAF_LAYERS);gl.uniform1i(u.uSamples,this.samples);
   gl.activeTexture(gl.TEXTURE8);gl.bindTexture(gl.TEXTURE_2D,this.shapeTexture);gl.bindSampler(8,null);gl.uniform1i(u.uShapeBounds,8);
   gl.uniform3fv(u.uGridOrigin,this.voxelOrigin.map((v,i)=>v-(projection&&basis?eye[i]:renderOrigin[i])));
   gl.uniformMatrix4fv(u.uVP,false,traceVP);gl.uniformMatrix4fv(u.uInverseVP,false,inverse4(traceVP));gl.uniform3fv(u.uEye,traceEye);gl.uniform3fv(u.uSun,sun);gl.uniform3fv(u.uForward,forward);gl.uniform2f(u.uSize,this.width,this.height);gl.uniform1f(u.uDay,day);gl.uniform1f(u.uDebug,this.debugMode);gl.uniform3fv(u.uFog,fog);gl.uniform2f(u.uFogRange,fogRange[0],fogRange[1]);gl.uniform1f(u.uUnderwater,underwater?1:0);
   gl.drawArrays(gl.TRIANGLES,0,3);this.resolves++;this.renderer.stats.draws++;return true;
  }finally{
   for(const b of state.textures){gl.activeTexture(gl.TEXTURE0+b.unit);gl.bindTexture(b.target||gl.TEXTURE_2D,b.texture);gl.bindSampler(b.unit,b.sampler);}gl.activeTexture(state.active);
   gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,frame.draw);gl.bindFramebuffer(gl.READ_FRAMEBUFFER,frame.read);gl.viewport(...state.viewport);gl.bindVertexArray(state.vao);gl.useProgram(state.program);gl.depthMask(state.depthMask);gl.depthFunc(state.depthFunc);
   for(const[cap,on]of [[gl.DEPTH_TEST,state.depth],[gl.BLEND,state.blend],[gl.CULL_FACE,state.cull]])if(on)gl.enable(cap);else gl.disable(cap);
  }
 }
 destroy(){const gl=this.gl;if(this.generation===this.renderer.generation&&!gl.isContextLost()){if(this.framebuffer)gl.deleteFramebuffer(this.framebuffer);for(const t of [this.color,this.depth,this.voxelTexture,this.shapeTexture])if(t)gl.deleteTexture(t);if(this.program)gl.deleteProgram(this.program.p);if(this.vao)gl.deleteVertexArray(this.vao);}this.framebuffer=this.color=this.depth=this.program=this.vao=null;this.failedSize='';this.error='';this.active=false;this.bytes=0;this.width=this.height=0;this.shapeTexture=null;this.shapeBytes=0;this.voxelTexture=null;this.voxelBytes=0;this.voxelCache=null;this.voxelData.fill(0);this.voxelOrigin=[0,0,0];this.voxelDirty=true;this.voxelChunks=0;this.voxelOccupied=0;this.voxelFoliage=0;}
 inspect(){return{enabled:this.active,algorithm:'near-field resident world-voxel DDA',quality:this.quality,samples:this.samples,maximumCrossingsPerPixel:STEPS*this.samples,normalReconstruction:this.samples>1?'nine-depth-tap plane consistency':'five-depth-tap nearest camera depth',foliage:'filtered exposed leaf surfaces; shared internal leaf faces skipped',worktable:'thirteen catalog boxes; open gaps transmit solar rays',worktableCode:WORKTABLE_CODE,maximumTableBoxTestsPerCell:13,authoredShapes:{profiles:SHAPE_PROFILES.length,codes:SHAPE_PROFILES.map(p=>({id:p.id,code:p.code,parts:p.boxes.length})),maximumBoxTestsPerCell:12,lookupSize:[SHAPE_TEX_WIDTH,SHAPE_TEX_HEIGHT],format:'RGBA8UI',bytes:this.shapeBytes,allocations:this.shapeAllocations,textureUnit:8,geometry:'exact catalog boxes; open gaps transmit solar rays'},leafSurfaceOpacity:.68,leafTextureLOD:1,sunConeScale:.012,steps:STEPS,maxWorldDistance:RANGE,strength:STRENGTH,size:[this.width,this.height],estimatedTargetBytes:this.bytes,voxelBytes:this.voxelBytes,voxelAllocations:this.voxelAllocations,voxelUploads:this.voxelUploads,voxelBuilds:this.voxelBuilds,gridOrigin:this.voxelOrigin.slice(),gridSize:GRID.slice(),receiverFade:[FADE_START,FADE_END],gridSnap:8,minimumRayMargin:.94,gridChunks:this.voxelChunks,occupiedVoxels:this.voxelOccupied,foliageVoxels:this.voxelFoliage,leafIDs:LEAF_IDS.slice(),worldEpoch:this.voxelCache?.epoch??null,allocations:this.allocations,resolves:this.resolves,wind:this.active&&this.windEnabled,error:this.error,limitations:'Resident opaque cubes, thirteen-box worktables, bounded authored construction boxes and exposed leaf surfaces in a 128x96x128 grid. Natural foliage uses filtered alpha and artistic surface opacity; voxel bounds do not follow animated leaf mesh exactly. Balanced uses one ray; High uses four fixed cone rays and can show finite-sample bands. Eleven-block rays, full receiver strength through40 and fade to48. Unloaded chunks, water, glass and dynamic actors do not cast; no distant fallback, GI, reflected scene rays or RTX API.'};}
}
ScreenSunShadows.windDeclaration=WIND_DECL;ScreenSunShadows.windCode=WIND_CODE;ScreenSunShadows.shaderSources=Object.freeze({vertex:VS,fragment:FS});
V.ScreenSunShadows=ScreenSunShadows;V.sunShadowMath=Object.freeze({inverse4,transform,project,unproject,windPoint,traceCPU,worktableRayHit,shapeRayHit,shapeCodeForBlock:id=>SHAPE_BY_ID.get(id)?.code||0,shapeProfiles:SHAPE_PROFILES,shapeTextureLayout:Object.freeze({width:SHAPE_TEX_WIDTH,height:SHAPE_TEX_HEIGHT,channels:4,bytes:SHAPE_TEXELS.byteLength,format:"RGBA8UI"}),shapeTextureData:()=>Uint8Array.from(SHAPE_TEXELS),worktableCode:WORKTABLE_CODE,worktableBoxes:WORKTABLE_BOXES,softSunDirections,prepareGrid,opaqueLookup,leafIDs:Object.freeze(LEAF_IDS.slice()),leafLayers:Object.freeze(Array.from(LEAF_LAYERS)),gridSize:Object.freeze(GRID.slice()),voxelBytes:VOXEL_BYTES,receiverFade:Object.freeze([FADE_START,FADE_END]),steps:STEPS,range:RANGE});
})();

