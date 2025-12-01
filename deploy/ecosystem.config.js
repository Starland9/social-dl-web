/* PM2 ecosystem config for Next.js production server */
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

module.exports = {
  apps: [
    {
      name: 'social-dl-web',
      cwd: projectRoot,
      script: path.join(projectRoot, 'node_modules/next/dist/bin/next'),
      args: 'start -p 3002',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
        BACKEND_URL: process.env.BACKEND_URL || 'https://api.socialdl.starland9.dev',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3007,
        BACKEND_URL: process.env.BACKEND_URL || 'https://api.socialdl.starland9.dev',
      },
      max_memory_restart: '1G',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      merge_logs: true,
      out_file: path.join(projectRoot, 'logs/out.log'),
      error_file: path.join(projectRoot, 'logs/error.log'),
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
  ],
};
