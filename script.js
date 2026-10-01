/* Parallel - hero beats, cursor-following arrow field, compare interaction, form. */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const RM = matchMedia('(prefers-reduced-motion: reduce)');
function rng(seed){ let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

/* split text into masked words, numbered per beat so the stagger runs through the whole line */
$$('.beat').forEach(beat => {
  let i = 0;
  beat.querySelectorAll('.split').forEach(el => {
    const text = el.textContent.trim();
    const sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = text;
    const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    text.split(' ').forEach((wd, wi, arr) => {
      const m = document.createElement('span'); m.className = 'm';
      const w = document.createElement('span'); w.className = 'wi'; w.textContent = wd; w.style.setProperty('--i', i++);
      m.appendChild(w); vis.appendChild(m);
      if (wi < arr.length - 1) vis.appendChild(document.createTextNode(' '));
    });
    el.textContent = ''; el.append(sr, vis);
  });
});

/* ---------- signature: an arrow field that turns to follow the cursor ---------- */
const hero = $('.hero'), stage = $('#stage');
const cv = $('#arrows'), ctx = cv.getContext('2d');
const IDLE = -Math.PI / 4;
const A = { cells: [], sprite: null, dpr: 1, w: 0, h: 0, px: 0, py: 0, tx: 0, ty: 0, g: 0, tg: 0, raf: null, last: 0, visible: true };
function buildArrows(){
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  Object.assign(A, { dpr, w, h });
  const step = w < 720 ? 30 : 28, r = rng(77); const cells = [];
  const ox = (w % step) / 2 + step / 2, oy = (h % step) / 2 + step / 2;
  for (let y = oy; y < h; y += step) for (let x = ox; x < w; x += step) {
    cells.push({ x, y, a: IDLE, o: .34 + r() * .5, m: 1, mt: 1 });
  }
  A.cells = cells; computeMask(true);
  const s = document.createElement('canvas'); const sz = Math.round(12 * dpr); s.width = s.height = sz;
  const c = s.getContext('2d'); c.scale(dpr, dpr); c.strokeStyle = '#a9d0ff'; c.lineWidth = 1.5; c.lineCap = 'square';
  c.beginPath(); c.moveTo(2.5, 9.5); c.lineTo(9.5, 2.5); c.moveTo(4.5, 2.5); c.lineTo(9.5, 2.5); c.lineTo(9.5, 7.5); c.stroke();
  A.sprite = s;
  if (!A.tg) { A.px = A.tx = w / 2; A.py = A.ty = h * .42; }
  drawArrows();
}
function drawArrows(){
  const { dpr, sprite, px, py, g } = A; if (!sprite) return;
  const half = sprite.width / 2, R2 = 2 * 170 * 170;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
  for (const c of A.cells) {
    if (c.m < .01) continue;
    const dx = px - c.x, dy = py - c.y, d2 = dx * dx + dy * dy;
    const near = g * Math.exp(-d2 / R2);
    ctx.globalAlpha = Math.min(1, c.o * (1 - .35 * g) + near * .9) * c.m;
    const sc = 1 + near * .45, rot = c.a + Math.PI / 4;
    const cs = Math.cos(rot) * sc, sn = Math.sin(rot) * sc;
    ctx.setTransform(cs, sn, -sn, cs, c.x * dpr, c.y * dpr);
    ctx.drawImage(sprite, -half, -half);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
}
function arrowTick(now){
  const dt = Math.min(64, now - (A.last || now)); A.last = now;
  const inst = RM.matches;
  const kp = inst ? 1 : 1 - Math.pow(1 - .2, dt / 16.667);
  A.px += (A.tx - A.px) * kp; A.py += (A.ty - A.py) * kp; A.g += (A.tg - A.g) * (inst ? 1 : 1 - Math.pow(1 - .08, dt / 16.667));
  let moving = Math.abs(A.tx - A.px) > .3 || Math.abs(A.ty - A.py) > .3 || Math.abs(A.tg - A.g) > .004;
  const km = inst ? 1 : 1 - Math.pow(1 - .12, dt / 16.667);
  for (const c of A.cells) {
    if (Math.abs(c.mt - c.m) > .005) { c.m += (c.mt - c.m) * km; moving = true; } else c.m = c.mt;
    const want = A.tg > 0 ? Math.atan2(A.py - c.y, A.px - c.x) : IDLE;
    let diff = want - c.a; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    if (Math.abs(diff) > .002) {
      const dist = Math.hypot(A.px - c.x, A.py - c.y);
      const k = inst ? 1 : 1 - Math.pow(1 - .22 / (1 + dist / 520), dt / 16.667);
      c.a += diff * k; moving = true;
    } else c.a = want;
  }
  if (A.visible) drawArrows();
  if (moving && A.visible) A.raf = requestAnimationFrame(arrowTick); else { A.raf = null; A.last = 0; }
}
const beatsEl = $('.beats');
$$('.beat .sub, .beat .ln').forEach(el => { const t = document.createElement('span'); t.className = 'tx'; while (el.firstChild) t.appendChild(el.firstChild); el.appendChild(t); });
function contentRects(beat){
  const base = beatsEl.getBoundingClientRect(), cvr = cv.getBoundingClientRect();
  const ox = base.left - cvr.left, oy = base.top - cvr.top, out = [];
  beat.querySelectorAll('.pill, .m, .tx, .btn, .inds span').forEach(el => {
    let x = 0, y = 0, n = el;
    while (n && n !== beatsEl) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    if (!el.offsetWidth) return;
    out.push({ l: ox + x, t: oy + y, r: ox + x + el.offsetWidth, b: oy + y + el.offsetHeight });
  });
  ['.prog', '.hud', '.cue:not(.gone)'].forEach(sel => {
    const el = stage.querySelector(sel); if (!el || !el.offsetWidth) return;
    const q = el.getBoundingClientRect(); out.push({ l: q.left - cvr.left, t: q.top - cvr.top, r: q.right - cvr.left, b: q.bottom - cvr.top });
  });
  return out;
}
function computeMask(instant){
  const beat = document.querySelector('.beat.is-in') || document.querySelector('.beat.b1');
  if (!beat || !A.cells.length) return;
  const rects = contentRects(beat);
  const pad = A.w < 720 ? 12 : 18, feather = A.w < 720 ? 26 : 34;
  for (const c of A.cells) {
    let d = 1e9;
    for (const q of rects) {
      const dx = Math.max(q.l - c.x, 0, c.x - q.r), dy = Math.max(q.t - c.y, 0, c.y - q.b);
      const dd = dx * dx + dy * dy; if (dd < d) d = dd;
    }
    const t = clamp((Math.sqrt(d) - pad) / feather, 0, 1);
    c.mt = t * t * (3 - 2 * t);
    if (instant) c.m = c.mt;
  }
  if (instant) drawArrows(); else wakeArrows();
}
function wakeArrows(){ if (!A.raf && A.visible) A.raf = requestAnimationFrame(arrowTick); }
function pointAt(clientX, clientY){
  const r = cv.getBoundingClientRect();
  A.tx = clientX - r.left; A.ty = clientY - r.top; A.tg = 1;
  if (A.px === 0 && A.py === 0) { A.px = A.tx; A.py = A.ty; }
  wakeArrows();
}
addEventListener('pointermove', e => { if (A.visible) pointAt(e.clientX, e.clientY); }, { passive: true });
document.documentElement.addEventListener('pointerleave', () => { A.tg = 0; wakeArrows(); });
addEventListener('blur', () => { A.tg = 0; wakeArrows(); });
new IntersectionObserver(es => { A.visible = es[0].isIntersecting; if (A.visible) { drawArrows(); wakeArrows(); } }).observe(stage);
let resizeT = null;
addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { buildArrows(); layoutPills(); heroSync(true); }, 120); });

