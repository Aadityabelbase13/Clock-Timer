import { createRoot } from "react-dom/client";
import App from "./App";

// StrictMode removed — it double-fires useEffect which breaks animations
createRoot(document.getElementById("root")).render(<App />);
