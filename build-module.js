
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

async function buildModule() {
  console.log('🔨 Building Carbon Credits Marketplace module...');
  
  try {
    // Step 1: Run production build
    console.log('📦 Running production build...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Step 2: Verify required files exist
    const requiredFiles = [
      'dist/index.html',
      'dist/react.svg', 
      'dist/js/app.js',
      'nxs_package.json'
    ];
    
    console.log('✅ Verifying required files...');
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
      console.log(`   ✓ ${file}`);
    }
    
    // Step 3: Create zip file
    const zipFileName = 'carbon-credits-marketplace.zip';
    console.log(`📁 Creating module package: ${zipFileName}`);
    
    const output = fs.createWriteStream(zipFileName);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
        console.log(`✅ Module packaged successfully!`);
        console.log(`   📊 Size: ${sizeInMB} MB`);
        console.log(`   📦 File: ${zipFileName}`);
        console.log('');
        console.log('🚀 Ready for Nexus Wallet installation!');
        console.log('   1. Open Nexus Wallet');
        console.log('   2. Go to Settings > Modules');
        console.log(`   3. Drag and drop ${zipFileName}`);
        console.log('   4. Click "Install module"');
        resolve();
      });
      
      output.on('error', reject);
      archive.on('error', reject);
      
      archive.pipe(output);
      
      // Add the module package descriptor
      archive.file('nxs_package.json', { name: 'nxs_package.json' });
      
      // Add all dist files maintaining directory structure
      archive.file('dist/index.html', { name: 'dist/index.html' });
      archive.file('dist/react.svg', { name: 'dist/react.svg' });
      archive.file('dist/js/app.js', { name: 'dist/js/app.js' });
      
      // Add source maps if they exist
      if (fs.existsSync('dist/js/app.js.map')) {
        archive.file('dist/js/app.js.map', { name: 'dist/js/app.js.map' });
      }
      
      archive.finalize();
    });
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build process
buildModule().catch(console.error);
