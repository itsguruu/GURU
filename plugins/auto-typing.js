const { cmd } = require('../command');
const config = require('../config');

// Auto Typing / Composing Indicator Plugin
// Shows "typing..." when someone messages the bot
cmd({
    pattern: false,                // No prefix/command needed
    on: "text",                    // Runs on every incoming text message
    dontAddCommandList: true       // Hide from .menu / .help list
}, async (conn, mek, m, { from }) => {
    // Feature disabled in config → exit early
    if (config.AUTO_TYPING !== 'true') return;

    // Prevent bot from typing to itself (infinite loop protection)
    if (mek.key.fromMe) return;

    try {
        // Subscribe to presence updates (required in multi-device mode)
        await conn.presenceSubscribe(from);

        // Show composing / typing indicator
        await conn.sendPresenceUpdate('composing', from);

        // Stop typing after a natural random delay (2.5–6 seconds)
        const randomDelay = 2500 + Math.floor(Math.random() * 3500);
        setTimeout(async () => {
            await conn.sendPresenceUpdate('available', from);
        }, randomDelay);

    } catch (err) {
        // Log error silently — don't crash the bot
        console.log('[AUTO-TYPING ERROR]:', err.message || err);
    }
});
