import React from 'react';
import { Box, Heading, Button } from '@chakra-ui/react'; // Import some Chakra components

// Temporarily comment out or remove UserSelector and useUser imports/logic
// import UserSelector from './components/UserSelector';
// import { useUser } from './context/UserContext';

function App() {
  // const { currentUser } = useUser(); // Temporarily comment out

  return (
    <Box p={5}> {/* Use a Chakra component */}
      <Heading>Test AniSwipe</Heading>
      <Button colorScheme="teal">Test Button</Button>
      {/* Temporarily remove the UserSelector and conditional logic */}
      {/* <UserSelector /> */}
      {/* <hr /> */}
      {/* {currentUser ? (...) : (...)} */}
    </Box>
  );
}

export default App;