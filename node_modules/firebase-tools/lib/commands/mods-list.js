"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command = require("../command");
const getProjectId = require("../getProjectId");
const listMods_1 = require("../mods/listMods");
const modsHelper_1 = require("../mods/modsHelper");
const requirePermissions = require("../requirePermissions");
module.exports = new Command("mods:list")
    .description("list all the mods that are installed in your Firebase project")
    .before(requirePermissions, [])
    .before(modsHelper_1.ensureModsApiEnabled)
    .action((options) => {
    const projectId = getProjectId(options);
    return listMods_1.listMods(projectId);
});
//# sourceMappingURL=mods-list.js.map