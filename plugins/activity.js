const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

const STATS_FILE = path.join(__dirname, '../data/group_activity.json');

if (!fs.existsSync(STATS_FILE)) {
    fs.writeFileSync(STATS_FILE, JSON.stringify({}));
}

function loadStats() {
    return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
}

function saveStats(stats) {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

cmd({
    pattern: "activity",
    alias: ["stats", "leaderboard", "active"],
    desc: "Show group activity stats (messages sent)",
    category: "group",
    onlyGroup: true
}, async (conn, mek, m, { from, reply, isGroup, groupMetadata }) => {
    try {
        if (!isGroup) return reply("This command works only in groups!");

        const groupId = from;
        const stats = loadStats();
        if (!stats[groupId]) stats[groupId] = {};

        // Get all participants
        const participants = groupMetadata.participants || [];
        const memberStats = {};

        participants.forEach(p => {
            const jid = p.id;
            const count = stats[groupId][jid] || 0;
            if (count > 0) {
                memberStats[jid] = count;
            }
        });

        // Sort by message count
        const sorted = Object.entries(memberStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10); // Top 10

        if (sorted.length === 0) return reply("No activity recorded yet in this group.");

        let text = `📊 *Group Activity Stats* 📊\n${groupMetadata.subject}\n\n`;
        text += `Total tracked messages: ${Object.values(memberStats).reduce((a, b) => a + b, 0)}\n\n`;
        text += `🏆 *Top Active Members*\n\n`;

        sorted.forEach(([jid, count], i) => {
            const name = jid.split('@')[0];
            text += `\( {i + 1}. @ \){name} - ${count} messages\n`;
        });

        // Inactive members (less than 5 messages)
        const inactive = participants.filter(p => {
            const count = stats[groupId][p.id] || 0;
            return count < 5 && !p.admin;
        });

        if (inactive.length > 0) {
            text += `\n😴 *Inactive Members* (less than 5 msgs)\n`;
            inactive.slice(0, 5).forEach(p => {
                text += `- @${p.id.split('@')[0]}\n`;
            });
            if (inactive.length > 5) text += `...and ${inactive.length - 5} more`;
        }

        await reply(text, { mentions: sorted.map(([jid]) => jid) });

    } catch (e) {
        reply("Error getting stats: " + e.message);
    }
});

// Auto-track messages (add this to your main messages.upsert handler)
conn.ev.on('messages.upsert', async (mekUpdate) => {
    const msg = mekUpdate.messages[0];
    if (!msg?.key?.remoteJid?.endsWith('@g.us')) return;

    const groupId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const stats = loadStats();
    if (!stats[groupId]) stats[groupId] = {};
    stats[groupId][sender] = (stats[groupId][sender] || 0) + 1;
    saveStats(stats);
});
