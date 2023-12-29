import pckg from '../package.json' assert { type: "json" };
/**
 * Entry function for get app version.
 * In current implementation, it returns `version` from `package.json`, but you can implement any logic here.
 * Runs several times for each vite configs and electron-builder config.
 * @return {string}
 */
export function getVersion() {
  return pckg.version;
}
