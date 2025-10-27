import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import NotFound from "../pages/404page/NotFound";
import MemberLayout from "../layouts/MemberLayout";
import Home from "../pages/home/pages/Home";
import Login from "../pages/auth/Login";
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
import SystemManagement from "../pages/admin/SystemManagement";
import RevenueManagement from "../pages/admin/RevenueManagement";
import PostManagement from "../pages/admin/PostManagement";
import TransactionManagement from "../pages/admin/TransactionManagement";
import RoleGuard from "../components/auth/ProtectedRoute";
import { ROLES } from "../constants/role";
export const routes = [
  {
    path: "/staff",
    element: <AdminLayout />,
    children: [
      { path: "/staff/user-upgrade", element: <SellerUpgradePage /> },
      { path: "/staff", element: <PostManagement /> },
      { path: "/staff/transactions", element: <TransactionManagement /> },
      { path: "/staff/refund", element: <RefundManagement /> },
      { path: "/staff/users", element: <UserManagement /> },
      { path: "/staff/warehouse/pending", element: <WarehousePending /> },
      { path: "/staff/vehicle-storage", element: <WarehouseManagement /> },
    ],
  },
  {
    path: "/manager",
    element: <ManagerLayout />,
    children: [
      { path: "/manager", element: <Dashboard /> },
      { path: "/manager/posts", element: <PostManagement /> },
      { path: "/manager/users", element: <UserManagement /> },
      { path: "/manager/packages", element: <PackageManagement /> },
      { path: "/manager/revenue", element: <RevenueManagement /> },
      { path: "/manager/system", element: <SystemManagement /> },
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

      { path: "/listings/:id", element: <ListingDetail /> },
      { path: "/sellers/:id", element: <SellerProfile /> },
      {
        path: "/listings/new",
        element: 
          
            <NewPost />,
         
      
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
];

const router = createBrowserRouter(routes);
export default router;
