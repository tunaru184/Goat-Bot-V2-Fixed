const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 🔹 Get base API URL from GitHub JSON
const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json"
  );
  return base.data.api;
};

module.exports.config = {
  name: "sing",
  version: "3.0.0",
  aliases: ["music", "play"],
  credits: "dipto (optimized by ChatGPT)",
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube",
  commandCategory: "media",
  usages:
    "{pn} [<song name>|<song link>]:" +
    "\n   Example:" +
    "\n{pn} chipi chipi chapa chapa",
};

module.exports.run = async ({ api, args, event }) => {
  const checkurl =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

  let videoID;
  const urlYtb = checkurl.test(args[0]);

  // 🔹 Case 1: Direct YouTube link
  if (urlYtb) {
    const match = args[0].match(checkurl);
    videoID = match ? match[1] : null;

    try {
      const {
        data: { title, downloadLink, quality },
      } = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`
      );

      const fileName = `audio_${Date.now()}.mp3`;
      return api.sendMessage(
        {
          body: `• Title: ${title}\n• Quality: ${quality || "Unknown"}`,
          attachment: await downloadFile(downloadLink, fileName),
        },
        event.threadID,
        () => safeUnlink(fileName),
        event.messageID
      );
    } catch (err) {
      return api.sendMessage(
        "❌ Failed to fetch audio. Reason: " + err.message,
        event.threadID,
        event.messageID
      );
    }
  }

  // 🔹 Case 2: Search by keyword
  let keyWord = args.join(" ");
  keyWord = keyWord.includes("?feature=share")
    ? keyWord.replace("?feature=share", "")
    : keyWord;

  const maxResults = 6;
  let result;

  try {
    result = (
      await axios.get(
        `${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(
          keyWord
        )}`
      )
    ).data;
  } catch (err) {
    return api.sendMessage(
      "❌ Error searching YouTube: " + err.message,
      event.threadID,
      event.messageID
    );
  }

  if (!result || result.length === 0) {
    return api.sendMessage(
      "⭕ No search results found for: " + keyWord,
      event.threadID,
      event.messageID
    );
  }

  // Slice first 6 results (pagination possible)
  const searchResults = result.slice(0, maxResults);

  let msg = "";
  const thumbnails = [];
  let i = 1;

  for (const info of searchResults) {
    const thumbFile = `thumb_${Date.now()}_${i}.jpg`;
    thumbnails.push(await downloadStream(info.thumbnail, thumbFile));
    msg += `${i++}. ${info.title}\n⏱ Time: ${info.time}\n📺 Channel: ${info.channel.name}\n\n`;
  }

  api.sendMessage(
    {
      body: msg + "👉 Reply with a number (1–6) to download",
      attachment: thumbnails,
    },
    event.threadID,
    (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          result: searchResults,
        });
      }
    },
    event.messageID
  );
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
  try {
    const { result } = handleReply;
    const choice = parseInt(event.body);

    if (!isNaN(choice) && choice <= result.length && choice > 0) {
      const infoChoice = result[choice - 1];
      const idvideo = infoChoice.id;

      const {
        data: { title, downloadLink, quality },
      } = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${idvideo}&format=mp3`
      );

      const fileName = `audio_${Date.now()}.mp3`;

      await api.unsendMessage(handleReply.messageID);

      await api.sendMessage(
        {
          body: `• Title: ${title}\n• Quality: ${quality || "Unknown"}`,
          attachment: await downloadFile(downloadLink, fileName),
        },
        event.threadID,
        () => safeUnlink(fileName),
        event.messageID
      );
    } else {
      api.sendMessage(
        "⚠️ Invalid choice. Please enter a number between 1 and 6.",
        event.threadID,
        event.messageID
      );
    }
  } catch (error) {
    console.error(error);
    api.sendMessage(
      "⭕ Unable to fetch audio. Possible reasons: size > 26MB or server error.",
      event.threadID,
      event.messageID
    );
  }
};

// 🔹 Helper function: Download file (audio)
async function downloadFile(url, pathName) {
  try {
    const response = (
      await axios.get(url, {
        responseType: "arraybuffer",
      })
    ).data;

    fs.writeFileSync(pathName, Buffer.from(response));
    return fs.createReadStream(pathName);
  } catch (err) {
    throw err;
  }
}

// 🔹 Helper function: Download image stream (thumbnails)
async function downloadStream(url, pathName) {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    const writer = fs.createWriteStream(pathName);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(fs.createReadStream(pathName)));
      writer.on("error", reject);
    });
  } catch (err) {
    throw err;
  }
}

// 🔹 Helper: Safe file delete
function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("File cleanup error:", err.message);
  }
  }
