import Home from './pages/Home';
import About from './pages/About';
import OAuthCallback from './pages/OAuthCallback';

const Routing = [
  {
    path: "/",
    component: () => Home,
  },
  {
    path: "/about",
    component: () => About,
  },
  {
    path: "/oauth/:provider/callback",
    component: () => OAuthCallback,
  },
];

export default Routing;