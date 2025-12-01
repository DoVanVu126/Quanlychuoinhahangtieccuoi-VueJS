import DashboardLayout from "@/views/Layout/DashboardLayout.vue";
import AuthLayout from "@/views/Pages/AuthLayout.vue";
import NotFound from "@/views/NotFoundPage.vue";
import Home from "@/views/Pages/Home.vue";
import Register from '@/views/Auth/Register.vue';
import Login from '@/views/Auth/Login.vue';
import ForgotPassword from '@/views/Auth/ForgotPassword.vue';
import VerifyOtp from '@/views/Auth/VerifyOtp.vue';
import ResetPassword from '@/views/Auth/ResetPassword.vue';
import ProfileLayout from '@/views/Profile/ProfileLayout.vue';
import Search from "@/views/Pages/Search.vue";
import UserLayout from "@/views/KM/UserLayout.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },

  // ---------------- ADMIN DASHBOARD ----------------
  {
    path: "/dashboard",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "dashboard", component: () => import("../views/Dashboard.vue") },

      // Users
      { path: "/users", name: "User", component: () => import("../views/User.vue") },
      { path: "/users/add", name: "AddUser", component: () => import("../views/AddUser.vue") },
      { path: "/users/edit/:id", name: "EditUser", component: () => import("../views/EditUser.vue") },

      // Món ăn
      { path: "/mon-an", name: "MonAn", component: () => import("@/views/Food/MonAn.vue") },
      { path: "/mon-an/them", name: "ThemMonAn", component: () => import("@/views/Food/ThemMonAn.vue") },
      { path: "/mon-an/sua/:id", name: "SuaMonAn", component: () => import("@/views/Food/SuaMonAn.vue"), props: true },

      // Dịch vụ
      { path: "/dich-vu", name: "DichVu", component: () => import("../views/Service/DichVu.vue") },
      { path: "/dich-vu/them", name: "ThemDichVu", component: () => import("../views/Service/ThemDichVu.vue") },
      { path: "/dich-vu/sua/:id", name: "SuaDichVu", component: () => import("../views/Service/SuaDichVu.vue") },

      // Khuyến mãi
      { path: "/promotions", name: "Promotions", component: () => import("../views/Promotion/Promotions.vue") },
      { path: "/promotions/add", name: "AddPromotion", component: () => import("../views/Promotion/AddPromotion.vue") },
      { path: "/promotions/edit/:id", name: "EditPromotion", component: () => import("../views/Promotion/EditPromotion.vue") },
      {
        path: "/promotions",
        name: "PromotionList",
        component: () => import("../components/Home/PromotionList.vue"),
      },
      // Sảnh
      { path: "/sanh", name: "Sanh", component: () => import("../views/Sanh.vue") },
      { path: "/sanh/them", name: "ThemSanh", component: () => import("../views/ThemSanh.vue") },
      { path: "/sanh/sua/:id", name: "SuaSanh", component: () => import("../views/SuaSanh.vue") },

      // Nhà hàng
      { path: "/nha-hang", name: "NhaHang", component: () => import("@/views/NhaHang.vue") },
      { path: "/nha-hang/them", name: "ThemNhaHang", component: () => import("../views/ThemNhaHang.vue") },
      { path: "/nha-hang/sua/:id", name: "SuaNhaHang", component: () => import("../views/SuaNhaHang.vue") },

      // Kho
      { path: "/kho", name: "Kho", component: () => import("../views/Kho.vue") },
      { path: "/them-hang", name: "ThemHang", component: () => import("../views/kho-hang/ThemHang.vue") },
      { path: "/sua-hang", name: "SuaHang", component: () => import("../views/kho-hang/SuaHang.vue") },
      { path: "/xoa-hang", name: "XoaHang", component: () => import("../views/kho-hang/XoaHang.vue") },
      { path: "/bao-cao-pdf", name: "BaoCaoPDF", component: () => import("../views/kho-hang/BaoCaoPDF.vue") },
      { path: "/lich-su-kho", name: "LichSuKho", component: () => import("../views/kho-hang/LichSuKho.vue") },

      // Cài đặt
      { path: "/settings", name: "Settings", component: () => import("../views/Settings.vue") },

      // 👉 ĐĂNG XUẤT
      {
        path: "/logout",
        name: "Logout",
        component: () => import("../views/Pages/Logout.vue"),
      },
      {
        path: "/bookings",
        name: "Bookings",
        component: () => import("../views/Bookings.vue"),
      },

      // 👉 GÓI GỢI Ý (Suggestion packages)
      {
        path: "/goi-goi-y",
        name: "GoiGoiY",
        component: () => import("../views/GoiGoiY.vue"),
      },
    ],
  },

  { path: "/home", name: "HomePage2", component: Home },
  { path: "/search", name: "Search", component: Search },

  // ------------------ ĐẶT TIỆC (CẦN LOGIN) ------------------
  {
    path: "/dat-tiec",
    name: "DatTiec",
    meta: { requiresAuth: true },
    component: () => import("@/views/Pages/BookingPage.vue"),
    props: (route) => ({
      restaurant: route.query.restaurant || null,
      startDate: route.query.startDate || null,
      endDate: route.query.endDate || null,
    }),
  },

  {
    path: "/gio-hang",
    component: UserLayout,   // Layout người dùng
    children: [
      {
        path: "",
        name: "CartPage",
        component: () => import("../components/Home/Cart.vue"),
      }
    ]
  },

  {
    path: "/saved-promotions",
    component: () => import("@/views/KM/UserHeaderLayout.vue"), // layout chỉ có header
    children: [
      {
        path: "",
        name: "SavedPromotions",
        component: () => import("@/views/SavedPromotions.vue"),
        meta: { requiresAuth: true }
      }
    ]
  },

  // ------------------ CHI TIẾT KHUYẾN MÃI ------------------
  {
    path: "/promotion/:id",
    component: UserLayout,
    children: [
      {
        path: "",
        name: "PromotionDetailUser",
        component: () => import("../components/Home/PromotionDetail.vue"),
      }
    ]
  },

  {
    path: "/restaurant/:id",
    component: UserLayout,
    children: [
      {
        path: "",
        name: "RestaurantDetail",
        component: () => import("../components/Home/RestaurantDetail.vue"),
        props: true,
      }
    ]
  },

  {
    path: '/membership',
    name: 'Membership',
    component: () => import('@/views/Membership.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/membership/detail',
    name: 'MembershipDetail',
    component: () => import('@/views/MembershipDetail.vue'),
    meta: { requiresAuth: true }
  },

  // ------------------ AUTH ------------------
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword },
  { path: "/verify-otp", name: "VerifyOtp", component: VerifyOtp },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword },

  // ------------------ PROFILE (CẦN LOGIN) ------------------
  {
    path: '/profileUser',
    component: ProfileLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Profile', component: () => import('@/views/Profile/ProfileInfo.vue') },
      { path: 'change-password', name: 'ChangePassword', component: () => import('@/views/Profile/ChangePassword.vue') },
      { path: 'payment-history', name: 'PaymentHistory', component: () => import('@/views/Profile/PaymentHistory.vue') },
      { path: 'payment-history/:id', name: 'PaymentDetail', component: () => import('@/views/Profile/PaymentDetail.vue'), props: true },
      { path: 'booking-history', name: 'BookingHistory', component: () => import('@/views/Profile/BookingHistory.vue') },
      { path: 'booking-history/:id', name: 'BookingDetail', component: () => import('@/views/Profile/BookingDetail.vue'), props: true },
    ],
  },
];

export default routes;
