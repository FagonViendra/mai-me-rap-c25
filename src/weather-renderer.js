/* Original procedural sky and bounded, depth-tested precipitation for MảiMêRáp.
 * No downloaded textures. All weather state is supplied by the game controller.
 */
(() => {
 'use strict';const V=globalThis.Voxel||={};
 const PERIOD=65536,CLOUD_CELL=4,MAX_DROPS=400,FLOATS=MAX_DROPS*6*4;
 const finite=(n,d=0)=>typeof n==='number'&&Number.isFinite(n)?n:d;
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),mod=(n,m)=>((n%m)+m)%m;
 function normalize(options={},clock=0,dimension='overworld'){
  const input=options.weather||{},active=dimension==='overworld';
  const cloudStyle=['classic','volumetric','off'].includes(options.cloudStyle)?options.cloudStyle:'classic';
  const celestialStyle=options.celestialStyle==='enhanced'?'enhanced':'classic';
  const pair=(v,d)=>Array.isArray(v)&&v.length===2&&v.every(Number.isFinite)?v.slice():d;
  const wind=pair(input.wind,[0,0]).map(x=>clamp(x,-6,6)),windLength=Math.hypot(...wind);if(windLength>6)for(let i=0;i<2;i++)wind[i]*=6/windLength;
  return{cloudStyle,celestialStyle,cloudMode:cloudStyle==='volumetric'?1:cloudStyle==='off'?2:0,celestialMode:celestialStyle==='enhanced'?1:0,
   rain:active?clamp(finite(input.rain)):0,cloudCover:active?clamp(finite(input.cloudCover)):0,
   wind:active?wind:[0,0],windStrength:active?clamp(finite(input.windStrength,Math.hypot(...wind)/6)):0,
   cloudOffset:pair(input.cloudOffset,[finite(clock)*.55,0]).map(x=>mod(x,PERIOD)),
   lightning:active?clamp(finite(input.lightning)):0,wetness:active?clamp(finite(input.wetness)):0,
   moonPhase:mod(finite(input.moonPhase,.25),1),moonIllumination:clamp(finite(input.moonIllumination,.5)),
   kind:active&&['rain','storm'].includes(input.kind)?input.kind:'clear',
   cloudVisibility:cloudStyle==='off'?0:clamp(finite(input.cloudVisibility,1)),
   supplied:!!options.weather};
 }
 function cloudCoordinates(eye,state){const x=(eye[0]+state.cloudOffset[0])/CLOUD_CELL,z=(eye[2]+state.cloudOffset[1])/CLOUD_CELL,cx=Math.floor(x),cz=Math.floor(z);return{base:[cx,cz],eye:[(x-cx)*CLOUD_CELL,eye[1],(z-cz)*CLOUD_CELL]};}
 function classicCloudCoordinates(renderer,world,eye,state,clock){if(!state.supplied)return V.RenderOrigin.clouds(eye,clock);let motion=renderer.weatherCloudMotion;if(!motion||motion.epoch!==world.epoch){motion=renderer.weatherCloudMotion={epoch:world.epoch,last:state.cloudOffset.slice(),total:state.cloudOffset.slice()};}else{for(let i=0;i<2;i++){let delta=state.cloudOffset[i]-motion.last[i];if(delta>PERIOD/2)delta-=PERIOD;if(delta< -PERIOD/2)delta+=PERIOD;motion.total[i]+=delta;motion.last[i]=state.cloudOffset[i];}}return V.RenderOrigin.clouds([eye[0]+motion.total[0],eye[1],eye[2]+motion.total[1]],0);}
 function windVertex(main){const anchor='  gl_Position=uVP*vec4(vWorld,1.);';if(main.split(anchor).length!==2)throw Error('Weather wind vertex anchor changed');return main.replace(anchor,`
  if(uWeatherWindStrength>.001&&!uInstanced&&(vKind>2.5&&vKind<3.5||vKind>5.5&&vKind<6.5)){
    float weatherWeight=vKind<3.5?clamp(fract(aPosition.y)/.86,0.,1.):.48;
    float weatherPhase=vWorld.x*.73+vWorld.z*.51+vWorld.y*.21+uWindOriginPhase.x;
    float gust=.68+.32*sin(uClock*.72+weatherPhase);
    vWorld.xz+=uWeatherWind*(.035*weatherWeight*gust);
  }
`+anchor);}
 const skyFragment=`#version 300 es
 precision highp float;precision highp int;
 in vec2 vScreen;out vec4 outColor;
 uniform vec3 uForward,uRight,uUp,uEye,uSun,uFog;
 uniform float uTan,uAspect,uDay,uClock,uUnderwater,uRealm;
 uniform ivec2 uCloudCell,uCloudOctaveCell;uniform vec2 uCloudFraction,uCloudOctaveFraction;
 uniform int uCloudStyle,uCelestialStyle;uniform float uCloudVisibility,uRain,uCloudCover,uMoonPhase;
 uniform ivec2 uVoxelCloudBase;uniform vec3 uVoxelCloudEye;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float field(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float cloudField(vec2 local,ivec2 base){vec2 f=fract(local);f=f*f*(3.-2.*f);ivec2 i=base+ivec2(floor(local));return mix(mix(hash(vec2(i)),hash(vec2(i+ivec2(1,0))),f.x),mix(hash(vec2(i+ivec2(0,1))),hash(vec2(i+ivec2(1,1))),f.x),f.y);}
 uint cloudBits(ivec2 cell,int mask){uvec2 c=uvec2(cell&ivec2(mask));uint h=c.x*1597334677u^c.y*3812015801u;h=(h^(h>>16u))*2146121005u;h=(h^(h>>15u))*2221713035u;return h^(h>>16u);}
 float cloudHash(ivec2 cell,int mask){return float(cloudBits(cell,mask)&16777215u)*(1./16777216.);}
 float voxelField(ivec2 cell,int scale){ivec2 coarse=ivec2(floor(vec2(cell)/float(scale)));vec2 f=vec2(cell-coarse*scale)/float(scale);f=f*f*(3.-2.*f);int mask=16384/scale-1;return mix(mix(cloudHash(coarse,mask),cloudHash(coarse+ivec2(1,0),mask),f.x),mix(cloudHash(coarse+ivec2(0,1),mask),cloudHash(coarse+ivec2(1,1),mask),f.x),f.y);}
 // Weather changes coverage, depth and optical density independently of style.
 // Partial boundary cells fade as the eased weather changes their occupied height.
 float cloudMoisture(){return clamp(uRain*.75+smoothstep(.40,.98,uCloudCover)*.25,0.,1.);}
 vec3 cloudColumn(ivec2 cell,float distanceToEye){float n=voxelField(cell,8)*.76+voxelField(cell+ivec2(37,91),4)*.24;float threshold=mix(.64,.35,uCloudCover);float puff=clamp((n-threshold)*5.2,0.,1.);if(puff<=.015)return vec3(1000.,-1000.,0.);float moisture=cloudMoisture();float bottom=mix(112.,108.,moisture)+floor((1.-puff)*1.8)*4.;float thinDepth=4.+floor(puff*1.8)*4.,wetDepth=4.+floor(puff*5.)*4.;return vec3(bottom,bottom+mix(thinDepth,wetDepth,moisture),smoothstep(.015,.22,puff));}
 vec4 blockClouds(vec3 ray){
  float entry=0.,exitAt=320.;if(abs(ray.y)<.00001){if(uVoxelCloudEye.y<104.||uVoxelCloudEye.y>136.)return vec4(0.);}else{float a=(104.-uVoxelCloudEye.y)/ray.y,b=(136.-uVoxelCloudEye.y)/ray.y;entry=max(0.,min(a,b));exitAt=min(320.,max(a,b));}if(exitAt<=entry)return vec4(0.);
  vec3 start=uVoxelCloudEye+ray*(entry+.002);ivec3 cell=ivec3(floor(start/4.)),stepDir=ivec3(sign(ray));
  vec3 safe=vec3(abs(ray.x)<.00001?.00001:ray.x,abs(ray.y)<.00001?.00001:ray.y,abs(ray.z)<.00001?.00001:ray.z);
  vec3 edge=(vec3(cell)+step(vec3(0.),ray))*4.;vec3 next=(edge-uVoxelCloudEye)/safe,delta=abs(vec3(4.)/safe);
  if(abs(ray.x)<.00001)next.x=1e20;if(abs(ray.y)<.00001)next.y=1e20;if(abs(ray.z)<.00001)next.z=1e20;
  vec3 normal=entry>0.?vec3(0.,-sign(ray.y),0.):-ray;float travel=entry;ivec2 previous=ivec2(2147483647);vec3 column=vec3(1000.,-1000.,0.),cloudColor=vec3(0.);float cloudAlpha=0.,alphaLimit=0.;
  for(int crossing=0;crossing<64;crossing++){
    if(travel>exitAt)break;ivec2 horizontal=cell.xz+uVoxelCloudBase;
    if(any(notEqual(horizontal,previous))){column=cloudColumn(horizontal,travel);previous=horizontal;}
    float cellBottom=float(cell.y)*4.,y=cellBottom+2.;
    float fill=clamp((column.y-cellBottom)/4.,0.,1.)-clamp((column.x-cellBottom)/4.,0.,1.);
    if(fill>.005&&column.z>.001){float face=.68+.19*max(normal.y,0.)+.13*max(dot(normal,uSun),0.);float height=clamp((y-108.)/24.,0.,1.);
      vec3 dayColor=mix(vec3(.70,.78,.88),vec3(1.,.985,.95),height*.65+.35);vec3 nightColor=mix(vec3(.075,.095,.15),vec3(.20,.24,.34),height);
      vec3 color=mix(nightColor,dayColor,uDay)*face;
      vec3 airyWhite=mix(vec3(.94,.955,.975),vec3(1.,.99,.965),height*.65+.35)*(.90+.06*max(normal.y,0.)+.04*max(dot(normal,uSun),0.));
      vec3 airy=mix(nightColor,airyWhite,uDay);color=mix(color,airy,(1.-uRain)*smoothstep(.12,.65,uDay));
      color=mix(color,mix(vec3(.10,.13,.20),vec3(.48,.54,.62),uDay),uRain*.63);
      float rim=pow(max(dot(ray,uSun),0.),8.)*(1.-uRain)*max(uSun.y,0.);color+=vec3(1.,.76,.43)*rim*.12;
      float fadedLimit=(1.-smoothstep(170.,285.,travel))*mix(.44,.965,cloudMoisture())*uCloudVisibility;
      if(alphaLimit==0.)alphaLimit=fadedLimit;
      // Composite cloud cells, then mix with the untouched sky only once.
      // The first-hit distance fade caps the whole cloud, including thin edges.
      float opacity=fadedLimit*fill*column.z,contribution=min((1.-cloudAlpha)*opacity,max(0.,alphaLimit-cloudAlpha));
      cloudColor+=color*contribution;cloudAlpha+=contribution;
      if(fadedLimit<=0.||alphaLimit>0.&&cloudAlpha>=alphaLimit-.00001)return cloudAlpha>0.?vec4(cloudColor/cloudAlpha,cloudAlpha):vec4(0.);
    }
    if(next.x<next.y&&next.x<next.z){travel=next.x;next.x+=delta.x;cell.x+=stepDir.x;normal=vec3(-float(stepDir.x),0.,0.);}
    else if(next.y<next.z){travel=next.y;next.y+=delta.y;cell.y+=stepDir.y;normal=vec3(0.,-float(stepDir.y),0.);}
    else{travel=next.z;next.z+=delta.z;cell.z+=stepDir.z;normal=vec3(0.,0.,-float(stepDir.z));}
  }
  return cloudAlpha>0.?vec4(cloudColor/cloudAlpha,cloudAlpha):vec4(0.);
 }
 vec3 starJitter(ivec3 cell){uvec3 q=uvec3(cell);uint seed=q.x*1597334677u^q.y*3812015801u^q.z*2798796415u;uvec3 h=uvec3(seed)+uvec3(0u,2654435769u,1013904242u);h=(h^(h>>16u))*2146121005u;h=(h^(h>>15u))*2221713035u;h=h^(h>>16u);return vec3(h&uvec3(16777215u))*(1./16777216.);}
 float starField(vec3 direction){vec3 p=direction*24.;ivec3 base=ivec3(floor(p-.5));float light=0.;for(int z=0;z<2;z++)for(int y=0;y<2;y++)for(int x=0;x<2;x++){ivec3 cell=base+ivec3(x,y,z);vec3 delta=vec3(cell)+starJitter(cell)-p;float d2=dot(delta,delta);light=max(light,1.-smoothstep(.00020,.003025,d2));}return light;}
 // Five fixed crater evaluations only inside the small voxel-disc moon mask.
 float craterRelief(vec2 pixel,vec2 center,float radius,vec2 light){
  vec2 p=(pixel-center)/radius,a=abs(p);float edge=max(max(a.x,a.y)*.93,(a.x+a.y)*.68);
  float bowl=1.-smoothstep(.55,.90,edge),rim=smoothstep(.60,.92,edge)*(1.-smoothstep(1.02,1.23,edge));
  float facing=clamp(dot(p,light)/max(.35,edge),-1.,1.);
  return rim*(.095+.13*facing)-bowl*.17;
 }
 vec3 celestial(vec3 color,vec3 ray){
  float sd=dot(ray,uSun);
  // Compact halos fit within this conservative pair of cones. Most sky
  // pixels skip basis construction, powers, surface noise and phase shading.
  if(abs(sd)<.98)return color;
  vec3 sr=normalize(cross(uSun,vec3(0,0,1))),su=cross(sr,uSun);
  vec2 projected=vec2(dot(ray,sr),dot(ray,su));float clear=1.-uRain*.85,squareDistance=max(abs(projected.x),abs(projected.y));
  float haloDistance=uCelestialStyle==0?squareDistance:length(projected);
  if(sd>0.){
   if(haloDistance<.12){float halo=1.-haloDistance/.12,halo2=halo*halo;color+=vec3(1.,.77,.46)*(halo2*halo2*halo)*.24*uDay*clear;}
   if(uCelestialStyle==0){if(squareDistance<.032)color=mix(color,vec3(1.,.96,.78),clear);return color;}
   if(squareDistance<.036){
    vec2 cell=floor(projected/.036*16.),pixel=(cell+.5)/16.;
    // Clip whole32x32 cells, keeping a crisp stair-step contour at every FOV.
    float radius2=dot(pixel,pixel);if(radius2>1.)return color;float edge=sqrt(radius2);
    float coarse=hash(floor(cell/3.)+vec2(31.,17.)),grain=hash(cell+vec2(7.,43.));
    float clock=mod(uClock,4096.)*(6.28318530718/4096.),pulse=.5+.5*sin(clock*23.+coarse*6.2831853);
    float bands=.5+.5*sin(pixel.y*11.+sin(pixel.x*4.+clock*14.)*1.65-clock*12.);
    float heat=clamp(.46+.25*bands+.19*coarse+.10*pulse,0.,1.);
    float steppedRim=clamp((floor(edge*16.)-10.)/5.,0.,1.);
    vec3 plasma=mix(vec3(1.,.61,.18),vec3(1.,.985,.86),.30+.70*heat);
    vec3 rimColor=mix(vec3(1.,.48,.12),vec3(1.,.79,.35),smoothstep(.01,.50,uSun.y));
    plasma=mix(plasma,rimColor,steppedRim*.42);
    plasma*=.94+.06*grain;plasma+=vec3(.035,.025,.008)*step(.84,coarse)*(1.-steppedRim);
    color=mix(color,clamp(plasma,0.,1.),clear);
   }
  }else{
   if(uCelestialStyle==0){if(squareDistance<.025)color=mix(color,mix(vec3(.25,.30,.42),vec3(.82,.87,.92),step(.0,projected.x+.008)),clear);return color;}
   if(haloDistance<.09){float halo=1.-haloDistance/.09,halo2=halo*halo;color+=vec3(.72,.77,1.)*(halo2*halo2)*.04*(1.-uDay)*clear;}
   if(squareDistance<.030){
    vec2 cell=floor(projected/.030*16.),pixel=(cell+.5)/16.;
    float radius2=dot(pixel,pixel);if(radius2>1.)return color;
    float phase=uMoonPhase*6.28318530718,sinPhase=sin(phase),cosPhase=cos(phase);
    vec2 light=normalize(vec2(sinPhase,.55));
    float relief=craterRelief(pixel,vec2(-.48,.42),.26,light)+craterRelief(pixel,vec2(.38,.20),.34,light)
      +craterRelief(pixel,vec2(-.10,-.38),.29,light)+craterRelief(pixel,vec2(.62,-.55),.16,light)
      +craterRelief(pixel,vec2(-.68,-.58),.14,light);
    float grain=hash(cell+vec2(47.,23.)),mare=smoothstep(.45,.75,field(pixel*2.1+vec2(8.7,19.3)));
    float curve=sqrt(max(0.,1.-radius2));
    float terminator=pixel.x*sinPhase+curve*cosPhase+relief*.10;
    float sunlight=smoothstep(-.035,.035,terminator);
    float face=.91-.06*abs(pixel.x)-.035*abs(pixel.y)+relief;
    vec3 lit=vec3(.88,.90,.94)*clamp(face-.15*mare+.055*(grain-.5),.48,1.16);
    vec3 dark=vec3(.075,.095,.14)*(.92+relief*.55-.12*mare+.04*grain);
    color=mix(color,mix(dark,lit,sunlight),clear);
   }
  }
  return color;
 }
 void main(){
  vec3 ray=normalize(uForward+uRight*vScreen.x*uTan*uAspect+uUp*vScreen.y*uTan);
  if(uRealm>.5&&uRealm<1.5){float low=1.-smoothstep(-.15,.80,ray.y);vec3 ember=mix(vec3(.035,.014,.025),uFog,pow(low,.70));float haze=field(ray.xz*7.+vec2(uClock*.012,uClock*.004));ember*=.94+.12*haze;if(uUnderwater>.5)ember=mix(ember,vec3(.055,.29,.40),.87);outColor=vec4(ember,1.);return;}
  if(uRealm>1.5){float h=clamp(ray.y,0.,1.);vec3 col=mix(vec3(.86,.94,1.),vec3(.34,.65,.94),pow(h,.58));float below=1.-smoothstep(-.18,.12,ray.y);vec2 cloudUV=ray.xz/max(.20,abs(ray.y)+.10)*2.1;float cloud=field(cloudUV+vec2(uClock*.006,uClock*.002));col=mix(col,mix(vec3(.79,.87,.96),vec3(.98,.99,1.),.55+.45*cloud),below*(.72+.20*cloud));float sd=max(dot(ray,uSun),0.);float disk=smoothstep(.9987,.9997,sd);col+=vec3(1.,.82,.49)*(pow(sd,64.)*.15+disk*.38);if(uUnderwater>.5)col=mix(col,vec3(.055,.29,.40),.87);outColor=vec4(col,1.);return;}
  float h=clamp(ray.y,0.,1.);vec3 top=mix(vec3(.012,.023,.060),vec3(.24,.53,.83),uDay);top=mix(top,mix(vec3(.025,.035,.055),vec3(.35,.43,.53),uDay),uRain*.72);
  vec3 col=mix(uFog,top,pow(h,.55));col=celestial(col,ray);
  float starVisibility=(1.-smoothstep(-.18,-.035,uSun.y))*(1.-uRain);if(starVisibility>.001&&ray.y>=.08)col+=starField(ray)*starVisibility*.8;
  if(uCloudVisibility>.001&&uCloudStyle==0&&ray.y>.035&&uEye.y<100.){float t=(100.-uEye.y)/ray.y;vec2 p=uCloudFraction+ray.xz*t/26.;vec2 grid=floor(p*4.)/4.;float n=cloudField(grid,uCloudCell)*.70+cloudField(grid*.33+uCloudOctaveFraction,uCloudOctaveCell)*.30;float cloud=step(.58-uCloudCover*.16,n)*(1.-smoothstep(90.,310.,t));vec3 cc=mix(vec3(.18,.22,.32),vec3(.98,.98,.94),uDay);cc*=.87+.13*step(.60,n);cc=mix(cc,vec3(.40,.47,.55)*max(.25,uDay),uRain*.6);col=mix(col,cc,cloud*mix(.44,.965,cloudMoisture())*uCloudVisibility);}
  if(uCloudVisibility>.001&&uCloudStyle==1){vec4 cloud=blockClouds(ray);col=mix(col,cloud.rgb,cloud.a);}
  if(uUnderwater>.5)col=mix(col,vec3(.055,.29,.40),.87);outColor=vec4(col,1.);
 }`;
 const rainVertex=`#version 300 es
 precision highp float;layout(location=0)in vec3 aPosition;layout(location=1)in float aAlpha;
 uniform mat4 uVP;out float vAlpha;void main(){vAlpha=aAlpha;gl_Position=uVP*vec4(aPosition,1.);}`;
 const rainFragment=`#version 300 es
 precision highp float;in float vAlpha;uniform vec3 uRainColor;out vec4 outColor;void main(){outColor=vec4(uRainColor,vAlpha);}`;
 function randomCell(x,z,salt){let h=(Math.imul(x|0,1597334677)^Math.imul(z|0,3812015801)^salt)>>>0;h=Math.imul(h^(h>>>16),2146121005)>>>0;h=Math.imul(h^(h>>>15),2221713035)>>>0;return ((h^(h>>>16))>>>0)/4294967296;}
 class RainRenderer{
  constructor(renderer){this.renderer=renderer;this.gl=renderer.gl;this.generation=renderer.generation;this.vertices=new Float32Array(FLOATS);this.roofs=new Map();this.gpu=null;this.epoch=null;this.stats={drops:0,vertices:0,roofScans:0,roofClipped:0,unloadedSkipped:0,allocations:0,uploads:0};}
  destroy(lost=false){const a=this.gpu,g=this.gl;this.gpu=null;if(a&&!lost){if(g.isBuffer(a.buffer))g.deleteBuffer(a.buffer);if(g.isVertexArray(a.vao))g.deleteVertexArray(a.vao);if(g.isProgram(a.program.p))g.deleteProgram(a.program.p);}this.roofs.clear();}
  roof(world,x,z){x=Math.floor(x);z=Math.floor(z);const cx=Math.floor(x/16),cz=Math.floor(z/16),c=world.chunks.get(cx+','+cz);if(!c?.data){this.stats.unloadedSkipped++;return Infinity;}const key=x+','+z,old=this.roofs.get(key);if(old&&old.chunk===c&&old.revision===c.revision)return old.height;this.stats.roofScans++;const lx=mod(x,16),lz=mod(z,16),column=lx+16*lz;let height=0;for(let y=95;y>=0;y--){const id=c.data[column+256*y],b=V.blocks[id];if(id&&(b?.solid||b?.liquid||id===7)){height=y+1;break;}}this.roofs.set(key,{chunk:c,revision:c.revision,height});return height;}
  build(world,eye,origin,right,clock,state){const s=this.stats;s.drops=s.vertices=s.roofScans=s.roofClipped=s.unloadedSkipped=0;if(world.epoch!==this.epoch){this.roofs.clear();this.epoch=world.epoch;}if(this.roofs.size>2304)this.roofs.clear();const cloudTop=state.cloudStyle==='classic'?100:136;if(state.rain<.008||eye[1]>cloudTop+12)return this.vertices.subarray(0,0);const centerX=Math.floor(eye[0]/2),centerZ=Math.floor(eye[2]/2),top=Math.min(cloudTop,Math.floor(eye[1]/8)*8+24),span=40,speed=18+state.rain*8,phase=mod(clock,span/speed)*speed;let at=0;
   const vertex=(p,alpha)=>{this.vertices[at++]=p[0]-origin[0];this.vertices[at++]=p[1]-origin[1];this.vertices[at++]=p[2]-origin[2];this.vertices[at++]=alpha;};
   for(let dz=-9;dz<=9;dz++)for(let dx=-9;dx<=9;dx++){const cx=centerX+dx,cz=centerZ+dz,seed=randomCell(cx,cz,73471);if(seed>state.rain*.94+.025)continue;const x=cx*2+randomCell(cx,cz,91831)*1.8+.1,z=cz*2+randomCell(cx,cz,11717)*1.8+.1,y=top-mod(phase+randomCell(cx,cz,37201)*span,span),distance=Math.hypot(x-eye[0],z-eye[2]);if(distance>19||distance<.75)continue;const length=.55+state.rain*.50+randomCell(cx,cz,34103)*.45,drift=[state.wind[0]*length/speed,state.wind[1]*length/speed],ceiling=Math.max(this.roof(world,x,z),this.roof(world,x-drift[0],z-drift[1]));if(y<ceiling+.05){s.roofClipped++;continue;}const alpha=(.19+state.rain*.20)*(1-clamp((distance-11)/8))*clamp((y-eye[1]+18)/7)*clamp((top-y)/5);if(alpha<.008)continue;const width=.018+state.rain*.008,a=[x,y,z],b=[x-drift[0],y+length,z-drift[1]],p=[a[0]-right[0]*width,a[1],a[2]-right[2]*width],q=[a[0]+right[0]*width,a[1],a[2]+right[2]*width],r=[b[0]+right[0]*width,b[1],b[2]+right[2]*width],t=[b[0]-right[0]*width,b[1],b[2]-right[2]*width];vertex(p,alpha*.32);vertex(q,alpha*.32);vertex(r,alpha);vertex(p,alpha*.32);vertex(r,alpha);vertex(t,alpha);s.drops++;if(s.drops>=MAX_DROPS)break;}
   s.vertices=at/4;return this.vertices.subarray(0,at);
  }
  draw(world,{eye,origin,right,clock,state,vp,day,managed=true,underwater=false}){const g=this.gl,r=this.renderer;if(g.isContextLost()||underwater||world.dimension!=='overworld'||state.rain<.008){this.stats.drops=this.stats.vertices=this.stats.roofScans=this.stats.roofClipped=this.stats.unloadedSkipped=0;return;}const data=this.build(world,eye,origin,right,clock,state);if(!data.length)return;const old=managed?null:{program:g.getParameter(g.CURRENT_PROGRAM),vao:g.getParameter(g.VERTEX_ARRAY_BINDING),array:g.getParameter(g.ARRAY_BUFFER_BINDING),depth:g.isEnabled(g.DEPTH_TEST),blend:g.isEnabled(g.BLEND),cull:g.isEnabled(g.CULL_FACE),mask:g.getParameter(g.DEPTH_WRITEMASK),func:g.getParameter(g.DEPTH_FUNC),srcRGB:g.getParameter(g.BLEND_SRC_RGB),dstRGB:g.getParameter(g.BLEND_DST_RGB),srcA:g.getParameter(g.BLEND_SRC_ALPHA),dstA:g.getParameter(g.BLEND_DST_ALPHA),eqRGB:g.getParameter(g.BLEND_EQUATION_RGB),eqA:g.getParameter(g.BLEND_EQUATION_ALPHA)};
   try{if(!this.gpu){const a=this.gpu={program:r.program(rainVertex,rainFragment),vao:g.createVertexArray(),buffer:g.createBuffer()};if(!a.vao||!a.buffer)throw Error('Không đủ bộ nhớ GPU cho mưa.');g.bindVertexArray(a.vao);g.bindBuffer(g.ARRAY_BUFFER,a.buffer);g.bufferData(g.ARRAY_BUFFER,FLOATS*4,g.DYNAMIC_DRAW);g.enableVertexAttribArray(0);g.vertexAttribPointer(0,3,g.FLOAT,false,16,0);g.enableVertexAttribArray(1);g.vertexAttribPointer(1,1,g.FLOAT,false,16,12);this.stats.allocations++;}
    const a=this.gpu;g.useProgram(a.program.p);g.bindVertexArray(a.vao);g.bindBuffer(g.ARRAY_BUFFER,a.buffer);g.bufferSubData(g.ARRAY_BUFFER,0,data);this.stats.uploads++;g.uniformMatrix4fv(a.program.u.uVP,false,vp);g.uniform3f(a.program.u.uRainColor,.38+.30*day,.48+.30*day,.62+.28*day);g.enable(g.DEPTH_TEST);g.depthFunc(g.LEQUAL);g.depthMask(false);g.disable(g.CULL_FACE);g.enable(g.BLEND);g.blendEquationSeparate(g.FUNC_ADD,g.FUNC_ADD);g.blendFuncSeparate(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA,g.ONE,g.ONE_MINUS_SRC_ALPHA);g.drawArrays(g.TRIANGLES,0,this.stats.vertices);r.stats.draws++;r.stats.triangles+=this.stats.vertices/3;
   }finally{if(old){g.useProgram(old.program);g.bindVertexArray(old.vao);g.bindBuffer(g.ARRAY_BUFFER,old.array);g.depthFunc(old.func);g.depthMask(old.mask);g.blendEquationSeparate(old.eqRGB,old.eqA);g.blendFuncSeparate(old.srcRGB,old.dstRGB,old.srcA,old.dstA);for(const[cap,on]of [[g.DEPTH_TEST,old.depth],[g.BLEND,old.blend],[g.CULL_FACE,old.cull]])on?g.enable(cap):g.disable(cap);}else{g.useProgram(r.terrain.p);g.bindVertexArray(null);g.bindBuffer(g.ARRAY_BUFFER,null);g.enable(g.DEPTH_TEST);g.depthFunc(g.LEQUAL);g.depthMask(true);g.enable(g.CULL_FACE);g.disable(g.BLEND);g.blendEquationSeparate(g.FUNC_ADD,g.FUNC_ADD);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);}}
  }
  inspect(){return{...this.stats,maxDrops:MAX_DROPS,maxCandidateColumns:361,roofCacheColumns:this.roofs.size,gpuBytes:this.gpu?FLOATS*4:0,liveBuffer:!!this.gpu?.buffer,liveVAO:!!this.gpu?.vao,liveProgram:!!this.gpu?.program,generation:this.generation,occlusion:'actual terrain depth test plus highest loaded solid/liquid column at both streak ends',limitations:'No rain inside unloaded columns, under the highest roof, underwater, or in alternate realms. Wind uses slanted streaks; no fluid or erosion simulation.'};}
 }
 V.WeatherVisuals=Object.freeze({normalize,cloudCoordinates,classicCloudCoordinates,windVertex,skyFragment,rainVertex,rainFragment,period:PERIOD,cloudCell:CLOUD_CELL,maxCloudCrossings:64});
 V.RainRenderer=RainRenderer;
})();
