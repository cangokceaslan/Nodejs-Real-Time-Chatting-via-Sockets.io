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
const generateInstanceId = require("../../mods/generateInstanceId");
const modsHelper = require("../../mods/modsHelper");
const prompt = require("../../prompt");
describe("modsHelper", () => {
    describe("substituteParams", () => {
        it("should should substitute env variables", () => {
            const testResources = [
                {
                    resourceOne: {
                        name: "${VAR_ONE}",
                        source: "path/${VAR_ONE}",
                    },
                },
                {
                    resourceTwo: {
                        property: "${VAR_TWO}",
                        another: "$NOT_ENV",
                    },
                },
            ];
            const testParam = { VAR_ONE: "foo", VAR_TWO: "bar", UNUSED: "faz" };
            chai_1.expect(modsHelper.substituteParams(testResources, testParam)).to.deep.equal([
                {
                    resourceOne: {
                        name: "foo",
                        source: "path/foo",
                    },
                },
                {
                    resourceTwo: {
                        property: "bar",
                        another: "$NOT_ENV",
                    },
                },
            ]);
        });
    });
    describe("getDBInstanceFromURL", () => {
        it("returns the correct instance name", () => {
            chai_1.expect(modsHelper.getDBInstanceFromURL("https://my-db.firebaseio.com")).to.equal("my-db");
        });
    });
    describe("populateDefaultParams", () => {
        const expected = {
            ENV_VAR_ONE: "12345",
            ENV_VAR_TWO: "hello@example.com",
            ENV_VAR_THREE: "https://${PROJECT_ID}.firebaseapp.com/?acceptInvitation={token}",
            ENV_VAR_FOUR: "users/{sender}.friends",
        };
        const exampleParamSpec = [
            {
                param: "ENV_VAR_ONE",
                required: true,
            },
            {
                param: "ENV_VAR_TWO",
                required: true,
                validationRegex: "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$",
                validationErrorMessage: "You must provide a valid email address.\n",
            },
            {
                param: "ENV_VAR_THREE",
                default: "https://${PROJECT_ID}.firebaseapp.com/?acceptInvitation={token}",
                validationRegex: ".*\\{token\\}.*",
                validationErrorMessage: "Your URL must include {token} so that it can be replaced with an actual invitation token.\n",
            },
            {
                param: "ENV_VAR_FOUR",
                default: "users/{sender}.friends",
                required: false,
                validationRegex: ".+/.+\\..+",
                validationErrorMessage: "Values must be comma-separated document path + field, e.g. coll/doc.field,coll/doc.field\n",
            },
        ];
        it("should set default if default is available", () => {
            const envFile = {
                ENV_VAR_ONE: "12345",
                ENV_VAR_TWO: "hello@example.com",
                ENV_VAR_THREE: "https://${PROJECT_ID}.firebaseapp.com/?acceptInvitation={token}",
            };
            chai_1.expect(modsHelper.populateDefaultParams(envFile, exampleParamSpec)).to.deep.equal(expected);
        });
        it("should throw error if no default is available", () => {
            const envFile = {
                ENV_VAR_ONE: "12345",
                ENV_VAR_THREE: "https://${PROJECT_ID}.firebaseapp.com/?acceptInvitation={token}",
                ENV_VAR_FOUR: "users/{sender}.friends",
            };
            chai_1.expect(() => {
                modsHelper.populateDefaultParams(envFile, exampleParamSpec);
            }).to.throw(error_1.FirebaseError, /no default available/);
        });
    });
    describe("validateCommandLineParams", () => {
        const exampleParamSpec = [
            {
                param: "ENV_VAR_ONE",
                required: true,
            },
            {
                param: "ENV_VAR_TWO",
                required: true,
                validationRegex: "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$",
                validationErrorMessage: "You must provide a valid email address.\n",
            },
            {
                param: "ENV_VAR_THREE",
                default: "https://${PROJECT_ID}.firebaseapp.com/?acceptInvitation={token}",
                validationRegex: ".*\\{token\\}.*",
                validationErrorMessage: "Your URL must include {token} so that it can be replaced with an actual invitation token.\n",
            },
            {
                param: "ENV_VAR_FOUR",
                default: "users/{sender}.friends",
                required: false,
                validationRegex: ".+/.+\\..+",
                validationErrorMessage: "Values must be comma-separated document path + field, e.g. coll/doc.field,coll/doc.field\n",
            },
        ];
        it("should throw error if param variable value is invalid", () => {
            const envFile = {
                ENV_VAR_ONE: "12345",
                ENV_VAR_TWO: "invalid",
                ENV_VAR_THREE: "https://${PROJECT_ID}.firebaseapp.com/?acceptInvitation={token}",
                ENV_VAR_FOUR: "users/{sender}.friends",
            };
            chai_1.expect(() => {
                modsHelper.validateCommandLineParams(envFile, exampleParamSpec);
            }).to.throw(error_1.FirebaseError, /not valid/);
        });
        it("should throw error if # commandLineParams does not match # env vars from mod.yaml", () => {
            const envFile = {
                ENV_VAR_ONE: "12345",
                ENV_VAR_TWO: "invalid",
                ENV_VAR_THREE: "https://${PROJECT_ID}.firebaseapp.com/?acceptInvitation={token}",
            };
            chai_1.expect(() => {
                modsHelper.validateCommandLineParams(envFile, exampleParamSpec);
            }).to.throw(error_1.FirebaseError, /param is missing/);
        });
    });
    describe("getValidInstanceId", () => {
        let promptStub;
        let generateInstanceIdStub;
        beforeEach(() => {
            promptStub = sinon.stub(prompt, "promptOnce");
            generateInstanceIdStub = sinon.stub(generateInstanceId, "generateInstanceId");
        });
        afterEach(() => {
            sinon.restore();
        });
        it("return modName if it is not used by another instance ", () => __awaiter(this, void 0, void 0, function* () {
            const modName = "mod-name";
            generateInstanceIdStub.resolves(modName);
            promptStub.returns("a-valid-name");
            const instanceId = yield modsHelper.getValidInstanceId("proj", modName);
            chai_1.expect(instanceId).to.equal(modName);
            chai_1.expect(promptStub).not.to.have.been.called;
        }));
        it("prompt the user if modName is already used, and return if the user provides a valid id", () => __awaiter(this, void 0, void 0, function* () {
            const modName = "mod-name";
            const userInput = "a-valid-name";
            generateInstanceIdStub.resolves(`${modName}-abcd`);
            promptStub.returns(userInput);
            const instanceId = yield modsHelper.getValidInstanceId("proj", modName);
            chai_1.expect(instanceId).to.equal(userInput);
            chai_1.expect(promptStub).to.have.been.calledOnce;
        }));
        it("prompt the user again if the provided id is shorter than 6 characters", () => __awaiter(this, void 0, void 0, function* () {
            const modName = "mod-name";
            const userInput1 = "short";
            const userInput2 = "a-valid-name";
            generateInstanceIdStub.resolves(`${modName}-abcd`);
            promptStub.onCall(0).returns(userInput1);
            promptStub.onCall(1).returns(userInput2);
            const instanceId = yield modsHelper.getValidInstanceId("proj", modName);
            chai_1.expect(instanceId).to.equal(userInput2);
            chai_1.expect(promptStub).to.have.been.calledTwice;
        }));
        it("prompt the user again if the provided id is longer than 45 characters", () => __awaiter(this, void 0, void 0, function* () {
            const modName = "mod-name";
            const userInput1 = "a-really-long-name-that-is-really-longer-than-were-ok-with";
            const userInput2 = "a-valid-name";
            generateInstanceIdStub.resolves(`${modName}-abcd`);
            promptStub.onCall(0).returns(userInput1);
            promptStub.onCall(1).returns(userInput2);
            const instanceId = yield modsHelper.getValidInstanceId("proj", modName);
            chai_1.expect(instanceId).to.equal(userInput2);
            chai_1.expect(promptStub).to.have.been.calledTwice;
        }));
        it("prompt the user again if the provided id ends in a -", () => __awaiter(this, void 0, void 0, function* () {
            const modName = "mod-name";
            const userInput1 = "invalid-";
            const userInput2 = "-invalid";
            const userInput3 = "a-valid-name";
            generateInstanceIdStub.resolves(`${modName}-abcd`);
            promptStub.onCall(0).returns(userInput1);
            promptStub.onCall(1).returns(userInput2);
            promptStub.onCall(2).returns(userInput3);
            const instanceId = yield modsHelper.getValidInstanceId("proj", modName);
            chai_1.expect(instanceId).to.equal(userInput3);
            chai_1.expect(promptStub).to.have.been.calledThrice;
        }));
        it("prompt the user again if the provided id starts with a number", () => __awaiter(this, void 0, void 0, function* () {
            const modName = "mod-name";
            const userInput1 = "1invalid";
            const userInput2 = "a-valid-name";
            generateInstanceIdStub.resolves(`${modName}-abcd`);
            promptStub.onCall(0).returns(userInput1);
            promptStub.onCall(1).returns(userInput2);
            const instanceId = yield modsHelper.getValidInstanceId("proj", modName);
            chai_1.expect(instanceId).to.equal(userInput2);
            chai_1.expect(promptStub).to.have.been.calledTwice;
        }));
        it("prompt the user again if the provided id contains illegal characters", () => __awaiter(this, void 0, void 0, function* () {
            const modName = "mod-name";
            const userInput1 = "na.name@name";
            const userInput2 = "a-valid-name";
            generateInstanceIdStub.resolves(`${modName}-abcd`);
            promptStub.onCall(0).returns(userInput1);
            promptStub.onCall(1).returns(userInput2);
            const instanceId = yield modsHelper.getValidInstanceId("proj", modName);
            chai_1.expect(instanceId).to.equal(userInput2);
            chai_1.expect(promptStub).to.have.been.calledTwice;
        }));
    });
});
//# sourceMappingURL=modsHelper.spec.js.map