/* ---------- hero beats: one eased transition per beat, driven by scroll position ---------- */
const beats = $$('.beat'), ticks = $$('.prog i'), pIdx = $('#pIdx'), wkEl = $('#wk'), cue = $('.cue');
let cur = -1, sRaf = null;
function heroIndex(){
  const r = hero.getBoundingClientRect(); const range = r.height - innerHeight;
  if (range <= 0) return 0;
  const p = clamp(-r.top / range, 0, .9999);
  return Math.floor(p * beats.length);
}
function setBeat(i){
  if (i === cur) return;
  beats.forEach((b, j) => {
    b.classList.toggle('is-in', j === i);
    b.classList.toggle('is-above', j < i);
    if (j === i) { b.removeAttribute('inert'); b.removeAttribute('aria-hidden'); }
    else { b.setAttribute('inert', ''); b.setAttribute('aria-hidden', 'true'); }
  });
  ticks.forEach((t, j) => t.classList.toggle('on', j <= i));
  pIdx.textContent = String(i + 1).padStart(2, '0');
  wkEl.textContent = 'week ' + beats[i].dataset.wk;
  cue.classList.toggle('gone', i > 0);
  const first = cur === -1;
  cur = i;
  computeMask(first);
}
function heroSync(force){ if (force) cur = -1; setBeat(heroIndex()); }
function layoutPills(){
  const wrap = $('.b2 .inds'); const W = wrap.offsetWidth; const H = wrap.offsetHeight;
  wrap.querySelectorAll('span').forEach((p, i) => {
    p.style.setProperty('--i', i);
    p.style.setProperty('--dx', (W / 2 - (p.offsetLeft + p.offsetWidth / 2)) + 'px');
    p.style.setProperty('--dy', (H / 2 - (p.offsetTop + p.offsetHeight / 2)) + 'px');
  });
}
addEventListener('scroll', () => {
  if (sRaf) return;
  sRaf = requestAnimationFrame(() => { sRaf = null; setBeat(heroIndex()); navState(); });
}, { passive: true });

