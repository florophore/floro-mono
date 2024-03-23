"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// just for development
require("dotenv/config");
var process_1 = require("process");
var fs = require("fs");
var path = require("path");
var url_1 = require("url");
var events_1 = require("events");
var node_cluster_1 = require("node:cluster");
var os_1 = require("os");
events_1["default"].defaultMaxListeners = 50;
var container_1 = require("@floro/servers/src/container");
var AppServer_1 = require("@floro/servers/src/AppServer");
var Backend_1 = require("@floro/backend/src/Backend");
var __dirname = path.dirname((0, url_1.fileURLToPath)(import.meta.url));
var isDevelopment = process_1["default"].env.NODE_ENV == 'development';
var template = fs.readFileSync(path.resolve(__dirname, isDevelopment ? 'index.html' : './dist/client/index.html'), 'utf-8');
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var numCPUs, backend, i, worker, shouldPerformMigrations, appServer;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                numCPUs = os_1["default"].cpus().length;
                if (!(((_a = process_1["default"] === null || process_1["default"] === void 0 ? void 0 : process_1["default"].env) === null || _a === void 0 ? void 0 : _a.RUN_AS_CLUSTER) == "TRUE" && node_cluster_1["default"].isPrimary && numCPUs > 1)) return [3 /*break*/, 2];
                backend = container_1["default"].get(Backend_1["default"]);
                return [4 /*yield*/, backend.startDatabase(true)];
            case 1:
                _c.sent();
                for (i = 0; i < numCPUs; i++) {
                    worker = node_cluster_1["default"].fork();
                    worker.on('exit', function (code, signal) {
                        if (signal) {
                            console.log("worker was killed by signal: ".concat(signal));
                        }
                        else if (code !== 0) {
                            console.log("worker exited with error code: ".concat(code));
                        }
                        else {
                            console.log('worker success!');
                        }
                    });
                }
                return [3 /*break*/, 3];
            case 2:
                shouldPerformMigrations = ((_b = process_1["default"] === null || process_1["default"] === void 0 ? void 0 : process_1["default"].env) === null || _b === void 0 ? void 0 : _b.RUN_AS_CLUSTER) != "TRUE" || numCPUs <= 1;
                appServer = container_1["default"].get(AppServer_1["default"]);
                appServer.startServer(template, shouldPerformMigrations);
                console.log("started main app...");
                _c.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); })();
