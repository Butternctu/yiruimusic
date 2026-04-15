import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Search, Send, User, Circle, MessageSquare } from 'lucide-react';
import SEO from '../components/SEO';

const AdminMessages = () => {
  const { user, isAdmin } = useAuth();
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const chatContainerRef = useRef(null);
  const mobileChatContainerRef = useRef(null);

  // Fetch all chats
  useEffect(() => {
    if (!isAdmin) return;

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, orderBy('lastMessageTime', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data({ serverTimestamps: 'estimate' })
      }));
      setChats(chatList);
      setLoadingChats(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    
    setTimeout(() => setLoadingMessages(true), 0);
    
    // Mark as read by admin when opened
    const chatDocRef = doc(db, 'chats', selectedChat.id);
    if (selectedChat.unreadByAdmin) {
      updateDoc(chatDocRef, { unreadByAdmin: false }).catch(console.error);
    }

    const messagesRef = collection(db, `chats/${selectedChat.id}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data({ serverTimestamps: 'estimate' })
      }));
      setMessages(msgs);
      setLoadingMessages(false);
      
      // If a message comes while we are reading, mark as read
      if (document.visibilityState === 'visible') {
        updateDoc(chatDocRef, { unreadByAdmin: false }).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [selectedChat]);

  // Auto scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    if (mobileChatContainerRef.current) {
      mobileChatContainerRef.current.scrollTop = mobileChatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const messagesRef = collection(db, `chats/${selectedChat.id}/messages`);
      await addDoc(messagesRef, {
        text: messageText,
        sender: 'admin',
        createdAt: serverTimestamp()
      });

      const chatDocRef = doc(db, 'chats', selectedChat.id);
      await updateDoc(chatDocRef, {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
        unreadByUser: true
      });

    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredChats = chats.filter(chat => 
    chat.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SEO title="Inbox | Admin Panel" url="/admin/messages" />
      <section className="min-h-screen bg-dark-900 pt-32 pb-12 px-6 md:px-12 relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col z-10 animate-fadeInUp">
          
          <div className="mb-6">
            <h1 className="font-serif text-3xl text-white tracking-wide">Student Inbox</h1>
            <p className="text-gray-500 text-sm tracking-wider uppercase mt-2">Manage student conversations</p>
          </div>

          <div className="flex-1 glass-card rounded-sm border border-white/10 flex overflow-hidden shadow-2xl relative" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            
            {/* Sidebar: Chat List */}
            <div className="w-full md:w-1/3 border-r border-white/10 flex flex-col bg-dark-900/50">
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-sm py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loadingChats ? (
                  <div className="p-8 text-center text-gray-500 text-sm">Loading conversations...</div>
                ) : filteredChats.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No conversations found.</div>
                ) : (
                  filteredChats.map(chat => (
                    <div 
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-300 flex items-start space-x-3 group ${selectedChat?.id === chat.id ? 'bg-white/10 border-l-2 border-l-gold' : 'hover:bg-white/5 border-l-2 border-l-transparent'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-gold font-serif text-sm">{chat.userName?.charAt(0).toUpperCase() || 'U'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                           <h3 className={`text-sm truncate pr-2 ${chat.unreadByAdmin ? 'text-white font-semibold' : 'text-gray-300 font-medium'}`}>
                             {chat.userName || 'Unknown Member'}
                           </h3>
                           <span className="text-[10px] text-gray-500 whitespace-nowrap">{formatTime(chat.lastMessageTime)}</span>
                        </div>
                        <p className={`text-xs truncate ${chat.unreadByAdmin ? 'text-gold' : 'text-gray-500'}`}>
                          {chat.lastMessage || 'No messages'}
                        </p>
                      </div>
                      {chat.unreadByAdmin && (
                        <div className="mt-1">
                          <Circle className="w-2.5 h-2.5 fill-gold text-gold" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Main Area: Chat UI */}
            <div className="hidden md:flex flex-col w-2/3 bg-dark-900/20">
              {!selectedChat ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-6">
                  <span className="text-gold text-sm uppercase tracking-widest mb-4">Select a conversation</span>
                  <p className="text-white text-lg font-serif">Inbox Empty</p>
                  <p className="text-sm text-gray-400 mt-2">Choose a student from the list to view your message history.</p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 bg-dark-900/50 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h2 className="text-white font-medium">{selectedChat.userName}</h2>
                        <a href={`mailto:${selectedChat.userEmail}`} className="text-xs text-gray-500 hover:text-gold transition-colors">{selectedChat.userEmail}</a>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar flex flex-col">
                    {loadingMessages ? (
                      <div className="flex-1 flex justify-center items-center">
                        <div className="w-6 h-6 border-2 border-gold/50 border-t-gold rounded-full animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex-1 flex justify-center items-center text-gray-500 text-sm">
                        No messages in this conversation.
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isAdminMsg = msg.sender === 'admin';
                        return (
                          <div key={msg.id || index} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                               <div className={`px-5 py-3 rounded-2xl ${isAdminMsg ? 'bg-gold/10 text-white border border-gold/30 rounded-br-sm' : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm'}`}>
                                 <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                               </div>
                               <span className="text-[10px] text-gray-500 mt-2 px-1">
                                 {formatTime(msg.createdAt)}
                               </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-white/10 bg-dark-900/50">
                    <form onSubmit={handleSendMessage} className="relative flex items-end space-x-3">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Reply to student..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors resize-none custom-scrollbar min-h-[50px] max-h-[150px]"
                        rows="1"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="h-[50px] px-6 rounded-sm bg-gold text-dark-900 flex items-center justify-center space-x-2 font-medium tracking-wider uppercase text-xs hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <span>Send</span>
                        <Send className="w-4 h-4 ml-1" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
            
            {/* Mobile Hint */}
            {selectedChat && (
              <div className="md:hidden absolute inset-0 bg-dark-900 z-50 flex flex-col">
                <div className="p-4 border-b border-white/10 bg-dark-900/90 flex items-center mb-0">
                  <button onClick={() => setSelectedChat(null)} className="mr-4 p-2">
                     <span className="text-gold text-xs uppercase tracking-widest">Back</span>
                  </button>
                  <h2 className="text-white font-medium">{selectedChat.userName}</h2>
                </div>
                  <div ref={mobileChatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col bg-dark-900">
                    {messages.map((msg, index) => {
                        const isAdminMsg = msg.sender === 'admin';
                        return (
                          <div key={msg.id || index} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                               <div className={`px-4 py-2.5 rounded-xl ${isAdminMsg ? 'bg-gold/10 text-white border border-gold/30 rounded-br-sm' : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm'}`}>
                                 <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                               </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="p-3 border-t border-white/10 bg-dark-900">
                    <form onSubmit={handleSendMessage} className="relative flex items-end space-x-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Reply..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-gold/50 resize-none min-h-[40px] max-h-[100px]"
                        rows="1"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="h-[40px] px-4 rounded-sm bg-gold text-dark-900 flex items-center justify-center hover:bg-gold-light transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminMessages;
