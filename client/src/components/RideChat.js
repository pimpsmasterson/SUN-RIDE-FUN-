import React from 'react';
import { MessageCircle } from 'lucide-react';

function RideChat() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-16">
        <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Ride Chat</h2>
        <p className="text-gray-600">This component will show the chat for a specific ride.</p>
        <p className="text-sm text-gray-500 mt-2">Implementation coming soon!</p>
      </div>
    </div>
  );
}

export default RideChat; 