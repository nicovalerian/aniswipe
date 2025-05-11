import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Image,
    Spinner,
    Tag,
    Badge
} from '@chakra-ui/react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function UserAnimeList({ userId }) {
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
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

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" my={8}>
                <Spinner size="xl" />
                <Text ml={3}>Loading your list...</Text>
            </Box>
        );
    }
    if (error) {
        return (<Box my={4}><Text color="red.500">Error loading list: {error}</Text></Box>);
    }
    if (animeList.length === 0 && !isLoading) {
        return (<Box my={4}><Text>Your anime list is currently empty. Add some anime via the search!</Text></Box>);
    }

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
                        justifyContent="space-between"
                    >
                        <Image
                            src={item.image_url || 'https://via.placeholder.com/150x225?text=No+Image'}
                            alt={`${item.title} poster`}
                            borderRadius="md"
                            mb={3}
                            htmlHeight="225px"
                            htmlWidth="150px"
                            objectFit="cover"
                            mx="auto"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150x225?text=Img+Error'; }}
                        />
                        <Box textAlign="center">
                        <Text fontWeight="bold" fontSize="md" noOfLines={2} mb={1}>
                            {item.title}
                        </Text>
                        <Tag.Root size="sm" colorPalette="blue" variant="subtle" display="block" mb={1}> {/* display="block" if needed */}
                            <Tag.Label>{item.status}</Tag.Label>
                        </Tag.Root>
                        {item.score !== null && (
                            <Badge size="sm" colorPalette="purple" variant="subtle" display="block"> {/* display="block" if needed */}
                                Score: {item.score}/10
                            </Badge>
                        )}
                        {item.score === null && (
                            <Badge size="sm" colorPalette="gray" variant="subtle" display="block">
                                Score: N/A
                            </Badge>
                        )}
                        </Box>
                    </Box>
                ))}
            </SimpleGrid>
        </Box>
    );
}

export default UserAnimeList;