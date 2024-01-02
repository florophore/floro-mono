/**
 * TODO: Rewrite this config to ESM
 * But currently electron-builder doesn't support ESM configs
 * @see https://github.com/develar/read-config-file/issues/10
 */

/**
 * @type {() => import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */

require('dotenv').config();

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
  const dotenv = await import('dotenv');
  dotenv.config();
  const {getVersion} = await import('./version/getVersion.mjs');

  return {
    appId: 'com.florophore.floro',
    asar: true,
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
    forceCodeSigning: true,
    linux: {
      target: ['deb', 'rpm'],
      publish: ["github"]
    },
    rpm: {
      depends: ['openssl'],
    },
    deb: {
      depends: ['openssl'],
    },
    mac: {
      category: 'developer-tools',
      target: ['dmg', 'zip'],
      executableName: executableName(buildEnv),
      hardenedRuntime: true,
      entitlements: 'buildResources/entitlements.mac.plist',
      entitlementsInherit: 'buildResources/entitlements.mac.plist',
      gatekeeperAssess: false,
      notarize: {
        appBundleId: appId(buildEnv),
        teamId: process.env.TEAM_ID,
      },
      publish: ["github"]
    },
    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64'],
        },
      ],
      artifactName: '${productName}_${version}.${ext}',
      icon: 'buildResources/icon.ico',
      certificateSubjectName: "Cheqout Payments, Inc",
      publish: ["github"]
    },
    nsis: {
      oneClick: false,
      perMachine: false,
      allowToChangeInstallationDirectory: true,
      deleteAppDataOnUninstall: false,
    },
    //publish: null,
  };
};
