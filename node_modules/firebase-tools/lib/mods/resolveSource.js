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
const api = require("../api");
const error_1 = require("../error");
const MODS_REGISTRY_ENDPOINT = "/mods.json";
function resolveSource(modName) {
    return __awaiter(this, void 0, void 0, function* () {
        const [name, version] = modName.split("@");
        const modsRegistry = yield getModRegistry();
        const mod = _.get(modsRegistry, name);
        if (!mod) {
            throw new error_1.FirebaseError(`Unable to find mod named ${clc.bold(name)}.`);
        }
        const seekVersion = version || "latest";
        const versionFromLabel = _.get(mod, ["labels", seekVersion]);
        const source = _.get(mod, ["versions", seekVersion]) || _.get(mod, ["versions", versionFromLabel]);
        if (!source) {
            throw new error_1.FirebaseError(`Could not resolve version ${clc.bold(version)} of mod ${clc.bold(name)}.`);
        }
        return source;
    });
}
exports.resolveSource = resolveSource;
function getModRegistry() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield api.request("GET", MODS_REGISTRY_ENDPOINT, {
            origin: api.firebaseModsRegistryOrigin,
        });
        return res.body.mods;
    });
}
//# sourceMappingURL=resolveSource.js.map