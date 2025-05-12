import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Image,
    Spinner,
    Tag,
    Badge,
    HStack // <--- Import HStack
} from '@chakra-ui/react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function UserAnimeList({ userId }) {
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // ... (your useEffect logic is fine)
        if (!userId) {
            setAnimeList([]);
            return;
        }
        const fetchUserList = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_URL}/users/${userId}/list`);
                setAnimeList(response.data);
            } catch (err) {
                console.error("Error fetching user anime list:", err);
                let errorMessage = "Failed to fetch user's anime list.";
                if (err.response?.data?.error) {
                    errorMessage = err.response.data.error;
                } else if (err.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                setAnimeList([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserList();
    }, [userId]);


    if (isLoading) { /* ... your loading JSX ... */ }
    if (error) { /* ... your error JSX ... */ }
    if (animeList.length === 0 && !isLoading) { /* ... your empty list JSX ... */ }

    return (
        <Box mt={8} width="100%">
            <Heading size="lg" mb={6}>My Anime List</Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
                {animeList.map((item) => (
                    <Box
                        key={item.entry_id}
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                        p={4}
                        display="flex"
                        flexDirection="column"
                        // justifyContent="space-between" // Keep this if you want title+image pushed up and status/score pushed down
                    >
                        {/* Image section remains the same */}
                        <Image
                            src={item.image_url || 'https://via.placeholder.com/150x225?text=No+Image'}
                            alt={`${item.title} poster`}
                            borderRadius="md"
                            mb={3} // Margin below image
                            htmlHeight="225px"
                            htmlWidth="150px"
                            objectFit="cover"
                            mx="auto"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150x225?text=Img+Error'; }}
                        />
                        {/* Text content section */}
                        <Box textAlign="center" mt="auto"> {/* mt="auto" will push this Box to the bottom if parent is flex */}
                            <Text fontWeight="bold" fontSize="md" noOfLines={2} mb={1}>
                                {item.title}
                            </Text>
                            {/* HStack for status and score to be on the same line and centered */}
                            <HStack spacing={2} justifyContent="center" mt={1}>
                                <Tag.Root size="sm" colorPalette="blue" variant="subtle">
                                    <Tag.Label>{item.status}</Tag.Label>
                                </Tag.Root>
                                
                                {item.score !== null && (
                                    <Badge size="sm" colorPalette="purple" variant="subtle">
                                        Score: {item.score}/10
                                    </Badge>
                                )}
                                {item.score === null && (
                                    <Badge size="sm" colorPalette="gray" variant="subtle"> {/* Changed to gray for N/A */}
                                        Score: N/A
                                    </Badge>
                                )}
                            </HStack>
                            {/* TODO: Add Edit/Delete buttons here later, perhaps in another HStack or VStack */}
                        </Box>
                    </Box>
                ))}
            </SimpleGrid>
        </Box>
    );
}

export default UserAnimeList;