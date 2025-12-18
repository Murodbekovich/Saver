const { MEDIA_TYPE } = require("../constants");

const extractShortCode = (url) => {
    const regex = /\/(?:reel|p)\/([a-zA-Z0-9_-]+)/;

    const match = url.match(regex);

    return match ? match[1] : null;
};

const domainCleaner = (url) => {
    const instagramRegex = /^https:\/\/www\.instagram\.com\//i;

    try {
        if (!instagramRegex.test(url)) {
            throw new Error("Please send a valid Instagram URL");
        }

        return { success: true, data: url };
    } catch (error) {
        return { success: false, data: error.message };
    }
};

const cleanEdgeList = (streamList) => {
    return streamList.map(({ node }) => {
        const mediaType = node.__typename;
        const ownerId = node?.owner?.id;
        const userName = node?.owner?.username;
        let mediaUrl = "";
        let mediaList = [];
        const caption = node.edge_media_to_caption?.edges[0]?.node?.text;

        switch (mediaType) {
            case MEDIA_TYPE.IMAGE:
                mediaUrl = node.display_url;
                break;
            case MEDIA_TYPE.VIDEO:
                mediaUrl = node.video_url;
                break;
            case MEDIA_TYPE.MEDIA_GROUP:
                mediaList = cleanEdgeList(node.edge_sidecar_to_children.edges);
                break;
            default:
                mediaUrl = node.display_url;
                break;
        }

        return {
            mediaUrl,
            mediaList,
            caption,
            ownerId,
            userName,
            mediaType,
        };
    });
};

const cleanTimelineResponse = (streamList) => {
    return streamList.map(({ node }) => {
        const mediaType = node?.__typename;
        const displayUrl = node?.display_url;
        const thumbnailUrl = node?.thumbnail_src;
        const videoUrl = node?.video_url;
        const caption = node?.edge_media_to_caption?.edges[0]?.node?.text || "";
        const owner = {
            userName: node?.owner?.username,
            avatarUrl: node?.owner?.profile_pic_url,
            fullName: node?.owner?.full_name,
        };

        const resultItem = {
            shortCode: node.shortcode,
            mediaUrl: videoUrl || displayUrl,
            displayUrl,
            thumbnailUrl,
            mediaType,
            caption,
            owner,
        };

        if (mediaType === MEDIA_TYPE.MEDIA_GROUP) {
            resultItem.mediaList = cleanEdgeList(
                node.edge_sidecar_to_children.edges
            );
        }

        return resultItem;
    });
};
module.exports = {
    extractShortCode,
    domainCleaner,
    cleanEdgeList,
    cleanTimelineResponse,
};
