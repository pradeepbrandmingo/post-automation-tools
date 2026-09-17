import React from 'react';
import ReactDOM from 'react-dom/client';
import { CustomRouter } from './router';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CustomRouter>
      <App />
    </CustomRouter>
  </React.StrictMode>
);
