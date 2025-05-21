const fs = require('fs');
const path = require('path');

// Fungsi untuk membaca file .env
function parseEnvFile(filePath) {
    try {
        const envContent = fs.readFileSync(filePath, 'utf8');
        const envVars = {};

        // Parse konten .env
        envContent.split('\n').forEach(line => {
            // Abaikan komentar dan baris kosong
            if (!line || line.startsWith('#')) return;

            // Parse key=value
            const [key, ...valueParts] = line.split('=');
            if (!key) return;

            // Gabungkan value jika ada tanda = dalam nilai
            const value = valueParts.join('=').trim();

            // Simpan dalam object
            envVars[key.trim()] = value;
        });

        return envVars;
    } catch (error) {
        console.error('Error reading .env file:', error.message);
        return {};
    }
}

console.log('Starting local build process...');

// Baca variabel dari .env
const envPath = path.resolve(process.cwd(), '.env');
const envVars = parseEnvFile(envPath);

// Ambil API key
const apiKey = envVars.OPENWEATHER_API_KEY || '';

if (!apiKey) {
    console.error('ERROR: OPENWEATHER_API_KEY not found in .env file');
    console.error('Please make sure your .env file contains OPENWEATHER_API_KEY=[your-api-key]');
    process.exit(1);
}

try {
    // Baca file script.js
    const scriptPath = path.resolve(process.cwd(), 'script.js');
    let scriptContent = fs.readFileSync(scriptPath, 'utf-8');

    // Ganti placeholder dengan API key dari .env
    scriptContent = scriptContent.replace(/%OPENWEATHER_API_KEY%/g, apiKey);

    // Simpan perubahan
    fs.writeFileSync(scriptPath, scriptContent);
    console.log('✅ API key successfully injected from .env');

    // Simpan backup untuk pengembangan (optional)
    fs.writeFileSync(scriptPath + '.bak', scriptContent);
} catch (error) {
    console.error('Error in build process:', error.message);
    process.exit(1);
}

console.log('Local build completed successfully!'); 