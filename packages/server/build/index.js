"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = require("path");
const graphql_schemas_1 = require("@floro/graphql-schemas");
console.log(graphql_schemas_1.mainSchema);
const clientPath = '../../client/build';
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const port = 3000; // default port to listen
// Serve static resources from the "public" folder (ex: when there are images to display)
app.use(express_1.default.static((0, path_1.join)(__dirname, clientPath)));
app.get('/api', (req, res) => {
    res.send(`Hello, From server`);
});
// Serve the HTML page
app.get('*', (req, res) => {
    res.sendFile((0, path_1.join)(__dirname, clientPath, 'index.html'));
});
// start the Express server
app.listen(port, () => {
    console.log(`app started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map