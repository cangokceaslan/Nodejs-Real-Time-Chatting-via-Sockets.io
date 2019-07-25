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
const functionsEmulator_1 = require("../../emulator/functionsEmulator");
const fixtures_1 = require("./fixtures");
const request = require("request");
const _ = require("lodash");
function _countLogEntries(runtime) {
    return __awaiter(this, void 0, void 0, function* () {
        const counts = {};
        runtime.events.on("log", (el) => {
            counts[el.type] = (counts[el.type] || 0) + 1;
        });
        yield runtime.exit;
        return counts;
    });
}
function InvokeRuntimeWithFunctions(frb, triggers, opts) {
    const serializedTriggers = triggers.toString();
    opts = opts || {};
    opts.ignore_warnings = true;
    return functionsEmulator_1.InvokeRuntime(process.execPath, frb, Object.assign({}, opts, { serializedTriggers }));
}
function CallHTTPSFunction(runtime, frb, options = {}, requestData) {
    return __awaiter(this, void 0, void 0, function* () {
        yield runtime.ready;
        const dataPromise = new Promise((resolve, reject) => {
            const path = `/${frb.projectId}/us-central1/${frb.triggerId}`;
            const requestOptions = Object.assign({ method: "POST" }, options);
            if (requestData) {
                requestOptions.body = requestData;
            }
            request(`http://unix:${runtime.metadata.socketPath}:${path}`, requestOptions, (err, res, body) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(body);
            });
        });
        const result = yield dataPromise;
        yield runtime.exit;
        return result;
    });
}
describe("FunctionsEmulator-Runtime", () => {
    describe("Stubs, Mocks, and Helpers (aka Magic, Glee, and Awesomeness)", () => {
        describe("_InitializeNetworkFiltering(...)", () => {
            it("should log outgoing unknown HTTP requests via 'http'", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onCreate, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate(() => __awaiter(this, void 0, void 0, function* () {
                            yield new Promise((resolve) => {
                                console.log(require("http").get.toString());
                                require("http").get("http://example.com", resolve);
                            });
                        })),
                    };
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["unidentified-network-access"]).to.gte(1);
            })).timeout(fixtures_1.TIMEOUT_LONG);
            it("should log outgoing unknown HTTP requests via 'https'", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onCreate, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate(() => __awaiter(this, void 0, void 0, function* () {
                            yield new Promise((resolve) => {
                                require("https").get("https://example.com", resolve);
                            });
                        })),
                    };
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["unidentified-network-access"]).to.gte(1);
            })).timeout(fixtures_1.TIMEOUT_LONG);
            it("should log outgoing Google API requests", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onCreate, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate(() => __awaiter(this, void 0, void 0, function* () {
                            yield new Promise((resolve) => {
                                require("https").get("https://storage.googleapis.com", resolve);
                            });
                        })),
                    };
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["googleapis-network-access"]).to.gte(1);
            })).timeout(fixtures_1.TIMEOUT_LONG);
        });
        describe("_InitializeFirebaseAdminStubs(...)", () => {
            it("should provide stubbed default app from initializeApp", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onCreate, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate(() => __awaiter(this, void 0, void 0, function* () { })),
                    };
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["default-admin-app-used"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should provide non-stubbed non-default app from initializeApp", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onCreate, () => {
                    require("firebase-admin").initializeApp();
                    require("firebase-admin").initializeApp({}, "non-default");
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate(() => __awaiter(this, void 0, void 0, function* () { })),
                    };
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["non-default-admin-app-used"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should route all sub-fields accordingly", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onCreate, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate(() => __awaiter(this, void 0, void 0, function* () {
                            console.log(JSON.stringify(require("firebase-admin").firestore.FieldValue.increment(4)));
                        })),
                    };
                });
                runtime.events.on("log", (el) => {
                    if (el.level !== "USER") {
                        return;
                    }
                    chai_1.expect(JSON.parse(el.text)).to.deep.eq({ operand: 4 });
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["function-log"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should provide a stubbed Firestore through admin.firestore()", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onCreate, () => {
                    const admin = require("firebase-admin");
                    admin.initializeApp();
                    const firestore = admin.firestore();
                    const ref = firestore.collection("foo").doc("bar");
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate(() => __awaiter(this, void 0, void 0, function* () {
                            return true;
                        })),
                    };
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["set-firestore-settings"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should provide a stubbed Firestore through app.firestore()", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onCreate, () => {
                    const admin = require("firebase-admin");
                    const app = admin.initializeApp();
                    const firestore = app.firestore();
                    const ref = firestore.collection("foo").doc("bar");
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate(() => __awaiter(this, void 0, void 0, function* () {
                            return true;
                        })),
                    };
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["set-firestore-settings"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should provide the same stubs through admin-global or through the default app", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onRequest, () => {
                    const admin = require("firebase-admin");
                    const app = admin.initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => {
                            res.json({
                                appFirestoreSettings: app.firestore()._settings,
                                adminFirestoreSettings: admin.firestore()._settings,
                                appDatabaseRef: app
                                    .database()
                                    .ref()
                                    .toString(),
                                adminDatabaseRef: admin
                                    .database()
                                    .ref()
                                    .toString(),
                            });
                        }),
                    };
                });
                const data = yield CallHTTPSFunction(runtime, fixtures_1.FunctionRuntimeBundles.onRequest);
                const info = JSON.parse(data);
                chai_1.expect(info.appFirestoreSettings).to.deep.eq(info.adminFirestoreSettings);
                chai_1.expect(info.appDatabaseRef).to.eq(info.adminDatabaseRef);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should expose Firestore prod when the emulator is not running", () => __awaiter(this, void 0, void 0, function* () {
                const frb = _.cloneDeep(fixtures_1.FunctionRuntimeBundles.onRequest);
                frb.ports = {};
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    const admin = require("firebase-admin");
                    admin.initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => {
                            res.json(admin.firestore()._settings);
                        }),
                    };
                });
                const data = yield CallHTTPSFunction(runtime, frb);
                const info = JSON.parse(data);
                chai_1.expect(info.projectId).to.eql("fake-project-id");
                chai_1.expect(info.servicePath).to.be.undefined;
                chai_1.expect(info.port).to.be.undefined;
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should expose a stubbed Firestore when the emulator is running", () => __awaiter(this, void 0, void 0, function* () {
                const frb = _.cloneDeep(fixtures_1.FunctionRuntimeBundles.onRequest);
                frb.ports = {
                    firestore: 9090,
                };
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    const admin = require("firebase-admin");
                    admin.initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => {
                            res.json(admin.firestore()._settings);
                        }),
                    };
                });
                const data = yield CallHTTPSFunction(runtime, frb);
                const info = JSON.parse(data);
                chai_1.expect(info.projectId).to.eql("fake-project-id");
                chai_1.expect(info.servicePath).to.eq("localhost");
                chai_1.expect(info.port).to.eq(9090);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should expose RTDB prod when the emulator is not running", () => __awaiter(this, void 0, void 0, function* () {
                const frb = _.cloneDeep(fixtures_1.FunctionRuntimeBundles.onRequest);
                frb.ports = {};
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    const admin = require("firebase-admin");
                    admin.initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => {
                            res.json({
                                url: admin
                                    .database()
                                    .ref()
                                    .toString(),
                            });
                        }),
                    };
                });
                const data = yield CallHTTPSFunction(runtime, frb);
                const info = JSON.parse(data);
                chai_1.expect(info.url).to.eql("https://fake-project-id.firebaseio.com/");
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should expose a stubbed RTDB when the emulator is running", () => __awaiter(this, void 0, void 0, function* () {
                const frb = _.cloneDeep(fixtures_1.FunctionRuntimeBundles.onRequest);
                frb.ports = {
                    database: 9090,
                };
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    const admin = require("firebase-admin");
                    admin.initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => {
                            res.json({
                                url: admin
                                    .database()
                                    .ref()
                                    .toString(),
                            });
                        }),
                    };
                });
                const data = yield CallHTTPSFunction(runtime, frb);
                const info = JSON.parse(data);
                chai_1.expect(info.url).to.eql("http://localhost:9090/");
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should merge .settings() with emulator settings", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onCreate, () => {
                    const admin = require("firebase-admin");
                    admin.initializeApp();
                    admin.firestore().settings({
                        timestampsInSnapshots: true,
                    });
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate(() => __awaiter(this, void 0, void 0, function* () { })),
                    };
                });
                runtime.events.on("log", (el) => {
                    chai_1.expect(el.text.indexOf("You can only call settings() once")).to.eq(-1);
                });
                yield runtime.exit;
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should merge .initializeApp arguments from user", () => __awaiter(this, void 0, void 0, function* () {
                if (process.env.CI) {
                    return;
                }
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onCreate, () => {
                    const admin = require("firebase-admin");
                    admin.initializeApp({
                        databaseURL: "fake-app-id.firebaseio.com",
                    });
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate((snap, ctx) => __awaiter(this, void 0, void 0, function* () {
                            admin
                                .database()
                                .ref("write-test")
                                .set({
                                date: new Date(),
                            });
                        })),
                    };
                });
                runtime.events.on("log", (el) => {
                    if (el.level !== "USER") {
                        return;
                    }
                    chai_1.expect(el.text.indexOf("Please ensure that you spelled the name of your " +
                        "Firebase correctly (https://fake-app-id.firebaseio.com)")).to.gte(0);
                    runtime.kill();
                });
                yield runtime.exit;
            })).timeout(fixtures_1.TIMEOUT_MED);
        });
        describe("_InitializeFunctionsConfigHelper()", () => {
            it("should tell the user if they've accessed a non-existent function field", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onCreate, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate(() => __awaiter(this, void 0, void 0, function* () {
                            console.log(require("firebase-functions").config().doesnt.exist);
                            console.log(require("firebase-functions").config().does.exist);
                            console.log(require("firebase-functions").config().also_doesnt.exist);
                        })),
                    };
                }, {
                    env: {
                        CLOUD_RUNTIME_CONFIG: JSON.stringify({
                            does: { exist: "already exists" },
                        }),
                    },
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["functions-config-missing-value"]).to.eq(2);
            })).timeout(fixtures_1.TIMEOUT_MED);
        });
    });
    describe("Runtime", () => {
        describe("HTTPS", () => {
            it("should handle a GET request", () => __awaiter(this, void 0, void 0, function* () {
                const frb = fixtures_1.FunctionRuntimeBundles.onRequest;
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
                            res.json({ from_trigger: true });
                        })),
                    };
                });
                const data = yield CallHTTPSFunction(runtime, frb);
                chai_1.expect(JSON.parse(data)).to.deep.equal({ from_trigger: true });
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should handle a POST request with form data", () => __awaiter(this, void 0, void 0, function* () {
                const frb = fixtures_1.FunctionRuntimeBundles.onRequest;
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
                            res.json(req.body);
                        })),
                    };
                });
                const reqData = "name=sparky";
                const data = yield CallHTTPSFunction(runtime, frb, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Content-Length": reqData.length,
                    },
                }, reqData);
                chai_1.expect(JSON.parse(data)).to.deep.equal({ name: "sparky" });
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should handle a POST request with JSON data", () => __awaiter(this, void 0, void 0, function* () {
                const frb = fixtures_1.FunctionRuntimeBundles.onRequest;
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
                            res.json(req.body);
                        })),
                    };
                });
                const reqData = '{"name": "sparky"}';
                const data = yield CallHTTPSFunction(runtime, frb, {
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": reqData.length,
                    },
                }, reqData);
                chai_1.expect(JSON.parse(data)).to.deep.equal({ name: "sparky" });
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should handle a POST request with text data", () => __awaiter(this, void 0, void 0, function* () {
                const frb = fixtures_1.FunctionRuntimeBundles.onRequest;
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
                            res.json(req.body);
                        })),
                    };
                });
                const reqData = "name is sparky";
                const data = yield CallHTTPSFunction(runtime, frb, {
                    headers: {
                        "Content-Type": "text/plain",
                        "Content-Length": reqData.length,
                    },
                }, reqData);
                chai_1.expect(JSON.parse(data)).to.deep.equal("name is sparky");
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should handle a POST request with any other type", () => __awaiter(this, void 0, void 0, function* () {
                const frb = fixtures_1.FunctionRuntimeBundles.onRequest;
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
                            res.json(req.body);
                        })),
                    };
                });
                const reqData = "name is sparky";
                const data = yield CallHTTPSFunction(runtime, frb, {
                    headers: {
                        "Content-Type": "gibber/ish",
                        "Content-Length": reqData.length,
                    },
                }, reqData);
                chai_1.expect(JSON.parse(data).type).to.deep.equal("Buffer");
                chai_1.expect(JSON.parse(data).data.length).to.deep.equal(14);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should handle a POST request and store rawBody", () => __awaiter(this, void 0, void 0, function* () {
                const frb = fixtures_1.FunctionRuntimeBundles.onRequest;
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
                            res.send(req.rawBody);
                        })),
                    };
                });
                const reqData = "How are you?";
                const data = yield CallHTTPSFunction(runtime, frb, {
                    headers: {
                        "Content-Type": "gibber/ish",
                        "Content-Length": reqData.length,
                    },
                }, reqData);
                chai_1.expect(data).to.equal(reqData);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should forward request to Express app", () => __awaiter(this, void 0, void 0, function* () {
                const frb = fixtures_1.FunctionRuntimeBundles.onRequest;
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    require("firebase-admin").initializeApp();
                    const app = require("express")();
                    app.all("/", (req, res) => {
                        res.json({
                            hello: req.header("x-hello"),
                        });
                    });
                    return {
                        function_id: require("firebase-functions").https.onRequest(app),
                    };
                });
                const data = yield CallHTTPSFunction(runtime, frb, {
                    headers: {
                        "x-hello": "world",
                    },
                });
                chai_1.expect(JSON.parse(data)).to.deep.equal({ hello: "world" });
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should handle `x-forwarded-host`", () => __awaiter(this, void 0, void 0, function* () {
                const frb = fixtures_1.FunctionRuntimeBundles.onRequest;
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
                            res.json({ hostname: req.hostname });
                        })),
                    };
                });
                const data = yield CallHTTPSFunction(runtime, frb, {
                    headers: {
                        "x-forwarded-host": "real-hostname",
                    },
                });
                chai_1.expect(JSON.parse(data)).to.deep.equal({ hostname: "real-hostname" });
            })).timeout(fixtures_1.TIMEOUT_MED);
        });
        describe("Cloud Firestore", () => {
            it("should provide Change for firestore.onWrite()", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onWrite, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onWrite((change) => __awaiter(this, void 0, void 0, function* () {
                            console.log(JSON.stringify({
                                before_exists: change.before.exists,
                                after_exists: change.after.exists,
                            }));
                        })),
                    };
                });
                runtime.events.on("log", (el) => {
                    if (el.level !== "USER") {
                        return;
                    }
                    chai_1.expect(JSON.parse(el.text)).to.deep.eq({ before_exists: false, after_exists: true });
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["function-log"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should provide Change for firestore.onUpdate()", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onUpdate, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onUpdate((change) => __awaiter(this, void 0, void 0, function* () {
                            console.log(JSON.stringify({
                                before_exists: change.before.exists,
                                after_exists: change.after.exists,
                            }));
                        })),
                    };
                });
                runtime.events.on("log", (el) => {
                    if (el.level !== "USER") {
                        return;
                    }
                    chai_1.expect(JSON.parse(el.text)).to.deep.eq({ before_exists: true, after_exists: true });
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["function-log"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should provide DocumentSnapshot for firestore.onDelete()", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onDelete, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onDelete((snap) => __awaiter(this, void 0, void 0, function* () {
                            console.log(JSON.stringify({
                                snap_exists: snap.exists,
                            }));
                        })),
                    };
                });
                runtime.events.on("log", (el) => {
                    if (el.level !== "USER") {
                        return;
                    }
                    chai_1.expect(JSON.parse(el.text)).to.deep.eq({ snap_exists: true });
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["function-log"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("should provide DocumentSnapshot for firestore.onCreate()", () => __awaiter(this, void 0, void 0, function* () {
                const runtime = InvokeRuntimeWithFunctions(fixtures_1.FunctionRuntimeBundles.onWrite, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions")
                            .firestore.document("test/test")
                            .onCreate((snap) => __awaiter(this, void 0, void 0, function* () {
                            console.log(JSON.stringify({
                                snap_exists: snap.exists,
                            }));
                        })),
                    };
                });
                runtime.events.on("log", (el) => {
                    if (el.level !== "USER") {
                        return;
                    }
                    chai_1.expect(JSON.parse(el.text)).to.deep.eq({ snap_exists: true });
                });
                const logs = yield _countLogEntries(runtime);
                chai_1.expect(logs["function-log"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
        });
        describe("Error handling", () => {
            it("Should handle regular functions for Express handlers", () => __awaiter(this, void 0, void 0, function* () {
                const frb = fixtures_1.FunctionRuntimeBundles.onRequest;
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => {
                            global["not a thing"]();
                        }),
                    };
                });
                const logs = _countLogEntries(runtime);
                try {
                    yield CallHTTPSFunction(runtime, frb);
                }
                catch (e) {
                }
                chai_1.expect((yield logs)["runtime-error"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("Should handle async functions for Express handlers", () => __awaiter(this, void 0, void 0, function* () {
                const frb = fixtures_1.FunctionRuntimeBundles.onRequest;
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions").https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
                            global["not a thing"]();
                        })),
                    };
                });
                const logs = _countLogEntries(runtime);
                try {
                    yield CallHTTPSFunction(runtime, frb);
                }
                catch (_a) {
                }
                chai_1.expect((yield logs)["runtime-error"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
            it("Should handle async/runWith functions for Express handlers", () => __awaiter(this, void 0, void 0, function* () {
                const frb = fixtures_1.FunctionRuntimeBundles.onRequest;
                const runtime = InvokeRuntimeWithFunctions(frb, () => {
                    require("firebase-admin").initializeApp();
                    return {
                        function_id: require("firebase-functions")
                            .runWith({})
                            .https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
                            global["not a thing"]();
                        })),
                    };
                });
                const logs = _countLogEntries(runtime);
                try {
                    yield CallHTTPSFunction(runtime, frb);
                }
                catch (_b) {
                }
                chai_1.expect((yield logs)["runtime-error"]).to.eq(1);
            })).timeout(fixtures_1.TIMEOUT_MED);
        });
    });
});
//# sourceMappingURL=functionsEmulatorRuntime.spec.js.map