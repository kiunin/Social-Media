"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = void 0;
const generateOTP = () => {
    return String(Math.floor(Math.random() * (900000 - 1000000) + 100000));
};
exports.generateOTP = generateOTP;
