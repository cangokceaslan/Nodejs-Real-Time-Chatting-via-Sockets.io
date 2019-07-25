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
const error_1 = require("../../error");
const updateHelper = require("../../mods/updateHelper");
const prompt = require("../../prompt");
const SPEC = {
    name: "test",
    displayName: "Old",
    description: "descriptive",
    version: "1.0.0",
    license: "MIT",
    apis: [{ apiName: "api1", reason: "" }, { apiName: "api2", reason: "" }],
    roles: [{ role: "role1", reason: "" }, { role: "role2", reason: "" }],
    resources: [
        { name: "resource1", type: "function", description: "desc" },
        { name: "resource2", type: "other", description: "" },
    ],
    author: { authorName: "Tester" },
    contributors: [{ authorName: "Tester 2" }],
    billingRequired: true,
    sourceUrl: "test.com",
    params: [],
};
describe("updateHelper", () => {
    describe("displayChangesNoInput", () => {
        it("should display changes to version", () => {
            const newSpec = _.cloneDeep(SPEC);
            newSpec.version = "1.1.0";
            const loggedLines = updateHelper.displayChangesNoInput(SPEC, newSpec);
            const expected = ["", "**Version:**", "- 1.0.0", "+ 1.1.0"];
            chai_1.expect(loggedLines).to.eql(expected);
        });
        it("should display changes to display name", () => {
            const newSpec = _.cloneDeep(SPEC);
            newSpec.displayName = "new";
            const loggedLines = updateHelper.displayChangesNoInput(SPEC, newSpec);
            const expected = [
                "",
                "**Display Name:**",
                "\u001b[31m- Old\u001b[39m",
                "\u001b[32m+ new\u001b[39m",
            ];
            chai_1.expect(loggedLines).to.eql(expected);
        });
        it("should display changes to description", () => {
            const newSpec = _.cloneDeep(SPEC);
            newSpec.description = "even better";
            const loggedLines = updateHelper.displayChangesNoInput(SPEC, newSpec);
            const expected = [
                "",
                "**Description:**",
                "\u001b[31m- descriptive\u001b[39m",
                "\u001b[32m+ even better\u001b[39m",
            ];
            chai_1.expect(loggedLines).to.eql(expected);
        });
        it("should notify the user if billing is no longer required", () => {
            const newSpec = _.cloneDeep(SPEC);
            newSpec.billingRequired = false;
            const loggedLines = updateHelper.displayChangesNoInput(SPEC, newSpec);
            const expected = ["", "**Billing is no longer required for this mod.**"];
            chai_1.expect(loggedLines).to.eql(expected);
        });
        it("should display nothing if no relevant fields were changed", () => {
            const newSpec = _.cloneDeep(SPEC);
            newSpec.license = "drivers";
            const loggedLines = updateHelper.displayChangesNoInput(SPEC, newSpec);
            const expected = [];
            chai_1.expect(loggedLines).to.eql(expected);
        });
    });
    describe("displayChangesRequiringConfirmation", () => {
        let promptStub;
        beforeEach(() => {
            promptStub = sinon.stub(prompt, "promptOnce");
        });
        afterEach(() => {
            promptStub.restore();
        });
        it("should prompt for changes to license and continue if user gives consent", () => {
            promptStub.resolves(true);
            const newSpec = _.cloneDeep(SPEC);
            newSpec.license = "To Kill";
            chai_1.expect(updateHelper.displayChangesRequiringConfirmation(SPEC, newSpec)).not.to.be.rejected;
            chai_1.expect(promptStub.callCount).to.equal(1);
            chai_1.expect(promptStub.firstCall.args[0].message).to.contain("To Kill");
        });
        it("should prompt for changes to apis and continue if user gives consent", () => {
            promptStub.resolves(true);
            const newSpec = _.cloneDeep(SPEC);
            newSpec.apis = [{ apiName: "api2", reason: "" }, { apiName: "api3", reason: "" }];
            chai_1.expect(updateHelper.displayChangesRequiringConfirmation(SPEC, newSpec)).not.to.be.rejected;
            chai_1.expect(promptStub.callCount).to.equal(1);
            chai_1.expect(promptStub.firstCall.args[0].message).to.contain("- api1");
            chai_1.expect(promptStub.firstCall.args[0].message).to.contain("+ api3");
        });
        it("should prompt for changes to roles and continue if user gives consent", () => {
            promptStub.resolves(true);
            const newSpec = _.cloneDeep(SPEC);
            newSpec.roles = [{ role: "role2", reason: "" }, { role: "role3", reason: "" }];
            chai_1.expect(updateHelper.displayChangesRequiringConfirmation(SPEC, newSpec)).not.to.be.rejected;
            chai_1.expect(promptStub.callCount).to.equal(1);
            chai_1.expect(promptStub.firstCall.args[0].message).to.contain("- role1");
            chai_1.expect(promptStub.firstCall.args[0].message).to.contain("+ role3");
        });
        it("should prompt for changes to resources and continue if user gives consent", () => {
            promptStub.resolves(true);
            const newSpec = _.cloneDeep(SPEC);
            newSpec.resources = [
                { name: "resource3", type: "function", description: "new desc" },
                { name: "resource2", type: "other", description: "" },
            ];
            chai_1.expect(updateHelper.displayChangesRequiringConfirmation(SPEC, newSpec)).not.to.be.rejected;
            chai_1.expect(promptStub.callCount).to.equal(1);
            chai_1.expect(promptStub.firstCall.args[0].message).to.contain("- resource1");
            chai_1.expect(promptStub.firstCall.args[0].message).to.contain("desc");
            chai_1.expect(promptStub.firstCall.args[0].message).to.contain("+ resource3");
            chai_1.expect(promptStub.firstCall.args[0].message).to.contain("new desc");
        });
        it("should prompt for changes to resources and continue if user gives consent", () => {
            promptStub.resolves(true);
            const oldSpec = _.cloneDeep(SPEC);
            oldSpec.billingRequired = false;
            chai_1.expect(updateHelper.displayChangesRequiringConfirmation(oldSpec, SPEC)).not.to.be.rejected;
            chai_1.expect(promptStub.callCount).to.equal(1);
            chai_1.expect(promptStub.firstCall.args[0].message).to.contain("Billing is now required for the new version of this mod. Would you like to continue?");
        });
        it("should exit if the user consents to one change but rejects another", () => {
            promptStub.resolves(true);
            promptStub.resolves(false);
            const newSpec = _.cloneDeep(SPEC);
            newSpec.license = "New";
            newSpec.roles = [{ role: "role2", reason: "" }, { role: "role3", reason: "" }];
            chai_1.expect(updateHelper.displayChangesRequiringConfirmation(SPEC, newSpec)).to.be.rejectedWith(error_1.FirebaseError, "Without explicit consent for the change to license, we cannot update this mod instance.");
            chai_1.expect(promptStub.callCount).to.equal(1);
        });
        it("should error if the user doesn't give consent", () => {
            promptStub.resolves(false);
            const newSpec = _.cloneDeep(SPEC);
            newSpec.license = "new";
            chai_1.expect(updateHelper.displayChangesRequiringConfirmation(SPEC, newSpec)).to.be.rejectedWith(error_1.FirebaseError, "Without explicit consent for the change to license, we cannot update this mod instance.");
        });
        it("shouldn't prompt the user if no changes require confirmation", () => __awaiter(this, void 0, void 0, function* () {
            promptStub.resolves(false);
            const newSpec = _.cloneDeep(SPEC);
            newSpec.version = "1.1.0";
            yield updateHelper.displayChangesRequiringConfirmation(SPEC, newSpec);
            chai_1.expect(promptStub).not.to.have.been.called;
        }));
    });
});
//# sourceMappingURL=updateHelper.spec.js.map