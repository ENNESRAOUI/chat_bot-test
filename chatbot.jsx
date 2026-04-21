import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are a helpful, concise, and friendly AI assistant. 
Answer clearly and precisely. If you don't know something, say so honestly.`;

function TypingIndicator() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "12px 16px",
      background: "#1a1a2e",
      border: "1px solid #2a2a4a",
      borderRadius: "18px 18px 18px 4px",
      width: "fit-content", maxWidth: 80
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#7c6ef7",
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`
        }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16,
      animation: "fadeUp 0.3s ease-out"
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, #7c6ef7, #a78bfa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, color: "#fff",
          marginRight: 10, flexShrink: 0, marginTop: 4,
          boxShadow: "0 0 0 2px #2a2a4a"
        }}>A</div>
      )}
      <div style={{
        maxWidth: "72%",
        padding: "12px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser
          ? "linear-gradient(135deg, #7c6ef7, #5b4ed4)"
          : "#1a1a2e",
        border: isUser ? "none" : "1px solid #2a2a4a",
        color: "#e8e8f0",
        fontSize: 15,
        lineHeight: 1.65,
        letterSpacing: "0.01em",
        fontFamily: "'Georgia', serif",
        boxShadow: isUser ? "0 4px 16px rgba(124,110,247,0.25)" : "none",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word"
      }}>
        {msg.content}
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#2a2a4a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#9090b0",
          marginLeft: 10, flexShrink: 0, marginTop: 4,
          border: "1px solid #3a3a5a"
        }}>U</div>
      )}
    </div>
  );
}

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "No response.";

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setError("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
    inputRef.current?.focus();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          background: #0d0d1a;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Crimson Pro', Georgia, serif;
        }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .chat-container {
          width: 100%;
          max-width: 720px;
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0f0f1e;
          position: relative;
          overflow: hidden;
        }

        .bg-glow {
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(124,110,247,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 28px 16px;
          border-bottom: 1px solid #1e1e38;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #7c6ef7 0%, #5b4ed4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: white;
          font-family: 'DM Mono', monospace;
          letter-spacing: -1px;
          box-shadow: 0 4px 16px rgba(124,110,247,0.3);
        }

        .header-title {
          font-size: 20px;
          font-weight: 600;
          color: #e8e8f0;
          letter-spacing: -0.02em;
        }

        .header-sub {
          font-size: 12px;
          color: #6060a0;
          font-family: 'DM Mono', monospace;
          margin-top: 1px;
        }

        .status-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22c55e;
          display: inline-block;
          margin-right: 5px;
          animation: pulse 2s infinite;
        }

        .clear-btn {
          background: transparent;
          border: 1px solid #2a2a4a;
          color: #6060a0;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.05em;
          transition: all 0.2s;
        }
        .clear-btn:hover {
          border-color: #7c6ef7;
          color: #a89af7;
          background: rgba(124,110,247,0.06);
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px 28px;
          position: relative;
          z-index: 1;
          scrollbar-width: thin;
          scrollbar-color: #2a2a4a transparent;
        }

        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 4px; }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
          opacity: 0.5;
        }

        .empty-icon {
          font-size: 48px;
          opacity: 0.3;
        }

        .empty-text {
          font-size: 20px;
          color: #6060a0;
          font-style: italic;
        }

        .empty-hint {
          font-size: 13px;
          color: #40406a;
          font-family: 'DM Mono', monospace;
          text-align: center;
          line-height: 1.6;
        }

        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 8px;
        }

        .suggestion-chip {
          padding: 6px 14px;
          background: #1a1a2e;
          border: 1px solid #2a2a4a;
          border-radius: 20px;
          font-size: 13px;
          color: #9090c0;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          transition: all 0.2s;
        }
        .suggestion-chip:hover {
          border-color: #7c6ef7;
          color: #a89af7;
          background: rgba(124,110,247,0.08);
        }

        .error-banner {
          margin: 0 28px 12px;
          padding: 10px 16px;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 10px;
          color: #f87171;
          font-size: 14px;
          font-family: 'DM Mono', monospace;
        }

        .input-area {
          padding: 16px 28px 24px;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          background: #14142a;
          border: 1px solid #2a2a4a;
          border-radius: 16px;
          padding: 10px 10px 10px 18px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-wrapper:focus-within {
          border-color: #7c6ef7;
          box-shadow: 0 0 0 3px rgba(124,110,247,0.15);
        }

        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #e0e0f0;
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 16px;
          line-height: 1.6;
          resize: none;
          max-height: 120px;
          min-height: 24px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .chat-input::placeholder { color: #40406a; font-style: italic; }
        .chat-input::-webkit-scrollbar { display: none; }

        .send-btn {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #7c6ef7, #5b4ed4);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
          box-shadow: 0 2px 10px rgba(124,110,247,0.3);
        }
        .send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 16px rgba(124,110,247,0.4); }
        .send-btn:active:not(:disabled) { transform: scale(0.97); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .footer-hint {
          text-align: center;
          margin-top: 10px;
          font-size: 11px;
          color: #30305a;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="chat-container">
        <div className="bg-glow" />

        {/* Header */}
        <div className="header">
          <div className="header-left">
            <div className="logo">AI</div>
            <div>
              <div className="header-title">Assistant IA</div>
              <div className="header-sub">
                <span className="status-dot" />
                en ligne · claude-sonnet-4
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat}>
              effacer
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div style={{fontSize: 52, opacity: 0.2}}>✦</div>
              <div className="empty-text">Comment puis-je vous aider ?</div>
              <div className="empty-hint">
                Posez une question, demandez une explication,<br/>
                ou lancez une conversation.
              </div>
              <div className="suggestions">
                {["Explique le machine learning", "Écris un poème", "Aide-moi à coder"].map(s => (
                  <button key={s} className="suggestion-chip"
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => <Message key={i} msg={m} />)
          )}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #7c6ef7, #a78bfa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#fff",
                marginRight: 10, flexShrink: 0, marginTop: 4,
                boxShadow: "0 0 0 2px #2a2a4a"
              }}>A</div>
              <TypingIndicator />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && <div className="error-banner">{error}</div>}

        {/* Input */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Écrivez votre message…"
              value={input}
              rows={1}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKey}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              title="Envoyer (Entrée)"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 8L2 2l3 6-3 6 12-6z" fill="white" />
              </svg>
            </button>
          </div>
          <div className="footer-hint">Entrée pour envoyer · Maj+Entrée pour nouvelle ligne</div>
        </div>
      </div>
    </>
  );
}
