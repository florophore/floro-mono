import Home from './pages/Home';
import About from './pages/About';

const Routing = [
  {
    path: "/",
    component: () => Home,
  },
  {
    path: "/about",
    component: () => About,
  },
];

export default Routing;