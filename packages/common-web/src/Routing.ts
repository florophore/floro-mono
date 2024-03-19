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
import OrgPortalDocs from './pages/common/docs/product/pages/OrgPortalDocs';
import LocalRepositoryDocs from './pages/common/docs/product/pages/LocalRepositoryDocs';
import RemoteRepositoryDocs from './pages/common/docs/product/pages/RemoteRepositoryDocs';
import MergingAndConflictsDocs from './pages/common/docs/product/pages/MergingAndConflictsDocs';
import AdvancedCommandsDocs from './pages/common/docs/product/pages/AdvancedCommandsDocs';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';

import TextPlugin from './pages/common/docs/plugin/TextPlugin';
import IconsPlugin from './pages/common/docs/plugin/IconsPlugin';
import ThemePlugin from './pages/common/docs/plugin/ThemePlugin';
import PalettePlugin from './pages/common/docs/plugin/PalettePlugin';
import ChromeExtensionDocs from './pages/common/docs/product/pages/ChromeExtensionDocs';
import CopyAndPasteDocs from './pages/common/docs/product/pages/CopyAndPasteDocs';
import DevDocsLanding from './pages/common/docs/dev/DevDocsLanding';
import IntegratingDocs from './pages/common/docs/dev/pages/IntegratingDocs';
import CLIDocs from './pages/common/docs/dev/pages/CLIDocs';
import APIDocs from './pages/common/docs/dev/pages/APIDocs';
import DevelopingWithFloroDocs from './pages/common/docs/dev/pages/DevelopingWithFloroDocs';
import PricingPage from './pages/common/Pricing';

/**
 *  put common shared page routes here
 */
const CommonRouting: IsomorphicRoute[] = [
  {
    path: "/oauth/:provider/callback",
    component: () => OAuthCallback,
  },
  {
    path: "/privacy",
    component: () => PrivacyPolicyPage,
  },
  {
    path: "/tos",
    component: () => TermsOfServicePage,
  },
  {
    path: "/about",
    component: () => About,
  },
  {
    path: "/pricing",
    component: () => PricingPage,
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
    path: "/docs/plugins/text",
    component: () => TextPlugin,
  },
  {
    path: "/docs/plugins/icons",
    component: () => IconsPlugin,
  },
  {
    path: "/docs/plugins/theme",
    component: () => ThemePlugin,
  },
  {
    path: "/docs/plugins/palette",
    component: () => PalettePlugin,
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
    path: "/docs/product/org-portal",
    component: () => OrgPortalDocs,
  },
  {
    path: "/docs/product/local-repositories",
    component: () => LocalRepositoryDocs,
  },
  {
    path: "/docs/product/remote-repositories",
    component: () => RemoteRepositoryDocs,
  },
  {
    path: "/docs/product/merging-and-conflicts",
    component: () => MergingAndConflictsDocs,
  },
  {
    path: "/docs/product/advanced-commands",
    component: () => AdvancedCommandsDocs,
  },
  {
    path: "/docs/product/floro-chrome-extension",
    component: () => ChromeExtensionDocs,
  },
  {
    path: "/docs/product/copy-and-paste",
    component: () => CopyAndPasteDocs,
  },
  {
    path: "/docs/dev",
    component: () => DevDocsLanding,
  },
  {
    path: "/docs/dev/integrating",
    component: () => IntegratingDocs,
  },
  {
    path: "/docs/dev/cli",
    component: () => CLIDocs,
  },
  {
    path: "/docs/dev/api",
    component: () => APIDocs,
  },
  {
    path: "/docs/dev/developing-with-floro",
    component: () => DevelopingWithFloroDocs,
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