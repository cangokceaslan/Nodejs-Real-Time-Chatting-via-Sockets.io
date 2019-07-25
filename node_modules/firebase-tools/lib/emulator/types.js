"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Emulators;
(function (Emulators) {
    Emulators["FUNCTIONS"] = "functions";
    Emulators["FIRESTORE"] = "firestore";
    Emulators["DATABASE"] = "database";
    Emulators["HOSTING"] = "hosting";
})(Emulators = exports.Emulators || (exports.Emulators = {}));
exports.ALL_EMULATORS = [
    Emulators.FUNCTIONS,
    Emulators.FIRESTORE,
    Emulators.DATABASE,
    Emulators.HOSTING,
];
class EmulatorLog {
    constructor(level, type, text, data, timestamp) {
        this.level = level;
        this.type = type;
        this.text = text;
        this.data = data;
        this.timestamp = timestamp;
        this.timestamp = this.timestamp || new Date().toString();
        this.data = this.data || {};
    }
    get date() {
        if (!this.timestamp) {
            return new Date(0);
        }
        return new Date(this.timestamp);
    }
    static waitForFlush() {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!EmulatorLog.WAITING_FOR_FLUSH) {
                    resolve();
                    clearInterval(interval);
                }
            }, 10);
        });
    }
    static fromJSON(json) {
        let parsedLog;
        let isNotJSON = false;
        try {
            parsedLog = JSON.parse(json);
        }
        catch (err) {
            isNotJSON = true;
        }
        parsedLog = parsedLog || {};
        if (isNotJSON ||
            parsedLog.level === undefined ||
            parsedLog.type === undefined ||
            parsedLog.text === undefined) {
            parsedLog = {
                level: "USER",
                text: json,
            };
        }
        return new EmulatorLog(parsedLog.level, parsedLog.type, parsedLog.text, parsedLog.data, parsedLog.timestamp);
    }
    toString() {
        return this.toStringCore(false);
    }
    toPrettyString() {
        return this.toStringCore(true);
    }
    log() {
        const msg = `${this.toString()}\n`;
        this.bufferMessage(msg);
        this.flush();
    }
    bufferMessage(msg) {
        EmulatorLog.LOG_BUFFER.push(msg);
    }
    flush() {
        const nextMsg = EmulatorLog.LOG_BUFFER.shift();
        if (!nextMsg) {
            return;
        }
        EmulatorLog.WAITING_FOR_FLUSH = true;
        if (process.send) {
            process.send(nextMsg, undefined, {}, (err) => {
                if (err) {
                    process.stderr.write(err);
                }
                EmulatorLog.WAITING_FOR_FLUSH = EmulatorLog.LOG_BUFFER.length > 0;
                this.flush();
            });
        }
        else {
            process.stderr.write("subprocess.send() is undefined, cannot communicate with Functions Runtime.");
        }
    }
    toStringCore(pretty = false) {
        return JSON.stringify({
            timestamp: this.timestamp,
            level: this.level,
            text: this.text,
            data: this.data,
            type: this.type,
        }, undefined, pretty ? 2 : 0);
    }
}
EmulatorLog.WAITING_FOR_FLUSH = false;
EmulatorLog.LOG_BUFFER = [];
exports.EmulatorLog = EmulatorLog;
var Severity;
(function (Severity) {
    Severity[Severity["SEVERITY_UNSPECIFIED"] = 0] = "SEVERITY_UNSPECIFIED";
    Severity[Severity["DEPRECATION"] = 1] = "DEPRECATION";
    Severity[Severity["WARNING"] = 2] = "WARNING";
    Severity[Severity["ERROR"] = 3] = "ERROR";
})(Severity = exports.Severity || (exports.Severity = {}));
//# sourceMappingURL=types.js.map