import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import NotFound from "../pages/404page/NotFound";
import Home from "../pages/home/pages/Home";
import Login from "../pages/auth/Login";
import ProfilePage from "../pages/profile/ProfilePage";
import NewPost from "../pages/post/NewPost";
import Cart from "../pages/cart/pages/CartPage";
import ListingDetail from "../pages/home/components/ListingDetail";
import SellerProfile from "../pages/profile/components/SellerProfile";
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
import SearchResults from "../pages/home/components/SearchResult";
import DisputeManagement from "../pages/admin/DisputeManagement";
import UserPackageManagement from "../pages/admin/UserPackageManagement";
import MemberRouteGuard from "../components/auth/MemberRouteGuard";
import AdminRouteGuard from "../components/auth/AdminRouteGuard";

const ROLES = {
  BUYER: "BUYER",
  SELLER: "SELLER",
  STAFF: "STAFF",
  MANAGER: "MANAGER",
};

export const routes = [
  {
    path: "/staff",
    element: (
      <AdminRouteGuard
        LayoutComponent={AdminLayout}
        allowedRoles={[ROLES.STAFF, ROLES.MANAGER]}
      />
    ),
    children: [
      { index: true, element: <PostManagement /> }, 
      { path: "user-upgrade", element: <SellerUpgradePage /> },
      { path: "orders", element: <TransactionManagement /> },
      { path: "refund", element: <RefundManagement /> },
      { path: "users", element: <UserManagement /> },
      { path: "warehouse/pending", element: <WarehousePending /> },
      { path: "vehicle-storage", element: <WarehouseManagement /> },
      { path: "user-packages", element: <UserPackageManagement /> },
    ],
  },
  {
    path: "/manager",
    element: (
      <AdminRouteGuard
        LayoutComponent={ManagerLayout}
        allowedRoles={[ROLES.MANAGER]}
      />
    ),
    children: [
      { index: true, element: <Dashboard /> }, 
      { path: "posts", element: <PostManagement /> },
      { path: "users", element: <UserManagement /> },
      { path: "packages", element: <PackageManagement /> },
      { path: "revenue", element: <RevenueManagement /> },
      { path: "system", element: <SystemManagement /> },
      { path: "disputes", element: <DisputeManagement /> },
      { path: "user-upgrade", element: <SellerUpgradePage /> },
      { path: "orders", element: <TransactionManagement /> },
      { path: "refund", element: <RefundManagement /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/",
    element: <MemberRouteGuard />, 
    children: [
      { index: true, element: <Home /> }, 
      { path: "cart", element: <Cart /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "listings/:id", element: <ListingDetail /> },
      { path: "search", element: <SearchResults /> },
      { path: "sellers/:id", element: <SellerProfile /> },
      {
        path: "listings/new",
        element: <NewPost />,
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