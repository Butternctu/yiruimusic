import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import emailjs from '@emailjs/browser';
import { isSameDay, formatDate } from '../data/bookingData';

const Messages = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Check if chat document exists and set unreadByUser to false
    const chatDocRef = doc(db, 'chats', user.uid);
    setDoc(
      chatDocRef,
      {
        userId: user.uid,
        userName: userProfile?.displayName || user.displayName || 'Member',
        userEmail: user.email,
        unreadByUser: false,
      },
      { merge: true },
    );

    const messagesRef = collection(db, `chats/${user.uid}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data({ serverTimestamps: 'estimate' }),
        }));
        setMessages(msgs);
        setLoading(false);

        // Clear unread flag if new messages arrive while open
        updateDoc(chatDocRef, { unreadByUser: false });
      },
      error => {
        console.error('Error fetching messages:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, userProfile]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const messagesRef = collection(db, `chats/${user.uid}/messages`);
      await addDoc(messagesRef, {
        text: messageText,
        sender: 'user',
        createdAt: serverTimestamp(),
      });

      const chatDocRef = doc(db, 'chats', user.uid);
      await setDoc(
        chatDocRef,
        {
          lastMessage: messageText,
          lastMessageTime: serverTimestamp(),
          unreadByAdmin: true,
          userId: user.uid,
          userName: userProfile?.displayName || user.displayName || 'Member',
          userEmail: user.email,
        },
        { merge: true },
      );

      // Send Email Notification to Admin
      const emailParams = {
        from_name: userProfile?.displayName || user.displayName || 'A student',
        from_email: user.email,
        message: messageText,
        to_name: 'Dr. Li',
      };

      emailjs
        .send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID, emailParams, import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
        .catch(err => console.error('Email notification failed:', err));
    } catch (error) {
      console.error('Error sending message:', error);
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

  return (
    <>
      <SEO title="Messages | Dr. Yirui Li" url="/messages" />
      <section className="h-[100dvh] bg-dark-900 pt-[88px] md:pt-[104px] pb-6 relative flex flex-col overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03)_0%,transparent_60%)]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-12 w-full flex-1 flex flex-col z-10 relative overflow-hidden">
          <div className="shrink-0 bg-dark-900/95 backdrop-blur-md pt-2 pb-2 -mx-6 px-6 md:-mx-12 md:px-12 z-30">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6 animate-fadeInUp shrink-0">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-gold/30 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400" />
              </button>
              <div>
                <h1 className="font-serif text-2xl text-white tracking-wide">Message Dr. Li</h1>
                <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mt-1">Direct Communication Channel</p>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div
            className="flex-1 glass-card rounded-sm border border-white/10 flex flex-col overflow-hidden animate-fadeInUp shadow-2xl relative bg-white/1"
            style={{ animationDelay: '100ms' }}
          >
            {/* Messages Area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar flex flex-col">
              {loading ? (
                <div className="flex-1 flex justify-center items-center">
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50" />
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest">Entering Chat...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center opacity-40">
                  <div className="w-16 h-16 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center mb-4">
                    <span className="text-gold font-serif text-xl">Li</span>
                  </div>
                  <p className="text-white text-sm mb-1 tracking-wide">No messages yet.</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Start the conversation below</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  const msgDate = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const prevMsgDate = prevMsg ? (prevMsg.createdAt?.toDate ? prevMsg.createdAt.toDate() : new Date(prevMsg.createdAt)) : null;
                  const showDateDivider = !prevMsgDate || !isSameDay(msgDate, prevMsgDate);

                  return (
                    <React.Fragment key={msg.id || index}>
                      {showDateDivider && (
                        <div className="flex items-center my-8 animate-fadeIn shrink-0">
                          <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                          <div className="mx-4 px-4 py-1.5 rounded-sm border border-white/5 bg-white/2 backdrop-blur-sm text-[9px] uppercase tracking-[0.2em] text-gold/60">
                            {formatDate(msgDate)}
                          </div>
                          <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                        </div>
                      )}
                      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeInUp`} style={{ animationDelay: `${(index % 10) * 50}ms` }}>
                        <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-5 py-3.5 rounded-sm ${isUser ? 'bg-gold text-dark-900 shadow-[0_4px_20px_rgba(197,160,89,0.15)]' : 'bg-white/5 border border-white/10 text-gray-200'}`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          <span className="text-[10px] text-gray-600 mt-2 px-1 uppercase tracking-wider">{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 border-t border-white/6 bg-black/20 shrink-0">
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
                    placeholder="Type your message to Dr. Li..."
                    className="block w-full bg-white/3 border border-white/10 rounded-sm py-4 px-5 text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 transition-all resize-none custom-scrollbar min-h-[56px] max-h-[160px] text-sm leading-relaxed"
                    rows="1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-14 h-14 rounded-sm bg-gold text-dark-900 flex items-center justify-center hover:bg-gold-light transition-all shadow-lg hover:shadow-gold/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Messages;
