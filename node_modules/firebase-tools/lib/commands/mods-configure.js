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
const clc = require("cli-color");
const marked = require("marked");
const ora = require("ora");
const TerminalRenderer = require("marked-terminal");
const Command = require("../command");
const error_1 = require("../error");
const getProjectId = require("../getProjectId");
const modsApi = require("../mods/modsApi");
const modsHelper_1 = require("../mods/modsHelper");
const paramHelper = require("../mods/paramHelper");
const requirePermissions = require("../requirePermissions");
const utils = require("../utils");
marked.setOptions({
    renderer: new TerminalRenderer(),
});
exports.default = new Command("mods:configure <instanceId>")
    .description("configure an existing mod instance")
    .option("--params <paramsFile>", "path of params file with .env format.")
    .before(requirePermissions, [])
    .action((instanceId, options) => __awaiter(this, void 0, void 0, function* () {
    const spinner = ora.default(`Configuring ${clc.bold(instanceId)}. This usually takes 3 to 5 minutes...`);
    try {
        const projectId = getProjectId(options, false);
        let existingInstance;
        try {
            existingInstance = yield modsApi.getInstance(projectId, instanceId);
        }
        catch (err) {
            if (err.status === 404) {
                return utils.reject(`No mod instance ${instanceId} found in project ${projectId}.`, {
                    exit: 1,
                });
            }
            throw err;
        }
        const paramSpecWithNewDefaults = paramHelper.getParamsWithCurrentValuesAsDefaults(existingInstance);
        const params = yield paramHelper.getParams(projectId, paramSpecWithNewDefaults, options.params);
        spinner.start();
        const res = yield modsApi.configureInstance(projectId, instanceId, params);
        spinner.stop();
        utils.logLabeledSuccess(modsHelper_1.logPrefix, `successfully configured ${clc.bold(instanceId)}.`);
        return res;
    }
    catch (err) {
        spinner.fail();
        if (!(err instanceof error_1.FirebaseError)) {
            throw new error_1.FirebaseError(`Error occurred while configuring the instance: ${err.message}`, {
                original: err,
            });
        }
        throw err;
    }
}));
//# sourceMappingURL=mods-configure.js.map