/* Successor presentation only. Physical player, rays, saves and World are read-only. */
(() => {
 'use strict'; const V=globalThis.Voxel ||= {};
 const L=Object.freeze({distance:4,cells:512,near:.055,clearance:.025,skin:.002,outwardRate:8,teleport:2,fallbackEnter:.6,fallbackExit:.8});
 const finite=Number.isFinite;
 function rayBox(o,d,lo,hi){let enter=0,exit=1;for(let a=0;a<3;a++){if(Math.abs(d[a])<1e-12){if(o[a]<lo[a]||o[a]>hi[a])return null;continue;}let u=(lo[a]-o[a])/d[a],v=(hi[a]-o[a])/d[a];if(u>v)[u,v]=[v,u];enter=Math.max(enter,u);exit=Math.min(exit,v);if(enter>exit)return null;}return enter>=0&&enter<=1?enter:null;}
 function resolve(input,previous=null){
  const p=input?.physical;if(!p||!Array.isArray(p.eye)||p.eye.length!==3||!p.eye.every(finite)||!finite(p.yaw)||!finite(p.pitch))throw TypeError('Finite physical eye/yaw/pitch required');
  const eye=p.eye.slice(),mode=['first','rear','front'].includes(input.mode)?input.mode:'first';
  const oldValid=previous&&Array.isArray(previous.pivot)&&previous.pivot.length===3&&previous.pivot.every(finite)&&finite(previous.distance);
  const reset=!!input.reset||!oldValid||previous.mode!==mode||previous.epoch!==input.epoch||Math.hypot(...eye.map((x,i)=>x-previous.pivot[i]))>L.teleport;
  const first={eye:eye.slice(),yaw:p.yaw,pitch:p.pitch};let radius=0,cells=0,reads=0,hit=null;
  function out(camera,distance,allowedDistance,virtualDistance,fallbackActive,reason){return{cameraWorld:camera,requestedViewMode:mode,resolvedViewMode:distance>0?mode:'first',distance,allowedDistance,avatarVisible:distance>0,showFirstPersonHand:distance===0,debug:{radius,cells,reads,hit,reason,reset},nextState:{mode,epoch:input.epoch,pivot:eye.slice(),distance:virtualDistance,fallbackActive}};}
  if(mode==='first')return out(first,0,0,0,false,'first-person');
  const projection=input.projection||{},fov=projection.fovDegrees??75,aspect=projection.aspect??16/9,near=projection.near??L.near;
  if(!finite(fov)||fov<30||fov>110||!finite(aspect)||aspect<=0||aspect>4||!finite(near)||near<=0||near>.2)return out(first,0,0,0,true,'unsupported-projection');
  const world=input.world,blocks=input.blocks||V.blocks;if(!world||typeof world.get!=='function'||!blocks)throw TypeError('Read-only World.get and block definitions required');
  const tangent=Math.tan(fov*Math.PI/360);radius=near*Math.sqrt(1+tangent*tangent*(1+aspect*aspect))+L.clearance;
  const desired=finite(input.distance)?Math.max(0,Math.min(L.distance,input.distance)):L.distance;
  const f=[Math.sin(p.yaw)*Math.cos(p.pitch),Math.sin(p.pitch),-Math.cos(p.yaw)*Math.cos(p.pitch)],sign=mode==='rear'?-1:1,delta=f.map(x=>x*sign*desired),end=eye.map((x,i)=>x+delta[i]);
  const lo=eye.map((x,i)=>Math.floor(Math.min(x,end[i])-radius)),hi=eye.map((x,i)=>Math.floor(Math.max(x,end[i])+radius));cells=hi.reduce((n,x,i)=>n*(x-lo[i]+1),1);
  if(cells>L.cells)return out(first,0,0,0,true,'cell-budget');
  let nearest=1;
  for(let y=lo[1];y<=hi[1];y++)for(let z=lo[2];z<=hi[2];z++)for(let x=lo[0];x<=hi[0];x++){
   const id=world.get(x,y,z,true);reads++;if(id===0||(blocks[id]&&blocks[id].solid!==true))continue;
   const t=rayBox(eye,delta,[x-radius,y-radius,z-radius],[x+1+radius,y+1+radius,z+1+radius]);if(t!==null&&t<=nearest){nearest=t;hit={x,y,z,id};}
  }
  const allowed=hit?Math.max(0,nearest*desired-L.skin):desired,dt=finite(input.dt)?Math.max(0,Math.min(.1,input.dt)):0;
  const old=oldValid?Math.max(0,previous.distance):0;
  let d=reset||allowed<=old?allowed:old+(allowed-old)*(-Math.expm1(-L.outwardRate*dt));d=Math.min(allowed,Math.max(0,d));if(allowed-d<1e-6)d=allowed;
  const fallback=allowed<=L.fallbackEnter||(reset?allowed<L.fallbackExit:previous?.fallbackActive&&(allowed<L.fallbackExit||d<L.fallbackExit));
  if(fallback||d<=0)return out(first,0,allowed,d,true,allowed===0?(hit?'pivot-obstructed':'zero-distance'):'near-wall-first-person');
  return out({eye:eye.map((x,i)=>x+f[i]*sign*d),yaw:mode==='front'?p.yaw+Math.PI:p.yaw,pitch:mode==='front'?-p.pitch:p.pitch},d,allowed,d,false,hit?'collision':'clear');
 }
 V.PRESENTATION_CAMERA_LIMITS=L;V.resolvePresentationCamera=resolve;
})();
