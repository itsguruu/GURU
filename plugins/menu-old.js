const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "menu",
    desc: "menu the bot",
    category: "menu",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply }) => {
    try {
        const dec = `╭━━━〔 *GURU MD Main Menu* 〕━━━╮
┃ 🖤 *𝙊𝙬𝙣𝙚𝙧:* +254 778 074353
┃ 🖤 *𝙈𝙤𝙙𝙚:* ${config.MODE}
┃ 🖤 *𝙥𝙡𝙖𝙩𝙛𝙤𝙧𝙢:* GuruTech lab
┃ 🖤 *𝙏𝙮𝙥𝙚:* Node.Js (Multi Device)
┃ 🖤 *𝙋𝙧𝙚𝙛𝙞𝙭:* ${config.PREFIX}
┃ 🖤 *𝙑𝙚𝙧𝙨𝙞𝙤𝙣:* 5.0.0 Pro
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🧩 *Command Categories* 〕━━╮
┃ 🖤 Quranmenu
┃ 🖤 Prayertime
┃ 🖤 Aimenu
┃ 🖤 Anmiemenu
┃ 🖤 Reactions
┃ 🖤 Convertmenu
┃ 🖤 Funmenu
┃ 🖤 Dlmenu
┃ 🖤 Listcmd
┃ 🖤 Mainmenu
┃ 🖤 Groupmenu
┃ 🖤 Allmenu
┃ 🖤 Ownermenu
┃ 🖤 Othermenu
┃ 🖤 Logo
┃ 🖤 Repo
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(
            from,
            {
                image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
                caption: dec,
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
            },
            { quoted: mek }
        );

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });
        
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// Logo Menu
cmd({
    pattern: "logo",
    alias: ["logomenu"],
    desc: "menu the bot",
    category: "menu",
    react: "🧃",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `╭━━〔 *Logo List* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• neonlight
┃◈┃• blackpink
┃◈┃• dragonball
┃◈┃• 3dcomic
┃◈┃• america
┃◈┃• naruto
┃◈┃• sadgirl
┃◈┃• clouds
┃◈┃• futuristic
┃◈┃• 3dpaper
┃◈┃• eraser
┃◈┃• sunset
┃◈┃• leaf
┃◈┃• galaxy
┃◈┃• sans
┃◈┃• boom
┃◈┃• hacker
┃◈┃• devilwings
┃◈┃• nigeria
┃◈┃• bulb
┃◈┃• angelwings
┃◈┃• zodiac
┃◈┃• luxury
┃◈┃• paint
┃◈┃• frozen
┃◈┃• castle
┃◈┃• tatoo
┃◈┃• valorant
┃◈┃• bear
┃◈┃• typography
┃◈┃• birthday
┃◈└───────────┈⊷
╰──────────────┈⊷
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(
            from,
            {
                image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
                caption: dec,
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
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// Reactions Menu
cmd({
    pattern: "reactions",
    desc: "Shows the reaction commands",
    category: "menu",
    react: "💫",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, reply }) => {
    try {
        let dec = `╭━━〔 *Reactions Menu* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• bully @tag
┃◈┃• cuddle @tag
┃◈┃• cry @tag
┃◈┃• hug @tag
┃◈┃• awoo @tag
┃◈┃• kiss @tag
┃◈┃• lick @tag
┃◈┃• pat @tag
┃◈┃• smug @tag
┃◈┃• bonk @tag
┃◈┃• yeet @tag
┃◈┃• blush @tag
┃◈┃• smile @tag
┃◈┃• wave @tag
┃◈┃• highfive @tag
┃◈┃• handhold @tag
┃◈┃• nom @tag
┃◈┃• bite @tag
┃◈┃• glomp @tag
┃◈┃• slap @tag
┃◈┃• kill @tag
┃◈┃• happy @tag
┃◈┃• wink @tag
┃◈┃• poke @tag
┃◈┃• dance @tag
┃◈┃• cringe @tag
┃◈└───────────┈⊷
╰──────────────┈⊷
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(
            from,
            {
                image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
                caption: dec,
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
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// DL Menu
cmd({
    pattern: "dlmenu",
    desc: "menu the bot",
    category: "menu",
    react: "⤵️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `╭━━〔 *Download Menu* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• facebook
┃◈┃• mediafire
┃◈┃• tiktok
┃◈┃• twitter
┃◈┃• Insta
┃◈┃• apk
┃◈┃• img
┃◈┃• tt2
┃◈┃• pins
┃◈┃• apk2
┃◈┃• fb2
┃◈┃• pinterest 
┃◈┃• spotify
┃◈┃• play
┃◈┃• play2
┃◈┃• play3
┃◈┃• play4
┃◈┃• play5
┃◈┃• play6
┃◈┃• play7
┃◈┃• play8
┃◈┃• play9
┃◈┃• play10
┃◈┃• audio
┃◈┃• video
┃◈┃• video2
┃◈┃• video3
┃◈┃• video4
┃◈┃• video5
┃◈┃• video6
┃◈┃• video7
┃◈┃• video8
┃◈┃• video9
┃◈┃• video10
┃◈┃• ytmp3
┃◈┃• ytmp4
┃◈┃• song
┃◈┃• darama
┃◈┃• gdrive
┃◈┃• ssweb
┃◈┃• tiks
┃◈└───────────┈⊷
╰──────────────┈⊷
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(
            from,
            {
                image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
                caption: dec,
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
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// Group Menu (and all other menu commands follow the same pattern...)
cmd({
    pattern: "groupmenu",
    desc: "menu the bot",
    category: "menu",
    react: "⤵️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `╭━━〔 *Group Menu* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• grouplink
┃◈┃• kickall
┃◈┃• kickall2
┃◈┃• kickall3
┃◈┃• add
┃◈┃• remove
┃◈┃• kick
┃◈┃• promote 
┃◈┃• demote
┃◈┃• dismiss 
┃◈┃• revoke
┃◈┃• setgoodbye
┃◈┃• setwelcome
┃◈┃• delete 
┃◈┃• getpic
┃◈┃• ginfo
┃◈┃• disappear on
┃◈┃• disappear off
┃◈┃• disappear 7D,24H
┃◈┃• allreq
┃◈┃• updategname
┃◈┃• updategdesc
┃◈┃• joinrequests
┃◈┃• senddm
┃◈┃• nikal
┃◈┃• mute
┃◈┃• unmute
┃◈┃• lockgc
┃◈┃• unlockgc
┃◈┃• invite
┃◈┃• tag
┃◈┃• hidetag
┃◈┃• tagall
┃◈┃• tagadmins
┃◈└───────────┈⊷
╰──────────────┈⊷
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(
            from,
            {
                image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
                caption: dec,
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
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// ... (all other menu commands like funmenu, othermenu, mainmenu, ownermenu, convertmenu, animemenu, aimenu follow the exact same pattern)
// Just replace the image URL with "https://files.catbox.moe/ntfw9h.jpg"
// Change bot name in caption to "GURU MD"
// Change footer to "© ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech"
// Update newsletter to '120363421164015033@newsletter' and 'GURU MD'
