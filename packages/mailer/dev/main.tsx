import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DevApp from './index';

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('Failed to find the root element')
}

const root = createRoot(rootElement)
root.render(
  <StrictMode>
    <DevApp />
  </StrictMode>,
);