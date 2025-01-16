import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ChatBox = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "CodeFlow AI knows everything about your repo. Try me.", sender: "bot" }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { id: Date.now(), text: newMessage, sender: "user" }]);
      setNewMessage("");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-white border-[#7d6add] border-2 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <MessageSquare className="h-5 w-5" />
        <span>Talk to your repo</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800">
          <DialogHeader className="border-b border-zinc-800 pb-4">
            <DialogTitle className="text-zinc-100">Talk to your repo</DialogTitle>
          </DialogHeader>
          
          <div className="h-[400px] flex flex-col bg-zinc-950">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'bg-zinc-900 text-zinc-100'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 bg-zinc-950">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask something..."
                  className="flex-1 bg-zinc-900 text-zinc-100 rounded-lg px-4 py-2 focus:outline-none border border-zinc-800 placeholder-zinc-500"
                />
                <button
                  type="submit"
                  className="bg-[#7d6add] text-zinc-100 p-2 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatBox;