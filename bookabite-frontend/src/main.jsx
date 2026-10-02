import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MascotProvider } from './context/MascotContext';
import { ToastProvider } from './components/common/Toast';

import App from './App.jsx';
import './index.css';
import './styles/cafe-theme.css';
import './styles/vibrant.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MascotProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </MascotProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);