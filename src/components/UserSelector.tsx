import React, { useState, useRef } from 'react';
import { useUserStore } from '../stores/userStore';

interface UserSelectorProps {
  onUserSelected: () => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ onUserSelected }) => {
  const { users, addUser, selectUser, deleteUser } = useUserStore();
  const [newUserName, setNewUserName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDataInfo, setShowDataInfo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const exportProgress = () => {
    try {
      // Collect all user data and their progress
      const exportData = {
        users: users,
        progressData: {} as Record<string, any>,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      // Get progress data for each user
      users.forEach(user => {
        const progressKey = `science-progress-${user.id}`;
        const storedProgress = localStorage.getItem(progressKey);
        if (storedProgress) {
          try {
            exportData.progressData[user.id] = JSON.parse(storedProgress);
          } catch {
            // Skip invalid progress data
          }
        }
      });

      // Also include the main store data
      const mainStoreData = localStorage.getItem('science-users');
      if (mainStoreData) {
        try {
          exportData.userStoreData = JSON.parse(mainStoreData);
        } catch {
          // Skip if invalid
        }
      }

      // Create and download the file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `science-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Progress exported successfully! Save this file to restore your data on another device.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export progress. Please try again.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const importProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        // Validate the import data structure
        if (!importData.users || !importData.progressData || !importData.version) {
          throw new Error('Invalid file format');
        }

        // Show confirmation dialog
        const userCount = importData.users.length;
        const confirmed = confirm(
          `This will import ${userCount} user(s) and their progress data. ` +
          `This will replace any existing users with the same names. ` +
          `Continue?`
        );

        if (!confirmed) return;

        // Clear existing data first
        localStorage.clear();

        // Import user store data if available
        if (importData.userStoreData) {
          localStorage.setItem('science-users', JSON.stringify(importData.userStoreData));
        }

        // Import progress data for each user
        Object.keys(importData.progressData).forEach(userId => {
          const progressKey = `science-progress-${userId}`;
          localStorage.setItem(progressKey, JSON.stringify(importData.progressData[userId]));
        });

        // Reload the page to reinitialize all stores
        alert(`Successfully imported ${userCount} user(s) and their progress! The page will reload.`);
        window.location.reload();

      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import progress. Please check that you selected a valid export file.');
      }
    };

    reader.readAsText(file);
    // Reset the input so the same file can be selected again if needed
    event.target.value = '';
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

        {/* Data Management Section */}
        <div 
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '32px 40px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Data Management</h3>
            <button
              onClick={() => setShowDataInfo(!showDataInfo)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {showDataInfo ? 'Hide Info' : 'Why is this needed?'}
            </button>
          </div>

          {showDataInfo && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">📱 Moving Between Devices?</h4>
              <p className="text-sm text-blue-800 mb-3">
                Your progress is saved on <strong>this device only</strong>. If you want to continue learning on a different computer, tablet, or browser, you'll need to transfer your data.
              </p>
              <div className="text-sm text-blue-800">
                <p className="mb-2"><strong>To move your progress:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click "Export Progress" to download your data file</li>
                  <li>Transfer the file to your new device (email, USB drive, cloud storage)</li>
                  <li>On the new device, click "Import Progress" and select the file</li>
                </ol>
                <p className="mt-3 text-xs text-blue-700">
                  💡 <strong>Tip:</strong> Export regularly to back up your progress!
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={exportProgress}
              disabled={users.length === 0}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                users.length === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title={users.length === 0 ? 'Create users first to export their progress' : 'Download all user progress as a file'}
            >
              📥 Export Progress
            </button>

            <button
              onClick={handleImportClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              title="Upload a progress file to restore user data"
            >
              📤 Import Progress
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            {users.length > 0 ? (
              <p>Ready to export {users.length} user(s) and their progress data</p>
            ) : (
              <p>No users to export yet. Create users first, then export their progress.</p>
            )}
          </div>

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importProgress}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};