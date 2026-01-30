// File: ./plugins/smart-media-dl.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    pattern: 'dl|media|down|vd|videodl|reel|fb|ig|tt|social',
    desc: 'Smart downloader — any video/photo link (FB, IG, TikTok, X, YT Shorts, etc.)',
    category: 'download',
    react: '📥',

    async function(conn, mek, m, { from, q, reply: taggedReplyFn }) {
        if (!q || !q.includes('http')) {
            return taggedReplyFn(
                'Send any media link!\nExamples:\n.dl https://www.facebook.com/share/r/17RtKpxyi/\n.dl https://www.instagram.com/reel/C_abc123/\n.dl https://vm.tiktok.com/ZMabc123/\n.dl https://twitter.com/user/status/12345'
            );
        }

        const url = q.trim();

        try {
            taggedReplyFn('Detecting media... ⌛ Trying multiple sources');

            // Order: most reliable first for FB/IG/TikTok
            const apis = [
                // 1. Alyachan All-in-One (excellent for FB share links, IG, TikTok)
                `https://api.alyachan.dev/api/downloader/all?url=${encodeURIComponent(url)}`,
                // 2. SnapInsta / SnapTik style
                `https://snapinsta.app/action2.php?url=${encodeURIComponent(url)}`,
                // 3. SSSTik (very strong for TikTok & FB)
                `https://ssstik.io/abc?url=${encodeURIComponent(url)}`,
                // 4. Fdownloader (Facebook specialist)
                `https://fdownloader.net/api/download?url=${encodeURIComponent(url)}`,
                // 5. RapidSave (backup for IG/TikTok)
                `https://rapidsave.com/api?url=${encodeURIComponent(url)}`
            ];

            let mediaUrl = null;
            let mediaType = 'video'; // default
            let caption = 'Downloaded via GURU MD';

            for (const api of apis) {
                try {
                    const res = await axios.get(api, { timeout: 25000 });
                    const data = res.data;

                    // Try to extract from common response patterns
                    if (data?.result?.url || data?.result?.media?.[0]?.url) {
                        mediaUrl = data.result.url || data.result.media[0].url;
                        caption = data.result.title || data.result.caption || caption;
                        mediaType = data.result.type?.includes('image') ? 'image' : 'video';
                        break;
                    }
                    if (data?.url || data?.hd_url || data?.sd_url) {
                        mediaUrl = data.url || data.hd_url || data.sd_url;
                        break;
                    }
                    if (data?.video || data?.media?.url) {
                        mediaUrl = data.video || data.media.url;
                        break;
                    }
                } catch (err) {
                    // Silent fail → try next API
                    continue;
                }
            }

            if (!mediaUrl) {
                return taggedReplyFn(
                    'Could not extract media from that link.\n' +
                    'Try a different link or make sure it is public/not expired.'
                );
            }

            taggedReplyFn(`Media found! Downloading ${mediaType}... ⬇️`);

            const ext = mediaType === 'image' ? '.jpg' : '.mp4';
            const filePath = path.join(__dirname, '../temp', `media_\( {Date.now()} \){ext}`);
            const writer = fs.createWriteStream(filePath);

            const download = await axios.get(mediaUrl, { responseType: 'stream' });
            download.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Send media
            await conn.sendMessage(from, {
                [mediaType]: { url: filePath },
                caption: caption,
                mimetype: mediaType === 'image' ? 'image/jpeg' : 'video/mp4'
            }, { quoted: mek });

            fs.unlinkSync(filePath);

        } catch (e) {
            console.error(e);
            taggedReplyFn('Download failed: ' + (e.message || 'Unknown error. Try another link.'));
        }
    }
};
