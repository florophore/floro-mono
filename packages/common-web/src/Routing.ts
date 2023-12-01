import MainHome from './pages/main/Home';
import MainUserHome from './pages/main/UserHome';
import AdminHome from './pages/admin/Home';
import About from './pages/common/About';
import How from './pages/common/How';
import OAuthCallback from './pages/common/authentication/OAuthCallback';
import CredentialVerifyCallback from './pages/common/authentication/CredentialVerifyCallback';
import CredentialAuthCallback from './pages/common/authentication/CredentialAuthCallback';

import { IsomorphicRoute, sortRoutes } from './ssr/routing-helpers';
import AppProxyPage from './pages/common/app_proxy/AppProxyPage';

/**
 *  put common shared page routes here
 */
const CommonRouting: IsomorphicRoute[] = [
  {
    path: "/oauth/:provider/callback",
    component: () => OAuthCallback,
  },
  {
    path: "/about",
    component: () => About,
  },
  {
    path: "/how",
    component: () => How,
  },
  {
    path: "/app-proxy/*",
    component: () => AppProxyPage
  }
];

/**
 *  put main specific page routes here
 */
export const MainRoutes: IsomorphicRoute[] = sortRoutes([
  ...CommonRouting,
  {
    path: "/",
    component: () => MainHome,
  },
  {
    path: "/home",
    component: () => MainUserHome
  },
  {
    path: "/credential/verifiy",
    component: () => CredentialVerifyCallback,
  },
  {
    path: "/credential/auth",
    component: () => CredentialAuthCallback
  },
]);

/**
 *  put admin specific page routes here
 */
export const AdminRoutes: IsomorphicRoute[] = sortRoutes([
  ...CommonRouting,
  {
    path: "/",
    component: () => AdminHome,
  },
]);