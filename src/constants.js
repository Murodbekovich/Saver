const LOG_TYPE = {
    GROUP: "GROUP",
    VIDEO: "VIDEO",
    VIDEO_URL: "VIDEO_URL",
    PHOTO: "PHOTO",
    PHOTO_URL: "PHOTO_URL",
};

const ERROR_TYPE = {
    RATE_LIMIT: "Limitga mos kelmadi 😢.",
    FAILED: "Xatolik 😢.",
};

const ACTION = {
    SEND_CHAT_ACTION: "sendChatAction",
    SEND_MESSAGE: "sendMessage",
    DELETE_MESSAGE: "deleteMessage",
    SEND_VIDEO: "sendVideo",
    SEND_PHOTO: "sendPhoto",
    SEND_MEDIA_GROUP: "sendMediaGroup",
};

const SUCCESS_MESSAGE = {
    GROUP: "Media group sent successfully ✅",
    VIDEO: "Video sent successfully ✅",
    VIDEO_URL: "Video url sent successfully ✅",
    PHOTO: "Photo sent successfully ✅",
    PHOTO_URL: "Photo url sent successfully ✅",
};

const MESSSAGE = {
    HELLO: "Hello from InstaSaver Bot!",
    WELCOME:
        "Salom firstName, 👋\nInstagram videolarini sfatli yuklovchi amatov botiga hush kelibsiz!",
    GATHERING_CONTENT: "Content qidirilmoqda 🔍",
    INITIATING_UPLOAD: "Yuklanmoqda 🚀",
    DOWNLOADING: "➡️  Downloading post for: requestUrl 📥",
    VIDEO_UPLOAD_LIMIT:
        "Videoni yuborib bo‘lmadi 😢 \nU Bot yuklash chegarasidan oshib ketgan bo‘lishi mumkin. \n\nIltimos Videoni quyidagi havoladan yuklab oling: \nmediaUrl",
    PHOTO_UPLOAD_LIMIT:
        "Rasmni yuborib bo‘lmadi 😢 \nU Bot yuklash chegarasidan oshib ketgan bo‘lishi mumkin. \n\nIltimos Rasmni quyidagi havoladan yuklab oling: \nmediaUrl",
};

const REQUEST_STATUS = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    DONE: "DONE",
    FAILED: "FAILED",
};

const MEDIA_TYPE = {
    VIDEO: "GraphVideo",
    IMAGE: "GraphImage",
    MEDIA_GROUP: "GraphSidecar",
};

const INSTAGRAM_API_URL = "https://www.instagram.com/graphql/query";

module.exports = {
    LOG_TYPE,
    ERROR_TYPE,
    ACTION,
    SUCCESS_MESSAGE,
    MESSSAGE,
    REQUEST_STATUS,
    MEDIA_TYPE,
    INSTAGRAM_API_URL,
};