import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// No StrictMode: the experience engine binds DOM listeners once on mount.
createRoot(document.getElementById("root")).render(<App />);
