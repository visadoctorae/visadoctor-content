// Visa Doctor UAE — Story & Highlight-cover renderer (1080x1920)
// Usage: node story.mjs stories/<name>.json out_stories/<name>
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const FD = path.join(__dir, 'node_modules', '@fontsource');
const F = p => fs.readFileSync(p);
const fonts = [
  { name:'Inter', data:F(FD+'/inter/files/inter-latin-400-normal.woff'), weight:400, style:'normal' },
  { name:'Inter', data:F(FD+'/inter/files/inter-latin-600-normal.woff'), weight:600, style:'normal' },
  { name:'Inter', data:F(FD+'/inter/files/inter-latin-700-normal.woff'), weight:700, style:'normal' },
  { name:'Inter', data:F(FD+'/inter/files/inter-latin-800-normal.woff'), weight:800, style:'normal' },
  { name:'Playfair', data:F(FD+'/playfair-display/files/playfair-display-latin-400-italic.woff'), weight:400, style:'italic' },
  { name:'Playfair', data:F(FD+'/playfair-display/files/playfair-display-latin-500-italic.woff'), weight:500, style:'italic' },
];

const B = { navy:'#152541', cream:'#F7F2E7', gold:'#C9A24B', goldLt:'#E3CC93', bar:'#D8BE85',
            white:'#FFF', inkMuted:'rgba(21,37,65,.62)', subGold:'#8C6B22' };
const W = 1080, H = 1920;
const e = (t, p = {}, ...c) => ({ type:t, props:{ ...p, children:c.flat().filter(x => x!=null && x!==false) } });

const _c = new Map();
async function photo(url){
  if(_c.has(url)) return _c.get(url);
  const r = await fetch(url);
  if(!r.ok) throw new Error('photo ' + r.status + ' ' + url);
  const uri = 'data:image/jpeg;base64,' + Buffer.from(await r.arrayBuffer()).toString('base64');
  _c.set(url, uri); return uri;
}

const Mark = () => e('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%'}},
  e('div',{style:{display:'flex',fontSize:24,fontWeight:700,letterSpacing:7,color:B.white,fontFamily:'Inter'}},'VISA DOCTOR'),
  e('div',{style:{display:'flex',fontSize:20,letterSpacing:4,color:'rgba(255,255,255,.55)',fontFamily:'Inter'}},'DUBAI • UAE'));

const Foot = () => e('div',{style:{display:'flex',position:'absolute',left:0,right:0,bottom:0,height:150,
  backgroundColor:B.bar,alignItems:'center',justifyContent:'space-between',padding:'0 72px'}},
  e('div',{style:{display:'flex',flexDirection:'column'}},
    e('div',{style:{display:'flex',fontSize:30,fontWeight:700,color:B.navy,fontFamily:'Inter'}},'Message us — link in bio'),
    e('div',{style:{display:'flex',fontSize:21,color:'rgba(21,37,65,.65)',fontFamily:'Inter',marginTop:4}},'+971 58 517 0900 · Free consultation')),
  e('div',{style:{display:'flex',fontSize:26,fontWeight:600,color:B.navy,fontFamily:'Inter'}},'@visadoctoruae'));

const SCRIM = ['linear-gradient(to bottom, rgba(13,20,36,.66) 0%, rgba(13,20,36,0) 22%)',
               'linear-gradient(to top, rgba(13,20,36,.95) 0%, rgba(13,20,36,.72) 34%, rgba(13,20,36,.24) 66%, rgba(13,20,36,.40) 100%)'];

const L = {};

L.photo = s => e('div',{style:{display:'flex',flexDirection:'column',width:W,height:H,position:'relative',backgroundColor:B.navy}},
  e('img',{src:s._img,width:W,height:H,style:{position:'absolute',left:0,top:0,width:W,height:H,objectFit:'cover'}}),
  e('div',{style:{display:'flex',position:'absolute',left:0,top:0,width:W,height:H,backgroundImage:SCRIM[1]}}),
  e('div',{style:{display:'flex',position:'absolute',left:0,top:0,width:W,height:H,backgroundImage:SCRIM[0]}}),
  e('div',{style:{display:'flex',flexDirection:'column',flex:1,padding:'86px 72px 190px 72px',position:'relative'}},
    Mark(),
    e('div',{style:{display:'flex',flexDirection:'column',marginTop:'auto'}},
      s.kicker ? e('div',{style:{display:'flex',fontSize:44,color:B.goldLt,fontFamily:'Playfair',fontStyle:'italic',marginBottom:16}},s.kicker) : null,
      e('div',{style:{display:'flex',fontSize:s.size||96,fontWeight:800,color:B.white,fontFamily:'Inter',letterSpacing:-2.5,lineHeight:1.04,maxWidth:900}},s.headline),
      s.sub ? e('div',{style:{display:'flex',fontSize:42,color:B.goldLt,fontFamily:'Playfair',fontStyle:'italic',marginTop:26,maxWidth:880}},s.sub) : null,
      s.body ? e('div',{style:{display:'flex',fontSize:29,color:'rgba(255,255,255,.84)',fontFamily:'Inter',lineHeight:1.5,marginTop:28,maxWidth:830}},s.body) : null)),
  Foot());

