import { useEffect } from "react";

export function useKey(keyCode, action) {
  useEffect(() => {
    function handleKeydown(e) {
      if (e.code.toLowerCase() === keyCode.toLowerCase()) {
        action();
      }
    }
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [keyCode, action]);
}
