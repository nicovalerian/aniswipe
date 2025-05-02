import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from "@/components/ui/provider"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider>
      <App /> {/* NO UserProvider */}
    </Provider>
  </React.StrictMode>,
)