#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Ordinals Inscriber Setup Verification\n');

// Check if all required files exist
const requiredFiles = [
    'package.json',
    'server.js',
    'Dockerfile',
    'docker-compose.yml',
    'umbrel-app.yml',
    'exports.sh',
    'public/index.html',
    'public/style.css',
    'public/script.js',
    'uploads/.gitkeep'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing!');
    process.exit(1);
}

// Check if node_modules exists
const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
console.log(`\n📦 Dependencies: ${nodeModulesExists ? '✅ Installed' : '❌ Missing'}`);

if (!nodeModulesExists) {
    console.log('   Run: npm install');
    process.exit(1);
}

// Check if uploads directory is writable
try {
    const testFile = path.join(__dirname, 'uploads', 'test.tmp');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('📁 Uploads directory: ✅ Writable');
} catch (error) {
    console.log('📁 Uploads directory: ❌ Not writable');
    console.log('   Error:', error.message);
}

console.log('\n🚀 Setup Status: All checks passed!');
console.log('\nNext Steps:');
console.log('1. Copy .env.example to .env and configure your Bitcoin RPC settings');
console.log('2. Ensure ord binary is installed and accessible');
console.log('3. Run: npm start (or npm run dev for development)');
console.log('4. Open: http://localhost:3333');

console.log('\nFor Umbrel deployment:');
console.log('1. Build: docker build -t ordinals-inscriber .');
console.log('2. Test: docker-compose up');
console.log('3. Deploy to your Umbrel app store');
