/* MảiMêRáp: deterministic weather targets and bounded visual transitions.
 * Pure data module: no timers, I/O, randomness, DOM, renderer or save mutation.
 * Auto forecast follows saved day/time. Disabling the day cycle freezes that
 * forecast; cloud/rain motion can continue through the simulation clock.
 * Transitions and wind travel are visual state, not a persistent save schema.
 */
(function (root) {
  'use strict';
  const V=root.Voxel||(root.Voxel={});
  const TAU=Math.PI*2,DAY_SECONDS=1200,FORECAST_SECONDS=180,FORECAST_BLEND=36;
  const OFFSET_PERIOD=65536,MAX_WIND_SPEED=6,MAX_DT=.1,MAX_MOTION_DT=.25;
  const DEFAULTS=Object.freeze({cloudStyle:'volumetric',celestialStyle:'enhanced',weatherMode:'auto',wind:35});
  const STYLES=Object.freeze(['classic','volumetric','off']),CELESTIAL=Object.freeze(['classic','enhanced']),MODES=Object.freeze(['clear','rain','storm','auto']);
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const finite=(n,fallback)=>typeof n==='number'&&Number.isFinite(n)?n:fallback;
  const mod=(n,p)=>((n%p)+p)%p;
  const smooth=n=>{n=clamp(n,0,1);return n*n*(3-2*n);};
  const mix=(a,b,t)=>a+(b-a)*t;
  const approach=(a,b,dt,tau)=>mix(a,b,-Math.expm1(-dt/tau));
  function hashSeed(value){
    const text=typeof value==='string'?value.slice(0,256):String(finite(value,0));let h=2166136261;
    for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);
    return h>>>0;
  }
  function randomAt(seed,index,salt){let h=seed^Math.imul(index|0,0x9e3779b1)^salt;h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);return((h^(h>>>16))>>>0)/4294967296;}
  function normalizeOptions(input){
    const o=input&&typeof input==='object'?input:{};
    return Object.freeze({cloudStyle:STYLES.includes(o.cloudStyle)?o.cloudStyle:DEFAULTS.cloudStyle,
      celestialStyle:CELESTIAL.includes(o.celestialStyle)?o.celestialStyle:DEFAULTS.celestialStyle,
      weatherMode:MODES.includes(o.weatherMode)?o.weatherMode:DEFAULTS.weatherMode,
      wind:clamp(finite(o.wind,DEFAULTS.wind),0,100)});
  }
  function context(input){
    const c=input&&typeof input==='object'?input:{},day=Math.floor(clamp(finite(c.day,1),1,100000)),time=clamp(finite(c.time,.36),0,1);
    const seed=typeof c.seed==='string'?c.seed.slice(0,256):String(finite(c.seed,0));
    const worldId=typeof c.worldId==='string'?c.worldId.slice(0,256):String(finite(c.worldId,0));
    const epoch=Math.floor(clamp(finite(c.epoch,0),0,Number.MAX_SAFE_INTEGER));
    return {worldId,epoch,seed,seedHash:hashSeed(seed),day,time,clock:clamp(finite(c.clock,time*DAY_SECONDS),0,1e12),
      dt:clamp(finite(c.dt,0),0,MAX_DT),forecastSeconds:(day-1+time)*DAY_SECONDS};
  }
  function identity(c){return JSON.stringify([c.worldId,c.epoch,c.seed]);}
  function event(seed,slot){
    const r=randomAt(seed,slot,0x2f6e2b1),detail=randomAt(seed,slot,0x7681bd19);
    if(r<.60)return {rain:0,storm:0,cloudCover:.24+.16*detail};
    if(r<.89)return {rain:.48+.30*detail,storm:0,cloudCover:.76+.10*detail};
    return {rain:.88+.12*detail,storm:1,cloudCover:.94+.05*detail};
  }
  function forecast(seed,seconds){
    const slot=Math.floor(seconds/FORECAST_SECONDS),within=seconds-slot*FORECAST_SECONDS;
    const prior=event(seed,slot-1),next=event(seed,slot),f=smooth(within/FORECAST_BLEND);
    return {rain:mix(prior.rain,next.rain,f),storm:mix(prior.storm,next.storm,f),cloudCover:mix(prior.cloudCover,next.cloudCover,f)};
  }
  function forecastWetness(seed,seconds){
    let value=0,total=0,weight=1;
    for(let i=0;i<8;i++){value+=forecast(seed,seconds-i*20).rain*weight;total+=weight;weight*=.76;}
    return clamp(1.25*value/total,0,1);
  }
  function windBasis(seed){
    const angle=randomAt(seed,0,0x6ea7a5c1)*TAU;
    return {x:Math.cos(angle),z:Math.sin(angle),p1:randomAt(seed,0,0x13f75ba9)*TAU,
      p2:randomAt(seed,0,0x703ea24b)*TAU,p3:randomAt(seed,0,0x35a7b4c9)*TAU};
  }
  function phase(t,period,p){return mod(t,period)/period*TAU+p;}
  function windVelocity(b,t,strength){
    const along=.70+.15*Math.sin(phase(t,137,b.p1))+.10*Math.sin(phase(t,53,b.p2));
    const across=.12*Math.sin(phase(t,211,b.p3)),speed=MAX_WIND_SPEED*strength;
    return [speed*(b.x*along-b.z*across),speed*(b.z*along+b.x*across)];
  }
  function windIntegral(b,t){
    const along=.70*t+.15*137/TAU*(Math.cos(b.p1)-Math.cos(phase(t,137,b.p1)))+.10*53/TAU*(Math.cos(b.p2)-Math.cos(phase(t,53,b.p2)));
    const across=.12*211/TAU*(Math.cos(b.p3)-Math.cos(phase(t,211,b.p3)));
    return [b.x*along-b.z*across,b.z*along+b.x*across];
  }
  function windTravel(b,start,end){
    const cosineDifference=(period,p)=>Math.cos(phase(start,period,p))-Math.cos(phase(end,period,p));
    const along=.70*(end-start)+.15*137/TAU*cosineDifference(137,b.p1)+.10*53/TAU*cosineDifference(53,b.p2);
    const across=.12*211/TAU*cosineDifference(211,b.p3);
    return [b.x*along-b.z*across,b.z*along+b.x*across];
  }
  function celestial(c){
    const a=c.time*TAU-Math.PI/2,norm=Math.sqrt(1.0625),sun=[Math.cos(a)/norm,Math.sin(a)/norm,.25/norm];
    const moonPhase=mod((c.day-1+c.time)/8,1);
    return {daylight:clamp(sun[1]*1.7+.35,.055,1),sunDirection:sun,moonDirection:sun.map(n=>-n),
      moonPhase,moonIllumination:(1+Math.cos(moonPhase*TAU))*.5,moonPhaseIndex:Math.floor(moonPhase*8)};
  }
  function target(c,o){
    let f;
    if(o.weatherMode==='auto'){f=forecast(c.seedHash,c.forecastSeconds);f.wetness=forecastWetness(c.seedHash,c.forecastSeconds);}
    else if(o.weatherMode==='rain')f={rain:.68,storm:0,cloudCover:.82,wetness:.85};
    else if(o.weatherMode==='storm')f={rain:1,storm:1,cloudCover:.98,wetness:1};
    else f={rain:0,storm:0,cloudCover:.32,wetness:0};
    return {...f,windStrength:o.wind/100,cloudVisibility:o.cloudStyle==='off'?0:1,
      cloudVolumetric:o.cloudStyle==='volumetric'?1:0,celestialEnhanced:o.celestialStyle==='enhanced'?1:0};
  }
  function snapshot(c,o,s,b,offset,transitioning){
    const sky=celestial(c),wind=windVelocity(b,c.clock,s.windStrength);
    return Object.freeze({version:1,worldId:c.worldId,epoch:c.epoch,seedHash:c.seedHash,
      forecastSeconds:c.forecastSeconds,motionClock:c.clock,weatherMode:o.weatherMode,
      cloudStyle:o.cloudStyle,celestialStyle:o.celestialStyle,
      kind:s.rain<.01?'clear':s.storm>.35?'storm':'rain',rain:s.rain,storm:s.storm,cloudCover:s.cloudCover,
      wetness:s.wetness,lightning:0,windStrength:s.windStrength,wind:Object.freeze(wind),
      cloudOffset:Object.freeze(offset.slice()),cloudVisibility:s.cloudVisibility,cloudVolumetric:s.cloudVolumetric,celestialEnhanced:s.celestialEnhanced,
      daylight:sky.daylight,sunDirection:Object.freeze(sky.sunDirection),moonDirection:Object.freeze(sky.moonDirection),
      moonPhase:sky.moonPhase,moonIllumination:sky.moonIllumination,moonPhaseIndex:sky.moonPhaseIndex,transitioning});
  }
  function sample(input,options){
    const c=context(input),o=normalizeOptions(options),s=target(c,o),b=windBasis(c.seedHash),offset=windIntegral(b,c.clock).map(n=>mod(n*MAX_WIND_SPEED*s.windStrength,OFFSET_PERIOD));
    return snapshot(c,o,s,b,offset,false);
  }
  function create(){
    let key=null,last=null,lastClock=0,state=null,basis=null,offset=[0,0];
    function reset(input,options){
      const c=context(input),o=normalizeOptions(options);key=identity(c);lastClock=c.clock;state=target(c,o);basis=windBasis(c.seedHash);
      offset=windIntegral(basis,c.clock).map(n=>mod(n*MAX_WIND_SPEED*state.windStrength,OFFSET_PERIOD));
      return last=snapshot(c,o,state,basis,offset,false);
    }
    function update(input,options){
      const c=context(input),o=normalizeOptions(options);if(!state||key!==identity(c))return reset(c,o);
      const t=target(c,o),dt=c.dt,priorStrength=state.windStrength;
      for(const k of ['rain','storm','cloudCover'])state[k]=approach(state[k],t[k],dt,k==='cloudCover'?3.2:2.6);
      state.wetness=approach(state.wetness,t.wetness,dt,t.wetness>state.wetness?8:32);
      state.windStrength=approach(state.windStrength,t.windStrength,dt,1.2);
      for(const k of ['cloudVisibility','cloudVolumetric','celestialEnhanced'])state[k]=approach(state[k],t[k],dt,.7);
      // Integrate only bounded simulation-clock travel, never multiply absolute
      // time by a changing slider. This keeps cloud positions continuous.
      const elapsed=clamp(c.clock-lastClock,0,MAX_MOTION_DT),travel=windTravel(basis,c.clock-elapsed,c.clock),strength=(priorStrength+state.windStrength)*.5;
      for(let i=0;i<2;i++)offset[i]=mod(offset[i]+travel[i]*MAX_WIND_SPEED*strength,OFFSET_PERIOD);
      lastClock=c.clock;
      const changing=Object.keys(t).some(k=>Math.abs(t[k]-state[k])>1e-4);
      return last=snapshot(c,o,state,basis,offset,changing);
    }
    return Object.freeze({reset,update,snapshot:()=>last});
  }
  const api=Object.freeze({version:1,DEFAULTS,DAY_SECONDS,FORECAST_SECONDS,FORECAST_BLEND,OFFSET_PERIOD,MAX_WIND_SPEED,MAX_DT,MAX_MOTION_DT,normalizeOptions,sample,create});
  V.weather=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
