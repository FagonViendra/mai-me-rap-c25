/* C25: eight offline scene starters using the existing validated import path. */
(() => {
  'use strict';
  const V=globalThis.Voxel;
  const specs=Object.freeze([
    Object.freeze({id:'lake_village',group:'expansion',buttonId:'sceneLaunchLakeVillage',name:'Xóm ven hồ',theme:'lake',blocks:[8,33,10,7,170,217],description:'Dạo qua cầu gỗ, hồ nước và những căn nhà với cửa kính, mái gỗ tối.',route:'Bay đã bật. F để đi bộ; E mở túi đồ. Chơi tiếp từ Thế giới đã lưu.'}),
    Object.freeze({id:'sky_garden',group:'expansion',buttonId:'sceneLaunchSkyGarden',name:'Vườn trên cao',theme:'garden',blocks:[164,165,166,168,169,52],description:'Lên các bậc thạch anh giữa anh đào, vòm tinh thạch tím và đèn lăng kính.',route:'Bay đã bật. F để đi bộ; E mở túi đồ. Chơi tiếp từ Thế giới đã lưu.'}),
    Object.freeze({id:'market_workshop',group:'expansion',buttonId:'sceneLaunchMarketWorkshop',name:'Khu chợ và xưởng',theme:'market',blocks:[160,162,163,171,18,32],description:'Khám phá các quầy chợ, xưởng mái đồng xanh và cửa kính hổ phách.',route:'Bay đã bật. F để đi bộ; E mở túi đồ. Chơi tiếp từ Thế giới đã lưu.'}),
    Object.freeze({id:'forest_farm',group:'expansion',buttonId:'sceneLaunchForestFarm',name:'Nông trại ven rừng',theme:'farm',blocks:[5,11,38,7,18,32],description:'Nhà kho, hai khu chuồng mở, ruộng trống cạnh mương và vườn sồi.',route:'Bay đã bật. F để đi bộ; E mở túi đồ. Chơi tiếp từ Thế giới đã lưu.'}),
    Object.freeze({id:'crafted_workshop',group:'expansion',buttonId:'sceneLaunchCraftedWorkshop',name:'Xưởng 100 mẫu mới',theme:'workshop',blocks:[249,260,269,279,299,339],description:'Xem 100 mẫu đá, gốm, gỗ, kim loại cùng bậc, cột, khung và đồ trang trí.',route:'Bay đã bật. E mở túi đồ; chọn mẫu để xây tiếp. Mỗi lần mở tạo một bản riêng.'}),
    Object.freeze({id:'inferno',group:'classic',buttonId:'sceneLaunchInferno',name:'Vực Lửa',theme:'ember',blocks:[67,68,69,70,71,72],description:'Đi dọc lối gạch giữa đá tàn hỏa, dung nham và tinh thể màu hổ phách.',route:'Cổng tím ở cuối lối đi dẫn về sân nhà.'}),
    Object.freeze({id:'sky',group:'classic',buttonId:'sceneLaunchSky',name:'Thiên Giới',theme:'sky',blocks:[73,74,75,76,77,78],description:'Khám phá nền đá sáng, cỏ thiên giới, pha lê mây và tinh thể nhật quang.',route:'Đi theo lối giữa đảo tới cổng thiên giới.'}),
    Object.freeze({id:'workshop',group:'classic',buttonId:'sceneLaunchWorkshop',name:'Xưởng & vườn trưng bày',theme:'workshop',blocks:[18,32,79,167,169,171],description:'Dạo quanh xưởng, đèn và kính; xem 16 sinh vật thuộc bốn nhóm mẫu.',route:'Bay đã bật sẵn: F để đi bộ, E mở túi đồ. Mỗi lần mở tạo một bản riêng từ xưởng C20.'})
  ]);
  let state=null;
  function notice(message,kind='ready'){
    if(!state)return;
    state.status.textContent=message;
    state.status.dataset.state=kind;
    state.status.setAttribute('role',kind==='error'?'alert':'status');
    state.status.setAttribute('aria-live',kind==='error'?'assertive':'polite');
  }
  function lock(value){
    const s=state;if(!s)return;
    s.busy=value;s.cards.setAttribute('aria-busy',String(value));
    if(value){
      s.locked=[...s.panel.querySelectorAll('button,input,select,textarea')].filter(e=>e.id!=='worldsDone'&&!e.hasAttribute('data-close')).map(element=>({element,disabled:element.disabled}));
      for(const row of s.locked)row.element.disabled=true;
    }else{
      for(const row of s.locked)if(row.element.isConnected)row.element.disabled=row.disabled;
      s.locked=[];
      V.savedWorlds?.afterSceneUnlock?.(s.app);
    }
  }
  function record(kind,message,data){
    state?.app.api.record(kind,message,data);
  }
  function backup(message){
    const app=state.app;
    if(app.panel==='backup')return;
    const text=document.getElementById('backupMessage');
    if(text)text.textContent=message;
    app.api.openPanel('backup','worlds');
  }
  async function launch(spec,button){
    const s=state,app=s?.app;
    if(!s||s.busy||app.panel!=='worlds')return false;
    if(app.contextLost){notice('Đồ họa đang khôi phục. Hãy đợi rồi mở cảnh.','error');return false;}
    if(app.starting){notice('Thế giới đang tải. Hãy đợi tải xong rồi chọn cảnh khác.','ready');return false;}
    const source=V.builtInScenes?.find(scene=>scene.id===spec.id);
    if(!source||typeof source.text!=='string'){notice('Chưa đọc được cảnh có sẵn trong bản trò chơi này.','error');return false;}
    const previousId=app.id;
    s.attempts++;s.pending=spec.id;s.phase='preparing';const generation=++s.generation;
    notice('Đang tạo bản '+spec.name+' của bạn…','busy');
    lock(true);
    let opened=null;
    try{
      // Leave one painted frame for the notice; closing the panel cancels before import.
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      if(s.generation!==generation||app.panel!=='worlds'||app.contextLost){
        s.last={sceneId:spec.id,outcome:'cancelled',previousId,worldId:app.id};
        notice('Đã hủy tạo cảnh.','ready');
        return false;
      }
      s.phase='importing';
      opened=app.api.importText(source.text);
      if(app.id!==opened.id)throw Error('Cảnh mới chưa trở thành phiên chơi hiện tại.');
      if(!app.saveOK){
        s.last={sceneId:spec.id,outcome:'opened-unsaved',previousId,worldId:opened.id,sourceSha256:source.sha256};
        notice('Đã mở cảnh nhưng chưa lưu được. Hãy xuất JSON dự phòng.','error');
        backup('Đã mở cảnh nhưng trình duyệt chưa ghi được ô lưu mới. Hãy tải JSON dự phòng trước khi rời trang.');
        record('scene-open-unsaved','Built-in scene opened; existing backup UI retained.',s.last);
        return false;
      }
      if(!V.saveCodec.isAdventureSlot(opened.id))throw Error('Chưa xác nhận được ô lưu mới.');
      const persisted=V.saveCodec.decode(V.saveCodec.readRaw(opened.id));
      if(persisted.id!==opened.id||persisted.dimension!==app.dimension)throw Error('Bản lưu mới chưa khớp cảnh đang mở.');
      s.last={sceneId:spec.id,outcome:'saved',previousId,worldId:opened.id,sourceSha256:source.sha256};
      notice('Đã tạo bản '+spec.name+' riêng. Chơi tiếp từ danh sách thế giới đã lưu.','success');
      record('scene-open','Opened a built-in scene in a verified new saved slot.',s.last);
      return true;
    }catch(error){
      const detail=String(error?.message||error);
      const newLiveWorld=app.started&&app.id!==previousId;
      s.last={sceneId:spec.id,outcome:newLiveWorld?'opened-storage-unconfirmed':'rejected',previousId,worldId:app.id,message:detail};
      if(newLiveWorld)backup('Đã mở cảnh, nhưng chưa thể xác nhận bản lưu. Phiên chơi vẫn ở đây; hãy tải JSON dự phòng trước khi rời trang.');
      notice((newLiveWorld?'Cảnh đang mở nhưng chưa xác nhận được bản lưu: ':'Chưa mở cảnh: ')+detail,'error');
      record('scene-open-rejected','Built-in scene request was not confirmed as saved.',s.last);
      return false;
    }finally{
      s.phase='idle';s.pending=null;lock(false);
      if(app.panel==='worlds'&&button.isConnected)button.focus({preventScroll:true});
    }
  }
  function onPanelLeave(app){
    const s=state;
    if(!s||s.app!==app||s.phase!=='preparing')return false;
    s.generation++;
    notice('Đã hủy tạo cảnh.','ready');
    return true;
  }
  function refresh(app){
    const s=state;if(!s||s.app!==app)return;
    for(const image of s.cards.querySelectorAll('img[data-scene-block]')){
      const value=s.icon(Number(image.dataset.sceneBlock));
      if(image.getAttribute('src')!==value)image.src=value;
    }
  }
  function install(app,{icon,item}){
    if(state)return;
    const panel=document.getElementById('worlds'),cards=document.getElementById('sceneCards'),status=document.getElementById('sceneStatus'),jump=document.getElementById('sceneJumpSaved');
    if(!panel||!cards||!status||!jump)throw Error('Scene library interface is missing.');
    state={app,panel,cards,status,icon,item,busy:false,pending:null,phase:'idle',generation:0,attempts:0,last:null,locked:[]};
    const groups=new Map();
    for(const [id,title] of [['expansion','Khám phá thêm'],['classic','Vực giới & xưởng']]){
      const section=document.createElement('section');section.className='scene-group scene-group-'+id;
      const heading=document.createElement('h4');heading.id='sceneGroup-'+id;heading.className='scene-group-heading';heading.textContent=title;
      section.setAttribute('aria-labelledby',heading.id);
      const grid=document.createElement('div');grid.className='scene-cards';
      section.append(heading,grid);cards.append(section);groups.set(id,grid);
    }
    for(const spec of specs){
      const card=document.createElement('article');card.className='scene-card scene-card-'+spec.theme;card.dataset.sceneId=spec.id;
      const heading=document.createElement('h5');heading.id='sceneTitle-'+spec.id;heading.textContent=spec.name;
      card.setAttribute('aria-labelledby',heading.id);
      const swatches=document.createElement('div');swatches.className='scene-materials';swatches.setAttribute('aria-label','Vật liệu của '+spec.name);
      for(const id of spec.blocks){
        const image=document.createElement('img');image.dataset.sceneBlock=String(id);image.width=48;image.height=48;
        image.alt=item(id).name;image.title=item(id).name;image.draggable=false;swatches.append(image);
      }
      const description=document.createElement('p');description.className='scene-description';description.textContent=spec.description;
      const route=document.createElement('p');route.className='scene-route';route.id='sceneRoute-'+spec.id;route.textContent=spec.route;
      const button=document.createElement('button');button.id=spec.buttonId;button.type='button';button.className='pixel-button primary scene-launch';
      button.textContent='Chơi '+spec.name;button.setAttribute('aria-describedby','sceneLibraryIntro '+route.id);
      button.addEventListener('click',()=>{void launch(spec,button);});
      card.append(heading,swatches,description,route,button);groups.get(spec.group).append(card);
    }
    jump.addEventListener('click',()=>{
      if(state.busy||app.panel!=='worlds')return;
      const target=document.getElementById('savedWorldsTitle');if(!target)return;
      target.focus({preventScroll:true});target.scrollIntoView({block:'start',inline:'nearest'});
    });
    refresh(app);
  }
  V.sceneLibrary=Object.freeze({
    install,refresh,onPanelLeave,
    inspect(){
      if(!state)return{installed:false};
      return{installed:true,busy:state.busy,pending:state.pending,phase:state.phase,generation:state.generation,attempts:state.attempts,last:state.last?{...state.last}:null,
        sceneIds:specs.map(s=>s.id),sourcePins:(V.builtInScenes||[]).map(s=>({id:s.id,bytes:s.bytes,sha256:s.sha256})),
        buttons:specs.map(s=>({id:s.buttonId,disabled:document.getElementById(s.buttonId)?.disabled===true})),
        status:state.status.textContent,statusKind:state.status.dataset.state||'ready'};
    }
  });
})();
