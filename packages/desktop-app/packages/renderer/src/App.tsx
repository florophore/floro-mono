import React from 'react';
import { BrowserRouter } from "react-router-dom";
import Router from './Router';


const App = (): React.ReactElement => {
    return (
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    );
};
export default App;