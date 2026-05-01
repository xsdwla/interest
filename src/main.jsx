import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import NavalMap from "../NavalMap.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NavalMap />
  </StrictMode>
);
