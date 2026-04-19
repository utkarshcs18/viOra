const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const publicCssDir = path.join(__dirname, 'public', 'css');
const publicJsDir = path.join(__dirname, 'public', 'js');

// Ensure public dirs exist
if (!fs.existsSync(publicCssDir)) fs.mkdirSync(publicCssDir, { recursive: true });
if (!fs.existsSync(publicJsDir)) fs.mkdirSync(publicJsDir, { recursive: true });

const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

files.forEach(file => {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const baseName = path.basename(file, '.ejs');
    
    let hasChanges = false;
    
    // Extract CSS
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;
    let cssMatch;
    let combinedCss = '';
    while ((cssMatch = styleRegex.exec(content)) !== null) {
        combinedCss += cssMatch[1] + '\n';
        hasChanges = true;
    }
    
    if (combinedCss) {
        fs.writeFileSync(path.join(publicCssDir, `${baseName}.css`), combinedCss.trim());
        // Replace first <style> with <link>, remove others
        let firstReplaced = false;
        content = content.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, () => {
            if (!firstReplaced) {
                firstReplaced = true;
                return `<link rel="stylesheet" href="/css/${baseName}.css">`;
            }
            return '';
        });
    }

    // Extract JS
    // Be careful with EJS tags inside JS. We need to define them globally before the script loads.
    // So we'll find script blocks that DON'T have src= attribute.
    const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g;
    let jsMatch;
    let combinedJs = '';
    while ((jsMatch = scriptRegex.exec(content)) !== null) {
        let jsContent = jsMatch[1];
        
        // Quick dirty fix: if index.ejs has `const isAuthenticated = "<%- isAuthenticated %>" === "true";`, 
        // we should remove it from the extracted file, and put it inline in the HTML.
        // For general safety, any line containing `<%-` or `<%=` will be left inline or mapped.
        
        // Actually, we'll just extract everything and fix the EJS vars via a manual regex pass.
        // Let's replace EJS tags in the JS with window variables if they exist.
        // Wait, it's easier to just move the entire script into main.js, EXCEPT lines that have EJS.
        
        combinedJs += jsContent + '\n';
        hasChanges = true;
    }
    
    if (combinedJs) {
        // Find lines with EJS tags to inject as global vars inline
        const ejsLines = [];
        const lines = combinedJs.split('\n');
        const cleanJsLines = [];
        
        lines.forEach(line => {
            if (line.includes('<%') && line.includes('%>')) {
                // If it's a variable declaration like `const isAuthenticated = ...`
                // we can just put this line inside an inline script.
                ejsLines.push(line.trim());
                // We do NOT add it to the clean JS file to prevent IDE/parse errors, but wait,
                // if it's `let player;` we might need it. 
                // Let's just leave the EJS variables in an inline block in the EJS file!
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
