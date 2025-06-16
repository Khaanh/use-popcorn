import { useEffect, useState } from "react";

export function useMovies(query) {
	const [movies, setMovies] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const KEY = "a7a37c92";

	useEffect(() => {
		// callback?.();
		const controller = new AbortController();
		async function fetchMovies() {
			try {
				setIsLoading(true);
				setError("");
				const res = await fetch(
					`https://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`,
					{ signal: controller.signal }
				);

				if (!res.ok)
					throw new Error("Something went wrong with fetching movies");

				const data = await res.json();
				if (data.Response === "False") throw new Error("Movie not found");

				setMovies(data.Search);
				setError("");
			} catch (error) {
				if (error.name !== "AbortError") {
					setError(error.message);
				}
			} finally {
				setIsLoading(false);
			}
		}

		if (query.length < 3) {
			setMovies([]);
			setError("");
			return;
		}
		// handleCloseMovie();
		fetchMovies();

		return () => {
			controller.abort();
		};
	}, [query]);

	return {
		movies,
		isLoading,
		error,
	};
}
