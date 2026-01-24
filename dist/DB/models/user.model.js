"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.userSchema = exports.roleEnum = exports.genderEnum = void 0;
const mongoose_1 = require("mongoose");
const hash_1 = require("../../Utils/security/hash");
const email_events_1 = require("../../Utils/events/email.events");
var genderEnum;
(function (genderEnum) {
    genderEnum["MALE"] = "MALE";
    genderEnum["FEMALE"] = "FEMALE";
})(genderEnum || (exports.genderEnum = genderEnum = {}));
var roleEnum;
(function (roleEnum) {
    roleEnum["USER"] = "USER";
    roleEnum["ADMIN"] = "ADMIN";
})(roleEnum || (exports.roleEnum = roleEnum = {}));
exports.userSchema = new mongoose_1.Schema({
    firstName: { type: String, requried: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, requried: true, minLength: 2, maxLength: 25 },
    slug: { type: String, requried: true, minLength: 2, maxLength: 51 },
    email: { type: String, requried: true, unique: true },
    confirmEmailOTP: String,
    confirmedAt: Date,
    changeCredentialsTime: Date,
    password: { type: String, requried: true },
    resetPasswordOTP: String,
    phone: String,
    address: String,
    gender: { type: String, enum: Object.values(genderEnum) },
    role: {
        type: String,
        enum: Object.values(roleEnum),
        default: roleEnum.USER,
    },
    profileImage: String,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, slug: value.replaceAll(/\s+/g, "-") });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.userSchema.pre("save", async function (next) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
        this.password = await (0, hash_1.generateHash)(this.password);
    }
    if (this.isModified("confirmEmailOTP")) {
        this.confirmEmailPlainOTP = this.confirmEmailOTP;
        this.confirmEmailOTP = await (0, hash_1.generateHash)(this.confirmEmailOTP);
    }
});
exports.userSchema.post("save", async function (doc, next) {
    const that = this;
    if (that.wasNew && that.confirmEmailPlainOTP) {
        await email_events_1.emailEvent.emit("confirmEmail", {
            to: this.email,
            uesrname: this.username,
            otp: that.confirmEmailPlainOTP,
        });
    }
});
exports.UserModel = mongoose_1.models.user || (0, mongoose_1.model)("User", exports.userSchema);
