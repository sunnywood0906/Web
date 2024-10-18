// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // 如果有全局樣式

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
