/* MảiMêRáp import base-world adapter. Pure JS, no I/O or game-side mutation.
 * Catalog verified against candidate/src/catalog.js SHA256
 * c6fa7aa3ddb75ce7a5c8dea0d8f2aad62867b27c82efabf17de17c03f7b25370.
 * Mapping category "exact" describes supported block identity without extra
 * source states, not a claim of identical Minecraft textures/gameplay.
 */
(function (root) {
  'use strict';
  const SIZE = 16, HEIGHT = 96, CELLS = 24576, MAX_CHUNKS = 64, PLACEHOLDER = 59;
  const LEGACY_MAPPING_PROFILE='cube-map-v1',CURRENT_MAPPING_PROFILE='cube-map-v2';
  const MAPPING_PROFILES=Object.freeze([LEGACY_MAPPING_PROFILE,CURRENT_MAPPING_PROFILE]);
  const CATALOG = [[0,"air",false],[1,"grass",true],[2,"dirt",true],[3,"stone",true],[4,"sand",true],[5,"oak_log",true],[6,"oak_leaves",true],[7,"water",false],[8,"planks",true],[9,"cobblestone",true],[10,"glass",true],[11,"brick",true],[12,"snow",true],[13,"bedrock",true],[14,"coal_ore",true],[15,"iron_ore",true],[16,"gold_ore",true],[17,"diamond_ore",true],[18,"crafting_table",true],[19,"torch",false],[20,"white_wool",true],[21,"basalt",true],[22,"flower",false],[23,"tall_grass",false],[24,"spruce_log",true],[25,"spruce_leaves",true],[26,"clay",true],[27,"gravel",true],[28,"glowstone",true],[29,"obsidian",true],[30,"cactus",true],[31,"pink_wool",true],[32,"furnace",true],[33,"dark_planks",true],[34,"stone_bricks",true],[35,"bookshelf",true],[36,"oak_sapling",false],[37,"spruce_sapling",false],[38,"farmland",true],[39,"wheat_0",false],[40,"wheat_1",false],[41,"wheat_2",false],[42,"wheat_3",false],[43,"birch_log",true],[44,"birch_leaves",true],[45,"birch_planks",true],[46,"birch_sapling",false],[47,"acacia_log",true],[48,"acacia_leaves",true],[49,"acacia_planks",true],[50,"acacia_sapling",false],[51,"cherry_log",true],[52,"cherry_leaves",true],[53,"cherry_planks",true],[54,"cherry_sapling",false],[55,"red_wool",true],[56,"blue_wool",true],[57,"yellow_wool",true],[58,"green_wool",true],[59,"purple_wool",true],[60,"orange_wool",true],[61,"cyan_wool",true],[62,"black_wool",true],[63,"smooth_stone",true],[64,"polished_basalt",true],[65,"chiseled_stone",true],[66,"terracotta_tiles",true],[67,"ember_rock",true],[68,"ember_bricks",true],[69,"lava",false],[70,"glow_crystal",true],[71,"rift_frame",true],[72,"rift",false],[73,"sky_stone",true],[74,"sky_grass",true],[75,"cloud_glass",true],[76,"sun_crystal",true],[77,"sky_anchor",true],[78,"sky_portal",false],[79,"oak_parquet",true],[80,"spruce_panel",true],[81,"birch_weave",true],[82,"acacia_mosaic",true],[83,"cherry_panel",true],[84,"sandstone",true],[85,"sandstone_bricks",true],[86,"limestone",true],[87,"limestone_tiles",true],[88,"slate_tiles",true],[89,"mossy_cobble",true],[90,"pink_granite",true],[91,"ceramic_ivory",true],[92,"ceramic_red",true],[93,"ceramic_ochre",true],[94,"ceramic_green",true],[95,"ceramic_blue",true],[96,"ceramic_black",true],[97,"riveted_iron",true],[98,"checker_stone",true]];
  const EXACT = Object.freeze({air:0,cave_air:0,void_air:0,grass_block:1,dirt:2,stone:3,sand:4,oak_log:5,oak_leaves:6,
    oak_planks:8,cobblestone:9,glass:10,bricks:11,snow_block:12,bedrock:13,coal_ore:14,iron_ore:15,gold_ore:16,
    diamond_ore:17,crafting_table:18,torch:19,white_wool:20,basalt:21,spruce_log:24,spruce_leaves:25,clay:26,
    gravel:27,glowstone:28,obsidian:29,cactus:30,pink_wool:31,spruce_planks:33,stone_bricks:34,bookshelf:35,
    oak_sapling:36,spruce_sapling:37,birch_log:43,birch_leaves:44,birch_planks:45,birch_sapling:46,
    acacia_log:47,acacia_leaves:48,acacia_planks:49,acacia_sapling:50,cherry_log:51,cherry_leaves:52,
    cherry_planks:53,cherry_sapling:54,red_wool:55,blue_wool:56,yellow_wool:57,green_wool:58,purple_wool:59,
    orange_wool:60,cyan_wool:61,black_wool:62,smooth_stone:63,polished_basalt:64,chiseled_stone_bricks:65,
    sandstone:84,mossy_cobblestone:89});
  const APPROX = Object.freeze({water:7,flowing_water:7,lava:69,flowing_lava:69,furnace:32,lit_furnace:32,
    farmland:38,dandelion:22,poppy:22,blue_orchid:22,allium:22,azure_bluet:22,oxeye_daisy:22,cornflower:22,
    lily_of_the_valley:22,short_grass:23,grass:23,tall_grass:23,fern:23,large_fern:23,snow:12,snow_layer:12,
    coarse_dirt:2,podzol:2,rooted_dirt:2,mycelium:1,mud:2,deepslate:3,cobbled_deepslate:9,tuff:3,
    andesite:3,diorite:86,granite:90,polished_andesite:63,polished_diorite:86,polished_granite:90,
    red_sand:4,red_sandstone:84,cut_sandstone:84,chiseled_sandstone:84,smooth_sandstone:84,
    cracked_stone_bricks:34,mossy_stone_bricks:34,terracotta:66,netherrack:67,nether_bricks:68,red_nether_bricks:68,
    end_stone:73,end_stone_bricks:73,white_terracotta:91,red_terracotta:92,yellow_terracotta:93,
    green_terracotta:94,blue_terracotta:95,black_terracotta:96,iron_block:97,
    deepslate_coal_ore:14,deepslate_iron_ore:15,deepslate_gold_ore:16,deepslate_diamond_ore:17,
    jungle_log:5,jungle_leaves:6,jungle_planks:8,jungle_sapling:36,dark_oak_log:24,dark_oak_leaves:25,
    dark_oak_planks:33,dark_oak_sapling:37,mangrove_log:5,mangrove_leaves:6,mangrove_planks:8,
    stripped_oak_log:5,stripped_spruce_log:24,stripped_birch_log:43,stripped_acacia_log:47,stripped_cherry_log:51,
    oak_wood:5,spruce_wood:24,birch_wood:43,acacia_wood:47,cherry_wood:51,wall_torch:19,
    light_blue_wool:56,light_gray_wool:20,gray_wool:62,lime_wool:58,magenta_wool:59,brown_wool:31});
  const WOODS = Object.freeze({oak:{log:5,leaves:6,planks:8,sapling:36},spruce:{log:24,leaves:25,planks:33,sapling:37},
    birch:{log:43,leaves:44,planks:45,sapling:46},acacia:{log:47,leaves:48,planks:49,sapling:50},
    cherry:{log:51,leaves:52,planks:53,sapling:54},jungle:{log:5,leaves:6,planks:8,sapling:36},dark_oak:{log:24,leaves:25,planks:33,sapling:37}});
  const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const REVERSE = new Int16Array(128).fill(-1);
  for (let i=0;i<BASE64.length;i++) REVERSE[BASE64.charCodeAt(i)] = i;
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  class ImportWorldError extends Error { constructor(code,message,details){super(message);this.name='MCImportWorldError';this.code=code;this.details=details||{};} }
  function fail(code,message,details){throw new ImportWorldError(code,message,details);}
  function int(n,label,min,max){if(!Number.isSafeInteger(n)||n<min||n>max)fail('IMPORT_INTEGER','Invalid '+label+'.',{value:n,min,max});return n;}
  function record(v){return !!v&&typeof v==='object'&&!Array.isArray(v)&&!ArrayBuffer.isView(v);}
  function known(id){return Number.isInteger(id)&&id>=0&&id<CATALOG.length&&CATALOG[id][0]===id;}
  function assertCatalog(blocks){
    if(!Array.isArray(blocks))fail('IMPORT_CATALOG','Game catalog is missing.');
    for(const[id,key,solid]of CATALOG)if(!blocks[id]||blocks[id].id!==id||blocks[id].key!==key||!!blocks[id].solid!==solid)fail('IMPORT_CATALOG','Game catalog no longer matches the import mapping.',{id,key});
    return true;
  }
  function cloneJSON(value,maxChars=8*1024*1024){
    let nodes=0,chars=0;const seen=new Set();
    function c(v,depth){
      if(++nodes>200000||depth>16)fail('IMPORT_METADATA_LIMIT','Import metadata is too complex.');
      if(v===null||typeof v==='boolean')return v;
      if(typeof v==='number'){if(!Number.isFinite(v))fail('IMPORT_METADATA_NUMBER','Metadata numbers must be finite.');return v;}
      if(typeof v==='string'){chars+=v.length;if(v.length>131072||chars>maxChars)fail('IMPORT_METADATA_LIMIT','Import metadata exceeds the string budget.');return v;}
      if(!v||typeof v!=='object'||ArrayBuffer.isView(v))fail('IMPORT_METADATA_TYPE','Metadata must contain JSON-compatible values only.');
      if(seen.has(v))fail('IMPORT_METADATA_CYCLE','Metadata contains a cycle.');seen.add(v);
      let out;
      if(Array.isArray(v)){if(v.length>8192)fail('IMPORT_METADATA_LIMIT','Metadata array is too large.');out=v.map(x=>c(x,depth+1));}
      else{out=Object.create(null);const keys=Object.keys(v);if(keys.length>128)fail('IMPORT_METADATA_LIMIT','Metadata object is too large.');for(const k of keys){if(k.length>256)fail('IMPORT_METADATA_LIMIT','Metadata key is too long.');out[k]=c(v[k],depth+1);if(k==='sha256'&&(typeof out[k]!=='string'||! /^[0-9a-f]{64}$/i.test(out[k])))fail('IMPORT_SOURCE_HASH','Invalid source SHA-256.');}}
      seen.delete(v);return out;
    }
    return c(value,0);
  }
  function stateParts(state){
    if(!record(state)||typeof state.name!=='string'||state.name.length<1||state.name.length>512)fail('IMPORT_STATE','Invalid source block state.');
    const properties=Object.create(null),p=state.properties===undefined?{}:state.properties;
    if(!record(p)||Object.keys(p).length>64)fail('IMPORT_STATE_PROPERTIES','Invalid source properties.');
    for(const k of Object.keys(p).sort()){const v=p[k];if(k.length>128||!['string','number','boolean'].includes(typeof v)||(typeof v==='string'&&v.length>1024)||(typeof v==='number'&&!Number.isFinite(v)))fail('IMPORT_STATE_PROPERTIES','Unsupported source property.',{property:k});properties[k]=v;}
    return {name:state.name,properties};
  }
  // Frozen v1 mapping: unversioned R8 saves must keep their original block IDs.
  function mapStateV1(state,options){
    const s=stateParts(state),name=s.name,props=s.properties,edition=options&&options.edition||'java';
    let gameId=PLACEHOLDER,category='unknown',reasons=['unknown-block-placeholder'];
    if(name.startsWith('minecraft:')){
      const key=name.slice(10);
      if(own(EXACT,key)){gameId=EXACT[key];category='exact';reasons=[];}
      else if(own(APPROX,key)){gameId=APPROX[key];category='approx';reasons=['closest-supported-block'];}
      if(key==='wheat'){
        const a=Number(props.age===undefined?(props.growth===undefined?0:props.growth):props.age);
        gameId=39+(Number.isInteger(a)&&a>=0&&a<=7?Math.min(3,Math.floor(a/2)):0);category='approx';reasons=['four-crop-stages'];
      }
      if(edition==='bedrock'){
        if(key==='grass'){gameId=1;category='exact';reasons=[];}
        if(['log','log2','leaves','leaves2','planks','sapling'].includes(key)){
          const wood=String(props.wood_type||props.old_log_type||props.new_log_type||props.old_leaf_type||props.new_leaf_type||props.sapling_type||'oak');
          const family=WOODS[wood],kind=key.startsWith('log')?'log':key.startsWith('leaves')?'leaves':key;
          if(family&&family[kind]!==undefined){gameId=family[kind];category='approx';reasons=['legacy-bedrock-state'];}
        }
        if(key==='wool'){
          const color=String(props.color||'white'),w=color+'_wool';
          if(own(EXACT,w)||own(APPROX,w)){gameId=own(EXACT,w)?EXACT[w]:APPROX[w];category='approx';reasons=['legacy-bedrock-state'];}
        }
        if(key==='stonebrick'){gameId=props.stone_brick_type==='chiseled'?65:34;category='approx';reasons=['legacy-bedrock-state'];}
        if(key==='brick_block'){gameId=11;category='exact';reasons=[];}
      }
      if(Object.keys(props).length&&category!=='unknown'){category='approx';reasons.push('source-states-not-simulated');}
      if(['water','flowing_water','lava','flowing_lava'].includes(key))reasons.push('fluid-simulation-not-equivalent');
      if(['furnace','lit_furnace'].includes(key))reasons.push('orientation-and-container-not-imported');
      if(key==='farmland')reasons.push('height-and-moisture-approximated');
    }
    return {name,properties:props,gameId,category,reasons:Array.from(new Set(reasons))};
  }
  function mappingProfile(value){
    if(typeof value!=='string'||!MAPPING_PROFILES.includes(value))fail('IMPORT_MAPPING_PROFILE','Unsupported imported-world mapping profile.',{profile:value});
    return value;
  }
  // These deprecated Bedrock names have distinct, bounded species properties.
  // Do not infer a species from an unrelated state key or a mod namespace.
  const LEGACY_WOOD_STATES=Object.freeze({
    log:['old_log_type','log',['oak','spruce','birch','jungle']],
    log2:['new_log_type','log',['acacia','dark_oak']],
    leaves:['old_leaf_type','leaves',['oak','spruce','birch','jungle']],
    leaves2:['new_leaf_type','leaves',['acacia','dark_oak']],
    planks:['wood_type','planks',['oak','spruce','birch','jungle','acacia','dark_oak']],
    wood:['wood_type','log',['oak','spruce','birch','jungle','acacia','dark_oak']]
  });
  function mapState(state,options){
    const opts=options||{},profile=mappingProfile(opts.mappingProfile===undefined?CURRENT_MAPPING_PROFILE:opts.mappingProfile),mapped=mapStateV1(state,opts);
    if(profile===LEGACY_MAPPING_PROFILE||opts.edition!=='bedrock'||!mapped.name.startsWith('minecraft:'))return mapped;
    const key=mapped.name.slice(10);if(!own(LEGACY_WOOD_STATES,key))return mapped;
    const [type,kind,allowed]=LEGACY_WOOD_STATES[key],props=mapped.properties,wood=props[type];
    const unknown=reason=>({...mapped,gameId:PLACEHOLDER,category:'unknown',reasons:['unknown-block-placeholder',reason]});
    if(!own(props,type)||typeof wood!=='string'||!allowed.includes(wood))return unknown('unsupported-legacy-wood-type');
    if(kind==='log'&&own(props,'pillar_axis')&&!['x','y','z'].includes(props.pillar_axis))return unknown('unsupported-axis-state');
    if(key==='wood'&&own(props,'stripped_bit')&&![0,1,false,true].includes(props.stripped_bit))return unknown('unsupported-stripped-state');
    const reasons=['legacy-bedrock-state','source-states-not-simulated'];
    if(wood==='jungle'||wood==='dark_oak')reasons.push('wood-species-approximated');
    if(kind==='log'&&(props.pillar_axis==='x'||props.pillar_axis==='z'))reasons.push('log-orientation-not-preserved');
    if(kind==='leaves')reasons.push('leaf-state-mechanics-not-simulated');
    if(key==='wood'){
      reasons.push('all-bark-wood-approximated');
      if(props.stripped_bit===1||props.stripped_bit===true)reasons.push('stripped-texture-not-preserved');
    }
    return {...mapped,gameId:WOODS[wood][kind],category:'approx',reasons};
  }
  function sourceAir(state){return state.name==='minecraft:air'||state.name==='minecraft:cave_air'||state.name==='minecraft:void_air';}
  function to64(bytes){let text='';for(let i=0;i<bytes.length;i+=3){const a=bytes[i],b=i+1<bytes.length?bytes[i+1]:0,c=i+2<bytes.length?bytes[i+2]:0;text+=BASE64[a>>>2]+BASE64[((a&3)<<4)|(b>>>4)]+(i+1<bytes.length?BASE64[((b&15)<<2)|(c>>>6)]:'=')+(i+2<bytes.length?BASE64[c&63]:'=');}return text;}
  function from64(text,maxBytes){
    if(typeof text!=='string'||!text.length||text.length%4||text.length>Math.ceil(maxBytes/3)*4)fail('IMPORT_BASE64','Invalid or oversized base64.');
    let pad=text.endsWith('==')?2:text.endsWith('=')?1:0,n=text.length/4*3-pad;
    if(n>maxBytes)fail('IMPORT_BASE64','Decoded base64 is too large.');const out=new Uint8Array(n);let p=0;
    for(let i=0;i<text.length;i+=4){const values=[];for(let j=0;j<4;j++){const ch=text.charCodeAt(i+j);if(ch===61){if(i+4!==text.length||j<2||j<4-pad)fail('IMPORT_BASE64','Invalid base64 padding.');values[j]=0;}else{if(ch>=128||REVERSE[ch]<0||i+j>=text.length-pad)fail('IMPORT_BASE64','Invalid base64 character.');values[j]=REVERSE[ch];}}
      const[a,b,c,d]=values;if(p<n)out[p++]=(a<<2)|(b>>>4);if(p<n)out[p++]=((b&15)<<4)|(c>>>2);if(p<n)out[p++]=((c&3)<<6)|d;
      if(i+4===text.length&&((pad===2&&(b&15))||(pad===1&&(c&3))))fail('IMPORT_BASE64','Noncanonical base64 pad bits.');
    }return out;
  }
  function encodeChunk(data){
    if(!(data instanceof Uint8Array)||data.length!==CELLS)fail('IMPORT_CHUNK_SIZE','Base chunks require24576 bytes.');
    const runs=[];for(let p=0;p<CELLS;){const id=data[p];if(!known(id))fail('IMPORT_BLOCK_ID','Unknown game block ID.',{id});let end=p+1;while(end<CELLS&&data[end]===id&&end-p<65535)end++;const count=end-p;runs.push(id,count&255,count>>>8);p=end;}
    return runs.length<data.length?['rle',to64(Uint8Array.from(runs))]:['raw',to64(data)];
  }
  function decodeChunk(row){
    if(!Array.isArray(row)||row.length!==4||!['raw','rle'].includes(row[2]))fail('IMPORT_CHUNK_RECORD','Invalid base chunk record.');
    const data=from64(row[3],row[2]==='raw'?CELLS:CELLS*3),out=new Uint8Array(CELLS);
    if(row[2]==='raw'){if(data.length!==CELLS)fail('IMPORT_CHUNK_SIZE','Raw chunk length is not24576.');out.set(data);}
    else{if(data.length%3)fail('IMPORT_RLE','Truncated RLE triple.');let at=0;for(let i=0;i<data.length;i+=3){const id=data[i],n=data[i+1]|(data[i+2]<<8);if(!known(id)||n===0||n>CELLS-at)fail('IMPORT_RLE','Invalid RLE block ID or run length.',{id,count:n,offset:at});out.fill(id,at,at+n);at+=n;}if(at!==CELLS)fail('IMPORT_RLE','RLE did not fill exactly one base chunk.',{actual:at});}
    for(const id of out)if(!known(id))fail('IMPORT_BLOCK_ID','Unknown game block ID.',{id});return out;
  }
  function targetOptions(opts,widthChunks,depthChunks){
    int(widthChunks,'window width chunks',1,64);int(depthChunks,'window depth chunks',1,64);
    if(widthChunks*depthChunks>MAX_CHUNKS)fail('IMPORT_CHUNK_LIMIT','At most64 base chunks can be imported.');
    const x=int(opts.targetMinX===undefined?0:opts.targetMinX,'target X',-29999984,29999968),z=int(opts.targetMinZ===undefined?0:opts.targetMinZ,'target Z',-29999984,29999968);
    if(x%16||z%16)fail('IMPORT_TARGET_ALIGNMENT','Target X/Z must be multiples of16.');
    if(x+widthChunks*16>29999984||z+depthChunks*16>29999984)fail('IMPORT_TARGET_BOUNDS','Target window exceeds the supported game bounds.');
    const exterior=opts.exterior===undefined?'air':opts.exterior;if(exterior!=='air'&&exterior!=='bedrock')fail('IMPORT_EXTERIOR','Exterior must be air or bedrock.');
    return {bounds:{minChunkX:x/16,minChunkZ:z/16,widthChunks,depthChunks},targetMinX:x,targetMinZ:z,exterior};
  }
  function context(edition,opts,target,window){
    const profile=mappingProfile(opts.mappingProfile===undefined?CURRENT_MAPPING_PROFILE:opts.mappingProfile);
    const arrays=new Map(),report=[],reportMap=new Map();
    for(let z=0;z<target.bounds.depthChunks;z++)for(let x=0;x<target.bounds.widthChunks;x++)arrays.set((target.bounds.minChunkX+x)+','+(target.bounds.minChunkZ+z),new Uint8Array(CELLS));
    const summary={sourceCells:0,sourceNonAir:0,includedSourceCells:0,includedAirCells:0,croppedNonAir:0,targetCells:arrays.size*CELLS,targetNonAir:0,paddingAirCells:0,
      mappingCounts:{exact:0,approx:0,unknown:0},sourceVoidCells:0,includedVoidCells:0,secondLayerNonAir:0,secondLayerDropped:0,secondLayerUsed:0,
      entitiesNotImported:0,blockEntitiesNotImported:0,missingSourceChunks:[],dataVersions:[],warnings:[]};
    function register(state){
      const mapped=mapState(state,{edition,mappingProfile:profile}),key=JSON.stringify([mapped.name,mapped.properties]);
      if(reportMap.has(key))return reportMap.get(key);
      if(report.length>=8192)fail('IMPORT_PALETTE_LIMIT','More than8192 distinct source states were selected.');
      const item=Object.assign(mapped,{count:0,sourceCount:0,croppedCount:0,secondaryCount:0});report.push(item);reportMap.set(key,item);return item;
    }
    function put(x,y,z,item){
      const cx=Math.floor(x/16),cz=Math.floor(z/16),data=arrays.get(cx+','+cz);
      if(!data||y<0||y>=HEIGHT)fail('IMPORT_INTERNAL_BOUNDS','Converted voxel lies outside its target window.');
      const lx=x-cx*16,lz=z-cz*16;data[lx+16*(lz+16*y)]=item.gameId;item.count++;
      if(item.gameId===0)summary.includedAirCells++;else{summary.targetNonAir++;summary.mappingCounts[item.category]++;}
    }
    return {edition,opts,target,window,arrays,report,summary,register,put,mappingProfile:profile};
  }
  function countTag(tag){return tag&&tag.type==='list'&&tag.value&&Array.isArray(tag.value.value)?tag.value.value.length:0;}
  function chooseSpawn(arrays,bounds){
    const minX=bounds.minChunkX*16,minZ=bounds.minChunkZ*16,w=bounds.widthChunks*16,d=bounds.depthChunks*16,cx=minX+Math.floor(w/2),cz=minZ+Math.floor(d/2);
    let best=null,bestScore=Infinity;
    for(let z=minZ;z<minZ+d;z++)for(let x=minX;x<minX+w;x++){
      const data=arrays.get(Math.floor(x/16)+','+Math.floor(z/16)),lx=((x%16)+16)%16,lz=((z%16)+16)%16;
      for(let y=93;y>=0;y--){const id=data[lx+16*(lz+16*y)];if(id===0)continue;if(CATALOG[id][2]&&id!==30&&id!==69&&id!==71&&id!==77&&data[lx+16*(lz+16*(y+1))]===0&&data[lx+16*(lz+16*(y+2))]===0){const score=(x-cx)*(x-cx)+(z-cz)*(z-cz);if(score<bestScore){bestScore=score;best={x:x+.5,y:y+1.01,z:z+.5,flying:false,reason:'solid-floor-and-two-air'};}break;}}
    }
    return best||{x:cx+.5,y:100,z:cz+.5,flying:true,reason:'no-safe-floor-flight'};
  }
  function finish(c){
    const s=c.summary;s.paddingAirCells=s.targetCells-s.includedSourceCells;
    if(s.mappingCounts.unknown)s.warnings.push('UNKNOWN_BLOCKS_USE_PURPLE_WOOL');
    if(s.croppedNonAir)s.warnings.push('SOURCE_WINDOW_CROPS_NON_AIR');
    if(s.secondLayerDropped)s.warnings.push('SECOND_LAYER_CONFLICTS_NOT_RENDERED');
    if(s.entitiesNotImported)s.warnings.push('ENTITIES_NOT_EXECUTED');
    if(s.blockEntitiesNotImported)s.warnings.push('BLOCK_ENTITY_DATA_NOT_EXECUTED');
    const chunks=[];for(const[key,data]of c.arrays){const[cx,cz]=key.split(',').map(Number);chunks.push([cx,cz,...encodeChunk(data)]);}
    const spawn=chooseSpawn(c.arrays,c.target.bounds),source={edition:c.edition,mode:'new-blank-world',window:c.window,meta:cloneJSON(c.opts.sourceMeta||{},65536)};
    const descriptor={schema:'maimerap-import-v1',mappingProfile:c.mappingProfile,chunkSize:SIZE,height:HEIGHT,exterior:c.target.exterior,bounds:c.target.bounds,source,chunks,paletteReport:c.report,summary:s,spawn};
    const checked=validate(descriptor);return {descriptor:checked,summary:cloneJSON(checked.summary),spawn:cloneJSON(checked.spawn)};
  }
  function fromJava(chunks,options){
    const opts=options||{};if(!Array.isArray(chunks)||chunks.length>1024)fail('IMPORT_JAVA_CHUNKS','Expected up to1024 decoded Java chunks.');
    const minChunkX=int(opts.minChunkX,'source minimum chunk X',-2147483648,2147483647),minChunkZ=int(opts.minChunkZ,'source minimum chunk Z',-2147483648,2147483647);
    const widthChunks=int(opts.widthChunks,'source width chunks',1,64),depthChunks=int(opts.depthChunks,'source depth chunks',1,64),minY=int(opts.minY,'source minimum Y',-32768,32767);
    if(minChunkX+widthChunks-1>2147483647||minChunkZ+depthChunks-1>2147483647)fail('IMPORT_SOURCE_BOUNDS','Source chunk window exceeds signed32-bit coordinates.');
    const target=targetOptions(opts,widthChunks,depthChunks),c=context('java',opts,target,{minChunkX,minChunkZ,widthChunks,depthChunks,minY,height:HEIGHT}),seen=new Set(),versions=new Set();
    let sourceBudget=0;const maxSourceCells=opts.maxSourceCells===undefined?16777216:int(opts.maxSourceCells,'source block budget',1,67108864);
    for(const chunk of chunks){
      if(!record(chunk))fail('IMPORT_JAVA_CHUNK','Invalid Java chunk IR.');const x=int(chunk.x,'source chunk X',-2147483648,2147483647),z=int(chunk.z,'source chunk Z',-2147483648,2147483647),key=x+','+z;
      if(seen.has(key))fail('IMPORT_DUPLICATE_SOURCE_CHUNK','Duplicate source chunk.',{x,z});seen.add(key);
      if(!Array.isArray(chunk.sections)||chunk.sections.length>256)fail('IMPORT_JAVA_SECTIONS','Invalid Java section list.');
      versions.add(int(chunk.dataVersion,'source DataVersion',0,2147483647));const ys=new Set();
      const rootTags=chunk.nbt&&chunk.nbt.value,body=rootTags&&(chunk.schema==='Level.Sections'?rootTags.Level&&rootTags.Level.value:rootTags);
      if(chunk.metadataCounts!==undefined){
        const counts=chunk.metadataCounts;if(!record(counts)||counts.externalEntityDataNotRead!==true)fail('IMPORT_JAVA_METADATA_COUNTS','Invalid Java omission-count metadata.');
        c.summary.entitiesNotImported+=int(counts.embeddedEntities,'embedded entity count',0,134217728);
        c.summary.blockEntitiesNotImported+=int(counts.blockEntities,'block entity count',0,134217728);
      }else if(body){c.summary.entitiesNotImported+=countTag(body.entities)+countTag(body.Entities);c.summary.blockEntitiesNotImported+=countTag(body.block_entities)+countTag(body.TileEntities);}
      const horizontal=x>=minChunkX&&x<minChunkX+widthChunks&&z>=minChunkZ&&z<minChunkZ+depthChunks;
      for(const section of chunk.sections){
        if(!record(section))fail('IMPORT_JAVA_SECTION','Invalid Java section.');const sy=int(section.y,'section Y',-2048,2047);if(ys.has(sy))fail('IMPORT_DUPLICATE_SOURCE_SECTION','Duplicate source section.',{x,z,y:sy});ys.add(sy);
        if(!Array.isArray(section.palette)||!section.palette.length||section.palette.length>8192||(!Array.isArray(section.indices)&&!(section.indices instanceof Uint16Array)&&!(section.indices instanceof Uint32Array))||section.indices.length!==4096)fail('IMPORT_JAVA_SECTION','Invalid section palette or indices.');
        sourceBudget+=4096;if(sourceBudget>maxSourceCells)fail('IMPORT_SOURCE_BUDGET','Source voxel budget exceeded.');
        const palette=section.palette.map(c.register);
        for(let i=0;i<4096;i++){
          const pi=int(section.indices[i],'source palette index',0,palette.length-1),item=palette[pi],sourceY=sy*16+(i>>>8),inside=horizontal&&sourceY>=minY&&sourceY<minY+HEIGHT;
          const nonAir=!sourceAir(item);item.sourceCount++;c.summary.sourceCells++;if(nonAir)c.summary.sourceNonAir++;
          if(!inside){if(nonAir){item.croppedCount++;c.summary.croppedNonAir++;}continue;}
          c.summary.includedSourceCells++;const tx=target.targetMinX+(x-minChunkX)*16+(i&15),tz=target.targetMinZ+(z-minChunkZ)*16+((i>>>4)&15);
          c.put(tx,sourceY-minY,tz,item);
        }
      }
    }
    for(let z=0;z<depthChunks;z++)for(let x=0;x<widthChunks;x++)if(!seen.has((minChunkX+x)+','+(minChunkZ+z)))c.summary.missingSourceChunks.push([minChunkX+x,minChunkZ+z]);
    c.summary.dataVersions=Array.from(versions).sort((a,b)=>a-b);c.summary.warnings.push('JAVA_EXTERNAL_ENTITY_DATA_NOT_READ');if(c.summary.missingSourceChunks.length)c.summary.warnings.push('MISSING_SOURCE_CHUNKS_ARE_BLANK');return finish(c);
  }
  function fromBedrock(structure,options){
    const opts=options||{};if(!record(structure)||!Array.isArray(structure.size)||structure.size.length!==3||!Array.isArray(structure.palette)||!structure.palette.length||structure.palette.length>8192||!Array.isArray(structure.layers)||structure.layers.length!==2)fail('IMPORT_BEDROCK_STRUCTURE','Invalid decoded Bedrock structure.');
    const[sx,sy,sz]=structure.size.map((n,i)=>int(n,'structure size '+i,1,1048576)),volume=sx*sy*sz;
    if(!Number.isSafeInteger(volume)||volume>16777216||structure.layers.some(a=>!(a instanceof Int32Array)||a.length!==volume))fail('IMPORT_BEDROCK_VOLUME','Invalid structure voxel volume.');
    const minX=int(opts.minX===undefined?0:opts.minX,'source minimum X',0,sx-1),minY=int(opts.minY===undefined?0:opts.minY,'source minimum Y',0,sy-1),minZ=int(opts.minZ===undefined?0:opts.minZ,'source minimum Z',0,sz-1);
    const width=int(opts.width===undefined?(opts.widthBlocks===undefined?sx-minX:opts.widthBlocks):opts.width,'source width',1,sx-minX),depth=int(opts.depth===undefined?(opts.depthBlocks===undefined?sz-minZ:opts.depthBlocks):opts.depth,'source depth',1,sz-minZ);
    const height=int(opts.height===undefined?HEIGHT:opts.height,'source height',1,HEIGHT),targetY=int(opts.targetY===undefined?0:opts.targetY,'target Y',0,HEIGHT-1);
    if(targetY+height>HEIGHT)fail('IMPORT_TARGET_HEIGHT','The vertical import window does not fit height96.');
    const target=targetOptions(opts,Math.ceil(width/16),Math.ceil(depth/16)),c=context('bedrock',opts,target,{minX,minY,minZ,width,height,depth,targetY,structureSize:[sx,sy,sz],structureOrigin:cloneJSON(structure.origin||[0,0,0])});
    c.summary.entitiesNotImported=int(structure.metadata&&structure.metadata.entityCount||0,'entity count',0,1000000);c.summary.blockEntitiesNotImported=int(structure.metadata&&structure.metadata.blockEntityPositionCount||0,'block entity count',0,16777216);
    const palette=structure.palette.map(c.register),a=structure.layers[0],b=structure.layers[1];
    for(let x=0;x<sx;x++)for(let y=0;y<sy;y++)for(let z=0;z<sz;z++){
      const index=(x*sy+y)*sz+z,p0=int(a[index],'primary layer index',-1,palette.length-1),p1=int(b[index],'secondary layer index',-1,palette.length-1),s0=p0>=0?palette[p0]:null,s1=p1>=0?palette[p1]:null;
      const n0=s0&&!sourceAir(s0),n1=s1&&!sourceAir(s1),inside=x>=minX&&x<minX+width&&z>=minZ&&z<minZ+depth&&y>=minY&&y<minY+height;
      c.summary.sourceCells++;if(n0||n1)c.summary.sourceNonAir++;if(p0===-1)c.summary.sourceVoidCells++;
      if(s0)s0.sourceCount++;if(s1){s1.sourceCount++;s1.secondaryCount++;}if(n1)c.summary.secondLayerNonAir++;
      if(!inside){if(n0||n1)c.summary.croppedNonAir++;if(n0)s0.croppedCount++;if(n1)s1.croppedCount++;continue;}
      c.summary.includedSourceCells++;if(p0===-1)c.summary.includedVoidCells++;
      let chosen=s0;
      if(n1&&!n0){chosen=s1;c.summary.secondLayerUsed++;}
      else if(n1&&n0)c.summary.secondLayerDropped++;
      if(chosen)c.put(target.targetMinX+x-minX,targetY+y-minY,target.targetMinZ+z-minZ,chosen);
    }
    return finish(c);
  }
  function validate(input){
    const d=cloneJSON(input);if(!record(d)||d.schema!=='maimerap-import-v1'||d.chunkSize!==SIZE||d.height!==HEIGHT)fail('IMPORT_SCHEMA','Unsupported imported base-world schema.');
    // Only new conversions opt in. Validation never upgrades a saved descriptor.
    const profile=own(d,'mappingProfile')?mappingProfile(d.mappingProfile):LEGACY_MAPPING_PROFILE;
    if(!record(d.bounds)||!record(d.source)||!['java','bedrock'].includes(d.source.edition)||d.source.mode!=='new-blank-world'||!record(d.source.window)||!record(d.source.meta))fail('IMPORT_DESCRIPTOR','Invalid imported-world metadata.');
    const b=d.bounds,target=targetOptions({targetMinX:b.minChunkX*16,targetMinZ:b.minChunkZ*16,exterior:d.exterior},b.widthChunks,b.depthChunks);
    int(b.minChunkX,'target minimum chunk X',-1874999,1874999);int(b.minChunkZ,'target minimum chunk Z',-1874999,1874999);
    const w=d.source.window;
    if(d.source.edition==='java'){
      int(w.minChunkX,'source chunk X',-2147483648,2147483647);int(w.minChunkZ,'source chunk Z',-2147483648,2147483647);int(w.minY,'source minimum Y',-32768,32767);
      if(w.widthChunks!==b.widthChunks||w.depthChunks!==b.depthChunks||w.height!==HEIGHT||w.minChunkX+w.widthChunks-1>2147483647||w.minChunkZ+w.depthChunks-1>2147483647)fail('IMPORT_SOURCE_WINDOW','Invalid Java source window.');
    }else{
      if(!Array.isArray(w.structureSize)||w.structureSize.length!==3||!Array.isArray(w.structureOrigin)||w.structureOrigin.length!==3)fail('IMPORT_SOURCE_WINDOW','Invalid Bedrock source size/origin.');
      const[sx,sy,sz]=w.structureSize.map((n,i)=>int(n,'structure size '+i,1,1048576));for(const n of w.structureOrigin)int(n,'structure origin',-2147483648,2147483647);
      int(w.minX,'source minimum X',0,sx-1);int(w.minY,'source minimum Y',0,sy-1);int(w.minZ,'source minimum Z',0,sz-1);int(w.width,'source width',1,sx-w.minX);int(w.depth,'source depth',1,sz-w.minZ);int(w.height,'source height',1,HEIGHT);int(w.targetY,'target Y',0,HEIGHT-1);
      if(Math.ceil(w.width/16)!==b.widthChunks||Math.ceil(w.depth/16)!==b.depthChunks||w.targetY+w.height>HEIGHT)fail('IMPORT_SOURCE_WINDOW','Invalid Bedrock source window.');
    }
    if(!Array.isArray(d.chunks)||d.chunks.length!==b.widthChunks*b.depthChunks||d.chunks.length>MAX_CHUNKS)fail('IMPORT_CHUNK_COUNT','Base world must contain every chunk in its target rectangle.');
    const seen=new Set(),outputCounts=new Float64Array(CATALOG.length);let nonAir=0;
    for(const row of d.chunks){
      if(!Array.isArray(row)||row.length!==4)fail('IMPORT_CHUNK_RECORD','Invalid chunk record.');const x=int(row[0],'chunk X',b.minChunkX,b.minChunkX+b.widthChunks-1),z=int(row[1],'chunk Z',b.minChunkZ,b.minChunkZ+b.depthChunks-1),key=x+','+z;
      if(seen.has(key))fail('IMPORT_DUPLICATE_CHUNK','Duplicate imported chunk.');seen.add(key);const data=decodeChunk(row);for(const id of data){outputCounts[id]++;if(id!==0)nonAir++;}
    }
    if(!Array.isArray(d.paletteReport)||d.paletteReport.length>8192)fail('IMPORT_PALETTE_REPORT','Invalid source palette report.');const states=new Set(),mappedCounts={exact:0,approx:0,unknown:0},reportedOutput=new Float64Array(CATALOG.length);
    let sourceReferences=0,sourceNonAirReferences=0,secondaryReferences=0,secondaryNonAirReferences=0,croppedReferences=0;
    for(const item of d.paletteReport){const state=stateParts(item),key=JSON.stringify([state.name,state.properties]);if(states.has(key)||!known(item.gameId)||!['exact','approx','unknown'].includes(item.category)||!Array.isArray(item.reasons)||item.reasons.some(r=>typeof r!=='string'||r.length>128))fail('IMPORT_PALETTE_REPORT','Invalid or duplicate source mapping report.');states.add(key);for(const k of ['count','sourceCount','croppedCount','secondaryCount'])int(item[k],'palette '+k,0,134217728);
      if(item.count+item.croppedCount>item.sourceCount||item.secondaryCount>item.sourceCount)fail('IMPORT_PALETTE_COUNTS','Source mapping counts are inconsistent.');
      const expected=mapState(item,{edition:d.source.edition,mappingProfile:profile});if(item.gameId!==expected.gameId||item.category!==expected.category)fail('IMPORT_PALETTE_MAPPING','Source mapping differs from the declared mapping profile.');if(item.gameId!==0)mappedCounts[item.category]+=item.count;
      const nonAirState=!sourceAir(state);
      if(!nonAirState&&item.croppedCount!==0)fail('IMPORT_PALETTE_COUNTS','Cropped counts include only non-air source references.');
      if(d.source.edition==='java'&&(item.secondaryCount!==0||(nonAirState&&item.count+item.croppedCount!==item.sourceCount)))fail('IMPORT_PALETTE_COUNTS','Java source references do not match the single-layer mapping.');
      reportedOutput[item.gameId]+=item.count;sourceReferences+=item.sourceCount;secondaryReferences+=item.secondaryCount;croppedReferences+=item.croppedCount;
      if(nonAirState){sourceNonAirReferences+=item.sourceCount;secondaryNonAirReferences+=item.secondaryCount;}
    }
    if(!record(d.summary)||d.summary.targetCells!==d.chunks.length*CELLS||d.summary.targetNonAir!==nonAir)fail('IMPORT_SUMMARY','Imported world counts do not match decoded chunks.');
    const s=d.summary;for(const k of ['sourceCells','sourceNonAir','includedSourceCells','includedAirCells','croppedNonAir','paddingAirCells','sourceVoidCells','includedVoidCells','secondLayerNonAir','secondLayerDropped','secondLayerUsed','entitiesNotImported','blockEntitiesNotImported'])int(s[k],'summary '+k,0,134217728);
    if(!record(s.mappingCounts)||s.includedSourceCells>s.targetCells||s.paddingAirCells!==s.targetCells-s.includedSourceCells||s.sourceNonAir!==s.targetNonAir+s.croppedNonAir||s.targetNonAir+s.includedAirCells>s.includedSourceCells||s.includedVoidCells>s.sourceVoidCells||s.secondLayerUsed+s.secondLayerDropped>s.secondLayerNonAir)fail('IMPORT_SUMMARY','Imported world summary is inconsistent.');
    for(const k of ['exact','approx','unknown'])if(s.mappingCounts[k]!==mappedCounts[k])fail('IMPORT_SUMMARY','Mapping counts do not match the palette report.');
    if(mappedCounts.exact+mappedCounts.approx+mappedCounts.unknown!==nonAir)fail('IMPORT_SUMMARY','Mapping counts do not match target non-air blocks.');
    for(let id=1;id<CATALOG.length;id++)if(outputCounts[id]!==reportedOutput[id])fail('IMPORT_PALETTE_COUNTS','Source mapping counts do not match the decoded output block IDs.',{gameId:id});
    if(reportedOutput[0]!==s.includedAirCells||s.sourceNonAir>s.sourceCells||s.includedSourceCells>s.sourceCells||s.sourceVoidCells>s.sourceCells||s.includedVoidCells>s.includedSourceCells)fail('IMPORT_SUMMARY','Source-cell and explicit-air counts are inconsistent.');
    if(d.source.edition==='java'){
      if(sourceReferences!==s.sourceCells||sourceNonAirReferences!==s.sourceNonAir||croppedReferences!==s.croppedNonAir||s.targetNonAir+s.includedAirCells!==s.includedSourceCells||s.sourceVoidCells||s.includedVoidCells||s.secondLayerNonAir||s.secondLayerDropped||s.secondLayerUsed)fail('IMPORT_SUMMARY','Java summary does not match its single-layer source references.');
    }else{
      const unfilledVoid=s.includedSourceCells-s.targetNonAir-s.includedAirCells;
      if(sourceReferences-secondaryReferences!==s.sourceCells-s.sourceVoidCells||secondaryReferences>s.sourceCells||secondaryNonAirReferences!==s.secondLayerNonAir||s.secondLayerNonAir>s.sourceNonAir||croppedReferences<s.croppedNonAir||croppedReferences>2*s.croppedNonAir||sourceNonAirReferences!==s.targetNonAir+s.secondLayerDropped+croppedReferences||unfilledVoid>s.includedVoidCells||s.includedVoidCells-unfilledVoid>s.secondLayerUsed)fail('IMPORT_SUMMARY','Bedrock summary does not match primary, secondary and void references.');
    }
    const p=d.spawn;if(!record(p)||!Number.isFinite(p.x)||!Number.isFinite(p.y)||!Number.isFinite(p.z)||p.x<target.targetMinX||p.x>=target.targetMinX+b.widthChunks*16||p.z<target.targetMinZ||p.z>=target.targetMinZ+b.depthChunks*16||p.y<0||p.y>512||typeof p.flying!=='boolean'||typeof p.reason!=='string')fail('IMPORT_SPAWN','Invalid imported-world spawn.');
    return d;
  }
  function makeRuntime(descriptor){
    const d=validate(descriptor),chunks=new Map(),outside=new Uint8Array(CELLS);
    for(const row of d.chunks)chunks.set(row[0]+','+row[1],decodeChunk(row));if(d.exterior==='bedrock')outside.fill(13,0,256);
    return Object.freeze({
      get descriptor(){return cloneJSON(d);},
      chunk(cx,cz){int(cx,'runtime chunk X',-2147483648,2147483647);int(cz,'runtime chunk Z',-2147483648,2147483647);return(chunks.get(cx+','+cz)||outside).slice();},
      block(x,y,z){if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(z))fail('IMPORT_RUNTIME_COORDINATE','Coordinates must be finite.');x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);if(!Number.isSafeInteger(x)||!Number.isSafeInteger(y)||!Number.isSafeInteger(z))fail('IMPORT_RUNTIME_COORDINATE','Coordinate exceeds safe integer precision.');if(y<0||y>=HEIGHT)return 0;const cx=Math.floor(x/16),cz=Math.floor(z/16),data=chunks.get(cx+','+cz)||outside;return data[x-cx*16+16*(z-cz*16+16*y)];},
      hasChunk(cx,cz){return chunks.has(cx+','+cz);}
    });
  }
  const api=Object.freeze({version:'1.1.0',schema:'maimerap-import-v1',SIZE,HEIGHT,CELLS,MAX_CHUNKS,PLACEHOLDER,LEGACY_MAPPING_PROFILE,CURRENT_MAPPING_PROFILE,MAPPING_PROFILES,ImportWorldError,
    assertCatalog,mapState,encodeChunk,decodeChunk,fromJava,fromBedrock,validate,makeRuntime});
  root.MCImportWorldCore=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
