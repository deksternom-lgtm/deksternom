// ═══════════════════════════════════════════════════════════════
//  ИграСвет v5 — Общий модуль
// ═══════════════════════════════════════════════════════════════

// ── ТЕМЫ ────────────────────────────────────────────────────────
function initTheme() {
  const t = localStorage.getItem('igrasvet_theme') || 'classic';
  document.documentElement.setAttribute('data-theme', t);
  updateThemeBtn();
}

function toggleTheme() {
  const cur  = document.documentElement.getAttribute('data-theme') || 'classic';
  const next = cur === 'neon' ? 'classic' : 'neon';
  // Плавный переход только при смене темы, не при каждом взаимодействии
  document.body.classList.add('theme-transitioning');
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('igrasvet_theme', next);
  updateThemeBtn();
  setTimeout(() => document.body.classList.remove('theme-transitioning'), 300);
}

function updateThemeBtn() {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  const isNeon = document.documentElement.getAttribute('data-theme') === 'neon';
  btn.textContent = isNeon ? '☀️ Классик' : '🌃 Неон';
}

// ── МОБИЛЬНАЯ НАВИГАЦИЯ ──────────────────────────────────────────
function toggleMobileNav() {
  const wrapper = document.getElementById('nav-wrapper');
  if (!wrapper) return;
  wrapper.classList.toggle('nav-mobile-open');
  const btn = wrapper.querySelector('.nav-hamburger');
  if (btn) btn.textContent = wrapper.classList.contains('nav-mobile-open') ? '✕' : '☰';
}

// ── AUTH UI ──────────────────────────────────────────────────────

function renderAuthNav() {
  const slot = document.getElementById('auth-nav-slot');
  if (!slot) return;
  const user = DB.currentUser();
  if (!user) {
    slot.innerHTML = `<a href="auth.html" class="auth-nav-btn login-btn">Войти</a>`;
    return;
  }
  const roleLabel = DB.roleLabel(user.role);
  const adminLink = DB.isModerator() ? `<a href="admin.html" class="auth-nav-link">⚙ Панель</a>` : '';
  slot.innerHTML = `
    ${adminLink}
    <div class="auth-user-chip" id="user-chip-btn" onclick="toggleUserMenu()" title="${esc(user.displayName)} · ${roleLabel}">
      <span class="auth-user-avatar">${user.displayName[0].toUpperCase()}</span>
      <span class="auth-user-name">${esc(user.displayName)}</span>
    </div>
    <div class="user-dropdown" id="user-dropdown" style="display:none">
      <div class="user-dropdown-header">
        <div class="ud-name">${esc(user.displayName)}</div>
        <div class="ud-role">${roleLabel}</div>
      </div>
      <a href="games.html?personal=1" class="ud-link">📚 Моя библиотека</a>
      <div class="ud-divider"></div>
      <button class="ud-logout" onclick="doLogout()">Выйти</button>
    </div>`;
}

function toggleUserMenu() {
  const dd = document.getElementById('user-dropdown');
  if (!dd) return;
  dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', (e) => {
  const dd = document.getElementById('user-dropdown');
  const btn = document.getElementById('user-chip-btn');
  if (dd && btn && !btn.contains(e.target)) dd.style.display = 'none';
});

function doLogout() {
  DB.logout();
  location.href = 'index.html';
}

function requireLogin(redirect = 'auth.html') {
  if (!DB.isLoggedIn()) { location.href = redirect; return false; }
  return true;
}
function requireModerator(redirect = 'index.html') {
  if (!DB.isModerator()) { alert('Нет доступа.'); location.href = redirect; return false; }
  return true;
}

// ── SCROLL REVEAL ────────────────────────────────────────────────
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  renderAuthNav();
});

// ── ЖАНРЫ ───────────────────────────────────────────────────────
const GENRE_ICONS = {
  'экшен':'💥','action':'💥','ролевая':'⚔️','rpg':'⚔️',
  'стратегия':'🏰','strategy':'🏰','головоломка':'🧩','puzzle':'🧩',
  'аркада':'🕹','гонки':'🏎','racing':'🏎','спорт':'⚽','sports':'⚽',
  'ужасы':'👻','horror':'👻','приключения':'🌍','adventure':'🌍',
  'симулятор':'🛠','платформер':'🪙','шутер':'🔫',
  'песочница':'🏖','выживание':'🏕','файтинг':'🥊','музыка':'🎵',
};
function getGenreIcon(genre) {
  if (!genre) return '🎮';
  const low = genre.toLowerCase();
  for (const [k,v] of Object.entries(GENRE_ICONS)) { if (low.includes(k)) return v; }
  return '🎮';
}
const ALL_GENRES = [
  'Экшен','Ролевая игра','Стратегия','Головоломка','Аркада',
  'Гонки','Спорт','Ужасы','Приключения','Симулятор',
  'Платформер','Шутер','Песочница','Выживание','Файтинг',
];

