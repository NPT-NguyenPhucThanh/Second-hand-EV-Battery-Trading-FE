window.global = window;
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/Routes";
import { UserProvider } from "./contexts/UserContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";

import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <NotificationProvider>
        <ThemeProvider>
            <RouterProvider router={router} />
            <Toaster
              richColors
              closeButton
              position="top-center"
              expand={true}
              duration={5000}
              toastOptions={{
                style: { fontSize: "16px", borderRadius: "12px" },
                classNames: {
                  success: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl",
                  error: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-2xl",
                },
              }}
            />
        </ThemeProvider>
      </NotificationProvider>
    </UserProvider>
  </StrictMode>
);