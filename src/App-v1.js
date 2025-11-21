import { useState } from "react";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];
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
  const [movies, setMovies] = useState(tempMovieData);
  const [watched, setWatched] = useState(tempWatchedData);
  const [searchResults, setSearchResults] = useState(movies);

  return (
    <>
      <Navbar>
        <NavbarLogo />
        <SearchBar movies={movies} setSearchResults={setSearchResults} />
        <NumResults searchResults={searchResults} />
      </Navbar>

      <Main>
        <BoxList>
          <ul className="list">
            {searchResults?.map((movie) => (
              <SearchResult key={movie.imdbID} movie={movie} />
            ))}
          </ul>
        </BoxList>
        <BoxList>
          <Summary watched={watched} />
          <ul className="list">
            {watched.map((movie) => (
              <WatchedMovie key={movie.imdbID} watched={movie} />
            ))}
          </ul>
        </BoxList>
        {/* <SearchMovieList movies={searchResults} /> */}
        {/* <WatchedMovieList watched={watched} /> */}
      </Main>
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

function SearchBar({ movies, setSearchResults }) {
  const [query, setQuery] = useState("");

  async function handleSearch(e) {
    const value = await e.target.value;
    setQuery(value);
    setSearchResults(
      movies.filter((i) => i.Title.toLowerCase().includes(value.toLowerCase()))
    );
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

function NumResults({ searchResults }) {
  return (
    <p className="num-results">
      Found <strong>{searchResults.length}</strong> results
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
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
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

function SearchResult({ movie }) {
  return (
    <li>
      <img src={movie?.Poster} alt={`${movie?.Title} poster`} />
      <h3>{movie?.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie?.Year}</span>
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
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovie({ watched: watchedMovie }) {
  return (
    <li>
      <img src={watchedMovie.Poster} alt={`${watchedMovie.Title} poster`} />
      <h3>{watchedMovie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{watchedMovie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{watchedMovie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{watchedMovie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
/* ******************************End Main****************************** */
