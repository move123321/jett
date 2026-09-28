/* Offline 2D cutout motion proof. This is not a Cubism runtime or moc3 loader. */
const $=id=>document.getElementById(id);
const W=ASSET_DATA.width,H=ASSET_DATA.height;
const canvas=$('portrait'),ctx=canvas.getContext('2d',{willReadFrequently:true});
canvas.width=W;canvas.height=H;
const images={},p={ParamEyeLOpen:1,ParamEyeROpen:1,ParamEyeBallX:0,ParamEyeBallY:0,ParamMouthOpenY:0,ParamMouthForm:0,ParamBrowLY:0,ParamBrowRY:0,ParamAngleX:0,ParamAngleY:0,ParamAngleZ:0,ParamBodyAngleZ:0};
const controls=[['ParamEyeLOpen','왼눈 열림',0,1],['ParamEyeROpen','오른눈 열림',0,1],['ParamEyeBallX','시선 좌우',-1,1],['ParamEyeBallY','시선 상하',-1,1],['ParamMouthOpenY','입 열림',0,1],['ParamMouthForm','입 모양',-1,1],['ParamBrowLY','왼눈썹',-1,1],['ParamBrowRY','오른눈썹',-1,1],['ParamAngleX','고개 좌우',-30,30],['ParamAngleY','고개 상하',-30,30],['ParamAngleZ','고개 기울기',-30,30],['ParamBodyAngleZ','몸통 기울기',-10,10]];
for(const [id,label,min,max] of controls){const row=document.createElement('label');row.innerHTML=`<span>${label}<output id="val_${id}">${p[id]}</output></span><input id="${id}" type="range" min="${min}" max="${max}" step="${max>1?1:.01}" value="${p[id]}">`;$('controls').append(row);$(id).oninput=()=>{p[id]=Number($(id).value);$('val_'+id).textContent=p[id]};}
const load=(name,url)=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[name]=im;resolve()};im.onerror=reject;im.src=url});
const entries=ASSET_DATA.layers;
let ready=false,compare=false,autoStart=0,mouthAudio=0,analyser=null,audioContext=null,micStream=null,follow=false,currentSource=null;
let velocity=0,spring=0,lastDrive=0,lastT=0;
const bodyNames=entries.filter(l=>/^(Hood_|Outfit_|Body_)/.test(l.name)).map(l=>l.name);
const hairNames=entries.filter(l=>/^Hair_/.test(l.name)).map(l=>l.name);
const faceNames=['Head_EdgeResidual','Neck_Base','Face_Base','Ear_R','Ear_L','Nose_Shading'];
function draw(name,c=ctx){if(images[name])c.drawImage(images[name],0,0,W,H)}
function around(c,x,y,rotate=0,sx=1,sy=1,dx=0,dy=0){c.translate(x+dx,y+dy);c.rotate(rotate);c.scale(sx,sy);c.translate(-x,-y)}
function offscreen(){const c=document.createElement('canvas');c.width=W;c.height=H;return c;}
const eyeBuffers={L:offscreen(),R:offscreen()};
function eye(side,opening){
 const ec=eyeBuffers[side].getContext('2d');ec.clearRect(0,0,W,H);
 draw('Restore_EyeWhite_'+side,ec);draw('Eye_'+side+'_White',ec);
 ec.save();ec.translate(p.ParamEyeBallX*2.2,-p.ParamEyeBallY*1.4);
 for(const suffix of ['Iris','Pupil','Highlight'])draw('Eye_'+side+'_'+suffix,ec);
 ec.restore();ec.globalCompositeOperation='destination-in';draw('EyeMask_'+side,ec);ec.globalCompositeOperation='source-over';
 const cy=side==='R'?225:238,cx=side==='R'?145:236;
 ctx.save();ctx.globalAlpha=opening*opening;around(ctx,cx,cy,0,1,.45+.55*opening);draw('Eye_'+side+'_Context');ctx.restore();
 ctx.save();around(ctx,cx,cy,0,1,Math.max(.015,opening));
 ctx.globalAlpha=opening<.03?0:1;ctx.drawImage(eyeBuffers[side],0,0);ctx.restore();
 ctx.save();around(ctx,cx,cy,0,1,.45+.55*opening);draw('Eye_'+side+'_LashUpper');ctx.restore();
 ctx.save();ctx.globalAlpha=opening;around(ctx,cx,cy,0,1,Math.max(.015,opening));draw('Eye_'+side+'_LashLower');ctx.restore();
}
function mouth(open){
 const width=1+p.ParamMouthForm*.12;
 ctx.save();ctx.globalAlpha=1-open;draw('Mouth_Context');ctx.restore();
 if(open>.005){ctx.save();around(ctx,179,299,0,width,open);draw('Restore_MouthInside');draw('Restore_TeethUpper');draw('Restore_Tongue');ctx.restore();}
 ctx.save();around(ctx,179,297,0,width,1,0,-open*1.3);draw('Mouth_LipUpper');ctx.restore();
 ctx.save();around(ctx,179,300,0,width,1,0,open*7);draw('Mouth_LipLower');ctx.restore();
 ctx.save();ctx.globalAlpha=1-open;draw('Mouth_Line');ctx.restore();
}
function render(t=0,dt=.016){
 if(!ready)return;
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
 if(compare){draw('Original');return;}
 ctx.fillStyle='#262c38';ctx.fillRect(0,0,W,H);draw('Background_Unassigned_Original');
 const automatic=$('auto').checked,phys=$('physics').checked;
 let blink=1;
 if(automatic){const phase=((t-autoStart)%4.2+4.2)%4.2;if(phase>3.65&&phase<3.87)blink=Math.abs((phase-3.76)/.11);}
 const demo=$('speech').checked?Math.max(0,Math.sin(t*8)*.45+Math.sin(t*13)*.2+.25):0;
 const opening=Math.min(1,Math.max(p.ParamMouthOpenY,demo,mouthAudio));
 const drive=p.ParamAngleZ/30+p.ParamAngleX/30*.4;
 if(phys){const safe=Math.min(dt,.04);velocity+=(drive-lastDrive)*3;velocity+=(-spring*32-velocity*8)*safe;spring+=velocity*safe;lastDrive=drive;}else{spring=velocity=0;lastDrive=drive;}
 const breath=automatic?Math.sin(t*1.8)*.08:0;
 ctx.save();around(ctx,170,360,p.ParamBodyAngleZ*.003,1,1,0,breath);
 for(const n of bodyNames){ctx.save();if(phys&&n.startsWith('Hood_Front'))around(ctx,175,315,spring*.003);draw(n);ctx.restore();}
 ctx.save();around(ctx,175,331,p.ParamAngleZ*.0035,1-p.ParamAngleX*p.ParamAngleX*.000006,1,p.ParamAngleX*.065,-p.ParamAngleY*.045);
 draw('Restore_Skin');draw('Restore_HairOverlap');
 for(const n of faceNames)draw(n);
 eye('L',p.ParamEyeLOpen*blink);eye('R',p.ParamEyeROpen*blink);
 for(const side of ['L','R']){ctx.save();ctx.translate(0,-p['ParamBrow'+side+'Y']*3);draw('Brow_'+side);ctx.restore();}
 mouth(opening);
 for(const n of hairNames){ctx.save();if(phys){const side=n.includes('_R')?-1:1;const strength=n.includes('Side')?.008:n.includes('Bun')?.001:.002;around(ctx,n.includes('_R')?106:255,n.includes('Side')?190:95,spring*strength*side);}draw(n);ctx.restore();}
 ctx.restore();ctx.restore();
 $('state').textContent=opening>.03?'입 움직임 확인 중':blink<.95?'눈 깜빡임 확인 중':'원본 레이어로 동작 확인';
}
function reset(){for(const [id]of controls){p[id]=id.endsWith('Open')?1:0;$(id).value=p[id];$('val_'+id).textContent=p[id];}$('auto').checked=false;$('speech').checked=false;$('physics').checked=false;$('follow').checked=false;follow=false;$('audio').pause();if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null;$('mic').textContent='마이크 립싱크';}if(currentSource){currentSource.disconnect();currentSource=null;}if(analyser){analyser.disconnect();analyser=null;}spring=velocity=lastDrive=mouthAudio=0;compare=false;render(0);}
$('reset').onclick=reset;
$('compare').onpointerdown=e=>{compare=true;e.target.setPointerCapture(e.pointerId)};
$('compare').onpointerup=$('compare').onpointercancel=()=>compare=false;
$('auto').onchange=()=>autoStart=performance.now()/1000;
$('follow').onchange=()=>follow=$('follow').checked;
canvas.onpointermove=e=>{if(!follow)return;const r=canvas.getBoundingClientRect();p.ParamEyeBallX=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));p.ParamEyeBallY=Math.max(-1,Math.min(1,1-(e.clientY-r.top)/r.height*2));};
function connectAudio(source){if(currentSource)currentSource.disconnect();if(analyser)analyser.disconnect();currentSource=source;analyser=audioContext.createAnalyser();analyser.fftSize=512;source.connect(analyser);}
let fileSource=null;
$('audioFile').onchange=async()=>{const f=$('audioFile').files[0];if(!f)return;try{audioContext=audioContext||new AudioContext();await audioContext.resume();const audio=$('audio');audio.src=URL.createObjectURL(f);fileSource=fileSource||audioContext.createMediaElementSource(audio);connectAudio(fileSource);analyser.connect(audioContext.destination);await audio.play();$('audioStatus').textContent='선택한 파일의 음량으로 입을 움직입니다.';}catch(e){$('audioStatus').textContent='오디오를 재생할 수 없습니다: '+e.message;}};
$('mic').onclick=async()=>{if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null;analyser=null;mouthAudio=0;$('mic').textContent='마이크 립싱크';return;}try{micStream=await navigator.mediaDevices.getUserMedia({audio:true});audioContext=audioContext||new AudioContext();await audioContext.resume();connectAudio(audioContext.createMediaStreamSource(micStream));$('mic').textContent='마이크 끄기';$('audioStatus').textContent='마이크 음량을 이 브라우저 안에서만 분석합니다.';}catch(e){$('audioStatus').textContent='마이크 사용 불가. 아래에서 오디오 파일을 선택할 수 있습니다.';}};
$('export').onclick=()=>{const obj={format:'cutout-preview-parameters-v1',notCubismRuntime:true,parameters:p};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));a.download='motion_settings.json';a.click();URL.revokeObjectURL(a.href);};
Promise.all(Object.entries(ASSET_DATA.images).map(([n,url])=>load(n,url))).then(()=>{ready=true;window.rig={parameters:p,render,reset,canvas,ready:true};$('state').textContent='준비 완료';requestAnimationFrame(loop)}).catch(e=>{$('state').textContent='이미지를 불러오지 못했습니다';console.error(e)});
function loop(ms){const t=ms/1000,dt=lastT?t-lastT:.016;lastT=t;if(analyser){const b=new Uint8Array(analyser.fftSize);analyser.getByteTimeDomainData(b);const rms=Math.sqrt(b.reduce((a,v)=>a+((v-128)/128)**2,0)/b.length);mouthAudio=mouthAudio*.65+Math.min(1,Math.max(0,(rms-.015)*9))*.35;}render(t,dt);requestAnimationFrame(loop);}
