/* MảiMêRáp — cached volumetric held items with a shared physical texel pitch.
 * Original apple, tool and torch bodies retain their depth and stepped geometry.
 * uvScale is texture repeats per model unit, independent of each part's size.
 * heldCubes returns a reusable per-item pose buffer; render it synchronously.
 */
(() => {
  'use strict';
  const V = globalThis.Voxel ||= {};
  const PIXEL = .052, HELD_UV_SCALE = 2.5, legacyCache = new Map();
  const localSidecars=new WeakMap(),localItems=new Map();
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const SKIN = [.92, .67, .48], SLEEVE = [.29, .49, .34];
  const HANDLE = [[3,-4],[2,-3],[2,-2],[1,-1],[1,0],[0,1],[0,2],[-1,3]];
  const PICK_HEAD = [
    [-5,3],[-4,4],[-3,5],[-2,5],[-1,5],[0,5],[1,4],[2,3],[3,2],
    [-4,3],[-3,4],[-2,4],[-1,4],[0,4],[1,3],[2,2]
  ];
  const PICK_MATERIAL = {
    102: { id: 5, tint: [1.24, 1.10, .85], edge: [1.40, 1.25, .98] },
    103: { id: 9, tint: [1.05, 1.10, 1.10], edge: [1.28, 1.32, 1.30] },
    104: { id: 20, tint: [.72, .82, .86], edge: [.96, 1, 1] },
    105: { id: 20, tint: [.16, .72, .69], edge: [.43, 1, .91] }
  };

  // Preserve the original volume. A lobe, stem, blade and handle all sample the
  // same number of source texels per model unit instead of one tile per part.
  function legacyModel(id) {
    if (legacyCache.has(id)) return legacyCache.get(id);
    const parts = [], isBlock=id>0 && V.blocks?.[id] && id!==19;
    const layers=V.textureLayers||{}, woodTiles=Number.isInteger(layers.heldWood)?Array(6).fill(layers.heldWood):null;
    const flameTiles=Number.isInteger(layers.heldFlame)?Array(6).fill(layers.heldFlame):null;
    const add = (x, y, z, w, h, d, tile, tint, emissive = 0) => {
      const tiles=!isBlock && id===19 && emissive>=.8 ? flameTiles : !isBlock && tile===5 ? woodTiles : null;
      parts.push({ p: [x, y, z], s: [w, h, d], id: tile, tint, emissive, light: 1,
        uvScale:isBlock?0:HELD_UV_SCALE,...(tiles?{tiles}:{}) });
    };
    const pixel = (x, y, tile, tint, z = 0, depth = .075) => {
      add(x * PIXEL, y * PIXEL, z, PIXEL * 1.06, PIXEL * 1.06, depth, tile, tint);
    };
    const grip = (x = .15, y = -.22) => {
      const begin=parts.length;
      add(x, y, .066, .15, .17, .16, 20, SKIN);
      add(x + .035, y - .17, .058, .18, .19, .18, 20, SLEEVE);
      localSidecars.set(parts,{grip:[x,y,.066],indices:[...(localSidecars.get(parts)?.indices||[]),begin,begin+1]});
    };
    const shaft = () => {
      for (let i = 0; i < HANDLE.length; i++) {
        const [x, y] = HANDLE[i];
        pixel(x, y, 5, i % 2 ? [1.14, 1.02, .91] : [1.05, .95, .85], 0, .075);
      }
    };

    if (id === 18 && V.blocks?.[id]?.shape === 'worktable') {
      // The held table uses the same disjoint parts and top material as terrain.
      // Preserve the existing block envelope, wrist transform and cached pose buffer.
      const def=V.blocks[id],center=[.055,.025,.065],scale=.30;
      for(let i=0;i<def.tableBoxes.length;i++){
        const box=def.tableBoxes[i],p=center.map((n,a)=>n+scale*((box[a]+box[a+3])/32-.5));
        const size=[0,1,2].map(a=>scale*(box[a+3]-box[a])/16);
        add(...p,...size,id,[1,1,1],def.emissive||0);
        const tiles=Array(6).fill(def.tableFrameTile);if(i===0)tiles[2]=def.tiles[2];
        parts[parts.length-1].tiles=tiles;
      }
    } else if (V.blocks?.[id]?.shape === 'boxes') {
      const def=V.blocks[id],center=[.055,.025,.065],scale=.30;
      for(let i=0;i<def.boxes.length;i++){
        const box=def.boxes[i],p=center.map((n,a)=>n+scale*((box[a]+box[a+3])/32-.5)),size=[0,1,2].map(a=>scale*(box[a+3]-box[a])/16);
        add(...p,...size,id,[1,1,1],def.emissive||0);
        const part=parts[parts.length-1];part.tiles=(def.boxTiles?.[i]||def.tiles).slice();part.uvScale=1/scale;
      }
    } else if (id>0 && V.blocks?.[id] && id !== 19) {
      // Other blocks keep their existing single-cube silhouette and atlas material.
      add(.055, .025, .065, .30, .30, .30, id, [1, 1, 1], V.blocks?.[id]?.emissive || 0);
    } else if (PICK_MATERIAL[id]) {
      const material = PICK_MATERIAL[id];
      shaft();
      for (const [x, y] of PICK_HEAD) {
        const topEdge = y === 5 || (x === -4 && y === 4) || (x === 1 && y === 4);
        pixel(x, y, material.id, topEdge ? material.edge : material.tint, 0, .090);
      }
      // A warm, thin inset keeps the wooden shaft legible against dark terrain.
      for (const [x, y] of [[2,-2],[1,0],[0,2]]) {
        add(x * PIXEL - .009, y * PIXEL + .006, .042, .018, .038, .010, 20, [.66, .45, .24]);
      }
      grip();
    } else if (id === 124) {
      shaft();
      // Stone L blade uses the common physical texel pitch of the held tools.
      for (const [x,y] of [[-1,4],[-2,4],[-3,4],[-4,4],[-5,4],[-5,3],[-5,2]]) {
        pixel(x,y,9,y===4?[1.13,1.20,1.17]:[.89,.98,.94],0,.10);
      }
      add(-.154,.218,.057,.135,.018,.012,20,[.67,.73,.70]);
      grip();
    } else if (id === 106) {
      shaft();
      // The axe has a broad, stepped blade on one side of the haft.
      for (const [left, y, count] of [[-3,6,3],[-4,5,5],[-5,4,6],[-5,3,4],[-4,2,2]]) {
        for (let x = left; x < left + count; x++) {
          pixel(x, y, 9, x === left ? [1.36, 1.43, 1.40] : [.96, 1.03, 1.03], 0, .10);
        }
      }
      add(-.025, .215, .058, .055, .085, .018, 20, [.41, .46, .45]);
      grip();
    } else if (id === 107) {
      // Overlapping square pixels form a diagonal blade without unsupported roll rotations.
      for (let i = 0; i < 4; i++) {
        add(.012 + i * .024, -.035 - i * .048, 0, .066, .065, .075, 5, [1.13, .98, .85]);
      }
      add(.105, -.231, 0, .085, .074, .09, 20, [.43, .52, .56]);
      for (let i = -2; i <= 2; i++) {
        add(-.014 + i * .046, -.013 + i * .022, 0, .060, .060, .10, 20,
          Math.abs(i) === 2 ? [.40, .51, .56] : [.65, .74, .76]);
      }
      for (let i = 0; i < 8; i++) {
        const x = -.022 - i * .024, y = .047 + i * .048;
        add(x, y, 0, .080, .066, .067, 20, [.66, .77, .81]);
        add(x + .028, y + .006, .006, .026, .063, .074, 20, [.97, 1, 1]);
      }
      add(-.211, .435, 0, .053, .055, .065, 20, [.90, .98, 1]);
      grip(.099, -.208);
    } else if (id === 19) {
      add(.025, -.15, 0, .071, .27, .071, 5, [1.15, 1.00, .85]);
      add(.025, .0575, 0, .071, .145, .071, 5, [1.24, 1.07, .88]);
      add(.025, .140, 0, .12, .07, .11, 20, [.40, .29, .18]);
      add(.025, .15975, 0, .13, .0105, .12, 20, [.75, .48, .20], .2);
      add(-.011, -.055, .041, .013, .15, .010, 20, [.74, .48, .22]);
      add(-.011, .071, .041, .013, .075, .010, 20, [.86, .59, .26]);
      add(.025, .235, 0, .13, .14, .12, 28, [1, .69, .28], 1);
      add(-.023, .286, .008, .065, .125, .075, 28, [1, .83, .45], 1);
      add(.039, .320, -.005, .058, .15, .062, 28, [1, .91, .61], 1);
      add(.017, .273, .067, .057, .10, .020, 20, [1, .97, .77], 1);
      add(.075, .220, -.012, .046, .077, .068, 28, [1, .55, .18], 1);
      grip(.035, -.205);
    } else if (id === 108) {
      const red = [1, .35, .28], darkRed = [.81, .24, .23];
      add(0, .015, .045, .25, .245, .19, 31, red);
      add(-.130, .022, .040, .075, .17, .16, 31, darkRed);
      add(.130, .022, .040, .075, .17, .16, 31, red);
      add(-.073, .155, .043, .13, .08, .16, 31, [1, .39, .29]);
      add(.073, .155, .043, .13, .08, .16, 31, red);
      add(-.067, -.125, .045, .125, .075, .16, 31, darkRed);
      add(.067, -.125, .045, .125, .075, .16, 31, red);
      add(0, .218, .043, .039, .107, .041, 5, [1.10, .89, .64]);
      add(.063, .247, .045, .093, .045, .058, 20, [.27, .63, .20]);
      add(.119, .261, .045, .044, .033, .049, 20, [.42, .77, .25]);
      add(-.073, .078, .147, .034, .064, .013, 20, [1, .42, .34]);
      add(-.040, .111, .146, .033, .025, .012, 20, [1, .55, .42]);
      grip(.075, -.228);
    } else if (id === 101) {
      shaft();
      grip();
    } else if (id >= 109 && id <= 114) {
      // Materials also remain visible when selected; these small silhouettes match their type.
      const tints = {
        109: [.16, .19, .22], 110: [.82, .90, .91], 111: [.74, .53, .40],
        112: [.20, .86, .85], 113: [.85, .62, .23], 114: [1, .80, .27]
      };
      const tint = tints[id];
      if (id === 110 || id === 114) {
        add(0, .014, .035, .28, .11, .15, 20, tint);
        add(0, .082, .035, .22, .038, .12, 20, tint.map(c => Math.min(1, c * 1.10)));
      } else if (id === 112) {
        add(0, .024, .035, .18, .18, .12, 20, tint);
        add(0, .150, .035, .105, .075, .10, 20, [.49, 1, .96]);
        add(0, -.105, .035, .087, .075, .095, 20, [.13, .61, .67]);
        add(-.121, .025, .035, .065, .10, .10, 20, [.29, .93, .88]);
        add(.121, .025, .035, .065, .10, .10, 20, [.15, .68, .74]);
      } else {
        add(0, .018, .035, .20, .20, .17, 20, tint);
        add(-.10, -.027, .035, .075, .14, .13, 20, tint);
        add(.09, .064, .035, .08, .13, .14, 20, tint.map(c => Math.min(1, c * 1.16)));
      }
      grip(.055, -.195);
    } else if (id === 0) {
      // A continuous wrist plane joins the relaxed fist and sleeved forearm.
      // Their shared rigid orientation is applied only in the empty-hand pose.
      add(0, .05, 0, .19, .18, .20, 20, SKIN);
      add(0, -.20, 0, .19, .32, .20, 20, SLEEVE);
    } else {
      // Preserve the original fallback for any unrecognized nonempty item.
      add(0, -.010, .065, .21, .29, .22, 20, SKIN);
      add(.026, -.274, .055, .24, .27, .24, 20, SLEEVE);
    }
    legacyCache.set(id, parts);
    return parts;
  }

  const BASE_GRID=16,ITEM_PIXEL=.044,PLANT_PIXEL=.030,TORCH_PIXEL=.035,THICKNESS=.045;
  const PACK_GRIDS=Object.freeze({legacy16:16,legacy24:24,native24:24});
  const activePack=()=>Object.hasOwn(PACK_GRIDS,V.activeTexturePack)?V.activeTexturePack:'legacy16';
  const activeGrid=()=>PACK_GRIDS[activePack()];
  const models=new Map(),canvasPixels=new WeakMap();
  let generationCount=0,pixelReads=0;
  const normalizedId=id=>Number.isInteger(id)&&id>0&&V.items?.[id]?id:0;

  function readCanvas(canvas,grid){
    if(!canvas||typeof canvas.getContext!=='function'||canvas.width!==grid||canvas.height!==grid)return null;
    if(canvasPixels.has(canvas))return canvasPixels.get(canvas);
    let data=null;
    try{
      const ctx=canvas.getContext('2d');
      if(ctx&&typeof ctx.getImageData==='function'){
        const image=ctx.getImageData(0,0,grid,grid);
        if(image?.data?.length===grid*grid*4){data=Uint8Array.from(image.data);pixelReads++;}
      }
    }catch(_){/* A missing or unavailable canvas uses a bounded plant fallback. */}
    canvasPixels.set(canvas,data);return data;
  }
  const part=(p,s,id,tint,emissive=0,kind=0)=>({p,s,id,tint,emissive,kind,light:1,uvScale:kind===0?HELD_UV_SCALE:0});
  function addGrip(parts,kind,item){
    const begin=parts.length;
    const food=item?.kind==='food',plant=kind==='plant-sprite',torch=kind==='torch-sprite';
    const x=plant?.035:torch?.025:food?.115:item?.tool==='shears'?.145:-.145,y=plant?-.240:-.185;
    parts.push(part([x,y,.073],[.15,.16,.13],20,SKIN));
    parts.push(part([x+.025,y-.17,.060],[.18,.19,.16],20,SLEEVE));
    localSidecars.set(parts,{grip:[x,y,.073],indices:[begin,begin+1]});
  }
  // Native24 adds a bounded, cached thickness profile to loose charcoal and
  // duck breast only. The source silhouette, colors and Legacy16 geometry stay exact.
  function nativeRelief(id,pixels,grid){
    if(grid!==24||(id!==191&&id!==195&&id!==196))return null;
    const distance=new Uint8Array(grid*grid),depths=new Float64Array(grid*grid);
    for(let y=0;y<grid;y++)for(let x=0;x<grid;x++){
      const k=x+y*grid;if(pixels[k*4+3]<128)continue;
      distance[k]=Math.min(x?distance[k-1]+1:1,y?distance[k-grid]+1:1);
    }
    for(let y=grid-1;y>=0;y--)for(let x=grid-1;x>=0;x--){
      const k=x+y*grid;if(!distance[k])continue;
      distance[k]=Math.min(distance[k],x+1<grid?distance[k+1]+1:1,y+1<grid?distance[k+grid]+1:1);
      depths[k]=id===191?.065+.022*Math.min(5,distance[k]-1):.052+.010*Math.min(4,distance[k]-1);
    }
    return depths;
  }
  function pixelModel(id,kind,pixels,grid){
    const item=V.items[id],isTorch=kind==='torch-sprite',size=(isTorch?TORCH_PIXEL:kind==='plant-sprite'?PLANT_PIXEL:ITEM_PIXEL)*(BASE_GRID/grid);
    let lastRow=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>=128)lastRow=Math.floor(i/(grid*4));
    // Align the lowest visible row with the grip, keeping the complete item
    // silhouette in view at rest while preserving the icon's aspect ratio.
    const lift=(lastRow+1-grid/2)*size-(kind==='plant-sprite'?.15:.105);
    const parts=[],runs=[],tints=new Map(),relief=nativeRelief(id,pixels,grid);let pixelCount=0;
    for(let y=0;y<grid;y++)for(let x=0;x<grid;){
      const q=(x+y*grid)*4;if(pixels[q+3]<128){x++;continue;}
      const color=[pixels[q],pixels[q+1],pixels[q+2]],key=color.join(',');let width=1;
      while(x+width<grid){const n=(x+width+y*grid)*4;if(pixels[n+3]<128||pixels[n]!==color[0]||pixels[n+1]!==color[1]||pixels[n+2]!==color[2]||(relief&&relief[x+width+y*grid]!==relief[x+y*grid]))break;width++;}
      if(!tints.has(key))tints.set(key,color.map(c=>c/255));
      // Icon X is unchanged. Top-left image rows become upward local Y.
      // Torch depth also uses whole cells: three for wood, four for flame,
      // sharing one rear plane. No material texture is stretched over a run.
      const flame=isTorch&&color[0]>=200&&color[1]>=110;
      const depth=isTorch?(flame?4:3)*size:relief?relief[x+y*grid]:THICKNESS,z=isTorch&&flame?.025+size/2:.025;
      const emissive=flame?(color[1]>=190?1:.8):0;
      parts.push(part([(x+width/2-grid/2)*size,(grid/2-y-.5)*size+lift,z],[width*size,size,depth],20,tints.get(key),emissive,-1));
      runs.push({x,y,width,color,depth,z,emissive});pixelCount+=width;x+=width;
    }
    addGrip(parts,kind,item);
    return {parts,runs,pixelCount,pixelSize:size,lift,pixels};
  }
  function plantFallback(id){
    const hex=V.items[id]?.color||'#6f934e',n=parseInt(hex.slice(1),16),color=[(n>>16)/255,((n>>8)&255)/255,(n&255)/255];
    const parts=[part([0,-.075,.025],[.033,.25,THICKNESS],20,[.39,.28,.15],0,-1),
      part([-.045,.060,.025],[.105,.080,THICKNESS],20,color,0,-1),
      part([.038,.135,.025],[.115,.080,THICKNESS],20,color,0,-1),
      part([-.020,.205,.025],[.075,.060,THICKNESS],20,color,0,-1)];
    addGrip(parts,'plant-sprite',V.items[id]);
    return {parts,runs:[],pixelCount:0,pixelSize:PLANT_PIXEL,lift:.080,pixels:null};
  }
  function model(id){
    const packId=activePack(),grid=PACK_GRIDS[packId],cacheKey=packId+':'+id;
    const block=V.blocks?.[id],item=V.items?.[id];
    let kind='legacy',source=null,pixels=null;
    if(id===19 || (id>=101&&id<=114) || id===124){
      // The original 3D bodies remain the active path even when icon pixels exist.
      kind='volume';
    }else if(item&&item.kind!=='block'&&typeof V.getItemSprite==='function'){
      const sprite=V.getItemSprite(id,packId);
      if(sprite?.size===grid&&sprite.origin==='top-left'&&sprite.data?.length===grid*grid*4){kind='item-sprite';source=sprite;pixels=sprite.data;}
    }else if(block?.render==='cross'){
      kind='plant-sprite';source=V.textureCanvases?.[block.tiles[0]]||null;
    }
    const previous=models.get(cacheKey);
    if(previous&&previous.kind===kind&&previous.source===source)return previous;
    if(kind==='plant-sprite'||kind==='torch-sprite')pixels=readCanvas(source,grid);
    const built=kind==='legacy'||kind==='volume'?{parts:legacyModel(id),runs:[],pixelCount:0,pixelSize:0,lift:0,pixels:null}
      :pixels?pixelModel(id,kind,pixels,grid):plantFallback(id);
    for(const p of built.parts){Object.freeze(p.p);Object.freeze(p.s);Object.freeze(p.tint);if(p.tiles)Object.freeze(p.tiles);Object.freeze(p);}
    const posed=built.parts.map(p=>({p:[0,0,0],s:id===0?p.s.slice():p.s,id:p.id,yaw:0,tint:p.tint,emissive:p.emissive,kind:p.kind??0,light:p.light,
      uvScale:p.uvScale??0,...(p.tiles?{tiles:p.tiles}:{})}));
    const result={...built,kind,source,posed,packId,gridSize:grid};models.set(cacheKey,result);generationCount++;return result;
  }

  V.heldCubes = function heldCubes(id, pose = {}) {
    id = normalizedId(id);pose=pose&&typeof pose==='object'?pose:{};
    const swing = clamp(Number.isFinite(pose.swing) ? pose.swing : 0, 0, 1);
    const walk = Number.isFinite(pose.walk) ? pose.walk : 0;
    const sway = Math.sin(walk) * .014, bob = Math.sin(walk * 2) * .006;
    if (id === 0) {
      const math=V.RigidCubeMath;if(!math)throw Error('Empty hand requires the existing rigid cube transform');
      const aspect=clamp(Number.isFinite(pose.aspect)&&pose.aspect>0?pose.aspect:1.5,.35,3);
      const scale=clamp(aspect/.9,.62,1),stroke=Math.sin(Math.PI*swing);
      const rotation=math.fromEuler(-.22-.06*stroke,-.62-.28*stroke,.38-.12*stroke);
      // Keep the wrist near the lower-right edge of the65-degree hand frustum.
      // The forearm runs down/outward; the knuckles point inward and forward.
      const wrist=[.58*.90*aspect*Math.tan(65*Math.PI/360)+sway*.65*scale-.075*stroke*scale,
        -.39+bob+.055*stroke*scale,-.90-.14*stroke];
      const m=model(0);
      for(let i=0;i<m.parts.length;i++){
        const part=m.parts[i],cube=m.posed[i],local=math.rotate(rotation,part.p);
        for(let a=0;a<3;a++){cube.p[a]=wrist[a]+local[a]*scale;cube.s[a]=part.s[a]*scale;}
        cube.rigid=true;delete cube.yaw;cube.rotationQuaternion=rotation;
      }
      return m.posed;
    }
    // The four pickaxes share one rigid wrist pivot: turn the head away from
    // the viewer into a ready strike. Keep all original voxels, depth and UVs.
    if (PICK_MATERIAL[id]) {
      const stroke=Math.sin(Math.PI*swing),yaw=1.12+.28*stroke;
      const c=Math.cos(yaw),s=Math.sin(yaw),restC=Math.cos(-.22),restS=Math.sin(-.22);
      const gripX=.15,gripY=-.22,gripZ=.066;
      const x=.47+sway+gripX*restC-gripZ*restS-.055*stroke;
      const y=-.405+bob+gripY-.075*stroke;
      const z=-.94+gripX*restS+gripZ*restC-.085*stroke;
      const m=model(id);
      for(let i=0;i<m.parts.length;i++){
        const part=m.parts[i],cube=m.posed[i],dx=part.p[0]-gripX,dz=part.p[2]-gripZ;
        cube.p[0]=x+dx*c-dz*s;cube.p[1]=y+part.p[1]-gripY;
        cube.p[2]=z+dx*s+dz*c;cube.yaw=yaw;
      }
      return m.posed;
    }
    const isBlock = id>0&&V.blocks?.[id]&&id!==19&&V.blocks[id].render!=='cross';
    const yaw = (isBlock ? -.42 : -.22) - swing * .15;
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const baseX = .47 + sway - swing * .105;
    const baseY = -.405 + bob - swing * .075 + (id===108 ? .07 : 0);
    const baseZ = -.94 + swing * .07;
    const m=model(id);
    for(let i=0;i<m.parts.length;i++){
      const part=m.parts[i],cube=m.posed[i];cube.p[0]=baseX+part.p[0]*c-part.p[2]*s;
      cube.p[1]=baseY+part.p[1];cube.p[2]=baseZ+part.p[0]*s+part.p[2]*c;cube.yaw=yaw;
    }
    return m.posed;
  };
  V.heldLocalItem=function heldLocalItem(id){
    id=normalizedId(id);const m=model(id),cacheKey=m.packId+':'+id,prior=localItems.get(cacheKey);if(prior?.model===m)return prior.value;
    const side=localSidecars.get(m.parts),omit=new Set(side?.indices||[]),parts=id===0?[]:m.parts.filter((p,i)=>!omit.has(i));
    const grip=Object.freeze((side?.grip||[.055,-.125,.065]).slice());
    const flames=parts.filter(p=>(p.emissive||0)>=.8);const flamePoint=flames.length?Object.freeze([0,1,2].map(a=>flames.reduce((n,p)=>n+p.p[a],0)/flames.length)):null;
    const value=Object.freeze({id,kind:m.kind,parts:Object.freeze(parts),grip,flamePoint,excludedGripParts:id===0?m.parts.length:omit.size,modelGeneration:generationCount});localItems.set(cacheKey,{model:m,value});return value;
  };
  V.heldModelInfo=Object.freeze({
    version:4,baseGridSize:BASE_GRID,supportedGridSizes:Object.freeze([16,24]),get packId(){return activePack();},get gridSize(){return activeGrid();},
    get itemPixelSize(){return ITEM_PIXEL*BASE_GRID/activeGrid();},get plantPixelSize(){return PLANT_PIXEL*BASE_GRID/activeGrid();},get torchPixelSize(){return TORCH_PIXEL*BASE_GRID/activeGrid();},thickness:THICKNESS,
    volumeUvScale:HELD_UV_SCALE,get volumeTexelsPerUnit(){return activeGrid()*HELD_UV_SCALE;},get volumeTexelPitch(){return 1/(activeGrid()*HELD_UV_SCALE);},
    get generationCount(){return generationCount;},get canvasPixelReads(){return pixelReads;},
    inspect(id){id=normalizedId(id);const m=model(id);return {id,kind:m.kind,packId:m.packId,gridSize:m.gridSize,pixelCount:m.pixelCount,pixelSize:m.pixelSize,lift:m.lift,
      runCount:m.runs.length,totalCubes:m.parts.length,usesTexturePixels:!!m.pixels,
      uvScales:[...new Set(m.parts.filter(p=>(p.kind??0)===0).map(p=>p.uvScale??0))],
      rgba:m.pixels?Uint8Array.from(m.pixels):null,
      runs:m.runs.map(r=>({x:r.x,y:r.y,width:r.width,color:Array.from(r.color),depth:r.depth,z:r.z,emissive:r.emissive}))};}
  });
})();
