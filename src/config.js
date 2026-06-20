// Dynamically resolve the WebSocket URL based on the current hostname.
// If using ngrok or a local IP, this will automatically route to the Vite proxy.
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host; // includes port if any

export const KDS_WS_URL = import.meta.env.VITE_WS_URL 
  ? `${import.meta.env.VITE_WS_URL}/ws/kds` 
  : `${protocol}//${host}/ws/kds`;

export function getCfdWsUrl(tableId) {
    return import.meta.env.VITE_WS_URL 
      ? `${import.meta.env.VITE_WS_URL}/ws/cfd/${tableId}`
      : `${protocol}//${host}/ws/cfd/${tableId}`;
}
