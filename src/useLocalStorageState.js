import { useState, useEffect } from "react";

// Custom hook to manage state synchronized with local storage
// Similar to useState, but persists state in local storage
export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    // Initialize watchedMovies state from local storage
    // lazy evaluation function
    // Function Must Be PURE !!, with no arguments, no side efects, and return initial state value
    const storedMovies = localStorage.getItem(key);
    return JSON.parse(storedMovies) || initialValue;
  });

  // Effect to synchronize watchedMovies state with local storage on mount and update on changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
