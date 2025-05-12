// frontend/src/components/UserSelector.jsx

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import {
    Box,
    Heading,
    Select,
    Input,
    Button,
    Text,
    VStack,
    HStack,
    Spinner,
    Portal,
    createListCollection
    // Removed FormControl and FormLabel imports
} from '@chakra-ui/react'; // Or your UI kit's specific import paths

function UserSelector() {
    const { users, currentUser, loading, error, selectUser, createUser } = useUser();
    const [newUserEmail, setNewUserEmail] = useState('');

    const handleCreateUser = async (event) => {
        event.preventDefault();
        if (!newUserEmail.trim()) return;
        const created = await createUser(newUserEmail);
        if (created) {
            setNewUserEmail('');
        }
    };

    const userSelectItems = createListCollection({
        items: users.map(user => ({
            label: user.email,
            value: user.id.toString()
        }))
    });

    return (
        <Box p={4} borderWidth="1px" borderRadius="lg" shadow="md" width="100%" maxWidth="500px" mx="auto">
            <Heading size="md" mb={6} textAlign="center">Select or Create User</Heading>
            
            {loading && !userSelectItems.items.length && (
                <Box display="flex" alignItems="center" justifyContent="center" minH="100px">
                    <Spinner thickness="4px" speed="0.65s" colorPalette="blue" size="xl"/>
                    <Text ml={3}>Loading users...</Text>
                </Box>
            )}

            {error && (<Text color="red.500" mb={4} textAlign="center">Error: {error}</Text>)}

            {(!loading || users.length > 0 || error) && (
                <VStack spacing={5} align="stretch">
                    <Box> {/* Optional: A Box to group the label and select if needed for layout */}
                        <Select.Root
                            collection={userSelectItems}
                            value={currentUser ? [currentUser.id.toString()] : []}
                            onValueChange={(details) => {
                                if (details.value && details.value.length > 0) {
                                    selectUser(details.value[0]);
                                } else {
                                    selectUser(null);
                                }
                            }}
                            disabled={loading}
                            size="md"
                            // width="100%" // Apply width here or on a wrapping Box/FormControl
                        >
                            {/* CORRECTED: Select.Label INSIDE Select.Root */}
                            <Select.Label mb={1} fontWeight="medium">Select Existing User:</Select.Label>
                            <Select.HiddenSelect />
                            <Select.Control>
                                <Select.Trigger>
                                    <Select.ValueText placeholder="-- Select User --" />
                                </Select.Trigger>
                                {/* <Select.Indicator /> */}
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {userSelectItems.items.map((userItem) => (
                                            <Select.Item item={userItem} key={userItem.value}>
                                                {userItem.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    </Box>

                    <form onSubmit={handleCreateUser}>
                        <VStack spacing={2} align="stretch">
                            <Text as="label" htmlFor="newUserEmailInput" fontWeight="medium">Create New User (Email):</Text>
                            <HStack>
                                <Input
                                    id="newUserEmailInput"
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    placeholder="new.user@example.com"
                                    required
                                    disabled={loading}
                                    size="md"
                                />
                                <Button
                                    type="submit"
                                    disabled={loading || !newUserEmail.trim()}
                                    isLoading={loading && !!newUserEmail.trim()}
                                    colorPalette="blue"
                                    size="md"
                                >
                                    Create User
                                </Button>
                            </HStack>
                        </VStack>
                    </form>
                </VStack>
            )}

            {currentUser && (
                <Text mt={6} fontWeight="bold" textAlign="center">
                    Current User: {currentUser.email} (ID: {currentUser.id})
                </Text>
            )}
        </Box>
    );
}

export default UserSelector;