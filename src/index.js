import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

// Error boundary for catching React errors
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

const root = document.createElement('div');
root.id = 'app';
document.body.appendChild(root);

try {
  ReactDOM.render(
    <App />,
    document.querySelector('#app')
  );
} catch (error) {
  console.error('React render error:', error);
  document.querySelector('#app').innerHTML = `
    <div style="padding: 20px; color: red;">
      <h2>Error loading application</h2>
      <pre>${error.toString()}</pre>
      <p>Check the browser console for more details.</p>
    </div>
  `;
}


