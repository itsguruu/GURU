// File: ./plugins/smart-any-dl.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    pattern: 'dl|down|media|videodl|photodl|reel|fb|ig|tt|social|save',
    desc: 'Universal downloader — video or photo from any link (FB, IG, TikTok, X, Pinterest, etc.)',
    category: 'download',
    react: '📥',

    async function(conn, mek, m, { from, q, reply: taggedReplyFn }) {
        if (!q || !q.includes('http')) {
            return taggedReplyFn(
                'Send any media link!\nExamples:\n.dl https://www.facebook.com/share/r/17RtKpxyi/\n.dl https://www.instagram.com/p/C_abc123/\n.dl https://vm.tiktok.com/ZMabc123/\n.dl https://twitter.com/user/status/12345'
            );
        }

        const url = q.trim();

        try {
            taggedReplyFn('Analyzing link... ⌛ Finding best source');

            // Ordered list of APIs (most reliable for your FB share links first)
            const apis = [
                // 1. Alyachan — best for Facebook share/r/ links, IG, TikTok
                `https://api.alyachan.dev/api/downloader/all?url=${encodeURIComponent(url)}`,
                // 2. SSSTik — strong fallback for TikTok & FB
                `https://ssstik.io/abc?url=${encodeURIComponent(url)}`,
                // 3. SnapInsta style
                `https://snapinsta.app/action2.php?url=${encodeURIComponent(url)}`,
                // 4. Fdownloader (FB specialist)
                `https://fdownloader.net/api/download?url=${encodeURIComponent(url)}`,
                // 5. RapidSave / other fallback
                `https://rapidsave.com/api?url=${encodeURIComponent(url)}`
            ];

            let mediaUrl = null;
            let mediaType = null; // 'video' or 'image'
            let caption = 'Downloaded via GURU MD';

            for (const api of apis) {
                try {
                    const res = await axios.get(api, { timeout: 25000 });
                    const data = res.data;

                    // Common patterns from different APIs
                    if (data?.result?.url || data?.result?.media?.[0]?.url) {
                        mediaUrl = data.result.url || data.result.media[0].url;
                        caption = data.result.title || data.result.caption || caption;
                        mediaType = data.result.type?.includes('image') ? 'image' : 'video';
                        break;
                    }
                    if (data?.url || data?.hd_url || data?.sd_url) {
                        mediaUrl = data.url || data.hd_url || data.sd_url;
                        mediaType = data.type?.includes('image') ? 'image' : 'video';
                        break;
                    }
                    if (data?.video || data?.image || data?.media?.url) {
                        mediaUrl = data.video || data.image || data.media.url;
                        mediaType = data.video ? 'video' : 'image';
                        break;
                    }
                } catch (err) {
                    continue; // Try next API
                }
            }

            if (!mediaUrl || !mediaType) {
                return taggedReplyFn(
                    'Sorry, could not find downloadable media.\n' +
                    'Try a public video/photo link or another site.'
                );
            }

            taggedReplyFn(`Found ${mediaType}! Downloading... ⬇️`);

            const ext = mediaType === 'image' ? '.jpg' : '.mp4';
            const filePath = path.join(__dirname, '../temp', `media_\( {Date.now()} \){ext}`);
            const writer = fs.createWriteStream(filePath);

            const download = await axios.get(mediaUrl, { responseType: 'stream' });
            download.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Send the media
            await conn.sendMessage(from, {
                [mediaType]: { url: filePath },
                caption: caption,
                mimetype: mediaType === 'image' ? 'image/jpeg' : 'video/mp4'
            }, { quoted: mek });

            // Cleanup
            fs.unlinkSync(filePath);

        } catch (e) {
            console.error(e);
            taggedReplyFn('Download failed: ' + (e.message || 'Unknown error. Try another link.'));
        }
    }
};
