/* MảiMêRáp — game, controls, persistence, UI. */
(() => {
 'use strict';const V=globalThis.Voxel,$=id=>document.getElementById(id),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const BIOMES={meadow:'Đồng cỏ',forest:'Rừng xanh',desert:'Sa mạc',alpine:'Núi tuyết',coast:'Bờ biển'};
 const panels=['pause','inventory','settings','help','worlds','backup','death','furnace','trade','mcImport','adventure'];
 const defaultOptions={distance:5,scale:100,fov:75,sensitivity:100,volume:35,muted:false,invert:false,cycle:true,bobbing:true,cameraMotion:'auto',uiFont:'pixel24',leaves:false,leavesStyleVersion:1,rtShadows:true,waterFX:true,materialDetail:true,texturePack:'native24',shadowQuality:'balanced',quality:'balanced',antiAliasing:'fxaa',cameraView:'first',cloudStyle:'volumetric',celestialStyle:'enhanced',weatherMode:'auto',wind:35};
 let options={...defaultOptions};try{const o=JSON.parse(localStorage.getItem('mienkhoi.options.v1')||'{}');for(const k of Object.keys(options))if(typeof o[k]===typeof options[k])options[k]=o[k];if(o.leavesStyleVersion!==1)options.leaves=false;options.leavesStyleVersion=1;if(!['classic','volumetric','off'].includes(o.cloudStyle))options.cloudStyle=o.quality==='low'?'classic':'volumetric';if(typeof o.waterFX!=='boolean')options.waterFX=o.quality!=='low';if(typeof o.materialDetail!=='boolean')options.materialDetail=o.quality!=='low';if(!['balanced','high'].includes(o.shadowQuality))options.shadowQuality=o.quality==='high'?'high':'balanced';}catch{}
 options.distance=clamp(options.distance,2,9);options.scale=clamp(options.scale,50,100);options.fov=clamp(options.fov,60,100);options.sensitivity=clamp(options.sensitivity,30,200);options.volume=clamp(options.volume,0,100);options.muted=options.muted===true;
 const graphicsPresets=Object.freeze({low:Object.freeze({distance:3,scale:70,rtShadows:false,waterFX:false,materialDetail:false,shadowQuality:'balanced',cloudStyle:'classic'}),balanced:Object.freeze({distance:5,scale:100,rtShadows:true,waterFX:true,materialDetail:true,shadowQuality:'balanced',cloudStyle:'volumetric'}),high:Object.freeze({distance:7,scale:100,rtShadows:true,waterFX:true,materialDetail:true,shadowQuality:'high',cloudStyle:'volumetric'})});
 function validateGraphicsOptions(o){Object.assign(o,V.weather.normalizeOptions(o));if(!['legacy16','legacy24','native24'].includes(o.texturePack))o.texturePack='native24';if(typeof o.materialDetail!=='boolean')o.materialDetail=o.quality!=='low';if(!['balanced','high'].includes(o.shadowQuality))o.shadowQuality='balanced';if(!['first','rear','front'].includes(o.cameraView))o.cameraView='first';if(!['auto','gentle','off'].includes(o.cameraMotion))o.cameraMotion='auto';if(!['pixel24','retron'].includes(o.uiFont))o.uiFont='pixel24';if(!['low','balanced','high','custom'].includes(o.quality))o.quality='custom';if(!['off','fxaa'].includes(o.antiAliasing))o.antiAliasing='off';const p=graphicsPresets[o.quality];if(p&&Object.keys(p).some(k=>o[k]!==p[k]))o.quality='custom';return o;}
 function chooseGraphicsPreset(key){const p=graphicsPresets[key];if(p){Object.assign(options,p);options.quality=key;}else options.quality='custom';applySettings();}
 validateGraphicsOptions(options);document.documentElement.dataset.uiFont=options.uiFont;
 const app={version:'0.26.0',options,playing:false,inHome:true,mode:'creative',dimension:'overworld',realmStates:{},panel:null,returnPanel:null,started:false,starting:false,contextLost:false,qaMode:false,seed:'BACH-DUONG-2026',id:null,time:.36,day:1,clock:0,inventory:{},wear:{},hotbar:[1,2,3,5,8,10,19,102,108],selected:0,progress:{wood:0,crafted:0,mined:0,placed:0,walked:0,kills:0},keys:new Set(),buttons:new Set(),mobs:[],particles:[],logs:[],frames:[],saveOK:true,saveMessage:'Chưa có phiên chơi',mining:0,miningKey:'',hitCooldown:0,useCooldown:0,companionUseLatched:false,saveTimer:0,walk:0,swing:0,hurt:0,debug:false,hiddenHUD:false,oreVision:V.createOreVision(),tab:'all',player:null,cameraState:null,cameraMotionState:null,cameraMotionDebug:null,presentation:null,avatarPose:null,renderUnderwater:false,lastSpace:0,lastForwardPress:-Infinity,sprintDouble:false,sprintToggle:false,sprinting:false,regen:0,drown:0,spawnTimer:0};
 V.app=app;const weatherController=V.weather.create();app.weatherState=null;
 function record(kind,message,data){const row={time:new Date().toISOString(),kind,message,data};app.logs.push(row);if(app.logs.length>200)app.logs.shift();if(kind==='error')console.error(message,data||'');}
 function toast(text,duration=3300){if(app.panel==='inventory'){$('inventoryDetail').textContent=text;$('toast').classList.remove('show');clearTimeout(app.toastTimer);return;}$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(app.toastTimer);app.toastTimer=setTimeout(()=>$('toast').classList.remove('show'),duration);}
 const Audio={ctx:null,master:null,step:0,ambient:0,init(){try{if(!this.ctx||this.ctx.state==='closed'){this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=null;}if(!this.master){const master=this.ctx.createGain();master.gain.setValueAtTime(options.muted===true?0:1,this.ctx.currentTime);master.connect(this.ctx.destination);this.master=master;}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}catch{}},syncMute(){const ctx=this.ctx,gain=this.master?.gain;if(!ctx||!gain)return;const t=ctx.currentTime,target=options.muted===true?0:1;try{if(ctx.state!=='running'){gain.cancelScheduledValues(t);gain.setValueAtTime(target,t);return;}if(typeof gain.cancelAndHoldAtTime==='function')gain.cancelAndHoldAtTime(t);else{const current=gain.value;gain.cancelScheduledValues(t);gain.setValueAtTime(current,t);}gain.linearRampToValueAtTime(target,t+.025);}catch{try{const current=gain.value;gain.cancelScheduledValues(t);gain.setValueAtTime(current,t);if(ctx.state==='running')gain.linearRampToValueAtTime(target,t+.025);else gain.setValueAtTime(target,t);}catch{try{gain.cancelScheduledValues(t);gain.setValueAtTime(target,t);}catch{try{gain.value=target;}catch{}}}}},tone(freq,dur=.08,type='triangle',gain=.05){if(!this.ctx||!this.master||options.muted===true||!options.volume)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*.6),t+dur);g.gain.setValueAtTime(gain*options.volume/100,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(this.master);o.start();o.stop(t+dur);},noise(kind='stone',gain=.14){if(!this.ctx||!this.master||options.muted===true||!options.volume)return;const ctx=this.ctx,n=Math.floor(ctx.sampleRate*.08),buf=ctx.createBuffer(1,n,ctx.sampleRate),a=buf.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n)**2;const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=buf;filter.type='lowpass';filter.frequency.value=kind==='wood'?550:kind==='grass'?1300:2800;g.gain.value=gain*options.volume/100;src.connect(filter);filter.connect(g);g.connect(this.master);src.start();}};
 // C14 audio mute: this gate never creates or resumes an audio context.
 let audioMuteStorageOK=null;
 function syncMuteControls(){
  const muted=options.muted===true;
  document.querySelectorAll('[data-audio-mute]').forEach(b=>b.setAttribute('aria-pressed',String(muted)));
  const hint=$('audioMuteHint');
  if(hint)hint.textContent=(muted?'Âm thanh đã tắt.':'Âm thanh đang bật.')+' Phím M khi ở trong thế giới.'+(audioMuteStorageOK===false?' Chưa lưu được lựa chọn; thiết lập chỉ dùng cho phiên này.':'');
 }
 function toggleMute(){options.muted=options.muted!==true;applySettings();}
 function bindMuteControls(){document.querySelectorAll('[data-audio-mute]').forEach(b=>b.addEventListener('click',toggleMute));syncMuteControls();}
 function c14AudioShortcut(e){
  if(e.code!=='KeyM')return false;
  const typing=node=>!!node&&(['INPUT','TEXTAREA','SELECT'].includes(node.tagName)||node.isContentEditable);
  if(e.ctrlKey||e.altKey||e.metaKey||e.repeat||e.isComposing||typing(document.activeElement)||typing(e.target)||!app.started||!app.playing||app.inHome||app.starting||app.contextLost)return true;
  e.preventDefault();toggleMute();return true;
 }
 V.audioMute=Object.freeze({inspect(){return {muted:options.muted===true,volume:options.volume,contextState:Audio.ctx?.state??'uninitialized',hasMaster:!!Audio.master,masterGain:Audio.master?.gain.value??null};}});

 let textures,renderer,world;const avatar=V.createPlayerAvatar(),validatedSaves=new WeakSet(),sourceSaveCodec=V.saveCodec;V.saveCodec=Object.freeze({...sourceSaveCodec,decode(text){const saved=sourceSaveCodec.decode(text);validatedSaves.add(saved);return saved;}});
 function initialPlayer(){return{x:8.5,y:40,z:8.5,vx:0,vy:0,vz:0,yaw:-.72,pitch:-.06,grounded:false,fly:false,health:20,hunger:20,air:12,fallStart:40,crouch:false};}
 try{textures=V.makeTextures(options.texturePack);renderer=new V.Renderer($('game'),textures);world=new V.World(renderer);app.renderer=renderer;app.world=world;app.player=initialPlayer();world.radius=options.distance;renderer.scale=options.scale/100;renderer.fov=options.fov;world.reset(app.seed);world.ensure(0,0,true);app.player.y=world.surface(8,8)+.01;app.player.fallStart=app.player.y;world.tick(8,8);}catch(e){$('fatal').classList.remove('hidden');$('fatalMessage').textContent=e.message;record('error','Initialization failed',String(e.stack||e));return;}
 function item(id){return V.items[id]||{id:0,name:'Tay không',kind:'empty',color:'#eee'};}
 function selectedId(){const id=app.hotbar[app.selected]||0;return app.mode==='survival'&&!(app.inventory[id]>0)?0:id;}
 function creative(){return app.mode==='creative';}
 function active(){return app.playing&&!app.inHome&&!app.panel&&!app.starting&&!app.contextLost;}
 function clearInput(){app.keys.clear();app.buttons.clear();app.companionUseLatched=false;app.touchMove=null;app.sprintDouble=false;app.sprintToggle=false;app.sprinting=false;app.lastForwardPress=-Infinity;app.mining=0;app.miningKey='';app.player.vx=app.player.vz=0;}
 function unlock(){if(document.pointerLockElement)document.exitPointerLock?.();}
 function controls(){clearInput();Audio.init();$('game').focus({preventScroll:true});if(app.qaMode||matchMedia('(pointer: coarse)').matches)return;try{const p=$('game').requestPointerLock();p?.catch(()=>{app.allowUnlocked=true;toast('Khóa chuột bị chặn: dùng phím mũi tên để nhìn; chuột trái/phải vẫn đào/đặt.');});}catch{app.allowUnlocked=true;toast('Dùng phím mũi tên để nhìn; chuột trái/phải vẫn đào/đặt.');}}
 // C14_HELP_GUIDE_NOV7_V1: searchable original guide and bounded modal focus.
 const managedPanelNames=new Set(['help','settings','pause','worlds']);
 let managedModal=null,managedFocusEpoch=0,helpGuideState=null;
 function visibleFocusTarget(e){
  if(!e||!e.isConnected||e.disabled||e.closest('[hidden],[inert]'))return false;
  const s=getComputedStyle(e),r=e.getBoundingClientRect();
  return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
 }
 function modalTabStops(root){
  return [...root.querySelectorAll('button,input,select,textarea,a[href],[tabindex],[contenteditable="true"]')].filter(e=>e.tabIndex>=0&&visibleFocusTarget(e));
 }
 function deactivateManagedModal(){
  const state=managedModal;if(state?.name==='worlds')V.sceneLibrary?.onPanelLeave(app);managedModal=null;managedFocusEpoch++;
  if(!state)return null;
  for(const row of state.inertChanges.reverse()){
   if(row.had)row.element.setAttribute('inert',row.value);else row.element.removeAttribute('inert');
  }
  for(const row of state.attributes){
   if(row.had)state.root.setAttribute(row.name,row.value);else state.root.removeAttribute(row.name);
  }
  return state.returnFocus;
 }
 function restoreManagedFocus(target){
  const epoch=managedFocusEpoch;
  queueMicrotask(()=>{
   if(epoch!==managedFocusEpoch||!visibleFocusTarget(target))return;
   if(managedModal&&!managedModal.root.contains(target))return;
   if(!managedModal&&!app.inHome)return;
   target.focus();
  });
 }
 function activateManagedModal(name,origin){
  if(!managedPanelNames.has(name))return;
  const root=$(name),state={name,root,returnFocus:origin,inertChanges:[],attributes:[]};
  managedModal=state;const epoch=++managedFocusEpoch;
  try{
   for(const attribute of ['role','aria-modal','aria-label','tabindex'])state.attributes.push({name:attribute,had:root.hasAttribute(attribute),value:root.getAttribute(attribute)});
   root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',name==='help'?'Hướng dẫn chơi':name==='settings'?'Thiết lập trò chơi':name==='worlds'?'Thế giới và kho cảnh':'Tạm dừng');root.setAttribute('tabindex','-1');
   const seen=new Set();
   for(let branch=root;branch&&branch!==document.body;branch=branch.parentElement){
    const parent=branch.parentElement;if(!parent)break;
    for(const sibling of parent.children){
     if(sibling===branch||seen.has(sibling)||['SCRIPT','STYLE','LINK'].includes(sibling.tagName))continue;
     seen.add(sibling);state.inertChanges.push({element:sibling,had:sibling.hasAttribute('inert'),value:sibling.getAttribute('inert')});sibling.inert=true;
    }
   }
   if(root.closest('[inert]'))throw new Error('Managed panel inherits an existing inert ancestor');
   queueMicrotask(()=>{
    if(epoch!==managedFocusEpoch||managedModal!==state||app.panel!==name)return;
    const preferred=name==='help'?$('helpSearch'):modalTabStops(root)[0];
    (visibleFocusTarget(preferred)?preferred:root).focus();
   });
  }catch(error){deactivateManagedModal();record('error','Panel focus setup was rolled back.',String(error?.message||error));}
 }
 function helpFold(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLocaleLowerCase('vi').replace(/\s+/g,' ').trim();}
 function refreshHelpGuide(){
  const state=helpGuideState;if(!state)return;
  const query=helpFold(state.search.value),words=query.split(' ').filter(Boolean);
  let visible=0;
  for(const topic of state.topics){topic.node.hidden=!words.every(word=>topic.searchText.includes(word));if(!topic.node.hidden)visible++;}
  for(const column of state.columns)column.hidden=![...column.children].some(node=>node.classList.contains('help-topic')&&!node.hidden);
  state.grid.dataset.helpFiltered=String(!!query);state.empty.hidden=visible>0;
  state.status.textContent=query?'Hiện '+visible+' / '+state.topics.length+' mục.':state.topics.length+' mục hướng dẫn. Tìm không cần gõ dấu.';
  state.go.disabled=!state.topics.some(topic=>topic.key===state.select.value);
 }
 function initHelpGuide(){
  if(helpGuideState)return;
  const root=$('help'),grid=root.querySelector('.help-grid'),columns=[...grid.children],topics=[];
  for(const column of columns){
   let current=null;
   for(const node of [...column.childNodes]){
    if(node.nodeType===1&&node.tagName==='H3'){
     const key='help-topic-'+(topics.length+1),section=document.createElement('section');section.className='help-topic';section.dataset.helpTopic=key;
     if(!node.id)node.id=key;node.tabIndex=-1;section.setAttribute('aria-labelledby',node.id);column.append(section);
     current={key,node:section,heading:node,title:node.textContent.trim()};topics.push(current);
    }
    if(current)current.node.append(node);
   }
  }
  const state=helpGuideState={grid,columns,topics,search:$('helpSearch'),select:$('helpTopic'),go:$('helpGo'),status:$('helpStatus'),empty:$('helpEmpty')};
  for(const topic of topics){topic.searchText=helpFold(topic.node.textContent);const option=document.createElement('option');option.value=topic.key;option.textContent=topic.title;state.select.append(option);}
  state.search.addEventListener('input',refreshHelpGuide);
  $('helpClear').addEventListener('click',()=>{state.search.value='';refreshHelpGuide();state.search.focus();});
  state.select.addEventListener('change',refreshHelpGuide);
  state.go.addEventListener('click',()=>{
   const topic=state.topics.find(row=>row.key===state.select.value);if(!topic)return;
   state.search.value='';refreshHelpGuide();topic.heading.focus();topic.heading.scrollIntoView({block:'start',inline:'nearest'});
  });
  document.addEventListener('keydown',e=>{
   const state=managedModal;if(!state||app.panel!==state.name||e.code!=='Tab'||e.ctrlKey||e.metaKey||e.altKey)return;
   const stops=modalTabStops(state.root),activeElement=document.activeElement,index=stops.indexOf(activeElement);
   if(!stops.length){e.preventDefault();e.stopPropagation();state.root.focus();return;}
   if(!state.root.contains(activeElement)||activeElement===state.root||e.shiftKey&&index===0||!e.shiftKey&&index===stops.length-1){e.preventDefault();e.stopPropagation();(e.shiftKey?stops[stops.length-1]:stops[0]).focus();}
  },true);
  document.addEventListener('focusin',e=>{
   const state=managedModal;if(!state||app.panel!==state.name||state.root.contains(e.target))return;
   (modalTabStops(state.root)[0]||state.root).focus();
  },true);
  V.helpGuide=Object.freeze({inspect:()=>({topicCount:topics.length,query:state.search.value,visibleTitles:topics.filter(topic=>!topic.node.hidden).map(topic=>topic.title),selectedTopic:state.select.value,managedPanel:managedModal?.name||null,focusedId:document.activeElement?.id||null,backgroundInertCount:managedModal?.inertChanges.filter(row=>row.element.inert).length||0})});
  refreshHelpGuide();
 }
 // END_C14_HELP_GUIDE_NOV7_V1

 function openPanel(name,from=null){if(app.contextLost&&name!=='backup')return;const modalOrigin=document.activeElement;deactivateManagedModal();if(app.panel!==name){if(app.panel==='inventory')V.crafting3?.exit(app);V.services?.exit(app,app.panel);}$('toast').classList.remove('show');clearTimeout(app.toastTimer);app.returnPanel=from??app.panel;app.panel=name;clearInput();unlock();panels.forEach(p=>$(p).classList.toggle('hidden',p!==name));if(name==='inventory')renderInventory();V.services?.render(app,name);if(name==='adventure')V.adventureUI.render(app);if(name==='settings')syncSettings();if(name==='worlds'){renderWorlds();V.sceneLibrary?.refresh(app);}if(name==='pause'){V.dimensions.refresh(app);refreshCreativePlacementHistory();$('pauseInfo').textContent=(creative()?'Sáng tạo':'Sinh tồn')+' · '+app.seed;$('pauseSaveState').textContent=app.saveMessage;}if(name==='backup'){$('backupText').value=exportText();}Audio.tone(480,.045,'square',.02);activateManagedModal(name,modalOrigin);}
 function closePanel(){const modalOrigin=deactivateManagedModal(),was=app.panel;if(was==='inventory')V.crafting3?.exit(app);if(was==='mcImport')V.mcImportUI?.onClose();V.services?.exit(app,was);panels.forEach(p=>$(p).classList.add('hidden'));app.panel=null;if(app.inHome){clearInput();restoreManagedFocus(modalOrigin);return;}if(['settings','help','backup','adventure'].includes(was)&&app.returnPanel==='pause'){openPanel('pause');restoreManagedFocus(modalOrigin);return;}controls();}
 function hidePanels(){deactivateManagedModal();if(app.panel==='inventory')V.crafting3?.exit(app);V.services?.exit(app,app.panel);panels.forEach(p=>$(p).classList.add('hidden'));app.panel=null;app.returnPanel=null;}
 function applyModeChoice(mode){app.modeChoice=mode;$('creativeMode').classList.toggle('selected',mode==='creative');$('survivalMode').classList.toggle('selected',mode==='survival');$('creativeMode').setAttribute('aria-pressed',String(mode==='creative'));$('survivalMode').setAttribute('aria-pressed',String(mode==='survival'));}
 applyModeChoice('creative');
 function findSpawn(){for(let radius=0;radius<=8;radius++)for(let z=8-radius;z<=8+radius;z++)for(let x=8-radius;x<=8+radius;x++){world.ensure(Math.floor(x/16),Math.floor(z/16),true);const y=world.surface(x,z);if(y>V.core.SEA+1&&y<90&&!world.collides(x+.5,y+.01,z+.5)&&world.get(x,y-1,z)!==30)return[x+.5,y+.01,z+.5];}return[8.5,world.surface(8,8)+3,8.5];}
 function start(seed,mode,saved=null,skipCurrentSave=false){if(saved){let raw=saved;if(validatedSaves.has(saved)&&saved.version<4&&saved.dimension==='overworld'&&saved.realmStates&&typeof saved.realmStates==='object'&&!Array.isArray(saved.realmStates)&&Object.keys(saved.realmStates).length===0){raw={...saved};delete raw.dimension;delete raw.realmStates;}saved=V.saveCodec.decode(V.saveCodec.encode(raw));seed=saved.seed;mode=saved.mode;}if(saved)V.geometryAdmission.assertSaved(saved);if(app.started&&!skipCurrentSave&&!save(false)){openBackup('Không thể lưu phiên hiện tại. Hãy xuất bản sao trước khi tạo thế giới khác.');return false;}seed=saved?saved.seed:(String(seed||'BACH-DUONG-2026').trim().slice(0,64)||'BACH-DUONG-2026');const admission=V.dimensions.admit(saved);saved=admission.saved;if(admission.recovery)record('load-position','Resolved an unsafe realm arrival before resetting the live world.',admission.recovery);clearInput();hidePanels();V.mounts.reset(app,'world-start');V.services.reset(app);V.crafting3?.reset(app);app.oreVision.reset();resetPresentation();app.seed=seed;app.mode=mode;app.id=saved?.id||freshWorldId('world');V.dimensions.prepare(app,saved);world.reset(seed,saved?.edits||[],saved?saved.vegetationVersion??1:4,app.dimension,app.coordinateProfile,saved?.importedWorld||null);V.dimensions.applyBudget(app);app.player=initialPlayer();const coords=saved?[saved.player.x,saved.player.y,saved.player.z]:null;const cx=Math.floor((coords?.[0]||8)/16),cz=Math.floor((coords?.[2]||8)/16);for(let z=-1;z<=1;z++)for(let x=-1;x<=1;x++)world.ensure(cx+x,cz+z,true);if(saved){Object.assign(app.player,saved.player);app.player.vx=app.player.vy=app.player.vz=0;app.player.air=12;if(world.collides(app.player.x,app.player.y,app.player.z)){const safe=V.findSafeRespawn(world,[app.player.x,app.player.y,app.player.z]);[app.player.x,app.player.y,app.player.z]=safe.position;record('load-position','Recovered a saved position obstructed by blocks.',safe);toast('Đã chuyển tới khoảng trống gần vị trí lưu để tránh kẹt trong khối.');}}else{const[x,y,z]=findSpawn();Object.assign(app.player,{x,y,z});}app.spawn=saved?.spawn?.slice()||(saved?findSpawn():[app.player.x,app.player.y,app.player.z]);app.lastRespawn=null;app.player.fallStart=app.player.y;if(mode==='creative')app.player.health=20;app.pendingDeath=mode==='survival'&&app.player.health<=0;app.time=saved?.time??.36;app.day=saved?.day??1;app.clock=app.time*1200;app.inventory=saved?.inventory?{...saved.inventory}:mode==='survival'?{108:3}:{};app.wear=saved?.wear?{...saved.wear}:{};app.hotbar=saved?.hotbar?.slice()||(mode==='creative'?[1,2,3,5,8,10,19,102,108]:[0,0,0,0,0,0,0,0,108]);app.selected=saved?.selected??0;app.progress=saved?.progress?{...saved.progress}:{wood:0,crafted:0,mined:0,placed:0,walked:0,kills:0};app.mobs=[];app.particles=[];app.started=true;app.playing=true;app.inHome=false;app.starting=true;app.startAt=performance.now();app.saveTimer=0;app.saveOK=true;app.mining=0;app.hitCooldown=0;app.useCooldown=0;app.spawnTimer=0;app.regen=0;app.drown=0;app.hurt=0;app.hiddenHUD=false;document.body.classList.remove('hud-hidden');$('home').classList.add('hidden');$('hud').classList.remove('hidden');$('loading').classList.remove('hidden');$('loadingTitle').textContent=saved?'Đang trở lại thế giới':'Đang gieo hạt giống';world.center=[NaN,NaN];world.tick(app.player.x,app.player.z);if(V.entities)V.entities.init(app,saved?.mobs,saved?.villageMask??0);V.trees.init(app,saved?.trees||[]);V.farming.init(app,saved?.crops||[]);V.furnaces.init(app,saved?.furnaces||[]);V.journey.init(app,saved?.journey);V.equipment.init(app,saved?.equipment);V.guardian.init(app,saved?.guardian);if(app.pendingDeath)V.guardian.onDeath(app);renderHotbar();updateHUD();if(!app.pendingDeath)controls();record('world',saved?'Loaded world':'Created world',{id:app.id,seed,mode});return true;}
 function snapshot(){const p=app.player,mountPose=V.mounts.savePose(app);return{expeditionVersion:1,journey:V.journey.snapshot(app),equipment:V.equipment.snapshot(app),guardian:V.guardian.snapshot(app),...V.coordinates.metadata(world),...(world.importedWorld?{importedWorld:world.importedWorld.descriptor}:{}),dimension:app.dimension,realmStates:app.realmStates,vegetationVersion:world.vegetationVersion,id:app.id,seed:app.seed,mode:app.mode,updated:Date.now(),day:app.day,time:app.time,spawn:app.spawn.slice(),player:{x:p.x,y:p.y,z:p.z,yaw:p.yaw,pitch:p.pitch,health:p.health,hunger:p.hunger,fly:!!p.fly,...mountPose},inventory:{...app.inventory},wear:{...app.wear},hotbar:app.hotbar.slice(),selected:app.selected,edits:world.serialize(),progress:{...app.progress},trees:V.trees.snapshot(app),crops:V.farming.snapshot(app),furnaces:V.furnaces.snapshot(app),villageMask:V.entities?.villageState?.(app)||0,mobs:V.entities?.snapshot?V.entities.snapshot(app):app.mobs.filter(m=>!m.dead&&m.health>0).map(m=>({type:m.type,x:m.x,y:m.y,z:m.z,health:m.health,yaw:m.yaw}))};}
 function exportText(){return app.started?V.saveCodec.encode(snapshot()):'';}
 function save(show=false){if(!app.started)return true;try{if(app.qaStorageFailure)throw Error('Controlled storage failure');V.saveCodec.write(snapshot());app.saveOK=true;app.saveMessage='Đã lưu · '+new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});$('saveStatus').textContent=app.saveMessage;$('pauseSaveState').textContent=app.saveMessage;if(show)toast('Đã lưu thế giới trên trình duyệt này.');return true;}catch(e){app.saveOK=false;app.saveMessage='Chưa lưu được · Hãy xuất JSON';$('saveStatus').textContent=app.saveMessage;$('pauseSaveState').textContent=app.saveMessage;record('save-error','Browser storage rejected save',e.message);if(show)openBackup('Trình duyệt không ghi được bản lưu: '+e.message+'. Phiên chơi vẫn được giữ. Hãy tải tệp hoặc sao chép mã.');return false;}}
 function downloadText(text,name,type='application/json'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 function openBackup(message='Thế giới hiện tại được giữ nguyên. Tải JSON hoặc sao chép toàn bộ mã để mang sang máy khác.'){$('backupMessage').textContent=message;openPanel('backup',app.panel||'pause');}
 function importText(text){const parsed=V.saveCodec.decode(text);parsed.id=freshWorldId('import');validatedSaves.add(parsed);if(!start(parsed.seed,parsed.mode,parsed))throw Error('Chưa lưu được phiên hiện tại. Bản nhập chưa được áp dụng.');if(save(false))toast('Đã nhập thế giới vào một ô lưu riêng.');else openBackup('Đã mở bản nhập nhưng trình duyệt chưa ghi được ô lưu mới. Phiên nhập vẫn đang ở đây; hãy tải JSON dự phòng trước khi rời trang.');return parsed;}
 function loadWorld(id){try{if(app.started&&id===app.id){app.oreVision.reset();app.inHome=false;$('home').classList.add('hidden');$('hud').classList.remove('hidden');hidePanels();if(app.player.health<=0&&!creative()){openPanel('death');}else controls();return true;}const s=V.saveCodec.load(id),legacy=!V.saveCodec.isAdventureSlot(id),originalId=s.id;if(legacy)s.id=freshWorldId('adventure');validatedSaves.add(s);const opened=start(s.seed,s.mode,s);if(opened&&legacy){record('world-copy','Opened a separate adventure copy; original saved world retained.',{originalId,newId:s.id});const stored=save(false);toast(stored?'Đã mở bản sao Hành trình. Ô lưu cũ vẫn được giữ nguyên.':'Đang chơi bản sao Hành trình nhưng chưa lưu được. Hãy xuất JSON.',6500);}return opened;}catch(e){toast('Không mở được bản lưu: '+e.message,6500);record('load-error','Saved world load failed',e.message);return false;}}
 function refreshContinue(){try{const list=V.saveCodec.list();app.lastWorldId=list[0]?.id||null;$('continueBtn').classList.toggle('hidden',!app.lastWorldId&&!app.started);$('continueBtn').textContent=app.started?'Trở lại thế giới đang chơi':list.length?'Tiếp tục · '+(V.savedWorlds?.displayTitle(list[0])||list[0].seed):'Tiếp tục thế giới';}catch{app.lastWorldId=null;$('homeStatus').textContent='Trình duyệt đang chặn lưu. Bạn vẫn có thể chơi và xuất JSON.';}}
 function renderWorlds(){
  const box=$('worldList');box.replaceChildren();
  try{
   const all=V.saveCodec.list(),list=V.savedWorlds?.prepare(all)||all;
   if(!all.length){const p=document.createElement('p');p.className='muted';p.textContent='Chưa có thế giới được lưu tại địa chỉ này. Tạo thế giới mới hoặc nhập tệp JSON.';box.append(p);}
   else if(!list.length){const p=document.createElement('p');p.className='muted world-empty';p.textContent='Không có thế giới khớp bộ lọc. Thử tên khác hoặc bỏ Chỉ yêu thích.';box.append(p);}
   for(const s of list){
    const row=document.createElement('div');row.className='world-entry';row.dataset.worldId=s.id;
    const text=document.createElement('div'),title=document.createElement('strong'),sub=document.createElement('small'),actions=document.createElement('div'),btn=document.createElement('button'),exportButton=document.createElement('button');
    text.className='world-entry-copy';title.textContent=V.savedWorlds?.displayTitle(s)||s.seed;
    sub.textContent=(s.imported?'Minecraft đã nhập':s.mode==='creative'?'Sáng tạo':'Sinh tồn')+' · Ngày '+s.day+' · '+(s.coordinateProfile===V.coordinates.WIDE?'Thế giới mở rộng':'Thế giới cổ điển')+' · '+new Date(s.updated).toLocaleString('vi-VN');
    text.append(title,sub);actions.className='world-entry-actions';
    btn.className='pixel-button';btn.textContent='Vào chơi';btn.dataset.playWorld=s.id;btn.onclick=()=>loadWorld(s.id);actions.append(btn);
    exportButton.className='pixel-button export-world';exportButton.textContent='Xuất JSON';exportButton.dataset.exportWorld=s.id;
    exportButton.title='Tải bản JSON đã lưu của thế giới này mà không mở thế giới.';
    exportButton.onclick=()=>{
     try{
      const raw=V.saveCodec.readRaw(s.id),seed=String(s.seed||'world').replace(/[^a-z0-9_-]/gi,'_').slice(0,64)||'world';
      const filename='MAI_ME_RAP_'+seed+'_'+s.id+'_'+new Date().toISOString().slice(0,10)+'.json';
      downloadText(raw,filename);
      record('world-export','Offered an unchanged validated saved-world envelope for download.',{id:s.id,filename,characters:raw.length});
      toast('Đã gửi tệp JSON của ô lưu này tới trình duyệt để tải.',6500);
     }catch(e){record('world-export-error','Saved-world export failed.',{id:s.id,message:e.message});toast('Không xuất được bản lưu: '+e.message,6500);}
    };
    actions.append(exportButton);
    if(s.coordinateProfile!==V.coordinates.WIDE){const expand=document.createElement('button');expand.className='pixel-button expand-world';expand.textContent='Mở rộng bằng bản sao';expand.dataset.upgradeWorld=s.id;expand.onclick=()=>upgradeWorld(s.id);actions.append(expand);}
    row.append(text,actions);V.savedWorlds?.decorate(s,row,text,actions);box.append(row);
   }
   V.savedWorlds?.finish(all,list);
  }catch(e){box.textContent='Không đọc được bộ nhớ trình duyệt. Bạn có thể nhập bản JSON.';V.savedWorlds?.failedRead();}
 }
 function freshWorldId(tag='world'){for(let i=0;i<16;i++){const id='mk-'+Date.now().toString(36)+'-'+tag+'-'+Math.random().toString(36).slice(2,10);let exists=id===app.id;try{exists=exists||!!localStorage.getItem('mienkhoi.world.v1.'+id)||!!localStorage.getItem('mienkhoi.world.v2.'+id)||!!localStorage.getItem('mienkhoi.world.v024.'+id)||!!localStorage.getItem('mienkhoi.world.v025.'+id)||!!localStorage.getItem('mienkhoi.world.v026.'+id);}catch{}if(!exists)return id;}throw Error('Chưa tạo được mã thế giới riêng. Vui lòng thử lại.');}
 function upgradeWorld(id){try{if(app.started&&app.id!==id&&!save(false)){openBackup('Hãy xuất bản sao phiên hiện tại trước khi mở rộng thế giới.');return false;}const source=app.started&&app.id===id?snapshot():V.saveCodec.load(id),copy=V.saveCodec.upgradeToWide(source,freshWorldId('wide'));if(app.qaStorageFailure)throw Error('Controlled storage failure');V.saveCodec.write(copy);validatedSaves.add(copy);if(!start(copy.seed,copy.mode,copy,true))throw Error('Bản sao đã lưu nhưng chưa mở được.');record('world-upgrade','Opened an explicit expanded copy; original saved world preserved.',{sourceId:id,copyId:copy.id});toast('Đã mở bản sao mở rộng. Thế giới gốc vẫn ở danh sách đã lưu.',6000);return{sourceId:id,copyId:copy.id,coordinateProfile:copy.coordinateProfile};}catch(e){toast('Chưa mở rộng: '+e.message,6500);record('upgrade-error','Expanded world copy was not opened',e.message);return false;}}
 function resetPresentation(){app.cameraState=null;app.cameraMotionState=null;app.cameraMotionDebug=null;app.presentation=null;app.avatarPose=null;app.renderUnderwater=false;}
 const reducedMotionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
 reducedMotionQuery.addEventListener?.('change',()=>{app.cameraMotionState=null;app.cameraMotionDebug=null;});
 function cameraMotionEnabled(){return options.cameraMotion==='gentle'||options.cameraMotion==='auto'&&!reducedMotionQuery.matches;}
 function dismountHorse(){if(!active())return false;const r=V.mounts.dismount(app);toast(r.message);if(r.ok){updateHUD();save(false);}return r.ok;}
 function setPerspective(mode){if(!['first','rear','front'].includes(mode))throw Error('Góc nhìn không hợp lệ.');options.cameraView=mode;app.cameraState=null;app.cameraMotionState=null;app.cameraMotionDebug=null;applySettings();if(!app.panel&&!app.inHome)toast(mode==='first'?'Góc nhìn qua mắt':mode==='rear'?'Góc nhìn từ phía sau':'Góc nhìn từ trước · thao tác vẫn theo hướng nhân vật');return mode;}
 function cyclePerspective(){const modes=['first','rear','front'];return setPerspective(modes[(modes.indexOf(options.cameraView)+1)%modes.length]);}
 function updatePresentationReticle(){const cross=$('crosshair'),mode=app.presentation?.resolvedViewMode||'first';let hidden=app.inHome||!!app.panel||mode==='front',px='50%',py='50%';if(!hidden&&(mode==='rear'||mode==='first'&&Math.hypot(...(app.cameraMotionDebug?.offset||[0,0,0]))>1e-8)){const physical=eye(),dir=direction(),reach=creative()?6:5,distance=app.target?Math.max(0,app.target.distance-.003):reach,point=physical.map((v,i)=>v+dir[i]*distance),camera=app.presentation.cameraWorld.eye,delta=point.map((v,i)=>v-camera[i]),length=Math.hypot(...delta);if(length>1e-6){const obstruction=world.ray(camera,delta.map(v=>v/length),Math.max(0,length-.01));if(obstruction)hidden=true;}const p=V.RenderOrigin.relative(point,renderer.renderOrigin),m=renderer.vp,x=m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],y=m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],z=m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14],w=m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15];if(!(w>0)||Math.abs(x)>w||Math.abs(y)>w||Math.abs(z)>w)hidden=true;else{px=((x/w*.5+.5)*100)+'%';py=((-y/w*.5+.5)*100)+'%';}}cross.style.left=px;cross.style.top=py;cross.classList.toggle('camera-reticle-hidden',hidden);app.reticle={mode,hidden,left:px,top:py};}
 function addItem(id,count=1){if(!V.items[id])return;app.inventory[id]=Math.min(99999,(app.inventory[id]||0)+count);if(!app.hotbar.includes(id)){const slot=app.hotbar.indexOf(0);if(slot>=0)app.hotbar[slot]=id;}renderHotbar();}
 function spend(id,count=1){if(creative())return true;if((app.inventory[id]||0)<count)return false;app.inventory[id]-=count;if(!app.inventory[id])for(let i=0;i<9;i++)if(app.hotbar[i]===id)app.hotbar[i]=0;renderHotbar();return true;}
 function icon(id){return textures.icons[id]||textures.icons[0]||'';}
 function slotElement(id,index){const b=document.createElement('button');b.className='slot'+(index===app.selected?' selected':'');b.title=item(id).name+' · '+(index+1);b.setAttribute('aria-label',b.title);b.dataset.slot=String(index);if(id){const img=document.createElement('img');img.src=icon(id);img.alt='';b.append(img);}const key=document.createElement('span');key.className='key';key.textContent=index+1;const count=document.createElement('span');count.className='count';count.textContent=id?(creative()&&item(id).kind==='block'?'∞':creative()?'':app.inventory[id]||''):'';count.dataset.digits=String(Math.min(5,Math.max(1,count.textContent.length)));b.append(key,count);if(id&&item(id).kind==='tool'&&!creative()){const wrap=document.createElement('span'),bar=document.createElement('i');wrap.className='tool-health';bar.style.width=(100*(1-(app.wear[id]||0)/(item(id).durability||100)))+'%';wrap.append(bar);b.append(wrap);}b.onclick=()=>selectSlot(index);return b;}
 function renderHotbar(){for(const name of ['hotbar','inventoryHotbar']){$(name).replaceChildren(...app.hotbar.map((id,i)=>slotElement(id,i)));}$('itemName').textContent=item(selectedId()).name;V.inventoryFavourites.refresh(app);}
 function selectSlot(index){app.selected=mod9(index);app.mining=0;app.miningKey='';renderHotbar();Audio.tone(380,.03,'square',.01);}
 const mod9=n=>(n%9+9)%9;
 // C12 inventory favourites: UI preference only; never acquires or consumes items.
 // C14 named hotbar presets. Storage is changed only by explicit save, delete or reset.
 V.hotbarPresets = (() => {
  const KEY='mienkhoi.hotbar-presets.v1',SLOTS=4,ITEMS=9,MAX_RAW=4096,states=new WeakMap();
  const empty=()=>Array(SLOTS).fill(null);
  const clone=slots=>slots.map(slot=>slot?{name:slot.name,ids:slot.ids.slice()}:null);
  function validId(id){const info=V.items[id];return Number.isInteger(id)&&(id===0||(id>0&&id<=V.BLOCK_ID_MAX&&id!==13&&!!info&&info.id===id&&!info.creativeHidden));}
  function validIds(ids){return Array.isArray(ids)&&ids.length===ITEMS&&Array.from(ids).every(validId);}
  function nameOf(value){return Array.from(String(value).normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/gu,'').replace(/\s+/gu,' ').trim()).slice(0,32).join('').trim();}
  function exactKeys(value,keys){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.prototype.hasOwnProperty.call(value,key));}
  function uniqueKeys(raw){
   // JSON.parse has already checked grammar. This bounded scan catches duplicate
   // decoded object keys, including equivalent spellings such as "name"/"na\u006de".
   const stack=[];
   for(let i=0;i<raw.length;i++){
    const char=raw[i];
    if(char==='{'||char==='['){stack.push(char==='{'?new Set():null);continue;}
    if(char==='}'||char===']'){stack.pop();continue;}
    if(char!=='"')continue;
    const start=i++;
    while(i<raw.length){if(raw[i]==='\\'){i+=2;continue;}if(raw[i]==='"')break;i++;}
    let next=i+1;while(/\s/.test(raw[next]||'')&&next<raw.length)next++;
    if(raw[next]!==':')continue;
    const key=JSON.parse(raw.slice(start,i+1)),keys=stack[stack.length-1];
    if(!keys||keys.has(key))throw Error('duplicate key');keys.add(key);
   }
  }
  function decode(raw){
   if(raw===null)return{slots:empty(),status:'empty'};
   try{
    if(typeof raw!=='string'||raw.length>MAX_RAW)throw Error('size');
    const value=JSON.parse(raw);uniqueKeys(raw);
    if(value&&typeof value==='object'&&!Array.isArray(value)&&Number.isInteger(value.version)&&value.version>1)return{status:'future'};
    if(!exactKeys(value,['version','slots'])||value.version!==1||!Array.isArray(value.slots)||value.slots.length!==SLOTS)throw Error('shape');
    for(const slot of value.slots){
     if(slot===null)continue;
     if(!exactKeys(slot,['name','ids'])||typeof slot.name!=='string'||!slot.name||nameOf(slot.name)!==slot.name||!validIds(slot.ids))throw Error('slot');
    }
    return{slots:clone(value.slots),status:'valid'};
   }catch{return{status:'invalid'};}
  }
  function session(app){return !!app.started&&!app.starting&&!app.inHome&&!app.contextLost&&app.panel==='inventory';}
  function chosen(s){return Number.isInteger(s.selected)&&s.selected>=0&&s.selected<SLOTS?s.selected:0;}
  function syncName(s){s.name.value=s.slots[chosen(s)]?.name||'';s.dirty=false;}
  function read(s){
   let data;try{data=decode(globalThis.localStorage.getItem(KEY));}catch{data={status:'unavailable'};}
   const before=JSON.stringify(s.slots);s.readStatus=data.status;s.blocked=!data.slots;
   if(data.slots){s.slots=data.slots;if(before!==JSON.stringify(s.slots)&&!s.dirty)syncName(s);}
  }
  function notice(s){
   if(s.readStatus==='future')return'Bộ thanh nhanh được lưu bởi phiên bản mới hơn. Các bộ đã đọc được vẫn dùng trong phiên này. Đặt lại để lưu bộ mới.';
   if(s.readStatus==='invalid')return'Chưa đọc được các bộ thanh nhanh. Các bộ đã đọc được vẫn dùng trong phiên này. Đặt lại để lưu bộ mới.';
   if(s.readStatus==='unavailable')return'Chưa truy cập được các bộ thanh nhanh đã lưu. Hãy thử mở lại túi đồ.';
   return'';
  }
  function setText(el,value){if(el.textContent!==value)el.textContent=value;}
  function paint(app,s){
   const index=chosen(s),slot=s.slots[index],ready=session(app);
   for(let i=0;i<SLOTS;i++)setText(s.select.options[i],(i+1)+'. '+(s.slots[i]?.name||'Chưa lưu'));
   s.select.value=String(index);
   const signature=slot?JSON.stringify(slot.ids):'empty';
   if(s.previewSignature!==signature||s.preview.children.length!==ITEMS){
    const rows=Array.from({length:ITEMS},(_,i)=>{
     const id=slot?.ids[i]||0,row=document.createElement('li'),number=document.createElement('span'),label=document.createElement('span');
     row.dataset.slot=String(i);row.dataset.item=String(id);number.className='hotbar-preset-index';number.textContent=String(i+1);label.textContent=id?V.items[id].name:'Trống';
     row.append(number,label);return row;
    });
    s.preview.replaceChildren(...rows);s.previewSignature=signature;
   }
   s.select.disabled=!ready;s.name.disabled=!ready;
   s.save.disabled=!ready||s.blocked||!validIds(app.hotbar);
   s.apply.disabled=!ready||app.mode!=='creative'||!slot;
   s.remove.disabled=!ready||s.blocked||!slot;
   s.reset.hidden=!s.blocked;s.reset.disabled=!ready;
   s.save.textContent=slot?'Lưu đè bộ này':'Lưu thanh hiện tại';
   s.remove.setAttribute('aria-label',slot?'Xóa bộ '+slot.name:'Xóa bộ đang chọn');
   setText(s.help,app.mode==='creative'?'Lưu 9 ô đang dùng thành một bộ. Chọn bộ rồi Áp dụng để đổi thanh nhanh.':'Có thể lưu và xóa bộ. Áp dụng chỉ dùng trong Sáng tạo.');
   const warning=notice(s),feedback=s.message||(!slot?'Bộ '+(index+1)+' chưa được lưu.':'Đang xem bộ '+slot.name+'.');
   setText(s.status,warning?warning+(s.message?' '+s.message:''):feedback);
   s.status.dataset.notice=String(!!warning||s.lastWrite==='failed');
  }
  function render(app){const s=states.get(app);if(!s)return;read(s);paint(app,s);}
  function write(app,s,next,message){
   const encoded=JSON.stringify({version:1,slots:next});
   try{if(encoded.length>MAX_RAW)throw Error('size');globalThis.localStorage.setItem(KEY,encoded);}
   catch{s.lastWrite='failed';s.message='Chưa lưu được thay đổi. Bộ đã lưu vẫn được giữ.';paint(app,s);return false;}
   s.slots=clone(next);s.readStatus='valid';s.blocked=false;s.lastWrite='saved';s.message=message;syncName(s);paint(app,s);return true;
  }
  function save(app){
   const s=states.get(app);if(!s||!session(app))return false;read(s);
   if(s.blocked||!validIds(app.hotbar)){s.message=s.blocked?'':'Thanh nhanh có vật phẩm chưa thể lưu.';paint(app,s);return false;}
   const next=clone(s.slots),index=chosen(s),name=nameOf(s.name.value)||'Bộ '+(index+1);
   next[index]={name,ids:app.hotbar.slice()};return write(app,s,next,'Đã lưu bộ '+name+'.');
  }
  function apply(app){
   const s=states.get(app);if(!s||!session(app)||app.mode!=='creative')return false;read(s);
   const slot=s.slots[chosen(s)];if(!slot){paint(app,s);return false;}
   app.hotbar=slot.ids.slice();s.ctx.renderHotbar();s.message='Đã áp dụng bộ '+slot.name+'.';paint(app,s);return true;
  }
  function remove(app){
   const s=states.get(app);if(!s||!session(app))return false;read(s);
   const index=chosen(s),slot=s.slots[index];if(s.blocked||!slot){paint(app,s);return false;}
   const next=clone(s.slots);next[index]=null;return write(app,s,next,'Đã xóa bộ '+slot.name+'.');
  }
  function reset(app){
   const s=states.get(app);if(!s||!session(app)||!s.blocked)return false;
   try{globalThis.localStorage.removeItem(KEY);}catch{s.lastWrite='failed';s.message='Chưa đặt lại được các bộ đã lưu.';paint(app,s);return false;}
   s.slots=empty();s.readStatus='empty';s.blocked=false;s.lastWrite='reset';s.message='Đã đặt lại các bộ thanh nhanh.';syncName(s);paint(app,s);return true;
  }
  function init(app,ctx){
   if(states.has(app)){render(app);return;}
   if(!ctx||typeof ctx.renderHotbar!=='function')throw Error('Hotbar presets callback is required');
   const ids={select:'hotbarPresetSlot',name:'hotbarPresetName',preview:'hotbarPresetPreview',save:'hotbarPresetSave',apply:'hotbarPresetApply',remove:'hotbarPresetDelete',reset:'hotbarPresetReset',status:'hotbarPresetStatus',help:'hotbarPresetHelp'},els={};
   for(const [key,id] of Object.entries(ids)){els[key]=document.getElementById(id);if(!els[key])throw Error('Hotbar presets control is missing: '+id);}
   if(els.select.tagName!=='SELECT'||els.select.options.length!==SLOTS||els.name.tagName!=='INPUT'||els.preview.tagName!=='OL')throw Error('Hotbar presets controls are invalid');
   const s={...els,ctx,slots:empty(),selected:0,dirty:false,readStatus:'empty',blocked:false,lastWrite:'not-attempted',message:'',previewSignature:null};states.set(app,s);
   s.select.onchange=()=>{const index=Number(s.select.value);if(!Number.isInteger(index)||index<0||index>=SLOTS)return;s.selected=index;s.message='';syncName(s);paint(app,s);};
   s.name.oninput=()=>{s.dirty=true;};s.save.onclick=()=>save(app);s.apply.onclick=()=>apply(app);s.remove.onclick=()=>remove(app);s.reset.onclick=()=>reset(app);
   render(app);syncName(s);
  }
  function inspect(app){
   const s=states.get(app);if(!s)return null;const slot=s.slots[chosen(s)],ready=session(app);
   return{version:1,storageKey:KEY,slotCount:SLOTS,itemCount:ITEMS,maxRaw:MAX_RAW,selectedSlot:chosen(s),slots:clone(s.slots),readStatus:s.readStatus,lastWrite:s.lastWrite,storageBlocked:s.blocked,message:s.message,canSave:ready&&!s.blocked&&validIds(app.hotbar),canApply:ready&&app.mode==='creative'&&!!slot,canDelete:ready&&!s.blocked&&!!slot};
  }
  return Object.freeze({init,render,inspect,storageKey:KEY,slotCount:SLOTS,itemCount:ITEMS});
 })();
 V.inventoryFavourites = (() => {
  const KEY='mienkhoi.inventory-favourites.v1',LIMIT=24,MAX_TEXT=1024,states=new WeakMap();
  function material(id){const info=V.items[id];return Number.isInteger(id)&&id>0&&id<=V.BLOCK_ID_MAX&&id!==13&&!!info&&info.id===id&&!info.creativeHidden&&(info.kind||'block')==='block';}
  function decoded(raw){
   if(raw===null)return{ids:[],readStatus:'empty',message:''};
   try{
    if(typeof raw!=='string'||raw.length>MAX_TEXT)throw Error('size');
    const data=JSON.parse(raw);
    if(!data||Array.isArray(data)||Object.keys(data).length!==2||data.version!==1||!Array.isArray(data.ids)||data.ids.length>LIMIT)throw Error('shape');
    if(!Object.prototype.hasOwnProperty.call(data,'version')||!Object.prototype.hasOwnProperty.call(data,'ids'))throw Error('keys');
    const ids=[];for(const id of data.ids)if(material(id)&&!ids.includes(id))ids.push(id);
    return{ids,readStatus:ids.length===data.ids.length?'valid':'pruned',message:''};
   }catch{return{ids:[],readStatus:'invalid',message:'Chưa đọc được danh sách ghim. Bạn có thể ghim lại.'};}
  }
  function read(){try{return decoded(globalThis.localStorage.getItem(KEY));}catch{return{ids:[],readStatus:'unavailable',message:'Danh sách ghim chỉ dùng trong phiên này.'};}}
  function text(el,value){if(el.textContent!==value)el.textContent=value;}
  function refreshManager(s){
   const ids=[...s.ids],signature=ids.join(','),previous=Number(s.manage.value);
   if(s.managerSignature!==signature){
    const options=ids.map(id=>{const option=document.createElement('option');option.value=String(id);option.textContent=V.items[id].name;return option;});
    if(!options.length){const option=document.createElement('option');option.value='';option.textContent='Chưa có vật liệu đã ghim';options.push(option);}
    s.manage.replaceChildren(...options);
    s.manage.value=String(ids.includes(previous)?previous:ids[0]||'');
    s.managerSignature=signature;
   }
   const id=Number(s.manage.value),valid=material(id)&&s.ids.has(id);
   s.manage.disabled=ids.length===0;s.remove.disabled=!valid;
   s.remove.setAttribute('aria-label',valid?'Bỏ ghim '+V.items[id].name:'Bỏ ghim vật liệu trong danh sách');
  }
  function refresh(app){
   const s=states.get(app);if(!s)return;
   const id=s.ctx.selectedId(),valid=material(id),pinned=valid&&s.ids.has(id),name=valid?V.items[id].name:'';
   text(s.name,valid?name:'Chọn một khối để ghim');
   text(s.toggle,'Ghim');
   s.toggle.disabled=!valid;s.toggle.setAttribute('aria-pressed',String(pinned));
   s.toggle.setAttribute('aria-label',valid?'Ghim '+name:'Ghim vật liệu đang chọn');
   s.filter.checked=s.only;
   text(s.status,s.message?s.message+' ('+s.ids.size+'/'+LIMIT+')':(valid?(pinned?'Đã ghim':'Chưa ghim')+' · ':'')+s.ids.size+'/'+LIMIT);
   s.status.dataset.notice=String(!!s.message);
   refreshManager(s);
  }
  function persist(s){
   try{globalThis.localStorage.setItem(KEY,JSON.stringify({version:1,ids:[...s.ids]}));s.lastWrite='saved';s.message='';}
   catch{s.lastWrite='failed';s.message='Danh sách ghim chỉ được giữ trong phiên này.';}
  }
  function toggle(app){
   const s=states.get(app);if(!s||app.panel!=='inventory')return false;
   const id=s.ctx.selectedId();
   if(!material(id)){s.message='Chọn một khối vật liệu rồi nhấn Ghim.';refresh(app);return false;}
   if(s.ids.has(id))s.ids.delete(id);
   else{
    if(s.ids.size>=LIMIT){s.message='Đã đủ '+LIMIT+' vật liệu. Bỏ ghim một mục trước.';refresh(app);return false;}
    s.ids.add(id);
   }
   persist(s);s.ctx.renderInventory();refresh(app);return true;
  }
  function removeManaged(app){
   const s=states.get(app);if(!s||app.panel!=='inventory')return false;
   const id=Number(s.manage.value);
   if(!material(id)||!s.ids.has(id)){refresh(app);return false;}
   s.ids.delete(id);persist(s);s.ctx.renderInventory();refresh(app);return true;
  }
  function init(app,ctx){
   if(states.has(app)){refresh(app);return;}
   if(!ctx||typeof ctx.selectedId!=='function'||typeof ctx.renderInventory!=='function')throw Error('Inventory favourites callbacks are required');
   const name=document.getElementById('inventoryFavouriteName'),button=document.getElementById('inventoryFavouriteToggle'),filter=document.getElementById('inventoryFavouritesOnly'),status=document.getElementById('inventoryFavouritesStatus'),manage=document.getElementById('inventoryFavouriteManageSelect'),remove=document.getElementById('inventoryFavouriteRemove');
   if(!name||button?.tagName!=='BUTTON'||filter?.tagName!=='INPUT'||filter.type!=='checkbox'||!status||manage?.tagName!=='SELECT'||remove?.tagName!=='BUTTON')throw Error('Inventory favourites controls are missing');
   const saved=read(),s={ctx,name,toggle:button,filter,status,manage,remove,managerSignature:null,ids:new Set(saved.ids),only:false,readStatus:saved.readStatus,lastWrite:'not-attempted',message:saved.message};
   states.set(app,s);
   button.onclick=()=>toggle(app);
   remove.onclick=()=>removeManaged(app);
   manage.onchange=()=>refresh(app);
   filter.onchange=()=>{s.only=!!filter.checked;s.ctx.renderInventory();refresh(app);};
   refresh(app);
  }
  function has(app,id){return states.get(app)?.ids.has(id)===true;}
  function only(app){return states.get(app)?.only===true;}
  function emptyMessage(app){
   const s=states.get(app);if(!s?.only)return'';
   return s.ids.size?'Không có vật liệu đã ghim phù hợp. Đổi mục, tìm tên khác hoặc bỏ lọc.':'Chưa ghim vật liệu. Bỏ lọc, chọn một khối rồi nhấn Ghim.';
  }
  function inspect(app){
   const s=states.get(app);if(!s)return null;
   const selected=s.ctx.selectedId();
   return{version:1,storageKey:KEY,limit:LIMIT,ids:[...s.ids],only:s.only,selected,selectedIsMaterial:material(selected),readStatus:s.readStatus,lastWrite:s.lastWrite,message:s.message};
  }
  return Object.freeze({init,refresh,has,only,emptyMessage,inspect,storageKey:KEY,limit:LIMIT});
 })();


 function nearestStation(id){const p=app.player;let found=null,best=25;for(let y=Math.floor(p.y)-5;y<=Math.floor(p.y)+5;y++)for(let z=Math.floor(p.z)-5;z<=Math.floor(p.z)+5;z++)for(let x=Math.floor(p.x)-5;x<=Math.floor(p.x)+5;x++){const d=(x+.5-p.x)**2+(y+.5-p.y)**2+(z+.5-p.z)**2;if(d<=best&&world.get(x,y,z)===id){best=d;found={x,y,z,id};}}return found;}
 function finishFarm(result){
  if(!result?.ok){const messages={soil:'Cần đất hoặc cỏ để xới; hạt giống cần đất canh tác.',occupied:'Ô trồng cần khoảng trống.',unloaded:'Vùng này chưa sẵn sàng.',covered:'Phía trên cây cần khoảng trống.',dry:'Đặt nước gần đất canh tác để cây lớn.', 'plant-limit':'Đã có 256 cây đang lớn.', 'already-farmland':'Ô đất này đã được xới.', 'edit-capacity':'Bản lưu đã đạt giới hạn khối sửa.', 'hoe-required':'Cầm cuốc xới để làm đất.', 'seeds-required':'Cầm hạt lúa mì để gieo.'};toast(messages[result?.reason]||'Chưa thể thao tác ở ô này.');return false;}
  for(const[id,n]of result.consume||[])spend(id,n);if(result.wear)toolWear(result.wear);for(const[id,n]of result.drops||[])addItem(id,n);
  app.swing=1;app.mining=0;app.miningKey='';Audio.noise('grass',.08);
  if(result.to===0){app.progress.mined=(app.progress.mined||0)+1;spawnParticles(...result.coords,result.from);}
  else if(result.to===39)app.progress.placed=(app.progress.placed||0)+1;
  if(result.to===0&&result.from===42)V.journey.observe(app,'farm',{from:result.from});
  return true;
 }

 function stationNear(id){const p=app.player;for(let y=Math.floor(p.y)-3;y<=Math.floor(p.y)+3;y++)for(let z=Math.floor(p.z)-5;z<=Math.floor(p.z)+5;z++)for(let x=Math.floor(p.x)-5;x<=Math.floor(p.x)+5;x++)if((x+.5-p.x)**2+(y+.5-p.y)**2+(z+.5-p.z)**2<=25&&world.get(x,y,z)===id)return true;return false;}
 function stationAvailable(recipe){if(creative()||!recipe.station)return true;return stationNear(recipe.station==='furnace'?32:18);}
 /* C12_BATCH_CRAFT_TRANSACTION_V1_BEGIN */
 function recipeBatchQuote(recipe,inventory,isCreative,requested=1){
  const bad=reason=>({valid:false,reason,executions:0,outputCount:0,needs:[],missing:[],materials:false,room:false,enabled:false,maxExecutions:0});
  if(!recipe||!Array.isArray(recipe.need)||!Array.isArray(recipe.out)||recipe.out.length!==2||!Number.isSafeInteger(recipe.out[0])||recipe.out[0]<1||!Number.isSafeInteger(recipe.out[1])||recipe.out[1]<1||recipe.out[1]>99999)return bad('recipe');
  if(requested!=='max'&&(!Number.isSafeInteger(requested)||requested<1||requested>99999))return bad('quantity');
  const costs=new Map();
  for(const row of recipe.need){
   if(!Array.isArray(row)||row.length!==2||!Number.isSafeInteger(row[0])||row[0]<1||!Number.isSafeInteger(row[1])||row[1]<1||row[1]>99999)return bad('recipe');
   const total=(costs.get(row[0])||0)+row[1];if(!Number.isSafeInteger(total))return bad('recipe');costs.set(row[0],total);
  }
  const have=id=>inventory[id]??0,outId=recipe.out[0],unitOut=recipe.out[1];
  for(const id of new Set([...costs.keys(),outId]))if(!Number.isSafeInteger(have(id))||have(id)<0||have(id)>99999)return bad('inventory');
  let resourceLimit=99999;
  if(!isCreative)for(const[id,n]of costs)resourceLimit=Math.min(resourceLimit,Math.floor(have(id)/n));
  const netOut=unitOut-(isCreative?0:costs.get(outId)||0),capacityLimit=netOut>0?Math.floor((99999-have(outId))/netOut):99999;
  const maxExecutions=Math.max(0,Math.min(99999,resourceLimit,capacityLimit)),executions=requested==='max'?maxExecutions:requested,previewExecutions=executions||1;
  const needs=[...costs].map(([id,n])=>[id,n*previewExecutions]),missing=isCreative?[]:needs.filter(([id,n])=>have(id)<n).map(([id,n])=>({id,have:have(id),need:n,short:n-have(id)}));
  const materials=missing.length===0,resultingOutput=have(outId)+netOut*previewExecutions,room=Number.isSafeInteger(resultingOutput)&&resultingOutput>=0&&resultingOutput<=99999;
  return{valid:true,reason:null,executions,outputId:outId,outputCount:unitOut*executions,needs,missing,materials,room,maxExecutions,resultingOutput,enabled:executions>0&&materials&&room};
 }
 function recipeBatchRequest(){return $('recipeBatchMax').getAttribute('aria-pressed')==='true'?'max':$('recipeBatchQuantity').valueAsNumber;}
 function refreshRecipeBatchControls(){
  const isMax=$('recipeBatchMax').getAttribute('aria-pressed')==='true';
  $('recipeBatchQuantity').disabled=isMax;$('recipeBatchMax').textContent='Tối đa';
  $('recipeBatchQuantity').setAttribute('aria-invalid',String(!isMax&&(!Number.isSafeInteger($('recipeBatchQuantity').valueAsNumber)||$('recipeBatchQuantity').valueAsNumber<1||$('recipeBatchQuantity').valueAsNumber>99999)));
  renderRecipes(stationNear(18),!!nearestStation(32));
 }
 function craft(recipe,requested=1){
  if(!recipe||!V.recipes.includes(recipe)){toast('Công thức không còn phù hợp.');return false;}
  if(recipe.station==='furnace'){const furnace=nearestStation(32);if(!furnace){toast('Đặt một lò nung trong tầm 5 khối.');return false;}return V.services.openFurnace(app,furnace,recipe.need[0][0]);}
  if(!stationAvailable(recipe)){toast('Cần đứng gần bàn chế tạo.');return false;}
  const isCreative=creative(),batch=recipeBatchQuote(recipe,app.inventory,isCreative,requested);
  if(!batch.valid){toast(batch.reason==='quantity'?'Số lượt phải là số nguyên từ 1 đến 99.999.':'Công thức hoặc số lượng trong túi không hợp lệ.');return false;}
  if(!batch.materials){toast('Chưa đủ nguyên liệu.');return false;}
  if(!batch.room||!batch.executions){toast('Túi đồ không còn chỗ cho thành phẩm. Nguyên liệu được giữ lại.');return false;}
  const next={...app.inventory},nextHotbar=app.hotbar.slice();
  if(!isCreative)for(const[id,n]of batch.needs){next[id]=(next[id]||0)-n;if(!next[id])for(let i=0;i<9;i++)if(nextHotbar[i]===id)nextHotbar[i]=0;}
  next[batch.outputId]=(next[batch.outputId]||0)+batch.outputCount;
  if(Object.values(next).some(n=>!Number.isSafeInteger(n)||n<0||n>99999)){toast('Túi đồ không còn chỗ cho thành phẩm. Nguyên liệu được giữ lại.');return false;}
  if(!nextHotbar.includes(batch.outputId)){const slot=nextHotbar.indexOf(0);if(slot>=0)nextHotbar[slot]=batch.outputId;}
  Object.assign(app.inventory,next);app.hotbar=nextHotbar;
  app.progress.crafted=Math.min(10000000,(app.progress.crafted||0)+batch.executions);
  V.journey.observe(app,'craft',batch.executions===1?{recipeId:recipe.id}:{recipeId:recipe.id,executions:batch.executions});
  Audio.tone(780,.12,'triangle',.11);
  toast('Đã chế tạo '+batch.outputCount+' × '+item(batch.outputId).name+(batch.executions===1?'':' ('+batch.executions+' lượt)'));
  renderInventory();save(false);return true;
 }
 /* C12_BATCH_CRAFT_TRANSACTION_V1_END */

 function recipeSearchKey(value){return String(value??'').toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/\s+/g,' ').trim();}
 function recipeAvailability(recipe,inventory,isCreative,bench,furnace,requested=1){
  if(recipe.station!=='furnace'){
   const batch=recipeBatchQuote(recipe,inventory,isCreative,requested),station=!recipe.station||isCreative||bench;
   return{missing:batch.missing,materials:batch.materials,station,room:batch.room,isFurnace:false,batch,quantityError:!batch.valid,enabled:batch.enabled&&station};
  }
  const missing=isCreative?[]:recipe.need.filter(([id,n])=>(inventory[id]||0)<n).map(([id,n])=>({id,have:inventory[id]||0,need:n,short:n-(inventory[id]||0)}));
  const materials=missing.length===0,station=furnace;
  return{missing,materials,station,room:true,isFurnace:true,batch:null,quantityError:false,enabled:materials&&station};
 }

 function renderRecipes(bench,furnace){
  V.recipePlan.refresh(app,{bench,furnace});
  const isCreative=creative(),requested=recipeBatchRequest(),query=recipeSearchKey($('recipeSearch').value),tokens=query?query.split(' '):[],materialsOnly=$('craftReadyOnly').checked,recipes=$('recipes');recipes.replaceChildren();let shown=0;
  for(const recipe of V.recipes){
   const searchText=recipeSearchKey([recipe.name,item(recipe.out[0]).name,...recipe.need.map(([id])=>item(id).name)].join(' ')),state=recipeAvailability(recipe,app.inventory,isCreative,bench,furnace,requested);
   if(tokens.some(token=>!searchText.includes(token))||(materialsOnly&&!state.materials))continue;
   const b=document.createElement('button');b.type='button';b.className='recipe';b.dataset.recipe=recipe.id;b.dataset.ready=String(state.enabled);b.disabled=!state.enabled;
   const im=document.createElement('img');im.src=icon(recipe.out[0]);im.alt='';
   const label=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small'),status=document.createElement('span');status.className='recipe-status';
   const outputCount=state.isFurnace?recipe.out[1]:(state.batch?.outputCount||0);strong.textContent=recipe.name+' ×'+outputCount;b.dataset.batchExecutions=String(state.isFurnace?1:state.batch?.executions||0);b.dataset.outputCount=String(outputCount);
   small.textContent=(state.isFurnace?recipe.need:state.batch?.needs||[]).map(([id,n])=>n+' '+item(id).name).join(' · ')+(state.isFurnace?' · 10 giây + nhiên liệu':'');
   const reasons=[];if(state.quantityError)reasons.push(state.batch?.reason==='quantity'?'Số lượt phải là số nguyên từ 1 đến 99.999':'Công thức hoặc số lượng trong túi không hợp lệ');
   if(state.missing.length)reasons.push('Thiếu '+state.missing.map(x=>x.short+' '+item(x.id).name+' ('+x.have+'/'+x.need+')').join('; '));
   if(!state.station)reasons.push(state.isFurnace?'Cần lò nung trong tầm 5 khối':'Cần bàn chế tạo trong tầm 5 khối');
   if(!state.room&&!state.quantityError)reasons.push('Túi thành phẩm đã đầy (tối đa 99.999)');
   status.textContent=reasons.length?reasons.join(' · '):state.isFurnace?'Mở lò để nạp nguyên liệu và nhiên liệu':isCreative?'Sáng tạo · chế tạo ngay':'Đủ nguyên liệu · chế tạo ngay';
   if(!state.isFurnace&&state.enabled&&state.batch.executions>1)status.textContent=state.batch.executions+' lượt / nhận '+state.batch.outputCount+' '+item(recipe.out[0]).name+' / '+status.textContent;
   label.append(strong,small,status);b.append(im,label);b.onclick=()=>craft(recipe,state.isFurnace?1:recipeBatchRequest());const row=document.createElement('div');row.className='recipe-plan-recipe-row';row.append(b,V.recipePlan.button(app,recipe,requested));recipes.append(row);shown++;
  }
  if(!shown){const empty=document.createElement('p');empty.className='recipe-empty';empty.textContent='Không có công thức phù hợp. Hãy xóa tìm kiếm hoặc bỏ lọc đủ nguyên liệu.';recipes.append(empty);}
  const summary=shown+'/'+V.recipes.length+' công thức'+(materialsOnly?' · đã lọc đủ nguyên liệu':''),results=$('recipeResults');if(results.textContent!==summary)results.textContent=summary;
  $('recipeFilterClear').disabled=!$('recipeSearch').value&&!materialsOnly;
 }
 // C25 collection filter changes only which existing inventory buttons are shown.
 const CRAFTED_FILTER_FAMILIES=Object.freeze(['surface','slab','stair','column','screen','furniture','detail']);
 const craftedFilterDefinitions=new Map(globalThis.VoxelC25Crafted.defs.map(def=>[def.id,def]));
 V.craftedCatalogFilter=(()=>{
  function current(){const key=$('craftedFamilyFilter')?.value||'all';return app.tab==='all'||app.tab==='block'?(key==='new'||CRAFTED_FILTER_FAMILIES.includes(key)?key:'all'):'all';}
  function matches(id,key=current()){if(key==='all')return true;const def=craftedFilterDefinitions.get(Number(id));return key==='new'?!!def:CRAFTED_FILTER_FAMILIES.includes(key)?def?.family===key:true;}
  function refresh(){const active=app.tab==='all'||app.tab==='block',select=$('craftedFamilyFilter'),group=$('craftedFilterGroup'),result=$('craftedFilterResult');group.hidden=!active;$('craftedFilterClear').disabled=select.value==='all';const shown=$('inventoryGrid').querySelectorAll('.item-cell').length,label=select.selectedOptions[0]?.textContent||'Tất cả vật phẩm',message='Đang hiện '+shown+' vật phẩm'+(current()==='all'?'':' · '+label);if(result.textContent!==message)result.textContent=message;}
  function inspect(){return{selected:$('craftedFamilyFilter')?.value||'all',applied:current(),visible:!$('craftedFilterGroup').hidden,shown:$('inventoryGrid').querySelectorAll('.item-cell').length,groups:CRAFTED_FILTER_FAMILIES.map(family=>({family,count:[...craftedFilterDefinitions.values()].filter(d=>d.family===family).length})),newCount:craftedFilterDefinitions.size,storageWrites:false};}
  return Object.freeze({matches,current,refresh,inspect});
 })();
 function renderInventory(){const grid=$('inventoryGrid'),query=recipeSearchKey($('itemSearch').value);$('inventoryMode').textContent=creative()?'TÚI ĐỒ SÁNG TẠO':'TÚI ĐỒ SINH TỒN';grid.replaceChildren();for(const info of Object.values(V.items)){if(!info||!info.id||info.id===13||info.creativeHidden||(!creative()&&!(app.inventory[info.id]>0)))continue;const kind=info.kind||'block';if(app.tab==='block'&&kind!=='block'||app.tab==='tool'&&kind!=='tool'||app.tab==='food'&&!['food','material'].includes(kind)||app.tab==='spawn_egg'&&kind!=='spawn_egg')continue;if(V.inventoryFavourites.only(app)&&!V.inventoryFavourites.has(app,info.id))continue;if(!V.craftedCatalogFilter.matches(info.id))continue;if(query&&!recipeSearchKey(info.name).includes(query))continue;const b=document.createElement('button');b.className='item-cell';b.title=info.name;b.dataset.item=String(info.id);b.dataset.favourite=String(V.inventoryFavourites.has(app,info.id));b.setAttribute('aria-label',info.name);const im=document.createElement('img');im.src=icon(info.id);im.alt=info.name;b.append(im);if(!creative()){const c=document.createElement('span');c.className='item-count';c.textContent=app.inventory[info.id];c.dataset.digits=String(Math.min(5,Math.max(1,c.textContent.length)));b.append(c);}b.onclick=()=>{if(creative())app.inventory[info.id]=Math.max(app.inventory[info.id]||0,64);app.hotbar[app.selected]=info.id;renderHotbar();$('inventoryDetail').textContent=info.name+' → ô '+(app.selected+1)+'. '+(info.kind==='tool'?'Dụng cụ giúp đào nhanh hơn và lấy đúng tài nguyên.':info.description||'');V.crafting3?.select(app,info.id);};b.draggable=true;b.ondragstart=e=>{if(e.dataTransfer){e.dataTransfer.setData('text/plain','mmr-item:'+info.id);e.dataTransfer.effectAllowed='copy';}};b.onmouseenter=()=>{if(document.activeElement===$('inventoryDetail'))return;$('inventoryDetail').textContent=info.name+(creative()?' · Có sẵn':' · '+app.inventory[info.id]+' trong túi');};grid.append(b);}if(!grid.children.length){const p=document.createElement('p');p.className='muted small-text';p.style.gridColumn='1/-1';p.textContent=V.inventoryFavourites.emptyMessage(app)||(query?'Không có vật phẩm phù hợp.':V.craftedCatalogFilter.current()!=='all'?'Chưa có vật phẩm phù hợp trong nhóm này. Thử Bỏ lọc hoặc đổi tìm kiếm.':'Túi đồ còn trống. Hãy chặt một thân cây để bắt đầu.');grid.append(p);}V.craftedCatalogFilter.refresh();const bench=stationNear(18),furnace=!!nearestStation(32);$('stationLabel').textContent=creative()?'Sáng tạo: không cần nguyên liệu khi chế tạo. Công thức nung vẫn cần lò ở gần.':(bench?'✓ Bàn chế tạo trong tầm. ':'Đứng gần bàn để chế tạo dụng cụ. ')+(furnace?'✓ Lò nung trong tầm.':'');renderRecipes(bench,furnace);renderHotbar();V.hotbarPresets.render(app);V.crafting3?.render(app);}
 function toolWear(id){const info=item(id);if(creative()||info.kind!=='tool')return;app.wear[id]=(app.wear[id]||0)+1;if(app.wear[id]>=(info.durability||100)){spend(id,1);app.wear[id]=0;toast(info.name+' đã hỏng.');}renderHotbar();}
 function spawnParticles(x,y,z,id){for(let i=0;i<10;i++)app.particles.push({x:x+.2+Math.random()*.6,y:y+.2+Math.random()*.6,z:z+.2+Math.random()*.6,vx:(Math.random()-.5)*3,vy:1+Math.random()*3,vz:(Math.random()-.5)*3,life:.5+Math.random()*.45,id});}
 function breakTarget(target){if(!target)return false;const id=target.id,def=V.blocks[id],held=item(selectedId());if((id===13||def?.breakable===false)&&!creative()){toast(id===13?'Đá nền không thể đào trong Sinh tồn.':'Khối này không thể đào trong Sinh tồn.');return false;}if(def?.crop){const drops=id===42?[[121,1],[120,2]]:[[120,1]];if(!creative()&&drops.some(([n,q])=>(app.inventory[n]||0)+q>99999)){toast('Túi đồ đã đầy; hãy dùng bớt vật phẩm trước khi thu hoạch.');return false;}return finishFarm(V.farming.harvest(app,target.x,target.y,target.z));}const removal=V.wallTorches.removal(world,target.x,target.y,target.z);if(!removal.ok||removal.targetId!==id){toast(removal.message||'Khối đã thay đổi; hãy chọn lại.');return false;}if(!creative()){let refund=removal.attachedTorches+(V.wallTorches.isTorch(id)?1:0);if(id===32){const furnace=V.furnaces.snapshot(app).find(f=>f.x===target.x&&f.y===target.y&&f.z===target.z);if(furnace)for(const slot of ['input','fuel','output'])if(furnace[slot+'Id']===19)refund+=furnace[slot+'Count'];}if(!V.wallTorches.canReceiveTorches(app.inventory,refund)){toast('Túi đuốc đã đầy. Dùng bớt đuốc trước khi lấy khối và các đuốc gắn kèm.');return false;}}if(id===32){const r=V.furnaces.breakBlock(app,target,()=>world.setBatch(removal.changes));if(!r.ok){toast(r.message);return false;}V.services.refresh(app,Object.entries(app.inventory).filter(([,n])=>n>0).map(([id,n])=>[Number(id),n]));}else if(!world.setBatch(removal.changes)){if(world.lastEditError)toast(world.lastEditError);return false;}if(!creative()&&removal.attachedTorches)addItem(19,removal.attachedTorches);let drop=V.wallTorches.canonicalItem(def.drop??id);const tier=held.tool==='pick'?held.tier||1:0;if(!creative()){if([3,9,14,15,16,17,21,28,29,32,34].includes(id)&&tier===0)drop=0;if(def.minPickTier&&tier<def.minPickTier)drop=0;if(id===15&&tier<2)drop=0;if([16,17].includes(id)&&tier<3)drop=0;if(id===29&&tier<4)drop=0;if(def.leaf){if(held.tool==='shears')drop=id;else{drop=0;if(Math.random()<.05)addItem(def.sapling,1);if(id===6&&Math.random()<.005)addItem(108,1);if(Math.random()<.02)addItem(101,1);}}if(drop)addItem(drop,1);toolWear(held.id);}V.trees.onBreak(app,target.x,target.y,target.z,id);V.farming.onBlockChanged(app,target.x,target.y,target.z,id,0);if(def.treeLog)app.progress.wood=(app.progress.wood||0)+1;app.progress.mined=(app.progress.mined||0)+1;V.journey.observe(app,'mine',{id});spawnParticles(target.x,target.y,target.z,id);Audio.noise(def.tool==='axe'?'wood':id===1||def.leaf?'grass':'stone');app.swing=1;app.mining=0;app.miningKey='';return true;}
 function eye(){const p=app.player,ride=V.mounts.profile(app);return[p.x,p.y+(ride?.eyeHeight??(p.crouch?1.30:1.62)),p.z];}
 function direction(){const p=app.player;return[Math.sin(p.yaw)*Math.cos(p.pitch),Math.sin(p.pitch),-Math.cos(p.yaw)*Math.cos(p.pitch)];}
 function overlapsPlayer(x,y,z,id=0){const p=app.player,ride=V.mounts.profile(app),r=(ride?.width??.6)/2,height=ride?.height??(p.crouch?1.5:1.8);if(V.blocks[id]?.shape==='boxes')return V.blockGeometry.intersectsAABB(id,[p.x-r-x,p.y-y,p.z-r-z],[p.x+r-x,p.y+height-y,p.z+r-z]);return x<p.x+r&&x+1>p.x-r&&y<p.y+height&&y+1>p.y&&z<p.z+r&&z+1>p.z-r;}
 // C12 CREATIVE PLACEMENT HISTORY BEGIN
 // Reviewed inert full cubes and authored C25 construction shapes placed into air. Session-local, never serialized.
 const CREATIVE_PLACEMENT_IDS=new Set([3,8,9,11,12,14,15,16,17,20,21,26,29,31,33,34,35,45,49,53,55,56,57,58,59,60,61,62,63,64,65,66,67,68,73,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,160,161,162,163,164,165,166,167,168,173,174,175,202,203,204,205,206,207,215,216,217,225,226,227,230,231,232,234,235,236,239,240,241,242,243,244,245,246,247,248,...Array.from({length:100},(_,i)=>249+i)]);
 const creativePlacementState={world:null,epoch:null,id:null,mode:null,dimension:null,undo:[],redo:[]};
 function syncCreativePlacementHistory(){
  const s=creativePlacementState;
  if(s.world!==world||s.epoch!==world.epoch||s.id!==app.id||s.mode!==app.mode||s.dimension!==app.dimension){
   s.world=world;s.epoch=world.epoch;s.id=app.id;s.mode=app.mode;s.dimension=app.dimension;s.undo.length=0;s.redo.length=0;
  }
  if(!creative()){s.undo.length=0;s.redo.length=0;}
  return s;
 }
 function supportsCreativePlacement(id){
  const b=V.blocks[id];
  return CREATIVE_PLACEMENT_IDS.has(id)&&b?.solid===true&&b.render==='opaque'&&((b.opaque===true&&b.shape==='cube')||(id>=249&&id<=348&&b.shape==='boxes'&&V.blockGeometry.boxesFor(id).length>0))&&b.breakable!==false&&!(b.emissive>0)&&!b.pointLight&&!b.portal&&!b.liquid&&!b.hazard&&!b.crop&&!b.treeSapling&&!b.treeLog&&!b.leaf;
 }
 function canUseCreativePlacementHistory(){
  return app.started&&app.playing&&!app.inHome&&!app.starting&&!app.contextLost&&creative()&&(!app.panel||app.panel==='pause');
 }
 function refreshCreativePlacementHistory(){
  const s=syncCreativePlacementHistory(),box=$('creativePlacementHistory');if(!box)return;
  box.classList.toggle('hidden',!app.started||app.inHome||!creative());
  const allowed=canUseCreativePlacementHistory(),undo=$('creativeUndoPlacement'),redo=$('creativeRedoPlacement'),status=$('creativePlacementHistoryStatus');
  undo.disabled=!allowed||s.undo.length===0;redo.disabled=!allowed||s.redo.length===0;
  const message='Hoàn tác: '+s.undo.length+' / Làm lại: '+s.redo.length+' / Tối đa 32 bước';
  if(status.textContent!==message)status.textContent=message;
 }
 function rememberCreativePlacement(x,y,z,before,after){
  const s=syncCreativePlacementHistory();if(!creative())return;
  s.redo.length=0;
  if(before===0&&supportsCreativePlacement(after)&&[x,y,z].every(Number.isInteger)&&world.get(x,y,z,true)===after){
   s.undo.push({x,y,z,before:0,after});if(s.undo.length>32)s.undo.shift();
  }
  refreshCreativePlacementHistory();
 }
 function performCreativePlacementHistory(direction){
  const s=syncCreativePlacementHistory();if(!canUseCreativePlacementHistory()||!['undo','redo'].includes(direction))return false;
  const from=direction==='undo'?s.undo:s.redo,to=direction==='undo'?s.redo:s.undo,row=from.at(-1);
  if(!row){toast(direction==='undo'?'Chưa có lần đặt khối để hoàn tác.':'Chưa có lần đặt khối để làm lại.');return false;}
  const {x,y,z}=row,limit=V.coordinates.forWorld(world).blockLimit,expected=direction==='undo'?row.after:0,id=direction==='undo'?0:row.after;
  if(row.before!==0||!supportsCreativePlacement(row.after)||![x,y,z].every(Number.isInteger)||y<0||y>=96||Math.abs(x)>limit||Math.abs(z)>limit){s.undo.length=0;s.redo.length=0;refreshCreativePlacementHistory();toast('Lịch sử đặt khối không còn phù hợp với thế giới này.');return false;}
  const chunk=world.chunks.get(Math.floor(x/16)+','+Math.floor(z/16));
  if(!chunk?.data){toast('Hãy đến gần vị trí đã đặt khối để dùng hoàn tác hoặc làm lại.');return false;}
  if(world.get(x,y,z,true)!==expected){s.undo.length=0;s.redo.length=0;refreshCreativePlacementHistory();toast('Ô này đã thay đổi. Lịch sử hoàn tác đã được xóa để giữ phần xây mới.');return false;}
  if(direction==='redo'&&overlapsPlayer(x,y,z,id)){toast('Không thể làm lại khối trùng vị trí của bạn.');return false;}
  if(direction==='undo'){
   const removal=V.wallTorches.removal(world,x,y,z),above=world.get(x,y+1,z,true),b=V.blocks[above];
   if(!removal.ok||removal.targetId!==expected||removal.attachedTorches!==0||removal.changes.length!==1){toast('Khối đang đỡ đuốc. Hãy lấy đuốc trước khi hoàn tác.');return false;}
   if([4,27].includes(above)||b?.gravity||b?.falling||b?.crop||b?.treeSapling){toast('Khối đang đỡ cát, sỏi hoặc cây. Hãy xử lý phần phía trên trước.');return false;}
  }
  if(!canUseCreativePlacementHistory())return false;
  if(!world.setBatch([{x,y,z,id,expected}])){toast(world.lastEditError||'Chưa thể đổi khối này. Thế giới được giữ nguyên.');return false;}
  from.pop();to.push(row);if(to.length>32)to.shift();
  clearInput();app.useCooldown=Math.max(app.useCooldown,.22);
  refreshCreativePlacementHistory();
  if(app.panel==='pause')save(false);
  toast(direction==='undo'?'Đã hoàn tác lần đặt '+item(row.after).name.toLocaleLowerCase('vi')+'.':'Đã làm lại lần đặt '+item(row.after).name.toLocaleLowerCase('vi')+'.');
  return true;
 }
 function creativePlacementShortcut(e){
  const focused=document.activeElement,target=e.target?.nodeType===1?e.target:e.target?.parentElement;
  if(e.defaultPrevented||e.isComposing||e.keyCode===229||e.altKey||e.getModifierState?.('AltGraph')||!!e.ctrlKey===!!e.metaKey||focused?.isContentEditable||target?.isContentEditable||target?.closest?.('input,textarea,select,[role="textbox"],[contenteditable]:not([contenteditable="false"])')||['INPUT','TEXTAREA','SELECT'].includes(focused?.tagName)||!canUseCreativePlacementHistory())return false;
  const direction=e.code==='KeyZ'?(e.shiftKey?'redo':'undo'):e.code==='KeyY'&&!e.shiftKey?'redo':null;
  if(!direction)return false;e.preventDefault();if(!e.repeat)performCreativePlacementHistory(direction);return true;
 }
 V.creativePlacementHistory=Object.freeze({
  undo:()=>performCreativePlacementHistory('undo'),
  redo:()=>performCreativePlacementHistory('redo'),
  inspect(){const s=syncCreativePlacementHistory();return{scope:'creative-inert-placement-into-air',limit:32,worldId:s.id,dimension:s.dimension,mode:s.mode,epoch:s.epoch,undo:s.undo.map(r=>({...r})),redo:s.redo.map(r=>({...r})),supportedIds:[...CREATIVE_PLACEMENT_IDS],persisted:false};}
 });
 // C12 CREATIVE PLACEMENT HISTORY END
 function useSelected(){if(!active()||app.useCooldown>0||app.companionUseLatched)return false;app.useCooldown=.22;const id=selectedId(),info=item(id),t=world.ray(eye(),direction(),creative()?6:5,creative()&&selectedId()===7);if(!app.keys.has('ShiftLeft')&&!app.keys.has('ShiftRight')){const companion=V.entities?.companionInteract?.(app,eye(),direction(),Math.min(4.5,t?.distance??4.5),id,spend);if(companion?.handled){app.companionUseLatched=app.buttons.has(2);toast(companion.message);if(companion.changed){app.swing=1;Audio.tone(companion.action==='recall'?960:720,.08,'triangle',.035);updateHUD();save(false);}return companion.ok;}const riding=V.mounts.tryMount(app,eye(),direction(),Math.min(4.5,t?.distance??4.5));if(riding.handled){toast(riding.message);if(riding.ok){updateHUD();save(false);}return riding.ok;}}if(id===184){const r=V.guardian.summon(app,t);toast(r.message);if(r.ok)app.swing=1;return r.ok;}if(V.equipment.SPECS[id]){if(creative()&&!(app.inventory[id]>0))addItem(id,1);const r=V.equipment.equip(app,V.equipment.SPECS[id].slot,id);toast(r.message||(r.ok?'Đã chọn trang bị.':'Chưa thể mang trang bị.'));if(r.ok){renderHotbar();save(false);}return r.ok;}if(info.tool==='shears'&&V.entities?.shear){const cut=V.entities.shear(app,eye(),direction(),t?.distance??5,addItem);if(cut){if(cut.used){toolWear(id);app.swing=1;Audio.noise('grass',.1);toast('Đã cắt '+cut.count+' len. Cừu sẽ mọc len lại khi gặm cỏ.');}else toast('Cừu chưa mọc lại len.');return !!cut.used;}}if(info.kind==='spawn_egg'){const result=V.entities.spawnEgg(app,id,t,spend);if(!result.ok){const messages={empty:'Trứng đã hết.',target:'Nhìn vào một mặt nền để dùng trứng.',bounds:'Chọn mặt nền bên trong giới hạn thế giới.',unloaded:'Vùng này chưa sẵn sàng.',support:'Sinh vật cần nền khô, liền và đủ rộng.',blocked:'Chỗ này bị chắn hoặc có nước, dung nham hay cổng.',player:'Chừa khoảng trống xa chỗ bạn đang đứng.',crowded:'Chỗ này đã có sinh vật.', 'total-cap':'Vùng đất này đã có đủ 20 sinh vật.', 'species-cap':'Đã đạt giới hạn của nhóm sinh vật này.'};toast(messages[result.reason]||'Chưa thể dùng trứng ở đây.');return false;}app.swing=1;Audio.noise('grass',.1);toast('Đã dùng '+info.name.toLocaleLowerCase('vi')+(creative()?' · không mất trứng.':'.'));return true;}if(!app.keys.has('ShiftLeft')&&!app.keys.has('ShiftRight')){if(t&&[71,72,77,78].includes(t.id))return V.dimensions.interact(app,t);if(V.trading.target(app,eye(),direction())){const trade=V.trading.open(app,eye(),direction());if(trade.open){openPanel('trade');return true;}toast(trade.message);return false;}if(t?.id===32)return V.services.openFurnace(app,t);if(t?.id===18){openPanel('inventory');V.crafting3?.setMode(app,'grid');return true;}}if(id===124&&t){const y=[22,23].includes(t.id)?t.y-1:t.y;return finishFarm(V.farming.prepare(app,t.x,y,t.z));}if(id===120&&t){return finishFarm(V.farming.plant(app,t.x,t.id===38?t.y+1:t.y,t.z));}if(info.kind==='food'){if(!creative()&&app.player.hunger>=20){toast('Bạn đã no.');return false;}if(!spend(id,1)){toast('Vật phẩm đã hết.');return false;}const nutrition=Number(info.nutrition)||4;app.player.hunger=Math.min(20,app.player.hunger+nutrition);Audio.noise('grass',.1);toast('Đã ăn '+info.name.toLocaleLowerCase('vi')+' · +'+nutrition+' thức ăn');app.swing=1;return true;}if(info.kind!=='block'||!t||(!creative()&&!(app.inventory[id]>0)))return false;const[x,y,z]=t.previous;if(y<0||y>=96){toast('Giới hạn chiều cao: 96 khối.');return false;}const old=world.get(x,y,z);if(old&&V.blocks[old]?.solid)return false;if(V.blocks[id]?.solid&&overlapsPlayer(x,y,z,id)){toast('Không thể đặt khối trùng vị trí của bạn.');return false;}let placementId=id;if(id===19){const torch=V.wallTorches.placement(world,t);if(!torch.ok){toast(torch.message);return false;}placementId=torch.id;}if(V.wallTorches.isTorch(old)){toast('Lấy đuốc cũ trước khi thay khối ở vị trí này.');return false;}if(V.blocks[id]?.crop){if(world.get(x,y-1,z)!==38){toast('Lúa mì cần đất canh tác bên dưới.');return false;}if(id<42&&V.farming.inspect(app).pending>=256&&![39,40,41].includes(old)){toast('Đã có 256 cây đang lớn.');return false;}}if(V.blocks[id]?.treeSapling){if(![1,2].includes(world.get(x,y-1,z))){toast('Cây non cần đất hoặc khối cỏ bên dưới.');return false;}if(V.trees.inspect(app).pending>=V.trees.MAX_PLANTS){toast('Đã có 256 cây non đang chờ lớn.');return false;}}if(world.set(x,y,z,placementId)){V.trees.onBreak(app,x,y,z,old);V.farming.onBlockChanged(app,x,y,z,old,placementId);if(V.blocks[id]?.treeSapling)V.trees.onPlace(app,x,y,z,id);spend(id,1);app.progress.placed=(app.progress.placed||0)+1;V.journey.observe(app,'place',{id});rememberCreativePlacement(x,y,z,old,placementId);app.swing=1;Audio.noise('wood',.10);return true;}if(world.lastEditError)toast(world.lastEditError);return false;}
 function damage(amount,reason,kind='combat'){if(creative()||app.player.health<=0||!Number.isFinite(amount)||amount<=0)return;const hit=V.equipment.mitigate(app,amount,kind);app.player.health=Math.max(0,app.player.health-hit.damage);app.hurt=1;Audio.tone(100,.12,'sawtooth',.11);if(hit.broken.length)toast('Trang bị đã vỡ: '+hit.broken.map(id=>item(id).name).join(', '),4500);if(app.player.health<=0){V.mounts.reset(app,'player-death');resetPresentation();V.guardian.onDeath(app);$('deathReason').textContent=reason||'Hãy trở lại và xây nơi trú vững hơn.';openPanel('death');save(false);}else if(hit.broken.length)save(false);}
 function attackMob(t){if(!V.entities||app.hitCooldown>0)return false;const weapon=selectedId(),limit=t?.distance??5,origin=eye(),dir=direction(),guardianDistance=V.guardian.targetDistance(app,origin,dir,limit);if(!V.entities.attack(app,origin,dir,guardianDistance===null?limit:Math.min(limit,guardianDistance),damage,addItem)&&!V.guardian.attack(app,origin,dir,limit))return false;toolWear(weapon);app.hitCooldown=.38;app.swing=1;app.mining=0;Audio.noise('wood',.1);return true;}
 function strikeOnPress(){if(app.hitCooldown>0)return false;const t=world.ray(eye(),direction(),creative()?6:5,creative()&&selectedId()===7);if(attackMob(t)){if(creative())app.hitCooldown=.25;return true;}if(!creative()||!t||!breakTarget(t))return false;app.hitCooldown=.25;return true;}
 function updateOreVisionUI(){const s=app.oreVision.inspect();$('xrayState').textContent=s.enabled?'X-RAY: BẬT':'X-RAY: TẮT';$('xrayBtn').setAttribute('aria-pressed',String(s.enabled));$('xrayLegend').classList.toggle('hidden',!s.enabled);for(const t of s.types)$('xrayCount'+t.id).textContent=String(t.marked);$('xraySummary').textContent=s.pendingChunks?'Đang dò khu vực… '+s.shown+' dấu quặng':s.capped?'Hiện '+s.shown+'/'+s.eligible+' · giới hạn 512; ưu tiên đủ '+s.types.length+' loại':s.shown+' dấu quặng · giới hạn 512';}
 function toggleOreVision(){if(!active())return false;const on=app.oreVision.setEnabled(!app.oreVision.enabled);updateOreVisionUI();toast(on?'Soi quặng: BẬT · 6 loại quặng trong 32 khối.':'Soi quặng: TẮT.');return true;}
 function toggleFly(){if(V.mounts.active(app)){toast('Xuống ngựa trước khi bật bay.');return false;}if(!creative()){toast('Chỉ có thể bay trong chế độ Sáng tạo.');return;}const p=app.player;p.fly=!p.fly;p.vy=0;p.fallStart=p.y;toast(p.fly?'Đang bay · Space lên, Shift xuống':'Đã tắt bay');}
 function toggleSprint(){if(!active())return false;app.sprintToggle=!app.sprintToggle;app.sprintDouble=false;updateHUD();return true;}
 function physics(dt){const p=app.player,k=app.keys,ride=V.mounts.profile(app);if(!creative()&&p.health<=0)return;if(ride){p.fly=false;p.crouch=false;}const crouching=!ride&&!p.fly&&(k.has('ShiftLeft')||k.has('ShiftRight'));if(crouching)p.crouch=true;else if(ride||!world.collides(p.x,p.y,p.z,1.8,.6))p.crouch=false;const height=ride?.height??(p.crouch?1.5:1.8),width=ride?.width??.6,eyeHeight=ride?.eyeHeight??(p.crouch?1.3:1.62);let forward=(k.has('KeyW')?1:0)-(k.has('KeyS')?1:0),side=(k.has('KeyD')?1:0)-(k.has('KeyA')?1:0);if(app.touchMove){forward=-app.touchMove[1];side=app.touchMove[0];}const n=Math.hypot(forward,side);if(n>1){forward/=n;side/=n;}if(k.has('ArrowLeft'))p.yaw-=dt*1.8;if(k.has('ArrowRight'))p.yaw+=dt*1.8;if(k.has('ArrowUp'))p.pitch=clamp(p.pitch+dt*1.5,-1.54,1.54);if(k.has('ArrowDown'))p.pitch=clamp(p.pitch-dt*1.5,-1.54,1.54);const water=world.get(p.x,p.y+.05,p.z)===7,under=world.get(p.x,p.y+eyeHeight,p.z)===7;app.underwater=under;if(forward<=.1||p.crouch||(!creative()&&p.hunger<=3))app.sprintDouble=false;const sprint=(k.has('ControlLeft')||k.has('ControlRight')||app.sprintToggle||app.sprintDouble)&&(creative()||p.hunger>3)&&!p.crouch;app.sprinting=sprint&&n>.1;let speed=ride?(sprint?ride.sprintSpeed:ride.walkSpeed):p.fly?(sprint?17:9):p.crouch?1.55:sprint?6.2:4.3;if(!ride&&!p.fly&&!creative())speed*=V.equipment.bonuses(app).move;if(water&&!p.fly)speed*=.55;const dx=(Math.sin(p.yaw)*forward+Math.cos(p.yaw)*side)*speed,dz=(-Math.cos(p.yaw)*forward+Math.sin(p.yaw)*side)*speed,accel=p.fly?12:p.grounded?20:water?10:6;p.vx+=(dx-p.vx)*Math.min(1,accel*dt);p.vz+=(dz-p.vz)*Math.min(1,accel*dt);if(p.fly){const vertical=(k.has('Space')?1:0)-(k.has('ShiftLeft')||k.has('ShiftRight')?1:0);p.vy+=(vertical*speed-p.vy)*Math.min(1,12*dt);}else if(water){p.vy=Math.max(-3,p.vy-3.5*dt);if(k.has('Space'))p.vy=3.4;}else{p.vy=Math.max(-42,p.vy-26*dt);if(k.has('Space')&&p.grounded){p.vy=ride?.jumpSpeed??8.5;p.grounded=false;Audio.tone(170,.04,'triangle',.02);}}
   const prevY=p.y,wasGround=p.grounded;p.grounded=false;const steps=Math.max(1,Math.ceil(Math.max(Math.abs(p.vx),Math.abs(p.vy),Math.abs(p.vz))*dt/.19));const sd=dt/steps;
   for(let step=0;step<steps;step++){for(const axis of ['x','z']){const vel=axis==='x'?'vx':'vz',old=p[axis];p[axis]+=p[vel]*sd;if(world.collides(p.x,p.y,p.z,height,width)){const from=[p.x,p.y,p.z];from[axis==='x'?0:2]=old;const stepY=wasGround&&!p.fly&&!ride&&!water&&p.vy<=0?V.blockGeometry.stepUpHeight(world,from,[p.x,p.y,p.z],height,width,Math.max(0,.5-(p.y-prevY))):null;if(stepY!==null)p.y=stepY;else{p[axis]=old;p[vel]=0;}}else if(p.crouch&&wasGround&&!world.collides(p.x,p.y-.09,p.z,height,width)){p[axis]=old;p[vel]=0;}}const old=p.y;p.y+=p.vy*sd;if(world.collides(p.x,p.y,p.z,height,width)){if(p.vy<0)p.grounded=true;p.y=old;p.vy=0;}}
   const waterAfter=world.get(p.x,p.y+.05,p.z)===7;app.underwater=world.get(p.x,p.y+eyeHeight,p.z)===7;if(!p.fly&&!water&&!waterAfter){if(p.grounded){const fallen=p.fallStart-p.y;if(fallen>3.2)damage(Math.floor((fallen-3)*2),'Bạn đã ngã từ quá cao.','fall');p.fallStart=p.y;}else p.fallStart=Math.max(p.fallStart,p.y);}else p.fallStart=p.y;if(!creative()&&p.health<=0)return;
   if(p.y>512){p.y=512;p.vy=Math.min(0,p.vy);p.fallStart=Math.min(p.fallStart,512);}if(p.y<-10||Math.abs(p.x)>V.coordinates.forWorld(world).movementLimit||Math.abs(p.z)>V.coordinates.forWorld(world).movementLimit){const safe=V.findSafeRespawn(world,app.spawn);[p.x,p.y,p.z]=safe.position;p.vx=p.vy=p.vz=0;p.grounded=false;p.fallStart=p.y;record('boundary-rescue','Moved back inside the supported world bounds.',safe);toast('Đã trở về vùng an toàn.');}
   if(n>.1){app.walk+=dt*(sprint?13:9);app.progress.walked=(app.progress.walked||0)+speed*dt;if(p.grounded&&!p.fly){Audio.step+=dt;if(Audio.step>(sprint?.25:.39)){Audio.step=0;const below=world.get(p.x,p.y-.1,p.z);Audio.noise(below===1||V.blocks[below]?.leaf?'grass':V.blocks[below]?.treeLog||(V.blocks[below]?.woodFamily&&V.blocks[below]?.tool==='axe')?'wood':'stone',.045);}}}
   if(!creative()){p.hunger=Math.max(0,p.hunger-dt*(sprint&&n?.035:n?.014:.003));if(p.hunger<=0){app.regen+=dt;if(app.regen>=5){app.regen=0;damage(1,'Bạn đã kiệt sức vì đói.','hunger');}}else if(p.hunger>=16&&p.health<20){app.regen+=dt;if(app.regen>=5){p.health=Math.min(20,p.health+1);p.hunger=Math.max(0,p.hunger-.4);app.regen=0;}}else app.regen=0;if(app.underwater){p.air=Math.max(0,p.air-dt);if(p.air<=0){app.drown+=dt;if(app.drown>=1){damage(2,'Bạn đã ở dưới nước quá lâu.','drown');app.drown=0;}}}else{p.air=Math.min(12,p.air+dt*5);app.drown=0;}}
  }
 function update(dt){app.clock+=dt;if(options.cycle){const prior=app.time;app.time=(app.time+dt/1200)%1;if(app.time<prior)app.day++;}physics(dt);if(!active())return;V.mounts.sync(app,dt);V.dimensions.tick(app,dt);if(!active())return;app.hitCooldown=Math.max(0,app.hitCooldown-dt);app.useCooldown=Math.max(0,app.useCooldown-dt);app.swing=Math.max(0,app.swing-dt*4.5);app.hurt=Math.max(0,app.hurt-dt*2.5);const t=world.ray(eye(),direction(),creative()?6:5,creative()&&selectedId()===7);app.target=t;
   if(app.buttons.has(0)){if(!attackMob(t)){if(t){const mk=t.x+','+t.y+','+t.z;if(mk!==app.miningKey){app.miningKey=mk;app.mining=0;}const def=V.blocks[t.id],held=item(selectedId());let duration=Math.max(.18,def.hardness||.4);if(!creative()){if(def.tool&&held.tool!==def.tool)duration*=def.tool==='pick'?4:1.4;else if(def.tool&&held.tool===def.tool)duration/=1.5+(held.tier||1)*1.5;}else duration=.16;if(!creative()&&held.tool==='shears'&&def.leaf)duration=.08;if((t.id===13||def.breakable===false)&&!creative())duration=Infinity;app.mining+=dt/duration;app.swing=Math.max(app.swing,.3+Math.sin(app.clock*24)*.15);if(app.mining>=1&&app.hitCooldown<=0){breakTarget(t);app.hitCooldown=creative()?.25:.07;}}else{app.mining=0;app.miningKey='';}}}else{app.mining=0;app.miningKey='';}
   if(app.buttons.has(2)&&app.useCooldown<=0)useSelected();if(!active())return;if(V.entities)V.entities.update(app,dt,damage);if(!active())return;V.guardian.tick(app,dt);if(!active())return;V.trees.update(app,dt);V.farming.update(app,dt);V.furnaces.update(app,dt);for(const p of app.particles){p.life-=dt;p.vy-=11*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;}app.particles=app.particles.filter(p=>p.life>0);app.saveTimer+=dt;if(app.saveTimer>=15){app.saveTimer=0;save(false);}Audio.ambient+=dt;if(Audio.ambient>19&&app.dimension==='overworld'&&app.time>.25&&app.time<.72){Audio.ambient=0;Audio.tone(1500,.11,'sine',.008);setTimeout(()=>Audio.tone(1900,.12,'sine',.007),160);}}
 app.lightStats=renderer.chunkLights.stats;
 function updateHUD(){refreshCreativePlacementHistory();V.adventureUI?.updateHUD(app);V.recipePlan?.update(app);updateOreVisionUI();const p=app.player,b=V.core.biome(world.seed,Math.floor(p.x),Math.floor(p.z));$('biomeLabel').textContent=app.dimension==='inferno'?'Vực Lửa':app.dimension==='sky'?'Thiên Giới':BIOMES[b]||b;$('dayLabel').textContent='Ngày '+app.day+' · '+(app.dimension==='inferno'?'Dưới lòng đá':app.dimension==='sky'?'Trên tầng mây':app.time>.23&&app.time<.76?'Ban ngày':'Ban đêm');if(app.panel==='pause')V.dimensions.refresh(app);const riding=V.mounts.active(app);$('mountLabel').classList.toggle('hidden',!riding);$('touchMount').classList.toggle('hidden',!riding);$('flightLabel').classList.toggle('hidden',!p.fly);$('sprintLabel').classList.toggle('hidden',!app.sprinting||p.fly||riding);$('touchRun').setAttribute('aria-pressed',String(!!app.sprintToggle));$('touchRun').classList.toggle('running',!!app.sprinting);$('survivalBars').classList.toggle('hidden',creative());$('hearts').innerHTML=Array.from({length:10},(_,i)=>'<span class="'+(p.health>=i*2+2?'':p.health>i*2?'half-heart':'empty-heart')+'">♥</span>').join('');$('hunger').innerHTML=Array.from({length:10},(_,i)=>'<span class="'+(p.hunger>i*2?'':'empty-heart')+'">◆</span>').join('');$('airBar').classList.toggle('hidden',creative()||(!app.underwater&&p.air>=12));$('airBar').textContent='○'.repeat(Math.ceil(p.air/1.2));$('xpBar').firstElementChild.style.width=Math.min(100,(app.progress.mined||0)%100)+'%';$('itemName').textContent=item(selectedId()).name;$('targetLabel').textContent=app.target?item(app.target.id).name:'';$('mineProgress').classList.toggle('hidden',app.mining<=0);$('mineProgress').firstElementChild.style.width=Math.min(100,app.mining*100)+'%';$('hurtFlash').style.opacity=String(app.hurt*.8);if(riding){$('missionText').textContent='Đang cưỡi ngựa';$('missionHint').textContent='WASD để đi · Space nhảy · G để xuống · Mở lại bản lưu sẽ đi bộ.';}else if(creative()){$('missionText').textContent='E mở túi đồ · F bật / tắt bay';$('missionHint').textContent='Ctrl / W hai lần / R chạy nhanh · Chuột trái đào · Phải đặt';}else if(!app.progress.wood){$('missionText').textContent='01 · Thu thập một khối gỗ';$('missionHint').textContent='Tìm thân cây và giữ chuột trái để chặt.';}else if(!(app.inventory[18]>0)&&!stationNear(18)&&app.progress.crafted<3){$('missionText').textContent='02 · Chế tạo bàn làm việc';$('missionHint').textContent='E → ván gỗ → bàn chế tạo. Đặt bàn xuống.';}else if(!(app.inventory[103]>0)&&!(app.inventory[104]>0)){$('missionText').textContent='03 · Nâng cấp cuốc đá';$('missionHint').textContent='Làm cuốc gỗ để lấy đá, rồi trở lại bàn chế tạo.';}else{$('missionText').textContent='Tự tay viết tiếp chuyến đi';$('missionHint').textContent='Dựng nơi trú, đào quặng, thắp sáng hang sâu.';}if(app.debug){const sorted=app.frames.slice(-240).sort((a,b)=>a-b),p95=sorted[Math.floor(sorted.length*.95)]||0,st=world.stats(),rs=renderer.stats;const mean=app.frames.slice(-60).reduce((a,b)=>a+b,0)/Math.min(60,app.frames.length||1);$('debug').textContent='MảiMêRáp '+app.version+' · WEBGL 2\n'+(1000/mean).toFixed(0)+' FPS · p95 '+p95.toFixed(1)+' ms\nXYZ '+p.x.toFixed(2)+' / '+p.y.toFixed(2)+' / '+p.z.toFixed(2)+'\nVùng '+st.ready+'/'+st.resident+' · Workers '+st.workers+'\nDraws '+rs.draws+' · Tam giác '+rs.triangles.toLocaleString('vi-VN')+'\nKhối đã sửa '+st.edits+' · Mesh đang chờ '+st.dirty+'\nGPU buffers '+(rs.gpuBytes/1048576).toFixed(1)+' MiB\n'+renderer.canvas.width+' × '+renderer.canvas.height+' · Seed '+app.seed;}}
 function syncSettings(){for(const[id,k]of [['cloudStyle','cloudStyle'],['celestialStyle','celestialStyle'],['weather','weatherMode']])$(id+'Setting').value=options[k];$('cameraSetting').value=options.cameraView;$('cameraMotionSetting').value=options.cameraMotion;$('uiFontSetting').value=options.uiFont;$('texturePackSetting').value=options.texturePack;$('qualitySetting').value=options.quality;$('aaSetting').value=options.antiAliasing;$('shadowQualitySetting').value=options.shadowQuality;$('shadowQualitySetting').disabled=!options.rtShadows;for(const[id,k]of [['distance','distance'],['scale','scale'],['fov','fov'],['sensitivity','sensitivity'],['volume','volume'],['wind','wind']]){$(id+'Setting').value=options[k];$(id+'Value').textContent=options[k]+(id==='distance'?' vùng':id==='fov'?'°':'%');}for(const k of ['invert','cycle','bobbing','leaves','rtShadows','waterFX','materialDetail'])$(k+'Setting').checked=options[k];$('creativeSettings').classList.toggle('hidden',!creative());syncMuteControls();}
 function applySettings(){options.muted=options.muted===true;Audio.syncMute();validateGraphicsOptions(options);document.documentElement.dataset.uiFont=options.uiFont;world.radius=options.distance;renderer.scale=options.scale/100;renderer.fov=options.fov;audioMuteStorageOK=false;try{const value=JSON.stringify(options);localStorage.setItem('mienkhoi.options.v1',value);audioMuteStorageOK=localStorage.getItem('mienkhoi.options.v1')===value;}catch{}syncSettings();}
 function chooseTexturePack(key){
  if(!['legacy16','legacy24','native24'].includes(key)){syncSettings();return false;}
  if(key===textures.packId){options.texturePack=key;applySettings();return true;}
  let next;
  try{next=V.makeTextures(key);renderer.setTexturePack(next);}
  catch(error){syncSettings();toast('Chưa thể đổi gói chất liệu. Gói hiện tại được giữ.');record('graphics','Texture pack switch rejected; old pack retained.',{requested:key,message:String(error?.message||error)});return false;}
  // The renderer has committed its new GPU array and the catalog activation.
  // Keep this mutable reference aligned with those two before rebuilding icons.
  textures=next;options.texturePack=next.packId;
  renderInventory();applySettings();
  record('graphics','Texture pack switched.',{pack:next.packId,size:next.size,layers:next.layers});
  return true;
 }
 /* C15_RECIPE_PLAN_PC_DRAFT_V3_BEGIN */
 V.recipePlan=(()=>{
  'use strict';
  const KEY='mienkhoi.recipe-plan.v1',MAX_RAW=512,sessions=new WeakMap(),textValues=new WeakMap(),$=id=>document.getElementById(id);
  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  const quantity=n=>n==='max'||Number.isSafeInteger(n)&&n>=1&&n<=99999;
  const healthy=a=>!!(a&&a.started&&!a.starting&&!a.inHome&&!a.contextLost&&a.world&&a.player?.health>0);
  const editable=a=>healthy(a)&&a.panel==='inventory';
  const text=(e,value)=>{if(!e)return;const t=String(value??'');if(textValues.get(e)===t)return;textValues.set(e,t);if(e.textContent!==t)e.textContent=t;};
  const hidden=(e,value)=>{if(e&&e.hidden!==!!value)e.hidden=!!value;};
  const disabled=(e,value)=>{if(e&&e.disabled!==!!value)e.disabled=!!value;};
  function recipe(s,id){return typeof id==='string'?s.recipes.get(id):null;}
  function decode(s,raw){
   if(raw===null)return{status:'empty',selection:null};
   if(typeof raw!=='string'||raw.length>MAX_RAW)return{status:'invalid'};
   try{const x=JSON.parse(raw);
    if(!x||typeof x!=='object'||Array.isArray(x))return{status:'invalid'};
    if(Number.isSafeInteger(x.version)&&x.version>1)return{status:'future'};
    const r=recipe(s,x.recipeId);
    if(x.version!==1||Object.keys(x).length!==3||!['version','recipeId','requested'].every(k=>Object.hasOwn(x,k))||!r||!quantity(x.requested)||(r.station==='furnace'&&x.requested!==1))return{status:'invalid'};
    return{status:'valid',selection:{recipeId:r.id,requested:x.requested}};
   }catch{return{status:'invalid'};}
  }
  function read(s){
   let raw,d;try{raw=globalThis.localStorage.getItem(KEY);d=decode(s,raw);}catch{d={status:'unavailable'};}
   if(d.status==='valid'||d.status==='empty'){
    const changed=s.raw!==raw||s.storageBlocked;s.selection=clone(d.selection);s.raw=raw;s.readStatus=d.status;s.storageBlocked=false;
    if(changed)s.message='';
   }else{
    s.readStatus=d.status;s.storageBlocked=true;
    s.message=d.status==='future'?'Kế hoạch thuộc phiên bản mới hơn. Giữ nguyên dữ liệu; đặt lại khi bạn muốn.':d.status==='unavailable'?'Chưa đọc được nơi lưu kế hoạch. Lựa chọn hợp lệ gần nhất vẫn được giữ.':'Dữ liệu kế hoạch chưa hợp lệ. Lựa chọn hợp lệ gần nhất vẫn được giữ; đặt lại để chọn mới.';
   }
  }
  function derive(app,s){
   const session={ready:healthy(app),id:app?.id??null,mode:app?.mode??null,dimension:app?.dimension??null,panel:app?.panel??null};
   let plan=null;const r=s.selection&&recipe(s,s.selection.recipeId);
   if(r&&session.ready){
    const furnace=r.station==='furnace',creative=app.mode==='creative',free=creative&&!furnace,requested=furnace?1:s.selection.requested;
    const q=s.ctx.quote(r,app.inventory,free,requested),stationKind=furnace?'furnace':r.station?'crafting':'hand',stationReady=stationKind==='hand'||stationKind==='crafting'&&(creative||s.stations.bench)||stationKind==='furnace'&&s.stations.furnace;
    const costs=new Map();for(const[id,n]of r.need)costs.set(id,(costs.get(id)||0)+n);
    const rows=q.valid?q.needs.map(([id,recipeRequired])=>{const required=free?0:recipeRequired,have=app.inventory[id]??0;return{id,name:s.ctx.item(id).name,perExecution:costs.get(id),recipeRequired,required,have,missing:Math.max(0,required-have)};}):[];
    plan={recipeId:r.id,name:r.name,requested,executions:q.valid?q.executions:0,previewExecutions:q.valid?(q.executions||1):0,outputId:r.out[0],outputName:s.ctx.item(r.out[0]).name,outputCount:q.valid?q.outputCount:0,maxExecutions:furnace?1:q.maxExecutions,rows,creative,furnace,stationKind,stationReady:!!stationReady,materialsReady:!!q.materials,outputRoom:furnace?null:!!q.room,ready:furnace?null:!!(q.valid&&q.enabled&&stationReady),valid:!!q.valid};
   }
   const guardian=$('guardianHud'),hud=$('hud'),guardianVisible=!!(guardian&&!guardian.classList.contains('hidden'));
   const hudVisible=!!(plan&&session.ready&&!app.panel&&!guardianVisible&&hud&&!hud.classList.contains('hidden'));
   return{version:1,storageKey:KEY,selection:clone(s.selection),readStatus:s.readStatus,storageBlocked:s.storageBlocked,lastWrite:s.lastWrite,message:s.message,session,plan,hudVisible};
  }
  function renderRows(s,rows){
   const signature=JSON.stringify(rows);if(signature===s.rowSignature)return;s.rowSignature=signature;
   const root=$('recipePlanRows'),frag=document.createDocumentFragment();
   for(const row of rows){
    const li=document.createElement('li');li.dataset.planItem=String(row.id);
    const name=document.createElement('strong');name.dataset.planField='name';name.textContent=row.name;li.append(name);
    for(const[field,label]of [['required','Cần'],['have','Có'],['missing','Thiếu']]){
     const cell=document.createElement('span');cell.dataset.planField=field;cell.dataset.value=String(row[field]);
     const caption=document.createElement('small'),n=document.createElement('b');caption.textContent=label+' ';n.textContent=String(row[field]);cell.append(caption,n);li.append(cell);
    }frag.append(li);
   }root.replaceChildren(frag);
  }
  function summary(p){
   if(!p)return'Chọn Theo dõi nguyên liệu bên dưới một công thức. Số lượt hiện tại được ghi khi bạn chọn.';
   if(!p.valid)return'Công thức hoặc số lượng trong túi chưa hợp lệ.';
   if(p.furnace)return'Lò nung: chuẩn bị 1 mẻ → '+p.outputCount+' '+p.outputName+'. Nhiên liệu và chỗ trong lò xem ở bảng lò.';
   const lead=(p.requested==='max'?'Tối đa hiện tại: ':'')+p.executions+' lượt → '+p.outputCount+' '+p.outputName+'. ';
   if(p.requested==='max'&&p.executions===0)return lead+'Chưa thực hiện được 1 lượt; nguyên liệu dưới đây tính cho 1 lượt. '+(!p.outputRoom?'Túi thành phẩm đã đầy. ':'')+(p.creative?'Sáng tạo không cần nguyên liệu.':'');
   return lead+(p.creative?'Sáng tạo không cần nguyên liệu; vẫn cần chỗ cho thành phẩm.':p.materialsReady?'Đủ nguyên liệu.':'Còn thiếu nguyên liệu.')+(p.outputRoom?'':' Túi thành phẩm không đủ chỗ.');
  }
  function stationText(p){
   if(!p)return'';if(p.stationKind==='hand')return'Chế tạo bằng tay.';
   if(p.furnace)return(p.stationReady?'Có lò trong tầm 5 khối. ':'Cần lò trong tầm 5 khối. ')+(p.creative?'Lò vẫn dùng nguyên liệu thật trong túi.':'Chưa tính nhiên liệu.');
   return p.creative?'Sáng tạo không yêu cầu bàn chế tạo.':p.stationReady?'Có bàn chế tạo trong tầm 5 khối.':'Cần bàn chế tạo trong tầm 5 khối.';
  }
  function updateButtons(app,s){
   for(const b of document.querySelectorAll('button[data-recipe-plan]')){
    const r=recipe(s,b.dataset.recipePlan),requested=b.dataset.planRequested==='max'?'max':Number(b.dataset.planRequested),effective=r?.station==='furnace'?1:requested;
    const selected=s.selection?.recipeId===r?.id,exact=selected&&s.selection.requested===effective;
    disabled(b,!editable(app)||s.storageBlocked||!r||!quantity(effective));b.setAttribute('aria-pressed',String(!!selected));
    text(b,exact?'Đang theo dõi':selected?'Cập nhật kế hoạch':'Theo dõi nguyên liệu');
    b.setAttribute('aria-label',b.textContent+': '+(r?.name||''));
   }
  }
  function render(app,s,v){
   const p=v.plan,show=!!(s.selection||s.storageBlocked||s.message);
   hidden($('recipePlan'),!show);text($('recipePlanTitle'),p?p.name:s.selection?'Kế hoạch đang giữ':'Chuẩn bị nguyên liệu');
   text($('recipePlanSummary'),summary(p));text($('recipePlanStation'),stationText(p));renderRows(s,p?.rows||[]);
   text($('recipePlanStatus'),s.message);disabled($('recipePlanReturn'),!editable(app)||!p);disabled($('recipePlanClear'),!editable(app)||!s.selection||s.storageBlocked);
   hidden($('recipePlanReset'),!s.storageBlocked);disabled($('recipePlanReset'),!editable(app)||!s.storageBlocked);
   hidden($('recipePlanHud'),!v.hudVisible);
   if(p){
    text($('recipePlanHudTitle'),p.name);
    const count=p.rows.filter(x=>x.missing>0).length,short=!p.valid?'Chưa tính':p.furnace?(p.stationReady?'Gần lò':'Cần lò'):p.executions===0?'Chưa đủ':count?'Thiếu '+count:!p.outputRoom?'Túi đầy':!p.stationReady?'Cần bàn':'Đủ';
    text($('recipePlanHudState'),p.executions+(p.furnace?' mẻ → ':' lượt → ')+p.outputCount+' · '+short+' · Túi đồ/E');
   }
  }
  function update(app,stations){
   const s=sessions.get(app);if(!s)return null;
   if(stations){s.stations={bench:!!stations.bench,furnace:!!stations.furnace};s.lastStations=performance.now();s.worldId=app.id;s.dimension=app.dimension;}
   else if(s.selection&&healthy(app)&&(s.worldId!==app.id||s.dimension!==app.dimension||performance.now()-s.lastStations>=250)){
    const next=s.ctx.stations();s.stations={bench:!!next.bench,furnace:!!next.furnace};s.lastStations=performance.now();s.worldId=app.id;s.dimension=app.dimension;
   }
   const v=derive(app,s);render(app,s,v);return clone(v);
  }
  function refresh(app,stations){const s=sessions.get(app);if(!s)return null;read(s);const v=update(app,stations);updateButtons(app,s);return v;}
  function select(app,id,requested){
   const s=sessions.get(app),r=s&&recipe(s,id);if(!s||!editable(app)||!r)return false;
   read(s);if(s.storageBlocked){update(app);updateButtons(app,s);return false;}
   const effective=r.station==='furnace'?1:requested;if(!quantity(effective))return false;
   const candidate={recipeId:r.id,requested:effective},raw=JSON.stringify({version:1,...candidate});
   try{globalThis.localStorage.setItem(KEY,raw);}catch{s.lastWrite='failed';s.message='Chưa lưu được kế hoạch. Lựa chọn trước vẫn được giữ.';update(app);updateButtons(app,s);return false;}
   s.selection=candidate;s.raw=raw;s.readStatus='valid';s.lastWrite='saved';s.message='Đã lưu kế hoạch '+r.name+(r.station==='furnace'?' cho 1 mẻ lò.':'.');update(app);updateButtons(app,s);return true;
  }
  function clear(app){
   const s=sessions.get(app);if(!s||!editable(app))return false;
   read(s);if(s.storageBlocked||!s.selection){update(app);updateButtons(app,s);return false;}
   try{globalThis.localStorage.removeItem(KEY);}catch{s.lastWrite='failed';s.message='Chưa bỏ được kế hoạch đã lưu. Lựa chọn trước vẫn được giữ.';update(app);return false;}
   s.selection=null;s.raw=null;s.readStatus='empty';s.lastWrite='cleared';s.message='Đã bỏ theo dõi công thức.';update(app);updateButtons(app,s);return true;
  }
  function reset(app){
   const s=sessions.get(app);if(!s||!editable(app))return false;
   read(s);if(!s.storageBlocked){update(app);updateButtons(app,s);return false;}
   try{globalThis.localStorage.removeItem(KEY);}catch{s.lastWrite='failed';s.message='Chưa đặt lại được nơi lưu kế hoạch. Dữ liệu trước vẫn được giữ.';update(app);return false;}
   s.selection=null;s.raw=null;s.readStatus='empty';s.storageBlocked=false;s.lastWrite='reset';s.message='Đã đặt lại kế hoạch. Bạn có thể chọn công thức mới.';update(app);updateButtons(app,s);return true;
  }
  function button(app,r,requested){
   const s=sessions.get(app),b=document.createElement('button');b.type='button';b.className='pixel-button recipe-plan-track';b.dataset.recipePlan=r.id;b.dataset.planRequested=String(requested);
   const effective=r.station==='furnace'?1:requested,selected=s?.selection?.recipeId===r.id;
   b.disabled=!s||!editable(app)||s.storageBlocked||!quantity(effective);b.setAttribute('aria-pressed',String(!!selected));
   b.textContent=selected?(s.selection.requested===effective?'Đang theo dõi':'Cập nhật kế hoạch'):'Theo dõi nguyên liệu';b.setAttribute('aria-label',b.textContent+': '+r.name);
   b.onclick=()=>{const ok=select(app,r.id,requested);if(!ok&&b.disabled)$('recipePlanStatus').focus({preventScroll:true});};return b;
  }
  function init(app,ctx){
   if(sessions.has(app))throw Error('Recipe plan already initialized');
   const recipes=new Map(V.recipes.map(r=>[r.id,r]));if(recipes.size!==V.recipes.length)throw Error('Recipe plan requires unique recipe IDs');
   const s={ctx,recipes,selection:null,raw:undefined,readStatus:'empty',storageBlocked:false,lastWrite:'not-attempted',message:'',stations:{bench:false,furnace:false},lastStations:-Infinity,worldId:null,dimension:null,rowSignature:null};sessions.set(app,s);read(s);
   $('recipePlanReturn').onclick=()=>{if(editable(app)&&s.selection)ctx.returnToRecipe(clone(s.selection));};
   $('recipePlanClear').onclick=()=>{const id=s.selection?.recipeId;if(clear(app)){const b=[...document.querySelectorAll('button[data-recipe-plan]')].find(x=>x.dataset.recipePlan===id);if(b&&!b.disabled)b.focus({preventScroll:true});else $('recipePlanStatus').focus({preventScroll:true});}};
   $('recipePlanReset').onclick=()=>{if(reset(app))$('recipePlanStatus').focus({preventScroll:true});};update(app);
  }
  function inspect(app){const s=sessions.get(app);return s?clone(derive(app,s)):null;}
  return Object.freeze({init,select,clear,reset,refresh,update,inspect,button});
 })();
 function returnToPlannedRecipe(selection){
  if(!app.started||app.starting||app.inHome||app.contextLost||app.player.health<=0||app.panel!=='inventory')return false;
  const recipe=V.recipes.find(r=>r.id===selection.recipeId);if(!recipe)return false;
  V.crafting3?.setMode(app,'legacy');
  $('recipeSearch').value=recipe.name;$('craftReadyOnly').checked=false;
  const isMax=selection.requested==='max';$('recipeBatchMax').setAttribute('aria-pressed',String(isMax));$('recipeBatchQuantity').disabled=isMax;
  if(!isMax)$('recipeBatchQuantity').value=String(selection.requested);
  $('recipeBatchQuantity').setAttribute('aria-invalid','false');
  renderInventory();
  const target=[...document.querySelectorAll('#recipes button[data-recipe]')].find(b=>b.dataset.recipe===recipe.id),track=[...document.querySelectorAll('#recipes button[data-recipe-plan]')].find(b=>b.dataset.recipePlan===recipe.id);
  if(target){target.classList.add('recipe-plan-target');target.scrollIntoView({block:'center',inline:'nearest'});const focus=target.disabled?track:target;if(focus&&!focus.disabled)focus.focus({preventScroll:true});return true;}
  return false;
 }
 /* C15_RECIPE_PLAN_PC_DRAFT_V3_END */

 function bindUI(){
  initHelpGuide();
  V.crafting3.install(app,{icon,item,quote:recipeBatchQuote,stationAvailable,craft});
  // C20 explicit navigation preserves staged cells and never opens the touch keyboard.
  $('craftGridMaterialsOpen').onclick=()=>{
   $('inventoryGrid').scrollIntoView({block:'start',inline:'nearest'});
   $('inventoryMaterialsHeading').focus({preventScroll:true});
  };
  $('inventoryCraftBack').onclick=()=>{
   V.crafting3.setMode(app,'grid');
   document.querySelector('#inventory .craft-panel').scrollIntoView({block:'start',inline:'nearest'});
   $('craftGridTab').focus({preventScroll:true});
  };

  V.recipePlan.init(app,{quote:recipeBatchQuote,item,stations:()=>({bench:stationNear(18),furnace:!!nearestStation(32)}),returnToRecipe:returnToPlannedRecipe});
  V.hotbarPresets.init(app,{renderHotbar});
  V.inventoryFavourites.init(app,{selectedId,renderInventory});
  bindMuteControls();
  // World latches rejected revisions; coalesce only callbacks queued this turn.
  let geometryRecoveryPendingEpoch=null;
  world.onGeometryRejected=error=>{
   if(error?.code!=='VOXEL_GEOMETRY_BUDGET')return;
   const epoch=world.epoch;
   record('geometry-rejected','A chunk exceeded the geometry budget; CPU state is retained.',{code:error.code,message:error.message,epoch,cx:error.cx,cz:error.cz,dimension:error.dimension,count:error.count,actual:error.actual,limit:error.limit});
   if(geometryRecoveryPendingEpoch===epoch)return;
   geometryRecoveryPendingEpoch=epoch;
   // installData may reject synchronously before start finishes its loading setup.
   queueMicrotask(()=>{
    if(geometryRecoveryPendingEpoch===epoch)geometryRecoveryPendingEpoch=null;
    if(world.epoch!==epoch)return;
    app.starting=false;$('loading').classList.add('hidden');clearInput();unlock();
    const message='Một khu vực vượt giới hạn hình học nên phiên chơi đã tạm dừng. Hãy tải hoặc sao chép JSON trước, rồi tải lại trang hoặc chọn thế giới khác. Xuất bản sao không ghi đè ô lưu.';
    if(!app.started){openPanel('worlds');toast('Không dựng được khu vực quá dày đặc. Dùng Xuất JSON để giữ bản lưu trước khi tải lại trang hoặc chọn thế giới khác.',9000);return;}
    try{openBackup(message);}
    catch(e){
     record('geometry-backup-error','Could not encode the current CPU snapshot; stored-world export remains available.',{message:e.message,epoch});
     openPanel('worlds');
     toast('Chưa tạo được JSON của phiên hiện tại: '+e.message+'. Nút Xuất JSON chỉ lấy bản đã lưu trước đó; hãy giữ bản này trước khi tải lại trang.',12000);
    }
   });
  };
  $('creativeMode').onclick=()=>applyModeChoice('creative');$('survivalMode').onclick=()=>applyModeChoice('survival');$('randomSeed').onclick=()=>$('seedInput').value='MAIME-RAP-'+Math.random().toString(36).slice(2,9).toUpperCase();$('playBtn').onclick=()=>start($('seedInput').value,app.modeChoice);$('continueBtn').onclick=()=>{if(app.started){app.inHome=false;$('home').classList.add('hidden');$('hud').classList.remove('hidden');hidePanels();controls();}else if(app.lastWorldId)loadWorld(app.lastWorldId);};$('worldsBtn').onclick=()=>openPanel('worlds');$('homeHelp').onclick=()=>openPanel('help');$('pauseBtn').onclick=()=>{save(false);openPanel('pause');};$('resumeBtn').onclick=()=>{hidePanels();controls();};$('creativeUndoPlacement').onclick=()=>V.creativePlacementHistory.undo();$('creativeRedoPlacement').onclick=()=>V.creativePlacementHistory.redo();refreshCreativePlacementHistory();$('saveBtn').onclick=()=>save(true);$('exportBtn').onclick=()=>openBackup();$('settingsBtn').onclick=()=>openPanel('settings','pause');$('weatherBtn').onclick=()=>{openPanel('settings','pause');$('weatherSettings').scrollIntoView({block:'start'});};$('helpBtn').onclick=()=>openPanel('help','pause');$('titleBtn').onclick=()=>{if(!save(true))return;hidePanels();app.inHome=true;clearInput();unlock();$('home').classList.remove('hidden');$('hud').classList.add('hidden');refreshContinue();};$('inventoryDone').onclick=closePanel;$('settingsDone').onclick=closePanel;$('helpDone').onclick=closePanel;$('worldsDone').onclick=closePanel;document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closePanel);$('itemSearch').oninput=renderInventory;$('craftedFamilyFilter').onchange=renderInventory;$('craftedFilterClear').onclick=()=>{$('craftedFamilyFilter').value='all';renderInventory();$('craftedFamilyFilter').focus();};$('recipeSearch').oninput=renderInventory;$('recipeBatchQuantity').oninput=refreshRecipeBatchControls;$('recipeBatchMax').onclick=()=>{$('recipeBatchMax').setAttribute('aria-pressed',String($('recipeBatchMax').getAttribute('aria-pressed')!=='true'));refreshRecipeBatchControls();};$('craftReadyOnly').onchange=renderInventory;$('recipeFilterClear').onclick=()=>{$('recipeSearch').value='';$('craftReadyOnly').checked=false;renderInventory();$('recipeSearch').focus();};document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{app.tab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(t=>t.classList.toggle('active',t===b));renderInventory();});for(const name of ['distance','scale','fov','sensitivity','volume','wind'])$(name+'Setting').oninput=e=>{options[name]=Number(e.target.value);if(name==='distance'||name==='scale')options.quality='custom';applySettings();};for(const name of ['invert','cycle','bobbing','leaves','rtShadows','waterFX','materialDetail'])$(name+'Setting').onchange=e=>{options[name]=e.target.checked;if(name==='rtShadows'||name==='waterFX'||name==='materialDetail')options.quality='custom';applySettings();};for(const[id,k]of [['cloudStyle','cloudStyle'],['celestialStyle','celestialStyle'],['weather','weatherMode']])$(id+'Setting').onchange=e=>{options[k]=e.target.value;if(k==='cloudStyle')options.quality='custom';applySettings();};$('uiFontSetting').onchange=e=>{options.uiFont=e.target.value;applySettings();};$('cameraSetting').onchange=e=>setPerspective(e.target.value);$('cameraMotionSetting').onchange=e=>{options.cameraMotion=e.target.value;app.cameraMotionState=null;app.cameraMotionDebug=null;applySettings();};$('texturePackSetting').onchange=e=>chooseTexturePack(e.target.value);$('qualitySetting').onchange=e=>chooseGraphicsPreset(e.target.value);$('aaSetting').onchange=e=>{options.antiAliasing=e.target.value;applySettings();};$('shadowQualitySetting').onchange=e=>{options.shadowQuality=e.target.value;options.quality='custom';applySettings();};$('dawnBtn').onclick=()=>app.time=.26;$('noonBtn').onclick=()=>app.time=.44;$('nightBtn').onclick=()=>app.time=.87;$('fullscreenBtn').onclick=()=>{const promise=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();promise?.catch(()=>toast('Trình duyệt chưa cho phép toàn màn hình.'));};$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>8*1024*1024)throw Error('Tệp vượt 8 MB.');importText(await f.text());}catch(err){toast('Chưa nhập: '+err.message,6500);record('import-rejected',err.message);}finally{e.target.value='';}};$('downloadBackup').onclick=()=>downloadText($('backupText').value,'MAI_ME_RAP_'+app.seed.replace(/[^a-z0-9_-]/gi,'_')+'_'+new Date().toISOString().slice(0,10)+'.json');$('copyBackup').onclick=()=>{$('backupText').focus();$('backupText').select();toast('Đã chọn toàn bộ mã. Nhấn Ctrl+C để sao chép.');};$('respawnBtn').onclick=()=>{if(app.dimension!=='overworld'){V.dimensions.respawn(app);return;}const p=app.player,safe=V.findSafeRespawn(world,app.spawn);clearInput();[p.x,p.y,p.z]=safe.position;p.vx=p.vy=p.vz=0;p.grounded=false;p.health=20;p.hunger=16;p.air=12;p.fallStart=p.y;app.hurt=0;app.regen=0;app.drown=0;app.pendingDeath=false;app.lastRespawn=safe;resetPresentation();hidePanels();controls();record('respawn','Returned near the original world spawn.',safe);if(safe.reason.startsWith('fallback-'))toast('Điểm xuất phát bị phủ kín; đã đưa bạn lên khoảng trống phía trên.',6500);else if(safe.moved)toast('Điểm cũ bị chắn; đã chọn mặt đất an toàn gần đó.');save(false);};$('contextExport').onclick=()=>{openBackup('Dữ liệu CPU vẫn được giữ dù đồ họa đang mất. Hãy tải tệp JSON dự phòng.');};
 }
 bindUI();V.savedWorlds?.install(app,{renderWorlds,refreshContinue});refreshContinue();syncSettings();
 const gameKeys=new Set(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','ControlLeft','ControlRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
 // Native Home/End remains in the keyboard-focused item detail, not in the outer short-landscape panel.
  $('inventoryDetail').addEventListener('keydown',e=>{if(app.panel!=='inventory'||e.target!==$('inventoryDetail')||!['Home','End'].includes(e.code)||e.ctrlKey||e.metaKey||e.altKey)return;e.preventDefault();e.stopPropagation();const d=$('inventoryDetail');d.scrollTop=e.code==='Home'?0:Math.max(0,d.scrollHeight-d.clientHeight);},true);
  document.addEventListener('keydown',e=>{if(e.code==='Escape'){if(app.inHome){if(app.panel)closePanel();return;}if(app.panel&&app.panel!=='death')closePanel();else if(!app.panel){save(false);openPanel('pause');}e.preventDefault();return;}if(e.code==='F5'&&app.playing&&!app.inHome&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.shiftKey){e.preventDefault();if(active()&&!e.repeat)cyclePerspective();return;}const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);if(typing)return;if(c14AudioShortcut(e))return;if(creativePlacementShortcut(e))return;if(e.code==='KeyJ'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&app.playing&&!app.inHome){e.preventDefault();if(e.repeat)return;if(app.panel==='adventure')closePanel();else if(!app.panel||['inventory','pause'].includes(app.panel))V.adventureUI.open(app);return;}if(e.code==='KeyE'&&app.playing&&!app.inHome){e.preventDefault();if(e.repeat)return;if(app.panel==='inventory')closePanel();else if(!app.panel)openPanel('inventory');return;}if(/^Digit[1-9]$/.test(e.code)&&app.playing&&!app.inHome&&!managedPanelNames.has(app.panel)){e.preventDefault();selectSlot(Number(e.code.slice(-1))-1);return;}if(!active())return;if(e.code==='KeyG'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();if(!e.repeat)dismountHorse();return;}if(e.code==='KeyX'){e.preventDefault();if(!e.repeat)toggleOreVision();return;}if(e.code==='KeyR'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();if(!e.repeat)toggleSprint();return;}if(e.code==='KeyW'&&!e.repeat&&!app.keys.has('KeyW')){const now=performance.now();if(now-app.lastForwardPress>=0&&now-app.lastForwardPress<=280)app.sprintDouble=true;app.lastForwardPress=now;}if(gameKeys.has(e.code)){e.preventDefault();app.keys.add(e.code);}if(e.code==='Space'&&!e.repeat){const now=performance.now();if(now-app.lastSpace<280&&creative())toggleFly();app.lastSpace=now;}if(e.code==='KeyF'&&!e.repeat){e.preventDefault();toggleFly();}if(e.code==='F1'){e.preventDefault();app.hiddenHUD=!app.hiddenHUD;document.body.classList.toggle('hud-hidden',app.hiddenHUD);}if(e.code==='F2'){e.preventDefault();app.takeShot=true;}if(e.code==='F3'){e.preventDefault();app.debug=!app.debug;$('debug').classList.toggle('hidden',!app.debug);} });
 document.addEventListener('keyup',e=>{app.keys.delete(e.code);if(e.code==='KeyW')app.sprintDouble=false;});window.addEventListener('blur',()=>{clearInput();if(active()){save(false);openPanel('pause');}});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();save(false);if(app.playing&&!app.inHome&&!app.panel)openPanel('pause');Audio.ctx?.suspend().catch(()=>{});}});window.addEventListener('pagehide',()=>save(false));
 $('game').addEventListener('contextmenu',e=>e.preventDefault());$('game').addEventListener('mousedown',e=>{if(!active())return;if(!document.pointerLockElement&&!app.qaMode&&!app.allowUnlocked&&!matchMedia('(pointer: coarse)').matches){controls();return;}e.preventDefault();if(e.button===1){const t=world.ray(eye(),direction(),6);if(t&&creative()){app.hotbar[app.selected]=V.wallTorches.canonicalItem(t.id);renderHotbar();}return;}app.buttons.add(e.button);if(e.button===0)strikeOnPress();if(e.button===2)useSelected();});window.addEventListener('mouseup',e=>{app.buttons.delete(e.button);if(e.button===2)app.companionUseLatched=false;});document.addEventListener('mousemove',e=>{if(!active())return;if(document.pointerLockElement===$('game')){app.player.yaw+=e.movementX*.0022*options.sensitivity/100;app.player.pitch=clamp(app.player.pitch-e.movementY*.0022*options.sensitivity/100*(options.invert?-1:1),-1.54,1.54);}});$('game').addEventListener('wheel',e=>{if(active()){e.preventDefault();selectSlot(app.selected+Math.sign(e.deltaY));}},{passive:false});document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&active()&&!app.qaMode&&!matchMedia('(pointer: coarse)').matches){save(false);openPanel('pause');}});document.addEventListener('pointerlockerror',()=>{app.allowUnlocked=true;record('input','Pointer lock unavailable; keyboard look remains available.');toast('Khóa chuột bị chặn: dùng mũi tên để nhìn; chuột trái/phải vẫn đào/đặt.');});
 let touchLook=null;$('game').addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&active()){touchLook={id:e.pointerId,x:e.clientX,y:e.clientY};$('game').setPointerCapture(e.pointerId);}});$('game').addEventListener('pointermove',e=>{if(touchLook?.id===e.pointerId&&active()){app.player.yaw+=(e.clientX-touchLook.x)*.005;app.player.pitch=clamp(app.player.pitch-(e.clientY-touchLook.y)*.005,-1.54,1.54);touchLook.x=e.clientX;touchLook.y=e.clientY;}});$('game').addEventListener('pointerup',()=>touchLook=null);$('game').addEventListener('pointercancel',()=>touchLook=null);const pad=$('touchPad');const padMove=e=>{const r=pad.getBoundingClientRect();app.touchMove=[clamp((e.clientX-r.x-r.width/2)/(r.width/2),-1,1),clamp((e.clientY-r.y-r.height/2)/(r.height/2),-1,1)];};pad.onpointerdown=e=>{pad.setPointerCapture(e.pointerId);padMove(e);};pad.onpointermove=e=>{if(pad.hasPointerCapture(e.pointerId))padMove(e);};pad.onpointerup=pad.onpointercancel=()=>app.touchMove=null;for(const[id,button]of [['touchMine',0],['touchPlace',2]]){$(id).onpointerdown=e=>{e.preventDefault();$(id).setPointerCapture(e.pointerId);app.buttons.add(button);if(button===0)strikeOnPress();if(button===2)useSelected();};$(id).onpointerup=$(id).onpointercancel=$(id).onlostpointercapture=()=>{app.buttons.delete(button);if(button===2)app.companionUseLatched=false;};}$('touchJump').onpointerdown=e=>{e.preventDefault();$('touchJump').setPointerCapture(e.pointerId);app.keys.add('Space');};$('touchJump').onpointerup=$('touchJump').onpointercancel=()=>app.keys.delete('Space');$('touchBag').onclick=()=>openPanel('inventory');$('touchMount').onclick=()=>{if(dismountHorse())$('game').focus({preventScroll:true});};$('touchRun').onclick=()=>{if(toggleSprint())$('game').focus({preventScroll:true});};$('xrayBtn').onclick=()=>{if(toggleOreVision())$('game').focus({preventScroll:true});};
 $('game').addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.releaseFXAA(true);app.contextLost=true;clearInput();unlock();$('contextLost').classList.remove('hidden');$('contextMessage').textContent='Mất ngữ cảnh lúc '+new Date().toLocaleTimeString('vi-VN');save(false);record('graphics','WebGL context lost; CPU world retained.');});$('game').addEventListener('webglcontextrestored',()=>{try{renderer.init();world.rebuildAll();resetPresentation();app.contextLost=false;$('contextLost').classList.add('hidden');if(app.started&&!app.inHome&&!app.panel)openPanel('pause');if(!app.panel)toast('Đã khôi phục WebGL2; thế giới vẫn được giữ.');record('graphics','WebGL context restored; resources rebuilt.');}catch(e){$('contextMessage').textContent=e.message;record('error','Context restore failed',e.message);}});
 let last=performance.now(),accumulator=0,hudTimer=0,lastRender=0;
 function loop(now){requestAnimationFrame(loop);const elapsed=Math.min(.10,(now-last)/1000);last=now;if(!app.contextLost)world.tick(app.player.x,app.player.z);if(app.starting){const st=world.stats();$('loadingFill').style.width=Math.min(100,st.ready/9*100)+'%';$('loadingInfo').textContent=st.ready+' vùng đã dựng · '+st.resident+' vùng quanh bạn';if(st.ready>=7||now-app.startAt>10000){app.starting=false;$('loading').classList.add('hidden');save(false);if(app.pendingDeath){app.pendingDeath=false;$('deathReason').textContent='Phiên trước kết thúc khi bạn đã gục ngã. Chọn hồi sinh để trở lại điểm xuất phát.';openPanel('death');}else if(!app.panel)toast(creative()?'Sẵn sàng! E chọn khối · F bay · Chuột trái đào, phải đặt':'Ngày đầu: tìm một thân cây. Nhấn J để mở Sổ Gió.',5500);}}if(active()){accumulator+=elapsed;let steps=0;while(active()&&accumulator>=1/60&&steps++<6){update(1/60);accumulator-=1/60;}}else{accumulator=0;if(app.panel==='furnace'&&app.playing&&!app.inHome&&!app.starting&&!app.contextLost){V.furnaces.update(app,elapsed);app.clock+=elapsed;app.saveTimer+=elapsed;if(app.saveTimer>=15){app.saveTimer=0;save(false);}}}if(app.inHome){app.clock+=elapsed*.3;if(!app.started)app.time=.37;}app.weatherState=weatherController.update({worldId:app.id||'home',epoch:world.epoch,seed:app.seed,day:app.day,time:app.time,clock:app.clock,dt:elapsed},options);V.services.tick(app,elapsed);hudTimer+=elapsed;if(hudTimer>.12){hudTimer=0;updateHUD();}if(app.contextLost)return;if(!active()&&now-lastRender<50)return;const frameMs=now-lastRender;lastRender=now;if(active()){app.frames.push(frameMs);if(app.frames.length>900)app.frames.shift();}let camera,physicalEye=eye();if(app.inHome){resetPresentation();camera={eye:[app.player.x+17,app.player.y+14,app.player.z+25],yaw:-.6+Math.sin(now*.000025)*.10,pitch:-.28};const st=world.stats();$('homeStatus').textContent=st.ready>8?'Sẵn sàng khám phá · '+st.ready+' vùng đã dựng':'Đang tạo cảnh nền · '+st.ready+' vùng';}else{renderer.resize();app.presentation=V.resolvePresentationCamera({physical:{eye:physicalEye,yaw:app.player.yaw,pitch:app.player.pitch},mode:options.cameraView,world,blocks:V.blocks,epoch:world.epoch,dt:elapsed,projection:{fovDegrees:options.fov,aspect:renderer.canvas.width/renderer.canvas.height,near:.055}},app.cameraState);app.cameraState=app.presentation.nextState;camera=app.presentation.cameraWorld;const motion=V.cameraMotion.apply({camera,position:[app.player.x,app.player.y,app.player.z],epoch:world.epoch,mode:options.cameraView,dt:elapsed,active:active(),grounded:!!app.player.grounded,enabled:cameraMotionEnabled(),flying:!!app.player.fly,underwater:!!app.underwater,mounted:V.mounts.active(app),crouching:!!app.player.crouch},app.cameraMotionState);app.cameraMotionState=motion.nextState;app.cameraMotionDebug=motion.debug;camera=motion.camera;app.presentation.cameraWorld=camera;app.avatarPose=app.presentation.avatarVisible?avatar.pose(app.player,{walk:app.walk,swing:app.swing,selectedId:selectedId(),equipment:V.equipment.appearance(app),riding:V.mounts.active(app)}):null;app.renderUnderwater=world.get(Math.floor(camera.eye[0]),Math.floor(camera.eye[1]),Math.floor(camera.eye[2]),true)===7;}$('waterTint').style.opacity=app.renderUnderwater?'1':'0';const cubes=V.entities?V.entities.cubes(app):[];cubes.push(...V.guardian.cubes(app));if(app.avatarPose)cubes.push(...app.avatarPose.cubes);cubes.push(...V.furnaces.effects(app,app.clock));for(const p of app.particles)cubes.push({p:[p.x,p.y,p.z],s:[.09,.09,.09],id:p.id,yaw:p.life*6,tint:[1,1,1]});try{renderer.frame(world,camera,app.time,app.clock,{cloudStyle:options.cloudStyle,celestialStyle:options.celestialStyle,weather:app.weatherState,waterFX:options.waterFX,materialDetail:options.materialDetail,shadowQuality:options.shadowQuality,antiAliasing:options.antiAliasing,oreVision:app.inHome?null:app.oreVision,rtShadows:!app.inHome&&options.rtShadows,underwater:app.renderUnderwater,leaves:options.leaves,extraLights:V.furnaces.lights(app),lightRevision:V.furnaces.lightRevision(app),target:active()?app.target:null,mining:app.mining,physicalEye:app.inHome?camera.eye:physicalEye,lightHand:app.inHome?undefined:selectedId(),playerShadow:app.avatarPose?.contactShadow,hand:app.inHome||!app.presentation?.showFirstPersonHand?undefined:selectedId(),hidden:app.hiddenHUD,creative:creative(),walk:options.bobbing?app.walk:0,swing:app.swing},cubes);updatePresentationReticle();}catch(e){record('error','Frame rendering failed',e.stack||e.message);app.contextLost=true;$('fatal').classList.remove('hidden');$('fatalMessage').textContent=e.message;}if(app.takeShot){app.takeShot=false;$('game').toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='MAI_ME_RAP_'+Date.now()+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('Đã chụp ảnh thế giới.');});}}
 requestAnimationFrame(loop);
 app.api={start,save,upgradeWorld,setPerspective,cyclePerspective,resetPresentation,snapshot,exportText,importText,loadWorld,openPanel,closePanel,breakTarget,useSelected,selectSlot,craft,physics,update,damage,addItem,eye,direction,renderInventory,renderHotbar,updateHUD,toast,clearInput,controls,toggleFly,dismountHorse,cameraMotionEnabled,stationNear,nearestStation,record};
 V.sceneLibrary?.install(app,{icon,item});V.services.init(app,{icon,item});V.adventureUI.install(app,{icon,item});V.dimensions.install(app);V.mcImportUI?.install(app);
})();
