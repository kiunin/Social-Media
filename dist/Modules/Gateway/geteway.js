"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initialize = void 0;
const socket_io_1 = require("socket.io");
const token_1 = require("../../Utils/security/token");
const chat_gateway_1 = require("../Chat/chat.gateway");
let io = null;
const initialize = (httpServer) => {
    io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
    const connectedSockets = new Map();
    io.use(async (socket, next) => {
        try {
            const { user, decoded } = await (0, token_1.decodedToken)({
                authorization: socket.handshake.auth.authorization,
                tokenType: token_1.TokenTypeEnum.ACCESS,
            });
            const userTabs = connectedSockets.get(user._id.toString()) || [];
            userTabs.push(socket.id);
            connectedSockets.set(user._id.toString(), userTabs);
            socket.credentials = { user, decoded };
            next();
        }
        catch (error) {
            next(error);
        }
    });
    function disconnection(socket) {
        socket.on("disconnect", () => {
            const userId = socket.credentials?.user._id?.toString();
            const remainingTabs = connectedSockets.get(userId)?.filter((tab) => {
                return tab !== socket.id;
            }) || [];
            if (remainingTabs.length) {
                connectedSockets.set(userId, remainingTabs);
            }
            else {
                connectedSockets.delete(userId);
            }
            console.log(`logged out: ${connectedSockets}`);
        });
    }
    const chatGateway = new chat_gateway_1.ChatGateway();
    io.on("connection", (socket) => {
        chatGateway.register(socket, (0, exports.getIO)());
        disconnection(socket);
        socket.on("sayHi", (data, callback) => {
            console.log(data);
            callback("Data received");
        });
        socket.emit("product", { id: 1, name: "Product", price: 10000 });
    });
    io.of("/admin").on("connection", (socket) => {
        console.log("Admin Connection", socket.id);
    });
};
exports.initialize = initialize;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};
exports.getIO = getIO;
