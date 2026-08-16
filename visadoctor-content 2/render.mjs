// Visa Doctor UAE — Carousel Engine v2
// 9 layout types so the feed has rhythm instead of repetition.
// No AI imagery. Deterministic. Free.
// Usage: node render.mjs decks/<name>.json out/<name>

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const FD = path.join(__dir, 'node_modules', '@fontsource');
const F = (p) => fs.readFileSync(p);

const fonts = [
  { name: 'Inter', data: F(`${FD}/inter/files/inter-latin-400-normal.woff`), weight: 400, style: 'normal' },
  { name: 'Inter', data: F(`${FD}/inter/files/inter-latin-600-normal.woff`), weight: 600, style: 'normal' },
  { name: 'Inter', data: F(`${FD}/inter/files/inter-latin-700-normal.woff`), weight: 700, style: 'normal' },
  { name: 'Inter', data: F(`${FD}/inter/files/inter-latin-800-normal.woff`), weight: 800, style: 'normal' },
  { name: 'Playfair', data: F(`${FD}/playfair-display/files/playfair-display-latin-400-italic.woff`), weight: 400, style: 'italic' },
  { name: 'Playfair', data: F(`${FD}/playfair-display/files/playfair-display-latin-500-italic.woff`), weight: 500, style: 'italic' },
];

// ---- BRAND ----
const B = {
  navy: '#152541', navy2: '#1B2E4F', cream: '#F7F2E7', gold: '#C9A24B',
  goldLt: '#E3CC93', bar: '#D8BE85', white: '#FFF', muted: '#9FB0C9',
  ink: '#152541', inkMuted: 'rgba(21,37,65,.62)',
  subGold: '#8C6B22',
  alert: '#B4472F',        // third accent — news / urgency / scam-watch
  alertLt: '#E8A08C',
};
const W = 1080, H = 1350;

const e = (t, p = {}, ...c) => ({ type: t, props: { ...p, children: c.flat().filter(x => x !== null && x !== false && x !== undefined) } });
const img = (p) => {
  const abs = path.isAbsolute(p) ? p : path.join(__dir, p);
  const ext = path.extname(abs).slice(1).replace('jpg', 'jpeg');
  return `data:image/${ext};base64,${fs.readFileSync(abs).toString('base64')}`;
};

// ---- CHROME ----
const TopBar = (mode) => {
  const c = mode === 'light' ? B.navy : B.white;
  const m = mode === 'light' ? 'rgba(21,37,65,.45)' : 'rgba(255,255,255,.5)';
  return e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' } },
    e('div', { style: { display: 'flex', fontSize: 22, fontWeight: 700, letterSpacing: 6, color: c, fontFamily: 'Inter' } }, 'VISA DOCTOR'),
    e('div', { style: { display: 'flex', fontSize: 18, letterSpacing: 4, color: m, fontFamily: 'Inter' } }, 'DUBAI • UAE'));
};

const Pill = (text, bg, fg) => e('div', {
  style: { display: 'flex', backgroundColor: bg, color: fg, fontSize: 20, fontWeight: 700, letterSpacing: 2, padding: '10px 22px', borderRadius: 999, fontFamily: 'Inter' }
}, String(text).toUpperCase());

const FootBar = () => e('div', {
  style: { display: 'flex', width: '100%', backgroundColor: B.bar, padding: '26px 70px', justifyContent: 'space-between', alignItems: 'center' }
},
  e('div', { style: { display: 'flex', flexDirection: 'column' } },
    e('div', { style: { display: 'flex', fontSize: 25, fontWeight: 700, color: B.navy, fontFamily: 'Inter' } }, 'Message us — link in bio'),
    e('div', { style: { display: 'flex', fontSize: 17, color: 'rgba(21,37,65,.6)', fontFamily: 'Inter', marginTop: 3 } }, '+971 58 517 0900 · Free consultation')),
  e('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' } },
    e('div', { style: { display: 'flex', fontSize: 22, fontWeight: 600, color: B.navy, fontFamily: 'Inter' } }, '@visadoctoruae'),
    e('div', { style: { display: 'flex', fontSize: 17, color: 'rgba(21,37,65,.6)', fontFamily: 'Inter', marginTop: 3 } }, 'visadoctor.ae')));

const PALETTE = {
  dark:  { bg: B.navy,  mode: 'dark',  h: B.white, sub: B.goldLt, body: B.muted,    pill: [B.gold, B.navy] },
  light: { bg: B.cream, mode: 'light', h: B.navy,  sub: B.subGold, body: B.inkMuted, pill: [B.navy, B.cream] },
  alert: { bg: B.alert, mode: 'dark',  h: B.white, sub: '#F6D9CE',body: 'rgba(255,255,255,.85)', pill: [B.white, B.alert] },
};

