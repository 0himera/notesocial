/**
 * Vercel Serverless Function for NoteMe
 * Uses JSONBin.io as cloud storage
 */

// JSONBin.io credentials (set in Vercel Environment Variables)
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Read data from JSONBin
async function readData() {
    try {
        const res = await fetch(JSONBIN_URL + '/latest', {
            headers: { 'X-Access-Key': JSONBIN_API_KEY }
        });
        const json = await res.json();
        return json.record || { users: [] };
    } catch {
        return { users: [] };
    }
}

// Write data to JSONBin
async function writeData(data) {
    await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': JSONBIN_API_KEY
        },
        body: JSON.stringify(data)
    });
}

// Trigger Vercel rebuild (optional)
async function triggerDeploy() {
    const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK;
    if (!DEPLOY_HOOK) return;

    await fetch(DEPLOY_HOOK, { method: 'POST' });
    console.log('Deploy hook triggered');
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, userId, passwordHash, text } = req.body;
        const data = await readData();

        // === CREATE NEW USER ===
        if (action === 'createUser') {
            if (!userId || !passwordHash) {
                return res.status(400).json({ error: 'Заполните все поля' });
            }

            if (!/^[a-z0-9_]+$/.test(userId)) {
                return res.status(400).json({ error: 'Логин: только латинские буквы, цифры и _' });
            }

            if (data.users.find(u => u.id === userId)) {
                return res.status(400).json({ error: 'Пользователь уже существует' });
            }

            data.users.push({
                id: userId,
                passwordHash: passwordHash,
                notes: []
            });

            await writeData(data);
            await triggerDeploy();

            return res.status(200).json({ success: true });
        }

        // === ADD NOTE ===
        if (action === 'addNote') {
            if (!userId || !text || !passwordHash) {
                return res.status(400).json({ error: 'Заполните все поля' });
            }

            const user = data.users.find(u => u.id === userId);
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            if (user.passwordHash !== passwordHash) {
                return res.status(401).json({ error: 'Неверный пароль' });
            }

            const noteId = user.notes.length > 0
                ? Math.max(...user.notes.map(n => n.id)) + 1
                : 1;

            user.notes.push({
                id: noteId,
                text: text.trim(),
                createdAt: new Date().toISOString()
            });

            await writeData(data);
            await triggerDeploy();

            return res.status(200).json({ success: true, noteId });
        }

        return res.status(400).json({ error: 'Unknown action' });

    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
