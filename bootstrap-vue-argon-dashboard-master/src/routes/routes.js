// router/routes.js
import DashboardLayout from "@/views/Layout/DashboardLayout.vue";
import AuthLayout from "@/views/Pages/AuthLayout.vue";
import NotFound from "@/views/NotFoundPage.vue";
import Home from "@/views/Pages/Home.vue";
import Login from "@/views/Pages/Login.vue";
import Register from "@/views/Pages/Register.vue";
import Profile from "@/views/Pages/Profile.vue";
import Search from "@/views/Pages/Search.vue";
import UserLayout from "@/views/KM/UserLayout.vue";
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

      {
        path: "/customer",
        name: "Customer",
        component: () => import("../views/Customer.vue"),
      },

      {
        path: "/customers/:id",
        name: "CustomerDetail",
        component: () => import("../views/CustomerDetail.vue"),
      },

      {
        path: "/support",
        name: "Support",
        component: () => import("../views/SupportTickets.vue"),
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
        path: "/restaurant",
        name: "Restaurant",
        component: () => import("../views/Restaurant/Restaurant.vue"),
      },
      {
        path: "/restaurant/them",
        name: "ThemRestaurant",
        component: () => import("../views/Restaurant/ThemRestaurant.vue"),
      },
      {
        path: "/restaurant/sua/:id",
        name: "SuaRestaurant",
        component: () => import("../views/Restaurant/SuaRestaurant.vue"),
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
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  { path: "/profile", name: "Profile", component: Profile },
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

  // Public restaurant detail (user-facing)
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
