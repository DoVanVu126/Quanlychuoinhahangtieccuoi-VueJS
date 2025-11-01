// router/routes.js
import DashboardLayout from '@/views/Layout/DashboardLayout.vue';
import AuthLayout from '@/views/Pages/AuthLayout.vue';
import NotFound from '@/views/NotFoundPage.vue';
import UserList from '@/views/UserList.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/Dashboard.vue'),
      },
      {
        path: '/users',
        name: 'UserList',
        component: UserList,
      },

      // 👉 ĐẶT TIỆC
      {
        path: '/bookings',
        name: 'Bookings',
        component: () => import('../views/Bookings.vue'),
      },

      // 👉 MÓN ĂN
      {
        path: '/mon-an',
        name: 'MonAn',
        component: () => import('../views/MonAn.vue'),
      },
      {
        path: '/mon-an/them',
        name: 'ThemMonAn',
        component: () => import('../views/ThemMonAn.vue'),
      },
      {
        path: '/mon-an/sua/:id',
        name: 'SuaMonAn',
        component: () => import('../views/SuaMonAn.vue'),
      },

      // 👉 DỊCH VỤ
      {
        path: '/dich-vu',
        name: 'DichVu',
        component: () => import('../views/DichVu.vue'),
      },
      {
        path: '/dich-vu/them',
        name: 'ThemDichVu',
        component: () => import('../views/ThemDichVu.vue'),
      },
      {
        path: '/dich-vu/sua/:id',
        name: 'SuaDichVu',
        component: () => import('../views/SuaDichVu.vue'),
      },

      // 👉 SẢNH
      {
        path: '/sanh',
        name: 'Sanh',
        component: () => import('../views/Sanh.vue'),
      },
      {
        path: '/sanh/them',
        name: 'ThemSanh',
        component: () => import('../views/ThemSanh.vue'),
      },
      {
        path: '/sanh/sua/:id',
        name: 'SuaSanh',
        component: () => import('../views/SuaSanh.vue'),
      },

      // 👉 NHÀ HÀNG
      {
        path: '/nha-hang',
        name: 'NhaHang',
        component: () => import('../views/NhaHang.vue'),
      },
      {
        path: '/nha-hang/them',
        name: 'ThemNhaHang',
        component: () => import('../views/ThemNhaHang.vue'),
      },
      {
        path: '/nha-hang/sua/:id',
        name: 'SuaNhaHang',
        component: () => import('../views/SuaNhaHang.vue'),
      },

      // 👉 GÓI GỢI Ý
      {
        path: '/goi-goi-y',
        name: 'GoiGoiY',
        component: () => import('../views/GoiGoiY.vue'),
      },
      {
        path: '/goi-goi-y/them',
        name: 'ThemGoiGoiY',
        component: () => import('../views/ThemGoiGoiY.vue'),
      },
      {
        path: '/goi-goi-y/sua/:id',
        name: 'SuaGoiGoiY',
        component: () => import('../views/SuaGoiGoiY.vue'),
      },

      // 👉 KHO - Quản lý kho
      {
        path: '/kho',
        name: 'Kho',
        component: () => import('../views/Kho.vue'),
      },
      {
        path: '/them-hang',
        name: 'ThemHang',
        component: () => import('../views/kho-hang/ThemHang.vue'),
      },
      {
        path: '/sua-hang',
        name: 'SuaHang',
        component: () => import('../views/kho-hang/SuaHang.vue'),
      },
      {
        path: '/xoa-hang',
        name: 'XoaHang',
        component: () => import('../views/kho-hang/XoaHang.vue'),
      },
      {
        path: '/bao-cao-pdf',
        name: 'BaoCaoPDF',
        component: () => import('../views/kho-hang/BaoCaoPDF.vue'),
      },
      {
        path: '/lich-su-kho',
        name: 'LichSuKho',
        component: () => import('../views/kho-hang/LichSuKho.vue')
      },


      // 👉 HỒ SƠ
      {
        path: '/profile',
        name: 'profile',
        component: () => import('../views/Pages/UserProfile.vue'),
      },

      // 👉 CÀI ĐẶT
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
      },

      // 👉 ĐĂNG XUẤT
      {
        path: '/logout',
        name: 'Logout',
        component: () => import('../views/Pages/Logout.vue'),
      },
    ],
  },

  // 👉 AUTH LAYOUT (Đăng nhập, đăng ký)
  {
    path: '/',
    redirect: '/login',
    component: AuthLayout,
    children: [
      {
        path: '/login',
        name: 'login',
        component: () => import('../views/Pages/Login.vue'),
      },
      {
        path: '/register',
        name: 'register',
        component: () => import('../views/Pages/Register.vue'),
      },
      { path: '*', component: NotFound },
    ],
  },
];

export default routes;
