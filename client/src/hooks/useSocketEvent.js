import { useEffect, useRef } from "react";
import { socket } from "../socket";

const useSocketEvent = (eventName, handler) => {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!eventName) return;
    const listener = (...args) => {
      console.log("📡 socket event received:", eventName, args);
      handlerRef.current(...args);
    }
    socket.on(eventName, listener);
    return () => socket.off(eventName, listener);
  }, [eventName]);
};

export default useSocketEvent;