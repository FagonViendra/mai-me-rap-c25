/* MảiMêRáp — native WebGL2 cube instancing, without a rendering dependency.
 *
 * Integration (renderer remains owned by the root agent):
 * 1. Load this module before renderer.js and before game.js starts the renderer.
 * 2. Append V.CUBE_BATCH_GLSL.attributes to the terrain vertex declarations and
 *    replace that shader's main function with V.CUBE_BATCH_GLSL.main.
 * 3. At the end of Renderer.init(), AFTER incrementing this.generation and
 *    resetting stats, reset stats.cubeBatchBytes=0 and assign
 *      this.cubeBatch = V.createCubeBatch(this, V.blocks).
 *    A restored WebGL context needs a newly created batch, just like its other
 *    resources. Old generation objects must not be used for new draw calls.
 * 4. Replace Renderer.drawCubes(cubes) with this.cubeBatch.draw(cubes), and remove
 *    the old empty dynamic VBO/IBO allocation. Ordinary chunk uploads keep their
 *    existing 14-float format and drawElements path.
 *
 * Instance layout: 21 floats / 84 bytes. Attributes 0–5 are the existing static
 * cube vertex format; attributes 6–11 have divisor 1. No index/vertex arrays are
 * rebuilt per draw. Capacity grows by powers of two; bufferSubData's WebGL2
 * srcOffset/length overload uploads only live instances without subarray views.
 *
 * Compatibility: Face-layer order, light/emission defaults, axis-based face
 * shading and default material kind preserve the dynamic-cube renderer. UVs
 * match terrain faces, with texture V increasing along Y on every vertical side.
 * Position is scaled, then rotated about Y, then translated. cube.kind is an
 * optional explicit override; kind 0 maps leaf blocks to 6 for the leaf shader.
 * Other explicit kinds, including solid color -1, remain unchanged.
 * cube.uvScale defaults to 0 (one complete tile per face). A positive value is
 * texture repeats per model/world unit; with 16px tiles, scale 1 gives a texel
 * pitch of 1/16 on every face regardless of a part's dimensions. Optional
 * cube.tiles supplies six visual layer indices without creating gameplay IDs.
 * Batch bytes are reported separately from terrain gpuBytes, so existing terrain
 * residency/leak comparisons retain their meaning.
 */
