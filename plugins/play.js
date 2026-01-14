const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "music"],
    desc: "Search & download YouTube song as MP3 (using reliable API)",
    category: "download",
    use: ".play <song name>",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a song name!\nExample: .play alan walker the spectre");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Step 1: Search via the API (your JSON example format)
        const searchUrl = `https://api.silvatechinc.my.id/ytplay?query=${encodeURIComponent(q)}`; // ← adjust if needed
        const searchRes = await axios.get(searchUrl);
        const data = searchRes.data;

        if (!data.status || !data.result || data.result.length === 0) {
            return reply("⚠️ No results found or API error.");
        }

        // Pick the best/first result (you can improve with views/duration sorting)
        const best = data.result[0];
        const title = best.title;
        const ytUrl = best.url;
        const thumbnail = best.thumbnail;

        reply(`🎧 Found: *\( {title}* ( \){best.duration})\nDownloading audio...`);

        // Step 2: If the API provides direct download, use it (from your old code)
        // If not, assume we need a separate /download endpoint with ID or URL
        const downloadUrl = `https://api.silvatechinc.my.id/download/ytmp3?url=${encodeURIComponent(ytUrl)}`; // ← example, change to real

        const dlRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' }); // or stream if large

        if (!dlRes.data) throw new Error("No audio data");

        // Send as audio with nice player format
        await conn.sendMessage(from, {
            audio: dlRes.data, // Buffer
            mimetype: 'audio/mpeg',
            fileName: `${title.replace(/[^\w]/g, '_')}.mp3`,
            caption: `🎵 *${title}*\n> Duration: ${best.duration}\n> Views: ${best.views}\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`,
            ...(thumbnail ? { jpegThumbnail: { url: thumbnail } } : {}),
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: "YouTube Song • Powered by API",
                    thumbnailUrl: thumbnail,
                    mediaType: 2,
                    sourceUrl: ytUrl,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error("[PLAY API ERROR]", e);
        reply(`❌ Error: ${e.message || "Download failed. Try again or different song."}`);
    }
});
