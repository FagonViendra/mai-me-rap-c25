/* MảiMêRáp: read-only Bedrock data adapters. Original implementation, 2026-11-02.
 * No network, script evaluation, or world mutation. NBT/decompression provided by MCImportJava.
 */
(function (root) {
  'use strict';
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const record = v => v !== null && typeof v === 'object' && !Array.isArray(v) && !ArrayBuffer.isView(v);
  const LIMITS = Object.freeze({maxBytes: 32 * 1024 * 1024, maxOutputBytes: 64 * 1024 * 1024, maxBlocks: 1048576, maxPalette: 65536, maxDepth: 64, maxNodes: 3000000, maxArrayLength: 2097152, maxEntities: 100000, maxManifestBytes: 1048576, maxPackEntries: 20000});
  function fail(code, message) { const e = new Error(message); e.name = 'BedrockImportError'; e.code = 'BEDROCK_' + code; throw e; }
  function checkAbort(signal) { if (signal && signal.aborted) fail('CANCELLED', 'Đã hủy đọc dữ liệu Bedrock.'); }
  function options(input) {
    const o = Object.assign({}, LIMITS, input || {});
    for (const key of Object.keys(LIMITS)) if (!Number.isSafeInteger(o[key]) || o[key] < 1) fail('LIMIT', 'Giới hạn không hợp lệ: ' + key);
    return o;
  }
  function bytes(input) {
    if (input instanceof Uint8Array) return input;
    if (input instanceof ArrayBuffer) return new Uint8Array(input);
    if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    fail('INPUT', 'Dữ liệu phải là ArrayBuffer hoặc Uint8Array.');
  }
  function requireTag(tag, type, label) {
    if (!tag || tag.type !== type) fail('NBT_TYPE', label + ' phải có kiểu NBT ' + type + '.');
    return tag.value;
  }
  function compound(tag, label) {
    const v = requireTag(tag, 'compound', label);
    if (!record(v)) fail('NBT_TYPE', label + ' không chứa compound hợp lệ.');
    return v;
  }
  function list(tag, elementType, label) {
    const v = requireTag(tag, 'list', label);
    if (!record(v) || v.type !== elementType || !Array.isArray(v.value)) fail('NBT_TYPE', label + ' phải là List<' + elementType + '>.');
    return v.value;
  }
  function intTag(tag, label) {
    const v = requireTag(tag, 'int', label);
    if (!Number.isInteger(v) || v < -2147483648 || v > 2147483647) fail('NBT_INT', label + ' không phải Int32.');
    return v;
  }
  function vector(tag, label, positive) {
    const v = list(tag, 'int', label);
    if (v.length !== 3 || v.some(n => !Number.isInteger(n) || n < -2147483648 || n > 2147483647 || (positive && n <= 0))) fail('SIZE', label + ' phải chứa đúng ba số nguyên' + (positive ? ' dương.' : '.'));
    return v.slice();
  }
  // JSON-safe typed preservation: long precision and NBT tag types are explicit.
  function portableNBT(tag, optionsInput) {
    const o = options(optionsInput), budget = {nodes: 0};
    function visit(t, depth) {
      if (++budget.nodes > o.maxNodes || depth > o.maxDepth) fail('METADATA_LIMIT', 'Metadata NBT vượt giới hạn bảo tồn.');
      if (!t || typeof t.type !== 'string') fail('NBT_TYPE', 'Tag metadata không hợp lệ.');
      const out = Object.create(null); out.type = t.type;
      if (typeof t.name === 'string') out.name = t.name;
      const value = t.value;
      if (t.type === 'compound') {
        const map = compound(t, 'metadata'); out.value = Object.create(null);
        for (const key of Object.keys(map)) out.value[key] = visit(map[key], depth + 1);
      } else if (t.type === 'list') {
        if (!record(value) || !Array.isArray(value.value)) fail('NBT_TYPE', 'List metadata không hợp lệ.');
        out.value = {type: value.type, value: value.value.map(v => visit({type: value.type, value: v}, depth + 1).value)};
      } else if (t.type === 'long') {
        if (typeof value !== 'bigint') fail('NBT_TYPE', 'Long metadata phải giữ độ chính xác BigInt.');
        out.value = value.toString(); out.encoding = 'decimal';
      } else if (t.type === 'longArray') {
        out.value = Array.from(value, v => String(v)); out.encoding = 'decimal';
      } else if (t.type === 'byteArray' || t.type === 'intArray') {
        out.value = Array.from(value);
      } else if (typeof value === 'number' && !Number.isFinite(value)) {
        out.value = String(value); out.encoding = 'nonfinite';
      } else out.value = value;
      return out;
    }
    return visit(tag, 0);
  }
  function remainingTags(map, excluded, o) {
    const selected = Object.create(null);
    for (const key of Object.keys(map)) if (!excluded.includes(key)) selected[key] = map[key];
    return portableNBT({type: 'compound', value: selected}, o);
  }
  async function parseStructure(input, optionsInput) {
    const o = options(optionsInput); checkAbort(o.signal);
    const inputBytes = bytes(input);
    if (inputBytes.byteLength > o.maxBytes) fail('FILE_LIMIT', 'Tệp .mcstructure vượt giới hạn byte.');
    const api = root.MCImportJava;
    if (!api || typeof api.decodeNBT !== 'function' || typeof api.decompress !== 'function') fail('DEPENDENCY', 'Chưa có bộ đọc NBT/decompression.');
    const nbtOptions = {littleEndian: true, stringEncoding: 'utf8', maxBytes: o.maxOutputBytes, maxDepth: o.maxDepth, maxNodes: o.maxNodes, maxArrayLength: o.maxArrayLength};
    const sourceNBT = api.decodeNBT(inputBytes, nbtOptions);
    if (sourceNBT.bytesRead !== inputBytes.byteLength) fail('TRAILING_BYTES', 'Có byte thừa sau NBT root.');
    const source = compound(sourceNBT, 'root');
    const formatVersion = intTag(source.format_version, 'format_version');
    if (formatVersion !== 1 && formatVersion !== 2) fail('UNSUPPORTED_VERSION', 'Chưa hỗ trợ .mcstructure format_version=' + formatVersion + '.');
    const compression = own(source, 'compression') ? intTag(source.compression, 'compression') : 0;
    if (compression !== 0 && compression !== 1) fail('UNSUPPORTED_COMPRESSION', 'Chưa hỗ trợ compression=' + compression + '.');
    if (formatVersion === 1 && compression !== 0) fail('UNSUPPORTED_COMPRESSION', 'Nén structure chỉ được hỗ trợ cho format_version=2.');
    const size = vector(source.size, 'size', true), origin = vector(source.structure_world_origin, 'structure_world_origin', false);
    const volume = size[0] * size[1] * size[2];
    if (!Number.isSafeInteger(volume) || volume > o.maxBlocks) fail('VOLUME_LIMIT', 'Thể tích structure vượt giới hạn ' + o.maxBlocks + ' khối.');
    let structureNBT = source.structure, compressedBytes = 0, decompressedBytes = 0;
    if (compression === 1) {
      const zipped = requireTag(structureNBT, 'byteArray', 'structure nén');
      compressedBytes = zipped.byteLength;
      checkAbort(o.signal);
      const inflated = bytes(await api.decompress(zipped, 'zlib', {maxOutputBytes: o.maxOutputBytes, signal: o.signal}));
      checkAbort(o.signal); decompressedBytes = inflated.byteLength;
      if (decompressedBytes > o.maxOutputBytes) fail('DECOMPRESS_LIMIT', 'Structure giải nén vượt giới hạn.');
      structureNBT = api.decodeNBT(inflated, nbtOptions);
      if (structureNBT.bytesRead !== inflated.byteLength) fail('TRAILING_BYTES', 'Có byte thừa trong structure giải nén.');
    }
    const structure = compound(structureNBT, 'structure');
    const palettes = compound(structure.palette, 'structure.palette');
    const defaultPalette = compound(palettes.default, 'structure.palette.default');
    const blockPalette = list(defaultPalette.block_palette, 'compound', 'block_palette');
    if (blockPalette.length < 1 || blockPalette.length > o.maxPalette) fail('PALETTE_LIMIT', 'Số mục palette không hợp lệ hoặc vượt giới hạn.');
    const warnings = [];
    const palette = blockPalette.map((entry, index) => {
      if (!record(entry)) fail('PALETTE_ENTRY', 'Palette[' + index + '] không hợp lệ.');
      const name = requireTag(entry.name, 'string', 'palette.name');
      if (typeof name !== 'string' || !name.length || name.length > 512 || /[\u0000-\u001f]/.test(name)) fail('BLOCK_NAME', 'Tên khối không hợp lệ.');
      const properties = Object.create(null), states = compound(entry.states, 'palette.states');
      for (const key of Object.keys(states)) {
        const t = states[key];
        if (!t || !['string', 'int', 'byte'].includes(t.type)) fail('BLOCK_STATE_TYPE', 'State ' + key + ' cần String/Int/Byte.');
        properties[key] = t.value;
      }
      const version = own(entry, 'version') ? intTag(entry.version, 'palette.version') : null;
      if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(name)) warnings.push({code:'NONCANONICAL_IDENTIFIER', paletteIndex:index, identifier:name});
      return {name, properties, states: portableNBT(entry.states, o).value, version, extra: remainingTags(entry, ['name','states','version'], o)};
    });
    const indices = requireTag(structure.block_indices, 'list', 'block_indices');
    const layerType = formatVersion === 1 ? 'list' : 'intArray';
    if (!record(indices) || indices.type !== layerType || !Array.isArray(indices.value)) fail('INDEX_TYPE', 'block_indices không khớp phiên bản structure.');
    const layerCount = indices.value.length;
    if ((formatVersion === 1 && layerCount !== 2) || (formatVersion === 2 && layerCount !== 1 && layerCount !== 2)) fail('LAYER_COUNT', 'Số lớp block_indices không hợp lệ.');
    const layers = [];
    for (let layer = 0; layer < layerCount; layer++) {
      const raw = layerType === 'list' ? list({type:'list', value:indices.value[layer]}, 'int', 'block_indices['+layer+']') : indices.value[layer];
      if ((!Array.isArray(raw) && !(raw instanceof Int32Array)) || raw.length !== volume) fail('LAYER_LENGTH', 'Số ô của lớp ' + layer + ' không bằng size X×Y×Z.');
      const output = new Int32Array(volume);
      for (let i = 0; i < volume; i++) {
        if ((i & 4095) === 0) checkAbort(o.signal);
        const value = raw[i];
        if (!Number.isInteger(value) || value < -1 || value >= palette.length) fail('PALETTE_INDEX', 'Palette index không hợp lệ tại lớp ' + layer + ', ô ' + i + '.');
        output[i] = value;
      }
      layers.push(output);
    }
    if (layerCount === 1) layers.push(new Int32Array(volume).fill(-1));
    let entitiesTag = structure.entities;
    if (!entitiesTag) entitiesTag = {type:'list', value:{type:'compound',value:[]}};
    const entityList = requireTag(entitiesTag, 'list', 'entities');
    // NBT permits TAG_End as an empty list's element type.
    const entities = record(entityList) && entityList.type === 'end' && Array.isArray(entityList.value) && entityList.value.length === 0 ? [] : list(entitiesTag, 'compound', 'entities');
    if (entities.length > o.maxEntities) fail('ENTITY_LIMIT', 'Số entity vượt giới hạn.');
    const blockPositionTag = defaultPalette.block_position_data || {type:'compound',value:Object.create(null)};
    const positionData = compound(blockPositionTag, 'block_position_data');
    for (const index of Object.keys(positionData)) {
      if (!/^(0|[1-9][0-9]*)$/.test(index) || !Number.isSafeInteger(Number(index)) || Number(index) >= volume) fail('POSITION_DATA', 'block_position_data có vị trí ngoài structure.');
      compound(positionData[index], 'block_position_data['+index+']');
    }
    const metadata = {
      entityCount: entities.length, blockEntityPositionCount: Object.keys(positionData).length,
      entities: portableNBT(entitiesTag, o), blockPositionData: portableNBT(blockPositionTag, o),
      rootExtra: remainingTags(source, ['format_version','compression','size','structure_world_origin','structure'], o),
      structureExtra: remainingTags(structure, ['block_indices','entities','palette'], o),
      defaultPaletteExtra: remainingTags(defaultPalette, ['block_palette','block_position_data'], o),
      alternatePalettes: remainingTags(palettes, ['default'], o),
    };
    if (entities.length) warnings.push({code:'ENTITIES_PRESERVED_NOT_EXECUTED', count:entities.length});
    if (Object.keys(positionData).length) warnings.push({code:'BLOCK_ENTITY_DATA_PRESERVED_NOT_EXECUTED',count:Object.keys(positionData).length});
    const occupiedSecondLayer = layers[1].reduce((count, p) => count + (p >= 0 ? 1 : 0), 0);
    if (occupiedSecondLayer) warnings.push({code:'SECOND_LAYER_REQUIRES_MAPPING', count:occupiedSecondLayer});
    checkAbort(o.signal);
    return {sourceEdition:'bedrock',format:'mcstructure',formatVersion,compression,size,origin,volume,palette,layers,layerCount,metadata,sourceNBT,structureNBT,warnings,stats:{inputBytes:inputBytes.byteLength,compressedBytes,decompressedBytes,occupiedSecondLayer},indexOrder:'x*sizeY*sizeZ+y*sizeZ+z',sourceMutated:false};
  }
  function validPath(path) { return typeof path === 'string' && path.length > 0 && !path.includes('\\') && !path.startsWith('/') && !/^[a-zA-Z]:/.test(path) && !path.split('/').some(p=>p==='..'||p==='') && !/[\u0000-\u001f]/.test(path); }
  const uuid = v => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  const version = v => (Array.isArray(v) && v.length === 3 && v.every(n=>Number.isSafeInteger(n)&&n>=0)) || (typeof v === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(v));
  function inspectManifest(input, optionsInput) {
    const o = options(optionsInput), errors = [], warnings = [];
    let manifest = input;
    if (typeof input === 'string') {
      if (new TextEncoder().encode(input).byteLength > o.maxManifestBytes) fail('MANIFEST_LIMIT', 'manifest.json quá lớn.');
      try { manifest = JSON.parse(input); } catch (_) { return {kind:'bedrock-manifest',status:'invalid',errors:[{code:'INVALID_JSON'}],warnings:[],runtimeCompatible:false,contentExecuted:false}; }
    }
    if (!record(manifest)) return {kind:'bedrock-manifest',status:'invalid',errors:[{code:'MANIFEST_OBJECT'}],warnings:[],runtimeCompatible:false,contentExecuted:false};
    const h = record(manifest.header) ? manifest.header : Object.create(null);
    if (![1,2,3].includes(manifest.format_version)) errors.push({code:'UNSUPPORTED_MANIFEST_VERSION',value:manifest.format_version});
    if (typeof h.name !== 'string' || !h.name.trim()) errors.push({code:'MISSING_NAME'});
    if (!uuid(h.uuid)) errors.push({code:'INVALID_HEADER_UUID'});
    if (!version(h.version)) errors.push({code:'INVALID_HEADER_VERSION'});
    const rawModules = Array.isArray(manifest.modules) ? manifest.modules : [];
    if (!rawModules.length || rawModules.length > 64) errors.push({code:'INVALID_MODULE_COUNT'});
    const modules = [], ids = new Set();
    for (const m of rawModules.slice(0,64)) {
      if (!record(m)) {errors.push({code:'INVALID_MODULE'}); continue;}
      if (!['resources','data','world_template','script','skin_pack'].includes(m.type)) warnings.push({code:'UNKNOWN_MODULE_TYPE',value:m.type});
      if (!uuid(m.uuid) || m.uuid.toLowerCase() === String(h.uuid).toLowerCase() || ids.has(m.uuid.toLowerCase())) errors.push({code:'INVALID_OR_DUPLICATE_MODULE_UUID'});
      else ids.add(m.uuid.toLowerCase());
      if (!version(m.version)) errors.push({code:'INVALID_MODULE_VERSION'});
      if (m.type === 'script') {
        if (m.language !== 'javascript') errors.push({code:'UNSUPPORTED_SCRIPT_LANGUAGE'});
        if (!validPath(m.entry)) errors.push({code:'INVALID_SCRIPT_ENTRY'});
        warnings.push({code:'SCRIPT_RUNTIME_UNSUPPORTED',entry:m.entry || null});
      }
      modules.push({type:m.type || null,uuid:m.uuid || null,version:m.version || null,language:m.language || null,entry:m.entry || null});
    }
    if (rawModules.some(m=>record(m)&&['data','resources'].includes(m.type)) && !version(h.min_engine_version)) warnings.push({code:'MISSING_MIN_ENGINE_VERSION'});
    if (manifest.format_version === 3) warnings.push({code:'MANIFEST_V3_INSPECTED_ONLY'});
    const dependencies = [];
    if (own(manifest,'dependencies') && !Array.isArray(manifest.dependencies)) errors.push({code:'INVALID_DEPENDENCIES'});
    for (const d of (Array.isArray(manifest.dependencies)?manifest.dependencies:[]).slice(0,256)) {
      if (!record(d) || (!uuid(d.uuid) && typeof d.module_name !== 'string') || !version(d.version)) errors.push({code:'INVALID_DEPENDENCY'});
      else dependencies.push({uuid:d.uuid || null,moduleName:d.module_name || null,version:d.version});
    }
    if (Array.isArray(manifest.dependencies) && manifest.dependencies.length>256) errors.push({code:'DEPENDENCY_LIMIT'});
    return {kind:'bedrock-manifest',status:errors.length?'invalid':'inspected',path:o.path || null,formatVersion:manifest.format_version || null,name:typeof h.name==='string'?h.name:null,uuid:h.uuid || null,version:h.version || null,minEngineVersion:h.min_engine_version || null,modules,dependencies,capabilities:Array.isArray(manifest.capabilities)?manifest.capabilities.slice():[],errors,warnings,contentExecuted:false,runtimeCompatible:false,support:'metadata-inspection-only'};
  }
  function inspectPackEntries(entries, optionsInput) {
    const o = options(optionsInput);
    if (!Array.isArray(entries) || entries.length > o.maxPackEntries) fail('PACK_LIMIT', 'Danh sách tệp pack không hợp lệ hoặc vượt giới hạn.');
    const counts = {files:0,structures:0,scripts:0,textures:0,behaviorJSON:0,nestedPackages:0,levelDBFiles:0}, manifests = [], warnings = [];
    const seen = new Set();
    for (const e of entries) {
      checkAbort(o.signal);
      if (!record(e) || !validPath(e.path)) fail('PACK_PATH', 'Đường dẫn tệp pack không hợp lệ.');
      if (seen.has(e.path)) fail('PACK_DUPLICATE', 'Đường dẫn pack trùng: '+e.path);
      seen.add(e.path); counts.files++;
      const p = e.path.toLowerCase();
      if (p.endsWith('/manifest.json') || p === 'manifest.json') {
        if (own(e,'json')) manifests.push(inspectManifest(e.json,Object.assign({},o,{path:e.path})));
        else warnings.push({code:'MANIFEST_NOT_DECODED',path:e.path});
      }
      if (p.endsWith('.mcstructure')) counts.structures++;
      if (/\.(js|mjs|cjs)$/.test(p)) counts.scripts++;
      if (/\.(png|tga|jpg|jpeg|webp)$/.test(p)) counts.textures++;
      if (/(^|\/)(entities|blocks|items|recipes|loot_tables|spawn_rules|features|feature_rules)\/.*\.json$/.test(p)) counts.behaviorJSON++;
      if (/\.(mcpack|mcaddon)$/.test(p)) counts.nestedPackages++;
      if (/(^|\/)db\/(.*\.(ldb|log)|CURRENT|MANIFEST-[^/]+)$/i.test(e.path)) counts.levelDBFiles++;
    }
    const known = new Set(manifests.map(m=>m.uuid).filter(Boolean).map(s=>String(s).toLowerCase()));
    for (const m of manifests) for (const d of m.dependencies || []) if (d.uuid && !known.has(d.uuid.toLowerCase())) warnings.push({code:'EXTERNAL_PACK_DEPENDENCY',uuid:d.uuid,from:m.path});
    if (counts.levelDBFiles) warnings.push({code:'MCWORLD_LEVELDB_UNSUPPORTED',count:counts.levelDBFiles});
    if (counts.nestedPackages) warnings.push({code:'NESTED_PACKAGES_REQUIRE_CONTAINER_INSPECTION',count:counts.nestedPackages});
    if (counts.scripts) warnings.push({code:'SCRIPTS_NOT_EXECUTED',count:counts.scripts});
    return {kind:'bedrock-package-inspection',status:'inspected',counts,manifests,warnings,runtimeCompatible:false,contentExecuted:false,worldImportSupported:false,support:'metadata-and-file-classification-only'};
  }
  const api = Object.freeze({version:'1.0.0',limits:LIMITS,parseStructure,portableNBT,inspectManifest,inspectPackEntries});
  root.MCImportBedrock = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
