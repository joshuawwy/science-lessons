import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Progress {
  completedTopics: string[];
  completedLessons: Record<string, number[]>; // topicId -> [1, 2, 3]
  currentPosition: Record<string, number>; // lessonId -> card number
}

interface ProgressStore extends Progress {
  currentUserId: string | null;
  setCurrentUser: (userId: string | null) => void;
  markLessonComplete: (topicId: string, lessonNumber: number) => void;
  updatePosition: (lessonId: string, cardNumber: number) => void;
  isTopicComplete: (topicId: string) => boolean;
  isLessonComplete: (topicId: string, lessonNumber: number) => boolean;
  getCompletedLessonsForTopic: (topicId: string) => number[];
  getNextLesson: (topicId: string) => number | null;
  reset: () => void;
}

const initialState: Progress = {
  completedTopics: [],
  completedLessons: {},
  currentPosition: {}
};

// Create a function to get the storage key for a specific user
const getStorageKey = (userId: string | null) => {
  return userId ? `science-progress-${userId}` : 'science-progress';
};

// Function to load user-specific progress from localStorage
const loadUserProgress = (userId: string | null): Progress => {
  if (!userId) return initialState;
  
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    return stored ? JSON.parse(stored) : initialState;
  } catch {
    return initialState;
  }
};

// Function to save user-specific progress to localStorage
const saveUserProgress = (userId: string | null, progress: Progress) => {
  if (!userId) return;
  
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(progress));
  } catch {
    // Ignore save errors
  }
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentUserId: null,

      setCurrentUser: (userId: string | null) => {
        const userProgress = loadUserProgress(userId);
        set({
          currentUserId: userId,
          ...userProgress
        });
      },

      markLessonComplete: (topicId: string, lessonNumber: number) => {
        set((state) => {
          const completedLessons = { ...state.completedLessons };
          if (!completedLessons[topicId]) {
            completedLessons[topicId] = [];
          }
          if (!completedLessons[topicId].includes(lessonNumber)) {
            completedLessons[topicId] = [...completedLessons[topicId], lessonNumber].sort();
          }

          // Check if all 3 lessons are complete for this topic
          const completedTopics = [...state.completedTopics];
          if (completedLessons[topicId].length === 3 && !completedTopics.includes(topicId)) {
            completedTopics.push(topicId);
          }

          const newProgress = { completedLessons, completedTopics, currentPosition: state.currentPosition };
          
          // Save to user-specific storage
          saveUserProgress(state.currentUserId, newProgress);
          
          return newProgress;
        });
      },

      updatePosition: (lessonId: string, cardNumber: number) => {
        set((state) => {
          const currentPosition = {
            ...state.currentPosition,
            [lessonId]: cardNumber
          };
          
          const newProgress = { 
            completedTopics: state.completedTopics, 
            completedLessons: state.completedLessons, 
            currentPosition 
          };
          
          // Save to user-specific storage
          saveUserProgress(state.currentUserId, newProgress);
          
          return { currentPosition };
        });
      },

      isTopicComplete: (topicId: string) => {
        const state = get();
        return state.completedTopics.includes(topicId);
      },

      isLessonComplete: (topicId: string, lessonNumber: number) => {
        const state = get();
        return state.completedLessons[topicId]?.includes(lessonNumber) || false;
      },

      getCompletedLessonsForTopic: (topicId: string) => {
        const state = get();
        return state.completedLessons[topicId] || [];
      },

      getNextLesson: (topicId: string) => {
        const state = get();
        const completed = state.completedLessons[topicId] || [];
        for (let i = 1; i <= 3; i++) {
          if (!completed.includes(i)) {
            return i;
          }
        }
        return null;
      },

      reset: () => {
        const state = get();
        // Clear user-specific storage
        if (state.currentUserId) {
          localStorage.removeItem(getStorageKey(state.currentUserId));
        }
        set(initialState);
      }
    }),
    {
      name: 'science-progress-store' // Just for storing currentUserId
    }
  )
);