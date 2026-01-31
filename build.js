/**
 * NoteMe Static Site Generator
 * Generates static HTML pages from data.json or JSONBin.io
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
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { 'X-Access-Key': JSONBIN_API_KEY }
    });
    const json = await res.json();
    return json.record || { users: [] };
  }

  console.log('📁 Reading local data.json...');
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// Main build function
async function build() {
  const data = await getData();
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // Format date helper
  function formatDate(isoDate) {
    const d = new Date(isoDate);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${mins}`;
  }

  // Common styles (iCloud Notes inspired)
  const COMMON_STYLES = `
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#1c1c1e;color:#fff;min-height:100vh}
.container{max-width:700px;margin:0 auto;padding:20px}
header{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid #38383a}
h1{font-size:28px;font-weight:600}
.btn{background:#ff9f0a;color:#000;border:none;padding:10px 20px;border-radius:8px;font-size:16px;cursor:pointer;text-decoration:none;display:inline-block}
.btn:hover{background:#ffb340}
.btn-secondary{background:#38383a;color:#fff}
.btn-secondary:hover{background:#48484a}
.user-list{margin-top:24px}
.user-card{background:#2c2c2e;border-radius:12px;padding:16px;margin-bottom:12px;cursor:pointer;transition:background .2s}
.user-card:hover{background:#3a3a3c}
.user-card a{text-decoration:none;color:inherit;display:block}
.user-name{font-size:18px;font-weight:500;margin-bottom:4px}
.user-preview{color:#98989f;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-date{color:#636366;font-size:12px;margin-top:8px}
.note{background:#2c2c2e;border-radius:12px;padding:16px;margin-bottom:12px}
.note-text{font-size:16px;line-height:1.5;white-space:pre-wrap}
.note-date{color:#636366;font-size:12px;margin-top:12px}
.back{color:#ff9f0a;text-decoration:none;font-size:14px}
.empty{color:#636366;text-align:center;padding:40px}
</style>`;

  // Generate index page (list of users)
  function generateIndex() {
    const userCards = data.users.map(user => {
      const latestNote = user.notes.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )[0];
      const preview = latestNote ? latestNote.text.substring(0, 80) : 'Нет заметок';
      const date = latestNote ? formatDate(latestNote.createdAt) : '';

      return `
    <div class="user-card">
      <a href="./${user.id}.html">
        <div class="user-name">${user.id}</div>
        <div class="user-preview">${preview}${preview.length >= 80 ? '...' : ''}</div>
        <div class="user-date">${date} · ${user.notes.length} заметок</div>
      </a>
    </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NoteMe — Заметки</title>
<meta name="description" content="Статическая соцсеть заметок">
${COMMON_STYLES}
</head>
<body>
<div class="container">
  <header>
    <h1>📝 Заметки</h1>
    <a href="./admin.html" class="btn">+ Новая</a>
  </header>
  <div class="user-list">
    ${userCards || '<div class="empty">Пока нет заметок</div>'}
  </div>
</div>
</body>
</html>`;

    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);
    console.log('✓ Generated: index.html');
  }

  // Generate user profile pages
  function generateUserPages() {
    data.users.forEach(user => {
      const notes = user.notes
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(note => `
      <div class="note">
        <div class="note-text">${note.text}</div>
        <div class="note-date">${formatDate(note.createdAt)}</div>
      </div>`).join('');

      const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${user.id} — NoteMe</title>
<meta name="description" content="Заметки пользователя ${user.id}">
${COMMON_STYLES}
</head>
<body>
<div class="container">
  <header>
    <a href="./index.html" class="back">← Все заметки</a>
    <a href="./admin.html?user=${user.id}" class="btn btn-secondary">Добавить</a>
  </header>
  <h1 style="margin:24px 0 16px">${user.id}</h1>
  <div class="notes">
    ${notes || '<div class="empty">У пользователя пока нет заметок</div>'}
  </div>
</div>
</body>
</html>`;

      fs.writeFileSync(path.join(DIST_DIR, `${user.id}.html`), html);
      console.log(`✓ Generated: ${user.id}.html`);
    });
  }

  // Copy admin.html to dist
  function copyPublic() {
    if (fs.existsSync(PUBLIC_DIR)) {
      const files = fs.readdirSync(PUBLIC_DIR);
      files.forEach(file => {
        fs.copyFileSync(
          path.join(PUBLIC_DIR, file),
          path.join(DIST_DIR, file)
        );
        console.log(`✓ Copied: ${file}`);
      });
    }
  }

  // Build
  console.log('🔨 Building NoteMe...\n');
  generateIndex();
  generateUserPages();
  copyPublic();
  console.log('\n✅ Build complete! Output: dist/');
}

// Run build
build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
