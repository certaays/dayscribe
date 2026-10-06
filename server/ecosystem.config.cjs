module.exports = {
  apps: [
    {
      name: 'dayscribe-api',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_file: '.env',
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
    },
  ],
};
