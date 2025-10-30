// router/routes.js
import DashboardLayout from "@/views/Layout/DashboardLayout.vue";
import AuthLayout from "@/views/Pages/AuthLayout.vue";
import NotFound from "@/views/NotFoundPage.vue";
import UserList from "@/views/UserList.vue";

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
      {
        path: "/users",
        name: "UserList",
        component: UserList,
      },

      // 👉 ĐẶT TIỆC
      {
        path: "/bookings",
        name: "Bookings",
        component: () => import("../views/Bookings.vue"),
      },

      // 👉 MÓN ĂN
      {
        path: "/mon-an",
        name: "MonAn",
        component: () => import("@/views/MonAn.vue"), // đổi đúng file mà mình vừa tạo (Food.vue)
      },
      {
        path: "/mon-an/them",
        name: "ThemMonAn",
        component: () => import("@/views/ThemMonAn.vue"), // file thêm món ăn
      },
      {
        path: "/mon-an/sua/:id",
        name: "SuaMonAn",
        component: () => import("@/views/SuaMonAn.vue"), // file sửa món ăn
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
