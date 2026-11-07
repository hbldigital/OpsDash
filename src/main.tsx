import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupStaticApiFallback } from './utils/staticApiFallback';

// Initialize offline / static hosting API support for environments like GitHub Pages
try {
  setupStaticApiFallback();
} catch (e) {
  console.warn('Fallback initialization notice:', e);
}

createRoot(document.getElementById('root')!).render(<App />);

