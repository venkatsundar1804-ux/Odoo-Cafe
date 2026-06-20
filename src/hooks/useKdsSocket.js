import { useEffect, useState, useRef } from 'react';
import { KDS_WS_URL } from '../config';
import { useKdsStore } from '../store/kdsStore';

export function useKdsSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const addOrder = useKdsStore((state) => state.addOrder);
  const wsRef = useRef(null);

  useEffect(() => {
    let reconnectTimeout;

    function connect() {
      console.log("Connecting to KDS WebSocket at:", KDS_WS_URL);
      const ws = new WebSocket(KDS_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("KDS WebSocket connected successfully.");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("KDS WebSocket Message Received:", data);
          
          if (data.event === 'NEW_ORDER') {
            // Map backend payload to KDS store structure
            const mappedOrder = {
              id: data.order_id,
              table_id: data.table_id,
              status: 'To Cook', // default stage
              items: data.items.map((item) => ({
                product_id: item.product_id,
                name: item.name,
                quantity: item.quantity,
                completed: false
              })),
              timestamp: new Date().toLocaleTimeString()
            };
            
            addOrder(mappedOrder);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message data", error);
        }
      };

      ws.onclose = (event) => {
        console.warn("KDS WebSocket connection closed:", event.reason);
        setIsConnected(false);
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
      clearTimeout(reconnectTimeout);
    };
  }, [addOrder]);

  return { isConnected };
}
