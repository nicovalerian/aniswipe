import React from 'react';
import UserSelector from './components/UserSelector';
import { useUser } from './context/UserContext';
// Import other components/pages later
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
  const { currentUser } = useUser();

  return (
    // <Router> {/* Uncomment when adding routing */}
      <div>
        <h1>AniSwipe</h1>
        <UserSelector />

        <hr />

        {/* Only show other parts of the app if a user is selected */}
        {currentUser ? (
          <div>
            <h2>Welcome, {currentUser.email}!</h2>
            {/* Add Links and Routes here later */}
            {/* <nav> <Link to="/">Home</Link> | <Link to="/recommendations">Swipe</Link> </nav> */}
            {/* <Routes> */}
              {/* <Route path="/recommendations" element={<RecommendationPage />} /> */}
              {/* <Route path="/" element={<HomePage />} /> */}
            {/* </Routes> */}
            <p>App content for the selected user will go here...</p>
          </div>
        ) : (
          <p>Please select or create a user to continue.</p>
        )}
      </div>
    // </Router> /* Uncomment when adding routing */
  );
}

export default App;