/* Full rotation for the original player and creature rigs; plain cubes keep their21-float path. */
(() => {
 'use strict';const V=globalThis.Voxel ||= {},FLOATS=23,BYTES=92,MAX=2048;
 const finite=Number.isFinite;
 function origin3(o){if(!o||o.length!==3||!Array.from(o).every(finite))throw TypeError('Finite three-component renderOrigin required');return o;}
 function normalize(q){if(!q||q.length!==4||!Array.from(q).every(finite))throw TypeError('Finite quaternion required');const n=Math.hypot(...q);if(n<1e-12)throw RangeError('Zero quaternion');return Array.from(q,x=>x/n);}
 function multiply(a,b){return[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];}
 function rotate(q,p){const x=q[0],y=q[1],z=q[2],w=q[3],tx=2*(y*p[2]-z*p[1]),ty=2*(z*p[0]-x*p[2]),tz=2*(x*p[1]-y*p[0]);return[p[0]+w*tx+y*tz-z*ty,p[1]+w*ty+z*tx-x*tz,p[2]+w*tz+x*ty-y*tx];}
 function euler(yaw=0,pitch=0,roll=0){if(![yaw,pitch,roll].every(finite))throw TypeError('Finite yaw/pitch/roll required');return normalize(multiply(multiply([0,-Math.sin(yaw/2),0,Math.cos(yaw/2)],[0,0,Math.sin(roll/2),Math.cos(roll/2)]),[Math.sin(pitch/2),0,0,Math.cos(pitch/2)]));}
 function rotation(c){if(c.rotationQuaternion!==undefined){if(c.yaw!==undefined||c.pitch!==undefined||c.roll!==undefined)throw TypeError('Quaternion and Euler rotation must not be mixed');return normalize(c.rotationQuaternion);}return euler(c.yaw??0,c.pitch??0,c.roll??0);}
 const attrs=Object.freeze([{location:6,size:3,offset:0},{location:7,size:3,offset:3},{location:8,size:4,offset:6},{location:9,size:2,offset:10},{location:10,size:3,offset:12},{location:11,size:4,offset:15},{location:12,size:4,offset:19}].map(Object.freeze));
 const vertex=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;layout(location=1) in vec2 aUV;layout(location=2) in float aLayer;layout(location=3) in vec2 aLightAO;layout(location=4) in vec3 aInfo;layout(location=5) in vec3 aTint;
layout(location=6) in vec3 iPos;layout(location=7) in vec3 iSize;layout(location=8) in vec4 iRotation;layout(location=9) in vec2 iLightEmission;layout(location=10) in vec3 iTint;layout(location=11) in vec4 iTilesA;layout(location=12) in vec4 iTilesBKind;
uniform mat4 uVP;
out vec3 vWorld;out vec2 vUV;out vec2 vLightAO;out vec3 vTint;flat out float vLayer;flat out float vKind;flat out float vEmission;flat out vec3 vNormal;
const vec3 norms[6]=vec3[6](vec3(1,0,0),vec3(-1,0,0),vec3(0,1,0),vec3(0,-1,0),vec3(0,0,1),vec3(0,0,-1));
vec3 rotateQ(vec4 q,vec3 p){return p+2.*cross(q.xyz,cross(q.xyz,p)+q.w*p);}
void main(){int face=clamp(int(aInfo.x+.5),0,5);vec2 extent=face<2?iSize.zy:face<4?iSize.xz:iSize.xy;vUV=aUV*(iTilesBKind.w>0.?extent*iTilesBKind.w:vec2(1.));vWorld=rotateQ(iRotation,aPosition*iSize)+iPos;vNormal=rotateQ(iRotation,norms[face]);vLayer=face<4?iTilesA[face]:iTilesBKind[face-4];vKind=iTilesBKind.z;vEmission=iLightEmission.y;vLightAO=vec2(iLightEmission.x,aLightAO.y);vTint=iTint;gl_Position=uVP*vec4(vWorld,1.);}`;
 function unitGeometry(){const vertices=new Float32Array(24*14),indices=new Uint16Array(36);let vi=0,ii=0;for(let axis=0;axis<3;axis++)for(const sign of[1,-1]){const u=(axis+1)%3,v=(axis+2)%3,face=axis*2+(sign<0?1:0),base=vi;for(const[du,dv]of[[0,0],[1,0],[1,1],[0,1]]){const p=[0,0,0];p[axis]=sign*.5;p[u]=du-.5;p[v]=dv-.5;vertices.set([...p,axis===2?du:dv,axis===2?dv:du,0,1,1,face,0,0,1,1,1],vi++*14);}for(const n of sign>0?[0,1,2,0,2,3]:[0,2,1,0,3,2])indices[ii++]=base+n;}return{vertices,indices};}
 const UNIT=unitGeometry();
 function pack(cubes,blocks,target,renderOrigin=[0,0,0]){
  if(!renderOrigin||renderOrigin.length!==3||!finite(renderOrigin[0])||!finite(renderOrigin[1])||!finite(renderOrigin[2]))throw TypeError('Finite three-component renderOrigin required');
  if(cubes.length>MAX)throw RangeError('Rigid cube batch exceeds2048 instances');if(!(target instanceof Float32Array)||target.length<cubes.length*FLOATS)throw RangeError('Rigid target capacity');let at=0;
  for(const c of cubes){
   if(!c?.p||!c.s||c.p.length<3||c.s.length<3)throw TypeError('Rigid cube finite center and positive size required');
   for(let k=0;k<c.p.length;k++)if(!finite(c.p[k]))throw TypeError('Rigid cube finite center and positive size required');
   for(let k=0;k<c.s.length;k++)if(!finite(c.s[k])||c.s[k]<=0)throw TypeError('Rigid cube finite center and positive size required');
   const b=blocks[c.id]||blocks[20],tiles=c.tiles??b?.tiles;if(!tiles||tiles.length!==6)throw TypeError('Rigid cube six material layers required');
   for(let k=0;k<6;k++)if(!Number.isInteger(tiles[k])||tiles[k]<0)throw TypeError('Rigid cube six material layers required');
   let qx,qy,qz,qw;
   if(c.rotationQuaternion!==undefined){
    if(c.yaw!==undefined||c.pitch!==undefined||c.roll!==undefined)throw TypeError('Quaternion and Euler rotation must not be mixed');
    const q=c.rotationQuaternion;if(!q||q.length!==4||!finite(q[0])||!finite(q[1])||!finite(q[2])||!finite(q[3]))throw TypeError('Finite quaternion required');
    qx=q[0];qy=q[1];qz=q[2];qw=q[3];
   }else{
    const yaw=c.yaw??0,pitch=c.pitch??0,roll=c.roll??0;if(!finite(yaw)||!finite(pitch)||!finite(roll))throw TypeError('Finite yaw/pitch/roll required');
    const aY=-Math.sin(yaw/2),aW=Math.cos(yaw/2),bZ=Math.sin(roll/2),bW=Math.cos(roll/2),x=Math.sin(pitch/2),w=Math.cos(pitch/2);
    // Same multiplication order as fromEuler; scalar writes avoid per-cube temporaries.
    const ax=aW*0+0*bW+aY*bZ-0*0,ay=aW*0-0*bZ+aY*bW+0*0,az=aW*bZ+0*0-aY*0+0*bW,aw=aW*bW-0*0-aY*0-0*bZ;
    qx=aw*x+ax*w+ay*0-az*0;qy=aw*0-ax*0+ay*w+az*x;qz=aw*0+ax*0-ay*x+az*w;qw=aw*w-ax*x-ay*0-az*0;
   }
   const norm=Math.hypot(qx,qy,qz,qw);if(norm<1e-12)throw RangeError('Zero quaternion');qx/=norm;qy/=norm;qz/=norm;qw/=norm;
   const t=c.tint,kind=c.kind??0,uv=c.uvScale??0;if(t&&(t.length!==3||!finite(t[0])||!finite(t[1])||!finite(t[2]))||!finite(uv)||uv<0)throw TypeError('Rigid tint/UV invalid');
   // Logical Number subtraction precedes every Float32 position write.
   target[at]=c.p[0]-renderOrigin[0];target[at+1]=c.p[1]-renderOrigin[1];target[at+2]=c.p[2]-renderOrigin[2];
   target[at+3]=c.s[0];target[at+4]=c.s[1];target[at+5]=c.s[2];target[at+6]=qx;target[at+7]=qy;target[at+8]=qz;target[at+9]=qw;
   target[at+10]=c.light??1;target[at+11]=c.emissive??0;target[at+12]=t?t[0]:1;target[at+13]=t?t[1]:1;target[at+14]=t?t[2]:1;
   for(let k=0;k<6;k++)target[at+15+k]=tiles[k];target[at+21]=kind===0&&b?.leaf===true?6:kind;target[at+22]=uv;
   for(let k=0;k<FLOATS;k++)if(!finite(target[at+k]))throw TypeError('Rigid packed value is non-finite');at+=FLOATS;
  }return cubes.length;
 }

 class RigidCubeBatch{
  constructor(renderer,fragmentSource,options={}){
   const g=renderer.gl,initial=options.initialCapacity??128;if(!g||typeof g.drawElementsInstanced!=='function'||typeof fragmentSource!=='string')throw TypeError('WebGL2 and terrain fragment source required');if(!Number.isInteger(initial)||initial<0||initial>MAX)throw RangeError('Rigid initial capacity');if(g.getParameter(g.MAX_VERTEX_ATTRIBS)<13)throw Error('Rigid cubes need13 vertex attribute locations');
   this.renderer=renderer;this.gl=g;this.generation=renderer.generation;this.capacity=0;this.data=new Float32Array(0);this.bytes=0;this.disposed=false;this.draws=0;this.uploads=0;this.lastInstances=0;this.lastUploadBytes=0;this.growths=0;this.program=null;this.vao=this.vertexBuffer=this.indexBuffer=this.instanceBuffer=null;
   const old={program:g.getParameter(g.CURRENT_PROGRAM),vao:g.getParameter(g.VERTEX_ARRAY_BINDING),array:g.getParameter(g.ARRAY_BUFFER_BINDING)};
   try{this.program=renderer.program(vertex,fragmentSource);this.vao=g.createVertexArray();this.vertexBuffer=g.createBuffer();this.indexBuffer=g.createBuffer();this.instanceBuffer=g.createBuffer();if(!this.vao||!this.vertexBuffer||!this.indexBuffer||!this.instanceBuffer)throw Error('Rigid cube allocation failed');g.bindVertexArray(this.vao);g.bindBuffer(g.ARRAY_BUFFER,this.vertexBuffer);g.bufferData(g.ARRAY_BUFFER,UNIT.vertices,g.STATIC_DRAW);let offset=0;for(const[i,n]of[[0,3],[1,2],[2,1],[3,2],[4,3],[5,3]]){g.enableVertexAttribArray(i);g.vertexAttribPointer(i,n,g.FLOAT,false,56,offset*4);g.vertexAttribDivisor(i,0);offset+=n;}g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,this.indexBuffer);g.bufferData(g.ELEMENT_ARRAY_BUFFER,UNIT.indices,g.STATIC_DRAW);g.bindBuffer(g.ARRAY_BUFFER,this.instanceBuffer);for(const a of attrs){g.enableVertexAttribArray(a.location);g.vertexAttribPointer(a.location,a.size,g.FLOAT,false,BYTES,a.offset*4);g.vertexAttribDivisor(a.location,1);}this.account(UNIT.vertices.byteLength+UNIT.indices.byteLength);this.ensureCapacity(initial);}catch(e){this.destroy();throw e;}finally{g.useProgram(old.program);g.bindVertexArray(old.vao);g.bindBuffer(g.ARRAY_BUFFER,old.array);}
  }
  account(n){this.bytes+=n;const s=this.renderer.stats;s.avatarBatchBytes=Math.max(0,(s.avatarBatchBytes||0)+n);}
  ensureCapacity(n){if(n>MAX)throw RangeError('Rigid cube batch exceeds2048');if(n<=this.capacity)return;let cap=Math.max(1,this.capacity);while(cap<n)cap*=2;const next=new Float32Array(cap*FLOATS);this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.instanceBuffer);this.gl.bufferData(this.gl.ARRAY_BUFFER,next.byteLength,this.gl.DYNAMIC_DRAW);this.account((cap-this.capacity)*BYTES);this.data=next;this.capacity=cap;this.growths++;}
  draw(cubes,renderOrigin=[0,0,0]){
   if(this.disposed)throw Error('Disposed rigid batch');const g=this.gl;this.lastInstances=0;this.lastUploadBytes=0;if(g.isContextLost())return 0;if(this.generation!==this.renderer.generation)throw Error('Recreate rigid batch after context restoration');if(!cubes.length)return 0;
   const old={program:g.getParameter(g.CURRENT_PROGRAM),vao:g.getParameter(g.VERTEX_ARRAY_BINDING),array:g.getParameter(g.ARRAY_BUFFER_BINDING)};
   try{this.ensureCapacity(cubes.length);const count=pack(cubes,V.blocks,this.data,renderOrigin);g.useProgram(this.program.p);g.bindVertexArray(this.vao);g.bindBuffer(g.ARRAY_BUFFER,this.instanceBuffer);g.bufferSubData(g.ARRAY_BUFFER,0,this.data,0,count*FLOATS);g.drawElementsInstanced(g.TRIANGLES,36,g.UNSIGNED_SHORT,0,count);this.renderer.stats.draws++;this.renderer.stats.triangles+=12*count;this.lastInstances=count;this.lastUploadBytes=count*BYTES;this.draws++;this.uploads++;return count;}finally{g.useProgram(old.program);g.bindVertexArray(old.vao);g.bindBuffer(g.ARRAY_BUFFER,old.array);}
  }
  inspect(){return{generation:this.generation,capacity:this.capacity,maxCapacity:MAX,bytesPerInstance:BYTES,gpuBytes:this.bytes,lastInstances:this.lastInstances,lastUploadBytes:this.lastUploadBytes,growths:this.growths,draws:this.draws,uploads:this.uploads,liveBuffers:this.disposed?0:3,liveVAO:!this.disposed&&!!this.vao,liveProgram:!this.disposed&&!!this.program,disposed:this.disposed};}
  destroy(lost=false){if(this.disposed)return;const current=this.generation===this.renderer.generation,g=this.gl;if(current&&!lost&&!g.isContextLost()){if(this.vao)g.deleteVertexArray(this.vao);for(const b of[this.vertexBuffer,this.indexBuffer,this.instanceBuffer])if(b)g.deleteBuffer(b);if(this.program?.p)g.deleteProgram(this.program.p);}if(current)this.renderer.stats.avatarBatchBytes=Math.max(0,(this.renderer.stats.avatarBatchBytes||0)-this.bytes);this.disposed=true;this.vao=this.vertexBuffer=this.indexBuffer=this.instanceBuffer=null;this.program=null;this.bytes=0;this.capacity=0;this.data=new Float32Array(0);}
 }
 V.RigidCubeMath=Object.freeze({normalize,multiply,rotate,fromEuler:euler});V.RIGID_CUBE_FORMAT=Object.freeze({floatsPerInstance:FLOATS,bytesPerInstance:BYTES,maxInstances:MAX,instanceAttributes:attrs});V.RIGID_CUBE_GLSL=Object.freeze({vertex});V.RIGID_CUBE_BATCH_GLSL=V.RIGID_CUBE_GLSL;V.packRigidCubeInstances=pack;V.RigidCubeBatch=RigidCubeBatch;V.createRigidCubeBatch=(renderer,fs,options)=>new RigidCubeBatch(renderer,fs,options);
})();