const Frame = (tone, kids, opts = {}) => {
  const P = PALETTE[tone] || PALETTE.dark;
  return e('div', { style: { display: 'flex', flexDirection: 'column', width: W, height: H, backgroundColor: P.bg, position: 'relative' } },
    opts.deco ? e('div', { style: { display: 'flex', position: 'absolute', right: -180, top: 240, width: 620, height: 620, borderRadius: 999, backgroundColor: tone === 'light' ? '#E9DFC9' : B.navy2, opacity: .95 } }) : null,
    e('div', { style: { display: 'flex', flexDirection: 'column', flex: 1, padding: '58px 70px 0 70px' } }, kids),
    FootBar());
};

const P = (s) => PALETTE[s.tone || 'dark'] || PALETTE.dark;

// ---- LAYOUTS ----
const L = {};

L.cover = (s) => Frame(s.tone || 'dark', [
  TopBar(P(s).mode),
  s.tag ? e('div', { style: { display: 'flex', marginTop: 54 } }, Pill(s.tag, ...P(s).pill)) : null,
  e('div', { style: { display: 'flex', fontSize: s.size || 90, fontWeight: 800, color: P(s).h, lineHeight: 1.05, marginTop: 38, fontFamily: 'Inter', letterSpacing: -2, maxWidth: 880 } }, s.headline),
  s.sub ? e('div', { style: { display: 'flex', fontSize: 45, color: P(s).sub, fontFamily: 'Playfair', fontStyle: 'italic', marginTop: 32 } }, s.sub) : null,
  s.note ? e('div', { style: { display: 'flex', fontSize: 27, color: P(s).body, marginTop: 'auto', marginBottom: 46, lineHeight: 1.5, maxWidth: 800, fontFamily: 'Inter' } }, s.note) : null,
], { deco: true });

L.numbered = (s) => {
  const n = s.items.length, gap = n <= 3 ? 42 : n === 4 ? 32 : 24, fz = n <= 3 ? 35 : n === 4 ? 33 : 29;
  return Frame(s.tone || 'light', [
    TopBar(P(s).mode),
    e('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto', paddingBottom: 26 } },
      s.kicker ? e('div', { style: { display: 'flex', fontSize: 44, color: P(s).sub, fontFamily: 'Playfair', fontStyle: 'italic' } }, s.kicker) : null,
      e('div', { style: { display: 'flex', fontSize: 54, fontWeight: 800, color: P(s).h, fontFamily: 'Inter', letterSpacing: -1, marginTop: 6, maxWidth: 860 } }, s.headline),
      e('div', { style: { display: 'flex', width: 92, height: 5, backgroundColor: B.gold, marginTop: 24 } }),
      e('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 46 } },
        s.items.map((it, i) => e('div', { style: { display: 'flex', alignItems: 'flex-start', marginBottom: i === n - 1 ? 0 : gap } },
          e('div', { style: { display: 'flex', width: 52, height: 52, borderRadius: 999, border: `2px solid ${B.gold}`, color: B.gold, fontSize: 25, fontWeight: 700, alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', flexShrink: 0, marginTop: 2 } }, String(i + 1)),
          e('div', { style: { display: 'flex', fontSize: fz, color: P(s).h, lineHeight: 1.45, marginLeft: 24, maxWidth: 760, fontFamily: 'Inter' } }, it)))))]);
};

L.statement = (s) => Frame(s.tone || 'dark', [
  TopBar(P(s).mode),
  e('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto' } },
    e('div', { style: { display: 'flex', fontSize: s.size || 74, fontWeight: 800, color: P(s).h, fontFamily: 'Inter', lineHeight: 1.1, letterSpacing: -1.5, maxWidth: 830 } }, s.headline),
    s.sub ? e('div', { style: { display: 'flex', fontSize: 40, color: P(s).sub, fontFamily: 'Playfair', fontStyle: 'italic', marginTop: 26 } }, s.sub) : null,
    s.body ? e('div', { style: { display: 'flex', fontSize: 29, color: P(s).body, marginTop: 32, lineHeight: 1.5, maxWidth: 780, fontFamily: 'Inter' } }, s.body) : null)],
  { deco: true });

