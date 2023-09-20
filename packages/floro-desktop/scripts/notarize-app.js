const { notarize } = require("@electron/notarize");

const buildEnv = process?.env.BUILD_ENV ?? "dev";
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin" || process.env.NO_NOTARY) {
    return;
  }

    const appId = (buildEnv) => {
    if (buildEnv == "staging") {
        return 'com.florophore.floro-staging';
    }
    if (buildEnv == "dev") {
        return 'com.florophore.floro-dev';
    }
    return 'com.florophore.floro';
    }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    tool: "notarytool",
    appBundleId: appId(buildEnv),
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASS,
    teamId: process.env.TEAM_ID,
  });
};