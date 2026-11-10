/*
 * MảiMêRáp — read-only Minecraft Java/NBT import codec, 2026-11-02.
 * Plain browser JavaScript; no third-party runtime, filesystem, fetch, eval or CDN.
 * Primary references (format facts, not copied implementation):
 * https://www.minecraft.net/en-us/article/minecraft-snapshot-20w17a
 * https://www.minecraft.net/en-us/article/minecraft-snapshot-21w43a
 * https://www.minecraft.net/en-us/article/minecraft-snapshot-24w04a
 * https://www.minecraft.net/en-us/article/minecraft-java-edition-26-1
 * https://www.minecraft.net/en-us/article/minecraft-java-edition-26-3
 * https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/DataInput.html
 * https://github.com/Querz/mcaselector/blob/d31bee6a7a4e894f250bb3ab47347e8c85b6ca5a/src/main/java/net/querz/mcaselector/io/mca/Chunk.java
 * https://github.com/PrismarineJS/prismarine-provider-anvil/blob/0d45bd505788405293f52dc12306a78109faf260/src/1.18/chunk.js
 *
 * Typed NBT follows the familiar {type,name?,value} convention. A compound value
 * is a null-prototype object of named tags; a list value is {type,value:[payload]}.
 * TAG_Long is BigInt; longArray/IntArray/byteArray are typed arrays. Do not JSON
 * stringify this tree without an explicit BigInt/typed-array representation.
 * Parsing preserves all tag payloads and never changes the supplied bytes.
 * Java terrain decoding is an adapter, not a Minecraft simulation or save editor.
 */
