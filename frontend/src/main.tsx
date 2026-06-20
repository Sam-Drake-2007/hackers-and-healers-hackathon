import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./token.css";
import Layout from "./components/Layout";
import PlaceholderPage from "./pages/PlaceholderPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PlaceholderPage />} />
          {/* Add future pages here:
          <Route path="/example" element={<ExamplePage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
