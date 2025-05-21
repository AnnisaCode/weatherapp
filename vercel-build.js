const fs = require('fs');

// Baca environment variables dari Vercel
const apiKey = process.env.VERCEL_PUBLIC_OPENWEATHER_API_KEY || '';

console.log('Starting Vercel build process...');

if (!apiKey) {
    console.warn('WARNING: VERCEL_PUBLIC_OPENWEATHER_API_KEY is not set');
    console.warn('Make sure to set this environment variable in your Vercel dashboard');
    process.exit(1);
}

try {
    // Baca file script.js
    let scriptContent = fs.readFileSync('script.js', 'utf-8');

    // Ganti placeholder dengan API key dari environment variable
    scriptContent = scriptContent.replace(/%OPENWEATHER_API_KEY%/g, apiKey);

    // Simpan perubahan
    fs.writeFileSync('script.js', scriptContent);
    console.log('✅ API key successfully injected from Vercel environment');
} catch (error) {
    console.error('Error in build process:', error);
    process.exit(1);
}

console.log('Vercel build completed successfully!'); 