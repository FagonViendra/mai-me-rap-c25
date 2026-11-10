// C10 SOURCE CANDIDATE: three texture packs; new art isolated from the preserved original generators.
(function () {
'use strict';
/* ORIGINAL C10 ART STUDY — not installed in C9. Pure 24px RGBA, top-left origin.
   Twenty explicit creature motifs. Existing C9 legacy16/native24 pixels stay
   preserved separately; no pack routing, gameplay or item IDs are changed here. */
const C10_EGG_SPEC=Object.freeze([
 [131,'pig','#d99b92','#7c3f53'],[132,'sheep','#dddcc2','#736152'],
 [133,'cow','#d6c4a3','#604539'],[134,'chicken','#e8d4a1','#9b483a'],
 [135,'rabbit','#bd9470','#6e5144'],[136,'walker','#829c71','#384d5d'],
 [137,'villager','#c3a079','#6d4f40'],[138,'wolf','#9ba8ab','#455b68'],
 [139,'fox','#d78b4e','#6b4236'],[140,'horse','#aa7850','#4d3938'],
 [149,'cat','#d2ac75','#655348'],[190,'goat','#d5cfad','#6d644f'],
 [200,'duck','#d7d3a0','#46695e'],[201,'tortoise','#aaa663','#536747'],
 [213,'bear','#af8a61','#51453f'],[214,'hedgehog','#bd9e78','#675348'],
 [221,'boar','#99826c','#4e4644'],[222,'camel','#d5b47e','#806146'],
 [223,'zebra','#d9d6bc','#414d56'],[224,'badger','#a8ae9f','#3c4a51']
].map(([id,type,base,ink])=>Object.freeze({id,type,base,ink})));
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const C10_EGG_CONCEPTS=Object.freeze([Object.freeze({id:null,type:'raccoon',base:'#a79d89',ink:'#414d54'}),Object.freeze({id:null,type:'armadillo',base:'#b79e7b',ink:'#665a51'})]);
function drawC10EggSprite24(item){
 const s=C10_EGG_SPEC.find(x=>x.id===item.id);if(!s||s.type!==item.spawnType)throw Error('Known source-derived spawn egg ID/species required');return renderC10EggSpec(s);
}
function drawC10EggConcept24(type){const s=C10_EGG_CONCEPTS.find(x=>x.type===type);if(!s)throw Error('Unknown unallocated C10 egg concept');return renderC10EggSpec(s);}
function renderC10EggSpec(s){
 const data=new Uint8ClampedArray(24*24*4),base=rgb(s.base),ink=rgb(s.ink),cream=[240,227,188],dark=[43,47,47];
 const shade=(c,n)=>c.map(x=>Math.max(0,Math.min(255,x+n)));
 const put=(x,y,c)=>{if(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<24&&y>=0&&y<24){const i=(y*24+x)*4;data.set([...c,255],i);}};
 const rect=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)put(i,j,c);};
 const line=(x0,y0,x1,y1,c,width=1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));if(!n){rect(x0,y0,width,width,c);return;}for(let k=0;k<=n;k++)rect(Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),width,width,c);};
 const poly=(points,c)=>{for(let y=0;y<24;y++)for(let x=0;x<24;x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y+.5)!==(b[1]>y+.5)&&(x+.5)<(b[0]-a[0])*(y+.5-a[1])/(b[1]-a[1])+a[0])inside=!inside;}if(inside)put(x,y,c);}};
 const eye=(x,y)=>{put(x,y,dark);put(x,y-1,cream);};
 const seam=(y,c=ink)=>{line(6,y,10,y+2,c);line(10,y+2,17,y-1,c);};
 // A faceted shell with a light carved left face and a dark right bevel.
 const silhouette={rabbit:[[8,4],[13,3],[18,8],[19,16],[16,21],[9,22],[5,18],[5,10]],tortoise:[[7,7],[15,5],[20,10],[20,17],[15,21],[8,21],[3,16],[4,11]],bear:[[7,5],[15,4],[20,9],[21,16],[17,21],[8,22],[3,16],[4,9]],camel:[[6,6],[11,4],[17,5],[20,11],[18,19],[14,22],[7,21],[4,15]],hedgehog:[[7,4],[14,4],[20,9],[20,16],[16,21],[8,22],[3,17],[4,10]]}[s.type]||[[8,4],[14,3],[19,8],[20,16],[16,21],[8,22],[4,17],[4,10]];
 poly(silhouette,shade(ink,-13));
 poly(silhouette.map(([x,y])=>[12+(x-12)*.82,13+(y-13)*.86]),base);
 poly([[7,8],[11,5],[12,14],[8,19],[6,16]],shade(base,22));
 poly([[16,7],[18,10],[18,16],[15,20],[14,14]],shade(base,-23));
 line(8,20,15,20,ink);put(9,6,shade(base,42));
 // Species are drawn as separate carved/painted emblems, never generic spots.
 switch(s.type){
 case 'pig':
  poly([[7,8],[8,5],[11,8]],ink);poly([[14,7],[17,5],[17,10]],ink);
  rect(7,9,10,6,shade(base,9));rect(8,12,8,4,[181,106,115]);rect(9,12,6,1,[225,153,149]);
  rect(9,14,2,1,ink);rect(14,14,1,1,ink);eye(8,10);eye(16,10);seam(17);break;
 case 'sheep':
  for(const[x,y]of[[7,8],[10,6],[14,6],[17,8],[7,12],[17,12]]){rect(x-1,y,3,3,cream);put(x,y,shade(base,37));}
  poly([[9,9],[15,9],[16,14],[13,17],[10,16],[8,13]],ink);rect(10,10,4,3,[157,141,116]);eye(10,11);eye(14,11);rect(11,15,3,1,cream);line(7,18,16,18,cream);break;
 case 'cow':
  line(7,9,5,6,cream);line(5,6,7,5,cream);line(16,8,18,5,cream);put(19,5,cream);
  poly([[7,8],[12,7],[17,10],[16,16],[10,17],[7,14]],cream);poly([[7,8],[10,8],[11,11],[8,12]],ink);poly([[14,9],[17,10],[16,13],[13,12]],ink);
  rect(9,14,7,3,[177,136,115]);put(10,15,ink);put(14,15,ink);eye(8,11);eye(15,11);seam(18);break;
 case 'chicken':
  rect(10,5,2,4,[164,65,48]);rect(13,4,2,5,[198,86,49]);poly([[8,9],[14,8],[17,12],[14,16],[8,15]],cream);
  poly([[14,10],[19,12],[15,14]],[216,157,48]);eye(12,10);rect(12,15,2,3,[164,65,48]);
  line(7,17,11,19,ink);line(11,19,16,16,ink);put(6,13,ink);break;
 case 'rabbit':
  poly([[8,10],[7,3],[9,1],[12,9]],ink);poly([[12,9],[14,2],[16,3],[15,11]],ink);
  line(9,4,10,8,[223,172,150]);line(14,4,13,8,[223,172,150]);poly([[8,10],[15,10],[17,14],[13,18],[8,16]],cream);
  eye(9,12);eye(14,12);put(12,15,[175,108,102]);line(7,15,9,16,ink);line(14,16,17,15,ink);put(12,17,ink);break;
 case 'walker':
  poly([[11,6],[17,11],[16,17],[9,19],[6,13]],ink);poly([[11,8],[15,11],[14,16],[9,17],[8,12]],[66,88,77]);
  line(9,11,13,9,[196,184,93]);line(13,9,14,12,[196,184,93]);line(14,12,10,15,[196,184,93]);put(10,16,cream);
  line(7,7,8,6,cream);line(16,18,14,20,shade(base,33));put(6,16,[196,184,93]);break;
 case 'villager':
  poly([[7,8],[11,6],[17,8],[18,11],[6,11]],ink);line(7,9,16,9,[186,142,80]);
  rect(8,11,8,5,shade(base,22));eye(9,12);eye(15,12);rect(11,12,2,5,ink);put(12,14,[186,142,80]);
  poly([[8,17],[11,15],[16,17],[14,20],[10,20]],ink);line(10,18,14,18,cream);break;
 case 'wolf':
  poly([[6,11],[6,4],[11,8],[15,7],[18,3],[18,13]],ink);poly([[8,10],[11,8],[15,9],[16,14],[12,18],[8,15]],shade(base,35));
  line(8,10,10,12,ink);line(15,10,13,12,ink);put(9,11,[214,177,88]);put(14,11,[214,177,88]);
  poly([[10,14],[14,14],[12,17]],ink);line(7,17,9,19,cream);line(15,18,17,16,cream);break;
 case 'fox':
  poly([[5,12],[6,3],[11,8],[16,3],[19,13],[12,19]],ink);poly([[7,7],[10,10],[12,16],[15,10],[17,7],[17,13],[12,18],[7,13]],cream);
  poly([[8,9],[12,8],[16,9],[14,13],[10,13]],base);eye(8,11);eye(15,11);rect(11,15,2,2,ink);
  line(8,19,11,20,shade(base,35));put(15,18,shade(base,35));break;
 case 'horse':
  poly([[10,6],[14,5],[16,9],[15,12],[17,15],[15,18],[9,17],[8,13]],ink);
  poly([[11,8],[14,7],[14,12],[16,15],[14,16],[10,15]],shade(base,33));rect(8,8,2,7,shade(ink,-10));
  line(12,8,12,13,cream);put(14,10,dark);rect(12,15,3,1,ink);line(6,16,6,18,cream);line(6,18,9,19,cream);break;
 case 'cat':
  poly([[6,12],[6,4],[11,8],[14,8],[18,4],[18,13],[14,18],[9,18]],ink);
  poly([[8,8],[11,10],[14,10],[16,8],[16,14],[13,17],[10,16],[8,13]],shade(base,25));
  rect(8,11,2,1,[73,130,111]);rect(14,11,2,1,[73,130,111]);put(12,14,[175,111,101]);
  line(5,13,9,14,cream);line(14,14,19,12,cream);line(6,16,9,15,ink);line(15,15,18,16,ink);break;
 case 'goat':
  line(8,10,6,5,ink);line(6,5,7,2,cream);line(15,9,17,4,ink);line(17,4,16,2,cream);
  poly([[9,8],[14,8],[16,12],[13,17],[10,17],[7,12]],shade(base,35));line(7,10,4,9,ink);line(16,10,19,8,ink);
  rect(8,11,2,1,dark);rect(13,11,2,1,dark);rect(10,15,3,1,ink);poly([[10,17],[14,17],[12,20]],ink);break;
 case 'duck':
  poly([[10,7],[15,7],[17,10],[15,13],[14,17],[8,18],[6,15],[9,12]],[67,110,87]);
  poly([[15,10],[20,11],[19,13],[14,13]],[215,154,51]);eye(13,9);rect(10,13,4,1,cream);
  poly([[8,14],[12,15],[10,17],[7,16]],shade(base,31));line(6,20,10,19,ink);line(12,20,17,19,ink);break;
 case 'armadillo':
  poly([[6,10],[9,7],[15,7],[18,10],[18,16],[15,19],[8,18],[5,15]],ink);
  poly([[8,10],[10,8],[14,8],[16,11],[16,16],[13,18],[8,16]],shade(base,25));
  for(const y of [10,12,14,16]){line(7,y,16,y+1,ink);put(9,y-1,cream);}
  poly([[15,15],[20,14],[19,17],[15,18]],shade(base,18));put(19,15,dark);
  line(16,10,17,5,ink);put(17,5,cream);line(14,9,14,5,ink);line(6,17,4,19,ink);break;
 case 'tortoise':
  poly([[8,8],[15,7],[18,12],[16,17],[10,19],[6,15],[5,11]],ink);
  poly([[10,9],[14,9],[16,12],[14,16],[10,16],[8,12]],shade(base,34));
  line(10,9,10,16,ink);line(14,9,14,16,ink);line(8,12,16,12,ink);line(10,16,12,18,ink);
  rect(17,12,3,3,[125,142,85]);put(19,12,dark);rect(7,18,2,2,ink);put(5,13,cream);break;
 case 'bear':
  rect(5,6,4,4,ink);rect(15,5,4,4,ink);rect(6,7,2,2,[190,155,107]);rect(16,6,2,2,[190,155,107]);
  poly([[8,8],[16,8],[18,13],[15,18],[9,18],[6,14]],ink);poly([[9,12],[15,11],[16,15],[13,18],[9,16]],shade(base,38));
  eye(8,11);eye(16,10);rect(11,13,3,2,dark);line(12,15,12,17,ink);line(7,19,15,20,cream);break;
 case 'hedgehog':
  poly([[4,12],[4,8],[7,8],[7,4],[10,6],[13,3],[15,6],[19,5],[18,9],[21,11],[18,14],[17,18],[10,20],[6,17]],ink);
  for(const[x,y]of[[7,9],[10,7],[13,7],[16,9],[7,13]])line(x,y,x+1,y+3,shade(base,22));
  poly([[11,13],[16,12],[20,15],[15,19],[10,17]],cream);put(19,15,dark);put(15,14,dark);rect(9,19,3,1,ink);break;
 case 'boar':
  poly([[8,7],[14,6],[18,10],[17,16],[13,19],[7,16],[5,11]],ink);line(10,5,13,8,shade(base,40));
  rect(8,10,7,6,base);rect(9,13,8,3,shade(base,27));put(11,14,dark);put(15,14,dark);eye(8,10);eye(15,9);
  poly([[7,14],[6,10],[5,13],[7,18],[9,16]],cream);poly([[16,15],[19,11],[19,16],[16,18]],cream);break;
 case 'camel':
  poly([[6,14],[7,9],[10,8],[12,11],[14,8],[17,9],[17,15],[14,18],[8,18]],ink);
  poly([[7,13],[9,10],[11,13],[14,10],[16,12],[15,16],[8,16]],shade(base,21));
  line(16,11,17,7,ink,2);rect(16,6,4,3,ink);put(18,7,cream);line(8,18,8,20,cream);line(14,18,14,20,cream);put(6,7,shade(base,45));break;
 case 'zebra':
  poly([[8,7],[12,5],[16,7],[17,12],[15,18],[9,18],[6,13]],cream);
  line(9,7,11,10,ink,2);line(14,7,12,11,ink,2);line(7,11,10,13,ink);line(16,11,13,13,ink);
  line(8,14,11,16,ink);line(15,14,13,16,ink);rect(10,17,4,1,ink);eye(8,10);eye(15,10);rect(11,5,2,2,ink);break;
 case 'raccoon':
  rect(6,5,4,4,ink);rect(15,5,4,4,ink);rect(7,6,2,2,cream);rect(16,6,2,2,cream);
  poly([[7,9],[11,7],[16,8],[18,12],[15,17],[10,18],[6,14]],shade(base,29));
  poly([[7,10],[11,11],[14,10],[17,10],[16,14],[12,13],[8,14]],ink);
  put(9,11,cream);put(15,11,cream);poly([[10,14],[14,14],[13,17],[11,17]],cream);put(12,15,dark);
  line(7,18,15,20,ink,2);line(8,18,8,20,cream);line(12,19,12,21,cream);break;
 case 'badger':
  poly([[7,8],[11,6],[16,7],[18,12],[16,16],[12,19],[7,16],[5,12]],ink);
  poly([[10,8],[13,7],[15,11],[14,14],[12,18],[10,14],[8,11]],cream);
  poly([[6,10],[8,9],[10,13],[9,16],[6,14]],shade(base,24));poly([[15,9],[17,10],[17,14],[15,16],[14,13]],shade(base,24));
  put(8,11,cream);put(16,11,cream);rect(11,15,3,2,dark);line(8,19,15,20,cream);break;
 default:throw Error('Explicit motif missing');
 }
 return {size:24,origin:'top-left',data,study:'c10-original-creature-seals-v1',id:s.id,spawnType:s.type};
}
const C10_EGG_API=Object.freeze({specs:C10_EGG_SPEC,concepts:C10_EGG_CONCEPTS,draw:drawC10EggSprite24,drawConcept:drawC10EggConcept24,version:'c10-original-creature-seals-v1'});
if(typeof globalThis!=='undefined')globalThis.VoxelC10EggArt=C10_EGG_API;
if(typeof module!=='undefined')module.exports={C10_EGG_SPEC,C10_EGG_CONCEPTS,drawC10EggSprite24,drawC10EggConcept24,...C10_EGG_API};
})();

/* Voxel GL2 — original procedural pixel materials. No external images or dependencies. */
(() => {
  'use strict';
  const V = globalThis.Voxel ||= {};
  const C25=globalThis.VoxelC25Crafted;
  if(!C25||C25.defs.length!==100||C25.nativeGenerationGrid!==24)throw Error('C25 authored block module must load before catalog');

  const S = 16;
  const C11_MATERIALS=(()=>{
 'use strict';
 const version='c11-riverside-materials-v3';
 const defs=[
  {key:'lime_plaster',name:'Vữa vôi mịn',category:'Tường',color:'#e3dcc5',side:'limePlaster',top:'limePlaster',hardness:2,tool:'pick',minPickTier:1,need:[[86,2],[26,2]],note:'Tường màu vôi ấm, hạt mịn và vết miết nhẹ; dùng làm nền sáng cho gỗ và mái xanh.'},
  {key:'exposed_brick_plaster',name:'Vữa lộ gạch',category:'Tường',color:'#d9cbb0',side:'exposedBrickPlaster',top:'limePlaster',hardness:2.4,tool:'pick',minPickTier:1,need:[[239,2],[11,2]],note:'Mảng vữa sáng xen gạch nung lộ ra ở chân tường. Mặt trên giữ màu vữa để ghép gọn.'},
  {key:'river_terrazzo',name:'Sàn đá mài hạt màu',category:'Sàn',color:'#d8cdb6',side:'terrazzoRiver',top:'terrazzoRiver',hardness:2.8,tool:'pick',minPickTier:1,need:[[63,2],[27,1],[143,1]],note:'Hạt đá góc cạnh màu đất nung, chàm và ngà trong nền đá sáng; lát được liên tiếp.'},
  {key:'terracotta_herringbone',name:'Gạch nung xương cá',category:'Sàn',color:'#b56b4c',side:'terracottaCourse',top:'terracottaHerringbone',hardness:2.5,tool:'pick',minPickTier:1,need:[[11,4]],note:'Mặt sàn ghép gạch xương cá, cạnh khối là gạch xây ngang. Họa tiết nối theo lưới khối.'},
  {key:'cherry_louvers',name:'Ốp gỗ chớp',category:'Gỗ',color:'#9f6451',side:'cherryLouvers',top:'cherryJoinery',hardness:1.5,tool:'axe',minPickTier:0,need:[[53,4]],note:'Nan gỗ anh đào ngang có viền khung và rãnh tối. Đây là khối ốp kín, không mở như cửa.'},
  {key:'linen_timber_screen',name:'Vách vải khung gỗ',category:'Vách',color:'#d8c9a8',side:'linenFrame',top:'birchFrameTop',hardness:1,tool:'axe',minPickTier:0,need:[[45,2],[20,2]],note:'Vải ngà dệt mịn trong ba ô dọc bằng gỗ sáng. Vách đặc để ngăn phòng và làm quầy.'},
  {key:'decorative_ironbound_crate',name:'Thùng gỗ đai sắt trang trí',category:'Trang trí',color:'#9b784b',side:'ironBandCrate',top:'ironBandCrateTop',hardness:1.6,tool:'axe',minPickTier:0,need:[[8,4],[110,1]],note:'Mặt gỗ có giằng chéo và hai đai sắt. Thùng dùng trang trí bến hàng, không chứa vật phẩm.'},
  {key:'indigo_reed_mat',name:'Chiếu đan viền chàm',category:'Sàn',color:'#baa46d',side:'reedMatEdge',top:'indigoReedMat',hardness:.7,tool:null,minPickTier:0,need:[[121,4],[56,1]],note:'Nan chiếu màu rơm ghép dọc trong viền chàm; cạnh khối giữ thớ đan để lát sàn hoặc làm bục.'},
  {key:'jade_barrel_roof',name:'Ngói ống men xanh',category:'Mái',color:'#628e84',side:'jadeBarrelRoof',top:'jadeBarrelRoof',hardness:2.5,tool:'pick',minPickTier:1,need:[[11,4],[58,1]],note:'Các dải sáng tối gợi ngói ống men xanh trên khối vuông; ghép thành mái bậc hoặc mái bằng.'},
  {key:'iron_diamond_tread',name:'Tấm sắt gân chéo',category:'Xưởng',color:'#697981',side:'ironTread',top:'ironTread',hardness:3.4,tool:'pick',minPickTier:2,need:[[203,1],[3,3]],note:'Gân sắt ngắn đan chéo, tương phản rõ trên sàn xưởng. Bề mặt là họa tiết tĩnh của khối đầy.'}
 ].map((d,i)=>Object.freeze({...d,id:239+i,solid:true,opaque:true,render:'opaque',shape:'cube',station:'crafting',outCount:4,
  faceKeys:Object.freeze([d.side,d.side,d.top,d.top,d.side,d.side]),need:Object.freeze(d.need.map(r=>Object.freeze(r.slice())))}));
 const tileKeys=Object.freeze([...new Set(defs.flatMap(d=>d.faceKeys))]);
 const clamp=n=>Math.max(0,Math.min(255,Math.round(n))),rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const tone=(c,n)=>c.map(v=>clamp(v+n)),mix=(a,b,t)=>a.map((v,i)=>clamp(v*(1-t)+b[i]*t));
 const mod=(v,n)=>((v%n)+n)%n;
 function noise(x,y,k){let z=Math.imul(x+29,374761393)^Math.imul(y+41,668265263)^Math.imul(k,1274126177);z=Math.imul(z^(z>>>13),1274126177);return ((z^(z>>>16))>>>0)/4294967295;}
 const periodicDist=(a,b)=>Math.min(Math.abs(a-b),1-Math.abs(a-b));
 function plaster(x,y,n){
  const u=(x+.5)/n,v=(y+.5)/n;
  const slow=Math.sin(u*Math.PI*2)*Math.sin(v*Math.PI*2)*2.5+Math.cos((u+v)*Math.PI*4)*1.2;
  let c=tone(rgb('#e3dcc5'),slow+(noise(x,y,11)-.5)*5);
  if(noise(x,y,12)>.972)c=tone(c,-9);
  return c;
 }
 function brick(x,y,n){
  const h=n/4,w=n/2,row=Math.floor(y/h),xx=mod(x+(row%2)*w/2,n),lx=xx%w,ly=y%h;
  if(ly===0||lx===0)return rgb('#d0b29a');
  const seed=Math.floor(xx/w)+row*3;
  let c=tone(rgb('#b56b4c'),[0,9,-8,3,-4,7][seed%6]+(noise(x,y,21)-.5)*5);
  if(ly===1)c=tone(c,15);if(ly===h-1)c=tone(c,-15);if(lx===1)c=tone(c,4);
  return c;
 }
 function exposed(x,y,n){
  const u=(x+.5)/n,v=(y+.5)/n;
  const d=Math.hypot(periodicDist(u,.16)/.43,periodicDist(v,.79)/.29);
  const edge=.92+.07*Math.sin(u*6*Math.PI)+.055*Math.cos(v*8*Math.PI);
  if(d<edge)return brick(x,y,n);
  if(d<edge+.10)return rgb('#bba98c');
  return plaster(x,y,n);
 }
 const chips=[
  [.12,.14,.068,.044,'#a46449',.4],[.39,.13,.038,.060,'#5b727a',-.5],[.69,.17,.090,.047,'#eee6ce',.2],[.90,.10,.035,.038,'#8c8e77',.6],
  [.23,.38,.050,.074,'#eee8d3',-.3],[.51,.35,.065,.043,'#677b80',.7],[.84,.40,.056,.068,'#b17653',-.5],
  [.08,.63,.061,.038,'#7d8071',.5],[.35,.67,.079,.048,'#b77e60',-.6],[.65,.60,.039,.068,'#f2e8cb',.3],[.95,.68,.060,.052,'#57727b',.5],
  [.18,.90,.037,.043,'#607881',-.4],[.52,.88,.075,.043,'#e9e2ca',.5],[.80,.89,.054,.049,'#ae6b4c',-.5]
 ];
 function terrazzo(x,y,n){
  const u=(x+.5)/n,v=(y+.5)/n;let c=tone(rgb('#d8cdb6'),(noise(x,y,31)-.5)*5);
  for(const [cx,cy,rx,ry,h,slant]of chips){let dx=u-cx,dy=v-cy;dx-=Math.round(dx);dy-=Math.round(dy);const ax=(dx+dy*slant)/rx,ay=dy/ry;
   if(Math.abs(ax)<1&&Math.abs(ay)<1&&Math.abs(ax)+Math.abs(ay)<1.65)return tone(rgb(h),ax+ay<-.7?8:0);
  }return c;
 }
 function herringbone(x,y,n){
  const s=n/8,gx=Math.floor(x/s),gy=Math.floor(y/s),sum=(gx+gy)%4,horizontal=sum<2;
  const bx=horizontal?gx-(sum===1?1:0):gx,by=horizontal?gy:gy-(sum===3?1:0);
  const lx=x-bx*s,ly=y-by*s,w=horizontal?s*2:s,h=horizontal?s:s*2;
  if(lx===0||ly===0)return rgb('#d1b197');
  let c=tone(rgb(horizontal?'#b96e4e':'#aa6044'),((mod(bx+by*3,7)-3)*3)+(noise(x,y,41)-.5)*4);
  if(ly===1)c=tone(c,13);if(lx===w-1||ly===h-1)c=tone(c,-12);return c;
 }
 function wood(x,y,n,light=false){
  const base=rgb(light?'#bfaa7d':'#9f6451');
  const grain=Math.sin((x/n*3+Math.sin(y/n*Math.PI*2)*.06)*Math.PI*2)*4;
  return tone(base,grain+(noise(x,y,51)-.5)*5);
 }
 function joinery(x,y,n,light=false){
  const rim=Math.max(1,n/12),d=Math.min(x,y,n-1-x,n-1-y),base=wood(x,y,n,light);
  if(d===0)return rgb(light?'#78633e':'#603f35');
  if(d<rim)return tone(base,17);
  if(x===n/2||y===n/2)return tone(base,-22);
  return base;
 }
 function louvers(x,y,n){
  const r=Math.max(1,n/12),d=Math.min(x,y,n-1-x,n-1-y);
  if(d<r)return joinery(x,y,n,false);
  const step=n/4,ly=(y-r)%step;
  if(ly<1)return rgb('#553d35');
  if(ly<2)return rgb('#d19778');
  return tone(wood(x,y,n),ly>=step-1?-21:2);
 }
 function linen(x,y,n){
  const rim=Math.floor(n/12),border=rim+1,inner=n-2*border,outer=Math.ceil((inner-4)/3),bar1=border+outer,bar2=n-border-outer-2,d=Math.min(x,y,n-1-x,n-1-y);
  if(d<rim||x===bar1||x===bar2)return tone(rgb('#85633e'),(x+y)%3*3);
  if(d<rim+1||x===bar1+1||x===bar2+1)return rgb('#c1a678');
  // Broad three vertical fabric panels distinguish it from a cross-braced crate.
  return tone(rgb('#e7dec5'),((x%2)===(y%2)?3:-3)+(noise(x,y,61)-.5)*2);
 }
 function crate(x,y,n,top=false){
  const rim=n/12,d=Math.min(x,y,n-1-x,n-1-y),plank=n/4;
  let c=wood(x,top?y:x,n,true);
  const seam=top?y%plank:x%plank;
  if(seam===0)c=rgb('#74583a');else if(seam===1)c=tone(c,9);
  const band1=Math.round(n/6),band2=n-1-band1;
  if(Math.abs(x-band1)<rim||Math.abs(x-band2)<rim){
   if((y===Math.round(n/6)||y===n-1-Math.round(n/6))&&(x===band1||x===band2))return rgb('#c4ccca');
   return tone(rgb('#56636a'),x===band1||x===band2?13:-8);
  }
  if(!top&&d>=rim&&Math.min(Math.abs(x-y),Math.abs(x+y-(n-1)))<rim)return tone(rgb('#b9955e'),x+y<n?7:-7);
  if(d===0)return rgb('#654b32');if(d<rim)return rgb('#c2a16b');return c;
 }
 function reed(x,y,n,edge=false){
  const step=n/8,p=(edge?y:x)%step;let c=tone(rgb('#baa46d'),p===0?-24:p===1?13:1);
  if((edge?x:y)%Math.max(2,n/4)===0)c=tone(c,-10);
  return tone(c,(noise(x,y,71)-.5)*4);
 }
 function mat(x,y,n){
  const r=n/8,d=Math.min(x,y,n-1-x,n-1-y);
  if(d<r){const border=rgb('#38566b');return tone(border,(x+y)%2?3:-3);}
  if(d===r)return rgb('#d6c08c');
  return reed(x,y,n,false);
 }
 function roof(x,y,n){
  const w=n/4,lx=x%w,ly=y%(n/2);
  if(lx===0)return rgb('#2d514d');
  const t=lx/(w-1);let c=mix(rgb('#3c6863'),rgb('#98b9a3'),Math.max(0,Math.sin(t*Math.PI))*.72);
  if(lx===1)c=tone(c,12);if(ly===0)c=rgb('#31534f');else if(ly===1)c=tone(c,18);else if(ly===n/2-1)c=tone(c,-11);
  return tone(c,(noise(x,y,81)-.5)*3);
 }
 function tread(x,y,n){
  const u=(x+.5)/n,v=(y+.5)/n,c=rgb('#697981');
  const centers=[[.25,.25,1],[.75,.25,-1],[.25,.75,-1],[.75,.75,1]];
  for(const [cx,cy,dir]of centers){const dx=u-cx,dy=v-cy,a=(dx+dir*dy)/Math.SQRT2,b=(dy-dir*dx)/Math.SQRT2;
   if(Math.abs(a)<.18&&Math.abs(b)<.055&&Math.abs(a)/.18+Math.abs(b)/.055<1.75)return b<-.005?rgb('#bdc8c9'):b>.018?rgb('#354d59'):rgb('#94a6ac');
  }
  return tone(c,(noise(x,y,91)-.5)*5);
 }
 const samples={limePlaster:plaster,exposedBrickPlaster:exposed,terrazzoRiver:terrazzo,terracottaHerringbone:herringbone,terracottaCourse:brick,cherryLouvers:louvers,cherryJoinery:(x,y,n)=>joinery(x,y,n,false),linenFrame:linen,birchFrameTop:(x,y,n)=>joinery(x,y,n,true),ironBandCrate:(x,y,n)=>crate(x,y,n,false),ironBandCrateTop:(x,y,n)=>crate(x,y,n,true),indigoReedMat:mat,reedMatEdge:(x,y,n)=>reed(x,y,n,true),jadeBarrelRoof:roof,ironTread:tread};
 function makeTile(key,size=24){
  if(size!==16&&size!==24)throw new RangeError('Only actual16/24 pixel packs are supported');
  if(!tileKeys.includes(key)||!samples[key])throw new RangeError('Unknown C11 tile: '+key);
  const data=new Uint8ClampedArray(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const c=samples[key](x,y,size),p=(x+y*size)*4;data[p]=c[0];data[p+1]=c[1];data[p+2]=c[2];data[p+3]=255;}
  return {key,size,data,origin:'top-left',version};
 }
 function definition(key){const d=defs.find(d=>d.key===key);if(!d)throw new RangeError('Unknown C11 block');return d;}
 function faces(key,size=24){return definition(key).faceKeys.map(k=>makeTile(k,size));}
 return Object.freeze({version,defs:Object.freeze(defs),tileKeys,makeTile,faces,definition});
  })();
  const C11_MATERIAL_KEYS=new Set(C11_MATERIALS.defs.map(d=>d.key));
  // C10 original materials; previous150 layers retain their exact indices.
  const C10_MATERIALS=(()=>{
  'use strict';
  const VERSION = 'c10-material-study-v2';
  const defs = [
    { key:'terracotta_openwork', name:'Gạch gốm ô rỗng', category:'Gốm',
      note:'Bốn ô thoáng hình thoi, thành gốm dày. Nhìn xuyên các lỗ; va chạm vẫn là một khối đầy.',
      tool:'pick', minPickTier:1, hardness:2.5, solid:true, opaque:false, render:'cutout',
      faceKeys:['terracottaOpenwork','terracottaOpenwork','terracottaOpenwork','terracottaOpenwork','terracottaOpenwork','terracottaOpenwork'],
      need:[[11,4]], outCount:4, ingredientNames:['Gạch nung ×4'],
      palette:['#b76b4c','#e3a06b','#643c32','#efbd86'] },
    { key:'oak_endgrain_floor', name:'Sàn sồi đầu thớ', category:'Gỗ',
      note:'Mặt trên ghép bốn đầu thớ lệch tâm, cạnh ghép mộng ngắn. Dùng làm sàn hoặc ốp.',
      tool:'axe', minPickTier:0, hardness:1.5, solid:true, opaque:true, render:'opaque',
      faceKeys:['oakEndgrainSide','oakEndgrainSide','oakEndgrainTop','oakEndgrainTop','oakEndgrainSide','oakEndgrainSide'],
      need:[[5,4]], outCount:4, ingredientNames:['Thân sồi ×4'],
      palette:['#c79b59','#644123','#ecd3a3','#825d36'] },
    { key:'gold_rim_quartz', name:'Thạch anh viền vàng', category:'Đá',
      note:'Lõi thạch anh ngà rộng, đường viền vàng mảnh và bốn góc nhấn. Không có công thức tách ngược.',
      tool:'pick', minPickTier:1, hardness:2.6, solid:true, opaque:true, render:'opaque',
      faceKeys:['goldRimQuartz','goldRimQuartz','goldRimQuartz','goldRimQuartz','goldRimQuartz','goldRimQuartz'],
      need:[[164,4],[114,1]], outCount:4, ingredientNames:['Khối thạch anh ×4','Thỏi vàng ×1'],
      palette:['#e8e2d5','#d4a640','#9f7b32','#fff1c9'] },
    { key:'warning_stripe_wool', name:'Len sọc cảnh báo', category:'Len',
      note:'Sọc chéo vàng và đen có thớ dệt; nối liền trên mặt phẳng. Đây là dấu thị giác tĩnh.',
      tool:null, minPickTier:0, hardness:0.8, solid:true, opaque:true, render:'opaque',
      faceKeys:['warningStripeWool','warningStripeWool','warningStripeWool','warningStripeWool','warningStripeWool','warningStripeWool'],
      need:[[57,2],[62,2]], outCount:4, ingredientNames:['Len vàng ×2','Len đen ×2'],
      palette:['#e0b62f','#3c454d','#f4d469','#69604a'] }
  ].map(d => Object.freeze({...d, id:null, station:'crafting', outCount:4,
    need:Object.freeze(d.need.map(n=>Object.freeze(n.slice()))),
    faceKeys:Object.freeze(d.faceKeys.slice()), palette:Object.freeze(d.palette.slice()),
    ingredientNames:Object.freeze(d.ingredientNames.slice())}));
  const tileKeys = Object.freeze([...new Set(defs.flatMap(d=>d.faceKeys))]);
  const clamp = x=>Math.max(0,Math.min(255,Math.round(x)));
  const rgb = hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const shade = (c,n)=>[clamp(c[0]+n),clamp(c[1]+n),clamp(c[2]+n)];
  const mix=(a,b,t)=>a.map((v,i)=>clamp(v*(1-t)+b[i]*t));
  function noise(x,y,salt) {
    // Integer-only hash, independent of drawing order and random global state.
    let n=Math.imul(x+13,374761393)^Math.imul(y+7,668265263)^Math.imul(salt,1274126177);
    n=Math.imul(n^(n>>>13),1274126177); return ((n^(n>>>16))>>>0)/4294967295;
  }
  function validSize(size){if(size!==16&&size!==24)throw new RangeError('Supported packs: Legacy16 and Native24 only');}
  function makeTile(key,size=24) {
    validSize(size);
    if(!tileKeys.includes(key))throw new RangeError('Unknown C10 tile: '+key);
    const data=new Uint8ClampedArray(size*size*4);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const p=(x+y*size)*4, uv=[(x+.5)/size,(y+.5)/size];
      const sample = key==='terracottaOpenwork'?terracotta(x,y,size,uv):
        key==='oakEndgrainTop'?oakTop(x,y,size,uv):
        key==='oakEndgrainSide'?oakSide(x,y,size,uv):
        key==='goldRimQuartz'?quartz(x,y,size,uv):wool(x,y,size,uv);
      data[p]=sample[0];data[p+1]=sample[1];data[p+2]=sample[2];data[p+3]=sample.length===4?sample[3]:255;
    }
    return {key,size,origin:'top-left',data,version:VERSION};
  }
  function terracotta(x,y,n,uv){
    const body=rgb('#b76b4c'),edge=rgb('#e3a06b'),recess=rgb('#643c32');
    const cell=n/2, lx=(x%cell+.5)-cell/2,ly=(y%cell+.5)-cell/2;
    // A softened diamond: diagonal corners are visibly larger than an iron grid.
    const d=Math.max(Math.abs(lx),Math.abs(ly))*.38+(Math.abs(lx)+Math.abs(ly))*.62;
    const hole=cell*.285, bevel=Math.max(1,n/24);
    if(d<hole)return [...recess,0]; // Color remains defined below alpha for mip filtering.
    const border=Math.min(x,y,n-1-x,n-1-y);
    if(border===0)return shade(recess,13+(x+y)%2*3);
    if(d<hole+bevel)return ly<0||lx<0?shade(edge,3):shade(recess,6);
    if(d<hole+bevel*2)return ly<0?shade(body,20):shade(body,-12);
    let c=shade(body,(noise(x,y,31)-.5)*13);
    if(border===1)c=shade(edge,-13);
    // Narrow raised interlocking cross, continuous between the four openings.
    if(x===cell-1||y===cell-1)c=shade(body,13);
    if(x===cell||y===cell)c=shade(body,-13);
    return c;
  }
  function oakTop(x,y,n,uv){
    const cell=n/2, ix=Math.floor(x/cell),iy=Math.floor(y/cell),q=ix+iy*2;
    const centers=[[.43,.57],[.57,.39],[.35,.42],[.60,.60]];
    const cx=centers[q][0]*cell,cy=centers[q][1]*cell;
    const lx=x%cell+.5,ly=y%cell+.5;
    const [dx,dy]=[(lx-cx)*(q===2?1.12:1),(ly-cy)*(q===1?1.12:1)];
    const a=Math.atan2(dy,dx),r=Math.hypot(dx,dy);
    const phase=r/(n/8)+(Math.sin(a*3+q)*.055)+q*.07;
    const f=phase-Math.floor(phase);
    const tone=[0,-10,9,-3][q];
    let c=shade(rgb('#c79b59'),tone+(noise(x,y,43)-.5)*8);
    if(f<.24)c=shade(rgb('#825d36'),tone+12);
    else if(f<.34)c=shade(rgb('#cfae75'),tone);
    if(r<n*.055)c=shade(rgb('#644123'),16+tone);
    // Each quadrant is a separate end-grain block; no concentric log-bark border.
    if(x%cell===0||y%cell===0)c=rgb('#825d36');
    else if(x%cell===1||y%cell===1)c=shade(rgb('#ecd3a3'),-35+tone);
    if((q===0&&dx>0&&dy>0&&Math.abs(dx-dy)<.35&&r>cell*.35)||
       (q===3&&dx<0&&Math.abs(dy+dx*.5)<.3&&r>cell*.3))c=shade(rgb('#644123'),8);
    return c;
  }
  function oakSide(x,y,n,uv){
    const rows=n/4, row=Math.floor(y/rows),joint=row%2?n*.68:n*.32;
    const base=shade(rgb('#c79b59'),[-12,2,-4,9][row]+(noise(x,y,59)-.5)*8);
    if(y%rows===0)return rgb('#825d36');
    if(y%rows===1)return shade(rgb('#ecd3a3'),-35);
    if(Math.abs(x-joint)<.55)return rgb('#825d36');
    if(Math.abs(x-joint-1)<.55)return shade(rgb('#ecd3a3'),-29);
    if((x+row*3)%Math.max(4,Math.round(n/3))===0&&y%rows===rows-2)return shade(base,-19);
    return base;
  }
  function quartz(x,y,n,uv){
    const d=Math.min(x,y,n-1-x,n-1-y),rim=n===24?2:1;
    const ivory=rgb('#e8e2d5'),gold=rgb('#d4a640'),goldShade=rgb('#9f7b32');
    if(d===0)return shade(ivory,-22);
    const nearCorner=(x<rim+3||x>=n-rim-3)&&(y<rim+3||y>=n-rim-3);
    if(d===rim)return (x+y<n)?shade(gold,8):shade(goldShade,9);
    if(nearCorner&&d>=rim&&d<=rim+2){
      return d===rim+2?rgb('#fff1c9'):(x+y<n?gold:goldShade);
    }
    if(d===rim+1)return shade(ivory,6);
    // Broad calm center, occasional faint mineral vein rather than noisy marble.
    const u=uv[0],v=uv[1],vein=Math.abs(v-(.35+.13*Math.sin(u*5.3)));
    let c=shade(ivory,(noise(x,y,83)-.5)*3+(x+y<n?3:-1));
    if(vein<.027&&u>.25&&u<.82)c=mix(c,[195,188,174],.18);
    return c;
  }
  function wool(x,y,n,uv){
    const period=n/2, band=((x+y)%period)<period/2;
    let c=rgb(band?'#e0b62f':'#3c454d');
    // Woven thread rhythm is subordinate to the broad, readable diagonal sign.
    const warp=(x%2===0),weft=(y%2===0);
    if(warp!==weft)c=shade(c,band?8:5);
    else if(warp&&weft)c=shade(c,band?-8:-3);
    if((x+3*y)%n===Math.floor(n/3))c=shade(c,band?5:3);
    return c;
  }
  function definition(key){const d=defs.find(d=>d.key===key);if(!d)throw new RangeError('Unknown C10 block: '+key);return d;}
  function faces(key,size=24){return definition(key).faceKeys.map(k=>makeTile(k,size));}
  function proposedRegistration(key,id,layerIds){
    // Explicit adapter data only: it never modifies an existing Voxel namespace.
    if(!Number.isSafeInteger(id)||id<=0)throw new TypeError('A separately verified unoccupied ID is required');
    const d=definition(key);
    const tiles=d.faceKeys.map(k=>{
      const v=layerIds?.[k];if(!Number.isSafeInteger(v)||v<0)throw new TypeError('Missing allocated layer: '+k);return v;
    });
    return {block:{id,key:d.key,name:d.name,color:d.palette[0],solid:d.solid,opaque:d.opaque,render:d.render,
        hardness:d.hardness,tool:d.tool,drop:id,tiles,emissive:0,breakable:true,shape:'cube',
        ...(d.minPickTier?{minPickTier:d.minPickTier}:{})},
      recipe:{id:'c10_'+key,station:'crafting',need:d.need.map(x=>x.slice()),out:[id,d.outCount]},
      status:'UNREGISTERED_ADAPTER_DATA_ID_OCCUPANCY_MUST_BE_VERIFIED'};
  }
  return Object.freeze({version:VERSION,defs:Object.freeze(defs),tileKeys,makeTile,faces,definition,proposedRegistration});
  })();
  const C10_MATERIAL_KEYS=new Set(C10_MATERIALS.defs.map(d=>d.key));
  const tileNames = ['grassTop','grassSide','dirt','stone','sand','oakBark','oakEnd','oakLeaves','water','planks','cobble','glass','brick','snow','bedrock','coalOre','ironOre','goldOre','diamondOre','tableTop','tableSide','torch','wool','basalt','flower','tallgrass','spruceBark','spruceEnd','spruceLeaves','clay','gravel','glowstone','obsidian','cactusSide','cactusTop','pinkWool','furnaceSide','furnaceTop','furnaceFront','darkPlanks','stoneBricks','bookshelf','oakSapling','spruceSapling','heldWood','heldFlame','farmlandTop','farmlandSide','wheatSprout','wheatYoung','wheatTall','wheatMature','birchBark','birchEnd','birchLeaves','birchPlanks','birchSapling','acaciaBark','acaciaEnd','acaciaLeaves','acaciaPlanks','acaciaSapling','cherryBark','cherryEnd','cherryLeaves','cherryPlanks','cherrySapling','redWool','blueWool','yellowWool','greenWool','purpleWool','orangeWool','cyanWool','blackWool','smoothStone','polishedBasalt','chiseledStone','terracottaTiles','emberRock','emberBricks','lava','glowCrystal','riftFrame','rift','skyStone','skyGrass','cloudGlass','sunCrystal','skyAnchor','skyPortal','oakParquet','sprucePanel','birchWeave','acaciaMosaic','cherryPanel','sandstoneDiversity','sandstoneBricks','limestoneDiversity','limestoneTiles','slateTiles','mossyCobbleDiversity','pinkGranite','ceramicIvory','ceramicRed','ceramicOchre','ceramicGreen','ceramicBlue','ceramicBlack','rivetedIron','checkerStone','copperPlate','cutCopper','patinaCopper','engravedCopper','quartz','quartzBricks','quartzPillar','quartzEnd','amethyst','amethystMosaic','prismLamp','prismCap','copperLamp','copperCap','amberGlass','indigoGlass','mossyStoneBricks','packedEarth','firedEarthBricks','workshopFrame','coalBlock','ironBlock','goldBlock','copperOre','diamondBlock','quartzOre','basaltBricks','carvedSandstone','cobblePaving','ironFramedGlass','timberEarth','wovenDiamond','blueIvoryMosaic','ironLattice','amberIndigoGlass','wheatBale','wheatBaleEnd','copperInlayBasalt','fishscaleSlate',"terracottaOpenwork","oakEndgrainSide","oakEndgrainTop","goldRimQuartz","warningStripeWool","limePlaster","exposedBrickPlaster","terrazzoRiver","terracottaCourse","terracottaHerringbone","cherryLouvers","cherryJoinery","linenFrame","birchFrameTop","ironBandCrate","ironBandCrateTop","reedMatEdge","indigoReedMat","jadeBarrelRoof","ironTread"];
  for(const key of C25.tileKeys){if(tileNames.includes(key))throw Error('C25 duplicate texture key '+key);tileNames.push(key);}
  const T = Object.fromEntries(tileNames.map((n,i)=>[n,i]));
  V.textureLayers=T;
  const face = (side,top=side,bottom=side)=>[T[side],T[side],T[top],T[bottom],T[side],T[side]];
  const defs = [
    [0,'air','Không khí','#000000','stone',false,false,'opaque',0,null,0],
    [1,'grass','Khối cỏ','#6e9941','grassSide',true,true,'opaque',0.7,'shovel',2,'grassTop','dirt'],
    [2,'dirt','Đất','#896247','dirt',true,true,'opaque',0.6,'shovel',2],
    [3,'stone','Đá','#858b91','stone',true,true,'opaque',2.6,'pick',9],
    [4,'sand','Cát','#dccc92','sand',true,true,'opaque',0.6,'shovel',4],
    [5,'oak_log','Thân sồi','#8d6a3f','oakBark',true,true,'opaque',2,'axe',5,'oakEnd'],
    [6,'oak_leaves','Lá sồi','#517b34','oakLeaves',true,false,'cutout',0.25,null,6],
    [7,'water','Nước','#4c91b9','water',false,false,'water',0,null,0],
    [8,'planks','Ván gỗ','#b48b52','planks',true,true,'opaque',1.5,'axe',8],
    [9,'cobblestone','Đá cuội','#7d8589','cobble',true,true,'opaque',2.8,'pick',9],
    [10,'glass','Kính','#b9e0e9','glass',true,false,'glass',0.4,null,10],
    [11,'brick','Gạch nung','#aa6555','brick',true,true,'opaque',2.5,'pick',11],
    [12,'snow','Tuyết','#e8f2f0','snow',true,true,'opaque',0.4,'shovel',12],
    [13,'bedrock','Đá nền','#42484e','bedrock',true,true,'opaque',1e9,null,0],
    [14,'coal_ore','Quặng than','#737a80','coalOre',true,true,'opaque',3,'pick',109],
    [15,'iron_ore','Quặng sắt','#9d8b7e','ironOre',true,true,'opaque',3.2,'pick',111],
    [16,'gold_ore','Quặng vàng','#b5a063','goldOre',true,true,'opaque',3.6,'pick',113],
    [17,'diamond_ore','Quặng kim cương','#68b9b5','diamondOre',true,true,'opaque',4.2,'pick',112],
    [18,'crafting_table','Bàn chế tạo','#a47b49','tableSide',true,true,'opaque',1.8,'axe',18,'tableTop','planks'],
    [19,'torch','Đuốc','#f6b84c','torch',false,false,'cutout',0.1,null,19],
    [20,'white_wool','Len trắng','#e4e2d9','wool',true,true,'opaque',0.8,null,20],
    [21,'basalt','Đá bazan','#4e535b','basalt',true,true,'opaque',3.2,'pick',21],
    [22,'flower','Hoa đồng','#e7bd4a','flower',false,false,'cross',0.1,null,22],
    [23,'tall_grass','Cỏ cao','#70a24c','tallgrass',false,false,'cross',0.1,null,23],
    [24,'spruce_log','Thân vân sam','#69513b','spruceBark',true,true,'opaque',2.1,'axe',24,'spruceEnd'],
    [25,'spruce_leaves','Lá vân sam','#3d6350','spruceLeaves',true,false,'cutout',0.25,null,25],
    [26,'clay','Đất sét','#9fa7aa','clay',true,true,'opaque',0.7,'shovel',26],
    [27,'gravel','Sỏi','#8d8c82','gravel',true,true,'opaque',0.8,'shovel',27],
    [28,'glowstone','Đá phát sáng','#e6bf66','glowstone',true,true,'opaque',0.5,null,28],
    [29,'obsidian','Hắc diện thạch','#343044','obsidian',true,true,'opaque',9,'pick',29],
    [30,'cactus','Xương rồng','#658b3d','cactusSide',true,true,'opaque',0.8,null,30,'cactusTop','cactusTop'],
    [31,'pink_wool','Len hồng','#dca4a5','pinkWool',true,true,'opaque',0.8,null,31],
    [32,'furnace','Lò nung','#73797d','furnaceSide',true,true,'opaque',3.5,'pick',32,'furnaceTop','furnaceTop'],
    [33,'dark_planks','Ván gỗ vân sam','#755a3c','darkPlanks',true,true,'opaque',1.5,'axe',33],
    [34,'stone_bricks','Gạch đá','#8b9295','stoneBricks',true,true,'opaque',2.8,'pick',34],
    [35,'bookshelf','Kệ sách','#ad814b','bookshelf',true,true,'opaque',1.5,'axe',35,'planks','planks'],
    [36,'oak_sapling','Cây sồi non','#629747','oakSapling',false,false,'cross',0.1,null,36],
    [37,'spruce_sapling','Cây vân sam non','#497b5c','spruceSapling',false,false,'cross',0.1,null,37],
    [38,'farmland','Đất canh tác','#785233','farmlandSide',true,true,'opaque',0.6,'shovel',2,'farmlandTop','dirt'],
    [39,'wheat_0','Mầm lúa mì','#6e9c45','wheatSprout',false,false,'cross',0.1,null,120],
    [40,'wheat_1','Lúa mì non','#7da34b','wheatYoung',false,false,'cross',0.1,null,120],
    [41,'wheat_2','Lúa mì đang trổ','#a9aa54','wheatTall',false,false,'cross',0.1,null,120],
    [42,'wheat_3','Lúa mì chín','#d4ad55','wheatMature',false,false,'cross',0.1,null,121],
    [43,'birch_log','Thân bạch dương','#d9d8bd','birchBark',true,true,'opaque',2,'axe',43,'birchEnd'],
    [44,'birch_leaves','Lá bạch dương','#88a448','birchLeaves',true,false,'cutout',0.25,null,44],
    [45,'birch_planks','Ván gỗ bạch dương','#cbb985','birchPlanks',true,true,'opaque',1.5,'axe',45],
    [46,'birch_sapling','Cây bạch dương non','#8ca94c','birchSapling',false,false,'cross',0.1,null,46],
    [47,'acacia_log','Thân keo','#625c4e','acaciaBark',true,true,'opaque',2,'axe',47,'acaciaEnd'],
    [48,'acacia_leaves','Lá keo','#748a43','acaciaLeaves',true,false,'cutout',0.25,null,48],
    [49,'acacia_planks','Ván gỗ keo','#b76b3d','acaciaPlanks',true,true,'opaque',1.5,'axe',49],
    [50,'acacia_sapling','Cây keo non','#839548','acaciaSapling',false,false,'cross',0.1,null,50],
    [51,'cherry_log','Thân anh đào','#68464a','cherryBark',true,true,'opaque',2,'axe',51,'cherryEnd'],
    [52,'cherry_leaves','Tán anh đào','#dc91a5','cherryLeaves',true,false,'cutout',0.25,null,52],
    [53,'cherry_planks','Ván gỗ anh đào','#d49996','cherryPlanks',true,true,'opaque',1.5,'axe',53],
    [54,'cherry_sapling','Cây anh đào non','#e8a6b5','cherrySapling',false,false,'cross',0.1,null,54],
    [55,"red_wool","Len đỏ","#a93a37","redWool",true,true,"opaque",0.8,null,55],
    [56,"blue_wool","Len xanh dương","#3f5ba7","blueWool",true,true,"opaque",0.8,null,56],
    [57,"yellow_wool","Len vàng","#dcb539","yellowWool",true,true,"opaque",0.8,null,57],
    [58,"green_wool","Len xanh lá","#4a8442","greenWool",true,true,"opaque",0.8,null,58],
    [59,"purple_wool","Len tím","#81499e","purpleWool",true,true,"opaque",0.8,null,59],
    [60,"orange_wool","Len cam","#dc7e30","orangeWool",true,true,"opaque",0.8,null,60],
    [61,"cyan_wool","Len xanh ngọc","#3fa2ae","cyanWool",true,true,"opaque",0.8,null,61],
    [62,"black_wool","Len đen","#2f3139","blackWool",true,true,"opaque",0.8,null,62],
    [63,"smooth_stone","Đá nhẵn","#979da0","smoothStone",true,true,"opaque",2.6,"pick",63],
    [64,"polished_basalt","Bazan đánh bóng","#40464f","polishedBasalt",true,true,"opaque",3.2,"pick",64],
    [65,"chiseled_stone","Đá chạm khắc","#929795","chiseledStone",true,true,"opaque",2.8,"pick",65],
    [66,"terracotta_tiles","Gạch gốm hoa văn","#b26745","terracottaTiles",true,true,"opaque",2.5,"pick",66],
    [67,"ember_rock","Đá tàn hỏa","#4d2d31","emberRock",true,true,"opaque",3.4,"pick",67],
    [68,"ember_bricks","Gạch tàn hỏa","#492b31","emberBricks",true,true,"opaque",3.2,"pick",68],
    [69,"lava","Dung nham","#ff981e","lava",false,true,"opaque",1000000000.0,null,0],
    [70,"glow_crystal","Tinh thể hỏa quang","#f4a630","glowCrystal",true,true,"opaque",3.8,"pick",70],
    [71,"rift_frame","Neo chuyển giới","#392b49","riftFrame",true,true,"opaque",6,"pick",71],
    [72,"rift","Màn chuyển giới","#9b51d1","rift",false,false,"glass",1000000000.0,null,0],
    [73,"sky_stone","Đá thiên giới","#e1eae6","skyStone",true,true,"opaque",2.6,"pick",73],
    [74,"sky_grass","Cỏ thiên giới","#a0ccb4","skyStone",true,true,"opaque",0.8,"shovel",74,"skyGrass","skyStone"],
    [75,"cloud_glass","Pha lê mây","#c7edf0","cloudGlass",true,false,"glass",1.1,"pick",75],
    [76,"sun_crystal","Tinh thể nhật quang","#efd897","sunCrystal",true,true,"opaque",3.2,"pick",76],
    [77,"sky_anchor","Neo thiên giới","#e6d8b2","skyAnchor",true,true,"opaque",6,"pick",77],
    [78,"sky_portal","Màn thiên giới","#bfe9ed","skyPortal",false,false,"glass",1000000000.0,null,0],
    [79,"oak_parquet","Sàn sồi ghép","#bd8a4d","oakParquet",true,true,"opaque",1.5,"axe",79],
    [80,"spruce_panel","Ốp vân sam","#7d5b3a","sprucePanel",true,true,"opaque",1.5,"axe",80],
    [81,"birch_weave","Gỗ đan bạch dương","#d6c08d","birchWeave",true,true,"opaque",1.5,"axe",81],
    [82,"acacia_mosaic","Gỗ keo ghép vuông","#ba6536","acaciaMosaic",true,true,"opaque",1.5,"axe",82],
    [83,"cherry_panel","Ốp gỗ anh đào","#d2978c","cherryPanel",true,true,"opaque",1.5,"axe",83],
    [84,"sandstone","Đá cát","#dec08b","sandstoneDiversity",true,true,"opaque",2.0,"pick",84],
    [85,"sandstone_bricks","Gạch đá cát","#e6cc9b","sandstoneBricks",true,true,"opaque",2.3,"pick",85],
    [86,"limestone","Đá vôi","#dce1cd","limestoneDiversity",true,true,"opaque",2.4,"pick",86],
    [87,"limestone_tiles","Lát đá vôi","#dce4cd","limestoneTiles",true,true,"opaque",2.5,"pick",87],
    [88,"slate_tiles","Ngói đá phiến","#485b6c","slateTiles",true,true,"opaque",2.8,"pick",88],
    [89,"mossy_cobble","Đá cuội phủ rêu","#87907d","mossyCobbleDiversity",true,true,"opaque",2.7,"pick",89],
    [90,"pink_granite","Đá hoa cương hồng","#be9282","pinkGranite",true,true,"opaque",2.8,"pick",90],
    [91,"ceramic_ivory","Lát gốm ngà","#e9ddc0","ceramicIvory",true,true,"opaque",2.4,"pick",91],
    [92,"ceramic_red","Lát gốm đỏ","#bc5741","ceramicRed",true,true,"opaque",2.4,"pick",92],
    [93,"ceramic_ochre","Lát gốm vàng","#d8a23d","ceramicOchre",true,true,"opaque",2.4,"pick",93],
    [94,"ceramic_green","Lát gốm xanh lá","#428b67","ceramicGreen",true,true,"opaque",2.4,"pick",94],
    [95,"ceramic_blue","Lát gốm xanh ngọc","#3d89ab","ceramicBlue",true,true,"opaque",2.4,"pick",95],
    [96,"ceramic_black","Lát gốm đen","#3f4552","ceramicBlack",true,true,"opaque",2.4,"pick",96],
    [97,"riveted_iron","Tấm sắt tán đinh","#91a3a5","rivetedIron",true,true,"opaque",4.0,"pick",97],
    [98,"checker_stone","Lát đá bàn cờ","#a4ad9b","checkerStone",true,true,"opaque",2.6,"pick",98],
    // R8I: stable sparse IDs; existing blocks/items and texture layers never move.
    [160,'copper_block','Khối đồng','#bf7953','copperPlate',true,true,'opaque',3,'pick',160],
    [161,'cut_copper','Đồng ghép tấm','#c9875d','cutCopper',true,true,'opaque',3,'pick',161],
    [162,'patina_copper','Đồng phủ xanh','#559d87','patinaCopper',true,true,'opaque',3,'pick',162],
    [163,'engraved_copper','Đồng khắc sóng','#c38351','engravedCopper',true,true,'opaque',3,'pick',163],
    [164,'quartz_block','Khối thạch anh','#e9e1d4','quartz',true,true,'opaque',2.4,'pick',164],
    [165,'quartz_bricks','Gạch thạch anh','#e6decd','quartzBricks',true,true,'opaque',2.6,'pick',165],
    [166,'quartz_pillar','Cột thạch anh','#e7e0ce','quartzPillar',true,true,'opaque',2.6,'pick',166,'quartzEnd'],
    [167,'amethyst_block','Khối tinh thạch tím','#9273c6','amethyst',true,true,'opaque',2.8,'pick',167],
    [168,'amethyst_mosaic','Khảm sao tím','#9c8ad4','amethystMosaic',true,true,'opaque',2.8,'pick',168],
    [169,'prism_lantern','Đèn lăng kính','#b9e4dc','prismLamp',true,true,'opaque',1.5,'pick',169,'prismCap'],
    [170,'copper_lantern','Đèn đồng','#e0a565','copperLamp',true,true,'opaque',1.5,'pick',170,'copperCap'],
    [171,'amber_glass','Kính hổ phách','#dba554','amberGlass',true,false,'glass',.5,null,171],
    [172,'indigo_glass','Kính chàm','#858fc8','indigoGlass',true,false,'glass',.5,null,172],
    [173,'mossy_stone_bricks','Gạch đá rêu','#859679','mossyStoneBricks',true,true,'opaque',2.7,'pick',173],
    [174,'packed_earth','Đất nện','#aa8260','packedEarth',true,true,'opaque',.9,'shovel',174],
    [175,'fired_earth_bricks','Gạch đất nện nung','#c58c65','firedEarthBricks',true,true,'opaque',2.2,'pick',175],
    [186,'wall_torch_east','Đuốc gắn tường · Đông','#f6b84c','torch',false,false,'cutout',.1,null,19],
    [187,'wall_torch_west','Đuốc gắn tường · Tây','#f6b84c','torch',false,false,'cutout',.1,null,19],
    [188,'wall_torch_south','Đuốc gắn tường · Nam','#f6b84c','torch',false,false,'cutout',.1,null,19],
    [189,'wall_torch_north','Đuốc gắn tường · Bắc','#f6b84c','torch',false,false,'cutout',.1,null,19],
    // C8 mineral storage and naturally generated ores. IDs208/209 remain unallocated.
    [202,'coal_block','Khối than','#343a3f','coalBlock',true,true,'opaque',5,'pick',202],
    [203,'iron_block','Khối sắt','#aabcc5','ironBlock',true,true,'opaque',5,'pick',203],
    [204,'gold_block','Khối vàng','#dba430','goldBlock',true,true,'opaque',3,'pick',204],
    [205,'copper_ore','Quặng đồng','#a87150','copperOre',true,true,'opaque',3,'pick',205],
    [206,'diamond_block','Khối kim cương','#47c7cf','diamondBlock',true,true,'opaque',5,'pick',206],
    [207,'quartz_ore','Quặng thạch anh','#d7ded4','quartzOre',true,true,'opaque',3,'pick',143],
    [215,'basalt_bricks','Gạch bazan','#46515b','basaltBricks',true,true,'opaque',3.2,'pick',215],
    [216,'carved_sandstone','Đá cát khắc','#d4bb8c','carvedSandstone',true,true,'opaque',2.3,'pick',216],
    [217,'cobble_paving','Đá cuội lát','#8d9693','cobblePaving',true,true,'opaque',2.8,'pick',217],
    [218,'iron_framed_glass','Kính khung sắt','#9ecad2','ironFramedGlass',true,false,'glass',1.5,'pick',218],
    [225,"timber_earth","Vách gỗ trát đất","#9d774d","timberEarth",true,true,"opaque",1.8,"axe",225],
    [226,"woven_diamond","Len dệt hình thoi","#7e91b4","wovenDiamond",true,true,"opaque",0.8,null,226],
    [227,"blue_ivory_mosaic","Khảm gốm lam ngà","#9ebcc2","blueIvoryMosaic",true,true,"opaque",2.4,"pick",227],
    [228,"iron_lattice","Khối lưới sắt","#9fb3bf","ironLattice",true,false,"cutout",3,"pick",228],
    [229,"amber_indigo_glass","Kính khảm hai màu","#b6a2a4","amberIndigoGlass",true,false,"glass",1.2,"pick",229],
    [230,"wheat_bale","Kiện lúa mì","#d4ad55","wheatBale",true,true,"opaque",0.6,null,230,"wheatBaleEnd","wheatBaleEnd"],
    [231,"copper_inlay_basalt","Bazan khảm đồng","#6d6358","copperInlayBasalt",true,true,"opaque",3.2,"pick",231],
    [232,"fishscale_slate","Ngói đá vảy cá","#59758b","fishscaleSlate",true,true,"opaque",2.8,"pick",232],
    [233,"terracotta_openwork","Gạch gốm ô rỗng","#b76b4c","terracottaOpenwork",true,false,"cutout",2.5,"pick",233,"terracottaOpenwork","terracottaOpenwork"],
    [234,"oak_endgrain_floor","Sàn sồi đầu thớ","#c79b59","oakEndgrainSide",true,true,"opaque",1.5,"axe",234,"oakEndgrainTop","oakEndgrainTop"],
    [235,"gold_rim_quartz","Thạch anh viền vàng","#e8e2d5","goldRimQuartz",true,true,"opaque",2.6,"pick",235,"goldRimQuartz","goldRimQuartz"],
    [236,"warning_stripe_wool","Len sọc cảnh báo","#e0b62f","warningStripeWool",true,true,"opaque",0.8,null,236,"warningStripeWool","warningStripeWool"],
    [239,"lime_plaster","Vữa vôi mịn","#e3dcc5","limePlaster",true,true,"opaque",2,"pick",239,"limePlaster","limePlaster"],
    [240,"exposed_brick_plaster","Vữa lộ gạch","#d9cbb0","exposedBrickPlaster",true,true,"opaque",2.4,"pick",240,"limePlaster","limePlaster"],
    [241,"river_terrazzo","Sàn đá mài hạt màu","#d8cdb6","terrazzoRiver",true,true,"opaque",2.8,"pick",241,"terrazzoRiver","terrazzoRiver"],
    [242,"terracotta_herringbone","Gạch nung xương cá","#b56b4c","terracottaCourse",true,true,"opaque",2.5,"pick",242,"terracottaHerringbone","terracottaHerringbone"],
    [243,"cherry_louvers","Ốp gỗ chớp","#9f6451","cherryLouvers",true,true,"opaque",1.5,"axe",243,"cherryJoinery","cherryJoinery"],
    [244,"linen_timber_screen","Vách vải khung gỗ","#d8c9a8","linenFrame",true,true,"opaque",1,"axe",244,"birchFrameTop","birchFrameTop"],
    [245,"decorative_ironbound_crate","Thùng gỗ đai sắt trang trí","#9b784b","ironBandCrate",true,true,"opaque",1.6,"axe",245,"ironBandCrateTop","ironBandCrateTop"],
    [246,"indigo_reed_mat","Chiếu đan viền chàm","#baa46d","reedMatEdge",true,true,"opaque",0.7,null,246,"indigoReedMat","indigoReedMat"],
    [247,"jade_barrel_roof","Ngói ống men xanh","#628e84","jadeBarrelRoof",true,true,"opaque",2.5,"pick",247,"jadeBarrelRoof","jadeBarrelRoof"],
    [248,"iron_diamond_tread","Tấm sắt gân chéo","#697981","ironTread",true,true,"opaque",3.4,"pick",248,"ironTread","ironTread"],
  ];
  V.blocks=defs.reduce((blocks,d)=>{
    const [id,key,name,color,side,solid,opaque,render,hardness,tool,drop,top,bottom]=d;
    const tiles=face(side,top||side,bottom||top||side);
    if(id===32)tiles[4]=T.furnaceFront;
    blocks[id]={id,key,name,color,solid,opaque,render,hardness,tool,drop,tiles,emissive:id===28?0.85:id===19?1:0,breakable:id!==0&&id!==7&&id!==13,shape:id===19?'torch':render==='cross'?'cross':'cube'};
    return blocks;
  },[]);
  // Closed table parts preserve the full-height top and side-torch contact.
  // Rails end at the four legs, avoiding overlapping exterior faces.
  Object.assign(V.blocks[18],{
    shape:'worktable',opaque:false,tableFrameTile:T.workshopFrame,
    tiles:face('workshopFrame','tableTop','workshopFrame'),
    tableBoxes:[
      [0,13,0,16,16,16],
      [0,0,0,3,13,3],[13,0,0,16,13,3],
      [0,0,13,3,13,16],[13,0,13,16,13,16],
      [3,11,0,13,13,2],[3,11,14,13,13,16],
      [0,11,3,2,13,13],[14,11,3,16,13,13],
      [3,2,0,13,4,2],[3,2,14,13,4,16],
      [0,2,3,2,4,13],[14,2,3,16,4,13]
    ]
  });
  // World-only directional forms. Inventory, crafting, held art and drops remain item19.
  // These plain arrays survive the mesher worker's JSON catalog serialization.
  for(const [id,dx,dz] of [[186,1,0],[187,-1,0],[188,0,1],[189,0,-1]]){
    const outward=-.34+.79*.35;
    Object.assign(V.blocks[id],{shape:'torch',emissive:1,pointLight:true,creativeHidden:true,worldOnly:true,inventoryId:19,wallTorchFacing:[dx,dz],supportOffset:[-dx,0,-dz],pointLightOffset:[.5+dx*outward,.06+.79*Math.sqrt(1-.35*.35),.5+dz*outward]});
  }
  for(const id of [160,161,162,163,164,165,166,167,168,169,170,173,175])V.blocks[id].minPickTier=1;
  for(const [id,tier]of [[202,1],[203,2],[204,3],[205,2],[206,3],[207,2]])V.blocks[id].minPickTier=tier;
  for(const id of [215,216,217,218])V.blocks[id].minPickTier=1;
  for(const id of [227,228,229,231,232])V.blocks[id].minPickTier=1;
  for(const id of [233,235])V.blocks[id].minPickTier=1;
  for(const id of [239,240,241,242,247])V.blocks[id].minPickTier=1;
  for(const id of [248])V.blocks[id].minPickTier=2;
  Object.assign(V.blocks[169],{emissive:.78,pointLight:true});
  Object.assign(V.blocks[170],{emissive:.72,pointLight:true});
  // Realm material contracts are shared by main-thread collision, hazards and portal use.
  Object.assign(V.blocks[69],{emissive:1,liquid:true,lava:true,hazard:'lava',contactDamage:4,breakable:false});
  Object.assign(V.blocks[70],{emissive:.85});
  Object.assign(V.blocks[71],{portal:true});
  Object.assign(V.blocks[72],{emissive:.7,portal:true,breakable:false});
  // Heaven materials: solid glass is traversable only after it is mined;
  // portal interior is non-solid and never yields a survival travel item.
  Object.assign(V.blocks[76],{emissive:.85});
  Object.assign(V.blocks[77],{portal:true});
  Object.assign(V.blocks[78],{emissive:.7,portal:true,breakable:false});
  for(let id=39;id<=42;id++){
    Object.assign(V.blocks[id],{crop:'wheat',cropStage:id-39,plantOn:38});
    if(id<42)V.blocks[id].creativeHidden=true;
  }
  // Main-thread catalog metadata. The serialized world core owns its matching
  // numeric table independently; it never captures this object through a closure.
  V.treeFamilies=Object.freeze(Object.fromEntries([
    ['oak',{log:5,leaves:6,planks:8,sapling:36}],
    ['spruce',{log:24,leaves:25,planks:33,sapling:37}],
    ['birch',{log:43,leaves:44,planks:45,sapling:46}],
    ['acacia',{log:47,leaves:48,planks:49,sapling:50}],
    ['cherry',{log:51,leaves:52,planks:53,sapling:54}]
  ].map(([name,ids])=>[name,Object.freeze(ids)])));
  for(const [woodFamily,ids] of Object.entries(V.treeFamilies)){
    for(const id of Object.values(ids))V.blocks[id].woodFamily=woodFamily;
    V.blocks[ids.log].treeLog=true;
    Object.assign(V.blocks[ids.leaves],{leaf:true,sapling:ids.sapling});
    V.blocks[ids.sapling].treeSapling=true;
  }
  // C25 append only. Older block and item IDs keep their authored definitions.
  for(const d of C25.defs){
    if(V.blocks[d.id])throw Error('C25 block ID is occupied: '+d.id);
    const tiles=d.faceKeys.map(key=>{if(!Number.isInteger(T[key]))throw Error('C25 texture is missing '+key);return T[key];});
    V.blocks[d.id]={id:d.id,key:d.key,name:d.name,color:d.color,solid:d.solid,opaque:d.opaque,render:d.render,hardness:d.hardness,tool:d.tool,drop:d.id,tiles,emissive:0,breakable:true,shape:d.shape,minPickTier:d.minPickTier||0,c25:true,family:d.family,fixedAxis:d.fixedAxis,...(d.boxes?{boxes:d.boxes.map(box=>box.slice())}:{})};
  }
  const itemDefs = [
    [101,'Que gỗ','#9b733e','material'],
    [102,'Cuốc gỗ','#b69052','tool','pick',1,60],
    [103,'Cuốc đá','#969c9b','tool','pick',2,132],
    [104,'Cuốc sắt','#c8d3d5','tool','pick',3,251],
    [105,'Cuốc kim cương','#55d4c6','tool','pick',4,1562],
    [106,'Rìu đá','#929a96','tool','axe',2,132],
    [107,'Kiếm sắt','#d0d8d4','tool','sword',3,251],
    [108,'Táo','#d95646','food',null,null,null,4],
    [109,'Than','#333a40','material'],
    [110,'Thỏi sắt','#c9d2d1','material'],
    [111,'Sắt thô','#bda48f','material'],
    [112,'Kim cương','#57c9c8','material'],
    [113,'Vàng thô','#dcb759','material'],
    [114,'Thỏi vàng','#eed06c','material'],
    [115,'Thịt heo sống','#d58d8d','food',null,null,null,3],
    [116,'Thịt heo chín','#b57b45','food',null,null,null,8],
    [117,'Thịt cừu sống','#ae5558','food',null,null,null,2],
    [118,'Thịt cừu chín','#925739','food',null,null,null,6],
    [119,'Kéo tỉa','#bdc9c8','tool','shears',1,238],
    [120,'Hạt lúa mì','#8fa34b','material'],
    [121,'Lúa mì','#d4ad55','material'],
    [122,'Bánh mì','#c8944f','food',null,null,null,5],
    [123,'Ngọc trao đổi','#37b783','material'],
    [124,'Cuốc xới đá','#939e9b','tool','hoe',2,132],
    [125,'Thịt bò sống','#b43a49','food',null,null,null,3],
    [126,'Thịt bò chín','#8b4927','food',null,null,null,8],
    [127,'Thịt gà sống','#e2a19e','food',null,null,null,2],
    [128,'Thịt gà chín','#b9702f','food',null,null,null,6],
    [129,'Thịt thỏ sống','#df9aab','food',null,null,null,2],
    [130,'Thịt thỏ chín','#b17142','food',null,null,null,5],
    [131,'Trứng heo','#e9a3ab','spawn_egg'],
    [132,'Trứng cừu','#eee7d2','spawn_egg'],
    [133,'Trứng bò','#eee2c9','spawn_egg'],
    [134,'Trứng gà','#f4e8b9','spawn_egg'],
    [135,'Trứng thỏ','#b68b65','spawn_egg'],
    [136,'Trứng kẻ lang thang','#8ca866','spawn_egg'],
    [137,'Trứng dân làng','#cba782','spawn_egg'],
    [138,'Trứng sói','#9ba6ae','spawn_egg'],
    [139,'Trứng cáo','#df813b','spawn_egg'],
    [140,'Trứng ngựa','#99704e','spawn_egg'],
    [141,'Đồng thô','#bd7954','material'],
    [142,'Thỏi đồng','#d38d5d','material'],
    [143,'Mảnh thạch anh','#e8e0d2','material'],
    [144,'Mảnh tinh thạch tím','#aa8ad9','material'],
    [145,'Cuốc đồng','#cf8b5d','tool','pick',2,190],
    [146,'Rìu đồng','#cf8b5d','tool','axe',2,190],
    [147,'Xẻng đồng','#cf8b5d','tool','shovel',2,190],
    [148,'Bánh táo','#d6a25c','food',null,null,null,6],
    [149,'Trứng mèo','#d89c62','spawn_egg'],
    [150,'Còi bạn đồng hành','#cb9157','companion_whistle'],
    // New passive goat egg;186–189 remain the world-only wall-torch aliases.
    [190,'Trứng dê','#d7d1bb','spawn_egg'],
    [200,'Trứng vịt','#ddd8b6','spawn_egg'],
    [201,'Trứng rùa cạn','#a69b63','spawn_egg'],
    [213,'Trứng gấu','#9e7955','spawn_egg'],
    [214,'Trứng nhím','#b7a484','spawn_egg'],
    [221,'Trứng lợn rừng','#79634d','spawn_egg'],
    [222,'Trứng lạc đà hai bướu','#c49b64','spawn_egg'],
    [223,'Trứng ngựa vằn','#e0ddd0','spawn_egg'],
    [224,'Trứng lửng châu Âu','#92958c','spawn_egg'],
    // Adventure equipment and encounter materials: original, stable reserved IDs.
    [176,'Mũ đồng','#c18455','armor'],
    [177,'Giáp đồng','#c18455','armor'],
    [178,'Ủng đồng','#c18455','armor'],
    [179,'Mũ lăng kính','#75b4b7','armor'],
    [180,'Giáp lăng kính','#75b4b7','armor'],
    [181,'Ủng lăng kính','#75b4b7','armor'],
    [182,'Bùa nhịp bước','#63b38c','charm'],
    [183,'Bùa dũng khí','#aa7ecb','charm'],
    [184,'Ấn gọi Hộ Vệ','#9d83d4','summon'],
    [185,'Lõi lăng kính','#9edbd6','material'],
    // C7 survival supplies and missing tool steps. Stable IDs191-196.
    [191,'Than củi','#49433d','material'],
    [192,'Xẻng đá','#939d9a','tool','shovel',2,132],
    [193,'Rìu sắt','#c8d3d5','tool','axe',3,251],
    [194,'Kiếm đá','#929b97','tool','sword',2,132],
    [195,'Thịt vịt sống','#bb6370','food',null,null,null,2],
    [196,'Thịt vịt chín','#a86b39','food',null,null,null,6],
    [219,'Xẻng sắt','#c4d5d9','tool','shovel',3,251],
    [220,'Rìu nạm kim cương','#4ed3d5','tool','axe',4,1562],
    [237,"Trứng gấu mèo Bắc Mỹ","#a79d89","spawn_egg"],
    [238,"Trứng tatu chín đai","#b79e7b","spawn_egg"],
  ];
  V.items={};
  for(const b of V.blocks) if(b?.id) V.items[b.id]={id:b.id,name:b.name,color:b.color,kind:'block',...(b.creativeHidden?{creativeHidden:true}:{})};
  for(const [id,name,color,kind,tool,tier,durability,nutrition] of itemDefs)
    V.items[id]={id,name,color,kind,...(tool?{tool,tier,durability}:{}),...(kind==='food'?{nutrition}: {})};
  for(const d of C25.defs){if(!V.items[d.id]||V.items[d.id].kind!=='block')throw Error('C25 item registry collision');V.items[d.id].description=d.useNote;}
  Object.assign(V.items[128],{description:'Cho mèo ăn ba lần để kết bạn; mỗi lần hồi tối đa 3 máu. Giữ nút chỉ tính một lần cho ăn.'});
  Object.assign(V.items[150],{description:'Nhìn mèo đã kết bạn rồi Dùng để đổi đi theo/đứng đợi. Thổi nơi trống để gọi bạn trong 24 khối, cùng tầng gần đó; không dịch chuyển tức thời.'});
  Object.assign(V.items[141],{description:'Thợ rèn đổi đồng thô; nung trong lò để lấy thỏi đồng.'});
  Object.assign(V.items[143],{description:'Đổi với thợ xây để chế tạo thạch anh và đèn lăng kính.'});
  Object.assign(V.items[144],{description:'Đổi với thợ xây để chế tạo khối tinh thạch, kính chàm và đèn.'});
  Object.assign(V.items[162],{description:'Biến thể đồng xanh chế tạo bằng đồng và lá; màu giữ nguyên khi đặt.'});
  for(const[id,slot,tier,durability,defense]of[[176,'head','copper',120,6],[177,'body','copper',200,12],[178,'feet','copper',150,6],[179,'head','prism',220,10],[180,'body','prism',340,18],[181,'feet','prism',260,10]])Object.assign(V.items[id],{equipmentSlot:slot,equipmentTier:tier,durability,description:'Trang bị trong túi đồ · giảm '+defense+'% sát thương chiến đấu · độ bền '+durability+'. Các món cùng loại dùng chung độ mòn.'});
  Object.assign(V.items[182],{equipmentSlot:'charm',description:'Trang bị một bùa: tăng 8% tốc độ di chuyển trong Sinh tồn khi không bay và không cưỡi ngựa.'});
  Object.assign(V.items[183],{equipmentSlot:'charm',description:'Trang bị một bùa: tăng 15% sát thương cận chiến.'});
  Object.assign(V.items[184],{description:'Dùng để gọi Hộ Vệ đã chọn trong Sổ Gió, trên nền khô và rộng ở thế giới chính.'});
  Object.assign(V.items[185],{description:'Chiến lợi phẩm của Hộ Vệ Lăng Kính; nâng cấp giáp đồng và chế tạo bùa.'});
  Object.assign(V.items[191],{description:'Nung một thân gỗ bất kỳ trong lò để lấy than củi. Cháy 80 giây; một than củi và một que gỗ chế được bốn đuốc.'});
  Object.assign(V.items[192],{description:'Chế tại bàn từ một đá cuội và hai que gỗ. Xúc đất, cát, sỏi và tuyết nhanh hơn tay không; độ bền 132.'});
  Object.assign(V.items[193],{description:'Chế tại bàn từ ba thỏi sắt và hai que gỗ. Thời gian chặt khối gỗ ngắn hơn 25% so với rìu đá hoặc rìu đồng; độ bền 251.'});
  Object.assign(V.items[194],{description:'Chế tại bàn từ hai đá cuội và một que gỗ. Gây 4 sát thương cận chiến trước hiệu ứng bùa; độ bền 132.'});
  Object.assign(V.items[195],{description:'Nhận từ vịt. Ăn hồi 2 thức ăn; nung trong lò 10 giây để có thịt vịt chín.'});
  Object.assign(V.items[196],{description:'Nung thịt vịt sống trong lò 10 giây. Ăn hồi 6 thức ăn.'});
  Object.assign(V.items[202],{description:'Nén chín than tại bàn chế tạo; tách lại đúng chín than. Dùng cuốc để thu hồi. Một khối cháy 720 giây trong lò.'});
  Object.assign(V.items[203],{description:'Nén chín thỏi sắt tại bàn chế tạo; tách lại đúng chín thỏi. Cần cuốc đá, đồng hoặc tốt hơn để thu hồi.'});
  Object.assign(V.items[204],{description:'Nén chín thỏi vàng tại bàn chế tạo; tách lại đúng chín thỏi. Cần cuốc sắt hoặc tốt hơn để thu hồi.'});
  Object.assign(V.items[205],{description:'Dùng cuốc đá, đồng hoặc tốt hơn để lấy quặng. Nung một quặng trong lò 10 giây thành một thỏi đồng.'});
  Object.assign(V.items[206],{description:'Nén chín kim cương tại bàn chế tạo; tách lại đúng chín viên. Cần cuốc sắt hoặc tốt hơn để thu hồi.'});
  Object.assign(V.items[207],{description:'Dùng cuốc đá, đồng hoặc tốt hơn để khai thác một thạch anh. Bốn thạch anh chế được một khối thạch anh tại bàn.'});
  Object.assign(V.items[215],{description:'Xếp bốn đá bazan thành bốn khối gạch tại bàn chế tạo. Khối xây đặc; dùng cuốc để thu hồi.'});
  Object.assign(V.items[216],{description:'Khắc bốn đá cát thành bốn khối hoa văn tại bàn chế tạo. Khối xây đặc; dùng cuốc để thu hồi.'});
  Object.assign(V.items[217],{description:'Ghép bốn đá cuội thành bốn khối lát tại bàn chế tạo. Đây là khối đầy đủ, không phải tấm mỏng; dùng cuốc để thu hồi.'});
  Object.assign(V.items[218],{description:'Bốn kính và một thỏi sắt tạo bốn khối kính khung sắt tại bàn. Khối trong suốt nhưng vẫn chắn đường; dùng cuốc để thu hồi.'});
  Object.assign(V.items[219],{description:'Một thỏi sắt và hai que gỗ tại bàn chế tạo. Xúc đất, cát, sỏi và tuyết: thời gian đào ngắn hơn 25% so với xẻng đá hoặc đồng. Quy tắc trò chơi: bậc 3, độ bền 251.'});
  Object.assign(V.items[220],{description:'Hai kim cương, một thỏi sắt và hai que gỗ tại bàn: thân sắt, mép lưỡi nạm kim cương. Quy tắc trò chơi: thời gian chặt gỗ ngắn hơn 20% so với rìu sắt; bậc 4, độ bền 1562.'});
  Object.assign(V.items[225],{description:"Khung vân sam với mảng đất nện, ghép tại bàn chế tạo. Khối xây đặc; dùng rìu để tháo nhanh."});
  Object.assign(V.items[226],{description:"Len trắng và len xanh ghép hoa văn hình thoi. Đây là khối xây đầy, có thể lấy lại bằng tay."});
  Object.assign(V.items[227],{description:"Gốm lam và gốm ngà ghép thành các dải cong. Dùng cuốc để lấy lại khối."});
  Object.assign(V.items[228],{description:"Ô lưới nhìn xuyên qua được; va chạm vẫn là một khối đầy. Dùng cuốc để lấy lại khối."});
  Object.assign(V.items[229],{description:"Mảnh kính hổ phách và chàm ghép trong đường nối đồng. Khối kính đặc về va chạm; dùng cuốc để lấy lại."});
  Object.assign(V.items[230],{description:"Bó lúa mì buộc đai, mặt đầu thân riêng ở trên và dưới. Khối trang trí xây dựng; có thể lấy lại bằng tay."});
  Object.assign(V.items[231],{description:"Đường khảm đồng trên mặt bazan tối. Dùng cuốc để lấy lại khối xây."});
  Object.assign(V.items[232],{description:"Các viên ngói đá phiến cắt vảy cá xếp chồng trên bề mặt. Đây vẫn là khối đầy; dùng cuốc để lấy lại."});
  Object.assign(V.items[233],{description:"Bốn ô thoáng hình thoi, thành gốm dày. Nhìn xuyên các lỗ; va chạm vẫn là một khối đầy."});
  Object.assign(V.items[234],{description:"Mặt trên ghép bốn đầu thớ lệch tâm, cạnh ghép mộng ngắn. Dùng làm sàn hoặc ốp."});
  Object.assign(V.items[235],{description:"Lõi thạch anh ngà rộng, đường viền vàng mảnh và bốn góc nhấn. Không có công thức tách ngược."});
  Object.assign(V.items[236],{description:"Sọc chéo vàng và đen có thớ dệt; nối liền trên mặt phẳng. Đây là dấu thị giác tĩnh."});
  Object.assign(V.items[239],{description:"Tường màu vôi ấm, hạt mịn và vết miết nhẹ; dùng làm nền sáng cho gỗ và mái xanh."});
  Object.assign(V.items[240],{description:"Mảng vữa sáng xen gạch nung lộ ra ở chân tường. Mặt trên giữ màu vữa để ghép gọn."});
  Object.assign(V.items[241],{description:"Hạt đá góc cạnh màu đất nung, chàm và ngà trong nền đá sáng; lát được liên tiếp."});
  Object.assign(V.items[242],{description:"Mặt sàn ghép gạch xương cá, cạnh khối là gạch xây ngang. Họa tiết nối theo lưới khối."});
  Object.assign(V.items[243],{description:"Nan gỗ anh đào ngang có viền khung và rãnh tối. Đây là khối ốp kín, không mở như cửa."});
  Object.assign(V.items[244],{description:"Vải ngà dệt mịn trong ba ô dọc bằng gỗ sáng. Vách đặc để ngăn phòng và làm quầy."});
  Object.assign(V.items[245],{description:"Mặt gỗ có giằng chéo và hai đai sắt. Thùng dùng trang trí bến hàng, không chứa vật phẩm."});
  Object.assign(V.items[246],{description:"Nan chiếu màu rơm ghép dọc trong viền chàm; cạnh khối giữ thớ đan để lát sàn hoặc làm bục."});
  Object.assign(V.items[247],{description:"Các dải sáng tối gợi ngói ống men xanh trên khối vuông; ghép thành mái bậc hoặc mái bằng."});
  Object.assign(V.items[248],{description:"Gân sắt ngắn đan chéo, tương phản rõ trên sàn xưởng. Bề mặt là họa tiết tĩnh của khối đầy."});
  V.spawnEggs=Object.freeze([
    {id:131,type:'pig',spots:'#bf687f'}, {id:132,type:'sheep',spots:'#8f806b'},
    {id:133,type:'cow',spots:'#594438'}, {id:134,type:'chicken',spots:'#ce5335'},
    {id:135,type:'rabbit',spots:'#ead4b1'}, {id:136,type:'walker',spots:'#405c85'},
    {id:137,type:'villager',spots:'#78573d'},
    {id:138,type:'wolf',spots:'#52616c'}, {id:139,type:'fox',spots:'#f1d8a3'},
    {id:140,type:'horse',spots:'#e7d4ae'},
    {id:149,type:'cat',spots:'#704631'},
    {id:190,type:'goat',spots:'#72604b'},
    {id:200,type:'duck',spots:'#416d46'},
    {id:201,type:'tortoise',spots:'#514d31'},
    {id:213,type:'bear',spots:'#4b3324'},
    {id:214,type:'hedgehog',spots:'#514a3b'},
    {id:221,type:'boar',spots:'#3e352b'},
    {id:222,type:'camel',spots:'#75543a'},
    {id:223,type:'zebra',spots:'#303235'},
    {id:224,type:'badger',spots:'#2c3235'},
    {id:237,type:'raccoon',spots:'#414d54'},
    {id:238,type:'armadillo',spots:'#665a51'}
  ].map(row=>Object.freeze(row)));
  for(const row of V.spawnEggs)Object.assign(V.items[row.id],{spawnType:row.type,eggSpots:row.spots,
    description:'Chuột phải lên nền khô còn trống để gọi sinh vật. Sáng tạo dùng không hết; Sinh tồn dùng một trứng.'+(row.type==='walker'?' Kẻ lang thang cháy dưới nắng.':'')});
  V.recipes = [
    {id:'oak_planks',name:'Ván gỗ sồi',need:[[5,1]],out:[8,4],station:false},
    {id:'spruce_planks',name:'Ván gỗ vân sam',need:[[24,1]],out:[33,4],station:false},
    {id:'sticks',name:'Que gỗ',need:[[8,2]],out:[101,4],station:false},
    {id:'spruce_sticks',name:'Que gỗ vân sam',need:[[33,2]],out:[101,4],station:false},
    {id:'workbench',name:'Bàn chế tạo',need:[[8,4]],out:[18,1],station:false},
    {id:'spruce_workbench',name:'Bàn chế tạo vân sam',need:[[33,4]],out:[18,1],station:false},
    {id:'companion_whistle',name:'Còi bạn đồng hành',need:[[8,2],[142,1]],out:[150,1],station:'crafting'},
    {id:'stone_shovel',name:'Xẻng đá',need:[[9,1],[101,2]],out:[192,1],station:'crafting'},
    {id:'iron_axe',name:'Rìu sắt',need:[[110,3],[101,2]],out:[193,1],station:'crafting'},
    {id:'stone_sword',name:'Kiếm đá',need:[[9,2],[101,1]],out:[194,1],station:'crafting'},
    {id:'wood_pick',name:'Cuốc gỗ',need:[[8,3],[101,2]],out:[102,1],station:'crafting'},
    {id:'spruce_pick',name:'Cuốc gỗ vân sam',need:[[33,3],[101,2]],out:[102,1],station:'crafting'},
    {id:'stone_pick',name:'Cuốc đá',need:[[9,3],[101,2]],out:[103,1],station:'crafting'},
    {id:'iron_pick',name:'Cuốc sắt',need:[[110,3],[101,2]],out:[104,1],station:'crafting'},
    {id:'diamond_pick',name:'Cuốc kim cương',need:[[112,3],[101,2]],out:[105,1],station:'crafting'},
    {id:'axe',name:'Rìu đá',need:[[9,3],[101,2]],out:[106,1],station:'crafting'},
    {id:'sword',name:'Kiếm sắt',need:[[110,2],[101,1]],out:[107,1],station:'crafting'},
    {id:'torch',name:'Bốn cây đuốc',need:[[109,1],[101,1]],out:[19,4],station:false},
    {id:'charcoal_torch',name:'Bốn cây đuốc từ than củi',need:[[191,1],[101,1]],out:[19,4],station:false},
    {id:'furnace',name:'Lò nung',need:[[9,8]],out:[32,1],station:'crafting'},
    {id:'charcoal_oak',name:'Than củi từ thân sồi',need:[[5,1]],out:[191,1],station:'furnace',cookSeconds:10},
    {id:'charcoal_spruce',name:'Than củi từ thân vân sam',need:[[24,1]],out:[191,1],station:'furnace',cookSeconds:10},
    {id:'charcoal_birch',name:'Than củi từ thân bạch dương',need:[[43,1]],out:[191,1],station:'furnace',cookSeconds:10},
    {id:'charcoal_acacia',name:'Than củi từ thân keo',need:[[47,1]],out:[191,1],station:'furnace',cookSeconds:10},
    {id:'charcoal_cherry',name:'Than củi từ thân anh đào',need:[[51,1]],out:[191,1],station:'furnace',cookSeconds:10},
    {id:'cook_duck',name:'Nướng thịt vịt',need:[[195,1]],out:[196,1],station:'furnace',cookSeconds:10},
    {id:'smelt_iron',name:'Nung thỏi sắt',need:[[111,1]],out:[110,1],station:'furnace',cookSeconds:10},
    {id:'smelt_gold',name:'Nung thỏi vàng',need:[[113,1]],out:[114,1],station:'furnace',cookSeconds:10},
    {id:'smelt_stone',name:'Nung đá',need:[[9,1]],out:[3,1],station:'furnace',cookSeconds:10},
    {id:'smelt_glass',name:'Nung kính',need:[[4,1]],out:[10,1],station:'furnace',cookSeconds:10},
    {id:'smelt_brick',name:'Nung gạch',need:[[26,1]],out:[11,1],station:'furnace',cookSeconds:10},
    {id:'stone_bricks',name:'Gạch đá',need:[[3,4]],out:[34,4],station:'crafting'},
    // Furnace input recipes share the persistent ten-second cooking system.
    {id:'cook_pork',name:'Nướng thịt heo',need:[[115,1]],out:[116,1],station:'furnace',cookSeconds:10},
    {id:'cook_mutton',name:'Nướng thịt cừu',need:[[117,1]],out:[118,1],station:'furnace',cookSeconds:10},
    {id:'cook_beef',name:'Nướng thịt bò',need:[[125,1]],out:[126,1],station:'furnace',cookSeconds:10},
    {id:'cook_chicken',name:'Nướng thịt gà',need:[[127,1]],out:[128,1],station:'furnace',cookSeconds:10},
    {id:'cook_rabbit',name:'Nướng thịt thỏ',need:[[129,1]],out:[130,1],station:'furnace',cookSeconds:10},
    {id:'shears',name:'Kéo tỉa',need:[[110,2]],out:[119,1],station:'crafting'},
    {id:'stone_hoe',name:'Cuốc xới đá',need:[[9,2],[101,2]],out:[124,1],station:'crafting'},
    {id:'bread',name:'Bánh mì',need:[[121,3]],out:[122,1],station:'crafting'},
    {id:'birch_planks',name:'Ván gỗ bạch dương',need:[[43,1]],out:[45,4],station:false},
    {id:'birch_sticks',name:'Que gỗ bạch dương',need:[[45,2]],out:[101,4],station:false},
    {id:'birch_workbench',name:'Bàn chế tạo bạch dương',need:[[45,4]],out:[18,1],station:false},
    {id:'birch_pick',name:'Cuốc gỗ bạch dương',need:[[45,3],[101,2]],out:[102,1],station:'crafting'},
    {id:'acacia_planks',name:'Ván gỗ keo',need:[[47,1]],out:[49,4],station:false},
    {id:'acacia_sticks',name:'Que gỗ keo',need:[[49,2]],out:[101,4],station:false},
    {id:'acacia_workbench',name:'Bàn chế tạo keo',need:[[49,4]],out:[18,1],station:false},
    {id:'acacia_pick',name:'Cuốc gỗ keo',need:[[49,3],[101,2]],out:[102,1],station:'crafting'},
    {id:'cherry_planks',name:'Ván gỗ anh đào',need:[[51,1]],out:[53,4],station:false},
    {id:'cherry_sticks',name:'Que gỗ anh đào',need:[[53,2]],out:[101,4],station:false},
    {id:'cherry_workbench',name:'Bàn chế tạo anh đào',need:[[53,4]],out:[18,1],station:false},
    {id:'cherry_pick',name:'Cuốc gỗ anh đào',need:[[53,3],[101,2]],out:[102,1],station:'crafting'},
    {"id":"red_wool","name":"Len đỏ","need":[[20,4],[11,1]],"out":[55,4],"station":false},
    {"id":"blue_wool","name":"Len xanh dương","need":[[20,16],[112,1]],"out":[56,16],"station":false},
    {"id":"yellow_wool","name":"Len vàng","need":[[20,4],[22,1]],"out":[57,4],"station":false},
    {"id":"green_wool","name":"Len xanh lá","need":[[20,4],[30,1]],"out":[58,4],"station":false},
    {"id":"purple_wool","name":"Len tím","need":[[55,2],[56,2]],"out":[59,4],"station":false},
    {"id":"orange_wool","name":"Len cam","need":[[55,2],[57,2]],"out":[60,4],"station":false},
    {"id":"cyan_wool","name":"Len xanh ngọc","need":[[56,2],[20,2]],"out":[61,4],"station":false},
    {"id":"black_wool","name":"Len đen","need":[[20,4],[109,1]],"out":[62,4],"station":false},
    {"id":"smooth_stone","name":"Đá nhẵn","need":[[3,4]],"out":[63,4],"station":"crafting"},
    {"id":"polished_basalt","name":"Bazan đánh bóng","need":[[21,4]],"out":[64,4],"station":"crafting"},
    {"id":"chiseled_stone","name":"Đá chạm khắc","need":[[34,4]],"out":[65,4],"station":"crafting"},
    {"id":"terracotta_tiles","name":"Gạch gốm hoa văn","need":[[11,4],[4,1]],"out":[66,4],"station":"crafting"},
    {"id":"ember_bricks","name":"Gạch tàn hỏa","need":[[67,4]],"out":[68,4],"station":"crafting"},
    {"id":"rift_frame","name":"Neo chuyển giới","need":[[21,4],[110,2],[112,1]],"out":[71,1],"station":"crafting"},
    {"id":"sky_anchor","name":"Neo thiên giới","need":[[10,4],[114,2],[112,1]],"out":[77,1],"station":"crafting"},
    {"id":"oak_parquet","name":"Sàn sồi ghép","need":[[8,4]],"out":[79,4],"station":"crafting"},
    {"id":"spruce_panel","name":"Ốp vân sam","need":[[33,4]],"out":[80,4],"station":"crafting"},
    {"id":"birch_weave","name":"Gỗ đan bạch dương","need":[[45,4]],"out":[81,4],"station":"crafting"},
    {"id":"acacia_mosaic","name":"Gỗ keo ghép vuông","need":[[49,4]],"out":[82,4],"station":"crafting"},
    {"id":"cherry_panel","name":"Ốp gỗ anh đào","need":[[53,4]],"out":[83,4],"station":"crafting"},
    {"id":"sandstone","name":"Đá cát","need":[[4,4]],"out":[84,4],"station":"crafting"},
    {"id":"sandstone_bricks","name":"Gạch đá cát","need":[[84,4]],"out":[85,4],"station":"crafting"},
    {"id":"limestone","name":"Đá vôi","need":[[3,4],[4,1]],"out":[86,4],"station":"crafting"},
    {"id":"limestone_tiles","name":"Lát đá vôi","need":[[86,4]],"out":[87,4],"station":"crafting"},
    {"id":"slate_tiles","name":"Ngói đá phiến","need":[[21,4],[3,1]],"out":[88,4],"station":"crafting"},
    {"id":"mossy_cobble","name":"Đá cuội phủ rêu","need":[[9,4],[6,1]],"out":[89,4],"station":"crafting"},
    {"id":"pink_granite","name":"Đá hoa cương hồng","need":[[3,4],[11,1]],"out":[90,4],"station":"crafting"},
    {"id":"ceramic_ivory","name":"Lát gốm ngà","need":[[11,16],[20,1]],"out":[91,16],"station":"crafting"},
    {"id":"ceramic_red","name":"Lát gốm đỏ","need":[[11,16],[55,1]],"out":[92,16],"station":"crafting"},
    {"id":"ceramic_ochre","name":"Lát gốm vàng","need":[[11,16],[57,1]],"out":[93,16],"station":"crafting"},
    {"id":"ceramic_green","name":"Lát gốm xanh lá","need":[[11,16],[58,1]],"out":[94,16],"station":"crafting"},
    {"id":"ceramic_blue","name":"Lát gốm xanh ngọc","need":[[11,16],[61,1]],"out":[95,16],"station":"crafting"},
    {"id":"ceramic_black","name":"Lát gốm đen","need":[[11,16],[62,1]],"out":[96,16],"station":"crafting"},
    {"id":"riveted_iron","name":"Tấm sắt tán đinh","need":[[110,4]],"out":[97,8],"station":"crafting"},
    {"id":"checker_stone","name":"Lát đá bàn cờ","need":[[86,2],[64,2]],"out":[98,4],"station":"crafting"},
    {"id":"smelt_copper","name":"Nung thỏi đồng","need":[[141,1]],"out":[142,1],"station":"furnace","cookSeconds":10},
    {id:'coal_block',name:'Khối than',need:[[109,9]],out:[202,1],station:'crafting'},
    {id:'unpack_coal',name:'Tách than',need:[[202,1]],out:[109,9],station:'crafting'},
    {id:'iron_block',name:'Khối sắt',need:[[110,9]],out:[203,1],station:'crafting'},
    {id:'unpack_iron',name:'Tách thỏi sắt',need:[[203,1]],out:[110,9],station:'crafting'},
    {id:'gold_block',name:'Khối vàng',need:[[114,9]],out:[204,1],station:'crafting'},
    {id:'unpack_gold',name:'Tách thỏi vàng',need:[[204,1]],out:[114,9],station:'crafting'},
    {id:'diamond_block',name:'Khối kim cương',need:[[112,9]],out:[206,1],station:'crafting'},
    {id:'unpack_diamond',name:'Tách kim cương',need:[[206,1]],out:[112,9],station:'crafting'},
    {id:'smelt_copper_ore',name:'Nung quặng đồng',need:[[205,1]],out:[142,1],station:'furnace',cookSeconds:10},
    {"id":"copper_block","name":"Khối đồng","need":[[142,9]],"out":[160,1],"station":"crafting"},
    {"id":"unpack_copper","name":"Tách thỏi đồng","need":[[160,1]],"out":[142,9],"station":"crafting"},
    {"id":"cut_copper","name":"Đồng ghép tấm","need":[[160,4]],"out":[161,4],"station":"crafting"},
    {"id":"patina_copper","name":"Đồng phủ xanh","need":[[161,4],[6,1]],"out":[162,4],"station":"crafting"},
    {"id":"engraved_copper","name":"Đồng khắc sóng","need":[[161,4]],"out":[163,4],"station":"crafting"},
    {"id":"quartz_block","name":"Khối thạch anh","need":[[143,4]],"out":[164,1],"station":"crafting"},
    {"id":"quartz_bricks","name":"Gạch thạch anh","need":[[164,4]],"out":[165,4],"station":"crafting"},
    {"id":"quartz_pillar","name":"Cột thạch anh","need":[[164,2]],"out":[166,2],"station":"crafting"},
    {"id":"amethyst_block","name":"Khối tinh thạch tím","need":[[144,4]],"out":[167,1],"station":"crafting"},
    {"id":"amethyst_mosaic","name":"Khảm sao tím","need":[[167,4]],"out":[168,4],"station":"crafting"},
    {"id":"prism_lantern","name":"Đèn lăng kính","need":[[10,4],[143,2],[144,1],[28,1]],"out":[169,2],"station":"crafting"},
    {"id":"copper_lantern","name":"Đèn đồng","need":[[142,4],[10,2],[19,1]],"out":[170,2],"station":"crafting"},
    {"id":"amber_glass","name":"Kính hổ phách","need":[[10,8],[114,1]],"out":[171,8],"station":"crafting"},
    {"id":"indigo_glass","name":"Kính chàm","need":[[10,8],[144,1]],"out":[172,8],"station":"crafting"},
    {"id":"mossy_stone_bricks","name":"Gạch đá rêu","need":[[34,4],[6,1]],"out":[173,4],"station":"crafting"},
    {"id":"packed_earth","name":"Đất nện","need":[[2,3],[26,1]],"out":[174,4],"station":false},
    {"id":"fire_packed_earth","name":"Nung gạch đất nện","need":[[174,1]],"out":[175,1],"station":"furnace","cookSeconds":10},
    {"id":"copper_pick","name":"Cuốc đồng","need":[[142,3],[101,2]],"out":[145,1],"station":"crafting"},
    {"id":"copper_axe","name":"Rìu đồng","need":[[142,3],[101,2]],"out":[146,1],"station":"crafting"},
    {"id":"copper_shovel","name":"Xẻng đồng","need":[[142,1],[101,2]],"out":[147,1],"station":"crafting"},
    {"id":"apple_tart","name":"Bánh táo","need":[[121,3],[108,1]],"out":[148,2],"station":"crafting"},
    {"id":"copper_helmet","name":"Mũ đồng","need":[[142,5]],"out":[176,1],"station":"crafting"},
    {"id":"copper_chest","name":"Giáp đồng","need":[[142,8]],"out":[177,1],"station":"crafting"},
    {"id":"copper_boots","name":"Ủng đồng","need":[[142,4]],"out":[178,1],"station":"crafting"},
    {"id":"prism_helmet","name":"Mũ lăng kính","need":[[176,1],[143,4],[144,2],[185,1]],"out":[179,1],"station":"crafting"},
    {"id":"prism_chest","name":"Giáp lăng kính","need":[[177,1],[143,4],[144,2],[185,1]],"out":[180,1],"station":"crafting"},
    {"id":"prism_boots","name":"Ủng lăng kính","need":[[178,1],[143,4],[144,2],[185,1]],"out":[181,1],"station":"crafting"},
    {"id":"trail_charm","name":"Bùa nhịp bước","need":[[101,2],[142,2],[143,2]],"out":[182,1],"station":"crafting"},
    {"id":"courage_charm","name":"Bùa dũng khí","need":[[142,3],[144,2],[185,1]],"out":[183,1],"station":"crafting"},
    {"id":"guardian_sigil","name":"Ấn gọi Hộ Vệ","need":[[142,4],[143,4],[144,2]],"out":[184,1],"station":"crafting"},
    {id:'basalt_bricks',name:'Gạch bazan',need:[[21,4]],out:[215,4],station:'crafting'},
    {id:'carved_sandstone',name:'Đá cát khắc',need:[[84,4]],out:[216,4],station:'crafting'},
    {id:'cobble_paving',name:'Đá cuội lát',need:[[9,4]],out:[217,4],station:'crafting'},
    {id:'iron_framed_glass',name:'Kính khung sắt',need:[[10,4],[110,1]],out:[218,4],station:'crafting'},
    {id:'iron_shovel',name:'Xẻng sắt',need:[[110,1],[101,2]],out:[219,1],station:'crafting'},
    {id:'diamond_inlaid_axe',name:'Rìu nạm kim cương',need:[[112,2],[110,1],[101,2]],out:[220,1],station:'crafting'},
    {"id":"timber_earth","name":"Vách gỗ trát đất","need":[[33,2],[174,2]],"out":[225,4],"station":"crafting"},
    {"id":"woven_diamond","name":"Len dệt hình thoi","need":[[20,2],[56,2]],"out":[226,4],"station":"crafting"},
    {"id":"blue_ivory_mosaic","name":"Khảm gốm lam ngà","need":[[91,2],[95,2]],"out":[227,4],"station":"crafting"},
    {"id":"iron_lattice","name":"Khối lưới sắt","need":[[110,4]],"out":[228,4],"station":"crafting"},
    {"id":"amber_indigo_glass","name":"Kính khảm hai màu","need":[[171,2],[172,2],[142,1]],"out":[229,4],"station":"crafting"},
    {"id":"wheat_bale","name":"Kiện lúa mì","need":[[121,9]],"out":[230,1],"station":"crafting"},
    {"id":"copper_inlay_basalt","name":"Bazan khảm đồng","need":[[21,4],[142,1]],"out":[231,4],"station":"crafting"},
    {"id":"fishscale_slate","name":"Ngói đá vảy cá","need":[[88,4]],"out":[232,4],"station":"crafting"},
    {"id":"c10_terracotta_openwork","name":"Gạch gốm ô rỗng","need":[[11,4]],"out":[233,4],"station":"crafting"},
    {"id":"c10_oak_endgrain_floor","name":"Sàn sồi đầu thớ","need":[[5,4]],"out":[234,4],"station":"crafting"},
    {"id":"c10_gold_rim_quartz","name":"Thạch anh viền vàng","need":[[164,4],[114,1]],"out":[235,4],"station":"crafting"},
    {"id":"c10_warning_stripe_wool","name":"Len sọc cảnh báo","need":[[57,2],[62,2]],"out":[236,4],"station":"crafting"},
    {"id":"c11_lime_plaster","name":"Vữa vôi mịn","need":[[86,2],[26,2]],"out":[239,4],"station":"crafting"},
    {"id":"c11_exposed_brick_plaster","name":"Vữa lộ gạch","need":[[239,2],[11,2]],"out":[240,4],"station":"crafting"},
    {"id":"c11_river_terrazzo","name":"Sàn đá mài hạt màu","need":[[63,2],[27,1],[143,1]],"out":[241,4],"station":"crafting"},
    {"id":"c11_terracotta_herringbone","name":"Gạch nung xương cá","need":[[11,4]],"out":[242,4],"station":"crafting"},
    {"id":"c11_cherry_louvers","name":"Ốp gỗ chớp","need":[[53,4]],"out":[243,4],"station":"crafting"},
    {"id":"c11_linen_timber_screen","name":"Vách vải khung gỗ","need":[[45,2],[20,2]],"out":[244,4],"station":"crafting"},
    {"id":"c11_decorative_ironbound_crate","name":"Thùng gỗ đai sắt trang trí","need":[[8,4],[110,1]],"out":[245,4],"station":"crafting"},
    {"id":"c11_indigo_reed_mat","name":"Chiếu đan viền chàm","need":[[121,4],[56,1]],"out":[246,4],"station":"crafting"},
    {"id":"c11_jade_barrel_roof","name":"Ngói ống men xanh","need":[[11,4],[58,1]],"out":[247,4],"station":"crafting"},
    {"id":"c11_iron_diamond_tread","name":"Tấm sắt gân chéo","need":[[203,1],[3,3]],"out":[248,4],"station":"crafting"},
  ];
  function h(x,y,s=0){
    let n=(Math.imul(x+197,s+374761393)^Math.imul(y+311,668265263)^s)|0;
    n=Math.imul(n^(n>>>13),1274126177); return ((n^(n>>>16))>>>0)/4294967295;
  }
  const clamp=n=>Math.max(0,Math.min(255,Math.round(n)));
  const rgb=hex=>{const n=parseInt(hex.replace('#',''),16);return [n>>16,(n>>8)&255,n&255];};
  const mix=(a,b,t)=>a.map((v,i)=>v*(1-t)+b[i]*t);
  const shade=(c,n)=>c.map(v=>clamp(v+n));
  // C16 terrain study: coherent 16px motifs, native24 output; original legacy packs are retained.
  const C16_TERRAIN=(()=>{
    const keys=Object.freeze(['grassTop','grassSide','dirt','stone','sand','snow','basalt','clay','gravel']);
    const mod=(n,m)=>(n%m+m)%m,wrap=n=>n-Math.round(n/16)*16;
    const clip=n=>Math.max(0,Math.min(255,Math.round(n)));
    const tone=(c,n)=>c.map(v=>clip(v+n));
    const hash=(x,y,k)=>{let n=Math.imul(x+71,374761393)^Math.imul(y+193,668265263)^Math.imul(k,1274126177);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
    const soilSeeds=[[1,2],[7,1],[13,4],[4,8],[10,10],[0,14],[7,15]];
    const rockSeeds=[[1,2],[9,1],[5,8],[14,10],[1,14]];
    function cell(x,y,seeds,sx=1,sy=1){
      let first=null,second=Infinity;
      for(let i=0;i<seeds.length;i++){const dx=wrap(x-seeds[i][0]),dy=wrap(y-seeds[i][1]),d=(dx*sx)**2+(dy*sy)**2;
        if(!first||d<first.d){if(first)second=first.d;first={i,dx,dy,d};}else if(d<second)second=d;
      }
      return{...first,gap:Math.sqrt(second)-Math.sqrt(first.d)};
    }
    function grass(x,y){
      const lobes=[[1,1,3.6,2.6],[6,3,3.8,2.8],[13,1,3.6,2.6],[3,9,3.9,3.0],[10,8,3.7,2.7],[15,13,3.8,2.8],[7,15,3.6,2.6]];
      let light=-1;
      for(let i=0;i<lobes.length;i++){const[cx,cy,rx,ry]=lobes[i],dx=wrap(x-cx),dy=wrap(y-cy);light=Math.max(light,1-(dx/rx)**2-(dy/ry)**2-dx*.035-dy*.055+(i%3-1)*.12);}
      const palette=[[73,112,43],[83,124,47],[95,136,52],[106,147,58],[117,157,66],[129,167,77]],index=Math.max(0,Math.min(5,Math.floor(light*3+2.2)));
      let c=tone(palette[index],(hash(x,y,16)-.5)*4);
      if([[2,3],[3,2],[10,6],[11,5],[5,12],[6,11]].some(p=>p[0]===x&&p[1]===y))c=[139,166,80];
      return c;
    }
    function soil(x,y){
      const f=cell(x,y,soilSeeds,1,.9),palette=[[125,87,59],[132,94,65],[117,81,56],[139,99,67],[127,88,58],[120,85,61],[135,96,68]];
      let c=tone(palette[f.i],f.gap<.32?-10:f.dx+f.dy<-1?6:-2);
      if([[3,11],[12,7],[8,3]].some(p=>p[0]===x&&p[1]===y))c=[162,137,103];
      return tone(c,(hash(x,y,27)-.5)*5);
    }
    function rock(x,y,basalt){
      const f=cell(x,y,basalt?[[2,1],[10,3],[5,8],[14,11],[3,14]]:rockSeeds,basalt?.82:1.1,basalt?1.1:.83);
      const palette=basalt?[[62,70,79],[72,79,87],[67,75,85],[79,85,92],[58,68,78]]:[[127,136,143],[139,146,150],[121,133,142],[146,152,154],[132,141,146]];
      let c=tone(palette[f.i],f.gap<(basalt?.24:.18)?(basalt?-17:-17):f.dx+f.dy<-2?7:0);
      if(basalt){
        if([[3,4],[4,4],[10,11],[11,12],[14,2]].some(p=>p[0]===x&&p[1]===y))c=[39,48,58];
        if([[3,3],[10,10],[13,2]].some(p=>p[0]===x&&p[1]===y))c=[91,100,106];
      }else if([[5,2],[6,2],[13,8],[2,12]].some(p=>p[0]===x&&p[1]===y))c=[159,164,160];
      return tone(c,(hash(x,y,basalt?49:43)-.5)*5);
    }
    function sand(x,y){
      const bends=[0,0,0,1,1,1,0,0,-1,-1,0,0,1,1,1,0],band=mod(y+bends[x],8),light=[-7,-3,2,8,5,1,-1,-4][band];
      let c=tone([220,202,148],light+(hash(x,y,51)-.5)*4);
      if([[2,5],[9,2],[13,12],[5,14]].some(p=>p[0]===x&&p[1]===y))c=[197,177,127];
      if([[3,5],[10,2],[14,12]].some(p=>p[0]===x&&p[1]===y))c=[235,218,168];
      return c;
    }
    function gravel(x,y){
      const pebbles=[[2,2,2.7,2.4],[8,1,2.8,2.3],[14,4,2.5,2.8],[5,6,2.8,2.5],[10,8,2.5,2.5],[1,10,2.8,2.7],[6,13,3,2.4],[14,14,3,2.6]];
      const palette=[[141,145,140],[161,151,130],[119,130,136],[146,137,124],[133,143,144],[165,156,137],[124,132,130],[151,145,137]];
      let best=null;
      for(let i=0;i<pebbles.length;i++){const[cx,cy,rx,ry]=pebbles[i],dx=wrap(x-cx),dy=wrap(y-cy),d=Math.abs(dx/rx)**2.5+Math.abs(dy/ry)**2.5;if(!best||d<best.d)best={i,dx,dy,d};}
      const f=best;let c=f.d>1?[92,94,88]:tone(palette[f.i],f.d>.65?-15:f.dx+f.dy<-1?15:0);
      return tone(c,(hash(x,y,63)-.5)*5);
    }
    function clay(x,y){
      const bend=[0,0,1,1,1,0,0,-1,-1,0,0,1,1,0,0,0][x],band=mod(y+bend,16);
      let c=tone([155,164,167],[-4,-4,-1,2,3,1,-2,-4,-1,2,5,3,0,-2,1,2][band]+(hash(x,y,71)-.5)*4);
      if((x>=3&&x<=6&&y>=8&&y<=9)||(x>=11&&x<=13&&y===2))c=tone([164,151,138],(hash(x,y,72)-.5)*6);
      if((band===4||band===11)&&hash(x>>1,y,73)>.5)c=tone(c,5);
      return c;
    }
    function snow(x,y){
      const bends=[0,0,1,1,2,2,1,1,0,0,-1,-1,-2,-2,-1,-1],band=mod(y+bends[x],16);
      const c=band<2?[210,227,235]:band<4?[221,235,239]:band<6?[239,247,245]:[232,241,240];
      return tone(c,(hash(x,y,81)-.5)*3);
    }
    function pixel(name,x,y){
      if(name==='grassTop')return grass(x,y);
      if(name==='dirt')return soil(x,y);
      if(name==='grassSide'){
        const depth=[3,4,4,3,5,5,4,3,3,4,5,4,4,3,4,3][x];
        if(y<depth)return tone(grass(x,mod(y+7,16)),y===0?4:-3);
        if(y===depth)return [79,92,45];
        if((x===3&&y>=6&&y<=9)||(x===10&&y>=7&&y<=10)||(x===4&&y===9))return [103,76,48];
        return soil(x,y);
      }
      if(name==='stone'||name==='basalt')return rock(x,y,name==='basalt');
      if(name==='sand')return sand(x,y);
      if(name==='gravel')return gravel(x,y);
      if(name==='clay')return clay(x,y);
      return snow(x,y);
    }
    function makeTile(name,size=24){
      if(!keys.includes(name)||(size!==16&&size!==24))throw new RangeError('Unknown C16 terrain tile or size');
      const data=new Uint8ClampedArray(size*size*4),salt=keys.indexOf(name)+101;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const u=Math.floor(x*16/size),v=Math.floor(y*16/size),c=pixel(name,u,v),grain=size===24?(hash(x,y,salt)-.5)*3:0,i=(x+y*size)*4;
        data[i]=clip(c[0]+grain);data[i+1]=clip(c[1]+grain);data[i+2]=clip(c[2]+grain);data[i+3]=255;
      }
      return data;
    }
    return Object.freeze({keys,makeTile});
  })();
  // C17 wood and foliage study. Native24 only; gameplay definitions and legacy pixels remain unchanged.
  const C17_MATERIALS=(()=>{
    const wood=Object.freeze(['oakBark','oakEnd','planks','spruceBark','spruceEnd','darkPlanks']);
    const leaves=Object.freeze(['oakLeaves','spruceLeaves','birchLeaves','acaciaLeaves','cherryLeaves']);
    const cross=Object.freeze(['flower','tallgrass','oakSapling','spruceSapling','birchSapling','acaciaSapling','cherrySapling']);
    // Three more existing wood families; previous material keys keep their original grain seeds.
    const moreWood=Object.freeze(['birchBark','birchEnd','birchPlanks','acaciaBark','acaciaEnd','acaciaPlanks','cherryBark','cherryEnd','cherryPlanks']);
    const keys=Object.freeze([...wood,...leaves,...cross,...moreWood]);
    const TAU=Math.PI*2,mod=(v,n)=>(v%n+n)%n,wrap=v=>v-Math.round(v/16)*16;
    const clamp=v=>Math.max(0,Math.min(255,Math.round(v)));
    const tone=(c,n)=>c.map(v=>clamp(v+n));
    const hash=(x,y,k)=>{let n=Math.imul(x+83,374761393)^Math.imul(y+157,668265263)^Math.imul(k,1274126177);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
    const distance=(x,y,ax,ay,bx,by)=>{
      const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));
      return Math.hypot(x-ax-t*dx,y-ay-t*dy);
    };
    function bark(x,y,spruce){
      const base=spruce?[91,77,59]:[128,95,57],centers=spruce?[0,3,7,11,15]:[1,6,11,15];
      let d=9,side=0,part=0;
      for(let i=0;i<centers.length;i++){
        const shift=Math.sin(TAU*(y/16+i*.17))*(spruce?.48:.85)+Math.sin(TAU*y/8+i)*.22;
        const dx=wrap(x-centers[i]-shift);
        if(Math.abs(dx)<d){d=Math.abs(dx);side=dx;part=i;}
      }
      let light=(spruce?12:18)-d*(spruce?10:12)+(side<0?5:-3);
      if(d>(spruce?1.32:1.9))light-=18;
      const course=mod(y+part*(spruce?3:5),spruce?8:16);
      if((spruce?course<1.1:course>7&&course<8.1)&&d<1.8)light-=20;
      if(spruce&&course>1&&course<2&&side<.6)light+=9;
      if(!spruce){
        for(const [cx,cy] of [[5,5],[12,12]]){
          const dx=wrap(x-cx),dy=wrap(y-cy),r=Math.hypot(dx/1.8,dy/2.7);
          if(r<1.4)light=r<.48?-25:r<.78?9:r<1.05?-28:4;
        }
      }
      return tone(base,light+(hash(x,y,spruce?401:403)-.5)*5);
    }
    function endgrain(x,y,spruce){
      const base=spruce?[155,124,79]:[192,155,99],rim=spruce?[83,70,52]:[111,78,44];
      const edge=Math.min(x,y,15-x,15-y);
      if(edge<1.2)return tone(rim,(hash(x,y,411)-.5)*8+(edge===1?13:0));
      const dx=x-(spruce?6.4:8.2),dy=y-(spruce?8.3:6.7),angle=Math.atan2(dy,dx);
      const r=Math.hypot(dx*(spruce?1.04:.94),dy)+Math.sin(angle*3+.4)*.28;
      const ring=mod(r*(spruce?1.04:.76),2.6);
      let c=tone(base,ring<.48?-32:ring<.85?10:(hash(x,y,419)-.5)*6);
      if(r<1.05)c=tone(base,-30);
      const crack=(spruce?distance(x,y,6,8,3,14):distance(x,y,8,7,14,3));
      if(r>2.8&&crack<.42)c=tone(rim,-4);
      return c;
    }
    function boards(x,y,spruce){
      const cuts=[0,5,11,16],row=y<5?0:y<11?1:2,local=y-cuts[row],joint=[3,11,7][row];
      const base=spruce?[120,91,58]:[182,142,86],height=cuts[row+1]-cuts[row];
      const grain=Math.sin(TAU*(x/16+row*.21))*1.1+Math.sin(TAU*x/8+row)*.32;
      let c=tone(base,[3,-8,7][row]+(hash(x,y,431)-.5)*5);
      if(local===0)return tone(base,-37);
      if(local===1)c=tone(c,13);
      if(local===height-1)c=tone(c,-11);
      if(x===joint)return tone(base,-28);
      if(x===mod(joint+1,16)&&local>1)c=tone(c,9);
      if(local>1&&Math.abs(local-(2.5+grain*.55))<.35)c=tone(c,-13);
      const cx=spruce?5:12,cy=spruce?13:8,dx=wrap(x-cx),dy=y-cy;
      const k=Math.hypot(dx/2.8,dy/1.05);
      if(k<1.3&&local>1)c=tone(base,k<.42?-24:k<.72?4:k<1.05?-20:5);
      return c;
    }
    function familyBark(x,y,family){
      if(family==='birch'){
        let c=tone([213,209,184],Math.sin(TAU*x/16)*4+(hash(x,y,521)-.5)*7);
        const marks=[[1,3,2.8,.66],[8,2,1.7,.5],[13,7,3.1,.72],[5,10,2.3,.62],[0,14,2.4,.58],[11,14,1.6,.5]];
        for(const [cx,cy,rx,ry] of marks){
          const dx=wrap(x-cx),dy=wrap(y-cy),d=Math.abs(dx)/rx+Math.abs(dy)/ry;
          if(d<1)c=tone([66,67,57],Math.abs(dx)*4);
          else if(d<1.4&&dy<0)c=[238,232,203];
        }
        if(mod(x+Math.floor(y/4),9)===0&&mod(y,8)>3)c=tone(c,-10);
        return c;
      }
      if(family==='acacia'){
        // Unequal vertical plates and sparse cross fissures avoid a stepped row grid.
        let nearest=9,side=0,lane=0;
        const centers=[.6,4.9,10.2,14.2];
        for(let k=0;k<centers.length;k++){
          const bend=Math.sin(TAU*y/16+k*.93)*.72+Math.sin(TAU*y/8+k*1.7)*.24;
          const dx=wrap(x-centers[k]-bend);
          if(Math.abs(dx)<nearest){nearest=Math.abs(dx);side=dx;lane=k;}
        }
        let c=tone([104,103,87],13-nearest*8+(side<0?5:-4)+(hash(x,y,527)-.5)*8);
        if(nearest>1.65)c=tone([73,75,64],(hash(x,y,529)-.5)*6);
        for(const [cx,cy,tilt,span] of [[2.5,3.1,-.22,2.2],[8.2,10.4,.17,1.8],[13.1,6.6,-.34,2.1],[.3,14.2,.21,1.7]]){
          const dx=wrap(x-cx),dy=wrap(y-cy)-dx*tilt;
          if(Math.abs(dx)<span&&Math.abs(dy)<.38)c=tone([69,72,62],Math.abs(dx)*3);
          else if(Math.abs(dx)<span-.4&&dy>.38&&dy<1.1)c=tone(c,8);
        }
        if(lane===1&&nearest<.6&&y>5&&y<9)c=tone(c,-9);
        return c;
      }
      let c=tone([114,70,66],Math.sin(TAU*(x/16+.04*Math.sin(TAU*y/16)))*7+(hash(x,y,533)-.5)*6);
      for(const [cx,cy,rx] of [[2,3,2.7],[10,5,3.1],[5,11,2.3],[14,14,2.6]]){
        const dx=wrap(x-cx),dy=wrap(y-cy);
        if(Math.abs(dy)<.55&&Math.abs(dx)<rx)c=tone([165,112,100],-Math.abs(dx)*3);
        else if(dy>.55&&dy<1.4&&Math.abs(dx)<rx-.6)c=tone(c,-19);
      }
      const fissure=wrap(x-7-Math.sin(TAU*y/16)*.6);
      if(Math.abs(fissure)<.5&&y>5&&y<12)c=[78,47,47];
      return c;
    }
    function familyEnd(x,y,family){
      const spec=family==='birch'?{base:[224,205,158],rim:[197,195,168],cx:7.1,cy:8.5,space:2.2,thin:.32}:
        family==='acacia'?{base:[194,119,65],rim:[83,84,72],cx:8.4,cy:6.8,space:2.8,thin:.53}:
        {base:[207,153,135],rim:[99,61,59],cx:6.8,cy:7.8,space:2.5,thin:.36};
      const edge=Math.min(x,y,15-x,15-y);
      if(edge<1.0){
        if(family==='birch'&&((y===0||y===15)&&mod(x,7)<2))return [93,93,78];
        return tone(spec.rim,(hash(x,y,541)-.5)*7);
      }
      const dx=x-spec.cx,dy=y-spec.cy,angle=Math.atan2(dy,dx);
      let r=Math.hypot(dx*(family==='cherry'?1.1:.95),dy);
      if(family==='acacia')r=.66*r+.34*Math.max(Math.abs(dx),Math.abs(dy))*1.2;
      r+=Math.sin(angle*3+.8)*.22;
      const ring=mod(r,spec.space);
      let c=tone(spec.base,ring<spec.thin?-(family==='birch'?21:30):ring<spec.thin+.35?8:(hash(x,y,547)-.5)*5);
      if(r<.8)c=tone(spec.base,-24);
      const crack=family==='birch'?distance(x,y,7,9,2,13):family==='acacia'?distance(x,y,8,7,14,3):distance(x,y,7,8,12,14);
      if(r>3.2&&crack<.3)c=tone(spec.rim,-3);
      return c;
    }
    function familyBoards(x,y,family){
      const cuts=family==='birch'?[0,4,8,12,16]:family==='acacia'?[0,5,10,16]:[0,6,11,16];
      let row=0;while(row+1<cuts.length-1&&y>=cuts[row+1])row++;
      const local=y-cuts[row],height=cuts[row+1]-cuts[row],joint=(family==='birch'?[2,10,6,14]:family==='acacia'?[12,4,9]:[5,13,8])[row];
      const base=family==='birch'?[212,194,147]:family==='acacia'?[184,107,59]:[204,151,135];
      let c=tone(base,[4,-6,2,-3][row]+(hash(x,y,557)-.5)*4);
      if(local===0)return tone(base,family==='birch'?-23:-31);
      if(local===1)c=tone(c,11);
      if(local===height-1)c=tone(c,-7);
      if(x===joint)return tone(base,family==='birch'?-20:-27);
      const wave=Math.sin(TAU*x/16+row*.8),grainLine=family==='acacia'?2.6+wave*.8:family==='cherry'?2.5+wave*.55:2.3+wave*.25;
      if(local>1&&Math.abs(local-grainLine)<.38)c=tone(c,family==='birch'?-9:-14);
      if(family==='cherry'&&local>1&&Math.abs(local-(grainLine+1.3))<.25)c=tone(c,7);
      if(family==='acacia'){
        const k=Math.hypot(wrap(x-(row===1?12:6))/2.7,(local-3)/1.0);
        if(k<1.2&&local>1)c=tone(base,k<.35?-31:k<.65?6:k<.95?-21:5);
      }
      return c;
    }
    function familyWood(x,y,name){
      const family=name.startsWith('birch')?'birch':name.startsWith('acacia')?'acacia':'cherry';
      return name.endsWith('Bark')?familyBark(x,y,family):name.endsWith('End')?familyEnd(x,y,family):familyBoards(x,y,family);
    }
    const leafSeeds=[[1,2,-.65],[7,1,.35],[13,4,-.3],[4,8,.65],[10,10,-.6],[1,14,.3],[13,15,.55]];
    function broadLeaf(x,y,birch){
      const base=birch?[72,107,36]:[48,86,35],body=birch?[113,151,55]:[85,127,48];
      let best=Infinity,info=null;
      for(let i=0;i<leafSeeds.length;i++){
        const [cx,cy,angle]=leafSeeds[i],dx=wrap(x-cx),dy=wrap(y-cy),co=Math.cos(angle),si=Math.sin(angle);
        const u=dx*co+dy*si,v=-dx*si+dy*co;
        const d=birch?Math.abs(u)/2.5+Math.abs(v)/2.2:(u/3.4)**2+(v/2.1)**2;
        if(d<best){best=d;info={u,v,i};}
      }
      if(best>1.18)return tone(base,(hash(x,y,441)-.5)*6);
      const {u,v,i}=info;
      let c=tone(body,(1-best)*17-v*3+(i%3-1)*5);
      if(best>.84)c=tone(c,-17);
      if(Math.abs(v)<.37&&Math.abs(u)<(birch?1.8:2.5))c=tone(c,12);
      if(birch&&Math.abs(v-mod(u+2,1.8)*.6)<.2)c=tone(c,-7);
      return c;
    }
    function needles(x,y){
      let nearest=9,branch=9,signed=0;
      for(const [cx,cy] of [[1,2],[8,4],[4,11],[13,13]]){
        const dx=wrap(x-cx),dy=wrap(y-cy);
        branch=Math.min(branch,distance(dx,dy,-3,1,3,-1));
        for(let k=-2;k<=2;k++){
          const y0=-k*.32,d=distance(dx,dy,k,y0,k+1.55,y0-2.0);
          if(d<nearest){nearest=d;signed=dy-y0;}
          const e=distance(dx,dy,k,y0,k+.5,y0+1.7);
          if(e<nearest){nearest=e;signed=dy-y0;}
        }
      }
      if(nearest<.52)return tone([73,119,87],signed<0?9:-9);
      if(nearest<.92)return [40,79,61];
      if(branch<.65)return [65,78,52];
      return tone([42,72,56],(hash(x,y,449)-.5)*7);
    }
    function acacia(x,y){
      // Unequal twig groups and oblique paired leaflets avoid a woven row pattern.
      const groups=[
        {a:-.43,nodes:[[1.1,4.1],[4.4,2.7],[7.1,1.5]]},
        {a:-.19,nodes:[[7.5,10.8],[11.0,10.1],[14.3,9.5]]},
        {a:-.57,nodes:[[.6,14.6],[3.7,12.6]]}
      ];
      let best=9,shape=null,branch=9;
      for(let g=0;g<groups.length;g++){
        const {a,nodes}=groups[g],tx=Math.cos(a),ty=Math.sin(a),nx=-ty,ny=tx;
        for(let k=0;k<nodes.length;k++){
          const [cx,cy]=nodes[k],dx=wrap(x-cx),dy=wrap(y-cy);
          branch=Math.min(branch,distance(dx,dy,-tx*1.8,-ty*1.8,tx*1.8,ty*1.8));
          for(const side of [-1,1]){
            const offset=1.25+(k%2)*.2,lx=wrap(x-(cx+nx*side*offset+tx*.2)),ly=wrap(y-(cy+ny*side*offset+ty*.2));
            const angle=a+side*(1.03+(g%2)*.18),co=Math.cos(angle),si=Math.sin(angle);
            const u=lx*co+ly*si,v=-lx*si+ly*co,d=(u/(1.7+(k%2)*.18))**2+(v/.94)**2;
            if(d<best){best=d;shape={u,v,g,k};}
          }
        }
      }
      if(best<1.12){
        let c=tone([108,139,58],(1-best)*14-shape.v*4+(shape.g-1)*3);
        if(best>.80)c=tone(c,-15);
        if(Math.abs(shape.v)<.25&&Math.abs(shape.u)<1.25)c=tone(c,10);
        return c;
      }
      if(branch<.38)return [79,94,44];
      return tone([61,89,39],(hash(x,y,457)-.5)*6);
    }
    function blossoms(x,y){
      let d=9,core=9,light=0;
      for(const [cx,cy] of [[2,3],[10,1],[7,9],[14,13],[0,14]]){
        const dx=wrap(x-cx),dy=wrap(y-cy);core=Math.min(core,Math.hypot(dx,dy));
        for(let k=0;k<5;k++){
          const a=k*TAU/5-.7,px=Math.cos(a)*1.55,py=Math.sin(a)*1.55,e=Math.hypot((dx-px)/1.7,(dy-py)/1.45);
          if(e<d){d=e;light=-dy*4-dx*2;}
        }
      }
      if(core<.82)return [245,205,147];
      if(d<1.0)return tone([224,144,171],light+(1-d)*13);
      if(d<1.3)return [174,92,128];
      return tone([153,81,115],(hash(x,y,461)-.5)*6);
    }
    function painter(){
      const data=new Uint8ClampedArray(24*24*4);
      const put=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>23||y>23)return;const i=(x+y*24)*4;data[i]=c[0];data[i+1]=c[1];data[i+2]=c[2];data[i+3]=255;};
      const inside=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<24&&y<24&&data[(x+y*24)*4+3])put(x,y,c);};
      const rect=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)put(i,j,c);};
      const line=(ax,ay,bx,by,c,width=1)=>{const n=Math.max(Math.abs(bx-ax),Math.abs(by-ay))*3||1;for(let i=0;i<=n;i++){const x=Math.round(ax+(bx-ax)*i/n),y=Math.round(ay+(by-ay)*i/n);rect(x,y,width,width,c);}};
      const poly=(points,c)=>{for(let y=0;y<24;y++)for(let x=0;x<24;x++){let yes=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if((yi>y+.5)!==(yj>y+.5)&&(x+.5)<(xj-xi)*(y+.5-yi)/(yj-yi)+xi)yes=!yes;}if(yes)put(x,y,c);}};
      const ellipse=(cx,cy,rx,ry,c)=>{for(let y=0;y<24;y++)for(let x=0;x<24;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<=1)put(x,y,tone(c,((1-d)*10-(y-cy)*2-(x-cx))*1.2));}};
      const leaf=(ax,ay,bx,by,width,c)=>{const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;poly([[ax,ay],[ax+dx*.36+nx*width,ay+dy*.36+ny*width],[bx,by],[ax+dx*.55-nx*width,ay+dy*.55-ny*width]],c);line(ax,ay,bx,by,tone(c,12));};
      return{data,put,inside,rect,line,poly,ellipse,leaf};
    }
    function plant(name){
      const p=painter(),{data,put,inside,rect,line,poly,ellipse,leaf}=p;
      if(name==='flower'){
        rect(11,10,2,14,[57,107,43]);line(11,14,6,16,[61,111,44],2);line(12,13,17,11,[61,111,44],2);
        leaf(10,17,4,14,2.0,[87,139,53]);leaf(13,14,19,11,2.0,[98,151,62]);
        for(const [x,y,rx,ry] of [[8,5,3.5,2.8],[13,4,3.3,3],[16,7,3.2,2.7],[14,10,3.2,2.7],[9,11,3.4,2.8],[6,8,2.7,3]])ellipse(x,y,rx,ry,[243,220,134]);
        ellipse(11,7,4,3.5,[219,161,42]);ellipse(10,6,2,1.5,[250,210,89]);
        for(const [x,y] of [[10,7],[13,8],[12,5]])inside(x,y,[174,115,34]);
        line(11,15,11,23,[113,158,64]);
      }else if(name==='tallgrass'){
        rect(8,22,9,2,[58,103,39]);
        const blades=[[8,23,2,7,2.2],[10,23,6,2,2.2],[11,23,10,6,1.9],[13,23,13,1,2.1],[14,23,17,4,2.2],[16,23,21,8,2.0],[12,23,5,11,2.3]];
        for(let i=0;i<blades.length;i++){
          const [bx,by,tx,ty,w]=blades[i],mx=bx+(tx-bx)*.48;
          poly([[bx-w/2,by],[mx-w*.65,(by+ty)/2],[tx,ty],[mx+w*.55,(by+ty)/2],[bx+w/2,by]],[60+i%3*10,108+i%3*12,40+i%2*8]);
          line(bx,by,tx,ty,[99+i%3*8,149+i%3*8,55+i%2*8]);
        }
        rect(9,23,7,1,[67,112,42]);
      }else if(name==='oakSapling'){
        rect(11,10,2,14,[98,68,38]);line(11,14,6,9,[110,78,40],2);line(12,12,17,8,[110,78,40],2);
        ellipse(6,9,4.8,4,[64,107,39]);ellipse(13,6,5,4.8,[76,123,43]);ellipse(18,10,3.8,3.7,[61,103,37]);
        ellipse(5,7,2.7,2,[93,145,53]);ellipse(12,4,2.8,2,[103,154,59]);
        for(const [x,y] of [[5,9],[7,11],[12,8],[16,7],[18,11]])inside(x,y,[48,91,34]);
        line(11,15,11,23,[155,111,57]);
      }else if(name==='spruceSapling'){
        rect(11,3,2,21,[86,67,43]);
        poly([[12,1],[8,7],[10,7],[6,10],[18,10],[14,7],[16,7]],[54,97,69]);
        poly([[12,5],[5,13],[7,13],[3,16],[20,16],[16,13],[18,13]],[43,83,63]);
        poly([[11,10],[3,19],[5,19],[2,21],[21,21],[18,18],[19,18]],[35,72,55]);
        line(10,5,8,8,[89,136,94]);line(9,11,6,14,[78,123,85]);line(9,16,5,19,[67,113,77]);
        for(const [x,y] of [[11,6],[12,9],[10,12],[14,14],[9,17],[15,19]])inside(x,y,[43,88,66]);
        rect(11,22,1,2,[145,111,61]);
      }else if(name==='birchSapling'){
        rect(11,7,2,17,[166,170,141]);line(11,14,6,10,[154,162,123],2);line(12,12,17,8,[154,162,123],2);
        poly([[11,1],[16,5],[13,10],[8,8],[7,4]],[113,151,52]);
        poly([[5,6],[10,10],[7,15],[2,12],[2,9]],[94,135,43]);
        poly([[17,4],[21,8],[18,13],[13,10],[14,7]],[119,156,55]);
        poly([[12,10],[17,13],[13,17],[9,14]],[86,128,40]);
        line(10,4,12,8,[151,180,74]);line(4,9,6,12,[134,168,62]);line(16,7,18,10,[157,184,80]);
        rect(11,17,1,7,[225,220,184]);inside(11,19,[80,87,64]);inside(12,22,[89,96,70]);
      }else if(name==='acaciaSapling'){
        line(10,23,12,15,[92,80,53],2);line(12,15,8,9,[111,94,57],2);line(12,15,18,10,[111,94,57],2);
        ellipse(7,9,6,3,[86,116,44]);ellipse(14,7,6.2,3,[105,134,53]);ellipse(19,10,3,2.5,[80,109,41]);
        ellipse(7,7.5,3.8,1.5,[124,151,64]);ellipse(15,5.5,3.8,1.4,[139,161,74]);
        for(const [x,y] of [[5,10],[9,11],[13,8],[17,9],[19,11]])inside(x,y,[62,91,36]);
        line(10,23,12,16,[159,130,75]);
      }else if(name==='cherrySapling'){
        rect(11,10,2,14,[94,55,53]);line(11,13,6,8,[119,70,64],2);line(12,12,18,9,[119,70,64],2);
        ellipse(6,7,4.8,4,[188,105,143]);ellipse(13,5,5,4,[224,142,169]);ellipse(18,10,4,4,[202,119,153]);
        for(const [cx,cy] of [[5,5],[11,4],[15,7],[19,9],[7,9]]){
          for(const [dx,dy] of [[0,0],[-1,0],[1,0],[0,-1],[0,1]])inside(cx+dx,cy+dy,[249,193,204]);
          inside(cx,cy,[234,189,124]);
        }
        for(const [x,y] of [[5,9],[10,7],[16,11],[18,13]])inside(x,y,[153,77,116]);
        line(11,15,11,23,[164,102,82]);
      }
      return data;
    }
    function makeTile(name,size=24,parent){
      if(size!==24||!keys.includes(name))throw new RangeError('Unknown C17 native24 material');
      if(cross.includes(name))return plant(name);
      if(leaves.includes(name)&&(!parent||parent.length!==size*size*4))throw new RangeError('Original leaf alpha required');
      const data=new Uint8ClampedArray(size*size*4);
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const u=Math.floor(x*16/size),v=Math.floor(y*16/size),i=(x+y*size)*4;
        let c;
        if(name==='oakBark'||name==='spruceBark')c=bark(u,v,name==='spruceBark');
        else if(name==='oakEnd'||name==='spruceEnd')c=endgrain(u,v,name==='spruceEnd');
        else if(name==='planks'||name==='darkPlanks')c=boards(u,v,name==='darkPlanks');
        else if(moreWood.includes(name))c=familyWood(u,v,name);
        else if(name==='oakLeaves'||name==='birchLeaves')c=broadLeaf(u,v,name==='birchLeaves');
        else if(name==='spruceLeaves')c=needles(u,v);
        else if(name==='acaciaLeaves')c=acacia(u,v);
        else c=blossoms(u,v);
        const grain=(hash(x,y,keys.indexOf(name)+479)-.5)*2;
        data[i]=clamp(c[0]+grain);data[i+1]=clamp(c[1]+grain);data[i+2]=clamp(c[2]+grain);
        data[i+3]=leaves.includes(name)?parent[i+3]:255;
      }
      return data;
    }
    return Object.freeze({version:'c17-wood-foliage-v4',keys,wood:Object.freeze([...wood,...moreWood]),leaves,cross,makeTile});
  })();
  // C18 masonry and ore study: build-time native24 pixels only. IDs, alpha and legacy packs are preserved.
  const C18_MATERIALS=(()=>{
    const masonry=Object.freeze(['cobble','brick','stoneBricks','sandstoneDiversity','sandstoneBricks','limestoneDiversity','limestoneTiles','slateTiles','mossyCobbleDiversity','quartz','quartzBricks','quartzPillar','quartzEnd','mossyStoneBricks']);
    const ores=Object.freeze(['coalOre','ironOre','goldOre','diamondOre','copperOre','quartzOre']);
    const metals=Object.freeze(['rivetedIron','copperPlate','cutCopper','patinaCopper','engravedCopper']);
    const keys=Object.freeze([...masonry,...ores,...metals]);
    const mod=(n,m)=>(n%m+m)%m,wrap=n=>n-Math.round(n/24)*24;
    const clip=n=>Math.max(0,Math.min(255,Math.round(n))),tone=(c,n)=>c.map(v=>clip(v+n));
    const hash=(x,y,k)=>{let n=Math.imul(x+101,374761393)^Math.imul(y+211,668265263)^Math.imul(k,1274126177);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
    const stoneSeeds=Object.freeze([[3,3],[11,2],[20,4],[6,10],[15,11],[22,14],[2,19],[11,21],[18,20]]);
    const bend=Object.freeze([0,0,0,0,1,1,2,2,2,1,1,0,0,-1,-1,-2,-2,-2,-1,-1,0,0,0,0]);
    function cell(x,y){
      let best=null,second=Infinity;
      for(let i=0;i<stoneSeeds.length;i++){
        const dx=wrap(x-stoneSeeds[i][0]),dy=wrap(y-stoneSeeds[i][1]),d=dx*dx+dy*dy*.86;
        if(!best||d<best.d){if(best)second=best.d;best={i,dx,dy,d};}else if(d<second)second=d;
      }
      return {...best,gap:Math.sqrt(second)-Math.sqrt(best.d)};
    }
    function moss(x,y,seam,base){
      let best=null;
      for(const[cx,cy,rx,ry]of[[2,4,4.8,3.4],[15,14,4.6,4.2],[22,22,5.0,3.8]]){
        const dx=wrap(x-cx),dy=wrap(y-cy),d=(dx/rx)**2+(dy/ry)**2;
        if(!best||d<best.d)best={d,dx,dy};
      }
      const f=best,edge=.91+(hash(x>>1,y>>1,803)-.5)*.22;
      if(f.d>edge||(seam>2.1&&f.d>.38))return base;
      const c=f.d>.65?[65,85,48]:f.dx+f.dy<-1?[111,132,69]:[86,108,55];
      return tone(c,(hash(x,y,805)-.5)*3);
    }
    function cobble(x,y,overgrown){
      const f=cell(x,y),pal=[[135,144,145],[146,151,147],[125,136,142],[151,151,139],[133,143,143],[120,133,140],[145,148,138],[131,139,138],[154,156,146]];
      let c=f.gap<.56?[63,73,76]:tone(pal[f.i],f.gap<1.38?(f.dx+f.dy<0?17:-16):f.dx+f.dy<-2?5:-2);
      if(f.gap>1.6&&f.i===3&&f.dx>0&&f.dx<2&&f.dy>=0&&f.dy<1.5)c=[127,133,127];
      if(overgrown)c=moss(x,y,f.gap,c);
      return tone(c,(hash(x,y,811)-.5)*3);
    }
    function course(x,y,width,height,lap){
      const row=Math.floor(y/height),offset=mod(row*lap,width),u=mod(x+offset,width),v=mod(y,height),column=mod(Math.floor((x+offset)/width),24/width);
      return {u,v,row,column,width,height};
    }
    function masonryPixel(name,x,y){
      if(name==='cobble'||name==='mossyCobbleDiversity')return cobble(x,y,name==='mossyCobbleDiversity');
      if(name==='sandstoneDiversity'){
        const band=mod(y+Math.floor(bend[x]/2),12),pal=[[211,184,129],[220,195,145],[232,209,162],[226,202,152],[218,190,136],[222,196,143]];
        let c=pal[Math.floor(band/2)];
        if((x>=4&&x<=7&&y===6)||(x>=17&&x<=20&&y===17))c=[197,171,121];
        if((x===8&&y===6)||(x===21&&y===17))c=[240,218,173];
        return tone(c,(hash(x,y,821)-.5)*4);
      }
      if(name==='limestoneDiversity'){
        const band=mod(y+Math.floor(bend[x]/2),24),d=Math.min(Math.abs(band-7),Math.abs(band-18));
        let c=tone([205,205,182],d<1?-5:d<3?2:0);
        // Broken low-contrast inclusions avoid a repeated complete shell/wallpaper glyph.
        if((x>=4&&x<=6&&y===10)||(x===7&&y===11)||(x>=16&&x<=18&&y===21))c=[197,201,180];
        if((x>=4&&x<=5&&y===9)||(x===19&&y===20))c=[213,213,190];
        return tone(c,(hash(x>>1,y>>1,827)-.5)*4+(hash(x,y,829)-.5)*2);
      }
      if(name==='quartz'){
        let c=[235,233,216];
        // Discontinuous mineral threads; restrained contrast keeps large walls calm.
        if((x>=2&&x<=5&&y===x+3)||(x>=6&&x<=9&&y===9)||(x>=15&&x<=18&&y===x-1)||(x===19&&y===19))c=[215,218,207];
        else if((x>=3&&x<=6&&y===x+3)||(x>=7&&x<=9&&y===10)||(x>=16&&x<=18&&y===x)||(x===19&&y===20))c=[226,228,213];
        if(y>=1&&y<=3&&x>=10&&x<=16)c=[239,237,222];
        return tone(c,(hash(x,y,839)-.5)*2);
      }
      if(name==='quartzPillar'){
        const u=x%6,flute=[-22,-8,11,6,1,-9][u];
        let c=tone([231,230,213],flute);
        if((y===7&&u>=2&&u<=3)||(y===18&&u===3))c=tone(c,-5);
        return tone(c,(hash(x,y,841)-.5)*2);
      }
      if(name==='quartzEnd'){
        const edge=Math.min(x,y,23-x,23-y),top=x+y<23,ring=edge===2||edge===7;
        let c=ring?(top?[196,201,190]:[209,211,196]):edge===3||edge===8?(top?[246,244,226]:[224,224,207]):[231,230,212];
        if(edge===0)c=top?[239,237,219]:[209,213,198];
        if(edge>8&&Math.abs(x-y)<=1)c=[239,237,220];
        return tone(c,(hash(x,y,853)-.5)*2);
      }
      let f,pal,mortar,bevel;
      if(name==='brick'){
        f=course(x,y,12,6,6);pal=[[165,86,63],[180,104,75],[153,78,59],[175,93,63]];mortar=[111,106,84];bevel=11;
      }else if(name==='sandstoneBricks'){
        f=course(x,y,12,8,4);pal=[[220,195,146],[230,207,162],[214,188,139],[224,199,151]];mortar=[164,143,105];bevel=9;
      }else if(name==='limestoneTiles'){
        f=course(x,y,12,12,0);pal=[[202,205,182],[215,215,190],[208,211,187]];mortar=[143,153,137];bevel=8;
      }else if(name==='slateTiles'){
        f=course(x,y,12,8,4);pal=[[80,96,109],[92,105,115],[72,90,105],[86,100,110]];mortar=[39,55,68];bevel=13;
      }else if(name==='quartzBricks'){
        f=course(x,y,12,8,4);pal=[[235,232,214],[230,230,214],[241,236,219]];mortar=[181,187,177];bevel=7;
      }else{
        f=course(x,y,12,12,6);pal=[[136,147,151],[147,155,157],[127,140,147],[151,157,155]];mortar=[76,88,94];bevel=13;
      }
      const {u,v,row,column,width,height}=f,index=(column+row*2)%pal.length;
      let c=(u===0||v===0)?mortar:tone(pal[index],u===1||v===1?bevel:u===width-1||v===height-1?-bevel-3:0);
      if(u>1&&u<width-1&&v>1&&v<height-1){
        if(name==='brick'){
          if(v===3&&u>=3&&u<=6)c=tone(c,-5);
          if((column+row)%3===0&&u===width-2&&v===2)c=tone(mortar,7);
        }else if(name==='slateTiles'){
          if(v===3&&u>=2&&u<=8)c=tone(c,7);
          if(v===5&&u>=6)c=tone(c,-8);
        }else if(name==='sandstoneBricks'){
          if(v===4&&u>=3&&u<=9)c=tone(c,-4);
        }else if(name==='limestoneTiles'){
          if(column===row&&u>=6&&u<=8&&v===u-2)c=tone(c,-13);
          if(u===7&&v===8)c=tone(c,7);
        }else if(name==='stoneBricks'||name==='mossyStoneBricks'){
          if((row+column)%2===0&&u>=5&&u<=7&&v===u-1)c=tone(c,-18);
          if((row+column)%2===0&&u===7&&v===7)c=tone(c,-12);
        }else if(name==='quartzBricks'&&v===5&&u>=3&&u<=6)c=tone(c,-4);
      }
      if(name==='mossyStoneBricks')c=moss(x,y,Math.min(u,v,width-u,height-v),c);
      return tone(c,(hash(x,y,863+keys.indexOf(name))-.5)*3);
    }
    function metalPixel(name,x,y){
      // Native24 sheet construction: narrow joints, quiet brushing and small
      // fasteners. Oxidation is a broad mineral field, not isolated noise dots.
      const iron=name==='rivetedIron',patina=name==='patinaCopper';
      const cut=name==='cutCopper'||patina,width=cut?12:24,u=x%width,v=y%width;
      const panel=Math.floor(x/12)+Math.floor(y/12)*2;
      const brush=(hash(x>>2,y,911)-.5)*3+(hash(x,y,919)-.5)*1.2;
      let base=iron?[143,162,168]:cut?
        [[193,122,78],[181,110,70],[204,132,86],[188,115,73]][panel]:[190,119,77];
      let c=tone(base,(iron?3:2)*(1-y/23)+brush);
      if(iron){
        // Broad, subdued rolled-steel planes retain room for dynamic lighting.
        c=tone(c,y<8?5:y>16?-3:0);
        if((y===8&&x>=7&&x<=12)||(y===16&&x>=12&&x<=17))c=tone(c,5);
      }else if(patina){
        const gx=x/7,gy=y/7,ix=Math.floor(gx),iy=Math.floor(gy),tx=gx-ix,ty=gy-iy;
        const fx=tx*tx*(3-2*tx),fy=ty*ty*(3-2*ty);
        const a=hash(ix,iy,929)*(1-fx)+hash(ix+1,iy,929)*fx;
        const b=hash(ix,iy+1,929)*(1-fx)+hash(ix+1,iy+1,929)*fx;
        const field=a*(1-fy)+b*fy+(hash(x>>1,y>>1,937)-.5)*.14;
        c=field>.68?tone([163,105,66],brush):
          field>.58?tone([109,130,94],brush):
          tone([69,135,119],brush+(field<.3?7:0)+(panel%2?3:0));
        if(u===0||v===0)return tone([40,85,76],brush*.4);
        if(u===1||v===1)return tone(c,21);
        if(u===width-1||v===width-1)return tone(c,-19);
        return c;
      }else{
        c=tone(c,(hash(x>>3,y,923)-.5)*2);
        if(name==='engravedCopper'){
          // Three shallow, continuous wave cuts; no arrow/chevron emblem.
          const wave=Math.round(2*Math.sin(x*Math.PI/12)),groove=mod(y-wave,8);
          if(groove===3)c=[118,76,53];
          else if(groove===4)c=[220,153,99];
          else if(groove===5)c=tone(c,4);
          return tone(c,brush*.3);
        }
        if(cut&&((v===6&&u>=4&&u<=7)||(panel===2&&v===8&&u===3)))c=tone(c,6);
      }
      if(u===0||v===0)return iron?[64,81,90]:[103,65,47];
      if(u===1||v===1)return iron?[191,205,204]:[225,157,101];
      if(u===width-1||v===width-1)return iron?[105,124,133]:[151,88,59];
      if(!cut){
        const dx=Math.min(Math.abs(x-4),Math.abs(x-19)),dy=Math.min(Math.abs(y-4),Math.abs(y-19));
        if(dx<=1&&dy<=1){
          const cx=x<12?4:19,cy=y<12?4:19;
          if(dx===1&&dy===1)return c;
          if(x<cx||y<cy)return iron?[215,224,217]:[238,176,112];
          if(x>cx||y>cy)return iron?[76,96,107]:[119,72,48];
          return iron?[151,171,174]:[196,127,82];
        }
      }
      return c;
    }
    function mineral(name){
      const P=pixelPainter(24),{data,put,rect,line,poly}=P;
      // All six deposits share the accepted C16 host rock; only the inclusions differ.
      data.set(C16_TERRAIN.makeTile('stone',24));
      if(name==='coalOre'){
        // Unequal fractured pieces and small shards replace four round rosettes.
        poly([[2,4],[5,2],[9,3],[10,5],[8,6],[8,9],[5,8],[4,6],[2,6]],[62,72,77]);
        poly([[3,4],[5,3],[8,4],[8,6],[7,8],[5,7],[4,5]],[33,41,45]);
        poly([[18,4],[21,6],[20,9],[22,10],[20,13],[17,15],[16,12],[17,9],[16,7]],[60,70,75]);
        poly([[18,6],[20,6],[19,9],[20,11],[18,13],[17,12],[18,9],[17,8]],[30,39,44]);
        poly([[4,16],[8,14],[11,16],[14,16],[13,20],[10,22],[7,21],[3,19]],[58,68,72]);
        poly([[5,17],[8,15],[10,17],[12,17],[11,20],[8,20],[5,19]],[35,42,44]);
        poly([[12,3],[14,3],[13,5],[12,4]],[49,59,64]);
        poly([[20,19],[22,20],[21,22],[19,21]],[44,54,59]);
        line(4,3,6,3,[77,85,86]);line(17,6,17,8,[72,81,83]);
        line(5,16,7,15,[75,83,82]);line(8,17,10,18,[54,63,65]);
        put(7,6,[24,32,36]);put(19,11,[23,31,35]);put(10,19,[23,31,34]);
      }else if(name==='ironOre'){
        for(const [x,y,w,ht]of[[2,3,7,6],[15,2,6,7],[5,14,8,6],[17,16,6,6]]){
          poly([[x+1,y],[x+w-2,y],[x+w,y+2],[x+w-1,y+ht-1],[x+2,y+ht],[x,y+ht-2]],[87,88,81]);
          poly([[x+1,y+1],[x+w-2,y+1],[x+w-1,y+3],[x+w-2,y+ht-1],[x+2,y+ht-1],[x+1,y+ht-3]],[163,119,88]);
          line(x+2,y+1,x+w-3,y+1,[208,166,119]);line(x+1,y+2,x+2,y+3,[189,143,101]);
          line(x+3,y+ht-2,x+w-2,y+ht-2,[127,83,64]);put(x+w-3,y+3,[181,136,97]);
        }
      }else if(name==='goldOre'){
        // Solid angular inclusions vary in length and direction. Avoid open
        // bent strokes, which read as repeated chevrons in the close RC1 view.
        poly([[2,4],[4,2],[8,3],[10,5],[8,7],[5,6],[3,7]],[100,91,64]);
        poly([[3,4],[5,3],[8,4],[8,5],[6,6],[4,5]],[205,153,50]);
        poly([[17,4],[20,5],[20,8],[18,10],[19,12],[16,13],[15,10],[16,8]],[95,87,62]);
        poly([[17,5],[19,6],[18,8],[17,10],[18,11],[16,12],[16,9]],[192,140,44]);
        poly([[3,18],[5,15],[8,14],[10,16],[12,16],[11,19],[8,21],[6,19]],[97,87,58]);
        poly([[4,18],[6,16],[8,15],[9,17],[11,17],[9,19],[7,19],[6,18]],[203,151,48]);
        poly([[15,20],[18,18],[22,18],[21,21],[18,22],[16,21]],[100,90,59]);
        poly([[17,20],[19,19],[21,19],[20,20],[18,21]],[188,136,43]);
        line(4,3,6,3,[239,191,77]);put(7,4,[224,172,59]);put(5,5,[159,111,36]);
        line(17,5,17,7,[233,183,68]);put(16,10,[221,169,56]);put(18,6,[250,211,108]);
        line(5,17,7,15,[232,182,66]);put(9,17,[245,200,89]);put(8,19,[158,112,37]);
        line(18,19,20,19,[232,178,62]);put(18,20,[216,163,49]);
        put(12,11,[120,100,59]);put(13,11,[203,150,46]);put(12,12,[174,126,39]);
      }else if(name==='diamondOre'){
        for(const[cx,cy,rx,ry]of[[5,5,4,4],[18,5,3,4],[10,17,4,5],[21,19,2,3]]){
          poly([[cx,cy-ry],[cx+rx,cy-1],[cx+rx-1,cy+ry-1],[cx-1,cy+ry],[cx-rx,cy+1],[cx-rx+1,cy-ry+1]],[59,88,99]);
          poly([[cx,cy-ry+1],[cx+rx-1,cy],[cx+rx-2,cy+ry-2],[cx-1,cy+ry-1],[cx-rx+1,cy+1],[cx-rx+2,cy-ry+2]],[65,181,187]);
          poly([[cx,cy-ry+1],[cx+1,cy],[cx-rx+1,cy+1],[cx-rx+2,cy-ry+2]],[164,233,215]);
          poly([[cx+1,cy],[cx+rx-1,cy],[cx+rx-2,cy+ry-2],[cx-1,cy+ry-1]],[34,133,158]);
          put(cx,cy-ry+1,[215,249,229]);put(cx-1,cy+1,[103,212,207]);
        }
      }else if(name==='copperOre'){
        for(const[x,y,w,ht]of[[2,2,7,7],[15,3,7,6],[6,13,8,7],[18,17,5,5]]){
          poly([[x+1,y],[x+w-2,y],[x+w,y+2],[x+w-1,y+ht-1],[x+2,y+ht],[x,y+ht-2]],[77,87,79]);
          poly([[x+1,y+1],[x+w-2,y+1],[x+w-1,y+3],[x+w-2,y+ht-1],[x+2,y+ht-1],[x+1,y+ht-2]],[177,105,61]);
          line(x+2,y+1,x+w-3,y+1,[232,168,101]);line(x+1,y+2,x+1,y+ht-3,[208,135,75]);
          line(x+3,y+ht-2,x+w-2,y+ht-2,[118,75,54]);rect(x+w-3,y+ht-3,2,2,[68,125,105]);put(x+w-3,y+ht-3,[105,155,126]);
        }
      }else{
        for(const[x,y,w,ht]of[[3,2,5,8],[15,3,6,7],[8,14,6,9],[19,16,4,7]]){
          poly([[x+2,y],[x+w,y+2],[x+w-1,y+ht-2],[x+w-3,y+ht],[x,y+ht-2],[x+1,y+2]],[81,99,105]);
          poly([[x+2,y+1],[x+w-1,y+2],[x+w-2,y+ht-2],[x+w-3,y+ht-1],[x+1,y+ht-2],[x+2,y+2]],[204,217,211]);
          poly([[x+2,y+1],[x+3,y+2],[x+2,y+ht-2],[x+1,y+ht-2],[x+2,y+2]],[245,244,223]);
          line(x+w-2,y+3,x+w-3,y+ht-2,[154,179,184]);put(x+2,y+1,[255,251,230]);
        }
      }
      return data;
    }
    function makeTile(name,size=24){
      if(size!==24||!keys.includes(name))throw new RangeError('Unknown C18 native24 masonry or ore');
      if(ores.includes(name))return mineral(name);
      const data=new Uint8ClampedArray(24*24*4);
      for(let y=0;y<24;y++)for(let x=0;x<24;x++){
        const c=metals.includes(name)?metalPixel(name,x,y):masonryPixel(name,x,y),i=(x+y*24)*4;
        data[i]=c[0];data[i+1]=c[1];data[i+2]=c[2];data[i+3]=255;
      }
      return data;
    }
    return Object.freeze({version:'c18-masonry-ore-metal-v3',keys,masonry,ores,metals,makeTile});
  })();
  // C19 architectural surfaces and woven wool. Native24-only; existing IDs,
  // recipe data, face mappings, legacy pixels and the C16-C18 studies stay intact.
  const C19_MATERIALS=(()=>{
    const construction=Object.freeze(['smoothStone','polishedBasalt','chiseledStone','terracottaTiles','pinkGranite','ceramicIvory','ceramicRed','ceramicOchre','ceramicGreen','ceramicBlue','ceramicBlack','checkerStone','packedEarth','firedEarthBricks']);
    const wool=Object.freeze(['wool','pinkWool','redWool','blueWool','yellowWool','greenWool','purpleWool','orangeWool','cyanWool','blackWool']);
    const keys=Object.freeze([...construction,...wool]);
    const mod=(v,n)=>(v%n+n)%n,wrap=v=>v-Math.round(v/24)*24;
    const clip=v=>Math.max(0,Math.min(255,Math.round(v))),tone=(c,n)=>c.map(v=>clip(v+n));
    const mix=(a,b,t)=>a.map((v,i)=>clip(v*(1-t)+b[i]*t));
    const hash=(x,y,k)=>{let n=Math.imul(x+137,374761393)^Math.imul(y+251,668265263)^Math.imul(k,1274126177);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
    const woolColors=Object.freeze({wool:[224,224,214],pinkWool:[217,155,160],redWool:[170,59,56],blueWool:[65,93,169],yellowWool:[221,182,58],greenWool:[75,133,67],purpleWool:[130,74,159],orangeWool:[222,128,50],cyanWool:[65,164,176],blackWool:[48,50,58]});
    const ceramicColors=Object.freeze({ceramicIvory:[[221,208,180],[139,129,110]],ceramicRed:[[177,81,62],[101,51,44]],ceramicOchre:[[202,150,61],[119,89,44]],ceramicGreen:[[62,129,96],[34,77,62]],ceramicBlue:[[57,128,160],[33,75,96]],ceramicBlack:[[62,68,81],[30,35,45]]});
    // Unequal interlocking feldspar/quartz/mica grains, with no artificial grout.
    const graniteSeeds=Object.freeze([[1,1],[5,2],[10,1],[15,2],[20,1],[23,4],[3,5],[7,6],[12,5],[17,6],[21,8],[0,9],[4,10],[9,9],[14,10],[18,11],[23,12],[2,14],[6,15],[11,14],[16,15],[21,16],[0,19],[4,20],[9,19],[14,20],[18,19],[23,21],[6,23],[11,23],[17,23]]);
    const graniteColors=Object.freeze([[184,137,123],[213,169,148],[232,204,178],[155,113,105],[121,105,100],[199,153,136],[223,186,160]]);
    const granitePalette=Object.freeze([0,5,1,2,0,6,3,1,0,5,2,1,6,3,0,1,5,2,0,6,1,3,5,0,2,1,6,0,3,5,1]);
    const mica=Object.freeze([[3,10],[18,4],[12,17],[22,21],[7,1],[1,22],[16,12],[10,7]]);
    const earthBend=Object.freeze([0,0,0,0,1,1,1,1,1,0,0,0,0,0,-1,-1,-1,-1,-1,0,0,0,0,0]);
    const dist=(x,y,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-ax-t*dx,y-ay-t*dy);};
    function granite(x,y){
      let first=null,second=Infinity;
      for(let i=0;i<graniteSeeds.length;i++){
        const dx=wrap(x-graniteSeeds[i][0]),dy=wrap(y-graniteSeeds[i][1]);
        const d=dx*dx+dy*dy-((i*7)%5)*.7;
        if(!first||d<first.d){if(first)second=first.d;first={i,dx,dy,d};}else if(d<second)second=d;
      }
      const paletteIndex=granitePalette[first.i];
      let c=graniteColors[paletteIndex],plane=first.dx+first.dy<0?3:-2;
      if(second-first.d<2.5&&first.dx+first.dy<0)plane+=3;
      c=tone(c,plane+(hash(x,y,971)-.5)*4);
      for(let i=0;i<mica.length;i++){
        const dx=wrap(x-mica[i][0]),dy=wrap(y-mica[i][1]);
        if((dx===0&&dy===0)||(i%2===0&&dx===1&&dy===0))c=i%3===0?[119,111,103]:[109,96,93];
      }
      return c;
    }
    function yarn(name,x,y){
      const row=Math.floor(y/4),u=mod(x+(row%2)*3,6),v=y%4;
      // Two sloping strands meet in a short loop; rows interlock, without tile borders.
      const stitch=[[-3,4,-4,-4,4,-3],[-5,10,2,2,8,-5],[-4,-1,8,6,-1,-4],[-2,-5,-1,-2,-5,-2]][v][u];
      const fiber=(hash(x,y,977)-.5)*2.5,thread=(hash(Math.floor((x+(row%2)*3)/6),row,979)-.5)*2;
      return tone(woolColors[name],stitch+fiber+thread);
    }
    function ceramic(name,x,y){
      const u=x%12,v=y%12,col=Math.floor(x/12),row=Math.floor(y/12),[base,joint]=ceramicColors[name];
      if(u===0||v===0)return tone(joint,(hash(x,y,983)-.5)*2);
      let c=tone(base,[-2,3,0,-3][col+row*2]);
      if(u===1||v===1)c=tone(c,14);
      else if(u===11||v===11)c=tone(c,-11);
      else{
        // Broad, quiet glaze pooling; highlights follow the tile's own edge.
        const pool=Math.max(0,1-Math.hypot((u-4)/8,(v-4)/8))*4;
        c=tone(c,pool+(hash(x,y,991)-.5)*2);
        if((u===3&&v>=3&&v<=5)||(v===3&&u>=3&&u<=5))c=tone(c,5);
        if(name==='ceramicIvory'&&col===1&&row===0&&((u===8&&v>=6&&v<=8)||(u===9&&v===9)))c=tone(c,-6);
        if(name==='ceramicBlack'&&v===8&&u>=5&&u<=8)c=tone(c,3);
      }
      return c;
    }
    function architecture(name,x,y){
      if(name==='pinkGranite')return granite(x,y);
      if(ceramicColors[name])return ceramic(name,x,y);
      if(name==='smoothStone'){
        const edge=Math.min(x,y,23-x,23-y);
        let c=[150,157,160];
        if(edge===0)return tone(c,-17);
        if(x===1||y===1)return tone(c,7);
        if(x===22||y===22)return tone(c,-5);
        const vein=Math.min(dist(x,y,4,15,9,13),dist(x,y,9,13,13,14),dist(x,y,13,14,19,10));
        if(vein<.55)c=tone(c,-5);
        return tone(c,(hash(x,y,1009)-.5)*3+(hash(x>>2,y>>2,1013)-.5)*2);
      }
      if(name==='polishedBasalt'){
        const u=x%12;
        let c=tone([65,72,82],x>=12?2:-1);
        if(u===0||y===0)return tone(c,-17);
        if(u===1||y===1)return tone(c,10);
        if(u===11||y===23)c=tone(c,-8);
        if((u===4&&y>=4&&y<=9)||(u===8&&y>=15&&y<=19)||(u===7&&y===20))c=tone(c,5);
        return tone(c,(hash(x>>1,y,1019)-.5)*2.2);
      }
      if(name==='chiseledStone'){
        const edge=Math.min(x,y,23-x,23-y),dx=Math.abs(x-11.5),dy=Math.abs(y-11.5);
        const oct=Math.max(dx,dy)+Math.min(dx,dy)*.45;
        let c=[146,152,149];
        if(edge===0)c=tone(c,-13);
        else if(edge===1)c=tone(c,x<12||y<12?9:-7);
        else if(edge===3)c=tone(c,-24);
        else if(edge===4)c=tone(c,8);
        else if(edge>4){
          if(oct>=5.2&&oct<6.7)c=tone(c,-28);
          else if(oct>=4.3&&oct<5.2)c=tone(c,x+y<23?12:-9);
          if((dx<1&&dy>2&&dy<4)||(dy<1&&dx>2&&dx<4))c=tone(c,-24);
          if(dx<1&&dy<1)c=tone(c,8);
        }
        return tone(c,(hash(x,y,1021)-.5)*2);
      }
      if(name==='terracottaTiles'){
        const u=x%12,v=y%12,cell=Math.floor(x/12)+Math.floor(y/12)*2;
        if(u===0||v===0)return [174,143,105];
        let c=[[180,105,70],[191,114,75],[173,99,68],[186,109,73]][cell];
        if(u===1||v===1)c=tone(c,12);else if(u===11||v===11)c=tone(c,-15);
        const dx=Math.abs(u-6),dy=Math.abs(v-6),diamond=dx+dy;
        if(diamond===3)c=[228,184,117];
        else if(diamond===2&&dx&&dy)c=[205,151,91];
        else if(diamond===0)c=[126,71,49];
        if((u===3&&v===3)||(u===9&&v===9))c=tone(c,8);
        return tone(c,(hash(x,y,1031)-.5)*3);
      }
      if(name==='checkerStone'){
        const u=x%6,v=y%6,light=(Math.floor(x/6)+Math.floor(y/6))%2===0;
        let c=light?[220,224,202]:[65,77,82];
        if(u===0||v===0)c=light?[151,163,153]:[37,50,57];
        else if(u===1||v===1)c=tone(c,light?9:7);
        else if(u===5||v===5)c=tone(c,-6);
        else if(u===3&&v===3)c=tone(c,light?-6:4);
        return tone(c,(hash(x,y,1033)-.5)*2);
      }
      if(name==='packedEarth'){
        const edges=[earthBend[x],6+earthBend[mod(x+5,24)],12+earthBend[mod(x+11,24)],18+earthBend[mod(x+17,24)],24+earthBend[x]];
        const yy=y<edges[0]?y+24:y;
        let band=0;while(band<3&&yy>=edges[band+1])band++;
        const v=yy-edges[band];
        let c=[[167,129,92],[158,121,88],[173,134,96],[157,120,88]][band];
        if(v===0)c=tone(c,-7);else if(v===1)c=tone(c,3);
        const pebbles=[[4,4],[15,9],[8,16],[21,21]];
        for(let i=0;i<pebbles.length;i++){
          const dx=wrap(x-pebbles[i][0]),dy=wrap(y-pebbles[i][1]);
          if((dx===0||dx===1)&&dy===0)c=tone(c,i%2?12:-13);
        }
        return tone(c,(hash(x,y,1039)-.5)*4+(hash(x>>2,y>>1,1049)-.5)*3);
      }
      if(name==='firedEarthBricks'){
        const row=Math.floor(y/6),u=mod(x+(row%2)*6,12),v=y%6;
        const col=Math.floor((x+(row%2)*6)/12),seed=mod(col+row*3,4);
        const mortar=[119,89,66];
        if(u===0||v===0)return tone(mortar,(hash(x,y,1051)-.5)*3);
        let c=[[190,134,91],[202,145,99],[183,128,89],[208,149,100]][seed];
        if(v===1)c=tone(c,10);else if(v===5)c=tone(c,-9);
        if(u===1)c=tone(c,4);else if(u===11)c=tone(c,-6);
        if((u===2&&v===1&&seed%2===0)||(u===10&&v===5&&seed%2===1))c=mix(c,mortar,.45);
        if(u===6&&v===3&&seed%2===0)c=tone(c,-10);
        return tone(c,(hash(x,y,1061)-.5)*4);
      }
      throw new RangeError('Unknown C19 architectural material: '+name);
    }
    function makeTile(name,size=24){
      if(size!==24||!keys.includes(name))throw new RangeError('Unknown C19 native24 surface');
      const data=new Uint8ClampedArray(24*24*4);
      for(let y=0;y<24;y++)for(let x=0;x<24;x++){
        const color=woolColors[name]?yarn(name,x,y):architecture(name,x,y),i=(x+y*24)*4;
        data[i]=color[0];data[i+1]=color[1];data[i+2]=color[2];data[i+3]=255;
      }
      return data;
    }
    return Object.freeze({version:'c19-architecture-wool-v2',keys,makeTile});
  })();

  // C20 atelier surfaces: native24 RGB only; original alpha and all legacy packs are preserved.
  const C20_MATERIALS=(()=>{
    const interior=Object.freeze(['tableTop','workshopFrame','furnaceSide','furnaceTop','furnaceFront','bookshelf','oakParquet','sprucePanel','birchWeave','acaciaMosaic','cherryPanel']);
    const luminous=Object.freeze(['amethyst','amethystMosaic','prismLamp','prismCap','copperLamp','copperCap','glass','amberGlass','indigoGlass','glowstone','obsidian']);
    const keys=Object.freeze([...interior,...luminous]),TAU=Math.PI*2;
    const mod=(a,n)=>(a%n+n)%n,wrap=v=>v-Math.round(v/24)*24;
    const clip=n=>Math.max(0,Math.min(255,Math.round(n))),tone=(c,n)=>c.map(v=>clip(v+n));
    const mix=(a,b,t)=>a.map((v,i)=>clip(v+(b[i]-v)*t));
    const hash=(x,y,k)=>{let n=Math.imul(x+47,374761393)^Math.imul(y+181,668265263)^Math.imul(k,1274126177);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
    const grain=(base,x,y,dir,k=1)=>{
      const u=dir?y:x,v=dir?x:y;
      const f=Math.sin(v*TAU/6+Math.sin(u*TAU/24)*.43)+.42*Math.sin(v*TAU/3+u*TAU/24);
      const pore=hash(Math.floor(u/3),v,k)<.12?-5:0;
      return tone(base,f*3.4+pore+(hash(x,y,k+79)-.5)*2);
    };
    const crystalSeeds=Object.freeze([[3,3],[13,1],[21,8],[6,13],[15,15],[2,22],[21,23]]);
    const amberSeeds=Object.freeze([[2,4],[11,2],[21,4],[6,12],[17,14],[1,21],[11,22],[22,22]]);
    function cellAt(x,y,seeds){
      let first=null,second=Infinity;
      seeds.forEach(([sx,sy],i)=>{const dx=wrap(x-sx),dy=wrap(y-sy),d=dx*dx+dy*dy;if(!first||d<first.d){second=first?first.d:second;first={i,dx,dy,d};}else if(d<second)second=d;});
      return {...first,edge:Math.sqrt(second)-Math.sqrt(first.d)};
    }
    function makeTile(name,size,baseline){
      if(size!==24||!keys.includes(name)||!baseline||baseline.length!==2304)throw new RangeError('Known C20 native24 surface and original alpha required');
      const data=new Uint8ClampedArray(2304);
      const put=(x,y,c)=>{if(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<24&&y>=0&&y<24){const i=(x+y*24)*4;data[i]=clip(c[0]);data[i+1]=clip(c[1]);data[i+2]=clip(c[2]);}};
      const rect=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)put(i,j,c);};
      const line=(x0,y0,x1,y1,c)=>{const steps=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let n=0;n<=steps;n++)put(Math.round(x0+(x1-x0)*n/(steps||1)),Math.round(y0+(y1-y0)*n/(steps||1)),c);};
      const poly=(points,c)=>{for(let y=0;y<24;y++)for(let x=0;x<24;x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y+.5)!==(b[1]>y+.5)&&(x+.5)<(b[0]-a[0])*(y+.5-a[1])/(b[1]-a[1])+a[0])inside=!inside;}if(inside)put(x,y,c);}};
      for(let y=0;y<24;y++)for(let x=0;x<24;x++){
        const d=Math.min(x,y,23-x,23-y),n=hash(x,y,761),u=x%12,v=y%12;
        let c;
        if(name==='tableTop'){
          c=grain([143,96,53],x,y,0,31);
          if(d===0)c=[73,48,32];else if(d===1)c=tone([204,154,87],x+y<24?5:-12);
          else if(d>=3)c=tone([43,79,74],(n-.5)*5+Math.sin(x*TAU/24)*2);
          if(d===2)c=[101,66,39];
        }else if(name==='workshopFrame'){
          c=grain([102,65,38],x,y,1,37);
          if(x===0||x===23)c=[66,42,27];else if(x===1)c=[149,103,57];
          if(x===7||x===15)c=tone(c,-8);else if(x===8||x===16)c=tone(c,3);
        }else if(name==='furnaceSide'){
          const by=Math.floor(y/6),bx=mod(x+(by%2)*6,24),yy=y%6;
          c=tone([112,119,118],(hash(Math.floor(bx/12),by,91)-.5)*12+(n-.5)*4);
          if(yy===0||bx%12===0)c=[62,69,68];else if(yy===1)c=tone(c,22);else if(yy===5)c=tone(c,-12);
          if((bx===4&&yy===4)||(bx===20&&yy===3))c=tone(c,-13);
        }else if(name==='furnaceTop'){
          c=tone([126,132,126],(n-.5)*5);
          if(d===0)c=[65,72,70];else if(d===1)c=[161,166,151];
          if(d>=4)c=tone([70,80,81],(n-.5)*3);
          if(d===4)c=[44,54,56];else if(d===5)c=[113,126,123];
          if(y>=9&&y<=15&&[8,12,16].includes(x))c=[32,41,43];
          if(y>=9&&y<=14&&[9,13,17].includes(x))c=[137,147,135];
        }else if(name==='furnaceFront'){
          const by=Math.floor(y/6),xx=mod(x+(by%2)*8,24);
          c=tone([112,121,120],(n-.5)*4);
          if(y%6===0||xx%12===0)c=[67,77,77];else if(y%6===1)c=[146,153,143];
          if(y>=19&&y<=21&&x>=4&&x<=19)c=[50,58,59];
          if(y===20&&x>=6&&x<=17)c=[29,37,39];
        }else if(name==='bookshelf'){
          c=grain([145,98,52],x,y,0,43);
          if(x>1&&x<22&&((y>=3&&y<=10)||(y>=14&&y<=21)))c=[46,39,29];
          if([2,13,23].includes(y))c=[88,58,33];else if([0,11].includes(y))c=[198,145,77];
          if(x===0||x===23)c=[102,67,36];else if(x===1)c=[211,156,82];
        }else if(name==='oakParquet'){
          const a=mod(x+y,24),b=mod(x-y,24),cx=Math.floor(a/12),cy=Math.floor(b/12),aa=a%12,bb=b%12;
          c=grain((cx+cy)%2?[179,126,65]:[194,145,82],aa,bb,(cx+cy)%2,51);
          if(aa===0||bb===0)c=[116,78,42];else if(aa===1||bb===1)c=tone(c,17);else if(aa===11||bb===11)c=tone(c,-9);
        }else if(name==='sprucePanel'){
          c=grain([117,81,49],x,y,1,53);
          if(x<3||x>20)c=grain([87,59,37],x,y,1,54);
          if(x===3)c=[162,117,66];else if(x===4)c=[68,47,32];else if(x===19)c=[153,111,62];else if(x===20)c=[66,44,30];
          if(y===0||y===23)c=[66,43,29];else if(y===1)c=[172,126,71];else if(y===22)c=[91,61,38];
        }else if(name==='birchWeave'){
          const cx=Math.floor(x/6),cy=Math.floor(y/6),a=x%6,b=y%6,horizontal=(cx+cy)%2===0,over=horizontal?(b>=1&&b<=4):(a>=1&&a<=4);
          const under=horizontal?(a>=1&&a<=4):(b>=1&&b<=4);
          c=over?grain([212,192,139],x,y,horizontal?0:1,59):under?grain([166,148,104],x,y,horizontal?1:0,60):[119,110,80];
          if(over&&(horizontal?b===1:a===1))c=tone(c,18);else if(over&&(horizontal?b===4:a===4))c=tone(c,-20);
        }else if(name==='acaciaMosaic'){
          const k=(Math.floor(x/12)+Math.floor(y/12))%2;
          c=grain(k?[177,91,43]:[190,106,53],u,v,k,67);
          if(u===0||v===0)c=[114,58,31];else if(u===1||v===1)c=[222,137,70];else if(u===11||v===11)c=[143,71,35];
          if((u===3&&v===3)||(u===9&&v===9))c=[126,66,34];
        }else if(name==='cherryPanel'){
          c=grain([181,116,109],x,y,1,71);
          if(d===0)c=[112,65,64];else if(d===1)c=[221,156,140];else if(d===2)c=[160,94,91];
          else if(d===4)c=[117,65,66];else if(d===5)c=[231,167,148];else if(d===6)c=[164,99,97];
          if(d>6)c=grain([197,134,122],x,y,1,73);
        }else if(name==='amethyst'){
          const q=cellAt(x,y,crystalSeeds),face=q.dx+q.dy<-1?0:q.dx-q.dy>1?2:1;
          const pal=[[183,142,216],[142,98,184],[99,67,143]];
          c=q.edge<.6?[65,46,94]:tone(pal[face],(q.i%3-1)*4);
          if(q.d<1)c=[207,176,233];
        }else if(name==='amethystMosaic'){
          c=tone([91,70,127],(n-.5)*3);
          if(d===0)c=[53,45,79];else if(d===1)c=[173,147,205];else if(d===2)c=[111,86,150];
        }else if(['prismLamp','prismCap','copperLamp','copperCap'].includes(name)){
          const prism=name.startsWith('prism'),cap=name.endsWith('Cap'),base=prism?[57,91,94]:[133,76,42];
          c=tone(base,(n-.5)*4);
          if(d===0)c=prism?[35,61,65]:[72,42,29];else if(d===1)c=prism?[160,199,181]:[230,166,94];
          if(d>=3){
            if(prism){
              const dx=x-11.5,dy=y-11.5,diamond=Math.abs(dx)+Math.abs(dy);
              c=cap?mix([90,161,168],[212,240,210],Math.max(0,1-Math.hypot(dx,dy)/12)):diamond<6?[228,247,210]:dx+dy<0?[162,219,205]:[99,179,188];
              if(cap&&(Math.abs(dx-dy)<1||Math.abs(dx+dy)<1))c=[64,111,116];
              if(!cap&&Math.abs(diamond-9)<.8)c=[61,113,119];
              if(!cap&&Math.abs(diamond-8)<.7)c=[199,235,204];
            }else if(cap){
              const radius=Math.hypot(x-11.5,y-11.5);c=tone([175,108,55],Math.cos(radius*1.4)*4+(n-.5)*2);
              if(radius>8&&radius<9)c=[95,55,35];else if(radius>7&&radius<8)c=[236,173,94];
              if(y>=8&&y<=15&&[6,9,14,17].includes(x))c=[70,44,30];
              if(y>=8&&y<=14&&[7,10,15,18].includes(x))c=[225,158,81];
            }else{
              c=mix([236,164,71],[255,229,155],Math.max(0,1-Math.hypot((x-11.5)*.7,y-11.5)/12));
              if(x===5||x===18)c=[108,61,37];else if(x===6||x===17)c=[226,152,73];
              if(y===4||y===19)c=[112,62,35];else if(y===5)c=[244,181,91];
              if(y<7&&Math.abs(x-11.5)>5-(7-y))c=[143,83,43];
            }
          }
        }else if(['glass','amberGlass','indigoGlass'].includes(name)){
          const a=baseline[(x+y*24)*4+3],clear=name==='glass',amber=name==='amberGlass';
          const body=clear?[161,216,225]:amber?[220,164,72]:[111,131,194],rim=clear?[122,182,195]:amber?[159,108,45]:[75,96,157],glint=clear?[229,248,246]:amber?[255,228,167]:[215,232,255];
          c=a>=(clear?150:160)?tone(rim,d===0?-10:10):a>90?glint:tone(body,Math.sin((x+(amber?y*.3:-y*.2))*TAU/24)*3+(n-.5)*1.5);
          if(a>90&&a<150&&mod(x+y,3)===0)c=tone(c,-6);
        }else if(name==='glowstone'){
          const q=cellAt(x,y,amberSeeds),light=q.dx+q.dy<0;
          c=q.edge<.8?[148,100,35]:q.edge<1.6?[202,143,48]:light?[246,211,112]:[222,167,65];
          if(q.d<3)c=[255,235,153];else if(light&&q.dy<0)c=tone(c,5);
        }else if(name==='obsidian'){
          const q=cellAt(x,y,crystalSeeds),facet=mod(q.i+(q.dx>q.dy?1:0)+(q.dx+q.dy<0?2:0),4);
          c=[[27,25,38],[38,31,54],[48,37,64],[31,30,44]][facet];
          const radius=Math.hypot(q.dx,q.dy);
          if(q.edge<.55)c=[18,20,29];else if(q.edge<1.15&&q.dx+q.dy<0)c=[68,51,83];
          else if(radius>3&&radius<4&&q.dy>0)c=tone(c,6);
        }
        put(x,y,c);
      }
      if(name==='tableTop'){
        for(const q of [5,9,14,18]){line(q,5,q,18,[174,168,111]);line(5,q,18,q,[174,168,111]);}
        line(5,5,18,5,[206,197,134]);line(5,5,5,18,[206,197,134]);
        for(const q of [4,7,10,13,16,19])put(q,2,[233,190,111]);
        rect(7,7,1,1,[226,215,156]);rect(16,16,1,1,[108,142,124]);
      }else if(name==='workshopFrame'){
        for(const[x,y]of[[3,3],[20,20]]){put(x,y,[55,42,29]);put(x,y-1,[168,118,64]);}
      }else if(name==='furnaceFront'){
        poly([[5,17],[5,10],[7,7],[16,7],[19,10],[19,17]],[47,56,58]);
        poly([[7,16],[7,10],[9,9],[15,9],[17,11],[17,16]],[24,33,36]);
        line(7,8,16,8,[174,164,132]);line(5,11,5,16,[151,143,117]);line(18,11,18,16,[72,76,68]);
        line(7,16,16,16,[88,71,51]);
        for(const x of [7,11,15])put(x,20,[113,119,109]);
      }else if(name==='bookshelf'){
        const books=[[3,3,3,8,[151,67,53]],[6,4,3,7,[97,137,121]],[9,3,2,8,[205,172,92]],[11,5,4,6,[67,96,121]],[15,3,3,8,[128,135,83]],[18,4,3,7,[168,119,95]],
          [3,14,2,8,[76,112,135]],[5,15,4,7,[183,128,65]],[9,14,3,8,[124,75,85]],[12,16,3,6,[116,143,120]],[15,14,2,8,[212,190,127]],[17,15,4,7,[89,110,137]]];
        for(const[x,y,w,h,c]of books){rect(x,y,w,h,c);line(x,y,x,y+h-1,tone(c,22));rect(x,y,w,1,[209,195,149]);if(w>2)rect(x+1,y+3,w-2,1,[218,203,157]);put(x+w-1,y+h-1,tone(c,-28));}
      }else if(name==='amethystMosaic'){
        const star=[[12,3],[14,8],[19,5],[16,10],[21,12],[16,14],[19,19],[14,16],[12,21],[10,16],[5,19],[8,14],[3,12],[8,10],[5,5],[10,8]];
        poly(star,[185,168,222]);
        for(let i=0;i<star.length;i++){const a=star[i],b=star[(i+1)%star.length];poly([[12,12],a,b],i%4===0?[209,195,234]:i%4===1?[151,126,191]:i%4===2?[179,152,215]:[119,101,165]);}
        poly([[12,8],[16,12],[12,16],[8,12]],[113,176,187]);poly([[12,9],[15,12],[12,14],[10,12]],[192,225,217]);
      }else if(['prismLamp','prismCap','copperLamp','copperCap'].includes(name)){
        const p=name.startsWith('prism');for(const[x,y]of[[2,2],[21,2],[2,21],[21,21]]){put(x,y,p?[43,79,84]:[85,49,31]);put(x,y-1,p?[189,221,199]:[246,185,105]);}
      }
      // Copy alpha last: transparent coverage, shape, render classification and blending are not redesigned.
      for(let i=3;i<data.length;i+=4)data[i]=baseline[i];
      return data;
    }
    return Object.freeze({version:'c20-atelier-v3',keys,makeTile});
  })();
  /* C21_REALM_NATIVE24_V2_BEGIN
     Original native-grid realm art. RGB only for twelve existing layers.
     Base alpha, item/recipe semantics and both legacy packs remain unchanged. */
  const C21_REALM_MATERIALS=(()=>{
    const keys=Object.freeze(['emberRock','emberBricks','lava','glowCrystal','riftFrame','rift','skyStone','skyGrass','cloudGlass','sunCrystal','skyAnchor','skyPortal']);
    const mod=(v,n)=>(v%n+n)%n,wrap=v=>v-Math.round(v/24)*24;
    const clip=v=>Math.max(0,Math.min(255,Math.round(v)));
    const tone=(c,n)=>c.map(v=>clip(v+n));
    const hash=(x,y,k)=>{let n=Math.imul(mod(x,24)+113,374761393)^Math.imul(mod(y,24)+197,668265263)^Math.imul(k,1274126177);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
    function makeTile(name,size,baseline){
      if(size!==24||!keys.includes(name)||!baseline||baseline.length!==2304)throw new RangeError('Known C21 realm layer and exact base alpha required');
      const out=new Uint8ClampedArray(baseline),seed=keys.indexOf(name)+2101;
      const put=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=24||y>=24)return;const i=(x+y*24)*4;if(baseline[i+3]===0)return;for(let k=0;k<3;k++)out[i+k]=clip(c[k]);};
      const rect=(x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,c);};
      const line=(x0,y0,x1,y1,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));if(!n){put(x0,y0,c);return;}for(let i=0;i<=n;i++)put(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,c);};
      const poly=(points,c)=>{for(let y=0;y<24;y++)for(let x=0;x<24;x++){let inside=false;const px=x+.5,py=y+.5;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0])inside=!inside;}if(inside)put(x,y,c);}};
      const fill=(c,grain=0)=>{for(let y=0;y<24;y++)for(let x=0;x<24;x++)put(x,y,tone(c,grain?Math.floor(hash(x,y,seed)*3-1)*grain:0));};
      const cell=(x,y,sites)=>{let near=Infinity,next=Infinity,index=0,dx=0,dy=0;for(let k=0;k<sites.length;k++){const xx=wrap(x-sites[k][0]),yy=wrap(y-sites[k][1]),d=xx*xx+yy*yy;if(d<near){next=near;near=d;index=k;dx=xx;dy=yy;}else if(d<next)next=d;}return{near,next,index,dx,dy,edge:next-near};};
      const gem=(cx,cy,rx,ry,pal)=>{
        const outer=[[cx-1,cy-ry],[cx+rx,cy-1],[cx+rx*.55,cy+ry],[cx-rx,cy+ry*.30]];
        poly(outer,pal.rim);
        const top=[cx-1,cy-ry+1],right=[cx+rx-1,cy-1],bottom=[cx+rx*.45,cy+ry-1],left=[cx-rx+1,cy+ry*.25],center=[cx-.5,cy+.5];
        poly([top,center,left],pal.light);poly([top,right,center],pal.mid);poly([right,bottom,center],pal.dark);poly([center,bottom,left],pal.low);
        line(top[0],top[1],center[0],center[1],pal.glint);put(cx-1,cy-ry+1,pal.glint);
      };
      if(name==='emberRock'){
        const sites=[[3,4],[16,2],[9,15],[21,18],[1,22]],pal=[[69,40,47],[82,45,49],[92,48,48],[73,41,48],[85,46,45]];
        for(let y=0;y<24;y++)for(let x=0;x<24;x++){
          const q=cell(x,y,sites),n=hash(x,y,seed),c=q.edge<3?[29,23,31]:q.edge<9?[105,53,46]:tone(pal[q.index],(q.dx+q.dy<0?3:-2)+(n>.87?2:n<.12?-2:0));
          put(x,y,c);if(q.edge>=3&&q.edge<6&&mod(x+2*y,17)===0)put(x,y,[134,60,43]);
        }
      }else if(name==='emberBricks'){
        const pal=[[79,43,48],[84,45,49],[72,40,47],[88,47,48]];
        for(let y=0;y<24;y++)for(let x=0;x<24;x++){
          const row=Math.floor(y/6),yy=y%6,xx=mod(x+(row%2)*6,12),brick=Math.floor((x+(row%2)*6)/12),base=pal[mod(row+brick,4)];
          put(x,y,yy===0||xx===0?[27,23,31]:yy===1?[112,57,54]:yy===5?[49,31,39]:xx===11?[58,33,41]:tone(base,hash(x,y,seed)>.8?3:-1));
          if(yy===2&&xx===3&&row%2===0)put(x,y,[145,67,45]);
          if(yy===4&&xx===8)put(x,y,[64,34,42]);
        }
      }else if(name==='lava'){
        const sites=[[3,3],[16,2],[8,15],[21,18],[1,23]],dirs=[[1,.45],[-.55,1],[1,-.7],[.45,1],[-1,.35]];
        const plates=[[201,52,24],[220,65,20],[209,57,23],[228,72,20],[198,50,24]];
        for(let y=0;y<24;y++)for(let x=0;x<24;x++){
          const q=cell(x+.75*Math.sin(y*Math.PI/6),y+.65*Math.sin(x*Math.PI/12),sites),d=dirs[q.index];
          const u=q.dx*d[0]+q.dy*d[1],v=q.dy*d[0]-q.dx*d[1];
          let c=q.edge<4?[255,225,86]:q.edge<10?[255,180,38]:q.edge<18?[255,128,20]:tone(plates[q.index],u>1.5?10:u<-.75?-17:0);
          if(q.edge>=18&&v>1&&u<1.5)c=tone(c,-7);
          if(q.edge>=18&&u>=1.5&&v<-.5)c=[242,91,20];
          put(x,y,c);
        }
      }else if(name==='glowCrystal'){
        fill([60,36,44],2);
        const pal={rim:[113,53,33],light:[255,226,132],mid:[249,180,64],dark:[177,76,25],low:[227,125,31],glint:[255,246,195]};
        gem(6,8,4,6,pal);gem(18,5,3,4,pal);gem(16,18,5,4,pal);
        for(const[x,y]of[[12,3],[3,20],[22,12]])put(x,y,[139,70,37]);
      }else if(name==='riftFrame'){
        fill([48,34,63],2);
        for(let y=0;y<24;y++)for(let x=0;x<24;x++){
          const e=Math.min(x,y,23-x,23-y);
          if(e===0)put(x,y,x+y<23?[24,20,35]:[89,58,108]);
          else if(e===1)put(x,y,x+y<23?[74,49,95]:[41,29,56]);
          else if(e===3)put(x,y,[91,58,112]);
          const d=Math.abs(x-11.5)+Math.abs(y-11.5);
          if(d>=8&&d<9)put(x,y,[138,91,158]);else if(d>=6&&d<7)put(x,y,[25,20,39]);
        }
        for(const[x,y,sx,sy]of[[5,5,1,1],[18,5,-1,1],[5,18,1,-1],[18,18,-1,-1]]){
          line(x,y,x+3*sx,y,[128,84,148]);line(x,y,x,y+3*sy,[128,84,148]);put(x+sx,y+sy,[29,23,43]);
        }
        poly([[11,7],[14,11],[11,16],[9,12]],[165,110,185]);
        poly([[11,9],[12,11],[11,14],[10,12]],[57,34,79]);
        put(12,8,[206,153,222]);put(16,11,[134,83,158]);put(7,12,[134,83,158]);
      }else if(name==='rift'){
        for(let y=0;y<24;y++)for(let x=0;x<24;x++){
          const a=baseline[(x+y*24)*4+3],pal=a<=92?[58,22,95]:a<=112?[94,36,147]:a<=140?[147,65,198]:a<=176?[200,125,235]:[242,190,255];
          const wave=Math.sin((x+y)*Math.PI/12)+.38*Math.sin((2*x-y)*Math.PI/6);
          put(x,y,tone(pal,wave>.9?5:wave<-.9?-4:0));
          if(Math.abs(wave-.15)<.075&&a>=112)put(x,y,[219,151,245]);
        }
      }else if(name==='skyStone'){
        const sites=[[3,3],[15,2],[8,13],[21,12],[18,22]],pal=[[225,236,230],[215,230,230],[235,241,231],[220,233,229],[229,238,230]];
        for(let y=0;y<24;y++)for(let x=0;x<24;x++){
          const q=cell(x,y,sites);
          put(x,y,q.edge<3?[169,196,204]:q.edge<9?[202,222,221]:q.near<3?[246,248,237]:tone(pal[q.index],q.dx+q.dy<0?2:-2));
          if(q.edge>12&&hash(x,y,seed)>.97)put(x,y,[213,225,217]);
        }
      }else if(name==='skyGrass'){
        const pal=[[155,197,174],[164,205,180],[174,213,188],[148,191,169]];
        for(let y=0;y<24;y++)for(let x=0;x<24;x++)put(x,y,pal[Math.min(3,Math.floor(hash(Math.floor(x/3),Math.floor(y/3),seed)*4))]);
        for(const[cx,cy]of[[2,5],[10,3],[18,8],[6,15],[15,19],[22,22]]){
          line(cx,cy,cx,cy-3,[121,168,147]);line(cx-2,cy-2,cx-1,cy,[191,224,193]);
          line(cx+1,cy,cx+3,cy-3,[181,217,187]);put(cx,cy-4,[210,235,202]);put(cx-1,cy+1,[140,184,160]);
        }
        for(const[x,y]of[[14,11],[2,21]]){put(x,y,[250,240,183]);put(x-1,y,[225,217,156]);put(x,y-1,[254,248,209]);}
      }else if(name==='cloudGlass'){
        for(let y=0;y<24;y++)for(let x=0;x<24;x++){
          const a=baseline[(x+y*24)*4+3],pal=a<=48?[192,231,237]:a<=82?[151,210,226]:a<=105?[221,247,245]:a<=166?[132,193,212]:a<=174?[246,245,211]:a<=192?[237,251,249]:[252,253,234];
          put(x,y,tone(pal,(a<106?Math.sin((x+2*y)*Math.PI/12)*3:0)));
          if((x===1||y===1)&&a>=166)put(x,y,[233,249,246]);
          if((x===22||y===22)&&a>=166)put(x,y,[137,195,212]);
          if(a>=192&&mod(x+2*y,13)===0)put(x,y,[255,253,226]);
        }
      }else if(name==='sunCrystal'){
        fill([223,233,222],2);
        const pal={rim:[165,139,80],light:[255,240,172],mid:[239,207,111],dark:[183,143,61],low:[221,183,83],glint:[255,251,216]};
        gem(7,7,5,5,pal);gem(19,5,3,4,pal);gem(15,18,6,4,pal);
        for(const[x,y]of[[3,17],[21,14],[11,2]])put(x,y,[204,215,201]);
      }else if(name==='skyAnchor'){
        fill([232,240,224],1);
        for(let y=0;y<24;y++)for(let x=0;x<24;x++){
          const e=Math.min(x,y,23-x,23-y),d=Math.abs(x-11.5)+Math.abs(y-11.5);
          if(e===0)put(x,y,x+y<23?[154,131,76]:[246,228,162]);
          else if(e===1)put(x,y,x+y<23?[222,198,128]:[177,151,85]);
          if(d>=8&&d<9)put(x,y,[175,149,82]);else if(d>=7&&d<8)put(x,y,[251,235,180]);
        }
        for(const[x,y,sx,sy]of[[4,4,1,1],[19,4,-1,1],[4,19,1,-1],[19,19,-1,-1]]){
          line(x,y,x+3*sx,y,[200,174,100]);line(x,y,x,y+3*sy,[200,174,100]);put(x+sx,y+sy,[254,249,217]);
        }
        poly([[11,5],[13,10],[18,11],[13,13],[12,18],[10,13],[5,12],[10,10]],[238,210,132]);
        poly([[11,7],[12,11],[16,11],[12,12],[12,16],[11,12],[7,12],[11,11]],[255,242,184]);
        rect(11,11,2,2,[104,177,196]);put(11,11,[176,224,226]);
      }else if(name==='skyPortal'){
        for(let y=0;y<24;y++)for(let x=0;x<24;x++){
          const a=baseline[(x+y*24)*4+3],pal=a<=65?[96,170,197]:a<=88?[145,206,220]:a<=119?[195,233,234]:a<=158?[241,248,225]:[255,237,172];
          const wave=Math.sin((x+y)*Math.PI/12)+.4*Math.sin((2*x-y)*Math.PI/6);
          put(x,y,tone(pal,wave>.9?4:wave<-.9?-3:0));
          if(Math.abs(wave+.2)<.065&&a>=88&&a<211)put(x,y,[233,249,241]);
        }
      }
      return out;
    }
    return Object.freeze({version:'c21-realms-v2',keys,makeTile});
  })();
  /* C21_REALM_NATIVE24_V2_END */

  function makeTile(name){
    if(C25.tileKeys.includes(name))return C25.makeTile(name,16).data;
    if(C11_MATERIALS.tileKeys.includes(name))return C11_MATERIALS.makeTile(name,16).data;
    if(C10_MATERIALS.tileKeys.includes(name))return C10_MATERIALS.makeTile(name,16).data;
    if(C9_EXPANDED_TEXTURE_NAMES.includes(name))return makeC9ExpandedTile(name,16);
    if(C9_TEXTURE_NAMES.includes(name))return makeC9Tile(name,16);
    if(MINERAL_TEXTURE_NAMES.includes(name))return resizePixelArt(makeMineral24(name),24,16);
    const a=new Uint8ClampedArray(S*S*4), seed=T[name]*413+71;
    const put=(x,y,c,alpha=255)=>{if(x<0||x>=S||y<0||y>=S)return;const q=(x+y*S)*4;a[q]=clamp(c[0]);a[q+1]=clamp(c[1]);a[q+2]=clamp(c[2]);a[q+3]=alpha;};
    const at=(x,y)=>Array.from(a.slice((x+y*S)*4,(x+y*S)*4+3));
    const rect=(x,y,w,ht,c,alpha=255)=>{for(let j=y;j<y+ht;j++)for(let i=x;i<x+w;i++)put(i,j,c,alpha);};
    const noiseFill=(base,contrast=12,alpha=255)=>{for(let y=0;y<S;y++)for(let x=0;x<S;x++){const n=(h(x>>1,y>>1,seed)-.5)*contrast+(h(x,y,seed+61)-.5)*contrast*.65;put(x,y,shade(base,n),alpha);}};
    // R8I atelier materials: original deterministic 16px art, appended layers only.
    if(['copperPlate','cutCopper','patinaCopper','engravedCopper'].includes(name)){
      const green=name==='patinaCopper',base=green?[76,145,124]:[191,121,79];noiseFill(base,10);
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){
        const tile=name==='cutCopper'||green,u=tile?x%8:x,v=tile?y%8:y,size=tile?8:16;
        if(u===0||v===0)put(x,y,green?[38,86,75]:[109,61,44]);
        else if(u===1||v===1)put(x,y,green?[139,194,157]:[240,171,111]);
        else if(u===size-1||v===size-1)put(x,y,green?[48,114,98]:[146,83,54]);
        else if(green&&h(x>>1,y>>1,943)>.73)put(x,y,shade([152,110,66],(h(x,y,991)-.5)*17));
        else if(!green&&(x+2*y)%19===3)put(x,y,shade(base,12));
      }
      if(name==='copperPlate')for(const[x,y]of[[2,2],[12,2],[2,12],[12,12]]){rect(x,y,2,2,[122,73,49]);put(x,y,[244,177,116]);}
      if(name==='engravedCopper')for(let y=3;y<13;y++)for(let x=3;x<13;x++){
        const wave=(x+Math.abs(y-7))%6;if(wave===0)put(x,y,[105,61,46]);else if(wave===1)put(x,y,[247,187,119]);
      }
    }else if(['quartz','quartzBricks','quartzPillar','quartzEnd'].includes(name)){
      noiseFill([232,225,211],5);
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){
        if(name==='quartz'){
          const vein=(x+2*y+(y>>2))%23;if(vein===0)put(x,y,[213,205,196]);else if(vein===1)put(x,y,[247,242,227]);
        }else if(name==='quartzBricks'){
          const u=(x+((y>>2)%2)*4)%8,v=y%4;if(v===0||u===0)put(x,y,[165,159,152]);else if(v===1)put(x,y,[251,245,228]);else if(v===3)put(x,y,[216,209,196]);
        }else if(name==='quartzPillar'){
          const tones=[[180,177,169],[245,241,224],[233,227,212],[211,205,193]],v=x%4;put(x,y,shade(tones[v],y===0?9:y===15?-9:0));
        }else{
          const d=Math.min(x,y,15-x,15-y);if(d===0||d===4)put(x,y,[184,181,171]);else if(d===1||d===5)put(x,y,[252,247,230]);else if(d===3)put(x,y,[211,205,193]);
        }
      }
    }else if(name==='amethyst'){
      const palette=[[70,49,101],[106,72,151],[147,106,191],[186,147,222],[220,197,244],[114,110,178]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){
        const u=(x+((y>>3)%2)*4)%8,v=y%8,d=Math.abs(u-3.5)+Math.abs(v-3.5);
        put(x,y,d>5?palette[0]:d>4?palette[1]:u+v<6?palette[4]:u<v?palette[3]:u>v+2?palette[1]:palette[2]);
        if(u===3&&v===2)put(x,y,[238,221,255]);if(u===6&&v===6)put(x,y,palette[5]);
      }
    }else if(name==='amethystMosaic'){
      const p=[[61,53,92],[113,91,154],[160,135,205],[211,192,238],[157,201,210]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){
        const u=x%8,v=y%8,d=Math.abs(u-3.5)+Math.abs(v-3.5),edge=u===0||v===0;
        put(x,y,edge?p[0]:d<2?p[4]:d<3?p[3]:d<4?p[0]:u<v?p[2]:p[1]);
      }
    }else if(['prismLamp','prismCap','copperLamp','copperCap'].includes(name)){
      const prism=name.startsWith('prism'),cap=name.endsWith('Cap'),frame=prism?[73,112,115]:[119,73,47],edge=prism?[145,194,186]:[220,151,83];
      noiseFill(frame,8);
      for(let y=1;y<15;y++)for(let x=1;x<15;x++){
        const d=Math.min(x,y,15-x,15-y),bar=cap?(x===4||x===11||y===4||y===11):(x===3||x===12||y===3||y===12);
        const diamond=Math.abs(x-7.5)+Math.abs(y-7.5);
        put(x,y,d===1?edge:bar?frame:prism?(diamond<5?[239,251,221]:x+y<15?[172,232,223]:[125,194,201]):diamond<5?[255,231,158]:[235,174,82]);
      }
      for(const[x,y]of[[1,1],[13,1],[1,13],[13,13]]){rect(x,y,2,2,frame);put(x,y,edge);}
    }else if(name==='amberGlass'||name==='indigoGlass'){
      const amber=name==='amberGlass',c=amber?[217,158,65]:[116,134,201],light=amber?[255,221,149]:[208,222,255];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){
        const d=Math.min(x,y,15-x,15-y);put(x,y,d===0?shade(c,-30):c,d===0?165:38);
        if(d===1&&(x<8||y<8))put(x,y,light,108);
        if((x+y===10&&x>=3&&x<=7)||(x+y===17&&x>=10&&x<=12))put(x,y,light,115);
      }
    }else if(name==='mossyStoneBricks'){
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){
        const u=(x+((y>>2)%2)*4)%8,v=y%4,moss=h(x>>1,y>>1,1423)>.63&&(v===0||v===1||u<3);
        put(x,y,moss?(v===1?[137,163,88]:[79,113,60]):u===0||v===0?[67,76,72]:v===1?[171,179,159]:shade([133,145,129],(h(x,y,1424)-.5)*15));
      }
    }else if(name==='packedEarth'){
      noiseFill([164,126,91],14);for(let y=0;y<16;y++)for(let x=0;x<16;x++){
        const layer=(y+(x>>3))%6;if(layer===0)put(x,y,[125,94,70]);else if(layer===1)put(x,y,[187,149,107]);
        if(h(x,y,1831)>.972)put(x,y,[213,180,134]);
      }
    }else if(name==='firedEarthBricks'){
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){
        const u=(x+((y>>2)%2)*4)%8,v=y%4;put(x,y,u===0||v===0?[112,83,65]:v===1?[227,175,122]:v===3?[170,112,77]:shade([198,140,94],(h(x>>1,y>>1,1891)-.5)*17));
      }rect(3,2,2,1,[163,103,74]);rect(11,10,2,1,[163,103,74]);
    }else if(name==='oakParquet'){
      const pal=[[166,116,62],[187,138,77],[201,154,90],[143,95,49],[216,172,108]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const u=(x+y)%8,v=(x-y+16)%8,cell=((x+y)>>3)+((x-y+16)>>3);put(x,y,u===0||v===0?[108,74,43]:pal[(cell+(u===2?1:0)+5)%5]);}
    }else if(name==='sprucePanel'){
      const p=[[87,61,43],[107,76,49],[125,91,58],[138,103,66],[153,116,75]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const u=x%8;put(x,y,u===0?p[0]:u===1?p[4]:u===7?p[1]:p[2+((y+u*3)%9===0?1:0)]);}rect(2,3,1,5,p[1]);rect(10,10,1,4,p[1]);
    }else if(name==='birchWeave'){
      const p=[[166,145,99],[203,183,134],[224,207,159],[237,223,177],[188,166,115]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const horizontal=((x>>2)+(y>>2))%2===0,u=(horizontal?y:x)%4;put(x,y,p[[0,3,2,1][u]]);}
    }else if(name==='acaciaMosaic'){
      const p=[[122,61,38],[160,80,42],[186,101,54],[210,129,72],[230,151,89]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const u=x%8,v=y%8,d=Math.max(Math.abs(u-3.5),Math.abs(v-3.5));put(x,y,u===0||v===0?p[0]:p[1+((Math.floor(d)+(x>>3)+(y>>3))%4)]);}
    }else if(name==='cherryPanel'){
      const p=[[139,85,79],[184,122,112],[210,151,140],[229,178,163],[243,198,179]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.min(x,y,15-x,15-y);put(x,y,d===0?p[0]:d===1?p[4]:d===3?p[0]:d===4?p[1]:p[2+(x%5===0?1:0)]);}
    }else if(name==='sandstoneDiversity'){
      const p=[[183,148,95],[207,174,119],[222,192,139],[236,211,163],[245,224,184]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const band=(y+((x>>2)%2))%8;put(x,y,p[band===0?0:band===1?4:band<4?2:3]);}for(const [x,y]of [[2,5],[10,3],[6,12],[13,11]])put(x,y,p[1]);
    }else if(name==='sandstoneBricks'){
      const p=[[162,133,91],[211,181,128],[230,204,155],[244,223,180]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const u=(x+((y>>2)%2)*4)%8,v=y%4;put(x,y,u===0||v===0?p[0]:v===1?p[3]:p[1+((x>>3)+(y>>2))%2]);}
    }else if(name==='limestoneDiversity'){
      const p=[[182,187,166],[204,209,190],[220,225,205],[234,237,219],[244,244,228]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const a=((x>>2)+3*(y>>2))%5;put(x,y,p[2+(a===0?1:0)]);}for(const [x,y]of [[2,3],[7,2],[11,7],[4,11],[14,13],[8,14]]){put(x,y,p[1]);put(x+1,y,p[4]);}rect(5,6,3,1,p[1]);
    }else if(name==='limestoneTiles'){
      const p=[[150,157,139],[198,207,185],[220,228,205],[239,242,221],[250,248,232]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const u=x%8,v=y%8;put(x,y,u===0||v===0?p[0]:u===1||v===1?p[4]:u===7||v===7?p[1]:p[2+((x>>3)+(y>>3))%2]);}
    }else if(name==='slateTiles'){
      const p=[[39,49,62],[56,72,89],[72,91,108],[92,111,127],[115,131,142]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=y%4,u=(x+((y>>2)%2)*4)%8;put(x,y,v===3||u===0?p[0]:v===0?p[4]:p[1+((x>>3)+(y>>2))%3]);}
    }else if(name==='mossyCobbleDiversity'){
      const p=[[61,71,66],[99,111,98],[135,144,125],[155,165,141],[79,111,54],[111,143,66]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const u=(x+((y>>2)%2)*3)%7,v=y%5,m=(x*3+y*5)%17;put(x,y,u===0||v===0?p[0]:m<4?p[4]:m===4?p[5]:p[1+((x>>2)+(y>>2))%3]);}
    }else if(name==='pinkGranite'){
      const p=[[111,80,78],[159,114,105],[190,146,130],[216,176,153],[238,208,181],[108,110,104]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const cell=((x>>1)*7+(y>>1)*11)%13;put(x,y,p[cell<3?2:cell<6?3:cell<8?1:cell<10?4:cell===10?5:0]);}
    }else if(['ceramicIvory','ceramicRed','ceramicOchre','ceramicGreen','ceramicBlue','ceramicBlack'].includes(name)){
      const palettes={ceramicIvory:[[125,112,94],[211,199,172],[233,221,192],[250,239,211]],ceramicRed:[[89,42,38],[155,66,52],[188,87,65],[218,121,87]],ceramicOchre:[[105,73,36],[182,128,45],[216,162,61],[241,198,103]],ceramicGreen:[[29,63,53],[49,107,82],[66,139,103],[109,175,126]],ceramicBlue:[[28,61,83],[45,101,135],[61,137,171],[105,184,204]],ceramicBlack:[[24,25,32],[45,48,60],[63,69,82],[100,110,123]]},p=palettes[name];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const u=x%8,v=y%8;put(x,y,u===0||v===0?p[0]:v===1||u===1?p[3]:u===7||v===7?p[1]:p[2]);}rect(3,3,2,1,p[3]);rect(11,11,2,1,p[3]);
    }else if(name==='rivetedIron'){
      const p=[[60,76,84],[107,127,132],[145,163,165],[183,197,194],[220,226,213]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.min(x,y,15-x,15-y);put(x,y,d===0?p[0]:d===1?p[4]:d===2?p[1]:p[2+(y<7?1:0)]);}for(const [x,y]of [[3,3],[12,3],[3,12],[12,12]]){put(x,y,p[0]);put(x,y-1,p[4]);put(x+1,y,p[1]);}
    }else if(name==='checkerStone'){
      const p=[[38,46,52],[65,76,81],[177,185,166],[220,225,203],[241,240,219]];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const light=((x>>2)+(y>>2))%2===0,u=x%4,v=y%4;put(x,y,light?(u===0||v===0?p[2]:u===1&&v===1?p[4]:p[3]):(u===0||v===0?p[0]:p[1]));}
    }else if(name==='skyStone'){
      // Broad, periodic cool-white stone plates with restrained cyan seams.
      const sites=[[2,3],[11,1],[6,10],[14,12]],colors=[[226,235,231],[215,229,229],[235,240,231],[220,232,229]];
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        let nearest=Infinity,next=Infinity,cell=0;
        for(let k=0;k<sites.length;k++){const dx=Math.abs(x-sites[k][0]),dy=Math.abs(y-sites[k][1]),d=Math.min(dx,16-dx)**2+Math.min(dy,16-dy)**2;if(d<nearest){next=nearest;nearest=d;cell=k;}else if(d<next)next=d;}
        const edge=next-nearest;put(x,y,edge<2?[183,207,211]:edge<6?[203,220,220]:nearest<3?[241,245,237]:colors[cell]);
      }
    } else if(name==='skyGrass'){
      const greens=[[154,195,173],[165,205,182],[174,213,191],[146,188,168]];
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)put(x,y,greens[Math.min(3,Math.floor(h(x>>1,y>>1,seed+17)*4))]);
      for(const [x,y]of [[1,3],[5,1],[11,5],[4,10],[13,12],[8,14]]){put(x,y,[117,165,148]);put(x,y-1,[201,229,202]);put(x+1,y,[183,218,188]);}
      for(const [x,y]of [[8,7],[1,14]]){put(x,y,[246,238,183]);put(x-1,y,[221,221,165]);put(x,y-1,[252,247,207]);}
    } else if(name==='cloudGlass'){
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const edge=x===0||y===0||x===15||y===15,inner=(x===1||y===1||x===14||y===14),diagonal=(x-y+16)%16;
        if(edge)put(x,y,[151,205,219],166);else if(inner&&(x+y)%3)put(x,y,[237,251,247],192);
        else if(diagonal===3||diagonal===4)put(x,y,[224,246,243],105);else if(diagonal===11)put(x,y,[162,215,226],82);else put(x,y,[198,232,235],48);
      }
      rect(4,3,3,1,[250,253,238],206);rect(3,4,1,3,[250,253,238],206);put(11,11,[250,249,215],174);
    } else if(name==='sunCrystal'){
      const stone=[[211,224,218],[223,232,220],[231,237,223]];
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)put(x,y,stone[((x>>2)+(y>>2))%3]);
      for(const [cx,cy,r]of [[4,5,3],[11,3,2],[10,11,3]])for(let y=cy-r-1;y<=cy+r+1;y++)for(let x=cx-r-1;x<=cx+r+1;x++){
        const d=Math.abs(x-cx)+Math.abs(y-cy);if(d===r+1)put(x,y,[181,155,93]);else if(d<=r)put(x,y,x+y<cx+cy?[255,240,179]:x>cx?[201,154,64]:[239,204,106]);
      }
      put(4,3,[255,251,215]);put(11,2,[255,251,215]);put(10,9,[255,251,215]);
    } else if(name==='skyAnchor'){
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)put(x,y,(x+y)%7===0?[214,225,217]:[232,238,221]);
      rect(0,0,16,1,[176,153,92]);rect(0,0,1,16,[176,153,92]);rect(15,0,1,16,[245,226,158]);rect(0,15,16,1,[245,226,158]);
      for(const [x,y]of [[2,2],[11,2],[2,11],[11,11]]){rect(x,y,3,1,[202,175,103]);rect(x,y,1,3,[202,175,103]);put(x+1,y+1,[250,247,219]);}
      for(let y=3;y<=12;y++)for(let x=3;x<=12;x++){const d=Math.abs(x-7.5)+Math.abs(y-7.5);if(d===5)put(x,y,[183,157,87]);else if(d===4)put(x,y,[250,235,179]);else if(d===2)put(x,y,[139,195,202]);}
      rect(7,5,2,6,[250,233,167]);rect(5,7,6,2,[250,233,167]);rect(7,7,2,2,[110,179,196]);
    } else if(name==='skyPortal'){
      const colors=[[102,173,197],[148,207,219],[195,232,232],[239,247,224]],alpha=[65,88,119,158];
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const wave=Math.sin((x+y)*Math.PI/8)+.55*Math.sin((2*x-y)*Math.PI/8),band=wave<-.65?0:wave<.1?1:wave<.8?2:3;
        if((x===4&&y===3)||(x===12&&y===11))put(x,y,[255,235,168],211);else put(x,y,colors[band],alpha[band]);
      }
    } else if(name==='emberRock'||name==='lava'){
      // Periodic cells produce broad cooled plates and narrow molten channels.
      // Distances wrap at 16px so a merged wall never exposes a tile seam.
      const lava=name==='lava',sites=lava?[[2,2],[11,3],[6,11],[14,13]]:[[2,3],[10,1],[6,9],[14,12],[0,15]];
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        let near=Infinity,next=Infinity,cell=0;
        for(let i=0;i<sites.length;i++){const dx=Math.abs(x-sites[i][0]),dy=Math.abs(y-sites[i][1]),d=Math.min(dx,16-dx)**2+Math.min(dy,16-dy)**2;if(d<near){next=near;near=d;cell=i;}else if(d<next)next=d;}
        const edge=next-near;
        if(lava){const c=near<2?[145,34,21]:edge<3?[255,224,83]:edge<7?[255,176,35]:edge<14?[255,119,18]:edge<25?[241,76,14]:[211,49,18];put(x,y,c);}
        else{const palettes=[[78,46,49],[91,51,50],[65,40,47],[83,47,47],[71,42,48]],c=edge<3?[35,26,33]:edge<7?[111,56,45]:shade(palettes[cell],h(x,y,seed+11)>.5?3:-3);put(x,y,c);}
      }
    } else if(name==='emberBricks'){
      const b=[73,43,49];noiseFill(b,8);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){const row=y%4,col=(x+((y>>2)%2)*4)%8;if(row===0||col===0)put(x,y,[29,24,32]);else if(row===1)put(x,y,[100,55,55]);else if(col===7)put(x,y,[52,31,40]);}
      for(const [x,y]of [[2,1],[11,5],[5,9],[14,13]])put(x,y,[145,65,42]);
    } else if(name==='glowCrystal'){
      noiseFill([65,39,47],10);
      for(const [cx,cy,r]of [[4,5,3],[11,3,2],[10,11,3]])for(let y=cy-r-1;y<=cy+r+1;y++)for(let x=cx-r-1;x<=cx+r+1;x++){
        const d=Math.abs(x-cx)+Math.abs(y-cy);if(d===r+1)put(x,y,[91,43,35]);else if(d<=r)put(x,y,x+y<cx+cy?[255,222,119]:x>cx?[179,80,23]:[244,166,48]);
      }
      put(4,3,[255,243,180]);put(10,9,[255,243,180]);put(11,2,[255,243,180]);
    } else if(name==='riftFrame'){
      const b=[57,43,73];noiseFill(b,8);
      rect(0,0,16,1,[27,23,38]);rect(0,0,1,16,[27,23,38]);rect(15,0,1,16,[76,53,94]);rect(0,15,16,1,[76,53,94]);
      for(const [x,y]of [[2,2],[11,2],[2,11],[11,11]]){rect(x,y,3,1,[112,75,131]);rect(x,y,1,3,[112,75,131]);put(x+1,y+1,[37,28,51]);}
      for(let y=3;y<=12;y++)for(let x=3;x<=12;x++){const d=Math.abs(x-7.5)+Math.abs(y-7.5);if(d===5)put(x,y,[131,89,153]);else if(d===4)put(x,y,[30,24,43]);else if(d===2)put(x,y,[94,61,118]);}
      rect(7,6,2,4,[164,112,183]);rect(6,7,4,2,[164,112,183]);rect(7,7,2,2,[53,35,76]);
    } else if(name==='rift'){
      // Quantized periodic interference: translucent violet ribbons, not blue water.
      const colors=[[60,24,96],[96,39,147],[147,70,198],[198,126,233]],alpha=[92,112,140,176];
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const wave=Math.sin((x+y)*Math.PI/8)+.65*Math.sin((x-y)*Math.PI/4),band=wave<-.65?0:wave<.1?1:wave<.8?2:3;
        if(h(x,y,seed+53)>.986)put(x,y,[237,188,255],210);else put(x,y,colors[band],alpha[band]);
      }
    } else if(['redWool','blueWool','yellowWool','greenWool','purpleWool','orangeWool','cyanWool','blackWool'].includes(name)){
      const b={redWool:[169,58,55],blueWool:[63,91,167],yellowWool:[220,181,57],greenWool:[74,132,66],purpleWool:[129,73,158],orangeWool:[220,126,48],cyanWool:[63,162,174],blackWool:[47,49,57]}[name];
      noiseFill(b,13);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        if((x+2*(y>>2))%4===0&&y%4<2)put(x,y,shade(b,7+h(x,y,seed+19)*5));
        else if(x%4===3&&y%4===2)put(x,y,shade(b,-8));
      }
    } else if(name==='smoothStone'){
      const b=[151,157,160];noiseFill(b,8);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){if(x===0||y===0)put(x,y,shade(b,-17));else if(x===15||y===15)put(x,y,shade(b,8));else if((x+y*3)%19===6&&h(x,y,seed+7)>.45)put(x,y,shade(b,-7));}
    } else if(name==='polishedBasalt'){
      const b=[64,70,79];noiseFill(b,8);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){if(x===0||x===7||x===15)put(x,y,shade(b,-15));else if(x===1||x===8)put(x,y,shade(b,10));else if((y+(x>>1))%7===0)put(x,y,shade(b,5));}
    } else if(name==='chiseledStone'){
      const b=[146,151,149];noiseFill(b,8);
      rect(1,1,14,14,shade(b,-24));rect(2,2,12,12,shade(b,10));rect(3,3,10,10,shade(b,-13));rect(4,4,8,8,b);
      rect(6,5,4,6,shade(b,-28));rect(5,6,6,4,shade(b,-28));rect(6,6,4,4,shade(b,9));rect(7,7,2,2,shade(b,-12));
    } else if(name==='terracottaTiles'){
      const b=[178,103,69];noiseFill(b,11);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){if(x%8===0||y%8===0)put(x,y,[205,178,133]);else if(x%8===7||y%8===7)put(x,y,[125,67,45]);}
      for(const [x,y]of [[4,4],[12,4],[4,12],[12,12]]){put(x,y,[239,199,126]);put(x-1,y,[221,170,99]);put(x+1,y,[221,170,99]);put(x,y-1,[221,170,99]);put(x,y+1,[221,170,99]);}
    } else if(name==='grassTop') {
      noiseFill([105,151,61],22);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){const r=h(x,y,903);if(r<.14)put(x,y,[85,129,45]);else if(r>.91)put(x,y,[122,165,74]);}
    } else if(name==='dirt'||name==='grassSide'){
      noiseFill([131,92,64],29);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const r=h(x,y,41);
        if(r>.94)put(x,y,[155,125,95]);else if(r<.06)put(x,y,[101,75,54]);
      }
      if(name==='grassSide') for(let x=0;x<S;x++){const depth=3+(h(x>>1,0,500)*3|0);for(let y=0;y<depth;y++)put(x,y,shade([97,142,52],(h(x,y,13)-.5)*22));if(depth<6&&x%3===1)put(x,depth,[80,118,42]);}
    } else if(['stone','coalOre','ironOre','goldOre','diamondOre'].includes(name)){
      noiseFill([130,136,140],24);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        if(h((x+2)>>2,(y+1)>>1,111)>.75)put(x,y,shade([113,119,125],h(x,y,311)*10));
      }
      if(name!=='stone'){
        const cols={coalOre:[[25,30,34],[42,47,51],[74,81,83]],ironOre:[[115,79,62],[185,137,103],[226,184,145]],goldOre:[[133,92,26],[222,174,49],[255,227,117]],diamondOre:[[22,106,121],[52,196,194],[168,249,227]]}[name];
        // Broad connected mineral veins remain legible at a distance.
        const clusters=[[2,2,3,3],[10,2,4,2],[6,6,3,3],[1,11,4,2],[11,10,3,4]];
        for(const [x,y,w,ht] of clusters){rect(x-1,y,1,ht,[99,105,112]);rect(x,y,w,ht,cols[1]);rect(x,y,w-1,1,cols[2]);rect(x+w-1,y+1,1,ht-1,cols[0]);rect(x+1,y+ht-1,w-1,1,cols[0]);}
      }
    } else if(name==='sand'){
      noiseFill([220,204,151],14);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(h(x,y,71)>.89)put(x,y,[201,185,132]);
    } else if(name==='oakBark'||name==='spruceBark'){
      const dark=name==='spruceBark',b=dark?[89,68,48]:[121,89,52];
      noiseFill(b,14);
      for(let x=0;x<S;x++){
        const stripe=h(x,1,139)>.55? -20:12;
        for(let y=0;y<S;y++)if(h(x,(y+((x*3)%5))>>2,129)>.24)put(x,y,shade(b,stripe+(h(x,y,39)-.5)*12));
      }
      [[3,5],[11,10]].forEach(([x,y])=>{rect(x,y,2,3,shade(b,-22));put(x+1,y+1,shade(b,18));});
    } else if(name==='oakEnd'||name==='spruceEnd'){
      const dark=name==='spruceEnd',c=dark?[144,113,73]:[183,147,91],edge=dark?[85,67,47]:[113,82,48];
      noiseFill(c,10);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const dx=Math.abs(x-7.5),dy=Math.abs(y-7.5),d=Math.max(dx,dy)+Math.min(dx,dy)*.24;
        if(d>7)put(x,y,shade(edge,h(x,y,9)*9));
        else if(Math.floor(d)===2||Math.floor(d)===5)put(x,y,shade(c,-30));
        else if(Math.floor(d)===3||Math.floor(d)===6)put(x,y,shade(c,9));
      }
      rect(7,7,2,2,shade(c,-34));rect(12,7,2,1,shade(c,-27));
    } else if(name==='oakLeaves'||name==='spruceLeaves'){
      // Original irregular foliage masses: offset, overlapping lobes rather
      // than a repeating woven 4px border. All colors remain green under gaps.
      const spruce=name==='spruceLeaves';
      const palette=spruce
        ?[[40,73,54],[47,84,61],[55,96,69],[64,108,77],[76,120,88],[88,132,99]]
        :[[56,91,35],[66,103,39],[77,116,44],[89,128,51],[101,140,60],[113,150,69]];
      const lobes=spruce
        ?[[1.0,1.0,3.8,2.1,.06],[6.3,2.0,3.7,2.2,-.02],[12.2,.6,3.5,2.0,.10],
          [2.4,6.3,3.8,2.3,.02],[9.1,6.0,3.9,2.3,.13],[14.3,8.8,3.2,2.7,-.05],
          [1.0,12.1,3.8,2.4,.08],[6.4,11.8,3.9,2.5,-.04],[10.7,14.3,3.6,2.2,.11]]
        :[[1.0,1.1,3.2,2.5,.10],[6.2,2.1,3.1,2.6,.00],[12.1,.8,3.3,2.5,.03],
          [3.0,6.9,3.4,2.8,.00],[9.0,6.0,3.5,2.6,.16],[14.1,8.2,2.5,3.2,-.04],
          [.8,12.9,3.2,2.8,.05],[6.0,11.8,3.7,3.0,-.06],[11.0,14.0,3.6,2.6,.13]];
      const gaps=spruce
        ?[[2,2],[3,2],[3,3],[4,3],[3,4],[11,1],[12,1],[11,2],[12,2],[7,7],[8,7],[6,8],[7,8],[8,8],[13,11],[14,11],[14,12],[15,12],[14,13],[3,12],[4,12],[3,13],[4,13]]
        :[[3,3],[4,3],[4,4],[5,4],[11,4],[12,4],[12,5],[13,5],[12,6],[1,9],[2,9],[1,10],[2,10],[7,13],[8,13],[8,14],[9,14],[14,11],[15,11],[14,12],[15,12]];
      const holes=new Set(gaps.map(([x,y])=>x+y*S));
      const wrap=n=>n-Math.round(n/S)*S;
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        let light=-2;
        for(const [cx,cy,rx,ry,bias] of lobes){
          const dx=wrap(x-cx),dy=wrap(y-cy),slant=dx+dy*(spruce?.42:.22);
          const shape=Math.pow(Math.abs(slant/rx),1.65)+Math.pow(Math.abs(dy/ry),1.65);
          light=Math.max(light,1-shape+bias-dx*.035-dy*.055);
        }
        const tone=Math.max(0,Math.min(5,Math.floor(light*2.8+2.5)));
        put(x,y,palette[tone],holes.has(x+y*S)?0:255);
      }
    } else if(name==='water'){
      noiseFill([65,125,164],10,150);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)if((y+(x>>2))%7===0&&h(x>>1,y,71)>.38)put(x,y,[97,160,191],155);
    } else if(name==='planks'||name==='darkPlanks'){
      const dark=name==='darkPlanks',base=dark?[115,85,53]:[178,137,80];
      noiseFill(base,10);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const row=Math.floor(y/4),joint=((x+(row%2)*8)%16===0);
        if(y%4===3)put(x,y,shade(base,-42));
        else if(joint)put(x,y,shade(base,-31));
        else if(y%4===0)put(x,y,shade(base,17));
        else if(h(x>>2,row,199)>.66&&y%4===2)put(x,y,shade(base,-16));
      }
    } else if(name==='cobble'){
      noiseFill([117,124,126],13);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const row=(y/4)|0,xx=(x+(row%2)*3)%8;
        if(y%4===0||xx===0)put(x,y,[75,82,87]);
        else if(y%4===1||xx===1)put(x,y,[150,155,154]);
        else if(y%4===3)put(x,y,[108,115,119]);
      }
    } else if(name==='glass'){
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){const edge=x===0||y===0||x===15||y===15;put(x,y,edge?[175,220,226]:[201,233,238],edge?205:24);}
      for(let i=2;i<7;i++){put(i,8-i,[222,247,248],155);if(i<5)put(i+7,14-i,[222,247,248],120);}
    } else if(name==='brick'){
      noiseFill([165,94,78],16);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const row=(y/4)|0;
        if(y%4===3||(x+(row%2)*4)%8===7)put(x,y,[191,178,155]);
        else if(y%4===0)put(x,y,[185,113,91]);
      }
    } else if(name==='snow'){
      noiseFill([229,239,237],9);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(h(x>>1,y>>1,727)>.8)put(x,y,[211,226,229]);
    } else if(name==='bedrock'){
      noiseFill([68,73,78],44);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(h(x>>1,y>>1,101)>.68)put(x,y,shade([29,34,39],h(x,y,441)*18));
    } else if(name==='tableTop'){
      // Original workshop drafting mat: a copper compass, one ruler and worn cloth.
      noiseFill([91,64,48],8);
      rect(1,1,14,14,[184,119,71]);rect(2,2,12,12,[35,79,83]);
      for(let y=3;y<13;y++)for(let x=3;x<13;x++)put(x,y,shade([43,91,92],h(x,y,188)*9-4));
      for(let y=4;y<=10;y++)for(let x=4;x<=10;x++)if(Math.abs(x-7)+Math.abs(y-7)===3)put(x,y,[203,160,92]);
      rect(7,4,1,7,[224,213,165]);rect(4,7,7,1,[224,213,165]);put(7,7,[105,172,160]);put(7,4,[247,232,182]);
      rect(3,12,10,1,[194,143,83]);for(const x of [3,5,7,9,11])put(x,11,[216,176,108]);
      rect(11,3,2,1,[161,194,174]);rect(12,4,1,3,[130,169,152]);
      for(const [x,y]of [[1,1],[13,1],[1,13],[13,13]]){rect(x,y,2,2,[231,177,102]);put(x,y,[111,71,43]);}
      put(4,3,[95,135,121]);put(3,9,[79,119,108]);put(10,10,[85,126,115]);
    } else if(name==='workshopFrame'){
      // Original walnut grain, a warm bevel and restrained copper pegs.
      noiseFill([94,61,43],7);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        if(x===0||x===15)put(x,y,[60,42,34]);
        else if(x===1)put(x,y,[134,91,57]);
        else if(x===14)put(x,y,[72,47,36]);
        else if((x===5||x===10)&&h(x,y>>2,207)>.38)put(x,y,shade([77,49,36],h(x,y,208)*6));
      }
      for(const [x,y]of [[3,2],[12,13]]){put(x,y,[192,132,75]);put(x,y+1,[122,77,45]);}
    } else if(name==='tableSide'){
      // Two shallow drawers and a teal strap replace the familiar tool-on-plank motif.
      noiseFill([103,70,50],8);rect(0,0,16,2,[182,119,70]);rect(0,2,16,1,[65,49,43]);
      rect(1,3,2,13,[70,52,43]);rect(13,3,2,13,[70,52,43]);
      rect(3,4,10,5,[140,93,59]);rect(3,4,10,1,[180,126,79]);rect(3,8,10,1,[78,55,43]);
      rect(6,6,4,1,[226,175,98]);put(6,7,[111,73,43]);put(9,7,[111,73,43]);
      rect(3,10,10,4,[125,82,55]);rect(3,10,10,1,[166,109,69]);rect(7,10,2,5,[42,91,91]);
      rect(6,12,4,2,[201,149,82]);rect(7,12,2,1,[56,100,95]);
      rect(3,15,10,1,[61,47,41]);put(2,3,[208,159,94]);put(13,3,[208,159,94]);
    } else if(name==='stoneBricks'||name==='furnaceSide'||name==='furnaceTop'||name==='furnaceFront'){
      const furnace=name!=='stoneBricks',base=furnace?[111,119,124]:[135,143,147];
      noiseFill(base,11);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const row=y>>3,xx=(x+(row%2)*4)%8;
        if(y%8===7||xx===7)put(x,y,shade(base,-39));
        else if(y%8===0||xx===0)put(x,y,shade(base,19));
        else if(y%8===6)put(x,y,shade(base,-12));
      }
      if(name==='furnaceTop'){
        rect(2,2,12,12,[88,96,102]);rect(3,3,10,10,[119,127,132]);rect(4,4,8,1,[133,141,145]);rect(3,12,10,1,[97,105,111]);
      }else if(name==='furnaceFront'){
        rect(2,3,12,10,[65,72,77]);rect(3,4,10,8,[30,35,40]);rect(4,4,8,1,[19,24,30]);
        rect(3,8,10,1,[92,99,101]);rect(4,10,2,1,[133,65,30]);rect(7,10,2,1,[163,84,31]);rect(10,10,2,1,[118,56,28]);
        rect(3,13,10,1,[153,160,160]);rect(4,2,8,1,[147,155,157]);
      }
    } else if(name==='bookshelf'){
      noiseFill([101,70,42],9);
      rect(1,1,14,6,[50,43,34]);rect(1,9,14,6,[50,43,34]);
      const books=[[2,2,2,5,[146,65,55]],[4,3,2,4,[90,126,121]],[7,1,2,6,[191,162,83]],[9,2,2,5,[91,111,148]],[12,2,2,5,[118,141,78]],[2,10,2,5,[86,112,148]],[5,9,2,6,[173,91,57]],[7,10,2,5,[162,143,84]],[10,9,2,6,[92,139,116]],[12,11,2,4,[143,84,96]]];
      for(const [x,y,w,ht,c] of books){rect(x,y,w,ht,c);rect(x,y,1,ht,shade(c,17));put(x,y+1,[222,202,151]);}
      for(const y of [0,7,15]){rect(0,y,16,1,[181,137,78]);if(y<15)rect(0,y+1,16,1,[130,90,47]);}
      rect(0,0,1,16,[172,124,69]);rect(15,0,1,16,[113,76,42]);
    } else if(name==='torch'){
      rect(7,5,3,11,[131,87,40]);rect(7,6,1,10,[183,126,56]);rect(6,3,5,4,[234,143,31]);rect(7,1,3,5,[255,203,63]);rect(8,2,2,3,[255,241,162]);
    } else if(name==='wool'||name==='pinkWool'){
      const c=name==='pinkWool'?[218,156,161]:[225,225,215];noiseFill(c,10);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)if((x+y)%4===0)put(x,y,shade(c,-10));else if((x+y)%4===1)put(x,y,shade(c,6));
    } else if(name==='basalt'){
      noiseFill([71,76,84],17);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(x%5===0)put(x,y,[48,54,64]);else if(x%5===1)put(x,y,[92,97,104]);
    } else if(name==='flower'){
      rect(7,6,2,10,[64,119,46]);rect(5,10,3,2,[87,146,59]);rect(9,8,3,2,[77,133,54]);
      [[6,2,4,2],[4,4,3,3],[9,4,3,3],[6,7,4,2]].forEach(r=>rect(...r,[247,216,111]));
      rect(6,4,4,3,[229,164,48]);rect(7,4,2,2,[255,238,142]);put(6,7,[242,202,85]);
    } else if(name==='tallgrass'){
      for(let x=2;x<15;x+=2){const top=3+(h(x,0,111)*7|0);for(let y=top;y<16;y++){const bend=Math.floor((15-y)/5)*(x<8?-1:1);put(Math.max(0,Math.min(15,x+bend)),y,shade([92,144,56],h(x,y,5)*22));if(y>9)put(x+1,y,[86,131,48]);}}
    } else if(name==='oakSapling'){
      // Two broad leaf tufts and a forked trunk; the stem meets the ground row.
      rect(7,8,2,8,[101,73,42]);rect(7,10,1,6,[153,111,56]);rect(5,8,2,3,[119,86,44]);rect(9,7,2,3,[119,86,44]);
      rect(3,5,5,5,[55,96,38]);rect(2,6,6,3,[55,96,38]);rect(8,3,5,6,[55,96,38]);rect(9,2,3,1,[55,96,38]);
      rect(3,5,4,3,[83,137,49]);rect(2,6,2,2,[90,147,55]);rect(8,3,4,4,[87,140,51]);rect(9,2,2,2,[105,158,65]);
      rect(4,5,2,1,[123,171,75]);rect(9,4,2,1,[127,174,79]);rect(4,8,3,1,[70,118,42]);rect(10,7,3,1,[65,112,41]);
    } else if(name==='spruceSapling'){
      // Three stepped needle whorls keep this silhouette distinct from oak.
      rect(7,8,2,8,[84,66,45]);rect(7,11,1,5,[132,103,62]);
      rect(7,2,2,3,[44,79,59]);rect(5,5,6,3,[39,73,55]);rect(3,9,10,3,[34,67,52]);rect(2,11,12,1,[34,67,52]);
      rect(7,2,1,2,[90,139,99]);rect(6,4,4,2,[66,109,79]);rect(5,6,5,1,[74,121,87]);rect(4,8,8,2,[55,96,70]);
      rect(3,10,9,1,[63,107,76]);rect(5,8,3,1,[82,129,90]);rect(8,6,2,2,[47,88,66]);rect(10,10,3,1,[44,82,63]);
    } else if(name==='clay'){
      noiseFill([156,169,174],12);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)if((y+2)%6===0&&h(x>>2,y,92)>.5)put(x,y,[139,153,160]);
    } else if(name==='gravel'){
      noiseFill([138,137,126],27);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const n=h(x>>1,y>>1,281),c=n<.25?[101,107,106]:n>.75?[170,163,143]:[138,138,128];put(x,y,shade(c,(h(x,y,2)-.5)*20));
      }
    } else if(name==='glowstone'){
      noiseFill([169,124,46],20);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){const k=h(x>>1,y>>1,841);if(k>.24)put(x,y,k>.68?[250,226,143]:[233,190,88]);}
    } else if(name==='obsidian'){
      noiseFill([40,34,54],16);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){const n=h(x>>1,y>>1,755);if(n>.79)put(x,y,[71,55,88]);else if(n<.2)put(x,y,[24,25,34]);}
    } else if(name==='cactusSide'){
      noiseFill([91,134,54],14);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        if(x%4===0)put(x,y,[65,104,39]);else if(x%4===1)put(x,y,[118,153,67]);
        if((x+(Math.floor(y/4)%2)*2)%7===2&&y%4===1){put(x,y,[207,207,144]);put(x,y+1,[53,87,35]);}
      }
    } else if(name==='cactusTop'){
      noiseFill([132,164,75],15);rect(0,0,16,1,[69,112,42]);rect(0,15,16,1,[69,112,42]);rect(0,0,1,16,[69,112,42]);rect(15,0,1,16,[69,112,42]);rect(6,6,4,4,[175,190,112]);rect(7,7,2,2,[105,141,60]);
    } else if(name==='heldWood'){
      // Opaque carved wood, with quiet grain rather than a log-end illustration.
      // A shared physical UV scale on the held model determines pixel size.
      noiseFill([144,103,60],9);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const grain=(x+(y>=10&&x>=8?1:0))%7;
        if(grain===1)put(x,y,shade([112,77,41],(h(x,y,419)-.5)*8));
        else if(grain===2&&y%9!==0)put(x,y,shade([169,124,73],(h(x,y,421)-.5)*7));
      }
      rect(10,6,2,3,[118,80,43]);rect(11,7,1,1,[158,111,60]);
    } else if(name==='heldFlame'){
      // An opaque incandescent surface for the existing stepped 3D flame.
      // Its broad tongues and warm core are authored pixel clusters, not a
      // transparent upright torch glyph wrapped around each separate cube.
      const colors={o:[214,88,15],a:[244,130,24],y:[255,179,45],h:[255,217,91],w:[255,244,174]};
      const rows=[
        'ooyyaaoooyhyaaoo','aayhyyaooywwhyaa','ayhwhyaayhwwhyaa','ayhwhyaayhwhyaao',
        'aayhyaooyhwhyaao','oayhyaooyhwhyaao','oyhwhyaayhwhyaao','aywwhyaayhwhyaao',
        'aywwhyaayhwhyaao','ayhwhyaayhwhyaao','aayhyaooyhwhyaao','oayhyaooyhwhyaao',
        'oyhwhyaaywwhyaao','aywwhyaaywwhyaao','ayhwhyaayhwhyaao','aayhyaooyhwhyaao'
      ];
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)put(x,y,colors[rows[y][x]]);
    } else if(name==='birchBark'){
      // Pale papery bark with short, staggered charcoal scars.
      noiseFill([216,216,193],9);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(h(x>>2,y>>1,2711)>.79)put(x,y,shade([197,201,179],(h(x,y,2713)-.5)*8));
      for(const [x,y,w] of [[1,2,5],[10,5,6],[4,9,4],[0,13,3],[11,14,4]]){
        rect(x,y,w,1,[64,67,58]);rect(x+1,y+1,Math.max(1,w-2),1,[96,98,81]);
        put(x+w-1,y,[126,128,109]);put(x-1,y,[175,178,157]);
      }
      rect(7,5,2,1,[151,155,133]);rect(8,12,2,1,[151,155,133]);
    } else if(name==='acaciaBark'){
      // Rough gray bark surrounds the warm orange heartwood.
      noiseFill([96,91,77],14);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const ridge=(x+(y>9?1:0))%5;
        if(ridge===1)put(x,y,shade([65,66,57],(h(x,y,2741)-.5)*10));
        else if(ridge===2&&h(x,y>>2,2743)>.2)put(x,y,[121,113,91]);
      }
      rect(4,4,2,3,[76,74,62]);rect(5,5,1,2,[135,122,95]);rect(12,10,2,3,[69,70,60]);
    } else if(name==='cherryBark'){
      // Dusky red-brown bark with scattered horizontal lenticels.
      noiseFill([94,62,68],13);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(h(x>>1,y>>2,2771)<.24)put(x,y,shade([77,52,59],(h(x,y,2773)-.5)*7));
      for(const [x,y,w] of [[1,3,4],[9,1,5],[5,7,4],[0,11,3],[11,12,5],[5,15,3]]){
        rect(x,y,w,1,[146,104,103]);rect(x+1,y+1,Math.max(1,w-2),1,[64,45,54]);
        put(x+w-1,y,[177,126,117]);
      }
    } else if(['birchEnd','acaciaEnd','cherryEnd'].includes(name)){
      const [c,edge]={
        birchEnd:[[211,192,139],[190,192,171]],
        acaciaEnd:[[193,115,63],[87,82,70]],
        cherryEnd:[[220,166,148],[83,54,61]]
      }[name];
      noiseFill(c,9);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const dx=Math.abs(x-7.5),dy=Math.abs(y-7.5),d=Math.max(dx,dy)+Math.min(dx,dy)*.24;
        if(d>7)put(x,y,shade(edge,h(x,y,2801)*8));
        else if(Math.floor(d)===2||Math.floor(d)===5)put(x,y,shade(c,-29));
        else if(Math.floor(d)===3||Math.floor(d)===6)put(x,y,shade(c,11));
      }
      rect(7,7,2,2,shade(c,-35));rect(11,7,3,1,shade(c,-26));
    } else if(['birchPlanks','acaciaPlanks','cherryPlanks'].includes(name)){
      const base={birchPlanks:[202,184,133],acaciaPlanks:[179,100,57],cherryPlanks:[211,151,148]}[name];
      noiseFill(base,9);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const row=y>>2,joint=(x+(row%2)*8)%16===0;
        if(y%4===3)put(x,y,shade(base,-39));
        else if(joint)put(x,y,shade(base,-29));
        else if(y%4===0)put(x,y,shade(base,17));
        else if(h(x>>2,row,seed+17)>.64&&y%4===2)put(x,y,shade(base,-16));
      }
    } else if(['birchLeaves','acaciaLeaves','cherryLeaves'].includes(name)){
      // Use the accepted overlapping-lobe foliage language. Each species has
      // its own offset masses and irregular gaps; no woven or repeating grid.
      const style={
        birchLeaves:{
          palette:[[63,90,34],[78,108,39],[94,125,46],[111,142,54],[128,158,65],[145,174,79]],
          lobes:[[.8,1.3,3.1,2.7,.07],[6.0,1.0,3.5,2.4,.01],[12.3,2.2,3.2,2.8,.09],[2.3,6.6,3.1,3.0,.04],[8.4,6.1,3.6,2.9,.14],[14.0,8.2,2.7,3.2,-.03],[1.0,12.4,3.3,2.5,.05],[6.6,12.0,3.4,2.7,-.02],[11.6,13.9,3.5,2.4,.11]],
          gaps:[[2,3],[3,3],[3,4],[4,4],[10,2],[11,2],[11,3],[12,3],[6,8],[7,8],[7,9],[8,9],[14,6],[15,6],[14,7],[15,7],[2,12],[2,13],[3,13],[10,13],[11,13],[11,14]],slant:.18
        },
        acaciaLeaves:{
          palette:[[53,73,37],[65,87,41],[79,102,47],[94,117,54],[110,133,62],[127,148,74]],
          lobes:[[1.1,1.3,4.1,2.1,.07],[7.2,2.0,4.1,2.2,-.02],[13.6,.3,3.8,2.1,.09],[2.1,6.2,4.1,2.4,.02],[9.4,6.6,4.0,2.3,.13],[14.5,9.2,3.2,2.4,-.02],[1.3,12.4,4.0,2.1,.04],[7.0,11.4,4.1,2.5,-.03],[11.7,14.5,3.9,2.0,.09]],
          gaps:[[1,4],[2,4],[2,5],[3,5],[8,1],[9,1],[9,2],[10,2],[12,7],[13,7],[13,8],[14,8],[4,9],[5,9],[4,10],[5,10],[9,13],[10,13],[10,14],[11,14],[0,12],[1,12],[0,13]],slant:.34
        },
        cherryLeaves:{
          palette:[[144,72,101],[173,91,121],[196,114,143],[216,137,161],[236,162,179],[248,188,197]],
          lobes:[[.5,1.0,3.3,2.9,.09],[5.9,2.0,3.3,2.8,.01],[12.0,.8,3.5,2.8,.08],[2.8,7.0,3.7,2.9,.04],[8.7,6.0,3.4,3.0,.16],[14.3,8.1,2.9,3.4,-.03],[.7,13.1,3.3,3.1,.06],[6.2,11.9,3.8,3.0,-.03],[11.5,14.1,3.6,2.7,.12]],
          gaps:[[4,2],[5,2],[5,3],[11,4],[12,4],[12,5],[13,5],[1,8],[2,8],[2,9],[3,9],[8,11],[9,11],[9,12],[10,12],[14,13],[15,13],[14,14],[4,14],[5,14]],slant:.20
        }
      }[name];
      const holes=new Set(style.gaps.map(([x,y])=>x+y*S)),wrap=n=>n-Math.round(n/S)*S;
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        let light=-2;
        for(const[cx,cy,rx,ry,bias]of style.lobes){
          const dx=wrap(x-cx),dy=wrap(y-cy),slant=dx+dy*style.slant;
          const shape=Math.pow(Math.abs(slant/rx),1.65)+Math.pow(Math.abs(dy/ry),1.65);
          light=Math.max(light,1-shape+bias-dx*.035-dy*.055);
        }
        const tone=Math.max(0,Math.min(5,Math.floor(light*2.8+2.5)));
        put(x,y,style.palette[tone],holes.has(x+y*S)?0:255);
      }
    } else if(name==='birchSapling'){
      // Slender pale trunk and three high, pointed green leaf tufts.
      rect(7,7,2,9,[173,173,142]);rect(7,9,1,7,[224,220,183]);put(8,11,[80,87,62]);put(7,14,[99,104,76]);
      rect(5,7,2,3,[151,158,112]);rect(9,6,2,3,[151,158,112]);
      rect(6,1,4,6,[76,110,37]);rect(4,3,7,4,[76,110,37]);rect(2,5,5,5,[65,97,34]);rect(9,4,4,5,[65,97,34]);
      rect(6,1,3,3,[132,167,65]);rect(5,3,4,3,[112,148,51]);rect(3,5,3,3,[117,153,55]);rect(9,4,3,3,[125,161,61]);
      rect(6,2,2,1,[157,185,88]);rect(3,5,2,1,[149,179,79]);rect(10,4,2,1,[157,185,88]);rect(4,8,2,1,[86,125,41]);rect(10,7,2,1,[86,125,41]);
    } else if(name==='acaciaSapling'){
      // A forked leaning stem and a broad, low umbrella canopy.
      rect(7,10,2,6,[87,79,55]);rect(7,12,1,4,[142,120,75]);rect(6,8,2,4,[108,95,61]);rect(5,6,2,3,[108,95,61]);rect(8,8,3,2,[108,95,61]);rect(10,6,2,3,[108,95,61]);
      rect(2,4,11,3,[64,88,38]);rect(1,5,13,2,[64,88,38]);rect(4,3,7,2,[64,88,38]);
      rect(3,4,5,2,[110,139,58]);rect(8,4,4,2,[96,124,49]);rect(4,3,6,1,[136,157,73]);rect(2,5,3,1,[126,150,66]);rect(9,4,3,1,[139,161,78]);rect(5,6,4,1,[80,109,43]);
    } else if(name==='cherrySapling'){
      // Three pink blossom tufts and a warm forked trunk reach the ground.
      rect(7,8,2,8,[88,54,53]);rect(7,11,1,5,[155,98,79]);rect(5,7,3,3,[115,70,65]);rect(9,7,2,3,[115,70,65]);
      rect(3,3,5,6,[158,77,109]);rect(2,5,6,3,[158,77,109]);rect(7,2,5,6,[158,77,109]);rect(10,4,4,6,[158,77,109]);
      rect(3,3,4,3,[224,145,167]);rect(2,5,4,2,[216,132,158]);rect(7,2,4,4,[235,161,181]);rect(10,4,3,3,[224,145,167]);
      rect(4,3,2,1,[252,198,205]);rect(8,2,2,1,[252,198,205]);rect(10,4,2,1,[247,184,196]);rect(4,7,3,1,[191,107,140]);rect(11,8,2,1,[191,107,140]);
    } else if(name==='farmlandTop'){
      noiseFill([110,77,46],12);
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const furrow=x%4,c=furrow===0?[70,47,29]:furrow===1?[90,61,36]:furrow===2?[130,91,53]:[112,78,45];
        put(x,y,shade(c,(h(x>>1,y>>1,1611)-.5)*11));
      }
      rect(2,3,1,2,[143,101,59]);rect(6,10,1,2,[140,98,56]);rect(10,5,1,2,[137,95,54]);rect(14,13,1,2,[145,102,58]);
    } else if(name==='farmlandSide'){
      noiseFill([116,80,49],21);
      for(let y=0;y<3;y++)for(let x=0;x<S;x++)put(x,y,shade(y===0?[79,53,32]:[95,65,39],(h(x>>1,y,1621)-.5)*10));
      rect(3,8,2,1,[139,102,66]);rect(11,12,2,1,[96,68,43]);
    } else if(['wheatSprout','wheatYoung','wheatTall','wheatMature'].includes(name)){
      const stage=['wheatSprout','wheatYoung','wheatTall','wheatMature'].indexOf(name),ripe=stage===3;
      const dark=ripe?[135,101,37]:[58,102,38],stem=ripe?[190,150,55]:[101,145,56],light=ripe?[226,186,83]:[142,174,76];
      const stroke=(x0,y0,x1,y1,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++)put(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),c);};
      // Four staggered tillers fill the existing two crossed planes. Grounded
      // stems, paired grain and open gaps add density without more geometry.
      const bases=[1,5,9,14],offsets=[2,0,1,2],top=[11,7,3,0][stage];
      for(let k=0;k<bases.length;k++){
        const x=bases[k],head=top+offsets[k],stemTop=stage>=2?head+3:head;
        rect(x,stemTop,1,16-stemTop,dark);
        for(let y=stemTop;y<16;y++)if((y+k)%3!==0)put(x,y,stem);
        if(stage===0){
          stroke(x,15,x-1,13+(k%2),stem);stroke(x,14,x+1,12+(k%2),light);
        }else{
          const leafY=stage===1?11+(k%2):10+(k%3);
          stroke(x,leafY+1,x-2,leafY-2,stem);put(x-2,leafY-2,light);put(x-1,leafY-1,light);
          stroke(x,leafY+3,x+2,leafY,stem);put(x+2,leafY,light);put(x+1,leafY+1,light);
          if(stage>=2){
            const grain=ripe?[214,169,65]:[151,166,70],glint=ripe?[245,211,121]:[184,190,91],shadow=ripe?[169,124,41]:[113,137,50];
            put(x,head,glint);
            for(let j=1;j<=4;j++){
              put(x,head+j,grain);
              put(x-1,head+j,j%2?glint:grain);
              put(x+1,head+j,j%2?shadow:glint);
            }
            put(x,head+5,shadow);
          }
        }
      }
    }
    return a;
  }
  function canvasFromPixels(a,w=S,ht=S){
    const c=document.createElement('canvas');c.width=w;c.height=ht;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.putImageData(new ImageData(a,w,ht),0,0);return c;
  }
  function drawFace(ctx,tile,p,brightness){
    ctx.save();ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);for(let i=1;i<4;i++)ctx.lineTo(p[i][0],p[i][1]);ctx.closePath();ctx.clip();
    const a=p[0],b=p[1],d=p[3];ctx.setTransform((b[0]-a[0])/S,(b[1]-a[1])/S,(d[0]-a[0])/S,(d[1]-a[1])/S,a[0],a[1]);ctx.drawImage(tile,0,0);
    if(brightness<1){ctx.fillStyle='rgba(0,0,0,'+(1-brightness)+')';ctx.fillRect(0,0,S,S);}ctx.restore();
  }
  const itemSpriteCache=new Map();
  // Pure cached 16px item art. Treat .data as read-only; no canvas or DOM is needed.
  // Block icons keep their textured 3D projection and intentionally return null here.
  function getItemSprite(id){
    if(!Number.isInteger(id)||!V.items[id]||V.items[id].kind==='block')return null;
    if(itemSpriteCache.has(id))return itemSpriteCache.get(id);
    const p=new Uint8ClampedArray(16*16*4);
    const put=(x,y,color)=>{if(x<0||x>15||y<0||y>15)return;const q=(x+y*16)*4;const col=typeof color==='string'?rgb(color):color;p[q]=col[0];p[q+1]=col[1];p[q+2]=col[2];p[q+3]=255;};
    const rect=(x,y,w,ht,color)=>{for(let yy=y;yy<y+ht;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,color);};
    const line=(x0,y0,x1,y1,color,width=1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),y=Math.round(y0+(y1-y0)*i/n);rect(x,y,width,width,color);}};
    const it=V.items[id],col=rgb(it.color);
    if(id===219||id===220){p.set(makeC9ToolSprite(id,16));}else if(it.kind==='spawn_egg'){
      // Original 16px egg art shared by inventory icons and held-item extrusion.
      const spans=[[2,7,8],[3,6,9],[4,5,10],[5,4,11],[6,3,12],[7,3,12],[8,3,12],[9,3,12],[10,3,12],[11,3,12],[12,4,11],[13,5,10],[14,6,9]];
      const inside=new Set();for(const[y,left,right]of spans)for(let x=left;x<=right;x++)inside.add(x+16*y);
      for(const[y,left,right]of spans)for(let x=left;x<=right;x++){
        const edge=!inside.has(x-1+16*y)||!inside.has(x+1+16*y)||!inside.has(x+16*(y-1))||!inside.has(x+16*(y+1));
        put(x,y,shade(col,edge?-47:x<6?23:x>9?-18:y>11?-12:3));
      }
      const spot=rgb(it.eggSpots),mark=(x,y,w,h,c=spot)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(inside.has(xx+16*yy)&&p[(xx+16*yy)*4+3])put(xx,yy,c);};
      if(it.spawnType==='pig'){mark(5,5,2,2);mark(9,10,2,3);mark(6,8,4,2,[207,115,135]);mark(6,9,1,1,[126,62,75]);mark(9,9,1,1,[126,62,75]);}
      else if(it.spawnType==='sheep'){mark(5,5,3,2);mark(9,7,2,3);mark(5,11,3,2);mark(8,4,1,1,[255,251,235]);}
      else if(it.spawnType==='cow'){mark(5,4,3,3);mark(9,8,3,3);mark(5,11,3,2);mark(4,8,2,1);}
      else if(it.spawnType==='chicken'){mark(7,3,2,3);mark(5,8,2,2);mark(9,11,2,2);mark(7,8,3,2,[234,168,43]);}
      else if(it.spawnType==='rabbit'){mark(5,5,2,4);mark(9,5,2,4);mark(6,10,4,3);mark(7,10,2,1,[158,86,88]);}
      else if(it.spawnType==='wolf'){mark(5,4,2,3);mark(9,4,2,3);mark(6,8,4,3,[215,220,212]);mark(7,9,2,1,[45,52,60]);mark(5,7,1,1,[226,191,70]);mark(10,7,1,1,[226,191,70]);}
      else if(it.spawnType==='fox'){mark(5,4,2,3,[82,47,30]);mark(9,4,2,3,[82,47,30]);mark(5,9,6,3);mark(7,9,2,1,[48,37,30]);mark(5,7,1,1,[48,37,30]);mark(10,7,1,1,[48,37,30]);}
      else if(it.spawnType==='horse'){mark(7,4,2,7);mark(4,6,2,2,[57,40,29]);mark(10,6,2,2,[57,40,29]);mark(5,11,6,2);mark(6,11,1,1,[78,53,37]);mark(9,11,1,1,[78,53,37]);}
      else if(it.spawnType==='cat'){mark(4,4,2,3,[88,53,34]);mark(10,4,2,3,[88,53,34]);mark(5,8,6,3,[245,221,180]);mark(5,7,1,1,[79,132,95]);mark(10,7,1,1,[79,132,95]);mark(7,9,2,1,[175,101,91]);mark(3,10,3,1,[110,72,48]);mark(10,10,3,1,[110,72,48]);}
      else if(it.spawnType==='goat'){mark(5,4,1,3,[101,84,62]);mark(10,4,1,3,[101,84,62]);mark(6,3,1,2,[169,151,117]);mark(9,3,1,2,[169,151,117]);mark(4,7,2,1,[125,111,88]);mark(10,7,2,1,[125,111,88]);mark(6,7,4,5,[238,231,206]);mark(5,8,2,1,[45,43,36]);mark(9,8,2,1,[45,43,36]);mark(7,10,2,1,[83,73,58]);mark(7,12,2,2,[119,101,77]);}
      else if(it.spawnType==='walker'){mark(4,11,8,2);mark(5,6,2,1,[224,203,102]);mark(9,6,2,1,[224,203,102]);mark(6,9,4,1,[53,74,37]);}
      else if(it.spawnType==='raccoon'){
        // New C10 species only: dark eye mask, pale muzzle and a ringed-tail cue.
        const pale=[236,226,199];mark(5,4,2,2);mark(9,4,2,2);
        mark(4,6,8,3);mark(7,5,2,2,pale);mark(5,7,1,1,pale);mark(10,7,1,1,pale);
        mark(6,9,4,3,pale);mark(7,9,2,1);mark(7,11,2,1);
        mark(5,12,6,1,pale);mark(5,12,1,1);mark(8,12,1,1);mark(10,12,1,1);
      }
      else if(it.spawnType==='armadillo'){
        // New C10 species only: a banded shell in profile with a tapered snout.
        const shell=[202,178,139],face=[219,193,151];mark(5,5,5,7);mark(6,5,3,6,shell);
        mark(5,6,5,1);mark(5,8,5,1);mark(5,10,5,1);mark(6,7,3,1,shell);mark(6,9,3,1,shell);
        mark(10,6,1,3);mark(10,9,3,2,face);mark(11,9,1,1,[47,43,39]);mark(12,10,1,1);
        mark(4,11,3,1);mark(4,12,2,1);mark(7,12,1,1);mark(10,12,1,1);
      }
      else {mark(5,5,6,1);mark(5,7,2,1,[77,94,62]);mark(9,7,2,1,[77,94,62]);mark(7,8,2,3);mark(5,12,6,1);}
    }else if(id===191){
      // Charred wood with a split end and longitudinal grain, distinct from coal.
      const edge=[33,30,28],char=[66,59,51],ash=[116,110,98],grain=[43,38,33];
      rect(5,2,5,2,edge);rect(3,4,9,8,edge);rect(4,12,7,2,edge);rect(12,5,1,6,edge);
      rect(5,3,5,2,char);rect(4,5,7,7,char);rect(5,12,5,1,[49,43,37]);rect(11,5,1,6,grain);
      line(5,5,5,11,ash);line(8,5,8,12,grain);line(10,6,10,10,grain);
      rect(6,3,3,1,ash);put(9,4,[140,126,100]);put(6,7,[93,82,67]);put(7,10,[89,81,69]);
    }else if(id===192){
      // A broad stone shovel blade and two-tone wooden shaft.
      const edge=[54,64,61],stone=[142,154,148],light=[196,207,195];
      line(3,13,10,6,[65,46,29],2);line(4,13,10,7,[177,130,68]);line(5,12,10,7,[205,157,89]);
      rect(9,2,4,1,edge);rect(8,3,6,4,edge);rect(9,7,4,2,edge);rect(10,9,2,1,edge);
      rect(9,3,3,4,stone);rect(10,7,2,1,stone);rect(9,3,1,3,light);rect(10,3,2,1,light);
      rect(12,4,1,3,[108,119,113]);put(10,5,[117,129,122]);rect(8,7,2,1,[90,64,37]);
    }else if(id===193){
      // Iron axe: wide cutting edge, steel neck and a warm wooden handle.
      const edge=[66,81,86],metal=[183,201,204],light=[235,246,235];
      line(3,13,11,5,[66,47,29],2);line(4,13,11,6,[176,128,68]);line(5,12,10,7,[206,158,92]);
      rect(6,2,6,2,edge);rect(4,4,8,4,edge);rect(5,8,6,1,edge);rect(11,5,3,2,edge);
      rect(6,3,5,2,metal);rect(5,5,6,2,metal);rect(11,5,2,1,metal);rect(4,4,1,4,light);
      rect(5,3,1,5,light);rect(6,3,4,1,light);rect(10,5,1,3,[133,157,163]);rect(8,7,2,1,[105,76,45]);
    }else if(id===194){
      // Stone sword: stepped grey blade and an unplated wooden crossguard.
      const edge=[54,65,60],stone=[143,155,146],light=[201,212,193];
      line(3,13,7,9,[76,51,29],2);line(4,13,7,10,[171,120,60]);
      line(7,8,13,2,edge,2);line(8,8,13,3,stone);line(8,7,13,2,light);
      put(10,5,[117,130,119]);put(12,4,[161,172,157]);
      line(5,7,9,11,[69,48,31],2);line(5,6,10,11,[158,109,53]);put(5,6,[217,165,84]);
      rect(2,13,2,2,[75,55,33]);put(2,13,[163,119,60]);
    }else if(id===195||id===196){
      // Duck breast with a pale fat edge; cooked art has a browned score pattern.
      const cooked=id===196,edge=cooked?[87,48,29]:[116,43,57],flesh=cooked?[171,102,49]:[188,87,108],light=cooked?[224,156,73]:[229,131,146],fat=cooked?[231,187,111]:[248,218,196];
      rect(6,3,5,1,edge);rect(4,4,9,2,edge);rect(3,6,11,5,edge);rect(4,11,8,2,edge);rect(5,13,5,1,edge);
      rect(6,4,5,2,light);rect(5,5,7,5,flesh);rect(4,7,9,3,flesh);rect(5,10,6,2,flesh);
      rect(4,6,2,4,fat);rect(5,10,2,2,fat);rect(6,12,4,1,fat);put(4,5,fat);put(5,11,fat);
      rect(7,5,3,1,light);put(11,6,light);put(10,10,cooked?[127,69,36]:[148,57,76]);
      if(cooked){line(7,6,10,9,[102,54,31]);line(9,5,12,8,[110,59,33]);line(6,8,9,11,[110,59,33]);put(8,7,[244,180,86]);}
      else{line(7,7,10,8,[216,113,132]);line(7,10,9,11,[216,113,132]);put(9,6,[244,158,166]);}
    }else if(id===150){
      // Original copper whistle: open mouthpiece, dark air slot, neck cord.
      line(3,3,4,10,[99,67,42],2);line(4,10,8,14,[99,67,42]);line(8,14,11,11,[198,162,100]);
      rect(6,5,7,7,[95,59,35]);rect(7,6,5,5,[202,139,74]);rect(7,6,4,1,[250,198,117]);rect(8,7,2,2,[64,65,58]);
      rect(3,5,5,3,[95,59,35]);rect(3,5,4,1,[242,186,108]);rect(3,6,4,1,[200,133,71]);rect(12,7,1,3,[153,92,49]);
      put(7,10,[240,181,99]);put(10,10,[166,106,56]);
    }else if(id>=176&&id<=181){
      // Original equipment silhouettes: open visor, center-seam vest, split boots.
      const prism=id>=179,part=(id-176)%3,edge=prism?[53,79,95]:[88,53,39],body=prism?[109,174,182]:[192,123,76],light=prism?[202,232,219]:[244,183,109],shadeC=prism?[88,120,151]:[143,81,51],mark=prism?[169,139,211]:[77,146,118];
      if(part===0){rect(4,2,8,2,edge);rect(2,4,12,7,edge);rect(3,10,3,3,edge);rect(10,10,3,3,edge);rect(4,3,8,2,body);rect(3,5,10,3,body);rect(3,8,2,4,body);rect(11,8,2,4,shadeC);rect(4,3,7,1,light);rect(3,5,1,5,light);rect(5,7,6,1,light);rect(7,3,2,3,mark);put(7,3,light);}
      else if(part===1){rect(2,3,4,4,edge);rect(10,3,4,4,edge);rect(4,4,8,10,edge);rect(5,3,6,2,edge);rect(3,4,3,2,body);rect(10,4,3,2,body);rect(5,5,6,8,body);rect(5,5,1,7,light);rect(10,5,1,8,shadeC);rect(7,6,2,7,shadeC);rect(5,11,6,1,light);rect(7,6,2,3,mark);rect(5,4,2,1,light);rect(9,4,2,1,light);put(7,6,light);}
      else{rect(3,3,4,8,edge);rect(9,3,4,8,edge);rect(2,10,5,4,edge);rect(8,10,5,4,edge);rect(4,4,2,7,body);rect(10,4,2,7,body);rect(3,11,3,2,body);rect(9,11,3,2,body);rect(4,4,1,6,light);rect(10,4,1,6,light);rect(3,10,3,1,mark);rect(9,10,3,1,mark);rect(3,13,3,1,shadeC);rect(9,13,3,1,shadeC);}
    }else if(id===182||id===183){
      const trail=id===182,edge=trail?[47,82,61]:[73,48,91],body=trail?[83,164,113]:[148,102,183],light=trail?[192,226,152]:[230,185,219];
      line(4,2,3,6,[153,123,71]);line(11,2,12,6,[221,188,111]);line(4,2,7,1,[221,188,111]);line(8,1,11,2,[153,123,71]);
      rect(5,6,6,1,edge);rect(3,8,10,4,edge);rect(4,7,8,6,edge);rect(6,13,4,2,edge);rect(5,8,6,4,body);rect(6,7,4,1,light);rect(4,9,1,3,light);rect(6,12,4,1,body);
      if(trail){line(6,11,9,8,light);put(6,9,light);put(9,10,light);}else{rect(7,8,2,4,light);rect(5,10,6,1,light);put(8,7,[255,221,142]);}
    }else if(id===184){
      const edge=[64,48,93],violet=[145,110,194],light=[217,188,244],mint=[118,209,188];
      for(let y=1;y<=14;y++){const reach=Math.min(y,15-y,6);for(let x=8-reach;x<=7+reach;x++){const rim=x===8-reach||x===7+reach||y===1||y===14;if(rim)put(x,y,edge);else if(Math.abs(x-7.5)+Math.abs(y-7.5)>4)put(x,y,x<8?light:violet);}}
      rect(7,4,2,8,mint);rect(4,7,8,2,mint);rect(6,6,4,4,[84,132,145]);rect(7,7,2,2,[247,218,133]);put(4,4,light);put(11,11,violet);
    }else if(id===185){
      const edge=[47,80,94],mint=[134,215,204],white=[224,248,224],purple=[153,128,194];
      for(let y=2;y<=13;y++){const reach=Math.min(y-1,14-y,5);for(let x=8-reach;x<=7+reach;x++)put(x,y,x===8-reach||x===7+reach?edge:x<8?white:y<8?mint:purple);}
      line(7,4,7,11,mint);line(8,5,10,8,[90,157,169]);rect(6,6,2,2,[255,248,185]);put(9,10,[207,176,239]);
    }else if(id===141){
      const edge=[83,61,49],copper=[191,119,75],light=[232,166,105];
      rect(5,3,6,2,edge);rect(3,5,10,7,edge);rect(5,12,6,2,edge);rect(2,7,1,3,edge);
      rect(5,4,5,3,copper);rect(4,7,8,4,copper);rect(6,11,4,2,[142,89,60]);rect(4,5,3,3,light);rect(9,6,3,2,[215,143,86]);
      rect(4,9,2,2,[74,124,99]);rect(8,11,2,1,[104,151,113]);put(6,5,[249,194,135]);put(10,9,[117,77,55]);
    }else if(id===142){
      rect(4,4,8,1,[112,63,43]);rect(3,5,10,6,[112,63,43]);rect(2,7,1,4,[112,63,43]);rect(4,11,8,2,[112,63,43]);
      rect(4,5,8,3,[231,155,91]);rect(3,8,9,3,[196,116,65]);rect(12,6,1,5,[150,83,52]);rect(5,5,6,1,[255,198,125]);rect(3,8,2,2,[235,160,95]);rect(5,11,6,1,[161,87,54]);
    }else if(id===143||id===144){
      const purple=id===144,edge=purple?[65,47,98]:[133,130,128],body=purple?[153,106,202]:[218,214,207],light=purple?[223,188,247]:[255,248,226],shadeC=purple?[111,76,161]:[179,179,184];
      for(let y=2;y<=13;y++){const left=y<5?8-(y-2):y<10?5:5+(y-9),right=y<6?9:y<11?12:12-(y-10);for(let x=left;x<=right;x++)put(x,y,x===left||x===right?edge:x<=8?light:x<=10?body:shadeC);}
      line(8,4,8,10,body);put(7,5,light);rect(3,10,2,3,edge);put(3,10,light);put(4,11,body);put(5,13,shadeC);
    }else if(id===145||id===146||id===147){
      const edge=[104,61,43],metal=[205,133,81],light=[251,186,115];
      line(3,13,11,5,[65,48,34],2);line(4,13,11,6,[172,125,70]);line(5,12,10,7,[206,158,92]);
      if(id===145){rect(3,2,8,3,edge);rect(9,4,5,3,edge);rect(12,7,2,3,edge);rect(3,2,7,1,light);rect(4,3,7,1,metal);rect(10,4,3,2,metal);rect(12,6,1,3,light);}
      else if(id===146){rect(5,2,7,2,edge);rect(4,4,8,4,edge);rect(5,8,5,1,edge);rect(5,3,5,2,metal);rect(5,5,6,2,metal);rect(4,4,1,3,light);rect(6,3,4,1,light);rect(10,5,2,1,[155,86,52]);}
      else{rect(9,2,4,1,edge);rect(8,3,6,4,edge);rect(9,7,4,2,edge);rect(10,9,2,1,edge);rect(9,3,3,4,metal);rect(10,7,2,1,metal);rect(9,3,1,3,light);rect(10,3,2,1,light);rect(12,4,1,3,[156,88,52]);}
      rect(8,6,2,2,[57,116,101]);put(8,6,[130,192,153]);
    }else if(id===148){
      const crust=[121,75,40],gold=[220,160,81],apple=[173,70,43];
      rect(4,4,8,2,crust);rect(2,6,12,6,crust);rect(4,12,8,2,crust);rect(3,6,10,5,gold);rect(5,5,6,1,[250,200,116]);rect(4,7,8,3,apple);
      for(const[x,y]of[[4,7],[7,7],[10,7],[5,9],[8,9]])rect(x,y,2,1,[242,184,91]);rect(4,11,8,1,[178,112,51]);put(3,7,[255,215,138]);put(11,10,[223,141,55]);
    }else if(id>=102&&id<=105){
      line(3,13,11,5,[72,51,29],2);line(4,13,11,6,[166,122,65]);
      const shape=[[4,2,7,2],[9,4,4,2],[11,6,3,3]];for(const r of shape)rect(...r,shade(col,-45));
      rect(4,1,7,2,col);rect(10,3,3,3,col);rect(12,5,2,3,col);rect(5,1,5,1,shade(col,37));rect(12,4,1,3,shade(col,25));
    }else if(id===106){
      line(3,13,11,5,[69,49,30],2);line(4,13,11,6,[162,119,66]);rect(6,2,6,5,[63,72,72]);rect(5,3,6,4,col);rect(5,3,1,4,shade(col,40));rect(6,2,4,1,shade(col,35));rect(10,5,3,2,col);
    }else if(id===107){
      line(3,13,7,9,[84,56,30],2);line(7,8,13,2,shade(col,-43),2);line(8,8,13,3,col);line(8,7,13,2,shade(col,27));line(5,7,9,11,[84,92,89]);line(5,6,10,11,[187,163,84]);put(2,14,[195,166,76]);put(3,14,[195,166,76]);
    }else if(id===101){
      line(3,13,12,4,[84,58,31],2);line(4,13,12,5,[175,129,65]);line(5,12,12,5,[193,146,79]);
    }else if(id===108){
      rect(4,5,8,8,[146,45,37]);rect(3,6,10,5,[187,56,44]);rect(4,5,3,6,[218,73,52]);rect(5,6,2,2,[246,130,88]);rect(7,3,2,3,[108,75,40]);rect(9,3,3,2,[78,129,44]);rect(5,13,2,1,[132,43,34]);rect(9,13,2,1,[132,43,34]);
    }else if(id===115||id===116){
      const cooked=id===116,edge=cooked?[91,55,33]:[140,66,74],flesh=cooked?[170,108,53]:[210,124,132],light=cooked?[207,153,85]:[237,162,167],fat=cooked?[231,201,147]:[246,218,198];
      rect(5,3,6,2,edge);rect(3,5,10,6,edge);rect(4,11,8,2,edge);rect(2,7,1,3,edge);rect(13,6,1,4,edge);
      rect(5,4,6,2,light);rect(4,6,8,5,flesh);rect(6,5,6,3,flesh);rect(3,7,2,3,fat);rect(4,10,7,2,fat);rect(11,8,2,3,fat);
      rect(5,6,3,2,light);rect(10,5,2,2,light);rect(7,9,3,1,cooked?[130,75,37]:[179,89,103]);
      if(cooked){rect(5,7,2,1,[112,65,33]);rect(8,6,2,1,[130,75,37]);rect(10,8,1,2,[112,65,33]);}
      else{rect(8,8,2,1,[235,164,171]);put(9,9,[242,184,183]);}
    }else if(id===117||id===118){
      const cooked=id===118,edge=cooked?[78,45,30]:[114,43,51],flesh=cooked?[141,81,43]:[175,69,85],light=cooked?[181,116,62]:[218,111,122],bone=cooked?[222,198,158]:[240,221,194];
      // A diagonal bone-ended cut is deliberately distinct from the pork chop.
      rect(3,11,3,3,[149,125,96]);line(4,11,7,8,bone,2);rect(2,12,2,2,bone);rect(4,14,2,1,bone);
      rect(8,2,3,1,edge);rect(6,3,7,2,edge);rect(5,5,9,4,edge);rect(6,9,6,2,edge);rect(7,11,3,1,edge);
      rect(7,4,5,3,flesh);rect(6,6,6,3,flesh);rect(7,9,3,1,flesh);rect(8,3,3,1,light);rect(7,4,3,2,light);rect(6,6,2,2,light);
      rect(11,5,2,3,cooked?[201,157,101]:[235,187,176]);rect(10,8,2,1,cooked?[201,157,101]:[235,187,176]);
      rect(8,7,2,1,cooked?[101,57,32]:[142,48,67]);put(9,9,cooked?[108,61,33]:[139,47,63]);
    }else if(id===125||id===126){
      const cooked=id===126,edge=cooked?[83,43,29]:[104,34,45],meat=cooked?[139,73,39]:[180,58,73],light=cooked?[186,113,57]:[224,105,112],fat=cooked?[220,180,118]:[248,213,189],dark=cooked?[105,51,30]:[143,42,58];
      // Broad marbled steak: stepped perimeter and a small lower-right notch.
      rect(5,3,6,1,edge);rect(3,4,10,2,edge);rect(2,6,12,5,edge);rect(3,11,9,2,edge);rect(5,13,5,1,edge);
      rect(5,4,6,1,fat);rect(3,5,2,5,fat);rect(4,11,6,1,fat);rect(12,6,1,4,fat);
      rect(5,5,7,6,meat);rect(4,6,2,4,meat);rect(6,11,4,2,meat);rect(5,5,4,2,light);rect(10,7,2,3,dark);
      line(5,8,8,6,fat);line(7,9,10,10,fat);put(8,7,light);put(5,10,dark);
      if(cooked){line(6,6,8,7,[76,38,26]);line(7,10,9,11,[76,38,26]);put(10,6,[209,144,76]);}
      else{rect(6,6,2,1,[244,137,140]);put(9,9,[238,119,127]);}
    }else if(id===127||id===128){
      const cooked=id===128,edge=cooked?[100,54,29]:[150,83,88],meat=cooked?[185,112,47]:[226,161,158],light=cooked?[229,164,72]:[251,198,184],shadeMeat=cooked?[142,76,34]:[197,124,130],bone=[239,224,191];
      // Round drumstick at upper left, with a clearly exposed lower-right bone.
      line(8,9,12,13,[157,135,105],2);line(9,9,12,12,bone);rect(12,12,2,2,bone);put(14,12,bone);put(13,14,bone);
      rect(4,2,4,1,edge);rect(3,3,7,2,edge);rect(2,5,9,4,edge);rect(3,9,7,2,edge);rect(6,11,3,1,edge);
      rect(4,3,4,2,light);rect(3,5,6,4,meat);rect(5,4,4,3,meat);rect(4,9,5,1,shadeMeat);rect(8,7,2,3,shadeMeat);rect(3,5,2,3,light);
      put(4,4,cooked?[246,191,103]:[255,220,202]);put(6,7,cooked?[156,84,33]:[206,134,137]);put(8,5,cooked?[211,139,57]:[241,180,169]);
    }else if(id===129||id===130){
      const cooked=id===130,edge=cooked?[101,58,37]:[146,79,91],meat=cooked?[177,113,66]:[223,154,171],light=cooked?[219,160,95]:[248,192,201],shadeMeat=cooked?[138,78,45]:[190,117,138],bone=[235,220,189];
      // Two small haunches and a narrow center loin distinguish this lean cut.
      rect(3,4,4,2,edge);rect(2,6,5,4,edge);rect(3,10,4,2,edge);rect(9,3,3,2,edge);rect(8,5,5,5,edge);rect(9,10,3,2,edge);rect(6,7,3,6,edge);
      rect(4,5,2,2,light);rect(3,7,3,3,meat);rect(4,10,2,1,shadeMeat);rect(9,5,3,4,meat);rect(9,4,2,2,light);rect(11,7,1,3,shadeMeat);rect(6,8,3,3,meat);rect(7,11,1,2,shadeMeat);
      rect(6,13,3,1,bone);put(5,14,bone);put(9,14,bone);put(3,6,cooked?[237,186,119]:[255,215,216]);put(10,6,cooked?[237,186,119]:[255,215,216]);put(7,9,cooked?[118,66,39]:[172,99,122]);
    }else if(id===119){
      const edge=[61,75,78],steel=[177,195,195],light=[231,239,229],grip=[106,119,114];
      line(3,2,7,7,edge,2);line(11,2,7,8,edge,2);line(3,2,7,6,steel);line(12,2,8,7,light);line(4,3,7,7,light);line(11,4,8,8,steel);
      line(7,8,4,11,edge,2);line(8,8,11,11,edge,2);
      // Open handle loops remain transparent inside, even in the cached raw pixels.
      rect(2,10,4,1,grip);rect(1,11,1,3,edge);rect(2,14,4,1,edge);rect(6,11,1,3,edge);rect(2,11,1,2,steel);rect(3,13,3,1,steel);
      rect(10,10,4,1,grip);rect(9,11,1,3,edge);rect(10,14,4,1,edge);rect(14,11,1,3,edge);rect(10,11,1,2,steel);rect(11,13,3,1,steel);
      rect(7,7,3,3,edge);rect(7,7,2,2,steel);put(8,8,[100,123,124]);
    }else if(id===120){
      const edge=[65,88,34],seed=[139,154,67],light=[185,192,108];
      for(const [x,y] of [[3,7],[9,3],[8,11]]){rect(x,y,3,3,edge);rect(x+1,y-1,1,1,edge);rect(x+1,y,2,2,seed);put(x+1,y,light);put(x+2,y+2,[102,127,45]);}
    }else if(id===121){
      const straw=[170,125,43],gold=[214,168,64],light=[244,210,116],shadow=[126,90,31];
      line(5,14,4,5,straw);line(7,14,9,3,straw);line(8,14,12,6,straw);
      for(const [x,y] of [[4,3],[9,1],[12,4]]){put(x,y,light);for(let j=1;j<=4;j++){put(x,y+j,gold);put(x+(j%2?-1:1),y+j,j%2?light:shadow);}}
      line(5,11,9,12,[140,94,39]);put(7,12,[190,142,59]);
    }else if(id===122){
      const crust=[128,77,33],body=[192,131,59],top=[228,172,89],score=[247,216,147];
      rect(4,4,8,2,crust);rect(2,6,12,5,crust);rect(3,11,10,2,crust);rect(1,8,1,2,crust);
      rect(4,5,8,2,top);rect(3,7,10,3,body);rect(2,8,2,2,body);rect(4,6,8,2,top);rect(4,10,8,2,[167,105,44]);
      line(5,5,6,7,score);line(9,5,10,7,score);put(3,8,[221,159,75]);put(12,8,[157,96,38]);
    }else if(id===123){
      const edge=[21,87,58],green=[43,157,105],light=[108,222,155],bright=[197,245,194],shadeGreen=[26,117,79];
      rect(6,2,4,1,edge);rect(4,3,8,2,edge);rect(3,5,10,6,edge);rect(4,11,8,2,edge);rect(6,13,4,1,edge);
      rect(6,3,4,2,light);rect(4,5,8,6,green);rect(5,11,6,1,shadeGreen);rect(6,12,4,1,shadeGreen);
      for(let y=5;y<=10;y++)for(let x=5;x<=10;x++)put(x,y,x+y<14?light:x>8?shadeGreen:green);
      rect(5,5,2,2,bright);rect(7,4,2,1,bright);rect(10,6,2,3,[55,181,124]);put(7,11,[72,196,134]);
    }else if(id===124){
      line(3,13,10,6,[69,49,30],2);line(4,13,10,7,[164,119,63]);line(5,12,10,7,[189,143,79]);
      rect(3,3,9,2,[62,73,74]);rect(2,4,3,4,[62,73,74]);rect(4,3,7,1,[172,183,178]);
      rect(3,4,7,1,[132,145,141]);rect(2,4,2,3,[132,145,141]);rect(2,6,1,2,[180,191,183]);rect(10,4,2,2,[95,109,108]);
    }else if(id===110||id===114){
      const dark=shade(col,-65);rect(3,5,10,6,dark);rect(2,6,10,5,col);rect(4,4,9,3,shade(col,17));rect(3,6,2,4,shade(col,30));rect(12,6,2,4,shade(col,-30));rect(4,11,8,1,dark);
    }else if(id===112){
      rect(5,3,6,2,[114,225,218]);rect(3,5,10,4,[47,172,179]);rect(4,9,8,2,[36,135,156]);rect(6,11,4,2,[43,158,175]);rect(7,13,2,1,[28,110,139]);rect(5,5,4,4,[104,226,218]);rect(4,5,2,2,[189,253,236]);rect(10,5,2,3,[63,195,195]);rect(7,9,2,3,[77,209,209]);
    }else{
      const coords=[[4,3,6,2],[3,5,9,6],[5,11,5,2],[2,7,2,3],[11,6,2,4]];
      for(const r of coords)rect(...r,shade(col,-26));rect(4,4,6,6,col);rect(5,4,4,2,shade(col,31));rect(3,7,3,3,shade(col,14));rect(9,8,2,3,shade(col,-40));
    }
    const sprite=Object.freeze({size:S,origin:'top-left',data:p});
    itemSpriteCache.set(id,sprite);return sprite;
  }

  // C8 texture packs. Existing 16px generators remain the Legacy source of truth.
  // Native24 terrain keeps established motifs with new pixel detail; new supplies,
  // spawn eggs and mineral faces are drawn directly on the 24px grid.
  const MINERAL_TEXTURE_NAMES=Object.freeze(['coalBlock','ironBlock','goldBlock','copperOre','diamondBlock','quartzOre']);
  const PACKS=Object.freeze({
    legacy16:Object.freeze({id:'legacy16',size:16,label:'Legacy · 16 × 16'}),
    legacy24:Object.freeze({id:'legacy24',size:24,label:'Legacy · 24 × 24 (trứng cũ)'}),
    native24:Object.freeze({id:'native24',size:24,label:'Chi tiết · 24 × 24'})
  });
  const packedTextures=new Map(),nativeSprites=new Map(),nativeMinerals=new Map(),c10EggSprites=new Map();
  function packSpec(id){const spec=typeof id==='string'&&Object.hasOwn(PACKS,id)?PACKS[id]:null;if(!spec)throw new RangeError('Bộ texture không hợp lệ.');return spec;}
  function resizePixelArt(data,from,to){
    const out=new Uint8ClampedArray(to*to*4);
    for(let y=0;y<to;y++)for(let x=0;x<to;x++){
      const si=(Math.floor(x*from/to)+Math.floor(y*from/to)*from)*4,di=(x+y*to)*4;
      out[di]=data[si];out[di+1]=data[si+1];out[di+2]=data[si+2];out[di+3]=data[si+3];
    }
    return out;
  }
  function pixelPainter(size){
    const data=new Uint8ClampedArray(size*size*4);
    const put=(x,y,color,alpha=255)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=size||y>=size)return;const c=typeof color==='string'?rgb(color):color,i=(x+y*size)*4;data[i]=clamp(c[0]);data[i+1]=clamp(c[1]);data[i+2]=clamp(c[2]);data[i+3]=alpha;};
    const rect=(x,y,w,ht,c)=>{for(let yy=y;yy<y+ht;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,c);};
    const line=(x0,y0,x1,y1,c,width=1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));if(!n){rect(x0,y0,width,width,c);return;}for(let i=0;i<=n;i++)rect(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),width,width,c);};
    const poly=(points,c)=>{for(let y=0;y<size;y++)for(let x=0;x<size;x++){let inside=false;const px=x+.5,py=y+.5;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0])inside=!inside;}if(inside)put(x,y,c);}};
    return {data,put,rect,line,poly};
  }
  // C9 expansion: nine appended material planes for eight full building blocks.
  const C9_EXPANDED_TEXTURE_NAMES=Object.freeze(['timberEarth','wovenDiamond','blueIvoryMosaic','ironLattice','amberIndigoGlass','wheatBale','wheatBaleEnd','copperInlayBasalt','fishscaleSlate']);
  function makeC9ExpandedTile(name,size){
    if(!C9_EXPANDED_TEXTURE_NAMES.includes(name)||![16,24].includes(size))throw new RangeError('Mặt vật liệu mở rộng C9 không hợp lệ.');
    const P=pixelPainter(size),{data,put,rect,line}=P,seed=59219+C9_EXPANDED_TEXTURE_NAMES.indexOf(name)*379;
    const n24=size===24,edge=n24?2:1;
    if(name==='timberEarth'){
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const border=Math.min(x,y,size-1-x,size-1-y),diag=Math.min(Math.abs(x-y),Math.abs(x+y-(size-1))),beam=border<edge||diag<(n24?1.7:1.15);
        let c;
        if(beam){const grain=(x+2*y)%5;c=shade([77,52,35],grain===0?14:grain===1?-12:0);if(border===0||diag<(n24?.5:.3))c=[49,34,26];else if((x+y)%7===0)c=[120,83,48];}
        else{const mottled=((x>>2)*3+(y>>2)*5)%7;c=shade([191,151,101],(h(x,y,seed)-.5)*9+(mottled===0?7:0));if(n24&&(x*5+y*3)%41===0)c=[217,181,128];}
        put(x,y,c);
      }
      const pegs=n24?[[2,2],[21,2],[2,21],[21,21],[11,11]]:[[1,1],[14,1],[1,14],[14,14],[7,7]];
      for(const[x,y]of pegs){put(x,y,[40,28,21]);put(x,y-1,[151,103,56]);}
    }else if(name==='wovenDiamond'){
      const period=size/2;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const u=(x+.5)%period,v=(y+.5)%period,d=Math.abs(u-period/2)+Math.abs(v-period/2),ring=Math.abs(d-period*.43)<(n24?1.3:.95);
        const selvedge=x===0||y===0||x===size-1||y===size-1;
        let c=selvedge?[222,211,173]:ring?[231,221,187]:d<period*.18?[104,143,176]:[43,65,106];
        c=shade(c,((x+y)%2?4:-4)+((x%3===0&&y%2===0)?4:0));put(x,y,c);
      }
      if(n24){for(let k=2;k<size-2;k+=4){put(k,1,[183,172,142]);put(1,k,[183,172,142]);}}
    }else if(name==='blueIvoryMosaic'){
      const p=size/2;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const u=x%p,v=y%p,flip=(Math.floor(x/p)+Math.floor(y/p))%2,cx=flip?p-1:0,ox=flip?0:p-1;
        const d=Math.min(Math.abs(Math.hypot(u-cx,v)-p*.68),Math.abs(Math.hypot(u-ox,v-(p-1))-p*.68));
        const grout=u===0||v===0,ivory=d<(n24?1.8:1.2);
        let c=grout?[151,162,159]:ivory?[233,229,205]:[36,104,143];
        if(!grout){if(d<(n24?2.5:1.7)&&!ivory)c=[22,75,112];else if(ivory&&d>(n24?.9:.6))c=[205,212,193];else if((x*3+y*7)%29===0)c=shade(c,15);}
        put(x,y,c);
      }
    }else if(name==='ironLattice'){
      const p=n24?6:4,bar=n24?2:1;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const u=x%p,v=y%p,border=Math.min(x,y,size-1-x,size-1-y)<edge;
        if(!border&&u>=bar&&v>=bar)continue;
        let c=(u===0||v===0)?[186,203,211]:[83,106,122];
        if(x===size-1||y===size-1)c=[44,63,79];else if(x===0||y===0)c=[220,229,227];
        if(u===0&&v===0)c=[232,237,224];put(x,y,c);
      }
      if(n24)for(const[x,y]of [[1,1],[22,1],[1,22],[22,22]]){put(x,y,[47,65,78]);put(x,y-1,[237,242,232]);}
    }else if(name==='amberIndigoGlass'){
      const p=size/2,bar=n24?2:1;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const u=(x+y)%p,v=((x-y)%p+p)%p,border=Math.min(x,y,size-1-x,size-1-y)<1;
        if(border||u<bar||v<bar){put(x,y,(u===0||v===0||y===0)?[205,143,88]:[111,66,45],255);continue;}
        const amber=((Math.floor((x+y)/p)+Math.floor((x-y)/p))%2+2)%2===0;
        let c=amber?[222,163,66]:[115,122,203],a=amber?93:100;
        if(u===bar||v===bar){c=amber?[248,211,139]:[181,188,239];a=138;}
        else if(n24&&(x+2*y)%19===0){c=shade(c,23);a=116;}
        put(x,y,c,a);
      }
    }else if(name==='wheatBale'){
      const p=n24?3:2,tie=n24?2:1;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const band=(y>=Math.floor(size*.27)&&y<Math.floor(size*.27)+tie)||(y>=Math.floor(size*.70)&&y<Math.floor(size*.70)+tie);
        let c;
        if(band)c=(x+y)%3===0?[126,84,36]:[80,55,28];
        else{const stalk=x%p;c=stalk===0?[153,109,39]:stalk===1?[221,182,78]:[239,205,111];if((Math.floor(y/(n24?7:5))+x)%9===0)c=shade(c,-14);if(n24&&(x*7+y*3)%47===0)c=[245,219,139];}
        if(x===0||x===size-1)c=shade(c,-19);put(x,y,c);
      }
      if(n24){rect(10,6,4,3,[104,69,30]);line(10,6,13,8,[167,119,53]);line(11,7,11,9,[68,46,25]);}
    }else if(name==='wheatBaleEnd'){
      const p=n24?4:4;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const u=x%p,v=y%p,d=Math.max(Math.abs(u-1.5),Math.abs(v-1.5));
        let c=d>1.1?[147,101,35]:(u===1&&v===1)?[113,76,29]:[229,190,80];
        if((u===1||u===2)&&v===0)c=[246,218,134];
        if(n24&&(Math.floor(x/p)*3+Math.floor(y/p)*5)%7===0)c=shade(c,10);
        if(Math.min(x,y,size-1-x,size-1-y)===0)c=shade(c,-15);put(x,y,c);
      }
    }else if(name==='copperInlayBasalt'){
      const mid=(size-1)/2;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const d=Math.abs(x-mid)+Math.abs(y-mid),outer=Math.min(x,y,size-1-x,size-1-y),ring=Math.abs(d-size*.36)<(n24?1:.65);
        let c=shade([47,57,64],(h(x,y,seed)-.5)*8);
        if(outer===0)c=[27,36,43];else if(outer===1)c=[74,85,90];
        if(ring)c=(x+y)%3===0?[228,165,101]:[174,103,59];
        if(Math.abs(d-size*.36)<(n24?.25:.2))c=[108,62,41];
        put(x,y,c);
      }
      const q=n24?4:3,c=Math.floor(mid);rect(c-q,c-1,q*2+1,2,[190,119,65]);rect(c-1,c-q,2,q*2+1,[190,119,65]);put(c-1,c-q,[241,182,111]);put(c+q,c,[110,64,41]);
    }else if(name==='fishscaleSlate'){
      const w=size/2,r=w/2,step=n24?6:4,height=n24?9:6;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++)put(x,y,[34,47,59]);
      for(let row=Math.ceil(size/step);row>=-1;row--){
        const y0=row*step,shift=((row%2)+2)%2*r;
        for(let cell=-1;cell<3;cell++){
          const x0=cell*w-shift,base=[61+(cell+row+8)%3*5,81+(cell+row+8)%3*5,99+(cell+row+8)%3*5];
          for(let v=0;v<height;v++)for(let u=0;u<w;u++){
            const dx=u-(w-1)/2,dy=v-(height-r-.5),d=Math.hypot(dx,Math.max(0,dy));
            if(d>r)continue;
            let c=shade(base,(h(x0+u,y0+v,seed)-.5)*5);
            if(d>r-.8)c=[29,43,55];else if(d>r-1.7)c=[111,135,150];else if(v===0)c=[94,115,132];
            if(n24&&v>1&&v<5&&u===3&&(cell+row)%3===0)c=[47,66,82];
            put(x0+u,y0+v,c);
          }
        }
      }
    }
    return data;
  }

  // C9 building finishes and tools. Existing layer indices and art remain unchanged.
  const C9_TEXTURE_NAMES=Object.freeze(['basaltBricks','carvedSandstone','cobblePaving','ironFramedGlass']);
  function makeC9Tile(name,size){
    if(!C9_TEXTURE_NAMES.includes(name)||![16,24].includes(size))throw new RangeError('Mặt vật liệu C9 không hợp lệ.');
    const P=pixelPainter(size),{data,put,line,rect}=P,seed=31891+C9_TEXTURE_NAMES.indexOf(name)*371;
    if(name==='basaltBricks'){
      const w=size/2,ht=size===24?8:4,offset=w/2;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const row=Math.floor(y/ht),u=(x+(row%2)*offset)%w,v=y%ht,cell=Math.floor((x+(row%2)*offset)/w),n=(h(x,y,seed)-.5)*7;
        let c=shade([68+(cell+row)%3*3,77+(cell+row)%3*3,85+(cell+row)%3*3],n);
        if(!u||!v)c=[30,37,43];
        else if(u===1||v===1)c=shade([100,110,115],n);
        else if(u===w-1||v===ht-1)c=shade([48,57,65],n);
        else if(h(x>>1,y,seed+17)>.91)c=shade(c,8);
        put(x,y,c);
      }
      if(size===24){line(5,4,7,4,[59,69,79]);put(8,5,[49,60,70]);line(17,12,19,12,[57,68,79]);put(4,20,[114,121,124]);put(15,3,[119,126,130]);}
    }else if(name==='carvedSandstone'){
      const mid=(size-1)/2,outer=size===24?9:6,inner=size===24?4:3;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const edge=Math.min(x,y,size-1-x,size-1-y),d=Math.abs(x-mid)+Math.abs(y-mid),n=(h(x,y,seed)-.5)*9;
        let c=shade([212,187,140],n+(y%5===1?3:0));
        if(edge===0)c=[164,137,94];
        else if(edge===1)c=x===1||y===1?[242,220,174]:[187,157,110];
        else if(edge===2)c=[225,201,155];
        if(edge>2){
          if(d===outer||d===inner)c=[143,113,73];
          else if(d===outer+1||d===inner+1)c=[183,151,104];
          else if(d===outer-1||d===inner-1)c=[243,223,181];
          else if(d<inner-1)c=shade([220,194,146],n);
        }
        put(x,y,c);
      }
      if(size===24){put(5,5,[234,212,168]);put(18,17,[195,167,119]);line(8,21,12,21,[204,177,130]);}
    }else if(name==='cobblePaving'){
      const span=8,half=span/2;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const row=Math.floor(y/span),u=(x+(row%2)*half)%span,v=y%span,cell=Math.floor((x+(row%2)*half)/span),tone=((cell+row*2)%3-1)*8;
        const corner=(u===1||u===7)&&(v===1||v===7);
        let c=[66,73,73];
        if(u>0&&v>0&&!corner){
          c=shade([141+tone,150+tone,147+tone],(h(x,y,seed)-.5)*12);
          if(u===1||v===1)c=shade([179+tone,187+tone,178+tone],(h(x,y,seed+3)-.5)*7);
          else if(u===7||v===7)c=[99+tone,111+tone,111+tone];
          else if(u===2&&v===2)c=[164+tone,175+tone,165+tone];
        }
        put(x,y,c);
      }
      if(size===24){line(4,3,5,4,[120,132,130]);put(6,4,[157,167,159]);line(14,11,15,12,[97,112,113]);put(4,18,[187,193,180]);put(18,20,[166,174,163]);}
    }else{
      const edgeWidth=size===24?2:1;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const edge=Math.min(x,y,size-1-x,size-1-y);
        if(edge<edgeWidth){
          const high=x<edgeWidth||y<edgeWidth;
          put(x,y,edge===0?(high?[91,112,125]:[38,55,68]):(high?[196,214,219]:[68,91,109]));
        }else{
          let alpha=43,c=[158,202,210];
          if((x+y)%size===size-4||(x+y)%size===size-5){alpha=102;c=[221,242,239];}
          else if((x+y)%size===size-6){alpha=66;c=[180,222,226];}
          put(x,y,c,alpha);
        }
      }
      const inset=size===24?2:1;
      for(const[x,y]of[[inset,inset],[size-1-inset,inset],[inset,size-1-inset],[size-1-inset,size-1-inset]]){
        rect(x-1,y-1,3,3,[58,77,90]);put(x,y,[203,220,222]);put(x,y+1,[99,124,138]);
      }
      if(size===24){line(5,2,10,2,[143,167,178]);line(2,5,2,10,[171,193,201]);line(21,14,21,18,[53,76,94]);}
    }
    return data;
  }
  function makeC9ToolSprite(id,size){
    if((id!==219&&id!==220)||![16,24].includes(size))throw new RangeError('Dụng cụ C9 không hợp lệ.');
    const P=pixelPainter(size),{data,put,rect,line,poly}=P;
    if(size===16){
      line(3,13,10,6,[57,40,27],2);line(4,13,10,7,[177,122,59]);line(5,12,10,7,[214,161,84]);
      if(id===219){
        poly([[10,2],[13,1],[15,3],[14,6],[12,9],[10,9],[8,7],[9,4]],[41,60,74]);
        poly([[10,3],[13,2],[14,3],[13,6],[11,8],[9,6]],[151,178,187]);
        line(10,5,12,3,[231,243,238]);line(11,6,13,4,[192,216,216]);line(10,7,11,8,[77,108,129]);
        rect(8,7,2,2,[70,93,108]);put(9,7,[182,205,211]);
      }else{
        poly([[5,2],[7,2],[9,4],[11,4],[13,3],[14,4],[14,6],[11,7],[8,6],[7,8],[5,8],[3,6],[3,4]],[31,77,90]);
        poly([[6,3],[7,3],[9,5],[12,5],[12,6],[8,5],[6,7],[5,7],[4,5]],[140,166,180]);
        line(4,4,4,6,[67,205,209]);line(5,3,4,4,[142,242,230]);put(5,7,[40,155,180]);put(6,7,[50,176,191]);
        line(6,3,8,4,[220,235,230]);rect(10,4,2,2,[59,82,100]);put(11,4,[196,212,213]);put(10,5,[163,111,58]);
      }
      for(const[x,y]of[[4,12],[5,11]])if(data[(x+y*size)*4+3])put(x,y,[95,60,32]);
    }else{
      line(4,20,15,8,[49,35,26],3);line(5,20,15,9,[158,105,51],2);line(5,19,14,10,[218,165,88]);
      if(id===219){
        // Forged-looking iron spade: narrow shoulder, central ridge and pointed end.
        poly([[16,3],[20,2],[22,4],[22,7],[19,11],[17,13],[14,12],[12,9],[13,6]],[38,56,71]);
        poly([[16,4],[20,3],[21,5],[20,8],[17,12],[14,10],[13,8],[14,6]],[143,170,183]);
        poly([[16,4],[20,3],[20,5],[16,9],[14,10],[13,8],[14,6]],[198,219,220]);
        poly([[20,5],[21,5],[20,8],[17,12],[16,9]],[91,123,145]);
        line(14,8,19,4,[239,248,236]);line(16,10,19,7,[175,201,209]);put(20,4,[222,237,232]);
        poly([[12,10],[14,9],[16,11],[14,14],[11,12]],[52,77,98]);
        line(12,10,14,11,[189,213,218]);put(13,12,[103,134,155]);put(15,11,[124,151,169]);
      }else{
        // Iron body and wooden haft, with a narrow cyan diamond-inlaid cutting edge.
        poly([[7,2],[10,3],[12,6],[15,6],[17,5],[19,6],[19,8],[17,10],[14,9],[11,8],[9,11],[6,11],[4,9],[4,6],[5,4]],[33,68,83]);
        poly([[7,3],[9,4],[10,6],[13,7],[10,8],[8,10],[6,10],[5,8],[5,6]],[139,164,180]);
        poly([[7,3],[9,4],[10,6],[13,7],[9,7],[6,6]],[195,216,221]);
        poly([[6,8],[9,7],[11,8],[8,10],[6,10]],[83,116,139]);
        poly([[6,4],[7,3],[7,5],[6,7],[6,9],[7,10],[6,10],[5,9],[5,6]],[78,211,213]);
        line(5,6,5,8,[171,249,235]);put(6,4,[207,255,239]);put(6,9,[32,151,175]);put(7,10,[49,180,193]);
        poly([[11,6],[14,6],[16,7],[15,9],[12,8]],[116,145,165]);
        poly([[16,6],[18,6],[18,8],[17,9],[16,8]],[114,142,157]);
        line(12,6,14,7,[196,216,221]);put(17,6,[225,236,231]);put(17,8,[75,103,126]);
        rect(14,7,2,2,[39,58,73]);put(15,7,[109,77,42]);put(15,8,[185,131,65]);
      }
      for(const[x,y,c]of[[9,16,[112,71,36]],[10,15,[112,71,36]],[7,19,[184,123,59]],[8,18,[184,123,59]],[5,21,[226,169,86]]])
        if(data[(x+y*size)*4+3])put(x,y,c);
    }
    return data;
  }
  function makeMineral24(name){
    if(nativeMinerals.has(name))return nativeMinerals.get(name).slice();
    const P=pixelPainter(24),{data,put,rect,line,poly}=P,seed=7117+T[name]*19;
    const noise=(base,amount=12)=>{for(let y=0;y<24;y++)for(let x=0;x<24;x++)put(x,y,shade(base,(h(x>>1,y>>1,seed)-.5)*amount+(h(x,y,seed+11)-.5)*amount*.5));};
    if(name==='coalBlock'){
      const centers=[[3,3],[12,2],[21,5],[4,13],[14,12],[22,18],[11,23]];
      for(let y=0;y<24;y++)for(let x=0;x<24;x++){
        const ds=centers.map(([cx,cy],i)=>({i,d:(x-cx)**2+(y-cy)**2})).sort((a,b)=>a.d-b.d);
        const seam=ds[1].d-ds[0].d<9,base=seam?[18,21,24]:[40+(ds[0].i%3)*5,44+(ds[0].i%3)*4,47+(ds[0].i%3)*4];
        const lit=!seam&&ds[1].d-ds[0].d<22&&y<centers[ds[0].i][1]?11:0;
        put(x,y,shade(base,lit+(h(x,y,seed)-.5)*7));
      }
      line(2,8,6,6,[77,79,76]);line(12,7,16,6,[68,73,73]);line(9,15,7,19,[24,27,30]);put(17,18,[88,88,80]);put(3,20,[74,77,74]);
    }else if(name==='ironBlock'||name==='goldBlock'){
      const gold=name==='goldBlock',base=gold?[219,164,48]:[170,188,197],dark=gold?[124,76,22]:[69,91,104],light=gold?[255,225,123]:[230,241,242];
      noise(base,5);
      for(let y=0;y<24;y++)for(let x=0;x<24;x++){
        const border=Math.min(x,y,23-x,23-y),brush=(h(x>>2,y,seed+23)-.5)*5,plane=(23-x-y)*.55+(x+y<21?7:-2);
        let c=shade(base,plane+brush);
        if(border===0)c=x===0||y===0?shade(base,18):dark;
        else if(border===1)c=x===1||y===1?light:shade(base,-31);
        else if(border===2)c=x===2||y===2?shade(base,27):shade(base,-14);
        put(x,y,c);
      }
      line(5,7,16,7,gold?[239,188,69]:[188,206,211]);line(7,16,19,16,gold?[201,142,35]:[148,169,181]);
      line(5,8,9,8,gold?[225,169,47]:[171,192,201]);put(19,5,light);put(20,5,light);
    }else if(name==='diamondBlock'){
      noise([43,164,182],5);
      poly([[0,0],[24,0],[19,5],[5,5],[0,12]],[114,225,223]);
      poly([[24,0],[24,24],[18,18],[19,5]],[25,117,154]);
      poly([[0,24],[24,24],[18,18],[5,18],[0,12]],[31,136,167]);
      poly([[5,5],[19,5],[18,18],[5,18]],[71,199,207]);
      poly([[5,5],[12,10],[5,18]],[130,235,225]);
      poly([[19,5],[12,10],[18,18]],[38,160,186]);
      poly([[5,18],[12,10],[18,18]],[53,183,200]);
      line(1,1,21,1,[173,248,232]);line(1,2,1,20,[128,229,221]);line(4,5,4,16,[188,253,236]);
      line(6,4,17,4,[205,255,241]);line(19,7,19,18,[18,106,141]);line(6,19,17,19,[28,118,151]);
      rect(6,6,2,2,[224,255,241]);put(8,6,[191,248,233]);put(6,8,[176,243,230]);
    }else if(name==='copperOre'||name==='quartzOre'){
      noise([115,122,126],22);
      line(0,15,5,12,[87,96,102]);line(6,12,8,13,[92,100,105]);line(15,23,14,20,[88,98,104]);line(18,6,23,8,[90,99,105]);
      if(name==='copperOre'){
        const clusters=[{x:2,y:3,w:7,h:6},{x:15,y:1,w:6,h:5},{x:10,y:10,w:7,h:7},{x:18,y:17,w:5,h:5},{x:2,y:18,w:6,h:4}];
        for(const q of clusters){
          const {x,y,w, h:ht}=q;
          poly([[x+1,y],[x+w-1,y],[x+w,y+2],[x+w-1,y+ht],[x+2,y+ht],[x,y+ht-2],[x,y+1]],[71,72,65]);
          poly([[x+1,y+1],[x+w-2,y+1],[x+w-1,y+3],[x+w-2,y+ht-1],[x+1,y+ht-1]],[168,91,50]);
          line(x+2,y+1,x+w-2,y+1,[239,169,99]);line(x+1,y+2,x+1,y+ht-2,[206,130,73]);
          put(x+3,y+2,[223,147,84]);put(x+w-2,y+ht-2,[115,65,43]);put(x+2,y+ht-2,[72,130,111]);
        }
      }else{
        for(const [x,y,w,ht]of[[3,2,7,8],[15,3,6,6],[8,13,8,8],[19,16,4,6],[1,18,4,4]]){
          poly([[x+2,y],[x+w-2,y],[x+w,y+3],[x+w-2,y+ht],[x,y+ht-2],[x,y+2]],[71,87,97]);
          poly([[x+2,y+1],[x+w-2,y+1],[x+w-1,y+3],[x+w-3,y+ht-1],[x+1,y+ht-2],[x+1,y+2]],[197,208,207]);
          poly([[x+2,y+1],[x+w-2,y+1],[x+2,y+ht-2],[x+1,y+ht-2],[x+1,y+2]],[245,242,221]);
          line(x+2,y+1,x+w-3,y+1,[255,253,237]);line(x+w-2,y+3,x+w-3,y+ht-2,[154,174,184]);
          put(x+2,y+ht-2,[224,230,218]);
        }
      }
    }else throw new RangeError('Mặt khoáng sản không hợp lệ.');
    nativeMinerals.set(name,data);return data.slice();
  }
  function makeTile24(name){
    if(C25.tileKeys.includes(name))return C25.makeTile(name,24).data;
    if(C11_MATERIALS.tileKeys.includes(name))return C11_MATERIALS.makeTile(name,24).data;
    if(C10_MATERIALS.tileKeys.includes(name))return C10_MATERIALS.makeTile(name,24).data;
    if(C9_EXPANDED_TEXTURE_NAMES.includes(name))return makeC9ExpandedTile(name,24);
    if(C9_TEXTURE_NAMES.includes(name))return makeC9Tile(name,24);
    if(MINERAL_TEXTURE_NAMES.includes(name))return makeMineral24(name);
    const out=resizePixelArt(makeTile(name),16,24),seed=T[name]*977+2501;
    // Keep motif and alpha coverage; add native-grid grain without interpolated fringes.
    for(let y=0;y<24;y++)for(let x=0;x<24;x++){
      const i=(x+y*24)*4;if(out[i+3]===0)continue;
      const n=h(x,y,seed),grain=n<.13?-4:n>.86?4:0;
      if(!grain)continue;
      for(let c=0;c<3;c++)out[i+c]=clamp(out[i+c]+grain);
    }
    return out;
  }
  function makeNativeSprite(id){
    const it=Number.isInteger(id)?V.items[id]:null;if(!it||it.kind==='block')return null;
    if(nativeSprites.has(id))return nativeSprites.get(id);
    const P=pixelPainter(24),{data,put,rect,line,poly}=P;
    if(id===219||id===220){data.set(makeC9ToolSprite(id,24));}else if(it.kind==='spawn_egg'){
      const base=rgb(it.color),spot=rgb(it.eggSpots||'#786a52');
      const spans=[[3,10,13],[4,8,15],[5,7,16],[6,6,17],[7,5,18],[8,4,19],[9,4,19],[10,3,20],[11,3,20],[12,3,20],[13,3,20],[14,3,20],[15,3,20],[16,3,20],[17,4,19],[18,4,19],[19,5,18],[20,6,17],[21,8,15]];
      const inside=new Set();for(const[y,a,b]of spans)for(let x=a;x<=b;x++)inside.add(x+24*y);
      for(const[y,a,b]of spans)for(let x=a;x<=b;x++){
        const edge=!inside.has(x-1+24*y)||!inside.has(x+1+24*y)||!inside.has(x+24*(y-1))||!inside.has(x+24*(y+1));
        const light=15-x*.95-y*.3,c=edge?shade(base,-67):shade(base,light+(h(x,y,613+id)-.5)*6);
        put(x,y,c);
      }
      for(const[cx,cy,rx,ry]of[[8,8,2,2],[16,11,2,3],[8,16,3,2],[16,18,2,1]]){
        for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){
          if(!inside.has(x+24*y)||((x-cx)/rx)**2+((y-cy)/ry)**2>1.15)continue;
          put(x,y,shade(spot,(cx-x)*5+(cy-y)*3)); 
        }
      }
      line(7,7,6,10,shade(base,35));put(8,6,shade(base,42));put(6,12,shade(base,25));
    }else if(id===191){
      // Porous, angular charcoal fragments: no bark cylinder or metal sheen.
      poly([[5,6],[12,3],[18,4],[21,8],[21,14],[17,19],[9,21],[4,18],[2,13],[3,9]],[24,24,25]);
      poly([[5,7],[12,4],[17,5],[18,10],[13,13],[6,12],[3,11]],[70,66,59]);
      poly([[6,12],[13,13],[16,19],[9,20],[5,17],[3,13]],[45,43,41]);
      poly([[18,5],[20,8],[20,13],[17,18],[13,13],[18,10]],[48,48,45]);
      poly([[7,6],[12,5],[15,6],[11,8],[6,9]],[100,94,81]);
      poly([[7,10],[10,8],[13,9],[13,12],[9,12]],[57,55,50]);
      line(12,5,11,8,[29,28,28]);line(11,8,14,11,[25,25,26]);line(14,11,13,16,[22,23,24]);line(13,16,16,18,[27,28,29]);
      line(5,12,8,14,[23,24,25]);line(8,14,8,18,[21,22,23]);line(16,6,17,9,[109,103,89]);line(4,10,5,8,[128,119,100]);
      put(7,7,[132,124,108]);put(10,10,[89,86,75]);put(7,15,[79,77,69]);put(18,12,[76,78,73]);put(17,15,[25,27,28]);
      // Keep the held silhouette connected; fractures stay inside the charcoal body.
    }else if(id===192){
      line(4,20,15,9,[54,38,27],3);line(5,20,15,10,[169,112,57],2);line(5,19,14,10,[210,159,85]);
      poly([[14,2],[19,2],[22,5],[21,10],[18,14],[14,12],[11,8],[12,4]],[43,54,61]);
      poly([[14,3],[18,3],[20,5],[20,9],[17,12],[14,10],[12,7],[13,4]],[105,126,134]);
      poly([[14,3],[18,3],[17,6],[13,8],[12,6]],[163,177,177]);
      poly([[18,4],[20,5],[20,9],[17,12],[16,9],[18,7]],[72,94,109]);
      line(13,5,13,7,[188,197,189]);line(14,9,16,11,[128,147,150]);line(17,5,16,7,[61,80,94]);
      put(15,5,[131,151,154]);put(18,8,[137,153,154]);put(17,10,[92,114,124]);put(20,5,[170,182,179]);put(12,8,[44,57,64]);
      line(11,12,14,15,[77,53,35]);line(12,11,15,14,[158,122,72]);line(3,21,5,23,[61,42,28]);put(4,21,[183,130,68]);
    }else if(id===193){
      // Native24 iron axe: compact cutting wedge, narrow neck, exposed wood.
      line(4,20,15,7,[51,36,25],3);line(5,20,15,8,[154,101,49],2);line(5,19,14,9,[218,164,88]);
      poly([[7,2],[10,3],[12,5],[15,6],[17,5],[19,6],[19,8],[17,10],[14,9],[11,8],[9,11],[6,11],[4,9],[4,6],[5,4]],[39,58,70]);
      poly([[7,3],[9,4],[10,6],[13,7],[10,8],[8,10],[6,10],[5,8],[5,6]],[132,157,169]);
      poly([[7,3],[9,4],[10,6],[13,7],[9,7],[6,6]],[190,209,213]);
      poly([[6,8],[9,7],[11,8],[8,10],[6,10]],[84,115,134]);
      poly([[6,4],[7,3],[7,5],[6,7],[6,9],[7,10],[6,10],[5,9],[5,6]],[227,237,234]);
      poly([[11,6],[14,6],[16,7],[15,9],[12,8]],[113,143,160]);
      poly([[16,6],[18,6],[18,8],[17,9],[16,8]],[118,145,157]);
      line(5,6,5,8,[246,248,233]);line(8,4,9,5,[217,230,229]);put(7,9,[157,183,191]);
      line(12,6,14,7,[191,211,216]);put(17,6,[211,225,225]);put(17,8,[78,105,120]);
      rect(14,7,2,2,[43,59,66]);put(15,7,[115,81,46]);put(15,8,[188,134,68]);
      // Grain and the single grip band stay inside the existing wooden shaft.
      for(const[x,y,c]of[[9,16,[123,77,37]],[10,15,[123,77,37]],[7,19,[183,122,57]],[8,18,[183,122,57]],[5,21,[226,168,83]]])
        if(data[(x+y*24)*4+3])put(x,y,c);
    }else if(id===194){
      line(4,20,10,14,[57,38,26],3);line(5,20,10,15,[151,100,47],2);line(5,19,10,14,[200,151,78]);
      poly([[8,11],[17,2],[21,1],[22,5],[13,15]],[44,55,64]);
      poly([[10,11],[18,3],[20,3],[20,5],[13,12]],[123,140,143]);
      poly([[10,11],[18,3],[19,3],[16,7],[12,11]],[170,180,174]);
      poly([[13,12],[20,5],[20,7],[14,14]],[71,91,104]);
      line(16,5,16,7,[71,86,94]);line(16,7,14,8,[81,97,105]);put(18,4,[192,198,184]);put(13,10,[94,112,121]);put(19,6,[110,127,135]);put(12,11,[153,167,165]);
      line(7,10,14,17,[53,36,26],3);line(7,10,14,17,[144,91,42],2);line(7,10,14,17,[204,151,73]);
      put(7,11,[238,184,98]);put(13,17,[110,67,35]);
      for(const[x,y]of [[5,17],[6,18],[7,19],[8,20]])if(data[(x+y*24)*4+3])put(x,y,[68,45,29]);
      for(const[x,y]of [[6,16],[7,17],[8,18],[9,19]])if(data[(x+y*24)*4+3])put(x,y,[87,56,31]);
      rect(2,21,3,2,[55,39,28]);put(2,21,[170,117,59]);put(4,22,[104,68,34]);
    }else if(id===195||id===196){
      const cooked=id===196,outline=cooked?[72,39,25]:[85,39,48],fat=cooked?[207,148,68]:[239,210,173],fatLight=cooked?[244,194,99]:[255,232,199],rim=cooked?[140,78,36]:[182,137,112],meat=cooked?[160,83,35]:[174,63,88],mid=cooked?[190,111,42]:[207,92,115],light=cooked?[223,151,58]:[231,131,145],dark=cooked?[106,51,28]:[123,43,66];
      poly([[9,3],[15,3],[19,5],[21,9],[22,13],[20,17],[15,20],[9,21],[5,19],[2,15],[2,10],[5,6]],outline);
      poly([[9,4],[15,4],[19,6],[20,9],[21,13],[19,16],[14,19],[9,20],[5,18],[3,14],[3,10],[6,7]],fat);
      poly([[5,13],[8,17],[13,18],[18,16],[15,19],[9,20],[5,18],[3,14]],rim);
      poly([[9,6],[15,5],[18,7],[20,10],[20,13],[18,16],[14,18],[10,18],[6,16],[4,12],[5,9]],meat);
      poly([[9,6],[15,6],[18,8],[19,11],[16,14],[11,15],[7,12],[6,9]],mid);
      poly([[9,6],[13,6],[15,7],[12,9],[8,9],[6,10],[6,8]],light);
      line(5,8,7,6,fatLight);line(4,10,4,12,fatLight);line(6,17,9,19,fat);put(10,19,fatLight);put(16,18,fatLight);
      if(cooked){
        line(8,9,13,14,dark,1);line(11,7,17,13,dark,1);line(15,7,19,11,[120,60,29],1);line(7,13,11,17,[116,57,27],1);
        line(9,8,13,12,[239,176,76],1);line(12,7,16,11,[223,151,57],1);line(8,13,10,15,[205,126,44],1);
        put(10,6,[245,192,101]);put(16,15,[135,67,30]);put(18,14,[213,134,45]);put(12,16,[211,133,46]);put(7,16,[155,89,36]);
      }else{
        line(7,10,10,11,[237,139,151]);line(10,11,13,11,[226,119,138]);line(13,11,16,13,[208,91,120]);
        line(8,13,11,15,[229,116,137]);line(11,15,14,15,[212,94,122]);line(12,8,16,9,[235,134,150]);
        line(16,9,18,11,[220,110,133]);put(8,8,[248,163,166]);put(18,13,dark);put(15,16,[146,47,75]);put(7,15,[193,73,104]);
      }
    }else{
      // Established silhouettes remain recognizable; native-grid grain adds detail.
      data.set(resizePixelArt(getItemSprite(id).data,16,24));
      for(let y=0;y<24;y++)for(let x=0;x<24;x++){const i=(x+y*24)*4;if(!data[i+3])continue;const n=h(x,y,id*233+19),v=n<.10?-4:n>.91?5:0;for(let c=0;c<3;c++)data[i+c]=clamp(data[i+c]+v);}
    }
    const sprite=Object.freeze({size:24,origin:'top-left',data});nativeSprites.set(id,sprite);return sprite;
  }
  // C10: old makeNativeSprite remains byte-exact for the Legacy24 pack.
  // Only the new native egg drawings use this separate cache.
  function makeC10NativeSprite(id){
    const it=Number.isInteger(id)?V.items[id]:null;
    if(!it||it.kind!=='spawn_egg')return makeNativeSprite(id);
    if(c10EggSprites.has(id))return c10EggSprites.get(id);
    const art=globalThis.VoxelC10EggArt;
    if(!art||art.version!=='c10-original-creature-seals-v1')throw new Error('C10 egg art source required');
    // IDs for these two concepts belong to the root-owned catalog registration.
    const raw=(it.spawnType==='raccoon'||it.spawnType==='armadillo')?art.drawConcept(it.spawnType):art.draw({id:it.id,spawnType:it.spawnType});
    const sprite=Object.freeze({size:24,origin:'top-left',data:raw.data});
    c10EggSprites.set(id,sprite);return sprite;
  }
  function getPackedItemSprite(id,packId=V.activeTexturePack){
    packSpec(packId);return packId==='legacy16'?getItemSprite(id):packId==='legacy24'?makeNativeSprite(id):makeC10NativeSprite(id);
  }
  function packedCanvas(data,size){
    const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d'),image=ctx.createImageData(size,size);image.data.set(data);ctx.putImageData(image,0,0);return c;
  }
  function drawPackedFace(ctx,tex,points){
    const [a,b,,d]=points,size=tex.width;ctx.save();ctx.beginPath();ctx.moveTo(a[0],a[1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.clip();
    ctx.transform((b[0]-a[0])/size,(b[1]-a[1])/size,(d[0]-a[0])/size,(d[1]-a[1])/size,a[0],a[1]);ctx.drawImage(tex,0,0);ctx.restore();
  }
  function packedItemIcon(id,faces,packId){
    const c=document.createElement('canvas');c.width=c.height=48;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;const b=V.blocks[id];
    if(b){
      if(b.render==='cross'||b.shape==='torch'){ctx.drawImage(faces.top[b.tiles[0]],0,0,24,24,0,0,48,48);return c.toDataURL();}
      if(b.shape==='worktable'){
        const project=(x,y,z)=>[24+(x-z)*21,2+(x+z)*10.5+(1-y)*23],body=b.tableBoxes.slice(1).sort((a,z)=>(a[0]+a[3]+a[2]+a[5])-(z[0]+z[3]+z[2]+z[5]));
        for(const part of [...body,b.tableBoxes[0]]){
          const [x0,y0,z0,x1,y1,z1]=part.map(n=>n/16),top=part===b.tableBoxes[0]?b.tiles[2]:b.tableFrameTile;
          drawPackedFace(ctx,faces.side[b.tableFrameTile],[[x1,y1,z1],[x1,y1,z0],[x1,y0,z0],[x1,y0,z1]].map(p=>project(...p)));
          drawPackedFace(ctx,faces.front[b.tableFrameTile],[[x0,y1,z1],[x1,y1,z1],[x1,y0,z1],[x0,y0,z1]].map(p=>project(...p)));
          drawPackedFace(ctx,faces.top[top],[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]].map(p=>project(...p)));
        }
      }else{
        drawPackedFace(ctx,faces.top[b.tiles[2]],[[24,2],[45,12],[24,23],[3,12]]);
        drawPackedFace(ctx,faces.side[b.tiles[0]],[[24,23],[45,12],[45,35],[24,46]]);
        drawPackedFace(ctx,faces.front[b.tiles[4]],[[3,12],[24,23],[24,46],[3,35]]);
      }
      return c.toDataURL();
    }
    ctx.drawImage(packedCanvas(getPackedItemSprite(id,packId).data,24),0,0,48,48);return c.toDataURL();
  }
  function bleedCutoutPixels(arrays,size){
    for(const name of ['flower','tallgrass','torch','oakSapling','spruceSapling','wheatSprout','wheatYoung','wheatTall','wheatMature','birchSapling','acaciaSapling','cherrySapling']){
      const a=arrays[T[name]],opaque=[];for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(x+y*size)*4;if(a[i+3]>0)opaque.push([x,y,a[i],a[i+1],a[i+2]]);}
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(x+y*size)*4;if(a[i+3])continue;let best=null,distance=Infinity;for(const q of opaque){const d=(q[0]-x)**2+(q[1]-y)**2;if(d<distance){distance=d;best=q;}}if(best){a[i]=best[2];a[i+1]=best[3];a[i+2]=best[4];}}
    }
  }
  // New material icons use an affine top face sharing exact integer side edges.
  // All previous213 icons retain their original rendering paths and bytes.
  function c10MaterialBlockIcon(id,faces){
    const b=V.blocks[id],c=document.createElement('canvas');c.width=c.height=48;
    const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
    drawPackedFace(ctx,faces.top[b.tiles[2]],[[24,1],[45,12],[24,23],[3,12]]);
    drawPackedFace(ctx,faces.side[b.tiles[0]],[[24,23],[45,12],[45,35],[24,46]]);
    drawPackedFace(ctx,faces.front[b.tiles[4]],[[3,12],[24,23],[24,46],[3,35]]);
    return c.toDataURL();
  }
  function c10LegacyMaterialIcon(id,tiles,arrays,size){
    const b=V.blocks[id],tint=(layer,amount)=>{const a=arrays[layer].slice();for(let i=0;i<a.length;i+=4)for(let k=0;k<3;k++)a[i+k]=clamp(a[i+k]*amount);return packedCanvas(a,size);};
    const faces={top:tiles,side:[],front:[]};faces.side[b.tiles[0]]=tint(b.tiles[0],.74);faces.front[b.tiles[4]]=tint(b.tiles[4],.9);
    return c10MaterialBlockIcon(id,faces);
  }
  function c25DrawBoxFace(ctx,tex,points,uv){
    const size=tex.width,a=points[0],b=points[1],d=points[3],ta=uv[0].map(n=>n*size),tb=uv[1].map(n=>n*size),td=uv[3].map(n=>n*size);
    const bu=tb[0]-ta[0],bv=tb[1]-ta[1],du=td[0]-ta[0],dv=td[1]-ta[1],det=bu*dv-du*bv;
    if(Math.abs(det)<1e-10)throw Error('C25 icon face has degenerate texture coordinates');
    const bx=b[0]-a[0],by=b[1]-a[1],dx=d[0]-a[0],dy=d[1]-a[1];
    const m00=(bx*dv-dx*bv)/det,m01=(-bx*du+dx*bu)/det,m10=(by*dv-dy*bv)/det,m11=(-by*du+dy*bu)/det;
    ctx.save();ctx.beginPath();ctx.moveTo(...a);for(const q of points.slice(1))ctx.lineTo(...q);ctx.closePath();ctx.clip();
    ctx.transform(m00,m10,m01,m11,a[0]-m00*ta[0]-m01*ta[1],a[1]-m10*ta[0]-m11*ta[1]);ctx.drawImage(tex,0,0);ctx.restore();
  }
  function c25BoxIcon(id,faces){
    const b=V.blocks[id],c=document.createElement('canvas');c.width=c.height=48;
    const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
    const project=(x,y,z)=>[24+(x-z)*21,2+(x+z)*10.5+(1-y)*23],draw=[];
    for(let part=0;part<b.boxes.length;part++){
      const [x0,y0,z0,x1,y1,z1]=b.boxes[part].map(n=>n/16),tiles=b.boxTiles?.[part]||b.tiles;
      for(const [face,kind,points]of[[0,'side',[[x1,y1,z1],[x1,y1,z0],[x1,y0,z0],[x1,y0,z1]]],[4,'front',[[x0,y1,z1],[x1,y1,z1],[x1,y0,z1],[x0,y0,z1]]],[2,'top',[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]]]]){
        const uv=points.map(p=>face===0?[p[2],1-p[1]]:face===4?[p[0],1-p[1]]:[p[0],1-p[2]]);
        draw.push({points,uv,tex:faces[kind][tiles[face]],depth:points.reduce((sum,p)=>sum+p[0]+p[1]+p[2],0)/4,face,part});
      }
    }
    draw.sort((a,b)=>a.depth-b.depth||a.part-b.part||a.face-b.face);
    for(const face of draw)c25DrawBoxFace(ctx,face.tex,face.points.map(p=>project(...p)),face.uv);
    return c.toDataURL();
  }
  const c25LegacyIconFaces=new WeakMap();
  function c25LegacyBoxIcon(id,tiles,arrays,size){
    let faces=c25LegacyIconFaces.get(tiles);if(faces)return c25BoxIcon(id,faces);
    const tinted=amount=>arrays.map(a=>{const out=a.slice();for(let i=0;i<out.length;i+=4)for(let k=0;k<3;k++)out[i+k]=clamp(out[i+k]*amount);return packedCanvas(out,size);});
    faces={top:tiles,side:tinted(.74),front:tinted(.9)};c25LegacyIconFaces.set(tiles,faces);return c25BoxIcon(id,faces);
  }
  function makePackedTextures(packId=V.activeTexturePack){
    const spec=packSpec(packId);if(packedTextures.has(packId))return packedTextures.get(packId);
    const size=spec.size,arrays=tileNames.map(name=>packId==='native24'&&C21_REALM_MATERIALS.keys.includes(name)?C21_REALM_MATERIALS.makeTile(name,size,makeTile24(name)):packId==='native24'&&C20_MATERIALS.keys.includes(name)?C20_MATERIALS.makeTile(name,size,makeTile24(name)):packId==='native24'&&C19_MATERIALS.keys.includes(name)?C19_MATERIALS.makeTile(name,size):packId==='native24'&&C18_MATERIALS.keys.includes(name)?C18_MATERIALS.makeTile(name,size):(packId==='native24'&&C17_MATERIALS.keys.includes(name)?C17_MATERIALS.makeTile(name,size,makeTile24(name)):(packId==='native24'&&C16_TERRAIN.keys.includes(name)?C16_TERRAIN.makeTile(name,size):(packId==='legacy16'?makeTile(name):makeTile24(name)))));bleedCutoutPixels(arrays,size);
    const tiles=arrays.map(a=>packedCanvas(a,size)),data=new Uint8Array(arrays.length*size*size*4);
    for(let layer=0;layer<arrays.length;layer++)for(let row=0;row<size;row++)data.set(arrays[layer].subarray(row*size*4,(row+1)*size*4),layer*size*size*4+(size-1-row)*size*4);
    const icons={};
    if(packId==='legacy16'){for(const id of Object.keys(V.items))icons[id]=V.blocks[id]?.shape==='boxes'?c25LegacyBoxIcon(Number(id),tiles,arrays,size):(C10_MATERIAL_KEYS.has(V.blocks[id]?.key)||C11_MATERIAL_KEYS.has(V.blocks[id]?.key))?c10LegacyMaterialIcon(Number(id),tiles,arrays,size):itemIcon(Number(id),tiles);}
    else{
      const tinted=amount=>arrays.map(a=>{const out=a.slice();for(let i=0;i<out.length;i+=4)for(let c=0;c<3;c++)out[i+c]=clamp(out[i+c]*amount);return packedCanvas(out,size);});
      const faces={top:tiles,side:tinted(.74),front:tinted(.9)};
      for(const id of Object.keys(V.items))icons[id]=V.blocks[id]?.shape==='boxes'?c25BoxIcon(Number(id),faces):(C10_MATERIAL_KEYS.has(V.blocks[id]?.key)||C11_MATERIAL_KEYS.has(V.blocks[id]?.key))?c10MaterialBlockIcon(Number(id),faces):packedItemIcon(Number(id),faces,packId);
    }
    const cols=8,preview=document.createElement('canvas');preview.width=cols*64;preview.height=Math.ceil(tiles.length/cols)*80;
    const pc=preview.getContext('2d');pc.imageSmoothingEnabled=false;pc.fillStyle='#192126';pc.fillRect(0,0,preview.width,preview.height);pc.font='9px monospace';pc.textBaseline='top';
    tiles.forEach((c,i)=>{const x=(i%cols)*64,y=Math.floor(i/cols)*80;pc.drawImage(c,x+8,y+4,48,48);pc.fillStyle='#dbe7d8';pc.fillText(tileNames[i],x+2,y+57,62);});
    const result=Object.freeze({packId,size,layers:arrays.length,data,icons,textureCanvases:tiles,preview,previewCanvas:preview,origin:'bottom-left'});
    packedTextures.set(packId,result);return result;
  }
  function activateTexturePack(pack){
    if(!pack||packedTextures.get(pack.packId)!==pack)throw new TypeError('Chỉ kích hoạt bộ texture đã dựng thành công.');
    V.activeTexturePack=pack.packId;V.textureCanvases=pack.textureCanvases;V.icons=pack.icons;V.texturePackRevision=(V.texturePackRevision||0)+1;return pack;
  }
  V.texturePacks=PACKS;V.activeTexturePack='native24';V.texturePackRevision=0;
  V.getItemSprite=getPackedItemSprite;V.makeTextures=makePackedTextures;V.activateTexturePack=activateTexturePack;

  function itemIcon(id,tiles){
    const c=document.createElement('canvas');c.width=48;c.height=48;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
    const b=V.blocks[id];
    if(b){
      if(b.render==='cross'||b.shape==='torch'){ctx.drawImage(tiles[b.tiles[0]],0,0,16,16,0,0,48,48);return c.toDataURL();}
      if(b.shape==='worktable'){
        const project=(x,y,z)=>[24+(x-z)*21,2+(x+z)*10.5+(1-y)*23];
        const body=b.tableBoxes.slice(1).sort((a,z)=>(a[0]+a[3]+a[2]+a[5])-(z[0]+z[3]+z[2]+z[5]));
        for(const part of [...body,b.tableBoxes[0]]){
          const [x0,y0,z0,x1,y1,z1]=part.map(n=>n/16),top=part===b.tableBoxes[0]?b.tiles[2]:b.tableFrameTile;
          drawFace(ctx,tiles[b.tableFrameTile],[[x1,y1,z1],[x1,y1,z0],[x1,y0,z0],[x1,y0,z1]].map(p=>project(...p)),.74);
          drawFace(ctx,tiles[b.tableFrameTile],[[x0,y1,z1],[x1,y1,z1],[x1,y0,z1],[x0,y0,z1]].map(p=>project(...p)),.9);
          drawFace(ctx,tiles[top],[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]].map(p=>project(...p)),1);
        }
        return c.toDataURL();
      }
      // Affine mapping preserves top/side texture orientation; transparent blocks retain their alpha.
      drawFace(ctx,tiles[b.tiles[2]],[[24,2],[45,12],[24,23],[3,12]],1);
      drawFace(ctx,tiles[b.tiles[0]],[[24,23],[45,12],[45,35],[24,46]],.74);
      drawFace(ctx,tiles[b.tiles[4]],[[3,12],[24,23],[24,46],[3,35]],.9);
      return c.toDataURL();
    }
    const small=canvasFromPixels(getItemSprite(id).data);ctx.drawImage(small,0,0,48,48);return c.toDataURL();
  }
})();

