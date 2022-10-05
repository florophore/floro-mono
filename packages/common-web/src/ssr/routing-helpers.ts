export interface IsomorphicRoute {
  path: string;
  component: () => (props: unknown) => JSX.Element;
}

export const routeOrdinal = (path: string, maxSize: number): number => {
    const [,...parts] = path.split('/');
    let value = 0;
    for(let n = 0; n < maxSize; ++n) {
      if (!parts?.[maxSize - n - 1]?.startsWith?.(':')) {
        value += Math.pow(2, n);
      }
    }
    return value;
  }
  
  export const sortRoutes = (routing: IsomorphicRoute[]): IsomorphicRoute[]=> {
    const maxRouteSize = Math.max(...(routing.map(({path}) => path.split('/').length - 1)));
    return routing.sort((routeA: IsomorphicRoute, routeB: IsomorphicRoute) => {
      const aOrdinal = routeOrdinal(routeA.path, maxRouteSize);
      const bOrdinal = routeOrdinal(routeB.path, maxRouteSize);
      return bOrdinal - aOrdinal;
    });
  }
  
  export const matchRoute = (fullPath: string, routing: IsomorphicRoute[]) => {
    const [path] = fullPath.split("?");
    const pathParts = path.split("/");
    return [...routing].reverse().find((route) => {
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
