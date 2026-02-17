import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available - show update prompt
              console.log('New version available');

              // Dispatch custom event for the app to handle
              window.dispatchEvent(new CustomEvent('sw-update-available'));

              // Auto-reload after a short delay to ensure fresh content
              // This can be replaced with a user prompt if preferred
              if (confirm('Доступна новая версия приложения. Обновить сейчас?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('SW registration failed:', error);
      });
  });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      window.location.reload();
    }
  });
} else {
  console.warn('Service Worker not supported');
}

createRoot(document.getElementById("root")!).render(<App />);
