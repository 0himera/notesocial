/**
 * NoteMe Static Site Generator
 * Premium 3-column layout with Mobile Responsiveness
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

// ========== PREMIUM & RESPONSIVE CSS ==========
const CSS = `
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg-sidebar: #202020;
  --bg-list: #1c1c1e;
  --bg-content: #1e1e1e;
  --border: #333;
  --text-main: #e0e0e0;
  --text-muted: #808080;
  --accent: #d4a422;
  --item-hover: rgba(255, 255, 255, 0.04);
  --item-active: rgba(255, 255, 255, 0.08); /* Светлее, но без цвета */
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg-content);
  color: var(--text-main);
  height: 100vh;
  display: flex;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
}

a { text-decoration: none; color: inherit; }

/* SCROLLBAR */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; border: 2px solid var(--bg-list); }

/* LAYOUT COLUMNS */
.col-users, .col-notes, .col-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* COLUMN 1: SIDEBAR */
.col-users {
  width: 220px;
  min-width: 220px;
  background: var(--bg-sidebar);
  border-right: 1px solid #000;
}

.col-users .header {
  height: 52px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #aaa;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.add-btn {
  color: var(--accent);
  font-size: 20px;
  font-weight: 300;
  opacity: 0.8;
  transition: opacity 0.2s;
  padding: 4px 8px; /* Touch area */
}
.add-btn:hover { opacity: 1; }

.col-users .list { flex: 1; overflow-y: auto; padding: 8px; }

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: #ccc;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 2px;
}
.user-item:hover { background: var(--item-hover); }
.user-item.active { background: var(--item-active); color: #fff; }
.icon { font-size: 16px; opacity: 0.7; }
.active .icon { opacity: 1; color: var(--accent); }

/* COLUMN 2: NOTES LIST */
.col-notes {
  width: 320px;
  min-width: 320px;
  background: var(--bg-list);
  border-right: 1px solid #000;
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
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  transition: background 0.1s;
}
.note-item:hover { background: var(--item-hover); }
.note-item.active { background: var(--item-active); }

.note-item .title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
  line-height: 1.2;
}
.note-item .meta {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  overflow: hidden;
  white-space: nowrap;
}
.note-item .date { flex-shrink: 0; }
.note-item .snippet { opacity: 0.7; overflow: hidden; text-overflow: ellipsis; }

/* COLUMN 3: CONTENT */
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
  border-bottom: 1px solid transparent; /* Align visually */
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

/* Content Typography */
.body { font-size: 17px; line-height: 1.6; color: #ddd; }
.body h1 { font-size: 28px; margin: 24px 0 16px; color: #fff; }
.body h2 { font-size: 22px; margin: 20px 0 12px; color: #fff; }
.body p { margin-bottom: 16px; }
.body ul, .body ol { margin-bottom: 16px; padding-left: 24px; color: #ccc; }
.body blockquote { border-left: 3px solid var(--accent); padding-left: 16px; margin: 16px 0; color: #999; }
.body code { background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 4px; font-size: 0.9em; font-family: ui-monospace, monospace; }
.body pre { background: #111; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; }
.body img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
.body a { color: var(--accent); border-bottom: 1px solid rgba(212, 164, 34, 0.3); }

.empty { margin-top: 30vh; text-align: center; color: var(--text-muted); font-size: 14px; }

/* MOBILE BACK BUTTONS & TITLE */
.mobile-nav { display: none; position: absolute; left: 10px; top: 0; bottom: 0; align-items: center; color: var(--accent); font-size: 16px; padding: 0 10px; cursor: pointer; }

/* ===== MEDIA QUERIES (MOBILE) ===== */
@media (max-width: 768px) {
  .col-users, .col-notes, .col-content {
    width: 100%;
    min-width: 0;
    display: none; /* Hide all by default */
  }

  /* Show active column based on body state */
  body.view-root .col-users { display: flex; }
  body.view-user .col-notes { display: flex; }
  body.view-note .col-content { display: flex; }

  /* Adjust padding for mobile */
  .note-item { padding: 16px; }
  .col-content .body { padding: 20px 24px 80px; }
  
  /* Show Back Buttons */
  .mobile-nav { display: flex; }
}
</style>
`;

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU');
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim();
}

// Pluralization Helper
function getNoun(number, one, two, five) {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return five;
  }
  n %= 10;
  if (n === 1) {
    return one;
  }
  if (n >= 2 && n <= 4) {
    return two;
  }
  return five;
}

function renderPage(data, activeUserId, activeNoteId) {
  const activeUser = activeUserId ? data.users.find(u => u.id === activeUserId) : null;
  const activeNote = activeUser && activeNoteId ? activeUser.notes.find(n => n.id == activeNoteId) : null;

  // DETERMINE VIEW STATE for Mobile
  let viewState = 'view-root';
  if (activeUser) viewState = 'view-user';
  if (activeNote) viewState = 'view-note';

  // Column 1: Users
  const usersHtml = data.users.map(u => `
    <a href="/${u.id}/index.html" class="user-item ${u.id === activeUserId ? 'active' : ''}">
      <span class="icon">📁</span>
      <span>${u.id}</span>
    </a>
  `).join('');

  // Column 2: Notes
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
        const plain = stripHtml(n.text);
        const title = plain.substring(0, 30) || 'Без названия';
        const snippet = plain.substring(30, 80) || 'Нет текста';
        return `
          <a href="/${activeUser.id}/${n.id}.html" class="note-item ${n.id == activeNoteId ? 'active' : ''}">
            <div class="title">${title}</div>
            <div class="meta">
              <span class="date">${new Date(n.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' })}</span>
              <span class="snippet">${snippet}</span>
            </div>
          </a>
        `;
      }).join('');
    }
  }

  // Column 3: Content
  let contentHtml = '<div class="empty">Выберите заметку для просмотра</div>';
  let noteDate = '';

  if (activeNote) {
    noteDate = new Date(activeNote.createdAt).toLocaleString('ru-RU');
    contentHtml = `<div class="body">${activeNote.text}</div>`;
  }

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>note*me ${activeNote ? '— ' + stripHtml(activeNote.text).substring(0, 20) : ''}</title>
  ${CSS}
</head>
<body class="${viewState}">
  
  <!-- USERS COLUMN -->
  <div class="col-users">
    <div class="header">
      <span>note*me</span>
      <a href="/admin.html" class="add-btn" title="Добавить">+</a>
    </div>
    <div class="list">${usersHtml}</div>
  </div>

  <!-- NOTES LIST COLUMN -->
  <div class="col-notes">
    <div class="header">
      <a href="/" class="mobile-nav">❮</a>
      ${activeUser ? notesCountStr : 'Все'}
    </div>
    <div class="list">${notesHtml}</div>
  </div>

  <!-- CONTENT COLUMN -->
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

  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // Root index
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), renderPage(data, null, null));
  console.log('✓ index.html');

  // User pages
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

  // Copy public files
  if (fs.existsSync(PUBLIC_DIR)) {
    fs.readdirSync(PUBLIC_DIR).forEach(file => {
      fs.copyFileSync(path.join(PUBLIC_DIR, file), path.join(DIST_DIR, file));
    });
    console.log('✓ Public assets');
  }

  console.log('\\n✅ Done!');
}

build().catch(console.error);
