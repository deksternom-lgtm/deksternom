// ═══════════════════════════════════════════════════════════════
//  ИграСвет v5 — База данных (localStorage)
//  Пользователи, роли, очередь одобрения, личная библиотека
// ═══════════════════════════════════════════════════════════════

const DB = (() => {
  const K = {
    GAMES:    'igrasvet5_games',
    USERS:    'igrasvet5_users',
    SESSION:  'igrasvet5_session',
    MESSAGES: 'igrasvet5_messages',
    COMMENTS: 'igrasvet5_comments',
  };

  // ── УТИЛИТЫ ─────────────────────────────────────────────────

  function _load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  }
  function _loadObj(key, def = {}) {
    try { return JSON.parse(localStorage.getItem(key)) || def; }
    catch { return def; }
  }
  function _save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; }
    catch(e) { console.warn('DB save error:', e); return false; }
  }

  // Простой хэш (не для продакшена, но для демо)
  function hashPwd(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8,'0');
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  }

  // ── ИНИЦИАЛИЗАЦИЯ ────────────────────────────────────────────

  function init() {
    const users = _load(K.USERS);
    if (!users.find(u => u.role === 'superadmin')) {
      users.push({
        id: 'sa_001',
        username: 'admin',
        passwordHash: hashPwd('admin123'),
        role: 'superadmin',
        displayName: 'Главный администратор',
        createdAt: Date.now(),
        grantedBy: null,
      });
      _save(K.USERS, users);
    }

    // Seed-игры (добавляются один раз при первом запуске)
    const games = _load(K.GAMES);
    if (!games.find(g => g.id === 'seed_001')) {
      const SEED_GAMES = [
        {
          id: 'seed_001',
          name: 'Minecraft',
          genre: 'песочница',
          year: '2011',
          platform: 'ПК, PS4, Xbox, Nintendo Switch, Android, iOS',
          summary: 'Игра-песочница, где игрок попадает в мир из кубиков и может строить что угодно: дома, замки, целые города. Ничего нельзя сломать навсегда — всё можно восстановить.',
          gameplay: 'Добываешь ресурсы (дерево, камень, руды), строишь инструменты и жильё, исследуешь мир, сражаешься с монстрами ночью. В режиме «Творчество» — просто строишь без угроз.',
          audience: 'Подходит всем от 7 лет. Особенно нравится тем, кто любит строить и экспериментировать.',
          why: 'Полная свобода действий. Каждый находит своё: кто-то строит, кто-то выживает, кто-то изучает механики. Тысячи модов расширяют игру до бесконечности.',
          rating: 5,
          playUrl: 'https://classic.minecraft.net/',
          status: 'approved',
          addedAt: Date.now() - 9000000,
          autoAdded: true,
          screenshots: [],
        },
        {
          id: 'seed_002',
          name: '2048',
          genre: 'головоломка',
          year: '2014',
          platform: 'Браузер, Android, iOS',
          summary: 'Простая числовая головоломка — сдвигаешь плитки с числами, одинаковые сливаются и удваиваются. Цель — получить плитку 2048.',
          gameplay: 'Стрелками двигаешь все плитки в одну сторону. Совпавшие числа складываются: 2+2=4, 4+4=8 и так далее. Игра заканчивается, когда поле заполнено.',
          audience: 'Для всех, кто любит логические игры. Очень удобна для коротких перерывов.',
          why: 'Затягивает мгновенно. Простые правила, но сложная стратегия. Отличный тренажёр для мозга.',
          rating: 4,
          playUrl: 'https://play2048.co/',
          status: 'approved',
          addedAt: Date.now() - 8000000,
          autoAdded: true,
          screenshots: [],
        },
        {
          id: 'seed_003',
          name: 'Tetris',
          genre: 'аркада',
          year: '1984',
          platform: 'Браузер, iOS, Android, ПК, консоли',
          summary: 'Легендарная игра-головоломка: сверху падают фигурки из четырёх квадратов, нужно укладывать их так, чтобы заполнять горизонтальные линии.',
          gameplay: 'Управляешь падающими фигурками (тетромино): двигаешь влево-вправо, вращаешь, ускоряешь падение. Заполненные линии исчезают. Если стопка дорастёт до верха — проигрыш.',
          audience: 'Для всех возрастов. Классика, которую знают даже те, кто не играет в игры.',
          why: 'Один из самых продаваемых игровых проектов в истории. Отличная концентрация и реакция требуются на высоких уровнях.',
          rating: 5,
          playUrl: 'https://tetris.com/play-tetris',
          status: 'approved',
          addedAt: Date.now() - 7500000,
          autoAdded: true,
          screenshots: [],
        },
        {
          id: 'seed_004',
          name: 'Pac-Man',
          genre: 'аркада',
          year: '1980',
          platform: 'Браузер, аркадные автоматы, ПК, консоли',
          summary: 'Классическая аркада: управляешь жёлтым шариком, который ест точки в лабиринте и убегает от привидений.',
          gameplay: 'Двигаешься по лабиринту, собираешь все точки. Четыре привидения тебя преследуют. Особые большие точки позволяют на время самому охотиться на привидений.',
          audience: 'Для всех. Один из самых узнаваемых персонажей в истории видеоигр.',
          why: 'Простые правила — бесконечный азарт. Каждая попытка немного отличается из-за поведения привидений.',
          rating: 4,
          playUrl: 'https://freepacman.org/',
          status: 'approved',
          addedAt: Date.now() - 7000000,
          autoAdded: true,
          screenshots: [],
        },
        {
          id: 'seed_005',
          name: 'Snake',
          genre: 'аркада',
          year: '1998',
          platform: 'Браузер, мобильные',
          summary: 'Классическая игра «Змейка»: ведёшь растущую змею, которая должна есть еду и не врезаться в стены и собственный хвост.',
          gameplay: 'Управляешь направлением движения змейки. Каждая съеденная точка делает змею длиннее. Чем длиннее змея — тем сложнее не столкнуться.',
          audience: 'Для всех. Особенно ностальгирующие по Nokia 3310.',
          why: 'Абсолютная классика мобильных игр. Мгновенно понятна, никогда не надоедает.',
          rating: 4,
          playUrl: 'https://playsnake.org/',
          status: 'approved',
          addedAt: Date.now() - 6500000,
          autoAdded: true,
          screenshots: [],
        },
        {
          id: 'seed_006',
          name: 'Among Us',
          genre: 'стратегия',
          year: '2018',
          platform: 'ПК, Android, iOS, Nintendo Switch',
          summary: 'Многопользовательская игра на обман и дедукцию. Часть игроков — предатели (самозванцы), которые тайно убивают членов экипажа. Остальные пытаются вычислить предателей.',
          gameplay: 'Выполняешь задания на космическом корабле или голосуешь на собраниях за подозреваемых. Если ты самозванец — совершаешь убийства и не попадайся.',
          audience: 'Для компании от 4 до 15 человек. Лучше всего с голосовым чатом.',
          why: 'Создаёт невероятное напряжение и смех в компании. Каждая игра — уникальная детективная история.',
          rating: 4,
          status: 'approved',
          addedAt: Date.now() - 6000000,
          autoAdded: true,
          screenshots: [],
        },
        {
          id: 'seed_007',
          name: 'Stardew Valley',
          genre: 'ролевая',
          year: '2016',
          platform: 'ПК, PS4, Xbox One, Nintendo Switch, iOS, Android',
          summary: 'Фермерская ролевая игра: бросаешь работу в офисе, уезжаешь на дедушкину ферму и начинаешь жить в деревне — выращиваешь овощи, дружишь с жителями, исследуешь пещеры.',
          gameplay: 'Каждый день управляешь фермой: поливаешь грядки, кормишь животных, рыбачишь. Общаешься с жителями деревни, строишь отношения, можно даже жениться.',
          audience: 'Для тех, кто устал от стресса и хочет что-то расслабляющее. Очень популярна среди тех, кто не считает себя «геймером».',
          why: 'Создана одним человеком за 4 года. Одна из самых тёплых и умиротворяющих игр. Без дедлайнов — играешь в своём темпе.',
          rating: 5,
          status: 'approved',
          addedAt: Date.now() - 5500000,
          autoAdded: true,
          screenshots: [],
        },
        {
          id: 'seed_008',
          name: 'Portal',
          genre: 'головоломка',
          year: '2007',
          platform: 'ПК, PS3, Xbox 360',
          summary: 'Научно-фантастическая головоломка от первого лица. Тебе дают пистолет, который создаёт порталы — входишь в один, выходишь из другого. Нужно решать физические головоломки.',
          gameplay: 'Стреляешь двумя порталами в поверхности. Используешь физику (скорость, гравитацию) для прохождения уровней. Злобный ИИ GLaDOS комментирует твои действия.',
          audience: 'Для любителей логики и оригинальных идей. Отлично подходит тем, кто не играл в шутеры — здесь нет насилия.',
          why: 'Революционная идея с порталами. Гениальный юмор GLaDOS. Один из лучших дебютов в истории игровой индустрии.',
          rating: 5,
          status: 'approved',
          addedAt: Date.now() - 5000000,
          autoAdded: true,
          screenshots: [],
        },
        {
          id: 'seed_009',
          name: 'Geometry Dash',
          genre: 'аркада',
          year: '2013',
          platform: 'ПК, Android, iOS',
          summary: 'Ритмичная игра-платформер: твой кубик автоматически движется вперёд, нужно вовремя нажимать, чтобы прыгать через препятствия. Уровни синхронизированы с музыкой.',
          gameplay: 'Нажимаешь один раз — прыгаешь. Всё остальное происходит само. Препятствия расставлены в ритм музыке, поэтому надо чувствовать темп.',
          audience: 'Для любителей ритм-игр и сложных испытаний. Некоторые уровни созданы игроками и поражают сложностью.',
          why: 'Безумно затягивающая, даже несмотря на сотни смертей на одном уровне. Редактор уровней позволяет создавать свои шедевры.',
          rating: 4,
          status: 'approved',
          addedAt: Date.now() - 4500000,
          autoAdded: true,
          screenshots: [],
        },
        {
          id: 'seed_010',
          name: 'The Witcher 3: Wild Hunt',
          genre: 'ролевая',
          year: '2015',
          platform: 'ПК, PS4, PS5, Xbox One, Xbox Series, Nintendo Switch',
          summary: 'Огромная ролевая игра в мире тёмного фэнтези. Играешь за Геральта — охотника на монстров, который ищет свою приёмную дочь среди войны и политических интриг.',
          gameplay: 'Путешествуешь по открытому миру, берёшь задания, убиваешь монстров, принимаешь важные решения в диалогах. Каждый выбор влияет на концовку.',
          audience: 'Для взрослых игроков, которые любят глубокие истории. Одна из лучших ролевых игр всех времён по мнению критиков.',
          why: 'Невероятно проработанный мир, живые персонажи, моральные дилеммы без правильного ответа. Более 200 часов контента.',
          rating: 5,
          status: 'approved',
          addedAt: Date.now() - 4000000,
          autoAdded: true,
          screenshots: [],
        },
        {
          id: 'seed_011',
          name: 'Hollow Knight',
          genre: 'приключения',
          year: '2017',
          platform: 'ПК, PS4, Xbox One, Nintendo Switch',
          summary: 'Атмосферная игра о маленьком рыцаре-жучке, который исследует огромное подземное королевство насекомых. Мрачная, красивая и сложная.',
          gameplay: 'Бегаешь, прыгаешь и сражаешься с противниками гвоздём. Открываешь новые способности, которые позволяют попасть в закрытые ранее места. Огромный мир без карты поначалу.',
          audience: 'Для любителей сложных игр с исследованием. Не рекомендуется тем, кто быстро расстраивается от проигрышей.',
          why: 'Создан небольшой командой, но выглядит и играется как AAA-проект. Один из лучших инди-проектов десятилетия.',
          rating: 5,
          status: 'approved',
          addedAt: Date.now() - 3500000,
          autoAdded: true,
          screenshots: [],
        },
        {
          id: 'seed_012',
          name: 'Cyberpunk 2077',
          genre: 'ролевая',
          year: '2020',
          platform: 'ПК, PS4, PS5, Xbox One, Xbox Series',
          summary: 'Ролевой экшен в огромном городе будущего — Найт-Сити. Играешь за наёмника V, который ввязался в дело, изменившее его жизнь навсегда.',
          gameplay: 'Открытый мир с десятками историй и заданий. Можно взламывать системы, стрелять, использовать кибернетические имплантаты. Много ролевых решений.',
          audience: 'Для взрослых фанатов научной фантастики и открытых миров. После патчей стала одной из лучших RPG.',
          why: 'Невероятная атмосфера киберпанка, запоминающиеся персонажи. Дополнение Phantom Liberty считается шедевром.',
          rating: 4,
          status: 'approved',
          addedAt: Date.now() - 3000000,
          autoAdded: true,
          screenshots: [],
        },
      ];
      const existingGames = _load(K.GAMES);
      _save(K.GAMES, [...existingGames, ...SEED_GAMES]);
    }
  }

  // ── ПОЛЬЗОВАТЕЛИ ─────────────────────────────────────────────

  const ROLE_ORDER = { superadmin: 4, admin: 3, moderator: 2, user: 1 };
  const ROLE_LABELS = {
    superadmin: '👑 Суперадмин',
    admin:      '🛡 Администратор',
    moderator:  '⚡ Модератор',
    user:       '👤 Пользователь',
  };

  function getAllUsers() { return _load(K.USERS); }

  function getUserById(id) {
    return _load(K.USERS).find(u => u.id === id) || null;
  }

  function getUserByName(username) {
    return _load(K.USERS).find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  function register(username, password, displayName, email) {
    const users = _load(K.USERS);
    if (!username || username.length < 3) return { ok: false, error: 'Имя пользователя — минимум 3 символа' };
    if (!password || password.length < 4)  return { ok: false, error: 'Пароль — минимум 4 символа' };
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
      return { ok: false, error: 'Такой пользователь уже существует' };
    const user = {
      id: uid(), username, displayName: displayName || username,
      passwordHash: hashPwd(password),
      email: email || '',
      role: 'user', grantedBy: null, createdAt: Date.now(),
    };
    users.push(user);
    _save(K.USERS, users);
    return { ok: true, user };
  }

  function login(username, password) {
    const user = getUserByName(username);
    if (!user) return { ok: false, error: 'Пользователь не найден' };
    if (user.passwordHash !== hashPwd(password)) return { ok: false, error: 'Неверный пароль' };
    const session = { userId: user.id, loginAt: Date.now() };
    _save(K.SESSION, session);
    return { ok: true, user };
  }

  function logout() { localStorage.removeItem(K.SESSION); }

  function currentUser() {
    const session = _loadObj(K.SESSION, null);
    if (!session) return null;
    return getUserById(session.userId);
  }

  function isLoggedIn()   { return !!currentUser(); }
  function isModerator()  { const u = currentUser(); return u && ROLE_ORDER[u.role] >= 2; }
  function isAdmin()      { const u = currentUser(); return u && ROLE_ORDER[u.role] >= 3; }
  function isSuperAdmin() { const u = currentUser(); return u && u.role === 'superadmin'; }

  /**
   * Выдача/изъятие роли.
   * Правила: superadmin выдаёт admin/moderator/user
   *          admin выдаёт moderator/user
   *          (никто не может выдать роль выше своей)
   */
  function setRole(targetUserId, newRole) {
    const me = currentUser();
    if (!me) return { ok: false, error: 'Нет сессии' };
    if (!ROLE_ORDER[newRole]) return { ok: false, error: 'Неверная роль' };
    if (ROLE_ORDER[newRole] >= ROLE_ORDER[me.role]) return { ok: false, error: 'Нельзя выдать роль выше своей' };
    const users = _load(K.USERS);
    const idx = users.findIndex(u => u.id === targetUserId);
    if (idx < 0) return { ok: false, error: 'Пользователь не найден' };
    const target = users[idx];
    if (ROLE_ORDER[target.role] >= ROLE_ORDER[me.role]) return { ok: false, error: 'Нельзя изменить роль равного или вышестоящего' };
    users[idx].role = newRole;
    users[idx].grantedBy = me.id;
    users[idx].grantedAt = Date.now();
    _save(K.USERS, users);
    return { ok: true };
  }

  function deleteUser(targetUserId) {
    const me = currentUser();
    if (!isAdmin()) return false;
    const users = _load(K.USERS);
    const target = users.find(u => u.id === targetUserId);
    if (!target || ROLE_ORDER[target.role] >= ROLE_ORDER[me.role]) return false;
    _save(K.USERS, users.filter(u => u.id !== targetUserId));
    return true;
  }

  function roleLabel(role) { return ROLE_LABELS[role] || role; }

  // ── ИГРЫ ─────────────────────────────────────────────────────

  function getAllGames() { return _load(K.GAMES); }

  /**
   * Публичные игры (approved) + личные текущего пользователя
   */
  function getVisibleGames() {
    const me = currentUser();
    const all = _load(K.GAMES);
    return all.filter(g => {
      if (g.status === 'approved') return true;
      if (g.status === 'personal' && me && g.ownerId === me.id) return true;
      return false;
    });
  }

  /**
   * Добавить игру.
   * @param {object} game
   * @param {boolean} personal - если true, личная библиотека (не требует одобрения)
   */
  function addGame(game, personal = false) {
    const me = currentUser();
    const games = _load(K.GAMES);
    const isPrivileged = isModerator();

    // Определяем статус
    let status;
    if (personal)         status = 'personal';
    else if (isPrivileged) status = 'approved';
    else                  status = 'pending';

    const idx = games.findIndex(g =>
      g.name.toLowerCase() === (game.name||'').toLowerCase() &&
      (g.status !== 'personal' || (me && g.ownerId === me.id))
    );

    const entry = {
      screenshots: [], rating: 0, userNotes: '',
      ...game,
      id:        idx >= 0 ? games[idx].id : uid(),
      status,
      ownerId:   me ? me.id : null,
      addedBy:   me ? me.username : 'anonymous',
      addedAt:   idx >= 0 ? games[idx].addedAt : Date.now(),
      updatedAt: Date.now(),
      approvedBy: isPrivileged ? me?.id : null,
      approvedAt: isPrivileged ? Date.now() : null,
    };

    if (idx >= 0) {
      entry.screenshots = games[idx].screenshots || [];
      entry.rating      = games[idx].rating      || 0;
      entry.userNotes   = games[idx].userNotes   || '';
      games[idx] = entry;
    } else {
      games.push(entry);
    }
    return _save(K.GAMES, games) ? entry : null;
  }

  function approveGame(gameId) {
    const me = currentUser();
    if (!isModerator()) return false;
    const games = _load(K.GAMES);
    const idx = games.findIndex(g => g.id === gameId);
    if (idx < 0) return false;
    games[idx].status     = 'approved';
    games[idx].approvedBy = me.id;
    games[idx].approvedAt = Date.now();
    return _save(K.GAMES, games);
  }

  function rejectGame(gameId) {
    if (!isModerator()) return false;
    const games = _load(K.GAMES);
    const idx = games.findIndex(g => g.id === gameId);
    if (idx < 0) return false;
    games.splice(idx, 1);
    return _save(K.GAMES, games);
  }

  function getPendingGames() {
    if (!isModerator()) return [];
    return _load(K.GAMES).filter(g => g.status === 'pending');
  }

  function editGame(gameId, fields) {
    const me = currentUser();
    const games = _load(K.GAMES);
    const idx = games.findIndex(g => g.id === gameId);
    if (idx < 0) return false;
    const g = games[idx];
    // Редактировать может владелец или модератор+
    if (!isModerator() && g.ownerId !== me?.id) return false;
    games[idx] = { ...g, ...fields, updatedAt: Date.now(), editedByUser: true };
    return _save(K.GAMES, games);
  }

  function removeGame(gameId) {
    const me = currentUser();
    const games = _load(K.GAMES);
    const idx = games.findIndex(g => g.id === gameId);
    if (idx < 0) return false;
    const g = games[idx];
    if (!isModerator() && g.ownerId !== me?.id) return false;
    games.splice(idx, 1);
    return _save(K.GAMES, games);
  }

  function findGameByName(name) {
    const low = (name||'').toLowerCase().trim();
    return getVisibleGames().find(g => g.name.toLowerCase() === low) || null;
  }

  function findGameById(id) {
    return _load(K.GAMES).find(g => g.id === id) || null;
  }

  function setRating(gameId, stars) {
    const games = _load(K.GAMES);
    const idx = games.findIndex(g => g.id === gameId);
    if (idx < 0) return false;
    games[idx].rating = stars;
    return _save(K.GAMES, games);
  }

  function setNotes(gameId, notes) {
    const games = _load(K.GAMES);
    const idx = games.findIndex(g => g.id === gameId);
    if (idx < 0) return false;
    games[idx].userNotes = notes;
    return _save(K.GAMES, games);
  }

  function addScreenshot(gameId, dataUrl) {
    const games = _load(K.GAMES);
    const idx = games.findIndex(g => g.id === gameId);
    if (idx < 0) return false;
    games[idx].screenshots = games[idx].screenshots || [];
    games[idx].screenshots.push({ id: uid(), dataUrl, addedAt: Date.now() });
    return _save(K.GAMES, games);
  }

  function removeScreenshot(gameId, screenshotId) {
    const games = _load(K.GAMES);
    const idx = games.findIndex(g => g.id === gameId);
    if (idx < 0) return false;
    games[idx].screenshots = (games[idx].screenshots||[]).filter(s => s.id !== screenshotId);
    return _save(K.GAMES, games);
  }

  function query({ genre='', sort='new', q='', includePersonal=false } = {}) {
    const me = currentUser();
    let games = getVisibleGames();
    if (!includePersonal) games = games.filter(g => g.status !== 'personal');
    if (genre) games = games.filter(g => (g.genre||'').toLowerCase().includes(genre.toLowerCase()));
    if (q)     games = games.filter(g =>
      (g.name||'').toLowerCase().includes(q.toLowerCase()) ||
      (g.genre||'').toLowerCase().includes(q.toLowerCase())
    );
    if (sort === 'new')    games.sort((a,b) => (b.addedAt||0)-(a.addedAt||0));
    if (sort === 'old')    games.sort((a,b) => (a.addedAt||0)-(b.addedAt||0));
    if (sort === 'name')   games.sort((a,b) => a.name.localeCompare(b.name,'ru'));
    if (sort === 'rating') games.sort((a,b) => (b.rating||0)-(a.rating||0));
    if (sort === 'screens')games.sort((a,b) => (b.screenshots||[]).length-(a.screenshots||[]).length);
    return games;
  }

  // Личная библиотека текущего пользователя
  function getPersonalLibrary() {
    const me = currentUser();
    if (!me) return [];
    return _load(K.GAMES).filter(g => g.status === 'personal' && g.ownerId === me.id);
  }

  function getStats() {
    const games = getVisibleGames().filter(g => g.status === 'approved');
    return {
      total:   games.length,
      screens: games.reduce((s,g) => s+(g.screenshots||[]).length, 0),
      rated:   games.filter(g => g.rating > 0).length,
      genres:  new Set(games.map(g => g.genre).filter(Boolean)).size,
      pending: getPendingGames().length,
      users:   _load(K.USERS).length,
    };
  }

  // ── СООБЩЕНИЯ ────────────────────────────────────────────────

  function addMessage(msg) {
    const msgs = _load(K.MESSAGES);
    msgs.push({ id: uid(), ...msg, createdAt: Date.now() });
    return _save(K.MESSAGES, msgs);
  }
  function getMessages() { return _load(K.MESSAGES); }

  // ── КОММЕНТАРИИ ───────────────────────────────────────────────

  function addComment(gameId, text) {
    if (!text || text.trim().length < 2) return null;
    const me = currentUser();
    const comments = _load(K.COMMENTS);
    const comment = {
      id:        uid(),
      gameId,
      text:      text.trim(),
      author:    me ? me.displayName || me.username : 'Гость',
      authorId:  me ? me.id : null,
      createdAt: Date.now(),
    };
    comments.push(comment);
    _save(K.COMMENTS, comments);
    return comment;
  }

  function getComments(gameId) {
    return _load(K.COMMENTS)
      .filter(c => c.gameId === gameId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  function deleteComment(commentId) {
    const me = currentUser();
    const comments = _load(K.COMMENTS);
    const idx = comments.findIndex(c => c.id === commentId);
    if (idx < 0) return false;
    const c = comments[idx];
    // Удалить может автор или модератор
    if (!isModerator() && c.authorId !== me?.id) return false;
    comments.splice(idx, 1);
    return _save(K.COMMENTS, comments);
  }

  function getCommentCount(gameId) {
    return _load(K.COMMENTS).filter(c => c.gameId === gameId).length;
  }

  function getAllComments() {
    return _load(K.COMMENTS).sort((a, b) => b.createdAt - a.createdAt);
  }

  // ── ПУБЛИЧНЫЙ ИНТЕРФЕЙС ──────────────────────────────────────

  init();

  return {
    // auth
    register, login, logout,
    currentUser, isLoggedIn, isModerator, isAdmin, isSuperAdmin,
    // users
    getAllUsers, getUserById, getUserByName, setRole, deleteUser, roleLabel,
    ROLE_ORDER, ROLE_LABELS,
    // games
    addGame, approveGame, rejectGame, editGame, removeGame,
    findGameByName, findGameById,
    getPendingGames, getVisibleGames, getAllGames, getPersonalLibrary,
    setRating, setNotes, addScreenshot, removeScreenshot,
    query, getStats,
    // messages
    addMessage, getMessages,
    // comments
    addComment, getComments, deleteComment, getCommentCount, getAllComments,
  };
})();
