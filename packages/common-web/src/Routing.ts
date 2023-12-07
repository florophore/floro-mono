import MainHome from './pages/main/Home';
import AdminHome from './pages/admin/Home';
import About from './pages/common/About';
import HowItWorksPart1 from './pages/common/HowItWorksPart1';
import HowItWorksPart2 from './pages/common/HowItWorksPart2';
import OAuthCallback from './pages/common/authentication/OAuthCallback';
import CredentialVerifyCallback from './pages/common/authentication/CredentialVerifyCallback';
import CredentialAuthCallback from './pages/common/authentication/CredentialAuthCallback';

import DocsLanding from './pages/common/docs/DocsLanding';
import ProductDocsLanding from './pages/common/docs/product/ProductDocsLanding';
import ProductAndTerminologyDocs from './pages/common/docs/product/pages/ProductAndTerminologyDocs';
import UserPortalDocs from './pages/common/docs/product/pages/UserPortalDocs';

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
    path: "/technical-overview-part-1",
    component: () => HowItWorksPart1,
  },
  {
    path: "/technical-overview-part-2",
    component: () => HowItWorksPart2,
  },
  {
    path: "/docs",
    component: () => DocsLanding,
  },
  {
    path: "/docs/product",
    component: () => ProductDocsLanding,
  },
  {
    path: "/docs/product/product-and-terms",
    component: () => ProductAndTerminologyDocs,
  },
  {
    path: "/docs/product/user-portal",
    component: () => UserPortalDocs,
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
    path: "/credential/verify",
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