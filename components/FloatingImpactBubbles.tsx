"use client";

const updates = [
  "Abdullah matched with a software internship at Crescent Labs.",
  "Youth volunteers supported 50 clinic patients at Rahma Health.",
  "Amina completed 12 verified service hours this week.",
  "Yusuf connected with a civil-engineering mentor.",
];

export function FloatingImpactBubbles() {
  return (
    <div className="impact-bubbles" aria-hidden="true">
      {updates.map((update, index) => (
        <div
          key={update}
          className={`impact-bubble impact-bubble-${index + 1}`}
        >
          <span className="impact-dot" />
          {update}
        </div>
      ))}
    </div>
  );
}
