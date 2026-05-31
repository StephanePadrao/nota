module.exports = {
  apps: [{
    name: "nota-admin",
    script: "npm",
    args: "start",
    cwd: "/var/www/nota/admin",
    env: {
      NODE_ENV: "production",
      PORT: "3003"
    }
  }]
}
