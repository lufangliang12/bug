const fs = require('fs');
const path = require('path');

const sqlContent = fs.readFileSync(path.join(__dirname, 'districts.sql'), 'utf-8');
const lines = sqlContent.split('\n');

const schools = [];
const schoolRegex = /INSERT INTO `school` VALUES \('(\d+)', '(\d+)', '(\d+)', '(.*?)', '(\d+)', '(\d+)', '(\d+)', '(.*?)', '([\d.]+)', '([\d.]+)', '(.*?)', '(.*?)', '(.*?)', '(\d+)', '(\d+)', '(\d+)', '(\d+)', '(.*?)',/;

const seen = new Set();

lines.forEach(line => {
    if (line.includes("INSERT INTO `school`")) {
        const match = line.match(schoolRegex);
        if (match) {
            const name = match[4];
            const lng = parseFloat(match[9]);
            const lat = parseFloat(match[10]);
            
            if (lng && lat && lng > 70 && lng < 140 && lat > 15 && lat < 55) {
                const key = name + '_' + lng.toFixed(2) + '_' + lat.toFixed(2);
                if (!seen.has(key)) {
                    seen.add(key);
                    schools.push([name, lng, lat]);
                }
            }
        }
    }
});

console.log('Total unique schools:', schools.length);

const jsContent = `var schools=${JSON.stringify(schools)};`;
fs.writeFileSync(path.join(__dirname, 'schools_min.js'), jsContent, 'utf-8');

console.log('Data saved to schools_min.js');
console.log('File size:', (jsContent.length / 1024).toFixed(1), 'KB');
