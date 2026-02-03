import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Demo Application Entry Point
 * 
 * This is the entry point for the ThreeViewer demo application.
 * It renders the App component which showcases the ThreeViewer component.
 * 
 * Requirement 6.3: THE project SHALL include a demo application that showcases the Viewer component
 * Requirement 6.4: WHEN running in development mode, THE project SHALL support hot module replacement
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element. Make sure there is a <div id="root"></div> in your HTML.');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
