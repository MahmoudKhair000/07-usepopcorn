// import React from "react";
// import ReactDOM from "react-dom/client";
import { useEffect, useState, useRef } from "react";
import StarRating from "./StarRating";
import { useFetch } from "./useFetch";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const KEY = "bf85e984"; // OMDB API key

export default function App() {
  // const tempQuery = "interstellar";
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  // Custom hook to fetch movie data based on query and page
  const { searchResults, isLoading, error, numOfResults } = useFetch(
    query,
    page
  );
  // Custom hook to manage local storage state for watched movies
  const [watchedMovies, setWatchedMovies] = useLocalStorageState(
    "watchedMovies",
    []
  );

  const addMovieToWatched = (movie) => {
    // Create a new array with the added movie using spread operator
    // Make sure not to mutate the objects or arrays, but replace them with new ones
    setWatchedMovies((prev) => [...prev, movie]);
  };
  const removeMovieFromWatched = (movieId) => {
    setWatchedMovies((prev) => prev.filter((m) => m.imdbID !== movieId));
  };

  // Finally, the main return of the App component
  return (
    <>
      <Navbar>
        <NavbarLogo />
        <SearchBar query={query} setQuery={setQuery} setPage={setPage} />
        <NumResults numOfResults={numOfResults} />
      </Navbar>
      <Main>
        <BoxList>
          {isLoading && !error && <Loader />}
          {!isLoading && !error && (
            <ul className="list list-movies">
              {searchResults?.map((result) => (
                <SearchResult
                  key={result.imdbID}
                  result={result}
                  selected={selected}
                  setSelected={setSelected}
                />
              ))}
            </ul>
          )}
          {error && <ErrorMessage message={error} />}
        </BoxList>
        <BoxList>
          {selected === null ? (
            <>
              <Summary watched={watchedMovies} />
              <ul className="list list-watched">
                {/* Watched Movies List sorted by newly added */}
                {watchedMovies
                  ?.slice()
                  ?.reverse()
                  ?.map((result) => (
                    <WatchedMovie
                      key={result.imdbID}
                      watched={result}
                      setSelected={setSelected}
                      removeMovieFromWatched={removeMovieFromWatched}
                    />
                  ))}
              </ul>
            </>
          ) : (
            <MovieDetails
              movieId={selected}
              onCloseMovie={() => setSelected(null)}
              watched={watchedMovies}
              addMovieToWatched={addMovieToWatched}
              removeMovieFromWatched={removeMovieFromWatched}
            />
          )}
        </BoxList>
      </Main>

      <Pagination numOfResults={numOfResults} setPage={setPage} page={page} />
    </>
  );
}

/* ****************************Start Navbar**************************** */
function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function NavbarLogo() {
  return (
    <div
      className="logo"
      style={{ cursor: "pointer" }}
      onClick={() => alert("You're Home!!")}
    >
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function SearchBar({ query, setQuery, setPage }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  function handleFocus() {
    if (document.activeElement === inputRef.current) return;
    inputRef.current.focus();
    setQuery("");
  }
  useKey("Enter", handleFocus);

  useEffect(
    function () {
      function callbackFunc(e) {
        if (document.activeElement === inputRef.current) return;
        if (e.code === "Enter") {
          inputRef.current.focus();
          setQuery("");
        }
      }

      document.addEventListener("keydown", callbackFunc);
      return () => document.removeEventListener("keydown", callbackFunc);
    },
    [setQuery]
  );

  async function handleSearch(e) {
    e.preventDefault();
    const value = await e.target.value;
    setQuery(value);
    setPage(1);
  }

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={handleSearch}
      ref={inputRef}
    />
  );
}
function NumResults({ numOfResults }) {
  return (
    <p className="num-results">
      Found <strong>{numOfResults || `0`}</strong> results
    </p>
  );
}
/* *****************************End Navbar***************************** */

/* *****************************Start Main***************************** */
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function BoxList({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((prev) => !prev)}>
        {isOpen ? "▲" : "▼"}
      </button>
      {isOpen && children}
    </div>
  );
}

