import React from 'react';

interface CardContent {
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
                  userAnswer.trim().toLowerCase() === card.interactive.correctAnswer?.toLowerCase()
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`} style={{ border: userAnswer.trim().toLowerCase() === card.interactive.correctAnswer?.toLowerCase() ? '1px solid #c3e6cb' : '1px solid #f5c6cb' }}>
                  {userAnswer.trim().toLowerCase() === card.interactive.correctAnswer?.toLowerCase()
                    ? '✓ Correct! ' + (card.interactive.feedback || '')
                    : '✗ Not quite. Try again!'}
                </div>
              )}
            </div>
          )}

          {card.interactive.type === 'quiz' && (
            <div className="space-y-2">
              {/* Quiz options would be rendered here */}
              <p className="text-gray-500 italic text-sm">Quiz interface coming soon...</p>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};