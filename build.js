/**
 * NoteMe Static Site Generator
 * Premium Responsive Layout | Theme Support
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');

async function getData() {
  const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
  const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;

  if (JSONBIN_BIN_ID && JSONBIN_API_KEY) {
    console.log('📡 Fetching from JSONBin...');
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        headers: { 'X-Access-Key': JSONBIN_API_KEY }
      });
      const json = await res.json();
      return json.record || { users: [] };
    } catch (e) {
      console.error('Fetch error:', e);
      return { users: [] };
    }
  }

  console.log('📁 Reading local data.json...');
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
  return { users: [] };
}

// ========== CSS WITH THEME SUPPORT ==========
const CSS = `
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

/* ===== DARK THEME (Default) ===== */
:root {
  --bg-sidebar: #202020;
  --bg-list: #1c1c1e;
  --bg-content: #1e1e1e;
  --border: #333;
  --text-main: #e0e0e0;
  --text-muted: #808080;
  --accent: #d4a422;
  --item-hover: rgba(255, 255, 255, 0.04);
  --item-active: rgba(255, 255, 255, 0.08);
  --scrollbar-thumb: #444;
}

/* ===== LIGHT THEME ===== */
body.light {
  --bg-sidebar: #f5f5f7;
  --bg-list: #ffffff;
  --bg-content: #fafafa;
  --border: #e0e0e0;
  --text-main: #1d1d1f;
  --text-muted: #6e6e73;
  --accent: #d4a422;
  --item-hover: rgba(0, 0, 0, 0.03);
  --item-active: rgba(0, 0, 0, 0.06);
  --scrollbar-thumb: #ccc;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg-content);
  color: var(--text-main);
  height: 100vh;
  display: flex;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  transition: background 0.3s, color 0.3s;
}

a { text-decoration: none; color: inherit; }

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 4px; }

/* COLUMNS */
.col-users, .col-notes, .col-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: background 0.3s;
}

.col-users {
  width: 220px;
  min-width: 220px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
}
.col-users .header {
  height: 52px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 13px;
  letter-spacing: 0.5px;
}
.header-left { display: flex; align-items: center; gap: 10px; }
.add-btn { color: var(--accent); font-size: 18px; font-weight: 300; opacity: 0.8; padding: 4px; cursor: pointer; }
.add-btn:hover { opacity: 1; }
.theme-btn { 
  position: fixed; 
  bottom: 20px; 
  right: 20px; 
  z-index: 1000; 
  background: var(--bg-sidebar); 
  border: 1px solid var(--border); 
  border-radius: 50%; 
  width: 40px; 
  height: 40px; 
  cursor: pointer; 
  opacity: 0.8; 
  transition: opacity 0.2s, transform 0.2s; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.theme-btn:hover { opacity: 1; transform: scale(1.05); }
.theme-btn svg { width: 18px; height: 18px; stroke: var(--text-muted); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.col-users .list { flex: 1; overflow-y: auto; padding: 8px; }

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: var(--text-main);
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 2px;
}
.user-item:hover { background: var(--item-hover); }
.user-item.active { background: var(--item-active); }
.icon { font-size: 16px; opacity: 0.7; }
.active .icon { opacity: 1; color: var(--accent); }

.col-notes {
  width: 320px;
  min-width: 320px;
  background: var(--bg-list);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}
.col-notes .header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  position: relative;
}
.col-notes .list { flex: 1; overflow-y: auto; }

.note-item {
  display: flex;
  flex-direction: column;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.1s;
  height: 70px;
  justify-content: center;
}
.note-item:hover { background: var(--item-hover); }
.note-item.active { background: var(--item-active); }

