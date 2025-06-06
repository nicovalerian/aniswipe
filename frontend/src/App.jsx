import { Box, Heading, Text } from '@chakra-ui/react';
import { Toaster } from "@/components/ui/toaster";
import { useUser } from './context/UserContext';
import UserSelector from './components/UserSelector';
import SearchAnime from './components/SearchAnime';
import UserAnimeList from './components/UserAnimeList';
import { useState } from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MALImportPage from './components/MALImportPage'; // Import MALImportPage

function AuthPage() {
  return (
    <Box p={5}>
      <UserSelector />
      <Toaster />
    </Box>
  );
}

function AppContent() {
  const { currentUser } = useUser();
  const [listVersion, setListVersion] = useState(0);

  // Redirect to home if currentUser is null, but allow AuthPage to render
  // AppContent itself should only be accessed if currentUser is present.
  if (!currentUser) {
    return <Navigate to="/" replace />; // Redirect to root if not authenticated
  }

  return (
    <Box p={5}>
      <Toaster />
      <Box mt={6}>
        <Heading size="lg" mb={4}>Welcome, {currentUser.username}!</Heading>
        <SearchAnime onAnimeAdded={() => setListVersion(v => v + 1)} />
        <UserAnimeList userId={currentUser.id} version={listVersion} />
      </Box>
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/app" element={<AppContent />} />
        <Route path="/import-mal" element={<MALImportPage />} /> {/* Add route for MALImportPage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;