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
const TerminalRenderer = require("marked-terminal");
const checkProjectBilling = require("./checkProjectBilling");
const error_1 = require("../error");
const logger = require("../logger");
const rolesHelper = require("./rolesHelper");
const modsApi = require("./modsApi");
const prompt_1 = require("../prompt");
marked.setOptions({
    renderer: new TerminalRenderer(),
});
const addition = clc.green;
const deletion = clc.red;
function displayChangesNoInput(spec, newSpec) {
    const lines = [];
    if (spec.version !== newSpec.version) {
        lines.push("", "**Version:**", `- ${spec.version}`, `+ ${newSpec.version}`);
    }
    if (spec.displayName !== newSpec.displayName) {
        lines.push("", "**Display Name:**", deletion(`- ${spec.displayName}`), addition(`+ ${newSpec.displayName}`));
    }
    if (spec.description !== newSpec.description) {
        lines.push("", "**Description:**", deletion(`- ${spec.description}`), addition(`+ ${newSpec.description}`));
    }
    if (spec.billingRequired && !newSpec.billingRequired) {
        lines.push("", "**Billing is no longer required for this mod.**");
    }
    logger.info(marked(lines.join("\n")));
    return lines;
}
exports.displayChangesNoInput = displayChangesNoInput;
function displayChangesRequiringConfirmation(spec, newSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        if (spec.license !== newSpec.license) {
            const message = "\n" +
                "**License**\n" +
                deletion(spec.license ? `- ${spec.license}\n` : "- None\n") +
                addition(newSpec.license ? `+ ${newSpec.license}\n` : "+ None\n") +
                "Do you wish to continue?";
            yield getConsent("license", marked(message));
        }
        const apisDiffDeletions = _.differenceWith(spec.apis, _.get(newSpec, "apis", []), _.isEqual);
        const apisDiffAdditions = _.differenceWith(newSpec.apis, _.get(spec, "apis", []), _.isEqual);
        if (apisDiffDeletions.length || apisDiffAdditions.length) {
            let message = "\n**APIs:**\n";
            apisDiffDeletions.forEach((api) => {
                message += deletion(`- ${api.apiName} (${api.reason})\n`);
            });
            apisDiffAdditions.forEach((api) => {
                message += addition(`+ ${api.apiName} (${api.reason})\n`);
            });
            message += "Do you wish to continue?";
            yield getConsent("apis", marked(message));
        }
        const resourcesDiffDeletions = _.differenceWith(spec.resources, _.get(newSpec, "resources", []), _.isEqual);
        const resourcesDiffAdditions = _.differenceWith(newSpec.resources, _.get(spec, "resources", []), _.isEqual);
        if (resourcesDiffDeletions.length || resourcesDiffAdditions.length) {
            let message = "\n**Resources:**\n";
            resourcesDiffDeletions.forEach((resource) => {
                message += deletion(` - ${getResourceReadableName(resource)}`);
            });
            resourcesDiffAdditions.forEach((resource) => {
                message += addition(`+ ${getResourceReadableName(resource)}`);
            });
            message += "Do you wish to continue?";
            yield getConsent("resources", marked(message));
        }
        const rolesDiffDeletions = _.differenceWith(spec.roles, _.get(newSpec, "roles", []), _.isEqual);
        const rolesDiffAdditions = _.differenceWith(newSpec.roles, _.get(spec, "roles", []), _.isEqual);
        if (rolesDiffDeletions.length || rolesDiffAdditions.length) {
            let message = "\n**Permissions:**\n";
            rolesDiffDeletions.forEach((role) => {
                message += deletion(`- ${role.role} (${role.reason})\n`);
            });
            rolesDiffAdditions.forEach((role) => {
                message += addition(`+ ${role.role} (${role.reason})\n`);
            });
            message += "Do you wish to continue?";
            yield getConsent("apis", marked(message));
        }
        if (!spec.billingRequired && newSpec.billingRequired) {
            yield getConsent("billingRequired", "Billing is now required for the new version of this mod. Would you like to continue?");
        }
    });
}
exports.displayChangesRequiringConfirmation = displayChangesRequiringConfirmation;
function getResourceReadableName(resource) {
    return resource.type === "function"
        ? `${resource.name} (${resource.description})\n`
        : `${resource.name} (${resource.type})\n`;
}
function getConsent(field, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const consent = yield prompt_1.promptOnce({
            type: "confirm",
            message,
            default: false,
        });
        if (!consent) {
            throw new error_1.FirebaseError(`Without explicit consent for the change to ${field}, we cannot update this mod instance.`, { exit: 2 });
        }
    });
}
function displayChanges(spec, newSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info("This update contains the following changes. " +
            "If at any point you choose not to continue, the mod will not be updated and the changes will be discarded:");
        displayChangesNoInput(spec, newSpec);
        yield displayChangesRequiringConfirmation(spec, newSpec);
    });
}
exports.displayChanges = displayChanges;
function update(updateOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const { projectId, instanceId, source, params, rolesToAdd, rolesToRemove, serviceAccountEmail, billingRequired, } = updateOptions;
        yield checkProjectBilling(projectId, instanceId, billingRequired);
        yield rolesHelper.grantRoles(projectId, serviceAccountEmail, rolesToAdd.map((role) => role.role), rolesToRemove.map((role) => role.role));
        return yield modsApi.updateInstance(projectId, instanceId, source, params);
    });
}
exports.update = update;
//# sourceMappingURL=updateHelper.js.map