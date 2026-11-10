/* Original stylized human residents, with connected cuboid joints. */
(() => {
'use strict';
const V=globalThis.Voxel||={},EMPTY=Object.freeze([]),cache=new WeakMap();
const finite=Number.isFinite,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ADULT_SCALE=Object.freeze([1.10,1.08,1.10]),scaled=a=>Object.freeze(a.map((n,i)=>n*ADULT_SCALE[i]));
const roles=[
 {name:'farmer',skin:[.80,.59,.42],hair:[.22,.14,.09],shirt:[.73,.49,.24],pants:[.28,.34,.28],vest:[.56,.38,.20]},
 {name:'builder',skin:[.57,.36,.25],hair:[.12,.10,.09],shirt:[.30,.49,.62],pants:[.25,.28,.34],vest:[.67,.55,.34]},
 {name:'smith',skin:[.88,.69,.52],hair:[.38,.36,.33],shirt:[.50,.29,.25],pants:[.26,.28,.29],vest:[.36,.35,.32]}
];
const models=roles.map((role,index)=>{
 const parts=[],add=(name,p,s,tint,parent=null,group='body')=>parts.push(Object.freeze({name,p:scaled(p),s:scaled(s),tint:Object.freeze(tint.slice()),parent,group}));
 add('pelvis',[0,.80,0],[.34,.20,.25],role.pants);
 add('shirt',[0,1.08,0],[.39,.47,.25],role.shirt,'pelvis');
 add('shoulders',[0,1.29,0],[.44,.10,.25],role.shirt,'shirt');
 add('work-front',[0,1.075,-.125],[.27,.34,.025],role.vest,'shirt');
 add('belt',[0,.865,0],[.36,.045,.27],[.27,.22,.16],'pelvis');
 add('neck',[0,1.39,0],[.145,.14,.14],role.skin,'shoulders');
 for(const side of[-1,1]){
  const name=side<0?'left':'right',leg=side<0?'leftLeg':'rightLeg',arm=side<0?'leftArm':'rightArm';
  add(name+'-trouser',[side*.105,.43,0],[.16,.64,.18],role.pants,'pelvis',leg);
  add(name+'-shoe',[side*.105,.07,-.035],[.17,.14,.28],[.19,.16,.14],name+'-trouser',leg);
  add(name+'-sleeve',[side*.24,1.15,0],[.12,.37,.13],role.shirt,'shoulders',arm);
  add(name+'-forearm',[side*.24,.87,-.01],[.11,.25,.12],role.skin,name+'-sleeve',arm);
  add(name+'-hand',[side*.24,.71,-.02],[.10,.12,.12],role.skin,name+'-forearm',arm);
 }
 add('head',[0,1.59,0],[.27,.30,.25],role.skin,'neck','head');
 add('hair-top',[0,1.73,.005],[.285,.055,.27],role.hair,'head','head');
 add('hair-back',[0,1.59,.11],[.28,.25,.065],role.hair,'head','head');
 for(const side of[-1,1]){
  const name=side<0?'left':'right';
  add(name+'-hair',[side*.12,1.68,.005],[.045,.11,.25],role.hair,'head','head');
  add(name+'-ear',[side*.145,1.59,.005],[.04,.075,.085],role.skin,'head','head');
  add(name+'-eye',[side*.063,1.625,-.130],[.047,.032,.014],[.91,.91,.86],'head','head');
  add(name+'-pupil',[side*.063,1.625,-.139],[.019,.023,.012],[.06,.065,.075],name+'-eye','head');
  add(name+'-brow',[side*.064,1.674,-.131],[.060,.020,.018],role.hair,'head','head');
 }
 add('nose',[0,1.575,-.145],[.042,.055,.050],role.skin.map(v=>v*.94),'head','head');
 add('mouth',[0,1.515,-.128],[.057,.013,.014],role.skin.map(v=>v*.48),'head','head');
 if(index===0){add('hat-brim',[0,1.7425,.005],[.47,.035,.36],[.79,.66,.36],'hair-top','head');add('hat-crown',[0,1.775,.005],[.30,.050,.28],[.70,.56,.29],'hat-brim','head');}
 return Object.freeze(parts);
});
let generationCount=0;
const roleOf=m=>Number.isInteger(m.role)&&m.role>=0&&m.role<3?m.role:0;
V.villagerCubes=function villagerCubes(mob,app){
 if(!mob||typeof mob!=='object'||mob.dead||!finite(mob.x)||!finite(mob.y)||!finite(mob.z))return EMPTY;
 if(!V.EntityRig)throw Error('Load entities before rendering villagers');
 const role=roleOf(mob);let row=cache.get(mob);
 if(!row||row.role!==role){row={role,model:V.EntityRig.humanModel(models[role],role)};cache.set(mob,row);generationCount++;}
 return V.EntityRig.pose(mob,app,row.model);
};

V.villagerModelInfo=Object.freeze({version:4,style:'original-human',height:1.944,restWidth:.66,adultScale:ADULT_SCALE,collisionHeight:1.95,collisionWidth:.70,maxPartsPerVillager:35,partsByRole:Object.freeze(models.map(p=>p.length+2)),uvScale:1,sourceTexelsPerUnit:16,physicalTexelPitch:1/16,roles:Object.freeze(roles.map(r=>r.name)),partNamesByRole:Object.freeze(models.map(parts=>Object.freeze(parts.map(p=>p.name).concat(['left-trouser-lower','right-trouser-lower'])))),attachmentsByRole:Object.freeze(models.map(parts=>Object.freeze(parts.filter(p=>p.parent).map(p=>Object.freeze([p.parent,p.name])).concat([Object.freeze(['left-trouser','left-trouser-lower']),Object.freeze(['right-trouser','right-trouser-lower'])])))),get generationCount(){return generationCount;}});
})();
