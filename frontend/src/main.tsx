import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./token.css";
import Layout from "./components/Layout";
import { Login } from "./pages/Login";
//import { Consultation } from "./pages/Consultation";
import { Transfer } from "./pages/Transfer";
import DevLive from "./pages/_DevLive";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
          {/**<Route path="/consultation" element={<Consultation />} />*/}
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/_dev/live" element={<DevLive />} />
          {/* Add future pages here:
          <Route path="/example" element={<ExamplePage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