/* nav */
const nav = $('#nav'); let navSolid = null;
function navState(){ const s = hero.getBoundingClientRect().bottom < 80; if (s !== navSolid) { navSolid = s; nav.classList.toggle('solid', s); } }

/* reveals */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target; el.classList.add('in'); io.unobserve(el);
  setTimeout(() => el.classList.add('settled'), 1400);
  el.querySelectorAll('.count').forEach(countUp);
}), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
$$('.reveal').forEach(el => io.observe(el));
function fmt(el, v){ return el.dataset.dec ? v.toFixed(+el.dataset.dec) : String(Math.round(v)); }
function countUp(el){
  if (el.dataset.done) return; el.dataset.done = 1; const to = +el.dataset.to;
  if (RM.matches) { el.textContent = fmt(el, to); return; }
  const t0 = performance.now(), dur = 1500; let lastS = '';
  (function step(now){ const t = clamp((now - t0) / dur, 0, 1); const s = fmt(el, to * (1 - Math.pow(1 - t, 3))); if (s !== lastS) { lastS = s; el.textContent = s; } if (t < 1) requestAnimationFrame(step); })(t0);
}

/* industry card spotlight */
$$('.card').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));

/* the interactive moment: hold to run both lanes */
const holdBtn = $('#holdBtn'), holdMsg = $('#holdMsg'), holdLabel = $('#holdLabel');
const seqBars = $$('.lane.old .bar i'), parBars = $$('.lane.new .bar i'), clockOld = $('#clockOld'), clockNew = $('#clockNew');
let hp = 0, holding = false, holdRaf = null, holdLast = 0, holdDone = false, lastHp = -1;
function renderHold(){
  const v = Math.round(hp * 1000) / 1000; if (v === lastHp) return; lastHp = v;
  holdBtn.style.setProperty('--hp', v);
  const parF = clamp(v / .3, 0, 1);
  parBars.forEach((b, i) => b.style.setProperty('--f', clamp(parF * (1.06 - i * .015), 0, 1).toFixed(3)));
  seqBars.forEach((b, i) => b.style.setProperty('--f', clamp(v * 5 - i, 0, 1).toFixed(3)));
  clockNew.textContent = 'Week ' + Math.round(parF * 12) + (parF >= 1 ? ' / launched' : '');
  clockOld.textContent = 'Month ' + Math.round(v * 18) + (v >= 1 ? ' / launched' : '');
}
function finishHold(){
  holdDone = true; hp = 1; renderHold(); holdBtn.classList.add('done');
  holdLabel.textContent = 'Both finished'; holdMsg.textContent = 'Parallel launched 66 weeks sooner.'; holdMsg.classList.add('ok');
}
function holdTick(now){
  const dt = Math.min(100, now - (holdLast || now)); holdLast = now;
  if (holding) hp = Math.min(1, hp + dt / 2400); else hp = Math.max(0, hp - dt / 900 * (0.35 + hp));
  renderHold();
  if (holding && hp < 1 && hp > .02) holdMsg.textContent = hp < .3 ? 'Running both...' : 'Parallel is live. The usual way is still hiring.';
  if (hp >= 1) { holdRaf = null; holdLast = 0; finishHold(); return; }
  if (!holding && hp <= 0) { holdRaf = null; holdLast = 0; holdMsg.textContent = 'Ready.'; return; }
  holdRaf = requestAnimationFrame(holdTick);
}
function startHold(e){ if (holdDone) return; if (e && e.cancelable) e.preventDefault(); holding = true; if (!holdRaf) holdRaf = requestAnimationFrame(holdTick); }
function endHold(){ if (!holding) return; holding = false; if (!holdRaf && !holdDone) holdRaf = requestAnimationFrame(holdTick); }
holdBtn.addEventListener('pointerdown', e => { holdBtn.setPointerCapture && holdBtn.setPointerCapture(e.pointerId); startHold(e); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => holdBtn.addEventListener(t, endHold));
holdBtn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) startHold(e); });
holdBtn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') endHold(); });
holdBtn.addEventListener('contextmenu', e => e.preventDefault());
renderHold();

