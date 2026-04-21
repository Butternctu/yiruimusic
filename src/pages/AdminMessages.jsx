import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Search, Send, User, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import emailjs from '@emailjs/browser';
import { isSameDay, formatDate } from '../data/bookingData';

const AdminMessages = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
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

    const unsubscribe = onSnapshot(q, snapshot => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data({ serverTimestamps: 'estimate' }),
      }));
      setChats(chatList);
      setLoadingChats(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;

    // Mark as read by admin when opened
    const chatDocRef = doc(db, 'chats', selectedChat.id);
    if (selectedChat.unreadByAdmin) {
      updateDoc(chatDocRef, { unreadByAdmin: false }).catch(console.error);
    }

    const messagesRef = collection(db, `chats/${selectedChat.id}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data({ serverTimestamps: 'estimate' }),
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

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const messagesRef = collection(db, `chats/${selectedChat.id}/messages`);
      await addDoc(messagesRef, {
        text: messageText,
        sender: 'admin',
        createdAt: serverTimestamp(),
      });

      const chatDocRef = doc(db, 'chats', selectedChat.id);
      await updateDoc(chatDocRef, {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
        unreadByUser: true,
      });

      // Send Email Notification to Student
      if (selectedChat.userEmail) {
        const studentName = selectedChat.userName || 'Student';
        const emailParams = {
          to_name: studentName,
          to_email: selectedChat.userEmail,
          message: `Dear ${studentName},\n\nDr. Li has replied to your message:\n\n"${messageText}"\n\nPlease log in to your dashboard to view the conversation.`,
          from_name: 'Dr. Li',
        };

        try {
          await emailjs.send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_STUDENT_TEMPLATE_ID, emailParams, import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
        } catch (err) {
          console.error('Email notification failed:', err);
        }
      } else {
        console.warn('Cannot send email notification: userEmail is missing from this chat document.');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const formatTime = timestamp => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const filteredChats = chats.filter(
    chat => chat.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || chat.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <SEO title="Inbox | Admin Panel" url="/admin/messages" />
      <section className="h-[100dvh] bg-dark-900 pt-[88px] md:pt-[104px] pb-6 relative flex flex-col overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03)_0%,transparent_60%)]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 w-full flex-1 flex flex-col z-10 relative overflow-hidden">
          <div className="shrink-0 bg-dark-900/95 backdrop-blur-md pt-2 pb-6 -mx-6 px-6 md:-mx-12 md:px-12 z-30">
            {/* Header */}
            <div className="flex items-center space-x-4 animate-fadeInUp shrink-0">
              <button
                onClick={() => navigate('/admin')}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-gold/30 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400" />
              </button>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">Inbox</h1>
                <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mt-1">Student Conversations</p>
              </div>
            </div>
          </div>

          <div
            className="flex-1 glass-card rounded-sm border border-white/10 flex overflow-hidden shadow-2xl relative bg-white/1 animate-fadeInUp"
            style={{ animationDelay: '100ms' }}
          >
            {/* Sidebar: Chat List */}
            <div className="w-full md:w-80 lg:w-96 border-r border-white/6 flex flex-col bg-black/20 shrink-0">
              <div className="p-4 border-b border-white/6 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white/3 border border-white/10 rounded-sm py-2.5 pl-9 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-gold/30 transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loadingChats ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto opacity-30" />
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-600 text-[10px] uppercase tracking-widest">No conversations</p>
                  </div>
                ) : (
                  filteredChats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        if (selectedChat?.id !== chat.id) {
                          setLoadingMessages(true);
                          setSelectedChat(chat);
                        }
                      }}
                      className={`p-5 border-b border-white/3 cursor-pointer transition-all duration-300 flex items-start space-x-4 group relative ${selectedChat?.id === chat.id ? 'bg-white/4' : 'hover:bg-white/2'}`}
                    >
                      {selectedChat?.id === chat.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold shadow-[0_0_10px_rgba(197,160,89,0.5)]" />}
                      <div className="w-10 h-10 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center shrink-0 relative">
                        <span className="text-gold font-serif text-sm">{chat.userName?.charAt(0).toUpperCase() || 'U'}</span>
                        {chat.unreadByAdmin && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-dark-900 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`text-sm truncate pr-2 ${chat.unreadByAdmin ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {chat.userName || 'Unknown Member'}
                          </h3>
                          <span className="text-[9px] text-gray-600 whitespace-nowrap uppercase tracking-tighter">{formatTime(chat.lastMessageTime)}</span>
                        </div>
                        <p className={`text-[11px] truncate ${chat.unreadByAdmin ? 'text-gold font-medium' : 'text-gray-500'}`}>
                          {chat.lastMessage || 'No messages'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Main Area: Chat UI */}
            <div className="hidden md:flex flex-col flex-1 bg-white/1 min-w-0">
              {!selectedChat ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 p-12">
                  <div className="w-20 h-20 rounded-full border border-gold/20 flex items-center justify-center mb-6">
                    <MessageSquare className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-white font-serif text-xl mb-2 tracking-wide">Select a conversation</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">to view student message history</p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="px-5 py-[15px] border-b border-white/6 bg-black/20 flex justify-between items-center shrink-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-gold" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-white font-medium text-sm truncate">{selectedChat.userName}</h2>
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest block truncate">{selectedChat.userEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar flex flex-col">
                    {loadingMessages ? (
                      <div className="flex-1 flex justify-center items-center">
                        <Loader2 className="w-6 h-6 text-gold animate-spin opacity-30" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex-1 flex justify-center items-center">
                        <p className="text-gray-600 text-xs uppercase tracking-widest font-serif">Empty conversation</p>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isAdminMsg = msg.sender === 'admin';
                        const msgDate = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const prevMsgDate = prevMsg ? (prevMsg.createdAt?.toDate ? prevMsg.createdAt.toDate() : new Date(prevMsg.createdAt)) : null;
                        const showDateDivider = !prevMsgDate || !isSameDay(msgDate, prevMsgDate);

                        return (
                          <React.Fragment key={msg.id || index}>
                            {showDateDivider && (
                              <div className="flex items-center my-10 animate-fadeIn shrink-0">
                                <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/6 to-transparent"></div>
                                <div className="mx-4 px-4 py-1.5 rounded-sm border border-white/5 bg-white/1 text-[9px] uppercase tracking-[0.2em] text-gold/60 font-serif">
                                  {formatDate(msgDate)}
                                </div>
                                <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/6 to-transparent"></div>
                              </div>
                            )}
                            <div
                              className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'} animate-fadeInUp`}
                              style={{ animationDelay: `${(index % 10) * 50}ms` }}
                            >
                              <div className={`max-w-[80%] lg:max-w-[70%] flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                                <div
                                  className={`px-5 py-3.5 rounded-sm ${isAdminMsg ? 'bg-gold/10 text-white border border-gold/30 shadow-[0_4px_20px_rgba(197,160,89,0.05)]' : 'bg-white/5 border border-white/10 text-gray-200'}`}
                                >
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                <span className="text-[9px] text-gray-600 mt-2 px-1 uppercase tracking-tighter">{formatTime(msg.createdAt)}</span>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-6 border-t border-white/6 bg-black/20 shrink-0">
                    <form onSubmit={handleSendMessage} className="relative flex items-end space-x-3 w-full">
                      <div className="flex-1 relative">
                        <textarea
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                          placeholder="Type your reply..."
                          className="block w-full bg-white/3 border border-white/10 rounded-sm py-4 px-5 text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 transition-all resize-none custom-scrollbar min-h-[56px] max-h-[160px] text-base md:text-sm leading-relaxed"
                          rows="1"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="h-14 px-8 rounded-sm bg-gold text-dark-900 flex items-center justify-center space-x-3 font-medium tracking-widest uppercase text-[10px] hover:bg-gold-light transition-all shadow-lg hover:shadow-gold/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shrink-0"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Chat Detail Overlay */}
            {selectedChat && (
              <div className="md:hidden absolute inset-0 bg-dark-950 z-50 flex flex-col">
                <div className="p-4 border-b border-white/6 bg-dark-900 flex items-center justify-between shrink-0">
                  <button onClick={() => setSelectedChat(null)} className="flex items-center space-x-2 text-gold py-2 px-1">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest">Inbox</span>
                  </button>
                  <div className="text-right">
                    <h2 className="text-white font-medium text-xs truncate max-w-[150px]">{selectedChat.userName}</h2>
                  </div>
                </div>
                <div ref={mobileChatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col bg-dark-900">
                  {messages.map((msg, index) => {
                    const isAdminMsg = msg.sender === 'admin';
                    return (
                      <div key={msg.id || index} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'} animate-fadeInUp`}>
                        <div className={`max-w-[90%] flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-4 py-2.5 rounded-sm ${isAdminMsg ? 'bg-gold/10 text-white border border-gold/30' : 'bg-white/5 border border-white/10 text-gray-200'}`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          <span className="text-[9px] text-gray-600 mt-1.5 uppercase tracking-tighter">{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 border-t border-white/6 bg-black/40">
                  <form onSubmit={handleSendMessage} className="relative flex items-end space-x-2">
                    <textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Reply..."
                      className="block flex-1 bg-white/5 border border-white/10 rounded-sm py-3 px-4 text-base md:text-sm text-white focus:outline-none focus:border-gold/30 resize-none min-h-[48px] max-h-[120px]"
                      rows="1"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-12 h-12 rounded-sm bg-gold text-dark-900 flex items-center justify-center hover:bg-gold-light transition-all disabled:opacity-30 shrink-0"
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
