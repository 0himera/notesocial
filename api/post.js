/**
 * Vercel Serverless Function for NoteMe
 * Uses JSONBin.io as cloud storage
 */

// Read data from JSONBin
async function readData() {
    const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
    const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;

    if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
        console.error('Missing JSONBIN credentials');
        throw new Error('Server configuration error');
    }

    const url = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`;
    console.log('Reading from JSONBin:', url);

    const res = await fetch(url, {
        headers: { 'X-Access-Key': JSONBIN_API_KEY }
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('JSONBin read error:', res.status, text);
        throw new Error('Failed to read data');
    }

    const json = await res.json();
    console.log('Read data:', JSON.stringify(json.record));
    return json.record || { users: [] };
}

// Write data to JSONBin
async function writeData(data) {
    const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
    const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;

    const url = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;
    console.log('Writing to JSONBin:', url);
    console.log('Data to write:', JSON.stringify(data));

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': JSONBIN_API_KEY
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('JSONBin write error:', res.status, text);
        throw new Error('Failed to save data: ' + text);
    }

    const result = await res.json();
    console.log('Write success:', JSON.stringify(result));
    return result;
}

// Trigger Vercel rebuild (optional)
async function triggerDeploy() {
    const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK;
    if (!DEPLOY_HOOK) {
        console.log('No deploy hook configured');
        return;
    }

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
        console.log('Request:', { action, userId, hasPassword: !!passwordHash, hasText: !!text });

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

            return res.status(200).json({ success: true, message: 'User created' });
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
        console.error('API Error:', err.message, err.stack);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
};
