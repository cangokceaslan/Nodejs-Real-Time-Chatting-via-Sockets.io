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
const sinon = require("sinon");
const dotenv = require("dotenv");
const fs = require("fs-extra");
const error_1 = require("../../error");
const logger = require("../../logger");
const modsHelper = require("../../mods/modsHelper");
const paramHelper = require("../../mods/paramHelper");
const prompt = require("../../prompt");
const PROJECT_ID = "test-proj";
const TEST_PARAMS = [
    {
        param: "A_PARAMETER",
        label: "Param",
        type: "STRING",
    },
    {
        param: "ANOTHER_PARAMETER",
        label: "Another Param",
        default: "default",
        type: "STRING",
    },
];
const TEST_PARAMS_2 = [
    {
        param: "ANOTHER_PARAMETER",
        label: "Another Param",
        type: "STRING",
        default: "default",
    },
    {
        param: "NEW_PARAMETER",
        label: "New Param",
        type: "STRING",
        default: "default",
    },
    {
        param: "THIRD_PARAMETER",
        label: "3",
        type: "STRING",
        default: "default",
    },
];
const SPEC = {
    name: "test",
    roles: [],
    resources: [],
    sourceUrl: "test.com",
    params: TEST_PARAMS,
};
describe("paramHelper", () => {
    describe("getParams", () => {
        let fsStub;
        let dotenvStub;
        let getFirebaseVariableStub;
        let promptStub;
        let loggerSpy;
        beforeEach(() => {
            fsStub = sinon.stub(fs, "readFileSync").returns("");
            dotenvStub = sinon.stub(dotenv, "parse");
            getFirebaseVariableStub = sinon
                .stub(modsHelper, "getFirebaseProjectParams")
                .resolves({ PROJECT_ID });
            promptStub = sinon.stub(prompt, "promptOnce").resolves("user input");
            loggerSpy = sinon.spy(logger, "info");
        });
        afterEach(() => {
            sinon.restore();
        });
        it("should read params from envFilePath if it is provided and is valid", () => __awaiter(this, void 0, void 0, function* () {
            dotenvStub.returns({
                A_PARAMETER: "aValue",
                ANOTHER_PARAMETER: "value",
            });
            const params = yield paramHelper.getParams(PROJECT_ID, TEST_PARAMS, "./a/path/to/a/file.env");
            chai_1.expect(params).to.eql({
                A_PARAMETER: "aValue",
                ANOTHER_PARAMETER: "value",
            });
        }));
        it("should return the defaults for params that are not in envFilePath", () => __awaiter(this, void 0, void 0, function* () {
            dotenvStub.returns({
                A_PARAMETER: "aValue",
            });
            const params = yield paramHelper.getParams(PROJECT_ID, TEST_PARAMS, "./a/path/to/a/file.env");
            chai_1.expect(params).to.eql({
                A_PARAMETER: "aValue",
                ANOTHER_PARAMETER: "default",
            });
        }));
        it("should throw if a param without a default is not in envFilePath", () => __awaiter(this, void 0, void 0, function* () {
            dotenvStub.returns({
                ANOTHER_PARAMETER: "aValue",
            });
            chai_1.expect(paramHelper.getParams(PROJECT_ID, TEST_PARAMS, "./a/path/to/a/file.env")).to.be.rejectedWith(error_1.FirebaseError, "A_PARAMETER has not been set in the given params file and there is no default available. " +
                "Please set this variable before installing again.");
        }));
        it("should warn about extra params provided in the env file", () => __awaiter(this, void 0, void 0, function* () {
            dotenvStub.returns({
                A_PARAMETER: "aValue",
                ANOTHER_PARAMETER: "default",
                A_THIRD_PARAMETER: "aValue",
                A_FOURTH_PARAMETER: "default",
            });
            const params = yield paramHelper.getParams(PROJECT_ID, TEST_PARAMS, "./a/path/to/a/file.env");
            chai_1.expect(loggerSpy).to.have.been.calledWith("Warning: The following params were specified in your env file but" +
                " do not exist in the spec for this mod: A_THIRD_PARAMETER, A_FOURTH_PARAMETER.");
        }));
        it("should throw FirebaseError if an invalid envFilePath is provided", () => __awaiter(this, void 0, void 0, function* () {
            dotenvStub.throws({ message: "Error during parsing" });
            chai_1.expect(paramHelper.getParams(PROJECT_ID, TEST_PARAMS, "./a/path/to/a/file.env")).to.be.rejectedWith(error_1.FirebaseError, "Error reading env file: Error during parsing");
        }));
        it("should prompt the user for params if no env file is provided", () => __awaiter(this, void 0, void 0, function* () {
            const params = yield paramHelper.getParams(PROJECT_ID, TEST_PARAMS);
            chai_1.expect(params).to.eql({
                A_PARAMETER: "user input",
                ANOTHER_PARAMETER: "user input",
            });
            chai_1.expect(promptStub).to.have.been.calledTwice;
            chai_1.expect(promptStub.firstCall.args[0]).to.eql({
                default: undefined,
                message: "Enter a value for Param:",
                name: "A_PARAMETER",
                type: "input",
            });
            chai_1.expect(promptStub.secondCall.args[0]).to.eql({
                default: "default",
                message: "Enter a value for Another Param:",
                name: "ANOTHER_PARAMETER",
                type: "input",
            });
        }));
    });
    describe("getParamsWithCurrentValuesAsDefaults", () => {
        let params;
        let testInstance;
        beforeEach(() => {
            params = { A_PARAMETER: "new default" };
            testInstance = {
                configuration: {
                    source: {
                        name: "",
                        packageUri: "",
                        hash: "",
                        spec: {
                            name: "",
                            roles: [],
                            resources: [],
                            params: TEST_PARAMS,
                            sourceUrl: "",
                        },
                    },
                    name: "test",
                    createTime: "now",
                    params,
                },
                name: "test",
                createTime: "now",
                updateTime: "now",
                state: "ACTIVE",
                serviceAccountEmail: "test@test.com",
            };
            it("should add defaults to params without them using the current state and leave other values unchanged", () => {
                const newParams = paramHelper.getParamsWithCurrentValuesAsDefaults(testInstance);
                chai_1.expect(newParams).to.eql([
                    {
                        param: "A_PARAMETER",
                        label: "Param",
                        default: "new default",
                        type: "STRING",
                    },
                    {
                        param: "ANOTHER_PARAMETER",
                        label: "Another",
                        default: "default",
                        type: "STRING",
                    },
                ]);
            });
        });
        it("should change existing defaults to the current state and leave other values unchanged", () => {
            _.get(testInstance, "configuration.source.spec.params", []).push({
                param: "THIRD",
                label: "3rd",
                default: "default",
                type: "STRING",
            });
            testInstance.configuration.params.THIRD = "New Default";
            const newParams = paramHelper.getParamsWithCurrentValuesAsDefaults(testInstance);
            chai_1.expect(newParams).to.eql([
                {
                    param: "A_PARAMETER",
                    label: "Param",
                    default: "new default",
                    type: "STRING",
                },
                {
                    param: "ANOTHER_PARAMETER",
                    label: "Another Param",
                    default: "default",
                    type: "STRING",
                },
                {
                    param: "THIRD",
                    label: "3rd",
                    default: "New Default",
                    type: "STRING",
                },
            ]);
        });
    });
    describe("promptForNewParams", () => {
        let promptStub;
        beforeEach(() => {
            promptStub = sinon.stub(prompt, "promptOnce");
        });
        afterEach(() => {
            promptStub.restore();
        });
        it("should prompt the user for any params in the new spec that are not in the current one", () => __awaiter(this, void 0, void 0, function* () {
            promptStub.resolves("user input");
            const newSpec = _.cloneDeep(SPEC);
            newSpec.params = TEST_PARAMS_2;
            const newParams = yield paramHelper.promptForNewParams(SPEC, newSpec, {
                A_PARAMETER: "value",
                ANOTHER_PARAMETER: "value",
            });
            const expected = {
                ANOTHER_PARAMETER: "value",
                NEW_PARAMETER: "user input",
                THIRD_PARAMETER: "user input",
            };
            chai_1.expect(newParams).to.eql(expected);
            chai_1.expect(promptStub.callCount).to.equal(2);
            chai_1.expect(promptStub.firstCall.args).to.eql([
                {
                    default: "default",
                    message: "Enter a value for New Param:",
                    name: "NEW_PARAMETER",
                    type: "input",
                },
            ]);
            chai_1.expect(promptStub.secondCall.args).to.eql([
                {
                    default: "default",
                    message: "Enter a value for 3:",
                    name: "THIRD_PARAMETER",
                    type: "input",
                },
            ]);
        }));
        it("shouldn't prompt if there are no new params", () => __awaiter(this, void 0, void 0, function* () {
            promptStub.resolves("Fail");
            const newSpec = _.cloneDeep(SPEC);
            const newParams = yield paramHelper.promptForNewParams(SPEC, newSpec, {
                A_PARAMETER: "value",
                ANOTHER_PARAMETER: "value",
            });
            const expected = {
                ANOTHER_PARAMETER: "value",
                A_PARAMETER: "value",
            };
            chai_1.expect(newParams).to.eql(expected);
            chai_1.expect(promptStub).not.to.have.been.called;
        }));
        it("should exit if a prompt fails", () => __awaiter(this, void 0, void 0, function* () {
            promptStub.rejects(new error_1.FirebaseError("this is an error"));
            const newSpec = _.cloneDeep(SPEC);
            newSpec.params = TEST_PARAMS_2;
            chai_1.expect(paramHelper.promptForNewParams(SPEC, newSpec, {
                A_PARAMETER: "value",
                ANOTHER_PARAMETER: "value",
            })).to.be.rejectedWith(error_1.FirebaseError, "this is an error");
            chai_1.expect(promptStub).to.have.been.calledOnce;
        }));
    });
});
//# sourceMappingURL=paramHelper.spec.js.map