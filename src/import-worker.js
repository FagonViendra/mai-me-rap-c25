/* Worker orchestration: selected Files are read-only; no network or user code. */
(() => {
 'use strict';
 const J=globalThis.MCImportJava,B=globalThis.MCImportBedrock,C=globalThis.MCImportContainer,K=globalThis.MCImportWorldCore;
 const MiB=1024*1024,MAX_FILE=64*MiB,MAX_USED=128*MiB,MAX_READ=192*MiB;
 let state=null,busy=false;
 const fail=(code,message)=>{const e=new Error(message);e.code=code;throw e;};
 const clean=s=>String(s).replace(/\\/g,'/');
 const progress=(id,text,done,total)=>postMessage({id,type:'progress',text,done,total});
 const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
 function newState(){return{entries:[],cache:new Map(),used:new Map(),readBytes:0,options:[],archives:[],warnings:[]};}
 function addUsed(file,path){if(!state.used.has(file)){const total=[...state.used.keys()].reduce((n,f)=>n+f.size,0)+file.size;if(total>MAX_USED)fail('SOURCE_ARCHIVE_LIMIT','Các tệp nguồn đã đọc vượt 128 MiB. Hãy chọn ít vùng hơn.');state.used.set(file,{file,path});}}
 async function originalBytes(file,path){if(file.size>MAX_FILE)fail('SOURCE_FILE_LIMIT','Tệp nguồn vượt 64 MiB: '+path);addUsed(file,path);return new Uint8Array(await file.arrayBuffer());}
 async function readEntry(entry,max=MAX_FILE){
  if(entry.size>max)fail('SOURCE_ENTRY_LIMIT','Mục dữ liệu quá lớn: '+entry.path);
  if(state.cache.has(entry.path))return state.cache.get(entry.path);
  const a=await entry.read({maxOutputBytes:max});state.readBytes+=a.byteLength;
  if(state.readBytes>MAX_READ)fail('SOURCE_READ_LIMIT','Phiên đọc vượt 192 MiB. Chọn lại một vùng nhỏ hơn.');
  state.cache.set(entry.path,a);return a;
 }
 function sourceOption(id,label,kind,extra){return{id,label,kind,...extra};}
 async function inspect(files,id){
  state=newState();if(!Array.isArray(files)||!files.length||files.length>20000)fail('FILE_SELECTION','Chọn từ 1 đến 20.000 tệp.');
  const seen=new Set();
  for(let i=0;i<files.length;i++){
   const f=files[i].file||files[i],path=clean(files[i].path||f.webkitRelativePath||f.name);if(!path||seen.has(path))fail('DUPLICATE_SOURCE_PATH','Tên tệp nguồn bị trùng: '+path);seen.add(path);
   state.entries.push({path,size:f.size,isDirectory:false,read:async()=>originalBytes(f,path),origin:f});
  }
  // An archive is opened only when selected as one file; folders remain lazy.
  if(files.length===1&&/\.(zip|mcworld|mcpack|mcaddon)$/i.test((files[0].file||files[0]).name)){
   progress(id,'Đọc danh mục gói dữ liệu',0,1);const f=files[0].file||files[0],raw=await originalBytes(f,f.name);
   const zip=C.openZip(raw,{maxArchiveBytes:MAX_FILE,maxEntryBytes:MAX_FILE,maxTotalBytes:192*MiB,maxRatio:2048});
   state.archives.push({name:f.name,zip});state.entries=zip.entries.filter(e=>!e.isDirectory);
  }
  let discovery=C.discover(state.entries);state.discovery=discovery;state.warnings.push(...discovery.warnings);
  const groups=new Map();
  for(const region of discovery.java.regions){
   const key=JSON.stringify([region.worldRoot,region.dimension,region.layout]);
   if(!groups.has(key))groups.set(key,[]);groups.get(key).push(region);
  }
  for(const regions of groups.values()){
   const first=regions[0],label=(first.worldRoot||'Tệp vùng')+' / '+(first.dimension||'Java')+' / '+first.layout;
   const oi=state.options.length;state.options.push(sourceOption('java-'+oi,label,'java',{regions,dimension:first.dimension||'minecraft:overworld',worldRoot:first.worldRoot,layout:first.layout}));
  }
  for(const structure of discovery.structures)state.options.push(sourceOption('structure-'+state.options.length,structure.path,'structure',{entry:structure.entry}));
  const packages=[];
  if(state.archives.length&&C.inspectPackages){
   const inspection=await C.inspectPackages(state.archives[0].zip,{maxArchiveBytes:MAX_FILE,maxEntryBytes:MAX_FILE,maxTotalBytes:128*MiB,maxRatio:2048,maxDepth:2,maxNestedArchives:8});
   packages.push(...inspection.reports);state.warnings.push(...inspection.warnings);
  }else if(discovery.packs.manifests.length){
   const entries=state.entries.map(e=>({path:e.path})),byPath=new Map(entries.map(e=>[e.path,e]));
   for(const m of discovery.packs.manifests.slice(0,32)){const bytes=await readEntry(m.entry,MiB);byPath.get(m.path).json=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
   if(discovery.packs.manifests.length>32)state.warnings.push({code:'PACK_MANIFEST_INSPECTION_LIMIT',message:'Chỉ kiểm tra 32 manifest đầu tiên; danh sách đường dẫn vẫn bao gồm toàn bộ gói.'});
   packages.push({archive:'Thư mục đã chọn',inspection:B.inspectPackEntries(entries)});
  }
  // Nested add-on structures are listed by the package inspector, not executed.
  const publicOptions=[];
  for(const o of state.options){
   if(o.kind==='java'){
    const first=o.regions[0],raw=await readEntry(first.entry);const scan=J.scanRegion(raw,{regionX:first.regionX,regionZ:first.regionZ,maxRegionBytes:MAX_FILE});
    const cell=scan.entries[0];o.suggested={minChunkX:cell?cell.chunkX:first.regionX*32,minChunkZ:cell?cell.chunkZ:first.regionZ*32,widthChunks:4,depthChunks:4,minY:0};
    const level=discovery.java.levelDat.find(e=>e.worldRoot===o.worldRoot);
    if(level){try{const packed=await readEntry(level.entry,4*MiB),rawNBT=packed[0]===31&&packed[1]===139?await J.decompress(packed,1,{maxOutputBytes:4*MiB}):packed,nbt=J.simplifyNBT(J.decodeNBT(rawNBT,{maxBytes:4*MiB})),data=nbt.Data||nbt;
      o.level={name:typeof data.LevelName==='string'?data.LevelName:null,dataVersion:Number.isInteger(data.DataVersion)?data.DataVersion:null};
      if(Number.isInteger(data.SpawnX)&&Number.isInteger(data.SpawnZ)){o.suggested.minChunkX=Math.floor(data.SpawnX/16)-1;o.suggested.minChunkZ=Math.floor(data.SpawnZ/16)-1;}
     }catch(e){state.warnings.push({code:'LEVEL_METADATA_UNAVAILABLE',path:level.path,message:String(e.message)});}}
    publicOptions.push({id:o.id,label:o.label,kind:o.kind,dimension:o.dimension,regions:o.regions.length,availableInFirstRegion:scan.entries.length,suggested:o.suggested,level:o.level||null});
   }else{
    publicOptions.push({id:o.id,label:o.label,kind:o.kind,suggested:{minX:0,minY:0,minZ:0,width:64,depth:64}});
   }
  }
  return{kind:discovery.kind,files:files.length,entries:state.entries.length,options:publicOptions,packages,warnings:state.warnings,bedrockDatabaseFiles:discovery.bedrock.dbFiles.length,javaMods:discovery.packs.javaMods.length,contentExecuted:false,limits:{fileMiB:64,sourceMiB:128,maxChunks:64,height:96},container:state.archives[0]?.zip.metadata||null};
 }
 async function originals(){
  const out=[];for(const {file,path}of state.used.values()){const bytes=new Uint8Array(await file.arrayBuffer());out.push({path,bytes:file.size,sha256:await digest(bytes),blob:file});}return out;
 }
 async function prepare(request,id){
  if(!state)fail('NO_SOURCE','Chọn tệp nguồn trước.');const option=state.options.find(o=>o.id===request.optionId);if(!option)fail('SOURCE_OPTION','Lựa chọn nguồn không còn hợp lệ.');
  let result,versions=[],decodedChunks=0,decompressed=0,sourceDimension=option.dimension||'bedrock:structure';
  const choices=request.window||{};
  if(option.kind==='java'){
   const {minChunkX,minChunkZ,widthChunks,depthChunks,minY}=choices;
   if(![minChunkX,minChunkZ,widthChunks,depthChunks,minY].every(Number.isSafeInteger)||widthChunks<1||depthChunks<1||widthChunks>8||depthChunks>8||widthChunks*depthChunks>64||minY< -32768||minY>32767)fail('IMPORT_WINDOW','Vùng nhập Java không hợp lệ.');
   const filter=e=>e.chunkX>=minChunkX&&e.chunkX<minChunkX+widthChunks&&e.chunkZ>=minChunkZ&&e.chunkZ<minChunkZ+depthChunks;
   const chosen=option.regions.filter(r=>r.regionX*32<minChunkX+widthChunks&&(r.regionX+1)*32>minChunkX&&r.regionZ*32<minChunkZ+depthChunks&&(r.regionZ+1)*32>minChunkZ);
   const coordinateKeys=new Set(),all=[];
   if(!chosen.length)fail('EMPTY_REGION_WINDOW','Không có tệp vùng phủ tọa độ đã chọn.');
   for(let i=0;i<chosen.length;i++){
    const r=chosen[i],key=r.regionX+','+r.regionZ;if(coordinateKeys.has(key))fail('DUPLICATE_REGION_COORDINATE','Có hai tệp vùng cùng tọa độ; hãy chọn một bản nguồn.');coordinateKeys.add(key);
    progress(id,'Đọc vùng '+(i+1)+' / '+chosen.length,i,chosen.length);
    const raw=await readEntry(r.entry),header=J.scanRegion(raw,{regionX:r.regionX,regionZ:r.regionZ,maxRegionBytes:MAX_FILE}),external=new Map(),prefix=r.path.slice(0,r.path.lastIndexOf('/')+1);
    for(const e of header.entries.filter(filter))if(e.external){const companion=state.entries.find(x=>x.path===prefix+e.externalName);if(!companion)fail('REGION_EXTERNAL_MISSING','Thiếu tệp '+prefix+e.externalName);external.set(e.externalName,await readEntry(companion,16*MiB));}
    const decoded=await J.readRegion(raw,{regionX:r.regionX,regionZ:r.regionZ,chunkFilter:filter,externalFiles:external,maxRegionBytes:MAX_FILE,maxChunks:64,maxTotalOutputBytes:Math.max(1,128*MiB-decompressed),retainNBT:false,onProgress:p=>progress(id,'Giải mã khối vùng '+p.done+' / '+p.total,p.done,p.total)});
    decompressed+=decoded.totals.decompressedBytes;all.push(...decoded.chunks);state.warnings.push(...decoded.warnings);
   }
   if(!all.length)fail('EMPTY_CHUNK_WINDOW','Không có chunk được lưu trong cửa sổ đã chọn.');
   decodedChunks=all.length;versions=[...new Set(all.map(c=>c.dataVersion))];
   result=K.fromJava(all,{minChunkX,minChunkZ,widthChunks,depthChunks,minY,targetMinX:0,targetMinZ:0,exterior:'air',sourceMeta:{label:option.label,dimension:sourceDimension,dataVersions:versions}});
  }else{
   const bytes=await readEntry(option.entry,32*MiB);progress(id,'Đọc công trình Bedrock',0,1);
   const structure=await B.parseStructure(bytes,{maxBlocks:2097152,maxNodes:4300000,maxBytes:32*MiB,maxOutputBytes:32*MiB});
   const {minX=0,minY=0,minZ=0}=choices,requestedWidth=choices.width??128,requestedDepth=choices.depth??128;
   if(![minX,minY,minZ,requestedWidth,requestedDepth].every(Number.isSafeInteger)||minX<0||minY<0||minZ<0||minX>=structure.size[0]||minY>=structure.size[1]||minZ>=structure.size[2]||requestedWidth<1||requestedWidth>128||requestedDepth<1||requestedDepth>128)fail('IMPORT_WINDOW','Vùng nhập Bedrock không hợp lệ: tọa độ phải nằm trong công trình; rộng và sâu từ 1 đến 128 khối.');
   const width=Math.min(requestedWidth,structure.size[0]-minX),depth=Math.min(requestedDepth,structure.size[2]-minZ);
   result=K.fromBedrock(structure,{minX,minY,minZ,width,depth,height:96,targetMinX:0,targetMinZ:0,targetY:0,exterior:'air',sourceMeta:{label:option.label,dimension:sourceDimension,formatVersion:structure.formatVersion,compression:structure.compression}});
   result.structureInfo={size:structure.size,origin:structure.origin,formatVersion:structure.formatVersion,compression:structure.compression,layerCount:structure.layerCount,stats:structure.stats};
  }
  progress(id,'Ghi nhận mã băm tệp nguồn',0,state.used.size);
  const sourceFiles=await originals();result.descriptor.source.meta.files=sourceFiles.map(({path,bytes,sha256})=>({path,bytes,sha256}));
  result.descriptor=K.validate(result.descriptor);
  return{...result,sourceFiles,sourceLabel:option.level?.name||option.label,edition:option.kind==='java'?'java':'bedrock',sourceDimension,sourceVersions:versions,decodedChunks,decompressedBytes:decompressed,warnings:state.warnings.slice(),contentExecuted:false};
 }
 onmessage=async event=>{
  const request=event.data||{},id=request.id;if(busy){postMessage({id,type:'error',error:{code:'IMPORT_BUSY',message:'Bộ đọc đang xử lý yêu cầu trước.'}});return;}
  busy=true;try{const result=request.op==='inspect'?await inspect(request.files,id):request.op==='prepare'?await prepare(request,id):fail('IMPORT_OPERATION','Thao tác nhập không hợp lệ.');postMessage({id,type:'result',result});}
  catch(e){postMessage({id,type:'error',error:{code:String(e.code||'IMPORT_FAILED'),message:String(e.message||e),details:e.details||null}});}
  finally{busy=false;}
 };
})();
