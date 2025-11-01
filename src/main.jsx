import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/Routes";
import { UserProvider } from "./contexts/UserContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeWrapper from "./ThemeWrapper"; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <UserProvider>
        <ThemeProvider>
          <ThemeWrapper>
            <RouterProvider router={router} />
          </ThemeWrapper>
        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  </StrictMode>
);