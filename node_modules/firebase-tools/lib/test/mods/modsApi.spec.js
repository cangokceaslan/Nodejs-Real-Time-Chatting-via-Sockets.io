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
const chai_1 = require("chai");
const nock = require("nock");
const api = require("../../api");
const error_1 = require("../../error");
const modsApi = require("../../mods/modsApi");
const VERSION = "v1beta1";
const TEST_INSTANCE_1 = {
    name: "projects/invader-zim/instances/image-resizer-1",
    createTime: "2019-06-19T00:20:10.416947Z",
    updateTime: "2019-06-19T00:21:06.722782Z",
    state: "ACTIVE",
    configuration: {
        name: "projects/invader-zim/instances/image-resizer-1/configurations/5b1fb749-764d-4bd1-af60-bb7f22d27860",
        createTime: "2019-06-19T00:21:06.722782Z",
    },
};
const TEST_INSTANCE_2 = {
    name: "projects/invader-zim/instances/image-resizer",
    createTime: "2019-05-19T00:20:10.416947Z",
    updateTime: "2019-05-19T00:20:10.416947Z",
    state: "ACTIVE",
    configuration: {
        name: "projects/invader-zim/instances/image-resizer/configurations/95355951-397f-4821-a5c2-9c9788b2cc63",
        createTime: "2019-05-19T00:20:10.416947Z",
    },
};
const TEST_INSTANCES_RESPONSE = {
    instances: [TEST_INSTANCE_1, TEST_INSTANCE_2],
};
const TEST_INSTANCES_RESPONSE_NEXT_PAGE_TOKEN = _.cloneDeep(TEST_INSTANCES_RESPONSE);
TEST_INSTANCES_RESPONSE_NEXT_PAGE_TOKEN.nextPageToken = "abc123";
const PROJECT_ID = "test-project";
const INSTANCE_ID = "test-mods-instance";
describe("mods", () => {
    describe("listInstances", () => {
        afterEach(() => {
            nock.cleanAll();
        });
        it("should return a list of installed mods instances", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .get(`/${VERSION}/projects/${PROJECT_ID}/instances`)
                .query(true)
                .reply(200, TEST_INSTANCES_RESPONSE);
            const instances = yield modsApi.listInstances(PROJECT_ID);
            chai_1.expect(instances).to.deep.equal(TEST_INSTANCES_RESPONSE.instances);
            chai_1.expect(nock.isDone()).to.be.true;
        }));
        it("should query for more installed mods if the response has a next_page_token", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .get(`/${VERSION}/projects/${PROJECT_ID}/instances`)
                .query(true)
                .reply(200, TEST_INSTANCES_RESPONSE_NEXT_PAGE_TOKEN);
            nock(api.modsOrigin)
                .get(`/${VERSION}/projects/${PROJECT_ID}/instances`)
                .query((queryParams) => {
                return queryParams.pageToken === "abc123";
            })
                .reply(200, TEST_INSTANCES_RESPONSE);
            const instances = yield modsApi.listInstances(PROJECT_ID);
            const expected = TEST_INSTANCES_RESPONSE.instances.concat(TEST_INSTANCES_RESPONSE_NEXT_PAGE_TOKEN.instances);
            chai_1.expect(instances).to.deep.equal(expected);
            chai_1.expect(nock.isDone()).to.be.true;
        }));
        it("should throw FirebaseError if any call returns an error", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .get(`/${VERSION}/projects/${PROJECT_ID}/instances`)
                .query(true)
                .reply(200, TEST_INSTANCES_RESPONSE_NEXT_PAGE_TOKEN);
            nock(api.modsOrigin)
                .get(`/${VERSION}/projects/${PROJECT_ID}/instances`)
                .query((queryParams) => {
                return queryParams.pageToken === "abc123";
            })
                .reply(503);
            yield chai_1.expect(modsApi.listInstances(PROJECT_ID)).to.be.rejectedWith(error_1.FirebaseError);
            chai_1.expect(nock.isDone()).to.be.true;
        }));
    });
    describe("createInstance", () => {
        afterEach(() => {
            nock.cleanAll();
        });
        it("should make a POST call to the correct endpoint, and then poll on the returned operation", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .post(`/${VERSION}/projects/${PROJECT_ID}/instances/`)
                .reply(200, { name: "operations/abc123" });
            nock(api.modsOrigin)
                .get(`/${VERSION}/operations/abc123`)
                .reply(200, { done: true });
            yield modsApi.createInstance(PROJECT_ID, INSTANCE_ID, {
                name: "sources/blah",
                packageUri: "https://test.fake/pacakge.zip",
                hash: "abc123",
                spec: { name: "", sourceUrl: "", roles: [], resources: [], params: [] },
            }, {}, "my-service-account@proj.gserviceaccount.com");
            chai_1.expect(nock.isDone()).to.be.true;
        }));
        it("should throw a FirebaseError if create returns an error response", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .post(`/${VERSION}/projects/${PROJECT_ID}/instances/`)
                .reply(500);
            yield chai_1.expect(modsApi.createInstance(PROJECT_ID, INSTANCE_ID, {
                name: "sources/blah",
                packageUri: "https://test.fake/pacakge.zip",
                hash: "abc123",
                spec: { name: "", sourceUrl: "", roles: [], resources: [], params: [] },
            }, {}, "my-service-account@proj.gserviceaccount.com")).to.be.rejectedWith(error_1.FirebaseError, "HTTP Error: 500, Unknown Error");
            chai_1.expect(nock.isDone()).to.be.true;
        }));
        it("stop polling and throw if the operation call throws an unexpected error", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .post(`/${VERSION}/projects/${PROJECT_ID}/instances/`)
                .reply(200, { name: "operations/abc123" });
            nock(api.modsOrigin)
                .get(`/${VERSION}/operations/abc123`)
                .reply(502);
            yield chai_1.expect(modsApi.createInstance(PROJECT_ID, INSTANCE_ID, {
                name: "sources/blah",
                packageUri: "https://test.fake/pacakge.zip",
                hash: "abc123",
                spec: { name: "", sourceUrl: "", roles: [], resources: [], params: [] },
            }, {}, "my-service-account@proj.gserviceaccount.com")).to.be.rejectedWith(error_1.FirebaseError, "HTTP Error: 502, Unknown Error");
            chai_1.expect(nock.isDone()).to.be.true;
        }));
    });
    describe("configureInstance", () => {
        afterEach(() => {
            nock.cleanAll();
        });
        it("should make a PATCH call to the correct endpoint, and then poll on the returned operation", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .patch(`/${VERSION}/projects/${PROJECT_ID}/instances/${INSTANCE_ID}`)
                .query({ updateMask: "configuration.params" })
                .reply(200, { name: "operations/abc123" });
            nock(api.modsOrigin)
                .get(`/${VERSION}/operations/abc123`)
                .reply(200, { done: false })
                .get(`/${VERSION}/operations/abc123`)
                .reply(200, { done: true });
            yield modsApi.configureInstance(PROJECT_ID, INSTANCE_ID, { MY_PARAM: "value" });
            chai_1.expect(nock.isDone()).to.be.true;
        }));
        it("should throw a FirebaseError if update returns an error response", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .patch(`/${VERSION}/projects/${PROJECT_ID}/instances/${INSTANCE_ID}`)
                .query({ updateMask: "configuration.params" })
                .reply(500);
            yield chai_1.expect(modsApi.configureInstance(PROJECT_ID, INSTANCE_ID, { MY_PARAM: "value" })).to.be.rejectedWith(error_1.FirebaseError, "HTTP Error: 500");
            chai_1.expect(nock.isDone()).to.be.true;
        }));
    });
    describe("deleteInstance", () => {
        afterEach(() => {
            nock.cleanAll();
        });
        it("should make a DELETE call to the correct endpoint, and then poll on the returned operation", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .delete(`/${VERSION}/projects/${PROJECT_ID}/instances/${INSTANCE_ID}`)
                .reply(200, { name: "operations/abc123" });
            nock(api.modsOrigin)
                .get(`/${VERSION}/operations/abc123`)
                .reply(200, { done: true });
            yield modsApi.deleteInstance(PROJECT_ID, INSTANCE_ID);
            chai_1.expect(nock.isDone()).to.be.true;
        }));
        it("should throw a FirebaseError if delete returns an error response", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .delete(`/${VERSION}/projects/${PROJECT_ID}/instances/${INSTANCE_ID}`)
                .reply(404);
            yield chai_1.expect(modsApi.deleteInstance(PROJECT_ID, INSTANCE_ID)).to.be.rejectedWith(error_1.FirebaseError);
            chai_1.expect(nock.isDone()).to.be.true;
        }));
    });
    describe("getInstance", () => {
        afterEach(() => {
            nock.cleanAll();
        });
        it("should make a GET call to the correct endpoint", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .get(`/${VERSION}/projects/${PROJECT_ID}/instances/${INSTANCE_ID}`)
                .reply(200);
            const res = yield modsApi.getInstance(PROJECT_ID, INSTANCE_ID);
            chai_1.expect(nock.isDone()).to.be.true;
        }));
        it("should throw a FirebaseError if the endpoint returns an error response", () => __awaiter(this, void 0, void 0, function* () {
            nock(api.modsOrigin)
                .get(`/${VERSION}/projects/${PROJECT_ID}/instances/${INSTANCE_ID}`)
                .reply(404);
            yield chai_1.expect(modsApi.getInstance(PROJECT_ID, INSTANCE_ID)).to.be.rejectedWith(error_1.FirebaseError);
            chai_1.expect(nock.isDone()).to.be.true;
        }));
    });
});
//# sourceMappingURL=modsApi.spec.js.map