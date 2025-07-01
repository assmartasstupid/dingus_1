import React, { useState } from 'react'
import { MessageSquare, Send, Search, Filter } from 'lucide-react'
import { motion } from 'framer-motion'

const MessagesView: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for demonstration
  const conversations = [
    {
      id: '1',
      caseName: 'Contract Review - ABC Corp',
      lastMessage: 'I\'ve reviewed the contract and have some questions...',
      timestamp: '2 hours ago',
      unread: 2,
      messages: [
        {
          id: '1',
          sender: 'client',
          content: 'Hi, I have some questions about the contract terms.',
          timestamp: '10:30 AM'
        },
        {
          id: '2',
          sender: 'lawyer',
          content: 'Of course! I\'d be happy to help clarify any terms for you.',
          timestamp: '10:45 AM'
        }
      ]
    },
    {
      id: '2',
      caseName: 'Employment Dispute',
      lastMessage: 'Thank you for the update on the case status.',
      timestamp: '1 day ago',
      unread: 0,
      messages: [
        {
          id: '1',
          sender: 'lawyer',
          content: 'I wanted to update you on the progress of your case.',
          timestamp: 'Yesterday 2:15 PM'
        }
      ]
    }
  ]

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.caseName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Secure communication with your legal team</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto h-full">
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ backgroundColor: '#f9fafb' }}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">{conversation.caseName}</h3>
                  {conversation.unread > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unread}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-1">{conversation.lastMessage}</p>
                <p className="text-xs text-gray-400">{conversation.timestamp}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  {conversations.find(c => c.id === selectedConversation)?.caseName}
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversations
                  .find(c => c.id === selectedConversation)
                  ?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'client'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'client' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessagesView