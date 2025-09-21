import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUserStore } from './stores/userStore';
import { useProgressStore } from './stores/progressStore';
import { UserSelector } from './components/UserSelector';
import { TopicSelector } from './components/TopicSelector';
import { LessonViewer } from './components/LessonViewer';

function App() {
  const { currentUserId, getCurrentUser } = useUserStore();
  const { setCurrentUser } = useProgressStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On app load, if there's a current user, load their progress
    if (currentUserId) {
      setCurrentUser(currentUserId);
    }
    setIsLoading(false);
  }, [currentUserId, setCurrentUser]);

  const handleUserSelected = () => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // If no current user, show user selector
  if (!currentUserId) {
    return <UserSelector onUserSelected={handleUserSelected} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopicSelector />} />
        <Route path="/lesson/:topicId/:lessonNumber" element={<LessonViewer />} />
      </Routes>
    </Router>
  );
}

export default App
