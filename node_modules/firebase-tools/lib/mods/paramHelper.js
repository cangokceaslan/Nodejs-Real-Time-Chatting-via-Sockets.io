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
const path = require("path");
const clc = require("cli-color");
const dotenv = require("dotenv");
const fs = require("fs-extra");
const error_1 = require("../error");
const logger = require("../logger");
const modsHelper_1 = require("../mods/modsHelper");
const askUserForParam = require("../mods/askUserForParam");
const track = require("../track");
function setNewDefaults(params, newDefaults) {
    params.forEach((param) => {
        if (newDefaults[param.param.toUpperCase()]) {
            param.default = newDefaults[param.param.toUpperCase()];
        }
    });
    return params;
}
function getParamsWithCurrentValuesAsDefaults(modInstance) {
    const specParams = _.cloneDeep(_.get(modInstance, "configuration.source.spec.params", []));
    const currentParams = _.cloneDeep(_.get(modInstance, "configuration.params", {}));
    return setNewDefaults(specParams, currentParams);
}
exports.getParamsWithCurrentValuesAsDefaults = getParamsWithCurrentValuesAsDefaults;
function getParams(projectId, paramSpecs, envFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        let commandLineParams;
        if (envFilePath) {
            try {
                const buf = fs.readFileSync(path.resolve(envFilePath));
                commandLineParams = dotenv.parse(buf.toString().trim(), { debug: true });
                track("Mod Env File", "Present");
            }
            catch (err) {
                track("Mod Env File", "Invalid");
                throw new error_1.FirebaseError(`Error reading env file: ${err.message}\n`, { original: err });
            }
        }
        else {
            track("Mod Env File", "Not Present");
        }
        const firebaseProjectParams = yield modsHelper_1.getFirebaseProjectParams(projectId);
        let params;
        if (commandLineParams) {
            params = modsHelper_1.populateDefaultParams(commandLineParams, paramSpecs);
            modsHelper_1.validateCommandLineParams(params, paramSpecs);
        }
        else {
            params = yield askUserForParam.ask(paramSpecs, firebaseProjectParams);
        }
        track("Mod Params", _.isEmpty(params) ? "Not Present" : "Present", _.size(params));
        return params;
    });
}
exports.getParams = getParams;
function promptForNewParams(spec, newSpec, currentParams) {
    return __awaiter(this, void 0, void 0, function* () {
        const paramsDiffDeletions = _.differenceWith(spec.params, _.get(newSpec, "params", []), _.isEqual);
        const paramsDiffAdditions = _.differenceWith(newSpec.params, _.get(spec, "params", []), _.isEqual);
        if (paramsDiffDeletions.length) {
            logger.info("The following params will no longer be used:");
            paramsDiffDeletions.forEach((param) => {
                logger.info(clc.red(`- ${param.param}: ${currentParams[param.param.toUpperCase()]}`));
                delete currentParams[param.param.toUpperCase()];
            });
        }
        if (paramsDiffAdditions.length) {
            logger.info("Please configure the following new params:");
            for (const param of paramsDiffAdditions) {
                const chosenValue = yield askUserForParam.askForParam(param);
                currentParams[param.param] = chosenValue;
            }
        }
        return currentParams;
    });
}
exports.promptForNewParams = promptForNewParams;
//# sourceMappingURL=paramHelper.js.map