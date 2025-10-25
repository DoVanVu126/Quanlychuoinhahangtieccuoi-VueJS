<template>
  <div class="wrapper">
    <notifications></notifications>
    <side-bar>
      <template slot="links">
        <h4 class="text-center mt-3" style="font-family: 'Dancing Script', cursive;">Wedding</h4>

        <sidebar-item
          :link="{
            name: 'Bảng điều khiển',
            path: '/dashboard',
            icon: 'ni ni-tv-2 text-primary',
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{
            name: 'Đặt tiệc',
            path: '/bookings',
            icon: 'ni ni-calendar-grid-58 text-pink',
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{
            name: 'Món ăn',
            path: '/mon-an',
            icon: 'ni ni-dish text-green',
          }"
        ></sidebar-item>


        <sidebar-item
          :link="{
            name: 'Kho',
            path: '/kho',
            icon: 'ni ni-box-2 text-info',
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{
            name: 'Dịch vụ',
            path: '/dich-vu',
            icon: 'ni ni-favourite-28 text-orange',
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{
            name: 'Sảnh',
            path: '/sanh',
            icon: 'ni ni-building text-red',
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{
            name: 'Nhà hàng',
            path: '/nha-hang',
            icon: 'ni ni-shop text-purple',
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{
            name: 'Gói gợi ý',
            path: '/goi-goi-y',
            icon: 'ni ni-collection text-blue',
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{
            name: 'Hồ sơ',
            path: '/profile',
            icon: 'ni ni-single-02 text-dark',
          }"
        ></sidebar-item>

        <hr />

        <sidebar-item
          :link="{
            name: 'Đăng ký',
            path: '/register',
            icon: 'ni ni-circle-08 text-success',
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{
            name: 'Đăng xuất',
            path: '/logout',
            icon: 'ni ni-button-power text-danger',
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{
            name: 'Cài đặt',
            path: '/settings',
            icon: 'ni ni-settings-gear-65 text-gray',
          }"
        ></sidebar-item>
      </template>
    </side-bar>

    <div class="main-content">
      <dashboard-navbar :type="$route.meta.navbarType"></dashboard-navbar>
      <div @click="$sidebar.displaySidebar(false)">
        <fade-transition :duration="200" origin="center top" mode="out-in">
          <router-view></router-view>
        </fade-transition>
      </div>
      <content-footer v-if="!$route.meta.hideFooter"></content-footer>
    </div>
  </div>
</template>

<script>
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import DashboardNavbar from "./DashboardNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import { FadeTransition } from "vue2-transitions";

function initScrollbar(className) {
  if (document.getElementsByClassName(className).length > 0) {
    new PerfectScrollbar(`.${className}`);
  } else {
    setTimeout(() => initScrollbar(className), 100);
  }
}

export default {
  components: { DashboardNavbar, ContentFooter, FadeTransition },
  mounted() {
    if (navigator.platform.startsWith("Win")) {
      initScrollbar("sidenav");
    }
  },
};
</script>

<style scoped>
h4 {
  font-family: "Dancing Script", cursive;
  font-weight: bold;
  color: #444;
}
</style>
