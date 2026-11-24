import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile,
  interpolate, spring, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import '@fontsource/bricolage-grotesque/latin-500.css';
import '@fontsource/bricolage-grotesque/latin-ext-500.css';
import '@fontsource/bricolage-grotesque/latin-700.css';
import '@fontsource/bricolage-grotesque/latin-ext-700.css';
import '@fontsource/bricolage-grotesque/latin-800.css';
import '@fontsource/bricolage-grotesque/latin-ext-800.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/instrument-serif/latin-ext-400-italic.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-ext-500.css';
import {continueRender, delayRender} from 'remotion';
import WORDS from './words.json';

const SANS = "'Bricolage Grotesque', sans-serif";
const SERIF = "'Instrument Serif', serif";
const MONO = "'JetBrains Mono', monospace";
const fontHandle = delayRender('fonts');
Promise.all([
  "800 40px 'Bricolage Grotesque'", "700 40px 'Bricolage Grotesque'", "500 40px 'Bricolage Grotesque'",
  "italic 400 40px 'Instrument Serif'", "500 40px 'JetBrains Mono'",
].map(f => document.fonts.load(f, 'ğüşıöçİ'))).then(() => continueRender(fontHandle));

export const FPS = 30;
const C = {
  cream: '#F3EEE3', ink: '#0A0A0B', green: '#173B2F', orange: '#FF4F12',
  yellow: '#FFD400', red: '#E5483B', ok: '#22A06B', card: '#FFFFFF', line: '#E6DECD', muted: '#8A8475',
};
const IN = Easing.bezier(0.16, 1, 0.3, 1);
const sec = (s: number) => Math.round(s * FPS);

// ---------- helpers ----------
const useT = () => useCurrentFrame() / FPS;
const appear = (f: number, start = 0, dur = 12) =>
  interpolate(f, [start, start + dur], [0, 1], {easing: IN, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Pop: React.FC<{at?: number; children: React.ReactNode; style?: React.CSSProperties; from?: number}> = ({at = 0, children, style, from = 40}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: {damping: 14, stiffness: 160}});
  const o = interpolate(f - at, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{transform: `translateY(${(1 - s) * from}px) scale(${0.9 + 0.1 * s})`, opacity: o, ...style}}>{children}</div>;
};

const Panel: React.FC<{children: React.ReactNode; top?: number}> = ({children, top = 150}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
    {children}
  </div>
);

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: MONO, fontSize: 30, letterSpacing: 8, color: C.orange, fontWeight: 500}}>{children}</div>
);

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: C.card, borderRadius: 28, boxShadow: '0 18px 50px rgba(40,30,10,.12)', border: `2px solid ${C.line}`, ...style}}>{children}</div>
);

const ToolIcon: React.FC<{k: string; size?: number}> = ({k, size = 120}) => {
  const base: React.CSSProperties = {width: size, height: size, borderRadius: size * 0.24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, color: '#fff', fontSize: size * 0.42};
  if (k === 'omni') return <div style={{...base, background: '#E8453C'}}><svg width={size * .6} height={size * .6} viewBox="0 0 60 60"><g stroke="#fff" strokeWidth="5" strokeLinecap="round">{[0, 60, 120, 180, 240, 300].map(a => <line key={a} x1="30" y1="30" x2={30 + 22 * Math.cos(a * Math.PI / 180)} y2={30 + 22 * Math.sin(a * Math.PI / 180)} />)}</g><circle cx="30" cy="30" r="9" fill="#fff" />{[0, 60, 120, 180, 240, 300].map(a => <circle key={a} cx={30 + 22 * Math.cos(a * Math.PI / 180)} cy={30 + 22 * Math.sin(a * Math.PI / 180)} r="5" fill="#fff" />)}</svg></div>;
  if (k === 'mem') return <div style={{...base, background: C.orange}}><svg width={size * .6} height={size * .6} viewBox="0 0 60 60"><path d="M30 10c-9 0-15 6-15 13 0 4 2 6 2 9s-3 5-3 9c0 6 6 9 11 9h10c5 0 11-3 11-9 0-4-3-6-3-9s2-5 2-9c0-7-6-13-15-13z" fill="none" stroke="#fff" strokeWidth="4.5" /><line x1="30" y1="12" x2="30" y2="49" stroke="#fff" strokeWidth="4" /></svg></div>;
  if (k === 'head') return <div style={{...base, background: '#2BB3A8', fontFamily: MONO, fontSize: size * .36}}>[=]</div>;
  if (k === 'setup') return <div style={{...base, background: C.ink, fontFamily: SERIF, fontStyle: 'italic', fontSize: size * .55}}>A\</div>;
  return <div style={{...base, background: '#6C4BD8'}}><svg width={size * .62} height={size * .62} viewBox="0 0 60 60"><path d="M4 30s10-16 26-16 26 16 26 16-10 16-26 16S4 30 4 30z" fill="none" stroke="#fff" strokeWidth="4.5" /><circle cx="30" cy="30" r="8" fill="#fff" /></svg></div>;
};

