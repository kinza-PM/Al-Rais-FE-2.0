import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const STATIC_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! 👋 Welcome to Al-Rais Travel. I'm your AI travel assistant. I can help you with:\n\n✈️ Flight bookings\n🏨 Hotel reservations\n🚗 Airport transfers & car rentals\n\nHow can I assist you today?",
    timestamp: "12:00 PM",
  },
  {
    id: "2",
    role: "user",
    content: "I need a flight from Dubai to London on March 15",
    timestamp: "12:01 PM",
  },
  {
    id: "3",
    role: "assistant",
    content:
      "I found 3 flights from Dubai (DXB) to London (LHR) on March 15:\n\n1. Emirates EK007 — 08:00 → 12:30 — AED 1,650\n2. British Airways BA108 — 14:00 → 18:45 — AED 1,395\n3. flydubai FZ001 — 22:00 → 02:30+1 — AED 1,065\n\nWould you like to book any of these, or see fare rules?",
    timestamp: "12:01 PM",
  },
  {
    id: "4",
    role: "user",
    content: "Book the Emirates one please",
    timestamp: "12:02 PM",
  },
  {
    id: "5",
    role: "assistant",
    content:
      "Great choice! ✈️ To book Emirates EK007 on March 15, I'll need the following details:\n\n• Passenger full name (as on passport)\n• Date of birth\n• Passport number & expiry\n• Contact email\n\nPlease share these and I'll proceed with the booking.",
    timestamp: "12:02 PM",
  },
];

const QUICK_ACTIONS = [
  { label: "✈️ Search Flights", value: "Search flights" },
  { label: "🏨 Find Hotels", value: "Find hotels" },
  { label: "🚗 Book Transfer", value: "Book airport transfer" },
  { label: "📋 My Bookings", value: "Check my bookings" },
];

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-[9990] flex h-14 w-14 items-center justify-center rounded-full bg-[#2351A3] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#1b4181] hover:shadow-xl active:scale-95 cursor-pointer sm:bottom-6 sm:right-6"
          aria-label="Open chat assistant"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {/* Notification dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F59E0B] opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-[#F59E0B]" />
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed z-[9990] flex flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[600px] sm:w-[380px] sm:rounded-2xl sm:border sm:border-[#e4e4e7] md:bottom-6 md:right-6 md:w-[400px]"
          style={{ maxHeight: "100dvh" }}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between bg-[#2351A3] px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white leading-tight">
                  Al-Rais Travel Assistant
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-[#4ADE80]" />
                  <span className="text-[11px] text-white/80">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
                aria-label="Minimize chat"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
                aria-label="Close chat"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 space-y-4 bg-[#f8fafc] sm:px-4">
            {STATIC_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed sm:px-4 sm:py-3 ${
                    msg.role === "user"
                      ? "bg-[#2351A3] text-white rounded-br-md"
                      : "bg-white text-[#1f2a37] border border-[#e8ecf1] rounded-bl-md shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <p
                    className={`mt-1.5 text-[10px] text-right ${
                      msg.role === "user" ? "text-white/60" : "text-[#9ca3af]"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="shrink-0 flex flex-wrap gap-2 px-3 py-2 border-t border-[#f0f0f0] bg-white sm:px-4 sm:py-2.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.value}
                onClick={() => setInputValue(action.value)}
                className="rounded-full border border-[#d1d9e6] bg-white px-3 py-1.5 text-[11px] font-medium text-[#2351A3] transition-all hover:bg-[#f0f5ff] hover:border-[#2351A3] cursor-pointer sm:text-[12px]"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="shrink-0 flex items-center gap-2 border-t border-[#e8ecf1] bg-white px-3 py-2.5 sm:px-4 sm:py-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-w-0 rounded-xl border border-[#d1d9e6] bg-[#f8fafc] px-3 py-2.5 text-[13px] text-[#1f2a37] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[#2351A3] focus:bg-white sm:px-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  // Static — no send logic yet
                }
              }}
            />
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2351A3] text-white transition-all hover:bg-[#1b4181] active:scale-95 disabled:opacity-50 cursor-pointer"
              disabled={!inputValue.trim()}
              aria-label="Send message"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
