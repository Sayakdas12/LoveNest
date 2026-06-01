// PM2 config — used for NON-Docker deployments only.
// When running inside Docker, PM2 is not needed;
// Docker's `restart: unless-stopped` handles process recovery.
module.exports = {
  apps: [
    {
      name: "lovenest-api",
      script: "./src/app.js",
      instances: 1,         // Socket.IO requires fork mode (1 instance) without Redis adapter
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "512M",
      restart_delay: 3000,
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      log_file: "/var/log/pm2/lovenest.log",
      error_file: "/var/log/pm2/lovenest-error.log",
      merge_logs: true,
    },
  ],
};
