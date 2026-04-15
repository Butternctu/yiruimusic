import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Messages = () => {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Check if chat document exists and set unreadByUser to false
    const chatDocRef = doc(db, 'chats', user.uid);
    setDoc(chatDocRef, {
      userId: user.uid,
      userName: userProfile?.displayName || user.displayName || 'Member',
      userEmail: user.email,
      unreadByUser: false
    }, { merge: true });

    const messagesRef = collection(db, `chats/${user.uid}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data({ serverTimestamps: 'estimate' })
      }));
      setMessages(msgs);
      setLoading(false);
      
      // Clear unread flag if new messages arrive while open
      updateDoc(chatDocRef, { unreadByUser: false });
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const messagesRef = collection(db, `chats/${user.uid}/messages`);
      await addDoc(messagesRef, {
        text: messageText,
        sender: 'user',
        createdAt: serverTimestamp()
      });

      const chatDocRef = doc(db, 'chats', user.uid);
      await setDoc(chatDocRef, {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
        unreadByAdmin: true,
        userId: user.uid,
        userName: userProfile?.displayName || user.displayName || 'Member',
        userEmail: user.email
      }, { merge: true });

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <SEO title="Messages | Dr. Yirui Li" url="/messages" />
      <section className="min-h-screen bg-dark-900 pt-32 pb-12 px-6 relative overflow-hidden flex flex-col">
        {/* Ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col z-10">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6 animate-fadeInUp">
            <Link to="/dashboard" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-gold/30 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl text-white tracking-wide">Message Teacher</h1>
              <p className="text-gray-500 text-xs tracking-wider uppercase mt-1">Direct Communication with Dr. Li</p>
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex-1 glass-card rounded-sm border border-white/10 flex flex-col overflow-hidden animate-fadeInUp shadow-2xl relative" style={{ animationDelay: '100ms', maxHeight: 'calc(100vh - 250px)' }}>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar flex flex-col">
              {loading ? (
                <div className="flex-1 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center opacity-50">
                  <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mb-4">
                     <span className="text-gold font-serif text-xl">Li</span>
                  </div>
                  <p className="text-white mb-2">No messages yet.</p>
                  <p className="text-sm text-gray-400">Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id || index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                         <div className={`px-5 py-3 rounded-2xl ${isUser ? 'bg-gold text-dark-900 rounded-br-sm' : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm'}`}>
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
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
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
                  placeholder="Type your message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors resize-none custom-scrollbar min-h-[50px] max-h-[150px]"
                  rows="1"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-[50px] h-[50px] rounded-xl bg-gold text-dark-900 flex items-center justify-center hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-5 h-5 -ml-1" />
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
