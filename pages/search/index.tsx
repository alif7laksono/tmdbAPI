// pages/search.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  searchMoviesByTitle,
  getMovieCategories,
  getMoviesByCategory,
  getAllMovies,
} from "@/utils/api";
import { SearchResult, MovieCategory, Movie } from "@/utils/types";
import SearchResults from "@/components/SearchResults";
import { TextField, Typography, Button } from "@mui/material";
import Link from "next/link";
import "./styles.css";

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [movieCategories, setMovieCategories] = useState<MovieCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [visibleResults, setVisibleResults] = useState(20);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all movies
        const allMovies = await getAllMovies();
        setSearchResults(allMovies);

        // Fetch movie categories
        const categories = await getMovieCategories();
        setMovieCategories(categories);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchData();
  }, []);

  const searchMoviesByTitleAndCategory = async (
    title: string,
    categoryId: number
  ) => {
    // Fetch all movies in the selected category
    const allMoviesInCategory = await getMoviesByCategory(categoryId);

    // Filter the movies by title
    const filteredMovies = allMoviesInCategory.filter((movie: Movie) =>
      movie.title.toLowerCase().includes(title.toLowerCase())
    );

    return filteredMovies;
  };

  const handleSearch = async () => {
    try {
      if (selectedCategory !== null) {
        if (searchQuery.trim() === "") {
          const results = await getMoviesByCategory(selectedCategory);
          setSearchResults(results);
        } else {
          // If there's a search query and a category is selected,
          // perform a search by title within the selected category.
          const results = await searchMoviesByTitleAndCategory(
            searchQuery,
            selectedCategory
          );
          setSearchResults(results);
        }
      } else {
        if (searchQuery.trim() === "") {
          console.log("No search query or category selected");
          return;
        }

        // If there's a search query, perform a regular search by title
        const results = await searchMoviesByTitle(searchQuery);
        setSearchResults(results);
      }

      // Reset the visible results when performing a new search
      setVisibleResults(20);
    } catch (error) {
      console.error("Error performing search:", error);
    }
  };

  const handleCategoryClick = async (categoryId: number) => {
    setSelectedCategory(categoryId);
    try {
      const results = await getMoviesByCategory(categoryId);
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching movies by category:", error);
    }
  };

  const handleLoadMore = () => {
    setVisibleResults((prevVisibleResults) => prevVisibleResults + 20);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const router = useRouter();

  return (
    <>
      <div className="search-page">
        <div className="navbar">
          <Link
            href="/search"
            className="tmdb-link"
            onClick={() => window.location.reload()}
          >
            TMDB
          </Link>

          <TextField
            type="text"
            placeholder="Search Movies"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
          />
        </div>

        <div className="movie-categories">
          <ul>
            {movieCategories.map((category) => (
              <li
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>

        <SearchResults results={searchResults.slice(0, visibleResults)} />
        {visibleResults < searchResults.length && (
          <Button
            onClick={handleLoadMore}
            variant="outlined"
            className="load-more-button"
          >
            Load More
          </Button>
        )}

        {searchResults.length === 0 && (
          <Typography variant="body1">No results found.</Typography>
        )}
      </div>
    </>
  );
};

export default SearchPage;
