const User = require("../models/User");

const addOrUpdateUser = async (chatId, userName, firstName) => {
    try {
        const existingUser = await User.findOne({ chatId });

        if (existingUser) {
            existingUser.requestCount += 1;
            existingUser.lastUpdated = new Date();
            await existingUser.save();
            console.log("User updated:", existingUser);
            return existingUser;
        }

        const newUser = new User({
            chatId,
            userName,
            firstName,
            requestCount: 1,
            lastUpdated: new Date(),
        });

        await newUser.save();
        console.log("New user added:", newUser);

        return newUser;
    } catch (error) {
        console.error("Error adding or updating user:", error);
    }
};

module.exports = { addOrUpdateUser };
