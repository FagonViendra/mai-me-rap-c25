/* MảiMêRáp — WebGL2 only. No rendering framework or network assets. */
(() => {
 /* Renderer.frame owns its program, VAO and texture units. Managed effects
  * restore the documented terrain defaults required by the next pass.
  * Direct effect calls keep their full external-state preservation path. */
 'use strict'; const V=globalThis.Voxel ||= {};
 const FACES=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
 const M={
  perspective(fov,aspect,near,far){const t=1/Math.tan(fov/2),q=1/(near-far);return new Float32Array([t/aspect,0,0,0,0,t,0,0,0,0,(far+near)*q,-1,0,0,2*far*near*q,0]);},
  multiply(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[r+4]*b[c*4+1]+a[r+8]*b[c*4+2]+a[r+12]*b[c*4+3];return o;},
  camera(eye,yaw,pitch){const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),f=[sy*cp,sp,-cy*cp],r=[cy,0,sy],u=[-sy*sp,cp,cy*sp];const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];return {f,r,u,view:new Float32Array([r[0],u[0],-f[0],0,r[1],u[1],-f[1],0,r[2],u[2],-f[2],0,-dot(r,eye),-dot(u,eye),dot(f,eye),1])};},
  planes(m){const p=[];for(const [axis,sign]of [[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]]){const q=[m[3]+sign*m[axis],m[7]+sign*m[4+axis],m[11]+sign*m[8+axis],m[15]+sign*m[12+axis]],l=Math.hypot(q[0],q[1],q[2]);p.push(q.map(x=>x/l));}return p;}
 };V.math=M;
 const VS=`#version 300 es
 precision highp float;
 layout(location=0) in vec3 aPosition;
 layout(location=1) in vec2 aUV;
 layout(location=2) in float aLayer;
 layout(location=3) in vec2 aLightAO;
 layout(location=4) in vec3 aInfo;
 layout(location=5) in vec3 aTint;
 uniform mat4 uVP;uniform vec3 uOffset;
 out vec3 vWorld;out vec2 vUV;out vec2 vLightAO;out vec3 vTint;
 flat out float vLayer;flat out float vKind;flat out float vEmission;flat out vec3 vNormal;
 const vec3 norms[6]=vec3[6](vec3(1,0,0),vec3(-1,0,0),vec3(0,1,0),vec3(0,-1,0),vec3(0,0,1),vec3(0,0,-1));
 ${V.CUBE_BATCH_GLSL.attributes}
 ${V.ScreenSunShadows.windDeclaration}
 uniform vec2 uWeatherWind;uniform float uWeatherWindStrength;
 ${V.WeatherVisuals?V.WeatherVisuals.windVertex(V.ScreenSunShadows.patchVertex(V.CUBE_BATCH_GLSL.main)):V.ScreenSunShadows.patchVertex(V.CUBE_BATCH_GLSL.main)}`;
 // Named atlas bindings are resolved once, after catalog load. No literal
 // layer numbers, extra textures, vertex formats or per-frame allocations.
 const MATERIAL_NAMES=Object.freeze({
  metal:Object.freeze(['rivetedIron','copperPlate','cutCopper','engravedCopper','ironBlock','goldBlock','ironLattice','ironTread','c25_copper_standing_seam','c25_zinc_diamond_roof','c25_iron_corrugated_panel','c25_brass_rivet_plaque','c25_hammered_bronze']),
  gem:Object.freeze(['quartz','quartzBricks','quartzPillar','quartzEnd','amethyst','amethystMosaic','diamondBlock','goldRimQuartz']),
  ore:Object.freeze(['ironOre','goldOre','diamondOre','copperOre']),
  quartzOre:Object.freeze(['quartzOre']),
  satin:Object.freeze(['patinaCopper','jadeBarrelRoof','c25_branch_white_marble','c25_fractured_green_marble','c25_cobalt_wave_ceramic','c25_ivory_fan_relief','c25_jade_bamboo_tile','c25_indigo_star_mosaic','c25_plum_octagon_ceramic','c25_verdigris_sunken_square','c25_blue_glazed_roof']),
  stone:Object.freeze(['smoothStone','polishedBasalt','chiseledStone','limestoneTiles','slateTiles','ceramicIvory','ceramicRed','ceramicOchre','ceramicGreen','ceramicBlue','ceramicBlack','coalBlock','terracottaOpenwork','limePlaster','exposedBrickPlaster','terrazzoRiver','terracottaHerringbone','terracottaCourse','c25_rusticated_sandstone','c25_granite_fan_paving','c25_limestone_longcourse','c25_basalt_octagon_inlay','c25_ribbed_travertine','c25_slate_chevron','c25_river_pebble_panel','c25_rose_strata_stone','c25_fossil_limestone','c25_terracotta_sun_disk','c25_ochre_basket_brick','c25_chalk_flower_rosette','c25_clinker_soldiercourse','c25_slate_ridge_course','c25_terracotta_overlap_tile'])
 });
 const MATERIAL_LAYERS=Object.freeze(Object.fromEntries(Object.entries(MATERIAL_NAMES).map(([kind,names])=>[kind,Object.freeze(names.filter(name=>Number.isInteger(V.textureLayers?.[name])).map(name=>V.textureLayers[name]))])));
 const materialLayerClause=ids=>ids.length?ids.map(id=>'layer=='+id).join('||'):'false';
 // Native24 ground-top variation keeps grain-oriented wood and cutout plants
 // untouched. A uint cell key follows the world across render-origin rebases.
 const TERRAIN_TOP_NAMES=Object.freeze(['grassTop','dirt','stone','sand','snow','basalt','clay','gravel']);
 const TERRAIN_TOP_LAYERS=Object.freeze(TERRAIN_TOP_NAMES.filter(name=>Number.isInteger(V.textureLayers?.[name])).map(name=>V.textureLayers[name]));
 const TERRAIN_TOP_GLSL='bool terrainTopLayer(float rawLayer){int layer=int(rawLayer+.5);return '+materialLayerClause(TERRAIN_TOP_LAYERS)+';}';

 // Ore inclusions have no required grain direction. Rotate only these six
 // opaque terrain layers; masonry courses, entities and held items stay fixed.
 const TERRAIN_ORE_NAMES=Object.freeze(['coalOre','ironOre','goldOre','diamondOre','copperOre','quartzOre']);
 const TERRAIN_ORE_LAYERS=Object.freeze(TERRAIN_ORE_NAMES.filter(name=>Number.isInteger(V.textureLayers?.[name])).map(name=>V.textureLayers[name]));
 const TERRAIN_ORE_GLSL='bool terrainOreLayer(float rawLayer){int layer=int(rawLayer+.5);return '+materialLayerClause(TERRAIN_ORE_LAYERS)+';}';

 const MATERIAL_GLSL='vec3 materialProperties(float rawLayer,vec3 albedo){int layer=int(rawLayer+.5);'
  +'if('+materialLayerClause(MATERIAL_LAYERS.metal)+')return vec3(.32,48.,.24);'
  +'if('+materialLayerClause(MATERIAL_LAYERS.gem)+')return vec3(.25,72.,.20);'
  +'if('+materialLayerClause(MATERIAL_LAYERS.ore)+'){float c=max(albedo.r,max(albedo.g,albedo.b))-min(albedo.r,min(albedo.g,albedo.b));return vec3(.24*smoothstep(.07,.22,c),56.,0.);}'
  +'if('+materialLayerClause(MATERIAL_LAYERS.quartzOre)+')return vec3(.23*smoothstep(.58,.83,dot(albedo,vec3(.299,.587,.114))),64.,0.);'
  +'if('+materialLayerClause(MATERIAL_LAYERS.satin)+')return vec3(.07,20.,.12);'
  +'if('+materialLayerClause(MATERIAL_LAYERS.stone)+')return vec3(0.,24.,.12);'
  +'return vec3(0.,24.,0.);}';
 const FS=`#version 300 es
 precision highp float;precision highp int;precision highp sampler2DArray;
 in vec3 vWorld;in vec2 vUV;in vec2 vLightAO;in vec3 vTint;flat in float vLayer;flat in float vKind;flat in float vEmission;flat in vec3 vNormal;
 uniform sampler2DArray uTexture;uniform sampler2DArray uCutout;uniform sampler2DArray uCracks;uniform vec3 uMineCell;uniform float uMineProgress;uniform vec3 uEye;uniform vec3 uSun;uniform vec3 uFog;uniform vec2 uFogRange;uniform float uDay;uniform float uClock;uniform float uUnderwater;uniform float uDenseLeaves;uniform int uTorchCount;uniform vec4 uTorches[16];uniform vec4 uHandTorch;uniform float uRealm;uniform float uWaterFX;uniform vec4 uWaterPhase;uniform float uMaterialDetail;uniform float uTextureSize;uniform float uRainWetness;uniform float uTerrainVariation;uniform uvec2 uTerrainOrigin;uniform uint uTerrainOriginY;
 out vec4 outColor;
 ${MATERIAL_GLSL}
 ${TERRAIN_TOP_GLSL}
 ${TERRAIN_ORE_GLSL}

 // Compute derivatives before cell-dependent branching; rotate those gradients
 // with the selected UVs so the cell hash cannot create a false mip footprint.
 uint terrainTopHash(uvec2 cell,uint layer){
   uint h=cell.x*1597334677u ^ cell.y*3812015801u ^ layer*2798796415u;
   h=(h^(h>>16u))*2146121005u;
   h=(h^(h>>15u))*2221713035u;
   return h^(h>>16u);
 }
 vec2 terrainTopUV(vec2 p,uint turn){
   if(turn==1u)return vec2(p.y,1.-p.x);
   if(turn==2u)return vec2(1.-p.x,1.-p.y);
   if(turn==3u)return vec2(1.-p.y,p.x);
   return p;
 }
 vec2 terrainTopGradient(vec2 d,uint turn){
   if(turn==1u)return vec2(d.y,-d.x);
   if(turn==2u)return -d;
   if(turn==3u)return vec2(-d.y,d.x);
   return d;
 }

 // Directional sky reflection; no scene capture or extra texture.
 float waterCloudHash(vec2 p){
   p=fract(p*vec2(123.34,456.21));
   p+=dot(p,p+45.32);
   return fract(p.x*p.y);
 }
 float waterCloudNoise(vec2 p){
   vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
   float a=waterCloudHash(i),b=waterCloudHash(i+vec2(1.,0.));
   float c=waterCloudHash(i+vec2(0.,1.)),d=waterCloudHash(i+vec2(1.,1.));
   return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
 }
 vec3 waterReflectedSky(vec3 ray){
   float h=clamp(ray.y,0.,1.),daylight=clamp(uDay,0.,1.);
   vec3 zenith=mix(vec3(.006,.013,.030),vec3(.17,.40,.69),daylight);
   vec3 sky=mix(uFog*1.03,zenith,smoothstep(0.,.85,h)*.82);
   // Fixed sky-direction clouds move in the animated surface reflection.
   vec2 p=ray.xz/max(ray.y+.18,.18)*.92;
   float cloud=.68*waterCloudNoise(p)+.32*waterCloudNoise(p*2.07+vec2(13.7,4.6));
   float cloudMask=smoothstep(.53,.77,cloud)*smoothstep(.015,.22,h);
   vec3 cloudColor=mix(vec3(.025,.035,.055),vec3(.91,.94,.97),daylight);
   sky=mix(sky,cloudColor,cloudMask*.64);
   float sunUp=smoothstep(-.04,.10,uSun.y);
   float sunset=(1.-smoothstep(.10,.55,uSun.y))*sunUp;
   float towardsSun=pow(max(dot(ray,normalize(uSun)),0.),5.);
   sky+=vec3(.16,.075,.025)*sunset*towardsSun;
   return sky;
 }
 void main(){
   // Uniform-only derivative gate runs before alpha discard or fragment-varying
   // branches. The material-off path keeps the original color computation.
   vec3 materialWorldDx=vec3(0.),materialWorldDy=vec3(0.);
   vec2 materialUVDx=vec2(0.),materialUVDy=vec2(0.);
   float materialUVFootprint=0.;
   if(uMaterialDetail>.5){
     materialWorldDx=dFdx(vWorld);materialWorldDy=dFdy(vWorld);
     materialUVDx=dFdx(vUV);materialUVDy=dFdy(vUV);
     vec2 materialWidth=abs(materialUVDx)+abs(materialUVDy);
     materialUVFootprint=max(materialWidth.x,materialWidth.y);
   }
   vec2 uv=vUV;if(vKind>.5&&vKind<1.5)uv+=vec2(uClock*.013,uClock*.009);
   bool leaf=vKind>5.5&&vKind<6.5;
   bool cutoutSampler=vKind>2.5&&vKind<5.5;
   vec4 tex;
   if(uTerrainVariation>.5&&uMaterialDetail>.5&&uRealm<.5&&uUnderwater<.5&&vKind>-.5&&vKind<.5&&vEmission<.01&&vNormal.y>.5&&terrainTopLayer(vLayer)){
     uvec2 cell=uvec2(ivec2(floor(vWorld.xz)))+uTerrainOrigin;
     uint key=terrainTopHash(cell,uint(vLayer+.5)),turn=key&3u;
     vec2 tile=terrainTopUV(fract(uv),turn);
     tex=textureGrad(uTexture,vec3(tile,vLayer),terrainTopGradient(materialUVDx,turn),terrainTopGradient(materialUVDy,turn));
     tex.rgb*=.96+float((key>>2u)&3u)*(.08/3.);
   }else if(uTerrainVariation>.5&&uMaterialDetail>.5&&uRealm<.5&&uUnderwater<.5&&vKind>-.5&&vKind<.5&&vEmission<.01&&terrainOreLayer(vLayer)){
     // Move infinitesimally inside the face to identify its owning block.
     // Add the uint origin after flooring the small relative coordinate.
     uvec3 cell=uvec3(ivec3(floor(vWorld-vNormal*.001)))+uvec3(uTerrainOrigin.x,uTerrainOriginY,uTerrainOrigin.y);
     uint face=abs(vNormal.x)>.5?(vNormal.x>0.?0u:1u):abs(vNormal.y)>.5?(vNormal.y>0.?2u:3u):(vNormal.z>0.?4u:5u);
     uint salt=uint(vLayer+.5)^(cell.y*2246822519u)^(face*3266489917u);
     uint turn=terrainTopHash(cell.xz,salt)&3u;
     tex=textureGrad(uTexture,vec3(terrainTopUV(fract(uv),turn),vLayer),terrainTopGradient(materialUVDx,turn),terrainTopGradient(materialUVDy,turn));
   }else{
     tex=vKind<-.5?vec4(1.):cutoutSampler?texture(uCutout,vec3(uv,vLayer)):texture(uTexture,vec3(uv,vLayer));
   }
   if(vKind<-1.5){
     vec2 pixelUV=vUV*uTextureSize,cell=floor(pixelUV+.0001);
     float noise=fract(sin(dot(cell,vec2(127.1,311.7)))*43758.5453);
     float grain=vKind<-2.5?.86+floor(noise*3.)*.07:.80+floor(noise*4.)*.075;
     if(vKind>=-2.5&&mod(cell.x+3.*cell.y,19.)<.5)grain*=.78;
     float detail=1.-smoothstep(.75,1.75,max(fwidth(pixelUV.x),fwidth(pixelUV.y)));
     tex=vec4(vec3(mix(.94,grain,detail)),1.);
   }
   if(vKind<.5||vKind>2.5){
     bool alphaTest=leaf?uDenseLeaves<.5:vKind<4.5;
     if(alphaTest&&tex.a<.38)discard;
     tex.a=1.;
   }
   if(uMineProgress>0.&&(vKind<.5||leaf)&&all(lessThan(abs(floor(vWorld-vNormal*.001)-uMineCell),vec3(.1)))){vec4 crack=texture(uCracks,vec3(fract(vUV),clamp(floor(uMineProgress*10.),0.,9.)));tex.rgb=mix(tex.rgb,crack.rgb,crack.a*.86);}
   float directional=.72+.28*max(dot(vNormal,uSun),0.);
   float ambient=(.12+.88*uDay*vLightAO.x)*vLightAO.y*directional;
   if(uRealm>.5&&uRealm<1.5)ambient=(.30+.13*vLightAO.x)*vLightAO.y*(.84+.16*max(vNormal.y,0.));
   if(uRealm>1.5)ambient=(.50+.36*vLightAO.x)*vLightAO.y*(.82+.18*max(vNormal.y,0.));
   vec3 lit=vec3(ambient);
   if(uRealm<.5){
     float direct=max(dot(vNormal,uSun),0.)*uDay*clamp(vLightAO.x,0.,1.);
     lit*=mix(vec3(.88,.96,1.08),vec3(1.10,1.04,.92),direct);
   }
   for(int i=0;i<16;i++){if(i>=uTorchCount)break;float d=distance(vWorld,uTorches[i].xyz);float l=max(0.,1.-d/9.)*uTorches[i].w;if(uRealm>.5&&uRealm<1.5){vec3 hue=uTorches[i].w<0.?vec3(.64,.34,1.):vec3(1.,.57,.23);lit=max(lit,hue*(max(0.,1.-d/9.)*abs(uTorches[i].w)));}else if(uRealm>1.5){vec3 hue=uTorches[i].w<0.?vec3(.38,.86,1.):vec3(1.,.84,.43);lit=max(lit,hue*(max(0.,1.-d/9.)*abs(uTorches[i].w)));}else lit=max(lit,vec3(1.,.68,.34)*l);}
   float handLight=max(0.,1.-distance(vWorld,uHandTorch.xyz)/9.)*uHandTorch.w;lit=max(lit,vec3(1.,.68,.34)*handLight);
   lit=max(lit,vec3(vEmission));
   if(uRealm>.5&&vKind<-.5&&vEmission>=1.)lit=vec3(1.);
   vec3 color=tex.rgb*vTint*lit;
   // Optional material response. The disabled branch preserves the original
   // color path exactly; water, glass, leaves and emissive surfaces stay outside.
   if(uMaterialDetail>.5&&vKind<.5&&vEmission<.01){
     vec3 props=vKind<-.5?vec3(0.,24.,0.):materialProperties(vLayer,tex.rgb);
     vec3 normal=vNormal;
     float resolved=1.-smoothstep(.055,.22,materialUVFootprint);
     if(props.z>0.&&resolved>0.){
       // A narrow shading bevel follows each tile, not its silhouette. Derivative
       // filtering removes subpixel detail before it can shimmer in the distance.
       vec3 dx=materialWorldDx,dy=materialWorldDy;
       vec2 ux=materialUVDx,uy=materialUVDy;
       float det=ux.x*uy.y-ux.y*uy.x;
       if(abs(det)>.00000001){
         vec3 tangent=(dx*uy.y-dy*ux.y)*sign(det);
         vec3 bitangent=(dy*ux.x-dx*uy.x)*sign(det);
         tangent/=max(length(tangent),.00001);
         bitangent/=max(length(bitangent),.00001);
         vec2 tile=fract(vUV),edge=smoothstep(vec2(.92),vec2(1.),tile)-(vec2(1.)-smoothstep(vec2(0.),vec2(.08),tile));
         normal=normalize(vNormal+(tangent*edge.x+bitangent*edge.y)*props.z*resolved);
       }
     }
     float sunFacing=max(dot(normal,uSun),0.);
     float oldFacing=max(dot(vNormal,uSun),0.);
     float exposure=clamp(uDay*vLightAO.x,0.,1.);
     if(uRealm>.5&&uRealm<1.5)exposure*=.22;
     else if(uRealm>1.5)exposure*=.80;
     float sculpt=(.52+.48*sunFacing)/(.72+.28*oldFacing);
     color*=mix(1.,sculpt,exposure*.88);
     if(props.x>0.){
       vec3 view=uEye-vWorld;view/=max(length(view),.00001);
       vec3 halfVector=view+uSun;halfVector/=max(length(halfVector),.00001);
       float alignment=max(dot(normal,halfVector),0.);
       float broad=pow(alignment,8.),focused=pow(alignment,props.y);
       float specular=(.28*broad+.72*focused)*props.x*sunFacing*exposure*resolved;
       vec3 highlight=mix(vec3(1.,.97,.91),tex.rgb,.38);
       color+=highlight*specular;
     }
   }
   // Rain film belongs only to the opaque terrain pass. Existing skylight
   // and corner AO approximate exposure; this is not a rainfall ray test.
   if(uMaterialDetail>.5&&uRainWetness>.001&&uRealm<.5&&uUnderwater<.5&&vKind>-.5&&vKind<.5&&vEmission<.01&&vNormal.y>.5){
     float film=clamp(uRainWetness,0.,1.)*pow(clamp(vLightAO.x,0.,1.),6.)*clamp(vLightAO.y,0.,1.);
     vec3 view=uEye-vWorld;view/=max(length(view),.00001);
     float grazing=pow(1.-clamp(dot(view,vNormal),0.,1.),4.);
     vec3 roughSky=mix(uFog,vec3(.80,.84,.89)*max(uDay,.05),.22);
     color*=1.-.17*film;
     color=mix(color,roughSky,film*(.045+.24*grazing));
   }
   if(vKind>.5&&vKind<1.5){
     vec3 waterView=normalize(uEye-vWorld);
     if(uWaterFX>.5&&uRealm<.5&&uUnderwater<.5&&vNormal.y>.5){
       vec4 wavePhase=vec4(
         dot(vWorld.xz,vec2( .37, .13)),
         dot(vWorld.xz,vec2(-.21, .43)),
         dot(vWorld.xz,vec2( .84,-.57)),
         dot(vWorld.xz,vec2(-1.47,-.93))
       )+uWaterPhase;
       // Filter unresolved normal detail before it can shimmer.
       vec4 waveFade=vec4(1.)-smoothstep(vec4(.60),vec4(2.40),fwidth(wavePhase));
       vec4 waveSlope=cos(wavePhase)*waveFade*vec4(.18,.11,.055,.022);
       vec2 slope=waveSlope.x*vec2(.37,.13)+waveSlope.y*vec2(-.21,.43)
                 +waveSlope.z*vec2(.84,-.57)+waveSlope.w*vec2(-1.47,-.93);
       vec3 waterNormal=normalize(vec3(-slope.x,1.,-slope.y));
       float fres=pow(1.-clamp(dot(waterNormal,waterView),0.,1.),5.);
       vec3 reflection=reflect(-waterView,waterNormal);
       vec3 skyReflection=waterReflectedSky(reflection);
       // Quiet absorption color lets the animated normal field carry the surface.
       vec3 waterBody=vec3(.028,.23,.31)*max(lit,vec3(.09));
       color=mix(color,waterBody,.74);
       color=mix(color,skyReflection,(.20+.64*fres)*pow(clamp(vLightAO.x,0.,1.),3.));
       float sunUp=smoothstep(-.035,.09,uSun.y)*smoothstep(-.02,.03,reflection.y);
       float sunAlignment=max(dot(reflection,normalize(uSun)),0.);
       float sunAA=max(fwidth(sunAlignment)*1.5,.00008);
       float solarCore=smoothstep(.99960-sunAA,.99994+sunAA,sunAlignment);
       float solarLobe=pow(sunAlignment,96.);
       float sunGlint=(.25*solarLobe+.65*solarCore)*sunUp*pow(clamp(vLightAO.x,0.,1.),8.);
       vec3 sunColor=mix(vec3(1.,.57,.28),vec3(1.,.95,.82),smoothstep(.02,.45,uSun.y));
       color+=sunColor*sunGlint*(.35+.65*fres);
       tex.a=clamp(.66+.21*fres+.035*min(sunGlint,1.),.66,.91);
     }else{
       float fres=pow(1.-abs(dot(waterView,vNormal)),3.);
       color=mix(color,uFog*1.07,.22+fres*.34);
       tex.a=.68+fres*.16;
     }
   }
   if(vKind>1.5&&vKind<2.5)tex.a=clamp(tex.a,.10,.60);
   float d=distance(uEye,vWorld);float fog=smoothstep(uFogRange.x,uFogRange.y,d);
   if(uRealm>.5&&uRealm<1.5&&uFogRange.x<100000.){float low=1.-smoothstep(24.,48.,min(uEye.y,vWorld.y));float haze=1.-exp(-max(0.,d-6.)*(.010+.016*low));fog=max(haze,smoothstep(uFogRange.y*.60,uFogRange.y,d));}
   if(uRealm>1.5&&uFogRange.x<100000.){float low=1.-smoothstep(28.,48.,min(uEye.y,vWorld.y));float haze=(1.-exp(-max(0.,d-10.)*.013))*(.45+.30*low);fog=max(fog,haze);}
   if(uUnderwater>.5){fog=1.-exp(-d*.10);color=mix(color,vec3(.055,.29,.40),fog);}else color=mix(color,uFog,fog);
   outColor=vec4(color,tex.a);
 }`;
 const SKYVS=`#version 300 es
 precision highp float;out vec2 vScreen;
 void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));vScreen=p*2.-1.;gl_Position=vec4(vScreen,1,1);}`;
 const SKYFS=V.WeatherVisuals?V.WeatherVisuals.skyFragment:`#version 300 es
 precision highp float;
 precision highp int;
 in vec2 vScreen;out vec4 outColor;uniform vec3 uForward,uRight,uUp,uEye,uSun;uniform float uTan,uAspect,uDay,uClock,uUnderwater;uniform vec3 uFog;uniform float uRealm;uniform ivec2 uCloudCell,uCloudOctaveCell;uniform vec2 uCloudFraction,uCloudOctaveFraction;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float field(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float cloudField(vec2 local,ivec2 base){vec2 f=fract(local);f=f*f*(3.-2.*f);ivec2 i=base+ivec2(floor(local));return mix(mix(hash(vec2(i)),hash(vec2(i+ivec2(1,0))),f.x),mix(hash(vec2(i+ivec2(0,1))),hash(vec2(i+ivec2(1,1))),f.x),f.y);}
 vec3 starJitter(ivec3 cell){
   uvec3 q=uvec3(cell);
   uint seed=q.x*1597334677u ^ q.y*3812015801u ^ q.z*2798796415u;
   uvec3 h=uvec3(seed)+uvec3(0u,2654435769u,1013904242u);
   h=(h^(h>>16u))*2146121005u;
   h=(h^(h>>15u))*2221713035u;
   h=h^(h>>16u);
   return vec3(h&uvec3(16777215u))*(1./16777216.);
 }
 float starField(vec3 direction){
   vec3 p=direction*24.;ivec3 base=ivec3(floor(p-.5));float light=0.;
   for(int z=0;z<2;z++)for(int y=0;y<2;y++)for(int x=0;x<2;x++){
     ivec3 cell=base+ivec3(x,y,z);
     vec3 delta=vec3(cell)+starJitter(cell)-p;
     float d2=dot(delta,delta);
     light=max(light,1.-smoothstep(.00020,.003025,d2));
   }
   return light;
 }
 void main(){
   vec3 ray=normalize(uForward+uRight*vScreen.x*uTan*uAspect+uUp*vScreen.y*uTan);
   if(uRealm>.5&&uRealm<1.5){float low=1.-smoothstep(-.15,.80,ray.y);vec3 ember=mix(vec3(.035,.014,.025),uFog,pow(low,.70));float haze=field(ray.xz*7.+vec2(uClock*.012,uClock*.004));ember*=.94+.12*haze;if(uUnderwater>.5)ember=mix(ember,vec3(.055,.29,.40),.87);outColor=vec4(ember,1.);return;}
   if(uRealm>1.5){
     float h=clamp(ray.y,0.,1.);vec3 col=mix(vec3(.86,.94,1.),vec3(.34,.65,.94),pow(h,.58));
     float below=1.-smoothstep(-.18,.12,ray.y);vec2 cloudUV=ray.xz/max(.20,abs(ray.y)+.10)*2.1;
     float cloud=field(cloudUV+vec2(uClock*.006,uClock*.002));
     col=mix(col,mix(vec3(.79,.87,.96),vec3(.98,.99,1.),.55+.45*cloud),below*(.72+.20*cloud));
     float sd=max(dot(ray,uSun),0.);float disk=smoothstep(.9987,.9997,sd);
     col+=vec3(1.,.82,.49)*(pow(sd,64.)*.15+disk*.38);
     if(uUnderwater>.5)col=mix(col,vec3(.055,.29,.40),.87);
     outColor=vec4(col,1.);return;
   }
   float h=clamp(ray.y,0.,1.);vec3 top=mix(vec3(.012,.023,.060),vec3(.24,.53,.83),uDay);
   vec3 col=mix(uFog,top,pow(h,.55));float sd=dot(ray,uSun);
   col+=vec3(1.,.77,.46)*pow(max(sd,0.),64.)*.32*uDay;
   vec3 sr=normalize(cross(uSun,vec3(0,0,1))),su=cross(sr,uSun);
   if(sd>0.&&max(abs(dot(ray,sr)),abs(dot(ray,su)))<.032)col=vec3(1.,.96,.78);
   float md=dot(ray,-uSun);if(md>0.&&max(abs(dot(ray,sr)),abs(dot(ray,su)))<.025)col=mix(vec3(.25,.30,.42),vec3(.82,.87,.92),step(.0,dot(ray,sr)+.008));
   float starVisibility=1.-smoothstep(-.18,-.035,uSun.y);float star=0.;if(starVisibility>.001&&ray.y>=.08){star=starField(ray)*starVisibility;}
   col+=star*.8;
   if(ray.y>.035&&uEye.y<100.){float t=(100.-uEye.y)/ray.y;vec2 p=uCloudFraction+ray.xz*t/26.;vec2 grid=floor(p*4.)/4.;float n=cloudField(grid,uCloudCell)*.70+cloudField(grid*.33+uCloudOctaveFraction,uCloudOctaveCell)*.30;float cloud=step(.58,n)*(1.-smoothstep(90.,310.,t));vec3 cc=mix(vec3(.18,.22,.32),vec3(.98,.98,.94),uDay);cc*=.87+.13*step(.60,n);col=mix(col,cc,cloud*.93);}
   if(uUnderwater>.5)col=mix(col,vec3(.055,.29,.40),.87);
   outColor=vec4(col,1.);
 }`;
 const LINEVS=`#version 300 es
 precision highp float;layout(location=0) in vec3 aPosition;uniform mat4 uVP;void main(){gl_Position=uVP*vec4(aPosition,1.);}`;
 const LINEFS=`#version 300 es
 precision highp float;uniform vec4 uColor;out vec4 outColor;void main(){outColor=uColor;}`;
 /* Bounded ground contact shadows; original models and simulation stay separate. */
 const CONTACT_MAX=21,CONTACT_FLOATS=21*16*6*6;
 function buildEntityContactShadows(world,records,camera={}){
  const values=[],eye=Array.isArray(camera)?camera:camera.eye||[0,0,0],visible=camera.visibleChunks,origin=camera.renderOrigin||[0,0,0];
  let candidates=0,drawn=0,quads=0;
  for(const r of (Array.isArray(records)?records:[]).slice(0,CONTACT_MAX)){
   if(!r||![r.x,r.y,r.z,r.yaw,r.rx,r.rz].every(Number.isFinite))continue;candidates++;
   const distance=Math.hypot(r.x-eye[0],r.z-eye[2]);if(distance>=48)continue;
   const rx=Math.max(.20,Math.min(1.10,r.rx)),rz=Math.max(.20,Math.min(1.10,r.rz)),co=Math.cos(r.yaw),si=Math.sin(r.yaw);
   const ex=Math.hypot(rx*co,rz*si),ez=Math.hypot(rx*si,rz*co),farFade=1-Math.max(0,(distance-40)/8);let hit=false;
   for(let z=Math.floor(r.z-ez);z<=Math.floor(r.z+ez);z++)for(let x=Math.floor(r.x-ex);x<=Math.floor(r.x+ex);x++){
    const key=Math.floor(x/16)+','+Math.floor(z/16),chunk=world.chunks?.get(key);
    if(!chunk?.data||(visible&&!visible.has(key)))continue;
    let top=null;
    for(let y=Math.min(95,Math.floor(r.y+.06));y>=Math.max(0,Math.floor(r.y-6));y--){
     const id=world.get(x,y,z);if(!id)continue;const b=V.blocks[id];if(b?.shape==='cross'&&!b.solid)continue;const gap=r.y-(y+1);
     const fullTop=(b?.opaque&&(!b.shape||b.shape==='cube'))||b?.shape==='worktable';
     if(b?.solid&&fullTop&&b.render==='opaque'&&!b.leaf&&gap>=-.08&&gap<=6)top=y+1;
     break;
    }
    if(top===null)continue;
    const gap=Math.max(0,r.y-top),alpha=.26*Math.max(0,1-gap/6)*farFade;if(alpha<=0)continue;
    const x0=Math.max(x,r.x-ex),x1=Math.min(x+1,r.x+ex),z0=Math.max(z,r.z-ez),z1=Math.min(z+1,r.z+ez);if(x1<=x0||z1<=z0)continue;
    const put=(px,pz)=>{const dx=px-r.x,dz=pz-r.z;values.push(px-origin[0],top+.008-origin[1],pz-origin[2],(dx*co+dz*si)/rx,(-dx*si+dz*co)/rz,alpha);};
    put(x0,z0);put(x1,z1);put(x1,z0);put(x0,z0);put(x0,z1);put(x1,z1);quads++;hit=true;
   }
   if(hit)drawn++;
  }
  return{vertices:new Float32Array(values),candidates,drawn,quads};
 }
 V.buildEntityContactShadows=buildEntityContactShadows;
 const CONTACT_VS=`#version 300 es
 precision highp float;
 layout(location=0)in vec3 aPosition;layout(location=1)in vec2 aEllipse;layout(location=2)in float aAlpha;
 uniform mat4 uVP;out vec2 vEllipse;out float vAlpha;out vec3 vWorld;
 void main(){vEllipse=aEllipse;vAlpha=aAlpha;vWorld=aPosition;gl_Position=uVP*vec4(aPosition,1.);}`;
 const CONTACT_FS=`#version 300 es
 precision highp float;
 in vec2 vEllipse;in float vAlpha;in vec3 vWorld;uniform vec3 uEye;uniform vec2 uFogRange;out vec4 outColor;
 void main(){float r=dot(vEllipse,vEllipse);if(r>=1.)discard;float soft=1.-smoothstep(.06,1.,r);float fog=1.-smoothstep(uFogRange.x,uFogRange.y,distance(vWorld,uEye));outColor=vec4(.025,.032,.04,vAlpha*soft*fog);}`;
 const FXAAVS=`#version 300 es
 precision highp float;
 void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
 const FXAAFS=`#version 300 es
 precision highp float;
 uniform sampler2D uColor;uniform vec2 uSize;out vec4 outColor;
 void main(){
  vec2 px=1./uSize,uv=gl_FragCoord.xy*px;vec3 m=texture(uColor,uv).rgb;
  vec3 nw=texture(uColor,uv+vec2(-1.,1.)*px).rgb,ne=texture(uColor,uv+vec2(1.,1.)*px).rgb;
  vec3 sw=texture(uColor,uv+vec2(-1.,-1.)*px).rgb,se=texture(uColor,uv+vec2(1.,-1.)*px).rgb;
  vec3 luma=vec3(.299,.587,.114);float lm=dot(m,luma),lnw=dot(nw,luma),lne=dot(ne,luma),lsw=dot(sw,luma),lse=dot(se,luma);
  float lo=min(lm,min(min(lnw,lne),min(lsw,lse))),hi=max(lm,max(max(lnw,lne),max(lsw,lse)));
  if(hi-lo<max(.0312,hi*.125)){outColor=vec4(m,1.);return;}
  vec2 dir=vec2(-((lnw+lne)-(lsw+lse)),(lnw+lsw)-(lne+lse));float reduce=max((lnw+lne+lsw+lse)*.03125,.0078125);
  dir=clamp(dir/(min(abs(dir.x),abs(dir.y))+reduce),vec2(-8.),vec2(8.))*px;
  vec3 a=.5*(texture(uColor,uv+dir*(-1./6.)).rgb+texture(uColor,uv+dir*(1./6.)).rgb);
  vec3 b=a*.5+.25*(texture(uColor,uv+dir*(-.5)).rgb+texture(uColor,uv+dir*.5).rgb);float lb=dot(b,luma);
  outColor=vec4(lb<lo||lb>hi?a:b,1.);
 }`;

 // Normal waves keep voxel geometry, shore boundaries and physics unchanged.
 const WATER_WAVES=Object.freeze([
   Object.freeze({kx:.37,kz:.13,speed:.72,amplitude:.18}),
   Object.freeze({kx:-.21,kz:.43,speed:-.58,amplitude:.11}),
   Object.freeze({kx:.84,kz:-.57,speed:1.03,amplitude:.055}),
   Object.freeze({kx:-1.47,kz:-.93,speed:-1.41,amplitude:.022})
 ]);
 const WATER_TAU=Math.PI*2;
 const WATER_MAX_SLOPE=WATER_WAVES.reduce((sum,w)=>sum+Math.hypot(w.kx,w.kz)*w.amplitude,0);
 const WATER_ZERO_PHASES=new Float32Array(4);
 function waterWaveParameters(origin,clock,out){
   if(!out)out=new Float32Array(4);
   const x=origin[0],z=origin[2],t=Number.isFinite(clock)?clock:0;
   for(let i=0;i<4;i++){const w=WATER_WAVES[i],phase=w.kx*x+w.kz*z+w.speed*t;out[i]=((phase%WATER_TAU)+WATER_TAU)%WATER_TAU;}
   return out;
 }
 waterWaveParameters.waves=WATER_WAVES;
 waterWaveParameters.maxSlope=WATER_MAX_SLOPE;
 waterWaveParameters.model='analytic-normal-waves';
 V.waterWaveParameters=waterWaveParameters;
 class Renderer {
  constructor(canvas,tex,onFailure){this.canvas=canvas;this.tex=tex;this.onFailure=onFailure;this.scale=1;this.fov=75;this.managedEffects=true;this.gl=canvas.getContext('webgl2',{antialias:false,alpha:false,depth:true,powerPreference:'high-performance',preserveDrawingBuffer:false});if(!this.gl)throw new Error('Trình duyệt chưa tạo được WebGL2. Hãy bật tăng tốc đồ họa trong Chrome/Edge.');this.stats={draws:0,triangles:0,chunks:0,gpuBytes:0};this.chunkLights=new V.ChunkLightPicker();canvas.addEventListener('webglcontextlost',()=>{this.releaseEntityShadows(true);this.releaseRigidCubes(true);this.rain?.destroy(true);});this.init();V.activateTexturePack(this.tex);}
  program(vs,fs){const gl=this.gl,ss=[];for(const[type,source]of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error('Shader: '+e);}ss.push(s);}const p=gl.createProgram();ss.forEach(s=>gl.attachShader(p,s));gl.linkProgram(p);ss.forEach(s=>gl.deleteShader(s));if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Program: '+gl.getProgramInfoLog(p));return {p,u:new Proxy({}, {get:(o,k)=>k in o?o[k]:(o[k]=gl.getUniformLocation(p,k))})};}
  init(){this.rain?.destroy();this.releaseFXAA();this.releaseRigidCubes();const gl=this.gl;this.releaseEntityShadows();this.terrain=this.program(VS,FS);this.sky=this.program(SKYVS,SKYFS);this.line=this.program(LINEVS,LINEFS);this.skyVao=gl.createVertexArray();this.texture=this.uploadTextureArray(this.tex);this.cutoutSampler=gl.createSampler();gl.samplerParameteri(this.cutoutSampler,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.samplerParameteri(this.cutoutSampler,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.samplerParameteri(this.cutoutSampler,gl.TEXTURE_MIN_FILTER,gl.NEAREST_MIPMAP_NEAREST);gl.samplerParameteri(this.cutoutSampler,gl.TEXTURE_MAG_FILTER,gl.NEAREST);this.lineVao=gl.createVertexArray();this.lineVbo=gl.createBuffer();gl.bindVertexArray(this.lineVao);gl.bindBuffer(gl.ARRAY_BUFFER,this.lineVbo);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);gl.bindVertexArray(null);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.frontFace(gl.CCW);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);this.generation=(this.generation||0)+1;this.stats.gpuBytes=0;this.stats.cubeBatchBytes=0;this.cubeBatch=V.createCubeBatch(this,V.blocks);const cracks=V.makeCrackTextures();this.crackTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D_ARRAY,this.crackTexture);gl.texStorage3D(gl.TEXTURE_2D_ARRAY,1,gl.RGBA8,cracks.size,cracks.size,cracks.layers);gl.texSubImage3D(gl.TEXTURE_2D_ARRAY,0,0,0,0,cracks.size,cracks.size,cracks.layers,gl.RGBA,gl.UNSIGNED_BYTE,cracks.data);for(const filter of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D_ARRAY,filter,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.activeTexture(gl.TEXTURE0);this.resize();this.sunShadows?.destroy();this.sunShadows=new V.ScreenSunShadows(this);this.rain=V.RainRenderer?new V.RainRenderer(this):null;}
  drainTextureErrors(){
   const gl=this.gl,errors=[];for(let i=0;i<8;i++){const code=gl.getError();if(code===gl.NO_ERROR)break;errors.push(code);}return errors;
  }
  uploadTextureArray(pack){
   const gl=this.gl;
   if(!pack||!['legacy16','legacy24','native24'].includes(pack.packId)||pack.size!==(pack.packId==='legacy16'?16:24)||!Number.isInteger(pack.layers)||pack.layers<1||!ArrayBuffer.isView(pack.data)||pack.data.BYTES_PER_ELEMENT!==1||pack.data.byteLength!==pack.size*pack.size*pack.layers*4)throw TypeError('Gói chất liệu không hợp lệ.');
   if(gl.isContextLost())throw Error('Chưa thể đổi chất liệu khi WebGL đang khôi phục.');
   if(pack.size>gl.getParameter(gl.MAX_TEXTURE_SIZE)||pack.layers>gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS))throw Error('Gói chất liệu vượt giới hạn GPU.');
   const beforeErrors=this.drainTextureErrors();if(beforeErrors.length)throw Error('WebGL còn lỗi trước khi đổi chất liệu: '+beforeErrors.join(','));
   const active=gl.getParameter(gl.ACTIVE_TEXTURE);gl.activeTexture(gl.TEXTURE0);const previous=gl.getParameter(gl.TEXTURE_BINDING_2D_ARRAY);let texture=null;
   try{
    texture=gl.createTexture();if(!texture)throw Error('Không đủ tài nguyên cho chất liệu.');
    gl.bindTexture(gl.TEXTURE_2D_ARRAY,texture);
    // WebGL2 accepts NPOT texture arrays and the complete24,12,6,3,1 mip chain.
    const levels=1+Math.floor(Math.log2(pack.size));
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY,levels,gl.RGBA8,pack.size,pack.size,pack.layers);
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY,0,0,0,0,pack.size,pack.size,pack.layers,gl.RGBA,gl.UNSIGNED_BYTE,pack.data);
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    // Keep magnified pixel art crisp; blend adjacent mip levels only at distance.
    // The separately bound cutout sampler retains its original nearest mip rule.
    gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_MIN_FILTER,gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_S,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_T,gl.REPEAT);
    const errors=this.drainTextureErrors();if(errors.length||gl.isContextLost())throw Error('Chưa tải được chất liệu lên GPU: '+(errors.join(',')||'context lost'));
    return texture;
   }catch(error){if(texture)gl.deleteTexture(texture);throw error;}
   finally{gl.bindTexture(gl.TEXTURE_2D_ARRAY,previous);gl.activeTexture(active);}
  }
  setTexturePack(next){
   if(typeof V.activateTexturePack!=='function')throw Error('Thiếu bộ chuyển gói chất liệu.');
   if(next===this.tex)return false;
   if(!next||next.layers!==this.tex.layers)throw Error('Gói chất liệu không khớp lớp vật liệu.');
   const fresh=this.uploadTextureArray(next),oldTexture=this.texture,oldPack=this.tex,gl=this.gl;
   try{this.texture=fresh;this.tex=next;V.activateTexturePack(next);}
   catch(error){this.texture=oldTexture;this.tex=oldPack;gl.deleteTexture(fresh);throw error;}
   // Only the two owned terrain/cutout array units can refer to this texture.
   // Preserve every other binding and the caller's active unit across the swap.
   const active=gl.getParameter(gl.ACTIVE_TEXTURE);
   try{for(let unit=0;unit<2;unit++){gl.activeTexture(gl.TEXTURE0+unit);if(gl.getParameter(gl.TEXTURE_BINDING_2D_ARRAY)===oldTexture)gl.bindTexture(gl.TEXTURE_2D_ARRAY,fresh);}}
   finally{gl.activeTexture(active);}
   if(oldTexture)gl.deleteTexture(oldTexture);
   this.texturePackChanges=(this.texturePackChanges||0)+1;return true;
  }
  releaseEntityShadows(lost=false){const a=this.entityShadowGPU;this.entityShadowGPU=null;this.lastEntityShadowVertices=new Float32Array(0);if(a&&!lost){const g=this.gl;if(a.buffer)g.deleteBuffer(a.buffer);if(a.vao)g.deleteVertexArray(a.vao);if(a.program?.p)g.deleteProgram(a.program.p);}}
  inspectEntityShadows(){const a=this.entityShadowGPU,s=this.entityShadowStats||{};return{enabled:s.enabled!==false,candidates:s.candidates||0,drawn:s.drawn||0,quads:s.quads||0,vertices:s.vertices||0,bytes:a?CONTACT_FLOATS*4:0,uploads:s.uploads||0,allocations:s.allocations||0,liveBuffer:!!a?.buffer,liveVAO:!!a?.vao,liveProgram:!!a?.program};}
  drawEntityShadows(world,records,visible,enabled=true){
   const g=this.gl,s=this.entityShadowStats||={uploads:0,allocations:0};s.enabled=enabled;s.candidates=0;s.drawn=0;s.quads=0;s.vertices=0;
   this.lastEntityShadowVertices=new Float32Array(0);if(!enabled||g.isContextLost())return;
   const mesh=buildEntityContactShadows(world,records,{eye:this.eye,renderOrigin:this.renderOrigin,visibleChunks:new Set(visible.map(c=>c.cx+','+c.cz))});
   Object.assign(s,{candidates:mesh.candidates,drawn:mesh.drawn,quads:mesh.quads,vertices:mesh.vertices.length/6});this.lastEntityShadowVertices=mesh.vertices;if(!mesh.vertices.length)return;
   if(mesh.vertices.length>CONTACT_FLOATS)throw Error('Entity shadow batch exceeds bounded capacity.');
   const old={program:g.getParameter(g.CURRENT_PROGRAM),vao:g.getParameter(g.VERTEX_ARRAY_BINDING),array:g.getParameter(g.ARRAY_BUFFER_BINDING),depth:g.isEnabled(g.DEPTH_TEST),blend:g.isEnabled(g.BLEND),cull:g.isEnabled(g.CULL_FACE),mask:g.getParameter(g.DEPTH_WRITEMASK),func:g.getParameter(g.DEPTH_FUNC),srcRGB:g.getParameter(g.BLEND_SRC_RGB),dstRGB:g.getParameter(g.BLEND_DST_RGB),srcA:g.getParameter(g.BLEND_SRC_ALPHA),dstA:g.getParameter(g.BLEND_DST_ALPHA),eqRGB:g.getParameter(g.BLEND_EQUATION_RGB),eqA:g.getParameter(g.BLEND_EQUATION_ALPHA)};
   try{
    if(!this.entityShadowGPU){const a=this.entityShadowGPU={program:null,buffer:null,vao:null};a.program=this.program(CONTACT_VS,CONTACT_FS);a.buffer=g.createBuffer();a.vao=g.createVertexArray();if(!a.buffer||!a.vao)throw Error('Không đủ tài nguyên cho bóng sinh vật.');g.bindVertexArray(a.vao);g.bindBuffer(g.ARRAY_BUFFER,a.buffer);g.bufferData(g.ARRAY_BUFFER,CONTACT_FLOATS*4,g.DYNAMIC_DRAW);for(const[i,n,offset]of[[0,3,0],[1,2,12],[2,1,20]]){g.enableVertexAttribArray(i);g.vertexAttribPointer(i,n,g.FLOAT,false,24,offset);}s.allocations++;}
    const a=this.entityShadowGPU;g.bindVertexArray(a.vao);g.bindBuffer(g.ARRAY_BUFFER,a.buffer);g.bufferSubData(g.ARRAY_BUFFER,0,mesh.vertices);s.uploads++;
    g.useProgram(a.program.p);g.uniformMatrix4fv(a.program.u.uVP,false,this.vp);g.uniform3fv(a.program.u.uEye,this.localEye||this.eye);g.uniform2f(a.program.u.uFogRange,world.radius*16*.48,world.radius*16*.97);
    g.enable(g.DEPTH_TEST);g.depthFunc(g.LEQUAL);g.depthMask(false);g.disable(g.CULL_FACE);g.enable(g.BLEND);g.blendEquationSeparate(g.FUNC_ADD,g.FUNC_ADD);g.blendFuncSeparate(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA,g.ONE,g.ONE_MINUS_SRC_ALPHA);g.drawArrays(g.TRIANGLES,0,mesh.vertices.length/6);this.stats.draws++;this.stats.triangles+=mesh.vertices.length/18;
   }catch(e){this.releaseEntityShadows();throw e;}finally{g.useProgram(old.program);g.bindVertexArray(old.vao);g.bindBuffer(g.ARRAY_BUFFER,old.array);g.depthFunc(old.func);g.depthMask(old.mask);g.blendEquationSeparate(old.eqRGB,old.eqA);g.blendFuncSeparate(old.srcRGB,old.dstRGB,old.srcA,old.dstA);for(const[cap,on]of[[g.DEPTH_TEST,old.depth],[g.BLEND,old.blend],[g.CULL_FACE,old.cull]])on?g.enable(cap):g.disable(cap);}
  }
  resize(){const gl=this.gl;const dpr=Math.min(devicePixelRatio||1,1.5)*this.scale,w=Math.max(2,Math.round(this.canvas.clientWidth*dpr)),h=Math.max(2,Math.round(this.canvas.clientHeight*dpr));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}gl.viewport(0,0,w,h);return [w,h];}
  uploadPart(data,dynamic=false){const gl=this.gl,g={vao:gl.createVertexArray(),vbo:gl.createBuffer(),ibo:gl.createBuffer(),count:data.indices.length,bytes:data.vertices.byteLength+data.indices.byteLength,generation:this.generation};gl.bindVertexArray(g.vao);gl.bindBuffer(gl.ARRAY_BUFFER,g.vbo);gl.bufferData(gl.ARRAY_BUFFER,data.vertices,dynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.ibo);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,data.indices,dynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);let offset=0;for(const [index,size]of [[0,3],[1,2],[2,1],[3,2],[4,3],[5,3]]){gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,size,gl.FLOAT,false,56,offset*4);offset+=size;}gl.bindVertexArray(null);this.stats.gpuBytes+=g.bytes;return g;}
  upload(mesh){return {opaque:this.uploadPart(mesh.opaque),transparent:this.uploadPart(mesh.transparent),minY:mesh.minY,maxY:mesh.maxY,quads:mesh.quads,generation:this.generation};}
  destroyPart(g){if(!g)return;const gl=this.gl;gl.deleteVertexArray(g.vao);gl.deleteBuffer(g.vbo);gl.deleteBuffer(g.ibo);this.stats.gpuBytes=Math.max(0,this.stats.gpuBytes-g.bytes);}
  destroy(g){if(!g)return;this.destroyPart(g.opaque);this.destroyPart(g.transparent);}
  visible(chunk){const origin=this.renderOrigin||[0,0,0],lo=[chunk.cx*16-origin[0],chunk.gpu.minY-origin[1],chunk.cz*16-origin[2]],hi=[lo[0]+16,chunk.gpu.maxY,lo[2]+16];return this.planes.every(p=>p[0]*(p[0]>0?hi[0]:lo[0])+p[1]*(p[1]>0?hi[1]:lo[1])+p[2]*(p[2]>0?hi[2]:lo[2])+p[3]>=0);}
  frame(world,camera,time,clock,options={},cubes=[]){const gl=this.gl;if(gl.isContextLost())return;const inferno=world.dimension==='inferno',skyRealm=world.dimension==='sky';const weather=V.WeatherVisuals?.normalize(options,clock,world.dimension)||{rain:0,cloudCover:0,wind:[0,0],windStrength:0,cloudMode:0,celestialMode:0,cloudVisibility:1,moonPhase:.25,cloudStyle:'classic',celestialStyle:'classic'};this.weatherState=weather;this.realm=inferno?'inferno':skyRealm?'sky':'overworld';this.resize();const {eye,yaw,pitch}=camera;this.renderOrigin=V.RenderOrigin.choose(options.physicalEye||eye);this.waterEnabled=options.waterFX!==false;this.materialEnabled=options.materialDetail!==false;this.terrainVariationEnabled=this.materialEnabled&&this.tex.packId==='native24'&&!inferno&&!skyRealm&&!options.underwater;const localEye=V.RenderOrigin.relative(eye,this.renderOrigin),basis=M.camera(localEye,yaw,pitch),fov=this.fov*Math.PI/180,aspect=this.canvas.width/this.canvas.height,far=(world.radius+2)*16;this.vp=M.multiply(M.perspective(fov,aspect,.055,far+100),basis.view);this.planes=M.planes(this.vp);this.eye=eye;this.localEye=localEye;this.basis=basis;this.stats.draws=0;this.stats.triangles=0;this.stats.chunks=0;this.stats.cubeInstances=0;this.stats.cubeUploadBytes=0;this.stats.oreVisionInstances=0;this.stats.rigidCubeInstances=0;this.stats.rigidUploadBytes=0;const a=(skyRealm?.40:time)*Math.PI*2-Math.PI/2,s0=[Math.cos(a),Math.sin(a),.25],l=Math.hypot(...s0),sun=s0.map(x=>x/l),baseDay=inferno?.62:skyRealm?1:Math.max(.055,Math.min(1,sun[1]*1.7+.35)),day=baseDay*(1-(inferno||skyRealm?0:weather.cloudCover*.22+weather.rain*.15));this.day=day;const dusk=Math.max(0,1-Math.abs(sun[1])/.25)*.45,night=[.028,.044,.09],noon=[.65,.79,.88],fog=noon.map((x,i)=>night[i]+(x-night[i])*day);fog[0]+=dusk*.16;fog[1]-=dusk*.05;if(inferno){fog[0]=.19;fog[1]=.069;fog[2]=.038;}else if(skyRealm){fog[0]=.86;fog[1]=.94;fog[2]=1.;}if(!inferno&&!skyRealm){const weight=weather.rain*.62,tone=[.26,.31,.38];for(let i=0;i<3;i++)fog[i]=fog[i]*(1-weight)+tone[i]*Math.max(.16,baseDay)*weight;}this.fog=fog;this.sunShadows.active=false;this.stats.rtPasses=0;const rtActive=!!options.rtShadows&&!inferno&&this.sunShadows.prepare(world,eye,options.leaves!==false)&&this.sunShadows.begin(this.managedEffects);
   gl.depthMask(true);gl.clearColor(...fog,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.depthMask(true);gl.useProgram(this.terrain.p);const u=this.terrain.u;gl.uniformMatrix4fv(u.uVP,false,this.vp);gl.uniform3fv(u.uEye,localEye);gl.uniform3fv(u.uSun,sun);gl.uniform3fv(u.uFog,fog);gl.uniform2f(u.uFogRange,world.radius*16*.48,world.radius*16*.97);this.waterPhases=waterWaveParameters(this.renderOrigin,clock,this.waterPhases);gl.uniform1f(u.uDay,day);gl.uniform1f(u.uClock,clock);gl.uniform1f(u.uWaterFX,this.waterEnabled?1:0);gl.uniform1f(u.uRainWetness,!inferno&&!skyRealm?weather.rain:0);gl.uniform1f(u.uTerrainVariation,this.terrainVariationEnabled?1:0);gl.uniform2ui(u.uTerrainOrigin,this.renderOrigin[0]>>>0,this.renderOrigin[2]>>>0);gl.uniform1ui(u.uTerrainOriginY,this.renderOrigin[1]>>>0);gl.uniform1f(u.uMaterialDetail,this.materialEnabled?1:0);gl.uniform1f(u.uTextureSize,this.tex.size);gl.uniform4fv(u.uWaterPhase,this.waterPhases);gl.uniform1f(u.uPlantWind,(rtActive&&this.sunShadows.windEnabled)||weather.windStrength>.01?1:0);gl.uniform2fv(u.uWindOriginPhase,V.RenderOrigin.wind(this.renderOrigin));gl.uniform2fv(u.uWeatherWind,weather.wind);gl.uniform1f(u.uWeatherWindStrength,weather.windStrength);gl.uniform1f(u.uUnderwater,options.underwater?1:0);gl.uniform1f(u.uRealm,inferno?1:skyRealm?2:0);gl.uniform1f(u.uDenseLeaves,options.leaves===false?0:1);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D_ARRAY,this.texture);gl.uniform1i(u.uTexture,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D_ARRAY,this.texture);gl.bindSampler(1,this.cutoutSampler);gl.uniform1i(u.uCutout,1);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D_ARRAY,this.crackTexture);gl.uniform1i(u.uCracks,2);this.currentMining=options.target?Math.max(0,Math.min(1,options.mining||0)):0;gl.uniform1f(u.uMineProgress,this.currentMining);if(options.target)gl.uniform3f(u.uMineCell,options.target.x-this.renderOrigin[0],options.target.y-this.renderOrigin[1],options.target.z-this.renderOrigin[2]);gl.activeTexture(gl.TEXTURE0);this.chunkLights||=new V.ChunkLightPicker();const bindLights=ch=>{const lights=this.chunkLights.select(world,ch,options.extraLights||[],options.lightRevision||0,this.renderOrigin);this.currentLights=lights;gl.uniform4fv(u['uTorches[0]'],lights.data);gl.uniform1i(u.uTorchCount,lights.count);};const physicalEye=options.physicalEye||eye,lightWorld=options.handLightPosition||[physicalEye[0],physicalEye[1]-.12,physicalEye[2]],lightEye=V.RenderOrigin.relative(lightWorld,this.renderOrigin);gl.uniform4f(u.uHandTorch,lightEye[0],lightEye[1],lightEye[2],(options.lightHand??options.hand)===19?1:0);this.stats.lightGroups=0;this.sceneHandTorch||=new Float32Array(4);this.sceneHandTorch[0]=lightEye[0];this.sceneHandTorch[1]=lightEye[1];this.sceneHandTorch[2]=lightEye[2];this.sceneHandTorch[3]=(options.lightHand??options.hand)===19?1:0;this.rigidScene={vp:this.vp,eye:localEye,sun,fog,day,clock,fogNear:world.radius*16*.48,fogFar:world.radius*16*.97,underwater:!!options.underwater,realm:inferno?1:skyRealm?2:0,denseLeaves:options.leaves===false?0:1};
   const visible=[];for(const ch of world.chunks.values())if(ch.gpu&&ch.gpu.generation===this.generation&&this.visible(ch)){ch.distance=(ch.cx*16+8-eye[0])**2+(ch.cz*16+8-eye[2])**2;visible.push(ch);}visible.sort((a,b)=>a.distance-b.distance);
   for(const ch of visible){bindLights(ch);gl.uniform3f(u.uOffset,ch.cx*16-this.renderOrigin[0],-this.renderOrigin[1],ch.cz*16-this.renderOrigin[2]);this.drawPart(ch.gpu.opaque);this.stats.chunks++;}
   gl.uniform1f(u.uRainWetness,0);gl.uniform1f(u.uTerrainVariation,0); // Later entities, transparent terrain and held items keep their original sampling and stay dry.
   let contacts=cubes.contactShadows;if(options.playerShadow){this.actorAndPlayerShadows||=[];this.actorAndPlayerShadows.length=0;this.actorAndPlayerShadows.push(...(Array.isArray(contacts)?contacts.slice(0,20):[]),options.playerShadow);contacts=this.actorAndPlayerShadows;}this.drawEntityShadows(world,contacts,visible,options.entityShadows!==false&&this.entityShadowsEnabled!==false);
   if(cubes.length){this.cubeGroups||=new Map();for(const row of this.cubeGroups.values())row.length=0;for(const cube of cubes){if(!cube?.p)continue;const key=Math.floor(cube.p[0]/16)+','+Math.floor(cube.p[2]/16);let group=this.cubeGroups.get(key);if(!group){group=[];this.cubeGroups.set(key,group);}group.push(cube);}gl.uniform3f(u.uOffset,0,0,0);for(const[key,group]of this.cubeGroups){if(!group.length){this.cubeGroups.delete(key);continue;}bindLights(world.chunks.get(key));this.drawCubes(group);this.stats.lightGroups++;}}
   gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.depthMask(false);gl.disable(gl.BLEND);gl.useProgram(this.sky.p);gl.bindVertexArray(this.skyVao);const su=this.sky.u;gl.uniform3fv(su.uForward,basis.f);gl.uniform3fv(su.uRight,basis.r);gl.uniform3fv(su.uUp,basis.u);gl.uniform3fv(su.uEye,localEye);const cloud=V.WeatherVisuals?V.WeatherVisuals.classicCloudCoordinates(this,world,eye,weather,clock):V.RenderOrigin.clouds(eye,clock);gl.uniform2iv(su.uCloudCell,cloud.cell);gl.uniform2fv(su.uCloudFraction,cloud.fraction);gl.uniform2iv(su.uCloudOctaveCell,cloud.octaveCell);gl.uniform2fv(su.uCloudOctaveFraction,cloud.octaveFraction);gl.uniform3fv(su.uSun,sun);gl.uniform3fv(su.uFog,fog);gl.uniform1f(su.uDay,day);gl.uniform1f(su.uClock,clock);gl.uniform1f(su.uUnderwater,options.underwater?1:0);gl.uniform1f(su.uRealm,inferno?1:skyRealm?2:0);gl.uniform1f(su.uTan,Math.tan(fov/2));gl.uniform1f(su.uAspect,aspect);gl.uniform1i(su.uCloudStyle,weather.cloudMode);gl.uniform1i(su.uCelestialStyle,weather.celestialMode);gl.uniform1f(su.uCloudVisibility,weather.cloudVisibility);gl.uniform1f(su.uRain,weather.rain);gl.uniform1f(su.uCloudCover,weather.cloudCover);gl.uniform1f(su.uMoonPhase,weather.moonPhase);if(V.WeatherVisuals){const cloud3=V.WeatherVisuals.cloudCoordinates(eye,weather);gl.uniform2iv(su.uVoxelCloudBase,cloud3.base);gl.uniform3fv(su.uVoxelCloudEye,cloud3.eye);}gl.drawArrays(gl.TRIANGLES,0,3);gl.useProgram(this.terrain.p);gl.enable(gl.CULL_FACE);gl.depthMask(true);
   // Resolve opaque depth before blending transparent water and glass.
   const resolveSun=()=>{this.sunShadows.resolve({vp:this.vp,eye,sun,forward:basis.f,day,fog,fogRange:[world.radius*16*.48,world.radius*16*.97],underwater:!!options.underwater,quality:options.shadowQuality,managedState:this.managedEffects,projection:M.perspective(fov,aspect,.055,far+100),basis});this.stats.rtPasses=1;};if(rtActive&&this.sunShadows.debugMode===0)resolveSun();
   gl.enable(gl.BLEND);gl.depthMask(false);gl.disable(gl.CULL_FACE);for(let i=visible.length-1;i>=0;i--){const ch=visible[i];bindLights(ch);gl.uniform3f(u.uOffset,ch.cx*16-this.renderOrigin[0],-this.renderOrigin[1],ch.cz*16-this.renderOrigin[2]);this.drawPart(ch.gpu.transparent);}gl.depthMask(true);gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);
   gl.uniform1f(u.uPlantWind,0);if(rtActive&&this.sunShadows.debugMode>0)resolveSun();
   if(options.oreVision?.enabled){gl.useProgram(this.terrain.p);gl.uniform1f(u.uMaterialDetail,0);try{options.oreVision.draw(this,world,options.physicalEye||eye,this.managedEffects?{fog:[world.radius*16*.48,world.radius*16*.97],underwater:options.underwater?1:0,mine:this.currentMining}:null);}finally{gl.useProgram(this.terrain.p);gl.uniform1f(u.uMaterialDetail,this.materialEnabled?1:0);}}
   if(options.target)this.outline(options.target,options.mining||0);
   this.rain?.draw(world,{eye,origin:this.renderOrigin,right:basis.r,clock,state:weather,vp:this.vp,day,managed:this.managedEffects,underwater:!!options.underwater});
   if(options.hand!==undefined&&!options.hidden){gl.clear(gl.DEPTH_BUFFER_BIT);gl.useProgram(this.terrain.p);const handVP=M.perspective(65*Math.PI/180,aspect,.05,10);gl.uniformMatrix4fv(u.uVP,false,handVP);gl.uniform3f(u.uOffset,0,0,0);gl.uniform3f(u.uEye,0,0,0);gl.uniform2f(u.uFogRange,100,200);gl.uniform1f(u.uUnderwater,0);gl.uniform1f(u.uDay,Math.max(day,.45));gl.uniform1i(u.uTorchCount,0);gl.uniform4f(u.uHandTorch,0,0,0,0);const sway=Math.sin(options.walk||0)*.018,sw=options.swing||0,id=options.hand<=63?options.hand:0;const hand=V.heldCubes?V.heldCubes(options.hand,{swing:sw,walk:options.walk||0,creative:options.creative,aspect}):id&&V.blocks[id]?[{p:[.53+sway,-.38-sw*.12,-.84+sw*.12],s:[.30,.30,.30],id,yaw:-.42,tint:[1,1,1]}]:[{p:[.48+sway,-.52-sw*.12,-.88],s:[.22,.65,.22],id:20,yaw:-.24,tint:[.87,.64,.45]}];const leafHand=V.blocks[options.hand]?.leaf===true;if(leafHand)gl.disable(gl.CULL_FACE);this.drawCubes(hand,V.RenderOrigin.zero,!(Number.isInteger(options.hand)&&options.hand>0&&V.items?.[options.hand])?handVP:null);if(leafHand)gl.enable(gl.CULL_FACE);}
   this.applyFXAA(options.antiAliasing);
   gl.bindVertexArray(null);
  }
  releaseFXAA(lost=false){const a=this.fxaa;if(!a)return;this.fxaa=null;if(!lost){const gl=this.gl;if(a.texture)gl.deleteTexture(a.texture);if(a.program?.p)gl.deleteProgram(a.program.p);if(a.vao)gl.deleteVertexArray(a.vao);}}
  inspectFXAA(){const a=this.fxaa,s=this.fxaaStats||{};return{mode:this.aaMode||'off',width:a?.width||0,height:a?.height||0,bytes:a?3*a.width*a.height:0,allocations:s.allocations||0,resizes:s.resizes||0,passes:s.passes||0,liveTexture:!!a?.texture,liveProgram:!!a?.program,liveVAO:!!a?.vao};}
  applyFXAA(mode){this.aaMode=mode==='fxaa'?'fxaa':'off';this.stats.aaPasses=0;if(this.aaMode==='off'){this.releaseFXAA();return false;}const gl=this.gl;if(gl.isContextLost())return false;
   const saved={program:gl.getParameter(gl.CURRENT_PROGRAM),vao:gl.getParameter(gl.VERTEX_ARRAY_BINDING),active:gl.getParameter(gl.ACTIVE_TEXTURE),viewport:gl.getParameter(gl.VIEWPORT),draw:gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING),read:gl.getParameter(gl.READ_FRAMEBUFFER_BINDING),depth:gl.isEnabled(gl.DEPTH_TEST),blend:gl.isEnabled(gl.BLEND),cull:gl.isEnabled(gl.CULL_FACE),scissor:gl.isEnabled(gl.SCISSOR_TEST),depthMask:gl.getParameter(gl.DEPTH_WRITEMASK),colorMask:gl.getParameter(gl.COLOR_WRITEMASK)};
   gl.activeTexture(gl.TEXTURE6);saved.texture=gl.getParameter(gl.TEXTURE_BINDING_2D);saved.sampler=gl.getParameter(gl.SAMPLER_BINDING);
   const w=this.canvas.width,h=this.canvas.height;this.fxaaStats||={allocations:0,resizes:0,passes:0};
   try{
    if(!this.fxaa){const a=this.fxaa={texture:null,program:null,vao:null,width:0,height:0};a.program=this.program(FXAAVS,FXAAFS);a.texture=gl.createTexture();a.vao=gl.createVertexArray();if(!a.texture||!a.vao)throw Error('Không đủ tài nguyên cho FXAA.');this.fxaaStats.allocations++;}
    const a=this.fxaa;gl.bindTexture(gl.TEXTURE_2D,a.texture);gl.bindSampler(6,null);
    if(a.width!==w||a.height!==h){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB8,w,h,0,gl.RGB,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);a.width=w;a.height=h;this.fxaaStats.resizes++;}
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER,null);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,null);gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,w,h);
    gl.viewport(0,0,w,h);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.disable(gl.SCISSOR_TEST);gl.depthMask(false);gl.colorMask(true,true,true,true);
    gl.useProgram(a.program.p);gl.bindVertexArray(a.vao);gl.uniform1i(a.program.u.uColor,6);gl.uniform2f(a.program.u.uSize,w,h);gl.drawArrays(gl.TRIANGLES,0,3);this.fxaaStats.passes++;this.stats.aaPasses=1;this.stats.draws++;this.stats.triangles++;return true;
   }catch(e){this.releaseFXAA();throw e;}finally{
    gl.bindTexture(gl.TEXTURE_2D,saved.texture);gl.bindSampler(6,saved.sampler);gl.activeTexture(saved.active);gl.bindFramebuffer(gl.READ_FRAMEBUFFER,saved.read);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,saved.draw);gl.viewport(...saved.viewport);gl.useProgram(saved.program);gl.bindVertexArray(saved.vao);gl.depthMask(saved.depthMask);gl.colorMask(...saved.colorMask);for(const[cap,on]of [[gl.DEPTH_TEST,saved.depth],[gl.BLEND,saved.blend],[gl.CULL_FACE,saved.cull],[gl.SCISSOR_TEST,saved.scissor]])on?gl.enable(cap):gl.disable(cap);
   }
  }
  drawPart(p){if(!p||!p.count)return;const gl=this.gl;gl.bindVertexArray(p.vao);gl.drawElements(gl.TRIANGLES,p.count,gl.UNSIGNED_INT,0);this.stats.draws++;this.stats.triangles+=p.count/3;}
  releaseRigidCubes(lost=false){const batch=this.rigidCubeBatch;this.rigidCubeBatch=null;if(batch)batch.destroy(lost);}
  bindRigidScene(program,viewProjection=null){
   const gl=this.gl,u=program.u,s=this.rigidScene;if(!s)throw Error('Rigid scene requires an initialized frame.');
   gl.useProgram(program.p);gl.uniformMatrix4fv(u.uVP,false,s.vp);gl.uniform3fv(u.uEye,s.eye);gl.uniform3fv(u.uSun,s.sun);gl.uniform3fv(u.uFog,s.fog);gl.uniform2f(u.uFogRange,s.fogNear,s.fogFar);gl.uniform1f(u.uDay,s.day);gl.uniform1f(u.uClock,s.clock);gl.uniform1f(u.uWaterFX,this.waterEnabled?1:0);gl.uniform1f(u.uRainWetness,0);gl.uniform1f(u.uTerrainVariation,0);gl.uniform1f(u.uMaterialDetail,this.materialEnabled?1:0);gl.uniform1f(u.uTextureSize,this.tex.size);gl.uniform4fv(u.uWaterPhase,this.waterPhases||WATER_ZERO_PHASES);gl.uniform1f(u.uUnderwater,s.underwater?1:0);gl.uniform1f(u.uRealm,s.realm);gl.uniform1f(u.uDenseLeaves,s.denseLeaves);gl.uniform1f(u.uMineProgress,0);gl.uniform3f(u.uMineCell,0,0,0);
   const lights=this.currentLights||this.chunkLights.empty;gl.uniform4fv(u['uTorches[0]'],lights.data);gl.uniform1i(u.uTorchCount,lights.count);gl.uniform4fv(u.uHandTorch,this.sceneHandTorch);
   // A camera-space override is supplied only for the first-person empty hand.
   if(viewProjection){gl.uniformMatrix4fv(u.uVP,false,viewProjection);gl.uniform3f(u.uEye,0,0,0);gl.uniform2f(u.uFogRange,100,200);gl.uniform1f(u.uMaterialDetail,0);gl.uniform1f(u.uUnderwater,0);gl.uniform1f(u.uDay,Math.max(s.day,.45));gl.uniform1i(u.uTorchCount,0);gl.uniform4f(u.uHandTorch,0,0,0,0);}
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D_ARRAY,this.texture);gl.bindSampler(0,null);gl.uniform1i(u.uTexture,0);
   gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D_ARRAY,this.texture);gl.bindSampler(1,this.cutoutSampler);gl.uniform1i(u.uCutout,1);
   gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D_ARRAY,this.crackTexture);gl.bindSampler(2,null);gl.uniform1i(u.uCracks,2);gl.activeTexture(gl.TEXTURE0);
  }
  drawCubes(cubes,origin=this.renderOrigin||[0,0,0],viewProjection=null){
   const gl=this.gl,u=this.terrain.u;gl.useProgram(this.terrain.p);gl.uniform1f(u.uMineProgress,0);
   try{
    if(!cubes.some(c=>c?.rigid===true)){const n=this.cubeBatch.draw(cubes,origin);this.stats.cubeInstances+=n;this.stats.cubeUploadBytes+=n*V.CUBE_BATCH_FORMAT.bytesPerInstance;return;}
    const plain=this.legacyCubeRecords||=[],rigid=this.rigidCubeRecords||=[];plain.length=rigid.length=0;for(const c of cubes)(c?.rigid===true?rigid:plain).push(c);
    if(plain.length){const n=this.cubeBatch.draw(plain,origin);this.stats.cubeInstances+=n;this.stats.cubeUploadBytes+=n*V.CUBE_BATCH_FORMAT.bytesPerInstance;}
    if(rigid.length){const batch=this.rigidCubeBatch||=V.createRigidCubeBatch(this,FS,{initialCapacity:128});this.bindRigidScene(batch.program,viewProjection);try{const n=batch.draw(rigid,origin);this.stats.cubeInstances+=n;this.stats.cubeUploadBytes+=n*V.RIGID_CUBE_FORMAT.bytesPerInstance;this.stats.rigidCubeInstances+=n;this.stats.rigidUploadBytes+=n*V.RIGID_CUBE_FORMAT.bytesPerInstance;}finally{if(viewProjection)this.bindRigidScene(batch.program);}}
   }finally{gl.useProgram(this.terrain.p);gl.uniform1f(u.uMineProgress,this.currentMining||0);}
  }
  outline(t,progress){if(V.blocks[t.id]?.shape==='boxes'){const gl=this.gl,vertices=V.blockGeometry.outlineVertices(t.id,[t.x,t.y,t.z],this.renderOrigin||[0,0,0]);gl.useProgram(this.line.p);gl.uniformMatrix4fv(this.line.u.uVP,false,this.vp);gl.uniform4f(this.line.u.uColor,.08+progress*.75,.10+progress*.55,.12,.8);gl.bindVertexArray(this.lineVao);gl.bindBuffer(gl.ARRAY_BUFFER,this.lineVbo);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);gl.enable(gl.BLEND);gl.drawArrays(gl.LINES,0,vertices.length/3);gl.disable(gl.BLEND);return;}const gl=this.gl,eps=.003,def=V.blocks[t.id],lo=def?.shape==='torch'?[11/32,0,11/32]:def?.render==='cross'?[.12,0,.12]:[0,0,0],hi=def?.shape==='torch'?[21/32,15/16,21/32]:def?.render==='cross'?[.88,.86,.88]:[1,1,1],x=t.x-(this.renderOrigin?.[0]||0)+lo[0]-eps,y=t.y-(this.renderOrigin?.[1]||0)+lo[1]-eps,z=t.z-(this.renderOrigin?.[2]||0)+lo[2]-eps,sx=hi[0]-lo[0]+2*eps,sy=hi[1]-lo[1]+2*eps,sz=hi[2]-lo[2]+2*eps,vertices=[];const ps=[[x,y,z],[x+sx,y,z],[x+sx,y+sy,z],[x,y+sy,z],[x,y,z+sz],[x+sx,y,z+sz],[x+sx,y+sy,z+sz],[x,y+sy,z+sz]];for(const[a,b]of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])vertices.push(...ps[a],...ps[b]);gl.useProgram(this.line.p);gl.uniformMatrix4fv(this.line.u.uVP,false,this.vp);gl.uniform4f(this.line.u.uColor,.08+progress*.75,.10+progress*.55,.12,.8);gl.bindVertexArray(this.lineVao);gl.bindBuffer(gl.ARRAY_BUFFER,this.lineVbo);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);gl.enable(gl.BLEND);gl.drawArrays(gl.LINES,0,24);gl.disable(gl.BLEND);}
  inspect(){const gl=this.gl;const ext=gl.getExtension('WEBGL_debug_renderer_info');return {texturePack:{id:this.tex.packId,size:this.tex.size,layers:this.tex.layers,mipLevels:1+Math.floor(Math.log2(this.tex.size)),changes:this.texturePackChanges||0},materialDetail:{enabled:!!this.materialEnabled,model:'named-material-response-v1',extraTextureSamples:0,extraGPUTextures:0,extraPasses:0,geometryDisplacement:false,resolvedLayers:MATERIAL_LAYERS},terrainTopVariation:{enabled:!!this.terrainVariationEnabled,model:'world-cell-quarter-turn-v1',texturePack:'native24',rotationCount:4,toneRange:[.96,1.04],resolvedLayers:TERRAIN_TOP_LAYERS,worldCellPeriod:4294967296,originUint32:[(this.renderOrigin?.[0]||0)>>>0,(this.renderOrigin?.[2]||0)>>>0],sampling:'one selected source-level base sample; explicit rotated gradients',extraGPUTextures:0,extraPasses:0,geometryDisplacement:false,terrainOpaqueTopOnly:true,measuredPerformance:false},oreSurfaceVariation:{enabled:!!this.terrainVariationEnabled,model:'world-cell-face-quarter-turn-v1',texturePack:'native24',rotationCount:4,resolvedLayers:TERRAIN_ORE_LAYERS,originUint32:(this.renderOrigin||[0,0,0]).map(v=>v>>>0),worldCellPeriod:4294967296,sampling:'one selected source-level base sample; explicit rotated gradients',extraGPUTextures:0,extraPasses:0,geometryDisplacement:false,terrainOpaqueOnly:true,measuredPerformance:false},renderOrigin:this.renderOrigin?.slice()||[0,0,0],renderEye:this.localEye?.slice()||null,worldEye:this.eye?.slice()||null,antiAliasing:this.inspectFXAA(),waterFX:{enabled:!!this.waterEnabled,model:'analytic-normal-waves',waveCount:4,maxSlope:WATER_MAX_SLOPE,reflection:'procedural-sky-and-clouds',geometryDisplacement:false,newGPUResources:0,phaseOrigin:'world-xz-modulo-tau',phases:this.waterPhases?Array.from(this.waterPhases):[0,0,0,0]},generation:this.generation,realm:this.realm||'overworld',solarRTAllowed:this.realm!=='inferno',textureFilter:"nearest texels; linear mip blend/nearest magnification; cutout nearest-mip/nearest; anisotropy=1",version:gl.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),size:[this.canvas.width,this.canvas.height],error:gl.getError(),weatherEffects:{state:this.weatherState?{...this.weatherState}:null,cloudVoxelSize:V.WeatherVisuals?.cloudCell||0,maximumCloudCrossings:V.WeatherVisuals?.maxCloudCrossings||0,rain:this.rain?.inspect()||null,wetnessMaterialEffect:{enabled:!!this.materialEnabled&&this.realm==='overworld'&&!this.rigidScene?.underwater&&(this.weatherState?.rain||0)>.001,model:'sky-lit-terrain-top-film-v1',rain:this.weatherState?.rain||0,maxDiffuseDarkening:.17,maxSkyMix:.285,extraTextureSamples:0,extraPasses:0,extraGPUResources:0,terrainOpaquePassOnly:true,exposure:'existing skylight and AO approximation; no rainfall ray test',persistenceAfterRain:false},lightningEffect:false},entityShadows:this.inspectEntityShadows(),cubeBatch:this.cubeBatch?.inspect(),rigidCubeBatch:this.rigidCubeBatch?.inspect()||null,sunShadows:this.sunShadows?.inspect(),chunkLighting:this.chunkLights?{limit:this.chunkLights.limit,...this.chunkLights.stats}:null,...this.stats};}
 }
 V.Renderer=Renderer;
})();
