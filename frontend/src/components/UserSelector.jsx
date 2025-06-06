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
} from '@chakra-ui/react';
import { Field } from '@ark-ui/react';
import { useNavigate } from 'react-router-dom';

function UserSelector() {
    const { users, currentUser, loading, error, createUser, loginUser } = useUser();
    const [newUserEmail, setNewUserEmail] = useState('');
    const [selectedUserId, setSelectedUserId] = useState([]);
    const navigate = useNavigate();

    const handleCreateUser = async (event) => {
        event.preventDefault();
        if (!newUserEmail.trim()) return;
        const createdUser = await createUser(newUserEmail);
        if (createdUser) {
            setNewUserEmail('');
            navigate('/');
        }
    };

    const handleLoginUser = async () => {
        if (selectedUserId.length === 0) return;
        const loggedInUser = await loginUser(selectedUserId[0]);
        if (loggedInUser) {
            navigate('/');
        }
    };

    const userSelectItems = createListCollection({
        items: users.map(user => ({
            label: user.email,
            value: user.id.toString()
        }))
    });

    return (
        <Box p={6} borderWidth="1px" borderRadius="lg" shadow="xl" width="100%" maxWidth="500px" mx="auto" my={8} bg="gray.800" color="white">
            <Heading size="lg" mb={8} textAlign="center">Welcome to AniSwipe!</Heading>
            
            {loading && !userSelectItems.items.length && (
                <VStack spacing={4} alignItems="center" justifyContent="center" minH="100px">
                    <Spinner thickness="4px" speed="0.65s" emptyColor="gray.700" color="white" size="xl"/>
                    <Text fontSize="lg" color="gray.400">Loading users...</Text>
                </VStack>
            )}

            {error && (<Text color="red.300" mb={4} textAlign="center" fontSize="md">Error: {error}</Text>)}

            {(!loading || users.length > 0 || error) && (
                <VStack spacing={6} align="stretch">
                    <Field.Root id="select-user">
                        <Field.Label fontSize="md" fontWeight="bold">Select Existing User:</Field.Label>
                        <Select.Root
                            collection={userSelectItems}
                            value={selectedUserId}
                            onValueChange={(details) => {
                                setSelectedUserId(details.value || []);
                            }}
                            disabled={loading}
                            size="lg"
                        >
                            <Select.HiddenSelect />
                            <Select.Control>
                                <Select.Trigger>
                                    <Select.ValueText placeholder="-- Select User --" />
                                </Select.Trigger>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content bg="gray.700">
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
                        <Button
                           onClick={handleLoginUser}
                           disabled={loading || selectedUserId.length === 0}
                           isLoading={loading && !!selectedUserId}
                           variant="solid"
                           size="lg"
                           mt={4}
                           width="full"
                        >
                           Login Selected User
                        </Button>
                    </Field.Root>
                    
                    <Text fontSize="lg" fontWeight="bold" textAlign="center" mt={4}>OR</Text>

                    <form onSubmit={handleCreateUser}>
                        <Field.Root id="new-user-email">
                            <Field.Label fontSize="md" fontWeight="bold">Create New User:</Field.Label>
                            <HStack>
                                <Input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    placeholder="Enter new user email"
                                    required
                                    disabled={loading}
                                    size="lg"
                                />
                                <Button
                                    type="submit"
                                    disabled={loading || !newUserEmail.trim()}
                                    isLoading={loading && !!newUserEmail.trim()}
                                    variant="solid"
                                    size="lg"
                                >
                                    Create Account
                                </Button>
                            </HStack>
                        </Field.Root>
                    </form>
                </VStack>
            )}

            {currentUser && (
                <Text mt={8} fontWeight="bold" textAlign="center" fontSize="lg" color="gray.400">
                    Currently Logged In: {currentUser.email} (ID: {currentUser.id})
                </Text>
            )}
        </Box>
    );
}

export default UserSelector;