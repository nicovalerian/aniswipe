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
// import { toaster } from "@/compo nents/ui/toaster"
import axios from 'axios';
import { useUser } from '../context/UserContext'; // Import useUser to get currentUser

const API_URL = 'http://localhost:5000/api';

function SearchAnime() {
    const { currentUser } = useUser(); // Get the current user from context
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAdd, setIsLoadingAdd] = useState(null); // To track loading state for individual add buttons
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
            console.log(`Searching backend for: ${query}`);
            const response = await axios.get(`${API_URL}/anime/search`, {
                params: { query: query }
            });
            setResults(response.data);
            console.log("Backend search successful, data:", response.data);
        } catch (err) {
            console.error("Backend search error:", err);
            let errorMessage = "Failed to fetch anime data from backend.";
            if (err.response && err.response.data && err.response.data.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
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
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleAddAnime = async (animeToAdd) => {
        if (!currentUser) {
            return;
        }
        if (!animeToAdd || !animeToAdd.mal_id) {
            return;
        }

        setIsLoadingAdd(animeToAdd.mal_id); // Set loading for this specific button

        const payload = {
            mal_id: animeToAdd.mal_id,
            title: animeToAdd.title,
            // image_url: animeToAdd.image_url, // You can send this if you plan to store it in your Anime table
            status: "Plan to Watch", // Default status when adding from search
            score: null
        };

        try {
            console.log(`Adding anime to user ${currentUser.id}'s list:`, payload);
            const response = await axios.post(`${API_URL}/users/${currentUser.id}/list`, payload);
            
            console.log("Add anime response:", response.data);
            // Optionally, you might want to disable the "Add" button for this anime
            // or visually indicate it's been added.
            // Or refresh a displayed user list if you implement that.

        } catch (err) {
            console.error("Error adding anime:", err);

        } finally {
            setIsLoadingAdd(null); // Reset loading for the button
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
                    colorScheme="teal"
                >
                    Search
                </Button>
            </Box>

            {isLoading && (
                <Box display="flex" justifyContent="center" my={4}>
                    <Spinner size="xl" />
                </Box>
            )}

            {error && !isLoading && (
                <Text color="red.500" my={4}>Error: {error}</Text>
            )}

            {!isLoading && !error && hasSearched && query && results.length === 0 && (
                 <Text>No results found for "{query}".</Text>
             )}

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
                                colorScheme="green"
                                onClick={() => handleAddAnime(anime)}
                                isLoading={isLoadingAdd === anime.mal_id} // Show spinner on this specific button
                                disabled={isLoadingAdd === anime.mal_id} // Disable this specific button
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