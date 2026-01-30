var commands = [];

function cmd(info, func) {
    var data = info;
    data.function = func;
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!info.desc) info.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!info.category) data.category = 'misc';
    if(!info.filename) data.filename = "Not Provided";
    commands.push(data);
    return data;
}

// ──────────────── AUTO-LOAD ALL PLUGINS FROM ./plugins/ ────────────────
const fs = require('fs');
const path = require('path');

function loadPlugins() {
    const pluginsDir = path.join(__dirname, 'plugins');

    if (!fs.existsSync(pluginsDir)) {
        console.log('[COMMAND] Plugins folder not found!');
        return;
    }

    fs.readdirSync(pluginsDir).forEach(file => {
        if (path.extname(file).toLowerCase() === '.js') {
            try {
                const pluginPath = path.join(pluginsDir, file);
                const plugin = require(pluginPath);

                // Case 1: Old style plugin (uses cmd() inside the file)
                // → already pushed via cmd() call during require()

                // Case 2: New style plugin (direct module.exports = { pattern, function })
                if (plugin.pattern && typeof plugin.function === 'function') {
                    // Convert to your internal cmd format for full compatibility
                    const data = {
                        pattern: plugin.pattern,
                        desc: plugin.desc || '',
                        category: plugin.category || 'misc',
                        react: plugin.react || '',
                        filename: plugin.filename || file,
                        function: plugin.function,
                        dontAddCommandList: plugin.dontAddCommandList || false,
                        fromMe: plugin.fromMe || false,
                        alias: plugin.alias || []
                    };
                    commands.push(data);
                    console.log(`[COMMAND] Loaded new-style: ${file} → ${plugin.pattern}`);
                }

            } catch (err) {
                console.error(`[COMMAND] Failed to load ${file}: ${err.message}`);
            }
        }
    });

    console.log(`[COMMAND] Total commands loaded: ${commands.length}`);
}

// Run auto-loader immediately when this file is required
loadPlugins();

module.exports = {
    cmd,
    AddCommand: cmd,
    Function: cmd,
    Module: cmd,
    commands,
};
