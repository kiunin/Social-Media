"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const chat_events_1 = require("./chat.events");
class ChatGateway {
    constructor() { }
    _chatEvent = new chat_events_1.ChatEvents();
    register = (socket, io) => {
        this._chatEvent.sayHi(socket, io);
        this._chatEvent.sendMessage(socket, io);
    };
}
exports.ChatGateway = ChatGateway;
