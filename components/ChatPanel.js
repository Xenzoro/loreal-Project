"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { MdNorthEast } from "react-icons/md";
import { useAdvisor } from "./AdvisorProvider";

const GREETING = "👋 Hello, I am Lori, L'Oréal's AI Chatbot how can I help you today?";

function Message({ message }) {
  if (message.kind === "user") {
    return (
      <div className="chat-message user-message">
        <span className="bold-label">You:</span> {message.text}
      </div>
    );
  }
  if (message.kind === "assistant") {
    return (
      <div className="chat-message assistant-message-box">
        <span className="bold-label">Lori:</span> {message.text}
      </div>
    );
  }
  // Rate limit (SYSTEM: ...) and error messages have no label, like before.
  return <div className="chat-message assistant-message-box">{message.text}</div>;
}

// Skeleton bubble shown while Lori is answering. The dots and the shimmer are
// CSS animations of opacity and transform only (see globals.css), so there's
// no JavaScript timer and no layout work per frame.
function ThinkingBubble() {
  return (
    <div className="chat-message assistant-message-box thinking-bubble">
      <span className="bold-label">Lori:</span> Thinking
      <span className="thinking-dots" aria-hidden="true">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  );
}

export default function ChatPanel() {
  const { messages, sending, sendMessage } = useAdvisor();
  const [input, setInput] = useState("");
  const windowRef = useRef(null);

  // Keep the newest message in view. Runs once per new message, not on scroll.
  useEffect(() => {
    const el = windowRef.current;
    if (el && messages.length) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  function handleSubmit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    sendMessage(text);
  }

  return (
    <>
      <div id="chatWindow" className="chat-window" aria-live="polite" ref={windowRef}>
        {GREETING}
        {/* The old script joined messages with "\n" inside a white-space: pre-line
            window, which adds a blank line between bubbles on desktop. Kept for an
            identical look. */}
        {messages.map((message, i) => (
          <Fragment key={i}>
            {"\n"}
            <Message message={message} />
          </Fragment>
        ))}
        {sending && (
          <>
            {"\n"}
            <ThinkingBubble />
          </>
        )}
      </div>

      <form id="chatForm" className="chat-form" onSubmit={handleSubmit}>
        <label htmlFor="userInput" className="visually-hidden">
          Message
        </label>
        <input
          id="userInput"
          name="userInput"
          type="text"
          placeholder="Ask about ingredients, routines, shades, or product types"
          autoComplete="off"
          required
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button type="submit" id="sendBtn" aria-label="Send message" disabled={sending}>
          <MdNorthEast className="icon" aria-hidden="true" />
        </button>
      </form>
    </>
  );
}
