import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import AdminLanding from "./pages/AdminLanding.tsx";
import "./styles/index.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminLanding />
  </StrictMode>,
)
