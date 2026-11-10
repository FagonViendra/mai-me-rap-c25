/* Original render-only avatar. Absolute Number coordinates; never an app.mobs record. */
(() => {
 'use strict';const V=globalThis.Voxel ||= {},M=V.RigidCubeMath;if(!M)throw Error('Load rigid-cube-batch before player-avatar');
 const C=Object.freeze({skin:[.90,.66,.48],skinShade:[.77,.51,.36],shirt:[.25,.46,.35],shirtLight:[.34,.55,.41],cuff:[.16,.32,.24],pants:[.22,.28,.38],pantsLight:[.29,.35,.45],boot:[.22,.17,.13],sole:[.12,.11,.10],hair:[.21,.13,.085],hairLight:[.31,.20,.12],eye:[.91,.93,.88],pupil:[.12,.20,.19],mouth:[.43,.23,.17]});
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),finite=Number.isFinite;
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mid=(a,b)=>a.map((x,i)=>(x+b[i])/2);
 function createPlayerAvatar(){
  const cubes=[],joints={};let used=0,poses=0;
  function cube(center,size,q,color,material=null){
   let c=cubes[used];if(!c)c=cubes[used]={p:[0,0,0],s:[0,0,0],rotationQuaternion:[0,0,0,1],tint:[1,1,1],rigid:true};used++;
   for(let i=0;i<3;i++){c.p[i]=center[i];c.s[i]=size[i];c.tint[i]=(material?.tint||color)[i];}for(let i=0;i<4;i++)c.rotationQuaternion[i]=q[i];
   c.id=material?.id??20;c.kind=material?(material.kind??0):-1;c.light=material?.light??1;c.emissive=material?.emissive??0;c.uvScale=material?.uvScale??0;if(material?.tiles)c.tiles=material.tiles;else delete c.tiles;return c;
  }
  function pose(player,options={}){
   if(!player||!['x','y','z','yaw','pitch'].every(k=>finite(player[k])))throw TypeError('Avatar needs finite physical pose');
   const riding=options.riding===true,root=[player.x,player.y,player.z],yaw=M.fromEuler(player.yaw),pitch=clamp(player.pitch,-1.54,1.54),crouch=!riding&&!!player.crouch;
   const walk=finite(options.walk)?options.walk:0,swing=clamp(finite(options.swing)?options.swing:0,0,1),stroke=Math.sin(Math.PI*swing),selected=Number.isInteger(options.selectedId)?options.selectedId:0;
   const speed=Math.hypot(player.vx||0,player.vz||0),moving=player.grounded&&!player.fly?clamp(speed/4.3,0,1.3):0;
   const hipY=riding?1.50:crouch?.57:.75,torsoH=crouch?.46875:.59375,lean=riding?.04:crouch?-.12:0,body=M.fromEuler(player.yaw,lean),head=M.fromEuler(player.yaw,pitch);
   const toWorld=v=>add(root,M.rotate(yaw,v)),torsoBase=toWorld([0,hipY,0]),bodyPoint=v=>add(torsoBase,M.rotate(body,v));
   used=0;
   // Appearance is a copied render-only equipment view. Never inspect inventory,
   // damage, durability or live equipment state from the avatar renderer.
   const gear=options.equipment?.version===1?options.equipment:null;
   const piece=slot=>{const e=gear?.[slot];return e&&[e.color,e.trim].every(c=>Array.isArray(c)&&c.length===3&&c.every(n=>finite(n)&&n>=0&&n<=1))?e:null;};
   const headGear=piece('head'),bodyGear=piece('body'),feetGear=piece('feet'),charmGear=piece('charm');let equipmentParts=0;
   const armorCube=(center,size,q,color)=>{equipmentParts++;return cube(center,size,q,color);};
   cube(bodyPoint([0,torsoH/2,0]),[.4375,torsoH,.25],body,C.shirt);
   // Original garment pixels: dark hem/collar, a small pocket and a vertical seam.
   cube(bodyPoint([0,.046875,-.002]),[.4405,.09375,.253],body,C.cuff);
   cube(bodyPoint([0,torsoH-.03125,-.130]),[.1875,.0625,.012],body,C.cuff);
   for(const x of[-.109375,.109375])cube(bodyPoint([x,torsoH-.0625,-.132]),[.0625,.125,.012],body,C.shirtLight);
   cube(bodyPoint([.015625,torsoH*.46,-.132]),[.03125,torsoH*.65,.012],body,C.shirtLight);
   cube(bodyPoint([-.125,torsoH*.63,-.137]),[.125,.125,.012],body,C.cuff);
   cube(bodyPoint([-.125,torsoH*.65,-.145]),[.09375,.09375,.008],body,C.shirtLight);
   cube(bodyPoint([0,torsoH*.48,.132]),[.03125,torsoH*.72,.012],body,C.shirtLight);
   if(bodyGear){
    for(const z of[-.15,.15])armorCube(bodyPoint([0,torsoH*.50,z]),[.46875,torsoH*.94,.035],body,bodyGear.color);
    for(const x of[-.235,.235])armorCube(bodyPoint([x,torsoH*.51,0]),[.035,torsoH*.88,.29],body,bodyGear.color);
    armorCube(bodyPoint([0,.065,-.173]),[.46,.045,.012],body,bodyGear.trim);
    armorCube(bodyPoint([0,torsoH*.53,-.174]),[.026,torsoH*.69,.012],body,bodyGear.trim);
    for(const x of[-.15,.15])armorCube(bodyPoint([x,torsoH*.73,-.176]),[.04,.04,.014],body,bodyGear.trim);
   }
   if(charmGear){
    armorCube(bodyPoint([0,torsoH*.83,-.188]),[.014,.15,.012],body,charmGear.trim);
    armorCube(bodyPoint([0,torsoH*.64,-.192]),[.067,.083,.022],body,charmGear.color);
    armorCube(bodyPoint([0,torsoH*.65,-.207]),[.025,.035,.01],body,charmGear.trim);
   }
   const neck=bodyPoint([0,torsoH,0]);cube(neck,[.125,.125,.125],body,C.skin);
   const hc=add(neck,M.rotate(head,[0,.21875,0]));
   const headPixel=(p,s,color)=>cube(add(hc,M.rotate(head,p)),s,head,color);
   headPixel([0,0,0],[.4375,.4375,.4375],C.skin);
   // Stepped original hair wraps the crown, sides and back; the neck stays visible.
   headPixel([0,.189,.002],[.4415,.0625,.4415],C.hair);
   headPixel([0,.063,.223],[.4415,.3125,.012],C.hair);
   for(const side of[-1,1]){
    headPixel([side*.223,.094,.016],[.012,.25,.40625],C.hair);
    headPixel([side*.223,-.063,.141],[.012,.0625,.15625],C.hair);
    headPixel([side*.125,.03125,.231],[.0625,.1875,.008],C.hairLight);
   }
   headPixel([0,.15625,-.223],[.4375,.125,.012],C.hair);
   headPixel([-.15625,.0625,-.223],[.125,.0625,.012],C.hair);
   headPixel([.125,.09375,-.223],[.0625,.0625,.012],C.hairLight);
   // Shallow face pixels and nose follow the same physical head pitch.
   for(const x of[-.09375,.09375]){
    headPixel([x,.015625,-.224],[.0625,.0625,.012],C.eye);
    headPixel([x,.015625,-.232],[.03125,.03125,.008],C.pupil);
    headPixel([x,.078125,-.224],[.09375,.03125,.012],C.hair);
   }
   headPixel([0,-.03125,-.240],[.0625,.0625,.03125],C.skinShade);
   headPixel([0,-.109375,-.224],[.09375,.03125,.012],C.mouth);
   if(headGear){
    const armorPixel=(p,s,color)=>armorCube(add(hc,M.rotate(head,p)),s,head,color);
    armorPixel([0,.225,.006],[.48,.075,.47],headGear.color);
    armorPixel([0,.075,.242],[.48,.30,.028],headGear.color);
    for(const side of[-1,1]){armorPixel([side*.24,.065,.016],[.028,.27,.46],headGear.color);armorPixel([side*.242,.145,-.09],[.032,.035,.18],headGear.trim);}
    armorPixel([0,.15,-.241],[.48,.045,.026],headGear.trim);
    armorPixel([0,.196,-.255],[.065,.09,.016],headGear.color);
    armorPixel([0,.214,-.265],[.035,.035,.012],headGear.trim);
   }
   const limbs=[];const upper=.375,lower=.375;
   for(const side of[-1,1]){
    const phase=walk+(side>0?Math.PI:0),stride=Math.cos(phase)*.18*moving,lift=Math.max(0,Math.sin(phase))*.12*moving;
    const hip=riding?[side*.18,hipY,.03]:[side*.109375,hipY,0],ankle=[side*.109375,.0625+lift,player.fly?.10:stride];
    const dy=ankle[1]-hip[1],dz=ankle[2]-hip[2],raw=Math.hypot(dy,dz),d=Math.min(upper+lower-.0001,Math.max(.001,raw)),uy=dy/(raw||1),uz=dz/(raw||1),a=(upper*upper-lower*lower+d*d)/(2*d),h=Math.sqrt(Math.max(0,upper*upper-a*a));
    const knee=riding?[side*.49,hipY-.20,-.28]:[hip[0],hip[1]+uy*a-uz*h,hip[2]+uz*a+uy*h];
    const foot=riding?[side*.51,hipY-.54,-.08]:[ankle[0],hip[1]+uy*d,hip[2]+uz*d];
    for(const[aa,bb]of[[hip,knee],[knee,foot]]){const delta=sub(bb,aa),length=Math.hypot(...delta),q=riding?M.multiply(yaw,M.normalize([-delta[2]/length,0,delta[0]/length,1-delta[1]/length])):M.fromEuler(player.yaw,Math.atan2(-delta[2],-delta[1]));const center=toWorld(mid(aa,bb));cube(center,[.1875,Math.hypot(...delta),.21875],q,C.pants);cube(add(center,M.rotate(q,[0,0,-.1135])),[.125,Math.hypot(...delta)*.65,.008],q,C.pantsLight);limbs.push({a:toWorld(aa),b:toWorld(bb),kind:'leg'});}
    cube(toWorld(add(foot,[0,0,-.03125])),[.21875,.125,.28125],yaw,C.boot);
    cube(toWorld(add(foot,[0,-.046875,-.03125])),[.22175,.03125,.28425],yaw,C.sole);
    if(feetGear){
     armorCube(toWorld(add(foot,[0,.025,-.03])),[.25,.17,.32],yaw,feetGear.color);
     armorCube(toWorld(add(foot,[0,.08,-.03])),[.253,.036,.323],yaw,feetGear.trim);
     armorCube(toWorld(add(foot,[0,.027,-.194])),[.12,.055,.014],yaw,feetGear.trim);
    }
    joints[side<0?'leftAnkle':'rightAnkle']=toWorld(foot);
   }
   let rightHand,rightRotation;
   for(const side of[-1,1]){
    const held=side>0&&selected>0,phase=walk+(side<0?Math.PI:0),angle=held?clamp(.48+pitch*.45+stroke*.95,-.2,1.8):riding?.48:Math.sin(phase)*.30*moving;
    const elbowAngle=held?.20+stroke*.45:.08,shoulder=bodyPoint([side*.3125,torsoH-.0625,0]),q1=M.fromEuler(player.yaw,angle),q2=M.fromEuler(player.yaw,angle+elbowAngle);
    const elbow=add(shoulder,M.rotate(q1,[0,-.28125,0])),hand=add(elbow,M.rotate(q2,[0,-.28125,0]));
    cube(mid(shoulder,elbow),[.1875,.28125,.1875],q1,C.shirt);
    cube(add(elbow,M.rotate(q1,[0,.03125,0])),[.1905,.0625,.1905],q1,C.cuff);
    cube(mid(elbow,hand),[.1875,.28125,.1875],q2,C.skin);cube(hand,[.1875,.1875,.1875],q2,C.skin);
    if(bodyGear){
     armorCube(add(shoulder,M.rotate(q1,[0,-.095,0])),[.222,.20,.222],q1,bodyGear.color);
     armorCube(add(shoulder,M.rotate(q1,[0,-.175,0])),[.225,.035,.225],q1,bodyGear.trim);
    }
    limbs.push({a:shoulder,b:elbow,kind:'arm'},{a:elbow,b:hand,kind:'arm'});joints[side<0?'leftHand':'rightHand']=hand;
    if(side>0){rightHand=hand;rightRotation=q2;}
   }
   const bodyCount=used;let itemCount=0,flameWorld=null,gripWorld=null;
   if(selected>0){
    const getItem=options.heldLocalItem||V.heldLocalItem;if(typeof getItem!=='function')throw Error('World avatar item needs heldLocalItem sidecar');const item=getItem(selected);
    if(!item||!Array.isArray(item.parts)||!item.grip)throw TypeError('Invalid local held-item contract');
    if(bodyCount+item.parts.length>512)throw RangeError('Avatar and held item exceed512 parts');
    // Grip maps exactly onto the physical-model right hand; no camera-space arm copied.
    gripWorld=rightHand.slice();
    // Volumetric handles leave the fist across the forearm; the asymmetric head faces outward.
    // Keep the original local models and exact grip. Blocks and sprite items retain their pose.
    const turnWrist=selected===19||item.kind==='volume';
    const itemQ=turnWrist?M.multiply(M.multiply(rightRotation,M.fromEuler(0,selected===19?-1.5:-1.8,0)),M.fromEuler(Math.PI-.18,0,0)):M.multiply(rightRotation,M.fromEuler(-.18,0,0));
    for(const part of item.parts){const local=sub(part.p,item.grip),center=add(rightHand,M.rotate(itemQ,local)),q=M.multiply(itemQ,M.fromEuler(part.yaw||0));cube(center,part.s,q,part.tint,part);itemCount++;}
    if(item.flamePoint)flameWorld=add(rightHand,M.rotate(itemQ,sub(item.flamePoint,item.grip)));
   }
   cubes.length=used;poses++;
   return{cubes,bodyCount,itemCount,equipmentParts,poses,riding,headForwardWorld:M.rotate(head,[0,0,-1]),headRotation:head.slice(),neckWorld:neck,headCenterWorld:hc,handWorld:rightHand,gripWorld,flameWorld,joints:{...joints},limbs,
    contactShadow:{type:'player',x:player.x,y:player.y,z:player.z,yaw:player.yaw,rx:.30,rz:.26},coordinateSpace:'absolute-world',renderOnly:true};
  }
  return Object.freeze({pose,inspect:()=>({poses,liveParts:cubes.length,maxParts:512,coordinateSpace:'absolute-world',renderOnly:true})});
 }
 V.createPlayerAvatar=createPlayerAvatar;
})();
