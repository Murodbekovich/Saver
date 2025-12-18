const { Bot } = require("./config");
const {
    ACTION,
    ERROR_TYPE,
    LOG_TYPE,
    MESSSAGE,
    MEDIA_TYPE,
} = require("./constants");
const { log, logMessage, logError } = require("./utils");

const sendChatAction = async (context) => {
    const { chatId, messageId, requestedBy, requestUrl, message } = context;
    try {
        await Bot.sendChatAction(chatId, "typing");
    } catch (error) {
        let errorObj = {
            action: ACTION.SEND_CHAT_ACTION,
            errorCode: error?.response?.body?.error_code,
            errorDescription: error?.response?.body?.description,
            requestedBy,
            chatId,
            requestUrl,
        };

        if (error?.response?.body?.error_code === 429) {
            logError({ ...errorObj, type: ERROR_TYPE.RATE_LIMIT });
        } else {
            logError({ ...errorObj, type: ERROR_TYPE.FAILED });
        }
    }
};

const deleteMessages = async (context) => {
    const { chatId, messagesToDelete, requestedBy, requestUrl } = context;
    messagesToDelete.forEach(async (messageId) => {
        try {
            await Bot.deleteMessage(chatId, messageId);
        } catch (error) {
            let errorObj = {
                action: ACTION.DELETE_MESSAGE,
                errorCode: error?.response?.body?.error_code,
                errorDescription: error?.response?.body?.description,
                requestedBy,
                chatId,
                requestUrl,
            };

            if (error?.response?.body?.error_code === 429) {
                logError({ ...errorObj, type: ERROR_TYPE.RATE_LIMIT });
            } else {
                logError({ ...errorObj, type: ERROR_TYPE.FAILED });
            }
        }
    });
};

const sendMessage = async (context) => {
    const { chatId, messageId, requestedBy, requestUrl, message } = context;
    try {
        let res = await Bot.sendMessage(chatId, message);
        return res;
    } catch (error) {
        let errorObj = {
            action: ACTION.SEND_MESSAGE,
            errorCode: error?.response?.body?.error_code,
            errorDescription: error?.response?.body?.description,
            requestedBy,
            chatId,
            requestUrl,
        };
        if (error?.response?.body?.error_code === 429) {
            logError({ ...errorObj, type: ERROR_TYPE.RATE_LIMIT });
            await Bot.sendMessage(chatId, MESSSAGE.COOL_DOWN);
        } else {
            logError({ ...errorObj, type: ERROR_TYPE.FAILED });
        }
    }
};

const sendMediaGroup = async (context) => {
    const {
        chatId,
        messageId,
        requestedBy,
        requestUrl,
        mediaGroupUrls,
        caption,
    } = context;
    try {
        await Bot.sendMediaGroup(chatId, mediaGroupUrls, {
            reply_to_message_id: messageId,

            caption: caption,
        });
        logMessage({
            type: LOG_TYPE.GROUP,
            requestedBy,
            chatId,
            requestUrl,
        });
    } catch (error) {
        let errorObj = {
            action: ACTION.SEND_MEDIA_GROUP,
            errorCode: error?.response?.body?.error_code,
            errorDescription: error?.response?.body?.description,
            requestedBy,
            chatId,
            requestUrl,
        };
        if (error?.response?.body?.error_code === 429) {
            logError({ ...errorObj, type: ERROR_TYPE.RATE_LIMIT });
            await Bot.sendMessage(chatId, MESSSAGE.COOL_DOWN);
        } else {
            logError({ ...errorObj, type: ERROR_TYPE.FAILED });
        }
    }
};

const sendVideo = async (context) => {
    const { chatId, messageId, requestedBy, requestUrl, mediaUrl, caption } =
        context;
    try {
        await Bot.sendVideo(chatId, mediaUrl, {
            reply_to_message_id: messageId,

            caption: caption,
        });
        logMessage({
            type: LOG_TYPE.VIDEO,
            requestedBy,
            chatId,
            requestUrl,
        });
    } catch (error) {
        let errorObj = {
            action: ACTION.SEND_VIDEO,
            errorCode: error?.response?.body?.error_code,
            errorDescription: error?.response?.body?.description,
            requestedBy,
            chatId,
            requestUrl,
        };
        if (error?.response?.body?.error_code === 429) {
            logError({ ...errorObj, type: ERROR_TYPE.RATE_LIMIT });
            await Bot.sendMessage(chatId, MESSSAGE.COOL_DOWN);
        } else if (error?.response?.body?.error_code === 400) {
            log("error?.response?.body ", error?.response?.body);
            await sendMessage({
                ...context,
                message: MESSSAGE.VIDEO_UPLOAD_LIMIT.replace(
                    "mediaUrl",
                    mediaUrl
                ),
            });
            logMessage({
                type: LOG_TYPE.VIDEO_URL,
                requestedBy,
                chatId,
                requestUrl,
            });
        } else {
            logError({ ...errorObj, type: ERROR_TYPE.FAILED });
        }
    }
};

