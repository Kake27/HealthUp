// src/main.jsx
import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Commonstate from '../context/Commonstate.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Commonstate>
      <App />
    </Commonstate>
  </StrictMode>
);
