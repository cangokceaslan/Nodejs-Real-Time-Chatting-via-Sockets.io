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
const askUserForParam_1 = require("../../mods/askUserForParam");
const utils = require("../../utils");
const prompt = require("../../prompt");
const modsHelper = require("../../mods/modsHelper");
describe("askUserForParam", () => {
    const testSpec = {
        param: "NAME",
        type: "STRING",
        label: "Name",
        default: "Lauren",
        validationRegex: "^[a-z,A-Z]*$",
    };
    describe("checkResponse", () => {
        let logWarningSpy;
        beforeEach(() => {
            logWarningSpy = sinon.spy(utils, "logWarning");
        });
        afterEach(() => {
            logWarningSpy.restore();
        });
        it("should return false if required variable is not set", () => {
            chai_1.expect(askUserForParam_1.checkResponse("", {
                param: "param",
                label: "fill in the blank!",
                type: "STRING",
                required: true,
            })).to.equal(false);
            chai_1.expect(logWarningSpy.calledWith("You are required to enter a value for this question")).to.equal(true);
        });
        it("should return false if regex validation fails", () => {
            chai_1.expect(askUserForParam_1.checkResponse("123", {
                param: "param",
                label: "fill in the blank!",
                type: "STRING",
                validationRegex: "foo",
                required: true,
            })).to.equal(false);
            const expectedWarning = `123 is not a valid answer since it does not fit the regular expression "foo"`;
            chai_1.expect(logWarningSpy.calledWith(expectedWarning)).to.equal(true);
        });
        it("should use custom validation error message if provided", () => {
            const message = "please enter a word with foo in it";
            chai_1.expect(askUserForParam_1.checkResponse("123", {
                param: "param",
                label: "fill in the blank!",
                type: "STRING",
                validationRegex: "foo",
                validationErrorMessage: message,
                required: true,
            })).to.equal(false);
            chai_1.expect(logWarningSpy.calledWith(message)).to.equal(true);
        });
        it("should return true if all conditions pass", () => {
            chai_1.expect(askUserForParam_1.checkResponse("123", {
                param: "param",
                label: "fill in the blank!",
                type: "STRING",
            })).to.equal(true);
            chai_1.expect(logWarningSpy.called).to.equal(false);
        });
        it("should return false if an invalid choice is selected", () => {
            chai_1.expect(askUserForParam_1.checkResponse("???", {
                param: "param",
                label: "pick one!",
                type: "SELECT",
                options: [{ value: "aaa" }, { value: "bbb" }, { value: "ccc" }],
            })).to.equal(false);
        });
        it("should return true if an valid choice is selected", () => {
            chai_1.expect(askUserForParam_1.checkResponse("aaa", {
                param: "param",
                label: "pick one!",
                type: "SELECT",
                options: [{ value: "aaa" }, { value: "bbb" }, { value: "ccc" }],
            })).to.equal(true);
        });
        it("should return false if multiple invalid choices are selected", () => {
            chai_1.expect(askUserForParam_1.checkResponse("d,e,f", {
                param: "param",
                label: "pick multiple!",
                type: "MULTISELECT",
                options: [{ value: "aaa" }, { value: "bbb" }, { value: "ccc" }],
            })).to.equal(false);
        });
        it("should return true if one valid choice is selected", () => {
            chai_1.expect(askUserForParam_1.checkResponse("ccc", {
                param: "param",
                label: "pick multiple!",
                type: "MULTISELECT",
                options: [{ value: "aaa" }, { value: "bbb" }, { value: "ccc" }],
            })).to.equal(true);
        });
        it("should return true if multiple valid choices are selected", () => {
            chai_1.expect(askUserForParam_1.checkResponse("aaa,bbb,ccc", {
                param: "param",
                label: "pick multiple!",
                type: "MULTISELECT",
                options: [{ value: "aaa" }, { value: "bbb" }, { value: "ccc" }],
            })).to.equal(true);
        });
        it("should return false if regex validation fails for one of the choices picked", () => {
            chai_1.expect(askUserForParam_1.checkResponse("123,345,abc", {
                param: "param",
                label: "pick multiple!",
                type: "MULTISELECT",
                options: [{ value: "123" }, { value: "345" }, { value: "abc" }],
                validationRegex: `^\\d{3}$`,
                required: true,
            })).to.equal(false);
            const expectedWarning = `abc is not a valid answer since it does not fit the regular expression "^\\d{3}$"`;
            chai_1.expect(logWarningSpy.called).to.equal(true);
        });
        it("should return true if regex validation passes for all of the choices picked", () => {
            chai_1.expect(askUserForParam_1.checkResponse("123,345,567", {
                param: "param",
                label: "pick multiple!",
                type: "MULTISELECT",
                options: [{ value: "123" }, { value: "345" }, { value: "567" }],
                validationRegex: `^\\d{3}$`,
                required: true,
            })).to.equal(true);
        });
    });
    describe("getInquirerDefaults", () => {
        it("should return the label of the option whose value matches the default", () => {
            const options = [{ label: "lab", value: "val" }, { label: "lab1", value: "val1" }];
            const def = "val1";
            const res = askUserForParam_1.getInquirerDefault(options, def);
            chai_1.expect(res).to.equal("lab1");
        });
        it("should return the value of the default option if it doesnt have a label", () => {
            const options = [{ label: "lab", value: "val" }, { value: "val1" }];
            const def = "val1";
            const res = askUserForParam_1.getInquirerDefault(options, def);
            chai_1.expect(res).to.equal("val1");
        });
        it("should return an empty string if a default option is not found", () => {
            const options = [{ label: "lab", value: "val" }, { value: "val1" }];
            const def = "val2";
            const res = askUserForParam_1.getInquirerDefault(options, def);
            chai_1.expect(res).to.equal("");
        });
    });
    describe("askForParam", () => {
        let promptStub;
        beforeEach(() => {
            promptStub = sinon.stub(prompt, "promptOnce");
            promptStub.onCall(0).returns("Invalid123");
            promptStub.onCall(1).returns("InvalidStill123");
            promptStub.onCall(2).returns("ValidName");
        });
        afterEach(() => {
            promptStub.restore();
        });
        it("should keep prompting user until valid input is given", () => __awaiter(this, void 0, void 0, function* () {
            yield askUserForParam_1.askForParam(testSpec);
            chai_1.expect(promptStub.calledThrice).to.be.true;
        }));
    });
    describe("ask", () => {
        let subVarSpy;
        let promptStub;
        beforeEach(() => {
            subVarSpy = sinon.spy(modsHelper, "substituteParams");
            promptStub = sinon.stub(prompt, "promptOnce");
            promptStub.returns("ValidName");
        });
        afterEach(() => {
            subVarSpy.restore();
            promptStub.restore();
        });
        it("should call substituteParams with the right parameters", () => __awaiter(this, void 0, void 0, function* () {
            const spec = [testSpec];
            const firebaseProjectVars = { PROJECT_ID: "my-project" };
            yield askUserForParam_1.ask(spec, firebaseProjectVars);
            chai_1.expect(subVarSpy.calledWith(spec, firebaseProjectVars)).to.be.true;
        }));
    });
});
//# sourceMappingURL=askUserForParam.spec.js.map