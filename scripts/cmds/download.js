const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "download",
  version: "1.1.0",
  hasPermssion: 2, // Admin only
  credits: "Otaku bot team (fixed by ChatGPT)",
  description: "Download files into bot's folder",
  commandCategory: "System",
  usages: "download <link> || download <subfolder> <link>",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    if (args.length === 0) {
      return api.sendMessage(
        "⚠️ Usage: download <link> OR download <subfolder> <link>",
        event.threadID,
        event.messageID
      );
    }

    let savePath;
    let link;

    if (args.length === 1) {
      // Case: download <link>
      link = args[0];
      savePath = __dirname;
    } else {
      // Case: download <subfolder> <link>
      const folder = args[0];
      link = args.slice(1).join(" ");
      savePath = path.join(__dirname, folder);

      // Ensure folder exists
      if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
      }
    }

    // Extract filename from link
    const fileName = path.basename(new URL(link).pathname);
    const fullPath = path.join(savePath, fileName);

    // Download file
    const response = await axios.get(link, { responseType: "arraybuffer" });
    fs.writeFileSync(fullPath, Buffer.from(response.data));

    return api.sendMessage(
      `✅ File saved successfully!\n📂 Path: ${fullPath}`,
      event.threadID,
      event.messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "❌ Download failed: " + err.message,
      event.threadID,
      event.messageID
    );
  }
};
