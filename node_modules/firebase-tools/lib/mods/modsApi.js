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
const api = require("../api");
const operationPoller = require("../operation-poller");
const VERSION = "v1beta1";
function createInstance(projectId, instanceId, modSource, params, serviceAccountEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        const createRes = yield api.request("POST", `/${VERSION}/projects/${projectId}/instances/`, {
            auth: true,
            origin: api.modsOrigin,
            data: {
                name: `projects/${projectId}/instances/${instanceId}`,
                configuration: {
                    source: { name: modSource.name },
                    params,
                },
                serviceAccountEmail,
            },
        });
        const pollRes = yield operationPoller.pollOperation({
            apiOrigin: api.modsOrigin,
            apiVersion: "v1beta1",
            operationResourceName: createRes.body.name,
            masterTimeout: 600000,
        });
        return pollRes;
    });
}
exports.createInstance = createInstance;
function deleteInstance(projectId, instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        const deleteRes = yield api.request("DELETE", `/${VERSION}/projects/${projectId}/instances/${instanceId}`, {
            auth: true,
            origin: api.modsOrigin,
        });
        const pollRes = yield operationPoller.pollOperation({
            apiOrigin: api.modsOrigin,
            apiVersion: "v1beta1",
            operationResourceName: deleteRes.body.name,
            masterTimeout: 600000,
        });
        return pollRes;
    });
}
exports.deleteInstance = deleteInstance;
function getInstance(projectId, instanceId, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield api.request("GET", `/${VERSION}/projects/${projectId}/instances/${instanceId}`, _.assign({
            auth: true,
            origin: api.modsOrigin,
        }, options));
        return res.body;
    });
}
exports.getInstance = getInstance;
function listInstances(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const instances = [];
        const getNextPage = (pageToken) => __awaiter(this, void 0, void 0, function* () {
            const res = yield api.request("GET", `/${VERSION}/projects/${projectId}/instances`, {
                auth: true,
                origin: api.modsOrigin,
                query: {
                    pageSize: 100,
                    pageToken,
                },
            });
            instances.push.apply(instances, res.body.instances);
            if (res.body.nextPageToken) {
                yield getNextPage(res.body.nextPageToken);
            }
        });
        yield getNextPage();
        return instances;
    });
}
exports.listInstances = listInstances;
function configureInstance(projectId, instanceId, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield patchInstance(projectId, instanceId, "configuration.params", {
            configuration: {
                params,
            },
        });
        return res;
    });
}
exports.configureInstance = configureInstance;
function updateInstance(projectId, instanceId, modSource, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield patchInstance(projectId, instanceId, "configuration.params,configuration.source.name", {
            configuration: {
                source: { name: modSource.name },
                params,
            },
        });
        return res;
    });
}
exports.updateInstance = updateInstance;
function patchInstance(projectId, instanceId, updateMask, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const updateRes = yield api.request("PATCH", `/${VERSION}/projects/${projectId}/instances/${instanceId}`, {
            auth: true,
            origin: api.modsOrigin,
            query: {
                updateMask,
            },
            data,
        });
        const pollRes = yield operationPoller.pollOperation({
            apiOrigin: api.modsOrigin,
            apiVersion: "v1beta1",
            operationResourceName: updateRes.body.name,
            masterTimeout: 600000,
        });
        return pollRes;
    });
}
function getSource(sourceName) {
    return api
        .request("GET", `/${VERSION}/${sourceName}`, {
        auth: true,
        origin: api.modsOrigin,
    })
        .then((res) => {
        return res.body;
    });
}
exports.getSource = getSource;
//# sourceMappingURL=modsApi.js.map