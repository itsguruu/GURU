const { cmd } = require('../command');
const yts = require('yt-search');
const { YtDlp } = require('ytdlp-nodejs');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "audio"],
    desc: "Download YouTube audio as MP3 (using yt-search + ytdlp-nodejs)",
    category: "download",
    use: ".play <song name or YouTube URL>",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide song name or YouTube URL!\nExample: .play perfect ed sheeran");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        let videoUrl, title, thumbnail;

        // If input is a YouTube URL
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q.trim();
            const search = await yts({ videoId: q.split(/[=/]/).pop() });
            title = search.title || "Audio";
            thumbnail = search.thumbnail;
        } else {
            // Search using yt-search
            const searchResults = await yts(q);
            if (!searchResults.videos.length) {
                return reply("⚠️ No results found for: " + q);
            }

            const video = searchResults.videos[0];
            videoUrl = video.url;
            title = video.title;
            thumbnail = video.thumbnail;
        }

        reply(`🎧 Found: *${title}*\nDownloading audio...`);

        const ytdlp = new YtDlp();

        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const outputPath = path.join(tempDir, `\( {Date.now()}_ \){title.replace(/[^\w]/g, '_')}.mp3`);

        // Download best audio → mp3
        await ytdlp.download(videoUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: 0,           // best (usually 160kbps opus → converted)
            output: outputPath,
            addMetadata: true,
            embedThumbnail: true
        });

        if (!fs.existsSync(outputPath)) {
            throw new Error("Audio file not created");
        }

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: outputPath },
            mimetype: 'audio/mpeg',
            fileName: `${title.replace(/[^\w]/g, '_')}.mp3`,
            caption: `🎵 *${title}*\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech\n> Reliable download via yt-dlp (2026)`,
            ...(thumbnail ? { jpegThumbnail: { url: thumbnail } } : {})
        }, { quoted: mek });

        // Auto-cleanup
        setTimeout(() => {
            fs.unlink(outputPath, (err) => {
                if (err) console.log("Cleanup failed:", err);
            });
        }, 60000); // 1 min

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error("[PLAY ERROR]", e);
        reply(`❌ Error: ${e.message || "Failed to download. Try another song."}`);
    }
});
