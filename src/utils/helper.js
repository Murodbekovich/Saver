const { log } = require("./logs");

const waitFor = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const findMediaByShortCode = (mediaList, shortCode) => {
    return mediaList.find((media) => media.shortCode === shortCode) || null;
};

const isValidInstaUrl = (url) => {
    let response = {
        success: false,
        url,
    };

    try {
        const { host, pathname } = new URL(url);

        if (host !== "www.instagram.com") {
            return response;
        }

        const pathSegments = pathname.trim().split("/").filter(Boolean);
        const [type, shortCode] = pathSegments;

        log("share link type is: " + type);

        if (type === "stories") {
            if (pathSegments.length >= 3) {
                const storyId = pathSegments[2];
                return {
                    success: false
                }
            }
        } else if (shortCode?.length === 11) {
            return {
                url,
                shortCode,
                success: true,
            };
        }

        log(response);
        return response;
    } catch (error) {
        log("error in isValid: ", error);
        log("caused by: ", url);
        return response;
    }
};

module.exports = {
    waitFor,
    findMediaByShortCode,
    isValidInstaUrl,
};
