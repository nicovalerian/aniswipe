// frontend/src/components/SearchAnime.jsx

import React, { useState } from 'react';
import {
    Box,
    Input,
    Button,
    SimpleGrid,
    Image,
    Text,
    Spinner,
    Heading,
} from '@chakra-ui/react';
import { toaster } from "@/components/ui/toaster";
import axios from 'axios';
import { useUser } from '../context/UserContext';

const API_URL = 'http://localhost:5000/api';

// Accept onAnimeAdded prop
function SearchAnime({ onAnimeAdded }) {
    const { currentUser } = useUser();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAdd, setIsLoadingAdd] = useState(null);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults([]);
        setHasSearched(true);
        try {
            const response = await axios.get(`${API_URL}/anime/search`, {
                params: { query: query }
            });
            setResults(response.data);
        } catch (err) {
            let errorMessage = "Failed to fetch anime data from backend.";
            if (err.response?.data?.error) errorMessage = err.response.data.error;
            else if (err.message) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setHasSearched(false);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') handleSearch();
    };

    const handleAddAnime = async (animeToAdd) => {
        if (!currentUser || !animeToAdd?.mal_id) return;
        setIsLoadingAdd(animeToAdd.mal_id);
        const payload = {
            mal_id: animeToAdd.mal_id,
            title: animeToAdd.title,
            image_url: animeToAdd.image_url,
            status: "Plan to Watch",
            score: null
        };
        try {
            await axios.post(`${API_URL}/users/${currentUser.id}/list`, payload);
            
            // Success toast
            toaster.create({
                title: "Added to list",
                description: `${animeToAdd.title} was added successfully`,
                type: "success",
            });
    
            if (onAnimeAdded) {
                onAnimeAdded();
            }
        } catch (err) {
            console.error("Error adding anime:", err);
            
            // Error toast
            toaster.create({
                title: "Error adding anime",
                description: err.response?.data?.error || "Failed to add anime to your list",
                type: "error",
            });
        } finally {
            setIsLoadingAdd(null);
        }
    };

    return (
        <Box width="100%" p={4}>
            <Heading size="md" mb={4}>Search Anime to Add</Heading>
            <Box display="flex" mb={4}>
                <Input
                    placeholder="Search for anime title (e.g., Steins;Gate)"
                    value={query}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    mr={2}
                    disabled={isLoading}
                />
                <Button
                    onClick={handleSearch}
                    isLoading={isLoading}
                    disabled={isLoading}
                    colorPalette="blue" // Using colorPalette
                >
                    Search
                </Button>
            </Box>

            {isLoading && (<Box display="flex" justifyContent="center" my={4}><Spinner size="xl" /></Box>)}
            {error && !isLoading && (<Text color="red.500" my={4}>Error: {error}</Text>)}
            {!isLoading && !error && hasSearched && query && results.length === 0 && (<Text>No results found for "{query}".</Text>)}
            {!isLoading && results.length > 0 && (
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
                    {results.map((anime) => (
                        <Box
                            key={anime.mal_id}
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            p={3}
                            textAlign="center"
                             _hover={{ boxShadow: "md" }}
                        >
                            <Image
                                src={anime.image_url || 'https://via.placeholder.com/150?text=No+Image'}
                                alt={`${anime.title} poster`}
                                boxSize="150px"
                                objectFit="contain"
                                mx="auto"
                                mb={2}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Image+Error'; }}
                            />
                            <Text fontSize="sm" fontWeight="bold" noOfLines={2}>
                                {anime.title}
                            </Text>
                            <Button
                                size="xs"
                                mt={2}
                                colorPalette="blue" // Using colorPalette
                                onClick={() => handleAddAnime(anime)}
                                isLoading={isLoadingAdd === anime.mal_id}
                                disabled={isLoadingAdd === anime.mal_id}
                            >
                                Add
                            </Button>
                        </Box>
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );
}

export default SearchAnime;