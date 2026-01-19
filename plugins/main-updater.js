const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const { setCommitHash, getCommitHash } = require('../data/updateDB');

cmd({
    pattern: "update",
    alias: ["upgrade", "sync"],
    react: '🆙',
    desc: "Update the bot to the latest version from your repo with version check.",
    category: "misc",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {
    if (!isOwner) return reply("This command is only for the bot owner.");

    try {
        await reply("🔍 Checking for GURU-MD updates...");

        // Fetch latest commit hash
        const { data: commitData } = await axios.get("https://api.github.com/repos/itsguruu/GURUH/commits/main");
        const latestCommitHash = commitData.sha;

        const currentHash = await getCommitHash();

        // Fetch remote version from package.json on GitHub
        const { data: remotePkg } = await axios.get("https://raw.githubusercontent.com/itsguruu/GURUH/main/package.json");
        const remoteVersion = JSON.parse(remotePkg).version || "unknown";

        // Get local version from package.json
        let localVersion = "unknown";
        const localPkgPath = path.join(__dirname, '..', 'package.json');
        if (fs.existsSync(localPkgPath)) {
            const localPkg = JSON.parse(fs.readFileSync(localPkgPath, 'utf8'));
            localVersion = localPkg.version || "unknown";
        }

        await reply(`Current version: ${localVersion} | Latest on repo: ${remoteVersion}`);

        if (latestCommitHash === currentHash) {
            return reply("✅ Your GURU-MD is already on the latest commit (no new changes).");
        }

        // Optional: simple version comparison (you can improve with semver lib if needed)
        if (localVersion !== "unknown" && remoteVersion !== "unknown" && localVersion === remoteVersion) {
            return reply("✅ Versions match, but new commit detected. Updating anyway...");
        }

        await reply(`🚀 Updating GURU-MD to version ${remoteVersion} from https://github.com/itsguruu/GURUH ...`);

        // Download ZIP
        const zipPath = path.join(__dirname, "latest.zip");
        const { data: zipData } = await axios.get("https://github.com/itsguruu/GURUH/archive/main.zip", { responseType: "arraybuffer" });
        fs.writeFileSync(zipPath, zipData);

        // Extract
        await reply("📦 Extracting latest code...");
        const extractPath = path.join(__dirname, 'latest');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        // Copy files, skip config & app.json
        await reply("🔄 Applying updates (preserving your config.js & app.json)...");
        const sourcePath = path.join(extractPath, "GURUH-main");
        const destinationPath = path.join(__dirname, '..');
        copyFolderSync(sourcePath, destinationPath);

        // Update commit hash
        await setCommitHash(latestCommitHash);

        // Cleanup
        fs.unlinkSync(zipPath);
        fs.rmSync(extractPath, { recursive: true, force: true });

        await reply(`✅ Update to version ${remoteVersion} complete! Restarting the bot...`);
        process.exit(0);

    } catch (error) {
        console.error("Update error:", error.message);
        return reply(`❌ Update failed: ${error.message || "Unknown error"}. Try manual pull.`);
    }
});

// Same copy helper as before
function copyFolderSync(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

        if (item === "config.js" || item === "app.json") {
            console.log(`Skipping ${item} to preserve your custom settings.`);
            continue;
        }

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
