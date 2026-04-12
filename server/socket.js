const DeliveryAssignment = require("./models/deliveryAssignment");
const Order = require("./models/Order");
const User = require("./models/User");

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("joinRoom", async ({ userId }) => {
            console.log("userId:", userId);
            socket.userId = userId; // attach userId to socket for later use
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

        socket.on("deliveryLocationUpdate", async (data) => {
            try {
                const userId = socket.userId;

                const assignment = await DeliveryAssignment.findOne({
                    assignedTo: userId,
                    status: "assigned",
                })
                if (!assignment) return;

                const order = await Order.findById(assignment.order).populate("user");

                if (order?.user?.socketId) {
                    io.to(order.user.socketId).emit("deliveryLocationUpdate", {
                        lat: data.latitude,
                        lon: data.longitude,
                    });
                }
                io.to(socket.id).emit("deliveryLocationUpdate",{
                    lat: data.latitude,
                    lon: data.longitude,
                })
                const user = await User.findByIdAndUpdate(userId, {
                    location: {
                        type: "Point",
                        coordinates: [data.latitude, data.longitude],
                    },
                    isOnline: true,
                    socketId: socket.id,
                });

                if (user) {

                }

            } catch (err) {
                console.error("Error updating user location:", err);
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
