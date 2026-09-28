const fs=require('fs'),path=require('path');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/seogh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/seogh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu','--mute-audio']});
 const page=await browser.newPage({viewport:{width:1150,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('outputs/Live2D_motion_v2/동작_확인.html')).href);await page.waitForFunction(()=>window.rig?.ready);
 fs.mkdirSync('work/rig_checks',{recursive:true});
 const capture=async(name)=>{const png=await page.evaluate(()=>window.rig.canvas.toDataURL('image/png').split(',')[1]);const b=Buffer.from(png,'base64');fs.writeFileSync('work/rig_checks/'+name+'.png',b);return b;};
 await page.evaluate(()=>{rig.reset();rig.render(0)});const neutral=await capture('neutral');
 const a=await sharp(neutral).ensureAlpha().raw().toBuffer();const b=await sharp('outputs/Live2D_motion_v2/original.png').ensureAlpha().raw().toBuffer();
 const scenarios=[['blink',{ParamEyeLOpen:0,ParamEyeROpen:0}],['gaze',{ParamEyeBallX:1,ParamEyeBallY:1}],['mouth',{ParamMouthOpenY:1}],['combined',{ParamEyeLOpen:.5,ParamEyeROpen:.5,ParamEyeBallX:-1,ParamMouthOpenY:.7,ParamBrowLY:.5,ParamAngleZ:15,ParamAngleX:10,ParamBodyAngleZ:3}]];
 const changes={};for(const [name,state]of scenarios){await page.evaluate(s=>{rig.reset();Object.assign(rig.parameters,s);rig.render(0)},state);const png=await capture(name);const pixels=await sharp(png).ensureAlpha().raw().toBuffer();let changed=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]!==a[i]||pixels[i+1]!==a[i+1]||pixels[i+2]!==a[i+2])changed++;changes[name]=changed;}
 await page.evaluate(()=>{rig.reset();rig.render(0)});await page.screenshot({path:'work/rig_checks/interface.png',fullPage:true});
 const physics=await page.evaluate(()=>{rig.reset();document.getElementById('physics').checked=true;rig.parameters.ParamAngleZ=20;rig.render(0,.016);const initial=Math.abs(spring);for(let i=0;i<500;i++)rig.render(i*.016,.016);const settled=Math.abs(spring);rig.reset();return {initial,settled,stable:Number.isFinite(settled)&&settled<.001};});
 const wav=Buffer.alloc(44+16000*2*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);for(let i=0;i<32000;i++)wav.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*220/16000)*8000),44+i*2);fs.writeFileSync('work/rig_checks/test-tone.wav',wav);
 await page.locator('summary').click();await page.locator('#audioFile').setInputFiles('work/rig_checks/test-tone.wav');await page.waitForTimeout(650);
 const audio=await page.evaluate(()=>({mouthOpening:mouthAudio,context:audioContext?.state,paused:document.getElementById('audio').paused}));
 await page.evaluate(()=>rig.reset());
 const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
 const result={browser:'Chrome headless',neutralEqualsOriginalRGBA:a.equals(b),changedPixels:changes,physics,audioLipSync:audio,settingsExport:exported.format==='cutout-preview-parameters-v1',microphoneDeviceTested:false,javascriptErrors:errors};
 fs.writeFileSync('outputs/Live2D_motion_v2/browser_verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser.close();
 if(!result.neutralEqualsOriginalRGBA||errors.length||Object.values(changes).some(x=>x===0)||!physics.stable||audio.mouthOpening<.1||!result.settingsExport)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
