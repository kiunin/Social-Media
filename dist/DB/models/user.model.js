"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.userSchema = exports.roleEnum = exports.genderEnum = void 0;
const mongoose_1 = require("mongoose");
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
    email: { type: String, requried: true, unique: true },
    confirmEmailOTP: String,
    confirmedAt: Date,
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.userModel = mongoose_1.models.user || (0, mongoose_1.model)("User", exports.userSchema);
