import { useState, useRef, useEffect, useMemo } from "react";
import { Bot, X, Send, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { usePriceForecast, useItemLookup } from "@/hooks/usePriceCatcher";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const MAX_MESSAGE_LENGTH = 500;

const QUICK_PROMPTS = [
  "When should I buy chicken?",
  "What items are getting cheaper?",
  "Best time to stock up on rice?",
  "Tips to save on groceries this month",
];

export function AIChatAdvisor() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: forecast } = usePriceForecast();
  const { data: items } = useItemLookup();

  const context = useMemo(() => {
    if (!forecast || !items) return "";
    const itemMap = new Map(items.map((i) => [String(i.c), i.n]));
    const lines: string[] = [];
    const codes = Object.keys(forecast).slice(0, 30);
    for (const code of codes) {
      const f = forecast[code];
      const name = itemMap.get(code) || code;
      lines.push(`${name}: RM${f.last_price.toFixed(2)}, trend=${f.trend}, forecast_end=RM${f.forecast[f.forecast.length - 1]?.price.toFixed(2)}`);
    }
    return lines.join("\n");
  }, [forecast, items]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (text.trim().length > MAX_MESSAGE_LENGTH) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Please keep messages under ${MAX_MESSAGE_LENGTH} characters.` },
      ]);
      return;
    }

    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const { data: resp, error } = await supabase.functions.invoke("chat", {
        body: { messages: allMessages, context },
      });

      if (error || !(resp instanceof Response) || !resp.body) {
        const err = error
          ? { error: error.message }
          : await (resp as Response | null)?.json?.().catch(() => ({ error: "Failed to connect" })) ?? { error: "Failed to connect" };
        setMessages((prev) => [...prev, { role: "assistant", content: err.error || "Something went wrong. Please try again." }]);
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const current = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: current } : m));
                }
                return [...prev, { role: "assistant", content: current }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center glow-primary"
        aria-label="AI Chat Advisor"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] glass-card rounded-2xl border border-border shadow-2xl flex flex-col animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-sm">HargaRakyat AI</h3>
              <p className="text-xs text-muted-foreground">Smart grocery advisor</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Close chat advisor">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <Bot className="w-10 h-10 mx-auto mb-2 text-primary opacity-60" />
                  <p className="text-sm text-muted-foreground">Ask me anything about grocery prices in Malaysia</p>
                </div>
                <div className="space-y-2">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="w-full min-h-11 text-left px-3 py-2 text-sm rounded-lg border border-border/50 hover:bg-secondary/80 hover:border-primary/30 transition-all"
                    >
                      <MessageSquare className="w-3 h-3 inline mr-2 text-primary" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/80 border border-border/50"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-1 [&_p]:mt-0 [&_ul]:my-1 [&_li]:my-0">
                      <ReactMarkdown
                        skipHtml
                        allowedElements={["p", "strong", "em", "ul", "ol", "li", "code", "a", "br"]}
                        components={{
                          a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-secondary/80 border border-border/50 rounded-xl px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about prices..."
                maxLength={MAX_MESSAGE_LENGTH}
                aria-label="Ask AI advisor about prices"
                className="flex-1 bg-secondary/80 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isLoading}
              />
              <Button type="submit" size="sm" disabled={isLoading || !input.trim()} className="px-3">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
