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
const chai_1 = require("chai");
const nock = require("nock");
const api = require("../../api");
const error_1 = require("../../error");
const rolesHelper = require("../../mods/rolesHelper");
const PROJECT_ID = "test-proj";
const INSTANCE_ID = "test-instance";
const TEST_ROLE = "test-role";
const TEST_ROLES = [{ role: TEST_ROLE, reason: "For testing." }];
const TEST_SERVICE_ACCOUNT_EMAIL = "test-email@test-proj.gserviceaccounts.com";
const IAM_VERSION = "v1";
const RESOURCEMANAGER_VERSION = "v1";
describe("createServiceAccountAndSetRoles", () => {
    afterEach(() => {
        nock.cleanAll();
    });
    it("should create a service account named mod-{instanceId} and set roles on it", () => __awaiter(this, void 0, void 0, function* () {
        nock(api.iamOrigin)
            .post(`/${IAM_VERSION}/projects/${PROJECT_ID}/serviceAccounts`)
            .reply(200, { email: TEST_SERVICE_ACCOUNT_EMAIL });
        nock(api.resourceManagerOrigin)
            .post(`/${RESOURCEMANAGER_VERSION}/projects/${PROJECT_ID}/:getIamPolicy`)
            .reply(200, {
            bindings: [{ role: "roles/existingRole", members: ["serviceAccount:blah@a.com"] }],
        });
        nock(api.resourceManagerOrigin)
            .post(`/${RESOURCEMANAGER_VERSION}/projects/${PROJECT_ID}/:setIamPolicy`, {
            policy: {
                bindings: [
                    { role: "roles/existingRole", members: ["serviceAccount:blah@a.com"] },
                    {
                        role: "roles/test-role",
                        members: [`serviceAccount:${TEST_SERVICE_ACCOUNT_EMAIL}`],
                    },
                ],
            },
        })
            .reply(200);
        const serviceAccount = yield rolesHelper.createServiceAccountAndSetRoles(PROJECT_ID, TEST_ROLES, INSTANCE_ID);
        chai_1.expect(serviceAccount).to.be.equal(TEST_SERVICE_ACCOUNT_EMAIL);
        chai_1.expect(nock.isDone());
    }));
    it("should return a Firebase error if the accountId already exists", () => __awaiter(this, void 0, void 0, function* () {
        nock(api.iamOrigin)
            .post(`/${IAM_VERSION}/projects/${PROJECT_ID}/serviceAccounts`)
            .reply(409);
        yield chai_1.expect(rolesHelper.createServiceAccountAndSetRoles(PROJECT_ID, TEST_ROLES, INSTANCE_ID)).to.be.rejectedWith(error_1.FirebaseError, "A service account mod-test-instance already exists in project test-proj. " +
            "Please delete it or choose a different mod instance id.");
    }));
    it("should throw the caught error if its status is not 409", () => __awaiter(this, void 0, void 0, function* () {
        nock(api.iamOrigin)
            .post(`/${IAM_VERSION}/projects/${PROJECT_ID}/serviceAccounts`)
            .reply(500);
        yield chai_1.expect(rolesHelper.createServiceAccountAndSetRoles(PROJECT_ID, TEST_ROLES, INSTANCE_ID)).to.be.rejectedWith(error_1.FirebaseError, "HTTP Error: 500, Unknown Error");
    }));
});
describe("grantRoles", () => {
    afterEach(() => {
        nock.cleanAll();
    });
    it("should add the desired roles to the service account, and not remove existing roles", () => __awaiter(this, void 0, void 0, function* () {
        nock(api.resourceManagerOrigin)
            .post(`/${RESOURCEMANAGER_VERSION}/projects/${PROJECT_ID}/:getIamPolicy`)
            .reply(200, { bindings: [{ role: "roles/test", members: ["serviceAccount:me@me.com"] }] });
        const rolesToAdd = ["cool.role.create", "cool.role.delete"];
        const expectedBody = {
            policy: {
                bindings: [
                    { role: "roles/test", members: ["serviceAccount:me@me.com"] },
                    {
                        role: "roles/cool.role.create",
                        members: [`serviceAccount:${TEST_SERVICE_ACCOUNT_EMAIL}`],
                    },
                    {
                        role: "roles/cool.role.delete",
                        members: [`serviceAccount:${TEST_SERVICE_ACCOUNT_EMAIL}`],
                    },
                ],
            },
        };
        nock(api.resourceManagerOrigin)
            .post(`/${RESOURCEMANAGER_VERSION}/projects/${PROJECT_ID}/:setIamPolicy`, expectedBody)
            .reply(200);
        yield rolesHelper.grantRoles(PROJECT_ID, TEST_SERVICE_ACCOUNT_EMAIL, rolesToAdd, []);
        chai_1.expect(nock.isDone()).to.be.true;
    }));
    it("should remove the chosen service account from the bindings for each roleToRemove", () => __awaiter(this, void 0, void 0, function* () {
        nock(api.resourceManagerOrigin)
            .post(`/${RESOURCEMANAGER_VERSION}/projects/${PROJECT_ID}/:getIamPolicy`)
            .reply(200, {
            bindings: [
                {
                    role: "roles/test",
                    members: ["serviceAccount:me@me.com", `serviceAccount:${TEST_SERVICE_ACCOUNT_EMAIL}`],
                },
            ],
        });
        const rolesToRemove = ["test"];
        const expectedBody = {
            policy: {
                bindings: [{ role: "roles/test", members: ["serviceAccount:me@me.com"] }],
            },
        };
        nock(api.resourceManagerOrigin)
            .post(`/${RESOURCEMANAGER_VERSION}/projects/${PROJECT_ID}/:setIamPolicy`, expectedBody)
            .reply(200);
        yield rolesHelper.grantRoles(PROJECT_ID, TEST_SERVICE_ACCOUNT_EMAIL, [], rolesToRemove);
        chai_1.expect(nock.isDone()).to.be.true;
    }));
});
//# sourceMappingURL=rolesHelper.spec.js.map