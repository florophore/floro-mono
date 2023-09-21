/**
 * TODO: Rewrite this config to ESM
 * But currently electron-builder doesn't support ESM configs
 * @see https://github.com/develar/read-config-file/issues/10
 */

/**
 * @type {() => import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */

const buildEnv = process?.env.BUILD_ENV ?? "dev";

const appId = (buildEnv) => {
  if (buildEnv == "staging") {
    return 'com.florophore.floro-staging';
  }
  if (buildEnv == "dev") {
    return 'com.florophore.floro-dev';
  }
  return 'com.florophore.floro';
}

const productName = (buildEnv) => {
  if (buildEnv == "staging") {
    return 'Floro Staging';
  }
  if (buildEnv == "dev") {
    return 'Floro Dev';
  }
  return 'Floro';
}

const executableName = (buildEnv) => {
  if (buildEnv == "staging") {
    return 'Floro Staging';
  }
  if (buildEnv == "dev") {
    return 'Floro Dev';
  }
  return 'Floro';
}

module.exports = async function () {
  require('dotenv').config();
  const {getVersion} = await import('./version/getVersion.mjs');


  return {
    directories: {
      output: 'dist',
      buildResources: 'buildResources',
    },
    files: ['packages/**/dist/**'],
    extraMetadata: {
      version: getVersion(),
    },
    appId: appId(buildEnv),
    productName: productName(buildEnv),
    appId: 'com.florophore.floro',
    asar: false,
    forceCodeSigning: true,
    linux: {"target": ["deb", "rpm"]},
    rpm: {"depends": ["openssl"]},
    deb: {"depends": ["openssl"]},
    mac: {
      executableName: executableName(buildEnv),
      hardenedRuntime: true,
      entitlements: "buildResources/entitlements.mac.plist",
      entitlementsInherit: "buildResources/entitlements.mac.plist",
      gatekeeperAssess: false,
      target: {
        target: 'default'
      },
    },
    afterSign: "scripts/notarize-app.js",
    publish: null
    //publish: {
    //  "provider": "github"
    //},
  };
};
