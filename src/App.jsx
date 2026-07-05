import { useState, useEffect, useRef } from "react";
import FlipUnit from "./FlipUnit";
import TimeSetup from "./TimeSetup";

/*
  App Component (Root)
  --------------------
  This is the top-level component. It manages:
  1. The countdown timer (total seconds remaining)
  2. Whether the clock is running or paused
  3. Whether we're in "setup" mode or "countdown" mode
  4. The interval that ticks every second

  React Data Flow (important concept!):
  - State lives HERE in App
  - State is passed DOWN to children as props
  - Children communicate UP via callback functions (like onStart)
  This is called "lifting state up" — a core React pattern.
*/

export default function App() {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning,    setIsRunning]    = useState(false);
  const [phase,        setPhase]        = useState("setup");

  const intervalRef     = useRef(null);
  const initialSeconds  = useRef(0);

  /*
    THE FIX — deadline-based timer instead of counting ticks.

    OLD (broken) approach:
      Every second: remaining = remaining - 1
      Problem: if the browser skips/delays ticks in background, seconds are lost.

    NEW (correct) approach:
      When timer starts, record: endTime = Date.now() + (remainingSeconds * 1000)
      Every tick: remaining = Math.round((endTime - Date.now()) / 1000)
      Now it doesn't matter if ticks are delayed — we always read the real clock.

    For pause support we also store how many seconds were left when paused,
    and recalculate endTime from that when resumed.
  */
  const endTimeRef        = useRef(0);   // absolute timestamp when countdown ends (ms)
  const pausedSecondsRef  = useRef(0);   // seconds remaining at the moment of pause

  useEffect(() => {
    clearInterval(intervalRef.current);

    if (isRunning && phase === "countdown") {
      intervalRef.current = setInterval(() => {
        const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          setTotalSeconds(0);
          setIsRunning(false);
          setPhase("done");
        } else {
          setTotalSeconds(remaining);
        }
      }, 500);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, phase]);

  // When user switches back to this tab, immediately snap display to correct time.
  // Browsers throttle setInterval in background tabs — this fixes any visual lag.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && isRunning && phase === "countdown") {
        const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
        if (remaining <= 0) {
          setTotalSeconds(0);
          setIsRunning(false);
          setPhase("done");
        } else {
          setTotalSeconds(remaining);
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRunning, phase]);

  function handleStart(seconds) {
    initialSeconds.current = seconds;
    endTimeRef.current     = Date.now() + seconds * 1000;  // set the deadline
    setTotalSeconds(seconds);
    setPhase("countdown");
    setIsRunning(true);
  }

  function handleToggle() {
    if (isRunning) {
      // PAUSING: save how many seconds are left right now
      pausedSecondsRef.current = Math.round((endTimeRef.current - Date.now()) / 1000);
      setIsRunning(false);
    } else {
      // RESUMING: recalculate endTime from paused seconds remaining
      endTimeRef.current = Date.now() + pausedSecondsRef.current * 1000;
      setIsRunning(true);
    }
  }

  function handleReset() {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTotalSeconds(0);
    setPhase("setup");
  }

  function handleRestart() {
    endTimeRef.current = Date.now() + initialSeconds.current * 1000;
    setTotalSeconds(initialSeconds.current);
    setPhase("countdown");
    setIsRunning(true);
  }

  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    /*
      The root div covers the entire viewport.
      All styles are inline JS objects.
    */
    <div style={styles.root}>

      {/* Google Font loaded via a style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }

        /* Flip animation keyframe — referenced by FlipDigit component */
        @keyframes flipDown {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-90deg); }
        }

        /* Remove number input spinner arrows (Chrome/Safari) */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
        }
      `}</style>

      {/* ── SETUP PHASE ──────────────────────────────── */}
      {phase === "setup" && (
        <TimeSetup onStart={handleStart} />
      )}

      {/* ── COUNTDOWN PHASE ──────────────────────────── */}
      {phase === "countdown" && (
        <div style={styles.clockScreen}>

          {/* Three FlipUnits: HH  MM  SS */}
          <div style={styles.clockRow}>

            <FlipUnit value={hours}   label="HOURS"   />

            {/* Colon separator */}
            <div style={styles.colonWrap}>
              <span style={styles.colon}>:</span>
            </div>

            <FlipUnit value={minutes} label="MINUTES" />

            <div style={styles.colonWrap}>
              <span style={styles.colon}>:</span>
            </div>

            <FlipUnit value={seconds} label="SECONDS" />

          </div>

          {/* Controls */}
          <div style={styles.controls}>
            <button style={styles.btnSecondary} onClick={handleReset}>
              RESET
            </button>
            <button style={styles.btnPrimary} onClick={handleToggle}>
              {/* Ternary operator: condition ? valueIfTrue : valueIfFalse */}
              {isRunning ? "PAUSE" : "RESUME"}
            </button>
          </div>

        </div>
      )}

      {/* ── DONE PHASE ───────────────────────────────── */}
      {phase === "done" && (
        <div style={styles.doneScreen}>
          <p style={styles.doneText}>TIME&apos;S UP</p>
          <div style={styles.controls}>
            <button style={styles.btnSecondary} onClick={handleReset}>
              NEW TIMER
            </button>
            <button style={styles.btnPrimary} onClick={handleRestart}>
              RESTART
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  clockScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 48,
  },

  clockRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  colonWrap: {
    // Push colon up to align with the digit cards
    marginTop: -30,
  },

  colon: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 80,
    color: "#333",
    userSelect: "none",
  },

  controls: {
    display: "flex",
    gap: 16,
  },

  btnPrimary: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 18,
    letterSpacing: 4,
    padding: "12px 48px",
    backgroundColor: "#fff",
    color: "#000",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },

  btnSecondary: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 18,
    letterSpacing: 4,
    padding: "12px 32px",
    backgroundColor: "transparent",
    color: "#555",
    border: "1px solid #333",
    borderRadius: 6,
    cursor: "pointer",
  },

  doneScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 48,
  },

  doneText: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 96,
    letterSpacing: 20,
    color: "#fff",
  },
};