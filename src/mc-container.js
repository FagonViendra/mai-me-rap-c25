/* MảiMêRáp: bounded read-only ZIP/container adapters. Original code, 2026-11-02.
 * ZIP subset: stored/deflate, 32-bit single-disk archives; no code execution.
 */
(function (root) {
  'use strict';
  const LIMITS = Object.freeze({maxArchiveBytes:64*1024*1024,maxEntries:20000,maxEntryBytes:32*1024*1024,maxTotalBytes:128*1024*1024,maxRatio:1000,maxDepth:2,maxNestedArchives:8,maxManifestBytes:1024*1024});
  const CP437 = 'ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';
  const CRC_TABLE = new Uint32Array(256);
  for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);CRC_TABLE[n]=c>>>0;}
  function fail(code,message){const e=new Error(message);e.name='ContainerImportError';e.code='ZIP_'+code;throw e;}
  function abort(signal){if(signal&&signal.aborted)fail('CANCELLED','Đã hủy đọc gói dữ liệu.');}
  function opts(input){const o=Object.assign({},LIMITS,input||{});for(const k of Object.keys(LIMITS))if(!Number.isSafeInteger(o[k])||o[k]<(k==='maxDepth'?0:1))fail('LIMIT','Giới hạn ZIP không hợp lệ: '+k);return o;}
  function bytes(input){if(input instanceof Uint8Array)return input;if(input instanceof ArrayBuffer)return new Uint8Array(input);if(ArrayBuffer.isView(input))return new Uint8Array(input.buffer,input.byteOffset,input.byteLength);fail('INPUT','ZIP cần ArrayBuffer hoặc Uint8Array.');}
  function crc32(input){const a=bytes(input);let c=0xffffffff;for(let i=0;i<a.length;i++)c=CRC_TABLE[(c^a[i])&255]^(c>>>8);return(c^0xffffffff)>>>0;}
  function utf8(a){try{return new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(a);}catch(_){fail('FILENAME_UTF8','Tên tệp ZIP không phải UTF-8 hợp lệ.');}}
  function decodeName(a,isUTF8){if(isUTF8)return utf8(a);let s='';for(const n of a)s+=n<128?String.fromCharCode(n):CP437[n-128];return s;}
  function sameBytes(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i]);}
  function pathKey(path){
    if(typeof path!=='string'||!path.length||path.length>65535||path.startsWith('/')||path.includes('\\')||path.includes(':')||/[\u0000-\u001f\u007f]/.test(path))fail('UNSAFE_PATH','Đường dẫn ZIP không hợp lệ: '+String(path).slice(0,160));
    const base=path.endsWith('/')?path.slice(0,-1):path;
    for(const segment of base.split('/'))if(!segment||segment==='.'||segment==='..'||/[. ]$/.test(segment)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(segment))fail('UNSAFE_PATH','Đường dẫn ZIP không an toàn: '+path.slice(0,160));
    return base.normalize('NFC').toLowerCase();
  }
  async function inflateRawBounded(data,limit,expected,signal){
    abort(signal);let transform;
    try{transform=new DecompressionStream('deflate-raw');}catch(_){fail('DEFLATE_UNAVAILABLE','Trình duyệt chưa hỗ trợ giải nén deflate-raw.');}
    const reader=new Blob([data]).stream().pipeThrough(transform).getReader();
    const chunks=[];let size=0;
    const onAbort=()=>{reader.cancel().catch(()=>{});};
    if(signal&&typeof signal.addEventListener==='function')signal.addEventListener('abort',onAbort,{once:true});
    try{
      for(;;){abort(signal);const part=await reader.read();abort(signal);if(part.done)break;size+=part.value.byteLength;if(size>limit||size>expected){await reader.cancel().catch(()=>{});fail('OUTPUT_LIMIT','Dữ liệu giải nén vượt kích thước hoặc giới hạn đã khai báo.');}chunks.push(part.value);}
      if(size!==expected)fail('SIZE_MISMATCH','Kích thước giải nén khác central directory.');
      const out=new Uint8Array(size);let cursor=0;for(const chunk of chunks){out.set(chunk,cursor);cursor+=chunk.length;}return out;
    }catch(e){await reader.cancel().catch(()=>{});if(e&&typeof e.code==='string'&&e.code.startsWith('ZIP_'))throw e;abort(signal);fail('DEFLATE_INVALID','Luồng DEFLATE không hợp lệ: '+String(e&&e.message||e).slice(0,160));}
    finally{if(signal&&typeof signal.removeEventListener==='function')signal.removeEventListener('abort',onAbort);reader.releaseLock();}
  }
  function openZip(input,limitsInput){
    const o=opts(limitsInput),a=bytes(input);abort(o.signal);
    if(a.byteLength>o.maxArchiveBytes)fail('ARCHIVE_LIMIT','ZIP vượt giới hạn kích thước đầu vào.');
    if(a.length<22)fail('TRUNCATED','ZIP thiếu end-of-central-directory.');
    const d=new DataView(a.buffer,a.byteOffset,a.byteLength);
    const need=(offset,length,end=a.length)=>{if(!Number.isSafeInteger(offset)||!Number.isSafeInteger(length)||offset<0||length<0||offset+length>end)fail('TRUNCATED','Cấu trúc ZIP vượt phạm vi tệp.');};
    const u16=offset=>{need(offset,2);return d.getUint16(offset,true);};
    const u32=offset=>{need(offset,4);return d.getUint32(offset,true);};
    const ends=[];
    for(let p=a.length-22,low=Math.max(0,a.length-22-65535);p>=low;p--)if(u32(p)===0x06054b50&&p+22+u16(p+20)===a.length)ends.push(p);
    if(ends.length!==1)fail('EOCD',ends.length?'ZIP có nhiều end record gây mơ hồ.':'Không tìm thấy end record hoàn chỉnh.');
    const end=ends[0];
    if(u16(end+4)||u16(end+6)||u16(end+8)!==u16(end+10))fail('MULTIDISK','Chưa hỗ trợ ZIP chia nhiều đĩa.');
    const count=u16(end+10),cdSize=u32(end+12),cdOffset=u32(end+16);
    if(count===65535||cdSize===0xffffffff||cdOffset===0xffffffff||(end>=20&&u32(end-20)===0x07064b50))fail('ZIP64','Chưa hỗ trợ ZIP64.');
    if(count>o.maxEntries)fail('ENTRY_COUNT','ZIP có quá nhiều mục.');
    need(cdOffset,cdSize,end);
    if(cdOffset+cdSize!==end)fail('CENTRAL_LAYOUT','Central directory không kết thúc tại end record; phần mở rộng này chưa được hỗ trợ.');
    const entries=[],ranges=[],keys=new Set();let p=cdOffset,total=0,compressedTotal=0;
    function extras(start,length,rawName){
      need(start,length);let q=start;const stop=start+length,seen=new Set();let unicodeName=null;
      while(q<stop){need(q,4,stop);const id=u16(q),n=u16(q+2);q+=4;need(q,n,stop);if(seen.has(id))fail('EXTRA_DUPLICATE','Extra field ZIP trùng mã.');seen.add(id);
        if(id===1)fail('ZIP64','Chưa hỗ trợ ZIP64 extra field.');
        if(id===0x9901||id===0x0017)fail('ENCRYPTED','Chưa hỗ trợ ZIP được mã hóa.');
        if(id===0x7075){if(n<5||a[q]!==1)fail('UNICODE_EXTRA','Unicode path extra không được hỗ trợ.');if(u32(q+1)!==crc32(rawName))fail('UNICODE_EXTRA','CRC của Unicode path extra không khớp tên nguồn.');unicodeName=utf8(a.subarray(q+5,q+n));}
        q+=n;
      }
      return{unicodeName};
    }
    for(let i=0;i<count;i++){
      abort(o.signal);need(p,46,end);if(u32(p)!==0x02014b50)fail('CENTRAL_SIGNATURE','Central directory có chữ ký không hợp lệ.');
      const made=u16(p+4),needed=u16(p+6),flags=u16(p+8),method=u16(p+10),crc=u32(p+16),compressedSize=u32(p+20),size=u32(p+24),nameLength=u16(p+28),extraLength=u16(p+30),commentLength=u16(p+32),disk=u16(p+34),attributes=u32(p+38),offset=u32(p+42);
      if(disk)fail('MULTIDISK','Entry thuộc đĩa khác.');
      if([compressedSize,size,offset].includes(0xffffffff))fail('ZIP64','Entry dùng ZIP64.');
      if(flags&(1|64|8192))fail('ENCRYPTED','Chưa hỗ trợ ZIP được mã hóa.');
      if(flags&~(2|4|8|2048))fail('FLAGS','ZIP dùng general-purpose flags chưa hỗ trợ.');
      if(method!==0&&method!==8)fail('METHOD','Chưa hỗ trợ ZIP compression method='+method+'.');
      if(method===8&&needed<20)fail('VERSION','Deflate entry khai báo phiên bản ZIP quá thấp.');
      if(method===0&&(flags&6))fail('FLAGS','Stored entry có cờ riêng của Deflate.');
      if(!nameLength)fail('FILENAME','Tên ZIP rỗng.');
      need(p+46,nameLength+extraLength+commentLength,end);
      const rawName=a.subarray(p+46,p+46+nameLength),archiveName=decodeName(rawName,!!(flags&2048));
      pathKey(archiveName);
      const ex=extras(p+46+nameLength,extraLength,rawName);
      if((flags&2048)&&ex.unicodeName!==null&&ex.unicodeName!==archiveName)fail('NAME_MISMATCH','Tên UTF-8 và Unicode extra khác nhau.');
      const path=ex.unicodeName===null?archiveName:ex.unicodeName,key=pathKey(path);
      if(keys.has(key))fail('DUPLICATE_PATH','ZIP có tên trùng hoặc xung đột chữ hoa/thường: '+path);
      keys.add(key);
      const unixType=(attributes>>>16)&0xf000;
      if(unixType===0xa000||((made>>>8)===3&&unixType!==0&&unixType!==0x8000&&unixType!==0x4000))fail('SPECIAL_FILE','ZIP chứa symlink hoặc loại tệp đặc biệt chưa hỗ trợ.');
      const isDirectory=path.endsWith('/')||!!(attributes&16)||((made>>>8)===3&&unixType===0x4000);
      if(isDirectory&&size!==0)fail('DIRECTORY_DATA','Directory entry có nội dung không rỗng.');
      if(size>o.maxEntryBytes)fail('ENTRY_LIMIT','Entry vượt giới hạn kích thước: '+path);
      if(method===0&&size!==compressedSize)fail('STORED_SIZE','Stored entry có kích thước không khớp.');
      if(method===8&&compressedSize===0)fail('DEFLATE_INVALID','Deflate entry thiếu dữ liệu.');
      if(size/Math.max(1,compressedSize)>o.maxRatio)fail('RATIO_LIMIT','Tỷ lệ giải nén vượt giới hạn: '+path);
      total+=size;compressedTotal+=compressedSize;
      if(total>o.maxTotalBytes)fail('TOTAL_LIMIT','Tổng kích thước entry vượt giới hạn.');
      need(offset,30,cdOffset);if(u32(offset)!==0x04034b50)fail('LOCAL_SIGNATURE','Local header không hợp lệ: '+path);
      const localNeeded=u16(offset+4),localFlags=u16(offset+6),localMethod=u16(offset+8),localCRC=u32(offset+14),localCompressed=u32(offset+18),localSize=u32(offset+22),localNameLength=u16(offset+26),localExtraLength=u16(offset+28);
      if(localNeeded!==needed||localFlags!==flags||localMethod!==method)fail('LOCAL_MISMATCH','Local và central header khác nhau: '+path);
      if(localCompressed===0xffffffff||localSize===0xffffffff)fail('ZIP64','Local header dùng ZIP64.');
      if(needed>20)fail('VERSION','Entry yêu cầu phiên bản ZIP vượt phạm vi hỗ trợ.');
      need(offset+30,localNameLength+localExtraLength,cdOffset);
      const localName=a.subarray(offset+30,offset+30+localNameLength);
      if(!sameBytes(localName,rawName))fail('NAME_MISMATCH','Tên local và central không khớp.');
      const localEx=extras(offset+30+localNameLength,localExtraLength,localName);
      if(localEx.unicodeName!==null&&localEx.unicodeName!==path)fail('NAME_MISMATCH','Unicode local path không khớp central.');
      if(!(flags&8)){
        if(localCRC!==crc||localCompressed!==compressedSize||localSize!==size)fail('LOCAL_MISMATCH','CRC/kích thước local và central không khớp.');
      }else if((localCRC!==0&&localCRC!==crc)||(localCompressed!==0&&localCompressed!==compressedSize)||(localSize!==0&&localSize!==size))fail('LOCAL_MISMATCH','Local data-descriptor metadata không khớp.');
      const dataStart=offset+30+localNameLength+localExtraLength,dataEnd=dataStart+compressedSize;need(dataStart,compressedSize,cdOffset);let recordEnd=dataEnd;
      if(flags&8){
        const candidates=[];
        if(dataEnd+12<=cdOffset&&u32(dataEnd)===crc&&u32(dataEnd+4)===compressedSize&&u32(dataEnd+8)===size)candidates.push(12);
        if(dataEnd+16<=cdOffset&&u32(dataEnd)===0x08074b50&&u32(dataEnd+4)===crc&&u32(dataEnd+8)===compressedSize&&u32(dataEnd+12)===size)candidates.push(16);
        if(candidates.length!==1)fail('DESCRIPTOR','Data descriptor thiếu, mơ hồ hoặc không khớp central directory.');
        recordEnd+=candidates[0];
      }
      ranges.push({start:offset,end:recordEnd,path});
      const entry={path,archiveName,size,compressedSize,crc32:crc,method,isDirectory,flags,nameEncoding:ex.unicodeName!==null?'unicode-path':flags&2048?'utf8':'cp437',localHeaderOffset:offset,
        async read(readOptions){
          const ro=readOptions||{},signal=ro.signal||o.signal;abort(signal);
          const requested=ro.maxOutputBytes===undefined?(ro.maxBytes===undefined?o.maxEntryBytes:ro.maxBytes):ro.maxOutputBytes;
          if(!Number.isSafeInteger(requested)||requested<0)fail('LIMIT','Giới hạn read entry không hợp lệ.');
          const limit=Math.min(o.maxEntryBytes,requested);if(size>limit)fail('ENTRY_LIMIT','Entry vượt giới hạn đọc.');
          const compressed=a.subarray(dataStart,dataEnd);
          const out=method===0?new Uint8Array(compressed):await inflateRawBounded(compressed,limit,size,signal);
          abort(signal);if(out.length!==size)fail('SIZE_MISMATCH','Độ dài entry không khớp.');
          if(crc32(out)!==crc)fail('CRC_MISMATCH','CRC-32 không khớp: '+path);return out;
        }};
      entries.push(Object.freeze(entry));p+=46+nameLength+extraLength+commentLength;
    }
    if(p!==cdOffset+cdSize)fail('CENTRAL_SIZE','Số entry và kích thước central directory không khớp.');
    ranges.sort((x,y)=>x.start-y.start);
    for(let i=1;i<ranges.length;i++)if(ranges[i].start<ranges[i-1].end)fail('OVERLAP','Các local record của ZIP chồng lấn.');
    // File/directory aliases and file-as-parent ambiguity are rejected before reads.
    const fileKeys=new Set(entries.filter(e=>!e.isDirectory).map(e=>pathKey(e.path)));
    for(const e of entries){const parts=pathKey(e.path).split('/');for(let n=1;n<parts.length;n++)if(fileKeys.has(parts.slice(0,n).join('/')))fail('PATH_CONFLICT','Một tệp ZIP đồng thời được dùng làm thư mục.');}
    abort(o.signal);
    return Object.freeze({entries:Object.freeze(entries),metadata:Object.freeze({format:'zip',entryCount:entries.length,fileCount:entries.filter(e=>!e.isDirectory).length,archiveBytes:a.length,totalUncompressedBytes:total,totalCompressedBytes:compressedTotal,centralDirectoryOffset:cdOffset,centralDirectoryBytes:cdSize,commentBytes:u16(end+20),crcCheckedOnRead:true,zip64:false,multiDisk:false})});
  }
  function discover(input){
    const entries=Array.isArray(input)?input:input&&input.entries;
    if(!Array.isArray(entries))fail('DISCOVERY_INPUT','discover cần danh sách entry.');
    const regions=[],unknownRegions=[],levelDat=[],dbFiles=[],structures=[],manifests=[],nested=[],javaPacks=[],javaMods=[],warnings=[];
    const dimensionGroups=new Map(),coordinateGroups=new Map();
    for(const e of entries){
      if(!e||typeof e.path!=='string')fail('DISCOVERY_INPUT','Entry thiếu path.');pathKey(e.path);if(e.isDirectory||e.path.endsWith('/'))continue;
      const p=e.path,lower=p.toLowerCase(),ref={path:p,entry:e};
      if(lower.endsWith('.mcstructure'))structures.push(ref);
      if(/(^|\/)manifest\.json$/i.test(p))manifests.push(ref);
      if(/\.(mcpack|mcaddon)$/i.test(p))nested.push(ref);
      if(/(^|\/)pack\.mcmeta$/i.test(p))javaPacks.push(ref);
      if(/\.jar$/i.test(p))javaMods.push(ref);
      if(/(^|\/)level\.dat$/i.test(p))levelDat.push(Object.assign({worldRoot:p.slice(0,p.length-'level.dat'.length)},ref));
      const db=p.match(/^(?:(.*)\/)?db\/([^/]+)$/i);if(db)dbFiles.push(Object.assign({worldRoot:db[1]?db[1]+'/':''},ref));
      if(!/\.mca$/i.test(p))continue;
      // Terrain region only: entities and poi have different payload semantics.
      if(/(^|\/)(entities|poi)\/r\.-?\d+\.-?\d+\.mca$/i.test(p))continue;
      const name=p.match(/(?:^|\/)r\.(-?\d+)\.(-?\d+)\.mca$/i);
      if(!name){unknownRegions.push(ref);warnings.push({code:'UNRECOGNIZED_REGION_NAME',path:p});continue;}
      const regionX=Number(name[1]),regionZ=Number(name[2]);
      if(!Number.isSafeInteger(regionX)||!Number.isSafeInteger(regionZ)||regionX< -2147483648||regionX>2147483647||regionZ< -2147483648||regionZ>2147483647){unknownRegions.push(ref);warnings.push({code:'REGION_COORDINATE_RANGE',path:p});continue;}
      let worldRoot='',dimension=null,layout='loose-region';
      const modern=p.match(/^(?:(.*)\/)?dimensions\/([a-z0-9_.-]+)\/([a-z0-9_./-]+)\/region\/r\.-?\d+\.-?\d+\.mca$/);
      const classic=p.match(/^(?:(.*)\/)?region\/r\.-?\d+\.-?\d+\.mca$/);
      if(modern){worldRoot=modern[1]?modern[1]+'/':'';dimension=modern[2]+':'+modern[3];layout='dimensions';}
      else if(/(^|\/)dimensions\//.test(p)){unknownRegions.push(ref);warnings.push({code:'UNRECOGNIZED_DIMENSION_PATH',path:p});continue;}
      else if(classic){let prefix=classic[1]||'';if(/(^|\/)DIM-1$/.test(prefix)){dimension='minecraft:the_nether';prefix=prefix.replace(/(^|\/)DIM-1$/,'');}else if(/(^|\/)DIM1$/.test(prefix)){dimension='minecraft:the_end';prefix=prefix.replace(/(^|\/)DIM1$/,'');}else dimension='minecraft:overworld';worldRoot=prefix?prefix+'/':'';layout='classic';}
      else if(p.includes('/')){unknownRegions.push(ref);warnings.push({code:'REGION_OUTSIDE_KNOWN_LAYOUT',path:p});continue;}
      const r=Object.assign({worldRoot,dimension,layout,regionX,regionZ},ref);regions.push(r);
      const dk=worldRoot+'\u0000'+String(dimension),ck=dk+'\u0000'+regionX+','+regionZ;
      if(!dimensionGroups.has(dk))dimensionGroups.set(dk,{worldRoot,dimension,layouts:new Set(),regions:[]});
      dimensionGroups.get(dk).layouts.add(layout);dimensionGroups.get(dk).regions.push(r);
      if(coordinateGroups.has(ck))warnings.push({code:'DUPLICATE_REGION_COORDINATE',paths:[coordinateGroups.get(ck),p],dimension,worldRoot});else coordinateGroups.set(ck,p);
    }
    const dimensions=Array.from(dimensionGroups.values(),g=>({worldRoot:g.worldRoot,dimension:g.dimension,layouts:Array.from(g.layouts),regionCount:g.regions.length,paths:g.regions.map(r=>r.path)}));
    for(const d of dimensions)if(d.layouts.length>1)warnings.push({code:'JAVA_LAYOUT_COLLISION',worldRoot:d.worldRoot,dimension:d.dimension,layouts:d.layouts,action:'Choose source explicitly; do not silently merge.'});
    const bedrockRoots=new Set(dbFiles.map(x=>x.worldRoot)),javaRoots=new Set(regions.map(x=>x.worldRoot));
    const bedrockLevelDat=levelDat.filter(x=>bedrockRoots.has(x.worldRoot));
    const javaLevelDat=levelDat.filter(x=>javaRoots.has(x.worldRoot)&&!bedrockRoots.has(x.worldRoot));
    if(dbFiles.length)warnings.push({code:'MCWORLD_LEVELDB_UNSUPPORTED',count:dbFiles.length});
    if(javaMods.length)warnings.push({code:'JAVA_MOD_RUNTIME_UNSUPPORTED',count:javaMods.length});
    const kinds=[];if(regions.length)kinds.push('java-world');if(dbFiles.length)kinds.push('bedrock-world');if(structures.length)kinds.push('structures');if(manifests.length||nested.length)kinds.push('bedrock-addons');if(javaPacks.length)kinds.push('java-packs');if(javaMods.length)kinds.push('java-mods');
    return{kind:kinds.length===1?kinds[0]:kinds.length?'mixed':'unknown',kinds,java:{regions,unknownRegions,levelDat:javaLevelDat,dimensions,fullWorldSupported:false},bedrock:{dbFiles,levelDat:bedrockLevelDat,fullWorldSupported:false},structures,packs:{manifests,nested,javaPacks,javaMods,runtimeCompatible:false},levelDat,warnings,contentExecuted:false};
  }
  async function inspectPackages(zip,optionsInput){
    const o=opts(optionsInput);let archives=0,totalDeclared=0;const reports=[],warnings=[];
    async function visit(current,parent,depth){
      abort(o.signal);if(++archives>o.maxNestedArchives)fail('NESTED_COUNT','Quá nhiều gói lồng nhau.');
      totalDeclared+=current.metadata.totalUncompressedBytes;if(totalDeclared>o.maxTotalBytes)fail('TOTAL_LIMIT','Tổng dữ liệu gói lồng nhau vượt giới hạn.');
      const discovery=discover(current.entries),packEntries=[];
      for(const e of current.entries){if(e.isDirectory)continue;const item={path:e.path};
        if(/(^|\/)manifest\.json$/i.test(e.path)){const raw=await e.read({signal:o.signal,maxOutputBytes:o.maxManifestBytes});try{item.json=new TextDecoder('utf-8',{fatal:true}).decode(raw);}catch(_){warnings.push({code:'MANIFEST_UTF8_INVALID',archive:parent,path:e.path});}}
        packEntries.push(item);
      }
      const inspection=root.MCImportBedrock?root.MCImportBedrock.inspectPackEntries(packEntries,{signal:o.signal,maxManifestBytes:o.maxManifestBytes,maxPackEntries:o.maxEntries}):null;
      reports.push({archive:parent,depth,inspection,discovery:{kind:discovery.kind,kinds:discovery.kinds,structurePaths:discovery.structures.map(e=>e.path),warnings:discovery.warnings}});
      for(const item of discovery.packs.nested){
        if(depth>=o.maxDepth){warnings.push({code:'NESTED_DEPTH_LIMIT',archive:parent,path:item.path});continue;}
        if(archives>=o.maxNestedArchives)fail('NESTED_COUNT','Quá nhiều gói lồng nhau.');
        const data=await item.entry.read({signal:o.signal,maxOutputBytes:o.maxArchiveBytes});
        const nestedZip=openZip(data,o);await visit(nestedZip,parent?parent+'!/'+item.path:item.path,depth+1);
      }
    }
    await visit(zip,'',0);return{status:'inspected',archives,totalDeclaredBytes:totalDeclared,reports,warnings,runtimeCompatible:false,contentExecuted:false};
  }
  const api=Object.freeze({version:'1.0.0',limits:LIMITS,openZip,discover,inspectPackages,crc32});
  root.MCImportContainer=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
