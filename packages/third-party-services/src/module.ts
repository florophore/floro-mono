import { ContainerModule  } from 'inversify';

import GithubLoginClient from './github/GithubLoginClient';
import GoogleLoginClient from './google/GoogleLoginClient';

export default new ContainerModule((bind): void => {
    //third party
    bind(GithubLoginClient).toSelf();
    bind(GoogleLoginClient).toSelf();
});