// ---------- scenes ----------
const Speedo: React.FC = () => {
  const f = useCurrentFrame();
  const kmh = interpolate(f, [0, sec(3.1), sec(4.4), sec(5.4)], [0, 240, 240, 14], {easing: Easing.inOut(Easing.cubic), extrapolateRight: 'clamp'});
  const ang = -120 + (kmh / 240) * 240;
  const fast = kmh > 100;
  const label = fast ? 'son model araba' : 'çoğumuz';
  return (
    <Panel top={140}>
      <Pop><div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, background: '#D9D2C2', padding: '10px 26px', borderRadius: 14, color: C.ink}}>{label} · <span style={{color: C.orange}}>{fast ? '240 km/s' : '14 km/s'}</span></div></Pop>
      <svg width="620" height="430" viewBox="0 0 620 430">
        <path d="M70 360 A240 240 0 1 1 550 360" fill="none" stroke="#DDD6C6" strokeWidth="30" strokeLinecap="round" />
        <path d="M470 120 A240 240 0 0 1 550 360" fill="none" stroke={C.red} strokeWidth="30" strokeLinecap="round" opacity=".85" />
        <path d="M70 360 A240 240 0 0 1 95 250" fill="none" stroke={C.yellow} strokeWidth="30" strokeLinecap="round" />
        {[0, 60, 120, 180, 240].map(v => { const a = (-120 + v) * Math.PI / 180 - Math.PI / 2; return <text key={v} x={310 + 180 * Math.cos(a)} y={300 + 180 * Math.sin(a) + 12} textAnchor="middle" fontFamily={SANS} fontSize="32" fill={C.muted}>{v}</text>; })}
        <g transform={`rotate(${ang} 310 300)`}><line x1="310" y1="300" x2="310" y2="105" stroke={C.ink} strokeWidth="12" strokeLinecap="round" /></g>
        <circle cx="310" cy="300" r="26" fill={C.ink} />
        <text x="310" y="410" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="70" fill={C.ink}>{Math.round(kmh)}<tspan fontSize="30" fill={C.muted}> km/s</tspan></text>
      </svg>
    </Panel>
  );
};

const FiveTools: React.FC = () => (
  <Panel top={200}>
    <Pop><div style={{fontFamily: SANS, fontWeight: 800, fontSize: 92, color: C.ink, textAlign: 'center', lineHeight: 1}}>5 <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.orange}}>ücretsiz</span> araç</div></Pop>
    <div style={{display: 'flex', gap: 22, marginTop: 20}}>
      {['omni', 'mem', 'head', 'setup', 'obs'].map((k, i) => <Pop key={k} at={sec(0.6) + i * 4}><ToolIcon k={k} size={150} /></Pop>)}
    </div>
  </Panel>
);

