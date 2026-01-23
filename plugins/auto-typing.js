const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd, commands } = require('../command');

// Auto Typing / Composing indicator on every text message
cmd({
    pattern: false,                // No prefix/command name needed
    on: "text",                    // Correct event: runs on all text messages
    dontAddCommandList: true       // Hide from .menu / help list
}, async (conn, mek, m, { from, body, isOwner }) => {
    // Skip if feature is disabled in config
    if (config.AUTO_TYPING !== 'true') return;

    // Prevent bot from typing to itself (infinite loop)
    if (mek.key.fromMe) return;

    try {
        // Subscribe to presence updates for this chat (required in multi-device)
        await conn.presenceSubscribe(from);

        // Show "typing..." / composing indicator
        await conn.sendPresenceUpdate('composing', from);

        // Stop typing after a realistic random delay (2.5–6 seconds)
        // This makes it look natural, like a real person typing
        const randomDelay = 2500 + Math.floor(Math.random() * 3500);
        setTimeout(async () => {
            await conn.sendPresenceUpdate('available', from);
        }, randomDelay);

    } catch (err) {
        // Silent fail — don't crash bot if presence fails
        console.log('[AUTO-TYPING] Failed:', err.message || err);
    }
});
