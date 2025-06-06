import { Flex, Heading, Button, Link as ChakraLink, Text, Menu, MenuItem, Spacer, Portal } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Navbar() {
  const { currentUser, logoutUser } = useUser();

  return (
    <Flex
      as="nav"
      p={4}
      bg="gray.900"
      color="white"
      alignItems="center"
      boxShadow="md"
      position="sticky"
      top={0}
      zIndex="sticky"
      justifyContent="space-between"
    >
      <Heading size="md">
        <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'none', color: 'gray.400' }}>
          AniSwipe
        </ChakraLink>
      </Heading>

      <Spacer /> {/* Adds space between the title and navigation items */}

      <Flex alignItems="center" gap={4}>
        {currentUser ? (
          <Menu.Root placement="bottom-end">
            <Menu.Trigger asChild>
              <Button variant="ghost">
                <Text fontSize="md" fontWeight="bold">{currentUser.email}</Text>
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content zIndex="popover"> {/* Use zIndex 'popover' or a higher value */}
                  <MenuItem
                    onClick={logoutUser}
                    bg="gray.800"
                    color="white"
                    _hover={{ bg: "gray.700", color: "white" }}
                  >
                    Logout
                  </MenuItem>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        ) : (
          <Button
            as={RouterLink}
            to="/auth"
            variant="solid"
          >
            Login / Register
          </Button>
        )}
        <Button
          as={RouterLink}
          to="/import-mal"
          variant="ghost"
        >
          Import MAL
        </Button>
      </Flex>
    </Flex>
  );
}

export default Navbar;