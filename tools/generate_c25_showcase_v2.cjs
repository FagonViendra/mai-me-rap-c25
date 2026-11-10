#!/usr/bin/env node
/* C25 deterministic showcase of the 100 individually authored construction blocks.
   V2 verifies the world payload independently of historical receipt input pins.
   An optional new receipt records the exact current sources. Existing worlds and receipts are never overwritten. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const args=process.argv.slice(2);let mode='--check',reportOutput=null;
for(let i=0;i<args.length;i++){if(args[i]==='--write'||args[i]==='--check')mode=args[i];else if(args[i]==='--report'&&args[i+1])reportOutput=args[++i];else throw Error('Use --check or --write, optionally --report NEW_RELATIVE_PATH');}
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const pin=rel=>{const b=fs.readFileSync(path.join(root,rel));return{path:rel,bytes:b.length,sha256:sha(b)};};
const inputNames=['src/crafted-blocks.js','src/catalog.js','src/world-coordinates.js','src/world.js','src/realm-generation.js','src/sky-generation.js','worlds/04_nong_trai_ven_rung.json','notes/PRODUCT_C25_CRAFTED_BLOCKS_CONTRACT_V2.json'];
const inputs=inputNames.map(pin);
const templateBytes=fs.readFileSync(path.join(root,'worlds/04_nong_trai_ven_rung.json'));
if(templateBytes.length!==142072||sha(templateBytes)!=='cc1555183021f8d827668ca11533881c6256dbb2264532ed4729cf22a1b55fb2')throw Error('Accepted farm envelope template pin changed');
const contract=JSON.parse(fs.readFileSync(path.join(root,'notes/PRODUCT_C25_CRAFTED_BLOCKS_CONTRACT_V2.json'),'utf8'));
if(contract.blocks.length!==100||contract.blocks.some((b,i)=>b.id!==249+i))throw Error('Exact 100-ID oracle required');
const ctx={};vm.createContext(ctx);
for(const file of inputNames.slice(0,6))vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const V=ctx.Voxel,A=ctx.VoxelC25Crafted,seed='MMR-C25-XUONG-100-KHOI',seedNumber=V.core.hashSeed(seed),base=new Map(),edits=new Map();
const mod=n=>(n%16+16)%16,key=(cx,cz)=>cx+','+cz;
function chunk(cx,cz){const k=key(cx,cz);if(!base.has(k)){const data=V.generateChunk(seedNumber,cx,cz,4,'overworld','wide-v1');if(data.length!==24576)throw Error('Bad generated chunk');base.set(k,data);}return base.get(k);}
function set(x,y,z,id){if(!Number.isInteger(id)||!V.blocks[id]||y<0||y>95)throw Error('Invalid showcase cell');const cx=Math.floor(x/16),cz=Math.floor(z/16),k=key(cx,cz),index=mod(x)+16*(mod(z)+16*y),native=chunk(cx,cz)[index];let list=edits.get(k);if(!list){list=new Map();edits.set(k,list);}if(native===id)list.delete(index);else list.set(index,id);}
function get(x,y,z){const cx=Math.floor(x/16),cz=Math.floor(z/16),k=key(cx,cz),index=mod(x)+16*(mod(z)+16*y);return edits.get(k)?.get(index)??chunk(cx,cz)[index];}
for(let x=-50;x<=50;x++)for(let z=20;z<=65;z++){set(x,78,z,239);for(let y=79;y<=95;y++)if(chunk(Math.floor(x/16),Math.floor(z/16))[mod(x)+16*(mod(z)+16*y)]!==0)set(x,y,z,0);}
for(const bay of contract.bays){const cx=bay.camera[0],cz=bay.aim[2];for(let x=cx-8;x<=cx+8;x++)for(let z=cz-5;z<=cz+5;z++)if(x===cx-8||x===cx+8||z===cz-5||z===cz+5)set(x,78,z,21);}
for(const b of contract.blocks){const[x,y,z]=b.position;set(x,y-1,z,21);set(x,y,z,b.id);}
const lists=[...edits].filter(([,m])=>m.size).map(([k,m])=>[...k.split(',').map(Number),[...m].sort((a,b)=>a[0]-b[0])]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
const editCount=lists.reduce((n,r)=>n+r[2].length,0);if(editCount>100000||lists.length>4096)throw Error('Native edit admission exceeded');
const occupiedById={};for(const r of lists)for(const[,id]of r[2])if(id>=249&&id<=348)occupiedById[id]=(occupiedById[id]||0)+1;
if(Object.keys(occupiedById).length!==100||Object.values(occupiedById).some(n=>n!==1))throw Error('Each new block must appear once');
for(const b of contract.blocks){if(get(...b.position)!==b.id||get(b.position[0],79,b.position[2])!==21)throw Error('Specimen or support mismatch');}
const geometry=lists.map(([cx,cz,list])=>{const data=Uint16Array.from(chunk(cx,cz));for(const[i,id]of list)data[i]=id;let quads=0;for(const id of data){const d=V.blocks[id];if(d?.shape==='boxes')quads+=d.boxes.length*6;else if(d?.shape==='worktable')quads+=d.tableBoxes.length*6;else if(d?.shape==='torch')quads+=d.wallTorchFacing?36:24;}if(quads>32768)throw Error('Geometry budget exceeded');return{cx,cz,explicitQuads:quads,edits:list.length};});
const wrap=JSON.parse(templateBytes),saved=JSON.parse(wrap.payload);
Object.assign(saved,{id:'mk-c25-crafted-gallery-20261110',seed,updated:Date.UTC(2026,10,10,2,0,0),day:1,time:.36,spawn:[.5,81.05,64.5],inventory:{},wear:{},hotbar:[249,255,256,289,299,319,329,339,0],selected:8,edits:lists,trees:[],crops:[],furnaces:[],mobs:[],villageMask:0,realmStates:{},mode:'creative'});
Object.assign(saved.player,{x:.5,y:81.05,z:64.5,yaw:0,pitch:-.22,health:20,hunger:20,fly:true});
for(const k of Object.keys(saved.progress))saved.progress[k]=0;
for(const k of Object.keys(saved.journey.counters))saved.journey.counters[k]=0;
if(get(0,81,64)!==0||get(0,82,64)!==0)throw Error('Showcase spawn is obstructed');
const payload=JSON.stringify(saved);let checksum=2166136261;for(let i=0;i<payload.length;i++)checksum=Math.imul(checksum^payload.charCodeAt(i),16777619);
const world=Buffer.from(JSON.stringify({format:'mien-khoi',version:1,checksum:(checksum>>>0).toString(16).padStart(8,'0'),payload})+'\n');
const worldRel='worlds/05_xuong_100_khoi_c25.json';
const report={schema:2,status:'DETERMINISTIC_SOURCE_FIXTURE_RUNTIME_PENDING',generator:'tools/generate_c25_showcase_v2.cjs',inputs,world:{path:worldRel,bytes:world.length,sha256:sha(world)},seed,spawn:saved.spawn,mode:saved.mode,fly:saved.player.fly,selected:saved.selected,hotbar:saved.hotbar,editedCells:editCount,editedChunks:lists.length,specimens:100,uniqueNewIds:100,geometry,blocks:contract.blocks.map(({id,name,position})=>({id,name,position})),bays:contract.bays,clearPolicy:'Only actual nonzero generated cells cleared; floor/borders/specimens recorded only when different from generated base',sourceTemplateModified:false,oldSceneSourcesModified:false,runtimeAccepted:false};
const reportBytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
const worldPath=path.join(root,worldRel);let wroteWorld=false;
if(fs.existsSync(worldPath)){if(!fs.readFileSync(worldPath).equals(world))throw Error('Showcase payload differs; refusing to overwrite');}
else if(mode==='--write'){fs.mkdirSync(path.dirname(worldPath),{recursive:true});fs.writeFileSync(worldPath,world,{flag:'wx'});wroteWorld=true;}
else throw Error('Missing showcase; use --write only to create the absent file');
let reportPin=null;
if(reportOutput){const destination=path.resolve(root,reportOutput);if(fs.existsSync(destination))throw Error('Refusing to overwrite report '+destination);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,reportBytes,{flag:'wx'});reportPin={path:path.relative(root,destination),bytes:reportBytes.length,sha256:sha(reportBytes)};}
console.log(JSON.stringify({status:wroteWorld?'SHOWCASE_CREATED':'SHOWCASE_PAYLOAD_REPRODUCIBLE',world:report.world,report:reportPin,currentInputPins:inputs,reportPolicy:'Optional new receipt binds this invocation; historical receipts are not rewritten or asserted current',specimens:100,editedCells:editCount,editedChunks:lists.length,maxGeometryQuads:Math.max(...geometry.map(r=>r.explicitQuads))}));
