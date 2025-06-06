import React, { useState } from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useColorModeValue } from './ui/color-mode';
import { useUser } from '../context/UserContext';
import SearchAnime from './SearchAnime';
import UserAnimeList from './UserAnimeList';

function LandingPage() {
  const { currentUser } = useUser();
  const [listVersion, setListVersion] = useState(0); // Add listVersion state
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');

  return (
    <Box
      p={{ base: 4, md: 8 }}
      minH="calc(100vh - 64px)" // Adjust based on Navbar height
      bg={bgColor}
      color={textColor}
      textAlign="center"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent={currentUser ? "flex-start" : "center"}
    >
      {currentUser ? (
        <VStack spacing={8} width="100%" maxWidth="1200px" mx="auto">
          <Heading as="h1" size="xl" mt={4} mb={2}>
            Welcome, {currentUser.username}!
          </Heading>
          <SearchAnime onAnimeAdded={() => setListVersion(v => v + 1)} /> {/* Pass onAnimeAdded */}
          <UserAnimeList userId={currentUser.id} version={listVersion} /> {/* Pass userId and version */}
        </VStack>
      ) : (
        <VStack spacing={4}>
          <Heading as="h1" size="2xl">
            Welcome to AniSwipe
          </Heading>
          <Text fontSize="lg">Your go-to platform for discovering and managing your anime journey.</Text>
          <Text fontSize="md">Please log in or register to get started.</Text>
        </VStack>
      )}
    </Box>
  );
}

export default LandingPage;