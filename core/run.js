#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const MGLIntrepretor= require('./index'); 

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("Usage: mgl <file.mgl>");
    process.exit(1);
}

const filePath = args[0];

if (!filePath.endsWith('.mgl')) {
    console.error("Error: Only .mgl files are supported");
    process.exit(1);
}

if (!fs.existsSync(filePath)) {
    console.error(`Error: File "${filePath}" not found`);
    process.exit(1);
}

fs.readFile(filePath, 'utf8', (err, code) => {
    if (err) {
        console.error("Error reading the file:", err);
        process.exit(1);
    }

    const interpreter = new MGLIntrepretor();
    interpreter.run(code);
});
