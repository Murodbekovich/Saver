const { REQUEST_STATUS } = require("./constants");
const ContentRequest = require("./models/ContentRequest");
const { log, waitFor } = require("./utils");
const { sendRequestedData } = require("./telegramActions");
const { scrapWithFastDl } = require("./apis");
const Metrics = require("./models/Metrics");

const processRequest = async (request) => {
    const { _id, requestUrl, retryCount, chatId, messageId, requestedBy } = request;
    log(`Processing request: ${_id}`);

    await ContentRequest.findByIdAndUpdate(_id, {
        status: REQUEST_STATUS.PROCESSING,
        updatedAt: new Date(),
    });

    try {
        const result = await scrapWithFastDl(requestUrl);

        if (!result.success) {
            const newRetryCount = retryCount + 1;

            if (newRetryCount <= 5) {
                await ContentRequest.findByIdAndUpdate(_id, {
                    $set: { updatedAt: new Date(), status: REQUEST_STATUS.PENDING },
                    $inc: { retryCount: 1 },
                });
            } else {
                await ContentRequest.findByIdAndDelete(_id);
                log(`Request document deleted: ${_id}`);
            }

            log(`Request ${_id} failed. Retry count: ${newRetryCount}`);
        } else {
            await waitFor(500);
            await sendRequestedData({ ...result.data, chatId, messageId, requestedBy });

            await ContentRequest.findByIdAndDelete(_id);
            log(`Request document completed and deleted: ${_id}`);

            await Metrics.findOneAndUpdate(
                {},
                {
                    $inc: {
                        totalRequests: 1,
                        [`mediaProcessed.${result.data?.mediaType}`]: 1,
                    },
                    $set: { lastUpdated: new Date() },
                },
                { upsert: true, new: true }
            );
        }
    } catch (error) {
        log(`Error processing request ${_id}:`, error);

        const newRetryCount = retryCount + 1;
        if (newRetryCount <= 5) {
            await ContentRequest.findByIdAndUpdate(_id, {
                $set: { updatedAt: new Date(), status: REQUEST_STATUS.PENDING },
                $inc: { retryCount: 1 },
            });
        } else {
            await ContentRequest.findByIdAndDelete(_id);
            log(`Request document deleted after max retries: ${_id}`);
        }
    }
};

const initQueue = async () => {
    log("Starting request processor...");

    const processPendingRequests = async () => {
        const pendingRequests = await ContentRequest.find({
            status: REQUEST_STATUS.PENDING,
            retryCount: { $lt: 5 },
        }).sort({ requestedAt: 1 });

        log(`Fetched ${pendingRequests.length} pending requests from DB.`);

        for (const request of pendingRequests) {
            await processRequest(request);
        }
    };

    await processPendingRequests();
    setInterval(processPendingRequests, 60000);

    const changeStream = ContentRequest.watch();
    changeStream.on("change", async (change) => {
        if (change.operationType === "insert") {
            const newRequest = change.fullDocument;
            log("New request detected:", newRequest._id);
            await processRequest(newRequest);
        }
    });
};

module.exports = { initQueue };
