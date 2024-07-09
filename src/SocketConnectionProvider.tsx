"use client";

import {
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

interface State {
  addListener: (func: Function) => void;
  removeListener: (func: Function) => void;
  initConnection: (token?: string) => () => void;
}

const initialState: State = {
  addListener: () => {},
  removeListener: () => {},
  initConnection: (token?: string) => () => {},
};

const Context = createContext<State>(initialState);

const SOCKET_URL = `${process.env.NEXT_PUBLIC_WSS_URL}`;

export function SocketConnectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const listeners = useRef<Function[]>([]);
  const timerRef = useRef<NodeJS.Timer>();

  const addListener = useCallback<State["addListener"]>(
    (func) => listeners.current.push(func),
    []
  );
  const removeListener = useCallback<State["removeListener"]>((func) => {
    const index = listeners.current.indexOf(func);
    if (index !== -1) {
      listeners.current.splice(index, 1);
    }
  }, []);

  const initConnection = useCallback<State["initConnection"]>(
    (token?: string) => {
      let ws: WebSocket;

      console.log("initing from lib");

      const connectWs = () => {
        ws = new WebSocket(SOCKET_URL);

        console.log("url", SOCKET_URL);

        const user_random_id = Math.floor(Math.random() * 1000000);

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              type: "socket",
              token: token ?? user_random_id,
            })
          );

          clearInterval(timerRef.current as any);

          timerRef.current = setInterval(() => {
            if (ws.readyState !== WebSocket.CLOSED) {
              ws.send(
                JSON.stringify({
                  type: "ping",
                })
              );
            } else {
              clearInterval(timerRef.current as any);
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
        clearInterval(timerRef.current as any);

        if (ws) {
          ws.close();
        }
      };
    },
    []
  );

  const state = useMemo<State>(
    () => ({ addListener, removeListener, initConnection }),
    [addListener, initConnection, removeListener]
  );

  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export const useSocketEvents = (
  onMessage: (data: MessageEvent<any>) => void
) => {
  const { addListener, removeListener, initConnection } = useContext(Context);

  useEffect(() => {
    addListener(onMessage);

    return () => removeListener(onMessage);
  }, [addListener, onMessage, removeListener]);

  return { initSocketConnection: initConnection };
};
