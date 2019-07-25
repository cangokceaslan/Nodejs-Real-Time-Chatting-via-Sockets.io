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
const path_1 = require("path");
const chai_1 = require("chai");
const error_1 = require("../error");
const archiveDirectory_1 = require("../archiveDirectory");
const SOME_FIXTURE_DIRECTORY = path_1.resolve(__dirname, "./fixtures/config-imports");
describe("archiveDirectory", () => {
    it("should archive happy little directories", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield archiveDirectory_1.archiveDirectory(SOME_FIXTURE_DIRECTORY, {});
        chai_1.expect(result.source).to.equal(SOME_FIXTURE_DIRECTORY);
        chai_1.expect(result.size).to.be.greaterThan(0);
    }));
    it("should throw a happy little error if the directory doesn't exist", () => __awaiter(this, void 0, void 0, function* () {
        yield chai_1.expect(archiveDirectory_1.archiveDirectory(path_1.resolve(__dirname, "foo"), {})).to.be.rejectedWith(error_1.FirebaseError);
    }));
});
//# sourceMappingURL=archiveDirectory.spec.js.map