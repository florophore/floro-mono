const {parse} = require('dotenv');
const fs = require('fs');
const path = require('path');

const buildEnv = process?.env.BUILD_ENV ?? 'dev';

const getEnvVarString = buildEnv => {
  if (buildEnv == 'dev') {
    return fs.readFileSync(path.join(__dirname, '..', './.env.dev.env'), {encoding: 'utf-8'});
  }
  if (buildEnv == 'staging') {
    return fs.readFileSync(path.join(__dirname, '..', './.env.staging.env'), {encoding: 'utf-8'});
  }
  return fs.readFileSync(path.join(__dirname, '..', './.env.prod.env'), {encoding: 'utf-8'});
};

const envVars = parse(getEnvVarString(buildEnv));

/**
 * Somehow inject app version to vite build context
 * @return {import('vite').Plugin}
 */
export const injectEnvVars = () => ({
  name: 'inject-env-vars',
  config: () => {
    for (const key in envVars) {
      if (!key.startsWith("VITE_")) {
        process.env["VITE_" + key] = envVars[key];
      } else {
        process.env[key] = envVars[key];
      }
    }
  },
});
