import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import NotFound from "../pages/404page/NotFound";

export const routes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <Dashboard /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  }
];

const router = createBrowserRouter(routes);
export default router;