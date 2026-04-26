import dotenv from "dotenv";

dotenv.config();

export const env = {
  appName: process.env.APP_NAME || "KloudBox",
  appEnv: process.env.APP_ENV || "development",
  appDebug: process.env.APP_DEBUG === "true",
  appUrl: process.env.APP_URL || "http://localhost:5000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || "change_this_secret",
  xenditSecretKey: process.env.XENDIT_SECRET_KEY || "",
  xenditCallbackToken: process.env.XENDIT_CALLBACK_TOKEN || "",
  xenditSuccessRedirectUrl:
    process.env.XENDIT_SUCCESS_REDIRECT_URL || "http://localhost:5173/dashboard?payment=success",
  xenditFailureRedirectUrl:
    process.env.XENDIT_FAILURE_REDIRECT_URL || "http://localhost:5173/pricing?payment=failed",
  dockerImage: process.env.DOCKER_IMAGE || "cloudbox-static-ssh",
  sshHost: process.env.SSH_HOST || "localhost",
  cloudBoxUsername: process.env.DEFAULT_BOX_USERNAME || "student",
  cloudBoxPassword: process.env.DEFAULT_BOX_PASSWORD || "student123",
  cloudBoxSshPort: Number(process.env.SSH_PORT_START || 2201),
  cloudBoxWebPort: Number(process.env.WEB_PORT_START || 8081),
  cloudBoxDurationDays: Number(process.env.BOX_DURATION_DAYS || 7)
};
