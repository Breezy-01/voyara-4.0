// Local social rules, shared by the UI and regression checks.
((root)=>{
  function create(storage){
    const key='voyara-social-interactions';
    const normalize=value=>({liked:value?.liked===true,comments:(Array.isArray(value?.comments)?value.comments:[]).filter(c=>c&&typeof c.text==='string').map((c,i)=>({id:typeof c.id==='string'?c.id:'legacy-'+i,author:typeof c.author==='string'?c.author:'Voyager',text:c.text.slice(0,1000),createdAt:Number(c.createdAt)||0,edited:!!c.edited,removed:!!c.removed,parentId:typeof c.parentId==='string'?c.parentId:null}))});
    const read=()=>{try{const value=JSON.parse(storage.getItem(key)||'{}');return value&&!Array.isArray(value)&&typeof value==='object'?value:{};}catch{return {};}};
    const get=id=>normalize(read()[id]);
    const change=(id,fn)=>{const state=read(),item=normalize(state[id]);fn(item);Object.defineProperty(state,id,{value:item,enumerable:true,configurable:true,writable:true});storage.setItem(key,JSON.stringify(state));return item;};
    const text=value=>{const result=String(value??'').trim();if(!result)throw Error('Write a comment first.');if(result.length>1000)throw Error('Keep your comment to 1,000 characters.');return result;};
    return {get,toggleLike:id=>change(id,item=>{item.liked=!item.liked;}),
      add:(id,value,author,parentId=null)=>change(id,item=>{if(parentId){const parent=item.comments.find(c=>c.id===parentId);if(!parent&&!/^sample-[0-9]+$/.test(parentId))throw Error('This comment is no longer available.');if(parent)parentId=parent.parentId||parent.id;}item.comments.push({id:'comment-'+Date.now()+'-'+Math.random().toString(36).slice(2),author:author||'Voyager',text:text(value),createdAt:Date.now(),edited:false,removed:false,parentId});}),
      edit:(id,commentID,value)=>change(id,item=>{const c=item.comments.find(c=>c.id===commentID&&!c.removed);if(!c)throw Error('This comment is no longer available.');c.text=text(value);c.edited=true;}),
      remove:(id,commentID,removed=true)=>change(id,item=>{const c=item.comments.find(c=>c.id===commentID);if(!c)throw Error('This comment is no longer available.');c.removed=removed;})};
  }
  function createPosts(storage){
    const key='voyara-community-posts';
    const list=()=>{try{const rows=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(rows)?rows.filter(p=>p&&typeof p.id==='string'):[];}catch{return [];}};
    const update=(id,change)=>{const rows=list(),post=rows.find(p=>p.id===id);if(!post)throw Error('This post is no longer available.');change(post);storage.setItem(key,JSON.stringify(rows));return post;};
    const clean=(value,max,label)=>{const text=String(value??'').trim();if(!text||text.length>max)throw Error(`${label} must contain 1–${max} characters.`);return text;};
    return {list,edit:(id,caption,location)=>{caption=clean(caption,2200,'Caption');location=clean(location,100,'Location');return update(id,p=>{p.caption=caption;p.location=location;p.editedAt=Date.now();});},archive:(id,archived=true)=>update(id,p=>{p.archived=archived;})};
  }
  root.VoyaraSocialModel={create,createPosts};
})(typeof window==='undefined'?globalThis:window);
