const { cmd } = require('../command');

global.AUTO_VIEW_STATUS = false;

cmd({
    pattern: "autoviewstatus",
    desc: "Toggle auto view status (mark as seen)",
    category: "utility",
    react: "👀",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        global.AUTO_VIEW_STATUS = !global.AUTO_VIEW_STATUS;

        const status = global.AUTO_VIEW_STATUS ? "ON ✅" : "OFF ❌";

        reply(`Auto View Status: *${status}*\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);

    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message || e}`);
    }
});
