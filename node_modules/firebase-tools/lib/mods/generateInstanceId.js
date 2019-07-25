"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const modsApi = require("./modsApi");
const error_1 = require("../error");
const SUFFIX_CHAR_SET = "abcdefghijklmnopqrstuvwxyz0123456789";
function generateInstanceId(projectId, modName) {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceRes = yield modsApi.getInstance(projectId, modName, {
            resolveOnHTTPError: true,
        });
        if (instanceRes.error) {
            if (_.get(instanceRes, "error.code") === 404) {
                return modName;
            }
            throw new error_1.FirebaseError("Unexpected error when generating instance ID:", {
                original: instanceRes.error,
            });
        }
        return `${modName}-${getRandomString(4)}`;
    });
}
exports.generateInstanceId = generateInstanceId;
function getRandomString(length) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += SUFFIX_CHAR_SET.charAt(Math.floor(Math.random() * SUFFIX_CHAR_SET.length));
    }
    return result;
}
exports.getRandomString = getRandomString;
//# sourceMappingURL=generateInstanceId.js.map