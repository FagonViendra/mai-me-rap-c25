/* Small first-person camera motion. Physical position, aim, collision and saves stay read-only. */
(() => {
 'use strict';
 const V=globalThis.Voxel ||= {};
 const TAU=Math.PI*2;
 const limits=Object.freeze({vertical:.04,lateralRatio:.34,maxStep:2,walkPhasePerBlock:1.45,mountedPhasePerBlock:1.10});
 const finite=Number.isFinite;
 const triple=a=>Array.isArray(a)&&a.length===3&&a.every(finite);
 function apply(input,previous=null){
  const source=input?.camera,position=input?.position;
  if(!source||!triple(source.eye)||!finite(source.yaw)||!finite(source.pitch)||!triple(position))throw TypeError('Finite camera and physical position required');
  const camera={...source,eye:source.eye.slice()},dt=finite(input.dt)?Math.max(0,Math.min(.1,input.dt)):0,mounted=!!input.mounted;
  const valid=previous&&triple(previous.position)&&finite(previous.phase)&&finite(previous.amplitude);
  const old=valid?previous:null;
  const distance=old?Math.hypot(position[0]-old.position[0],position[2]-old.position[2]):0;
  const displacement=old?Math.hypot(...position.map((v,i)=>v-old.position[i])):0;
  const next={position:position.slice(),epoch:input.epoch,mounted,phase:old?.phase||0,amplitude:old?.amplitude||0};
  const finish=(reason,offset=[0,0,0])=>({camera,nextState:next,debug:{reason,offset:offset.slice(),distance,speed:dt>0?distance/dt:0,phase:next.phase,amplitude:next.amplitude}});
  let reason=null;
  if(!input.enabled)reason='off';
  else if(input.mode!=='first')reason='third-person';
  else if(!input.active)reason='paused';
  else if(input.flying||input.underwater||!input.grounded)reason='air-or-water';
  else if(!old||old.epoch!==input.epoch||old.mounted!==mounted||displacement>limits.maxStep)reason='reset';
  else if(dt<=0)reason='no-time';
  if(reason){next.phase=0;next.amplitude=0;return finish(reason);}
  const speed=distance/dt,moving=distance>1e-6&&speed>.025;
  if(moving)next.phase=(next.phase+distance*(mounted?limits.mountedPhasePerBlock:limits.walkPhasePerBlock))%TAU;
  const strength=moving?Math.max(0,Math.min(1.25,speed/4.3)):0;
  const target=Math.min(limits.vertical,.032*strength)*(mounted?.65:input.crouching?.60:1);
  next.amplitude+=(target-next.amplitude)*(-Math.expm1(-(moving?10:16)*dt));
  if(next.amplitude<1e-6)next.amplitude=0;
  next.amplitude=Math.max(0,Math.min(limits.vertical,next.amplitude));
  const side=Math.sin(next.phase)*next.amplitude*limits.lateralRatio;
  const vertical=(Math.sin(next.phase*2)*.78+Math.sin(next.phase*4)*.16)*next.amplitude;
  const offset=[Math.cos(source.yaw)*side,vertical,Math.sin(source.yaw)*side];
  for(let i=0;i<3;i++)camera.eye[i]+=offset[i];
  return finish(moving?'moving':'settling',offset);
 }
 V.cameraMotion=Object.freeze({apply,limits});
})();
