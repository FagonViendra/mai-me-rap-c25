/* MảiMêRáp — deterministic floating islands of Thiên Giới. */
(() => {
 'use strict';const V=globalThis.Voxel||={};
 V.createSkyGenerator=function createSkyGenerator(core){
  if(!core?.hashSeed||!core.treeShape)throw new TypeError('Voxel core required');
  const SIZE=16,HEIGHT=96,GRID=64,ids=Object.freeze({air:0,stone:73,grass:74,glass:75,crystal:76,frame:77,portal:78});
  const arrival=Object.freeze([8.5,57.01,8.5]);
  const portal=Object.freeze({id:'sky-return',axis:'z',plane:4,opening:Object.freeze({minX:7,maxX:9,minY:57,maxY:60,z:4}),frame:Object.freeze({minX:6,maxX:10,minY:56,maxY:61,z:4}),center:Object.freeze([8.5,59,4.5]),arrival});
  const info=Object.freeze({id:'sky',name:'Thiên Giới',version:1,height:HEIGHT,arrival,portal,voidBelow:true,islandGrid:GRID,arrivalFloorY:56});
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function hash(seed,x,z){let h=seed^Math.imul(x|0,0x632be5ab)^Math.imul(z|0,0x85157af5);h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);return(h^(h>>>16))>>>0;}
  function noise(seed,x,z){const ix=Math.floor(x),iz=Math.floor(z),a=x-ix,b=z-iz,u=a*a*(3-2*a),v=b*b*(3-2*b),h=(x,z)=>hash(seed,x,z)/2147483647.5-1;return(h(ix,iz)*(1-u)+h(ix+1,iz)*u)*(1-v)+(h(ix,iz+1)*(1-u)+h(ix+1,iz+1)*u)*v;}
  function island(seed,gx,gz){
   const h=hash(seed+6151,gx,gz),central=gx===0&&gz===0;
   return {gx,gz,h,central,x:central?8:gx*GRID+8+(h>>>3)%15-7,z:central?8:gz*GRID+8+(h>>>11)%15-7,rx:central?28:16+(h>>>19)%8,rz:central?27:16+(h>>>24)%8,top:central?56:50+(h>>>7)%19};
  }
  function profile(seed,s,x,z){
   const dx=(x-s.x)/s.rx,dz=(z-s.z)/s.rz,r=Math.hypot(dx,dz),edge=1+noise(seed+7933,x/9,z/9)*.055;
   if(r>edge)return null;
   let top=s.top+Math.round(noise(seed+9059,x/12,z/12)*1.5)-Math.floor(Math.max(0,r-.65)*8);
   if(s.central&&Math.hypot(x-8,z-8)<=14)top=56;
   const thickness=4+Math.floor(Math.max(0,1-r*r)*18)+Math.floor((noise(seed+10133,x/7,z/7)+1)*1.5);
   return {top,bottom:Math.max(18,top-thickness),island:s};
  }
  function column(seed,x,z){
   const gx=Math.floor((x-8)/GRID),gz=Math.floor((z-8)/GRID);let best=null;
   for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const p=profile(seed,island(seed,gx+dx,gz+dz),x,z);if(p&&(!best||p.top>best.top))best=p;}
   return best;
  }
  const featureCache=new Map();
  function features(seed,gx,gz){
   const key=seed+':'+gx+','+gz;if(featureCache.has(key))return featureCache.get(key);
   const s=island(seed,gx,gz),cells=new Map(),add=(x,y,z,id)=>{if(y>=0&&y<HEIGHT)cells.set(x+','+y+','+z,{x,y,z,id});};
   const top=(x,z)=>profile(seed,s,x,z)?.top;
   const tree=(x,z)=>{const y=top(x,z);if(!Number.isInteger(y))return;for(const c of core.treeShape(seed,{x,y:y+1,z,id:54}))add(c.x,c.y,c.z,c.id);};
   const crystal=(x,z)=>{const y=top(x,z);if(!Number.isInteger(y))return;add(x,y+1,z,ids.crystal);add(x,y+2,z,ids.crystal);};
   const arch=(cx,cz)=>{
    for(let dx=-6;dx<=6;dx++){const x=cx+dx,bottom=top(x,cz);if(!Number.isInteger(bottom))continue;const roof=s.top+7+Math.round(2*(1-(dx/6)**2));
     for(let y=Math.abs(dx)>=5?bottom+1:roof;y<=roof+1;y++)add(x,y,cz,ids.stone);
     if(dx===0)add(x,roof+2,cz,ids.crystal);
    }
   };
   if(s.central){
    tree(-6,12);tree(14,-9);crystal(-5,0);crystal(22,-3);arch(20,20);
    for(const [x,z]of [[-2,19],[0,20],[17,-13],[23,12]]){const y=top(x,z);if(Number.isInteger(y))add(x,y+1,z,22);}
    for(const x of [16,24]){const y=top(x,18);if(Number.isInteger(y)){add(x,y+1,18,ids.glass);add(x,y+2,18,ids.crystal);}}
    for(let y=56;y<=61;y++)for(let x=6;x<=10;x++)add(x,y,4,x===6||x===10||y===56||y===61?ids.frame:ids.portal);
   }else{
    if(s.h%2===0)tree(s.x,s.z);crystal(s.x+5,s.z+4);
    if(s.h%5===0)arch(s.x,s.z-7);
   }
   const result=[...cells.values()];if(featureCache.size>=128)featureCache.clear();featureCache.set(key,result);return result;
  }
  function eachFeature(seed,minX,maxX,minZ,maxZ,fn){
   const ax=Math.floor((minX-8)/GRID),bx=Math.floor((maxX-8)/GRID),az=Math.floor((minZ-8)/GRID),bz=Math.floor((maxZ-8)/GRID);
   for(let gz=az-1;gz<=bz+1;gz++)for(let gx=ax-1;gx<=bx+1;gx++)for(const c of features(seed,gx,gz))if(c.x>=minX&&c.x<=maxX&&c.z>=minZ&&c.z<=maxZ)fn(c);
  }
  function generate(seedInput,cx,cz){
   if(!core.coordinates.validGenerationChunk(cx,cz))throw new RangeError('Sky chunks must be bounded integers');
   const seed=core.hashSeed(seedInput),data=new Uint8Array(SIZE*SIZE*HEIGHT),wx=cx*SIZE,wz=cz*SIZE;
   for(let z=0;z<SIZE;z++)for(let x=0;x<SIZE;x++){const p=column(seed,wx+x,wz+z);if(p)for(let y=p.bottom;y<=p.top;y++)data[x+SIZE*(z+SIZE*y)]=y===p.top?ids.grass:ids.stone;}
   eachFeature(seed,wx,wx+15,wz,wz+15,c=>{data[c.x-wx+SIZE*(c.z-wz+SIZE*c.y)]=c.id;});return data;
  }
  function sample(seedInput,x,y,z){
   if(!Number.isSafeInteger(y)||!core.coordinates.validGenerationSample(x,z))throw new RangeError('Sky coordinates must be bounded integers');
   if(y<0||y>=HEIGHT)return ids.air;const seed=core.hashSeed(seedInput),p=column(seed,x,z);let id=p&&y>=p.bottom&&y<=p.top?(y===p.top?ids.grass:ids.stone):ids.air;
   eachFeature(seed,x,x,z,z,c=>{if(c.y===y)id=c.id;});return id;
  }
  return Object.freeze({generate,sample,info,arrival,portal,ids,SIZE,HEIGHT,GRID});
 };
 V.sky=V.createSkyGenerator(V.core);V.SKY_SOURCE=V.createSkyGenerator.toString();
 V.realmInfo=Object.freeze({...V.realmInfo,sky:V.sky.info});
 const previousGenerate=V.generateChunk;
 V.generateChunk=function generateChunk(seed,cx,cz,vegetationVersion=3,dimension='overworld',coordinateProfile=V.coordinates.LEGACY){V.coordinates.get(coordinateProfile);return dimension==='sky'?V.sky.generate(seed,cx,cz):previousGenerate(seed,cx,cz,vegetationVersion,dimension,coordinateProfile);};
})();
