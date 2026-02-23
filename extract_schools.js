const fs = require('fs');
const path = require('path');

const sqlFile = path.join(__dirname, 'districts.sql');
const outputFile = path.join(__dirname, 'schools_min.js');

const content = fs.readFileSync(sqlFile, 'utf-8');

const lines = content.split(/\r?\n/);
const schools = [];

for (const line of lines) {
    if (!line.includes("INSERT INTO `school` VALUES")) continue;
    
    const cleanLine = line.trim();
    const match = cleanLine.match(/VALUES \((.+)\);?$/);
    if (!match) continue;
    
    const valuesStr = match[1];
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];
        if (char === "'") {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    
    const name = values[3] || '';
    const lng = parseFloat(values[8] || '0');
    const lat = parseFloat(values[9] || '0');
    
    if (name && !isNaN(lat) && !isNaN(lng) && lat > 0 && lng > 0) {
        schools.push([name, lng, lat]);
    }
}

const output = `var schools=${JSON.stringify(schools)};`;
fs.writeFileSync(outputFile, output, 'utf-8');

console.log(`成功提取 ${schools.length} 所学校数据`);
console.log(`输出文件: ${outputFile}`);