const TitleCard: React.FC<{n: string; name: string; sub: string; icon: string; shot: 'repo' | 'plugin'}> = ({n, name, sub, icon, shot}) => (
  <Panel top={120}>
    <Pop><Kicker>{n}</Kicker></Pop>
    <Pop at={3}><ToolIcon k={icon} size={170} /></Pop>
    <Pop at={6}><div style={{fontFamily: SANS, fontWeight: 800, fontSize: 84, color: C.ink, lineHeight: 1}}>{name}</div></Pop>
    <Pop at={9}><div style={{fontFamily: SANS, fontSize: 34, color: C.muted}}>{sub}</div></Pop>
    <Pop at={14} from={80}>
      <Card style={{width: 800, height: 300, background: '#16181C', border: 'none', padding: 26, overflow: 'hidden'}}>
        <div style={{display: 'flex', gap: 10, marginBottom: 20}}>{[C.red, C.yellow, C.ok].map(c => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}</div>
        <div style={{fontFamily: MONO, color: '#E8E4DA', fontSize: 30, marginBottom: 18}}>{shot === 'repo' ? 'github.com / OmniRoute' : '/plugin install claude-code-setup'}</div>
        {[0.95, 0.7, 0.85, 0.55, 0.75].map((w, i) => <div key={i} style={{height: 16, width: `${w * 100}%`, background: '#2C3038', borderRadius: 8, marginBottom: 16}} />)}
      </Card>
    </Pop>
  </Panel>
);

const Providers: React.FC = () => {
  const f = useCurrentFrame();
  const count = Math.round(interpolate(f, [0, sec(1.6)], [0, 300], {easing: IN, extrapolateRight: 'clamp'}));
  const cols = ['#E8453C', '#4C8DF6', '#111', '#7A5AF8', C.orange, '#22A06B', '#F2B705', '#0EA5E9', '#EC4899', '#14B8A6', '#6366F1', '#F97316'];
  return (
    <Panel top={150}>
      <Pop><div style={{fontFamily: SANS, fontWeight: 800, fontSize: 120, color: C.red, lineHeight: 1}}>{count}+</div></Pop>
      <Pop at={4}><div style={{fontFamily: SANS, fontSize: 36, color: C.muted}}>yapay zekâ sağlayıcısı · <b style={{color: C.ink}}>tek adres</b></div></Pop>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 92px)', gap: 18, marginTop: 10}}>
        {cols.map((c, i) => <Pop key={i} at={8 + i * 2}><div style={{width: 92, height: 92, borderRadius: 22, background: '#fff', border: `2px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{width: 44, height: 44, borderRadius: i % 3 === 0 ? 22 : 10, background: c}} /></div></Pop>)}
      </div>
    </Panel>
  );
};

const Fallback: React.FC = () => {
  const f = useCurrentFrame();
  const rows = ['Claude', 'Kimi', 'Gemini'];
  const active = f < sec(1.0) ? 0 : f < sec(2.2) ? 1 : 1;
  return (
    <Panel top={170}>
      <Pop><div style={{fontFamily: SANS, fontSize: 36, color: C.muted}}>iş durmuyor, <b style={{color: C.ink}}>sıradakine geçiyor</b></div></Pop>
      {rows.map((r, i) => {
        const dead = i === 0 && f > sec(0.9);
        const on = i === active;
        return (
          <Pop key={r} at={4 + i * 4}>
            <Card style={{width: 760, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', opacity: dead ? 0.45 : 1, border: on ? `4px solid ${C.ok}` : `2px solid ${C.line}`}}>
              <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, textDecoration: dead ? 'line-through' : 'none'}}>{r}</span>
              <span style={{fontFamily: MONO, fontSize: 28, color: dead ? C.red : on ? C.ok : C.muted}}>{dead ? 'limit doldu' : on ? '✓ devrede' : 'yedek'}</span>
            </Card>
          </Pop>
        );
      })}
    </Panel>
  );
};

const NoLimit: React.FC = () => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, 8], [-25, -6], {easing: IN, extrapolateRight: 'clamp'});
  const s = interpolate(f, [0, 8], [2.2, 1], {easing: IN, extrapolateRight: 'clamp'});
  return (
    <Panel top={300}>
      <div style={{transform: `rotate(${r}deg) scale(${s})`, border: `10px solid ${C.red}`, color: C.red, fontFamily: SANS, fontWeight: 800, fontSize: 150, padding: '10px 50px', borderRadius: 26, background: 'rgba(255,255,255,.6)'}}>LİMİT YOK</div>
    </Panel>
  );
};

const Amnesia: React.FC = () => (
  <Panel top={170}>
    <Pop>
      <Card style={{padding: '30px 36px', display: 'flex', gap: 22, alignItems: 'flex-start', width: 820}}>
        <ToolIcon k="setup" size={70} />
        <div style={{fontFamily: SANS, fontSize: 40, lineHeight: 1.3}}>Merhaba! Hangi proje üzerinde çalışıyorduk? 🙂</div>
      </Card>
    </Pop>
    <Pop at={sec(2.2)}><div style={{background: C.red, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 52, padding: '14px 34px', borderRadius: 16}}>her oturum sıfırdan</div></Pop>
  </Panel>
);

const DunBugun: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [sec(0.8), sec(1.8)], [0, 1], {easing: IN, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const box = (title: string, hl: boolean, extra?: React.ReactNode) => (
    <Card style={{width: 360, height: 260, padding: 30, border: hl ? `4px solid ${C.ok}` : `2px solid ${C.line}`}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, marginBottom: 24}}>{title}</div>
      {[0.9, 0.7, 0.8].map((w, i) => <div key={i} style={{height: 16, width: `${w * 100}%`, background: '#E9E3D6', borderRadius: 8, marginBottom: 16}} />)}
      {extra}
    </Card>
  );
  return (
    <Panel top={240}>
      <div style={{display: 'flex', gap: 60, alignItems: 'center'}}>
        <Pop>{box('Dün', false)}</Pop>
        <svg width="80" height="40"><line x1="0" y1="20" x2={70 * x} y2="20" stroke={C.ok} strokeWidth="6" /><polygon points="62,8 80,20 62,32" fill={C.ok} opacity={x} /></svg>
        <Pop at={sec(1.2)}>{box('Bugün', true, <div style={{fontFamily: MONO, fontSize: 24, color: C.ok}}>kaldığın yerden →</div>)}</Pop>
      </div>
    </Panel>
  );
};

const Filter: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f % 40) / 40;
  return (
    <Panel top={110}>
      <Pop><div style={{fontFamily: MONO, fontSize: 34, background: C.ink, color: C.ok, padding: '10px 24px', borderRadius: 12}}>[=] Headroom</div></Pop>
      <svg width="700" height="560" viewBox="0 0 700 560">
        {['log', '{ } JSON', 'stack trace', 'log'].map((l, i) => {
          const y = ((i * 0.25 + t) % 1) * 150;
          return <g key={i} opacity={1 - y / 170}><rect x={120 + (i % 2) * 260} y={y} width="200" height="54" rx="12" fill="#fff" stroke={C.line} strokeWidth="2" /><text x={220 + (i % 2) * 260} y={y + 36} textAnchor="middle" fontFamily={MONO} fontSize="24" fill={C.ink}>{l}</text></g>;
        })}
        <path d="M110 200 L590 200 L420 400 L280 400 Z" fill="#F7E7C6" stroke="#C9A76A" strokeWidth="5" />
        {[0, 1, 2, 3, 4].map(i => <line key={i} x1={150 + i * 100} y1="215" x2={310 + i * 20} y2="390" stroke="#C9A76A" strokeWidth="2" opacity=".6" />)}
        <circle cx="350" cy={430 + ((f % 20) / 20) * 70} r="10" fill="#6B4A2B" />
        <rect x="270" y="470" width="160" height="70" rx="14" fill={C.ok} /><text x="350" y="515" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="30" fill="#fff">− token</text>
      </svg>
    </Panel>
  );
};

const SameAnswer: React.FC = () => (
  <Panel top={300}>
    <Pop>
      <Card style={{width: 820, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 44px'}}>
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 52}}>Cevap</span>
        <span style={{fontFamily: MONO, fontSize: 36, color: C.muted}}>aynı → <b style={{color: C.ok}}>aynı ✓</b></span>
      </Card>
    </Pop>
  </Panel>
);

const Terminal: React.FC<{title: string; lines: {t: string; at: number; hl?: string}[]}> = ({title, lines}) => {
  const f = useCurrentFrame();
  return (
    <Panel top={150}>
      <Pop><div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: SANS, fontWeight: 800, fontSize: 48}}><ToolIcon k="setup" size={64} />{title}</div></Pop>
      <Pop at={4} from={60}>
        <div style={{width: 860, background: '#16181C', borderRadius: 26, padding: '26px 34px', minHeight: 330}}>
          <div style={{display: 'flex', gap: 10, marginBottom: 24}}>{[C.red, C.yellow, C.ok].map(c => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}</div>
          {lines.map((l, i) => {
            const vis = f >= l.at;
            const chars = Math.floor(interpolate(f - l.at, [0, 18], [0, l.t.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
            return vis ? <div key={i} style={{fontFamily: MONO, fontSize: 34, color: '#E8E4DA', marginBottom: 18, display: 'flex', gap: 16, alignItems: 'center'}}>
              {l.hl && <span style={{background: C.yellow, color: C.ink, padding: '2px 14px', borderRadius: 8, fontWeight: 500}}>{l.hl}</span>}
              <span>{l.t.slice(0, chars)}</span>
            </div> : null;
          })}
        </div>
      </Pop>
    </Panel>
  );
};

const Advisor: React.FC = () => (
  <Panel top={330}>
    <Pop><div style={{background: C.ink, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 64, padding: '18px 40px', borderRadius: 18}}>yanında <span style={{color: C.yellow}}>danışman</span></div></Pop>
  </Panel>
);

const Weeks: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Panel top={170}>
      <Pop><div style={{background: C.ink, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 54, padding: '12px 34px', borderRadius: 16}}>her hafta <span style={{color: C.yellow}}>daha çok sen</span></div></Pop>
      {[1, 2, 3, 4].map((w, i) => {
        const p = appear(f, 8 + i * 8, 16) * (0.3 + i * 0.23);
        return (
          <div key={w} style={{display: 'flex', alignItems: 'center', gap: 26, width: 800}}>
            <span style={{fontFamily: MONO, fontSize: 30, width: 130, color: C.muted}}>{w}. hafta</span>
            <div style={{flex: 1, height: 34, background: '#E6DFD0', borderRadius: 17}}><div style={{height: 34, width: `${p * 100}%`, background: i === 3 ? C.ok : C.yellow, borderRadius: 17}} /></div>
          </div>
        );
      })}
    </Panel>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Panel top={150}>
      <div style={{display: 'flex', gap: 22}}>
        {[['omni', 'OmniRoute'], ['mem', 'claude-mem'], ['head', 'Headroom'], ['setup', 'Setup'], ['obs', 'Observer']].map(([k, n], i) => (
          <Pop key={k} at={i * 3}><div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}><ToolIcon k={k} size={112} /><span style={{fontFamily: SANS, fontSize: 24, fontWeight: 700}}>{n}</span></div></Pop>
        ))}
      </div>
      <Pop at={16}><div style={{transform: 'rotate(-5deg)', border: `8px solid ${C.ok}`, color: C.ok, fontFamily: SANS, fontWeight: 800, fontSize: 96, padding: '4px 40px', borderRadius: 20}}>ÜCRETSİZ</div></Pop>
      <Sequence from={sec(1.4)} layout="none">
        <Pop>
          <Card style={{width: 760, padding: '24px 30px', display: 'flex', gap: 26, alignItems: 'center'}}>
            <div style={{width: 110, height: 140, background: C.green, borderRadius: 12, display: 'flex', alignItems: 'flex-end', padding: 10}}><div style={{width: 40, height: 40, borderRadius: 20, background: C.orange}} /></div>
            <div><div style={{fontFamily: MONO, fontSize: 24, color: C.orange}}>ÜCRETSİZ PDF REHBER</div><div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, lineHeight: 1.1, marginTop: 8}}>Kurulumlar <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400}}>adım adım</span></div></div>
          </Card>
        </Pop>
      </Sequence>
      <Sequence from={sec(4.0)} layout="none">
        <Pop>
          <div style={{background: C.orange, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 52, padding: '18px 40px', borderRadius: 60, transform: `scale(${1 + 0.04 * Math.sin(f / 5)})`}}>Yorumlara <span style={{fontSize: 70}}>CLAUDE</span> yaz</div>
        </Pop>
      </Sequence>
    </Panel>
  );
};

// ---------- overlays on the avatar ----------
const SectionLabel: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center'}}>
    <Pop><div style={{background: C.ink, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 34, padding: '8px 22px', borderRadius: 10}}>{text}</div></Pop>
  </div>
);

type W = {t: string; s: number; e: number};
const words = WORDS as W[];
// group words into short caption chunks (break on punctuation, max 3 words)
const chunks: W[][] = [];
{
  let cur: W[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const end = /[.,;!?]$/.test(w.t) || cur.length === 3 || i === words.length - 1;
    if (end) { chunks.push(cur); cur = []; }
  });
}
const EMPH = new Set(['240', 'ücretsiz', 'OmniRoute', 'limit', 'claude-mem', 'unutkanlık', 'Headroom', 'süzüyor', 'aynı', 'Setup', 'hook', 'skill', 'danışman', 'Task', 'Observer', 'üç', 'sen', 'PDF', 'CLAUDE', 'Dün', 'bugüne']);
const clean = (t: string) => t.replace(/[.,;!?]$/, '');

const Captions: React.FC = () => {
  const t = useT();
  const f = useCurrentFrame();
  const ch = chunks.find((c, i) => t >= c[0].s - 0.05 && t < (chunks[i + 1]?.[0].s ?? c[c.length - 1].e + 0.6) - 0.05);
  if (!ch) return null;
  const startF = sec(ch[0].s);
  const s = interpolate(f - startF, [0, 5], [0.85, 1], {easing: IN, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 40, right: 40, bottom: 70, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 22px', transform: `scale(${s})`}}>
      {ch.map((w, i) => {
        const on = t >= w.s;
        const isEm = EMPH.has(clean(w.t)) || EMPH.has(clean(w.t).replace(/'.*$/, ''));
        return (
          <span key={i} style={{
            fontFamily: isEm ? SERIF : SANS, fontStyle: isEm ? 'italic' : 'normal', fontWeight: isEm ? 400 : 800,
            fontSize: isEm ? 92 : 78, color: isEm ? C.yellow : '#fff', opacity: on ? 1 : 0.55,
            WebkitTextStroke: isEm ? '2px #000' : '3px #000', paintOrder: 'stroke fill',
            textShadow: '0 4px 0 #000, 0 0 18px rgba(0,0,0,.35)',
          }}>{clean(w.t)}</span>
        );
      })}
    </div>
  );
};

// ---------- timeline ----------
type Scene = {from: number; to: number; el: React.ReactNode; label?: string};
const SCENES: Scene[] = [
  {from: 0, to: 6.2, el: <Speedo />},
  {from: 6.2, to: 10.3, el: <FiveTools />},
  {from: 10.3, to: 14.3, el: <TitleCard n="BİRİNCİSİ" name="OmniRoute" sub="açık kaynak · ücretsiz" icon="omni" shot="repo" />, label: '1 · OmniRoute'},
  {from: 14.3, to: 18.0, el: <Providers />, label: '1 · OmniRoute'},
  {from: 18.0, to: 21.45, el: <Fallback />, label: '1 · OmniRoute'},
  {from: 21.45, to: 24.05, el: <NoLimit />, label: '1 · OmniRoute'},
  {from: 24.05, to: 30.45, el: <Amnesia />, label: '2 · claude-mem'},
  {from: 30.45, to: 33.75, el: <DunBugun />, label: '2 · claude-mem'},
  {from: 33.75, to: 40.25, el: <Filter />, label: '3 · Headroom'},
  {from: 40.25, to: 41.7, el: <SameAnswer />, label: '3 · Headroom'},
  {from: 41.7, to: 46.0, el: <TitleCard n="DÖRDÜNCÜSÜ" name="Claude Code Setup" sub="Anthropic · resmi eklenti" icon="setup" shot="plugin" />, label: '4 · Claude Code Setup'},
  {from: 46.0, to: 50.45, el: <Terminal title="Senin projen için" lines={[{t: 'proje taranıyor…', at: 6}, {t: 'pre-commit test', at: sec(1.4), hl: 'hook'}, {t: 'reel-director', at: sec(2.6), hl: 'skill'}]} />, label: '4 · Claude Code Setup'},
  {from: 50.45, to: 52.15, el: <Advisor />, label: '4 · Claude Code Setup'},
  {from: 52.15, to: 59.4, el: <Terminal title="task-observer" lines={[{t: 'oturum izleniyor…', at: 6}, {t: 'aynı düzeltme  ×3', at: sec(2.3), hl: '!'}, {t: 'skill güncelleme önerisi', at: sec(4.4), hl: '→'}]} />, label: '5 · Task Observer'},
  {from: 59.4, to: 62.3, el: <Weeks />, label: '5 · Task Observer'},
  {from: 62.3, to: 69.5, el: <Outro />},
];
export const DURATION = sec(69.5);

const Avatar: React.FC<{src: string; focus: string}> = ({src, focus}) => {
  const f = useCurrentFrame();
  const isVideo = /\.(mp4|mov|webm)$/i.test(src);
  if (isVideo) return <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus}} />;
  // placeholder: still photo with a slow push-in
  const z = interpolate(f, [0, DURATION], [1.0, 1.06]);
  return <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${z})`, transformOrigin: '50% 40%'}} />;
};

const SPLIT = 900; // top: graphics, bottom: avatar

export const Reel: React.FC<{avatar: string; avatarFocus?: string}> = ({avatar, avatarFocus = '50% 62%'}) => (
  <AbsoluteFill style={{background: C.cream}}>
    {/* TOP: graphics panel */}
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: SPLIT, overflow: 'hidden', background: C.cream}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1100, transform: 'scale(0.82)', transformOrigin: '50% 0%'}}>
        {SCENES.map((s, i) => (
          <Sequence key={i} from={sec(s.from)} durationInFrames={sec(s.to) - sec(s.from)}>
            {s.el}
          </Sequence>
        ))}
      </div>
      {SCENES.map((s, i) => s.label && (SCENES[i - 1]?.label !== s.label) ? (
        <Sequence key={'l' + i} from={sec(s.from)} durationInFrames={sec(SCENES.filter(x => x.label === s.label).slice(-1)[0].to) - sec(s.from)}>
          <SectionLabel text={s.label} />
        </Sequence>
      ) : null)}
      <div style={{position: 'absolute', top: 40, left: 48, fontFamily: MONO, fontSize: 24, color: C.muted}}>@aiselxnursel</div>
    </div>
    {/* BOTTOM: avatar */}
    <div style={{position: 'absolute', left: 0, top: SPLIT, width: 1080, height: 1920 - SPLIT, overflow: 'hidden'}}>
      <Avatar src={avatar} focus={avatarFocus} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,.45) 100%)'}} />
      <Captions />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: SPLIT - 3, height: 6, background: C.ink, opacity: .9}} />
    <Audio src={staticFile('voice.mp3')} />
  </AbsoluteFill>
);
