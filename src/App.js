import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "a7a37c92";

// structural component
export default function App() {
	const [query, setQuery] = useState("");
	const [selectedId, setSelectedId] = useState(null);

	const { movies, isLoading, error } = useMovies(query);

	const [watched, setWatched] = useLocalStorageState([], "watched");

	function handleSelectMovie(id) {
		setSelectedId((selectedId) => (id === selectedId ? null : id));
	}

	function handleCloseMovie() {
		setSelectedId(null);
	}

	function handleAddWatched(movie) {
		setWatched((watched) => [...watched, movie]);

		// localStorage.setItem("watched", JSON.stringify([...watched, movie]));
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
	}

	return (
		<>
			<NavBar>
				<Logo />
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</NavBar>

			<Main>
				<Box>
					{/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
					{isLoading && <Loader />}
					{!isLoading && !error && (
						<MovieList movies={movies} onSelectMovie={handleSelectMovie} />
					)}
					{error && <ErrorMessage message={error} />}
				</Box>

				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddWatched={handleAddWatched}
							watched={watched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMoviesList
								watched={watched}
								onDeleteWatched={handleDeleteWatched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}

// presentational component
const Loader = () => {
	return <p className="loader">Loading...</p>;
};

const ErrorMessage = ({ message }) => {
	return (
		<p className="error">
			<span>-</span> {message}
		</p>
	);
};

// structural component
const NavBar = ({ children }) => {
	return <nav className="nav-bar">{children}</nav>;
};

// presentational component
const Logo = () => {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
};

// stateful component
const Search = ({ query, setQuery }) => {
	const inputEl = useRef(null);

	useEffect(() => {
		const callback = (e) => {
			if (document.activeElement === inputEl.current) return;

			if (e.code === "Enter") {
				inputEl.current.focus();
				setQuery("");
			}
		};

		document.addEventListener("keypress", callback);

		return () => document.removeEventListener("keypress", callback);
	}, [setQuery]);

	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			ref={inputEl}
		/>
	);
};

const NumResults = ({ movies }) => {
	if (!movies || !movies.length) return null;

	return (
		<p className="num-results">
			Found <strong>{movies.length}</strong> results
		</p>
	);
};

const Main = ({ children }) => {
	return <main className="main">{children}</main>;
};

// stateful component
const Box = ({ children }) => {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="box">
			<button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
				{isOpen ? "–" : "+"}
			</button>
			{isOpen && children}
		</div>
	);
};

// stateful component
const MovieList = ({ movies, onSelectMovie }) => {
	return (
		<ul className="list list-movies">
			{movies?.map((movie) => (
				<Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
			))}
		</ul>
	);
};

const Movie = ({ movie, onSelectMovie }) => {
	return (
		<li onClick={() => onSelectMovie(movie.imdbID)} key={movie.imdbID}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
};

const MovieDetails = ({ selectedId, onCloseMovie, onAddWatched, watched }) => {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState("");
	const countRef = useRef(0);

	useEffect(() => {
		if (userRating) countRef.current++;
	}, [userRating]);

	const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId
	)?.userRating;

	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: realeased,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;

	const handleAdd = () => {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(" ").at(0)),
			userRating,
			countRatingDecisions: countRef.current,
		};

		onAddWatched(newWatchedMovie);
		onCloseMovie();
	};

	useEffect(() => {
		const callback = (e) => {
			if (e.code === "Escape") onCloseMovie();
		};

		document.addEventListener("keydown", callback);

		return function () {
			document.removeEventListener("keydown", callback);
		};
	}, [onCloseMovie]);

	useEffect(() => {
		async function getMovieDetails() {
			setIsLoading(true);
			const res = await fetch(
				// `http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&i=${selectedId}`
				`http://www.omdbapi.com/?i=${selectedId}&apikey=${KEY} `
			);

			const data = await res.json();
			setMovie(data);
			setIsLoading(false);
		}
		getMovieDetails();
	}, [selectedId]);

	useEffect(() => {
		if (!title) return;
		document.title = `Movie | ${title}`;

		return () => {
			document.title = "Use Popcorn";
		};
	}, [title]);

	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button className="btn-back" onClick={onCloseMovie}>
							&larr;
						</button>
						<img src={poster} alt={`Poster of ${movie} movie`} />
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{realeased} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐️</span>
								{imdbRating} IMDb rating
							</p>
						</div>
					</header>

					<section>
						<div className="rating">
							{!isWatched ? (
								<>
									<StarRating
										maxRating={10}
										size={24}
										onSetRating={setUserRating}
									/>
									{userRating > 0 && (
										<button className="btn-add" onClick={handleAdd}>
											+ Add to list
										</button>
									)}
								</>
							) : (
								<p>You rated with movie {watchedUserRating} ⭐️</p>
							)}
						</div>
						<p>
							<em>{plot}</em>
						</p>
						<p>Starring {actors}</p>
						<p>Directed by {director}</p>
					</section>

					{/* {selectedId} */}
				</>
			)}
		</div>
	);
};

const WatchedSummary = ({ watched }) => {
	const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
	const avgUserRating = average(watched.map((movie) => movie.userRating));
	const avgRuntime = average(watched.map((movie) => movie.runtime));

	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
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
					<span>{avgRuntime} min</span>
				</p>
			</div>
		</div>
	);
};

const WatchedMoviesList = ({ watched, onDeleteWatched }) => {
	return (
		<ul className="list">
			{watched.map((movie) => (
				<WatchedMovie
					movie={movie}
					key={movie.imdbID}
					onDeleteWatched={onDeleteWatched}
				/>
			))}
		</ul>
	);
};

const WatchedMovie = ({ movie, onDeleteWatched }) => {
	return (
		<li>
			<img src={movie.poster} alt={`${movie.title} poster`} />
			<h3>{movie.title}</h3>
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
				onClick={() => onDeleteWatched(movie.imdbID)}
			>
				X
			</button>
		</li>
	);
};
