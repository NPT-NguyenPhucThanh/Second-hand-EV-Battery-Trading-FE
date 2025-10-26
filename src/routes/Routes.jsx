import { createBrowserRouter } from "react-router-dom";
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
import DisputeManagement from "../pages/admin/DisputeManagement";
import UserManagement from "../pages/admin/UserManagement";
import PackageManagement from "../pages/admin/PackageManagement";
import ProfilePage from "../pages/profile/ProfilePage";
import NewPost from "../pages/post/NewPost";
import Cart from "../pages/cart/pages/CartPage";
import WarehouseManagement from "../pages/admin/WarehouseManagement";
import ListingDetail from "../pages/home/components/ListingDetail";
import SellerProfile from "../pages/profile/components/SellerProfile"; // <-- import mới

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
      { path: "/admin/disputes", element: <DisputeManagement /> },
      { path: "/admin/users", element: <UserManagement /> },
      { path: "/admin/packages", element: <PackageManagement /> },
      { path: "/admin/warehouse", element: <WarehouseManagement /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/",
    element: <MemberLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/cart", element: <Cart /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/listings/new", element: <NewPost /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  // {
  //   path: "/profile",
  //   element: <MemberLayout />,
  //   children: [{ path: "/profile", element: <ProfilePage /> }],
  // },
  {
    path: "/listings/new",
    element: <NewPost />,
  },
  // {
  //   path: "/cart",
  //   element: <MemberLayout />,
  //   children: [{ path: "/cart", element: <Cart /> }],
  // },
];

const router = createBrowserRouter(routes);
export default router;
