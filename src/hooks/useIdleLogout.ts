import { useEffect } from "react";

const IDLE_LIMIT = 30 * 60 * 1000; // 30 minutes

export function useIdleLogout(logout: () => void) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
      }, IDLE_LIMIT);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

    events.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [logout]);
}
