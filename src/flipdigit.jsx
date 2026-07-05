import { useEffect, useRef } from "react";

/*
  FlipDigit — DOM-direct approach
  --------------------------------
  Instead of React state driving the animation (which StrictMode double-fires),
  we use useRef to grab the actual DOM elements and manipulate them directly.
  This is the most reliable way to do frame-precise CSS animations in React.

  SEQUENCE:
  1. topStatic  shows NEW digit immediately (covered by topFlap)
  2. botStatic  shows OLD digit (covered by botFlap the whole time)
  3. topFlap    shows OLD digit, falls 0→90deg (disappears)
  4. botFlap    shows NEW digit, unfolds -90→0deg after topFlap gone (delayed)
  5. After animation: botStatic switches to NEW digit silently under botFlap
*/

const CARD_W = 170;
const CARD_H = 210;
const FONT   = 195;

export default function FlipDigit({ digit }) {
  const topStaticRef = useRef(null);
  const botStaticRef = useRef(null);
  const topFlapRef   = useRef(null);
  const botFlapRef   = useRef(null);

  const prevDigit = useRef(digit);
  const timerRef  = useRef(null);
  const rafRef    = useRef(null);

  // Set text of a DOM span inside a panel ref
  function setText(panelRef, value) {
    if (panelRef.current) {
      const span = panelRef.current.querySelector("span");
      if (span) span.textContent = value;
    }
  }

  // Set a CSS property directly on a DOM element
  function setStyle(panelRef, prop, value) {
    if (panelRef.current) panelRef.current.style[prop] = value;
  }

  useEffect(() => {
    // On first mount, set all panels to the initial digit
    setText(topStaticRef, digit);
    setText(botStaticRef, digit);
    setText(topFlapRef,   digit);
    setText(botFlapRef,   digit);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (digit === prevDigit.current) return;

    const old = prevDigit.current;
    prevDigit.current = digit;

    // Cancel any in-progress animation
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);

    // ── RESET flaps instantly (no transition) ──
    setStyle(topFlapRef, "transition", "none");
    setStyle(botFlapRef, "transition", "none");
    setStyle(topFlapRef, "transform", "rotateX(0deg)");
    setStyle(botFlapRef, "transform", "rotateX(-90deg)");

    // ── SET DIGITS ──
    setText(topStaticRef, digit); // top static: NEW (hidden under topFlap)
    setText(botStaticRef, old);   // bot static: OLD (hidden under botFlap)
    setText(topFlapRef,   old);   // topFlap: OLD — will fall away
    setText(botFlapRef,   digit); // botFlap: NEW — will unfold

    // Wait one frame for the reset to paint, then start animation
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {

        // topFlap falls: 0deg → 90deg
        setStyle(topFlapRef, "transition", "transform 0.28s ease-in");
        setStyle(topFlapRef, "transform",  "rotateX(90deg)");

        // botFlap unfolds after topFlap is gone: -90deg → 0deg (delayed)
        setStyle(botFlapRef, "transition", "transform 0.28s ease-out 0.28s");
        setStyle(botFlapRef, "transform",  "rotateX(0deg)");

        // After full animation, silently swap botStatic to new digit
        // botFlap is flat on top so the swap is invisible
        timerRef.current = setTimeout(() => {
          setText(botStaticRef, digit);
          // Reset botFlap back to hidden position (no transition)
          setStyle(botFlapRef, "transition", "none");
          setStyle(botFlapRef, "transform",  "rotateX(-90deg)");
          // Reset topFlap back to flat (no transition) 
          setStyle(topFlapRef, "transition", "none");
          setStyle(topFlapRef, "transform",  "rotateX(0deg)");
          setText(topFlapRef, digit);
          setText(botFlapRef, digit);
        }, 620);

      });
    });

    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [digit]);

  const half = (isBottom) => ({
    position: "absolute",
    width: "100%",
    height: CARD_H,
    top: isBottom ? -CARD_H / 2 : 0,
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const spanStyle = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: FONT,
    lineHeight: 1,
    color: "#fff",
    userSelect: "none",
  };

  const panel = {
    position: "absolute",
    left: 0,
    width: "100%",
    height: CARD_H / 2,
    overflow: "hidden",
  };

  return (
    <div style={{
      position: "relative",
      width: CARD_W,
      height: CARD_H,
      borderRadius: 8,
      perspective: "600px",
    }}>

      {/* z:1 Static top — NEW digit */}
      <div ref={topStaticRef} style={{ ...panel, top: 0, zIndex: 1, backgroundColor: "#1a1a1a", borderRadius: "8px 8px 0 0" }}>
        <div style={half(false)}><span style={spanStyle}>{digit}</span></div>
      </div>

      {/* z:2 Static bottom — OLD digit (never changes during animation) */}
      <div ref={botStaticRef} style={{ ...panel, bottom: 0, zIndex: 2, backgroundColor: "#141414", borderRadius: "0 0 8px 8px" }}>
        <div style={half(true)}><span style={spanStyle}>{digit}</span></div>
      </div>

      {/* z:3 Bottom flap — NEW digit, starts folded up (edge-on) */}
      <div ref={botFlapRef} style={{
        ...panel,
        bottom: 0,
        zIndex: 3,
        backgroundColor: "#141414",
        borderRadius: "0 0 8px 8px",
        transformOrigin: "top center",
        transform: "rotateX(-90deg)",
      }}>
        <div style={half(true)}><span style={spanStyle}>{digit}</span></div>
      </div>

      {/* z:4 Top flap — OLD digit, starts flat, falls first */}
      <div ref={topFlapRef} style={{
        ...panel,
        top: 0,
        zIndex: 4,
        backgroundColor: "#1a1a1a",
        borderRadius: "8px 8px 0 0",
        transformOrigin: "bottom center",
        transform: "rotateX(0deg)",
      }}>
        <div style={half(false)}><span style={spanStyle}>{digit}</span></div>
      </div>

      {/* Hinge line */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: 0,
        width: "100%",
        height: 3,
        backgroundColor: "#000",
        transform: "translateY(-1px)",
        zIndex: 10,
        pointerEvents: "none",
      }} />
    </div>
  );
}