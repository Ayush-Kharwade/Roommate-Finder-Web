import React from 'react';

function Notifications() {
  // For now, we'll assume there are no notifications.
  const notifications = [];

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Notifications</h1>

      <div className="bg-white p-8 rounded-lg shadow-md">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">You don't have any notifications.</p>
          </div>
        ) : (
          // This is where we will map over real notifications later
          <div>
            {/* Notification items will go here */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;