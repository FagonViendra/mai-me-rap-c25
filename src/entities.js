/* MảiMêRáp — small, original cuboid animals and night walkers. */
(() => {
  'use strict';
  /* Original C10 cuboid models. Pure render data; no world, inventory, save or motor mutation. */
  const C10AnimalModels = (() => {
    'use strict';
    const TAU = Math.PI * 2, clamp = (v,a,b) => Math.max(a,Math.min(b,v));
    const SPEC = Object.freeze({
      raccoon: Object.freeze({name:'Gấu mèo Bắc Mỹ',spawnEggId:null,variants:4,health:6,speed:.62,panicSpeed:1.1,partBudget:48,designWidth:1.8,designHeight:1.05,cycleDistance:.30}),
      armadillo: Object.freeze({name:'Tatu chín đai',spawnEggId:null,variants:4,health:6,speed:.34,panicSpeed:.68,partBudget:52,designWidth:1.7,designHeight:.8,cycleDistance:.22})
    });
    const PALETTES = Object.freeze({
      raccoon:[
        {name:'gray-brown',coat:[.43,.41,.36],back:[.35,.34,.30],light:[.79,.77,.67],mask:[.12,.13,.13],paw:[.19,.18,.16],ring:[.20,.20,.18]},
        {name:'warm brown-gray',coat:[.52,.43,.33],back:[.43,.34,.25],light:[.86,.77,.62],mask:[.15,.12,.10],paw:[.24,.19,.15],ring:[.28,.21,.16]},
        {name:'cool charcoal-gray',coat:[.33,.37,.39],back:[.26,.29,.31],light:[.75,.78,.76],mask:[.09,.11,.12],paw:[.15,.18,.19],ring:[.17,.20,.21]},
        {name:'pale gray-brown',coat:[.65,.61,.52],back:[.54,.51,.44],light:[.91,.86,.74],mask:[.22,.21,.18],paw:[.31,.29,.25],ring:[.36,.33,.28]}
      ],
      armadillo:[
        {name:'gray-tan',shell:[.54,.50,.42],seam:[.33,.32,.28],skin:[.58,.51,.42],light:[.73,.68,.57],claw:[.73,.69,.60]},
        {name:'warm brown',shell:[.53,.40,.29],seam:[.32,.25,.20],skin:[.60,.44,.33],light:[.77,.62,.44],claw:[.79,.70,.54]},
        {name:'cool slate-brown',shell:[.41,.45,.46],seam:[.25,.29,.30],skin:[.49,.49,.46],light:[.65,.69,.66],claw:[.75,.76,.66]},
        {name:'pale sandy-gray',shell:[.70,.66,.55],seam:[.46,.43,.35],skin:[.73,.65,.52],light:[.87,.82,.68],claw:[.88,.83,.71]}
      ]
    });
    const eye=[.035,.045,.045], identity=[0,0,0,1];
    function valid(type,variant){
      if(!Object.hasOwn(SPEC,type)||!Number.isInteger(variant)||variant<0||variant>3)throw new TypeError('Exact C10 species and variant0–3 required');
    }
    function mul(a,b){return [a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];}
    function quat(yaw=0,pitch=0,roll=0){
      const qy=[0,-Math.sin(yaw/2),0,Math.cos(yaw/2)],qx=[Math.sin(pitch/2),0,0,Math.cos(pitch/2)],qz=[0,0,Math.sin(roll/2),Math.cos(roll/2)];
      return mul(mul(qy,qx),qz);
    }
    function rotate(q,p){const [x,y,z]=p,tx=2*(q[1]*z-q[2]*y),ty=2*(q[2]*x-q[0]*z),tz=2*(q[0]*y-q[1]*x);return [x+q[3]*tx+q[1]*tz-q[2]*ty,y+q[3]*ty+q[2]*tx-q[0]*tz,z+q[3]*tz+q[0]*ty-q[1]*tx];}
    const plus=(a,b)=>a.map((v,i)=>v+b[i]),minus=(a,b)=>a.map((v,i)=>v-b[i]);
    function transform(p,q,pivot){return plus(pivot,rotate(q,minus(p,pivot)));}
    function cubeCorners(c){
      const result=[];
      for(const x of [-.5,.5])for(const y of [-.5,.5])for(const z of [-.5,.5])result.push(plus(c.p,rotate(c.rotationQuaternion,[x*c.s[0],y*c.s[1],z*c.s[2]])));
      return result;
    }
    /* C20_RACCOON_SHAPES_V1_BEGIN */
    function c20RaccoonShape(name,p,s,variant){
      const set=(size,dy=0)=>{for(let k=0;k<3;k++)s[k]=size[k];p[1]+=dy;};
      if(name==='body')set(variant===1?[.46,.35,.59]:variant===2?[.385,.31,.59]:[.44,.36,.59]);
      else if(name==='rump')set(variant===1?[.44,.36,.30]:variant===2?[.365,.33,.30]:[.42,.36,.30]);
      else if(name==='chest')set(variant===1?[.40,.33,.25]:variant===2?[.335,.295,.25]:[.40,.34,.25]);
      else if(name.startsWith('cheek')){
        if(variant===1){p[0]=Math.sign(p[0])*.18;set([.11,.19,.21]);}
        else if(variant===2)set([.07,.15,.19]);
        else{p[0]=Math.sign(p[0])*.17;set([.105,.19,.20]);}
      }else if(name.startsWith('maskRim'))set(variant===1?[.161,.128,.020]:variant===2?[.135,.116,.020]:[.151,.124,.020]);
      else if(name.startsWith('earRim'))set(variant===1?[.13,.095,.08]:variant===2?[.095,.13,.075]:[.115,.105,.075],variant===1?-.015:variant===2?.015:-.005);
      else if(name.startsWith('earCrown'))set(variant===1?[.09,.04,.08]:variant===2?[.065,.045,.075]:[.08,.04,.075],variant===1?-.023:variant===2?.035:-.001);
      else if(name.startsWith('earInside'))set(variant===1?[.065,.05,.018]:variant===2?[.045,.075,.018]:[.052,.055,.018],variant===1?-.015:variant===2?.010:-.005);
      else if(name.startsWith('tailRing')){const i=Number(name.slice(8));s[0]*=variant===1?1.12:variant===2?.82:1.10-i*.055;s[1]*=variant===1?1.08:variant===2?.90:.95;}
    }
    /* C20_RACCOON_SHAPES_V1_END */


    function poseAnimal(type,variant=0,options={},target=null){
      valid(type,variant);
      for(const key of ['clock','walk','moving','yaw','x','y','z'])if(options[key]!==undefined&&!Number.isFinite(options[key]))throw new TypeError('Finite pose value required: '+key);
      const clock=options.clock??0,walk=options.walk??0,grounded=options.grounded!==false,rawMove=grounded?clamp(options.moving??0,0,1):0,moving=rawMove<.001?0:rawMove;
      const yaw=options.yaw??0,origin=[options.x??0,options.y??0,options.z??0],rootQ=quat(yaw),pal=PALETTES[type][variant],spec=SPEC[type];
      const seed=variant*.71,t=clock+seed,cycle=walk/(9*spec.cycleDistance),phase=cycle*TAU;
      const sniff=Math.pow(Math.max(0,Math.sin(t*.73)),6)*(1-moving),pawLift=type==='raccoon'&&grounded&&moving===0?Math.pow(Math.max(0,Math.sin(t*.73)),10)*.085:0;
      const bob=Math.sin(t*1.7)*.002+(1-Math.cos(phase*2))*(type==='raccoon'?.002:.0015)*moving;
      const headYaw=Math.sin(t*.51)*(type==='raccoon'?.13:.065)*(1-moving),headPitch=-(type==='raccoon'?.09:.10)*sniff+Math.sin(t*1.3)*.01;
      const headPivot=type==='raccoon'?[0,.54+bob,-.33]:[0,.28+bob,-.33],headQ=quat(headYaw,headPitch,0);
      const row=target||{};row.type=type;row.variant=variant;row.palette=pal.name;row.cubes||=[];row.feet||=[];row.joints||=[];row.nodes||=[];
      row.feet.length=0;row.joints.length=0;row.nodes.length=0;let count=0;
      function world(p){return plus(origin,rotate(rootQ,p));}
      function box(name,p,s,tint,group='body',q=identity,pivot=null){
        if(type==='raccoon'&&variant>0)c20RaccoonShape(name,p,s,variant);
        let center=p.slice(),orientation=q;
        if(pivot)center=transform(center,q,pivot);
        if(group==='head'||group.startsWith('ear')){center=transform(center,headQ,headPivot);orientation=mul(headQ,orientation);}
        const cube=row.cubes[count]||(row.cubes[count]={part:name,p:[0,0,0],s:[0,0,0],rotationQuaternion:[0,0,0,1],tint:[0,0,0]});count++;
        const wp=world(center),wq=mul(rootQ,orientation);cube.part=name;cube.group=group;cube.rigid=true;cube.id=20;cube.light=1;cube.emissive=0;cube.uvScale=1;
        for(let k=0;k<3;k++){cube.p[k]=wp[k];cube.s[k]=s[k];cube.tint[k]=tint[k];}for(let k=0;k<4;k++)cube.rotationQuaternion[k]=wq[k];
        return cube;
      }
      function link(name,a,b,width,depth,tint){
        const d=minus(b,a),len=Math.hypot(...d),v=d.map(x=>x/len),q=[v[2],0,-v[0],1+v[1]],n=Math.hypot(...q);
        const normalized=n<1e-9?[1,0,0,0]:q.map(x=>x/n);box(name,a.map((v,i)=>(v+b[i])/2),[width,len+.006,depth],tint,'leg',normalized);
        row.joints.push({part:name,start:world(a),end:world(b),length:len});
      }
      function legs(){
        const rac=type==='raccoon',duty=.70,stride=spec.cycleDistance*duty,footH=rac?.065:.052,footW=rac?.105:.080,footD=rac?.135:.115;
        const legs=[[-1,true,0],[1,true,.5],[-1,false,.75],[1,false,.25]];
        for(let i=0;i<4;i++){
          const [side,front,offset]=legs[i],u=((cycle+offset)%1+1)%1,stance=u<duty;
          const progress=stance?u/duty:(u-duty)/(1-duty),zTravel=(stance?-.5+progress:.5-progress)*stride*moving;
          let lift=stance?0:Math.sin(progress*Math.PI)**2*(rac?.052:.032)*moving;
          if(i===0)lift+=pawLift;
          const x=side*(rac?.145:.13),z=(front?(rac?-.235:-.24):(rac?.25:.265))+zTravel,foot=[x,footH/2+lift,z];
          const shoulder=[x,(rac?.305:.235)+bob,front?(rac?-.23:-.245):(rac?.245:.27)],ankle=[x,footH+lift,z+.015];
          const dy=ankle[1]-shoulder[1],dz=ankle[2]-shoulder[2],distance=Math.hypot(dy,dz),L=rac?.144:.110;
          if(distance>2*L-1e-6)throw new RangeError('Reachable two-link leg required');
          const height=Math.sqrt(Math.max(0,L*L-distance*distance/4))*(front?-1:1),knee=[x,(shoulder[1]+ankle[1])/2-dz/distance*height,(shoulder[2]+ankle[2])/2+dy/distance*height];
          const name=(front?'fore':'hind')+(side<0?'Left':'Right');
          link(name+'Upper',shoulder,knee,rac?.086:.075,rac?.095:.083,rac?pal.coat:pal.skin);
          link(name+'Lower',knee,ankle,rac?.067:.059,rac?.073:.067,rac?pal.paw:pal.skin);
          const paw=box(name+'Paw',foot,[footW,footH,footD],rac?pal.paw:pal.skin,'paw');
          if(!rac)box(name+'Claws',[x,footH*.35+lift,z-footD*.5-.009],[footW*.82,footH*.28,.035],pal.claw,'paw');
          row.feet.push({name,cube:paw.part,center:world(foot),contact:grounded&&lift<1e-8,lift,stance,phase:u,ankle:world(ankle),shoulder:world(shoulder),knee:world(knee)});
        }
      }
      if(type==='raccoon'){
        box('body',[0,.435+bob,.055],[.425,.33,.59],pal.coat);
        box('rump',[0,.455+bob,.265],[.405,.35,.30],pal.back);
        box('chest',[0,.435+bob,-.24],[.365,.305,.25],pal.coat);
        box('belly',[0,.325+bob,.015],[.32,.14,.51],pal.light);
        box('neck',[0,.485+bob,-.33],[.275,.255,.20],pal.coat);
        box('head',[0,.57+bob,-.465],[.325,.265,.25],pal.coat,'head');
        box('brow',[0,.661+bob,-.50],[.285,.06,.22],pal.light,'head');
        box('muzzle',[0,.505+bob,-.625],[.205,.13,.17],pal.light,'head');
        box('snout',[0,.505+bob,-.715],[.13,.083,.065],pal.light,'head');
        box('nose',[0,.529+bob,-.754],[.082,.058,.027],pal.mask,'head');
        for(const side of [-1,1]){
          box('cheek'+side,[side*.157,.535+bob,-.48],[.085,.17,.20],pal.light,'head');
          box('maskRim'+side,[side*.105,.593+bob,-.598],[.151,.124,.020],pal.light,'head');
          box('eyeMask'+side,[side*.105,.591+bob,-.612],[.125,.079,.017],pal.mask,'head');
          box('eye'+side,[side*.104,.605+bob,-.624],[.031,.033,.012],eye,'head');
          box('eyeGlint'+side,[side*.104-.005,.613+bob,-.632],[.009,.009,.006],pal.light,'head');
          const pivot=[side*.12,.691+bob,-.463],earQ=quat(0,Math.sin(t*.91+side)*.018,side*Math.sin(t*.59+side)*.035);
          box('earRim'+side,[side*.12,.758+bob,-.461],[.112,.112,.075],pal.light,'ear',earQ,pivot);
          box('earCrown'+side,[side*.12,.823+bob,-.461],[.075,.040,.075],pal.light,'ear',earQ,pivot);
          box('earInside'+side,[side*.12,.767+bob,-.504],[.048,.052,.018],pal.coat.map(v=>v*.72),'ear',earQ,pivot);
        }
        const tailPivot=[0,.455+bob,.36],tailYaw=Math.sin(t*.77)*.085,tailPitch=Math.sin(t*.61)*.028;
        for(let i=0;i<6;i++){
          const joint=i<3?tailPivot:[0,.405+bob,.57],q=quat(tailYaw+(i<3?0:Math.sin(t*.77-.55)*.065),tailPitch+(i<3?0:.045),0);
          const size=.16-i*.012;box('tailRing'+i,[0,.438+bob-i*.012,.425+i*.071],[size,.145-i*.009,.076],i%2===1||i===5?pal.ring:pal.light,'tail',q,joint);
        }
        /* C20_RACCOON_DETAILS_V1_BEGIN */
        if(variant>0)for(const side of[-1,1]){
          if(variant===2)box('c20-chin-'+side,[side*.10,.455+bob,-.50],[.08,.07,.16],pal.light,'head');
          else box('c20-cheek-tuft-'+side,[side*.19,.48+bob,-.45],[.09,.11,.16],pal.light,'head');
          if(variant===3)box('c20-shoulder-ruff-'+side,[side*.18,.56+bob,-.17],[.11,.17,.25],pal.coat);
        }
        /* C20_RACCOON_DETAILS_V1_END */

      }else{
        box('shellCore',[0,.305+bob,.035],[.318,.226,.57],pal.seam);
        box('shoulderPlate',[0,.278+bob,-.265],[.287,.17,.19],pal.shell);
        box('shoulderBevel',[0,.364+bob,-.255],[.265,.070,.135],pal.shell);
        box('rumpPlate',[0,.278+bob,.327],[.265,.175,.18],pal.shell);
        box('rumpBevel',[0,.365+bob,.313],[.244,.065,.130],pal.shell);
        box('belly',[0,.217+bob,.025],[.275,.11,.56],pal.skin);
        for(let i=0;i<9;i++){
          const z=-.185+i*.052,curve=Math.sin((i+1)*Math.PI/10),width=.315+.037*curve,height=.229+.012*curve,q=quat(0,Math.sin(t*.69+i*.22)*.007*(1-moving),0);
          box('armorBand'+(i+1),[0,.31+bob,z],[width,height,.044],pal.shell,'band',q,[0,.31+bob,z]);
        }
        box('head',[0,.269+bob,-.438],[.164,.151,.219],pal.skin,'head');
        box('browPlate',[0,.326+bob,-.45],[.177,.055,.185],pal.shell,'head');
        box('snout',[0,.229+bob,-.604],[.105,.094,.205],pal.skin,'head');
        box('nose',[0,.221+bob,-.724],[.064,.057,.045],pal.seam,'head');
        for(const side of [-1,1]){
          box('eye'+side,[side*.086,.285+bob,-.481],[.013,.030,.039],eye,'head');
          const pivot=[side*.064,.324+bob,-.39],earQ=quat(0,Math.sin(t*.73+side)*.020,side*(.025+Math.sin(t*.81+side)*.027));
          box('ear'+side,[side*.064,.436+bob,-.391],[.053,.232,.060],pal.shell,'ear',earQ,pivot);
          box('earInside'+side,[side*.064,.446+bob,-.425],[.028,.171,.014],pal.light,'ear',earQ,pivot);
        }
        const pivot=[0,.28+bob,.365];
        for(let i=0;i<7;i++){
          const q=quat(Math.sin(t*.63)*.04+i*.004,Math.sin(t*.57)*.014,0),w=.116-i*.012;
          box('tailSegment'+i,[0,.268+bob-i*.014,.418+i*.054],[w,.092-i*.008,.060],i%2?pal.seam:pal.shell,'tail',q,pivot);
        }
      }
      legs();row.cubes.length=count;
      if(count>spec.partBudget)throw new RangeError('C10 rigid-cube budget exceeded');
      row.nodes.push({name:'head',pivot:world(headPivot),yaw:headYaw,pitch:headPitch});
      row.pose={clock,walk,moving,grounded,yaw,sniff,pawLift,headYaw,headPitch,bodyBob:bob,cycleDistance:spec.cycleDistance,footDuty:.70,renderOnly:true};
      row.origin=origin;row.bounds=options.measure===false?null:measurePose(row);return row;
    }
    function measurePose(row){
      const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];let radius=0;
      for(const cube of row.cubes)for(const p of cubeCorners(cube)){for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],p[k]);hi[k]=Math.max(hi[k],p[k]);}radius=Math.max(radius,Math.hypot(p[0]-row.origin[0],p[2]-row.origin[2]));}
      const feet=row.feet.map(f=>{const cube=row.cubes.find(c=>c.part===f.cube),ys=cubeCorners(cube).map(p=>p[1]-row.origin[1]);return {name:f.name,minimumY:Math.min(...ys),maximumY:Math.max(...ys),contact:f.contact,lift:f.lift};});
      return {min:lo,max:hi,size:hi.map((v,i)=>v-lo[i]),yawSweptWidth:radius*2,height:hi[1]-row.origin[1],minimumY:lo[1]-row.origin[1],feet,supportedFeet:feet.filter(f=>f.minimumY<=1e-8&&f.minimumY>=-1e-8).length,partCount:row.cubes.length};
    }
    return Object.freeze({SPEC,PALETTES,poseAnimal,cubeCorners,measurePose});
  })();
  const V = globalThis.Voxel ||= {};
  const TAU = Math.PI * 2, EPS = .002, GRAVITY = 17;
  const MAX_MOBS = 20, MAX_ANIMALS = 16, MAX_WALKERS = 4;
  const MAX_VILLAGERS = 4;
  const ANIMAL_TYPES = Object.freeze(['pig','sheep','cow','chicken','rabbit']);
  // Twenty-one passive species use safe support; camels naturally require dry sand.
  const PASSIVE_TYPES = Object.freeze([...ANIMAL_TYPES,'wolf','fox','horse','deer','cat','goat','duck','tortoise','bear','hedgehog','boar','camel','zebra','badger','raccoon','armadillo']);
  const WOOL_REGROW_SECONDS = 60;
  const SPEC = {
    pig:    { health: 6, width: .74, height: 1.08, speed: .68, drop: 115, cookedDrop: 116, maxDrop: 3 },
    sheep:  { health: 6, width: .82, height: 1.24, speed: .58, drop: 117, cookedDrop: 118, maxDrop: 2 },
    cow: { health: 10, width: 1.66, height: 1.46, speed: .46, drop: 125, cookedDrop: 126, maxDrop: 3, hitX: .43, hitZ: .78 },
    chicken: { health: 4, width: 1.08, height: 1.02, speed: .95, drop: 127, cookedDrop: 128, maxDrop: 1, hitX: .30, hitZ: .52 },
    rabbit: { health: 3, width: 1.10, height: 1.02, speed: .88, drop: 129, cookedDrop: 130, maxDrop: 1, hitX: .28, hitZ: .49 },
    wolf: { health: 8, width: 1.82, height: 1.34, speed: .90, hitX: .30, hitZ: .89 },
    fox: { health: 5, width: 2.16, height: 1.04, speed: 1.06, hitX: .30, hitZ: 1.06 },
    horse: { health: 14, width: 2.22, height: 2.21, speed: .82, hitX: .35, hitZ: 1.08 },
    deer: { health: 8, width: 2.20, height: 2.50, speed: .92, hitX: .53, hitZ: 1.06 },
    cat: { health: 8, width: .78, height: 1.20, speed: .82, hitX: .36, hitZ: .90 },
    goat: { health: 8, width: 1.68, height: 1.75, speed: .76, hitX: .39, hitZ: .81 },
    duck: { health: 4, width: 1.60, height: 1.25, speed: .72, drop: 195, cookedDrop: 196, maxDrop: 1, hitX: .34, hitZ: .74 },
    tortoise: { health: 10, width: 1.60, height: .86, speed: .22, panicSpeed: .44, hitX: .42, hitZ: .74 },
    bear: { health: 16, width: 2.0, height: 1.80, speed: .46, panicSpeed: .95, hitX: .56, hitZ: .94 },
    hedgehog: { health: 5, width: 1.40, height: .90, speed: .38, panicSpeed: .70, hitX: .32, hitZ: .62 },
    boar: { health: 10, width: 2.0, height: 1.35, speed: .68, panicSpeed: 1.35, drop: 115, cookedDrop: 116, maxDrop: 2, hitX: .40, hitZ: .94 },
    camel: { health: 14, width: 2.80, height: 2.65, speed: .62, panicSpeed: 1.15, hitX: .48, hitZ: 1.35 },
    zebra: { health: 12, width: 2.40, height: 2.30, speed: .78, panicSpeed: 1.65, hitX: .39, hitZ: 1.12 },
    badger: { health: 6, width: 1.80, height: .85, speed: .45, panicSpeed: .90, hitX: .28, hitZ: .82 },
    raccoon: { health: 6, width: 1.80, height: 1.05, speed: .62, panicSpeed: 1.10, hitX: .28, hitZ: .86 },
    armadillo: { health: 6, width: 1.70, height: .80, speed: .34, panicSpeed: .68, hitX: .23, hitZ: .82 },
    walker: { health: 12, width: .65, height: 1.91, speed: 1.22, drop: 109 },
    villager: { health: 10, width: .70, height: 1.95, speed: .48 }
  };
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const finite = Number.isFinite;
  const daytime = app => app.world?.dimension === 'sky' || (app.world?.dimension !== 'inferno' && app.time > .23 && app.time < .76);
  const solid = id => !!V.blocks?.[id]?.solid;
  const floorBlock = id => solid(id) && !V.blocks[id]?.treeLog && !V.blocks[id]?.leaf && id !== 30;
  const deltaAngle = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

  function random(app) {
    const state = app._entities;
    state.seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0;
    return state.seed / 4294967296;
  }

  function loaded(world, x, z) {
    if (world.chunks) return !!world.chunks.get(Math.floor(x / 16) + ',' + Math.floor(z / 16))?.data;
    // The normal world exposes its chunk map; the fallback also supports small diagnostic worlds.
    return world.get(x, 95, z, true) !== 13;
  }

  function footprintLoaded(world, x, z, width) {
    const r = width / 2;
    return loaded(world, x - r, z - r) && loaded(world, x + r, z - r)
      && loaded(world, x - r, z + r) && loaded(world, x + r, z + r);
  }

  function clear(world, mob, x, y, z) {
    const s = SPEC[mob.type], yaw=finite(mob.yaw)?mob.yaw:0;
    const hx=x+Math.sin(yaw)*.45,hz=z-Math.cos(yaw)*.45;
    return V.coordinates.validHorizontal(x,z,world?.coordinateProfile)
      && footprintLoaded(world, x, z, s.width)
      && !world.collides(x, y + EPS, z, s.height, s.width)
      // Cat's narrow motor fits a one-block doorway. Its separate forward box
      // protects the animated head/muzzle; the thin tail and whiskers are decorative.
      && (mob.type!=='cat'||(footprintLoaded(world,hx,hz,.74)
        && !world.collides(hx,y+.54+EPS,hz,.66,.74)));
  }

  // A walkable next position must have dry support within one block at every foot corner.
  // Looking locally, instead of using the highest surface, also works beneath roofs.
  function ground(world, type, x, z, referenceY, grassOnly = false) {
    // Match World.collides' edge tolerance: an inset here can hit a riser before
    // any support probe sees it, leaving slow walkers unable to begin a hop.
    const s = SPEC[type], r = s.width / 2 - 1e-5;
    if (!footprintLoaded(world, x, z, s.width)) return null;
    let highest = -Infinity;
    for (const [dx, dz] of [[0, 0], [-r, -r], [r, -r], [-r, r], [r, r]]) {
      const bx = Math.floor(x + dx), bz = Math.floor(z + dz);
      let found = null;
      for (let by = Math.floor(referenceY + .025); by >= Math.floor(referenceY - 1.025); by--) {
        const id = world.get(bx, by, bz, true);
        if (!solid(id)) continue;
        const top = V.blockGeometry.supportHeight(id, x + dx - bx, z + dz - bz);
        if (top === null) continue;
        if (!floorBlock(id) || (grassOnly && (type === 'camel' ? id !== 4 : id !== 1))) break;
        const y = by + top;
        if (y - referenceY > 1.03 || referenceY - y > 1.03) continue;
        if ([7,69].includes(world.get(bx, by + 1, bz, true))) break;
        found = y;
        break;
      }
      if (found === null) return null;
      highest = Math.max(highest, found);
    }
    if (world.collides(x, highest + EPS, z, s.height, s.width)) return null;
    return highest;
  }

  function makeMob(app, type, x, y, z, saved = null) {
    const yaw = saved && finite(saved.yaw) ? saved.yaw : random(app) * TAU;
    let variant=0;
    if(saved)variant=Number.isInteger(saved.variant)&&saved.variant>=0&&saved.variant<=3?saved.variant:0;
    else if(PASSIVE_TYPES.includes(type)){let coatSeed=app._entities.seed^Math.imul(app._entities.serial+1,2654435761);for(let i=0;i<type.length;i++)coatSeed=Math.imul(coatSeed^type.charCodeAt(i),16777619);coatSeed=Math.imul(coatSeed^(coatSeed>>>16),2246822507);coatSeed=Math.imul(coatSeed^(coatSeed>>>13),3266489909);variant=((coatSeed^(coatSeed>>>16))>>>30);}
    return {
      type, x, y, z, yaw, health: saved ? clamp(saved.health, .01, SPEC[type].health) : SPEC[type].health,
      ...(saved?.eggSpawned===true?{eggSpawned:true}:{}),
      ...(type==='villager'&&saved?.eggSpawned===true&&Array.isArray(saved.eggHome)?{eggHome:saved.eggHome.slice()}:{}),
      serial: ++app._entities.serial, variant,
      ...(type==='cat'?{catTrust:Number.isInteger(saved?.catTrust)&&saved.catTrust>=0&&saved.catTrust<=3?saved.catTrust:0,catFollow:saved?.catTrust===3&&saved?.catFollow===true}:{}),
      homeX: x, homeZ: z, desiredYaw: yaw, floorY: Math.floor(y + .03),
      vy: 0, grounded: false, walk: random(app) * TAU, moving: 0,
      decision: .5 + random(app) * 2, rest: random(app) * 1.5,
      attackWait: .65 + random(app) * .55, avoid: 0, blocked: 0,
      panic: 0, flash: 0, knockX: 0, knockZ: 0, burn: 0, burnTick: 0,
      dead: false, deathTime: 0, paid: false, stepWait: 0,
      sheared: type === 'sheep' && saved?.sheared === true,
      grazeAge: type === 'sheep' && saved?.sheared === true && finite(saved.grazeAge)
        ? clamp(saved.grazeAge, 0, WOOL_REGROW_SECONDS) : 0
    };
  }

  function crowded(app, x, y, z, gap = 1.65) {
    return app.mobs.some(m => !m.dead && Math.abs(m.y - y) < 2.3 && Math.hypot(m.x - x, m.z - z) < gap);
  }

  function spawnPosition(app, type, x, z) {
    const world = app.world, s = SPEC[type];
    x = Math.floor(x) + .5;
    z = Math.floor(z) + .5;
    if (!V.coordinates.validHorizontal(x,z,world?.coordinateProfile)) return null;
    if (!footprintLoaded(world, x, z, Math.max(s.width + .5, eggWidth(type)))) return null;
    const y = world.surface(Math.floor(x), Math.floor(z));
    if (!finite(y) || y < 1 || y + s.height >= 96) return null;
    if (ground(world, type, x, z, y, type !== 'walker') !== y) return null;
    // Reserve breathing room around heads as well as the smaller movement collider.
    if (world.collides(x, y + EPS, z, s.height + .1, type === 'walker' ? .85 : type === 'cat' ? 1.70 : Math.max(1.55, eggWidth(type)))) return null;
    if (crowded(app, x, y, z)) return null;
    // Keep the old radial gap and also reserve each passive animal's full box.
    if (PASSIVE_TYPES.includes(type) && app.mobs.some(m => {
      const other = SPEC[m.type];
      if (m.dead || !other || y >= m.y + other.height || y + s.height <= m.y) return false;
      const gap = (eggWidth(type) + eggWidth(m.type)) / 2;
      return Math.abs(x - m.x) < gap && Math.abs(z - m.z) < gap;
    })) return null;
    return [x, y, z];
  }

  function eggWidth(type) {
    const s=SPEC[type];
    return Math.max(s.width,type==='pig'||type==='sheep'?1.94:type==='walker'||type==='villager'?1.08:0);
  }

  function spawnEgg(app, itemId, target, spend) {
    const info=V.items?.[itemId],type=info?.spawnType,s=SPEC[type],world=app?.world,p=app?.player,state=app?._entities;
    const fail=reason=>({ok:false,reason});
    if(info?.kind!=='spawn_egg'||!s||!world||!p||!state||!Array.isArray(app.mobs))return fail('invalid');
    const creative=app.mode==='creative';
    if(!creative&&(!(app.inventory?.[itemId]>0)||typeof spend!=='function'))return fail('empty');
    if(!target||!Array.isArray(target.previous)||target.previous.length!==3||!target.previous.every(Number.isInteger)
      ||![target.x,target.y,target.z].every(Number.isInteger)||world.get(target.x,target.y,target.z,true)!==target.id||!target.id)return fail('target');
    const [bx,y,bz]=target.previous,x=bx+.5,z=bz+.5,width=eggWidth(type),r=width/2-1e-5;
    if(y<1||y+s.height+.05>=96||Math.abs(x)>V.coordinates.forWorld(world).eggLimit||Math.abs(z)>V.coordinates.forWorld(world).eggLimit)return fail('bounds');
    if(Math.abs(target.x-bx)+Math.abs(target.y-y)+Math.abs(target.z-bz)!==1
      ||Math.hypot(x-p.x,y+.5-(p.y+1.62),z-p.z)>(creative?7:6))return fail('target');
    const live=app.mobs.filter(m=>!m.dead&&m.health>0);
    if(app.mobs.length>=MAX_MOBS)return fail('total-cap');
    const count=live.filter(m=>type==='villager'?m.type==='villager':type==='walker'?m.type==='walker':PASSIVE_TYPES.includes(m.type)).length;
    if(count>=(type==='villager'?MAX_VILLAGERS:type==='walker'?MAX_WALKERS:MAX_ANIMALS))return fail('species-cap');
    if(!footprintLoaded(world,x,z,width))return fail('unloaded');
    for(let gz=Math.floor(z-r);gz<=Math.floor(z+r);gz++)for(let gx=Math.floor(x-r);gx<=Math.floor(x+r);gx++){
      const under=world.get(gx,y-1,gz,true),support=V.blocks[under];
      if(!floorBlock(under)||support?.hazard||support?.portal)return fail('support');
      for(let gy=y;gy<=Math.floor(y+s.height+.05-1e-5);gy++){
        const id=world.get(gx,gy,gz,true),def=V.blocks[id];
        if(def?.solid||id===7||def?.liquid||def?.hazard||def?.portal)return fail('blocked');
      }
    }
    // Eggs keep their adjacent-cell target. A low or hollow part must actually
    // touch the motor footprint before we create a mob or spend an item.
    if(!V.respawnSupport.supported(world,x,y,z,s.width,.035))return fail('support');
    const overlap=(ox,oy,oz,ow,oh)=>Math.abs(x-ox)<(width+ow)/2+.05&&Math.abs(z-oz)<(width+ow)/2+.05&&y<oy+oh+.02&&y+s.height>oy-.02;
    if(overlap(p.x,p.y,p.z,.6,p.crouch?1.5:1.8))return fail('player');
    if(live.some(m=>SPEC[m.type]&&overlap(m.x,m.y,m.z,eggWidth(m.type),SPEC[m.type].height)))return fail('crowded');
    let homeIndex=-1;
    if(type==='villager'){
      const occupied=new Set(live.filter(m=>m.type==='villager').map(m=>m.homeIndex));
      for(let i=0;i<MAX_VILLAGERS;i++)if(!occupied.has(i)){homeIndex=i;break;}
      if(homeIndex<0)return fail('species-cap');
    }
    // General spatial/capacity checks finish before creating or spending.
    // Cat's yaw-dependent head clearance below rolls back RNG/serial on rejection.
    const beforeSeed=state.seed,beforeSerial=state.serial,mob=makeMob(app,type,x,y,z);
    if(type==='cat'&&!clear(world,mob,x,y,z)){state.seed=beforeSeed;state.serial=beforeSerial;return fail('blocked');}
    mob.eggSpawned=true;mob.grounded=true;mob.floorY=y;mob.rest=1.25;mob.decision=1.25;
    if(type==='villager'){
      mob.eggHome=[x,y,z];mob.homeIndex=homeIndex;mob.homeX=x;mob.homeY=y;mob.homeZ=z;mob.role=homeIndex%3;
    }
    app.mobs.push(mob);
    if(!creative&&!spend(itemId,1)){
      app.mobs.pop();state.seed=beforeSeed;state.serial=beforeSerial;return fail('empty');
    }
    if(type==='villager')state.villageMask|=1<<homeIndex;
    return {ok:true,type,itemId,serial:mob.serial,position:[x,y,z],spent:creative?0:1};
  }

  function seedAnimals(app) {
    const p = app.player;
    for (let attempt = 0, made = 0; attempt < 180 && made < 10 && app.mobs.length < MAX_MOBS; attempt++) {
      const missing = PASSIVE_TYPES.filter(type => !app.mobs.some(m => !m.dead && m.type === type));
      // Give every missing species repeated chances before filling spare places.
      // A large animal that cannot fit must not block all smaller animals.
      const choices = attempt < PASSIVE_TYPES.length * 16 && missing.length ? missing : PASSIVE_TYPES;
      const type = choices[attempt % choices.length];
      // The first small flock is usually visible along the player's initial view.
      const angle = attempt < 65 ? p.yaw + (random(app) - .5) * 2.4 : random(app) * TAU;
      const radius = 5 + random(app) * 12;
      const pos = spawnPosition(app, type, p.x + Math.sin(angle) * radius, p.z - Math.cos(angle) * radius);
      if (!pos || Math.abs(pos[1] - p.y) > 6) continue;
      app.mobs.push(makeMob(app, type, ...pos));
      made++;
    }
  }

  function particles(app, mob, burning = false, count = 5) {
    if (!Array.isArray(app.particles) || app.particles.length > 180) return;
    for (let i = 0; i < count; i++) app.particles.push({
      x: mob.x + (random(app) - .5) * .55,
      y: mob.y + .35 + random(app) * SPEC[mob.type].height * .65,
      z: mob.z + (random(app) - .5) * .55,
      vx: (random(app) - .5) * 1.8, vy: burning ? 1.4 + random(app) : 2 + random(app) * 2,
      vz: (random(app) - .5) * 1.8, life: .25 + random(app) * .3,
      id: burning ? 28 : mob.type === 'pig' ? 31 : 20
    });
  }

  function villageDescriptor(app) {
    if (app.world?.importedWorld || app.world?.dimension === 'inferno') return null;
    const state = app._entities;
    if (!state) return null;
    if (state.villageChecked) return state.village;
    state.villageChecked = true; state.village = null;
    if (typeof V.core?.village !== 'function') return null;
    const d = V.core.village(app.world?.seed ?? app.seed);
    if (!d || ![d.x, d.y, d.z].every(finite) || !Array.isArray(d.homes)) return null;
    state.village = d; return d;
  }
  function villageSlot(app, index) {
    const d = villageDescriptor(app), h = d?.homes[index];
    if (!h || !Number.isInteger(index) || index < 0 || index >= MAX_VILLAGERS) return null;
    const door = Array.isArray(h.door) ? h.door : [h.x, h.y, h.z];
    const spawn = d.spawns?.[index] || [h.x + .5, h.y + .01, h.z + .5];
    if (door.length !== 3 || spawn.length !== 3 || ![...door, ...spawn].every(finite)) return null;
    if (!V.coordinates.validHorizontal(spawn[0],spawn[2],app.world?.coordinateProfile,20) || spawn[1] < 1 || spawn[1] > 93) return null;
    return { home: [door[0] + .5, door[1], door[2] + .5], spawn };
  }
  function assignVillageHome(app, mob, requested) {
    if(mob.eggSpawned===true&&Array.isArray(mob.eggHome)&&mob.eggHome.length===3&&mob.eggHome.every(finite)
      &&Number.isInteger(requested)&&requested>=0&&requested<MAX_VILLAGERS){
      mob.homeIndex=requested;[mob.homeX,mob.homeY,mob.homeZ]=mob.eggHome;mob.role=requested%3;return true;
    }
    let index = Number.isInteger(requested) && requested >= 0 && requested < MAX_VILLAGERS ? requested : -1;
    if (index < 0) {
      let best = Infinity;
      for (let i = 0; i < MAX_VILLAGERS; i++) {
        const slot = villageSlot(app, i); if (!slot) continue;
        const distance = (slot.home[0] - mob.x) ** 2 + (slot.home[2] - mob.z) ** 2;
        if (distance < best) { best = distance; index = i; }
      }
    }
    const slot = villageSlot(app, index); if (!slot) return false;
    mob.homeIndex = index;
    [mob.homeX, mob.homeY, mob.homeZ] = slot.home;
    mob.role = index % 3; return true;
  }
  // Only recover a loaded saved resident when the old body fitted and the adult
  // body does not. Keep identity/home and search at most .04 horizontally/.15 down.
  // Unloaded footprints defer to the ordinary update when their chunks arrive.
  function fitSavedAdult(app, mob) {
    if (!mob.adultFitPending) return true;
    const world = app.world;
    if (!footprintLoaded(world, mob.x, mob.z, SPEC.villager.width)) return false;
    if (clear(world, mob, mob.x, mob.y, mob.z)
      || world.collides(mob.x, mob.y + EPS, mob.z, 1.8, .64)) {
      mob.adultFitPending = false; return true;
    }
    const candidates = [], ys = [mob.y, mob.y - .15, Math.floor(mob.y + EPS)];
    for (const y of ys) for (const dx of [0, -.04, .04]) for (const dz of [0, -.04, .04]) {
      if (y > mob.y + 1e-9 || mob.y - y > .15 + 1e-9) continue;
      candidates.push({x:mob.x + dx, y, z:mob.z + dz, distance:dx*dx + dz*dz + (y-mob.y)**2});
    }
    candidates.sort((a,b)=>a.distance-b.distance);
    for (const p of candidates) if (clear(world, mob, p.x, p.y, p.z)) {
      mob.x=p.x; mob.y=p.y; mob.z=p.z; mob.floorY=Math.floor(p.y+.03);
      mob.vy=0; mob.grounded=false; mob.adultFitPending=false; return true;
    }
    return false;
  }

  function spawnVillageResidents(app) {
    const state = app._entities;
    if (!state.villageAuto || state.villageMask === 15 || app.mobs.length >= MAX_MOBS) return;
    const d = villageDescriptor(app), p = app.player;
    if (!d || !p || Math.hypot(p.x - d.x, p.z - d.z) > 58) return;
    let count = app.mobs.filter(m => m.type === 'villager' && !m.dead).length;
    for (let i = 0; i < MAX_VILLAGERS && count < MAX_VILLAGERS && app.mobs.length < MAX_MOBS; i++) {
      if (state.villageMask & (1 << i)) continue;
      const slot = villageSlot(app, i); if (!slot) continue;
      const [x, referenceY, z] = slot.spawn;
      if (!footprintLoaded(app.world, x, z, SPEC.villager.width)) continue;
      const y = ground(app.world, 'villager', x, z, referenceY);
      if (y === null || !clear(app.world, { type: 'villager' }, x, y, z)) continue;
      if (Math.abs(p.y - y) < 2 && Math.hypot(p.x - x, p.z - z) < 1) continue;
      if (app.mobs.some(m => !m.dead && Math.abs(m.y - y) < 2 && Math.hypot(m.x - x, m.z - z) < 1.1)) continue;
      const mob = makeMob(app, 'villager', x, y, z);
      if (!assignVillageHome(app, mob, i)) continue;
      mob.yaw = mob.desiredYaw = Math.atan2(d.x - x, -(d.z - z));
      mob.rest = .8 + random(app) * 2;
      app.mobs.push(mob); state.villageMask |= 1 << i; count++;
    }
  }

  function kill(app, mob, rewarded, addItem) {
    if (mob.dead) return;
    mob.health = 0;
    mob.dead = true;
    mob.deathTime = .38;
    mob.moving = 0;
    mob.knockX *= .3;
    mob.knockZ *= .3;
    particles(app, mob, mob.burn > 0, 7);
    if (rewarded && !mob.paid && mob.type !== 'villager') {
      mob.paid = true;
      if (app.progress) app.progress.kills = (app.progress.kills || 0) + 1;
      V.journey?.observe(app,'kill',{type:mob.type});
      if (app.mode !== 'creative' && typeof addItem === 'function') {
        const s = SPEC[mob.type];
        const count = s.maxDrop ? 1 + Math.floor(random(app) * s.maxDrop) : 1;
        addItem(mob.burn > 0 && s.cookedDrop ? s.cookedDrop : s.drop, count);
        if (mob.type === 'sheep' && !mob.sheared) addItem(20, 1);
      }
    }
  }

  function turnAway(app, mob) {
    const side = random(app) > .5 ? 1 : -1;
    mob.desiredYaw = mob.yaw + side * (1.2 + random(app) * 1.25);
    mob.avoid = .8 + random(app) * .7;
    mob.blocked = 0;
  }

  // Duck-only simplified buoyancy uses the actual voxel water surface (cell top y+1).
  // It changes no ground navigation or saved fields; other species retain gravity below.
  const DUCK_WATER_MOTION = new WeakMap(); // Derived transient movement state; never serialized.
  function duckWaterSurface(world, mob) {
    let y = Math.floor(mob.y + .22);
    if (y < 0 || y >= 96 || world.get(mob.x, y, mob.z, true) !== 7) return null;
    while (y < 95 && world.get(mob.x, y + 1, mob.z, true) === 7) y++;
    return y + 1;
  }

  function duckWaterSupport(world, x, z, surface) {
    const width=SPEC.duck.width,r=width/2-1e-5;
    if(!footprintLoaded(world,x,z,width))return null;
    let highest=-Infinity,bank=-Infinity,water=-Infinity;
    for(let bz=Math.floor(z-r);bz<=Math.floor(z+r);bz++)for(let bx=Math.floor(x-r);bx<=Math.floor(x+r);bx++){
      let found=false;
      for(let by=Math.floor(surface+.6-EPS);by>=Math.floor(surface-1.025);by--){
        const id=world.get(bx,by,bz,true);
        if(id===7){const top=by+1;if(top>surface+.6||top<surface-1.03)return null;water=Math.max(water,top);highest=Math.max(highest,top);found=true;break;}
        if(!id)continue;
        const block=V.blocks[id];
        if(!floorBlock(id)||block?.hazard||block?.liquid||block?.portal)return null;
        const top=by+1;if(top>surface+.6||top<surface-1.03)return null;
        bank=Math.max(bank,top);highest=Math.max(highest,top);found=true;break;
      }
      if(!found)return null;
    }
    return{height:highest,bank:finite(bank)?bank:null,water:finite(water)?water:null};
  }
  function moveDuckWater(app,mob,dx,dz,dt) {
    const world=app.world,nx=mob.x+dx,nz=mob.z+dz,actual=duckWaterSurface(world,mob);
    let state=DUCK_WATER_MOTION.get(mob);
    if(actual!==null){if(!state){state={surface:actual,exit:0};DUCK_WATER_MOTION.set(mob,state);}else state.surface=actual;}
    if(state&&actual===null&&state.exit<=0&&mob.grounded){
      const here=duckWaterSupport(world,mob.x,mob.z,mob.floorY);
      if(here&&here.water===null){DUCK_WATER_MOTION.delete(mob);state=null;}
    }
    const support=duckWaterSupport(world,nx,nz,state?state.surface:mob.floorY);
    // A dry duck on dry support takes the original motor byte-for-byte below.
    if(!state){
      if(!mob.grounded||!support||support.water===null)return null;
      state={surface:support.water,exit:0};DUCK_WATER_MOTION.set(mob,state);
    }
    if(!support){mob.blocked+=dt;return 0;}
    if(actual===null&&state.exit<=0&&support.water===null&&mob.grounded){
      DUCK_WATER_MOTION.delete(mob);return null;
    }
    if(support.water!==null&&actual===null&&state.exit<=0)state.surface=support.water;
    if(support.bank!==null&&support.bank>mob.y+.025&&state.exit<=0&&mob.stepWait<=0){
      // Reuse the ordinary step impulse only for a bank <=.6 above the water plane.
      // Full-volume clearance at bank height rejects walls and low ceilings.
      if(support.bank>state.surface+.6||!clear(world,mob,mob.x,support.bank,mob.z)||!clear(world,mob,nx,support.bank,nz)){mob.blocked+=dt;return 0;}
      mob.vy=6.45;mob.grounded=false;mob.stepWait=.65;state.exit=.85;
    }
    if(!clear(world,mob,nx,mob.y,nz)){mob.blocked+=dt;return 0;}
    mob.x=nx;mob.z=nz;mob.blocked=Math.max(0,mob.blocked-dt*2);
    return Math.hypot(dx,dz);
  }

  function landingHeight(world, mob, nextY) {
    const r = SPEC[mob.type].width / 2, edge = 1e-5;
    let highest = null;
    // Only surfaces crossed in this bounded downward substep can stop the feet.
    // The clearance helper offsets feet by EPS, so include that same tolerance.
    for(let by=Math.floor(nextY-edge);by<=Math.floor(mob.y+EPS+edge);by++)
      for(let bz=Math.floor(mob.z-r+edge);bz<=Math.floor(mob.z+r-edge);bz++)
        for(let bx=Math.floor(mob.x-r+edge);bx<=Math.floor(mob.x+r-edge);bx++){
          const id=world.get(bx,by,bz,true);
          for(const box of V.blockGeometry.boxesFor(id)){
            const top=by+box[4];
            if(top<nextY-edge||top>mob.y+EPS+edge
              ||mob.x-r>=bx+box[3]-edge||mob.x+r<=bx+box[0]+edge
              ||mob.z-r>=bz+box[5]-edge||mob.z+r<=bz+box[2]+edge)continue;
            if((highest===null||top>highest)&&clear(world,mob,mob.x,top,mob.z))highest=top;
          }
        }
    return highest;
  }

  function vertical(app, mob, dt) {
    const world = app.world;
    const waterState = mob.type === 'duck' ? DUCK_WATER_MOTION.get(mob) : null;
    if(waterState?.exit>0)waterState.exit=Math.max(0,waterState.exit-dt);
    const waterSurface = mob.type === 'duck' ? duckWaterSurface(world, mob) : null;
    if (waterSurface !== null && !(waterState?.exit>0)) {
      // Keep the breast partially immersed; implicit damping softens entry and recovery.
      mob.grounded = false;
      mob.vy = clamp((mob.vy + (waterSurface - .46 - mob.y) * 24 * dt) / (1 + 9 * dt), -6, 3);
    } else {
      if (mob.grounded && !world.collides(mob.x, mob.y - .035, mob.z, .035, SPEC[mob.type].width)) mob.grounded = false;
      if (mob.grounded) { mob.vy = 0; return; }
      mob.vy = Math.max(-24, mob.vy - GRAVITY * dt);
    }
    const total = mob.vy * dt, steps = Math.max(1, Math.ceil(Math.abs(total) / .12)), dy = total / steps;
    for (let i = 0; i < steps; i++) {
      const nextY = mob.y + dy;
      if (clear(world, mob, mob.x, nextY, mob.z)) { mob.y = nextY; continue; }
      if (dy < 0) {
        const top = landingHeight(world, mob, nextY);
        if (top !== null) { mob.y = top; mob.floorY = top; mob.grounded = true; }
      }
      mob.vy = 0;
      break;
    }
  }

  function move(app, mob, dx, dz, dt) {
    const world = app.world;
    if (Math.abs(dx) + Math.abs(dz) < .00001) return 0;
    if(mob.type==='duck'){const waterTravel=moveDuckWater(app,mob,dx,dz,dt);if(waterTravel!==null)return waterTravel;}
    const nx = mob.x + dx, nz = mob.z + dz;
    const floor = ground(world, mob.type, nx, nz, mob.floorY);
    if (floor === null) { mob.blocked += dt; return 0; }
    if (floor > mob.y + .025 && mob.grounded && mob.stepWait <= 0) {
      // A genuine short jump clears the riser; y is never snapped up onto a step.
      mob.vy = 6.45;
      mob.grounded = false;
      mob.stepWait = .65;
    }
    if (!clear(world, mob, nx, mob.y, nz)) { mob.blocked += dt; return 0; }
    mob.x = nx;
    mob.z = nz;
    mob.blocked = Math.max(0, mob.blocked - dt * 2);
    return Math.hypot(dx, dz);
  }

  function unobstructed(world, from, to) {
    const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy, dz) / .18));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (solid(world.get(from[0] + dx * t, from[1] + dy * t, from[2] + dz * t, true))) return false;
    }
    return true;
  }

  function graze(app, mob, dt) {
    if (mob.type !== 'sheep' || !mob.sheared || !mob.grounded || mob.panic > 0 || mob.burn > 0) return;
    const support = ground(app.world, 'sheep', mob.x, mob.z, mob.y, true);
    if (support === null || Math.abs(support - mob.y) > .06) return;
    // Cumulative active time on loaded grass is a deliberately bounded grazing
    // approximation. No wall-clock catch-up and no grass blocks are consumed.
    mob.grazeAge = Math.min(WOOL_REGROW_SECONDS, mob.grazeAge + dt);
    if (mob.grazeAge + 1e-9 >= WOOL_REGROW_SECONDS) {
      mob.sheared = false;
      mob.grazeAge = 0;
      app._entities.regrown++;
      particles(app, mob, false, 4);
    }
  }

  function updateMob(app, mob, dt, damage) {
    if (mob.type === 'deer') mob.playerAlert = false;
    mob.flash = Math.max(0, mob.flash - dt);
    mob.attackWait = Math.max(0, mob.attackWait - dt);
    mob.stepWait = Math.max(0, mob.stepWait - dt);
    if (mob.dead) { mob.deathTime -= dt; return; }
    const p = app.player, distance = Math.hypot(p.x - mob.x, p.z - mob.z);
    if (mob.type === 'walker' && daytime(app)) {
      mob.burn = Math.min(1, mob.burn + dt * 1.7);
      mob.burnTick += dt;
      if (mob.burnTick >= .75) {
        mob.burnTick -= .75;
        mob.health -= 2;
        mob.flash = .16;
        if (distance < 52) particles(app, mob, true, 3);
        if (mob.health <= 0) { kill(app, mob, false); return; }
      }
    } else { mob.burn = Math.max(0, mob.burn - dt * 2); mob.burnTick = 0; }
    if (!footprintLoaded(app.world, mob.x, mob.z, SPEC[mob.type].width) || distance > 58) {
      mob.moving = 0;
      // Distant walkers retire only after remaining outside the visible simulation for a while.
      // Animals retain their saved position, and sunrise still burns unloaded walkers naturally.
      if (mob.type === 'walker') {
        mob.farTime = (mob.farTime || 0) + dt;
        if (mob.farTime > 35) kill(app, mob, false);
      }
      return;
    }
    mob.farTime = 0;
    // Mounted motion is owned by player physics; keep timers/death handling above, skip wandering AI.
    if (V.mounts?.controls(app, mob)) return;
    if (mob.type === 'villager' && !fitSavedAdult(app, mob)) { mob.moving = 0; return; }
    mob.panic = Math.max(0, mob.panic - dt);
    mob.rest = Math.max(0, mob.rest - dt);
    mob.avoid = Math.max(0, mob.avoid - dt);
    mob.decision -= dt;
    // A nearby visible player startles only deer. Crouching uses the actual physics state.
    const alerted = mob.type === 'deer' && p.health > 0
      && distance < (p.crouch === true && !p.fly ? 2.4 : 5) && Math.abs(p.y - mob.y) < 2.5
      && unobstructed(app.world, [mob.x, mob.y + 1.6, mob.z], [p.x, p.y + (p.crouch === true && !p.fly ? 1.3 : 1.62), p.z]);
    if (mob.type === 'deer') mob.playerAlert = alerted;
    if (alerted) mob.panic = Math.max(mob.panic, .85);
    const companion = mob.type === 'cat' && mob.catTrust === 3;
    const following = companion && mob.catFollow === true && mob.panic <= 0 && p.health > 0
      && distance <= 24 && Math.abs(p.y - mob.y) < 4;
    const chasing = mob.type === 'walker' && app.mode === 'survival' && p.health > 0
      && distance < 26 && Math.abs(p.y - mob.y) < 7;
    let speed = 0;
    if (companion && mob.panic <= 0) {
      // Stay/out-of-range commands hold position; following still uses the common
      // loaded-footprint, dry-ground, step, collision and obstacle-detour path.
      mob.rest = Math.max(mob.rest, .6);
      mob.decision = Math.max(mob.decision, .6);
      if (following && distance > 2.2) {
        if (mob.avoid <= 0) mob.desiredYaw = Math.atan2(p.x - mob.x, -(p.z - mob.z));
        mob.rest = 0;
        speed = mob.avoid > 0 ? 1.65 : distance > 6 ? 4.6 : distance > 3.4 ? 2.6 : 1.35;
      } else if (distance > .01 && distance < 6 && mob.avoid <= 0) {
        mob.desiredYaw = Math.atan2(p.x - mob.x, -(p.z - mob.z));
      }
    } else if (alerted && mob.avoid <= 0) {
      if (distance > .01) mob.desiredYaw = Math.atan2(mob.x - p.x, -(mob.z - p.z));
      mob.decision = Math.max(mob.decision, .85);
      mob.rest = 0;
      speed = 1.65;
    } else if (chasing && mob.avoid <= 0) {
      mob.desiredYaw = Math.atan2(p.x - mob.x, -(p.z - mob.z));
      speed = distance > 1.18 ? SPEC.walker.speed : 0;
      mob.rest = 0;
    } else {
      if (mob.decision <= 0 && mob.avoid <= 0) {
        const homeDistance = Math.hypot(mob.homeX - mob.x, mob.homeZ - mob.z);
        const villager = mob.type === 'villager', night = villager && !daytime(app);
        const returning = homeDistance > (villager ? (night ? 1.25 : 5.5) : 12);
        mob.desiredYaw = returning
          ? Math.atan2(mob.homeX - mob.x, -(mob.homeZ - mob.z))
          : mob.yaw + (random(app) - .5) * 2.7;
        mob.decision = villager ? 1 + random(app) * 1.8 : 2 + random(app) * 3.5;
        mob.rest = villager && returning ? 0
          : random(app) < (night ? .85 : .38) ? (night ? 2.5 : .8) + random(app) * (night ? 4 : 2) : 0;
      }
      speed = mob.rest <= 0 || mob.avoid > 0 ? SPEC[mob.type].speed * (mob.type === 'walker' ? .55 : 1) : 0;
    }
    if (mob.panic > 0 && mob.type !== 'walker') { speed = SPEC[mob.type].panicSpeed ?? 1.65; mob.rest = 0; }
    if (mob.burn > 0) speed *= .7;
    const yawStep = (chasing || alerted || following ? 5 : 2.5) * dt;
    const previousYaw=mob.yaw;
    mob.yaw += clamp(deltaAngle(mob.yaw, mob.desiredYaw), -yawStep, yawStep);
    if(mob.type==='cat'&&!clear(app.world,mob,mob.x,mob.y,mob.z)){mob.yaw=previousYaw;mob.blocked+=dt;}
    // Turn in place before retreating; retain the existing obstacle-detour direction.
    if ((alerted || following) && mob.avoid <= 0) speed *= Math.max(0, Math.cos(deltaAngle(mob.yaw, mob.desiredYaw)));
    if (mob.type === 'rabbit' && speed > 0 && mob.grounded && mob.stepWait <= 0) {
      const ahead=ground(app.world,'rabbit',mob.x+Math.sin(mob.yaw)*.45,mob.z-Math.cos(mob.yaw)*.45,mob.floorY);
      mob.vy=ahead!==null&&ahead>mob.y+.025?6.45:4.2;mob.grounded=false;mob.stepWait=.72;
    }
    vertical(app, mob, dt);
    const dx = Math.sin(mob.yaw) * speed * dt + mob.knockX * dt;
    const dz = -Math.cos(mob.yaw) * speed * dt + mob.knockZ * dt;
    const travelled = move(app, mob, dx, dz, dt);
    mob.knockX *= Math.exp(-7 * dt);
    mob.knockZ *= Math.exp(-7 * dt);
    if (mob.blocked > (mob.grounded ? .2 : .78)) turnAway(app, mob);
    mob.moving += ((travelled > .001 ? 1 : 0) - mob.moving) * Math.min(1, dt * 10);
    // Footfall phase follows supported travel; real airborne motion keeps gravity/knockback.
    if(mob.grounded)mob.walk += travelled * (mob.type==='chicken'?16:mob.type==='rabbit'?11:9);
    graze(app, mob, dt);
    if (chasing && distance < 1.85 && Math.abs(p.y - mob.y) < 1.35 && mob.attackWait <= 0
      && unobstructed(app.world, [mob.x, mob.y + 1.25, mob.z], [p.x, p.y + 1.1, p.z])) {
      mob.attackWait = 1.05;
      mob.lunge = .22;
      if (typeof damage === 'function') damage(2, 'Một kẻ lang thang đã bắt kịp bạn trong đêm.');
    }
    mob.lunge = Math.max(0, (mob.lunge || 0) - dt);
  }

  function spawnAnimal(app) {
    if (app.world?.dimension === 'inferno' || app.world?.dimension === 'sky') return;
    const state=app._entities,animals=app.mobs.filter(m=>PASSIVE_TYPES.includes(m.type)&&!m.dead);
    if(app.mobs.length>=MAX_MOBS-MAX_WALKERS||animals.length>=Math.min(MAX_ANIMALS,MAX_MOBS-MAX_WALKERS-MAX_VILLAGERS))return;
    const missing=PASSIVE_TYPES.filter(type=>!animals.some(m=>m.type===type));
    const start=state.animalCursor++,p=app.player;
    for(let attempt=0;attempt<24;attempt++) {
      const preferred=missing.length>0&&attempt<16;
      const choices=preferred?missing:PASSIVE_TYPES;
      const step=preferred?Math.floor(attempt/2):missing.length?attempt-16:Math.floor(attempt/3);
      const type=choices[(start+step)%choices.length];
      const angle=random(app)*TAU,radius=12+random(app)*14;
      const pos=spawnPosition(app,type,p.x+Math.sin(angle)*radius,p.z-Math.cos(angle)*radius);
      if(!pos||Math.abs(pos[1]-p.y)>5)continue;
      app.mobs.push(makeMob(app,type,...pos));state.spawnedAnimals++;return;
    }
  }

  function spawnWalker(app) {
    if (app.world?.dimension === 'sky') return;
    if (app.mobs.length >= MAX_MOBS || app.mobs.filter(m => m.type === 'walker' && !m.dead).length >= MAX_WALKERS) return;
    const p = app.player;
    for (let attempt = 0; attempt < 28; attempt++) {
      const angle = random(app) * TAU, radius = 14 + random(app) * 14;
      const pos = spawnPosition(app, 'walker', p.x + Math.sin(angle) * radius, p.z - Math.cos(angle) * radius);
      if (!pos || Math.hypot(pos[0] - p.x, pos[2] - p.z) < 12 || Math.abs(pos[1] - p.y) > 5) continue;
      const mob = makeMob(app, 'walker', ...pos);
      mob.yaw = mob.desiredYaw = Math.atan2(p.x - mob.x, -(p.z - mob.z));
      app.mobs.push(mob);
      app._entities.spawnedWalkers++;
      return;
    }
  }

  function rayBox(origin, direction, lo, hi, maxDistance) {
    let near = 0, far = maxDistance;
    for (let a = 0; a < 3; a++) {
      if (Math.abs(direction[a]) < 1e-9) {
        if (origin[a] < lo[a] || origin[a] > hi[a]) return null;
      } else {
        let t0 = (lo[a] - origin[a]) / direction[a], t1 = (hi[a] - origin[a]) / direction[a];
        if (t0 > t1) [t0, t1] = [t1, t0];
        near = Math.max(near, t0); far = Math.min(far, t1);
        if (near > far) return null;
      }
    }
    return near <= maxDistance && far >= 0 ? near : null;
  }

  function nearestMob(app, origin, dir, maxDistance) {
    if (!app?._entities || !app.world || !Array.isArray(origin) || !Array.isArray(dir)
      || origin.length !== 3 || dir.length !== 3 || !origin.every(finite) || !dir.every(finite)) return null;
    const length = Math.hypot(...dir);
    if (!finite(length) || length < .0001) return null;
    const direction = dir.map(n => n / length);
    const limit = Math.min(4.5, finite(maxDistance) ? Math.max(0, maxDistance) : 4.5);
    let best = null, nearest = limit;
    for (const mob of app.mobs || []) {
      if (mob.dead || mob.health <= 0 || !SPEC[mob.type] || !loaded(app.world, mob.x, mob.z) || V.mounts?.controls(app, mob)) continue;
      const humanoid = mob.type === 'walker' || mob.type === 'villager';
      const s = SPEC[mob.type], rx = s.hitX ?? (humanoid ? .53 : .44), rz = s.hitZ ?? (humanoid ? .34 : .96);
      const c = Math.abs(Math.cos(mob.yaw)), n = Math.abs(Math.sin(mob.yaw));
      const ex = rx * c + rz * n, ez = rx * n + rz * c;
      const distance = rayBox(origin, direction, [mob.x - ex, mob.y, mob.z - ez], [mob.x + ex, mob.y + s.height, mob.z + ez], nearest);
      if (distance === null || distance > nearest) continue;
      const hit = origin.map((v, i) => v + direction[i] * distance);
      if (!unobstructed(app.world, origin, hit)) continue;
      best = mob;
      nearest = distance;
    }
    return best;
  }

  // One target query preserves the same nearest-live-actor and solid-LOS rules as
  // melee/shearing. Input press latching belongs to the game input layer.
  function companionInteract(app, origin, dir, maxDistance, itemId, spend) {
    const unhandled={handled:false,ok:false,changed:false};
    if (!app?.player || app.player.health <= 0 || !app._entities || !app.world || !Array.isArray(app.mobs)) return unhandled;
    if (![0,128,150].includes(itemId)) return unhandled;
    const creative=app.mode==='creative',best=nearestMob(app,origin,dir,maxDistance);
    const reply=(ok,action,message,extra={})=>({handled:true,ok,changed:false,action,message,...extra});
    if (itemId===150 && !creative && !(app.inventory?.[150]>0)) return reply(false,'empty-whistle','Bạn chưa có còi bạn đồng hành.');
    if (!best || best.type!=='cat') {
      if (itemId!==150) return unhandled;
      const p=app.player,nearby=app.mobs.filter(m=>m.type==='cat'&&!m.dead&&m.health>0&&m.catTrust===3
        && Math.hypot(m.x-p.x,m.z-p.z)<=24 && Math.abs(m.y-p.y)<4 && footprintLoaded(app.world,m.x,m.z,SPEC.cat.width));
      let changed=0;
      for(const m of nearby){if(m.catFollow!==true){m.catFollow=true;changed++;}}
      return reply(nearby.length>0,'recall',nearby.length?'Đã gọi '+nearby.length+' mèo bạn ở gần.':'Không có mèo bạn trong vùng 24 khối đang tải.',{changed:changed>0,count:nearby.length,changedCount:changed,spent:0});
    }
    const state=()=>({serial:best.serial,catTrust:best.catTrust,catFollow:best.catFollow,health:best.health,spent:0});
    if (itemId===128) {
      if (best.catTrust===3 && best.health>=SPEC.cat.health) return reply(false,'satisfied','Mèo đã tin bạn và đang khỏe; giữ lại phần thịt gà nhé.',state());
      if (!creative && (!(app.inventory?.[128]>0)||typeof spend!=='function')) return reply(false,'empty-food','Cần một phần thịt gà chín để cho mèo ăn.',state());
      // Spend succeeds before trust/health changes, so failed inventory operations are atomic.
      if (!creative && !spend(128,1)) return reply(false,'empty-food','Không còn thịt gà chín trong túi.',state());
      const priorTrust=best.catTrust,priorHealth=best.health;
      best.catTrust=Math.min(3,priorTrust+1);best.health=Math.min(SPEC.cat.health,priorHealth+3);
      if(priorTrust<3&&best.catTrust===3)best.catFollow=true;
      particles(app,best,false,5);
      return reply(true,'feed',best.catTrust===3?(priorTrust<3?'Mèo đã tin bạn! Mèo sẽ theo chân bạn.':'Mèo được hồi sức.'):'Mèo đang làm quen: '+best.catTrust+'/3. Thêm thịt gà chín sẽ giúp mèo tin bạn.',{...state(),changed:true,spent:creative?0:1,healed:best.health-priorHealth,bonded:best.catTrust===3});
    }
    if (best.catTrust!==3) return reply(false,'unbonded','Cho mèo ăn thịt gà chín ba lần để làm bạn.',state());
    best.catFollow=!best.catFollow;
    return reply(true,best.catFollow?'follow':'stay',best.catFollow?'Mèo sẽ theo chân bạn.':'Mèo sẽ đợi tại đây.',{...state(),changed:true});
  }

  function snapshot(app) {
    return (app.mobs || []).filter(m => !m.dead && SPEC[m.type] && m.health > 0
      && [m.x, m.y, m.z, m.health, m.yaw].every(finite)).slice(0, MAX_MOBS).map(m => ({
        type: m.type, x: m.x, y: m.y, z: m.z, health: m.health, yaw: m.yaw,
        ...(Number.isInteger(m.variant)&&m.variant>0&&m.variant<=3?{variant:m.variant}:{}),
        ...(m.type === 'villager' ? { homeIndex: m.homeIndex } : {}),
        ...(m.eggSpawned===true?{eggSpawned:true}:{}),
        ...(m.type==='cat'?{catTrust:Number.isInteger(m.catTrust)&&m.catTrust>=0&&m.catTrust<=3?m.catTrust:0,catFollow:m.catTrust===3&&m.catFollow===true}:{}),
        ...(m.type==='villager'&&m.eggSpawned===true?{eggHome:m.eggHome.slice()}:{}),
        ...(m.type === 'sheep' ? {
          sheared: m.sheared === true,
          grazeAge: m.sheared && finite(m.grazeAge) ? clamp(m.grazeAge, 0, WOOL_REGROW_SECONDS) : 0
        } : {})
      }));
  }

  // Render-only skeletons. Physics, random state and serialized mobs never enter this cache.
  const CONTACT_RADII=Object.freeze({pig:[.43,.64],sheep:[.48,.69],cow:[.55,.86],chicken:[.36,.46],rabbit:[.30,.45],wolf:[.36,.82],fox:[.33,.85],cat:[.32,.60],goat:[.39,.66],duck:[.33,.54],tortoise:[.44,.53],bear:[.56,.70],hedgehog:[.30,.38],boar:[.41,.68],camel:[.49,.96],zebra:[.47,.96],badger:[.31,.51],raccoon:[.26,.72],armadillo:[.24,.69],horse:[.48,.98],deer:[.40,.80],walker:[.43,.40],villager:[.43,.40]});
  const MODEL_CACHE=new Map(),POSE_CACHE=new WeakMap();
  let modelGenerations=0,poseGenerations=0;
  function restParts(type,sheared){
    const m={type,sheared,burn:1,lunge:0},parts=[],stride=0,liftA=0,liftB=0;
    const add=(x,y,z,w,h,d,tint,id=20,emissive=0)=>parts.push({p:[x,y,z],s:[w,h,d],tint,id,emissive,group:'body'});
      const eyes = [.045, .055, .06], hoof = [.31, .27, .25];
      if (m.type === 'pig') {
        const pink = [1, .91, .91];
        add(0, .61, .08, .74, .56, 1.02, pink, 31);
        add(0, .73, -.60, .53, .45, .47, pink, 31);
        add(0, .65, -.865, .30, .19, .12, [.91, .72, .73], 31);
        for (const side of [-1, 1]) {
          add(side * .20, 1.01, -.58, .13, .20, .12, [.94, .77, .79], 31);
          add(side * .17, .80, -.842, .085, .085, .018, eyes);
          add(side * .075, .66, -.931, .047, .048, .015, [.37, .19, .23]);
        }
        for (const [x, z, parity] of [[-.24, -.29, 1], [.24, -.29, -1], [-.24, .40, -1], [.24, .40, 1]]) {
          const lift = parity > 0 ? liftA : liftB;
          add(x, .20 + lift, z + stride * parity, .18, .39, .19, pink, 31);
          add(x, .055 + lift, z + stride * parity, .19, .11, .20, hoof);
        }
        add(0, .69, .65, .10, .10, .19, [.94, .77, .79], 31);
      } else if (m.type === 'sheep') {
        const wool = [.99, .97, .89], face = [.49, .43, .36];
        if (m.sheared) add(0, .68, .10, .68, .48, 1.04, [.66, .59, .50]);
        else add(0, .72, .10, .87, .72, 1.10, wool);
        add(0, .91, -.62, .49, .49, .43, face);
        if (!m.sheared) add(0, 1.13, -.53, .56, .20, .48, wool);
        add(0, .78, -.87, .31, .20, .12, [.58, .51, .43]);
        for (const side of [-1, 1]) {
          add(side * .32, .98, -.57, .20, .12, .15, face);
          add(side * .145, .96, -.844, .09, .09, .018, [1, 1, .97]);
          add(side * .145, .955, -.856, .046, .060, .016, eyes);
        }
        for (const [x, z, parity] of [[-.28, -.28, 1], [.28, -.28, -1], [-.28, .45, -1], [.28, .45, 1]]) {
          const lift = parity > 0 ? liftA : liftB;
          add(x, .225 + lift, z + stride * parity, .18, .45, .19, face);
          add(x, .055 + lift, z + stride * parity, .19, .11, .20, hoof);
        }
        if (m.sheared) add(0, .69, .65, .12, .12, .16, face);
        else add(0, .72, .73, .18, .20, .22, wool);
      } else if (m.type === 'cow') {
        const cream=[.91,.89,.80],patch=[.22,.18,.15],muzzle=[.57,.42,.37];
        add(0,.83,.08,.82,.70,.92,cream);
        add(0,1.10,-.47,.48,.46,.36,cream);
        add(0,1.00,-.68,.36,.22,.16,muzzle);
        for(const side of [-1,1]){
          add(side*.416,.84,.10,.018,.36,.34,patch);
          add(side*.32,1.23,-.45,.18,.13,.16,patch);
          add(side*.18,1.35,-.48,.08,.16,.09,[.82,.77,.57]);
          add(side*.16,1.19,-.656,.07,.07,.018,eyes);
          add(side*.085,1.02,-.765,.05,.045,.014,[.12,.10,.09]);
        }
        add(-.12,1.187,.23,.32,.018,.31,patch);
        add(.17,.83,-.387,.22,.32,.018,patch);
        for(const [x,z,parity]of [[-.27,-.23,1],[.27,-.23,-1],[-.27,.32,-1],[.27,.32,1]]){
          const lift=parity>0?liftA:liftB,sway=stride*.7*parity;
          add(x,.25+lift,z+sway,.18,.50,.19,cream);
          add(x,.055+lift,z+sway,.19,.11,.20,[.18,.16,.14]);
        }
        add(0,.48,.20,.27,.14,.30,[.84,.57,.56]);
        add(0,.80,.59,.08,.26,.18,cream);add(0,.63,.69,.10,.24,.10,patch);
      } else if (m.type === 'chicken') {
        const feather=[.97,.94,.83],orange=[.94,.59,.15],red=[.76,.16,.12];
        add(0,.40,.05,.40,.44,.48,feather);
        add(0,.70,-.23,.28,.28,.28,feather);
        add(0,.90,-.23,.10,.16,.22,red);
        add(0,.65,-.43,.18,.11,.14,orange);
        add(0,.58,-.36,.13,.16,.11,red);
        add(0,.55,.35,.23,.30,.20,[.83,.79,.67]);
        for(const side of [-1,1]){
          add(side*.225,.44+0,.04,.08,.30,.34,[.88,.85,.74]);
          add(side*.145,.73,-.30,.018,.065,.065,eyes);
          const lift=side>0?liftA*.65:liftB*.65,sway=stride*.6*side;
          add(side*.11,.10+lift,sway,.055,.20,.055,orange);
          add(side*.11,.035+lift,-.07+sway,.08,.07,.20,orange);
        }
      } else if (m.type === 'badger') {
        // European badger silhouette: low stocky body, short tail, pale medial face and dark eye stripes.
        const gray=[.47,.48,.46],dark=[.14,.16,.17],white=[.89,.87,.79],nose=[.08,.09,.10];
        add(0,.38,.06,.48,.40,.76,gray);             // 0 trunk
        add(0,.43,-.23,.46,.42,.34,gray);           // 1 shoulders
        add(0,.36,.38,.42,.34,.32,gray);            // 2 rump
        add(0,.35,-.36,.28,.26,.26,dark);           // 3 neck
        add(0,.34,-.49,.30,.26,.32,white);          // 4 head
        add(0,.285,-.685,.22,.16,.16,white);        // 5 tapered muzzle
        add(0,.29,-.775,.13,.09,.026,nose);         // 6 nose
        add(0,.235,-.66,.18,.06,.22,white);         // 7 jaw
        add(0,.30,.57,.15,.15,.22,gray);            // 8 short tail
        for(const side of[-1,1]){
          add(side*.13,.515,-.40,.11,.13,.10,dark); // 9/14 rounded ear
          add(side*.13,.52,-.455,.067,.078,.014,white);//10/15 pale ear edge
          add(side*.157,.38,-.57,.017,.036,.050,nose);parts[parts.length-1].blink=true;//11/16 eye
          add(side*.151,.355,-.49,.018,.20,.29,dark);//12/17 continuous side mask
          add(side*.105,.39,-.655,.075,.16,.015,dark);//13/18 forehead stripe
        }
        for(const[x,z]of[[-.17,-.20],[.17,-.20],[-.17,.30],[.17,.30]]){
          add(x,.105,z,.11,.21,.14,dark);          // 19/21/23/25 short shafts
          add(x,.035,z-.025,.13,.07,.20,dark);    // 20/22/24/26 broad toes
        }
        add(0,.582,.07,.34,.014,.58,[.57,.57,.53]); // 27 coarse dorsal tone
      } else if (m.type === 'boar') {
        // Heavy shoulders taper to a lower rump; tusks and ridge remain rooted.
        const coat=[.36,.27,.19],shoulder=[.42,.31,.22],muzzle=[.48,.36,.25],bristle=[.20,.17,.13],tusk=[.84,.79,.65],foot=[.22,.20,.17];
        add(0,.59,.03,.66,.56,.90,coat);             // 0 torso
        add(0,.68,-.27,.72,.62,.42,shoulder);        // 1 shoulders
        add(0,.55,.40,.54,.43,.36,coat);             // 2 tapered rump
        add(0,.56,-.46,.43,.40,.30,shoulder);        // 3 neck
        add(0,.56,-.60,.40,.34,.34,coat);            // 4 head
        add(0,.48,-.79,.27,.22,.24,muzzle);          // 5 snout
        add(0,.48,-.915,.28,.17,.025,[.24,.19,.16]);// 6 nose
        add(0,.39,-.73,.27,.08,.30,muzzle);          // 7 jaw
        add(0,.60,.65,.075,.10,.18,coat);           // 8 tail
        for(const side of[-1,1]){
          add(side*.19,.84,-.55,.16,.24,.12,coat);  // 9/15 ear
          add(side*.19,.85,-.616,.10,.14,.018,muzzle);//10/16 inset
          add(side*.206,.615,-.68,.015,.05,.06,eyes);parts[parts.length-1].blink=true;//11/17 eye
          add(side*.208,.65,-.68,.02,.04,.09,bristle);//12/18 brow
          add(side*.15,.43,-.79,.055,.11,.06,tusk); //13/19 rooted tusk
          add(side*.17,.515,-.80,.05,.12,.045,tusk);//14/20 tip
        }
        for(const[x,z]of[[-.23,-.25],[.23,-.25],[-.23,.34],[.23,.34]]){
          add(x,.24,z,.15,.48,.18,coat);           //21/23/25/27 shaft
          add(x,.055,z-.015,.18,.11,.22,foot);      //22/24/26/28 hoof
        }
        add(0,.99,-.28,.13,.12,.23,bristle);        //29 shoulder ridge
        add(0,.90,-.02,.12,.13,.25,bristle);        //30 back ridge
        add(0,.84,.24,.10,.10,.22,bristle);         //31 low rear ridge
        add(0,.766,.38,.35,.016,.30,shoulder);      //32 rump tone
      } else if (m.type === 'camel') {
        // Bactrian silhouette: two separate fat humps, bent neck and broad pads.
        const coat=[.65,.47,.29],shade=[.55,.37,.22],muzzle=[.78,.62,.43],pad=[.40,.31,.23],mane=[.40,.28,.18];
        add(0,1.30,.08,.82,.68,1.42,coat);          // 0 torso
        add(0,1.27,-.47,.70,.62,.42,coat);          // 1 chest
        add(0,1.26,.62,.68,.60,.42,shade);          // 2 rump
        add(0,1.45,-.63,.42,.52,.38,shade);         // 3 lower neck
        add(0,1.79,-.79,.34,.58,.34,coat);          // 4 rising neck
        add(0,2.10,-.98,.36,.36,.40,coat);          // 5 head
        add(0,2.02,-1.185,.30,.22,.24,muzzle);       // 6 muzzle
        add(0,2.035,-1.313,.27,.095,.025,pad);      // 7 nose
        add(0,1.93,-1.195,.28,.055,.22,muzzle);      // 8 lower lip
        add(0,1.20,.85,.10,.36,.12,coat);           // 9 tail shaft
        add(0,.94,.88,.14,.22,.14,mane);            //10 tail tuft
        for(const z of[-.23,.48]){
          add(0,1.79,z,.64,.40,.48,shade);         //11/14 hump base
          add(0,2.035,z,.42,.22,.32,coat);         //12/15 cap
          add(0,2.17,z,.25,.10,.21,muzzle);        //13/16 crest
        }
        add(0,1.86,-1.12,.12,.15,.14,mane);        //17 chin hair
        for(const side of[-1,1]){
          add(side*.25,2.24,-.93,.18,.16,.12,coat);//18/23 ear
          add(side*.25,2.25,-.995,.10,.08,.016,muzzle);//19/24 inset
          add(side*.188,2.12,-1.07,.016,.05,.08,eyes);parts[parts.length-1].blink=true;//20/25 eye
          add(side*.19,2.16,-1.07,.018,.03,.105,mane);//21/26 brow
          add(side*.09,2.055,-1.328,.045,.025,.012,eyes);//22/27 nostril
        }
        for(const[x,z]of[[-.28,-.44],[.28,-.44],[-.28,.57],[.28,.57]]){
          add(x,.57,z,.16,1.14,.19,coat);          //28/30/32/34 shaft
          add(x,.07,z-.035,.28,.14,.32,pad);        //29/31/33/35 broad pad
        }
        add(0,.962,.10,.64,.02,1.12,muzzle);        //36 belly tone
      } else if (m.type === 'bear') {
        // Original stocky bear: raised shoulders, low rump, short ears and broad paws.
        const fur=[.43,.29,.18],shoulder=[.49,.34,.22],muzzle=[.67,.51,.34],paw=[.25,.19,.14],inner=[.30,.22,.17];
        add(0,.79,.05,1.04,.78,1.10,fur);            // 0 broader lower torso
        add(0,.99,-.22,1.08,.78,.50,shoulder);        // 1 broad shoulder mass
        add(0,.77,.45,.90,.66,.34,fur);              // 2 full lower rump
        add(0,1.00,-.47,.48,.44,.30,fur);            // 3 connected neck
        add(0,1.19,-.60,.52,.40,.37,shoulder);        // 4 broader head
        add(0,1.105,-.825,.31,.20,.18,muzzle);        // 5 projecting muzzle
        add(0,1.155,-.923,.23,.11,.025,[.12,.10,.09]);// 6 broad nose
        add(0,1.015,-.79,.28,.06,.20,muzzle);         // 7 lower jaw
        add(0,.76,.655,.16,.18,.16,fur);              // 8 short tail
        add(0,.77,-.472,.54,.34,.024,muzzle);         // 9 chest volume
        for(const side of[-1,1]){
          add(side*.17,1.43,-.57,.17,.19,.15,fur);    // 10/14 short ear
          add(side*.17,1.44,-.65,.10,.105,.021,inner);// 11/15 ear inset
          add(side*.17,1.275,-.790,.085,.025,.018,inner);//12/16 visible forward brow
          add(side*.17,1.235,-.795,.065,.045,.018,eyes);parts[parts.length-1].blink=true;//13/17 forward eye
        }
        for(const[x,z]of[[-.25,-.32],[.25,-.32],[-.25,.36],[.25,.36]]){
          add(x,.32,z,.21,.64,.25,fur);              // 18/20/22/24 shaft
          add(x,.065,z-.035,.27,.13,.32,paw);        // 19/21/23/25 paw
        }
        add(0,1.182,.05,.78,.016,.82,shoulder);        // 26 dorsal highlight
        add(0,1.22,-.797,.22,.09,.04,muzzle);          // 27 muzzle bridge
      } else if (m.type === 'hedgehog') {
        // Low quill mantle and stepped tapered snout; quills are fixed body detail.
        const coat=[.46,.36,.25],face=[.72,.61,.44],quill=[.32,.27,.21],tip=[.78,.71,.57],foot=[.36,.27,.20];
        add(0,.29,.04,.48,.36,.60,coat);              // 0 low body
        add(0,.41,.08,.39,.25,.48,coat);              // 1 domed mantle
        add(0,.29,-.255,.28,.24,.25,face);            // 2 head
        add(0,.245,-.425,.19,.16,.18,face);           // 3 tapered snout
        add(0,.238,-.545,.11,.10,.09,face);           // 4 narrow snout tip
        add(0,.251,-.596,.065,.06,.018,[.15,.12,.10]);// 5 nose
        add(0,.17,.38,.065,.075,.11,face);            // 6 tiny tail
        for(const side of[-1,1]){
          add(side*.15,.44,-.23,.12,.15,.09,face);    // 7/10 ear
          add(side*.15,.445,-.28,.065,.09,.015,[.51,.36,.29]);//8/11 inset
          add(side*.144,.32,-.33,.014,.045,.05,eyes);parts[parts.length-1].blink=true;//9/12
        }
        for(const[x,z]of[[-.17,-.15],[.17,-.15],[-.17,.24],[.17,.24]]){
          add(x,.08,z,.085,.16,.11,face);            // 13/15/17/19 shaft
          add(x,.026,z-.02,.11,.052,.15,foot);       // 14/16/18/20 foot
        }
        for(const x of[-.20,-.10,0,.10,.20])for(const z of[-.10,.10,.29]){
          const rootY=(Math.abs(x)>.15?.443:.506-Math.abs(x)*.04)+(z===.10?.007:0),y=rootY+.06;
          add(x,y,z,.050,.12,.050,quill);             // 21..50 short rooted quill/tip pairs
          add(x,rootY+.125,z,.033,.030,.033,tip);
        }
      } else if (m.type === 'duck') {
        const feather=[.68,.70,.67],green=[.18,.40,.29],chest=[.48,.26,.18],bill=[.91,.65,.20],feet=[.91,.46,.12];
        add(0,.43,.05,.52,.40,.68,feather);             // 0 torso
        add(0,.48,-.235,.44,.43,.25,chest);           // 1 breast
        add(0,.66,-.25,.23,.32,.22,green);            // 2 neck
        add(0,.83,-.36,.31,.28,.32,green);            // 3 head
        add(0,.77,-.58,.29,.075,.20,bill);            // 4 broad flat bill
        add(0,.758,-.687,.27,.014,.018,[.45,.31,.11]); // 5 bill edge
        add(0,.56,.455,.30,.16,.21,[.36,.39,.36]);     // 6 short tail
        add(0,.47,.35,.38,.22,.20,[.22,.25,.24]);      // 7 rump
        for(const side of[-1,1]){
          add(side*.274,.47,.04,.085,.28,.48,feather); // 8/14 wing
          add(side*.319,.48,.10,.012,.10,.21,[.20,.29,.55]); // 9/15 wing patch
          add(side*.320,.545,.10,.014,.022,.22,[.91,.89,.80]); // 10/16 border
          add(side*.161,.86,-.41,.018,.055,.05,eyes);parts[parts.length-1].blink=true; // 11/17
          add(side*.14,.14,.04,.065,.28,.08,feet);    // 12/18 leg
          add(side*.14,.035,-.035,.18,.07,.22,feet);  // 13/19 broad webbed foot
        }
        add(0,.663,-.25,.236,.035,.226,[.92,.91,.83]); // 20 neck ring
      } else if (m.type === 'tortoise') {
        const shell=[.38,.30,.18],skin=[.48,.47,.29],mark=[.66,.55,.29];
        add(0,.29,.04,.76,.27,.84,shell);              // 0 lower shell
        add(0,.445,.04,.64,.22,.70,[.45,.37,.22]);     // 1 domed middle
        add(0,.565,.04,.44,.12,.48,[.52,.44,.27]);     // 2 domed crown
        add(0,.185,.04,.64,.12,.72,[.70,.61,.40]);     // 3 plastron
        add(0,.29,-.40,.20,.18,.22,skin);             // 4 neck
        add(0,.32,-.54,.25,.20,.26,skin);             // 5 small head
        add(0,.305,-.681,.17,.085,.035,[.38,.38,.23]); // 6 blunt beak
        add(0,.27,.525,.075,.09,.22,skin);            // 7 short tail
        for(const side of[-1,1]){add(side*.128,.36,-.585,.012,.04,.045,eyes);parts[parts.length-1].blink=true;} // 8/9
        for(const[x,z]of[[-.32,-.23],[.32,-.23],[-.32,.30],[.32,.30]]){
          add(x,.14,z,.16,.28,.18,skin);             // 10/12/14/16 stout leg
          add(x,.04,z+(z<0?-.04:.03),.18,.08,.23,skin); // 11/13/15/17 foot
        }
        for(const x of[-.12,.12])for(const z of[-.10,.04,.18])add(x,.629,z,.16,.008,.11,mark); // 18..23 scute pattern
      } else if (m.type === 'rabbit') {
        const fur=[.67,.51,.36],light=[.82,.68,.50],pink=[.82,.53,.53];
        add(0,.31,.06,.48,.40,.56,fur);
        add(0,.50,-.22,.28,.30,.30,light);
        add(0,.44,-.42,.16,.12,.10,light);
        add(0,.46,-.477,.07,.055,.014,pink);
        add(0,.35,.39,.16,.18,.16,[.91,.88,.78]);
        for(const side of [-1,1]){
          add(side*.09,.82,-.20,.10,.38,.09,fur);
          add(side*.09,.83,-.251,.052,.29,.014,pink);
          add(side*.106,.54,-.375,.05,.065,.014,eyes);
          const lift=side>0?liftA*.35:liftB*.35,sway=stride*.45*side;
          add(side*.18,.12+lift,.20+sway,.17,.24,.28,fur);
          add(side*.12,.10+lift,-.20-sway,.12,.20,.15,light);
        }
      } else if (m.type === 'wolf') {
        const fur=[.58,.63,.67],dark=[.29,.34,.39],light=[.84,.85,.80];
        add(0,.64,.06,.48,.42,.82,fur);
        add(0,.82,-.30,.43,.48,.35,fur);
        add(0,.98,-.48,.40,.34,.35,fur);
        add(0,.91,-.725,.27,.18,.24,light);
        add(0,.94,-.856,.18,.12,.035,[.10,.12,.14]);
        add(0,.845,.05,.38,.04,.60,dark);
        add(0,.70,.58,.14,.17,.32,fur);
        add(0,.76,.79,.15,.15,.18,dark);
        for(const side of [-1,1]){
          add(side*.14,1.20,-.45,.13,.22,.13,dark);
          add(side*.205,1.02,-.54,.016,.055,.08,[.92,.76,.28]);
          add(side*.214,1.02,-.55,.008,.034,.045,eyes);
        }
        for(const[x,z,parity]of [[-.16,-.23,1],[.16,-.23,-1],[-.16,.34,-1],[.16,.34,1]]){
          const lift=parity>0?liftA:liftB,sway=stride*.8*parity;
          add(x,.25+lift,z+sway,.13,.50,.16,fur);
          add(x,.055+lift,z+sway,.14,.11,.18,light);
        }
      } else if (m.type === 'fox') {
        const orange=[.91,.43,.16],cream=[.95,.88,.70],socks=[.19,.15,.13];
        add(0,.42,.05,.42,.34,.66,orange);
        add(0,.57,-.24,.34,.38,.26,orange);
        add(0,.68,-.39,.34,.26,.28,orange);
        add(0,.60,-.61,.22,.13,.20,cream);
        add(0,.62,-.72,.12,.08,.04,eyes);
        add(0,.55,-.376,.25,.24,.020,cream);
        add(0,.27,.03,.32,.06,.52,cream);
        add(0,.42,.64,.26,.26,.60,orange);
        add(0,.42,.95,.27,.25,.20,cream);
        for(const side of [-1,1]){
          add(side*.11,.90,-.34,.12,.22,.11,orange);
          add(side*.11,.91,-.399,.055,.14,.014,socks);
          add(side*.173,.69,-.43,.016,.05,.07,eyes);
        }
        for(const[x,z,parity]of [[-.13,-.17,1],[.13,-.17,-1],[-.13,.25,-1],[.13,.25,1]]){
          const lift=(parity>0?liftA:liftB)*.55,sway=stride*.6*parity;
          add(x,.13+lift,z+sway,.105,.26,.14,socks);
          add(x,.035+lift,z-.02+sway,.12,.07,.18,socks);
        }
      } else if (m.type === 'goat') {
        // Original compact goat: swept-back horns, chin beard and horizontal pupils.
        const coat=[.89,.87,.80],cream=[.95,.92,.82],mark=[.42,.36,.27],horn=[.48,.41,.30],tip=[.72,.64,.48],hoof=[.22,.20,.17];
        add(0,.72,.08,.56,.47,.86,coat);                   // 0 torso
        add(0,.92,-.28,.40,.50,.30,coat);                 // 1 chest/neck
        add(0,1.15,-.45,.34,.32,.33,coat);                // 2 compact head
        add(0,1.08,-.66,.24,.17,.18,cream);               // 3 muzzle
        add(0,1.09,-.7575,.22,.09,.025,mark);             // 4 broad nose
        add(0,.492,.08,.40,.025,.72,cream);               // 5 belly
        add(0,.92,-.65,.13,.22,.10,mark);                 // 6 beard
        add(0,.96,.55,.11,.20,.13,coat);                  // 7 short upright tail
        add(0,1.08,.59,.105,.08,.11,mark);                // 8 tail tip
        for(const side of [-1,1]){
          add(side*.25,1.21,-.42,.28,.10,.14,coat);       // 9/14 outward ear
          add(side*.265,1.205,-.495,.16,.055,.012,mark);  // 10/15 inner ear
          add(side*.176,1.175,-.50,.016,.085,.12,cream);  // 11/16 eye surround
          parts[parts.length-1].blink=true;
          add(side*.188,1.175,-.51,.012,.060,.09,[.74,.58,.27]); // 12/17 amber iris
          parts[parts.length-1].blink=true;
          add(side*.196,1.175,-.515,.012,.020,.068,eyes); // 13/18 horizontal pupil
        }
        for(const side of [-1,1]){
          add(side*.105,1.34,-.39,.065,.13,.065,horn);   // 19/23 rooted horn
          add(side*.12,1.43,-.33,.070,.10,.12,horn);     // 20/24 backward sweep
          add(side*.13,1.47,-.23,.065,.075,.15,tip);     // 21/25 curved crown
          add(side*.13,1.435,-.14,.055,.075,.08,tip);    // 22/26 short downturned tip
        }
        for(const[x,z]of [[-.19,-.20],[.19,-.20],[-.19,.39],[.19,.39]]){
          add(x,.25,z,.11,.50,.13,coat);                // 27/29/31/33 leg shaft
          add(x,.05,z-.015,.145,.10,.17,hoof);          // 28/30/32/34 hoof
        }
        add(0,.962,.08,.20,.020,.66,mark);               // 35 dorsal marking
        add(0,1.235,-.622,.09,.12,.015,cream);           // 36 forehead blaze
      } else if (m.type === 'cat') {
        // Relaxed feline proportions; the compact face stays inside the existing head guard.
        const coat=[.78,.48,.23],cream=[.94,.87,.72],stripe=[.32,.23,.17],pink=[.78,.43,.41];
        add(0,.46,0,.40,.32,.64,coat);                // 0 torso
        add(0,.54,-.23,.32,.32,.24,coat);              // 1 chest
        add(0,.765,-.43,.44,.31,.34,coat);             // 2 short feline head
        add(0,.68,-.615,.25,.12,.10,cream);            // 3 muzzle
        add(0,.715,-.674,.065,.050,.020,pink);         // 4 nose
        add(0,.312,0,.32,.025,.56,cream);            // 5 belly
        add(0,.53,-.346,.18,.16,.018,cream);           // 6 throat
        add(0,.695,.37,.095,.44,.10,coat);             // 7 upright tail base
        add(0,.955,.37,.10,.18,.10,stripe);            // 8 curved tail tip
        for(const side of [-1,1]){
          add(side*.14,.98,-.43,.14,.18,.14,coat);    // 9/14 outer ear
          add(side*.14,.985,-.505,.072,.115,.012,pink);// 10/15 inner ear
          add(side*.12,.79,-.609,.09,.10,.018,[.42,.72,.39]); // 11/16 iris
          parts[parts.length-1].blink=true;
          add(side*.12,.79,-.621,.03,.074,.012,eyes); // 12/17 slit pupil
          add(side*.18,.68,-.64,.16,.018,.018,cream); // 13/18 fine whisker
        }
        for(const[x,z,width]of [[-.14,-.22,.10],[.14,-.22,.10],[-.15,.29,.09],[.15,.29,.09]]){
          add(x,.19,z,width,.38,.13,coat);             // 19/21/23/25 leg shaft
          add(x,.04,z-.015,.13,.08,.18,cream);       // 20/22/24/26 paw
          parts[parts.length-1].catPaw=true;
        }
        add(0,.628,0,.22,.024,.55,stripe);          // 27 dorsal tabby stripe
        add(0,.895,-.606,.07,.05,.015,stripe);        // 28 forehead stripe
        add(0,.595,-.26,.34,.045,.22,[.19,.65,.60]);  // 29 bonded collar
        parts[29].companionCollar=true;
        add(0,.54,-.358,.09,.060,.010,[.94,.73,.24]);  // 30 collar tag
        parts[30].companionCollar=true;
      } else if (m.type === 'deer') {
        // Nai: compact branching antlers, slender articulated legs and a cream rump.
        const coat=[.66,.40,.22],cream=[.94,.86,.67],dark=[.21,.17,.14],antler=[.63,.50,.33],tip=[.84,.74,.53];
        add(0,1.02,.12,.60,.48,1.02,coat);                 // 0 body
        add(0,1.31,-.39,.26,.58,.32,coat);                // 1 neck
        add(0,1.65,-.58,.30,.34,.42,coat);                // 2 head
        add(0,1.56,-.82,.24,.20,.28,coat);                // 3 muzzle
        add(0,1.57,-.969,.19,.12,.026,dark);              // 4 nose
        add(0,1.29,-.558,.19,.36,.014,cream);             // 5 throat
        add(0,1.06,.638,.48,.29,.024,cream);              // 6 rump
        add(0,.775,.12,.45,.014,.80,cream);               // 7 belly
        add(0,1.18,.72,.15,.20,.24,coat);                 // 8 tail
        add(0,1.25,.86,.15,.12,.12,cream);                // 9 tail tip
        for(const side of [-1,1]){
          add(side*.27,1.79,-.50,.26,.13,.18,coat);       // 10/14 ear
          add(side*.27,1.80,-.594,.19,.065,.016,cream);   // 11/15 inner ear
          add(side*.159,1.69,-.67,.016,.075,.10,cream);  // 12/16 eye
          add(side*.169,1.69,-.685,.012,.045,.055,eyes); // 13/17 pupil
        }
        for(const side of [-1,1]){
          add(side*.13,1.94,-.46,.075,.25,.075,antler);  // 18/24 rooted stem
          add(side*.21,2.075,-.45,.23,.075,.075,antler); // 19/25 branch beam
          add(side*.30,2.20,-.45,.075,.25,.075,tip);     // 20/26 outer tine
          add(side*.14,2.17,-.45,.075,.19,.075,tip);     // 21/27 inner tine
          add(side*.22,2.10,-.34,.075,.075,.23,antler);  // 22/28 rear beam
          add(side*.22,2.21,-.25,.075,.22,.075,tip);     // 23/29 rear tine
        }
        for(const[x,z]of [[-.21,-.27],[.21,-.27],[-.21,.44],[.21,.44]]){
          add(x,.43,z,.125,.86,.15,coat);               // 30/32/34/36 leg shaft
          add(x,.055,z,.14,.11,.18,dark);               // 31/33/35/37 hoof
        }
        for(const side of [-1,1])for(const z of [-.20,.08,.34])for(const y of [.97,1.11])
          add(side*.306,y,z,.012,.065,.085,cream);       // 38..49 spots
      } else if (m.type === 'horse' || m.type === 'zebra') {
        const coat=[.55,.31,.18],light=[.69,.43,.26],mane=[.16,.13,.12],cream=[.92,.86,.70];
        add(0,1.02,.12,.62,.66,1.30,coat);
        add(0,1.34,-.40,.40,.70,.40,light);
        add(0,1.65,-.54,.36,.50,.36,light);
        add(0,1.82,-.70,.39,.34,.60,coat);
        add(0,1.72,-.98,.34,.25,.20,light);
        add(0,1.39,-.188,.16,.72,.06,mane);
        add(0,1.74,-.351,.14,.34,.06,mane);
        add(0,1.62,-.264,.14,.16,.15,mane);
        add(0,1.955,-.705,.16,.09,.25,mane);
        add(0,1.85,-1.008,.09,.20,.018,cream);
        add(0,1.05,.80,.13,.45,.32,mane);
        add(0,.70,.94,.14,.57,.15,mane);
        for(const side of [-1,1]){
          add(side*.12,2.07,-.48,.09,.20,.12,coat);
          add(side*.20,1.85,-.77,.018,.07,.09,eyes);
          add(side*.09,1.75,-1.085,.055,.045,.016,eyes);
        }
        for(const[x,z,parity]of [[-.21,-.31,1],[.21,-.31,-1],[-.21,.48,-1],[.21,.48,1]]){
          const lift=(parity>0?liftA:liftB)*1.2,sway=stride*.95*parity;
          add(x,.39+lift,z+sway,.15,.78,.18,coat);
          add(x,.065+lift,z+sway,.17,.13,.20,cream);
        }
      } else {
        const green = [.45, .63, .32];
        const shirt = [.26, .45, .63], pants = [.23, .29, .39];
        add(0, 1.08, 0, .61, .66, .36, shirt);
        add(0, 1.62, -.025, .59, .59, .52, green);
        add(0, 1.91, .015, .53, .09, .46, [.25, .38, .20]);
        add(0, 1.46, -.31, .20, .17, .12, [.39, .54, .26]);
        add(0, 1.37, -.293, .26, .055, .018, [.17, .23, .13]);
        for (const side of [-1, 1]) {
          const swing = stride * side, lift = side > 0 ? liftA : liftB;
          add(side * .17, .40 + lift, swing, .24, .80, .29, pants);
          add(side * .17, .08 + lift, -.045 + swing, .25, .16, .37, [.19, .24, .25]);
          add(side * .40, 1.07, -.07 - swing - (m.lunge || 0) * .5, .20, .60, .24, green);
          add(side * .40, 1.28, -.07 - swing, .22, .24, .26, shirt);
          add(side * .15, 1.69, -.294, .12, .09, .025, [.90, .79, .36], 20, .22);
          add(side * .14, 1.69, -.311, .043, .065, .014, eyes);
          add(side * .15, 1.77, -.295, .16, .055, .028, [.25, .36, .19]);
        }
        if (m.burn > 0) {
          const flicker = 0;
          add(-.32, .73 + flicker, -.20, .10, .35 + flicker, .10, [1, .64, .19], 20, .9);
          add(.32, 1.34 - flicker, .10, .11, .29 - flicker, .11, [1, .79, .30], 20, .9);
        }
      }
    if(type==='zebra'){
      parts[0].s[0]=.70; // Sturdy barrel, within its own collider.
      for(const i of[12,15]){parts[i].p[1]=2.045;parts[i].s[1]=.16;parts[i].s[0]=.085;}
      parts[5].s[0]=.13;parts[6].s[0]=.12;parts[8].s[1]=.12; // Short erect mane.
    }
    return parts;
  }
  function node(model,name,parent,p,kind='fixed',side=0){
    const n={name,parent,p,kind,side};model.nodes.push(n);model.names[name]=model.nodes.length-1;return n;
  }
  function assign(parts,indexes,group){for(const i of indexes)parts[i].group=group;}
  function leg(model,index,footIndex,name,front=true){
    const part=model.parts[index],foot=model.parts[footIndex],top=part.p[1]+part.s[1]/2,ankle=foot.p[1]+(foot.groundFoot?foot.s[1]/2:0),length=(top-ankle)/2;
    const upper=node(model,name+'Upper',0,[part.p[0],top,part.p[2]],'leg',Math.sign(part.p[0]));
    upper.front=front;upper.length=length;upper.ankleY=ankle;upper.footZ=foot.p[2]-part.p[2];
    const lower=node(model,name+'Lower',model.names[name+'Upper'],[part.p[0],top-length,part.p[2]],'knee');
    upper.lower=model.names[name+'Lower'];if(foot.groundFoot){foot.supportLeg=model.names[name+'Upper'];upper.footIndex=footIndex;}part.group=name+'Upper';part.p[1]=top-length/2;part.s[1]=length;
    const lowerSize=part.s.slice();if(foot.groundFoot){lowerSize[0]=Math.min(lowerSize[0],foot.s[1]*1.5);lowerSize[2]=Math.min(lowerSize[2],foot.s[1]*1.5);}
    model.parts.push({...part,name:part.name?part.name+'-lower':undefined,p:[part.p[0],top-length*1.5,part.p[2]],s:lowerSize,group:name+'Lower'});foot.group=name+'Lower';
  }
  function compileModel(model){
    for(let i=0;i<model.parts.length;i++){
      const p=model.parts[i];p.node=model.names[p.group]??0;p.name=p.name||p.group+'-'+i;
      p.blink=p.blink===true||(p.s[1]<.10&&p.p[1]>.5&&p.tint[0]<.13&&p.tint[1]<.14);
      p.burnSkin=model.type==='walker'&&p.tint[0]===.45&&p.tint[1]===.63;
    }
    modelGenerations++;return model;
  }
  // Cached regional coats. Box partitions preserve the original exact solid envelope.
  const ANIMAL_MODEL_CACHE=new Map();
  const COAT_PALETTES={
    pig:[[[.22,.17,.15],[.91,.85,.76],[.66,.43,.36]],[[.73,.39,.21],[.26,.18,.14],[.89,.64,.44]],[[.88,.79,.65],[.20,.18,.17],[.62,.43,.35]]],
    sheep:[[[.20,.21,.22],[.87,.84,.73],[.40,.34,.28]],[[.40,.29,.21],[.90,.83,.66],[.24,.20,.18]],[[.79,.76,.65],[.24,.27,.28],[.42,.39,.33]]],
    cow:[[[.29,.16,.11],[.92,.86,.72],[.49,.29,.20]],[[.82,.67,.46],[.28,.17,.12],[.63,.43,.28]],[[.25,.27,.28],[.87,.86,.78],[.45,.42,.36]]],
    chicken:[[[.61,.29,.13],[.89,.66,.30],[.27,.20,.16]],[[.22,.25,.27],[.83,.82,.72],[.39,.43,.43]],[[.85,.69,.43],[.35,.25,.17],[.67,.40,.20]]],
    rabbit:[[[.89,.87,.80],[.30,.28,.27],[.74,.68,.59]],[[.35,.39,.42],[.85,.83,.73],[.52,.53,.50]],[[.66,.39,.21],[.92,.80,.60],[.31,.23,.17]]],
    wolf:[[[.76,.73,.64],[.30,.31,.29],[.91,.87,.76]],[[.31,.34,.36],[.76,.75,.65],[.54,.56,.54]],[[.63,.53,.40],[.25,.28,.27],[.85,.80,.65]]],
    cat:[[[.14,.16,.18],[.91,.88,.79],[.36,.39,.42]],[[.89,.81,.65],[.30,.23,.19],[.64,.44,.25]],[[.90,.87,.79],[.73,.37,.16],[.20,.22,.24]]],
    badger:[[[.58,.56,.50],[.95,.92,.83],[.19,.18,.17]],[[.31,.34,.36],[.88,.89,.84],[.08,.10,.12]],[[.51,.45,.38],[.91,.86,.73],[.20,.17,.14]]],
    boar:[[[.20,.21,.22],[.46,.40,.33],[.11,.13,.14]],[[.56,.32,.18],[.71,.50,.31],[.29,.20,.15]],[[.54,.51,.43],[.70,.65,.52],[.28,.27,.23]]],
    camel:[[[.82,.68,.45],[.95,.84,.61],[.54,.40,.25]],[[.43,.29,.18],[.68,.48,.30],[.27,.20,.15]],[[.66,.62,.52],[.84,.80,.68],[.43,.39,.31]]],
    bear:[[[.68,.47,.25],[.84,.67,.42],[.40,.29,.18]],[[.19,.21,.22],[.51,.46,.38],[.12,.14,.15]],[[.85,.82,.72],[.95,.91,.80],[.47,.43,.35]]],
    hedgehog:[[[.62,.49,.31],[.86,.76,.56],[.29,.24,.19]],[[.26,.28,.28],[.71,.72,.65],[.13,.16,.17]],[[.80,.74,.61],[.94,.88,.75],[.46,.39,.30]]],
    duck:[[[.91,.90,.83],[.89,.88,.78],[.83,.80,.68]],[[.49,.37,.25],[.40,.30,.20],[.66,.51,.33]],[[.20,.24,.25],[.15,.22,.20],[.85,.83,.72]]],
    tortoise:[[[.25,.28,.27],[.62,.58,.41],[.43,.47,.37]],[[.61,.43,.22],[.84,.70,.39],[.54,.44,.28]],[[.34,.41,.27],[.21,.29,.20],[.66,.62,.37]]],
    goat:[[[.35,.24,.17],[.86,.78,.62],[.18,.16,.14]],[[.23,.25,.26],[.84,.83,.76],[.42,.44,.42]],[[.62,.38,.21],[.94,.88,.72],[.28,.20,.16]]],
    fox:[[[.81,.78,.65],[.35,.39,.40],[.94,.90,.77]],[[.32,.35,.37],[.80,.80,.71],[.17,.18,.18]],[[.76,.38,.16],[.27,.23,.20],[.93,.83,.62]]],
    deer:[[[.45,.24,.13],[.92,.84,.65],[.24,.17,.12]],[[.55,.56,.51],[.23,.27,.25],[.85,.83,.70]],[[.25,.22,.19],[.94,.88,.73],[.58,.45,.29]]],
    horse:[[[.28,.18,.13],[.91,.86,.73],[.13,.12,.11]],[[.79,.62,.37],[.96,.89,.70],[.39,.29,.17]],[[.66,.68,.64],[.29,.30,.29],[.17,.18,.17]]]
  };
  function applyCoatVariant(parts,type,variant,sheared){
    if(!variant||!COAT_PALETTES[type])return;
    const [coat,mark,accent]=COAT_PALETTES[type][variant-1];
    const paint=(indices,tint)=>{for(const i of indices){parts[i].tint=tint;parts[i].id=20;}};
    const legs=(tint,lower=false)=>{for(const p of parts)if(p.group.startsWith('leg')&&(!lower||p.group.endsWith('Lower'))){p.tint=tint;p.id=20;}};
    const band=(index,axis,lo,hi,tint)=>{
      const p=parts[index],start=p.p[axis]-p.s[axis]/2,edges=[0,lo,hi,1],rows=[];
      for(let i=0;i<3;i++){const row={...p,name:'coat-'+index+'-'+i,p:p.p.slice(),s:p.s.slice(),tint:i===1?tint:p.tint};row.p[axis]=start+p.s[axis]*(edges[i]+edges[i+1])/2;row.s[axis]=p.s[axis]*(edges[i+1]-edges[i]);rows.push(row);}
      parts[index]=rows[0];parts.push(rows[1],rows[2]);
    };
    if(type==='pig'){
      paint([0,1,3,6,17],coat);legs(coat);paint([2],accent);
      band(0,variant===2?0:2,variant===3?.06:.35,variant===3?.32:.65,mark);
      if(variant===3)paint([1,3,6],mark);
    }else if(type==='sheep'){
      const offset=sheared?0:1;paint([0],sheared?accent:coat);paint([1,2+offset,3+offset,6+offset],mark);legs(mark);
      if(!sheared)paint([2,18],coat);else paint([17],accent);
      if(variant===2)band(0,2,.12,.40,mark);else if(variant===3&&!sheared)band(0,2,.58,.86,mark);
    }else if(type==='cow'){
      paint([0,1,24],coat);legs(coat);paint([3,4,8,9,13,14,25],mark);paint([2],accent);
      band(0,variant===2?0:2,.32,.68,mark);if(variant!==2)legs(mark,true);
    }else if(type==='chicken'){
      paint([0,1],coat);paint([5,6,10],mark);band(0,1,.08,.38,accent);
      if(variant===2)band(1,0,.27,.73,mark);
    }else if(type==='badger'){
      paint([0,1,2,8],coat);paint([4,5,7,10,15],mark);paint([3,9,12,13,14,17,18],accent);legs(accent);paint([27],coat.map(x=>Math.min(.95,x*1.18)));
    }else if(type==='boar'){
      paint([0,2,4,8,9,15],coat);paint([1,3,32],coat.map(x=>Math.min(.95,x*1.12)));paint([5,7,10,16],mark);paint([6,12,18,29,30,31],accent);legs(coat);paint([22,24,26,28],accent);
    }else if(type==='camel'){
      paint([0,1,4,5,9,12,15,18,23],coat);paint([2,3,11,14],coat.map(x=>x*.84));paint([6,8,13,16,19,24,36],mark);paint([7,10,17,21,26],accent);legs(coat);paint([29,31,33,35],accent);
    }else if(type==='bear'){
      paint([0,2,3,8,10,14],coat);paint([1,4,26],coat.map(x=>Math.min(.97,x*1.12)));paint([5,7,9,27],mark);paint([11,12,15,16],accent);legs(coat);paint([19,21,23,25],accent);
    }else if(type==='hedgehog'){
      paint([0,1],coat);paint([2,3,4,6,7,10],mark);legs(mark);paint([14,16,18,20],accent);for(let i=21;i<=50;i++)paint([i],i%2?accent:mark);
    }else if(type==='duck'){
      paint([0,8,14],coat);paint([2,3],mark);paint([1],accent);paint([6,7],coat.map(x=>x*.68));
      if(variant===2){band(0,2,.25,.55,accent);paint([20],accent);}
      else if(variant===3){band(0,1,.05,.35,accent);paint([20],accent);}
    }else if(type==='tortoise'){
      paint([0],coat);paint([1],coat.map(x=>Math.min(.95,x*1.15)));paint([2],coat.map(x=>Math.min(.95,x*1.28)));
      paint([3],mark);paint([4,5,7],accent);paint([6],accent.map(x=>x*.82));legs(accent);paint([18,19,20,21,22,23],mark);
    }else if(type==='rabbit'){
      paint([0,1,5,10],coat);paint([2,4],mark);legs(coat);
      band(0,2,variant===1?.08:.52,variant===1?.38:.88,mark);if(variant!==3)band(1,0,.28,.72,mark);
    }else if(type==='wolf'){
      paint([0,1,2,6],coat);legs(coat);paint([3],accent);paint([5,7,8,11],mark);
      band(0,1,.56,.96,mark);if(variant!==1)legs(accent,true);
    }else if(type==='fox'){
      paint([0,1,2,7,9,12],coat);paint([3,5,6,8],variant===2?mark:accent);paint([10,13],mark);legs(mark);
      if(variant===3)band(0,1,.63,.96,mark);else band(7,2,.60,.93,variant===1?mark:accent);
    }else if(type==='goat'){
      paint([0,1,2,7,9,14],coat);paint([3,5,10,15,36],mark);paint([4,6,8,35],accent);legs(coat);paint([28,30,32,34],[.22,.20,.17]);
      if(variant===1)band(0,2,.18,.52,mark);
      else if(variant===2){band(0,1,.08,.35,mark);paint([2,36],mark);}
      else{band(0,2,.18,.48,mark);band(0,0,.55,.90,accent);paint([1,9],mark);}
    }else if(type==='cat'){
      paint([0,1,2,7,9,14],coat);paint([3,5,6,8,13,18],mark);paint([27,28],accent);legs(coat);
      if(variant===1){legs(mark,true);band(0,1,.05,.40,mark);}
      else if(variant===2){paint([2,3,8,9,14],mark);legs(mark,true);paint([27,28],accent);}
      else{band(0,2,.20,.48,mark);band(0,0,.55,.90,accent);paint([2,9,7],mark);paint([14,8],accent);legs(accent,true);}
    }else if(type==='deer'){
      paint([0,1,2,3,8,10,14],coat);legs(coat);paint([31,33,35,37],[.21,.17,.14]);
      paint(Array.from({length:12},(_,i)=>i+38),variant===1?coat:variant===2?accent:mark);
      if(variant===1)band(0,2,.12,.36,mark);else if(variant===2)band(0,1,.56,.94,mark);else{band(0,0,.50,.90,mark);band(2,0,.36,.64,mark);}
      paint([3],accent);
    }else if(type==='horse'){
      paint([0,1,2,3,4,12,15],coat);legs(coat);paint([5,6,7,8,10,11],accent);paint([9],mark);
      if(variant===1)band(0,2,.24,.67,mark);else if(variant===3)band(0,0,.55,.88,mark);
      legs(mark,true);if(variant===2)band(3,0,.37,.63,mark);
    }
  }
  function applyZebraPattern(parts,variant){
    const coats=[[.91,.90,.84],[.97,.94,.84],[.78,.81,.81],[.88,.81,.68]];
    const stripes=[[.09,.10,.11],[.17,.15,.13],[.075,.095,.11],[.22,.19,.16]];
    const light=coats[variant],dark=stripes[variant];
    for(const p of parts){p.tint=light;p.id=20;}
    for(const i of[4,5,6,7,8,10,11,13,14,16,17,19,21,23,25,26,27,28,29])parts[i].tint=dark;
    const partition=(index,axis,count,offset=0)=>{
      const p=parts[index],start=p.p[axis]-p.s[axis]/2;
      const pieces=[];for(let j=0;j<count;j++){
        const q={...p,name:'zebra-stripe-'+index+'-'+j,p:p.p.slice(),s:p.s.slice(),tint:(j+offset)%2?dark:light};
        q.p[axis]=start+p.s[axis]*(j+.5)/count;q.s[axis]=p.s[axis]/count;pieces.push(q);
      }
      parts[index]=pieces[0];parts.push(...pieces.slice(1));
    };
    // Partition whole solid boxes, avoiding floating decals and coplanar stripe faces.
    partition(0,2,7,variant===2?1:0);
    partition(1,1,5,variant===3?1:0);partition(2,1,3,0);partition(3,2,3,1);
    for(const i of[18,20,22,24])partition(i,1,3,variant===1?1:0);
  }
  /* C16_CREATURE_SILHOUETTES_V1_BEGIN
     Pure cached render definitions. Existing species/variant IDs, motors,
     collision, random state, serialization and pose clocks are unchanged. */
  function c16ReshapeAnimalParts(parts,type,variant){
    if(!variant)return;
    const shape=(i,p,s)=>{parts[i].p=p;parts[i].s=s;};
    if(type==='pig'){
      const ears=variant===1?[true,true]:variant===2?[false,true]:[false,false];
      for(let side=0;side<2;side++){
        const sign=side?1:-1,i=side?6:3;
        if(ears[side])shape(i,[sign*.225,.925,-.60],[.23,.10,.14]);
        else if(variant===3)shape(i,[sign*.205,1.005,-.58],[.16,.21,.13]);
      }
      const widths=[.30,.26,.34,.38],heights=[.19,.16,.20,.22],ys=[.65,.64,.65,.66];
      parts[2].s=[widths[variant],heights[variant],.12];parts[2].p[1]=ys[variant];
      for(let side=0;side<2;side++){const p=parts[side?8:5];p.p[0]=(side?1:-1)*widths[variant]*.25;p.p[1]=ys[variant]+.01;}
    }else if(type==='rabbit'){
      for(let side=0;side<2;side++){
        const sign=side?1:-1,i=side?10:5,ear=parts[i],inset=parts[i+1];
        if(variant===1)shape(i,[sign*.105,.75,-.20],[.14,.24,.10]);
        else if(variant===2)shape(i,[sign*.14,.625,-.20],[.24,.105,.10]);
        else{const h=side?.38:.34;shape(i,[sign*.13,.63+h/2,-.20],[side?.10:.12,h,.09]);}
        inset.p=[ear.p[0],ear.p[1],ear.p[2]-ear.s[2]/2-.006];
        inset.s=[ear.s[0]*.52,ear.s[1]*.76,.014];
      }
    }else if(type==='goat'){
      const horns=[
        null,
        [[.105,1.34,-.39,.065,.13,.065],[.11,1.455,-.35,.065,.14,.09],[.115,1.575,-.30,.06,.12,.10],[.12,1.64,-.24,.05,.07,.09]],
        [[.105,1.34,-.39,.065,.13,.065],[.17,1.42,-.37,.14,.10,.09],[.255,1.46,-.32,.11,.08,.11],[.305,1.43,-.255,.08,.08,.095]],
        [[.105,1.34,-.39,.065,.13,.065],[.12,1.43,-.42,.075,.105,.12],[.13,1.47,-.515,.07,.08,.13],[.13,1.415,-.59,.06,.09,.09]]
      ][variant];
      for(let side=0;side<2;side++)for(let j=0;j<4;j++){const[x,y,z,w,h,d]=horns[j];shape(19+side*4+j,[(side?1:-1)*x,y,z],[w,h,d]);}
      const beard=[[.13,.22],[.10,.14],[.17,.28],[.14,.35]][variant];
      shape(6,[0,1.03-beard[1]/2,-.65],[beard[0],beard[1],.10]);
    }
  }
  function c16AddSheepDetails(parts,variant,sheared){
    const add=(name,p,s,tint,group)=>parts.push({name,p,s,tint:tint.slice(),id:20,emissive:0,group});
    if(!sheared){
      const wool=parts[0].tint;
      const lobes=[
        [[-.10,.66,.12,.28],[.20,.76,.16,.28],[.47,.60,.12,.24]],
        [[-.10,.64,.095,.28],[.20,.70,.11,.28],[.47,.58,.095,.24]],
        [[-.16,.74,.10,.18],[.05,.78,.11,.20],[.28,.70,.13,.20],[.50,.62,.11,.18]],
        [[-.10,.54,.15,.28],[.20,.64,.11,.28],[.47,.50,.17,.24]]
      ][variant];
      for(let i=0;i<lobes.length;i++){
        const[z,w,h,d]=lobes[i],tint=wool.map(c=>Math.min(1,c*(i%2?1.025:.98)));
        add('c16-sheep-fleece-'+i,[0,1.08+h/2-.025,z],[w,h,d],tint,'body');
      }
    }
    if(variant!==1&&variant!==3)return;
    const horn=variant===1?[.70,.58,.38]:[.38,.31,.22],tip=variant===1?[.84,.74,.54]:[.60,.51,.36];
    const profile=variant===1?
      [[.22,1.12,-.70,.10,.12,.12],[.30,1.18,-.73,.12,.11,.12],[.375,1.10,-.76,.11,.17,.13],[.35,.985,-.80,.10,.12,.13],[.285,.97,-.835,.11,.08,.12]]:
      [[.215,1.10,-.66,.09,.12,.11],[.27,1.18,-.60,.10,.10,.14],[.33,1.17,-.51,.12,.09,.12],[.36,1.12,-.42,.08,.10,.12]];
    for(let side=0;side<2;side++)for(let i=0;i<profile.length;i++){
      const[x,y,z,w,h,d]=profile[i];
      add('c16-sheep-horn-'+side+'-'+i,[(side?1:-1)*x,y,z],[w,h,d],i===profile.length-1?tip:horn,'head');
    }
  }
  /* C16_CREATURE_SILHOUETTES_V1_END */
  /* C17 visual variants. This cache-time pass changes render parts only.
     Existing rig nodes, simulation, collision, saves and random state remain intact. */
  function c17RefineAnimalParts(parts,type,variant){
    if(!variant||!['cow','deer','horse','chicken'].includes(type))return;
    const shape=(i,p,s)=>{parts[i].p=p;parts[i].s=s;};
    const add=(name,p,s,tint,group)=>parts.push({name:'c17-'+type+'-'+name,p,s,tint:tint.slice(),id:20,emissive:0,group});
    if(type==='cow'){
      const horn=parts[5].tint,tip=horn.map(c=>Math.min(1,c*1.10)),coat=parts[0].tint;
      for(let j=0;j<2;j++){
        const sign=j?1:-1,ear=j?9:4,h=j?10:5;
        if(variant===1){
          shape(ear,[sign*.32,1.22,-.45],[.21,.10,.16]);
          shape(h,[sign*.20,1.335,-.48],[.16,.075,.11]);
          add('horn-'+j+'-out',[sign*.32,1.355,-.48],[.12,.065,.10],horn,'head');
          add('horn-'+j+'-tip',[sign*.365,1.405,-.48],[.07,.10,.075],tip,'head');
        }else if(variant===2){
          shape(ear,[sign*.32,1.15,-.45],[.20,.18,.16]);
          shape(h,[sign*.17,1.335,-.48],[.08,.065,.09]);
        }else{
          shape(ear,[sign*.32,1.25,-.45],[.16,.13,.16]);
          shape(h,[sign*.18,1.34,-.48],[.09,.14,.10]);
          add('horn-'+j+'-forward',[sign*.18,1.405,-.55],[.085,.075,.18],horn,'head');
          add('horn-'+j+'-tip',[sign*.18,1.395,-.655],[.07,.08,.075],tip,'head');
        }
      }
      if(variant===2){
        add('brisket-root',[0,.53,-.315],[.30,.16,.23],coat,'body');
        add('brisket-tip',[0,.44,-.35],[.20,.13,.14],coat,'body');
        shape(25,[0,.61,.69],[.07,.28,.10]);
      }else if(variant===1)shape(25,[0,.60,.69],[.15,.28,.10]);
      else{
        add('brisket',[0,.55,-.35],[.24,.12,.17],coat,'body');
        shape(25,[0,.63,.69],[.18,.24,.10]);
      }
    }else if(type==='deer'){
      for(let side=0;side<2;side++){
        const sign=side?1:-1,first=18+side*6;
        const rows=variant===1?[
          [.10,1.98,-.46,.065,.33,.065],
          [.185,2.145,-.45,.22,.065,.065],
          [.245,2.31,-.45,.065,.33,.065],
          [.13,2.275,-.45,.055,.25,.065],
          [.185,2.17,-.36,.065,.065,.24],
          [.185,2.32,-.27,.065,.30,.065]
        ]:variant===2?[
          [.10,1.96,-.46,.07,.30,.075],
          [.23,2.10,-.45,.32,.08,.08],
          [.355,2.20,-.45,.07,.23,.075],
          [.13,2.19,-.45,.07,.20,.075],
          [.25,2.10,-.31,.075,.075,.30],
          [.25,2.20,-.20,.075,.22,.075]
        ]:[
          [.10,1.97,-.46,.07,.32,.075],
          [.24,2.14,-.45,.29,.16,.12],
          [.35,2.30,-.45,.07,.22,.08],
          [.16,2.295,-.45,.075,.23,.08],
          [.24,2.15,-.32,.16,.12,.28],
          [.24,2.30,-.23,.085,.24,.085]
        ];
        rows.forEach((r,k)=>shape(first+k,[sign*r[0],r[1],r[2]],r.slice(3)));
      }
    }else if(type==='horse'){
      const hair=parts[5].tint,knots=hair.map(c=>Math.min(1,c*1.16));
      if(variant===1){
        shape(5,[0,1.40,-.185],[.10,.60,.075]);
        shape(6,[0,1.75,-.35],[.10,.30,.08]);
        shape(7,[0,1.60,-.27],[.10,.17,.15]);
        shape(8,[0,1.99,-.70],[.12,.12,.22]);
        shape(10,[0,1.07,.80],[.16,.30,.22]);
        shape(11,[0,.82,.89],[.18,.30,.18]);
        [1.38,1.53,1.68].forEach((y,i)=>add('short-mane-'+i,[0,y,-.15],[.11,.18,.10],hair,'body'));
      }else if(variant===2){
        shape(5,[-.13,1.38,-.22],[.15,.64,.16]);
        shape(6,[-.12,1.73,-.37],[.16,.32,.12]);
        shape(7,[-.13,1.57,-.26],[.16,.25,.18]);
        shape(8,[-.055,1.96,-.83],[.20,.16,.30]);
        shape(10,[0,1.04,.80],[.22,.46,.26]);
        shape(11,[0,.68,.92],[.24,.62,.17]);
        add('mane-lock-upper',[-.22,1.31,-.35],[.12,.30,.16],hair,'body');
        add('mane-lock-lower',[-.22,1.12,-.28],[.10,.22,.17],hair,'body');
        add('head-mane-lock',[-.205,1.72,-.53],[.085,.27,.12],hair,'head');
      }else{
        shape(5,[0,1.38,-.185],[.10,.62,.07]);
        shape(6,[0,1.74,-.35],[.095,.30,.07]);
        shape(7,[0,1.60,-.26],[.10,.15,.14]);
        shape(8,[0,1.98,-.70],[.11,.10,.22]);
        shape(10,[0,1.07,.80],[.11,.40,.22]);
        shape(11,[0,.71,.92],[.095,.54,.13]);
        [1.39,1.53,1.67].forEach((y,i)=>add('mane-knot-'+i,[0,y,-.16],[.13,.13,.10],knots,'body'));
        [.84,.68,.52].forEach((y,i)=>add('tail-braid-'+i,[0,y,.94],[.15,.12,.15],knots,'tailTip'));
      }
    }else{
      const comb=parts[2].tint,feather=parts[5].tint,crest=parts[1].tint;
      if(variant===1){
        shape(2,[0,.875,-.23],[.22,.10,.24]);
        [-.07,0,.07].forEach((x,i)=>add('rose-comb-'+i,[x,.94,-.23],[.07,.06,.15],comb,'head'));
        shape(5,[0,.55,.34],[.25,.28,.18]);
        for(const side of[-1,1])add('fan-side-'+side,[side*.105,.66,.35],[.09,.28,.17],feather,'tail');
        add('fan-center',[0,.72,.35],[.09,.30,.18],feather,'tail');
      }else if(variant===2){
        shape(2,[0,.88,-.23],[.08,.12,.24]);
        [[-.31,.96,.08],[-.23,.975,.09],[-.15,.955,.08]].forEach((r,i)=>add('comb-tine-'+i,[0,r[1],r[0]],[.08,r[2],.065],comb,'head'));
        shape(5,[0,.50,.34],[.21,.20,.18]);
        for(const side of[-1,1])add('low-tail-'+side,[side*.07,.56,.38],[.10,.20,.13],feather,'tail');
        add('low-tail-center',[0,.60,.385],[.10,.24,.12],feather,'tail');
        for(const i of[6,10])shape(i,[parts[i].p[0],.43,.04],[.08,.34,.34]);
      }else{
        shape(2,[0,.86,-.335],[.09,.08,.07]);
        for(const side of[-1,1])add('crest-base-'+side,[side*.06,.905,-.19],[.14,.15,.19],crest,'head');
        add('crest-top',[0,.975,-.19],[.11,.085,.14],crest,'head');
        shape(5,[0,.57,.33],[.14,.34,.18]);
        for(const side of[-1,1])add('upright-tail-'+side,[side*.04,.72,.35],[.065,.26,.14],feather,'tail');
        add('upright-tail-top',[0,.79,.35],[.06,.20,.14],feather,'tail');
      }
    }
  }

  /* C18_CREATURE_SILHOUETTES_V1_BEGIN
     Cached visual variants for four existing species. Variant zero, rig nodes,
     feet, simulation, collisions, saves and random state remain unchanged. */
  function c18RefineAnimalParts(parts,type,variant){
    if(!variant||!['duck','tortoise','bear','hedgehog'].includes(type))return;
    const shape=(i,p,s)=>{parts[i].p=p;parts[i].s=s;};
    const add=(name,p,s,tint,group)=>parts.push({name:'c18-'+type+'-'+name,p,s,tint:tint.slice(),id:20,emissive:0,group});
    if(type==='duck'){
      const head=parts[3].tint,tail=parts[6].tint;
      if(variant===1){
        add('round-crest-base',[0,1.002,-.335],[.25,.14,.24],head,'head');
        add('round-crest-top',[0,1.088,-.335],[.16,.08,.18],head,'head');
        shape(4,[0,.77,-.58],[.31,.07,.20]);
        shape(5,[0,.758,-.687],[.29,.014,.018]);
        shape(6,[0,.57,.44],[.33,.18,.20]);
        for(const side of[-1,1])add('fan-'+side,[side*.105,.64,.46],[.11,.20,.16],tail,'tail');
      }else if(variant===2){
        shape(4,[0,.765,-.594],[.33,.062,.18]);
        shape(5,[0,.752,-.687],[.31,.016,.018]);
        shape(6,[0,.57,.455],[.21,.16,.20]);
        add('swept-crest-base',[0,.972,-.25],[.18,.10,.22],head,'head');
        add('swept-crest-tip',[0,1.02,-.18],[.11,.08,.15],head,'head');
        add('narrow-tail-tip',[0,.655,.485],[.14,.13,.14],tail,'tail');
      }else{
        shape(3,[0,.85,-.36],[.31,.34,.32]);
        shape(4,[0,.78,-.57],[.24,.09,.21]);
        shape(5,[0,.767,-.684],[.22,.018,.024]);
        add('upright-crest-base',[0,1.05,-.29],[.17,.13,.22],head,'head');
        add('upright-crest-tip',[0,1.13,-.245],[.11,.065,.14],head,'head');
        shape(6,[0,.58,.445],[.26,.18,.20]);
        add('upright-tail-tip',[0,.69,.47],[.14,.17,.16],tail,'tail');
      }
    }else if(type==='tortoise'){
      const rim=parts[0].tint,crown=parts[2].tint;
      if(variant===1){
        shape(1,[0,.505,.04],[.62,.30,.68]);
        shape(2,[0,.665,.04],[.40,.18,.44]);
        for(let j=0;j<6;j++)shape(18+j,[(j<3?-1:1)*.105,.757,[-.10,.04,.18][j%3]],[.15,.018,.10]);
        for(const side of[-1,1])for(let j=0;j<3;j++)add('high-dome-rim-'+side+'-'+j,[side*.34,.37,[-.20,.04,.28][j]],[.09,.09,.18],rim,'body');
      }else if(variant===2){
        shape(0,[0,.29,.04],[.78,.27,.84]);
        shape(1,[0,.43,.04],[.66,.18,.72]);
        shape(2,[0,.53,.04],[.48,.09,.50]);
        for(let j=0;j<6;j++)shape(18+j,[(j<3?-1:1)*.12,.581,[-.10,.04,.18][j%3]],[.17,.018,.11]);
        for(const side of[-1,1]){
          add('front-shell-rise-'+side,[side*.24,.49,-.28],[.18,.12,.24],crown,'body');
          for(let j=0;j<3;j++)add('broad-rim-'+side+'-'+j,[side*.355,.30,[-.21,.04,.29][j]],[.10,.10,.18],rim,'body');
        }
      }else{
        shape(1,[0,.455,.04],[.61,.24,.70]);
        shape(2,[0,.59,.04],[.30,.16,.54]);
        for(let j=0;j<6;j++)shape(18+j,[(j<3?-1:1)*.095,.672,[-.10,.04,.18][j%3]],[.13,.016,.11]);
        for(let j=0;j<3;j++){const h=j===1?.10:.06;add('central-keel-'+j,[0,.658+h/2,[-.13,.04,.21][j]],[j===1?.15:.12,h,.20],crown,'body');}
        for(const side of[-1,1])for(let j=0;j<2;j++)add('angular-shell-side-'+side+'-'+j,[side*.29,.50,j? .20:-.16],[.10,.10,.26],rim,'body');
      }
    }else if(type==='bear'){
      const fur=parts[0].tint,shoulder=parts[1].tint,muzzle=parts[5].tint;
      for(let j=0;j<2;j++){
        const side=j?1:-1,ear=j?14:10,inset=j?15:11,group='ear'+j;
        if(variant===1){
          shape(ear,[side*.17,1.405,-.57],[.22,.14,.16]);
          shape(inset,[side*.17,1.413,-.656],[.13,.075,.021]);
          add('low-ear-cap-'+j,[side*.17,1.49,-.57],[.14,.07,.14],fur,group);
        }else if(variant===2){
          shape(ear,[side*.17,1.44,-.57],[.19,.21,.15]);
          shape(inset,[side*.17,1.445,-.65],[.11,.135,.021]);
          add('high-ear-cap-'+j,[side*.17,1.565,-.57],[.13,.06,.13],fur,group);
          add('cheek-ruff-'+j,[side*.245,1.12,-.63],[.12,.28,.26],fur,'head');
        }else{
          shape(ear,[side*.17,1.395,-.57],[.12,.12,.13]);
          shape(inset,[side*.17,1.397,-.641],[.065,.065,.018]);
          add('broad-muzzle-cheek-'+j,[side*.19,1.10,-.77],[.16,.19,.10],muzzle,'head');
        }
      }
      if(variant===1){
        add('shoulder-tuft',[0,1.42,-.22],[.68,.22,.40],shoulder,'body');
        for(const side of[-1,1])add('side-fur-'+side,[side*.45,.74,-.20],[.16,.22,.24],fur,'body');
      }else if(variant===2){
        add('chin-ruff',[0,.985,-.60],[.36,.12,.26],fur,'head');
      }else{
        shape(4,[0,1.19,-.60],[.58,.40,.37]);
        shape(5,[0,1.105,-.825],[.38,.19,.18]);
        shape(6,[0,1.155,-.923],[.28,.11,.025]);
        shape(7,[0,1.01,-.79],[.34,.07,.20]);
      }
    }else{
      for(let j=0;j<2;j++){
        const side=j?1:-1,ear=j?10:7,inset=j?11:8,group='ear'+j,face=parts[ear].tint;
        if(variant===1){
          shape(ear,[side*.15,.42,-.23],[.14,.11,.10]);
          shape(inset,[side*.15,.425,-.286],[.085,.06,.016]);
        }else if(variant===2){
          shape(ear,[side*.15,.49,-.23],[.12,.25,.09]);
          shape(inset,[side*.15,.492,-.28],[.065,.17,.015]);
          add('long-ear-tip-'+j,[side*.15,.62,-.23],[.07,.06,.075],face,group);
        }else{
          shape(ear,[side*.15,.45,-.23],[.15,.17,.10]);
          shape(inset,[side*.15,.455,-.286],[.085,.105,.016]);
          add('round-ear-cap-'+j,[side*.15,.545,-.23],[.10,.05,.085],face,group);
        }
      }
      for(let j=0;j<15;j++){
        const shaft=parts[21+j*2],tip=parts[22+j*2],x=shaft.p[0],z=shaft.p[2],rootY=shaft.p[1]-shaft.s[1]/2;
        const height=variant===1?(Math.abs(x)<.05?.24:Math.abs(x)<.15?.20:.13):variant===2?(Math.abs(x)<.05?.13:Math.abs(x)<.15?.11:.085):(z>.20?.205:z>0?.155:.105)+(Math.abs(x)<.05?.025:0);
        const width=variant===1?.050:variant===2?.060:.065,tipSize=variant===3?.040:.030,back=variant===3?.008:0;
        shape(21+j*2,[x,rootY+height/2-.008,z+back],[width,height,width]);
        shape(22+j*2,[x,rootY+height-.008+tipSize/2-.010,z+(variant===3?.028:0)],[variant===3?.040:.033,tipSize,variant===3?.040:.033]);
      }
    }
  }
  /* C18_CREATURE_SILHOUETTES_V1_END */

  /* C19_CREATURE_SILHOUETTES_V1_BEGIN
     Cache-time art variants. Reference variants, rig pivots, feet, simulation,
     collisions, saves and random state remain byte-identical to C18. */
  function c19RefineAnimalParts(parts,type,variant){
    if(!variant||!['boar','camel','zebra','badger'].includes(type))return;
    const shape=(i,p,s)=>{parts[i].p=p;parts[i].s=s;};
    const add=(name,p,s,tint,group)=>parts.push({name:'c19-'+type+'-'+name,p,s,tint:tint.slice(),id:20,emissive:0,group});
    if(type==='boar'){
      const coat=parts[0].tint,shoulder=parts[1].tint,tusk=parts[13].tint;
      for(let j=0;j<2;j++){
        const side=j?1:-1,ear=j?15:9,inset=j?16:10,root=j?19:13,tip=j?20:14;
        if(variant===1){
          shape(ear,[side*.19,.80,-.55],[.20,.17,.15]);
          shape(inset,[side*.19,.80,-.632],[.12,.095,.018]);
          add('shoulder-coat-'+j,[side*.29,.68,-.29],[.14,.40,.38],shoulder,'body');
        }else if(variant===2){
          shape(ear,[side*.19,.785,-.55],[.17,.15,.15]);
          shape(inset,[side*.19,.79,-.632],[.10,.08,.018]);
          add('rounded-ear-cap-'+j,[side*.19,.878,-.55],[.115,.06,.13],coat,'ear'+j);
          shape(root,[side*.15,.425,-.79],[.055,.09,.07]);
          shape(tip,[side*.16,.48,-.80],[.05,.08,.05]);
          add('cheek-coat-'+j,[side*.19,.54,-.49],[.10,.25,.18],coat,'head');
        }else{
          shape(ear,[side*.19,.86,-.55],[.13,.29,.13]);
          shape(inset,[side*.19,.87,-.622],[.075,.18,.018]);
          shape(root,[side*.145,.43,-.80],[.07,.12,.07]);
          shape(tip,[side*.20,.485,-.81],[.10,.075,.065]);
          add('upturned-tusk-tip-'+j,[side*.25,.555,-.81],[.06,.10,.055],tusk,'head');
        }
      }
      if(variant===1){
        shape(29,[0,1.015,-.29],[.20,.18,.30]);
        shape(30,[0,.955,-.02],[.18,.22,.30]);
        shape(31,[0,.855,.25],[.14,.16,.28]);
      }else if(variant===2){
        shape(29,[0,1.015,-.27],[.22,.17,.38]);
        add('tapered-shoulder-bristles',[0,1.105,-.27],[.13,.075,.24],parts[29].tint,'body');
        shape(30,[0,.915,-.01],[.14,.14,.28]);
        shape(31,[0,.845,.23],[.10,.07,.24]);
      }else{
        shape(29,[0,.995,-.28],[.10,.14,.24]);
        shape(30,[0,.905,-.02],[.09,.14,.30]);
        shape(31,[0,.84,.24],[.08,.12,.26]);
      }
    }else if(type==='camel'){
      const coat=parts[0].tint,mane=parts[17].tint;
      for(let j=0;j<2;j++){
        const z=j?.48:-.23,base=j?14:11,cap=base+1,crest=base+2;
        if(variant===1){
          shape(base,[0,1.74,z],[.70,.31,.52]);
          shape(cap,[0,1.94,z],[.50,.14,.38]);
          shape(crest,[0,2.035,z],[.30,.07,.24]);
        }else if(variant===2){
          shape(base,[0,1.81,z],[.60,.44,.48]);
          shape(cap,[0,2.14,z],[.38,.30,.30]);
          shape(crest,[0,2.34,z],[.20,.12,.20]);
        }else{
          shape(base,[0,1.77,z],[.68,.36,.50]);
          shape(cap,[0,2.045,z],[.46,.23,.34]);
          shape(crest,[0,2.20,z],[.29,.11,.22]);
        }
        const side=j?1:-1,ear=j?23:18,inset=j?24:19;
        if(variant===1){
          shape(ear,[side*.24,2.22,-.93],[.17,.18,.12]);
          shape(inset,[side*.24,2.225,-.995],[.10,.10,.016]);
          add('rounded-ear-cap-'+j,[side*.24,2.32,-.93],[.11,.055,.10],coat,'ear'+j);
        }else if(variant===2){
          shape(ear,[side*.24,2.245,-.93],[.14,.13,.12]);
          shape(inset,[side*.24,2.25,-.995],[.08,.07,.016]);
        }
      }
      if(variant===1){
        shape(17,[0,1.86,-1.12],[.16,.13,.16]);
      }else if(variant===2){
        shape(17,[0,1.81,-1.12],[.14,.25,.15]);
        add('upper-neck-mane',[0,1.75,-.605],[.12,.46,.09],mane,'head');
        add('lower-neck-mane',[0,1.48,-.43],[.16,.27,.09],mane,'head');
        add('chin-tip',[0,1.68,-1.12],[.08,.06,.11],mane,'head');
      }else{
        shape(17,[0,1.835,-1.12],[.18,.20,.16]);
        for(let j=0;j<3;j++)add('chest-fringe-'+j,[(j-1)*.11,.91,-.55],[.10,.24,.29],coat,'body');
        for(const side of[-1,1])add('side-coat-'+side,[side*.355,1.16,.12],[.11,.36,.48],coat,'body');
      }
    }else if(type==='zebra'){
      const light=parts[12].tint;
      // Retain seven contiguous solid torso sections; only their widths differ.
      const weights=variant===1?[.12,.13,.12,.18,.14,.16,.15]:variant===2?[.16,.09,.19,.10,.18,.11,.17]:[.14,.07,.24,.08,.19,.10,.18];
      let edge=-.53;
      for(let j=0;j<7;j++){
        const p=parts.find(p=>p.name==='zebra-stripe-0-'+j),depth=weights[j]*1.30;
        p.p[2]=edge+depth/2;p.s[2]=depth;edge+=depth;
      }
      for(let j=0;j<2;j++){
        const side=j?1:-1,ear=j?15:12;
        if(variant===1){
          shape(ear,[side*.12,2.075,-.48],[.105,.22,.12]);
          add('long-ear-cap-'+j,[side*.12,2.195,-.48],[.07,.055,.10],light,'ear'+j);
        }else if(variant===2){
          shape(ear,[side*.12,2.035,-.48],[.12,.14,.13]);
          add('round-ear-cap-'+j,[side*.12,2.12,-.48],[.085,.05,.11],light,'ear'+j);
        }else{
          shape(ear,[side*.145,2.055,-.48],[.14,.18,.13]);
          add('outward-ear-cap-'+j,[side*.145,2.165,-.48],[.10,.06,.11],light,'ear'+j);
        }
      }
      if(variant===1){
        shape(5,[0,1.43,-.175],[.095,.80,.10]);
        shape(6,[0,1.78,-.345],[.085,.42,.09]);
        shape(7,[0,1.65,-.32],[.085,.18,.12]);
        shape(8,[0,1.99,-.56],[.085,.13,.20]);
        shape(11,[0,.72,.94],[.16,.45,.15]);
      }else if(variant===2){
        shape(5,[0,1.44,-.175],[.16,.82,.10]);
        shape(6,[0,1.80,-.345],[.15,.44,.09]);
        shape(7,[0,1.65,-.32],[.15,.18,.12]);
        shape(8,[0,1.99,-.56],[.13,.14,.20]);
        shape(11,[0,.77,.94],[.18,.34,.15]);
      }else{
        shape(5,[0,1.46,-.17],[.09,.86,.11]);
        shape(6,[0,1.80,-.34],[.08,.48,.10]);
        shape(7,[0,1.66,-.31],[.08,.24,.15]);
        shape(8,[0,2.015,-.57],[.08,.16,.22]);
        shape(11,[0,.70,.94],[.12,.57,.15]);
      }
    }else{
      const coat=parts[0].tint;
      for(let j=0;j<2;j++){
        const side=j?1:-1,ear=j?14:9,inset=j?15:10;
        if(variant===1){
          shape(ear,[side*.13,.505,-.40],[.14,.11,.12]);
          shape(inset,[side*.13,.51,-.465],[.085,.06,.014]);
          add('broad-cheek-'+j,[side*.145,.37,-.39],[.15,.22,.18],coat,'head');
        }else if(variant===2){
          shape(ear,[side*.13,.54,-.40],[.10,.20,.10]);
          shape(inset,[side*.13,.545,-.455],[.06,.12,.014]);
          add('upright-ear-cap-'+j,[side*.13,.655,-.40],[.07,.05,.085],coat,'ear'+j);
          shape(j?18:13,[side*.11,.39,-.655],[.06,.16,.015]);
        }else{
          shape(ear,[side*.13,.495,-.40],[.13,.10,.12]);
          shape(inset,[side*.13,.50,-.465],[.08,.055,.014]);
          add('low-cheek-'+j,[side*.145,.35,-.40],[.14,.20,.18],coat,'head');
        }
      }
      if(variant===1){
        shape(1,[0,.45,-.23],[.48,.46,.36]);
        shape(8,[0,.29,.56],[.17,.11,.22]);
      }else if(variant===2){
        shape(0,[0,.37,.06],[.44,.38,.76]);
        shape(1,[0,.42,-.23],[.42,.40,.34]);
        shape(2,[0,.35,.38],[.40,.32,.32]);
        shape(8,[0,.29,.56],[.12,.14,.22]);
        shape(27,[0,.562,.07],[.31,.014,.58]);
      }else{
        shape(1,[0,.47,-.23],[.46,.50,.36]);
        shape(8,[0,.29,.56],[.17,.12,.22]);
        add('shoulder-coat',[0,.60,-.10],[.34,.12,.30],coat,'body');
        add('rear-coat',[0,.57,.19],[.28,.10,.32],coat,'body');
      }
    }
  }
  /* C19_CREATURE_SILHOUETTES_V1_END */

  /* C20_CREATURE_SILHOUETTES_V1_BEGIN */
  function c20RefineAnimalParts(parts,type,variant){
    if(!variant||!['wolf','fox','cat'].includes(type))return;
    const shape=(i,p,s)=>{parts[i].p=p;parts[i].s=s;};
    const solid=(i,p,s)=>{
      const rows=parts.filter((q,j)=>j===i||q.name?.startsWith('coat-'+i+'-'));
      const lo=[0,1,2].map(k=>Math.min(...rows.map(q=>q.p[k]-q.s[k]/2)));
      const hi=[0,1,2].map(k=>Math.max(...rows.map(q=>q.p[k]+q.s[k]/2)));
      for(const q of rows)for(let k=0;k<3;k++){const scale=s[k]/(hi[k]-lo[k]);q.p[k]=p[k]+(q.p[k]-(lo[k]+hi[k])/2)*scale;q.s[k]*=scale;}
    };
    const add=(name,p,s,tint,group='body')=>parts.push({name:'c20-'+type+'-'+name,p,s,tint,id:20,emissive:0,group});
    const coat=parts[1].tint;
    if(type==='wolf'){
      for(let j=0;j<2;j++){
        const side=j?1:-1,i=j?11:8,tint=parts[i].tint;
        if(variant===1){
          shape(i,[side*.14,1.185,-.45],[.16,.18,.14]);
          add('short-ear-cap-'+j,[side*.14,1.285,-.45],[.11,.05,.12],tint,'ear'+j);
          add('shoulder-ruff-'+j,[side*.18,.80,-.235],[.11,.32,.34],coat);
        }else if(variant===2){
          shape(i,[side*.14,1.205,-.45],[.105,.23,.12]);
          add('tall-ear-cap-'+j,[side*.14,1.322,-.45],[.065,.032,.10],tint,'ear'+j);
        }else{
          shape(i,[side*.14,1.19,-.45],[.15,.18,.14]);
          add('broad-ear-cap-'+j,[side*.14,1.287,-.45],[.10,.05,.12],tint,'ear'+j);
          add('cheek-ruff-'+j,[side*.195,.94,-.405],[.085,.24,.18],coat,'head');
          add('chest-ruff-'+j,[side*.17,.72,-.32],[.12,.22,.30],coat);
        }
      }
      if(variant===1){
        shape(1,[0,.83,-.30],[.47,.52,.36]);
        shape(6,[0,.70,.58],[.20,.20,.32]);shape(7,[0,.76,.79],[.19,.17,.18]);
      }else if(variant===2){
        solid(0,[0,.64,.06],[.43,.40,.82]);
        shape(1,[0,.82,-.30],[.38,.48,.35]);
        shape(3,[0,.91,-.725],[.23,.17,.24]);
        shape(6,[0,.70,.58],[.12,.15,.32]);shape(7,[0,.76,.79],[.12,.13,.18]);
      }else{
        shape(1,[0,.83,-.30],[.45,.52,.35]);
        shape(6,[0,.70,.58],[.18,.20,.32]);shape(7,[0,.76,.805],[.12,.14,.15]);
      }
    }else if(type==='fox'){
      for(let j=0;j<2;j++){
        const side=j?1:-1,i=j?12:9,inner=i+1;
        if(variant===1){
          shape(i,[side*.11,.86,-.34],[.14,.17,.13]);shape(inner,[side*.11,.86,-.410],[.075,.11,.014]);
          add('short-ear-cap-'+j,[side*.11,.955,-.34],[.09,.045,.11],parts[i].tint,'ear'+j);
          add('cheek-ruff-'+j,[side*.155,.63,-.28],[.09,.18,.12],coat,'head');
        }else if(variant===2){
          shape(i,[side*.11,.905,-.34],[.10,.22,.11]);shape(inner,[side*.11,.91,-.399],[.052,.14,.014]);
          add('tall-ear-cap-'+j,[side*.11,1.020,-.34],[.06,.035,.09],parts[i].tint,'ear'+j);
        }else{
          shape(i,[side*.12,.88,-.34],[.14,.18,.13]);shape(inner,[side*.12,.885,-.410],[.075,.11,.014]);
          add('broad-ear-cap-'+j,[side*.12,.98,-.34],[.09,.04,.11],parts[i].tint,'ear'+j);
          add('cheek-ruff-'+j,[side*.16,.63,-.28],[.10,.22,.16],coat,'head');
        }
      }
      if(variant===1){
        shape(1,[0,.57,-.24],[.38,.40,.28]);
        solid(7,[0,.42,.64],[.32,.29,.60]);shape(8,[0,.42,.95],[.30,.27,.20]);
      }else if(variant===2){
        solid(0,[0,.42,.05],[.38,.32,.66]);shape(1,[0,.57,-.24],[.30,.38,.26]);
        solid(7,[0,.42,.64],[.22,.22,.60]);shape(8,[0,.42,.95],[.20,.20,.20]);
      }else{
        shape(1,[0,.58,-.24],[.37,.40,.28]);
        solid(7,[0,.42,.635],[.29,.25,.59]);shape(8,[0,.42,.935],[.24,.20,.15]);
        add('tail-tip-step',[0,.42,1.0175],[.15,.13,.065],parts[8].tint,'tailTip');
      }
    }else{
      for(let j=0;j<2;j++){
        const side=j?1:-1,i=j?14:9,inner=i+1;
        if(variant===1){
          shape(i,[side*.14,.955,-.43],[.16,.13,.14]);shape(inner,[side*.14,.96,-.505],[.09,.075,.014]);
          add('short-ear-cap-'+j,[side*.14,1.028,-.43],[.10,.04,.12],parts[i].tint,'ear'+j);
          add('round-cheek-'+j,[side*.20,.705,-.515],[.10,.18,.16],parts[2].tint,'head');
        }else if(variant===2){
          shape(i,[side*.14,1.00,-.43],[.105,.20,.14]);shape(inner,[side*.14,1.005,-.505],[.055,.13,.014]);
          add('tall-ear-cap-'+j,[side*.14,1.112,-.43],[.06,.04,.11],parts[i].tint,'ear'+j);
        }else{
          shape(i,[side*.14,.985,-.43],[.15,.18,.14]);shape(inner,[side*.14,.99,-.505],[.08,.11,.014]);
          add('ear-fur-cap-'+j,[side*.14,1.083,-.43],[.085,.045,.11],parts[i].tint,'ear'+j);
          add('long-cheek-'+j,[side*.19,.715,-.51],[.13,.22,.16],parts[2].tint,'head');
          add('chest-fringe-'+j,[side*.15,.49,-.215],[.12,.19,.20],coat);
        }
      }
      if(variant===1){
        shape(1,[0,.54,-.23],[.35,.34,.24]);
        shape(7,[0,.695,.37],[.13,.44,.10]);shape(8,[0,.955,.37],[.14,.18,.10]);
      }else if(variant===2){
        solid(0,[0,.46,0],[.35,.31,.64]);
        shape(7,[0,.695,.37],[.075,.44,.10]);shape(8,[0,.955,.37],[.075,.18,.10]);
      }else{
        shape(7,[0,.695,.37],[.16,.44,.10]);shape(8,[0,.965,.37],[.17,.20,.10]);
      }
    }
  }
  /* C20_CREATURE_SILHOUETTES_V1_END */


  function animalModel(type,sheared,variant=0){
    variant=Number.isInteger(variant)&&variant>=0&&variant<=3&&PASSIVE_TYPES.includes(type)?variant:0;
    let cache=ANIMAL_MODEL_CACHE.get(type);if(!cache){cache=[];ANIMAL_MODEL_CACHE.set(type,cache);}
    const slot=variant*2+(sheared?1:0);let model=cache[slot];if(model)return model;
    const parts=restParts(type,sheared);c16ReshapeAnimalParts(parts,type,variant);model={type,parts,nodes:[],names:{}};
    const center={pig:.61,sheep:.72,cow:.83,chicken:.40,rabbit:.31,wolf:.64,fox:.42,cat:.48,goat:.72,duck:.43,tortoise:.29,bear:.78,hedgehog:.29,boar:.59,camel:1.30,zebra:1.02,badger:.38,horse:1.02,deer:1.02,walker:1.08}[type];
    node(model,'body',-1,[0,center,0],'body');
    const hp={pig:[0,.77,-.39],sheep:[0,.92,-.39],cow:[0,1.10,-.30],chicken:[0,.61,-.12],rabbit:[0,.49,-.12],wolf:[0,.91,-.32],fox:[0,.63,-.26],cat:[0,.65,-.27],goat:[0,1.04,-.31],duck:[0,.59,-.22],tortoise:[0,.29,-.32],bear:[0,1.04,-.42],hedgehog:[0,.28,-.18],boar:[0,.60,-.43],camel:[0,1.38,-.50],zebra:[0,1.49,-.37],badger:[0,.36,-.34],horse:[0,1.49,-.37],deer:[0,1.47,-.40],walker:[0,1.37,0]}[type];
    node(model,'head',0,hp,'head');
    const cfg={
      pig:{head:[1,2,3,4,5,6,7,8],ears:[[3],[6]],tail:[17],legs:[[9,10],[11,12],[13,14],[15,16]]},
      sheep:sheared?{head:[1,2,3,4,5,6,7,8],ears:[[3],[6]],tail:[17],legs:[[9,10],[11,12],[13,14],[15,16]]}:{head:[1,2,3,4,5,6,7,8,9],ears:[[4],[7]],tail:[18],legs:[[10,11],[12,13],[14,15],[16,17]]},
      cow:{head:[1,2,4,5,6,7,9,10,11,12],ears:[[4],[9]],tail:[24,25],legs:[[15,16],[17,18],[19,20],[21,22]]},
      chicken:{head:[1,2,3,4,7,11],tail:[5],wings:[6,10],legs:[[8,9],[12,13]]},
      zebra:{head:[2,3,4,6,7,8,9,12,13,14,15,16,17],ears:[[12],[15]],tail:[10,11],legs:[[18,19],[20,21],[22,23],[24,25]]},
      badger:{head:[4,5,6,7,9,10,11,12,13,14,15,16,17,18],ears:[[9,10],[14,15]],tail:[8],legs:[[19,20],[21,22],[23,24],[25,26]]},
      boar:{head:[4,5,6,7,9,10,11,12,13,14,15,16,17,18,19,20],ears:[[9,10],[15,16]],tail:[8],legs:[[21,22],[23,24],[25,26],[27,28]]},
      camel:{head:[3,4,5,6,7,8,17,18,19,20,21,22,23,24,25,26,27],ears:[[18,19],[23,24]],tail:[9,10],legs:[[28,29],[30,31],[32,33],[34,35]]},
      bear:{head:[4,5,6,7,10,11,12,13,14,15,16,17,27],ears:[[10,11],[14,15]],tail:[8],legs:[[18,19],[20,21],[22,23],[24,25]]},
      hedgehog:{head:[2,3,4,5,7,8,9,10,11,12],ears:[[7,8],[10,11]],tail:[6],legs:[[13,14],[15,16],[17,18],[19,20]]},
      duck:{head:[2,3,4,5,11,17,20],tail:[6],wings:[8,14],legs:[[12,13],[18,19]]},
      tortoise:{head:[4,5,6,8,9],tail:[7],legs:[[10,11],[12,13],[14,15],[16,17]]},
      rabbit:{head:[1,2,3,5,6,7,10,11,12],ears:[[5,6],[10,11]],tail:[4],legs:[[9,9],[14,14],[8,8],[13,13]]},
      wolf:{head:[2,3,4,8,9,10,11,12,13],ears:[[8],[11]],tail:[6,7],legs:[[14,15],[16,17],[18,19],[20,21]]},
      fox:{head:[2,3,4,9,10,11,12,13,14],ears:[[9,10],[12,13]],tail:[7,8],legs:[[15,16],[17,18],[19,20],[21,22]]},
      cat:{head:[2,3,4,9,10,11,12,13,14,15,16,17,18,28],ears:[[9,10],[14,15]],tail:[7,8],legs:[[19,20],[21,22],[23,24],[25,26]]},
      goat:{head:[2,3,4,6,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,36],ears:[[9,10],[14,15]],tail:[7,8],legs:[[27,28],[29,30],[31,32],[33,34]]},
      horse:{head:[2,3,4,6,7,8,9,12,13,14,15,16,17],ears:[[12],[15]],tail:[10,11],legs:[[18,19],[20,21],[22,23],[24,25]]},
      deer:{head:[2,3,4,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29],ears:[[10,11],[14,15]],tail:[8,9],legs:[[30,31],[32,33],[34,35],[36,37]]},
      walker:{head:[1,2,3,4,9,10,11,16,17,18],legs:[[5,6],[12,13]]}
    }[type];
    assign(parts,cfg.head,'head');
    if(type==='deer')for(const i of [31,33,35,37])parts[i].hoof=true;
    if(type==='goat')for(const i of [28,30,32,34])parts[i].hoof=true;
    if(type==='zebra')for(const i of[19,21,23,25])parts[i].groundFoot=true;
    if(type==='badger')for(const i of[20,22,24,26])parts[i].groundFoot=true;
    if(type==='duck')for(const i of[13,19])parts[i].groundFoot=true;
    if(type==='tortoise')for(const i of[11,13,15,17])parts[i].groundFoot=true;
    if(type==='bear')for(const i of[19,21,23,25])parts[i].groundFoot=true;
    if(type==='boar')for(const i of[22,24,26,28])parts[i].groundFoot=true;
    if(type==='camel')for(const i of[29,31,33,35])parts[i].groundFoot=true;
    if(type==='hedgehog')for(const i of[14,16,18,20])parts[i].groundFoot=true;
    if(cfg.ears)for(let j=0;j<2;j++){
      const p=parts[cfg.ears[j][0]],name='ear'+j;node(model,name,1,[p.p[0],p.p[1]-p.s[1]/2,p.p[2]],'ear',j?1:-1);assign(parts,cfg.ears[j],name);
    }
    if(cfg.tail){const p=parts[cfg.tail[0]],name='tail';node(model,name,0,[0,p.p[1]+(type==='horse'||type==='zebra'?.15:0),p.p[2]-p.s[2]/2],'tail');assign(parts,cfg.tail,name);
      if(cfg.tail.length>1){const tip=parts[cfg.tail[1]];node(model,'tailTip',model.names.tail,[0,tip.p[1]+tip.s[1]/2,tip.p[2]-tip.s[2]/2],'tailTip');tip.group='tailTip';}
    }
    if(type==='camel'){
      model.nodes[model.names.tail].p=[0,1.38,.79];
      model.nodes[model.names.tailTip].p=[0,1.05,.88];
    }
    if(type==='cat'){
      // The tail grows from the rump; its tip bends at its lower end, not at its top.
      model.nodes[model.names.tail].p=[0,.50,.30];
      model.nodes[model.names.tailTip].p=[0,.865,.37];
    }
    if(cfg.wings)for(let j=0;j<2;j++){const p=parts[cfg.wings[j]],name='wing'+j;node(model,name,0,[p.p[0]*.8,p.p[1]+p.s[1]/2,p.p[2]],'wing',j?1:-1);p.group=name;}
    if(type==='duck'){for(const i of[9,10])parts[i].group='wing0';for(const i of[15,16])parts[i].group='wing1';}
    if(type==='hedgehog')for(let j=0;j<15;j++){const p=parts[21+j*2],name='quill'+j;node(model,name,0,[p.p[0],p.p[1]-p.s[1]/2,p.p[2]],'spine',Math.sign(p.p[0]));assign(parts,[21+j*2,22+j*2],name);}
    for(let j=0;j<cfg.legs.length;j++){
      const pair=cfg.legs[j];if(type==='rabbit'){
        const foot=parts[pair[0]],shaft={...foot,p:foot.p.slice(),s:foot.s.slice()};shaft.s[1]*=.70;shaft.p[1]+=foot.s[1]*.28;parts.push(shaft);
        foot.s[1]*=.30;foot.p[1]=foot.s[1]/2;leg(model,parts.length-1,pair[1],'leg'+j,j<2);
      }else leg(model,pair[0],pair[1],'leg'+j,j<2);
    }
    if(type==='walker'){
      for(let j=0;j<2;j++){const side=j?1:-1,skin=parts[j?14:7],sleeve=parts[j?15:8],name='arm'+j;
        node(model,name,0,[side*.40,1.40,-.07],'arm',side);node(model,name+'Lower',model.names[name],[side*.40,1.08,-.07],'elbow',side);
        sleeve.group=name;sleeve.p[1]=1.24;sleeve.s[1]=.32;skin.group=name+'Lower';skin.p[1]=.92;skin.s[1]=.32;
        parts.push({...skin,p:[side*.40,.72,-.07],s:[.21,.12,.25],name:'hand'+j});
      }
      for(let i=19;i<21;i++){parts[i].group='body';parts[i].flame=true;parts[i].name='flame'+i;}
    }
    applyCoatVariant(parts,type,variant,sheared);if(type==='zebra')applyZebraPattern(parts,variant);if(type==='sheep')c16AddSheepDetails(parts,variant,sheared);c17RefineAnimalParts(parts,type,variant);c18RefineAnimalParts(parts,type,variant);c19RefineAnimalParts(parts,type,variant);c20RefineAnimalParts(parts,type,variant);compileModel(model);cache[slot]=model;return model;
  }
  function humanModel(parts,role){
    const key='villager:'+role;let model=MODEL_CACHE.get(key);if(model)return model;
    model={type:'villager',parts:parts.map(p=>({name:p.name,p:p.p.slice(),s:p.s.slice(),tint:p.tint,id:20,emissive:0,group:p.group==='head'?'head':'body',blink:/eye|pupil/.test(p.name)})),nodes:[],names:{}};
    node(model,'body',-1,[0,.86,0],'body');node(model,'head',0,[0,1.39*1.08,0],'head');
    for(let j=0;j<2;j++){
      const side=j?1:-1,prefix=j?'right':'left',name='arm'+j;
      const upper=model.parts.findIndex(p=>p.name===prefix+'-trouser'),foot=model.parts.findIndex(p=>p.name===prefix+'-shoe');leg(model,upper,foot,'leg'+j,true);
      node(model,name,0,[side*.24*1.10,1.34*1.08,0],'arm',side);node(model,name+'Lower',model.names[name],[side*.24*1.10,.97*1.08,0],'elbow',side);
      for(const p of model.parts){if(p.name===prefix+'-sleeve')p.group=name;else if(p.name===prefix+'-forearm'||p.name===prefix+'-hand')p.group=name+'Lower';}
    }
    compileModel(model);MODEL_CACHE.set(key,model);return model;
  }
  function quaternion(out,yaw,pitch,roll){
    const sy=Math.sin(yaw/2),cy=Math.cos(yaw/2),sx=Math.sin(pitch/2),cx=Math.cos(pitch/2),sz=Math.sin(roll/2),cz=Math.cos(roll/2);
    out[0]=cy*cz*sx-sy*sz*cx;out[1]=-sy*cz*cx+cy*sz*sx;out[2]=cy*sz*cx+sy*cz*sx;out[3]=cy*cz*cx+sy*sz*sx;
  }
  function mul(out,a,b){const x=a[0],y=a[1],z=a[2],w=a[3];out[0]=w*b[0]+x*b[3]+y*b[2]-z*b[1];out[1]=w*b[1]-x*b[2]+y*b[3]+z*b[0];out[2]=w*b[2]+x*b[1]-y*b[0]+z*b[3];out[3]=w*b[3]-x*b[0]-y*b[1]-z*b[2];}
  function rotateInto(out,q,x,y,z){const tx=2*(q[1]*z-q[2]*y),ty=2*(q[2]*x-q[0]*z),tz=2*(q[0]*y-q[1]*x);out[0]=x+q[3]*tx+q[1]*tz-q[2]*ty;out[1]=y+q[3]*ty+q[2]*tx-q[0]*tz;out[2]=z+q[3]*tz+q[0]*ty-q[1]*tx;}
  function makePose(model,m,clock){
    poseGenerations++;return {model,clock,move:clamp(m.moving||0,0,1),run:0,swim:0,head:0,headPitch:0,turn:0,lastYaw:m.yaw||0,phase:0,bob:0,blink:0,
      scratch:[0,0,0,1],point:[0,0,0],nodes:model.nodes.map(()=>({p:[0,0,0],q:[0,0,0,1],yaw:0,pitch:0,roll:0})),
      cubes:model.parts.map(p=>({part:p.name,p:[0,0,0],s:[0,0,0],rotationQuaternion:[0,0,0,1],rigid:true,id:p.id,tint:[1,1,1],light:1,emissive:0,uvScale:1})),visible:[],shadow:{type:m.type,x:0,y:0,z:0,yaw:0,rx:0,rz:0}};
  }
  function poseMob(m,app,model){
    const clock=finite(app.clock)?app.clock:0;let row=POSE_CACHE.get(m);
    if(!row||row.model!==model){
      const previous=row;row=makePose(model,m,clock);
      // A wool/role geometry replacement must not restart the existing visual pose.
      if(previous){row.clock=previous.clock;row.move=previous.move;row.run=previous.run;row.swim=previous.swim;row.head=previous.head;row.headPitch=previous.headPitch;row.turn=previous.turn;row.lastYaw=previous.lastYaw;}
      POSE_CACHE.set(m,row);
    }
    const dt=clamp(clock-row.clock,0,.1),a=1-Math.exp(-dt*10),slow=1-Math.exp(-dt*5);row.clock=clock;
    const water=app.world?.get?.(m.x,m.y+Math.min(.45,SPEC[m.type].height*.35),m.z,true)===7;
    const supported=m.grounded===true||water;
    const moving=supported&&finite(m.moving)?clamp(m.moving,0,1):0;row.move+=(moving-row.move)*a;
    row.run+=((m.panic>0?1:0)-row.run)*slow;
    row.swim+=((water?1:0)-row.swim)*slow;
    const seed=((m.serial||0)*1.61803398875)%TAU,t=clock+seed;
    // Hold the last footfall in air while blending out walking; existing rabbit tuck and wings still use real velocity/grounding.
    const contactSpecies=m.type==='duck'||m.type==='tortoise'||m.type==='bear'||m.type==='hedgehog'||m.type==='boar'||m.type==='camel'||m.type==='zebra'||m.type==='badger';
    const contactGait=contactSpecies;
    let phase=supported?(finite(m.walk)?m.walk:0)+(row.swim*Math.sin(t*5)*.4):row.phase;
    if(contactGait){
      // A planted half-stride covers exactly twice the available leg reach.
      // Only rendering reads travelled distance; the actor's walk/AI state stays unchanged.
      const leg=model.nodes.find(n=>n.kind==='leg'),reach=Math.min(leg.length*.65,.18)*(1+row.run*.30),walk=finite(m.walk)?m.walk:0;
      const travelled=Math.max(0,walk-(finite(row.contactWalk)?row.contactWalk:walk))/9;
      row.contactPhase=(finite(row.contactPhase)?row.contactPhase:0)+travelled*Math.PI/(2*reach);
      phase=row.contactPhase+row.swim*Math.sin(t*5)*.4;
    }
    if(contactSpecies)row.contactWalk=finite(m.walk)?m.walk:0;
    row.phase=phase;const move=row.move,run=row.run,swim=row.swim,s=Math.sin(phase),body=model.nodes[0].p[1];
    let catPhase=phase,catRun=run;
    if(m.type==='cat'){
      // Distance still drives footfalls, with a visual cadence cap during fast catch-up.
      const delta=Math.max(0,phase-(finite(row.catWalk)?row.catWalk:phase));row.catWalk=phase;
      row.catPhase=(finite(row.catPhase)?row.catPhase:phase)+Math.min(delta*1.22,dt*18);catPhase=row.catPhase;
      const fast=dt>0?clamp((delta/(9*dt)-1.2)/2,0,1):0;
      row.catRun=(row.catRun||0)+(fast-(row.catRun||0))*slow;catRun=Math.max(run,row.catRun);
    }
    const yaw=finite(m.yaw)?m.yaw:0,turn=dt>0?clamp(deltaAngle(row.lastYaw,yaw)/dt,-3,3):row.turn;row.lastYaw=yaw;row.turn+=(turn-row.turn)*slow;
    const p=app.player,dx=p?p.x-m.x:0,dz=p?p.z-m.z:0,near=p&&dx*dx+dz*dz<36&&dx*dx+dz*dz>.01;
    const wanted=near?clamp(deltaAngle(yaw,Math.atan2(dx,-dz)),-.50,.50):Math.sin(t*.58)*.12*(1-move);
    row.head+=(wanted-row.head)*slow;const grazer=m.type==='pig'||m.type==='sheep'||m.type==='cow'||m.type==='horse'||m.type==='deer'||m.type==='goat';
    let graze=Math.max(0,Math.sin(t*.41));graze*=graze;graze*=graze;graze*=graze;
    const headPitch=(grazer?-.48*graze*(1-move)*(near?.25:1):0)+Math.sin(t*1.7)*.025+(m.type==='chicken'?Math.sin(phase*2)*.10*move:0)+swim*.16;
    row.headPitch+=(headPitch-row.headPitch)*slow;
    const blinkTime=(clock+seed*2.31)%5.7;row.blink=1-clamp(Math.abs(blinkTime-.14)/.10,0,1);
    row.bob=(Math.sin(t*1.9)*.004+(1-Math.cos(phase*2))*.010*move)*(m.type==='horse'?1.5:1)*(1-swim)+Math.sin(t*3)*.016*swim;
    const root=row.nodes[0];root.yaw=yaw;root.pitch=-run*.055*move+swim*.09;root.roll=-row.turn*.012*move+Math.sin(phase)*.012*move;
    if(m.type==='cat'){
      // A low resting hip keeps all four knees softly flexed. Breathing never drives physics.
      row.bob=-.018+Math.sin(t*1.7)*.0035+(1-Math.cos(catPhase*2))*.003*move;
      root.pitch=-catRun*.014*move+swim*.015+Math.sin(catPhase*2)*.004*move;
      root.roll=-row.turn*.002*move+Math.sin(catPhase)*.002*move;
    }
    if(m.type==='zebra'){row.bob=-.025-.018*move-run*.01*move+Math.sin(t*1.1)*.002+(1-Math.cos(phase*2))*.003*move;root.pitch=-run*.014*move+swim*.025;root.roll=-row.turn*.002*move+Math.sin(phase)*.004*move;}
    if(m.type==='badger'){row.bob=-.012-.016*move-run*.006*move+Math.sin(t*1.4)*.001+(1-Math.cos(phase*2))*.0015*move;root.pitch=-run*.008*move+swim*.025;root.roll=-row.turn*.001*move+Math.sin(phase)*.003*move;}
    if(m.type==='bear'){row.bob=-.010+Math.sin(t*1.1)*.0025+(1-Math.cos(phase*2))*.004*move;root.pitch=-run*.018*move+swim*.025;root.roll=-row.turn*.002*move+Math.sin(phase)*.009*move;}
    if(m.type==='hedgehog'){row.bob=-.003+Math.sin(t*1.5)*.001+(1-Math.cos(phase*2))*.002*move;root.pitch=-run*.015*move+swim*.025;root.roll=-row.turn*.002*move+Math.sin(phase)*.009*move;}
    if(m.type==='duck'){row.bob=Math.sin(t*1.7)*.003+(1-Math.cos(phase*2))*.006*move;root.roll=-row.turn*.004*move+Math.sin(phase)*.022*move;}
    if(m.type==='tortoise'){row.bob=Math.sin(t*.9)*.002+(1-Math.cos(phase*2))*.002*move;root.pitch=-run*.012*move+swim*.02;root.roll=-row.turn*.002*move+Math.sin(phase)*.004*move;}
    if(contactGait){
      // Keep a small reachable knee bend while the support target remains on the floor.
      if(m.type==='bear')row.bob=-.009-.046*move-run*.020*move+Math.sin(t*1.1)*.0025+(1-Math.cos(phase*2))*.004*move;
      if(m.type==='hedgehog')row.bob=-.003-.014*move-run*.007*move+Math.sin(t*1.5)*.001+(1-Math.cos(phase*2))*.002*move;
      if(m.type==='duck')row.bob=-.006-.024*move-run*.015*move+Math.sin(t*1.7)*.003+(1-Math.cos(phase*2))*.003*move;
      if(m.type==='tortoise')row.bob=-.005-.019*move-run*.012*move+Math.sin(t*.9)*.002+(1-Math.cos(phase*2))*.002*move;
    }
    if(m.type==='boar'){row.bob=-.006-.027*move-run*.014*move+Math.sin(t*1.3)*.002+(1-Math.cos(phase*2))*.003*move;root.pitch=-run*.018*move+swim*.025;root.roll=-row.turn*.002*move+Math.sin(phase)*.006*move;}
    if(m.type==='camel'){row.bob=-.008-.040*move-run*.016*move+Math.sin(t*.9)*.002+(1-Math.cos(phase*2))*.003*move;root.pitch=-run*.012*move+swim*.018;root.roll=-row.turn*.0015*move+Math.sin(phase)*.007*move;}
    if(m.type==='rabbit'&&!m.grounded)root.pitch+=clamp(-(m.vy||0)*.018,-.10,.12);
    for(let i=1;i<model.nodes.length;i++){
      const n=model.nodes[i],r=row.nodes[i];r.yaw=r.pitch=r.roll=0;
      if(n.kind==='head'){r.yaw=row.head;r.pitch=row.headPitch;r.roll=Math.sin(t*.73)*.018*(1-move);}
      else if(n.kind==='ear'){let twitch=Math.max(0,Math.sin(t*.83+n.side*1.7));twitch*=twitch;twitch*=twitch;twitch*=twitch;r.roll=n.side*(.035+.17*twitch*(1-move));r.pitch=-run*.15+Math.sin(t*1.13+n.side)*.035;}
      else if(n.kind==='tail'){r.yaw=Math.sin(t*(m.type==='wolf'?3.6:1.8))*(m.type==='fox'?.20:m.type==='wolf'?.27:.12)*(1-.45*move)+s*.045*move;r.pitch=-run*.14+Math.sin(t*1.3)*.045;}
      else if(n.kind==='tailTip'){r.yaw=Math.sin(t*2.3-.5)*.12;r.pitch=Math.sin(t*1.5)*.055;}
      else if(n.kind==='wing'){const airborne=!m.grounded?1:0;r.roll=n.side*(.035+(.18+.30*Math.sin(t*13))*(airborne*.7+swim*.6)+move*.06);}
      else if(n.kind==='arm'){r.pitch=-Math.sin(phase+(n.side>0?Math.PI:0))*.31*move+Math.sin(t*1.2+n.side)*.025;
        if(m.type==='walker')r.pitch+=.35+clamp((m.lunge||0)/.22,0,1)*.80;r.pitch+=swim*(.9+Math.sin(t*5+n.side)*.45);r.roll=n.side*.035;}
      else if(n.kind==='elbow')r.pitch=.10+run*.12+(m.type==='walker'?.08:Math.max(0,Math.sin(phase+n.side))*.12*move)+swim*.24;
      if(m.type==='boar'){if(n.kind==='head'){r.yaw=clamp(row.head*.44,-.22,.22);r.pitch=-.025+Math.sin(t*.9)*.022+Math.sin(phase*2)*.016*move;r.roll=Math.sin(t*.6)*.006;}else if(n.kind==='ear'){r.roll=n.side*.11;r.pitch=-.06+Math.sin(t*1.1+n.side)*.025;}else if(n.kind==='tail'){r.yaw=Math.sin(t*1.4)*.09;r.pitch=.12+Math.sin(t*.9)*.025;}}
      if(m.type==='camel'){if(n.kind==='head'){r.yaw=clamp(row.head*.26,-.13,.13);r.pitch=-.018+Math.sin(t*.7)*.018+Math.sin(phase*2)*.012*move;r.roll=Math.sin(t*.5)*.004;}else if(n.kind==='ear'){r.roll=n.side*.15;r.pitch=Math.sin(t*.8+n.side)*.025;}else if(n.kind==='tail'){r.yaw=Math.sin(t*1.1)*.09;r.pitch=.06+Math.sin(t*.8)*.02;}else if(n.kind==='tailTip'){r.yaw=Math.sin(t*1.4-.3)*.07;r.pitch=Math.sin(t*.9)*.03;}}
      if(m.type==='bear'){if(n.kind==='head'){r.yaw=clamp(row.head*.52,-.27,.27);r.pitch=-.015+Math.sin(t*.9)*.025+Math.sin(phase*2)*.020*move;r.roll=Math.sin(t*.6)*.008;}else if(n.kind==='ear'){r.roll=n.side*.025;r.pitch=Math.sin(t*.8+n.side)*.020;}else if(n.kind==='tail'){r.yaw=Math.sin(t*1.1)*.045;r.pitch=Math.sin(t*.9)*.020;}}
      if(m.type==='hedgehog'){if(n.kind==='head'){r.yaw=clamp(row.head*.60,-.30,.30);r.pitch=Math.sin(t*1.8)*.028+Math.sin(phase*2)*.025*move;r.roll=Math.sin(t*.7)*.010;}else if(n.kind==='ear'){r.roll=n.side*.04;r.pitch=Math.sin(t*1.3+n.side)*.030;}else if(n.kind==='spine'){r.pitch=.34+(n.p[2]>.2?.10:0);r.roll=-(n.p[0]/.20)*.42;}}
      if(m.type==='zebra'){if(n.kind==='head'){r.yaw=clamp(row.head*.52,-.27,.27);r.pitch=.012+Math.sin(t*1.2)*.012+Math.sin(phase*2)*.018*move;}else if(n.kind==='ear'){r.roll=n.side*.07+Math.sin(t*1.6+n.side)*.035;}else if(n.kind==='tail'){r.roll=Math.sin(t*1.2)*.09;}}
      if(m.type==='badger'){if(n.kind==='head'){r.yaw=clamp(row.head*.60,-.25,.25);r.pitch=.012+Math.sin(t*1.4)*.012-Math.sin(phase)*.018*move;}else if(n.kind==='ear'){r.roll=n.side*.06+Math.sin(t+n.side)*.025;}else if(n.kind==='tail'){r.yaw=Math.sin(t*1.3)*.10;}}
      if(m.type==='duck'&&n.kind==='head'){r.yaw=clamp(row.head*.78,-.40,.40);r.pitch=.01+Math.sin(phase*2)*.045*move+Math.sin(t*1.2)*.012;r.roll=Math.sin(t*.7)*.012*(1-move);}
      if(m.type==='tortoise'){if(n.kind==='head'){r.yaw=clamp(row.head*.60,-.30,.30);r.pitch=Math.sin(t*.8)*.025;r.roll=Math.sin(t*.6)*.008;}else if(n.kind==='tail'){r.yaw=Math.sin(t*.7)*.035;r.pitch=Math.sin(t*.9)*.018;}}
      if(m.type==='cat'){
        // Small, independent cues keep an idle cat attentive without constant exaggerated swishing.
        if(n.kind==='head'){r.yaw=clamp(row.head*.42+Math.sin(t*.47)*.018*(1-move),-.23,.23);r.pitch=-.015+Math.sin(t*1.7)*.020;r.roll=Math.sin(t*.71)*.016*(1-move);}
        else if(n.kind==='ear'){let twitch=Math.max(0,Math.sin(t*.61+n.side*1.7));twitch*=twitch;twitch*=twitch;twitch*=twitch;r.roll=n.side*(.035+.065*twitch*(1-move));r.pitch=Math.sin(t*.83+n.side)*.025-catRun*.035;}
        else if(n.kind==='tail'){r.yaw=Math.sin(t*.72)*.085*(1-.35*move);r.pitch=.20+Math.sin(t*.57)*.035-catRun*.10*move;}
        else if(n.kind==='tailTip'){r.yaw=Math.sin(t*.72-.6)*.10;r.pitch=-.48+Math.sin(t*.57-.5)*.055;}
      }
    }
    for(let i=1;i<model.nodes.length;i++){
      const n=model.nodes[i];if(n.kind!=='leg')continue;
      let phaseOffset=n.side>0?Math.PI:0;if(!n.front)phaseOffset+=Math.PI;
      if(m.type==='horse')phaseOffset=phaseOffset*(1-run)+(n.front?(n.side>0?.40:0):Math.PI+(n.side>0?.40:0))*run;
      if(m.type==='rabbit')phaseOffset=n.front?0:Math.PI;
      if(m.type==='bear'||m.type==='hedgehog')phaseOffset=(n.side>0?Math.PI:0)+(n.front?0:Math.PI*.62);
      if(m.type==='boar')phaseOffset=(n.side>0?Math.PI:0)+(n.front?0:Math.PI*.70);
      if(m.type==='zebra')phaseOffset=(n.side>0?Math.PI:0)+(n.front?0:Math.PI*(.65+.35*run));
      if(m.type==='badger')phaseOffset=(n.side>0?Math.PI:0)+(n.front?0:Math.PI*.68);
      if(m.type==='camel')phaseOffset=n.side>0?Math.PI:0; // Same-side lateral pacing, render only.
      if(m.type==='cat')phaseOffset=(n.side>0?Math.PI:0)+(n.front?0:Math.PI*(.65+.35*catRun));
      const g=(m.type==='cat'?catPhase:phase)+phaseOffset,step=Math.sin(g),up=Math.max(0,Math.cos(g)),length=n.length;
      if(contactGait){
        const u=((g+Math.PI/2)%TAU+TAU)%TAU/TAU,reach=Math.min(length*.65,.18)*(1+run*.30);
        const stride=(u<.5?Math.cos(u*TAU):4*u-3)*reach*move+swim*Math.sin(t*5+phaseOffset)*.06;
        const footPitch=swim*.35*Math.sin(t*5+phaseOffset),foot=model.parts[n.footIndex];
        const soleClearance=Math.max(0,foot.s[1]*Math.cos(footPitch)+Math.sin(footPitch)*n.footZ+foot.s[2]/2*Math.abs(Math.sin(footPitch))-foot.s[1]);
        const lift=(u<.5?Math.sin(u*TAU)**2*Math.min(length*.44,.095)*move:0)+swim*(.06+.04*Math.sin(t*5+phaseOffset))+soleClearance;
        row.nodes[i].supportFootPitch=footPitch;
        // Solve the ankle, not the forward edge of the paw. Inverse body rotation
        // keeps a stance foot level while shoulders breathe and the body turns.
        const tx=Math.cos(yaw)*n.p[0]-Math.sin(yaw)*(n.p[2]+stride);
        const tz=Math.sin(yaw)*n.p[0]+Math.cos(yaw)*(n.p[2]+stride);
        quaternion(row.scratch,yaw,root.pitch,root.roll);row.scratch[0]*=-1;row.scratch[1]*=-1;row.scratch[2]*=-1;
        rotateInto(row.point,row.scratch,tx,n.ankleY+lift-body-row.bob,tz);
        const dx=row.point[0]-n.p[0],dy=row.point[1]-(n.p[1]-body),dz=row.point[2]-n.p[2],planeY=-Math.hypot(dx,dy);
        const raw=Math.hypot(planeY,dz)||1,d=Math.min(2*length-.00001,Math.max(.001,raw)),uy=planeY/raw,uz=dz/raw;
        const h=Math.sqrt(Math.max(0,length*length-d*d/4))*(n.front?-1:1),ky=uy*d/2-uz*h,kz=uz*d/2+uy*h;
        const upper=Math.atan2(-kz,-ky),lower=Math.atan2(-(uz*d-kz),-(uy*d-ky));
        row.nodes[i].roll=Math.atan2(dx,-dy);row.nodes[i].pitch=upper;row.nodes[n.lower].pitch=lower-upper;
        continue;
      }
      const reach=Math.min(length*.65,.18)*(1+(m.type==='cat'?catRun:run)*.30),hop=m.type==='rabbit'&&!m.grounded?clamp(Math.abs(m.vy||0)*.025,0,.09):0;
      const footY=n.ankleY+up*up*Math.min(length*.44,.095)*move+hop+swim*(.06+.04*Math.sin(t*5+phaseOffset));
      const restOffset=m.type==='cat'?(n.front?(n.side>0?.018:-.014):(n.side>0?-.012:.022))*(1-move):0;
      const footZ=n.footZ+step*reach*move+swim*Math.sin(t*5+phaseOffset)*.10+restOffset;
      const dy=footY-n.p[1]-row.bob,dz=footZ,raw=Math.hypot(dy,dz)||1,d=Math.min(2*length-.00001,Math.max(.001,raw)),uy=dy/raw,uz=dz/raw;
      const h=Math.sqrt(Math.max(0,length*length-d*d/4))*(n.front?1:-1),ky=uy*d/2-uz*h,kz=uz*d/2+uy*h;
      const upper=Math.atan2(-kz,-ky),lower=Math.atan2(-(uz*d-kz),-(uy*d-ky));row.nodes[i].pitch=upper;row.nodes[n.lower].pitch=lower-upper;
    }
    // Parent-before-child rigid transforms; arrays and cube records are reused.
    for(let i=0;i<model.nodes.length;i++){
      const n=model.nodes[i],r=row.nodes[i];quaternion(row.scratch,r.yaw,r.pitch,r.roll);
      if(n.parent<0){r.q[0]=row.scratch[0];r.q[1]=row.scratch[1];r.q[2]=row.scratch[2];r.q[3]=row.scratch[3];r.p[0]=m.x+n.p[0];r.p[1]=m.y+n.p[1]+row.bob;r.p[2]=m.z+n.p[2];}
      else{const parent=model.nodes[n.parent],pr=row.nodes[n.parent];mul(r.q,pr.q,row.scratch);rotateInto(row.point,pr.q,n.p[0]-parent.p[0],n.p[1]-parent.p[1],n.p[2]-parent.p[2]);r.p[0]=pr.p[0]+row.point[0];r.p[1]=pr.p[1]+row.point[1];r.p[2]=pr.p[2]+row.point[2];}
    }
    const death=m.dead?.2+.8*clamp(m.deathTime/.38,0,1):1,flash=m.flash>0?clamp(m.flash*6,0,1):0;row.visible.length=0;
    for(let i=0;i<model.parts.length;i++){
      const part=model.parts[i],cube=row.cubes[i],n=model.nodes[part.node],r=row.nodes[part.node];if(part.flame&&!(m.burn>0)||part.companionCollar&&m.catTrust!==3)continue;
      rotateInto(row.point,r.q,part.p[0]-n.p[0],part.p[1]-n.p[1],part.p[2]-n.p[2]);
      cube.p[0]=m.x+(r.p[0]+row.point[0]-m.x)*death;cube.p[1]=m.y+(r.p[1]+row.point[1]-m.y)*death;cube.p[2]=m.z+(r.p[2]+row.point[2]-m.z)*death;
      for(let k=0;k<3;k++){cube.s[k]=part.s[k]*death;const tint=part.burnSkin&&m.burn>0?(k===0?.66:k===1?.60:.28):part.tint[k];cube.tint[k]=k===0?tint+(1-tint)*flash:tint*(1-flash*.55);}
      if(part.blink)cube.s[1]*=1-row.blink*.85;
      if(part.flame){const flicker=Math.sin(t*17+i)*.045;cube.p[1]+=flicker;cube.s[1]*=.9+Math.sin(t*19+i)*.12;}
      // Deer/goat hooves and cat paws retain their separate support-plane rules.
      if(part.hoof&&(m.type==='deer'||m.type==='goat')&&m.grounded&&swim<.05){quaternion(cube.rotationQuaternion,yaw,0,0);cube.p[1]=Math.max(cube.p[1],m.y+cube.s[1]/2);}
      else if(part.groundFoot&&contactGait){
        const leg=model.nodes[part.supportLeg],ankle=row.nodes[leg.lower];
        rotateInto(row.point,ankle.q,0,-leg.length,0);
        const ax=ankle.p[0]+row.point[0],ay=ankle.p[1]+row.point[1],az=ankle.p[2]+row.point[2];
        quaternion(cube.rotationQuaternion,yaw,row.nodes[part.supportLeg].supportFootPitch||0,0);
        rotateInto(row.point,cube.rotationQuaternion,0,-part.s[1]/2,leg.footZ);
        cube.p[0]=m.x+(ax+row.point[0]-m.x)*death;cube.p[1]=m.y+(ay+row.point[1]-m.y)*death;cube.p[2]=m.z+(az+row.point[2]-m.z)*death;
      }
      else if(part.groundFoot&&contactSpecies&&m.grounded&&swim<.05){quaternion(cube.rotationQuaternion,yaw,0,0);cube.p[1]=Math.max(cube.p[1],m.y+cube.s[1]/2);}
      else if(part.catPaw&&m.type==='cat'&&m.grounded&&swim<.05){quaternion(cube.rotationQuaternion,yaw,0,0);cube.p[1]=Math.max(cube.p[1],m.y+cube.s[1]/2);}
      else{cube.rotationQuaternion[0]=r.q[0];cube.rotationQuaternion[1]=r.q[1];cube.rotationQuaternion[2]=r.q[2];cube.rotationQuaternion[3]=r.q[3];}cube.emissive=m.burn?Math.max(part.emissive,.14*m.burn):part.emissive;row.visible.push(cube);
    }
    return row;
  }
  const C10_POSE_CACHE=new WeakMap();
  function c10PoseMob(m,app){
    const r=C10AnimalModels.poseAnimal(m.type,m.variant??0,{clock:finite(app.clock)?app.clock:0,walk:finite(m.walk)?m.walk:0,moving:finite(m.moving)?m.moving:0,grounded:m.grounded===true,yaw:finite(m.yaw)?m.yaw:0,x:m.x,y:m.y,z:m.z,measure:false},C10_POSE_CACHE.get(m));
    const death=m.dead?.2+.8*clamp(m.deathTime/.38,0,1):1,flash=m.flash>0?clamp(m.flash*6,0,1):0;
    for(const c of r.cubes){for(let k=0;k<3;k++){c.p[k]=r.origin[k]+(c.p[k]-r.origin[k])*death;c.s[k]*=death;const color=c.tint[k];c.tint[k]=k===0?color+(1-color)*flash:color*(1-flash*.55);}c.emissive=m.burn?Math.max(c.emissive,.14*m.burn):c.emissive;}
    r.shadow||={type:m.type,x:0,y:0,z:0,yaw:0,rx:0,rz:0};r.visible=r.cubes;C10_POSE_CACHE.set(m,r);return r;
  }
  function c10AnimationInspect(m){
    const r=C10_POSE_CACHE.get(m);
    return {serial:m.serial,type:m.type,rendered:!!r,parts:r?.cubes.length||0,rigidParts:r?.cubes.length||0,phase:r?.pose.walk||0,moving:r?.pose.moving||0,run:m.panic>0?1:0,swim:0,headYaw:r?.pose.headYaw||0,headPitch:r?.pose.headPitch||0,bodyBob:r?.pose.bodyBob||0,blink:0,
      nodes:r?[{name:'body',parent:-1,pivot:r.origin.slice(),pitch:0,yaw:m.yaw,roll:0},...r.nodes.map(n=>({name:n.name,parent:0,pivot:n.pivot.slice(),pitch:n.pitch||0,yaw:n.yaw||0,roll:0})),...r.feet.flatMap((f,i)=>[{name:f.name+'Shoulder',parent:0,pivot:f.shoulder.slice(),pitch:0,yaw:0,roll:0},{name:f.name+'Knee',parent:2+i*3,pivot:f.knee.slice(),pitch:0,yaw:0,roll:0},{name:f.name+'Foot',parent:3+i*3,pivot:f.ankle.slice(),pitch:0,yaw:0,roll:0}])]:[],
      feet:r?r.feet.map(f=>({name:f.name,center:f.center.slice(),contact:f.contact,lift:f.lift,stance:f.stance})):[],sourceScope:'New-type pure rigid poses; existing production motor and snapshot paths retained'};
  }
  function animationInspect(app){
    return {version:1,renderOnly:true,clockSource:'app.clock',modelGenerations,poseGenerations,maximumMobs:MAX_MOBS,
      mobs:(app.mobs||[]).map(m=>{if(Object.hasOwn(C10AnimalModels.SPEC,m.type))return c10AnimationInspect(m);const r=POSE_CACHE.get(m);return{serial:m.serial,type:m.type,rendered:!!r,parts:r?.visible.length||0,rigidParts:r?.visible.length||0,phase:r?.phase||0,moving:r?.move||0,run:r?.run||0,swim:r?.swim||0,headYaw:r?.head||0,headPitch:r?.headPitch||0,bodyBob:r?.bob||0,blink:r?.blink||0,nodes:r?r.model.nodes.map((n,i)=>({name:n.name,parent:n.parent,pivot:r.nodes[i].p.slice(),pitch:r.nodes[i].pitch,yaw:r.nodes[i].yaw,roll:r.nodes[i].roll})):[]};})};
  }
  V.EntityRig=Object.freeze({humanModel,pose:(mob,app,model)=>poseMob(mob,app,model).visible});
  function cubes(app){
    const result=[],p=app.player;Object.defineProperty(result,'contactShadows',{value:[],enumerable:false});
    for(const m of app.mobs||[]){
      if(!SPEC[m.type]||!loaded(app.world,m.x,m.z)||(p&&Math.hypot(m.x-p.x,m.z-p.z)>62))continue;
      const parts=Object.hasOwn(C10AnimalModels.SPEC,m.type)?c10PoseMob(m,app).visible:m.type==='villager'?(typeof V.villagerCubes==='function'?V.villagerCubes(m,app):null):poseMob(m,app,animalModel(m.type,m.type==='sheep'&&m.sheared,m.variant??0)).visible;
      if(parts)for(let i=0;i<parts.length;i++){if(V.mounts?.controls(app,m))parts[i].p[1]+=.04;result.push(parts[i]);} // Mounted-only render clearance; physical ground anchor is unchanged.
      if(!m.dead&&m.health>0&&result.contactShadows.length<20){const row=POSE_CACHE.get(m)||C10_POSE_CACHE.get(m),r=CONTACT_RADII[m.type];if(row&&r){const shadow=row.shadow;shadow.x=m.x;shadow.y=m.y;shadow.z=m.z;shadow.yaw=m.yaw;shadow.rx=r[0];shadow.rz=r[1];result.contactShadows.push(shadow);}}
    }
    return result;
  }

  V.entities = {
    init(app, savedMobs, villageMask) {
      V.mounts?.reset(app, 'entities-reset');
      let seed = 2166136261;
      for (const ch of String(app.seed || 'animals')) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
      const validVillageMask = Number.isInteger(villageMask) && villageMask >= 0 && villageMask <= 15;
      app._entities = { seed: seed >>> 0, serial: 0, nightTimer: 2.5, animalTimer: 12, animalCursor: 0, spawnedAnimals: 0, spawnedWalkers: 0, attacks: 0, shearings: 0, regrown: 0,
        villageAuto: !app.world?.importedWorld && app.world?.dimension !== 'inferno' && app.world?.dimension !== 'sky' && (savedMobs === undefined || validVillageMask), villageMask: validVillageMask ? villageMask : 0,
        villageTimer: .2, villageChecked: false, village: null };
      app.mobs = [];
      let animals = 0, walkers = 0, villagers = 0;
      const homes = new Set();
      const records = Array.isArray(savedMobs) ? savedMobs : [];
      for (const record of records) {
        if (record?.eggSpawned!==true&&(app.world?.dimension === 'sky' || (app.world?.dimension === 'inferno' && record?.type !== 'walker'))) continue;
        if (!record || !SPEC[record.type] || ![record.x, record.y, record.z, record.health].every(finite) || record.health <= 0) continue;
        if (record.type === 'villager' ? villagers >= MAX_VILLAGERS : record.type === 'walker' ? walkers >= MAX_WALKERS : animals >= MAX_ANIMALS) continue;
        if (app.mobs.length >= MAX_MOBS) break;
        const mob = makeMob(app, record.type, record.x, record.y, record.z, record);
        if (record.type === 'villager') {
          if (!assignVillageHome(app, mob, record.homeIndex) || homes.has(mob.homeIndex)) continue;
          mob.adultFitPending = true; fitSavedAdult(app, mob);
          homes.add(mob.homeIndex); app._entities.villageMask |= 1 << mob.homeIndex; villagers++;
        } else if (record.type === 'walker') walkers++; else animals++;
        app.mobs.push(mob);
      }
      if (!app.world?.importedWorld && savedMobs === undefined && app.world?.dimension !== 'inferno' && app.world?.dimension !== 'sky') seedAnimals(app);
    },
    update(app, dt, damage) {
      if (!app._entities || !app.player || !app.world || !finite(dt) || dt <= 0) return;
      dt = Math.min(dt, .1);
      if (app._entities.villageAuto && app._entities.villageMask !== 15) { app._entities.villageTimer -= dt; if (app._entities.villageTimer <= 0) { app._entities.villageTimer = .75; spawnVillageResidents(app); } }
      for (const mob of app.mobs) updateMob(app, mob, dt, damage);
      app.mobs = app.mobs.filter(m => !m.dead || m.deathTime > 0);
      if (app.world.importedWorld) return;
      if (daytime(app)) {
        app._entities.nightTimer=2.5;app._entities.animalTimer-=dt;
        if(app._entities.animalTimer<=0){app._entities.animalTimer=12;spawnAnimal(app);}
      }
      else {
        app._entities.nightTimer -= dt;
        if (app._entities.nightTimer <= 0) {
          app._entities.nightTimer = 3.5 + random(app) * 2;
          spawnWalker(app);
        }
      }
    },
    cubes,
    mountTarget(app, origin, direction, maxDistance=4.5) { const mob=nearestMob(app,origin,direction,maxDistance);return mob?.type==='horse'?mob:null; },
    animationInspect,
    spawnEgg,
    companionInteract,
    villageState(app) { return (app._entities?.villageMask || 0) & 15; },
    snapshot,
    shear(app, origin, dir, maxDistance, addItem) {
      // Choose the closest live target first, so another animal blocks shearing
      // a sheep behind it just as it blocks an ordinary melee hit.
      const best = nearestMob(app, origin, dir, maxDistance);
      if (!best || best.type !== 'sheep') return null;
      if (best.sheared) return {used: false, count: 0, reason: 'already-sheared'};
      if (typeof addItem !== 'function') return {used: false, count: 0, reason: 'no-inventory'};
      const count = 1 + Math.floor(random(app) * 3);
      best.sheared = true;
      best.grazeAge = 0;
      app._entities.shearings++;
      addItem(20, count);
      particles(app, best, false, 5);
      return {used: true, count, reason: 'sheared'};
    },
    attack(app, origin, dir, maxDistance, damage, addItem) {
      const best = nearestMob(app, origin, dir, maxDistance);
      if (!best) return false;
      const requested = app.hotbar?.[app.selected] || 0;
      const held = app.mode === 'survival' && !(app.inventory?.[requested] > 0) ? 0 : requested;
      const amount = app.mode === 'creative' ? best.health : (held === 107 ? 5 : held === 194 ? 4 : V.items?.[held]?.kind === 'tool' ? 2 : 1) * (V.equipment?.bonuses(app).melee || 1);
      best.health -= amount;
      best.flash = .18;
      best.panic = 2.3;
      const awayX = best.x - origin[0], awayZ = best.z - origin[2], awayLength = Math.hypot(awayX, awayZ) || 1;
      best.knockX = awayX / awayLength * 3.2;
      best.knockZ = awayZ / awayLength * 3.2;
      best.desiredYaw = Math.atan2(awayX, -awayZ);
      best.decision = 2.3;
      best.rest = 0;
      if (best.grounded) { best.vy = 2.6; best.grounded = false; }
      app._entities.attacks++;
      particles(app, best, false, 3);
      if (best.health <= 0) kill(app, best, true, addItem);
      return true;
    },
    inspect(app) {
      return {
        count: app.mobs?.length || 0,
        animals: app.mobs?.filter(m => m.type !== 'walker' && m.type !== 'villager' && !m.dead).length || 0,
        villagers: app.mobs?.filter(m => m.type === 'villager' && !m.dead).length || 0, villageMask: (app._entities?.villageMask || 0) & 15, villageCap: MAX_VILLAGERS,
        walkers: app.mobs?.filter(m => m.type === 'walker' && !m.dead).length || 0,
        burning: app.mobs?.filter(m => m.burn > 0 && !m.dead).length || 0,
        sheared: app.mobs?.filter(m => m.type === 'sheep' && m.sheared && !m.dead).length || 0,
        caps: { animals: MAX_ANIMALS, walkers: MAX_WALKERS, total: MAX_MOBS },
        attacks: app._entities?.attacks || 0,
        shearings: app._entities?.shearings || 0,
        regrown: app._entities?.regrown || 0,
        woolRegrowSeconds: WOOL_REGROW_SECONDS,
        companions: (app.mobs||[]).filter(m=>m.type==='cat'&&!m.dead&&m.health>0).map(m=>({serial:m.serial,catTrust:m.catTrust,catFollow:m.catFollow,health:m.health})),
        species: Object.fromEntries(PASSIVE_TYPES.map(type=>[type,app.mobs?.filter(m=>m.type===type&&!m.dead).length||0])),
        spawnedAnimals: app._entities?.spawnedAnimals || 0,
        spawnedWalkers: app._entities?.spawnedWalkers || 0
      };
    }
  };
})();
