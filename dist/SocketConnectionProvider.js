"use client";
import { jsx } from 'react/jsx-runtime';
import { createContext, useRef, useCallback, useMemo, useContext, useEffect } from 'react';

const initialState = {
    addListener: () => { },
    removeListener: () => { },
    initConnection: (token) => () => { },
};
const Context = createContext(initialState);
const SOCKET_URL = `${process.env.NEXT_PUBLIC_WSS_URL}`;
function SocketConnectionProvider({ children, }) {
    const listeners = useRef([]);
    const timerRef = useRef();
    const addListener = useCallback((func) => listeners.current.push(func), []);
    const removeListener = useCallback((func) => {
        const index = listeners.current.indexOf(func);
        if (index !== -1) {
            listeners.current.splice(index, 1);
        }
    }, []);
    const initConnection = useCallback((token) => {
        let ws;
        console.log("initing from lib");
        const connectWs = () => {
            ws = new WebSocket(SOCKET_URL);
            console.log("url", SOCKET_URL);
            const user_random_id = Math.floor(Math.random() * 1000000);
            ws.onopen = () => {
                ws.send(JSON.stringify({
                    type: "socket",
                    token: token !== null && token !== void 0 ? token : user_random_id,
                }));
                clearInterval(timerRef.current);
                timerRef.current = setInterval(() => {
                    if (ws.readyState !== WebSocket.CLOSED) {
                        ws.send(JSON.stringify({
                            type: "ping",
                        }));
                    }
                    else {
                        clearInterval(timerRef.current);
                    }
                }, 50000);
            };
            ws.onmessage = (event) => {
                listeners.current.forEach((func) => {
                    if (typeof func === "function") {
                        func(event);
                    }
                });
            };
            ws.onclose = (event) => {
                // console.error(`WS closed with code ${event.code}`);
            };
        };
        connectWs();
        return () => {
            clearInterval(timerRef.current);
            if (ws) {
                ws.close();
            }
        };
    }, []);
    const state = useMemo(() => ({ addListener, removeListener, initConnection }), [addListener, initConnection, removeListener]);
    return jsx(Context.Provider, { value: state, children: children });
}
const useSocketEvents = (onMessage) => {
    const { addListener, removeListener, initConnection } = useContext(Context);
    useEffect(() => {
        addListener(onMessage);
        return () => removeListener(onMessage);
    }, [addListener, onMessage, removeListener]);
    return { initSocketConnection: initConnection };
};

export { SocketConnectionProvider, useSocketEvents };
//# sourceMappingURL=SocketConnectionProvider.js.map
