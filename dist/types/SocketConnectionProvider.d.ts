import { ReactNode } from "react";
export declare function SocketConnectionProvider({ children, }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare const useSocketEvents: (onMessage: (data: MessageEvent<any>) => void) => {
    initSocketConnection: (token?: string) => () => void;
};
