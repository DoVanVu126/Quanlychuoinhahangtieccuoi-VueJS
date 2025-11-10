// router/routes.js
import DashboardLayout from "@/views/Layout/DashboardLayout.vue";
import AuthLayout from "@/views/Pages/AuthLayout.vue";
import NotFound from "@/views/NotFoundPage.vue";
import Home from "@/views/Pages/Home.vue";
import Search from "@/views/Pages/Search.vue";
const routes = [
  {
    path: "/",
    redirect: "/dashboard",
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

      // 👉 HỒ SƠ
      {
        path: "/profile",
        name: "profile",
        component: () => import("../views/Pages/UserProfile.vue"),
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

  // 👉 AUTH LAYOUT (Đăng nhập, đăng ký)
  {
    path: "/",
    redirect: "/login",
    component: AuthLayout,
    children: [
      {
        path: "/login",
        name: "login",
        component: () => import("../views/Pages/Login.vue"),
      },
      {
        path: "/register",
        name: "register",
        component: () => import("../views/Pages/Register.vue"),
      },
      { path: "*", component: NotFound },
    ],
  },
];

export default routes;
