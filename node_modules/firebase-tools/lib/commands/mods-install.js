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
const ora = require("ora");
const TerminalRenderer = require("marked-terminal");
const populatePostinstall_1 = require("../mods/populatePostinstall");
const askUserForConsent = require("../mods/askUserForConsent");
const checkProjectBilling = require("../mods/checkProjectBilling");
const Command = require("../command");
const error_1 = require("../error");
const generateInstanceId_1 = require("../mods/generateInstanceId");
const getProjectId = require("../getProjectId");
const rolesHelper_1 = require("../mods/rolesHelper");
const modsApi = require("../mods/modsApi");
const resolveSource_1 = require("../mods/resolveSource");
const paramHelper = require("../mods/paramHelper");
const modsHelper_1 = require("../mods/modsHelper");
const requirePermissions = require("../requirePermissions");
const utils = require("../utils");
const logger = require("../logger");
marked.setOptions({
    renderer: new TerminalRenderer(),
});
function installMod(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { projectId, source, paramFilePath } = options;
        const spec = source.spec;
        const spinner = ora.default("Installing your mod instance. This usually takes 3 to 5 minutes...");
        try {
            yield checkProjectBilling(projectId, spec.name, spec.billingRequired);
            const roles = spec.roles ? spec.roles.map((role) => role.role) : [];
            yield askUserForConsent.prompt(spec.name, projectId, roles);
            const params = yield paramHelper.getParams(projectId, _.get(spec, "params", []), paramFilePath);
            let instanceId = yield modsHelper_1.getValidInstanceId(projectId, spec.name);
            spinner.start();
            let serviceAccountEmail;
            while (!serviceAccountEmail) {
                try {
                    serviceAccountEmail = yield rolesHelper_1.createServiceAccountAndSetRoles(projectId, _.get(spec, "roles", []), instanceId);
                }
                catch (err) {
                    if (err.status === 409) {
                        spinner.stop();
                        logger.info(err.message);
                        instanceId = yield modsHelper_1.promptForValidInstanceId(`${instanceId}-${generateInstanceId_1.getRandomString(4)}`);
                        spinner.start();
                    }
                    else {
                        throw err;
                    }
                }
            }
            const response = yield modsApi.createInstance(projectId, instanceId, source, params, serviceAccountEmail);
            spinner.stop();
            utils.logLabeledSuccess(modsHelper_1.logPrefix, `successfully installed ${clc.bold(spec.name)}, ` +
                `its Instance ID is ${clc.bold(instanceId)}.`);
            const usageInstruction = _.get(response, "configuration.populatedPostinstallContent") ||
                populatePostinstall_1.populatePostinstall(source.spec.postinstallContent || "", params);
            if (usageInstruction) {
                utils.logLabeledBullet(modsHelper_1.logPrefix, `usage instructions:\n${marked(usageInstruction)}`);
            }
            else {
                logger.debug("No usage instructions provided.");
            }
        }
        catch (err) {
            spinner.fail();
            if (err instanceof error_1.FirebaseError) {
                throw err;
            }
            throw new error_1.FirebaseError(`Error occurred installing mod: ${err.message}`, { original: err });
        }
    });
}
exports.default = new Command("mods:install <modName>")
    .description("install a mod, given <modName> or <modName@versionNumber>")
    .option("--params <paramsFile>", "name of params variables file with .env format.")
    .before(requirePermissions, [])
    .before(modsHelper_1.ensureModsApiEnabled)
    .action((modName, options) => __awaiter(this, void 0, void 0, function* () {
    try {
        const projectId = getProjectId(options, false);
        const paramFilePath = options.params;
        const sourceUrl = yield resolveSource_1.resolveSource(modName);
        const source = yield modsApi.getSource(sourceUrl);
        return installMod({
            paramFilePath,
            projectId,
            source,
        });
    }
    catch (err) {
        if (!(err instanceof error_1.FirebaseError)) {
            throw new error_1.FirebaseError(`Error occurred installing the mod: ${err.message}`, {
                original: err,
            });
        }
        throw err;
    }
}));
//# sourceMappingURL=mods-install.js.map