function pinToFinalStates(){
  if (holdRaf) { cancelAnimationFrame(holdRaf); holdRaf = null; }
  if (!holdDone) { holding = false; finishHold(); holdBtn.dataset.pinned = '1'; }
  $$('.count').forEach(el => { el.dataset.done = 1; el.textContent = fmt(el, +el.dataset.to); });
  $$('.reveal').forEach(el => el.classList.add('in', 'settled'));
}
function unpinFinalStates(){
  if (holdBtn.dataset.pinned) {
    delete holdBtn.dataset.pinned; holdDone = false; hp = 0; lastHp = -1; renderHold();
    holdBtn.classList.remove('done'); holdLabel.textContent = 'Hold to run both'; holdMsg.textContent = 'Ready.'; holdMsg.classList.remove('ok');
  }
}
RM.addEventListener('change', e => { if (e.matches) pinToFinalStates(); else unpinFinalStates(); });
if (RM.matches) pinToFinalStates();
buildArrows(); layoutPills(); navState();
requestAnimationFrame(() => requestAnimationFrame(() => heroSync(true)));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layoutPills(); computeMask(true); });

/* faq */
$$('.qa button').forEach(b => b.addEventListener('click', () => { const qa = b.parentElement; const open = !qa.classList.contains('open'); qa.classList.toggle('open', open); b.setAttribute('aria-expanded', open); }));

/* form (demo: success state only, nothing is sent) */
const form = $('#pitchForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  const bad = [...form.querySelectorAll('[required]')].find(f => !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value)));
  if (bad) { $('#formNote').textContent = 'Please add your ' + bad.previousElementSibling.textContent.toLowerCase() + '.'; bad.focus(); return; }
  $('.cta').classList.add('sent');
});

document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));
})();
