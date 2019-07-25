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
const prompt_1 = require("../prompt");
function onceWithJoin(question) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield prompt_1.promptOnce(question);
        if (Array.isArray(response)) {
            return response.join(",");
        }
        return response;
    });
}
exports.onceWithJoin = onceWithJoin;
function convertModOptionToLabeledList(options) {
    return options.map((option) => {
        return {
            checked: false,
            name: option.label || option.value,
        };
    });
}
exports.convertModOptionToLabeledList = convertModOptionToLabeledList;
function modOptionToValue(label, options) {
    for (const option of options) {
        if (label === option.label || label === option.value) {
            return option.value;
        }
    }
    return "";
}
exports.modOptionToValue = modOptionToValue;
//# sourceMappingURL=utils.js.map