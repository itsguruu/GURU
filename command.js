// Make cmd globally available so old plugins can use it
global.cmd = function(info, func) {
    var data = info;
    data.function = func;
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!info.desc) info.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!info.category) data.category = 'misc';
    if (!info.filename) data.filename = "Not Provided";
    commands.push(data);
    return data;
};

var commands = [];

// Export for new-style plugins and compatibility
module.exports = {
    cmd: global.cmd,
    AddCommand: global.cmd,
    Function: global.cmd,
    Module: global.cmd,
    commands,
};

// ──────────────── AUTO-LOAD PLUGINS ────────────────
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
                require(pluginPath);  // This executes the plugin file → calls cmd() if old style

                // After require(), check if it exported a new-style plugin
                const plugin = require(pluginPath);
                if (plugin.pattern && typeof plugin.function === 'function') {
                    // Convert to internal format
                    global.cmd({
                        pattern: plugin.pattern,
                        desc: plugin.desc || '',
                        category: plugin.category || 'misc',
                        react: plugin.react || '',
                        filename: file,
                        fromMe: plugin.fromMe || false,
                        dontAddCommandList: plugin.dontAddCommandList || false
                    }, plugin.function);

                    console.log(`[COMMAND] Loaded new-style: ${file} → ${plugin.pattern}`);
                }

            } catch (err) {
                console.error(`[COMMAND] Failed to load ${file}: ${err.message}`);
            }
        }
    });

    console.log(`[COMMAND] Total commands loaded: ${commands.length}`);
}

// Run loader
loadPlugins();
