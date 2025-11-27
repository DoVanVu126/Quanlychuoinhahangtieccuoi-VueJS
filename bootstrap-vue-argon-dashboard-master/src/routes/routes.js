// router/routes.js
import DashboardLayout from "@/views/Layout/DashboardLayout.vue";
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
  {
    path: "/dashboard", // <-- Đổi path từ "/" thành "/dashboard"
    component: DashboardLayout,
    children: [
      {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("../views/Dashboard.vue"),
      },

      // user
      {
        path: "/users",
        name: "User",
        component: () => import("../views/User.vue"),
      },

      {
        path: "/users/add",
        name: "AddUser",
        component: () => import("../views/AddUser.vue"),
      },
      {
        path: "/users/edit/:id",
        name: "EditUser",
        component: () => import("../views/EditUser.vue"),
      },

      // 👉 MÓN ĂN
      {
        path: "/mon-an",
        name: "MonAn",
        component: () => import("@/views/Food/MonAn.vue"), // đổi đúng file mà mình vừa tạo (Food.vue)
      },
      {
        path: "/mon-an/them",
        name: "ThemMonAn",
        component: () => import("@/views/Food/ThemMonAn.vue"), // file thêm món ăn
      },
      {
        path: "/mon-an/sua/:id",
        name: "SuaMonAn",
        component: () => import("@/views/Food/SuaMonAn.vue"), // file sửa món ăn
        props: true,
      },

      // 👉 DỊCH VỤ
      {
        path: "/dich-vu",
        name: "DichVu",
        component: () => import("../views/Service/DichVu.vue"),
      },
      {
        path: "/dich-vu/them",
        name: "ThemDichVu",
        component: () => import("../views/Service/ThemDichVu.vue"),
      },
      {
        path: "/dich-vu/sua/:id",
        name: "SuaDichVu",
        component: () => import("../views/Service/SuaDichVu.vue"),
      },

      // 👉 KHUYẾN MÃI
      {
        path: "/promotions",
        name: "Promotions",
        component: () => import("../views/Promotion/Promotions.vue"),
      },
      {
        path: "/promotions/add",
        name: "AddPromotion",
        component: () => import("../views/Promotion/AddPromotion.vue"),
      },
      {
        path: "/promotions/edit/:id",
        name: "EditPromotion",
        component: () => import("../views/Promotion/EditPromotion.vue"),
      },

      {
        path: "/promotions",
        name: "PromotionList",
        component: () => import("../components/Home/PromotionList.vue"),
      },

      // {
      //   path: "/promotion/:id",
      //   name: "PromotionDetail",
      //   component: () => import("../components/Home/PromotionDetail.vue"),
      // },


      // 👉 SẢNH
      {
        path: "/sanh",
        name: "Sanh",
        component: () => import("../views/Sanh.vue"),
      },
      {
        path: "/sanh/them",
        name: "ThemSanh",
        component: () => import("../views/ThemSanh.vue"),
      },
      {
        path: "/sanh/sua/:id",
        name: "SuaSanh",
        component: () => import("../views/SuaSanh.vue"),
      },

      // 👉 NHÀ HÀNG
      {
        path: "/nha-hang",
        name: "NhaHang",
        component: () => import("@/views/NhaHang.vue"),
      },
      {
        path: "/nha-hang/them",
        name: "ThemNhaHang",
        component: () => import("../views/ThemNhaHang.vue"),
      },
      {
        path: "/nha-hang/sua/:id",
        name: "SuaNhaHang",
        component: () => import("../views/SuaNhaHang.vue"),
      },

      // 👉 GÓI GỢI Ý
      {
        path: "/goi-goi-y",
        name: "GoiGoiY",
        component: () => import("../views/GoiGoiY.vue"),
      },
      {
        path: "/goi-goi-y/them",
        name: "ThemGoiGoiY",
        component: () => import("../views/ThemGoiGoiY.vue"),
      },
      {
        path: "/goi-goi-y/sua/:id",
        name: "SuaGoiGoiY",
        component: () => import("../views/SuaGoiGoiY.vue"),
      },

      // 👉 KHO - Quản lý kho
      {
        path: "/kho",
        name: "Kho",
        component: () => import("../views/Kho.vue"),
      },
      {
        path: "/them-hang",
        name: "ThemHang",
        component: () => import("../views/kho-hang/ThemHang.vue"),
      },
      {
        path: "/sua-hang",
        name: "SuaHang",
        component: () => import("../views/kho-hang/SuaHang.vue"),
      },
      {
        path: "/xoa-hang",
        name: "XoaHang",
        component: () => import("../views/kho-hang/XoaHang.vue"),
      },
      {
        path: "/bao-cao-pdf",
        name: "BaoCaoPDF",
        component: () => import("../views/kho-hang/BaoCaoPDF.vue"),
      },
      {
        path: "/lich-su-kho",
        name: "LichSuKho",
        component: () => import("../views/kho-hang/LichSuKho.vue"),
      },
      // 👉 CÀI ĐẶT
      {
        path: "/settings",
        name: "Settings",
        component: () => import("../views/Settings.vue"),
      },

      // 👉 ĐĂNG XUẤT
      {
        path: "/logout",
        name: "Logout",
        component: () => import("../views/Pages/Logout.vue"),
      },
    ],
  },

  {
    path: "/home",
    name: "Home",
    component: Home,
  },
  { path: "/search", name: "Search", component: Search },
  {
    path: "/dat-tiec",
    name: "DatTiec",
    component: () => import("@/views/Pages/BookingPage.vue"),
    props: (route) => ({
      restaurant: route.query.restaurant || null,
      startDate: route.query.startDate || null,
      endDate: route.query.endDate || null,
    }),
  },

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


  // 👉 AUTH LAYOUT (Đăng nhập, đăng ký)
  {
    path: "/login",
    name: "Login",
    component: Login,
  },

  {
    path: "/register",
    name: "Register",
    component: Register,
  },

  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
  },
  {
    path: "/verify-otp",
    name: "VerifyOtp",
    component: VerifyOtp,
  },

  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
  },

  //Hồ sơ người dùng
  {
    path: '/profileUser',
    component: ProfileLayout,
    children: [
      {
        path: '', // Thông tin cá nhân
        name: 'Profile',
        component: () => import('@/views/Profile/ProfileInfo.vue'),
      },
      {
        path: 'change-password', //Đổi mật khẩu
        name: 'ChangePassword',
        component: () => import('@/views/Profile/ChangePassword.vue'),
      },
      {
        path: 'payment-history', //Lịch sử thanh toán
        name: 'PaymentHistory',
        component: () => import('@/views/Profile/PaymentHistory.vue'),
      },
      {
        path: 'payment-history/:id', // Chi tiết thanh toán
        name: 'PaymentDetail',
        component: () => import('@/views/Profile/PaymentDetail.vue'), // Bạn sẽ cần tạo file này
        props: true
      },
      {
        path: 'booking-history', //Lịch sử đặt tiệc
        name: 'BookingHistory',
        component: () => import('@/views/Profile/BookingHistory.vue'),
      },
      {
        path: 'booking-history/:id', //Chi tiết đặt tiệc
        name: 'BookingDetail',
        component: () => import('@/views/Profile/BookingDetail.vue'),
        props: true
      },
    ],
  },
];


export default routes;