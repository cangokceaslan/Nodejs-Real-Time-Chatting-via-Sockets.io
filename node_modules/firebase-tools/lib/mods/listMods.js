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
const Table = require("cli-table");
const modsApi_1 = require("./modsApi");
const modsHelper_1 = require("./modsHelper");
const utils = require("../utils");
const logger = require("../logger");
function listMods(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const instances = yield modsApi_1.listInstances(projectId);
        if (instances.length < 1) {
            utils.logLabeledBullet(modsHelper_1.logPrefix, `there are no mods installed for project ${clc.bold(projectId)}.`);
            return { instances: [] };
        }
        const table = new Table({
            head: ["Mod Instance ID", "State", "Mod Version", "Create Time", "Update Time"],
            style: { head: ["yellow"] },
        });
        const sorted = _.sortBy(instances, "createTime", "asc").reverse();
        sorted.forEach((instance) => {
            table.push([
                _.last(instance.name.split("/")),
                instance.state,
                _.get(instance, "configuration.source.spec.version", ""),
                instance.createTime,
                instance.updateTime,
            ]);
        });
        utils.logLabeledBullet(modsHelper_1.logPrefix, `list of mods installed in ${clc.bold(projectId)}:`);
        logger.info(table.toString());
        return { instances: sorted };
    });
}
exports.listMods = listMods;
//# sourceMappingURL=listMods.js.map