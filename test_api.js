const ejs = require('ejs');
const fs = require('fs');
try {
    const template = fs.readFileSync('views/index.ejs', 'utf-8');
    ejs.compile(template);
    console.log("EJS compiled successfully.");
} catch (e) {
    console.error("EJS Error:", e.message);
}
