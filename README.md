# Floro Mono

<img width="300" src="./packages/common-assets/assets//images/floro_blink_text.png">

### Project Structure Overview

This repository is the mono-repository of the following applications

- Projects
    - <a href="./packages/floro-desktop/README.md">The Floro Desktop App</a>
    - <a href="./packages/floro-chrome-extension/README.md">The Floro Chrome Extension</a>
    - <a href="./packages/backend//README.md">The Floro Backend Service</a>
    - <a href="./packages/common-web/README.md">The Floro Web Front-End</a>

- Plugin Projects (docs coming soon, follow src/App.tsx files)
    - <a href="./packages/plugins/text/">Text</a>
    - <a href="./packages/plugins/icons/">Icons</a>
    - <a href="./packages/plugins/theme/">Theme</a>
    - <a href="./packages/plugins/palette/">Palette</a>

### Floro CLI & VCS

For code related to the floro CLI & version control client please go to <a href="https://github.com/florophore/floro">this repository</a>.

### For Self-Host Deploing

For code related to the deploying to a cloud provider please go to <a href="https://github.com/florophore/floro-terraform">this repository</a>.

### Documentation References
<b>Please <a href="https://floro.io/docs">read the product docs here before getting started</a>.</b>

<b>Please <a href="https://floro.io/oss">read the OSS guide here</a>.</b>


### Setting up the development environment

Floro development has NOT been tested on windows (aside from development on the desktop client).

####  Prerequisites

- You will need
  - Node 19.9.0
  - Postgres 13+
  - Redis 7.2.3+
  - Yarn

For plugins development, please make sure you have the latest version of the floro-cli installed.

`npm install floro -g`

Download the deps from the root of the mono-repo

`yarn install`

Download and build the floro assets

`yarn build:floro_assets`

####  Running the project

After starting up postgres and the redis server, to start the web server, you can run

`yarn build`

`yarn main:dev`

App will run on `http://localhost:9000`