"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CurrentUser = (req, res, next) => {
    var _a;
    //check if cookie is provided and if a jwt is in it
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt)) {
        return next();
    }
    //if jwt is invalid, jwt.verify will throw an error
    try {
        const payload = jsonwebtoken_1.default.verify(req.session.jwt, process.env.JWT_KEY);
        // set the optional currentUser field to be user info
        req.currentUser = payload;
    }
    catch (err) { }
    next();
};
exports.CurrentUser = CurrentUser;
