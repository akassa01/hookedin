import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { PROFILE } from "./profile";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* PROFILE is the seed identity; once edited it lives in localStorage. */}
    <App initialProfile={PROFILE} />
  </StrictMode>
);
