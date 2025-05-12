import { Box, Heading, Text } from '@chakra-ui/react';
import { Toaster } from "@/components/ui/toaster";
import { useUser } from './context/UserContext';
import UserSelector from './components/UserSelector';
import SearchAnime from './components/SearchAnime';
import UserAnimeList from './components/UserAnimeList'; // <-- Import UserAnimeList
import { useState } from 'react';

function App() {
  const { currentUser } = useUser();
  const [listVersion, setListVersion] = useState(0);

  return (
      <Box p={5}>
          <Heading mb={4}>AniSwipe</Heading>
          <UserSelector />
          <Toaster />
          
          {currentUser ? (
              <Box mt={6}>
                  <Heading size="lg" mb={4}>Welcome, {currentUser.email}!</Heading>
                  <SearchAnime onAnimeAdded={() => setListVersion(v => v + 1)} />
                  <UserAnimeList userId={currentUser.id} version={listVersion} />
              </Box>
          ) : (
              <Text mt={6}>Please select or create a user to start adding anime.</Text>
          )}
      </Box>
  );
}

export default App;