import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { startNotificationScheduler } from './utils/notificationScheduler';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Start reminder notifications scheduler
startNotificationScheduler();
