/* MảiMêRáp — original, dependency-free voxel meshing. */
(() => {
  const V = globalThis.Voxel ||= {};
  V.createMesher = function createMesher(blocks) {
    const S=16, H=96, P=18, PH=98;
    // Count only explicit detailed shapes. Ordinary terrain and crossed plants
    // keep their existing meshing behavior. This closure is serialized to workers.
    const SHAPE_QUAD_LIMIT=32768;
    const costOf=id=>{const d=blocks[id];return !d?0:d.shape==='worktable'?d.tableBoxes.length*6:d.shape==='boxes'?d.boxes.length*6:d.shape==='torch'?24+(d.wallTorchFacing?12:0):0;};
    function rejectComplexity(count){
      const error=new Error('Vùng này vượt giới hạn hình khối chi tiết ('+count+'/'+SHAPE_QUAD_LIMIT+' mặt).');
      error.name='VoxelGeometryBudgetError';error.code='VOXEL_GEOMETRY_BUDGET';error.count=error.actual=count;error.limit=SHAPE_QUAD_LIMIT;throw error;
    }
    function countData(data){if(!data||data.length!==S*S*H)throw TypeError('Geometry budget requires one complete chunk');let count=0;for(let i=0;i<data.length;i++)count+=costOf(data[i]);return count;}
    function assertData(data){const count=countData(data);if(count>SHAPE_QUAD_LIMIT)rejectComplexity(count);return count;}
    function inspectHalo(halo){
      if(!halo||halo.length!==P*P*PH)throw TypeError('Geometry budget requires one complete halo');
      let quads=0;for(let y=0;y<H;y++)for(let z=0;z<S;z++)for(let x=0;x<S;x++)quads+=costOf(halo[(x+1)+P*((z+1)+P*(y+1))]);
      return{ok:quads<=SHAPE_QUAD_LIMIT,quads,limit:SHAPE_QUAD_LIMIT};
    }
    const policy=Object.freeze({limit:SHAPE_QUAD_LIMIT,costOf,cost:costOf,countData,assertData,inspectHalo});
    const at=(a,x,y,z)=>a[(x+1)+P*((z+1)+P*(y+1))]||0;
    const opaque=id=>!!(blocks[id]&&blocks[id].opaque);
    function build(halo) {
      const budget=inspectHalo(halo);if(!budget.ok)rejectComplexity(budget.quads);
      const buckets=[{v:[],i:[]},{v:[],i:[]}];
      let quads=0,visibleFaces=0,minY=H,maxY=0,heightLimit=1;
      const tops=new Int16Array(P*P); tops.fill(-1);
      for(let z=-1;z<=S;z++)for(let x=-1;x<=S;x++) {
        for(let y=H-1;y>=0;y--){const id=at(halo,x,y,z);if(id&&x>=0&&x<S&&z>=0&&z<S)heightLimit=Math.max(heightLimit,y+1);if(opaque(id)){tops[x+1+P*(z+1)]=y;break;}}
      }
      // Every face/AO/plant sample stays inside the existing one-cell halo.
      const sky=(x,y,z)=> y>=tops[x+1+P*(z+1)] ? 1 : .25;
      const pos=[0,0,0], q=[0,0,0], a=[0,0,0], b=[0,0,0], c=[0,0,0];
      function quad(points,uvs,id,face,light,ao,sign=1,kind=0,backface=false,tileOverride=null) {
        const def=blocks[id], target=buckets[def.render==='water'||def.render==='glass'?1:0];
        const base=target.v.length/14;
        for(let n=0;n<4;n++) {
          const p=points[n]; minY=Math.min(minY,p[1]); maxY=Math.max(maxY,p[1]);
          target.v.push(p[0],p[1],p[2],uvs[n][0],uvs[n][1],tileOverride??def.tiles[face],Array.isArray(light)?light[n]:light,ao[n],face,def.emissive||0,kind,1,1,1);
        }
        const flip=ao[0]+ao[2]>ao[1]+ao[3];
        let inds=flip?[0,1,3,1,2,3]:[0,1,2,0,2,3];
        if(sign<0)inds=[inds[0],inds[2],inds[1],inds[3],inds[5],inds[4]];
        for(const n of inds)target.i.push(base+n);
        quads++;
        if(backface){
          // The reverse side uses the same position, UV, lighting and material.
          for(let n=0;n<6;n+=3)target.i.push(base+inds[n],base+inds[n+2],base+inds[n+1]);
          quads++;
        }
      }
      function isVisible(id,neighbor) {
        if(!id)return false;
        const d=blocks[id]; if(!d||d.render==='cross'||d.shape==='torch'||d.shape==='worktable'||d.shape==='boxes')return false;
        if(opaque(neighbor))return false;
        // Leaf species share one outer canopy; omit both coincident interior faces.
        if(d.leaf && blocks[neighbor]?.leaf)return false;
        if(neighbor===id && (d.render==='water'||d.render==='glass'||d.render==='cutout'))return false;
        if(d.render==='water'&&blocks[neighbor]?.render==='glass')return false;
        return true;
      }
      for(let axis=0;axis<3;axis++) {
        const u=(axis+1)%3,v=(axis+2)%3;
        const dims=[S,heightLimit,S], w=dims[u], h=dims[v];
        const mask=new Int32Array(w*h), aos=new Uint8Array(w*h*4), lights=new Uint16Array(w*h);
        for(const sign of [1,-1])for(let d=0;d<dims[axis];d++) {
          mask.fill(0); const face=axis*2+(sign<0?1:0);
          for(let j=0;j<h;j++)for(let i=0;i<w;i++) {
            pos[axis]=d;pos[u]=i;pos[v]=j;
            const id=at(halo,...pos);if(!id)continue;q[0]=pos[0];q[1]=pos[1];q[2]=pos[2];q[axis]+=sign;
            if(!isVisible(id,at(halo,...q)))continue;
            const k=i+w*j; const def=blocks[id];
            const qClear=sky(q[0],q[1],q[2])===1?1:0;let aoBits=0,skyBits=0;
            for(let n=0;n<4;n++) {
              const su=(n===0||n===3)?-1:1,sv=n<2?-1:1;
              a[0]=b[0]=c[0]=q[0];a[1]=b[1]=c[1]=q[1];a[2]=b[2]=c[2]=q[2];
              a[u]+=su;b[v]+=sv;c[u]+=su;c[v]+=sv;
              const s1=opaque(at(halo,...a))?1:0,s2=opaque(at(halo,...b))?1:0,corner=opaque(at(halo,...c))?1:0;
              const ao=def.render==='water'||def.render==='glass'?3:(s1&&s2?0:3-s1-s2-corner);
              aos[k*4+n]=ao;aoBits|=ao<<(n*2);
              // Average the four existing air-column samples at this corner.
              // q/a/b/c fit the same one-cell halo as AO, including chunk seams.
              const clear=def.emissive?4:qClear+(sky(a[0],a[1],a[2])===1?1:0)+(sky(b[0],b[1],b[2])===1?1:0)+(sky(c[0],c[1],c[2])===1?1:0);
              skyBits|=clear<<(n*3);
            }
            lights[k]=skyBits;mask[k]=id|(skyBits<<9)|(aoBits<<21);visibleFaces++;
          }
          for(let j=0;j<h;j++)for(let i=0;i<w;) {
            const k=i+w*j,key=mask[k];if(!key){i++;continue;}
            const id=key&511, ao=[aos[k*4],aos[k*4+1],aos[k*4+2],aos[k*4+3]];
            const clear=[lights[k]&7,(lights[k]>>3)&7,(lights[k]>>6)&7,(lights[k]>>9)&7];
            const flat=ao.every(x=>x===ao[0])&&clear.every(x=>x===clear[0]);let rw=1,rh=1;
            // Keep leaf edges on the unit grid: nonlinear wind must move shared
            // edge vertices together, including neighboring chunks and species.
            if(flat && !blocks[id].leaf) {
              while(i+rw<w&&mask[k+rw]===key)rw++;
              height:while(j+rh<h){for(let x=0;x<rw;x++)if(mask[k+x+rh*w]!==key)break height;rh++;}
            }
            const points=[];
            for(const [du,dv] of [[0,0],[rw,0],[rw,rh],[0,rh]]){
              const p=[0,0,0];p[axis]=d+(sign>0?1:0);p[u]=i+du;p[v]=j+dv;
              
              points.push(p);
            }
            
            const uvs=axis===2?[[0,0],[rw,0],[rw,rh],[0,rh]]:[[0,0],[0,rw],[rh,rw],[rh,0]];
            quad(points,uvs,id,face,clear.map(x=>.25+x*(3/16)),ao.map(x=>.58+x*.14),sign,blocks[id].render==='water'?1:blocks[id].render==='glass'?2:blocks[id].render==='cutout'?(blocks[id].leaf?6:0):0,blocks[id].render==='cutout');
            for(let dy=0;dy<rh;dy++)for(let dx=0;dx<rw;dx++)mask[k+dx+dy*w]=0;
            i+=rw;
          }
        }
      }
      // Explicit shape meshes; plants/torches are non-solid, tables keep one-cell collision.
      for(let y=0;y<heightLimit;y++)for(let z=0;z<S;z++)for(let x=0;x<S;x++) {
        const id=at(halo,x,y,z),def=blocks[id];if(!def)continue;
        if(def.render==='cross') {
          // A crossed plant uses the bilinear center of the same four corners,
          // so grass beneath a branch follows its smoothed supporting ground.
          const light=(sky(x,y,z)*4+(sky(x-1,y,z)+sky(x+1,y,z)+sky(x,y,z-1)+sky(x,y,z+1))*2+sky(x-1,y,z-1)+sky(x+1,y,z-1)+sky(x-1,y,z+1)+sky(x+1,y,z+1))/16,a=.12,b=.88;
          const ps=[[[x+a,y,z+a],[x+b,y,z+b],[x+b,y+.86,z+b],[x+a,y+.86,z+a]],[[x+b,y,z+a],[x+a,y,z+b],[x+a,y+.86,z+b],[x+b,y+.86,z+a]]];
          for(const p of ps)quad(p,[[0,0],[1,0],[1,1],[0,1]],id,4,light,[1,1,1,1],1,3,true);
        } else if(def.shape==='boxes'){
          // Each authored part keeps its actual bounds and world-cell texel pitch.
          const light=sky(x,y+1,z),ao=[1,1,1,1];
          for(let part=0;part<def.boxes.length;part++){
            const box=def.boxes[part],lo=[x+box[0]/16,y+box[1]/16,z+box[2]/16],hi=[x+box[3]/16,y+box[4]/16,z+box[5]/16],tiles=def.boxTiles?.[part]||def.tiles;
            for(let axis=0;axis<3;axis++)for(const sign of [1,-1]){
              const u=(axis+1)%3,v=(axis+2)%3,ps=[];
              for(const [du,dv]of [[0,0],[1,0],[1,1],[0,1]]){const point=lo.slice();point[axis]=sign>0?hi[axis]:lo[axis];point[u]=du?hi[u]:lo[u];point[v]=dv?hi[v]:lo[v];ps.push(point);}
              const a0=box[u]/16,a1=box[u+3]/16,b0=box[v]/16,b1=box[v+3]/16,uv=axis===2?[[a0,b0],[a1,b0],[a1,b1],[a0,b1]]:[[b0,a0],[b0,a1],[b1,a1],[b1,a0]],face=axis*2+(sign<0?1:0);
              quad(ps,uv,id,face,light,ao,sign,0,false,tiles[face]);
            }
          }
        } else if(def.shape==='worktable'){
          // Disjoint closed boxes leave real gaps; the table remains one collision cell.
          const light=sky(x,y+1,z),ao=[1,1,1,1];
          for(let part=0;part<def.tableBoxes.length;part++){
            const box=def.tableBoxes[part],lo=[x+box[0]/16,y+box[1]/16,z+box[2]/16],hi=[x+box[3]/16,y+box[4]/16,z+box[5]/16];
            for(let axis=0;axis<3;axis++)for(const sign of [1,-1]){
              const u=(axis+1)%3,v=(axis+2)%3,ps=[];
              for(const [du,dv]of [[0,0],[1,0],[1,1],[0,1]]){const p=lo.slice();p[axis]=sign>0?hi[axis]:lo[axis];p[u]=du?hi[u]:lo[u];p[v]=dv?hi[v]:lo[v];ps.push(p);}
              const uv=axis===2?[[0,0],[1,0],[1,1],[0,1]]:[[0,0],[0,1],[1,1],[1,0]];
              const tile=part===0&&axis===1&&sign>0?def.tiles[2]:def.tableFrameTile;
              quad(ps,uv,id,axis*2+(sign<0?1:0),light,ao,sign,0,false,tile);
            }
          }
        } else if(def.shape==='torch') {
          const facing=def.wallTorchFacing,tilt=.35,upright=Math.sqrt(1-tilt*tilt);
          const torchPoints=points=>!facing?points:points.map(p=>{
            const dx=facing[0],dz=facing[1],qx=p[0]-x-.5,qz=p[2]-z-.5,py=p[1]-y;
            const along=qx*dx+qz*dz,across=-qx*dz+qz*dx;
            const out=along*upright+py*tilt-.34;
            return[x+.5+out*dx-across*dz,y+.06+py*upright-along*tilt,z+.5+out*dz+across*dx];
          });
          // A closed 3x11-pixel shaft, not a transparent sprite stretched over
          // a cube. Its four sides sample source columns 7..9, rows 5..15.
          // Kind 5 is solid even when surrounding sprite alpha enters mipmaps.
          const lo=[x+13/32,y,z+13/32],hi=[x+19/32,y+11/16,z+19/32];
          for(let axis=0;axis<3;axis++)for(const sign of [1,-1]){
            const u=(axis+1)%3,v=(axis+2)%3,ps=[];
            for(const [du,dv]of [[0,0],[1,0],[1,1],[0,1]]){const p=lo.slice();p[axis]=sign>0?hi[axis]:lo[axis];p[u]=du?hi[u]:lo[u];p[v]=dv?hi[v]:lo[v];ps.push(p);}
            // Caps sample opaque 3x3 patches: warm rows 4..6 on top, wooden
            // rows 13..15 below. UV V increases upwards after the CPU row flip.
            const u0=7/16,u1=10/16,v0=axis===1&&sign>0?9/16:0,v1=axis===1?(sign>0?12/16:3/16):11/16;
            const uvs=axis===2?[[u0,v0],[u1,v0],[u1,v1],[u0,v1]]:[[u0,v0],[u0,v1],[u1,v1],[u1,v0]];
            quad(torchPoints(ps),uvs,id,axis*2+(sign<0?1:0),1,[1,1,1,1],sign,5);
          }
          // A closed stepped flame stays legible from above and at oblique
          // angles. Each tier has six outward faces; no zero-thickness fins.
          // Existing opaque flame texels and kind 5 keep distant mipmaps solid.
          // Bounds remain the existing 5x6-pixel head, overlapping the shaft.
          for(const [width,bottom,top,u0,u1,v0,v1] of [
            [5,9,11,6/16,11/16,9/16,11/16],
            [3,11,14,7/16,10/16,11/16,14/16],
            [1,14,15,8/16,9/16,14/16,15/16]
          ]){
            const radius=width/32,lo=[x+.5-radius,y+bottom/16,z+.5-radius],hi=[x+.5+radius,y+top/16,z+.5+radius];
            for(let axis=0;axis<3;axis++)for(const sign of [1,-1]){
              const u=(axis+1)%3,v=(axis+2)%3,ps=[];
              for(const [du,dv]of [[0,0],[1,0],[1,1],[0,1]]){const p=lo.slice();p[axis]=sign>0?hi[axis]:lo[axis];p[u]=du?hi[u]:lo[u];p[v]=dv?hi[v]:lo[v];ps.push(p);}
              // Caps sample the tier's central opaque pixel, never transparent
              // corners of the original inventory glyph.
              const um=(u0+u1)/2,vm=sign>0?v1-1/32:v0+1/32;
              const uv=axis===1?[[um,vm],[um,vm],[um,vm],[um,vm]]:axis===2?[[u0,v0],[u1,v0],[u1,v1],[u0,v1]]:[[u0,v0],[u0,v1],[u1,v1],[u1,v0]];
              quad(torchPoints(ps),uv,id,axis*2+(sign<0?1:0),1,[1,1,1,1],sign,5);
            }
          }
          if(facing){
            // Closed wall plate plus short bracket; both remain inside the torch cell.
            // The bracket reaches the leaning shaft, so the torch never floats off its wall.
            const dx=facing[0],dz=facing[1];
            for(const [a0,a1,y0,y1,w]of [[.003,.065,.08,.31,.11],[.04,.23,.10,.18,.055]]){
              const bounds=[];
              for(const a of [a0,a1])for(const across of [-w,w])bounds.push([x+.5+dx*(a-.5)-dz*across,z+.5+dz*(a-.5)+dx*across]);
              const lo=[Math.min(...bounds.map(p=>p[0])),y+y0,Math.min(...bounds.map(p=>p[1]))],hi=[Math.max(...bounds.map(p=>p[0])),y+y1,Math.max(...bounds.map(p=>p[1]))];
              for(let axis=0;axis<3;axis++)for(const sign of [1,-1]){
                const u=(axis+1)%3,v=(axis+2)%3,ps=[];
                for(const [du,dv]of [[0,0],[1,0],[1,1],[0,1]]){const p=lo.slice();p[axis]=sign>0?hi[axis]:lo[axis];p[u]=du?hi[u]:lo[u];p[v]=dv?hi[v]:lo[v];ps.push(p);}
                quad(ps,[[7/16,1/16],[9/16,1/16],[9/16,3/16],[7/16,3/16]],id,axis*2+(sign<0?1:0),1,[1,1,1,1],sign,5);
              }
            }
          }
        }
      }
      return {opaque:{vertices:new Float32Array(buckets[0].v),indices:new Uint32Array(buckets[0].i)},transparent:{vertices:new Float32Array(buckets[1].v),indices:new Uint32Array(buckets[1].i)},quads,visibleFaces,minY:Math.max(0,minY),maxY:Math.max(1,maxY)};
    }
    return {build,policy};
  };
  V.MESHER_SOURCE=V.createMesher.toString();
  V.geometryBudget=V.createMesher(V.blocks).policy;
})();
