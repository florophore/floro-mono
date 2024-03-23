const path = require('path');
const fs = require('fs');
const { prependOnceListener } = require('process');

const envFile = path.join(__dirname, '.env');

let envOut = "";
for (const envVar in process.env) {
    envOut = `${envOut}${envVar}=${process.env[envVar]}\n`;
}

if (!fs.existsSync(envFile)) {
    fs.writeFileSync(envFile, envOut, 'utf-8');
    console.log("WROTE ENV");
}