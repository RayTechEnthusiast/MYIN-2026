"use client";

import { useEffect, useState } from "react";

const messages = [
  { text: "Your Ummah.", accent: false },
  { text: "Your Future.", accent: false },
  { text: "Your Impact.", accent: true },
];

export function CyclingHeroText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, []);

  const message = messages[index];

  return (
    <h1 className="cycling-hero-title" aria-live="polite">
      <span
        key={message.text}
        className={`cycling-hero-message${message.accent ? " accent" : ""}`}
      >
        {message.text}
      </span>
    </h1>
  );
}