// ── ВСТРОЕННЫЕ ИГРЫ ──────────────────────────────────────────────
const BUILTIN_GAMES = {
  'minecraft': {
    name:'Minecraft', genre:'Песочница / Выживание', year:'2011',
    platform:'ПК, PlayStation, Xbox, Nintendo Switch, смартфоны',
    summary:'Minecraft — это игра, в которой весь мир состоит из кубиков. Вы можете строить что угодно: от домика до огромного замка.',
    gameplay:'Вы ходите по большому миру, собираете материалы и строите из них всё что захотите. Ночью появляются враги.',
    audience:'Подходит детям, подросткам и взрослым. Особенно понравится тем, кто любит строить и исследовать.',
    why:'Одна из самых известных игр в мире — более 238 миллионов игроков.',
  },
  'gta 5': {
    name:'GTA 5', genre:'Экшен / Приключения', year:'2013',
    platform:'ПК, PlayStation 3/4/5, Xbox 360/One/Series',
    summary:'GTA 5 — игра про большой открытый город. Вы можете делать практически всё: ездить на машинах, выполнять задания.',
    gameplay:'Вы следуете за тремя героями, которые готовят крупные ограбления. Весь город открыт для исследования.',
    audience:'Для взрослых и подростков старше 18 лет.',
    why:'Одна из самых продаваемых игр в истории с живым и разнообразным миром.',
  },
  'the witcher 3': {
    name:'The Witcher 3: Wild Hunt', genre:'Ролевая игра / Приключения', year:'2015',
    platform:'ПК, PlayStation 4/5, Xbox One/Series, Nintendo Switch',
    summary:'The Witcher 3 — большая ролевая игра. Вы играете за Геральта — охотника на чудовищ.',
    gameplay:'Путешествуете по живому миру, берёте задания, сражаетесь с чудовищами. Ваш выбор влияет на концовку.',
    audience:'Для взрослых и старших подростков, любящих глубокие истории.',
    why:'Более 800 наград. Считается одной из лучших игр всех времён.',
  },
  'tetris': {
    name:'Тетрис', genre:'Головоломка / Аркада', year:'1984',
    platform:'Все платформы',
    summary:'Тетрис — классическая головоломка, где нужно укладывать падающие фигурки без пустых мест.',
    gameplay:'Фигурки падают сверху, вы поворачиваете их. Заполненная линия исчезает.',
    audience:'Абсолютно всем — детям, взрослым и пожилым.',
    why:'Самая продаваемая игра в истории — более 520 миллионов копий.',
  },
};

// ── AI ПРОМПТ ───────────────────────────────────────────────────
function buildAIPrompt(gameName) {
  return `Расскажи об игре "${gameName}" простым языком для людей, которые почти не играют. 
Ответь строго в JSON без markdown:
{"name":"название","genre":"жанр","year":"год","platform":"платформы","summary":"описание 2-3 предл","gameplay":"геймплей 2-3 предл","audience":"кому подойдёт","why":"почему стоит попробовать"}`;
}
function buildParsePrompt(text, gameName) {
  return `Из текста извлеки информацию об игре "${gameName}", верни JSON без markdown:
{"name":"","genre":"","year":"","platform":"","summary":"","gameplay":"","audience":"","why":""}
Текст: ${text.substring(0,3000)}`;
}

// ── УТИЛИТЫ ─────────────────────────────────────────────────────
function el(id) { return document.getElementById(id); }
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function typeText(el, text, speed = 18) {
  if (!el) return Promise.resolve();
  el.textContent = '';
  el.classList.add('typing');
  return new Promise(resolve => {
    let i = 0;
    const t = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(t); el.classList.remove('typing'); resolve(); }
    }, speed);
  });
}

function renderStars(container, currentRating, onRate) {
  if (!container) return;
  container.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.className = 'star-btn';
    btn.textContent = i <= currentRating ? '★' : '☆';
    btn.style.color = i <= currentRating ? '#f59e0b' : 'var(--border)';
    btn.addEventListener('mouseenter', () => {
      container.querySelectorAll('.star-btn').forEach((b,idx) => {
        b.textContent = idx < i ? '★' : '☆'; b.style.color = idx < i ? '#f59e0b' : 'var(--border)';
      });
    });
    btn.addEventListener('mouseleave', () => {
      container.querySelectorAll('.star-btn').forEach((b,idx) => {
        const r = Math.round(currentRating||0);
        b.textContent = idx < r ? '★' : '☆'; b.style.color = idx < r ? '#f59e0b' : 'var(--border)';
      });
    });
    btn.addEventListener('click', () => { currentRating = i; onRate(i); renderStars(container, i, onRate); });
    container.appendChild(btn);
  }
}

// ── TOAST ────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  let wrap = document.getElementById('toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toast-wrap';
    wrap.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  const colors = { info:'#3b82f6', success:'#22c55e', error:'#ef4444', warn:'#f59e0b' };
  t.style.cssText = `background:var(--surface);border:1px solid ${colors[type]||colors.info};color:var(--text);padding:12px 18px;border-radius:8px;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.2);animation:toastIn .3s ease;max-width:300px;pointer-events:auto;`;
  t.textContent = msg;
  wrap.appendChild(t);
  if (!document.getElementById('toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}';
    document.head.appendChild(s);
  }
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); }, 3000);
}
