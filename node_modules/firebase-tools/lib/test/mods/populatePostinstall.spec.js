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
const populatePostinstall_1 = require("../../mods/populatePostinstall");
describe("populatePostinstallInstructions", () => {
    const instructions = "These are instructions, param foo is ${param:FOO}";
    const params = { FOO: "bar" };
    it("should substitute user-provided params into instructions", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield populatePostinstall_1.populatePostinstall(instructions, params);
        const expected = "These are instructions, param foo is bar";
        chai_1.expect(result).to.include(expected);
    }));
    it("should ignore substitutions that don't have user-provided params", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield populatePostinstall_1.populatePostinstall(instructions, {});
        const expected = "These are instructions, param foo is ${param:FOO}";
        chai_1.expect(result).to.include(expected);
    }));
    it("should substitute all occurrences of substitution markers", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield populatePostinstall_1.populatePostinstall(instructions + " " + instructions, params);
        const expected = "These are instructions, param foo is bar These are instructions, param foo is bar";
        chai_1.expect(result).to.include(expected);
    }));
    it("should ignore user provided-params the don't appear in the instructions", () => __awaiter(this, void 0, void 0, function* () {
        const moreParams = { FOO: "bar", BAR: "foo" };
        const result = yield populatePostinstall_1.populatePostinstall(instructions, params);
        const expected = "These are instructions, param foo is bar";
        chai_1.expect(result).to.include(expected);
    }));
});
//# sourceMappingURL=populatePostinstall.spec.js.map