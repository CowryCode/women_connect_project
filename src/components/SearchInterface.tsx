"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Loader2, AlertCircle } from "lucide-react";
import { OrganizationCard } from "@/components/OrganizationCard";
import { Organization } from "@/types";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  organizations?: Organization[];
}

export function SearchInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

   const { data: session } = useSession();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const adjustHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  };

  const handleSubmit = async () => {
    const query = input.trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.summary,
        organizations: data.organizations,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isEmptyState = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">GBV Connect</span>
        </div>
        <nav className="flex items-center gap-4">
          {session?.user ? (
        <a href="/admin/organizations">
              <span>{session.user.name || session.user.email}</span>
            </a>
          ) : (
            <a href="/login">Admin Login</a>
          )}

          <a
            href="/login"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Admin Login
          </a>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {isEmptyState ? (
          /* Empty state - centered welcome */
          <div className="flex flex-col items-center justify-center h-full px-4 gap-8">
            <div className="text-center max-w-2xl">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-3">
                You are not alone.
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                Tell us what you are going through and we will connect you with
                organizations that can help. Your safety and privacy matter.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
              {[
                "I need legal support after domestic violence",
                "I need a safe shelter urgently",
                "I need counseling and mental health support",
                "I need help reporting sexual assault",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors bg-white dark:bg-gray-800"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-xl bg-purple-600 text-white rounded-2xl rounded-br-sm px-5 py-3">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">G</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>

                    {/* Organization Cards Grid */}
                    {message.organizations && message.organizations.length > 0 && (
                      <div className="ml-11">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                          {message.organizations.length} organization
                          {message.organizations.length !== 1 ? "s" : ""} found
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {message.organizations.map((org) => (
                            <OrganizationCard key={org.id} organization={org} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Searching for support organizations...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-transparent focus-within:border-purple-400 dark:focus-within:border-purple-600 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Describe your situation and we'll find organizations that can help..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm leading-relaxed max-h-48"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 flex items-center justify-center transition-colors flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <SendHorizontal className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
            Your queries are confidential. We are here to help.
          </p>
        </div>
      </div>
    </div>
  );
}
