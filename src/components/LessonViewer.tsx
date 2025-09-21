import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgressStore } from '../stores/progressStore';
import { ContentCard } from './ContentCard';
import { ProgressBar } from './ProgressBar';
import { generateLessonContent } from '../services/lessonGenerator';
import curriculum from '../data/curriculum.json';

export interface CardContent {
  id: string;
  type: 'intro' | 'objective' | 'i-do' | 'you-do' | 'summary';
  cycle?: number;
  title: string;
  content: string;
  interactive?: {
    type: 'quiz' | 'input' | 'practice';
    question?: string;
    correctAnswer?: string;
    feedback?: string;
  };
}

export interface LessonContent {
  cards: CardContent[];
  totalCards: number;
}

export const LessonViewer: React.FC = () => {
  const { topicId, lessonNumber } = useParams<{ topicId: string; lessonNumber: string }>();
  const navigate = useNavigate();
  const { 
    currentPosition, 
    updatePosition, 
    markLessonComplete
  } = useProgressStore();
  
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showFeedback, setShowFeedback] = useState<{ [key: number]: boolean }>({});
  
  const lessonId = `${topicId}-${lessonNumber}`;

  useEffect(() => {
    // Load lesson content
    const loadLesson = async () => {
      setLoading(true);
      try {
        // Get topic info
        const topic = curriculum.topics.find(t => t.id === topicId);
        if (!topic) {
          navigate('/');
          return;
        }

        // Generate lesson content
        const content = await generateLessonContent(topicId!, Number(lessonNumber));
        setLessonContent(content);

        // Restore position if returning to lesson
        const savedPosition = currentPosition[lessonId] || 0;
        setCurrentCardIndex(savedPosition);
        
        // Mark all cards before current position as completed
        const completed = [];
        for (let i = 0; i < savedPosition; i++) {
          completed.push(i);
        }
        setCompletedCards(completed);
      } catch (error) {
        console.error('Error loading lesson:', error);
        // Fallback to home
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [topicId, lessonNumber]);
  
  // Auto-scroll to current card when it changes
  useEffect(() => {
    const currentCardElement = document.getElementById(`card-${currentCardIndex}`);
    if (currentCardElement) {
      currentCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentCardIndex]);

  const handleContinue = (cardIndex: number = currentCardIndex) => {
    if (!lessonContent) return;

    const card = lessonContent.cards[cardIndex];
    const answer = userAnswers[cardIndex] || '';
    
    // If this is an interactive card and user hasn't answered correctly
    if (card.interactive && !showFeedback[cardIndex]) {
      // Check answer
      if (answer.trim().toLowerCase() === card.interactive.correctAnswer?.toLowerCase()) {
        setShowFeedback(prev => ({ ...prev, [cardIndex]: true }));
        setTimeout(() => {
          moveToNextCard(cardIndex);
        }, 1500);
      } else {
        setShowFeedback(prev => ({ ...prev, [cardIndex]: true }));
        // Allow retry
      }
    } else {
      moveToNextCard(cardIndex);
    }
  };

  const moveToNextCard = (fromIndex: number = currentCardIndex) => {
    if (!lessonContent) return;

    // Mark current card as completed
    if (!completedCards.includes(fromIndex)) {
      setCompletedCards(prev => [...prev, fromIndex]);
    }

    const nextIndex = fromIndex + 1;
    
    if (nextIndex >= lessonContent.cards.length) {
      // Lesson complete
      markLessonComplete(topicId!, Number(lessonNumber));
      navigate('/');
    } else {
      setCurrentCardIndex(nextIndex);
      updatePosition(lessonId, nextIndex);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      updatePosition(lessonId, currentCardIndex - 1);
    }
  };

  const handleStepClick = (step: number) => {
    // Only allow clicking on completed cards or current card
    if (completedCards.includes(step) || step === currentCardIndex) {
      setCurrentCardIndex(step);
      updatePosition(lessonId, step);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lessonContent || lessonContent.cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading lesson content</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const visibleCards = currentCardIndex + 1; // Show all cards up to and including current
  const progress = ((currentCardIndex + 1) / lessonContent.cards.length) * 100;

  return (
    <div className="h-screen" style={{ 
      backgroundColor: '#fafafa',
      display: 'grid',
      gridTemplateRows: '60px 1fr',
      gridTemplateColumns: '1fr'
    }}>
      {/* Navbar Area - Fixed height, separate space */}
      <div className="w-full" style={{ 
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        gridRow: '1',
        gridColumn: '1'
      }}>
        <div className="h-full mx-auto flex items-center" style={{ 
          width: '80%',
          padding: '0 16px'
        }}>
          {/* Previous Button */}
          <button
            onClick={handlePreviousCard}
            disabled={currentCardIndex === 0}
            className={`flex-shrink-0 flex items-center justify-center transition-opacity ${
              currentCardIndex === 0 
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:opacity-70 text-gray-500'
            }`}
            style={{ marginRight: '12px', width: '32px', height: '32px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Progress Bar - Takes available space */}
          <div style={{ flexGrow: 1, minWidth: '0', margin: '0 12px' }}>
            <ProgressBar 
              progress={progress} 
              currentStep={currentCardIndex} 
              totalSteps={lessonContent.cards.length} 
              completedSteps={completedCards}
              onStepClick={handleStepClick}
            />
          </div>
          
          {/* Next Button */}
          <button
            onClick={() => handleContinue()}
            className="flex-shrink-0 flex items-center justify-center transition-opacity hover:opacity-70 text-gray-500"
            style={{ marginRight: '12px', width: '32px', height: '32px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Close Button */}
          <button
            onClick={() => navigate('/')}
            className="flex-shrink-0 flex items-center justify-center transition-opacity hover:opacity-70 text-gray-500"
            style={{ width: '32px', height: '32px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Area - Takes remaining space, never overlaps navbar */}
      <div className="w-full" style={{ 
        gridRow: '2',
        gridColumn: '1',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div className="mx-auto" style={{ maxWidth: '900px', padding: '40px 24px' }}>
          {lessonContent.cards.slice(0, visibleCards).map((card, index) => {
            const isCurrentCard = index === currentCardIndex;
            
            return (
              <div 
                key={card.id} 
                id={`card-${index}`}
                className="mb-16"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '48px 64px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <ContentCard 
                  card={card}
                  userAnswer={userAnswers[index] || ''}
                  setUserAnswer={(value: string) => {
                    setUserAnswers(prev => ({ ...prev, [index]: value }));
                  }}
                  showFeedback={showFeedback[index] || false}
                />
                
                {/* Continue Button for current card only */}
                {isCurrentCard && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => handleContinue(index)}
                      className="px-10 py-3 text-white font-medium rounded-full transition-all"
                      style={{ 
                        backgroundColor: '#1976d2',
                        fontSize: '15px',
                        letterSpacing: '0.3px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1565c0';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1976d2';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};