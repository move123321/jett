const fs=require('fs'),path=require('path');
const p='outputs/Jett_SD_v1';
let html=fs.readFileSync(p+'/index.html','utf8').replace("'マイク'.replace('マイク','마이크')+' 켜기'","'마이크 켜기'");fs.writeFileSync(p+'/index.html',html);
const m={width:1147,height:1372,psd:'Jett_SD_expressions.psd',preview:'expressions_preview.png',cubismCompatible:true,layers:['SD_master','blink','talk','blink_talk'].map((name,i)=>({name,file:name+'.png',hidden:i!==0}))};fs.writeFileSync(p+'/layers.json',JSON.stringify(m,null,2));
fs.mkdirSync('docs/sd',{recursive:true});for(const f of ['index.html','SD_master.png','blink.png','talk.png','blink_talk.png'])fs.copyFileSync(p+'/'+f,'docs/sd/'+f);
