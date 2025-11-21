import { useState, useEffect } from "react";

const KEY = "bf85e984"; // OMDB API key

export function useFetch(query, page) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [numOfResults, setNumOfResults] = useState(0);

  // Then useEffect to fetch movies from OMDB API based on search query and page number
  //   Fetch movies from OMDB API whenever query or page changes
  useEffect(() => {
    const controller = new AbortController();
    async function fetchMovies() {
      try {
        setIsLoading(true);

        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&s=${query}&page=${page}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error("Something went wrong with fetching data");
        }

        const data = await res.json();
        if (data.Response === "False") {
          throw new Error("No results found");
        }

        setSearchResults(data.Search);
        setNumOfResults(Number(data.totalResults) || 0);
        setError("");
        // // logging fetch results to console
        // console.log(data);
        // console.log(data.Search);
      } catch (err) {
        if (err.name !== "AbortError") {
          // console.log("Fetch aborted");
          console.error(err.message);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setSearchResults([]);
      setNumOfResults(0);
      return;
    }
    fetchMovies();

    return () => {
      controller.abort();
    };
  }, [query, page]);

  //  Return the fetched data and loading/error states
  return { searchResults, isLoading, error, numOfResults };
}
