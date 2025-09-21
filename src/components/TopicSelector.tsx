import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../stores/progressStore';
import { useUserStore } from '../stores/userStore';
import curriculum from '../data/curriculum.json';

interface Topic {
  id: string;
  name: string;
  numbering: string;
  level: number;
  prerequisites: string[];
  folderPath: string;
  lessons: Array<{
    id: string;
    number: number;
    completed: boolean;
  }>;
}

export const TopicSelector: React.FC = () => {
  const navigate = useNavigate();
  const { 
    completedTopics, 
    getCompletedLessonsForTopic, 
    getNextLesson 
  } = useProgressStore();
  const { getCurrentUser, logout } = useUserStore();

  const getAvailableTopics = (): Topic[] => {
    const availableTopics: Topic[] = [];
    
    // Cast to proper type
    const topics = curriculum.topics as Topic[];
    
    for (const topic of topics) {
      // Check if all prerequisites are completed
      const prerequisitesMet = topic.prerequisites.every(prereq => {
        // Find the topic with matching name
        const prereqTopic = topics.find(t => t.name === prereq);
        return prereqTopic && completedTopics.includes(prereqTopic.id);
      });

      // If prerequisites are met and topic isn't complete, it's available
      if (prerequisitesMet && !completedTopics.includes(topic.id)) {
        availableTopics.push(topic);
      }
    }

    // Sort by completion status: lowest completion level first
    availableTopics.sort((a, b) => {
      const aCompleted = getCompletedLessonsForTopic(a.id).length;
      const bCompleted = getCompletedLessonsForTopic(b.id).length;
      
      // Primary sort: by completion level (lowest first)
      if (aCompleted !== bCompleted) {
        return aCompleted - bCompleted; // Lower completion comes first
      }
      
      // Secondary sort: by hierarchy (level, then numbering) if completion is equal
      if (a.level !== b.level) return a.level - b.level;
      return a.numbering.localeCompare(b.numbering, undefined, { numeric: true });
    });

    // Return ALL available topics for manual interleaving
    return availableTopics;
  };

  const handleTopicClick = (topic: Topic) => {
    const nextLesson = getNextLesson(topic.id);
    if (nextLesson) {
      navigate(`/lesson/${topic.id}/${nextLesson}`);
    }
  };

  const availableTopics = getAvailableTopics();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <div className="mx-auto" style={{ maxWidth: '900px', padding: '40px 24px' }}>
        <div 
          className="mb-16"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '48px 64px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Science Curriculum</h1>
              <p className="text-gray-600">
                Welcome back, {getCurrentUser()?.name}! • {availableTopics.length} topic{availableTopics.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.reload();
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Switch User
            </button>
          </div>
        </div>
        
        {availableTopics.length === 0 ? (
          <div 
            className="mb-16"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '48px 64px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p className="font-bold">Congratulations!</p>
              <p>You've completed all available topics. Great work!</p>
            </div>
          </div>
        ) : (
          <>
            {availableTopics.map(topic => {
              const completedLessons = getCompletedLessonsForTopic(topic.id);
              const progress = completedLessons.length;
              const nextLesson = getNextLesson(topic.id);
              
              return (
                <div
                  key={topic.id}
                  className="mb-16"
                  style={{
                    backgroundColor: '#ffffff',
                    border: progress > 0 ? '2px solid #3b82f6' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '48px 64px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleTopicClick(topic)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {topic.name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Topic {topic.numbering}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-600">
                        Progress: {progress}/3
                      </div>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3].map(num => (
                          <div
                            key={num}
                            className={`h-2 w-8 rounded ${
                              completedLessons.includes(num)
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {topic.prerequisites.length > 0 && (
                    <div className="text-xs text-gray-500 mb-2">
                      Prerequisites: {topic.prerequisites.join(', ')}
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-blue-600 font-medium">
                      {progress > 0 ? `Continue with Lesson ${nextLesson}` : `Start Lesson ${nextLesson}`} →
                    </span>
                    <div className="text-sm text-gray-500">
                      {progress > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                          In Progress
                        </span>
                      )}
                      {3 - progress} lesson{3 - progress !== 1 ? 's' : ''} remaining
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};