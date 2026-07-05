import { useState } from "react";

/*
  TimeSetup Component
  -------------------
  A form that lets the user input hours, minutes, seconds
  before starting the countdown.

  Props:
  - onStart : function(totalSeconds) → called when user clicks START
              parent receives total seconds as a number
*/

export default function TimeSetup({ onStart }) {
  /*
    useState(initialValue) returns [currentValue, setterFunction]
    When you call the setter, React re-renders the component with the new value.
  */
  const [hours,   setHours]   = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Called when user clicks START
  function handleStart() {
    // Convert everything to total seconds
    const total = hours * 3600 + minutes * 60 + seconds;

    // Don't start if time is zero
    if (total === 0) return;

    // Tell the parent component to begin the countdown
    onStart(total);
  }

  /*
    handleChange: a reusable input handler
    - e       : the DOM event from the input
    - setter  : which state setter to call (setHours, setMinutes, setSeconds)
    - max     : maximum allowed value (23 for hours, 59 for minutes/seconds)
  */
  function handleChange(e, setter, max) {
    // parseInt converts string to integer (inputs always give strings)
    // "|| 0" handles the case where the field is cleared (would be NaN)
    let val = parseInt(e.target.value) || 0;

    // Clamp: keep value between 0 and max
    val = Math.max(0, Math.min(max, val));

    setter(val);
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>SET COUNTDOWN</h2>

      <div style={styles.inputs}>

        {/* Hours Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>HH</label>
          <input
            type="number"
            min="0"
            max="99"
            value={hours}
            onChange={(e) => handleChange(e, setHours, 99)}
            style={styles.input}
          />
        </div>

        <span style={styles.colon}>:</span>

        {/* Minutes Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>MM</label>
          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => handleChange(e, setMinutes, 59)}
            style={styles.input}
          />
        </div>

        <span style={styles.colon}>:</span>

        {/* Seconds Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>SS</label>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => handleChange(e, setSeconds, 59)}
            style={styles.input}
          />
        </div>

      </div>

      {/* Quick presets — common countdown durations */}
      <div style={styles.presets}>
        {[
          { label: "5 MIN",  s: 300 },
          { label: "10 MIN", s: 600 },
          { label: "30 MIN", s: 1800 },
          { label: "1 HR",   s: 3600 },
        ].map((p) => (
          <button
            key={p.label}
            style={styles.presetBtn}
            onClick={() => onStart(p.s)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <button style={styles.startBtn} onClick={handleStart}>
        START
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 32,
  },

  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    letterSpacing: 8,
    color: "#444",
    margin: 0,
    fontWeight: 400,
  },

  inputs: {
    display: "flex",
    alignItems: "flex-end",
    gap: 12,
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },

  label: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 13,
    letterSpacing: 4,
    color: "#555",
  },

  input: {
    width: 90,
    height: 80,
    textAlign: "center",
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 48,
    backgroundColor: "#111",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: 8,
    outline: "none",
    // Remove spinner arrows from number input
    MozAppearance: "textfield",
  },

  colon: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 48,
    color: "#333",
    paddingBottom: 8,
  },

  presets: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  presetBtn: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 14,
    letterSpacing: 2,
    padding: "8px 18px",
    backgroundColor: "transparent",
    color: "#555",
    border: "1px solid #333",
    borderRadius: 6,
    cursor: "pointer",
  },

  startBtn: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 20,
    letterSpacing: 6,
    padding: "14px 60px",
    backgroundColor: "#fff",
    color: "#000",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};