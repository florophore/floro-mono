import React, { Suspense } from 'react';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import Home from './pages/Home';
import About from './pages/About';
import routing from './Routing';
import './App.css'
import {
  Routes,
  Route,
} from "react-router-dom";

function App() {

  return (
    <div>
      <Routes>
        {routing.map((route, key) => {
          const Page = route.component();
          return (
            <Route key={key} path={route.path} element={<Page/>}/>
          );
        })}
      </Routes>
    </div>
  );
}

export default App;
