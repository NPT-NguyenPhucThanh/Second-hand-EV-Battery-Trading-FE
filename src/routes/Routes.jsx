import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import NotFound from "../pages/404page/NotFound";
import MemberLayout from "../layouts/MemberLayout";
import Home from "../pages/home/pages/Home";
import Login from "../pages/auth/Login";
import PostManagement from "../pages/admin/PostManagement";
import VehicleInspection from "../pages/admin/VehicleInspection";
import VehicleStorage from "../pages/admin/VehicleStorage";
import TransactionManagement from "../pages/admin/TransactionManagement";
export const routes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <Dashboard /> },
      { path: "/admin/posts", element: <PostManagement /> },
      { path: "/admin/vehicle-inspection", element: <VehicleInspection /> },
      { path: "/admin/vehicle-storage", element: <VehicleStorage /> },
      { path: "/admin/transactions", element: <TransactionManagement /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/",
    element: <MemberLayout />,
    children: [{ path: "/", element: <Home /> }],
  },
  {
    path: "/login",
    element: <Login />,
  },
];

const router = createBrowserRouter(routes);
export default router;
