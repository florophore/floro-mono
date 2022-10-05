import MainHome from './pages/main/Home';
import AdminHome from './pages/admin/Home';
import About from './pages/common/About';
import OAuthCallback from './pages/common/authentication/OAuthCallback';

import { IsomorphicRoute, sortRoutes } from './ssr/routing-helpers';

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