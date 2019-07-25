"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const clc = require("cli-color");
const Command = require("../command");
const getProjectId = require("../getProjectId");
const listMods_1 = require("../mods/listMods");
const requirePermissions = require("../requirePermissions");
const logger = require("../logger");
module.exports = new Command("mods")
    .description("display information on how to use mods commands and mods installed to your project")
    .before(requirePermissions, ["deploymentmanager.deployments.get"])
    .action((options) => {
    const projectId = getProjectId(options);
    const commands = [
        "mods-configure",
        "mods-info",
        "mods-install",
        "mods-list",
        "mods-uninstall",
        "mods-update",
    ];
    _.forEach(commands, (command) => {
        let cmd = require("./" + command);
        if (cmd.default) {
            cmd = cmd.default;
        }
        logger.info();
        logger.info(`${clc.bold(cmd._cmd)} - ${cmd._description}`);
        if (cmd._options.length > 0) {
            logger.info("Option(s):");
            _.forEach(cmd._options, (option) => {
                logger.info("  ", option[0], " ", option[1]);
            });
        }
        logger.info();
    });
    return listMods_1.listMods(projectId);
});
//# sourceMappingURL=mods.js.map