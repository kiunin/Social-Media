"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenticationService {
    constructor() { }
    signup = async (req, res) => {
        const { username, email, password, confirmPassword } = req.body;
        console.log({ username, email, password, confirmPassword });
        return res.status(201).json({ message: "User Created Successfully" });
    };
    login = (req, res) => {
        const { email, password } = req.body;
        console.log({ email, password });
        return res.status(200).json({ message: "User Logged in Successfully" });
    };
}
exports.default = new AuthenticationService();
