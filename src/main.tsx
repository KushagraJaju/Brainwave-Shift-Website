import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './index.css';

// Initialize browser tab manager to ensure cross-tab synchronization
import { browserTabManager } from './services/BrowserTabManager';

// Initialize the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root and render app
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);