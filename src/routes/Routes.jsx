import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import NotFound from "../pages/404page/NotFound";
import MemberLayout from "../layouts/MemberLayout";
import Home from "../pages/home/pages/Home";
import Login from "../pages/auth/Login";
import PostManagement from "../pages/admin/PostManagement";
import VehicleInspection from "../pages/admin/VehicleInspection";
import TransactionManagement from "../pages/admin/TransactionManagement";
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
import RefundManagement from "../pages/admin/RefundManagement";
import PackageManagement from "../pages/admin/PackageManagement";
export const routes = [
  {
    path: "/staff",
    element: <AdminLayout />,
    children: [
      { path: "/staff", element: <Dashboard /> },
      { path: "/staff/user-upgrade", element: <SellerUpgradePage /> },
      { path: "/staff/posts", element: <PostManagement /> },
      { path: "/staff/vehicle-inspection", element: <VehicleInspection /> },
      { path: "/staff/transactions", element: <TransactionManagement /> },
      { path: "/staff/refund", element: <RefundManagement/> },
      { path: "/staff/users", element: <UserManagement /> },
      { path: "/staff/packages", element: <PackageManagement /> },
      { path: "/staff/warehouse/pending", element: <WarehousePending /> },
      // { path: "/admin/warehouse", element: <WarehouseManagement /> },
      { path: "/staff/vehicle-storage", element: <WarehouseManagement /> },
      
    ],
  },
  {
    path: "/manager",
    element: <ManagerLayout />,
    children: [
      { path: "/manager", element: <Dashboard /> },
      { path: "/manager/user-upgrade", element: <SellerUpgradePage /> },
      { path: "/manager/posts", element: <PostManagement /> },
      { path: "/manager/vehicle-inspection", element: <VehicleInspection /> },
      { path: "/manager/transactions", element: <TransactionManagement /> },
      { path: "/manager/refund", element: <RefundManagement/> },
      { path: "/manager/users", element: <UserManagement /> },
      { path: "/manager/packages", element: <PackageManagement /> },
      { path: "/manager/warehouse/pending", element: <WarehousePending /> },
      // { path: "/admin/warehouse", element: <WarehouseManagement /> },
      { path: "/manager/vehicle-storage", element: <WarehouseManagement /> },
      
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
       { path: "/listings/:id", element: <ListingDetail /> },
       { path: "/sellers/:id", element: <SellerProfile /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/listings/new",
    element: <NewPost />,
  },
];

const router = createBrowserRouter(routes);
export default router;
