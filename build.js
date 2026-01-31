/**
 * NoteMe Static Site Generator
 * Generates structured static HTML for 3-column layout
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Fetch data from JSONBin or local file
async function getData() {
  const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
  const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;

  if (JSONBIN_BIN_ID && JSONBIN_API_KEY) {
    console.log('📡 Fetching data from JSONBin.io...');
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

// 3-Column Layout CSS
const CSS = `
<style>
:root{--bg-sidebar:#202022;--bg-mid:#1c1c1e;--bg-editor:#1e1e1e;--border:#38383a;--accent:#e0b949;--text:#fff;--text-sec:#8e8e93;--sel:#c59f34}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:var(--bg-editor);color:var(--text);height:100vh;display:flex;overflow:hidden}
a{text-decoration:none;color:inherit}

/* Column 1: Users (Sidebar) */
.col-left{width:240px;background:var(--bg-sidebar);border-right:1px solid var(--border);display:flex;flex-direction:column}
.app-header{padding:12px 16px;border-bottom:1px solid var(--border);font-weight:600;font-size:15px;color:var(--accent);display:flex;justify-content:space-between;align-items:center}
.user-list{flex:1;overflow-y:auto;padding:8px}
.user-item{padding:8px 12px;border-radius:6px;font-size:14px;color:var(--text-sec);display:flex;align-items:center;gap:8px;margin-bottom:2px;cursor:pointer}
.user-item:hover{background:rgba(255,255,255,0.05);color:var(--text)}
.user-item.active{background:var(--sel);color:#000;font-weight:500}
.icon-folder{width:16px;height:16px;opacity:0.75}

/* Column 2: Notes List */
.col-mid{width:300px;background:var(--bg-mid);border-right:1px solid var(--border);display:flex;flex-direction:column}
.search-bar{padding:10px;border-bottom:1px solid var(--border)}
.note-list-container{flex:1;overflow-y:auto}
.note-preview{padding:12px 20px;border-bottom:1px solid #2a2a2c;cursor:pointer}
.note-preview:hover{background:rgba(255,255,255,0.03)}
.note-preview.active{background:var(--sel);border-color:var(--sel)}
.note-preview.active *{color:#000!important}
.note-title{font-weight:600;font-size:15px;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.note-meta{font-size:13px;color:var(--text-sec);display:flex;gap:8px}
.note-snippet{font-size:13px;color:var(--text-sec);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0.8}
.empty-msg{padding:20px;color:var(--text-sec);text-align:center;font-size:13px;margin-top:40px}

/* Column 3: Editor (Content) */
.col-right{flex:1;background:var(--bg-editor);display:flex;flex-direction:column;overflow:hidden}
.editor-toolbar{height:52px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;justify-content:space-between}
.note-date-display{color:var(--text-sec);font-size:12px;margin:0 auto}
.editor-content{flex:1;overflow-y:auto;padding:40px 60px;max-width:900px;margin:0 auto;width:100%}

/* Typography for Content */
.content{font-size:16px;line-height:1.6}
.content h1{font-size:28px;margin:0 0 20px}
.content p{margin-bottom:16px}
.content a{color:var(--accent)}
.content img{max-width:100%;border-radius:8px;margin:12px 0}
.content ul,.content ol{margin:0 0 16px 24px;color:var(--text-sec)}
.content blockquote{border-left:3px solid var(--accent);padding-left:16px;color:var(--text-sec);margin:16px 0}
.content pre{background:#2a2a2c;padding:12px;border-radius:6px;overflow-x:auto;margin:16px 0;font-family:monospace;font-size:14px}

/* Buttons */
.add-btn{font-size:18px;cursor:pointer;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,0.1)}
.add-btn:hover{background:var(--accent);color:#000}
</style>`;

function formatDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

// Generate complete HTML page
function renderLayout(data, activeUserId, activeNoteId) {
  const activeUser = activeUserId ? data.users.find(u => u.id === activeUserId) : null;
  const activeNote = activeUser && activeNoteId ? activeUser.notes.find(n => n.id == activeNoteId) : null;

  // 1. Sidebar (Users)
  const usersListHtml = data.users.map(u => `
    <a href="/${u.id}/index.html" class="user-item ${u.id === activeUserId ? 'active' : ''}">
      <svg class="icon-folder" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
      <span>${u.id}</span>
    </a>
  `).join('');

  // 2. Middle Column (Notes)
  let notesListHtml = '<div class="empty-msg">Выберите пользователя</div>';
  if (activeUser) {
    if (activeUser.notes.length === 0) {
      notesListHtml = '<div class="empty-msg">Нет заметок</div>';
    } else {
      const sortedNotes = [...activeUser.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      notesListHtml = sortedNotes.map(n => {
        const isActive = activeNoteId && n.id == activeNoteId;
        const title = n.text.split('\n')[0].replace(/<[^>]*>/g, '').substring(0, 30) || 'Без названия';
        const snippet = n.text.split('\n').slice(1).join(' ').replace(/<[^>]*>/g, '').substring(0, 50) || '...';

        return `
        <a href="/${activeUser.id}/${n.id}.html" class="note-preview ${isActive ? 'active' : ''}">
          <div class="note-title">${title}</div>
          <div class="note-meta">
            <span>${new Date(n.createdAt).toLocaleDateString('ru-RU')}</span>
            <span class="note-snippet">${snippet}</span>
          </div>
        </a>`;
      }).join('');
    }
  }

  // 3. Right Column (Content)
  let contentHtml = '<div class="empty-msg" style="margin-top:20vh;font-size:16px">← Выберите заметку</div>';
  if (activeNote) {
    contentHtml = `
      <div class="editor-toolbar">
         <div class="note-date-display">${formatDate(activeNote.createdAt)}</div>
         <a href="/admin.html?user=${activeUserId}&note=${activeNote.id}" title="Редактировать (в админке)" style="opacity:0.5;font-size:12px">Edit</a>
      </div>
      <div class="editor-content content">
        ${activeNote.text.replace(/\n/g, '<br>')}
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>note*me ${activeNote ? '— Заметка' : ''}</title>
    ${CSS}
</head>
<body>
    <!-- 1. Users Sidebar -->
    <div class="col-left">
        <div class="app-header">
            <span>note*me</span>
            <a href="/admin.html" class="add-btn" title="Добавить">+</a>
        </div>
        <div class="user-list">
            ${usersListHtml}
        </div>
    </div>

    <!-- 2. Notes List -->
    <div class="col-mid">
        <div class="search-bar">
           <div style="background:rgba(255,255,255,0.1);border-radius:6px;padding:6px 10px;font-size:13px;color:var(--text-sec);text-align:center">
             ${activeUser ? activeUser.notes.length + ' заметок' : 'Все iCloud'}
           </div>
        </div>
        <div class="note-list-container">
            ${notesListHtml}
        </div>
    </div>

    <!-- 3. Content -->
    <div class="col-right">
        ${contentHtml}
    </div>
</body>
</html>`;
}

async function build() {
  console.log('🔨 Building note*me...');

  // 1. Get Data
  const data = await getData();

  // 2. Prepare dist
  if (fs.existsSync(DIST_DIR)) {
    // Basic cleanup logic if needed
  } else {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // 3. Generate Root Index (No user selected)
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), renderLayout(data, null, null));
  console.log('✓ index.html');

  // 4. Generate Pages for each User and Note
  for (const user of data.users) {
    const userDir = path.join(DIST_DIR, user.id);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

    // User Index (List of notes, no note selected)
    fs.writeFileSync(path.join(userDir, 'index.html'), renderLayout(data, user.id, null));
    console.log(`✓ ${user.id}/index.html`);

    // Each Note Page
    for (const note of user.notes) {
      fs.writeFileSync(path.join(userDir, `${note.id}.html`), renderLayout(data, user.id, note.id));
    }
    console.log(`  ✓ ${user.notes.length} notes generated for ${user.id}`);
  }

  // 5. Copy Admin
  if (fs.existsSync(PUBLIC_DIR)) {
    fs.readdirSync(PUBLIC_DIR).forEach(file => {
      fs.copyFileSync(path.join(PUBLIC_DIR, file), path.join(DIST_DIR, file));
    });
    console.log('✓ Public assets copied');
  }

  console.log('\n✅ Build complete!');
}

build().catch(console.error);
