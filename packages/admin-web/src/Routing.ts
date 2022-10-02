import Home from './pages/Home';
import About from './pages/About';
import OAuthCallback from './pages/authentication/OAuthCallback';

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

export const matchRoute = (fullPath: string) => {
  const [path] = fullPath.split("?");
  const pathParts = path.split("/");
  return [...Routing].reverse().find((route) => {
    const routeParts = route.path.split("/");
    if (routeParts.length != pathParts.length) {
      return false;
    }
    for (let i = 0; i < routeParts.length; ++i) {
      const rp = routeParts[i];
      const pp = pathParts[i];
      if (pp != rp && rp[0] != ":") {
        return false;
      }
    }
    return true;
  });
};

export default Routing;