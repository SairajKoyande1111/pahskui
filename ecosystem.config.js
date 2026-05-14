module.exports = {
  apps: [
    {
      name: "krushisuvidha-api",
      cwd: "./artifacts/api-server",
      script: "node",
      args: "--enable-source-maps ./dist/index.mjs",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        PORT: 3014,
        NODE_ENV: "production",
        MONGODB_URI: "mongodb+srv://sairajkoyande_db_user:5QlrqFxJrJmM9rR4@cluster0.akmevxg.mongodb.net/?appName=Cluster0",
        MONGODB_DB: "apnaapp",
        DATALAB_API_KEY: "Jc04YbHUc7TXNbtGdnGAckr43Ji-TB8BI0tzAvKNVic",
        SESSION_SECRET: "5WKJjQBxoIEqIp95mRStE3n4GemyYQvnTVC2+S1yFsSxh7WVUd2OwrK21YJtDSNuQJU9by7MUFSn3mJAF+Xy+w==",
        CLOUDINARY_CLOUD_NAME: "dui1jsojt",
        CLOUDINARY_API_KEY: "654757969944744",
        CLOUDINARY_API_SECRET: "1f08Sf8oj70afYUfsUcRMmfBLeU",
      },
    },
  ],
};
