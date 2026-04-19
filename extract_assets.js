const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const publicCssDir = path.join(__dirname, 'public', 'css');
const publicJsDir = path.join(__dirname, 'public', 'js');

if (!fs.existsSync(publicCssDir)) fs.mkdirSync(publicCssDir, { recursive: true });
if (!fs.existsSync(publicJsDir)) fs.mkdirSync(publicJsDir, { recursive: true });

const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

files.forEach(file => {
const filePath = path.join(viewsDir, file);
let content = fs.readFileSync(filePath, 'utf8');
const baseName = path.basename(file, '.ejs');

let hasChanges = false;

const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;
let cssMatch;
let combinedCss = '';
while ((cssMatch = styleRegex.exec(content)) !== null) {
    combinedCss += cssMatch[1] + '\n';
    hasChanges = true;
}

if (combinedCss) {
    fs.writeFileSync(path.join(publicCssDir, `${baseName}.css`), combinedCss.trim());
    let firstReplaced = false;
    content = content.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, () => {
        if (!firstReplaced) {
            firstReplaced = true;
            return `<link rel="stylesheet" href="/css/${baseName}.css">`;
        }
        return '';
    });
}


const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g;
let jsMatch;
let combinedJs = '';
while ((jsMatch = scriptRegex.exec(content)) !== null) {
    let jsContent = jsMatch[1]; 
    
    combinedJs += jsContent + '\n';
    hasChanges = true;
}

if (combinedJs) {
    const ejsLines = [];
    const lines = combinedJs.split('\n');
    const cleanJsLines = [];
    
    lines.forEach(line => {
        if (line.includes('<%') && line.includes('%>')) {
            ejsLines.push(line.trim());
        } else {
            cleanJsLines.push(line);
        }
    });
    
    fs.writeFileSync(path.join(publicJsDir, `${baseName}.js`), cleanJsLines.join('\n').trim());
    
    let firstReplaced = false;
    content = content.replace(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g, () => {
        if (!firstReplaced) {
            firstReplaced = true;
            return `<script>\n${ejsLines.join('\n')}\n</script>\n<script src="/js/${baseName}.js"></script>`;
        }
        return '';
    });
}

if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`Extracted assets for ${file}`);
}
});