.note-item .title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}
.note-item .meta {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.col-content {
  flex: 1;
  background: var(--bg-content);
  position: relative;
}
.col-content .toolbar {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 12px;
  border-bottom: 1px solid transparent; 
  position: relative;
}
.col-content .body {
  flex: 1;
  overflow-y: auto;
  padding: 40px 60px 80px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.body { font-size: 17px; line-height: 1.6; }
.body h1 { font-size: 28px; margin: 24px 0 16px; }
.body h2 { font-size: 22px; margin: 20px 0 12px; }
.body p { margin-bottom: 16px; }
.body ul, .body ol { margin-bottom: 16px; padding-left: 24px; }
.body blockquote { border-left: 3px solid var(--accent); padding-left: 16px; margin: 16px 0; color: var(--text-muted); }
.body code { background: var(--item-active); padding: 2px 5px; border-radius: 4px; font-size: 0.9em; font-family: ui-monospace, monospace; }
.body pre { background: var(--bg-sidebar); padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; }
.body img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
.body a { color: var(--accent); border-bottom: 1px solid rgba(212, 164, 34, 0.3); }

.empty { margin-top: 30vh; text-align: center; color: var(--text-muted); font-size: 14px; }
.mobile-nav { display: none; position: absolute; left: 10px; top: 0; bottom: 0; align-items: center; color: var(--accent); font-size: 16px; padding: 0 10px; cursor: pointer; }

/* MOBILE */
@media (max-width: 768px) {
  .col-users, .col-notes, .col-content { width: 100%; min-width: 0; display: none; }
  body.view-root .col-users { display: flex; }
  body.view-user .col-notes { display: flex; }
  body.view-note .col-content { display: flex; }
  .note-item { padding: 16px; height: auto; }
  .col-content .body { padding: 20px 24px 80px; }
  .mobile-nav { display: flex; }
}
</style>
`;

// ========== THEME TOGGLE JS ==========
const THEME_JS = `
<script>
(function() {
  // Check saved preference or system preference
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || (!saved && window.matchMedia('(prefers-color-scheme: light)').matches)) {
    document.body.classList.add('light');
  }
  
  // Toggle function
  window.toggleTheme = function() {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
    updateIcon();
  };
  
  const sunSvg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const moonSvg = '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  
  function updateIcon() {
    const btn = document.getElementById('themeBtn');
    if (btn) btn.innerHTML = document.body.classList.contains('light') ? moonSvg : sunSvg;
  }
  
  document.addEventListener('DOMContentLoaded', updateIcon);
})();
</script>
`;

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU');
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim();
}

function getNoun(number, one, two, five) {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) return five;
  n %= 10;
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return two;
  return five;
}

function renderPage(data, activeUserId, activeNoteId) {
  const activeUser = activeUserId ? data.users.find(u => u.id === activeUserId) : null;
  const activeNote = activeUser && activeNoteId ? activeUser.notes.find(n => n.id == activeNoteId) : null;

  let viewState = 'view-root';
  if (activeUser) viewState = 'view-user';
  if (activeNote) viewState = 'view-note';

  // USERS
  const usersHtml = data.users.map(u => `
    <a href="/${u.id}/index.html" class="user-item ${u.id === activeUserId ? 'active' : ''}">
      <span class="icon">📁</span>
      <span>${u.id}</span>
    </a>
  `).join('');

  // NOTES
  let notesHtml = '<div class="empty">Нет пользователей</div>';
  let notesCountStr = '0 заметок';

  if (activeUser) {
    const count = activeUser.notes.length;
    notesCountStr = `${count} ${getNoun(count, 'заметка', 'заметки', 'заметок')}`;

    if (activeUser.notes.length === 0) {
      notesHtml = '<div class="empty">Нет заметок</div>';
    } else {
      const sorted = [...activeUser.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      notesHtml = sorted.map(n => {
        const title = n.title || 'Без названия';
        return `
          <a href="/${activeUser.id}/${n.id}.html" class="note-item ${n.id == activeNoteId ? 'active' : ''}">
            <div class="title">${title}</div>
            <div class="meta">
              <span class="date">${formatDate(n.createdAt)}</span>
            </div>
          </a>
        `;
      }).join('');
    }
  }

  // CONTENT
  let contentHtml = '<div class="empty">Выберите заметку для просмотра</div>';
  let noteDate = '';

  if (activeNote) {
    noteDate = new Date(activeNote.createdAt).toLocaleString('ru-RU');
    const title = activeNote.title || 'Без названия';
    contentHtml = `
      <div class="body">
        <h1>${title}</h1>
        ${activeNote.text}
      </div>`;
  }

  const pageTitle = activeNote
    ? (activeNote.title || 'Note')
    : 'note*me';

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  ${CSS}
</head>
<body class="${viewState}">
  ${THEME_JS}
  
  <div class="col-users">
    <div class="header">
      <div class="header-left">
        <span>note*me</span>
      </div>
      <div>
        <a href="/admin.html" class="add-btn" title="Добавить">+</a>
      </div>
    </div>
    <div class="list">${usersHtml}</div>
  </div>

  <!-- Theme Toggle (Fixed) -->
  <button id="themeBtn" class="theme-btn" onclick="toggleTheme()" title="Сменить тему"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button>

  <div class="col-notes">
    <div class="header">
      <a href="/" class="mobile-nav">❮</a>
      ${activeUser ? notesCountStr : 'Все'}
    </div>
    <div class="list">${notesHtml}</div>
  </div>

  <div class="col-content">
    <div class="toolbar">
      ${activeUser ? `<a href="/${activeUser.id}/index.html" class="mobile-nav">❮</a>` : ''}
      <span>${noteDate}</span>
    </div>
    ${contentHtml}
  </div>

</body>
</html>`;
}

async function build() {
  console.log('🔨 Building note*me...');
  const data = await getData();

  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), renderPage(data, null, null));
  console.log('✓ index.html');

  for (const user of data.users) {
    const userDir = path.join(DIST_DIR, user.id);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

    fs.writeFileSync(path.join(userDir, 'index.html'), renderPage(data, user.id, null));
    console.log(`✓ ${user.id}/index.html`);

    for (const note of user.notes) {
      fs.writeFileSync(path.join(userDir, `${note.id}.html`), renderPage(data, user.id, note.id));
    }
    console.log(`  ✓ ${user.notes.length} notes for ${user.id}`);
  }

  if (fs.existsSync(PUBLIC_DIR)) {
    fs.readdirSync(PUBLIC_DIR).forEach(file => {
      fs.copyFileSync(path.join(PUBLIC_DIR, file), path.join(DIST_DIR, file));
    });
    console.log('✓ Public assets');
  }

  console.log('\\n✅ Done!');
}

build().catch(console.error);
