const { cmd } = require('../command');

cmd({
    pattern: "selfdestruct",
    alias: ["sd", "burn", "disappear", "ephemeral"],
    desc: "Send a self-destructing (view once) message",
    category: "privacy",
    use: ".sd <message or quote media>",
    react: "💥"
}, async (conn, mek, m, { from, quoted, text, reply, isGroup }) => {
    try {
        if (!text && !quoted) {
            return reply(`*Usage:* .sd <secret message>\nOr quote any media + .sd\n\nThis message will be view once (disappears after viewing)`);
        }

        let content = { text: text || "🔒 Secret message • View once only" };
        let options = { viewOnce: true };

        // If quoted media, send it as view once
        if (quoted) {
            const buffer = await conn.downloadMediaMessage(quoted);
            const type = quoted.message?.imageMessage ? 'image' :
                         quoted.message?.videoMessage ? 'video' :
                         quoted.message?.audioMessage ? 'audio' : 'document';

            content = {
                [type]: buffer,
                caption: text || "🔒 View once • Disappears after viewing",
                mimetype: quoted.message?.[type + 'Message']?.mimetype || 'application/octet-stream',
                viewOnce: true
            };
        }

        // Send the view-once message
        const sent = await conn.sendMessage(from, content, { quoted: mek });

        // Success reaction
        await conn.sendMessage(from, { react: { text: "💥", key: mek.key } });

        // Optional: Send reminder to sender
        await reply(`🔒 View-once message sent!\nIt will disappear after the recipient views it once.`);

    } catch (error) {
        console.error("[SELF-DESTRUCT ERROR]", error);
        reply("❌ Error sending self-destruct message: " + error.message);
    }
});
