const axios = require("axios");

module.exports.config = {
  name: "pair",
  version: "1.0.0",
  aliases: ["ship", "love"],
  credits: "ChatGPT",
  countDown: 5,
  hasPermssion: 0,
  description: "Pair two people with love percentage",
  commandCategory: "fun",
  usages: "{pn} [with <name>]",
};

module.exports.run = async ({ api, event, args }) => {
  try {
    let sender = event.senderID;
    let mentionUser = Object.keys(event.mentions || {})[0];
    let inputText = args.join(" ");

    // Generate random percentages
    const lovePercent = Math.floor(Math.random() * 100) + 1;
    const compatPercent = Math.floor(Math.random() * 100) + 1;

    // Couple anime images (can add more URLs)
    const coupleImages = [
      "https://i.ibb.co/6JPZbkm/couple1.jpg",
      "https://i.ibb.co/zf1czFh/couple2.jpg",
      "https://i.ibb.co/S3Twv0h/couple3.jpg",
    ];
    const randomImage =
      coupleImages[Math.floor(Math.random() * coupleImages.length)];

    let msgBody = "";

    // Case 1: Pair with someone mentioned
    if (mentionUser) {
      msgBody = `💖 Everyone, congratulate the new couple 💖\n\n` +
        `❤️ ${event.senderID} 💕 ${args.join(" ")} ❤️\n` +
        `Love percentage: "${lovePercent}% 💘"\n` +
        `Compatibility ratio: "${compatPercent}% 💞"\n\n` +
        `🎉 Congratulations! 🎉`;
    }

    // Case 2: Pair with "with <name>" text
    else if (inputText.toLowerCase().startsWith("with ")) {
      const name = inputText.slice(5).trim();
      if (!name) return api.sendMessage("⚠️ Please provide a name!", event.threadID, event.messageID);

      msgBody = `💖 Everyone, congratulate the new couple 💖\n\n` +
        `❤️ ${event.senderID} 💕 ${name} ❤️\n` +
        `Love percentage: "${lovePercent}% 💘"\n` +
        `Compatibility ratio: "${compatPercent}% 💞"\n\n` +
        `🎉 Congratulations! 🎉`;
    }

    // Case 3: Random pair (no arguments)
    else {
      msgBody = `💖 Everyone, congratulate the new couple 💖\n\n` +
        `❤️ ${event.senderID} 💕 Random Crush ❤️\n` +
        `Love percentage: "${lovePercent}% 💘"\n` +
        `Compatibility ratio: "${compatPercent}% 💞"\n\n` +
        `🎉 Congratulations! 🎉`;
    }

    // Fetch image
    const imageStream = (await axios.get(randomImage, { responseType: "stream" })).data;

    api.sendMessage(
      {
        body: msgBody,
        attachment: imageStream,
      },
      event.threadID,
      event.messageID
    );
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Error: " + err.message, event.threadID, event.messageID);
  }
};
