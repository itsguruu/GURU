const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
    pattern: "play",
    alias: ["song", "ytplay"],
    desc: "Download YouTube audio",
    category: "download",
    use: ".play <song name>",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide song name!\nExample: .play perfect ed sheeran");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const response = await axios.get(`https://api.silvatechinc.my.id/ytplay?query=${encodeURIComponent(q)}`);
        const data = response.data;

        if (!data || !data.status || !data.result?.url) {
            return reply("⚠️ No results found or error occurred.");
        }

        await conn.sendMessage(from, {
            audio: { url: data.result.url },
            mimetype: 'audio/mpeg',
            fileName: `${data.result.title || 'song'}.mp3`,
            caption: `🎵 *${data.result.title || 'Song'}*\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message || "Failed to download"}`);
    }
});
