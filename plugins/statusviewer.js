const { cmd } = require('../command');

global.AUTO_VIEW_STATUS = true; // ← Change to false to disable

cmd({
    pattern: "statusview",
    alias: ["autostatus", "viewstatus"],
    desc: "Toggle auto status viewer (appears as real you)",
    category: "privacy",
    onlyOwner: true
}, async (conn, mek, m, { reply }) => {
    global.AUTO_VIEW_STATUS = !global.AUTO_VIEW_STATUS;
    reply(`Auto status viewer ${global.AUTO_VIEW_STATUS ? 'ENABLED ✅' : 'DISABLED ❌'}\n\nNow views every status instantly as your real number!`);
});

// Auto-view every new status (instant & real)
conn.ev.on('messages.upsert', async (mekUpdate) => {
    const msg = mekUpdate.messages[0];
    if (!msg?.message || msg.key.remoteJid !== 'status@broadcast') return;

    if (global.AUTO_VIEW_STATUS) {
        try {
            // Mark status as seen immediately (shows your real number in viewed list)
            await conn.readMessages([msg.key]);

            const poster = msg.key.participant?.split('@')[0] || 'unknown';
            console.log(`[STATUS VIEW] Auto-viewed status from ${poster} (real view)`);

            // Optional: React 🔥 to look natural (uncomment if you want)
            // await conn.sendMessage('status@broadcast', { react: { text: '🔥', key: msg.key } });

        } catch (err) {
            console.error("[AUTO-VIEW ERROR]", err.message);
        }
    }
});
