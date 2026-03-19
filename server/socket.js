const User = require("./models/User");

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("joinRoom", async ({ userId }) => {
            console.log("userId:", userId);
            socket.join(userId); // create a room for the user

            try {
                const user = await User.findByIdAndUpdate(userId, {
                    socketId: socket.id,
                    isOnline: true,
                }, { new: true });
                console.log("User updated:", user);
            }
            catch (err) {
                console.error("Error updating user socketId:", err);
            }
        })
        socket.on("disconnect", async () => {
            try {
                await User.findOneAndUpdate(
                    { socketId: socket.id },
                    {
                        isOnline: false,
                        socketId: null,
                    });
            } catch (error) {
                console.error("Error updating user on disconnect:", error);
            }

        })
    })
}

module.exports = socketHandler
