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
const clc = require("cli-color");
const marked = require("marked");
const modsHelper_1 = require("./modsHelper");
const utils_1 = require("./utils");
const logger = require("../logger");
const prompt_1 = require("../prompt");
const utils = require("../utils");
function checkResponse(response, spec) {
    if (spec.required && !response) {
        utils.logWarning("You are required to enter a value for this question");
        return false;
    }
    let responses;
    if (spec.type === "MULTISELECT") {
        responses = response.split(",");
    }
    else {
        responses = [response];
    }
    if (spec.validationRegex) {
        const re = new RegExp(spec.validationRegex);
        let valid = true;
        _.forEach(responses, (resp) => {
            if (!re.test(resp)) {
                const genericWarn = `${resp} is not a valid answer since it` +
                    ` does not fit the regular expression "${spec.validationRegex}"`;
                utils.logWarning(spec.validationErrorMessage || genericWarn);
                valid = false;
            }
        });
        if (!valid) {
            return false;
        }
    }
    if (spec.type === "MULTISELECT" || spec.type === "SELECT") {
        return !_.some(responses, (r) => {
            if (!utils_1.modOptionToValue(r, spec.options)) {
                utils.logWarning(`${r} is not a valid option for ${spec.param}.`);
                return true;
            }
        });
    }
    return true;
}
exports.checkResponse = checkResponse;
function askForParam(paramSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        let valid = false;
        let response = "";
        const description = paramSpec.description || "";
        const label = paramSpec.label.trim();
        logger.info(`\n${clc.bold(label)}: ${marked(description).trim()}`);
        while (!valid) {
            switch (paramSpec.type) {
                case "SELECT":
                    response = yield prompt_1.promptOnce({
                        name: "input",
                        type: "list",
                        default: () => {
                            if (paramSpec.default) {
                                return getInquirerDefault(_.get(paramSpec, "options", []), paramSpec.default);
                            }
                        },
                        message: "Which option do you want enabled for this parameter? " +
                            "Select an option with the arrow keys, and use Enter to confirm your choice. " +
                            "You may only select one option.",
                        choices: utils_1.convertModOptionToLabeledList(paramSpec.options),
                    });
                    break;
                case "MULTISELECT":
                    response = yield utils_1.onceWithJoin({
                        name: "input",
                        type: "checkbox",
                        default: () => {
                            if (paramSpec.default) {
                                const defaults = paramSpec.default.split(",");
                                return defaults.map((def) => {
                                    return getInquirerDefault(_.get(paramSpec, "options", []), def);
                                });
                            }
                        },
                        message: "Which options do you want enabled for this parameter? " +
                            "Press Space to select, then Enter to confirm your choices. " +
                            "You may select multiple options.",
                        choices: utils_1.convertModOptionToLabeledList(paramSpec.options),
                    });
                    break;
                default:
                    response = yield prompt_1.promptOnce({
                        name: paramSpec.param,
                        type: "input",
                        default: paramSpec.default,
                        message: `Enter a value for ${label}:`,
                    });
            }
            valid = checkResponse(response, paramSpec);
        }
        if (paramSpec.type === "SELECT") {
            response = utils_1.modOptionToValue(response, paramSpec.options);
        }
        if (paramSpec.type === "MULTISELECT") {
            response = _.map(response.split(","), (r) => utils_1.modOptionToValue(r, paramSpec.options)).join(",");
        }
        return response;
    });
}
exports.askForParam = askForParam;
function getInquirerDefault(options, def) {
    const defaultOption = _.find(options, (option) => {
        return option.value === def;
    });
    return defaultOption ? defaultOption.label || defaultOption.value : "";
}
exports.getInquirerDefault = getInquirerDefault;
function ask(paramSpecs, firebaseProjectParams) {
    return __awaiter(this, void 0, void 0, function* () {
        if (_.isEmpty(paramSpecs)) {
            logger.debug("No params were specified for this mod.");
            return {};
        }
        utils.logLabeledBullet(modsHelper_1.logPrefix, "answer the questions below to configure your mod:");
        const substituted = modsHelper_1.substituteParams(paramSpecs, firebaseProjectParams);
        const result = {};
        const promises = _.map(substituted, (paramSpec) => {
            return () => __awaiter(this, void 0, void 0, function* () {
                result[paramSpec.param] = yield askForParam(paramSpec);
            });
        });
        yield promises.reduce((prev, cur) => prev.then(cur), Promise.resolve());
        logger.info();
        return result;
    });
}
exports.ask = ask;
//# sourceMappingURL=askUserForParam.js.map