// NEW — one enormous figure. Scale contrast breaks the feed's sameness.
L.bignumber = (s) => Frame(s.tone || 'dark', [
  TopBar(P(s).mode),
  e('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto' } },
    s.tag ? e('div', { style: { display: 'flex', marginBottom: 26 } }, Pill(s.tag, ...P(s).pill)) : null,
    e('div', { style: { display: 'flex', fontSize: 230, fontWeight: 800, color: P(s).sub, fontFamily: 'Inter', letterSpacing: -10, lineHeight: 1 } }, s.number),
    e('div', { style: { display: 'flex', fontSize: 52, fontWeight: 800, color: P(s).h, fontFamily: 'Inter', letterSpacing: -1, marginTop: 14, maxWidth: 820 } }, s.label),
    s.body ? e('div', { style: { display: 'flex', fontSize: 29, color: P(s).body, marginTop: 26, lineHeight: 1.5, maxWidth: 780, fontFamily: 'Inter' } }, s.body) : null)]);

// NEW — editorial quote card
L.quote = (s) => Frame(s.tone || 'light', [
  TopBar(P(s).mode),
  e('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto' } },
    e('div', { style: { display: 'flex', fontSize: 150, color: B.gold, fontFamily: 'Playfair', fontStyle: 'italic', lineHeight: .8, height: 96 } }, '“'),
    e('div', { style: { display: 'flex', fontSize: 52, color: P(s).h, fontFamily: 'Playfair', fontStyle: 'italic', lineHeight: 1.32, marginTop: 16, maxWidth: 840 } }, s.quote),
    e('div', { style: { display: 'flex', width: 74, height: 4, backgroundColor: B.gold, marginTop: 40 } }),
    e('div', { style: { display: 'flex', fontSize: 27, fontWeight: 700, color: P(s).h, fontFamily: 'Inter', marginTop: 24, letterSpacing: 1 } }, s.attribution),
    s.detail ? e('div', { style: { display: 'flex', fontSize: 24, color: P(s).body, fontFamily: 'Inter', marginTop: 8 } }, s.detail) : null)]);

// NEW — side-by-side comparison
L.split = (s) => {
  const col = (side, accent) => {
    const d = s[side];
    const rows = d.items.map(it =>
      e('div', { style: { display: 'flex', fontSize: 27, color: P(s).h, fontFamily: 'Inter', lineHeight: 1.4, marginBottom: 16 } }, it)
    );
    return e('div', {
      style: { display: 'flex', flexDirection: 'column', width: 430, marginRight: side === 'left' ? 20 : 0, backgroundColor: 'rgba(21,37,65,.045)', borderTop: `6px solid ${accent}`, padding: '30px 28px' }
    },
      e('div', { style: { display: 'flex', fontSize: 25, fontWeight: 700, color: accent, fontFamily: 'Inter', letterSpacing: 2, marginBottom: 22 } }, d.title.toUpperCase()),
      e('div', { style: { display: 'flex', flexDirection: 'column' } }, rows)
    );
  };
  return Frame(s.tone || 'light', [
    TopBar(P(s).mode),
    e('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto' } },
      e('div', { style: { display: 'flex', fontSize: 50, fontWeight: 800, color: P(s).h, fontFamily: 'Inter', letterSpacing: -1, maxWidth: 860 } }, s.headline),
      e('div', { style: { display: 'flex', marginTop: 42 } }, col('left', B.alert), col('right', B.gold))
    )
  ]);
};

// NEW — data table. The Appointment Index. Nobody else in the niche publishes data.
L.index = (s) => Frame(s.tone || 'dark', [
  TopBar(P(s).mode),
  e('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 44 } },
    e('div', { style: { display: 'flex' } }, Pill(s.tag || 'APPOINTMENT INDEX', ...P(s).pill)),
    e('div', { style: { display: 'flex', fontSize: 58, fontWeight: 800, color: P(s).h, fontFamily: 'Inter', letterSpacing: -1.5, marginTop: 24 } }, s.headline),
    s.sub ? e('div', { style: { display: 'flex', fontSize: 30, color: P(s).sub, fontFamily: 'Playfair', fontStyle: 'italic', marginTop: 10 } }, s.sub) : null,
    e('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 40 } },
      s.rows.map((r) => e('div', {
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.13)', paddingTop: 17, paddingBottom: 17 }
      },
        e('div', { style: { display: 'flex', fontSize: 32, color: P(s).h, fontFamily: 'Inter', fontWeight: 600 } }, r.name),
        e('div', { style: { display: 'flex', fontSize: 32, color: B.goldLt, fontFamily: 'Inter', fontWeight: 700 } }, r.value)))),
    s.note ? e('div', { style: { display: 'flex', fontSize: 22, color: P(s).body, marginTop: 26, fontFamily: 'Inter', lineHeight: 1.45, maxWidth: 820 } }, s.note) : null)]);

