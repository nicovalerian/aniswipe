// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Your custom Provider (for Chakra and possibly other UI elements)
import { Provider as CustomUiProvider } from "@/components/ui/provider"; // Renamed for clarity

// 2. Your UserProvider for user state management
import { UserProvider } from './context/UserContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Outer provider (likely for UI library setup) */}
    <CustomUiProvider>
      {/* Inner provider for your application's user state */}
      <UserProvider>
        <App />
      </UserProvider>
    </CustomUiProvider>
  </React.StrictMode>,
);