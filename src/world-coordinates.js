/* MảiMêRáp — explicit finite coordinate profiles. CPU authority stays absolute. */
(() => {
 'use strict';const V=globalThis.Voxel||={};
 V.createCoordinatePolicy=function createCoordinatePolicy(){
  const LEGACY='legacy-v4',WIDE='wide-v1',GENERATION='rc7-v1';
  const SIZE=16,HEIGHT=96,MAX_RADIUS=9,GEN_CHUNK_LIMIT=Math.ceil(30000000/SIZE)+MAX_RADIUS+3;
  const profiles=Object.freeze(Object.fromEntries([[LEGACY,100000],[WIDE,30000000]].map(([id,blockLimit])=>[id,Object.freeze({id,blockLimit,editChunkLimit:Math.floor(blockLimit/SIZE),movementLimit:blockLimit-10,respawnLimit:blockLimit-10.5,eggLimit:blockLimit-2})])));
  function get(id=LEGACY){if(typeof id!=='string'||!Object.hasOwn(profiles,id))throw new TypeError('Unsupported coordinate profile');return profiles[id];}
  function forWorld(world){return get(world?.coordinateProfile??LEGACY);}
  function fromSave(s){
   if(!s||typeof s!=='object'||Array.isArray(s)||![1,2,3,4,5,6].includes(s.version))throw new TypeError('Unsupported saved world version');
   if(s.version>=5){if(s.coordinateProfile!==WIDE||s.generationProfile!==GENERATION)throw new TypeError('Invalid wide-world coordinate or generation profile');return profiles[WIDE];}
   if(Object.hasOwn(s,'coordinateProfile')||Object.hasOwn(s,'generationProfile'))throw new TypeError('Legacy save contains a new coordinate profile');
   return profiles[LEGACY];
  }
  const validGenerationChunk=(cx,cz)=>Number.isSafeInteger(cx)&&Number.isSafeInteger(cz)&&Math.abs(cx)<=GEN_CHUNK_LIMIT&&Math.abs(cz)<=GEN_CHUNK_LIMIT;
  const SAMPLE_LIMIT=(GEN_CHUNK_LIMIT+1)*SIZE-1;
  const validGenerationSample=(x,z)=>Number.isSafeInteger(x)&&Number.isSafeInteger(z)&&Math.abs(x)<=SAMPLE_LIMIT&&Math.abs(z)<=SAMPLE_LIMIT;
  const validHorizontal=(x,z,id=LEGACY,margin=0)=>{const limit=get(id).blockLimit-margin;return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<=limit&&Math.abs(z)<=limit;};
  const validBlock=(x,y,z,id=LEGACY,minY=0,maxY=HEIGHT-1)=>Number.isSafeInteger(x)&&Number.isSafeInteger(y)&&Number.isSafeInteger(z)&&y>=minY&&y<=maxY&&validHorizontal(x,z,id);
  const validEditChunk=(cx,cz,id=LEGACY)=>{const limit=get(id).editChunkLimit;return Number.isSafeInteger(cx)&&Number.isSafeInteger(cz)&&Math.abs(cx)<=limit&&Math.abs(cz)<=limit;};
  const blockToChunk=n=>Math.floor(n/SIZE),blockToLocal=n=>((n%SIZE)+SIZE)%SIZE;
  const metadata=world=>forWorld(world).id===WIDE?{version:world.importedWorld?6:5,coordinateProfile:WIDE,generationProfile:GENERATION}:{version:4};
  return Object.freeze({LEGACY,WIDE,GENERATION,SIZE,HEIGHT,MAX_RADIUS,GEN_CHUNK_LIMIT,SAMPLE_LIMIT,profiles,get,forWorld,fromSave,validGenerationChunk,validGenerationSample,validHorizontal,validBlock,validEditChunk,blockToChunk,blockToLocal,metadata});
 };
 V.coordinates=V.createCoordinatePolicy();V.COORDINATE_SOURCE=V.createCoordinatePolicy.toString();
})();
