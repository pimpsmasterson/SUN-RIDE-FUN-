#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌞 Sun Festival Carpool - Setup Verification\n');

const checks = [
  {
    name: 'Server files exist',
    check: () => fs.existsSync(path.join(__dirname, '../server/index.js')),
    fix: 'Ensure server/index.js exists'
  },
  {
    name: 'Database service exists',
    check: () => fs.existsSync(path.join(__dirname, '../server/services/database.js')),
    fix: 'Ensure server/services/database.js exists'
  },
  {
    name: 'Admin routes exist',
    check: () => fs.existsSync(path.join(__dirname, '../server/routes/admin.js')),
    fix: 'Ensure server/routes/admin.js exists'
  },
  {
    name: 'Client build directory exists',
    check: () => fs.existsSync(path.join(__dirname, '../client/build')),
    fix: 'Run: npm run build'
  },
  {
    name: 'Admin components exist',
    check: () => {
      const adminDir = path.join(__dirname, '../client/src/components/admin');
      return fs.existsSync(path.join(adminDir, 'AdminDashboard.js')) &&
             fs.existsSync(path.join(adminDir, 'AdminSettings.js')) &&
             fs.existsSync(path.join(adminDir, 'AdminLocations.js'));
    },
    fix: 'Ensure all admin components exist'
  },
  {
    name: 'Package.json has hosting scripts',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
      return pkg.scripts && pkg.scripts['heroku-postbuild'] && pkg.scripts['render-build'];
    },
    fix: 'Update package.json with hosting scripts'
  },
  {
    name: 'Hosting guide exists',
    check: () => fs.existsSync(path.join(__dirname, '../HOSTING_GUIDE.md')),
    fix: 'Ensure HOSTING_GUIDE.md exists'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  
  if (!passed) {
    console.log(`   Fix: ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Your application is ready for hosting.');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy to your chosen hosting platform');
  console.log('2. Access /admin/login with: admin@sunfestival.com / admin123');
  console.log('3. Configure settings through the admin panel');
  console.log('4. Add your Google Maps API key');
  console.log('5. Launch your festival carpooling platform!');
  console.log('\n📖 See HOSTING_GUIDE.md for detailed instructions.');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  process.exit(1);
}

console.log('\n🌞 Happy hosting!'); 