function SearchResult({ result, selected, setSelected }) {
  return (
    <li
      style={{ cursor: "pointer" }}
      onClick={() => {
        if (selected === result.imdbID) {
          setSelected(null);
          return;
        }
        setSelected(result.imdbID);
      }}
    >
      <img
        style={{ overflow: "hidden" }}
        src={result?.Poster}
        alt={`${result?.Title} poster`}
      />
      <h3>{result?.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{result?.Year},</span>
          <span>{result?.Type}</span>
        </p>
      </div>
    </li>
  );
}

function Summary({ watched: watchedMovies }) {
  // average reduce function
  const average = (arr) => {
    return arr.reduce((acc, cur, i, arr) => {
      return acc + cur / arr.length;
    }, 0);
  };

  const avgImdbRating = average(watchedMovies.map((movie) => movie.imdbRating));
  const avgUserRating = average(watchedMovies.map((movie) => movie.userRating));
  const avgRuntime = average(watchedMovies.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watchedMovies.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(0)} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovie({ watched: movie, setSelected, removeMovieFromWatched }) {
  return (
    <li
      style={{ cursor: "pointer" }}
      onClick={() => {
        setSelected(movie.imdbID);
      }}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>
            {movie.Type === "movie" && "🎬"}
            {movie.Type === "series" && "📺"}
            {movie.Type === "game" && "🎮"}
          </span>
          <span>{movie.Type}</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button
        className="btn-delete"
        onClick={(e) => {
          e.stopPropagation();
          removeMovieFromWatched(movie.imdbID);
        }}
      >
        &times;
      </button>
    </li>
  );
}
function MovieDetails({
  movieId,
  onCloseMovie,
  addMovieToWatched,
  watched,
  removeMovieFromWatched,
}) {
  const countRef = useRef(0);
  const [movie, setMovie] = useState(null);
  const [reloadingStarRating, setReloadingStarRating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imdbRating, setImdbRating] = useState(0);
  const [userRating, setUserRating] = useState(0);

  let isWatched = watched.some((m) => m.imdbID === movieId);
  // console.log(isWatched);

  useEffect(
    function () {
      if (StarRating) countRef.current++;
      setMovie((prevMovie) => {
        return {
          ...prevMovie,
          countRatingDecisions: countRef.current,
        };
      });
    },
    [userRating]
  );

  useEffect(() => {
    async function fetchMovieDetails() {
      setIsLoading(true);
      try {
        const res = await fetch(
          // it has to be https to prevent deploying service from blocking it
          `https://www.omdbapi.com/?apikey=${KEY}&i=${movieId}`
        );
        if (!res.ok) {
          throw new Error("Something went wrong with fetching data");
        }

        const data = await res.json();
        if (data.Response === "False") {
          throw new Error("No results found");
        }

        setUserRating(0);
        countRef.current = 0;

        setMovie({
          Title: data.Title,
          Type: data.Type,
          releaseDate: data.Released,
          genre: data.Genre,
          Poster: data.Poster,
          imdbRating: Number(data.imdbRating),
          runtime: Number(data.Runtime?.split(" ")[0]) || 0,
          plot: data.Plot,
          actors: data.Actors,
          director: data.Director,
          writer: data.Writer,
        });
        setIsLoading(false);
        // // logging fetch results to console
        // console.log(data);
      } catch (err) {
        console.error(err.message);
      }
    }
    fetchMovieDetails();
  }, [movieId]);

  useEffect(() => {
    document.title = movie ? `Movie | ${movie.Title}` : "usePopcorn";
    setImdbRating(movie?.imdbRating || 0);

    // Cleanup function to reset title on unmount
    // (when component is removed from UI)
    // This prevents title from sticking to last movie's title
    return function () {
      document.title = "usePopcorn";
    };
  }, [movie]);

  useEffect(() => {
    // console.log(userRating);
    setReloadingStarRating(true);
    setTimeout(() => {
      setReloadingStarRating(false);
    }, 10);
  }, [imdbRating]);

  useKey("Escape", onCloseMovie);
  // useEffect(() => {
  //   function escCallback(e) {
  //     if (e.code === "Escape") {
  //       onCloseMovie();
  //       // console.log("Closing...");
  //     }
  //   }
  //   document.addEventListener("keydown", escCallback);

  //   return function () {
  //     document.removeEventListener("keydown", escCallback);
  //   };
  // }, [onCloseMovie]);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-toggle-left" onClick={() => onCloseMovie()}>
              &larr;
            </button>
            <img src={movie?.Poster} alt={`${movie?.Title} poster`} />
            <div className="details-overview">
              <h2>{movie?.Title}</h2>
              <p>
                {movie?.releaseDate} • {movie?.runtime} min
              </p>
              <p>{movie?.genre}</p>
              <p>
                <span>⭐️</span> {movie?.imdbRating} IMDb Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!reloadingStarRating && (
                <>
                  <StarRating
                    defaultRating={
                      watched.find((m) => m.imdbID === movieId)?.userRating || 0
                    }
                    size={24}
                    maxRating={10}
                    onSetRating={setUserRating}
                  />

                  {userRating > 0 && !isWatched && (
                    <button
                      className="btn-add"
                      disabled={userRating === 0}
                      onClick={() => {
                        addMovieToWatched({
                          ...movie,
                          imdbID: movieId,
                          userRating: userRating,
                        });
                        onCloseMovie();
                        setUserRating(0);
                      }}
                    >
                      <b>+ Add to list</b>
                    </button>
                  )}

                  {userRating > 0 && isWatched && (
                    <>
                      <p align="center">
                        You rated this movie:{" "}
                        {watched.find((m) => m.imdbID === movieId)?.userRating}
                        ⭐️
                      </p>
                      <button
                        className="btn-add"
                        onClick={() => {
                          // setWatched((watched) => [
                          //   ...watched.filter((m) => m.imdbID !== movieId),
                          //   {
                          //     ...movie,
                          //     imdbID: movieId,
                          //     userRating: userRating,
                          //   },
                          // ]);
                          removeMovieFromWatched(movieId);
                          addMovieToWatched({
                            ...movie,
                            imdbID: movieId,
                            userRating: userRating,
                          });
                          onCloseMovie();
                          setUserRating(0);
                        }}
                      >
                        <b>Change your rating ⭐️</b>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
            <p>
              <em>{movie?.plot}</em>
            </p>
            <p>Starring: {movie?.actors}</p>
            <p>Directed by: {movie?.director}</p>
            <p>Written by: {movie?.writer}</p>
          </section>
        </>
      )}
    </div>
  );
}
// Loading and Error indicator components
function Loader() {
  return <p className="loader">Loading...</p>;
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔ </span>
      {message}
    </p>
  );
}
/* ******************************End Main****************************** */

/* **************************Start Pagination************************** */
// Start result page pagination
function Pagination({ numOfResults, page, setPage }) {
  const ulRef = useRef(null);
  // Pagination settings
  const paginationLength = Math.ceil(numOfResults / 10); // OMDB returns 10 results per page
  const [paginationLimit, setPaginationLimit] = useState(10); // Number of page buttons to show at once

  // Calculate visible page numbers
  const start = Math.max(1, page - Math.floor(paginationLimit / 2));
  const end = Math.min(paginationLength, start + paginationLimit - 1);

  const iniPagArr = [];
  for (let i = 1; i <= paginationLength; i++) {
    iniPagArr.push(i);
  }

  const visibleArr = [];
  for (let i = start; i <= end; i++) {
    visibleArr.push(i);
  }

  useEffect(() => {
    if (ulRef.current && ulRef.current.children[paginationLength - 1]) {
      let ulWidth = ulRef.current.offsetWidth;
      let liWidth =
        ulRef.current.children[ulRef.current.children.length - 1].offsetWidth;
      const newLimit = Math.floor(ulWidth / (liWidth + 15)); // 15 is approx gap between li items
      setPaginationLimit(newLimit - 1);
      // console.log({ ulWidth, liWidth: liWidth + 15, newLimit });
    }
  }, [paginationLength, ulRef]);

  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        ←
      </button>

      <ul ref={ulRef} style={{ visibility: "hidden", position: "absolute" }}>
        {iniPagArr.map((i) => (
          <li key={i}>.{i}.</li>
        ))}
      </ul>
      <ul>
        {visibleArr[0] > 1 && (
          <li onClick={() => setPage(visibleArr[0] - 1)}>...</li>
        )}

        {visibleArr.map((i) => (
          <li
            key={i}
            className={page === i ? "active" : ""}
            onClick={() => setPage(i)}
          >
            {i}
          </li>
        ))}

        {visibleArr[visibleArr.length - 1] < paginationLength && (
          <li onClick={() => setPage(visibleArr[visibleArr.length - 1] + 1)}>
            ...
          </li>
        )}
      </ul>

      <button
        disabled={page === paginationLength || paginationLength === 0}
        onClick={() => setPage(page + 1)}
      >
        →
      </button>
    </div>
  );
}
/* ***************************End Pagination*************************** */
