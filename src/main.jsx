import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Diagnostic Telemetry: Intercept any synchronous or asynchronous crashes in Chrome/Edge
// and display a descriptive glassmorphic diagnostic report card instead of a blank/stuck screen!
const handleCrash = (error) => {
  console.error("AdViral Engine Diagnostic Trap:", error);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="min-height: 100vh; background-color: #07020d; background-image: radial-gradient(circle at center, #1b0730 0%, #07020d 100%); color: #fda4af; padding: 24px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box; text-align: left;">
        <div style="max-width: 650px; width: 100%; border: 1px solid rgba(244,63,94,0.25); background-color: rgba(9,5,19,0.9); padding: 32px; border-radius: 24px; box-shadow: 0 0 50px rgba(244,63,94,0.08); backdrop-filter: blur(12px);">
          <div style="display: inline-flex; background-color: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.3); color: #f43f5e; padding: 6px 14px; border-radius: 9999px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px;">
            ⚠️ Diagnostic Telemetry Trap
          </div>
          <h2 style="margin: 0 0 8px 0; color: #ffffff; font-size: 20px; font-weight: 900; tracking: -0.025em;">AdViral AI Engine Initialisation Failed</h2>
          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 24px 0; line-height: 1.6; font-weight: 500;">
            A critical browser-level error was intercepted during the React startup mount lifecycle. Share the telemetry trace below with support nodes to clear this node:
          </p>
          <div style="background-color: #000000; border: 1px solid rgba(244,63,94,0.15); border-radius: 16px; padding: 16px; margin-bottom: 20px; overflow-x: auto;">
            <pre style="margin: 0; font-size: 11px; line-height: 1.6; color: #f43f5e; white-space: pre-wrap; word-break: break-all;">${error?.stack || error?.message || String(error)}</pre>
          </div>
          <div style="font-size: 10px; color: #6b7280; font-weight: 600; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); pt: 16px; padding-top: 16px;">
            <span>Origin: ${window.location.origin}</span>
            <span>Agent Build: 60dfaa2</span>
          </div>
        </div>
      </div>
    `;
  }
};

window.addEventListener('error', (event) => {
  handleCrash(event.error || new Error(event.message));
});

window.addEventListener('unhandledrejection', (event) => {
  handleCrash(event.reason || new Error('Unhandled Promise Rejection'));
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
