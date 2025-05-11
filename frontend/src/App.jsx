import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useUser } from './context/UserContext';
import UserSelector from './components/UserSelector';
import SearchAnime from './components/SearchAnime';
import UserAnimeList from './components/UserAnimeList'; // <-- Import UserAnimeList

function App() {
    const { currentUser } = useUser();

    return (
        <Box p={5}>
            <Heading mb={4}>AniSwipe</Heading>
            <UserSelector />
            
            {/* Only show other parts of the app if a user is selected */}
            {currentUser ? (
                <Box mt={6}> {/* Add some margin top for separation */}
                    <Heading size="lg" mb={4}>Welcome, {currentUser.email}!</Heading>
                    
                    <SearchAnime /> {/* Search component */}

                    {/* <Divider my={8} /> Visual separator */}

                    {/* Render the User's Anime List component, passing the userId */}
                    <UserAnimeList userId={currentUser.id} />
                </Box>
            ) : (
                <Text mt={6}>Please select or create a user to start adding anime.</Text>
            )}
        </Box>
    );
}

export default App;