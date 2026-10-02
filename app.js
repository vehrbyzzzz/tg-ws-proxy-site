/* TG WS Proxy — сайт: появление секций, живое демо, тема, фон */

/* появление блоков при скролле */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* живые цифры в демо-макете */
const numEl = document.getElementById('mockNum');
const rowEl = document.getElementById('mockA');
let v = 21;

setInterval(() => {
  v = Math.max(17, Math.min(29, v + Math.round((Math.random() - 0.5) * 4)));
  numEl.textContent = v;
  rowEl.textContent = v;
}, 1600);

/* прогресс в демо заполняется один раз при появлении */
const mock = document.getElementById('mock');
const fill = document.getElementById('mockFill');
let filled = false;

const mockIO = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !filled) {
    filled = true;
    setTimeout(() => {
      fill.style.width = '100%';
      setTimeout(() => { fill.style.opacity = '0'; }, 2800);
    }, 600);
    mockIO.disconnect();
  }
}, { threshold: 0.4 });
mockIO.observe(mock);

/* ---------- переключатель темы ---------- */
(() => {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const meta = document.querySelector('meta[name="theme-color"]');
  const isLight = () => document.documentElement.dataset.theme === 'light';

  btn.addEventListener('click', () => {
    const next = isLight() ? 'dark' : 'light';
    if (next === 'light') {
      document.documentElement.dataset.theme = 'light';
    } else {
      delete document.documentElement.dataset.theme;
    }
    try { localStorage.setItem('tgws-theme', next); } catch (e) {}
    if (meta) meta.setAttribute('content', next === 'light' ? '#fafafa' : '#000000');
    window.dispatchEvent(new CustomEvent('themechange'));
  });
})();

/* ---------- service worker ---------- */
(() => {
  const swPath = document.documentElement.dataset.sw;
  if (!swPath || !('serviceWorker' in navigator)) return;
  addEventListener('load', () => {
    navigator.serviceWorker.register(swPath).catch(() => {});
  });
})();

/* ---------- живой лог подключения в демо ---------- */
(() => {
  const logEl = document.getElementById('mockLog');
  if (!logEl) return;

  const ru = (document.documentElement.lang || 'ru') === 'ru';
  const LINES = ru ? [
    ['ws', 'CONNECT de-1.tgws.net:443 — TLS handshake OK'],
    ['ws', 'GET /tunnel → 101 Switching Protocols'],
    ['ok', 'туннель установлен · RTT 21 ms'],
    ['ws', 'keep-alive ping → pong 18 ms'],
    ['ok', 'MTProto-трафик Telegram идёт через туннель'],
    ['ws', 'замер узлов: nl-2 33ms · fi-3 14ms · se-4 47ms'],
  ] : [
    ['ws', 'CONNECT de-1.tgws.net:443 — TLS handshake OK'],
    ['ws', 'GET /tunnel → 101 Switching Protocols'],
    ['ok', 'tunnel established · RTT 21 ms'],
    ['ws', 'keep-alive ping → pong 18 ms'],
    ['ok', 'Telegram MTProto traffic goes through the tunnel'],
    ['ws', 'node check: nl-2 33ms · fi-3 14ms · se-4 47ms'],
  ];

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    logEl.innerHTML = '<i class="ok">[ok]</i><span>' + (ru ? 'туннель установлен · RTT 21 ms' : 'tunnel established · RTT 21 ms') + '</span>';
    return;
  }

  let n = 0;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function cycle() {
    const [tag, text] = LINES[n++ % LINES.length];
    logEl.innerHTML = '';
    const tagEl = document.createElement('i');
    tagEl.className = tag;
    tagEl.textContent = '[' + tag + ']';
    const txtEl = document.createElement('span');
    logEl.append(tagEl, txtEl);
    for (const ch of text) {
      txtEl.textContent += ch;
      await wait(15);
    }
    await wait(2100);
    cycle();
  }

  cycle();
})();

/* ---------- фон: живая сеть ---------- */
(() => {
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const N = 44;
  const LINK = 150;
  let w, h, dpr, nodes, raf = null;

  let dark = document.documentElement.dataset.theme !== 'light';
  addEventListener('themechange', () => {
    dark = document.documentElement.dataset.theme !== 'light';
  });

  function init() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    nodes = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22 * dpr,
      vy: (Math.random() - 0.5) * 0.22 * dpr,
      r: (Math.random() * 1.1 + 0.5) * dpr,
    }));
  }

  function tick() {
    const lineRGB = dark ? '255,255,255' : '0,0,0';
    ctx.clearRect(0, 0, w, h);
    for (const p of nodes) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const max = LINK * dpr;
        if (d < max) {
          ctx.strokeStyle = 'rgba(' + lineRGB + ',' + (0.075 * (1 - d / max)).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = dark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.42)';
    for (const p of nodes) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  init();
  tick();
  addEventListener('resize', init);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = null;
    } else if (!raf) {
      tick();
    }
  });
})();

/* ---------- мобильная кнопка скачивания ---------- */
(() => {
  const cta = document.getElementById('mobileCta');
  const dl = document.getElementById('download');
  if (!cta || !dl) return;
  const io = new IntersectionObserver((entries) => {
    cta.classList.toggle('visible', !entries[0].isIntersecting);
  }, { threshold: 0.05 });
  io.observe(dl);
})();

/* ---------- кнопка «Поделиться» ---------- */
(() => {
  const btn = document.getElementById('shareBtn');
  if (!btn) return;
  const data = {
    title: 'TG WS Proxy',
    text: document.documentElement.lang === 'ru'
      ? 'Telegram через WebSocket-туннель — в один клик'
      : 'Telegram over a WebSocket tunnel — one click',
    url: location.origin + location.pathname.replace(/(index\.html)?$/, ''),
  };
  btn.addEventListener('click', async () => {
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(data.url);
      const old = btn.textContent;
      btn.textContent = document.documentElement.lang === 'ru' ? 'Ссылка скопирована' : 'Link copied';
      setTimeout(() => { btn.textContent = old; }, 1800);
    } catch (e) {}
  });
})();
