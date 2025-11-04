// src/routes/Routes.jsx
import { createBrowserRouter } from "react-router-dom";

// === LAYOUTS ===
import AdminLayout from "../layouts/AdminLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import NotFound from "../pages/404page/NotFound";
// Import MemberLayout (nó sẽ được dùng bên trong Guard)
import MemberLayout from "../layouts/MemberLayout";

// === PAGES ===
import Home from "../pages/home/pages/Home";
import Login from "../pages/auth/Login";
import ProfilePage from "../pages/profile/ProfilePage";
import NewPost from "../pages/post/NewPost";
import Cart from "../pages/cart/pages/CartPage";
import ListingDetail from "../pages/home/components/ListingDetail";
import SellerProfile from "../pages/profile/components/SellerProfile";
import SearchResult from "../pages/home/components/SearchResult";

//=== CHECKOUT PAGES ===
import Checkout from "../pages/checkout/Checkout";
import CheckoutSuccess from "../pages/checkout/CheckoutSuccess";
import DepositCar from "../pages/checkout/DepositCar";
import ConfirmPin from "../pages/checkout/ConfirmPin";

//=== VNPAY PAGES ===
import PayPage from "../pages/vnpay/PayPage";
import PaymentReturn from "../pages/vnpay/PaymentReturn";

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
import DisputeManagement from "../pages/admin/DisputeManagement";
import UserPackageManagement from "../pages/admin/UserPackageManagement";

// === GUARDS & ROLES ===
import MemberRouteGuard from "../components/auth/MemberRouteGuard";
import AdminRouteGuard from "../components/auth/AdminRouteGuard";

// === CÁC TRANG BỊ THIẾU (THÊM VÀO) ===

import BuyPackage from "../components/seller/BuyPackage";
import PackageDetail from "../components/seller/PackageDetail";
import MyPackages from "../components/seller/MyPackages";
import PaymentCheckout from "../components/seller/PaymentCheckout";
import PaymentResult from "../components/seller/PaymentResult";
// import ChatPage from "../pages/chat/ChatPage";
import MessengerPage from "../pages/chat/MessengerPage";

const ROLES = {
  BUYER: "BUYER",
  SELLER: "SELLER",
  STAFF: "STAFF",
  MANAGER: "MANAGER",
};

export const routes = [
  // === ADMIN (STAFF) ROUTES ===
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

  // === MANAGER ROUTES ===
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

  // === MEMBER & PUBLIC ROUTES ===
  {
    path: "/",
    // SỬA LẠI THÀNH MEMBERROUTEGUARD ĐỂ FIX LỖI STAFF LOGIN
    element: <MemberRouteGuard />,
    children: [
      { index: true, element: <Home /> },
      { path: "cart", element: <Cart /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "listings/new", element: <NewPost /> },
      { path: "listings/:id", element: <ListingDetail /> },
      { path: "sellers/:id", element: <SellerProfile /> }, // chưa gắn
      { path: "search", element: <SearchResult /> },
      // { path: "chat/:sellerId", element: <ChatPage /> },
      { path: "messages", element: <MessengerPage /> },

      // === CÁC ROUTE GÓI DỊCH VỤ VÀ THANH TOÁN ===
      { path: "checkout/:productId", element: <Checkout /> },
      { path: "checkout/success/:orderId", element: <CheckoutSuccess /> },
      { path: "checkout/deposit/:orderId", element: <DepositCar /> },
      { path: "checkout/confirm-pin/:orderId", element: <ConfirmPin /> },
      { path: "seller/packages", element: <BuyPackage /> },
      { path: "seller/packages/:packageid", element: <PackageDetail /> },
      { path: "seller/my-packages", element: <MyPackages /> },
      { path: "payment/checkout", element: <PaymentCheckout /> },
      { path: "payment/result", element: <PaymentResult /> },
      //=== VNPAY ROUTES ===
      { path: "checkout/pay/:orderId", element: <PayPage /> },
      { path: "payment/vnpay-return", element: <PaymentReturn /> },
    ],
  },

  // === PUBLIC PAGES ===
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
];

// === TẠO ROUTER ===
const router = createBrowserRouter(routes);
export default router;
