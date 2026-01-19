const fetch = require('node-fetch');
const config = require('../config');    
const { cmd } = require('../command');

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Show information about GURU-MD GitHub repository",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/itsguruu/GURUH';

    try {
        // Extract username and repo name
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);

        // Fetch repo data from GitHub API
        const response = await fetch(`https://api.github.com/repos/\( {username}/ \){repoName}`);
        
        if (!response.ok) {
            throw new Error(`GitHub API failed: ${response.status} - ${response.statusText}`);
        }

        const repoData = await response.json();

        // Format nice message
        const formattedInfo = `*BOT NAME:* GURU MD\n\n` +
                             `*OWNER:* GuruTech\n\n` +
                             `*STARS:* ${repoData.stargazers_count || 0}\n\n` +
                             `*FORKS:* ${repoData.forks_count || 0}\n\n` +
                             `*GITHUB LINK:*\n> ${repoData.html_url}\n\n` +
                             `*DESCRIPTION:*\n> ${repoData.description || 'No description yet — feel free to contribute!'}\n\n` +
                             `*Don't forget to Star ⭐ & Fork the repo!*\n\n` +
                             `> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        // Send image with caption
        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
            caption: formattedInfo,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363421164015033@newsletter',
                    newsletterName: 'GURU MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Optional: Send voice note (use your own URL or remove this block)
        // await conn.sendMessage(from, {
        //     audio: { url: 'https://your-own-audio-url.m4a' },  // Upload your voice note somewhere (catbox.moe, etc.)
        //     mimetype: 'audio/mp4',
        //     ptt: true,
        //     contextInfo: { 
        //         mentionedJid: [m.sender],
        //         forwardingScore: 999,
        //         isForwarded: true,
        //         forwardedNewsletterMessageInfo: {
        //             newsletterJid: '120363421164015033@newsletter',
        //             newsletterName: 'GURU MD',
        //             serverMessageId: 143
        //         }
        //     }
        // }, { quoted: mek });

    } catch (error) {
        console.error("Repo command error:", error);
        reply("❌ Sorry, couldn't fetch repo info right now. Check your internet or try again later.");
    }
});
