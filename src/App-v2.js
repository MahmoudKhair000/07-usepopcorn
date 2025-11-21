import { useEffect, useState, useRef } from "react";
import StarRating from "./StarRating";

const KEY = "bf85e984"; // OMDB API key

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

export default function App() {
  const tempQuery = "interstellar";
  const [query, setQuery] = useState(tempQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [numOfResults, setNumOfResults] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [watched, setWatched] = useState(tempWatchedData);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchMovies() {
      try {
        setIsLoading(true);

        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}&page=${page}`,
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
              <Summary watched={watched} />
              <ul className="list list-watched">
                {watched.map((result) => (
                  <WatchedMovie
                    key={result.imdbID}
                    watched={result}
                    setWatched={setWatched}
                    setSelected={setSelected}
                  />
                ))}
              </ul>
            </>
          ) : (
            <MovieDetails
              movieId={selected}
              onCloseMovie={() => setSelected(null)}
              watched={watched}
              setWatched={setWatched}
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
// Search Results
// function SearchMovieList({ movies }) {
//   const [isOpen1, setIsOpen1] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen1((open) => !open)}
//       >
//         {isOpen1 ? "▲" : "▼"}
//       </button>
//       {isOpen1 && (
//         <ul className="list">
//           {movies?.map((movie) => (
//             <SearchResult key={movie.imdbID} movie={movie} />
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
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
// Library Box
// function WatchedMovieList({ watched }) {
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((isOpen) => !isOpen)}
//       >
//         {isOpen2 ? "▲" : "▼"}
//       </button>
//       <Summary watched={watched} />
//       {isOpen2 && (
//         <>
//           <ul className="list">
//             {watched.map((movie) => (
//               <WatchedMovie key={movie.imdbID} watched={movie} />
//             ))}
//           </ul>
//         </>
//       )}
//     </div>
//   );
// }

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
function WatchedMovie({ watched: movie, setWatched, setSelected }) {
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
          setWatched((prev) => prev.filter((m) => m.imdbID !== movie.imdbID));
        }}
      >
        &times;
      </button>
    </li>
  );
}
function MovieDetails({ movieId, onCloseMovie, watched, setWatched }) {
  const [movie, setMovie] = useState(null);
  const [reloadingStarRating, setReloadingStarRating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imdbRating, setImdbRating] = useState(0);
  const [userRating, setUserRating] = useState(0);

  let isWatched = watched.some((m) => m.imdbID === movieId);
  // console.log(isWatched);

  useEffect(() => {
    async function fetchMovieDetails() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${movieId}`
        );
        if (!res.ok) {
          throw new Error("Something went wrong with fetching data");
        }

        const data = await res.json();
        if (data.Response === "False") {
          throw new Error("No results found");
        }

        setUserRating(0);

        setMovie({
          Title: data.Title,
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

  useEffect(() => {
    function escCallback(e) {
      if (e.code === "Escape") {
        onCloseMovie();
        console.log("Closing...");
      }
    }
    document.addEventListener("keydown", escCallback);

    return function () {
      document.removeEventListener("keydown", escCallback);
    };
  }, [onCloseMovie]);

  function handleRating(rate) {
    setUserRating(rate);
  }

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
                    onSetRating={handleRating}
                  />

                  {!isWatched && (
                    <button
                      className="btn-add"
                      disabled={userRating === 0}
                      onClick={() => {
                        setWatched((watched) => [
                          ...watched,
                          { ...movie, imdbID: movieId, userRating },
                        ]);
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
                          setWatched((watched) => [
                            ...watched.filter((m) => m.imdbID !== movieId),
                            {
                              ...movie,
                              imdbID: movieId,
                              userRating: userRating,
                            },
                          ]);
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
/* **************************Start Pagination************************** */
