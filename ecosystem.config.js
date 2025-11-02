module.exports = {
  apps: [
    {
      name: 'legal-slack-bot',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '../logs/err.log',
      out_file: '../logs/out.log',
      log_file: '../logs/combined.log',
      time: true,
      max_memory_restart: '2G',
      restart_delay: 4000,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
