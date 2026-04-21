const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let orig = content;
            
            // bg-gradient-to-* -> bg-linear-to-*
            content = content.replace(/bg-gradient-to-([a-z]+)/g, 'bg-linear-to-$1');
            
            // opacity brackets
            content = content.replace(/\/\[0\.([0-9]+)\]/g, (match, p1) => {
                let val = parseFloat('0.' + p1) * 100;
                return '/' + Math.round(val);
            });
            
            // min-h-[100dvh]
            content = content.replace(/min-h-screen\s+min-h-\[100dvh\]/g, 'min-h-screen');
            content = content.replace(/min-h-\[100dvh\]/g, 'min-h-screen');
            
            // z-[110] fix for Navbar manually inside the script
            if (fullPath.includes('Navbar.jsx')) {
                content = content.replace(/z-\[110\]/g, 'z-110');
            }
            
            if (content !== orig) {
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

processDir('src');
