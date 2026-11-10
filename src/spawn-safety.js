/* MảiMêRáp — bounded respawn placement; never edits terrain. */
(() => {
  'use strict';
  const V = globalThis.Voxel ||= {};
  const HEIGHT = 1.8, WIDTH = .6, EDGE = 1e-5, FOOT_GAP = .12, OFFSET = .02;
  const RADIUS = 8, CHUNK_SIZE = 16, MAX_CHUNKS = 9;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const finite = Number.isFinite;
  const solid = id => !!V.blocks?.[id]?.solid;
  const support = id => solid(id) && id !== 30;

  function footprint(x, z, width = WIDTH) {
    return [Math.floor(x - width / 2 + EDGE), Math.floor(x + width / 2 - EDGE),
      Math.floor(z - width / 2 + EDGE), Math.floor(z + width / 2 - EDGE)];
  }

  // Keep the existing conservative rule: every cell beneath the footprint must
  // offer support. An authored cell only supports where a real box top overlaps
  // the feet; its empty centre and the space above a low part are not a floor.
  function supported(world, x, y, z, width = WIDTH, gap = FOOT_GAP) {
    if (!world || typeof world.get !== 'function' || ![x, y, z, width, gap].every(finite)
      || width <= 0 || width > 4 || gap < 0 || gap > .25 || y <= 0) return false;
    const [minX, maxX, minZ, maxZ] = footprint(x, z, width), r = width / 2;
    for (let bz = minZ; bz <= maxZ; bz++) for (let bx = minX; bx <= maxX; bx++) {
      let found = false;
      for (let by = Math.max(0, Math.floor(y - gap - EDGE)); by <= Math.floor(y + EDGE) && !found; by++) {
        const id = world.get(bx, by, bz, true);
        if (!support(id)) continue;
        for (const box of V.blockGeometry.boxesFor(id)) {
          const top = by + box[4], distance = y - top;
          if (distance >= -EDGE && distance <= gap + EDGE
            && x - r < bx + box[3] - EDGE && x + r > bx + box[0] + EDGE
            && z - r < bz + box[5] - EDGE && z + r > bz + box[2] + EDGE) {
            found = true;
            break;
          }
        }
      }
      if (!found) return false;
    }
    return true;
  }
  V.respawnSupport = Object.freeze({supported});

  V.findSafeRespawn = function findSafeRespawn(world, anchor) {
    if (!world || typeof world.get !== 'function' || typeof world.collides !== 'function') {
      throw new TypeError('A world with block sampling and collision checks is required.');
    }
    const worldHeight = Number.isInteger(V.core?.HEIGHT) && V.core.HEIGHT > 2 ? V.core.HEIGHT : 96;
    const COORD_LIMIT=V.coordinates.forWorld(world).respawnLimit;
    const raw = Array.isArray(anchor) ? anchor : [];
    const original = [raw[0], raw[1], raw[2]];
    const x0 = clamp(finite(raw[0]) ? raw[0] : 8.5, -COORD_LIMIT, COORD_LIMIT);
    const y0 = clamp(finite(raw[1]) ? raw[1] : 32, 0, 512);
    const z0 = clamp(finite(raw[2]) ? raw[2] : 8.5, -COORD_LIMIT, COORD_LIMIT);
    const checked = new Set(), chunks = new Map();
    const columnKey = (x, z) => Math.floor(x) + ',' + Math.floor(z);
    const result = (position, reason) => ({
      position,
      moved: position.some((n, i) => !finite(original[i]) || Math.abs(n - original[i]) > 1e-7),
      reason,
      checkedColumns: checked.size
    });

    function ensureFootprint(x, z) {
      const [minX, maxX, minZ, maxZ] = footprint(x, z);
      for (let cz = Math.floor(minZ / CHUNK_SIZE); cz <= Math.floor(maxZ / CHUNK_SIZE); cz++) {
        for (let cx = Math.floor(minX / CHUNK_SIZE); cx <= Math.floor(maxX / CHUNK_SIZE); cx++) {
          const key = cx + ',' + cz;
          if (!chunks.has(key)) {
            if (chunks.size >= MAX_CHUNKS) return false;
            let ready = true;
            try {
              let chunk = world.chunks?.get?.(key);
              if (!chunk?.data && typeof world.ensure === 'function') chunk = world.ensure(cx, cz, true);
              // Analytic worlds need not expose a chunk map. Production worlds must own data.
              if (world.chunks && !(world.chunks.get?.(key)?.data || chunk?.data)) ready = false;
            } catch { ready = false; }
            chunks.set(key, ready);
          }
          if (!chunks.get(key)) return false;
        }
      }
      return true;
    }

    function clearAndDry(x, y, z) {
      if (world.collides(x, y, z, HEIGHT, WIDTH)) return false;
      const [minX, maxX, minZ, maxZ] = footprint(x, z);
      for (let by = Math.floor(y + EDGE); by <= Math.floor(y + HEIGHT - EDGE); by++) {
        for (let bz = minZ; bz <= maxZ; bz++) for (let bx = minX; bx <= maxX; bx++) {
          const id = world.get(bx, by, bz, true);
          if (id === 7 || V.blocks[id]?.hazard === 'lava') return false;
        }
      }
      return true;
    }

    // Preserve the actual original position, including a safe room beneath a higher roof.
    checked.add(columnKey(x0, z0));
    if (ensureFootprint(x0, z0) && supported(world, x0, y0, z0) && clearAndDry(x0, y0, z0)) {
      const unchanged = original.every((n, i) => finite(n) && n === [x0, y0, z0][i]);
      return result([x0, y0, z0], unchanged ? 'anchor-clear' : 'anchor-clamped');
    }

    function floorInColumn(x, z) {
      checked.add(columnKey(x, z));
      if (!ensureFootprint(x, z)) return null;
      const possible = new Set(), [minX, maxX, minZ, maxZ] = footprint(x, z), r = WIDTH / 2;
      // Ordinary destinations keep the whole body inside the voxel height. A completely
      // enclosed column is handled separately by the explicit above-column fallback.
      const highestFoot = worldHeight - HEIGHT - OFFSET;
      for (let by = 0; by <= Math.floor(highestFoot); by++) {
        for (let bz = minZ; bz <= maxZ; bz++) for (let bx = minX; bx <= maxX; bx++) {
          const id = world.get(bx, by, bz, true);
          if (!support(id)) continue;
          for (const box of V.blockGeometry.boxesFor(id)) {
            const top = by + box[4];
            if (top <= highestFoot && x - r < bx + box[3] - EDGE && x + r > bx + box[0] + EDGE
              && z - r < bz + box[5] - EDGE && z + r > bz + box[2] + EDGE) possible.add(top + OFFSET);
          }
        }
      }
      const ordered = [...possible].sort((a, b) => Math.abs(a - y0) - Math.abs(b - y0) || a - b);
      for (const y of ordered) if (supported(world, x, y, z) && clearAndDry(x, y, z)) return [x, y, z];
      return null;
    }

    // First repair only height in the original column. Leaves are valid support here.
    const sameColumn = floorInColumn(x0, z0);
    if (sameColumn) return result(sameColumn, 'same-column-dry-ground');

    const candidates = [], bx0 = Math.floor(x0), bz0 = Math.floor(z0);
    for (let dz = -RADIUS; dz <= RADIUS; dz++) for (let dx = -RADIUS; dx <= RADIUS; dx++) {
      const x = bx0 + dx + .5, z = bz0 + dz + .5;
      if (Math.abs(x) > COORD_LIMIT || Math.abs(z) > COORD_LIMIT) continue;
      const distance = (x - x0) ** 2 + (z - z0) ** 2;
      if (distance > RADIUS * RADIUS + EDGE) continue;
      if (Math.abs(x - x0) < EDGE && Math.abs(z - z0) < EDGE) continue;
      candidates.push({x, z, distance});
    }
    candidates.sort((a, b) => a.distance - b.distance || a.z - b.z || a.x - b.x);
    for (const candidate of candidates) {
      const position = floorInColumn(candidate.x, candidate.z);
      if (position) return result(position, 'nearby-dry-ground');
    }

    // A flooded/enclosed area has no guaranteed safe floor. Return clear air above every
    // occupied cell in the anchor footprint, explicitly labelled for the caller to explain.
    // This never creates a platform and does not pretend that an unsupported fallback is ground.
    const ready = ensureFootprint(x0, z0);
    let highest = -1;
    if (ready) {
      const [minX, maxX, minZ, maxZ] = footprint(x0, z0);
      for (let bz = minZ; bz <= maxZ; bz++) for (let bx = minX; bx <= maxX; bx++) {
        for (let by = worldHeight - 1; by >= 0; by--) {
          if (world.get(bx, by, bz, true) !== 0) { highest = Math.max(highest, by); break; }
        }
      }
    }
    const y = ready ? Math.max(1, highest + 1 + .05) : worldHeight + .05;
    return result([x0, y, z0], ready ? 'fallback-above-local-column' : 'fallback-terrain-unavailable');
  };
  // At most two ordinary bounded searches: edited local ground, then the generated landing.
  // A closed cavern must not fall back onto the outside of its bedrock roof.
  V.findInfernoSafeRespawn = function findInfernoSafeRespawn(world, preferred) {
    if (!world || world.dimension !== 'inferno') return null;
    const landing=V.realmInfo?.inferno?.arrival || [8.5,35.01,8.5];
    const valid=r=>r&&Array.isArray(r.position)&&r.position.every(Number.isFinite)
      &&r.position[1]>0&&r.position[1]<94&&!String(r.reason).startsWith('fallback-');
    const local=V.findSafeRespawn(world,preferred);
    if(valid(local))return {...local,realm:'inferno',usedGeneratedArrival:false};
    const atLanding=Array.isArray(preferred)&&preferred.length===3&&preferred.every((n,i)=>n===landing[i]);
    if(atLanding)return null;
    const fallback=V.findSafeRespawn(world,landing);
    return valid(fallback)?{...fallback,realm:'inferno',usedGeneratedArrival:true,checkedColumns:local.checkedColumns+fallback.checkedColumns}:null;
  };
  // A floating island needs real support; never accept the clear-air fallback over void.
  V.findSkySafeRespawn = function findSkySafeRespawn(world, preferred) {
    if (!world || world.dimension !== 'sky') return null;
    const landing=V.realmInfo?.sky?.arrival || [8.5,57.01,8.5];
    const valid=r=>r&&Array.isArray(r.position)&&r.position.every(Number.isFinite)
      &&r.position[1]>0&&r.position[1]<94&&!String(r.reason).startsWith('fallback-');
    const local=V.findSafeRespawn(world,preferred);
    if(valid(local))return {...local,realm:'sky',usedGeneratedArrival:false};
    const atLanding=Array.isArray(preferred)&&preferred.length===3&&preferred.every((n,i)=>n===landing[i]);
    if(atLanding)return null;
    const fallback=V.findSafeRespawn(world,landing);
    return valid(fallback)?{...fallback,realm:'sky',usedGeneratedArrival:true,checkedColumns:local.checkedColumns+fallback.checkedColumns}:null;
  };
})();
