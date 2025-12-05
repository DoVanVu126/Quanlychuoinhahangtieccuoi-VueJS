/*!

=========================================================
* BootstrapVue Argon Dashboard - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/bootstrap-vue-argon-dashboard
* Copyright 2020 Creative Tim (https://www.creative-tim.com)

* Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Vue from 'vue';
import DashboardPlugin from './plugins/dashboard-plugin';
import SimpleI18n from './plugins/simple-i18n';
import App from './App.vue';

// router setup
import router from './routes/router';
// plugin setup
Vue.use(DashboardPlugin);
// simple i18n plugin (lightweight)
Vue.use(SimpleI18n, { default: 'vi' });

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router
});
