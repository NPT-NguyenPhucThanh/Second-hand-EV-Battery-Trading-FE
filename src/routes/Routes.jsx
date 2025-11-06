// src/routes/Routes.jsx
import { createBrowserRouter } from "react-router-dom";

// === LAYOUTS ===
import AdminLayout from "../layouts/AdminLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import NotFound from "../pages/404page/NotFound";
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

// === CHECKOUT PAGES ===
import Checkout from "../pages/checkout/Checkout";
import DepositCar from "../pages/checkout/DepositCar"; 
import DepositSuccess from "../pages/checkout/DepositSuccess";          
import ConfirmPin from "../pages/checkout/ConfirmPin";           

//import PaymentCheckout from "../pages/checkout/PaymentCheckout";
import PaymentResult from "../pages/checkout/PaymentResult";       

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

// === SELLER PACKAGE PAGES ===
import BuyPackage from "../components/seller/BuyPackage";
import PackageDetail from "../components/seller/PackageDetail";
import MyPackages from "../components/seller/MyPackages";
import MessengerPage from "../pages/chat/MessengerPage";
import VnpayReturn from "../pages/checkout/VnpayReturn";

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
      { index: true, element: <SellerUpgradePage /> },
      { path: "user-upgrade", element: <SellerUpgradePage /> },
      { path: "post", element: <PostManagement /> },
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

  // === A. PUBLIC-FACING ROUTES (Sử dụng MemberLayout trực tiếp) ===
  // Những trang này ai cũng xem được và có Header/Footer.
  {
    path: "/",
    element: <MemberLayout />, 
    children: [
      { index: true, element: <Home /> }, 
      { path: "listings/:id", element: <ListingDetail /> },
      { path: "sellers/:id", element: <SellerProfile /> }, 
      { path: "search", element: <SearchResult /> }, 
      
      { path: "payment/vnpay-return", element: <VnpayReturn /> },
    ],
  },

  // === B. PRIVATE MEMBER ROUTES (Sử dụng MemberRouteGuard) ===
  // Những trang này yêu cầu đăng nhập VÀ cũng dùng MemberLayout (do Guard trả về).
  {
    path: "/", // <-- Vẫn dùng root path
    element: <MemberRouteGuard />, 
    children: [
      // Tất cả các trang riêng tư đặt ở đây
      { path: "cart", element: <Cart /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "listings/new", element: <NewPost /> },
      { path: "messages", element: <MessengerPage /> },

      // CHECKOUT FLOW (Private)
      { path: "checkout/:productId", element: <Checkout /> },
     
      { path: "checkout/deposit/:orderId", element: <DepositCar /> },
      { path: "deposit-success", element: <DepositSuccess /> },
      { path: "checkout/confirm-pin/:orderId", element: <ConfirmPin /> },

      // VNPAY (Private)
      //{ path: "checkout/payment", element: <PaymentCheckout /> },
      { path: "payment/result", element: <PaymentResult /> }, 

      // GÓI DỊCH VỤ SELLER (Private)
      { path: "seller/packages", element: <BuyPackage /> },
      { path: "seller/packages/:packageid", element: <PackageDetail /> },
      { path: "seller/my-packages", element: <MyPackages /> },
    ]
  },

  // === C. CÁC TRANG PUBLIC KHÔNG CẦN LAYOUT (Login, NotFound) ===
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
];

const router = createBrowserRouter(routes);
export default router;