(() => {
  'use strict';
  const V = globalThis.Voxel ||= {};
  const FLOATS = 21, BYTES = FLOATS * 4, VERTEX_FLOATS = 14;
  const INSTANCE_ATTRIBUTES = Object.freeze([
    Object.freeze({ location: 6, size: 3, offset: 0 }),
    Object.freeze({ location: 7, size: 3, offset: 3 }),
    Object.freeze({ location: 8, size: 4, offset: 6 }),
    Object.freeze({ location: 9, size: 3, offset: 10 }),
    Object.freeze({ location: 10, size: 4, offset: 13 }),
    Object.freeze({ location: 11, size: 4, offset: 17 })
  ]);
  V.CUBE_BATCH_FORMAT = Object.freeze({ floatsPerInstance: FLOATS, bytesPerInstance: BYTES,
    vertexFloats: VERTEX_FLOATS, vertices: 24, indices: 36, instanceAttributes: INSTANCE_ATTRIBUTES });
  V.CUBE_BATCH_GLSL = Object.freeze({
    attributes: `
layout(location=6) in vec3 iPos;
layout(location=7) in vec3 iSize;
layout(location=8) in vec4 iRotationLight;
layout(location=9) in vec3 iTint;
layout(location=10) in vec4 iTilesA;
layout(location=11) in vec4 iTilesBKind;
uniform bool uInstanced;
`,
    main: `
void main(){
  int face=clamp(int(aInfo.x+.5),0,5);
  vUV=aUV;
  vNormal=norms[face];
  if(uInstanced){
    vec2 uvExtent=face<2?iSize.zy:face<4?iSize.xz:iSize.xy;
    vUV=aUV*(iTilesBKind.w>0.?uvExtent*iTilesBKind.w:vec2(1.));
    vec3 p=aPosition*iSize;
    float c=iRotationLight.x,s=iRotationLight.y;
    p=vec3(p.x*c-p.z*s,p.y,p.x*s+p.z*c);
    vWorld=p+iPos+uOffset;
    vLayer=face<4?iTilesA[face]:iTilesBKind[face-4];
    vLightAO=vec2(iRotationLight.z,aLightAO.y);
    vEmission=iRotationLight.w;
    vKind=iTilesBKind.z;
    vTint=iTint;
  }else{
    vWorld=aPosition+uOffset;
    vLayer=aLayer;
    vLightAO=aLightAO;
    vEmission=aInfo.y;
    vKind=aInfo.z;
    vTint=aTint;
  }
  gl_Position=uVP*vec4(vWorld,1.);
}
`
  });

  function makeUnitGeometry() {
    const vertices = new Float32Array(24 * VERTEX_FLOATS), indices = new Uint16Array(36);
    const corners = [[0,0],[1,0],[1,1],[0,1]];
    let vertex = 0, index = 0;
    for (let axis = 0; axis < 3; axis++) for (const sign of [1,-1]) {
      const u = (axis+1)%3, v = (axis+2)%3, face = axis*2+(sign<0?1:0), base = vertex;
      for (const [du,dv] of corners) {
        const p = [0,0,0]; p[axis]=sign*.5; p[u]=du-.5; p[v]=dv-.5;
        const at = vertex++ * VERTEX_FLOATS;
        // Cyclic geometric axes are (Y,Z), (Z,X), (X,Y). Texture axes are
        // (Z,Y), (X,Z), (X,Y), matching the mesher and bottom-left upload.
        const texU=axis===2?du:dv,texV=axis===2?dv:du;
        vertices.set([p[0],p[1],p[2],texU,texV,0,1,1,face,0,0,1,1,1],at);
      }
      const local = sign>0 ? [0,1,2,0,2,3] : [0,2,1,0,3,2];
      for (const n of local) indices[index++]=base+n;
    }
    return { vertices, indices };
  }
  const UNIT = makeUnitGeometry();

  function packCubeInstances(cubes, blocks, target, renderOrigin = [0,0,0]) {
    if (!renderOrigin || renderOrigin.length!==3 || !Array.from(renderOrigin).every(Number.isFinite))
      throw new TypeError("Finite three-component renderOrigin required.");
    if (!(target instanceof Float32Array) || target.length < cubes.length * FLOATS)
      throw new RangeError('Cube instance buffer is smaller than the submitted batch.');
    const fallback = blocks[20];
    let offset = 0;
    for (let i = 0; i < cubes.length; i++) {
      const cube = cubes[i], p = cube?.p, size = cube?.s;
      if (cube?.rigid || cube?.rotationQuaternion!==undefined || (cube?.pitch??0)!==0 || (cube?.roll??0)!==0)
        throw new TypeError("Full-rotation cube belongs to RigidCubeBatch.");
      if (!p || !size || p.length < 3 || size.length < 3)
        throw new TypeError('Cube '+i+' needs a three-component position and size.');
      const def = blocks[cube.id] || fallback;
      const tiles = cube.tiles ?? def?.tiles;
      if (!tiles || tiles.length !== 6)
        throw new TypeError('Cube '+i+' has no complete six-face material.');
      if (cube.tiles !== undefined) for(let face=0;face<6;face++)
        if(!Number.isInteger(tiles[face])||tiles[face]<0)
          throw new TypeError('Cube '+i+' needs six nonnegative integer texture layers.');
      const yaw = cube.yaw || 0, light = cube.light ?? 1, emission = cube.emissive ?? 0;
      const tint = cube.tint, requestedKind = cube.kind ?? 0;
      const kind = requestedKind===0 && def?.leaf===true ? 6 : requestedKind;
      const uvScale=cube.uvScale ?? 0;
      if (!Number.isFinite(uvScale)||uvScale<0)
        throw new TypeError('Cube '+i+' needs a finite nonnegative UV scale.');
      target[offset] = p[0]-renderOrigin[0]; target[offset+1] = p[1]-renderOrigin[1]; target[offset+2] = p[2]-renderOrigin[2];
      target[offset+3] = size[0]; target[offset+4] = size[1]; target[offset+5] = size[2];
      target[offset+6] = Math.cos(yaw); target[offset+7] = Math.sin(yaw);
      target[offset+8] = light; target[offset+9] = emission;
      target[offset+10] = tint ? tint[0] : 1;
      target[offset+11] = tint ? tint[1] : 1;
      target[offset+12] = tint ? tint[2] : 1;
      target[offset+13] = tiles[0]; target[offset+14] = tiles[1];
      target[offset+15] = tiles[2]; target[offset+16] = tiles[3];
      target[offset+17] = tiles[4]; target[offset+18] = tiles[5];
      target[offset+19] = kind;
      target[offset+20] = uvScale;
      // Check the packed Float32 values, also catching overflow during conversion.
      for (let k = 0; k < FLOATS; k++) if (!Number.isFinite(target[offset+k]))
        throw new TypeError('Cube '+i+' contains a non-finite instance value.');
      offset += FLOATS;
    }
    return cubes.length;
  }
  V.packCubeInstances = packCubeInstances;

  class CubeBatch {
    constructor(renderer, blocks = V.blocks, options = {}) {
      const gl = renderer.gl;
      if (!gl || typeof gl.drawElementsInstanced !== 'function')
        throw new TypeError('Cube batching requires the renderer WebGL2 context.');
      const initial = options.initialCapacity ?? 128;
      if (!Number.isSafeInteger(initial) || initial < 0)
        throw new RangeError('Initial cube capacity must be a nonnegative integer.');
      this.renderer=renderer; this.gl=gl; this.blocks=blocks; this.generation=renderer.generation;
      this.instancedUniform=renderer.terrain.u.uInstanced;
      this.offsetUniform=renderer.terrain.u.uOffset;
      if (this.instancedUniform == null)
        throw new Error('The terrain vertex shader must declare and use uInstanced.');
      this.capacity=0; this.data=new Float32Array(0); this.gpuBytes=0; this.disposed=false;
      this.lastInstances=0; this.lastUploadBytes=0; this.totalUploadBytes=0; this.drawCalls=0; this.growths=0;
      this.vao=gl.createVertexArray(); this.vertexBuffer=gl.createBuffer();
      this.indexBuffer=gl.createBuffer(); this.instanceBuffer=gl.createBuffer();
      if (!this.vao || !this.vertexBuffer || !this.indexBuffer || !this.instanceBuffer) {
        this.destroy();
        throw new Error('Unable to allocate instanced cube resources.');
      }
      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,UNIT.vertices,gl.STATIC_DRAW);
      let offset=0;
      for (const [location,size] of [[0,3],[1,2],[2,1],[3,2],[4,3],[5,3]]) {
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location,size,gl.FLOAT,false,VERTEX_FLOATS*4,offset*4);
        gl.vertexAttribDivisor(location,0);
        offset+=size;
      }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,UNIT.indices,gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER,this.instanceBuffer);
      for (const a of INSTANCE_ATTRIBUTES) {
        gl.enableVertexAttribArray(a.location);
        gl.vertexAttribPointer(a.location,a.size,gl.FLOAT,false,BYTES,a.offset*4);
        gl.vertexAttribDivisor(a.location,1);
      }
      this.accountBytes(UNIT.vertices.byteLength+UNIT.indices.byteLength);
      this.ensureCapacity(initial);
      gl.bindVertexArray(null);
    }
    accountBytes(delta) {
      this.gpuBytes+=delta;
      const stats=this.renderer.stats;
      stats.cubeBatchBytes=Math.max(0,(stats.cubeBatchBytes||0)+delta);
    }
    ensureCapacity(count) {
      if (count<=this.capacity) return;
      let capacity=Math.max(1,this.capacity);
      while(capacity<count) capacity*=2;
      const next=new Float32Array(capacity*FLOATS);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.instanceBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER,next.byteLength,this.gl.DYNAMIC_DRAW);
      this.accountBytes((capacity-this.capacity)*BYTES);
      this.data=next; this.capacity=capacity; this.growths++;
    }
    draw(cubes, renderOrigin = [0,0,0]) {
      if (this.disposed) throw new Error('An instanced cube batch was used after disposal.');
      const gl=this.gl,renderer=this.renderer;
      this.lastInstances=0; this.lastUploadBytes=0;
      if (gl.isContextLost()) return 0;
      if (this.generation!==renderer.generation)
        throw new Error('Recreate the cube batch after WebGL context restoration.');
      gl.useProgram(renderer.terrain.p);
      gl.uniform1i(this.instancedUniform,0);
      if (!cubes.length) return 0;
      try {
        this.ensureCapacity(cubes.length);
        const count=packCubeInstances(cubes,this.blocks,this.data,renderOrigin);
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER,this.instanceBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.data,0,count*FLOATS);
        gl.uniform3f(this.offsetUniform,0,0,0);
        gl.uniform1i(this.instancedUniform,1);
        gl.drawElementsInstanced(gl.TRIANGLES,36,gl.UNSIGNED_SHORT,0,count);
        renderer.stats.draws++;
        renderer.stats.triangles+=count*12;
        this.lastInstances=count; this.lastUploadBytes=count*BYTES;
        this.totalUploadBytes+=this.lastUploadBytes; this.drawCalls++;
        return count;
      } finally {
        gl.uniform1i(this.instancedUniform,0);
        gl.bindVertexArray(null);
      }
    }
    inspect() {
      return { generation:this.generation,capacity:this.capacity,gpuBytes:this.gpuBytes,
        bytesPerInstance:BYTES,lastInstances:this.lastInstances,lastUploadBytes:this.lastUploadBytes,
        totalUploadBytes:this.totalUploadBytes,drawCalls:this.drawCalls,growths:this.growths,disposed:this.disposed };
    }
    destroy() {
      if (this.disposed) return;
      const current=this.generation===this.renderer.generation;
      // Old restored-context resources have already been destroyed by WebGL.
      if (current && !this.gl.isContextLost()) {
        if (this.vao) this.gl.deleteVertexArray(this.vao);
        for (const buffer of [this.vertexBuffer,this.indexBuffer,this.instanceBuffer])
          if (buffer) this.gl.deleteBuffer(buffer);
      }
      if (current) this.renderer.stats.cubeBatchBytes=Math.max(0,(this.renderer.stats.cubeBatchBytes||0)-this.gpuBytes);
      this.disposed=true; this.vao=this.vertexBuffer=this.indexBuffer=this.instanceBuffer=null;
      this.data=new Float32Array(0); this.capacity=0; this.gpuBytes=0;
    }
  }
  V.CubeBatch=CubeBatch;
  V.createCubeBatch=(renderer,blocks,options)=>new CubeBatch(renderer,blocks,options);
})();
