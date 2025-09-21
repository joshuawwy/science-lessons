import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';

interface UserSelectorProps {
  onUserSelected: () => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ onUserSelected }) => {
  const { users, addUser, selectUser, deleteUser } = useUserStore();
  const [newUserName, setNewUserName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      const user = addUser(newUserName);
      selectUser(user.id);
      setNewUserName('');
      setShowCreateForm(false);
      onUserSelected();
    }
  };

  const handleSelectUser = (userId: string) => {
    selectUser(userId);
    onUserSelected();
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user "${userName}"? This will remove all their progress.`)) {
      deleteUser(userId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <div className="mx-auto" style={{ maxWidth: '700px', padding: '40px 24px' }}>
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Science Learning</h1>
          <p className="text-gray-600 mb-8">
            Select your user profile to continue learning
          </p>
        </div>

        {users.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select User</h2>
            {users.map(user => (
              <div
                key={user.id}
                className="mb-4"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '24px 32px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleSelectUser(user.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {formatDate(user.createdAt)} • Last active: {formatDate(user.lastActive)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600 font-medium">Continue →</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.id, user.name);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Delete user"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div 
          className="mb-8"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '32px 40px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          {!showCreateForm ? (
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Create New User</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add New User
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                  User Name
                </label>
                <input
                  type="text"
                  id="userName"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Enter name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={50}
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewUserName('');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {users.length === 0 && (
          <div 
            className="text-center"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '32px 40px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <p className="text-gray-600">No users found. Create your first user to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};