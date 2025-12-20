"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = __importDefault(require("node:events"));
const verify_email_template_1 = require("../email/verify.email.template");
const send_email_1 = require("../email/send.email");
exports.emailEvent = new node_events_1.default();
exports.emailEvent.on("confirmEmail", async (data) => {
    try {
        data.subject = "Confirm Your Email";
        data.html = (0, verify_email_template_1.template)(data.otp, data.username, data.subject);
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.log("Error sending Email", error);
    }
});
