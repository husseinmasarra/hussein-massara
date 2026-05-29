import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User as UserIcon, ShieldAlert } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { User, ChatMessage, UserRole } from "../types";

interface CustomerChatProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export default function CustomerChat({ currentUser, onOpenAuth }: CustomerChatProps) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync messages with interval to show live replies
  useEffect(() => {
    if (!currentUser || !isOpen) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/chats");
        const data = await res.json();
        const activeSession = data.chats.find((c: any) => c.userId === currentUser.id);
        if (activeSession) {
          setMessages(activeSession.messages || []);
          if (activeSession.unreadUser) {
            setHasUnread(true);
          }
        }
      } catch (err) {
        console.error("Failed to parse chats sync", err);
      }
    };

    fetchMessages();
    const timer = setInterval(fetchMessages, 4000); // Poll every 4 seconds
    return () => clearInterval(timer);
  }, [currentUser, isOpen]);

  // Handle auto scrolling
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;

    try {
      const res = await fetch("/api/chats/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          username: currentUser.username,
          senderRole: UserRole.USER,
          text: text
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setText("");
      }
    } catch (err) {
      console.error("Failed sending msg", err);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          if (!currentUser) {
            onOpenAuth();
          } else {
            setIsOpen(true);
            setHasUnread(false);
          }
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-sans text-xs sm:text-sm font-bold shadow-xl hover:scale-105 transition-all cursor-pointer select-none no-print"
      >
        <MessageCircle className="w-5 h-5 animate-pulse" />
        <span>{t("chatWithAdmin")}</span>
        {hasUnread && (
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping absolute top-0 right-0 ring-2 ring-white" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[360px] h-[450px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up no-print">
      
      {/* Header element */}
      <div className="bg-blue-600 px-4 py-4 flex items-center justify-between text-white select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-sans">
              {language === "ar" ? "الدعم الفني المباشر" : "Customer Support"}
            </h4>
            <span className="text-[10px] text-blue-100 font-sans block">
              {language === "ar" ? "متصل للإجابة على استفساراتكم" : "Live - Standard replies active"}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)} 
          className="p-1 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/40">
        
        {/* Welcome guideline statement */}
        <div className="p-3 text-center rounded-2xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/30 dark:border-slate-800">
          <p className="text-3s text-slate-600 dark:text-slate-300 font-sans">
            {language === "ar" 
              ? "مرحباً بك! تواصل معنا مباشرة للسؤال عن التوصيل، الأسعار، أو الكوبونات النشطة في السوق اللبناني." 
              : "Welcome! Drop us a message here for any inquiries regarding deliverability, coupon rates, or support."}
          </p>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col max-w-[80%] ${
              msg.senderId === currentUser?.id ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            <div 
              className={`px-4 py-2.5 rounded-2xl text-xs font-sans ${
                msg.senderId === currentUser?.id 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-gray-100 dark:border-slate-750/50 rounded-tl-none shadow-sm"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[9px] text-gray-400 font-mono mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Send form interface */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900">
        <input
          type="text"
          placeholder={language === "ar" ? "اكتب رسالة هنا..." : "Write message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
