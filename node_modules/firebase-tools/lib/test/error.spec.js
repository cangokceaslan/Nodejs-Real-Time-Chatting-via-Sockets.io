"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const error_1 = require("../error");
describe("error", () => {
    describe("FirebaseError", () => {
        it("should be an instance of Error", () => {
            const error = new error_1.FirebaseError("test-message");
            chai_1.expect(error).to.be.instanceOf(Error);
        });
        it("should apply default options", () => {
            const error = new error_1.FirebaseError("test-message");
            chai_1.expect(error).to.deep.include({ children: [], exit: 1, name: "FirebaseError", status: 500 });
        });
        it("should persist all options", () => {
            const allOptions = {
                children: ["test-child-1", "test-child-2"],
                context: "test-context",
                exit: 123,
                original: new Error("test-original-error-message"),
                status: 456,
            };
            const error = new error_1.FirebaseError("test-message", allOptions);
            chai_1.expect(error).to.deep.include(allOptions);
        });
    });
});
//# sourceMappingURL=error.spec.js.map