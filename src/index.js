require("dotenv").config();
const express = require("express");
const app = express();
const { Bot, connectDB, Browser } = require("./config");
const { initQueue } = require("./queue");
const { log } = require("./utils");
const ContentRequest = require("./models/ContentRequest");
const { MESSSAGE } = require("./constants");
const { sendMessage } = require("./telegramActions");
const { isValidInstaUrl } = require("./utils/helper");
const { addOrUpdateUser } = require("./utils/addOrUpdateUser");

const PORT = process.env.PORT || 6060;

Bot.onText(/^\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userName = msg?.from?.username || "";
    const firstName = msg.from.first_name;
    let welcomeMessage = MESSSAGE.WELCOME.replace("firstName", firstName);

    await sendMessage({ chatId, requestedBy: { userName, firstName }, message: welcomeMessage });
});

Bot.onText(/^https:\/\/www\.instagram\.com(.+)/, async (msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const userMessage = msg.text;
    const userName = msg?.from?.username || "";
    const firstName = msg?.from?.first_name || "";

    const isURL = msg.entities && msg.entities.length > 0 && msg.entities[0].type === "url";
    if (!isURL) return;

    const urlResponse = isValidInstaUrl(userMessage);
    if (!urlResponse.success || !urlResponse.shortCode) return;

    const newRequest = new ContentRequest({
        chatId,
        requestUrl: userMessage,
        shortCode: urlResponse.shortCode,
        requestedBy: { userName, firstName },
        messageId,
    });

    try {
        await newRequest.save();
        await addOrUpdateUser(chatId, userName, firstName);
    } catch (error) {
        log("Error saving content request:", error);
    }
});

if (require.main === module) {
    app.listen(PORT, async () => {
        log(`Insta saver running at http://localhost:${PORT}`);

        try {
            await connectDB();
            await Browser.Open();
            await initQueue(); // Redis yo'q, faqat MongoDB + Telegram
        } catch (error) {
            log("Error during startup:", error);
        }
    });
} else {
    module.exports = app;
}

app.get("/", (req, res) => res.json({ message: "Welcome to Insta Saver Bot" }));
app.get("/test", (req, res) => res.json({ message: "Bot is Online!!" }));

process.on("SIGINT", async () => {
    await Browser.Close();
    process.exit(0);
});