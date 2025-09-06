const axios = require("axios");

module.exports.config = {
  name: "pair",
  version: "2.0.0",
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
    let threadInfo = await api.getThreadInfo(event.threadID);
    let participants = threadInfo.participantIDs;

    // Exclude bots
    participants = participants.filter((id) => id != api.getCurrentUserID());

    let sender = event.senderID;
    let mentionUser = Object.keys(event.mentions || {})[0];
    let inputText = args.join(" ");

    // Random couple anime images
    const coupleImages = [
      "https://i.ibb.co/6JPZbkm/couple1.jpg",
      "https://i.ibb.co/zf1czFh/couple2.jpg",
      "https://i.ibb.co/S3Twv0h/couple3.jpg",
    ];
    const randomImage =
      coupleImages[Math.floor(Math.random() * coupleImages.length)];

    // Generate random love/compat %
    const lovePercent = Math.floor(Math.random() * 100) + 1;
    const compatPercent = Math.floor(Math.random() * 100) + 1;

    let msgBody = "";

    // Case 1: Pair with a mention
    if (mentionUser) {
      msgBody =
        `💖 Everyone, congratulate the new couple 💖\n\n` +
        `❤️ ${threadInfo.nicknames[sender] || sender} 💕 ${threadInfo.nicknames[mentionUser] || mentionUser} ❤️\n` +
        `Love percentage: "${lovePercent}% 💘"\n` +
        `Compatibility ratio: "${compatPercent}% 💞"\n\n` +
        `🎉 Congratulations! 🎉`;
    }

    // Case 2: Pair with <name>
    else if (inputText.toLowerCase().startsWith("with ")) {
      const name = inputText.slice(5).trim();
      if (!name)
        return api.sendMessage(
          "⚠️ Please provide a name!",
          event.threadID,
          event.messageID
        );

      msgBody =
        `💖 Everyone, congratulate the new couple 💖\n\n` +
        `❤️ ${threadInfo.nicknames[sender] || sender} 💕 ${name} ❤️\n` +
        `Love percentage: "${lovePercent}% 💘"\n` +
        `Compatibility ratio: "${compatPercent}% 💞"\n\n` +
        `🎉 Congratulations! 🎉`;
    }

    // Case 3: Random male + female pair
    else {
      if (participants.length < 2) {
        return api.sendMessage(
          "⚠️ Not enough members to make a pair!",
          event.threadID,
          event.messageID
        );
      }

      // Pick 2 random members
      let random1 =
        participants[Math.floor(Math.random() * participants.length)];
      let random2;
      do {
        random2 =
          participants[Math.floor(Math.random() * participants.length)];
      } while (random1 === random2);

      msgBody =
        `💖 Random couple from the group 💖\n\n` +
        `❤️ ${threadInfo.nicknames[random1] || random1} 💕 ${
          threadInfo.nicknames[random2] || random2
        } ❤️\n` +
        `Love percentage: "${lovePercent}% 💘"\n` +
        `Compatibility ratio: "${compatPercent}% 💞"\n\n` +
        `🎉 Congratulations! 🎉`;
    }

    // Fetch image
    const imageStream = (
      await axios.get(randomImage, { responseType: "stream" })
    ).data;

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
