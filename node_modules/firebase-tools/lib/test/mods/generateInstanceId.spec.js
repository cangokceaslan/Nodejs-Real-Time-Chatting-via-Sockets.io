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
const sinon = require("sinon");
const error_1 = require("../../error");
const generateInstanceId_1 = require("../../mods/generateInstanceId");
const modsApi = require("../../mods/modsApi");
const TEST_NAME = "image-resizer";
describe("generateInstanceId", () => {
    let getInstanceStub;
    beforeEach(() => {
        getInstanceStub = sinon.stub(modsApi, "getInstance");
    });
    afterEach(() => {
        getInstanceStub.restore();
    });
    it("should return modSpec.name if no mod with that name exists yet", () => __awaiter(this, void 0, void 0, function* () {
        getInstanceStub.resolves({ error: { code: 404 } });
        const instanceId = yield generateInstanceId_1.generateInstanceId("proj", TEST_NAME);
        chai_1.expect(instanceId).to.equal(TEST_NAME);
    }));
    it("should return modSpec.name plus a random string if a mod named modSpec.name exists", () => __awaiter(this, void 0, void 0, function* () {
        getInstanceStub.resolves({ name: TEST_NAME });
        const instanceId = yield generateInstanceId_1.generateInstanceId("proj", TEST_NAME);
        chai_1.expect(instanceId).to.include(TEST_NAME);
        chai_1.expect(instanceId.length).to.equal(TEST_NAME.length + 5);
    }));
    it("should throw if it gets an unexpected error response from getInstance", () => __awaiter(this, void 0, void 0, function* () {
        getInstanceStub.resolves({ error: { code: 500 } });
        yield chai_1.expect(generateInstanceId_1.generateInstanceId("proj", TEST_NAME)).to.be.rejectedWith(error_1.FirebaseError, "Unexpected error when generating instance ID:");
    }));
});
//# sourceMappingURL=generateInstanceId.spec.js.map