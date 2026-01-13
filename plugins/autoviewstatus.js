const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "autoviewstatus",
    desc: "Toggle auto-view status",
    category: "utility",
    react: "👀",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Simple toggle (you can save to DB later if needed)
        global.AUTO_VIEW_STATUS = !global.AUTO_VIEW_STATUS;

        const status = global.AUTO_VIEW_STATUS ? "ON ✅" : "OFF ❌";

        reply(`Auto View Status: *${status}*\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);

    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
});

// Auto-view logic (add this outside cmd - runs on every status)
conn.ev.on('messages.upsert', async (mekUpdate) => {
    const msg = mekUpdate.messages[0];
    if (!msg.message) return;

    // Check if message is status
    if (msg.key.remoteJid === 'status@broadcast') {
        if (global.AUTO_VIEW_STATUS) {
            await conn.readMessages([msg.key]);
            console.log(`Auto-viewed status from ${msg.key.participant}`);
        }
    }
});
