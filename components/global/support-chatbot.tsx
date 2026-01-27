"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  ChevronRight,
  HelpCircle,
  CreditCard,
  AlertCircle,
  Mail,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { onSendSupportMessage } from "@/app/(main)/_actions/send-support-message";
import { toast } from "sonner";
import { useBilling } from "@/providers/billing-provider";
import { getUserInfo } from "@/app/(main)/_actions/user-info";

type Message = {
  id: string;
  text: string;
  sender: "bot" | "user";
  options?: { label: string; value: string; icon?: React.ReactNode }[];
  isForm?: boolean;
};

const INITIAL_MESSAGE: Message = {
  id: "1",
  text: "Result? I'm your support assistant. How can I help you today?",
  sender: "bot",
  options: [
    {
      label: "Issue in app",
      value: "issue",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    {
      label: "Billing / Payment",
      value: "billing",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      label: "Feature Request",
      value: "feature",
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      label: "Something else",
      value: "other",
      icon: <MessageCircle className="w-4 h-4" />,
    },
  ],
};

const SupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasUnread, setHasUnread] = useState(true);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    // Pre-fill email if user is logged in
    const fetchUser = async () => {
      const user = await getUserInfo();
      if (user?.email) setEmail(user.email);
    };
    fetchUser();
  }, []);

  const handleOptionClick = (value: string, label: string) => {
    // Add user selection
    const userMsg: Message = {
      id: Date.now().toString(),
      text: label,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setSelectedTopic(value);

    // Bot response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `I can verify help with ${label.toLowerCase()}. Please describe your issue in detail below, and I'll forward it to our team immediately.`,
        sender: "bot",
        isForm: true,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !email.trim()) return;

    setIsSending(true);

    try {
      // Simulate optimistic update
      const userMsg: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: "user",
      };
      setMessages((prev) => [...prev, userMsg]);

      const result = await onSendSupportMessage(
        email,
        messageText,
        selectedTopic || "General",
      );

      if (result.success) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text:
                "Thanks! We've received your message and will get back to you at " +
                email +
                " shortly.",
              sender: "bot",
            },
          ]);
          setMessageText("");
        }, 1000);
        toast.success("Message sent successfully");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setHasUnread(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[350px] sm:w-[380px] h-[500px] bg-background border border-border rounded-xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 border-2 border-white/20">
                  <AvatarImage src="/bot-avatar.png" />
                  <AvatarFallback className="bg-white/10 text-black text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-primary-foreground text-sm">
                    Support Assistant
                  </h3>
                  <p className="text-xs text-primary-foreground/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-gray-500 w-8 h-8"
                  onClick={() => {
                    setMessages([INITIAL_MESSAGE]);
                    setSelectedTopic(null);
                    setMessageText("");
                    // Keep email if previously fetched
                  }}
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-red-500 w-8 h-8"
                  onClick={toggleChat}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-background border border-border shadow-sm rounded-tl-none"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Bot Options */}
                    {msg.options && (
                      <div className="mt-3 space-y-2">
                        {msg.options.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleOptionClick(option.value, option.label)
                            }
                            className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-xs font-medium flex items-center gap-2 border border-transparent hover:border-primary/20"
                          >
                            <span className="p-1 rounded bg-background text-primary shrink-0">
                              {option.icon}
                            </span>
                            {option.label}
                            <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {messages.length > 0 && messages[messages.length - 1].isForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-background border border-border rounded-xl p-4 shadow-sm"
                >
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground ml-1">
                        Your Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="pl-9 bg-muted/30 text-xs h-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground ml-1">
                        Message
                      </label>
                      <Textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="bg-muted/30 min-h-[80px] text-xs resize-none"
                        required
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-8 text-xs font-medium"
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />{" "}
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send className="w-3 h-3 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="p-2 border-t text-center">
              <p className="text-[10px] text-muted-foreground">
                Powered by Automify Support
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="pointer-events-auto w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center relative hover:bg-primary/90 transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread Indicator */}
        {!isOpen && hasUnread && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-bounce" />
        )}
      </motion.button>
    </div>
  );
};

export default SupportChatbot;
