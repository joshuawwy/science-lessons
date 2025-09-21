import React from 'react';

// Helper function to check practice answers against correct answer and alternatives
const checkPracticeAnswer = (userAnswer: string, interactive: any): boolean => {
  if (!interactive.correctAnswer || typeof interactive.correctAnswer !== 'string') return false;
  
  const normalizedUserAnswer = userAnswer.trim().toLowerCase();
  const normalizedCorrectAnswer = interactive.correctAnswer.toLowerCase();
  
  // Check main correct answer
  if (normalizedUserAnswer === normalizedCorrectAnswer) return true;
  
  // Check alternative answers
  if (interactive.alternativeAnswers) {
    return interactive.alternativeAnswers.some((alt: string) => 
      normalizedUserAnswer === alt.toLowerCase()
    );
  }
  
  return false;
};

interface CardContent {
  id: string;
  type: 'intro' | 'objective' | 'i-do' | 'you-do' | 'summary';
  cycle?: number;
  title: string;
  content: string;
  image?: {
    src: string;
    alt: string;
    type?: string;
    prompt?: string;
    placement?: string;
  };
  interactive?: {
    type: 'quiz' | 'input' | 'practice';
    question?: string;
    correctAnswer?: string | number;
    options?: string[];
    feedback?: {
      correct?: string;
      incorrect?: string[] | string;
      partial?: string;
    } | string;
    alternativeAnswers?: string[];
    hint?: string;
  };
}

interface ContentCardProps {
  card: CardContent;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  showFeedback: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  card,
  userAnswer,
  setUserAnswer,
  showFeedback
}) => {
  // Removed unused function

  return (
    <div style={{ 
      backgroundColor: 'transparent',
      marginBottom: '32px'
    }}>
      {/* Card Header with Title and Label */}
      <div className="mb-6">
        {card.type === 'i-do' || card.type === 'you-do' ? (
          <div style={{ 
            fontSize: '13px',
            fontWeight: '600',
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '12px'
          }}>
            CYCLE {card.cycle}: {card.type === 'i-do' ? 'I Do' : 'You Do'}
          </div>
        ) : null}
        <div className="flex items-start justify-between">
          <h2 style={{ 
            fontSize: '22px',
            fontWeight: '600',
            color: '#000',
            lineHeight: '1.35',
            margin: '0',
            flexGrow: 1,
            paddingRight: '20px'
          }}>
            {card.title}
          </h2>
          {/* Help button - matching MathAcademy style */}
          <button className="flex-shrink-0" style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid #d0d0d0',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '300',
            color: '#888',
            cursor: 'pointer'
          }}>
            ?
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        fontSize: '18px',
        lineHeight: '1.6',
        color: '#000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="lesson-content" dangerouslySetInnerHTML={{ __html: card.content }} />
      </div>

      {/* Image */}
      {card.image && (
        <div className="mt-6 flex justify-center">
          <img 
            src={card.image.src}
            alt={card.image.alt}
            style={{ maxWidth: '300px', height: 'auto' }}
            className="rounded-lg shadow-sm border border-gray-200"
          />
        </div>
      )}

      {/* Interactive Section */}
      {card.interactive && (
        <div className="mt-6 p-5" style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <p className="mb-4" style={{
            fontSize: '15px',
            fontWeight: '500',
            color: '#333'
          }}>
            {card.interactive.question}
          </p>
          
          {card.interactive.type === 'input' && (
            <div>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full"
                placeholder="Type your answer here..."
                style={{ 
                  padding: '10px 12px',
                  fontSize: '15px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '4px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4A90E2'}
                onBlur={(e) => e.target.style.borderColor = '#d0d0d0'}
              />
              
              {showFeedback && (
                <div className={`mt-3 p-3 rounded-md text-sm ${
                  typeof card.interactive.correctAnswer === 'string' && userAnswer.trim().toLowerCase() === card.interactive.correctAnswer.toLowerCase()
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`} style={{ border: typeof card.interactive.correctAnswer === 'string' && userAnswer.trim().toLowerCase() === card.interactive.correctAnswer.toLowerCase() ? '1px solid #c3e6cb' : '1px solid #f5c6cb' }}>
                  {typeof card.interactive.correctAnswer === 'string' && userAnswer.trim().toLowerCase() === card.interactive.correctAnswer.toLowerCase()
                    ? '✓ ' + (typeof card.interactive.feedback === 'object' ? card.interactive.feedback.correct : card.interactive.feedback || 'Correct!')
                    : '✗ ' + (typeof card.interactive.feedback === 'object' ? card.interactive.feedback.incorrect : 'Not quite. Try again!')}
                </div>
              )}
            </div>
          )}

          {card.interactive.type === 'quiz' && (
            <div className="space-y-2">
              {card.interactive.options?.map((option, index) => (
                <label key={index} className="flex items-start space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50" style={{
                  border: userAnswer === index.toString() ? '2px solid #4A90E2' : '1px solid #d0d0d0',
                  backgroundColor: userAnswer === index.toString() ? '#f0f8ff' : 'white'
                }}>
                  <input
                    type="radio"
                    name={`quiz-${card.id}`}
                    value={index}
                    checked={userAnswer === index.toString()}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="mt-1"
                  />
                  <span style={{ fontSize: '15px', lineHeight: '1.4' }}>{option}</span>
                </label>
              ))}
              
              {showFeedback && (
                <div className={`mt-3 p-3 rounded-md text-sm ${
                  parseInt(userAnswer) === card.interactive.correctAnswer
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`} style={{ border: parseInt(userAnswer) === card.interactive.correctAnswer ? '1px solid #c3e6cb' : '1px solid #f5c6cb' }}>
                  {parseInt(userAnswer) === card.interactive.correctAnswer
                    ? '✓ ' + (typeof card.interactive.feedback === 'object' ? card.interactive.feedback.correct : card.interactive.feedback || 'Correct!')
                    : '✗ ' + (typeof card.interactive.feedback === 'object' && Array.isArray(card.interactive.feedback.incorrect) 
                        ? card.interactive.feedback.incorrect[parseInt(userAnswer)] || card.interactive.feedback.incorrect[0] || 'Not quite. Try again!'
                        : typeof card.interactive.feedback === 'object' 
                          ? card.interactive.feedback.incorrect || 'Not quite. Try again!'
                          : 'Not quite. Try again!')}
                </div>
              )}
            </div>
          )}

          {card.interactive.type === 'practice' && (
            <div className="space-y-2">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full resize-none"
                rows={3}
                placeholder="Write your observation or answer here..."
                style={{ 
                  padding: '10px 12px',
                  fontSize: '15px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '4px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4A90E2'}
                onBlur={(e) => e.target.style.borderColor = '#d0d0d0'}
              />
              
              {showFeedback && (
                <div className={`mt-3 p-3 rounded-md text-sm ${
                  checkPracticeAnswer(userAnswer, card.interactive)
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`} style={{ border: checkPracticeAnswer(userAnswer, card.interactive) ? '1px solid #c3e6cb' : '1px solid #f5c6cb' }}>
                  {checkPracticeAnswer(userAnswer, card.interactive)
                    ? '✓ ' + (typeof card.interactive.feedback === 'object' ? card.interactive.feedback.correct : card.interactive.feedback || 'Great work!')
                    : '✗ ' + (typeof card.interactive.feedback === 'object' ? card.interactive.feedback.incorrect : 'Try again!')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};