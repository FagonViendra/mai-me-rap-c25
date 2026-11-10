/* Render coordinates stay local; simulation and saved positions stay absolute. */
(() => {
  'use strict';
  const V=globalThis.Voxel||={},SNAP=256,TAU=Math.PI*2,ZERO=Object.freeze([0,0,0]);
  function point(value,label){
    if(!value||value.length!==3||![value[0],value[1],value[2]].every(Number.isFinite))throw new TypeError(label+' needs three finite coordinates.');
    return value;
  }
  function choose(physicalEye){
    const p=point(physicalEye,'Physical eye'),x=Math.floor(p[0]/SNAP)*SNAP,z=Math.floor(p[2]/SNAP)*SNAP;
    if(!Number.isSafeInteger(x)||!Number.isSafeInteger(z))throw new RangeError('Render origin exceeds exact integer coordinates.');
    return [x,0,z];
  }
  function relative(position,origin=ZERO,out=[]){
    const p=point(position,'Position'),o=point(origin,'Render origin');
    for(let i=0;i<3;i++)out[i]=p[i]-o[i];
    return out;
  }
  function wind(origin){
    const o=point(origin,'Render origin'),phase=o[0]*.73+o[2]*.51+o[1]*.21;
    return [phase%TAU,(phase*.87)%TAU];
  }
  function clouds(absoluteEye,clock){
    const e=point(absoluteEye,'Cloud eye');if(!Number.isFinite(clock))throw new TypeError('Cloud clock must be finite.');
    const p=[(e[0]+clock*.55)/26,e[2]/26],cell=p.map(Math.floor),fraction=p.map((v,i)=>v-cell[i]);
    const octave=cell.map(v=>v*.33+14),octaveCell=octave.map(Math.floor),octaveFraction=octave.map((v,i)=>v-octaveCell[i]);
    if([...cell,...octaveCell].some(v=>v < -2147483648||v>2147483647))throw new RangeError('Cloud coordinates exceed shader integer range.');
    return {cell,fraction,octaveCell,octaveFraction};
  }
  V.RenderOrigin=Object.freeze({snap:SNAP,zero:ZERO,choose,relative,wind,clouds});
})();
