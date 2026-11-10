(() => {
  const store=()=>window.VoyaraStore||localStorage;
  const read=(key,fallback)=>{try{const value=JSON.parse(store().getItem(key)||'null');return value&&typeof value==='object'&&Array.isArray(value)===Array.isArray(fallback)?value:fallback;}catch{return fallback;}};
  const posts=[...document.querySelectorAll('[data-social-post]')];
  const identity=()=>window.VoyaraAuth?.getUser()?.user_metadata?.display_name||'Voyager';
  const notice=message=>{window.notify?.(message);};
  const model=window.VoyaraSocialModel.create({getItem:key=>store().getItem(key),setItem:(key,value)=>store().setItem(key,value)});
  const postModel=window.VoyaraSocialModel.createPosts({getItem:key=>store().getItem(key),setItem:(key,value)=>store().setItem(key,value)});
  const signedIn=()=>{if(window.VoyaraAuth?.isAuthenticated()||window.VoyaraDemo?.getUser())return true;window.VoyaraAuth?.open();return false;};
  const commit=action=>{if(!signedIn())return false;try{action();render();return true;}catch(error){notice(error.message?.startsWith('Write')||error.message?.startsWith('Keep')||error.message?.includes('must contain')?error.message:'Could not save this change. Please try again; your draft is still here.');return false;}};
  const actionButton=(label,action)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',action);return button;};
  const sampleComments=new WeakMap();
  function renderComments(post,item){
    const comments=post.querySelector('.post-comments');if(!comments)return;
    if(!sampleComments.has(post))sampleComments.set(post,[...comments.querySelectorAll(':scope > p')].map((node,index)=>({node,id:'sample-'+index,author:node.querySelector('b')?.textContent||'Voyager'})));
    const samples=sampleComments.get(post),signature=JSON.stringify(item.comments);
    const reset=()=>{comments.dataset.signature='';render();post.querySelector('.social-comment-form input')?.focus();};
    const editor=(row,comment,reply=false)=>{
      if(!signedIn())return;
      row.querySelector('.comment-editor')?.remove();
      const form=document.createElement('form'),input=document.createElement('textarea');form.className='comment-editor';input.value=reply?'':comment.text;input.maxLength=1000;input.required=true;input.setAttribute('aria-label',reply?'Reply to '+comment.author:'Edit your comment');
      const label=document.createElement('label');label.textContent=reply?'Replying to '+comment.author:'Edit your comment';label.append(input);
      const save=actionButton(reply?'Post reply':'Save changes',()=>{});save.type='submit';
      form.append(label,save,actionButton('Cancel',reset));
      form.addEventListener('submit',event=>{event.preventDefault();if(commit(()=>reply?model.add(post.dataset.postId,input.value,identity(),comment.parentId||comment.id):model.edit(post.dataset.postId,comment.id,input.value)))reset();});row.append(form);input.focus();
    };
    if(comments.dataset.signature!==signature){
      comments.dataset.signature=signature;comments.replaceChildren();
      const rows=new Map();
      samples.forEach(sample=>{const row=document.createElement('div');row.className='voyager-comment';row.dataset.sampleComment=sample.id;row.append(sample.node,actionButton('Reply',()=>editor(row,sample,true)));comments.append(row);rows.set(sample.id,row);});
      const makeRow=comment=>{
        const row=document.createElement('div');row.dataset.localComment=comment.id;row.className='voyager-comment';
        if(comment.removed){row.append('Comment removed. ',actionButton('Undo',()=>commit(()=>model.remove(post.dataset.postId,comment.id,false))));return row;}
        const p=document.createElement('p'),author=document.createElement('b'),copy=document.createElement('span');author.textContent=comment.author;copy.textContent=' '+comment.text+(comment.edited?' (edited)':'');p.append(author,copy);row.append(p);
        const actions=document.createElement('div');actions.className='voyager-comment-actions';actions.append(actionButton('Reply',()=>editor(row,comment,true)),actionButton('Edit',()=>editor(row,comment)),actionButton('Remove',()=>{if(commit(()=>model.remove(post.dataset.postId,comment.id)))comments.querySelector(`[data-local-comment="${comment.id}"] button`)?.focus();}));row.append(actions);return row;
      };
      item.comments.filter(c=>!c.parentId).forEach(comment=>{const row=makeRow(comment);rows.set(comment.id,row);comments.append(row);});
      item.comments.filter(c=>c.parentId).forEach(comment=>{const parent=rows.get(comment.parentId);const row=makeRow(comment);row.classList.add('voyager-reply');(parent||comments).append(row);});
    }
    const toggle=post.querySelector('[data-comments-toggle]');
    if(toggle){const n=samples.length+item.comments.filter(c=>!c.removed).length;toggle.setAttribute('aria-expanded',comments.classList.contains('open'));toggle.textContent=comments.classList.contains('open')?'Hide comments':n?`Show ${n} ${n===1?'comment':'comments'}`:'Be the first to comment';}
  }
  posts.forEach((post,index)=>{
    const id=post.dataset.postId||post.querySelector('.social-save')?.dataset.save||'sample-'+index;
    post.dataset.postId=id;if(!post.id)post.id='voyage-'+id.replace(/[^a-z0-9-]/gi,'-');
    const button=post.querySelector('.social-like'),form=post.querySelector('.social-comment-form'),comments=post.querySelector('.post-comments');
    button?.addEventListener('click',event=>{event.stopImmediatePropagation();commit(()=>model.toggleLike(id));},true);
    if(!post.querySelector('[data-comments-toggle]')&&comments){const toggle=actionButton('Be the first to comment',()=>{});toggle.dataset.commentsToggle='';toggle.className='view-comments';comments.before(toggle);}
    post.querySelector('[data-comments-toggle]')?.addEventListener('click',event=>{event.stopImmediatePropagation();comments.classList.toggle('open');render();},true);
    post.querySelector('.social-comment')?.addEventListener('click',()=>{comments.classList.add('open');render();});
    form?.addEventListener('submit',event=>{
      event.preventDefault();event.stopImmediatePropagation();const input=form.querySelector('input');
      if(commit(()=>model.add(id,input.value,identity()))){input.value='';form.querySelector('button').disabled=true;comments.classList.add('open');render();input.focus();}
    },true);
    const input=form?.querySelector('input');if(input){input.maxLength=1000;input.required=true;const submit=form.querySelector('button');submit.disabled=!input.value.trim();input.addEventListener('input',()=>{submit.disabled=!input.value.trim();});}
    post.querySelector('.social-share-actions')?.remove();
    const shareTrigger=post.querySelector('.voyage-share-trigger');shareTrigger?.setAttribute('aria-haspopup','dialog');shareTrigger?.removeAttribute('aria-expanded');
    const creatorMap={'voyager-post-rose':'travelpete','voyager-post-conch':'bahamaseats','voyager-post-sunset':'islandgirl'};
    const name=post.querySelector('.social-post-head strong');if(name){const link=document.createElement('a');link.href=post.classList.contains('user-created-voyage')?'voyager-profile.html':'creator-profile.html?creator='+creatorMap[id];link.className='voyager-author-link';link.append(...name.childNodes);name.append(link);}
    const options=post.querySelector('.social-post-head > button');if(options){options.setAttribute('aria-label','Post options');options.setAttribute('aria-haspopup','dialog');options.addEventListener('click',event=>{event.stopImmediatePropagation();openOptions(post);},true);}
    post.querySelector('.voyage-share-trigger')?.addEventListener('click',event=>{event.stopImmediatePropagation();openShare(post);},true);
  });
  const shareDialog=document.createElement('dialog');shareDialog.className='voyager-share-dialog';shareDialog.setAttribute('aria-labelledby','voyager-share-title');
  shareDialog.innerHTML='<button type="button" data-close-share aria-label="Close share dialog">×</button><h2 id="voyager-share-title">Share this voyage</h2><p data-share-caption></p><label>Post link<input readonly aria-label="Post link"></label><p data-share-context></p><div data-share-actions></div><p role="status" data-share-status></p>';
  document.body.append(shareDialog);shareDialog.querySelector('[data-close-share]').addEventListener('click',()=>shareDialog.close());
  const optionsDialog=document.createElement('dialog');optionsDialog.className='voyager-share-dialog';optionsDialog.setAttribute('aria-label','Post options');document.body.append(optionsDialog);
  function openOptions(post){
    const heading=document.createElement('h2');heading.textContent='Post options';
    const saved=post.querySelector('.social-save')?.getAttribute('aria-pressed')==='true';
    optionsDialog.replaceChildren(heading,actionButton(saved?'Unsave post':'Save post',()=>{optionsDialog.close();post.querySelector('.social-save')?.click();}),actionButton('Share post',()=>{optionsDialog.close();openShare(post);}),actionButton('Close',()=>optionsDialog.close()));if(post.classList.contains('user-created-voyage')){optionsDialog.append(actionButton('Edit post',()=>{optionsDialog.close();editPost(post.dataset.postId);}),actionButton('Archive post',()=>archivePost(post.dataset.postId)));}optionsDialog.showModal();
  }
  const postEditor=document.createElement('dialog');postEditor.className='voyager-share-dialog';postEditor.setAttribute('aria-label','Edit post');document.body.append(postEditor);
  function editPost(id){
    if(!signedIn())return;const post=postModel.list().find(p=>p.id===id);if(!post)return;
    const heading=document.createElement('h2');heading.textContent='Edit your voyage';const form=document.createElement('form');
    ['caption','location'].forEach(field=>{const label=document.createElement('label');label.textContent=field==='caption'?'Caption':'Location';const input=document.createElement(field==='caption'?'textarea':'input');input.name=field;input.value=post[field]||'';input.required=true;input.maxLength=field==='caption'?2200:100;label.append(input);form.append(label);});
    const save=actionButton('Save post',()=>{});save.type='submit';const status=document.createElement('p');status.setAttribute('role','status');
    form.append(save,actionButton('Cancel',()=>postEditor.close()),status);form.addEventListener('submit',event=>{event.preventDefault();if(!signedIn())return;try{postModel.edit(id,form.elements.caption.value,form.elements.location.value);postEditor.close();render();notice('Post updated.');}catch(error){status.textContent=/must contain/.test(error.message)?error.message:'Could not save this edit. Your draft is still here.';}});postEditor.replaceChildren(heading,form);postEditor.showModal();
  }
  function archivePost(id){
    if(!signedIn())return;
    const heading=document.createElement('h2');heading.textContent='Archive this post?';const detail=document.createElement('p');detail.textContent='Hide it from your feed and profile. Your photo, comments and likes stay saved so you can restore it.';
    optionsDialog.replaceChildren(heading,detail,actionButton('Archive',()=>{if(commit(()=>postModel.archive(id))){heading.textContent='Post archived';detail.textContent='You can restore it now or from View archive on your profile.';const link=document.createElement('a');link.href='voyager-profile.html#archive';link.textContent='View archive';optionsDialog.replaceChildren(heading,detail,actionButton('Undo archive',()=>{if(commit(()=>postModel.archive(id,false)))optionsDialog.close();}),link,actionButton('Close',()=>optionsDialog.close()));}}),actionButton('Cancel',()=>optionsDialog.close()));
  }
  const archiveDialog=document.createElement('dialog');archiveDialog.className='voyager-share-dialog';archiveDialog.setAttribute('aria-label','Your archived voyages');document.body.append(archiveDialog);
  function openArchive(){
    if(!signedIn())return;const heading=document.createElement('h2');heading.textContent='Your archive';archiveDialog.replaceChildren(heading,actionButton('Close archive',()=>archiveDialog.close()));
    const archived=postModel.list().filter(p=>p.archived);if(!archived.length){const empty=document.createElement('p');empty.textContent='No archived voyages. Archive a post from its options menu to keep it here.';archiveDialog.append(empty);}
    archived.forEach(post=>{const card=document.createElement('article'),img=document.createElement('img'),text=document.createElement('p');card.className='archive-card';img.src=post.image;img.alt='';text.textContent=post.caption;card.append(img,text,actionButton('Restore post',()=>{if(commit(()=>postModel.archive(post.id,false)))location.href='voyagers.html#voyage-'+post.id.replace(/[^a-z0-9-]/gi,'-');}));archiveDialog.append(card);});if(!archiveDialog.open)archiveDialog.showModal();
  }
  document.querySelector('[data-view-archive]')?.addEventListener('click',event=>{event.stopImmediatePropagation();openArchive();},true);
  if(location.hash==='#archive'&&document.querySelector('[data-view-archive]'))requestAnimationFrame(openArchive);
  let shareOrigin;shareDialog.addEventListener('close',()=>shareOrigin?.focus());
  function openShare(post){
    shareOrigin=post.querySelector('.voyage-share-trigger');
    const url=new URL('voyagers.html',location.href);url.hash=post.id;
    const input=shareDialog.querySelector('input'),actions=shareDialog.querySelector('[data-share-actions]'),status=shareDialog.querySelector('[data-share-status]');input.value=url.href;status.textContent='';
    shareDialog.querySelector('[data-share-caption]').textContent=post.querySelector('.social-post-copy > p')?.textContent;
    const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
    shareDialog.querySelector('[data-share-context]').textContent=local?'This preview link works on this computer. Public sharing will be available when Voyara is published.':'';
    actions.replaceChildren(actionButton('Copy link',async()=>{try{await navigator.clipboard.writeText(url.href);status.textContent='Link copied.';}catch{input.focus();input.select();status.textContent='Select and copy the link above.';}}));
    if(!local&&navigator.share)actions.append(actionButton('Share…',async()=>{try{await navigator.share({title:'Voyara voyage',url:url.href});}catch(error){if(error.name!=='AbortError')status.textContent='Sharing unavailable. You can copy the link instead.';}}));
    shareDialog.showModal();
  }
  function revealLinkedPost(){
    if(!location.hash)return;let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    const post=posts.find(post=>post.id===id&&!post.hidden);if(post){document.querySelector('#reset-voyager-search')?.click();post.tabIndex=-1;post.scrollIntoView({block:'start'});post.focus({preventScroll:true});}else if(document.querySelector('.voyager-feed')){const archived=postModel.list().find(p=>'voyage-'+p.id.replace(/[^a-z0-9-]/gi,'-')===id&&p.archived);const message=document.createElement('p');message.className='voyager-link-recovery';message.textContent=archived?'This voyage is archived. ':'This voyage is not available in this browser. ';const link=document.createElement('a');link.href=archived?'voyager-profile.html#archive':'voyagers.html';link.textContent=archived?'View your archive':'Explore the feed';message.append(link);document.querySelector('.voyager-link-recovery')?.remove();document.querySelector('.voyager-feed').before(message);}
  }
  window.addEventListener('hashchange',revealLinkedPost);requestAnimationFrame(revealLinkedPost);
  function render(){
    const own=postModel.list();
    const followingCount=document.querySelector('.profile-stats button:nth-child(3) strong');if(followingCount)followingCount.textContent=String(read('voyara-creator-follows',[]).filter(id=>['travelpete','bahamaseats','islandgirl'].includes(id)).length);
    posts.filter(post=>post.classList.contains('user-created-voyage')).forEach(post=>{const saved=own.find(p=>p.id===post.dataset.postId);if(!saved)return;post.hidden=!!saved.archived;post.dataset.archived=String(!!saved.archived);const caption=post.querySelector('.social-post-copy > p'),author=caption.querySelector('b');caption.replaceChildren(author,' '+saved.caption);post.dataset.searchable=[saved.caption,saved.location,saved.type].join(' ');post.querySelector('.post-location').textContent=saved.location.toUpperCase();post.querySelector('.social-post-head span').textContent=saved.location+' · '+(typeof voyageAge==='function'?voyageAge(saved):'');});
    document.querySelectorAll('[data-profile-post][data-post-id]').forEach(button=>{const saved=own.find(p=>p.id===button.dataset.postId);if(saved){button.hidden=!!saved.archived;button.setAttribute('aria-label',saved.caption);}});
    const stat=document.querySelector('.profile-stats button:first-child strong');if(stat)stat.textContent=String(document.querySelectorAll('[data-profile-post]:not([hidden])').length);
    window.filterVoyagersDesign?.();
    if(window.VoyaraDemo?.getUser())document.querySelectorAll('.rail-avatar,.voyager-mobile-nav a[href="voyager-profile.html"] img,.user-created-voyage .social-post-head img').forEach(img=>{img.src='assets/demo-user-avatar.svg';img.alt='User Voyager profile';});
    const photo=document.querySelector('.profile-photo-wrap img');
    if(photo&&window.VoyaraDemo?.getUser()){photo.src='assets/demo-user-avatar.svg';photo.alt='User demo avatar';}
    posts.forEach(post=>{
      const item=model.get(post.dataset.postId),button=post.querySelector('.social-like'),count=post.querySelector('.like-count');
      button?.classList.toggle('liked',item.liked);button?.setAttribute('aria-pressed',String(item.liked));button?.setAttribute('aria-label',item.liked?'Unlike voyage':'Like voyage');if(button)button.textContent=item.liked?'♥':'♡';
      if(count){const n=Number(count.dataset.baseLikes||0)+(item.liked?1:0);count.textContent=`${n} ${n===1?'like':'likes'}`;}
      renderComments(post,item);
    });
    document.querySelectorAll('[data-profile-post][data-post-id]').forEach(button=>{const item=model.get(button.dataset.postId);const count=button.querySelector('span');if(count)count.textContent=`♥ ${item.liked?1:0}  ◯ ${item.comments.filter(c=>!c.removed).length}`;});
    const panel=document.querySelector('[data-profile-panel="saved"]');if(!panel)return;
    let items=(window.VoyaraResolveFavorites||((items)=>items))(read('voyara-favorites-v1',[])).filter(item=>item&&typeof item.link==='string'&&typeof item.title==='string');
    if(!items.length){panel.innerHTML='<div class="profile-empty"><h2>Your saved island inspiration</h2><p>Save a voyage, guide or experience to find it here.</p><a href="voyagers.html">Explore the community</a></div>';return;}
    panel.replaceChildren();const grid=document.createElement('div');grid.className='voyager-saved-grid';
    items.forEach(item=>{const card=document.createElement('article');const a=document.createElement('a'),img=document.createElement('img'),label=document.createElement('span');a.href=item.link;img.src=item.image;img.alt='';img.loading='lazy';label.textContent=item.title;a.append(img,label);card.append(a,actionButton('Remove from saved',()=>{if(commit(()=>store().setItem('voyara-favorites-v1',JSON.stringify(read('voyara-favorites-v1',[]).filter(saved=>saved.id!==item.id)))))document.querySelector('[data-profile-tab=\"saved\"]')?.focus();}));grid.append(card);});panel.append(grid);
  }
  const followingButton=document.querySelector('.profile-stats button:nth-child(3)');
  followingButton?.addEventListener('click',event=>{event.stopImmediatePropagation();if(!signedIn())return;const names={travelpete:'Travel Pete',bahamaseats:'Bahamas Eats',islandgirl:'Island Girl'};const dialog=document.createElement('dialog');dialog.className='voyager-share-dialog';dialog.setAttribute('aria-label','Creators you follow');const title=document.createElement('h2');title.textContent='Following';dialog.append(title,actionButton('Close',()=>dialog.close()));const ids=read('voyara-creator-follows',[]).filter(id=>names[id]);if(!ids.length){const empty=document.createElement('p');empty.textContent='You are not following any creators yet.';dialog.append(empty);}ids.forEach(id=>{const row=document.createElement('p'),link=document.createElement('a');link.href='creator-profile.html?creator='+id;link.textContent=names[id];row.append(link);dialog.append(row);});dialog.addEventListener('close',()=>{dialog.remove();followingButton.focus();});document.body.append(dialog);dialog.showModal();},true);
  const tabs=[...document.querySelectorAll('[data-profile-tab]')];
  const select=tab=>{tabs.forEach(button=>{const active=button===tab;button.classList.toggle('active',active);button.setAttribute('aria-selected',active);button.tabIndex=active?0:-1;});document.querySelectorAll('[data-profile-panel]').forEach(panel=>{const active=panel.dataset.profilePanel===tab.dataset.profileTab;panel.classList.toggle('active',active);panel.hidden=!active;});};
  tabs.forEach((tab,index)=>{tab.setAttribute('role','tab');tab.id='voyager-tab-'+tab.dataset.profileTab;tab.setAttribute('aria-controls','voyager-panel-'+tab.dataset.profileTab);const panel=document.querySelector(`[data-profile-panel="${tab.dataset.profileTab}"]`);panel.id='voyager-panel-'+tab.dataset.profileTab;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=tabs[event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];next.click();next.focus();});});if(tabs.length)select(tabs[0]);
  const preview=document.createElement('dialog');preview.className='voyager-photo-preview';preview.innerHTML='<button type="button" aria-label="Close photo preview">×</button><h2>Voyage photo</h2><img alt=""><p></p><a data-view-full-post hidden>Open post and comments</a>';document.body.append(preview);preview.querySelector('button').addEventListener('click',()=>preview.close());
  document.querySelectorAll('[data-profile-post]').forEach((button,index)=>{if(!button.getAttribute('aria-label'))button.setAttribute('aria-label','View voyage photo '+(index+1));button.addEventListener('click',event=>{event.stopImmediatePropagation();const match=button.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);if(!match)return;preview.querySelector('img').src=match[1];preview.querySelector('img').alt=button.getAttribute('aria-label');preview.querySelector('p').textContent=button.getAttribute('aria-label');const link=preview.querySelector('[data-view-full-post]');link.hidden=!button.dataset.postId;if(button.dataset.postId)link.href='voyagers.html#voyage-'+button.dataset.postId.replace(/[^a-z0-9-]/gi,'-');preview.showModal();},true);});
  let editorReturnFocus=null;
  const editors=[...document.querySelectorAll('#create-post-modal,#edit-profile-modal')];
  editors.forEach(editor=>{const card=editor.querySelector('.modal-card');if(card){card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label',editor.id==='create-post-modal'?'Create a voyage':'Edit Voyager profile');}});
  document.querySelectorAll('[data-create-post],[data-edit-profile]').forEach(button=>button.addEventListener('click',()=>{const editor=document.querySelector(button.hasAttribute('data-edit-profile')?'#edit-profile-modal':'#create-post-modal');if(editor?.classList.contains('open')){editorReturnFocus=button;editor.querySelector('input,textarea,button')?.focus();}}));
  document.querySelectorAll('[data-close-create],[data-close-profile]').forEach(button=>button.addEventListener('click',()=>editorReturnFocus?.focus()));
  document.addEventListener('keydown',event=>{
    const editor=editors.find(el=>el.classList.contains('open'));if(!editor)return;
    if(event.key==='Escape'){editor.classList.remove('open');editorReturnFocus?.focus();return;}
    if(event.key!=='Tab')return;
    const fields=[...editor.querySelectorAll('button,input,select,textarea,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
    const first=fields[0],last=fields[fields.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  },true);
  let owner=window.VoyaraDemo?.owner();window.addEventListener('voyara:auth-change',()=>{if(owner!==window.VoyaraDemo?.owner()){location.reload();return;}render();});
  window.addEventListener('voyara:collections-change',render);window.addEventListener('storage',render);render();
})();
