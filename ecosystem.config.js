module.exports = {
  apps: [
    {
      name: 'sun-carpool-server',
      script: 'server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      watch: false
    },
    {
      name: 'sun-carpool-client',
      script: 'client/node_modules/react-scripts/scripts/start.js',
      env: {
        PORT: 3000,
        BROWSER: 'none'
      },
      watch: false
    }
  ]
}; 