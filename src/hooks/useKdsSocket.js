import { useEffect, useState, useRef } from 'react';
import { KDS_WS_URL } from '../config';
import { useOrderSyncStore } from '../store/orderSyncStore';

export function useKdsSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const { addOrder, orders } = useOrderSyncStore();
  const wsRef = useRef(null);

  useEffect(() => {
    let reconnectTimeout;
    let heartbeatInterval;

    function connect() {
      console.log("Connecting to KDS WebSocket at:", KDS_WS_URL);
      const ws = new WebSocket(KDS_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("KDS WebSocket connected successfully.");
        setIsConnected(true);
        // Heartbeat check to prevent drift on intermittent connections
        heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 15000); // 15 seconds ping
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.event === 'NEW_ORDER') {
            console.log("KDS WebSocket Message Received:", data);
            // Map backend payload to KDS store structure
            const mappedOrder = {
              id: data.order_id,
              table_id: data.table_id,
              table: `T-${data.table_id || '?' }`,
              status: 'To Cook', // default stage
              paymentMethod: 'qr', // Assume auto-paid via QR/Card if received via WebSocket to KDS directly
              total: data.total_amount || 0,
              items: data.items ? data.items.map((item) => ({
                product_id: item.product_id,
                name: item.product_name || item.name || `Item ${item.product_id}`,
                quantity: item.quantity,
                price: item.price || 0,
                completed: false
              })) : [],
              timestamp: new Date().toLocaleTimeString(),
              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            
            addOrder(mappedOrder);
          } else if (data.event === 'STATUS_UPDATE') {
            console.log("KDS WebSocket Status Update:", data);
            useOrderSyncStore.setState((state) => ({
              orders: state.orders.map(o => o.id === data.order_id ? { ...o, status: data.status } : o)
            }));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message data", error);
        }
      };

      ws.onclose = (event) => {
        console.warn("KDS WebSocket connection closed:", event.reason);
        setIsConnected(false);
        clearInterval(heartbeatInterval);
        // Auto-reconnect after 3 seconds
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("KDS WebSocket error observed:", error);
        ws.close();
      };
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearInterval(heartbeatInterval);
      clearTimeout(reconnectTimeout);
    };
  }, [addOrder]);

  return { isConnected };
}
