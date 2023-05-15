import { useEffect } from "react";

export const useBeforeUnload = (callback: () => void) => {
  useEffect(() => {
    window.addEventListener("beforeunload", callback);

    return () => {
      window.removeEventListener("beforeunload", callback);
    };
  }, [callback]);
};
