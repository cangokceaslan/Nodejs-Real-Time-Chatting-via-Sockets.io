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
const modsApi = require("../../mods/modsApi");
const listMods_1 = require("../../mods/listMods");
const MOCK_INSTANCES = [
    {
        name: "projects/my-test-proj/instances/image-resizer",
        createTime: "2019-05-19T00:20:10.416947Z",
        updateTime: "2019-05-19T00:20:10.416947Z",
        state: "ACTIVE",
        configuration: {
            name: "projects/my-test-proj/instances/image-resizer/configurations/95355951-397f-4821-a5c2-9c9788b2cc63",
            createTime: "2019-05-19T00:20:10.416947Z",
        },
    },
    {
        name: "projects/my-test-proj/instances/image-resizer-1",
        createTime: "2019-06-19T00:20:10.416947Z",
        updateTime: "2019-06-19T00:21:06.722782Z",
        state: "ACTIVE",
        configuration: {
            name: "projects/my-test-proj/instances/image-resizer-1/configurations/5b1fb749-764d-4bd1-af60-bb7f22d27860",
            createTime: "2019-06-19T00:21:06.722782Z",
        },
    },
];
const PROJECT_ID = "my-test-proj";
describe("listMods", () => {
    let listInstancesStub;
    beforeEach(() => {
        listInstancesStub = sinon.stub(modsApi, "listInstances");
    });
    afterEach(() => {
        listInstancesStub.restore();
    });
    it("should return an empty array if no mods have been installed", () => __awaiter(this, void 0, void 0, function* () {
        listInstancesStub.returns(Promise.resolve([]));
        const result = yield listMods_1.listMods(PROJECT_ID);
        chai_1.expect(result).to.eql({ instances: [] });
    }));
    it("should return a sorted array of mod instances", () => __awaiter(this, void 0, void 0, function* () {
        listInstancesStub.returns(Promise.resolve(MOCK_INSTANCES));
        const result = yield listMods_1.listMods(PROJECT_ID);
        const expected = [
            {
                name: "projects/my-test-proj/instances/image-resizer-1",
                createTime: "2019-06-19T00:20:10.416947Z",
                updateTime: "2019-06-19T00:21:06.722782Z",
                state: "ACTIVE",
                configuration: {
                    name: "projects/my-test-proj/instances/image-resizer-1/configurations/5b1fb749-764d-4bd1-af60-bb7f22d27860",
                    createTime: "2019-06-19T00:21:06.722782Z",
                },
            },
            {
                name: "projects/my-test-proj/instances/image-resizer",
                createTime: "2019-05-19T00:20:10.416947Z",
                updateTime: "2019-05-19T00:20:10.416947Z",
                state: "ACTIVE",
                configuration: {
                    name: "projects/my-test-proj/instances/image-resizer/configurations/95355951-397f-4821-a5c2-9c9788b2cc63",
                    createTime: "2019-05-19T00:20:10.416947Z",
                },
            },
        ];
        chai_1.expect(result).to.eql({ instances: expected });
    }));
});
//# sourceMappingURL=listMods.spec.js.map