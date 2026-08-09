const DeliveryAssignment = require("./models/deliveryAssignment");
const Order = require("./models/Order");
const User = require("./models/User");

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("joinRoom", async ({ userId }) => {
            try {
                if (!userId) return;

                console.log("userId:", userId);
                socket.userId = userId; // attach userId to socket for later use
                socket.join(String(userId)); // create a room for the user

                await User.findByIdAndUpdate(userId, {
                    socketId: socket.id,
                    isOnline: true,
                },
                    { new: true }
                );

                console.log("✅ User socket registered:", userId);
            }
            catch (err) {
                console.error("Error updating user socketId:", err);
            }
        })

        socket.on("deliveryLocationUpdate", async (data) => {
            try {
                const userId = socket.userId;
                if (!userId) return; // if userId not set, exit early

                const { latitude, longitude } = data;

                if (
                    typeof latitude !== "number" ||
                    typeof longitude !== "number"
                ) {
                    console.log("⚠️ Invalid location:", data);
                    return;
                }

                // save delivery boy location
                await User.findByIdAndUpdate(
                    userId, {
                    location: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    isOnline: true,
                    socketId: socket.id,

                });

                console.log("📍 Location saved:", {
                    userId,
                    latitude,
                    longitude,
                });

                // if currently assigned to an order
                const assignment = await DeliveryAssignment.findOne({
                    assignedTo: userId,
                    status: "assigned",
                })
                if (!assignment) return;

                // get customer
                const order = await Order.findById(assignment.order).populate("user");

                if (!order?.user?.socketId) {
                    console.log("⚠️ Customer socket not available");
                    return;
                }

                io.to(order.user.socketId).emit("deliveryLocationUpdate", {
                    lat: latitude,
                    lon: longitude,
                });

                console.log(
                    "📡 Location sent to customer:",
                    order.user._id
                );

            } catch (err) {
                console.error("❌ Error updating user location:", err);
            }
        })

        socket.on("goOffline", async () => {
            try {
                const userId = socket.userId;
                if (!userId) return;

                await User.findByIdAndUpdate(userId,
                    {
                        isOnline: false,
                    });
                console.log("User marked offline:", userId);
            } catch (error) {
                console.error("Error updating user on disconnect:", error);
            }

        });

        socket.on("disconnect", async () => {
            try {
                const userId = socket.userId;

                if (!userId) return;

                await User.findByIdAndUpdate(userId, {
                    isOnline: false,
                });

                console.log(
                    "🔴 User disconnected:",
                    userId
                );
            } catch (error) {
                console.error(
                    "❌ Error handling disconnect:",
                    error
                );
            }
        });
    });
};

module.exports = socketHandler
