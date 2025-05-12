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
    HStack,
    Button,
    NumberInput,
} from '@chakra-ui/react';
import axios from 'axios';
import { toaster } from "@/components/ui/toaster";

const API_URL = 'http://localhost:5000/api';

function UserAnimeList({ userId, version }) {
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingScore, setEditingScore] = useState(null);
    const [tempScore, setTempScore] = useState(null);

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
                setError(err.response?.data?.error || 'Failed to fetch list');
                setAnimeList([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserList();
    }, [userId, version]);

    const handleRemoveAnime = async (entryId) => {
        try {
            await axios.delete(`${API_URL}/users/${userId}/list/${entryId}`);
            toaster.create({
                title: "Removed",
                description: "Anime removed from your list",
                type: "success",
            });
            setAnimeList(al => al.filter(item => item.entry_id !== entryId));
        } catch (err) {
            toaster.create({
                title: "Error",
                description: err.response?.data?.error || 'Failed to remove anime',
                type: "error",
            });
        }
    };

    const handleUpdateScore = async (entryId) => {
        // Ensure we have a valid 0–10 integer
        console.log(tempScore)
        const newScore = tempScore >= 0 && tempScore <= 10
            ? tempScore
            : 0;

        try {
            await axios.patch(`${API_URL}/users/${userId}/list/${entryId}`, { score: newScore });

            setAnimeList(prev =>
                prev.map(item =>
                    item.entry_id === entryId
                        ? { ...item, score: newScore }
                        : item
                )
            );

            setEditingScore(null);
            setTempScore(null);

            toaster.create({
                title: "Updated",
                description: "Score updated successfully",
                type: "success",
            });
        } catch (err) {
            console.error("Update error:", err);
            toaster.create({
                title: "Error",
                description: err.response?.data?.error || 'Failed to update score',
                type: "error",
            });
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" my={8}>
                <Spinner size="xl" />
                <Text ml={3}>Loading your list...</Text>
            </Box>
        );
    }
    if (error) {
        return (
            <Box my={4}>
                <Text color="red.500">Error loading list: {error}</Text>
            </Box>
        );
    }
    if (animeList.length === 0 && !isLoading) {
        return (
            <Box my={4}>
                <Text>Your anime list is currently empty. Add some anime via the search!</Text>
            </Box>
        );
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
                        position="relative"
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
                        <Box textAlign="center" mt="auto">
                            <Text fontWeight="bold" fontSize="md" noOfLines={2} mb={1}>
                                {item.title}
                            </Text>
                            <HStack spacing={2} justifyContent="center" mt={1}>
                                <Tag.Root size="sm" colorPalette="blue" variant="subtle">
                                    <Tag.Label>{item.status}</Tag.Label>
                                </Tag.Root>
                                {item.score !== null ? (
                                    <Badge size="sm" colorPalette="purple" variant="subtle">
                                        Score: {item.score}/10
                                    </Badge>
                                ) : (
                                    <Badge size="sm" colorPalette="gray" variant="subtle">
                                        Score: N/A
                                    </Badge>
                                )}
                            </HStack>

                            {editingScore === item.entry_id ? (
                                <Box mt={2} width="full" px={2}>
                                    <NumberInput.Root
                                        value={tempScore}
                                        min={0}
                                        max={10}
                                        width="full"
                                        onValueChange={(e) => setTempScore(e.value)}
                                    >
                                        <NumberInput.Control>
                                            <NumberInput.IncrementTrigger />
                                            <NumberInput.DecrementTrigger />
                                        </NumberInput.Control>
                                        <NumberInput.Input />
                                    </NumberInput.Root>
                                    <HStack mt={3} justify="center" spacing={2}>
                                        <Button
                                            size="xs"
                                            colorPalette="green"
                                            onClick={() => handleUpdateScore(item.entry_id)}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            colorPalette="gray"
                                            onClick={() => {
                                                setEditingScore(null);
                                                setTempScore(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </HStack>
                                </Box>
                            ) : (
                                <HStack mt={3} justify="center">
                                    <Button
                                        size="xs"
                                        colorPalette="blue"
                                        onClick={() => {
                                            setEditingScore(item.entry_id);
                                            setTempScore(item.score ?? 0);
                                        }}
                                    >
                                        Rate
                                    </Button>
                                    <Button
                                        size="xs"
                                        colorPalette="red"
                                        variant="outline"
                                        onClick={() => handleRemoveAnime(item.entry_id)}
                                    >
                                        Remove
                                    </Button>
                                </HStack>
                            )}
                        </Box>
                    </Box>
                ))}
            </SimpleGrid>
        </Box>
    );
}

export default UserAnimeList;