// NEW — full-bleed photo with gradient scrim (use free Pexels/Pixabay stock)
L.photo = (s) => e('div', { style: { display: 'flex', flexDirection: 'column', width: W, height: H, position: 'relative' } },
  e('img', { src: img(s.image), width: W, height: H, style: { position: 'absolute', top: 0, left: 0, objectFit: 'cover' } }),
  e('div', { style: { display: 'flex', position: 'absolute', top: 0, left: 0, width: W, height: H, backgroundColor: 'rgba(12,22,40,.55)' } }),
  e('div', { style: { display: 'flex', flexDirection: 'column', flex: 1, padding: '58px 70px 0 70px' } },
    TopBar('dark'),
    e('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 40 } },
      s.tag ? e('div', { style: { display: 'flex', marginBottom: 24 } }, Pill(s.tag, B.gold, B.navy)) : null,
      e('div', { style: { display: 'flex', fontSize: s.size || 78, fontWeight: 800, color: B.white, fontFamily: 'Inter', lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 850 } }, s.headline),
      s.sub ? e('div', { style: { display: 'flex', fontSize: 40, color: B.goldLt, fontFamily: 'Playfair', fontStyle: 'italic', marginTop: 22 } }, s.sub) : null)),
  FootBar());

L.cta = (s) => Frame(s.tone || 'light', [
  TopBar(P(s).mode),
  e('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto' } },
    e('div', { style: { display: 'flex' } }, Pill(s.tag || 'FREE CONSULTATION', ...P(s).pill)),
    e('div', { style: { display: 'flex', fontSize: s.size || 74, fontWeight: 800, color: P(s).h, fontFamily: 'Inter', lineHeight: 1.08, letterSpacing: -1.5, marginTop: 32, maxWidth: 840 } }, s.headline),
    s.sub ? e('div', { style: { display: 'flex', fontSize: 40, color: P(s).sub, fontFamily: 'Playfair', fontStyle: 'italic', marginTop: 24 } }, s.sub) : null,
    e('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 42 } },
      (s.checks || []).map(c => e('div', { style: { display: 'flex', alignItems: 'center', marginBottom: 21 } },
        e('div', { style: { display: 'flex', width: 26, height: 4, backgroundColor: B.gold, marginRight: 22, flexShrink: 0 } }),
        e('div', { style: { display: 'flex', fontSize: 32, color: P(s).h, fontFamily: 'Inter' } }, c)))))]);

// ---- FEED-RHYTHM GUARD ----
// Warns if consecutive slides share a layout — the exact fault that made the old feed look repetitive.
function lintRhythm(slides, name) {
  const warn = [];
  for (let i = 1; i < slides.length; i++) {
    if (slides[i].type === slides[i - 1].type && slides[i].type !== 'numbered') {
      warn.push(`  ⚠ slides ${i} & ${i + 1} both "${slides[i].type}" — consider varying`);
    }
  }
  const tones = new Set(slides.map(s => s.tone || 'dark'));
  if (tones.size === 1) warn.push(`  ⚠ every slide uses tone "${[...tones][0]}" — alternate for visual rhythm`);
  if (warn.length) console.log(`\nRhythm check — ${name}:\n${warn.join('\n')}`);
  else console.log(`\nRhythm check — ${name}: ✅ good variation`);
}

// ---- RUN ----
const [, , deckPath, outDir] = process.argv;
if (!deckPath) { console.error('usage: node render.mjs decks/<file>.json out/<dir>'); process.exit(1); }
const deck = JSON.parse(fs.readFileSync(deckPath, 'utf8'));
const out = outDir || path.join('out', path.basename(deckPath, '.json'));
fs.mkdirSync(out, { recursive: true });

for (let i = 0; i < deck.slides.length; i++) {
  const s = deck.slides[i];
  if (!L[s.type]) throw new Error(`Unknown slide type "${s.type}". Available: ${Object.keys(L).join(', ')}`);
  const svg = await satori(L[s.type](s), { width: W, height: H, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  fs.writeFileSync(path.join(out, `slide_${String(i + 1).padStart(2, '0')}.png`), png);
}
console.log(`Rendered ${deck.slides.length} slides → ${out}`);
lintRhythm(deck.slides, path.basename(deckPath));
