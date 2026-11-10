/* Bounded point-light selection. Generated and edited lights share chunk registries. */
(() => {
  'use strict';
  const V=globalThis.Voxel||={};
  // Wall variants use the same flame anchor in every realm and both light pickers.
  const sourcePoint=(cx,cz,index,id,fallbackY)=>{const o=V.blocks[id]?.pointLightOffset||[.5,fallbackY,.5];return[cx*16+index%16+o[0],Math.floor(index/256)+o[1],cz*16+Math.floor(index%256/16)+o[2]];};
  class TorchPicker {
    constructor(){this.cache=null;this.output=[];this.hand=[0,0,0];this.stats={refreshes:0,chunksVisited:0,lightsExamined:0,cached:0};}
    select(world,p,held=false,worldId=null,now=0){
      if(!world?.chunks||!p||![p.x,p.y,p.z].every(Number.isFinite))return [];
      const cell=[Math.floor(p.x),Math.floor(p.y),Math.floor(p.z)],revision=world.lightRevision||0,c=this.cache;
      if(!c||c.world!==world||c.id!==worldId||c.revision!==revision||now<c.time||now-c.time>=250||cell.some((n,i)=>n!==c.cell[i])){
        const best=[];let chunksVisited=0,lightsExamined=0;
        const cx=Math.floor(p.x/16),cz=Math.floor(p.z/16);
        for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){
          const x=cx+dx,z=cz+dz,chunk=world.chunks.get(x+','+z);
          if(!chunk?.data||!chunk.lights?.size)continue;
          chunksVisited++;
          for(const[index,id]of chunk.lights){
            lightsExamined++;
            if(id!==19&&id!==28&&V.blocks[id]?.pointLight!==true)continue;
            const [px,py,pz]=sourcePoint(x,z,index,id,0),ax=px-p.x,ay=py-p.y,az=pz-p.z;
            if(Math.abs(ax)>28||Math.abs(ay)>28||Math.abs(az)>28)continue;
            const d=ax*ax+ay*ay+az*az;
            if(best.length===8&&d>=best[7].d)continue;
            let i=0;while(i<best.length&&best[i].d<=d)i++;
            best.splice(i,0,{d,point:[px,py,pz]});if(best.length>8)best.pop();
          }
        }
        this.cache={world,id:worldId,revision,time:now,cell,points:best.map(x=>x.point)};
        this.stats.refreshes++;this.stats.chunksVisited=chunksVisited;this.stats.lightsExamined=lightsExamined;this.stats.cached=best.length;
      }
      this.output.length=0;
      if(held){this.hand[0]=p.x;this.hand[1]=p.y+1;this.hand[2]=p.z;this.output.push(this.hand);}
      const points=this.cache.points;
      for(let i=0;i<points.length&&this.output.length<8;i++)this.output.push(points[i]);
      return this.output;
    }
  }

  /* A terrain chunk owns a stable set of lights. Camera motion never changes it.
   * Sources only within the nine-block influence radius can enter; entries are
   * cached by world/light revisions. The same selection shades local entities. */
  class ChunkLightPicker {
    constructor(){this.cache=new WeakMap();this.limit=16;this.radius=9;this.empty={data:new Float32Array(64),count:0};this.stats={refreshes:0,hits:0,chunksVisited:0,lightsExamined:0,maxSelected:0};}
    packOrigin(row,origin=[0,0,0]){
      if(!row.absoluteData)return row;
      if(!origin||origin.length!==3||![origin[0],origin[1],origin[2]].every(Number.isFinite))throw new TypeError('Point-light render origin must be finite.');
      const prior=row.renderOrigin;
      if(prior&&prior.every((v,i)=>v===origin[i]))return row;
      row.data.fill(0);
      for(let i=0;i<row.count;i++){const k=i*4;row.data[k]=row.absoluteData[k]-origin[0];row.data[k+1]=row.absoluteData[k+1]-origin[1];row.data[k+2]=row.absoluteData[k+2]-origin[2];row.data[k+3]=row.absoluteData[k+3];}
      row.renderOrigin=Array.from(origin);this.stats.originPacks=(this.stats.originPacks||0)+1;return row;
    }
    selectInferno(world,chunk,extras,extraRevision,origin=[0,0,0]){
      if(!world?.chunks||!chunk||!Number.isInteger(chunk.cx)||!Number.isInteger(chunk.cz))return this.empty;
      const revision=world.lightRevision||0,old=this.cache.get(chunk);
      if(old&&old.world===world&&old.dimension==='inferno'&&old.revision===revision&&old.extraRevision===extraRevision){this.stats.hits++;return this.packOrigin(old,origin);}
      const x0=chunk.cx*16,z0=chunk.cz*16,x1=x0+16,z1=z0+16,groups=new Map();
      // This anchor is generated ground, not camera/player position. Light
      // selection therefore remains stable while the user walks or looks.
      const floor=V.realm?.floorHeight?.(world.seed,x0+8,z0+8),anchorY=Number.isFinite(floor)?floor+1.7:35.7;
      const consider=(x,y,z,type,strength)=>{
        if(![x,y,z,strength].every(Number.isFinite))return;
        const dx=Math.max(x0-x,0,x-x1),dy=Math.max(-y,0,y-96),dz=Math.max(z0-z,0,z-z1),d=dx*dx+dy*dy+dz*dz;
        if(d>=81)return;
        const clustered=type===70||type===72,gx=Math.floor(x/4),gy=Math.floor(y/4),gz=Math.floor(z/4);
        const key=clustered?type+':'+gx+','+gy+','+gz:type+':'+x+','+y+','+z;
        const center=(x-(x0+8))**2+(z-(z0+8))**2+.35*(y-anchorY)**2;
        const representative=clustered?(x-(gx*4+2))**2+(y-(gy*4+2))**2+(z-(gz*4+2))**2:0;
        const row={key,x,y,z,type,strength,d,center,representative},prior=groups.get(key);
        if(!prior||representative<prior.representative||(representative===prior.representative&&(x<prior.x||(x===prior.x&&(y<prior.y||(y===prior.y&&z<prior.z))))))groups.set(key,row);
      };
      for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
        const cx=chunk.cx+dx,cz=chunk.cz+dz,c=world.chunks.get(cx+','+cz);
        if(!c?.data||!c.lights?.size)continue;this.stats.chunksVisited++;
        for(const[index,id]of c.lights){this.stats.lightsExamined++;if(![19,28,69,70,72].includes(id)&&V.blocks[id]?.pointLight!==true)continue;
          consider(...sourcePoint(cx,cz,index,id,.7),id,id===69?1.1:id===70?1.2:id===72?-.9:1);
        }
      }
      for(const point of extras||[]){if(!Array.isArray(point)||point.length<3)continue;this.stats.lightsExamined++;consider(point[0],point[1],point[2],19,1);}
      const ordered=[...groups.values()].sort((a,b)=>a.d-b.d||a.center-b.center||a.x-b.x||a.y-b.y||a.z-b.z||a.type-b.type),best=[],used=new Set();
      const append=row=>{if(best.length>=this.limit||used.has(row.key))return;best.push(row);used.add(row.key);};
      // Small quotas prevent roof clusters or a many-cell portal from using
      // every slot; remaining slots still take the nearest stable candidates.
      for(const[type,limit]of [[69,4],[72,2],[19,2],[70,4]]){let n=0;for(const row of ordered)if(row.type===type||(type===19&&(row.type===28||V.blocks[row.type]?.pointLight===true))){append(row);if(++n>=limit)break;}}
      for(const row of ordered)append(row);
      const data=old?.data||new Float32Array(64),absoluteData=old?.absoluteData||new Float64Array(64);absoluteData.fill(0);
      for(let i=0;i<best.length;i++)absoluteData.set([best[i].x,best[i].y,best[i].z,best[i].strength],i*4);
      const row={world,dimension:'inferno',revision,extraRevision,data,absoluteData,renderOrigin:null,count:best.length};this.cache.set(chunk,row);this.stats.refreshes++;this.stats.maxSelected=Math.max(this.stats.maxSelected,best.length);return this.packOrigin(row,origin);
    }
    selectSky(world,chunk,extras,extraRevision,origin=[0,0,0]){
      if(!world?.chunks||!chunk||!Number.isInteger(chunk.cx)||!Number.isInteger(chunk.cz))return this.empty;
      const revision=world.lightRevision||0,old=this.cache.get(chunk);
      if(old&&old.world===world&&old.dimension==='sky'&&old.revision===revision&&old.extraRevision===extraRevision){this.stats.hits++;return this.packOrigin(old,origin);}
      const x0=chunk.cx*16,z0=chunk.cz*16,x1=x0+16,z1=z0+16,groups=new Map();
      // This anchor is generated ground, not camera/player position. Light
      // selection therefore remains stable while the user walks or looks.
      const floor=V.sky?.floorHeight?.(world.seed,x0+8,z0+8),anchorY=Number.isFinite(floor)?floor+1.7:57.7;
      const consider=(x,y,z,type,strength)=>{
        if(![x,y,z,strength].every(Number.isFinite))return;
        const dx=Math.max(x0-x,0,x-x1),dy=Math.max(-y,0,y-96),dz=Math.max(z0-z,0,z-z1),d=dx*dx+dy*dy+dz*dz;
        if(d>=81)return;
        const clustered=type===76||type===78,gx=Math.floor(x/4),gy=Math.floor(y/4),gz=Math.floor(z/4);
        const key=clustered?type+':'+gx+','+gy+','+gz:type+':'+x+','+y+','+z;
        const center=(x-(x0+8))**2+(z-(z0+8))**2+.35*(y-anchorY)**2;
        const representative=clustered?(x-(gx*4+2))**2+(y-(gy*4+2))**2+(z-(gz*4+2))**2:0;
        const row={key,x,y,z,type,strength,d,center,representative},prior=groups.get(key);
        if(!prior||representative<prior.representative||(representative===prior.representative&&(x<prior.x||(x===prior.x&&(y<prior.y||(y===prior.y&&z<prior.z))))))groups.set(key,row);
      };
      for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
        const cx=chunk.cx+dx,cz=chunk.cz+dz,c=world.chunks.get(cx+','+cz);
        if(!c?.data||!c.lights?.size)continue;this.stats.chunksVisited++;
        for(const[index,id]of c.lights){this.stats.lightsExamined++;if(![19,28,76,78].includes(id)&&V.blocks[id]?.pointLight!==true)continue;
          consider(...sourcePoint(cx,cz,index,id,.7),id,id===76?1.16:id===78?-1.12:1);
        }
      }
      for(const point of extras||[]){if(!Array.isArray(point)||point.length<3)continue;this.stats.lightsExamined++;consider(point[0],point[1],point[2],19,1);}
      const ordered=[...groups.values()].sort((a,b)=>a.d-b.d||a.center-b.center||a.x-b.x||a.y-b.y||a.z-b.z||a.type-b.type),best=[],used=new Set();
      const append=row=>{if(best.length>=this.limit||used.has(row.key))return;best.push(row);used.add(row.key);};
      // Small quotas prevent roof clusters or a many-cell portal from using
      // every slot; remaining slots still take the nearest stable candidates.
      for(const[type,limit]of [[78,2],[19,2],[76,4]]){let n=0;for(const row of ordered)if(row.type===type||(type===19&&(row.type===28||V.blocks[row.type]?.pointLight===true))){append(row);if(++n>=limit)break;}}
      for(const row of ordered)append(row);
      const data=old?.data||new Float32Array(64),absoluteData=old?.absoluteData||new Float64Array(64);absoluteData.fill(0);
      for(let i=0;i<best.length;i++)absoluteData.set([best[i].x,best[i].y,best[i].z,best[i].strength],i*4);
      const row={world,dimension:'sky',revision,extraRevision,data,absoluteData,renderOrigin:null,count:best.length};this.cache.set(chunk,row);this.stats.refreshes++;this.stats.maxSelected=Math.max(this.stats.maxSelected,best.length);return this.packOrigin(row,origin);
    }
    select(world,chunk,extras=[],extraRevision=0,origin=[0,0,0]){
      if(world?.dimension==='sky')return this.selectSky(world,chunk,extras,extraRevision,origin);
      if(world?.dimension==='inferno')return this.selectInferno(world,chunk,extras,extraRevision,origin);
      if(!world?.chunks||!chunk||!Number.isInteger(chunk.cx)||!Number.isInteger(chunk.cz))return this.empty;
      const revision=world.lightRevision||0,old=this.cache.get(chunk);
      if(old&&old.world===world&&old.dimension!=='inferno'&&old.dimension!=='sky'&&old.revision===revision&&old.extraRevision===extraRevision){this.stats.hits++;return this.packOrigin(old,origin);}
      const x0=chunk.cx*16,z0=chunk.cz*16,x1=x0+16,z1=z0+16,best=[];
      const consider=(x,y,z,strength=1)=>{
        if(![x,y,z].every(Number.isFinite))return;
        const dx=Math.max(x0-x,0,x-x1),dy=Math.max(-y,0,y-96),dz=Math.max(z0-z,0,z-z1),d=dx*dx+dy*dy+dz*dz;
        if(d>=81)return;
        const center=(x-(x0+8))**2+(z-(z0+8))**2,row={x,y,z,d,center,strength};
        let i=0;
        while(i<best.length){const a=best[i];if(d<a.d||(d===a.d&&(center<a.center||(center===a.center&&(x<a.x||(x===a.x&&(y<a.y||(y===a.y&&z<a.z))))))))break;i++;}
        if(i>=this.limit)return;best.splice(i,0,row);if(best.length>this.limit)best.pop();
      };
      for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
        const cx=chunk.cx+dx,cz=chunk.cz+dz,c=world.chunks.get(cx+','+cz);
        if(!c?.data||!c.lights?.size)continue;this.stats.chunksVisited++;
        for(const[index,id]of c.lights){this.stats.lightsExamined++;if(id!==19&&id!==28&&V.blocks[id]?.pointLight!==true&&!(world.dimension==='inferno'&&(id===69||id===70||id===72)))continue;
          consider(...sourcePoint(cx,cz,index,id,.7),id===69?1.1:id===70?1.2:id===72?-.9:1);
        }
      }
      for(const point of extras||[]){if(!Array.isArray(point)||point.length<3)continue;this.stats.lightsExamined++;consider(point[0],point[1],point[2]);}
      const data=old?.data||new Float32Array(64),absoluteData=old?.absoluteData||new Float64Array(64);absoluteData.fill(0);
      for(let i=0;i<best.length;i++)absoluteData.set([best[i].x,best[i].y,best[i].z,best[i].strength],i*4);
      const row={world,revision,extraRevision,data,absoluteData,renderOrigin:null,count:best.length};this.cache.set(chunk,row);this.stats.refreshes++;this.stats.maxSelected=Math.max(this.stats.maxSelected,best.length);return this.packOrigin(row,origin);
    }
  }
  V.ChunkLightPicker=ChunkLightPicker;

  V.TorchPicker=TorchPicker;
})();
