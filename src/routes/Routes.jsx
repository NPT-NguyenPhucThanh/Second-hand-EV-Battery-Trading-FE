import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import NotFound from "../pages/404page/NotFound";
import MemberLayout from "../layouts/MemberLayout";
import Home from "../pages/home/pages/Home";
import Login from "../pages/auth/Login";
import PostManagement from "../pages/admin/PostManagement";
import VehicleInspection from "../pages/admin/VehicleInspection";
import TransactionManagement from "../pages/admin/TransactionManagement";
import DisputeManagement from "../pages/admin/DisputeManagement";
import PackageManagement from "../pages/admin/PackageManagement";
import ProfilePage from "../pages/profile/ProfilePage";
import NewPost from "../pages/post/NewPost";
import Cart from "../pages/cart/pages/CartPage";
import ListingDetail from "../pages/home/components/ListingDetail";
import SellerProfile from "../pages/profile/components/SellerProfile"; // <-- import mới
import Dashboard from "../pages/admin/Dashboard";
import SellerUpgradePage from "../pages/admin/SellerUpgrade";
import UserManagement from "../pages/admin/UserManagement";
import WarehouseManagement from "../pages/admin/WarehouseManagement";
import WarehousePending from "../pages/admin/WarehousePending";
export const routes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <Dashboard /> },
      { path: "/admin/user-upgrade", element: <SellerUpgradePage /> },
      { path: "/admin/posts", element: <PostManagement /> },
      { path: "/admin/vehicle-inspection", element: <VehicleInspection /> },
      { path: "/admin/transactions", element: <TransactionManagement /> },
      { path: "/admin/disputes", element: <DisputeManagement /> },
      { path: "/admin/users", element: <UserManagement /> },
      { path: "/admin/packages", element: <PackageManagement /> },
      { path: "/admin/warehouse/pending", element: <WarehousePending /> },
      // { path: "/admin/warehouse", element: <WarehouseManagement /> },
      { path: "/admin/vehicle-storage", element: <WarehouseManagement /> },
      
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
