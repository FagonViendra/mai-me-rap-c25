/* MảiMêRáp — original deterministic Vực Lửa cavern; no fluid simulation. */
(() => {
  'use strict';
  const V = globalThis.Voxel ||= {};
  V.createRealmGenerator = function createRealmGenerator(core) {
    if (!core || typeof core.hashSeed !== 'function') throw new TypeError('Voxel core is required');
    const SIZE=16, HEIGHT=96, LAVA_LEVEL=23;
    const ID=Object.freeze({air:0,bedrock:13,basalt:21,ember:67,brick:68,lava:69,crystal:70,frame:71,rift:72});
    const arrival=Object.freeze([8.5,35.01,8.5]);
    const portal=Object.freeze({id:'inferno-return',axis:'z',plane:4,
      opening:Object.freeze({minX:7,maxX:9,minY:35,maxY:38,z:4}),
      frame:Object.freeze({minX:6,maxX:10,minY:34,maxY:39,z:4}),
      center:Object.freeze([8.5,37,4.5]),arrival});
    const info=Object.freeze({id:'inferno',name:'Vực Lửa',version:1,height:HEIGHT,lavaLevel:LAVA_LEVEL,
      arrival,portal,staticLava:true,maxSurfaceY:62});
    const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
    const smooth=t=>t*t*(3-2*t),mix=(a,b,t)=>a+(b-a)*t;
    function avalanche(h){h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);return(h^(h>>>16))>>>0;}
    function hash2(seed,x,z){return avalanche(seed^Math.imul(x|0,0x632be5ab)^Math.imul(z|0,0x85157af5));}
    function hash3(seed,x,y,z){return avalanche(seed^Math.imul(x|0,0x632be5ab)^Math.imul(y|0,0x9e3779b1)^Math.imul(z|0,0x85157af5));}
    function noise(seed,x,z){
      const ix=Math.floor(x),iz=Math.floor(z),u=smooth(x-ix),v=smooth(z-iz);
      const a=hash2(seed,ix,iz)/2147483647.5-1,b=hash2(seed,ix+1,iz)/2147483647.5-1;
      const c=hash2(seed,ix,iz+1)/2147483647.5-1,d=hash2(seed,ix+1,iz+1)/2147483647.5-1;
      return mix(mix(a,b,u),mix(c,d,u),v);
    }
    function ground(seed,x,z){
      const r=Math.hypot(x-8,z-8);
      const eastBasin=13*Math.exp(-(((x-36)/19)**2+((z+6)/27)**2));
      const westBasin=10*Math.exp(-(((x+35)/25)**2+((z-27)/21)**2));
      let h=31+noise(seed+1709,x/83,z/83)*7+noise(seed+2903,x/31,z/31)*3+noise(seed+3719,x/10,z/10)*1.2-eastBasin-westBasin;
      // A narrow winding rock ridge offers a dry route along and across the eastern lake.
      if(x>=16&&x<=60&&Math.abs(z-(7+Math.sin(x*.09)*3))<2.3)h=Math.max(h,26+Math.round(noise(seed+9157,x/18,z/18)*1.5));
      // The landing is part of a rounded natural rise, gently blended into the cavern floor.
      const safe=1-smooth(clamp((r-7)/17,0,1));
      h=mix(h,34,safe);
      return Math.floor(clamp(h,16,44)+1e-8);
    }
    function column(seed,x,z){
      const r=Math.hypot(x-8,z-8),base=ground(seed,x,z);
      let floor=base,ceiling=Math.round(clamp(77+noise(seed+6011,x/69,z/69)*8+noise(seed+8089,x/23,z/23)*4,65,90));
      const sx=Math.floor(x/14),sz=Math.floor(z/14),sp=hash2(seed+13127,sx,sz);
      if(r>19&&sp%3===0){
        const px=sx*14+3+(sp>>>5)%8,pz=sz*14+3+(sp>>>13)%8,rad=1.8+(sp>>>21)%3*.55;
        const t=1-((x-px)**2+(z-pz)**2)/(rad*rad);
        if(t>0)floor+=Math.floor(t*(3+(sp>>>24)%5));
      }
      const tx=Math.floor(x/13),tz=Math.floor(z/13),st=hash2(seed+17053,tx,tz);
      if(st%3!==0){
        const px=tx*13+3+(st>>>4)%7,pz=tz*13+3+(st>>>12)%7,rad=2.3+(st>>>20)%3*.5;
        const t=1-((x-px)**2+(z-pz)**2)/(rad*rad);
        if(t>0)ceiling-=Math.floor(t*(5+(st>>>24)%9));
      }
      const pillars=[],gx=Math.floor(x/48),gz=Math.floor(z/48);
      for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
        const ax=gx+dx,az=gz+dz,h=hash2(seed+21317,ax,az);
        if(h%4===0)continue;
        const px=ax*48+8+(h>>>3)%32,pz=az*48+8+(h>>>11)%32;
        if(Math.hypot(px-8,pz-8)<24)continue;
        const radius=2.3+(h>>>20)%5*.55,distance=Math.hypot(x-px,z-pz);
        if(distance<=radius*1.2)pillars.push({distance,radius,phase:(h>>>25)%8});
      }
      const arches=[];
      const addArch=(ax,az,half,baseY,height,axis)=>{
        const along=axis==='x'?x-ax:z-az,cross=axis==='x'?z-az:x-ax;
        if(Math.abs(along)>half||Math.abs(cross)>1)return;
        const top=baseY+height+Math.round(4*(1-(along/half)**2));
        arches.push({leg:Math.abs(along)>=half-1,top,keystone:Math.abs(along)<1});
      };
      addArch(30,-5,7,25,9,'x');
      const arx=Math.floor(x/112),arz=Math.floor(z/112);
      for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
        const ax=arx+dx,az=arz+dz,h=hash2(seed+26209,ax,az);
        if(h%3===0)continue;
        const px=ax*112+22+(h>>>4)%68,pz=az*112+22+(h>>>12)%68;
        if(Math.hypot(px-8,pz-8)<65)continue;
        addArch(px,pz,6+(h>>>20)%4,Math.max(25,ground(seed,px,pz)),7+(h>>>24)%4,h&1?'x':'z');
      }
      const crystals=[];
      const addCrystal=(px,pz,height,baseY)=>{
        const distance=Math.abs(x-px)+Math.abs(z-pz);
        if(distance<=1)crystals.push({bottom:baseY+1,top:baseY+Math.max(1,height-distance)});
      };
      addCrystal(2,9,3,ground(seed,2,9));
      addCrystal(15,11,2,ground(seed,15,11));
      const cx=Math.floor(x/11),cz=Math.floor(z/11),ch=hash2(seed+31019,cx,cz);
      if(ch%7===0&&r>12){
        const px=cx*11+3+(ch>>>4)%5,pz=cz*11+3+(ch>>>12)%5;
        const by=ground(seed,px,pz);
        if(by>LAVA_LEVEL)addCrystal(px,pz,2+(ch>>>21)%3,by);
      }
      const roofGlow=hash2(seed+34649,Math.floor(x/5),Math.floor(z/5))%23===0;
      const strata=hash2(seed+37607,Math.floor(x/7),Math.floor(z/7))%7;
      return {seed,x,z,base,floor,ceiling,pillars,arches,crystals,roofGlow,strata};
    }
    function cell(c,y){
      if(y<0||y>=HEIGHT)return y<0?ID.bedrock:ID.air;
      if(y===0||y===HEIGHT-1)return ID.bedrock;
      const {x,z,seed}=c;
      if(z===4&&x>=6&&x<=10&&y>=34&&y<=39){
        return x===6||x===10||y===34||y===39?ID.frame:ID.rift;
      }
      let solid=y<=c.floor||y>=c.ceiling,material=ID.ember;
      if(y<3&&hash3(seed+41257,x,y,z)%3!==0)return ID.bedrock;
      for(const p of c.pillars){
        const t=clamp((y-c.floor)/(c.ceiling-c.floor),0,1),shape=.74+.46*(Math.abs(t-.5)*2)**2;
        if(p.distance<=p.radius*shape){solid=true;material=(Math.floor((y+p.phase)/6)%3===0)?ID.basalt:ID.ember;}
      }
      for(const arch of c.arches)if(y<=arch.top+1&&(arch.leg||y>=arch.top-1)){
        if(y>c.floor){solid=true;material=arch.keystone&&y===arch.top+1?ID.crystal:ID.basalt;}
      }
      for(const crystal of c.crystals)if(y>=crystal.bottom&&y<=crystal.top)return ID.crystal;
      if(solid){
        if(material!==ID.ember)return material;
        if(c.roofGlow&&y>=c.ceiling&&y<=c.ceiling+1&&hash3(seed+44843,x,y,z)%4!==0)return ID.crystal;
        if((Math.floor((y+c.strata)/5)%5===0)||(y===c.floor&&hash2(seed+47591,x,z)%11===0))return ID.basalt;
        return ID.ember;
      }
      return y<=LAVA_LEVEL?ID.lava:ID.air;
    }
    function normalized(seed,x,z){
      if(!core.coordinates.validGenerationSample(x,z))throw new RangeError('Realm coordinates must be bounded integers');
      return core.hashSeed(seed);
    }
    function generate(seedInput,cx,cz){
      if(!core.coordinates.validGenerationChunk(cx,cz))throw new RangeError('Realm chunks must be bounded integers');
      const seed=core.hashSeed(seedInput),data=new Uint8Array(SIZE*SIZE*HEIGHT);
      for(let z=0;z<SIZE;z++)for(let x=0;x<SIZE;x++){
        const c=column(seed,cx*SIZE+x,cz*SIZE+z);
        for(let y=0;y<HEIGHT;y++)data[x+SIZE*(z+SIZE*y)]=cell(c,y);
      }
      return data;
    }
    function sample(seedInput,x,y,z){
      const seed=normalized(seedInput,x,z);if(!Number.isInteger(y))throw new RangeError('Realm Y must be an integer');
      return cell(column(seed,x,z),y);
    }
    function floorHeight(seedInput,x,z){const seed=normalized(seedInput,x,z);return column(seed,x,z).floor;}
    return Object.freeze({generate,sample,floorHeight,info,arrival,portal,ids:ID,SIZE,HEIGHT,LAVA_LEVEL});
  };
  V.realm=V.createRealmGenerator(V.core);
  V.REALM_SOURCE=V.createRealmGenerator.toString();
  V.realmInfo=Object.freeze({overworld:Object.freeze({id:'overworld',name:'Mặt Đất',height:96}),inferno:V.realm.info});
  V.generateChunk=function generateChunk(seed,cx,cz,vegetationVersion=3,dimension='overworld',coordinateProfile=V.coordinates.LEGACY){V.coordinates.get(coordinateProfile);
    if(dimension==='overworld')return V.core.generate(seed,cx,cz,vegetationVersion);
    if(dimension==='inferno')return V.realm.generate(seed,cx,cz);
    throw new TypeError('Unsupported dimension');
  };
})();
