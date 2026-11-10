/* VoxelGL2 original deterministic terrain. No runtime or DOM dependencies. */
(function () {
  'use strict';
  const V = globalThis.Voxel ||= {};
  V.createVoxelCore = function createVoxelCore(coordinates=globalThis.Voxel?.coordinates) {
    if(!coordinates?.validGenerationChunk)throw new TypeError("Coordinate policy required");
    const SIZE = 16, HEIGHT = 96, SEA = 31;
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const smooth = t => t * t * (3 - 2 * t);
    const lerp = (a, b, t) => a + (b - a) * t;
    function hashSeed(value) {
      if (typeof value === 'number' && Number.isFinite(value)) return value >>> 0;
      const text = String(value == null ? 'BACH-DUONG-2026' : value);
      let h = 2166136261;
      for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
      return avalanche(h);
    }
    function avalanche(h) {
      h ^= h >>> 16; h = Math.imul(h, 0x7feb352d);
      h ^= h >>> 15; h = Math.imul(h, 0x846ca68b);
      return (h ^ (h >>> 16)) >>> 0;
    }
    function hash2(seed, x, z) {
      return avalanche((seed ^ Math.imul(x | 0, 0x632be5ab) ^ Math.imul(z | 0, 0x85157af5)) | 0);
    }
    function hash3(seed, x, y, z) {
      return avalanche((seed ^ Math.imul(x | 0, 0x632be5ab) ^ Math.imul(y | 0, 0x9e3779b1) ^ Math.imul(z | 0, 0x85157af5)) | 0);
    }
    function n2(seed, x, z) {
      const ix = Math.floor(x), iz = Math.floor(z);
      const tx = smooth(x - ix), tz = smooth(z - iz);
      const a = hash2(seed, ix, iz) / 2147483647.5 - 1;
      const b = hash2(seed, ix + 1, iz) / 2147483647.5 - 1;
      const c = hash2(seed, ix, iz + 1) / 2147483647.5 - 1;
      const d = hash2(seed, ix + 1, iz + 1) / 2147483647.5 - 1;
      return lerp(lerp(a, b, tx), lerp(c, d, tx), tz);
    }
    function n3(seed, x, y, z) {
      const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
      const u = smooth(x - ix), v = smooth(y - iy), w = smooth(z - iz);
      const f = (dx, dy, dz) => hash3(seed, ix + dx, iy + dy, iz + dz) / 2147483647.5 - 1;
      return lerp(
        lerp(lerp(f(0,0,0), f(1,0,0), u), lerp(f(0,1,0), f(1,1,0), u), v),
        lerp(lerp(f(0,0,1), f(1,0,1), u), lerp(f(0,1,1), f(1,1,1), u), v), w
      );
    }
    function fbm(seed, x, z) {
      return n2(seed, x, z) * .58 + n2(seed + 1013, x * 2.03, z * 2.03) * .28 +
        n2(seed + 2017, x * 4.07, z * 4.07) * .14;
    }
    function terrain(seed, x, z) {
      const broad = fbm(seed + 19, x / 185, z / 185);
      const ridge = 1 - Math.abs(n2(seed + 71, x / 73, z / 73));
      const mountain = clamp((n2(seed + 109, x / 295, z / 295) + .1) * 1.8, 0, 1);
      let raw = 36 + broad * 24 + n2(seed + 317, x / 37, z / 37) * 4.8 +
        Math.pow(ridge, 3) * mountain * 30;
      // Compose a safe, varied spawn valley. Farther terrain remains fully seed-driven.
      const radius = Math.hypot(x - 8, z - 8);
      const bay = Math.exp(-Math.pow((x - 90) / 64, 2) - Math.pow((z - 25) / 103, 2));
      const backHill = Math.exp(-Math.pow((x + 105) / 72, 2) - Math.pow((z + 62) / 87, 2));
      const local = 39 + fbm(seed + 43, x / 62, z / 62) * 7 - bay * 19 + backHill * 25;
      const regional = smooth(clamp((radius - 85) / 135, 0, 1));
      raw = lerp(local, raw, regional);
      const safe = 1 - smooth(clamp((radius - 13) / 22, 0, 1));
      raw = lerp(raw, 39 + n2(seed + 41, x / 32, z / 32) * 1.5, safe);
      const h = Math.floor(clamp(raw, 10, 79));
      const temp = n2(seed + 701, x / 270, z / 270) * .9 + Math.sin((x + 100) / 270) * .25;
      const wet = n2(seed + 709, x / 150, z / 150);
      let b;
      if (h <= SEA + 2) b = 'coast';
      else if (h >= 58 || (h >= 49 && temp < -.36)) b = 'alpine';
      else if (radius > 110 && temp > .18 && wet < .16) b = 'desert';
      else if (radius > 24 && (wet > -.03 || (radius < 145 && x < -12))) b = 'forest';
      else b = 'meadow';
      return { h, b };
    }
    function height(seed, x, z) {
      seed = hashSeed(seed); x = Math.floor(x); z = Math.floor(z);
      return villageGround(village(seed), x, z, terrain(seed, x, z).h);
    }
    function biome(seed, x, z) { return terrain(hashSeed(seed), Math.floor(x), Math.floor(z)).b; }
    // Keep this specification inside createVoxelCore: workers instantiate its
    // serialized function without a catalog, window, or other closure state.
    const treeFamilies = Object.freeze({
      oak:Object.freeze({log:5,leaves:6,planks:8,sapling:36}),
      spruce:Object.freeze({log:24,leaves:25,planks:33,sapling:37}),
      birch:Object.freeze({log:43,leaves:44,planks:45,sapling:46}),
      acacia:Object.freeze({log:47,leaves:48,planks:49,sapling:50}),
      cherry:Object.freeze({log:51,leaves:52,planks:53,sapling:54})
    });
    const TREE_HALO = 5;
    const treeLeafIds = new Set(Object.values(treeFamilies).map(f=>f.leaves));
    function shapeBounds(cells) {
      const b={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity,minZ:Infinity,maxZ:-Infinity};
      for(const c of cells){b.minX=Math.min(b.minX,c.x);b.maxX=Math.max(b.maxX,c.x);b.minY=Math.min(b.minY,c.y);b.maxY=Math.max(b.maxY,c.y);b.minZ=Math.min(b.minZ,c.z);b.maxZ=Math.max(b.maxZ,c.z);}return b;
    }
    function treeShape(seedInput,p) {
      if(!p||![p.x,p.y,p.z].every(Number.isInteger))throw new TypeError('Tree position must use integer coordinates');
      const family=Object.values(treeFamilies).find(f=>f.sapling===p.id);
      if(!family||![46,50,54].includes(p.id))throw new TypeError('Shared shape requires a birch, acacia or cherry sapling');
      const seed=hashSeed(seedInput),h=hash3(seed^0x51a7b31,p.x,p.y,p.z),wood=family.log,leaf=family.leaves,cells=new Map();
      const add=(dx,dy,dz,id)=>{const x=p.x+dx,y=p.y+dy,z=p.z+dz,k=x+','+y+','+z,old=cells.get(k);if(!old||id===wood)cells.set(k,{x,y,z,id});};
      const crown=(cx,cy,cz,r,round=1)=>{for(let z=-r;z<=r;z++)for(let x=-r;x<=r;x++)if(Math.abs(x)+Math.abs(z)<=r+round)add(cx+x,cy,cz+z,leaf);};
      if(p.id===46){
        const tall=6+h%3;for(let y=0;y<tall;y++)add(0,y,0,wood);
        for(let y=tall-3;y<=tall;y++)crown(0,y,0,y===tall?1:2,y===tall?1:2);
      }else if(p.id===50){
        const tall=5+h%2,directions=[[1,0],[0,1],[-1,0],[0,-1]],[dx,dz]=directions[(h>>>4)%4];
        for(let y=0;y<=2;y++)add(0,y,0,wood);
        for(let step=1;step<=2;step++){add(dx*(step-1),2+step,dz*(step-1),wood);add(dx*step,2+step,dz*step,wood);}
        for(let y=5;y<tall;y++)add(dx*2,y,dz*2,wood);
        add(-dx,2,-dz,wood);add(-dx,3,-dz,wood);
        crown(dx*2,tall-1,dz*2,3,1);crown(dx*2,tall,dz*2,2,1);
        crown(-dx,tall-2,-dz,2,1);crown(-dx,tall-1,-dz,1,1);
      }else{
        const tall=5+h%2,axis=(h>>>4)%2,dx=axis?0:1,dz=axis?1:0;
        for(let y=0;y<tall;y++)add(0,y,0,wood);
        for(const sign of [-1,1]){add(dx*sign,tall-3,dz*sign,wood);add(dx*sign,tall-2,dz*sign,wood);add(dx*sign*2,tall-2,dz*sign*2,wood);}
        crown(0,tall-2,0,3,2);crown(0,tall-1,0,3,2);crown(0,tall,0,2,2);crown(0,tall+1,0,1,1);
      }
      return Array.from(cells.values());
    }
    let treeCacheSeed=-1;const treeCache=new Map(),TREE_CACHE_LIMIT=1024;
    function treeAt(seedInput,ax,az,groundAt=null) {
      if(!Number.isInteger(ax)||!Number.isInteger(az))throw new TypeError('Tree anchor coordinates must be integers');
      const seed=hashSeed(seedInput),key=ax+','+az;
      if(treeCacheSeed!==seed){treeCacheSeed=seed;treeCache.clear();}
      if(treeCache.has(key))return treeCache.get(key);
      const tree=computeTreeAt(seed,ax,az,groundAt);
      if(tree){for(const c of tree.cells)Object.freeze(c);Object.freeze(tree.cells);Object.freeze(tree.bounds);Object.freeze(tree);}
      if(treeCache.size>=TREE_CACHE_LIMIT)treeCache.delete(treeCache.keys().next().value);
      treeCache.set(key,tree);return tree;
    }
    function computeTreeAt(seedInput,ax,az,groundAt=null) {
      if(!Number.isInteger(ax)||!Number.isInteger(az))throw new TypeError('Tree anchor coordinates must be integers');
      const seed=hashSeed(seedInput),ah=hash2(seed+4093,ax,az),x=ax*6+ah%5,z=az*6+((ah>>>5)%5);
      const ground=groundAt||((wx,wz)=>terrain(seed,wx,wz)),t=ground(x,z);
      if(Math.hypot(x-8,z-8)<12||t.h<=SEA+2||t.h>=77||t.b==='coast'||t.b==='desert')return null;
      const density=t.b==='forest'?.63:t.b==='alpine'?.38:.115;if((ah>>>10)/4194304>=density)return null;
      const spruce=t.b==='alpine'||(t.b==='forest'&&hash2(seed+6011,x,z)%9===0),choice=hash2(seed+6029,x,z)%10;
      const name=spruce?'spruce':choice<2?'birch':choice<4?'acacia':choice<6?'cherry':'oak',family=treeFamilies[name],p={x,y:t.h+1,z,id:family.sapling};
      let cells;
      if(name!=='oak'&&name!=='spruce')cells=treeShape(seed,p);
      else{
        const tall=spruce?7+((ah>>>21)%4):4+((ah>>>21)%3),map=new Map();
        const add=(wx,y,wz,id)=>{const k=wx+','+y+','+wz,old=map.get(k);if(!old||id===family.log)map.set(k,{x:wx,y,z:wz,id});};
        for(let dy=1;dy<=tall;dy++)add(x,t.h+dy,z,family.log);
        if(spruce){
          for(let dy=3;dy<=tall+1;dy++){const fromTop=tall+1-dy,r=fromTop===0?0:Math.min(3,Math.floor((fromTop+1)/2));
            for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)===r&&Math.abs(dz)===r&&r>0)continue;if(r>1&&dy%2===0&&Math.abs(dx)+Math.abs(dz)>r+1)continue;add(x+dx,t.h+dy,z+dz,family.leaves);}}
        }else{
          for(let dy=tall-2;dy<=tall+1;dy++){const r=dy>=tall+1?1:2;
            for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)===r&&Math.abs(dz)===r&&(dy>=tall||hash3(seed+4111,x+dx,t.h+dy,z+dz)%3!==0))continue;add(x+dx,t.h+dy,z+dz,family.leaves);}}
        }cells=Array.from(map.values());
      }
      const bounds=shapeBounds(cells),v=village(seed),b=v.builtBounds;
      // Reject the complete shape when any canopy/branch touches cleared land.
      // No per-cell construction clipping is permitted in the emission loop.
      if(Math.max(0,b.minX-bounds.maxX,bounds.minX-b.maxX,b.minZ-bounds.maxZ,bounds.minZ-b.maxZ)<6)return null;
      for(const c of cells)if(c.y<=ground(c.x,c.z).h||c.y>=HEIGHT)return null;
      return{family:name,...p,log:family.log,leaves:family.leaves,bounds,cells};
    }

    function generate(seedInput, cx, cz, vegetationVersion=3) {
      if(vegetationVersion!==1&&vegetationVersion!==2&&vegetationVersion!==3&&vegetationVersion!==4)throw new TypeError("Unsupported vegetation version");
      const seed = hashSeed(seedInput);
      const villageSite = village(seed);
      if (!coordinates.validGenerationChunk(cx,cz)) throw new RangeError('Chunk coordinates exceed the supported generation envelope');
      const data = new Uint8Array(SIZE * SIZE * HEIGHT);
      const wx0 = cx * SIZE, wz0 = cz * SIZE;
      const terrainMemo = new Map();
      function ground(wx, wz) {
        const key = wx + ',' + wz;
        let t = terrainMemo.get(key);
        if (!t) { t = terrain(seed, wx, wz); terrainMemo.set(key, t); }
        return t;
      }
      function idx(x, y, z) { return x + SIZE * (z + SIZE * y); }
      // Shared world-space lattice: exactly the same cave field on chunk seams.
      const STEP = 4, NX = 5, NY = 21;
      const caveA = new Float32Array(NX * NX * NY), caveB = new Float32Array(caveA.length);
      for (let gy = 0; gy < NY; gy++) for (let gz = 0; gz < NX; gz++) for (let gx = 0; gx < NX; gx++) {
        const wx = wx0 + gx * STEP, wy = gy * STEP, wz = wz0 + gz * STEP;
        const ci = gx + NX * (gz + NX * gy);
        caveA[ci] = n3(seed + 877, wx / 26, wy / 19, wz / 26) + .24 * n3(seed + 911, wx / 10, wy / 10, wz / 10);
        caveB[ci] = n3(seed + 1487, (wx + 190) / 24, wy / 22, (wz - 95) / 24);
      }
      function caveField(arr, x, y, z) {
        const gx = x >> 2, gy = y >> 2, gz = z >> 2;
        const tx = (x & 3) / 4, ty = (y & 3) / 4, tz = (z & 3) / 4;
        const i = gx + NX * (gz + NX * gy), j = i + NX * NX;
        return lerp(lerp(lerp(arr[i], arr[i+1], tx), lerp(arr[i+NX], arr[i+NX+1], tx), tz),
          lerp(lerp(arr[j], arr[j+1], tx), lerp(arr[j+NX], arr[j+NX+1], tx), tz), ty);
      }
      for (let z = 0; z < SIZE; z++) for (let x = 0; x < SIZE; x++) {
        const wx = wx0 + x, wz = wz0 + z, t = ground(wx, wz), h = t.h;
        let top = t.b === 'desert' || t.b === 'coast' ? 4 : t.b === 'alpine' ? 12 : 1;
        if (h < SEA - 4 && hash2(seed + 89, Math.floor(wx/4), Math.floor(wz/4)) % 11 < 3) top = 26;
        if (h < SEA - 7 && hash2(seed + 91, Math.floor(wx/5), Math.floor(wz/5)) % 13 < 3) top = 27;
        data[idx(x, 0, z)] = 13;
        for (let y = 1; y <= h; y++) {
          let block;
          if (y === h) block = top;
          else if (y > h - 4) block = top === 4 ? 4 : top === 26 || top === 27 ? top : 2;
          else block = y <= 3 ? 21 : 3;
          if (y >= 5 && y < h - 5 && y < 66) {
            const ca = caveField(caveA, x, y, z), cb = caveField(caveB, x, y, z);
            // Intersection of two smooth fields creates connected winding tunnels.
            if (Math.abs(ca) < .115 && Math.abs(cb) < .19) block = 0;
          }
          if (block === 3) {
            const vein = hash3(seed + 2221, Math.floor(wx/2), Math.floor(y/2), Math.floor(wz/2)) % 1000;
            const trim = hash3(seed + 2237, wx, y, wz) % 7;
            if (trim < 5) {
              if (y < 14 && vein < 10) block = 17;
              else if (y < 22 && vein < 27) block = 16;
              else if (y < 46 && vein < 64) block = 15;
              else if (vein < 112) block = 14;
            }
          }
          // Generation4 adds minerals only to remaining underground stone.
          // Old versions1-3, existing ores, caves, water and surface layers keep exact bytes.
          if (vegetationVersion === 4 && block === 3 && y >= 8 && y <= 54) {
            const mineral = hash3(seed + 9419, Math.floor(wx/3), Math.floor(y/3), Math.floor(wz/3)) % 1000;
            const mineralTrim = hash3(seed + 9431, wx, y, wz) % 7;
            if (mineralTrim < 5) {
              if (mineral < 22) block = 205;                 // copper ore
              else if (y <= 40 && mineral < 32) block = 207; // quartz ore
            }
          }
          data[idx(x,y,z)] = block;
        }
        for (let y = h + 1; y <= SEA; y++) data[idx(x,y,z)] = 7;
        if (h > SEA + 1 && top === 1 && Math.hypot(wx - 8, wz - 8) > 4) {
          const plant = hash2(seed + 1613, wx, wz) % 100;
          if (plant < 4) data[idx(x,h+1,z)] = 22;
          else if (plant < 19) data[idx(x,h+1,z)] = 23;
        }
        if (t.b === 'desert' && h > SEA + 2 && hash2(seed + 3331, wx, wz) % 251 === 0) {
          const count = 2 + hash2(seed + 3343, wx, wz) % 3;
          for (let dy = 1; dy <= count; dy++) data[idx(x,h+dy,z)] = 30;
        }
      }
      function put(wx, y, wz, block, isLog) {
        const x = wx - wx0, z = wz - wz0;
        if (x < 0 || x >= SIZE || z < 0 || z >= SIZE || y <= 0 || y >= HEIGHT) return;
        const i = idx(x,y,z), old = data[i];
        if (old === 0 || old === 22 || old === 23 || (isLog && treeLeafIds.has(old))) data[i] = block;
      }
      if(vegetationVersion===1){
      // Every chunk evaluates the same neighboring anchor cells. Canopies never clip at seams.
      const CELL = 6;
      for (let az = Math.floor((wz0-4)/CELL); az <= Math.floor((wz0+SIZE+3)/CELL); az++) {
        for (let ax = Math.floor((wx0-4)/CELL); ax <= Math.floor((wx0+SIZE+3)/CELL); ax++) {
          const ah = hash2(seed + 4093, ax, az);
          const wx = ax * CELL + (ah % 5), wz = az * CELL + ((ah >>> 5) % 5);
          
          if (Math.hypot(wx - 8, wz - 8) < 12) continue;
          const t = ground(wx,wz);
          if (t.h <= SEA + 2 || t.h >= 77 || t.b === 'coast' || t.b === 'desert') continue;
          const density = t.b === 'forest' ? .63 : t.b === 'alpine' ? .38 : .115;
          if ((ah >>> 10) / 4194304 >= density) continue;
          const spruce = t.b === 'alpine' || (t.b === 'forest' && hash2(seed+6011,wx,wz)%9===0);
          // Reserve the whole canopy against every flattened/cleared village column.
          const canopyRadius = spruce ? 3 : 2;
          if (Math.max(0, Math.abs(wx-villageSite.x)-22-canopyRadius,
            Math.abs(wz-villageSite.z)-20-canopyRadius) < 6) continue;
          const tall = spruce ? 7 + ((ah >>> 21) % 4) : 4 + ((ah >>> 21) % 3);
          const wood = spruce ? 24 : 5, leaf = spruce ? 25 : 6;
          for (let dy = 1; dy <= tall; dy++) put(wx,t.h+dy,wz,wood,true);
          if (spruce) {
            for (let dy = 3; dy <= tall + 1; dy++) {
              const fromTop = tall + 1 - dy;
              const r = fromTop === 0 ? 0 : Math.min(3, Math.floor((fromTop+1)/2));
              for (let dz=-r; dz<=r; dz++) for (let dx=-r; dx<=r; dx++) {
                if (Math.abs(dx) === r && Math.abs(dz) === r && r > 0) continue;
                if (r>1 && dy%2===0 && Math.abs(dx)+Math.abs(dz)>r+1) continue;
                put(wx+dx,t.h+dy,wz+dz,leaf,false);
              }
            }
          } else {
            for (let dy = tall - 2; dy <= tall + 1; dy++) {
              const r = dy >= tall + 1 ? 1 : 2;
              for (let dz=-r; dz<=r; dz++) for (let dx=-r; dx<=r; dx++) {
                if (Math.abs(dx) === r && Math.abs(dz) === r &&
                  (dy >= tall || hash3(seed+4111,wx+dx,t.h+dy,wz+dz)%3!==0)) continue;
                put(wx+dx,t.h+dy,wz+dz,leaf,false);
              }
            }
          }
        }
      }
      }else{
      // The halo is the largest actual family footprint (acacia: five cells).
      // All chunks visit anchors in the same z/x order; logs always outrank leaves.
      for(let az=Math.floor((wz0-TREE_HALO)/6);az<=Math.floor((wz0+SIZE-1+TREE_HALO)/6);az++)
        for(let ax=Math.floor((wx0-TREE_HALO)/6);ax<=Math.floor((wx0+SIZE-1+TREE_HALO)/6);ax++){
          const tree=treeAt(seed,ax,az,ground);if(!tree)continue;
          for(const c of tree.cells)put(c.x,c.y,c.z,c.id,c.id===tree.log);
        }
      }
      applyVillage(seed, cx, cz, data);
      if(vegetationVersion>=3)applyStructures(seed,cx,cz,data);
      return data;
    }
    let villageCacheSeed = -1, villageCacheValue = null;
    function village(seedInput) {
      const seed = hashSeed(seedInput);
      if (villageCacheValue && villageCacheSeed === seed) return villageCacheValue;
      const candidates = [[-28,-28],[-36,8],[8,-38],[-34,40],[8,48],[42,40],[44,8],[38,-26]];
      let best = null;
      for (let i = 0; i < candidates.length; i++) {
        const [x,z] = candidates[i], levels = [];
        let wet = 0;
        for (const dz of [-18,0,18]) for (const dx of [-20,0,20]) {
          const h = terrain(seed, x+dx, z+dz).h;
          levels.push(h); if (h <= SEA+1) wet++;
        }
        levels.sort((a,b)=>a-b);
        const middle = levels[4], spread = levels[8]-levels[0];
        const deviation = levels.reduce((n,h)=>n+Math.abs(h-middle),0);
        const score = wet*180 + spread*3 + deviation + Math.hypot(x-8,z-8)*.12 + i*.001;
        if (!best || score < best.score) best = {x,z,score,ground:Math.max(SEA+4,Math.min(HEIGHT-13,middle))};
      }
      const {x,z} = best, y = best.ground+1;
      const homes = [[-12,-10,1],[12,-10,1],[-12,10,-1],[12,10,-1]].map(([dx,dz,front],i)=>Object.freeze({
        x:x+dx, y, z:z+dz, facing:front>0?'south':'north',
        door:Object.freeze([x+dx,y,z+dz+front*4]),
        roofId:i%2?33:11, wallId:i%2?8:20, width:9, depth:9
      }));
      const spawns = [[-12,-5],[12,-5],[-12,5],[12,5]].map(([dx,dz])=>Object.freeze([x+dx+.5,y+.01,z+dz+.5]));
      villageCacheSeed = seed;
      villageCacheValue = Object.freeze({x,y,z,homes:Object.freeze(homes),spawns:Object.freeze(spawns),
        bounds:Object.freeze({minX:x-28,maxX:x+28,minZ:z-26,maxZ:z+26}),
        builtBounds:Object.freeze({minX:x-22,maxX:x+22,minZ:z-20,maxZ:z+20}),
        style:'timber-courtyard',garden:'forty mature wheat crops on irrigated farmland'});
      return villageCacheValue;
    }
    function villageGround(v, x, z, nativeHeight) {
      const d = Math.max(0,Math.abs(x-v.x)-22,Math.abs(z-v.z)-20);
      if (d >= 6) return nativeHeight;
      const t = 1-d/6, blend = t*t*(3-2*t);
      return Math.floor(nativeHeight+(v.y-1-nativeHeight)*blend);
    }
    function applyVillage(seed, cx, cz, data) {
      const v = village(seed), wx = cx*SIZE, wz = cz*SIZE;
      if (wx+SIZE-1<v.bounds.minX || wx>v.bounds.maxX || wz+SIZE-1<v.bounds.minZ || wz>v.bounds.maxZ) return;
      const put = (x,y,z,id) => {
        const lx=x-wx,lz=z-wz;
        if(lx>=0&&lx<SIZE&&lz>=0&&lz<SIZE&&y>=0&&y<HEIGHT)
          data[lx+SIZE*(lz+SIZE*y)]=id;
      };
      for(let z=Math.max(wz,v.bounds.minZ);z<=Math.min(wz+SIZE-1,v.bounds.maxZ);z++)
        for(let x=Math.max(wx,v.bounds.minX);x<=Math.min(wx+SIZE-1,v.bounds.maxX);x++){
          const d=Math.max(0,Math.abs(x-v.x)-22,Math.abs(z-v.z)-20);
          if(d>=6)continue;
          const natural=terrain(seed,x,z).h,h=villageGround(v,x,z,natural);
          for(let y=Math.max(1,natural+1);y<h-3;y++)put(x,y,z,3);
          for(let y=Math.max(1,h-3);y<h;y++)put(x,y,z,2);
          put(x,h,z,1);
          for(let y=h+1;y<HEIGHT;y++)put(x,y,z,0);
        }
      const y=v.y;
      for(let dz=-18;dz<=18;dz++)for(let dx=-20;dx<=20;dx++){
        const axis=Math.abs(dx)<=1||Math.abs(dz)<=1;
        const branch=Math.abs(Math.abs(dx)-12)<=1&&Math.abs(dz)<=6;
        const ring=Math.max(Math.abs(dx),Math.abs(dz))<=4&&Math.max(Math.abs(dx),Math.abs(dz))>=3;
        if(axis||branch||ring)put(v.x+dx,y-1,v.z+dz,27);
      }
      for(const h of v.homes){
        const front=h.facing==='south'?1:-1;
        for(let dz=-4;dz<=4;dz++)for(let dx=-4;dx<=4;dx++){
          put(h.x+dx,y-3,h.z+dz,9);put(h.x+dx,y-2,h.z+dz,9);put(h.x+dx,y-1,h.z+dz,8);
          if(Math.abs(dx)!==4&&Math.abs(dz)!==4)continue;
          for(let dy=0;dy<4;dy++){
            let id=(Math.abs(dx)===4&&Math.abs(dz)===4)?5:h.wallId;
            const sideWindow=Math.abs(dx)===4&&(dz===-1||dz===0);
            const endWindow=Math.abs(dz)===4&&(dx===-2||dx===2);
            if((sideWindow||endWindow)&&(dy===1||dy===2))id=10;
            if(dx===0&&dz===front*4&&dy<2)id=0;
            put(h.x+dx,y+dy,h.z+dz,id);
          }
        }
        for(let dx=-4;dx<=4;dx++){
          const roofY=y+4+Math.max(0,4-Math.abs(dx));
          for(const dz of [-4,4])for(let by=y+4;by<roofY;by++)
            put(h.x+dx,by,h.z+dz,dx===0&&by===y+5?10:h.wallId);
        }
        for(let dz=-5;dz<=5;dz++)for(let dx=-5;dx<=5;dx++)
          put(h.x+dx,y+4+Math.max(0,4-Math.abs(dx)),h.z+dz,h.roofId);
        const back=h.z-front*2;
        put(h.x-2,y,back,18);put(h.x+2,y,back,32);
        put(h.x+2,y,h.z,35);put(h.x+2,y+1,h.z,35);
        put(h.x-2,y,h.z+front,31);put(h.x-2,y,h.z,20);
        put(h.x-3,y,h.z,33);put(h.x-3,y+1,h.z,19);
        for(let dz=0;dz<=2;dz++)for(let dx=-1;dx<=1;dx++)
          put(h.x+dx,y-1,h.z+front*(4+dz),27);
      }
      for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){
        put(v.x+dx,y-2,v.z+dz,34);
        put(v.x+dx,y-1,v.z+dz,Math.abs(dx)<2&&Math.abs(dz)<2?7:34);
        if(Math.abs(dx)===2||Math.abs(dz)===2)put(v.x+dx,y,v.z+dz,9);
      }
      for(const dz of [-2,2])for(const dx of [-2,2])for(let dy=1;dy<=3;dy++)put(v.x+dx,y+dy,v.z+dz,5);
      for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++)put(v.x+dx,y+4,v.z+dz,33);
      for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++)put(v.x+dx,y+5,v.z+dz,33);
      for(const gz of [-11,11])for(const gx of [-4,4])
        for(let dz=-3;dz<=3;dz++)for(let dx=-2;dx<=2;dx++){
          const x=v.x+gx+dx,z=v.z+gz+dz,border=Math.abs(dx)===2||Math.abs(dz)===3;
          put(x,y-2,z,26);put(x,y-1,z,border?33:dx===0?7:38);
          if(!border&&dx!==0)put(x,y,z,42);
        }
      for(const dz of [-4,4])for(const dx of [-5,5]){
        for(let dy=0;dy<3;dy++)put(v.x+dx,y+dy,v.z+dz,5);
        put(v.x+dx,y+3,v.z+dz,28);put(v.x+dx,y+4,v.z+dz,33);
      }
    }
    // Mode 3 adds buildings only on dry, gently sloped, completely tree-free
    // plots. Modes 1/2 never call this planner or apply its writes. One plan per
    // seed is retained; planning calls terrain/treeAt, never generate.
    const STRUCTURE_LIMITS=Object.freeze({kinds:3,planCache:1,candidatesPerKind:192,terrainMemo:16384,maxRadius:256});
    // Grade only the actual floor and three-wide entrance, never the reservation box.
    function structureFloorCell(kind,dx,dz) {
      const path=Math.abs(dx)<=1&&dz<=8;
      if(kind==='watchtower')return (Math.abs(dx)<=3&&dz>=-4&&dz<=3)||(dx>=-2&&dx<=-1&&dz>=4&&dz<=5)||(path&&dz>=4);
      if(kind==='granary')return (Math.abs(dx)<=4&&Math.abs(dz)<=5)||(path&&dz>=6);
      return (Math.abs(dx)<=5&&Math.abs(dz)<=4)||(path&&dz>=5);
    }
    function structureSupportCell(kind,dx,dz) {
      if(!structureFloorCell(kind,dx,dz))return false;
      if(kind!=='ruined-gateway')return true;
      // Leave the ruin courtyard natural except its central path and actual footings.
      return Math.abs(dx)<=1||Math.abs(dx)===5||Math.abs(dz)===4||
        (Math.abs(dx)===3&&Math.abs(dz)<=1)||(Math.abs(dx)===4&&dz===3);
    }
    let structureCacheSeed=-1,structureCacheValue=null,structureCacheStats=null;
    function structureSites(seedInput) {
      const seed=hashSeed(seedInput);
      if(structureCacheValue&&structureCacheSeed===seed)return structureCacheValue;
      const v=village(seed),memo=new Map(),sites=[];
      const stats={candidates:0,flatCandidates:0,treeChecks:0,terrainQueries:0,terrainMemoPeak:0,found:0};
      const ground=(x,z)=>{const k=x+','+z;let t=memo.get(k);if(!t){stats.terrainQueries++;t=terrain(seed,x,z);if(memo.size<STRUCTURE_LIMITS.terrainMemo)memo.set(k,t);}return t;};
      const directions=[[8,0],[8,3],[6,6],[3,8],[0,8],[-3,8],[-6,6],[-8,3],[-8,0],[-8,-3],[-6,-6],[-3,-8],[0,-8],[3,-8],[6,-6],[8,-3]];
      const radii=[44,60,76,92,108,124,140,156,180,208,232,256];
      const apart=(a,b,gap)=>a.maxX<b.minX-gap||a.minX>b.maxX+gap||a.maxZ<b.minZ-gap||a.minZ>b.maxZ+gap;
      const kinds=['watchtower','granary','ruined-gateway'];
      for(let kind=0;kind<kinds.length;kind++) {
        let selected=null;
        search:for(const radius of radii)for(let n=0;n<directions.length;n++) {
          stats.candidates++;
          const [dx,dz]=directions[(n+kind*5+(seed%16))%16];
          const x=v.x+Math.round(dx*radius/8),z=v.z+Math.round(dz*radius/8);
          const bounds={minX:x-6,maxX:x+6,minZ:z-6,maxZ:z+8};
          if(!apart(bounds,v.bounds,5)||sites.some(s=>!apart(bounds,s.bounds,8)))continue;
          const spawnDX=Math.max(bounds.minX-8,0,8-bounds.maxX),spawnDZ=Math.max(bounds.minZ-8,0,8-bounds.maxZ);
          if(Math.hypot(spawnDX,spawnDZ)<16)continue;
          let lo=HEIGHT,hi=0;
          for(const pz of [bounds.minZ,z,bounds.maxZ])for(const px of [bounds.minX,x,bounds.maxX]) {
            const h=ground(px,pz).h;lo=Math.min(lo,h);hi=Math.max(hi,h);
          }
          if(lo<=SEA+2||hi>75||hi-lo>3)continue;
          for(let pz=bounds.minZ;pz<=bounds.maxZ;pz++)for(let px=bounds.minX;px<=bounds.maxX;px++) {
            const h=ground(px,pz).h;lo=Math.min(lo,h);hi=Math.max(hi,h);
          }
          if(lo<=SEA+2||hi>75||hi-lo>3)continue;
          let floorLo=HEIGHT,floorHi=0;
          for(let dz=-6;dz<=8;dz++)for(let dx=-6;dx<=6;dx++)if(structureFloorCell(kinds[kind],dx,dz)) {
            const h=ground(x+dx,z+dz).h;floorLo=Math.min(floorLo,h);floorHi=Math.max(floorHi,h);
          }
          // One-block natural height spread; skip unsuitable ground rather than raise a broad slab.
          if(floorHi-floorLo>1)continue;
          lo=floorLo;hi=floorHi;
          const outsideY=ground(x,z+9).h+1;let previous=outsideY,walkable=outsideY>SEA+1;
          for(let step=1;step<=3;step++) {
            const feet=Math.max(...[-1,0,1].map(dx=>ground(x+dx,z+9-step).h+1),Math.min(hi+1,outsideY+step));
            if(feet-previous>1)walkable=false;previous=feet;
          }
          if(!walkable||hi+1-previous>1)continue;
          stats.flatCandidates++;
          let blocked=false;
          for(let az=Math.floor((bounds.minZ-TREE_HALO-1)/6);az<=Math.floor((bounds.maxZ+TREE_HALO+1)/6)&&!blocked;az++)
            for(let ax=Math.floor((bounds.minX-TREE_HALO-1)/6);ax<=Math.floor((bounds.maxX+TREE_HALO+1)/6);ax++) {
              stats.treeChecks++;const tree=treeAt(seed,ax,az,ground);
              // Reject the complete horizontal canopy box, including overhang.
              if(tree&&!apart(bounds,tree.bounds,1)){blocked=true;break;}
            }
          if(blocked)continue;
          selected=makeStructure(seed,kinds[kind],x,hi+1,z,{...bounds,minY:lo,maxY:hi+15},ground);
          break search;
        }
        // A rare seed may have fewer safe plots. Never cut trees or float a
        // building merely to force the requested count.
        if(selected)sites.push(selected);
      }
      stats.terrainMemoPeak=memo.size;stats.found=sites.length;
      structureCacheSeed=seed;structureCacheStats=Object.freeze(stats);
      structureCacheValue=Object.freeze(sites);return structureCacheValue;
    }
    function structureStats(seedInput){structureSites(seedInput);return structureCacheStats;}
    function makeStructure(seed,kind,x,y,z,bounds,ground) {
      const cells=new Map();
      const put=(dx,dy,dz,id)=>{const wx=x+dx,wy=y+dy,wz=z+dz;cells.set(wx+','+wy+','+wz,{x:wx,y:wy,z:wz,id});};
      // Each floor column reaches its original solid surface. No levitating
      // support, terrain excavation, ore rewriting or unbounded clearing.
      for(let wz=bounds.minZ;wz<=bounds.maxZ;wz++)for(let wx=bounds.minX;wx<=bounds.maxX;wx++) {
        const dx=wx-x,dz=wz-z;if(!structureSupportCell(kind,dx,dz))continue;
        const h=ground(wx,wz).h,path=Math.abs(dx)<=1&&(kind==='ruined-gateway'||dz>(kind==='granary'?5:3));
        const floor=path?34:kind==='watchtower'?8:kind==='granary'?49:34;
        // A single timber/stone surface, with at most one soil/support layer below it.
        const fill=kind==='ruined-gateway'?9:2;
        for(let by=h;by<y;by++)put(dx,by-y,dz,by===y-1?floor:fill);
        for(let dy=0;dy<4;dy++)put(dx,dy,dz,0);
      }
      const outsideY=ground(x,z+9).h+1,entrySteps=[];
      for(let step=1;step<=3;step++) {
        const dz=9-step,feet=Math.max(...[-1,0,1].map(dx=>ground(x+dx,z+dz).h+1),Math.min(y,outsideY+step));
        entrySteps.push(Object.freeze({z:z+dz,feetY:feet}));
        for(const dx of [-1,0,1]) {
          put(dx,feet-y-1,dz,34);
          for(let by=feet;by<y+4;by++)put(dx,by-y,dz,0);
        }
      }
      let deck=null,stairs=null;
      if(kind==='watchtower') {
        for(let dz=-4;dz<=3;dz++)for(let dx=-3;dx<=3;dx++)put(dx,-1,dz,8);
        for(const dx of [-3,3])for(const dz of [-4,3])for(let dy=0;dy<=11;dy++)put(dx,dy,dz,5);
        // Eight ordinary one-block steps, two cells wide. The upper platform
        // has an open stairwell for the full player jump envelope.
        for(let step=1;step<=8;step++)for(const dx of [-2,-1])
          for(let dy=0;dy<step;dy++)put(dx,dy,6-step,33);
        for(let dz=-4;dz<=3;dz++)for(let dx=-3;dx<=3;dx++) {
          const stairwell=(dx===-2||dx===-1)&&dz>=-1;
          if(!stairwell)put(dx,7,dz,8);
          if(Math.abs(dx)===3||dz===-4||dz===3)put(dx,8,dz,33);
        }
        for(let dz=-5;dz<=4;dz++)for(let dx=-4;dx<=4;dx++)put(dx,12,dz,33);
        for(let dz=-4;dz<=3;dz++)for(let dx=-3;dx<=3;dx++)put(dx,13,dz,33);
        // Lit resting corner under the platform; central entry remains open.
        put(2,0,-2,9);put(2,1,-2,19);put(2,0,1,18);
        deck=Object.freeze([x+.5,y+8.01,z-2.5]);
        stairs=Object.freeze({start:Object.freeze([x-1.5,y+.01,z+6.5]),
          top:Object.freeze([x-1.5,y+8.01,z-1.5]),width:2,steps:8,rise:8,facing:'north'});
      } else if(kind==='granary') {
        for(let dz=-5;dz<=5;dz++)for(let dx=-4;dx<=4;dx++) {
          put(dx,-1,dz,49);
          if(Math.abs(dx)!==4&&Math.abs(dz)!==5)continue;
          for(let dy=0;dy<4;dy++) {
            let id=Math.abs(dx)===4&&Math.abs(dz)===5?47:49;
            if(Math.abs(dx)===4&&(dz===-2||dz===1)&&(dy===1||dy===2))id=10;
            if(dz===5&&Math.abs(dx)<=1&&dy<3)id=0;
            put(dx,dy,dz,id);
          }
        }
        for(let dx=-4;dx<=4;dx++)for(const dz of [-5,5])
          for(let dy=4;dy<4+Math.max(0,4-Math.abs(dx));dy++)put(dx,dy,dz,dx===0&&dy===5?10:49);
        for(let dz=-6;dz<=6;dz++)for(let dx=-5;dx<=5;dx++)put(dx,4+Math.max(0,4-Math.abs(dx)),dz,11);
        for(const dx of [-3,3])for(const dz of [-3,-2]){put(dx,0,dz,35);put(dx,1,dz,35);}
        put(-3,0,2,18);put(3,0,2,32);
        for(const dx of [-3,3]){put(dx,0,4,9);put(dx,1,4,19);}
      } else {
        for(let dz=-4;dz<=4;dz++)for(let dx=-5;dx<=5;dx++) {
          if(Math.abs(dx)!==5&&Math.abs(dz)!==4)continue;
          if(Math.abs(dz)===4&&Math.abs(dx)<=1)continue;
          const tall=1+hash2(seed+7433,x+dx,z+dz)%3;
          for(let dy=0;dy<tall;dy++)put(dx,dy,dz,dy%2?9:34);
        }
        for(const dx of [-3,3])for(let dz=-1;dz<=1;dz++)for(let dy=0;dy<5;dy++)put(dx,dy,dz,dy%3?34:9);
        for(let dx=-3;dx<=3;dx++)for(const dz of [-1,0,1])put(dx,5,dz,34);
        for(const dx of [-3,-2,2,3])put(dx,6,0,9);
        put(-3,7,0,34);put(-3,8,0,19);
        for(const dx of [-4,4]){put(dx,0,3,9);put(dx,1,3,19);}
      }
      const writes=Array.from(cells.values());for(const c of writes)Object.freeze(c);
      const actual=shapeBounds(writes);
      const names={watchtower:'Tháp canh gỗ',granary:'Nhà kho mái gạch','ruined-gateway':'Cổng đá đổ'};
      return Object.freeze({kind,name:names[kind],x,y,z,facing:'south',
        bounds:Object.freeze({...bounds,maxY:actual.maxY}),
        entry:Object.freeze([x+.5,y+.01,z+5.5]),approach:Object.freeze([x+.5,y+.01,z+7.5]),
        interior:Object.freeze([x+.5,y+.01,z+.5]),
        outsideApproach:Object.freeze([x+.5,outsideY+.01,z+9.5]),entrySteps:Object.freeze(entrySteps),
        deck,stairs,cells:Object.freeze(writes)});
    }
    function applyStructures(seed,cx,cz,data) {
      const wx=cx*SIZE,wz=cz*SIZE;
      for(const s of structureSites(seed)) {
        const b=s.bounds;if(wx+SIZE-1<b.minX||wx>b.maxX||wz+SIZE-1<b.minZ||wz>b.maxZ)continue;
        for(const c of s.cells)if(c.x>=wx&&c.x<wx+SIZE&&c.z>=wz&&c.z<wz+SIZE)
          data[c.x-wx+SIZE*(c.z-wz+SIZE*c.y)]=c.id;
      }
    }

    return { coordinates, SIZE, HEIGHT, SEA, generate, height, biome, hashSeed, village, treeFamilies, treeShape, treeAt, TREE_HALO, structureSites, structureStats, STRUCTURE_LIMITS };
  };
  V.core = V.createVoxelCore(V.coordinates);
  V.CORE_SOURCE = V.createVoxelCore.toString();
})();