L.list = s => e('div',{style:{display:'flex',flexDirection:'column',width:W,height:H,position:'relative',backgroundColor:B.cream}},
  e('div',{style:{display:'flex',position:'absolute',right:-200,top:300,width:700,height:700,borderRadius:999,backgroundColor:'#EFE7D3'}}),
  e('div',{style:{display:'flex',flexDirection:'column',flex:1,padding:'86px 72px 190px 72px',position:'relative'}},
    e('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%'}},
      e('div',{style:{display:'flex',fontSize:24,fontWeight:700,letterSpacing:7,color:B.navy,fontFamily:'Inter'}},'VISA DOCTOR'),
      e('div',{style:{display:'flex',fontSize:20,letterSpacing:4,color:'rgba(21,37,65,.5)',fontFamily:'Inter'}},'DUBAI • UAE')),
    e('div',{style:{display:'flex',flexDirection:'column',marginTop:'auto',marginBottom:'auto'}},
      s.kicker ? e('div',{style:{display:'flex',fontSize:44,color:B.subGold,fontFamily:'Playfair',fontStyle:'italic'}},s.kicker) : null,
      e('div',{style:{display:'flex',fontSize:s.size||70,fontWeight:800,color:B.navy,fontFamily:'Inter',letterSpacing:-1.5,lineHeight:1.08,marginTop:10,maxWidth:900}},s.headline),
      e('div',{style:{display:'flex',width:110,height:6,backgroundColor:B.gold,marginTop:32}}),
      e('div',{style:{display:'flex',flexDirection:'column',marginTop:44}},
        (s.items||[]).map((t,i)=>e('div',{key:i,style:{display:'flex',alignItems:'flex-start',gap:22,marginTop:i?30:0}},
          e('div',{style:{display:'flex',width:34,height:34,borderRadius:999,border:'3px solid '+B.gold,color:B.subGold,fontSize:18,fontWeight:700,fontFamily:'Inter',alignItems:'center',justifyContent:'center',marginTop:4}},String(i+1)),
          e('div',{style:{display:'flex',fontSize:34,color:B.navy,fontFamily:'Inter',lineHeight:1.42,maxWidth:800}},t)))),
      s.footnote ? e('div',{style:{display:'flex',fontSize:25,color:B.inkMuted,fontFamily:'Inter',marginTop:44,lineHeight:1.5,maxWidth:860}},s.footnote) : null)),
  Foot());

L.cover = s => e('div',{style:{display:'flex',width:W,height:H,backgroundColor:'#0B1220',alignItems:'center',justifyContent:'center',position:'relative'}},
  e('div',{style:{display:'flex',width:560,height:560,borderRadius:999,border:'5px solid '+B.gold,alignItems:'center',justifyContent:'center',flexDirection:'column'}},
    e('div',{style:{display:'flex',fontSize:s.size||210,color:B.gold,fontFamily:'Playfair',fontStyle:'italic',lineHeight:1}},s.code),
    e('div',{style:{display:'flex',fontSize:34,fontWeight:700,letterSpacing:9,color:B.goldLt,fontFamily:'Inter',marginTop:24}},String(s.label||'').toUpperCase())));

const [,,deckPath,outDir] = process.argv;
if(!deckPath){ console.error('usage: node story.mjs stories/<f>.json out_stories/<dir>'); process.exit(1); }
const deck = JSON.parse(fs.readFileSync(deckPath,'utf8'));
const out = outDir || path.join('out_stories', path.basename(deckPath,'.json'));
fs.mkdirSync(out,{recursive:true});
for(const f of deck.frames) if(f.photo) f._img = await photo(f.photo);
for(let i=0;i<deck.frames.length;i++){
  const f = deck.frames[i];
  if(!L[f.type]) throw new Error('Unknown frame type ' + f.type);
  const svg = await satori(L[f.type](f), { width:W, height:H, fonts });
  fs.writeFileSync(path.join(out,'s_'+String(i+1).padStart(2,'0')+'.png'), new Resvg(svg,{fitTo:{mode:'width',value:W}}).render().asPng());
}
console.log('Rendered ' + deck.frames.length + ' story frames -> ' + out);
