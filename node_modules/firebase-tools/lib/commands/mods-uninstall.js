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
const ora = require("ora");
const Command = require("../command");
const error_1 = require("../error");
const getProjectId = require("../getProjectId");
const gcp_1 = require("../gcp");
const modsApi = require("../mods/modsApi");
const modsHelper_1 = require("../mods/modsHelper");
const prompt_1 = require("../prompt");
const requirePermissions = require("../requirePermissions");
const utils = require("../utils");
exports.default = new Command("mods:uninstall <modInstanceId>")
    .description("uninstall a mod that is installed in your Firebase project by instance ID")
    .option("-f, --force", "No confirmation. Otherwise, a confirmation prompt will appear.")
    .before(requirePermissions, [])
    .before(modsHelper_1.ensureModsApiEnabled)
    .action((instanceId, options) => __awaiter(this, void 0, void 0, function* () {
    const projectId = getProjectId(options);
    let instance;
    try {
        instance = yield modsApi.getInstance(projectId, instanceId);
    }
    catch (err) {
        if (err.status === 404) {
            return utils.reject(`No mod instance ${instanceId} in project ${projectId}.`, {
                exit: 1,
            });
        }
        throw err;
    }
    let confirmedServiceAccountDeletion;
    if (!options.force) {
        const resourcesMessage = _.get(instance, "configuration.source.spec.resources", []).length
            ? "This will delete the following resources \n" +
                instance.configuration.source.spec.resources
                    .map((resource) => `- ${resource.type}: ${resource.name} \n`)
                    .join("")
            : "";
        const modDeletionMessage = `You are about to uninstall mod ${clc.bold(instanceId)} from project ${clc.bold(projectId)}.\n${resourcesMessage}Are you sure?`;
        const confirmedModDeletion = yield prompt_1.promptOnce({
            type: "confirm",
            default: true,
            message: modDeletionMessage,
        });
        if (!confirmedModDeletion) {
            return utils.reject("Command aborted.", { exit: 1 });
        }
        const rolesMessage = _.get(instance, "configuration.source.spec.roles", []).length
            ? " which had the following authorized roles in your project:\n" +
                instance.configuration.source.spec.roles
                    .map((role) => `- ${role.role} \n`)
                    .join("")
            : ". \n";
        const serviceAccountDeletionMessage = `This mod used service account ${clc.bold(instance.serviceAccountEmail)} ${rolesMessage}Do you want to delete this service account?`;
        confirmedServiceAccountDeletion = yield prompt_1.promptOnce({
            type: "confirm",
            default: false,
            message: serviceAccountDeletionMessage,
        });
    }
    const spinner = ora.default(`Uninstalling ${clc.bold(instanceId)}. This usually takes 1 to 2 minutes...`);
    spinner.start();
    try {
        yield modsApi.deleteInstance(projectId, instanceId);
        if (confirmedServiceAccountDeletion || options.force) {
            yield gcp_1.iam.deleteServiceAccount(projectId, instance.serviceAccountEmail);
            utils.logLabeledBullet(modsHelper_1.logPrefix, `deleted service account ${clc.bold(instance.serviceAccountEmail)}`);
        }
        spinner.stop();
    }
    catch (err) {
        spinner.fail();
        if (err instanceof error_1.FirebaseError) {
            throw err;
        }
        return utils.reject(`Error occurred uninstalling mod ${instanceId}`, { original: err });
    }
    utils.logLabeledSuccess(modsHelper_1.logPrefix, `uninstalled ${instanceId}`);
}));
//# sourceMappingURL=mods-uninstall.js.map