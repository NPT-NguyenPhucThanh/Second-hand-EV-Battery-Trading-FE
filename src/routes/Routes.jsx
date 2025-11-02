// src/routes/Routes.jsx
import { createBrowserRouter } from "react-router-dom";

// === LAYOUTS ===
import AdminLayout from "../layouts/AdminLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import MemberLayout from "../layouts/MemberLayout";

// === PAGES ===
import Home from "../pages/home/pages/Home";
import Login from "../pages/auth/Login";
import ProfilePage from "../pages/profile/ProfilePage";
import NewPost from "../pages/post/NewPost";
import Cart from "../pages/cart/pages/CartPage";
import ListingDetail from "../pages/home/components/ListingDetail";
import SellerProfile from "../pages/profile/components/SellerProfile";
import SearchResults from "../pages/home/components/SearchResult";
import NotFound from "../pages/404page/NotFound";
import Deposit from "../pages/checkout/Deposite";


// === ADMIN PAGES ===
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

// === SELLER PAGES (GÓI DỊCH VỤ) ===
import BuyPackage from "../components/seller/BuyPackage";
import PackageDetail from "../components/seller/PackageDetail";
import PaymentCheckout from "../components/seller/PaymentCheckout"; // THÊM
import PaymentResult from "../components/seller/PaymentResult";     // THÊM

// === AUTH ===
import RoleGuard from "../components/auth/ProtectedRoute";
import { ROLES } from "../constants/role";

// === ROUTES CONFIG ===
export const routes = [
  // === ADMIN (STAFF) ROUTES ===
  {
    path: "/staff",
    element: <AdminLayout />,
    children: [
      { index: true, element: <PostManagement /> },
      { path: "user-upgrade", element: <SellerUpgradePage /> },
      { path: "transactions", element: <TransactionManagement /> },
      { path: "refund", element: <RefundManagement /> },
      { path: "users", element: <UserManagement /> },
      { path: "warehouse/pending", element: <WarehousePending /> },
      { path: "vehicle-storage", element: <WarehouseManagement /> },
    ],
  },

  // === MANAGER ROUTES ===
  {
    path: "/manager",
    element: <ManagerLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "posts", element: <PostManagement /> },
      { path: "users", element: <UserManagement /> },
      { path: "packages", element: <PackageManagement /> },
      { path: "revenue", element: <RevenueManagement /> },
      { path: "system", element: <SystemManagement /> },
    ],
  },

  // === MEMBER & PUBLIC ROUTES ===
  {
    path: "/",
    element: <MemberLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "cart", element: <Cart /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "listings/new", element: <NewPost /> },
      { path: "listings/:id", element: <ListingDetail /> },
      { path: "sellers/:id", element: <SellerProfile /> },
      { path: "search", element: <SearchResults /> },
      {path: "checkout/deposit/:orderId", element: <Deposit />},

      // === GÓI DỊCH VỤ (SELLER) ===
      { path: "seller/packages", element: <BuyPackage /> },
      { path: "seller/packages/:packageid", element: <PackageDetail /> },

      // THANH TOÁN GÓI DỊCH VỤ
      { path: "payment/checkout", element: <PaymentCheckout /> }, // THÊM
      { path: "payment/result", element: <PaymentResult /> },     // THÊM
    ],
  },

  // === PUBLIC PAGES ===
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
];

// === TẠO ROUTER ===
const router = createBrowserRouter(routes);
export default router;
