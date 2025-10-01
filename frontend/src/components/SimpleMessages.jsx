import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import SimpleNavbar from './SimpleNavbar';
import { 
  MessageSquare, 
  Send, 
  Plus,
  User,
  Clock,
  Search
} from 'lucide-react';

const SimpleMessages = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock conversations data
  const conversations = [
    {
      id: 1,
      participant: user.role === 'client' ? 'John Smith (Tax Pro)' : 'Sarah Johnson',
      lastMessage: 'Thanks for uploading the W-2 forms. I\'ll review them shortly.',
      lastMessageTime: '2 hours ago',
      unreadCount: 2,
      messages: [
        {
          id: 1,
          sender: user.role === 'client' ? 'Tax Pro' : 'Client',
          message: 'Hi! I\'ve uploaded my W-2 forms for 2024. Please let me know if you need anything else.',
          timestamp: '2024-01-15 10:30 AM',
          isOwn: user.role === 'client'
        },
        {
          id: 2,
          sender: user.role === 'client' ? 'You' : 'You',
          message: 'Perfect! I can see the documents. I\'ll start working on your return this week.',
          timestamp: '2024-01-15 11:45 AM',
          isOwn: user.role !== 'client'
        },
        {
          id: 3,
          sender: user.role === 'client' ? 'Tax Pro' : 'Client',
          message: 'Thanks for uploading the W-2 forms. I\'ll review them shortly.',
          timestamp: '2024-01-15 2:15 PM',
          isOwn: user.role === 'client'
        }
      ]
    },
    {
      id: 2,
      participant: user.role === 'client' ? 'Jane Doe (Tax Pro)' : 'Mike Wilson',
      lastMessage: 'I have a question about the 1099 form.',
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          sender: user.role === 'client' ? 'You' : 'You',
          message: 'Hi Mike, how can I help you today?',
          timestamp: '2024-01-14 9:00 AM',
          isOwn: user.role !== 'client'
        },
        {
          id: 2,
          sender: user.role === 'client' ? 'Tax Pro' : 'Client',
          message: 'I have a question about the 1099 form.',
          timestamp: '2024-01-14 9:15 AM',
          isOwn: user.role === 'client'
        }
      ]
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.participant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Mock sending message
    alert('Message sent successfully!');
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            {user.role === 'client' 
              ? 'Communicate with your tax professional.' 
              : 'Manage client communications.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Conversation List */}
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-blue-100 border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <p className="font-medium text-gray-900 truncate">
                              {conversation.participant}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {conversation.lastMessageTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    {selectedConversation.participant}
                  </CardTitle>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.isOwn ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 min-h-[60px] resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button type="submit" className="self-end">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the list to start messaging.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMessages;