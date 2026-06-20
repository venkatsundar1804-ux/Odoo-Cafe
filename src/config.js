export const KDS_WS_URL = 'ws://localhost:8000/ws/kds';

export function getCfdWsUrl(tableId) {
    return `ws://localhost:8000/ws/cfd/${tableId}`;
}
