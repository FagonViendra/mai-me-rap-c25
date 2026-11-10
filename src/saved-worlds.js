/* C23: browser-local saved-world names, search and favorites. World payloads stay native. */
(() => {
  'use strict';
  const V=globalThis.Voxel;
  const PREFIX='mienkhoi.worldmeta.v1.';
  const validId=id=>typeof id==='string'&&/^mk-[a-z0-9-]{1,70}$/.test(id);
  const defaultValue=field=>field==='title'?'':false;
  const editable=record=>record.status==='ok'||record.status==='missing';
  function key(id,field){
    if(!validId(id)||!['title','favorite'].includes(field))throw Error('Ô lưu hoặc trường thông tin không hợp lệ.');
    return PREFIX+field+'.'+id;
  }
  function normalizeTitle(value){
    if(typeof value!=='string')throw Error('Tên riêng phải là văn bản.');
    if(value.length>2048)throw Error('Nội dung quá dài. Hãy nhập tên tối đa 60 ký tự.');
    const title=value.replace(/\s+/gu,' ').trim().normalize('NFC');
    const points=Array.from(title);
    if(points.length>60)throw Error('Tên riêng tối đa 60 ký tự. Nội dung bạn nhập vẫn được giữ để sửa.');
    if(/[\u0000-\u001f\u007f-\u009f]/u.test(title)||points.some(c=>c.length===1&&c.charCodeAt(0)>=0xd800&&c.charCodeAt(0)<=0xdfff))throw Error('Tên có ký tự không dùng được. Hãy sửa lại tên.');
    return title;
  }
  function fold(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/gu,'').replace(/[đĐ]/gu,'d').toLocaleLowerCase('vi').replace(/\s+/gu,' ').trim();}
  function read(id,field){
    const storageKey=key(id,field),fallback=defaultValue(field);
    let raw;
    try{raw=globalThis.localStorage.getItem(storageKey);}catch{return{status:'unavailable',raw:undefined,value:fallback};}
    if(raw===null)return{status:'missing',raw,value:fallback};
    if(typeof raw!=='string'||raw.length>4096)return{status:'invalid',raw,value:fallback};
    try{
      const data=JSON.parse(raw);
      if(!data||typeof data!=='object'||Array.isArray(data))throw Error('shape');
      if(Number.isInteger(data.version)&&data.version>1)return{status:'future',raw,value:fallback};
      if(data.version!==1||Object.keys(data).length!==2||!Object.hasOwn(data,'value'))throw Error('version');
      if(field==='title'){
        if(typeof data.value!=='string'||!data.value||normalizeTitle(data.value)!==data.value)throw Error('title');
      }else if(data.value!==true)throw Error('favorite');
      return{status:'ok',raw,value:data.value};
    }catch{return{status:'invalid',raw,value:fallback};}
  }
  function write(id,field,value,expectedRaw){
    const storageKey=key(id,field);
    if(field==='title')value=normalizeTitle(value);
    else if(typeof value!=='boolean')throw Error('Yêu thích phải có trạng thái bật hoặc tắt.');
    const current=read(id,field);
    if(!editable(current))return{status:current.status,written:false};
    if(current.raw!==expectedRaw)return{status:'conflict',written:false};
    const raw=value===defaultValue(field)?null:JSON.stringify({version:1,value});
    if(raw===current.raw)return{status:'saved',written:false,value,raw};
    try{
      if(raw===null)globalThis.localStorage.removeItem(storageKey);
      else globalThis.localStorage.setItem(storageKey,raw);
    }catch{return{status:'rejected',written:false};}
    let actual;
    try{actual=globalThis.localStorage.getItem(storageKey);}catch{return{status:'unconfirmed',written:true};}
    if(actual!==raw)return{status:'unconfirmed',written:true};
    return{status:'saved',written:true,value,raw};
  }
  const metadata=Object.freeze({prefix:PREFIX,normalizeTitle,fold,key,read,write});
  V.savedWorldMetadata=metadata;

  let state=null;
  const $=id=>document.getElementById(id);
  const node=(tag,className,text)=>{
    const element=document.createElement(tag);
    if(className)element.className=className;
    if(text!==undefined)element.textContent=text;
    return element;
  };
  const collator=new Intl.Collator('vi',{usage:'sort',sensitivity:'base',numeric:true});
  function isBusy(){return V.sceneLibrary?.inspect().busy===true;}
  function allowed(){return !!state&&state.app.panel==='worlds'&&!state.app.contextLost&&!isBusy();}
  function notice(message,kind='ready'){
    if(!state)return;
    state.message=message;state.messageKind=kind;
    paintStatus();
  }
  function paintStatus(){
    const s=state;if(!s)return;
    const bad=s.rows.filter(row=>!editable(row.meta.title)||!editable(row.meta.favorite)).length;
    const warning=bad?'Có '+bad+' ô chưa đọc được tên hoặc yêu thích. Bạn vẫn có thể vào chơi hoặc xuất JSON.':'';
    s.status.textContent=[s.message,warning].filter(Boolean).join(' ');
    const error=['error','unconfirmed','conflict'].includes(s.messageKind)||!!bad;
    s.status.dataset.state=s.messageKind;
    s.status.setAttribute('role',error?'alert':'status');
    s.status.setAttribute('aria-live',error?'assertive':'polite');
  }
  function displayTitle(entry){
    const title=entry.meta?.title||read(entry.id,'title');
    return editable(title)&&title.value?title.value:entry.seed;
  }
  function prepare(entries){
    if(!state)return entries;
    const s=state;
    if(!s.editor&&!isBusy())s.pendingRefresh=false;
    s.rows=entries.map(entry=>({...entry,meta:{title:read(entry.id,'title'),favorite:read(entry.id,'favorite')}}));
    const words=fold(s.query).split(' ').filter(Boolean);
    const list=s.rows.filter(entry=>(!s.onlyFavorites||entry.meta.favorite.value===true)&&words.every(word=>fold([displayTitle(entry),entry.seed,entry.id].join(' ')).includes(word)));
    const recent=(a,b)=>(b.updated-a.updated)||a.id.localeCompare(b.id);
    list.sort((a,b)=>s.sort==='name'?(collator.compare(displayTitle(a),displayTitle(b))||recent(a,b)):s.sort==='favorites'?(Number(b.meta.favorite.value)-Number(a.meta.favorite.value)||recent(a,b)):recent(a,b));
    s.shownIds=list.map(entry=>entry.id);
    return list;
  }
  function captureFocus(){
    const el=document.activeElement;
    if(!el||!$('worldList')?.contains(el))return null;
    for(const attribute of ['data-favorite-world','data-rename-world','data-world-name','data-play-world','data-export-world','data-upgrade-world']){
      if(el.hasAttribute(attribute))return{attribute,id:el.getAttribute(attribute)};
    }
    return null;
  }
  function focusControl(attribute,id){
    let target=id&&validId(id)?$('worldList').querySelector('['+attribute+'="'+id+'"]'):null;
    if(!target||target.disabled)target=state.editor?$('worldList').querySelector('[data-world-name]'):$('worldSearch');
    if(!target||target.disabled)target=$('savedWorldsTitle');
    target?.focus();
  }
  function rerender(focus=null){
    state.renderWorlds();
    if(focus)focusControl(focus.attribute,focus.id);
  }
  function slotReadable(id){
    try{V.saveCodec.readRaw(id);return true;}
    catch{notice('Không đọc được ô lưu này. Hãy kiểm tra lại danh sách; bản nháp tên vẫn được giữ.','error');return false;}
  }
  function failureMessage(status){
    return status==='conflict'?'Tên hoặc yêu thích vừa thay đổi ở thẻ khác. Hủy bản nháp để đọc lại, rồi thử lưu tên của bạn.':
      status==='unconfirmed'?'Chưa xác nhận được thay đổi trong bộ nhớ trình duyệt. Bản nháp vẫn được giữ; hãy Hủy để đọc lại trước khi thử tiếp.':
      status==='rejected'?'Trình duyệt chưa ghi được thay đổi. Bản nháp vẫn được giữ để bạn thử lại.':
      'Chưa đọc được thông tin tên hoặc yêu thích. Dữ liệu hiện có được giữ nguyên; hãy thử mở lại danh sách.';
  }
  function paintEditorError(message,kind='error'){
    const s=state,e=s.editor;if(!e)return;
    e.error=message;
    const error=$('world-name-error-'+e.id),input=$('world-name-'+e.id);
    if(error)error.textContent=message;
    if(input)input.setAttribute('aria-invalid','true');
    notice(message,kind);
  }
  function startRename(entry){
    if(!allowed()||state.editor||!slotReadable(entry.id))return;
    const current=read(entry.id,'title');
    if(!editable(current)){notice(failureMessage(current.status),'error');rerender();return;}
    state.editor={id:entry.id,entry:{id:entry.id,seed:entry.seed},raw:current.raw,draft:current.value,error:'',composing:false};
    notice('Nhập tên riêng rồi Lưu tên; để trống để dùng lại hạt giống. Trong lúc sửa, bộ lọc được giữ nguyên.');
    rerender({attribute:'data-world-name',id:entry.id});
    $('world-name-'+entry.id)?.select();
  }
  function cancelRename(){
    if(!state.editor||!allowed())return;
    const id=state.editor.id;state.editor=null;state.pendingRefresh=false;
    notice('Đã hủy đổi tên. Danh sách đã đọc lại thông tin hiện có.');
    rerender({attribute:'data-rename-world',id});
    state.refreshContinue();
  }
  function saveRename(){
    const s=state,e=s?.editor;
    if(!e||e.composing||!allowed())return;
    const input=$('world-name-'+e.id);
    if(input)e.draft=input.value;
    if(!slotReadable(e.id)){paintEditorError('Không đọc được ô lưu này. Bản nháp chưa được ghi và vẫn ở đây.');return;}
    let value,result;
    try{value=normalizeTitle(e.draft);result=write(e.id,'title',value,e.raw);}
    catch(error){paintEditorError(String(error.message||error));input?.focus();return;}
    if(result.status!=='saved'){paintEditorError(failureMessage(result.status),result.status==='unconfirmed'?'unconfirmed':result.status==='conflict'?'conflict':'error');return;}
    const id=e.id;s.editor=null;s.pendingRefresh=false;
    notice(value?'Đã lưu tên riêng. Tên này chỉ thuộc ô lưu trong trình duyệt hiện tại.':'Đã bỏ tên riêng; hàng này dùng lại hạt giống.','saved');
    s.app.api?.record('saved-world-title','Saved browser-local title metadata without changing the world envelope.',{id,codePoints:Array.from(value).length});
    s.refreshContinue();rerender({attribute:'data-rename-world',id});
  }
  function toggleFavorite(entry){
    if(!allowed()||state.editor||!slotReadable(entry.id))return;
    const current=entry.meta.favorite;
    if(!editable(current)){notice(failureMessage(current.status),'error');return;}
    const result=write(entry.id,'favorite',!current.value,current.raw);
    if(result.status==='saved'){
      notice(result.value?'Đã thêm vào yêu thích.':'Đã bỏ khỏi yêu thích.','saved');
      state.app.api?.record('saved-world-favorite','Saved browser-local favorite metadata without changing the world envelope.',{id:entry.id,favorite:result.value});
    }else{
      const message=result.status==='conflict'?'Yêu thích vừa thay đổi ở thẻ khác. Danh sách đã đọc lại; hãy chọn lại nếu cần.':
        result.status==='unconfirmed'?'Chưa xác nhận được yêu thích trong bộ nhớ trình duyệt. Danh sách đang hiển thị thông tin đọc lại được.':
        'Trình duyệt chưa lưu được yêu thích. Danh sách đang hiển thị thông tin đọc lại được.';
      notice(message,result.status==='unconfirmed'?'unconfirmed':result.status==='conflict'?'conflict':'error');
    }
    rerender({attribute:'data-favorite-world',id:entry.id});
  }
  function createEditor(){
    const e=state.editor;
    const editor=node('div','world-name-editor');editor.dataset.editorWorld=e.id;
    editor.setAttribute('role','group');editor.setAttribute('aria-labelledby','world-name-label-'+e.id);
    const label=node('label','', 'Tên riêng');label.id='world-name-label-'+e.id;label.htmlFor='world-name-'+e.id;
    const input=node('input');input.id='world-name-'+e.id;input.type='text';input.dataset.worldName=e.id;input.value=e.draft;
    input.autocomplete='off';input.spellcheck=false;input.placeholder=e.entry.seed;
    input.setAttribute('aria-describedby','world-name-hint-'+e.id+' world-name-error-'+e.id);
    input.setAttribute('aria-invalid',String(!!e.error));
    const hint=node('p','world-name-hint','Tối đa 60 ký tự. Để trống để dùng hạt giống. Enter lưu, Esc hủy.');hint.id='world-name-hint-'+e.id;
    const error=node('p','world-name-error',e.error);error.id='world-name-error-'+e.id;
    const buttons=node('div','world-name-actions'),save=node('button','pixel-button primary','Lưu tên'),cancel=node('button','pixel-button','Hủy');
    save.type=cancel.type='button';save.dataset.saveWorldName=e.id;cancel.dataset.cancelWorldName=e.id;
    save.addEventListener('click',saveRename);cancel.addEventListener('click',cancelRename);
    input.addEventListener('input',()=>{e.draft=input.value;e.error='';error.textContent='';input.setAttribute('aria-invalid','false');});
    input.addEventListener('compositionstart',()=>{e.composing=true;});
    input.addEventListener('compositionend',()=>{e.composing=false;e.draft=input.value;});
    input.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!=='Escape')return;
      event.stopPropagation();
      if(event.isComposing||e.composing)return;
      event.preventDefault();
      if(event.key==='Enter')saveRename();else cancelRename();
    });
    buttons.append(save,cancel);editor.append(label,input,hint,error,buttons);return editor;
  }
  function decorate(entry,row,text,actions){
    if(!state)return;
    const title=text.querySelector('strong');title.classList.add('world-title');title.id='world-title-'+entry.id;
    text.append(node('small','world-seed','Hạt giống: '+entry.seed),node('small','world-slot','Ô lưu: '+entry.id));
    const bad=[];
    if(!editable(entry.meta.title))bad.push('Tên riêng chưa đọc được');
    if(!editable(entry.meta.favorite))bad.push('Yêu thích chưa đọc được');
    if(bad.length)text.append(node('small','world-meta-warning',bad.join(' · ')+'. Dữ liệu này chưa bị ghi đè.'));
    const favorite=node('button','pixel-button world-favorite');
    favorite.type='button';favorite.dataset.favoriteWorld=entry.id;
    const star=node('span','world-favorite-star',entry.meta.favorite.value?'★':'☆');star.setAttribute('aria-hidden','true');
    const favoriteLabel=node('span','','Yêu thích');favoriteLabel.id='world-favorite-label-'+entry.id;
    favorite.append(star,favoriteLabel);favorite.setAttribute('aria-pressed',String(entry.meta.favorite.value===true));
    favorite.setAttribute('aria-labelledby',favoriteLabel.id+' '+title.id);
    favorite.disabled=!!state.editor||isBusy()||!editable(entry.meta.favorite);
    favorite.addEventListener('click',()=>toggleFavorite(entry));
    const rename=node('button','pixel-button world-rename','Đổi tên');rename.type='button';rename.dataset.renameWorld=entry.id;
    rename.setAttribute('aria-label','Đổi tên: '+displayTitle(entry));
    rename.disabled=!!state.editor||isBusy()||!editable(entry.meta.title);rename.addEventListener('click',()=>startRename(entry));
    actions.append(favorite,rename);
    if(state.editor?.id===entry.id)row.append(createEditor());
  }
  function finish(all,list){
    const s=state;if(!s)return;
    const editing=!!s.editor,busy=isBusy();
    s.search.disabled=s.only.disabled=s.sortControl.disabled=editing||busy;
    s.clear.disabled=editing||busy||!s.query;
    s.count.textContent=list.length+' / '+all.length+' thế giới'+(s.onlyFavorites?' · Chỉ yêu thích':'');
    if(s.editor&&!list.some(entry=>entry.id===s.editor.id)){
      const orphan=node('section','world-orphan-editor');
      orphan.append(node('p','','Ô lưu đang đổi tên không có trong danh sách đọc được. Bản nháp chưa được ghi; bạn có thể sao chép hoặc Hủy.'),createEditor());
      $('worldList').append(orphan);
    }
    paintStatus();
  }
  function failedRead(){
    if(!state)return;
    state.rows=[];state.shownIds=[];
    notice('Chưa đọc được danh sách thế giới. Tên và yêu thích không được ghi thay.','error');finish([],[]);
  }
  function afterSceneUnlock(app){
    if(!state||state.app!==app||app.panel!=='worlds'||isBusy())return false;
    const focus=captureFocus();rerender(focus);return true;
  }
  function install(app,{renderWorlds,refreshContinue}){
    if(state)return;
    const search=$('worldSearch'),clear=$('worldSearchClear'),only=$('worldFavoritesOnly'),sortControl=$('worldSort'),count=$('worldListStatus'),status=$('worldMetaStatus');
    if(!search||!clear||!only||!sortControl||!count||!status)throw Error('Saved-world organizer interface is missing.');
    state={app,renderWorlds,refreshContinue,search,clear,only,sortControl,count,status,query:'',onlyFavorites:false,sort:'recent',editor:null,pendingRefresh:false,rows:[],shownIds:[],message:'',messageKind:'ready'};
    search.addEventListener('input',()=>{if(!allowed()||state.editor)return;state.query=search.value;renderWorlds();});
    clear.addEventListener('click',()=>{if(!allowed()||state.editor)return;state.query='';search.value='';renderWorlds();search.focus();});
    only.addEventListener('change',()=>{if(!allowed()||state.editor)return;state.onlyFavorites=only.checked;renderWorlds();});
    sortControl.addEventListener('change',()=>{if(!allowed()||state.editor)return;state.sort=['recent','favorites','name'].includes(sortControl.value)?sortControl.value:'recent';renderWorlds();});
    window.addEventListener('storage',event=>{
      if(event.key!==null&&!String(event.key).startsWith(PREFIX))return;
      if(state.editor||isBusy()){
        state.pendingRefresh=true;notice('Tên hoặc yêu thích đã thay đổi ở thẻ khác. Bản nháp vẫn được giữ; Lưu sẽ kiểm tra lại tên trước khi ghi.','ready');return;
      }
      if(app.panel!=='worlds'){state.pendingRefresh=true;refreshContinue();return;}
      const focus=captureFocus();state.pendingRefresh=false;
      notice('Đã đọc lại tên và yêu thích từ thẻ khác.');
      refreshContinue();rerender(focus);
    });
  }
  V.savedWorlds=Object.freeze({
    install,prepare,displayTitle,decorate,finish,failedRead,afterSceneUnlock,
    inspect(){
      if(!state)return{installed:false};
      return{installed:true,query:state.query,favoritesOnly:state.onlyFavorites,sort:state.sort,pendingRefresh:state.pendingRefresh,
        editor:state.editor?{id:state.editor.id,draft:state.editor.draft,error:state.editor.error,composing:state.editor.composing}:null,
        shownIds:[...state.shownIds],rows:state.rows.map(row=>({id:row.id,title:displayTitle(row),favorite:row.meta.favorite.value===true,titleStatus:row.meta.title.status,favoriteStatus:row.meta.favorite.status})),
        message:state.message,messageKind:state.messageKind,prefix:PREFIX};
    }
  });
})();