(function (root) {
  'use strict';

  const TYPES = Object.freeze(['end', 'byte', 'short', 'int', 'long', 'float',
    'double', 'byteArray', 'string', 'list', 'compound', 'intArray', 'longArray']);
  const DEFAULTS = Object.freeze({
    maxBytes: 16 * 1024 * 1024,
    maxDepth: 64,
    maxNodes: 200000,
    maxArrayLength: 4 * 1024 * 1024,
    maxInputBytes: 16 * 1024 * 1024,
    maxOutputBytes: 16 * 1024 * 1024,
    maxRegionBytes: 256 * 1024 * 1024,
    maxCompressedChunkBytes: 16 * 1024 * 1024,
    maxDecompressedChunkBytes: 16 * 1024 * 1024,
    maxTotalOutputBytes: 64 * 1024 * 1024,
    maxChunks: 1024,
    maxSections: 256,
    maxPaletteEntries: 65536
  });

  class ImportError extends Error {
    constructor(code, message, details) {
      super(message);
      this.name = 'MCImportError';
      this.code = code;
      this.details = details || Object.create(null);
    }
  }
  function fail(code, message, details) { throw new ImportError(code, message, details); }
  function bytesOf(input) {
    if (input instanceof Uint8Array) return input;
    if (input instanceof ArrayBuffer) return new Uint8Array(input);
    if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    fail('INPUT_NOT_BYTES', 'Expected an ArrayBuffer or an ArrayBuffer view.');
  }
  function limit(options, key, fallback) {
    const n = options[key] === undefined ? (fallback === undefined ? DEFAULTS[key] : fallback) : options[key];
    if (!Number.isSafeInteger(n) || n < 1) fail('INVALID_LIMIT', 'Import limits must be positive safe integers.', { key, value: n });
    return n;
  }
  function aborted(signal) {
    if (signal && signal.aborted) fail('IMPORT_ABORTED', 'Import was cancelled.');
  }
  function integer(n, label, min, max) {
    if (!Number.isSafeInteger(n) || n < min || n > max) fail('INVALID_INTEGER', 'Invalid ' + label + '.', { label, value: n, min, max });
    return n;
  }
  function own(object, key) { return Object.prototype.hasOwnProperty.call(object, key); }

  function decodeModifiedUTF8(bytes, offset, length) {
    const end = offset + length;
    let units = [], result = '';
    function emit(unit) {
      units.push(unit);
      if (units.length === 2048) { result += String.fromCharCode.apply(null, units); units = []; }
    }
    for (let p = offset; p < end;) {
      const start = p, a = bytes[p++];
      if (a <= 0x7f) { emit(a); continue; }
      if ((a & 0xe0) === 0xc0) {
        if (p >= end) fail('NBT_BAD_MUTF8', 'Truncated modified UTF-8 sequence.', { offset: start });
        const b = bytes[p++];
        if ((b & 0xc0) !== 0x80) fail('NBT_BAD_MUTF8', 'Invalid modified UTF-8 continuation.', { offset: start });
        const unit = ((a & 31) << 6) | (b & 63);
        if (unit !== 0 && unit < 128) fail('NBT_BAD_MUTF8', 'Overlong modified UTF-8 sequence.', { offset: start });
        emit(unit);
      } else if ((a & 0xf0) === 0xe0) {
        if (p + 1 >= end) fail('NBT_BAD_MUTF8', 'Truncated modified UTF-8 sequence.', { offset: start });
        const b = bytes[p++], c = bytes[p++];
        if ((b & 0xc0) !== 0x80 || (c & 0xc0) !== 0x80) fail('NBT_BAD_MUTF8', 'Invalid modified UTF-8 continuation.', { offset: start });
        const unit = ((a & 15) << 12) | ((b & 63) << 6) | (c & 63);
        if (unit < 2048) fail('NBT_BAD_MUTF8', 'Overlong modified UTF-8 sequence.', { offset: start });
        // Surrogates are deliberately retained as UTF-16 code units, like Java.
        emit(unit);
      } else {
        fail('NBT_BAD_MUTF8', 'Java NBT requires modified UTF-8, not four-byte UTF-8.', { offset: start });
      }
    }
    return result + String.fromCharCode.apply(null, units);
  }

  function decodeNBT(input, options) {
    const opts = options || {}, bytes = bytesOf(input);
    const maxBytes = limit(opts, 'maxBytes'), maxDepth = limit(opts, 'maxDepth');
    const maxNodes = limit(opts, 'maxNodes'), maxArrayLength = limit(opts, 'maxArrayLength');
    if (maxDepth > 256) fail('INVALID_LIMIT', 'NBT maxDepth cannot exceed the parser stack bound of 256.', { key: 'maxDepth', value: maxDepth });
    if (bytes.byteLength > maxBytes) fail('NBT_BYTE_LIMIT', 'NBT input exceeds the byte limit.', { bytes: bytes.byteLength, limit: maxBytes });
    const little = !!opts.littleEndian;
    const encoding = opts.stringEncoding || (little ? 'utf8' : 'mutf8');
    if (encoding !== 'utf8' && encoding !== 'mutf8') fail('NBT_STRING_ENCODING', 'Unsupported NBT string encoding.');
    const utf8 = encoding === 'utf8' ? new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }) : null;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let pos = 0, nodes = 0;
    function need(n) {
      if (!Number.isSafeInteger(n) || n < 0 || n > bytes.byteLength - pos) {
        fail('NBT_TRUNCATED', 'NBT payload ends before the declared value.', { offset: pos, required: n, remaining: bytes.byteLength - pos });
      }
    }
    function u8() { need(1); return view.getUint8(pos++); }
    function i32() { need(4); const n = view.getInt32(pos, little); pos += 4; return n; }
    function string() {
      need(2); const length = view.getUint16(pos, little); pos += 2; need(length);
      const start = pos; pos += length;
      if (encoding === 'mutf8') return decodeModifiedUTF8(bytes, start, length);
      try { return utf8.decode(bytes.subarray(start, start + length)); }
      catch (_) { fail('NBT_BAD_UTF8', 'Invalid UTF-8 in NBT string.', { offset: start, length }); }
    }
    function count() {
      const n = i32();
      if (n < 0) fail('NBT_NEGATIVE_LENGTH', 'Negative NBT collection length.', { offset: pos - 4, length: n });
      if (n > maxArrayLength) fail('NBT_ARRAY_LIMIT', 'NBT collection exceeds the element limit.', { length: n, limit: maxArrayLength });
      return n;
    }
    function type(id) {
      if (id < 0 || id >= TYPES.length) fail('NBT_UNKNOWN_TAG', 'Unknown NBT tag type.', { id, offset: pos - 1 });
      return TYPES[id];
    }
    function payload(id, depth) {
      if (depth > maxDepth) fail('NBT_DEPTH_LIMIT', 'NBT nesting exceeds the depth limit.', { depth, limit: maxDepth });
      if (++nodes > maxNodes) fail('NBT_NODE_LIMIT', 'NBT exceeds the tag/value count limit.', { limit: maxNodes });
      switch (id) {
        case 1: need(1); return view.getInt8(pos++);
        case 2: { need(2); const n = view.getInt16(pos, little); pos += 2; return n; }
        case 3: return i32();
        case 4: { need(8); const n = view.getBigInt64(pos, little); pos += 8; return n; }
        case 5: { need(4); const n = view.getFloat32(pos, little); pos += 4; return n; }
        case 6: { need(8); const n = view.getFloat64(pos, little); pos += 8; return n; }
        case 7: { const n = count(); need(n); const a = bytes.slice(pos, pos + n); pos += n; return a; }
        case 8: return string();
        case 9: {
          const element = u8(), elementType = type(element), n = count();
          if (element === 0 && n !== 0) fail('NBT_END_LIST', 'TAG_End is only valid as the element type of an empty list.');
          if (n > maxNodes - nodes) fail('NBT_NODE_LIMIT', 'NBT list exceeds the remaining value count limit.', { length: n, remaining: maxNodes - nodes });
          const values = new Array(n);
          for (let i = 0; i < n; i++) values[i] = payload(element, depth + 1);
          return { type: elementType, value: values };
        }
        case 10: {
          const object = Object.create(null);
          while (true) {
            const child = u8();
            if (child === 0) return object;
            const childType = type(child), name = string();
            if (own(object, name)) fail('NBT_DUPLICATE_NAME', 'Duplicate NBT compound name is ambiguous.', { name, offset: pos });
            object[name] = { type: childType, value: payload(child, depth + 1) };
          }
        }
        case 11: {
          const n = count(); need(n * 4); const a = new Int32Array(n);
          for (let i = 0; i < n; i++, pos += 4) a[i] = view.getInt32(pos, little);
          return a;
        }
        case 12: {
          const n = count(); need(n * 8); const a = new BigInt64Array(n);
          for (let i = 0; i < n; i++, pos += 8) a[i] = view.getBigInt64(pos, little);
          return a;
        }
        default: fail('NBT_INVALID_PAYLOAD_TAG', 'Invalid standalone NBT payload tag.', { id });
      }
    }
    aborted(opts.signal);
    const id = u8(), rootType = type(id);
    if (id === 0 || (opts.requireCompound !== false && id !== 10)) fail('NBT_ROOT_TYPE', 'World NBT must have a named compound root.', { type: rootType });
    const name = string(), value = payload(id, 0);
    if (opts.allowTrailing !== true && pos !== bytes.byteLength) fail('NBT_TRAILING_BYTES', 'Unexpected bytes after the NBT root.', { consumed: pos, total: bytes.byteLength });
    aborted(opts.signal);
    return { type: rootType, name, value, bytesRead: pos, nodeCount: nodes, littleEndian: little, stringEncoding: encoding };
  }

  function simplifyNBT(tag) {
    function simplify(type, value) {
      if (type === 'compound') {
        const object = Object.create(null);
        for (const key of Object.keys(value)) object[key] = simplify(value[key].type, value[key].value);
        return object;
      }
      if (type === 'list') return value.value.map(v => simplify(value.type, v));
      return value;
    }
    if (!tag || typeof tag.type !== 'string' || !own(tag, 'value')) fail('NBT_NOT_TAG', 'Expected a typed NBT root.');
    return simplify(tag.type, tag.value);
  }

  async function decompress(input, compression, options) {
    const opts = options || {}, bytes = bytesOf(input);
    const inputLimit = limit(opts, 'maxInputBytes'), outputLimit = limit(opts, 'maxOutputBytes');
    if (bytes.byteLength > inputLimit) fail('COMPRESSED_INPUT_LIMIT', 'Compressed input exceeds the byte limit.', { bytes: bytes.byteLength, limit: inputLimit });
    aborted(opts.signal);
    let format;
    if (compression === 1 || compression === 'gzip') format = 'gzip';
    else if (compression === 2 || compression === 'zlib' || compression === 'deflate') format = 'deflate';
    else if (compression === 3 || compression === 'none' || compression === 'uncompressed') {
      if (bytes.byteLength > outputLimit) fail('DECOMPRESSED_OUTPUT_LIMIT', 'Uncompressed input exceeds the byte limit.', { bytes: bytes.byteLength, limit: outputLimit });
      if (typeof opts.onOutput === 'function') opts.onOutput(bytes.byteLength);
      return bytes.slice();
    } else if (compression === 4 || compression === 'lz4') {
      fail('COMPRESSION_LZ4_UNSUPPORTED', 'Minecraft LZ4Block streams are not supported by this codec.');
    } else fail('COMPRESSION_UNSUPPORTED', 'Unsupported Minecraft compression scheme.', { compression });
    if (typeof DecompressionStream !== 'function' || typeof ReadableStream !== 'function') fail('DECOMPRESSION_UNAVAILABLE', 'This browser does not provide the required decompression streams.');
    let offset = 0, cancelled = false;
    const source = new ReadableStream({
      pull(controller) {
        if (cancelled) return;
        if (offset >= bytes.length) { controller.close(); return; }
        const end = Math.min(offset + 32768, bytes.length);
        controller.enqueue(bytes.subarray(offset, end)); offset = end;
      },
      cancel() { cancelled = true; }
    });
    let reader;
    try { reader = source.pipeThrough(new DecompressionStream(format)).getReader(); }
    catch (error) { fail('DECOMPRESSION_UNAVAILABLE', 'The required compression format is unavailable.', { format, reason: String(error.message || error) }); }
    const chunks = []; let total = 0;
    const onAbort = () => { cancelled = true; reader.cancel('Import cancelled').catch(() => {}); };
    if (opts.signal) opts.signal.addEventListener('abort', onAbort, { once: true });
    try {
      while (true) {
        aborted(opts.signal);
        const item = await reader.read();
        aborted(opts.signal);
        if (item.done) break;
        const chunk = bytesOf(item.value);
        if (chunk.byteLength > outputLimit - total) {
          cancelled = true;
          await reader.cancel('Decompressed byte limit exceeded').catch(() => {});
          fail('DECOMPRESSED_OUTPUT_LIMIT', 'Decompressed data exceeds the byte limit.', { limit: outputLimit, bytesBeforeLastChunk: total, nextChunkBytes: chunk.byteLength });
        }
        total += chunk.byteLength;
        // Count produced bytes before final checksum validation can fail. This
        // lets a multi-chunk caller enforce a cumulative work/output budget.
        if (typeof opts.onOutput === 'function') opts.onOutput(chunk.byteLength);
        chunks.push(chunk);
      }
      const result = new Uint8Array(total); let at = 0;
      for (const chunk of chunks) { result.set(chunk, at); at += chunk.length; }
      return result;
    } catch (error) {
      cancelled = true;
      await reader.cancel('Import decompression stopped').catch(() => {});
      if (error instanceof ImportError) throw error;
      fail('COMPRESSED_DATA_INVALID', 'Compressed data is invalid or incomplete.', { format, reason: String(error.message || error) });
    } finally {
      if (opts.signal) opts.signal.removeEventListener('abort', onAbort);
      reader.releaseLock();
    }
  }

  function parseRegionCoordinates(fileName) {
    const match = /(?:^|[\\/])r\.(-?\d+)\.(-?\d+)\.mca$/i.exec(String(fileName));
    if (!match) fail('REGION_FILENAME', 'Expected a region filename r.<x>.<z>.mca.');
    return { regionX: integer(Number(match[1]), 'region X', -67108864, 67108863), regionZ: integer(Number(match[2]), 'region Z', -67108864, 67108863) };
  }

  function scanRegion(input, options) {
    const opts = options || {}, bytes = bytesOf(input), maxBytes = limit(opts, 'maxRegionBytes');
    let regionX = opts.regionX, regionZ = opts.regionZ;
    if (regionX === undefined && regionZ === undefined && opts.fileName) ({ regionX, regionZ } = parseRegionCoordinates(opts.fileName));
    integer(regionX, 'region X', -67108864, 67108863); integer(regionZ, 'region Z', -67108864, 67108863);
    if (bytes.byteLength > maxBytes) fail('REGION_BYTE_LIMIT', 'Region exceeds the byte limit.', { bytes: bytes.byteLength, limit: maxBytes });
    if (bytes.byteLength < 8192) fail('REGION_HEADER_TRUNCATED', 'Anvil requires an 8192-byte header.');
    if (bytes.byteLength % 4096 !== 0) fail('REGION_UNPADDED', 'Anvil file length is not a multiple of 4096 bytes.');
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), entries = [];
    for (let slot = 0; slot < 1024; slot++) {
      const location = view.getUint32(slot * 4, false), sectorOffset = location >>> 8, sectorCount = location & 255;
      if (location === 0) continue;
      if (sectorOffset < 2 || sectorCount === 0) fail('REGION_BAD_LOCATION', 'Invalid chunk sector allocation.', { slot, sectorOffset, sectorCount });
      const byteOffset = sectorOffset * 4096, allocatedBytes = sectorCount * 4096;
      if (byteOffset + allocatedBytes > bytes.byteLength) fail('REGION_SECTOR_BOUNDS', 'Chunk sectors extend beyond the file.', { slot, sectorOffset, sectorCount });
      const length = view.getUint32(byteOffset, false);
      if (length < 1 || length > allocatedBytes - 4) fail('REGION_CHUNK_LENGTH', 'Chunk payload length exceeds its allocated sectors.', { slot, length, allocatedBytes });
      const encodedCompression = view.getUint8(byteOffset + 4), external = (encodedCompression & 128) !== 0;
      const compression = encodedCompression & 127;
      if (external && length !== 1) fail('REGION_EXTERNAL_STUB_LENGTH', 'External chunks must use a one-byte compression stub.', { slot, length });
      const localX = slot & 31, localZ = slot >>> 5, chunkX = regionX * 32 + localX, chunkZ = regionZ * 32 + localZ;
      entries.push({ slot, localX, localZ, chunkX, chunkZ, sectorOffset, sectorCount, byteOffset, length,
        compression, external, externalName: external ? 'c.' + chunkX + '.' + chunkZ + '.mcc' : null,
        timestamp: view.getUint32(4096 + slot * 4, false) });
    }
    const ordered = entries.slice().sort((a, b) => a.sectorOffset - b.sectorOffset);
    for (let i = 1; i < ordered.length; i++) {
      const before = ordered[i - 1], after = ordered[i];
      if (after.sectorOffset < before.sectorOffset + before.sectorCount) fail('REGION_SECTOR_OVERLAP', 'Two chunks share allocated sectors.', { firstSlot: before.slot, secondSlot: after.slot });
    }
    return { format: 'java-anvil', regionX, regionZ, byteLength: bytes.byteLength, entries };
  }

  function normalizeBlockState(entry) {
    let name, properties = Object.create(null), form;
    if (typeof entry === 'string') { name = entry; form = 'compact'; }
    else if (entry && typeof entry === 'object' && !Array.isArray(entry) && !ArrayBuffer.isView(entry)) {
      if (own(entry, 'Name') && own(entry, 'id')) fail('JAVA_BLOCK_STATE_AMBIGUOUS', 'A block state contains both Name and id.');
      if (own(entry, 'Name')) { name = entry.Name; form = 'classic'; }
      else if (own(entry, 'id')) { name = entry.id; form = 'modern'; }
      else if (Object.keys(entry).length === 1 && typeof entry[''] === 'string') { name = entry['']; form = 'compact-nbt-wrapper'; }
      else fail('JAVA_BLOCK_STATE_SHAPE', 'Unrecognized block-state palette entry.');
      if (own(entry, 'Properties') && own(entry, 'properties')) fail('JAVA_BLOCK_STATE_AMBIGUOUS', 'A block state contains both Properties and properties.');
      const p = own(entry, 'Properties') ? entry.Properties : entry.properties;
      if (p !== undefined) {
        if (!p || typeof p !== 'object' || Array.isArray(p) || ArrayBuffer.isView(p)) fail('JAVA_BLOCK_PROPERTIES', 'Block-state properties must be a compound.');
        for (const key of Object.keys(p).sort()) {
          if (typeof p[key] !== 'string') fail('JAVA_BLOCK_PROPERTY_TYPE', 'Java block-state property values must be strings.', { property: key });
          properties[key] = p[key];
        }
      }
    } else fail('JAVA_BLOCK_STATE_SHAPE', 'Unrecognized block-state palette entry.');
    if (typeof name !== 'string' || !/^(?:[a-z0-9_.-]+:)?[a-z0-9_./-]+$/.test(name)) fail('JAVA_BLOCK_NAME', 'Invalid block resource location.', { value: name });
    if (!name.includes(':')) name = 'minecraft:' + name;
    return { name, properties, sourceForm: form };
  }

  function decodePaletteIndices(data, paletteLength, padded, options) {
    const opts = options || {}, count = opts.count === undefined ? 4096 : integer(opts.count, 'palette index count', 1, 1048576);
    integer(paletteLength, 'palette length', 1, Math.min(4294967296, limit(opts, 'maxPaletteEntries')));
    const ArrayType = paletteLength <= 65536 ? Uint16Array : Uint32Array, indices = new ArrayType(count);
    if (paletteLength === 1 && (data === undefined || data === null)) return indices;
    if (!(data instanceof BigInt64Array) && !(data instanceof BigUint64Array) && !(Array.isArray(data) && data.every(v => typeof v === 'bigint'))) {
      fail('JAVA_BLOCK_DATA_TYPE', 'Block-state data must be a long array.');
    }
    if (paletteLength === 1 && data.length === 0) return indices;
    const bits = Math.max(4, Math.ceil(Math.log2(paletteLength))), perLong = Math.floor(64 / bits);
    const expected = padded ? Math.ceil(count / perLong) : Math.ceil(count * bits / 64);
    if (data.length !== expected) fail('JAVA_BLOCK_DATA_LENGTH', 'Packed block-state array has the wrong length.', { actual: data.length, expected, bits, padded });
    const mask = (1n << BigInt(bits)) - 1n;
    for (let i = 0; i < count; i++) {
      let word, shift, value;
      if (padded) {
        word = Math.floor(i / perLong); shift = (i % perLong) * bits;
        value = (BigInt.asUintN(64, data[word]) >> BigInt(shift)) & mask;
      } else {
        const bit = i * bits; word = Math.floor(bit / 64); shift = bit % 64;
        value = BigInt.asUintN(64, data[word]) >> BigInt(shift);
        if (shift + bits > 64) value |= BigInt.asUintN(64, data[word + 1]) << BigInt(64 - shift);
        value &= mask;
      }
      const index = Number(value);
      if (index >= paletteLength) fail('JAVA_PALETTE_INDEX_BOUNDS', 'Block-state index is outside the palette.', { index, position: i, paletteLength });
      indices[i] = index;
    }
    return indices;
  }

  function decodeJavaChunk(rootTag, options) {
    const opts = options || {}, data = simplifyNBT(rootTag);
    if (rootTag.type !== 'compound' || !data || typeof data !== 'object') fail('JAVA_CHUNK_ROOT', 'A Java chunk requires a compound root.');
    const modern = Array.isArray(data.sections), legacy = data.Level && Array.isArray(data.Level.Sections);
    if (modern && legacy) fail('JAVA_CHUNK_AMBIGUOUS', 'Both old and new chunk section layouts are present.');
    if (!modern && !legacy) fail('JAVA_CHUNK_SCHEMA', 'No supported Java chunk section layout was found.');
    const chunk = modern ? data : data.Level;
    const x = integer(chunk.xPos, 'chunk X', -2147483648, 2147483647), z = integer(chunk.zPos, 'chunk Z', -2147483648, 2147483647);
    if ((opts.expectedChunkX !== undefined && x !== opts.expectedChunkX) || (opts.expectedChunkZ !== undefined && z !== opts.expectedChunkZ)) {
      fail('JAVA_CHUNK_COORDINATE_MISMATCH', 'Chunk NBT coordinates do not match the region slot.', { actualX: x, actualZ: z, expectedX: opts.expectedChunkX, expectedZ: opts.expectedChunkZ });
    }
    const dataVersion = integer(data.DataVersion, 'chunk DataVersion', 0, 2147483647);
    const sourceSections = modern ? data.sections : chunk.Sections, sections = [], warnings = [], seen = new Set();
    const typedSectionList = modern ? rootTag.value.sections : rootTag.value.Level.value.Sections;
    if (typedSectionList.type !== 'list' || (sourceSections.length > 0 && typedSectionList.value.type !== 'compound')) fail('JAVA_SECTION_LIST_TYPE', 'Nonempty chunk sections must be an NBT list of compounds.');
    if (sourceSections.length > limit(opts, 'maxSections')) fail('JAVA_SECTION_LIMIT', 'Chunk contains too many sections.', { count: sourceSections.length });
    const padded = dataVersion >= 2529; // 20w17a changed storage to non-spanning longs.
    for (let sectionIndex = 0; sectionIndex < sourceSections.length; sectionIndex++) {
      const source = sourceSections[sectionIndex], typedSource = typedSectionList.value.value[sectionIndex];
      if (!source || typeof source !== 'object' || Array.isArray(source)) fail('JAVA_SECTION_SHAPE', 'Invalid chunk section.');
      const y = integer(source.Y, 'section Y', -2048, 2047);
      if (seen.has(y)) fail('JAVA_DUPLICATE_SECTION', 'Duplicate section Y would overwrite terrain.', { y });
      seen.add(y);
      if (own(source, 'Blocks') || own(source, 'Add')) fail('JAVA_NUMERIC_BLOCKS_UNSUPPORTED', 'Pre-flattening numeric block storage is not supported.', { y });
      let paletteSource, packed, typedPacked;
      if (modern) {
        if (source.block_states === undefined) { warnings.push({ code: 'JAVA_SECTION_NO_BLOCK_STATES', y }); continue; }
        if (!source.block_states || typeof source.block_states !== 'object') fail('JAVA_BLOCK_CONTAINER', 'Invalid block_states container.', { y });
        paletteSource = source.block_states.palette; packed = source.block_states.data;
        typedPacked = typedSource.block_states.value.data;
      } else {
        if (source.Palette === undefined && source.BlockStates === undefined) { warnings.push({ code: 'JAVA_SECTION_NO_BLOCK_STATES', y }); continue; }
        paletteSource = source.Palette; packed = source.BlockStates;
        typedPacked = typedSource.BlockStates;
      }
      if (typedPacked && typedPacked.type !== 'longArray') fail('JAVA_BLOCK_DATA_TYPE', 'Packed block-state NBT must be TAG_Long_Array.', { y, actual: typedPacked.type });
      if (!Array.isArray(paletteSource) || paletteSource.length < 1) fail('JAVA_PALETTE_MISSING', 'A terrain section requires a nonempty palette.', { y });
      if (paletteSource.length > limit(opts, 'maxPaletteEntries')) fail('JAVA_PALETTE_LIMIT', 'Palette exceeds the entry limit.', { y, count: paletteSource.length });
      const palette = paletteSource.map(normalizeBlockState);
      const indices = decodePaletteIndices(packed, palette.length, padded, opts);
      sections.push({ y, palette, indices, indexOrder: 'x-z-y', packing: padded ? 'padded64' : 'continuous64' });
    }
    sections.sort((a, b) => a.y - b.y);
    const status = chunk.Status === undefined ? chunk.status : chunk.Status;
    if (typeof status === 'string' && status !== 'full' && status !== 'minecraft:full') warnings.push({ code: 'JAVA_PARTIAL_GENERATION', status });
    // Keep omission counts even when the caller releases the bulky NBT tree.
    // These cover embedded terrain-chunk records only. Separate entities/*.mca
    // files are outside this terrain reader and are explicitly not counted.
    const typedBody = modern ? rootTag.value : rootTag.value.Level.value;
    const countLists = names => names.reduce((total, name) => {
      const tag = typedBody[name];
      return total + (tag && tag.type === 'list' && tag.value && Array.isArray(tag.value.value) ? tag.value.value.length : 0);
    }, 0);
    const metadataCounts = { embeddedEntities: countLists(['entities', 'Entities']),
      blockEntities: countLists(['block_entities', 'TileEntities']), externalEntityDataNotRead: true };
    return { format: 'java-chunk', x, z, dataVersion, schema: modern ? 'sections' : 'Level.Sections',
      sections, warnings, metadataCounts, status: typeof status === 'string' ? status : null,
      nbt: opts.retainNBT === false ? null : rootTag };
  }

  async function readRegion(input, options) {
    const opts = options || {}, bytes = bytesOf(input), header = scanRegion(bytes, opts);
    const selected = typeof opts.chunkFilter === 'function' ? header.entries.filter(opts.chunkFilter) : header.entries.slice();
    const maxChunks = limit(opts, 'maxChunks'), maxTotal = limit(opts, 'maxTotalOutputBytes');
    if (selected.length > maxChunks) fail('REGION_CHUNK_LIMIT', 'Selected chunk count exceeds the limit.', { selected: selected.length, limit: maxChunks });
    const chunks = [], errors = [], warnings = [];
    let totalOutput = 0, totalCompressed = 0;
    for (let i = 0; i < selected.length; i++) {
      aborted(opts.signal);
      const entry = selected[i];
      try {
        let compressed;
        if (entry.external) {
          const files = opts.externalFiles;
          const external = files instanceof Map ? files.get(entry.externalName) : (files && own(files, entry.externalName) ? files[entry.externalName] : undefined);
          if (external === undefined) fail('REGION_EXTERNAL_MISSING', 'The external chunk companion file is missing.', { fileName: entry.externalName });
          compressed = bytesOf(external);
        } else compressed = bytes.subarray(entry.byteOffset + 5, entry.byteOffset + 4 + entry.length);
        if (totalOutput >= maxTotal) fail('REGION_TOTAL_OUTPUT_LIMIT', 'Region decompression budget has been exhausted.', { limit: maxTotal });
        const uncompressed = await decompress(compressed, entry.compression, {
          maxInputBytes: limit(opts, 'maxCompressedChunkBytes'),
          maxOutputBytes: Math.min(limit(opts, 'maxBytes'), limit(opts, 'maxDecompressedChunkBytes'), maxTotal - totalOutput),
          onOutput: n => { totalOutput += n; },
          signal: opts.signal
        });
        totalCompressed += compressed.length;
        const nbt = decodeNBT(uncompressed, Object.assign({}, opts, {
          littleEndian: false, stringEncoding: 'mutf8', requireCompound: true, allowTrailing: false,
          maxBytes: Math.min(limit(opts, 'maxBytes'), limit(opts, 'maxDecompressedChunkBytes'))
        }));
        const decoded = decodeJavaChunk(nbt, Object.assign({}, opts, { expectedChunkX: entry.chunkX, expectedChunkZ: entry.chunkZ }));
        decoded.regionSlot = entry.slot; chunks.push(decoded);
        for (const warning of decoded.warnings) warnings.push(Object.assign({ chunkX: entry.chunkX, chunkZ: entry.chunkZ }, warning));
      } catch (error) {
        if (!(error instanceof ImportError)) throw error;
        error.details = Object.assign({ regionX: header.regionX, regionZ: header.regionZ, slot: entry.slot, chunkX: entry.chunkX, chunkZ: entry.chunkZ }, error.details);
        if (opts.strict !== false || error.code === 'IMPORT_ABORTED' || /LIMIT$/.test(error.code)) throw error;
        errors.push({ code: error.code, message: error.message, details: error.details });
      }
      if (typeof opts.onProgress === 'function') opts.onProgress({ done: i + 1, total: selected.length, chunkX: entry.chunkX, chunkZ: entry.chunkZ });
      if ((i + 1) % 4 === 0 && i + 1 < selected.length) await new Promise(resolve => setTimeout(resolve, 0));
    }
    return Object.assign({}, header, { chunks, errors, warnings, totals: {
      availableChunks: header.entries.length, selectedChunks: selected.length, decodedChunks: chunks.length,
      compressedBytes: totalCompressed, decompressedBytes: totalOutput
    } });
  }

  const api = Object.freeze({ version: '1.0.0', ImportError, DEFAULTS, TYPES, decodeNBT, simplifyNBT,
    decompress, parseRegionCoordinates, scanRegion, normalizeBlockState, decodePaletteIndices, decodeJavaChunk, readRegion });
  root.MCImportJava = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
