import FlipDigit from "./FlipDigit";

/*
  FlipUnit Component
  ------------------
  Groups two FlipDigit cards together into one time unit (HH, MM, or SS).
  Also shows a label underneath (HOURS, MINUTES, SECONDS).

  Props:
  - value : number  → e.g. 59 for 59 minutes
  - label : string  → e.g. "MINUTES"
*/

export default function FlipUnit({ value, label }) {
  /*
    We need to split a two-digit number into individual digits.
    Example: value = 7  → tens = "0", ones = "7"
             value = 45 → tens = "4", ones = "5"

    String(value).padStart(2, "0") converts:
      7  → "07"
      45 → "45"

    Then we grab index [0] for tens and [1] for ones.
  */
  const twoDigit = String(value).padStart(2, "0");
  const tensDigit = twoDigit[0];   // "0" or "4"
  const onesDigit = twoDigit[1];   // "7" or "5"

  return (
    <div style={styles.unit}>

      {/* Two digit cards side by side */}
      <div style={styles.cards}>
        <FlipDigit digit={tensDigit} />
        <FlipDigit digit={onesDigit} />
      </div>

      {/* Label below the cards */}
      <span style={styles.label}>{label}</span>

    </div>
  );
}

const styles = {
  unit: {
    display: "flex",
    flexDirection: "column",   // stack cards on top, label on bottom
    alignItems: "center",
    gap: 12,
  },

  cards: {
    display: "flex",
    gap: 6,                    // small gap between the two digit cards
  },

  label: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 13,
    letterSpacing: 4,
    color: "#555",
  },
};