const sendPhoto = async (context) => {
    const { chatId, messageId, requestedBy, requestUrl, mediaUrl, caption } =
        context;
    try {
        await Bot.sendPhoto(chatId, mediaUrl, {
            reply_to_message_id: messageId,
            caption: caption,
        });
        logMessage({
            type: LOG_TYPE.PHOTO,
            requestedBy,
            chatId,
            requestUrl,
        });
    } catch (error) {
        let errorObj = {
            action: ACTION.SEND_PHOTO,
            errorCode: error?.response?.body?.error_code,
            errorDescription: error?.response?.body?.description,
            requestedBy,
            chatId,
            requestUrl,
        };
        if (error?.response?.body?.error_code === 429) {
            logError({ ...errorObj, type: ERROR_TYPE.RATE_LIMIT });
            await Bot.sendMessage(chatId, MESSSAGE.COOL_DOWN);
        } else if (error?.response?.body?.error_code === 400) {
            await sendMessage({
                ...context,
                message: MESSSAGE.VIDEO_UPLOAD_LIMIT.replace(
                    "mediaUrl",
                    mediaUrl
                ),
            });
            logMessage({
                type: LOG_TYPE.PHOTO_URL,
                requestedBy,
                chatId,
                requestUrl,
            });
        } else {
            logError({ ...errorObj, type: ERROR_TYPE.FAILED });
        }
    }
};

const sendRequestedData = async (data) => {
    const {
        chatId,
        messageId,
        requestedBy,
        requestUrl,
        caption,
        mediaUrl,
        mediaType,
        mediaList,
    } = data;

    const messagesToDelete = [];

    const userContext = {
        chatId,
        messageId,
        requestedBy,
        requestUrl,
        message: caption,
    };

    if (chatId) {
        await sendChatAction(userContext);
    }

    const uploadingMessage = await sendMessage({
        ...userContext,
        message: MESSSAGE.INITIATING_UPLOAD,
    });

    if (uploadingMessage) {
        messagesToDelete.push(uploadingMessage?.message_id);
    }

    const uploadContent = async (userContext) => {
        if (mediaType === MEDIA_TYPE.MEDIA_GROUP) {
            const mediaGroupUrls = [];
            for (let i = 0; i < mediaList?.length; i++) {
                let mediaItem = mediaList[i];
                if (mediaItem.mediaType === MEDIA_TYPE.IMAGE) {
                    mediaGroupUrls.push({
                        type: "photo",
                        media: mediaItem.mediaUrl,
                    });
                } else if (mediaItem.mediaType === MEDIA_TYPE.VIDEO) {
                    mediaGroupUrls.push({
                        type: "video",
                        media: mediaItem.mediaUrl,
                    });
                }
            }

            await sendChatAction({ ...userContext, action: "typing" });
            await sendMediaGroup({
                ...userContext,
                mediaGroupUrls,
                caption: caption,
            });
        } else if (mediaType === MEDIA_TYPE.VIDEO) {
            await sendChatAction({ ...userContext, action: "upload_video" });
            await sendVideo({ ...userContext, mediaUrl, caption: caption });
        } else if (mediaType === MEDIA_TYPE.IMAGE) {
            await sendChatAction({ ...userContext, action: "upload_photo" });
            await sendPhoto({ ...userContext, mediaUrl, caption: caption });
        }
    };

    await uploadContent(userContext);

    await deleteMessages({ ...userContext, messagesToDelete });

};

module.exports = {
    sendChatAction,
    deleteMessages,
    sendMessage,
    sendMediaGroup,
    sendVideo,
    sendPhoto,
    sendRequestedData,
};
