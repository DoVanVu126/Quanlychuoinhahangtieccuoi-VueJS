<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">QUẢN LÝ GÓI GỢI Ý</h2>
          <p class="text-light">Danh sách và quản lý các gói gợi ý</p>
        </div>
      </div>
    </base-header>

    <div class="container-fluid mt--7">
      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 class="mb-0">Danh sách gói gợi ý</h4>
              <small class="text-muted">Quản lý trạng thái, chỉnh sửa và xóa gói</small>
            </div>
            <div>
              <b-button size="sm" variant="primary" @click="openCreateModal"><i class="fas fa-plus"></i> Thêm gói</b-button>
            </div>
          </div>

          <div class="table-responsive">
            <b-table :items="paginatedSuggestionPackages" :fields="fields" responsive hover bordered>
              <template #cell(package_id)="row">{{ row.item.package_id || row.item.id }}</template>
              <template #cell(name)="row">{{ row.item.name || '-' }}</template>
              <template #cell(restaurant_id)="row">{{ restaurantName(row.item.restaurant_id) }}</template>
              <template #cell(hall_id)="row">{{ hallName(row.item.hall_id) }}</template>
              <template #cell(event_type)="row">{{ row.item.event_type || '-' }}</template>
              <template #cell(number_of_tables)="row">{{ row.item.number_of_tables || 0 }}</template>
              <template #cell(description)="row">{{ row.item.description || '-' }}</template>
              <template #cell(created_at)="row">{{ formatDate(row.item.created_at) }}</template>
              <template #cell(actions)="row">
                <b-button size="sm" variant="warning" @click="openEditModal(row.item)" :disabled="isLoadingEdit === (row.item.package_id || row.item.id)">
                  <i v-if="isLoadingEdit === (row.item.package_id || row.item.id)" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-edit"></i>
                </b-button>
                <b-button size="sm" variant="danger" @click="deletePackage(row.item.package_id || row.item.id)" :disabled="isDeletingId === (row.item.package_id || row.item.id)">
                  <i v-if="isDeletingId === (row.item.package_id || row.item.id)" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-trash"></i>
                </b-button>
              </template>
            </b-table>
            <div class="d-flex justify-content-center mt-3">
              <b-pagination v-model="currentPage" :total-rows="suggestionPackages.length" :per-page="perPage" align="center" />
            </div>
          </div>

          <!-- Edit Suggestion Package Modal -->
          <b-modal v-model="showModal" title="Chỉnh sửa gói gợi ý" hide-footer size="lg">
            <b-form @submit.stop.prevent="savePackage">
              <b-row>
                <b-col md="4">
                  <b-form-group label="Tên gói" label-for="name">
                    <b-form-input id="name" v-model="form.name" />
                  </b-form-group>
                </b-col>
                <b-col md="4">
                  <b-form-group label="Nhà hàng">
                    <div v-if="isEditing" class="form-control-plaintext">{{ restaurantName(form.restaurant_id) }}</div>
                    <div v-else>
                      <b-form-select v-model="form.restaurant_id" :options="restaurantOptions" @change="onRestaurantChange" class="w-100"/>
                    </div>
                  </b-form-group>
                </b-col>
                <b-col md="4">
                  <b-form-group label="Sảnh">
                    <div v-if="isEditing" class="form-control-plaintext">{{ hallName(form.hall_id) }}</div>
                    <div v-else>
                      <b-form-select v-model="form.hall_id" :options="hallOptionsForForm" class="w-100"/>
                    </div>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row>
                <b-col md="6">
                  <b-form-group label="Loại sự kiện" label-for="event_type">
                    <b-form-input id="event_type" v-model="form.event_type" />
                  </b-form-group>
                </b-col>
                <b-col md="6">
                  <b-form-group label="Số bàn" label-for="number_of_tables">
                    <b-form-input id="number_of_tables" type="number" v-model.number="form.number_of_tables" min="0" />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-form-group label="Mô tả" label-for="description">
                <b-form-textarea id="description" v-model="form.description" rows="3" />
              </b-form-group>

              <div class="gg-booking-tabs">
                <div class="gg-tabs-header">
                  <button type="button" :class="{ active: activeTab === 'sanh' }" @click="activeTab = 'sanh'">SẢNH</button>
                  <button type="button" :class="{ active: activeTab === 'monan' }" @click="activeTab = 'monan'">MÓN ĂN</button>
                  <button type="button" :class="{ active: activeTab === 'dichvu' }" @click="activeTab = 'dichvu'">DỊCH VỤ</button>
                </div>

                <div class="gg-tab-content">
                  <div v-if="activeTab === 'sanh'" class="gg-hall-list">
                    <div v-if="modalHalls && modalHalls.length" class="gg-grid">
                      <div v-for="hall in modalHalls" :key="hall.hall_id || hall.id" class="gg-item card" :class="{ selected: hall.selected }" @click="selectHall(hall)">
                        <div class="gg-item-img">
                          <img v-if="hall.image_url" :src="hall.image_url" alt="img" />
                          <div v-else class="gg-item-noimg">No image</div>
                        </div>
                        <div class="gg-item-body">
                          <h6 class="gg-item-title">{{ hall.name || hall.ten || hall.hall_name || ('Sảnh ' + (hall.hall_id || hall.id)) }}</h6>
                          <p class="gg-item-desc">{{ hall.description || hall.note || '-' }}</p>
                        </div>
                        <div class="gg-item-action">
                          <button type="button" class="gg-select-btn" :class="{ selected: hall.selected }" @click.stop="selectHall(hall)">{{ hall.selected ? 'Đã chọn' : 'Chọn' }}</button>
                        </div>
                      </div>
                    </div>
                    <div v-else>Chưa có sảnh nào.</div>
                  </div>

                  <div v-if="activeTab === 'monan'" class="gg-food-container">

                    <div class="gg-food-type-tabs">
                      <button type="button" :class="{ active: activeFoodTypeId === 1 }" @click="activeFoodTypeId = 1">Khai vị</button>
                      <button type="button" :class="{ active: activeFoodTypeId === 2 }" @click="activeFoodTypeId = 2">Món chính</button>
                      <button type="button" :class="{ active: activeFoodTypeId === 3 }" @click="activeFoodTypeId = 3">Lẩu</button>
                      <button type="button" :class="{ active: activeFoodTypeId === 4 }" @click="activeFoodTypeId = 4">Tráng miệng</button>
                      <button type="button" :class="{ active: activeFoodTypeId === 5 }" @click="activeFoodTypeId = 5">Đồ uống</button>
                    </div>

                    <div class="gg-food-list">
                      <div v-if="filteredFoods && filteredFoods.length" class="gg-grid">
                        <div v-for="food in filteredFoods" :key="food.food_id || food.id" class="gg-item card" :class="{ selected: food.selected }" @click="selectFood(food)">
                            <div class="gg-item-img">
                              <img v-if="food.image_url" :src="food.image_url" alt="img" />
                              <div v-else class="gg-item-noimg">No image</div>
                            </div>
                            <div class="gg-item-body">
                              <h6 class="gg-item-title">{{ food.name || food.title || food.ten || ('Món ' + (food.food_id || food.id)) }}</h6>
                              <p class="gg-item-desc">{{ food.description || food.note || '-' }}</p>
                            </div>
                            <div class="gg-item-action">
                              <button type="button" class="gg-select-btn" :class="{ selected: food.selected }" @click.stop="selectFood(food)">{{ food.selected ? 'Đã chọn' : 'Chọn' }}</button>
                            </div>
                        </div>
                      </div>
                      <div v-else>Chưa có món ăn nào.</div>
                    </div>
                  </div>

                  <div v-if="activeTab === 'dichvu'" class="gg-service-list">
                    <div v-if="modalServices && modalServices.length" class="gg-grid">
                      <div v-for="service in modalServices" :key="service.service_id || service.id" class="gg-item card" :class="{ selected: service.selected }" @click="selectService(service)">
                        <div class="gg-item-img">
                          <img v-if="service.image_url" :src="service.image_url" alt="img" />
                          <div v-else class="gg-item-noimg">No image</div>
                        </div>
                        <div class="gg-item-body">
                          <h6 class="gg-item-title">{{ service.name || service.title || service.ten || ('DV ' + (service.service_id || service.id)) }}</h6>
                          <p class="gg-item-desc">{{ service.description || service.note || '-' }}</p>
                        </div>
                        <div class="gg-item-action">
                          <button type="button" class="gg-select-btn" :class="{ selected: service.selected }" @click.stop="selectService(service)">{{ service.selected ? 'Đã chọn' : 'Chọn' }}</button>
                        </div>
                      </div>
                    </div>
                    <div v-else>Chưa có dịch vụ nào.</div>
                  </div>

                </div>
              </div>

              <div class="text-right">
                <b-button variant="secondary" @click="showModal = false">Hủy</b-button>
                <b-button type="submit" variant="primary" class="ml-2" :disabled="saving">
                  <span v-if="saving"><i class="fas fa-spinner fa-spin"></i> Đang lưu...</span>
                  <span v-else>Lưu</span>
                </b-button>
              </div>
            </b-form>
          </b-modal>
        </div>
      </div>
    </div>

    <!-- Success Toast Notification -->
    <div v-if="showSuccessMsg" class="booking-toast-wrapper">
      <div class="booking-toast-content">
        <i class="fas fa-check-circle"></i> {{ successMsg }}
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import HallCard from '@/components/booking/HallCard.vue';
import FoodCard from '@/components/booking/FoodCard.vue';
import ServiceCard from '@/components/booking/ServiceCard.vue';

export default {
  data() {
    return {
      suggestionPackages: [],
      currentPage: 1,
      perPage: 10,
      restaurants: [],
      halls: [],
      foods: [],
      services: [],
      restaurantsById: {},
      hallsById: {},
      foodsById: {},
      servicesById: {},
      form: {},
      showModal: false,
      isEditing: false,
      saving: false,
      // loading states for UI actions
      isLoadingEdit: null,
      isDeletingId: null,
      // toast notification
      showSuccessMsg: false,
      successMsg: '',
      modalHallsList: null,
      modalFoodsList: null,
      modalServicesList: null,
      fields: [
        { key: 'package_id', label: 'ID', sortable: true },
        { key: 'name', label: 'Tên gói' },
        { key: 'restaurant_id', label: 'Nhà hàng' },
        { key: 'hall_id', label: 'Sảnh' },
        { key: 'event_type', label: 'Loại' },
        { key: 'number_of_tables', label: 'Số bàn' },
        { key: 'description', label: 'Mô tả' },
        { key: 'created_at', label: 'Tạo lúc' },
        { key: 'actions', label: 'Hành động' },
      ],
      activeTab: 'sanh',
      activeFoodTypeId: 1,
    };
  },
  components: { HallCard, FoodCard, ServiceCard },
  methods: {
    async loadRefs() {
      try {
        const [rRes, hRes, fRes, sRes] = await Promise.all([
          api.get('/restaurants'),
          api.get('/halls'),
          api.get('/foods'),
          api.get('/services'),
        ]);

        const restaurants = Array.isArray(rRes.data) ? rRes.data : (rRes.data.data || rRes.data);
        const halls = Array.isArray(hRes.data) ? hRes.data : (hRes.data.data || hRes.data);
        const foods = Array.isArray(fRes.data) ? fRes.data : (fRes.data.data || fRes.data);
        const services = Array.isArray(sRes.data) ? sRes.data : (sRes.data.data || sRes.data);

        this.restaurants = restaurants || [];
        this.halls = halls || [];
        this.foods = foods || [];
        this.services = services || [];

        this.restaurantsById = {};
        this.hallsById = {};
        this.foodsById = {};
        this.servicesById = {};

        this.restaurants.forEach(r => {
          const id = r.id || r.restaurant_id;
          if (id != null) this.restaurantsById[id] = r;
        });
        this.halls.forEach(h => {
          const id = h.id || h.hall_id;
          if (id != null) this.hallsById[id] = h;
        });
        this.foods.forEach(f => {
          const id = f.id || f.food_id;
          if (id != null) this.foodsById[id] = f;
        });
        this.services.forEach(s => {
          const id = s.id || s.service_id;
          if (id != null) this.servicesById[id] = s;
        });
      } catch (err) {
        console.error('Lỗi tải dữ liệu tham chiếu:', err.response || err.message);
      }
    },

    userName(id) {
      if (!id && id !== 0) return '-';
      const u = this.usersById[id];
      if (!u) return id || '-';
      return u.name || u.full_name || u.username || u.email || String(id);
    },

    restaurantName(id) {
      if (!id && id !== 0) return '-';
      const r = this.restaurantsById[id];
      if (!r) return id || '-';
      return r.name || r.title || r.ten || r.restaurant_name || String(id);
    },

    hallName(id) {
      if (!id && id !== 0) return '-';
      const h = this.hallsById[id];
      if (!h) return id || '-';
      return h.name || h.ten || h.hall_name || String(id);
    },
    foodName(id) {
      if (!id && id !== 0) return '-';
      const f = this.foodsById[id];
      if (!f) return id || '-';
      return f.name || f.title || f.ten || f.food_name || String(id);
    },
    serviceName(id) {
      if (!id && id !== 0) return '-';
      const s = this.servicesById[id];
      if (!s) return id || '-';
      return s.name || s.title || s.ten || s.service_name || String(id);
    },
    async getSuggestionPackages() {
      try {
        const res = await api.get('/suggestion-packages');
        // handle different response envelopes
        const data = Array.isArray(res.data) ? res.data : (res.data.data || res.data);
        this.suggestionPackages = data || [];
        this.currentPage = 1;
      } catch (err) {
        console.error('Lỗi tải gói gợi ý:', err.response || err.message);
      }
    },
    // compute total price of booking foods (price * quantity)
    computeFoodTotal() {
      const foods = this.form.booking_foods || this.form.bookingFoods || this.form.foods || [];
      const getUnit = (f) => {
        if (!f) return 0;
        if (f.price != null) return Number(f.price) || 0;
        if (f.unit_price != null) return Number(f.unit_price) || 0;
        if (f.food && (f.food.price != null || f.food.unit_price != null)) return Number(f.food.price || f.food.unit_price) || 0;
        if (f.foods && (f.foods.price != null || f.foods.unit_price != null)) return Number(f.foods.price || f.foods.unit_price) || 0;
        if (f.food_price != null) return Number(f.food_price) || 0;
        return 0;
      };
      const getQty = (f) => {
        if (!f) return 1;
        if (f.quantity != null) return Number(f.quantity) || 1;
        if (f.qty != null) return Number(f.qty) || 1;
        if (f.quantity_ordered != null) return Number(f.quantity_ordered) || 1;
        return 1;
      };
      return foods.reduce((sum, f) => {
        const p = getUnit(f);
        const q = getQty(f);
        return sum + p * q;
      }, 0);
    },
    // compute total price of booking services
    computeServiceTotal() {
      const services = this.form.booking_services || this.form.bookingServices || this.form.services || [];
      const getPrice = (s) => {
        if (!s) return 0;
        if (s.price != null) return Number(s.price) || 0;
        if (s.unit_price != null) return Number(s.unit_price) || 0;
        if (s.service && (s.service.price != null)) return Number(s.service.price) || 0;
        if (s.services && (s.services.price != null)) return Number(s.services.price) || 0;
        if (s.service_price != null) return Number(s.service_price) || 0;
        return 0;
      };
      return services.reduce((sum, s) => sum + getPrice(s), 0);
    },
    // compute overall price: hall + (tables * sumFood) + sumService
    computePrice() {
      const hallId = this.form.hall_id || this.form.hallId || null;
      const hall = hallId != null ? (this.hallsById[hallId] || this.halls.find(h => (h.id || h.hall_id) == hallId)) : null;
      const hallBase = hall ? (Number(hall.price || hall.base_price || hall.price_per_hall) || 0) : 0;
      const tables = Number(this.form.number_of_tables || this.form.tables || 0) || 0;
      const sumFood = this.computeFoodTotal();
      const sumService = this.computeServiceTotal();
      const total = hallBase + (tables * sumFood) + sumService;
      // debug: log breakdown used to compute price
      console.debug('computePrice breakdown', { hallId, hallBase, tables, sumFood, sumService, total });
      this.form.price = total;
      return total;
    },
    formatPrice(value) {
      return value ? new Intl.NumberFormat('vi-VN').format(value) : '0';
    },
    formatDate(dt) {
      if (!dt) return '-';
      const d = new Date(dt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    },
    async openEditModal(p) {
      const id = p.package_id != null ? p.package_id : p.id;
      if (this.isLoadingEdit) return;
      this.isLoadingEdit = id;
      this.isEditing = true;
      try {
        const res = await api.get(`/suggestion-packages/${id}`);
        const data = res.data && res.data.data ? res.data.data : res.data;
        const pkg = data || res.data || p;

        // prepare suggestion_foods / suggestion_services if present
        let suggestionFoods = pkg.suggestion_foods || pkg.foods || [];
        let suggestionServices = pkg.suggestion_services || pkg.services || [];

        if ((!suggestionFoods || suggestionFoods.length === 0)) {
          try {
            const fRes = await api.get(`/suggestion-packages/${id}/foods`);
            const fData = fRes.data && fRes.data.data ? fRes.data.data : fRes.data;
            suggestionFoods = Array.isArray(fData) ? fData : suggestionFoods;
          } catch (e) {}
        }
        if ((!suggestionServices || suggestionServices.length === 0)) {
          try {
            const sRes = await api.get(`/suggestion-packages/${id}/services`);
            const sData = sRes.data && sRes.data.data ? sRes.data.data : sRes.data;
            suggestionServices = Array.isArray(sData) ? sData : suggestionServices;
          } catch (e) {}
        }

        this.form = {
          ...pkg,
          number_of_tables: (pkg.number_of_tables != null) ? pkg.number_of_tables : 0,
          suggestion_foods: suggestionFoods,
          suggestion_services: suggestionServices,
        };

        // load items for the package's restaurant (prefer backend per-restaurant endpoints)
        const restId = this.form.restaurant_id || this.form.restaurant || null;
        if (restId) {
          try {
            const [hRes, fRes, sRes] = await Promise.all([
              api.get(`/restaurants/${restId}/halls`),
              api.get(`/restaurants/${restId}/foods`),
              api.get(`/restaurants/${restId}/services`),
            ]);
            const mh = Array.isArray(hRes.data) ? hRes.data : (hRes.data.data || hRes.data);
            const mf = Array.isArray(fRes.data) ? fRes.data : (fRes.data.data || fRes.data);
            const ms = Array.isArray(sRes.data) ? sRes.data : (sRes.data.data || sRes.data);
            this.modalHallsList = mh || [];
            this.modalFoodsList = mf || [];
            this.modalServicesList = ms || [];
          } catch (e) {
            // fallback: filter existing lists
            this.modalHallsList = (this.halls || []).filter(h => (h.restaurant_id || h.restaurant) == restId);
            this.modalFoodsList = (this.foods || []).filter(f => (f.restaurant_id || f.restaurant) == restId);
            this.modalServicesList = (this.services || []).filter(s => (s.restaurant_id || s.restaurant) == restId);
          }
        } else {
          // if no restaurant set, clear modal lists so the UI shows nothing until restaurant selected
          this.modalHallsList = [];
          this.modalFoodsList = [];
          this.modalServicesList = [];
        }

        // mark selected flags based on package relations
        const foodIds = (this.form.suggestion_foods || []).map(f => f.food_id || f.foodId || f.id);
        const serviceIds = (this.form.suggestion_services || []).map(s => s.service_id || s.serviceId || s.id);
        if (this.modalHallsList) this.modalHallsList.forEach(h => { h.selected = ((this.form.hall_id || this.form.hall) == (h.hall_id || h.id)); });
        if (this.modalFoodsList) this.modalFoodsList.forEach(f => { f.selected = foodIds.indexOf(f.food_id || f.id) !== -1; });
        if (this.modalServicesList) this.modalServicesList.forEach(s => { s.selected = serviceIds.indexOf(s.service_id || s.id) !== -1; });

        this.showModal = true;
      } catch (err) {
        console.error('Lỗi tải chi tiết gói gợi ý:', err.response || err.message);
        this.form = { ...p };
        this.form.suggestion_foods = this.form.suggestion_foods || [];
        this.form.suggestion_services = this.form.suggestion_services || [];
        this.showModal = true;
      } finally {
        if (this.isLoadingEdit === id) this.isLoadingEdit = null;
      }
    },
    openCreateModal() {
      this.isEditing = false;
      this.form = {
        name: null,
        restaurant_id: null,
        hall_id: null,
        event_type: null,
        number_of_tables: 0,
        description: null,
        image_url: null,
        suggestion_foods: [],
        suggestion_services: [],
      };
      this.modalHallsList = [];
      this.modalFoodsList = [];
      this.modalServicesList = [];
      this.activeTab = 'sanh';
      this.activeFoodTypeId = 1;
      this.showModal = true;
    },
    async onRestaurantChange(restId) {
      // load items for the restaurant or fallback to filtered refs
      const id = restId || this.form.restaurant_id;
      if (!id) {
        this.modalHallsList = [];
        this.modalFoodsList = [];
        this.modalServicesList = [];
        return;
      }
      try {
        const [hRes, fRes, sRes] = await Promise.all([
          api.get(`/restaurants/${id}/halls`),
          api.get(`/restaurants/${id}/foods`),
          api.get(`/restaurants/${id}/services`),
        ]);
        const mh = Array.isArray(hRes.data) ? hRes.data : (hRes.data.data || hRes.data);
        const mf = Array.isArray(fRes.data) ? fRes.data : (fRes.data.data || fRes.data);
        const ms = Array.isArray(sRes.data) ? sRes.data : (sRes.data.data || sRes.data);
        this.modalHallsList = (mh || []).map(h => ({ ...h, selected: false }));
        this.modalFoodsList = (mf || []).map(f => ({ ...f, selected: false }));
        this.modalServicesList = (ms || []).map(s => ({ ...s, selected: false }));
        // clear any previously selected suggestion items when restaurant changes
        this.form.suggestion_foods = [];
        this.form.suggestion_services = [];
        this.form.hall_id = null;
      } catch (e) {
        this.modalHallsList = (this.halls || []).filter(h => (h.restaurant_id || h.restaurant) == id).map(h => ({ ...h, selected: false }));
        this.modalFoodsList = (this.foods || []).filter(f => (f.restaurant_id || f.restaurant) == id).map(f => ({ ...f, selected: false }));
        this.modalServicesList = (this.services || []).filter(s => (s.restaurant_id || s.restaurant) == id).map(s => ({ ...s, selected: false }));
        this.form.suggestion_foods = [];
        this.form.suggestion_services = [];
        this.form.hall_id = null;
      }
    },
    // Handlers used by the modal's tab UI
    selectHall(clickedHall) {
      const list = this.modalHallsList && this.modalHallsList.length ? this.modalHallsList : this.halls;
      const idx = list.findIndex((h) => (h.hall_id || h.id) === (clickedHall.hall_id || clickedHall.id));
      if (idx === -1) return;
      const currentlySelectedIdx = list.findIndex((h) => h.selected);

      // If clicking the currently selected hall -> deselect
      if (currentlySelectedIdx === idx) {
        const newObj = Object.assign({}, list[idx], { selected: false });
        this.$set(list, idx, newObj);
        this.form.hall_id = null;
        return;
      }

      // If another hall already selected -> switch
      list.forEach((h, i) => {
        if (i === idx) this.$set(list, i, Object.assign({}, h, { selected: true }));
        else this.$set(list, i, Object.assign({}, h, { selected: false }));
      });
      this.form.hall_id = list[idx].hall_id || list[idx].id;
      this.computePrice();
    },
    selectFood(selectedFood) {
      const fid = selectedFood.food_id || selectedFood.id;
      if (!fid) return;
      const list = this.modalFoodsList && this.modalFoodsList.length ? this.modalFoodsList : this.foods;
      const idx = list.findIndex((f) => String(f.food_id || f.id) === String(fid));
      if (idx === -1) return;
      const newObj = Object.assign({}, list[idx], { selected: !Boolean(list[idx].selected) });
      this.$set(list, idx, newObj);

      // toggle membership in form.suggestion_foods
      this.form.suggestion_foods = this.form.suggestion_foods || [];
      const existing = this.form.suggestion_foods.findIndex(f => (f.food_id || f.foodId || f.id) === fid);
      if (existing !== -1) this.form.suggestion_foods.splice(existing, 1);
      else this.form.suggestion_foods.push({ food_id: fid });
    },
    selectService(selectedService) {
      const sid = selectedService.service_id || selectedService.id;
      if (!sid) return;
      const list = this.modalServicesList && this.modalServicesList.length ? this.modalServicesList : this.services;
      const idx = list.findIndex((s) => String(s.service_id || s.id) === String(sid));
      if (idx === -1) return;
      const newObj = Object.assign({}, list[idx], { selected: !Boolean(list[idx].selected) });
      this.$set(list, idx, newObj);

      this.form.suggestion_services = this.form.suggestion_services || [];
      const existing = this.form.suggestion_services.findIndex(s => (s.service_id || s.serviceId || s.id) === sid);
      if (existing !== -1) this.form.suggestion_services.splice(existing, 1);
      else this.form.suggestion_services.push({ service_id: sid });
    },
    async saveBooking() {
      this.saving = true;
      console.log('Saving booking...', this.form);
      try {
        const payload = {
          name: this.form.name || null,
          restaurant_id: this.form.restaurant_id || null,
          hall_id: this.form.hall_id || null,
          event_type: this.form.event_type || null,
          number_of_tables: this.form.number_of_tables || 0,
          description: this.form.description || null,
          image_url: this.form.image_url || null,
          suggestion_foods: this.form.suggestion_foods || [],
          suggestion_services: this.form.suggestion_services || [],
        };
        let res;
        if (this.isEditing && this.form.package_id) {
          res = await api.post(`/suggestion-packages/${this.form.package_id}?_method=PUT`, payload);
        } else {
          res = await api.post('/suggestion-packages', payload);
        }

        console.log('Save response:', res && res.data ? res.data : res);
        this.showModal = false;
        // refresh list
        await this.getSuggestionPackages();
        this.successMsg = '✅ Lưu gói gợi ý thành công';
        this.showSuccessMsg = true;
        setTimeout(() => { this.showSuccessMsg = false; }, 3000);
      } catch (err) {
        console.error('Lỗi lưu gói gợi ý:', err);
        const msg = (err && err.response && err.response.data && (err.response.data.message || JSON.stringify(err.response.data))) || err.message || String(err);
        this.successMsg = '❌ Lưu thất bại: ' + msg;
        this.showSuccessMsg = true;
        setTimeout(() => { this.showSuccessMsg = false; }, 4000);
      } finally {
        this.saving = false;
      }
    },
    // Compatibility wrapper: form expects `savePackage`
    savePackage() {
      return this.saveBooking();
    },
    async deleteBooking(id) {
      if (!confirm('Bạn có chắc chắn muốn xóa ?')) return;
      if (this.isDeletingId) return;
      this.isDeletingId = id;
      try {
        await api.delete(`/suggestion-packages/${id}`);
        // remove locally so UI updates immediately
        const keyFn = p => (p.package_id != null ? p.package_id : p.id);
        this.suggestionPackages = this.suggestionPackages.filter(p => keyFn(p) !== id);
        this.successMsg = '✅ Xóa gói gợi ý thành công';
        this.showSuccessMsg = true;
        setTimeout(() => { this.showSuccessMsg = false; }, 3000);
      } catch (err) {
        console.error('Lỗi xóa gói gợi ý:', err.response || err.message);
        const errMsg = (err.response && err.response.data && err.response.data.message) || err.message || String(err);
        this.successMsg = '❌ Xóa thất bại: ' + errMsg;
        this.showSuccessMsg = true;
        setTimeout(() => { this.showSuccessMsg = false; }, 4000);
      } finally {
        this.isDeletingId = null;
      }
    },
    // Compatibility wrapper: table/actions expect `deletePackage`
    deletePackage(id) {
      return this.deleteBooking(id);
    },
    
  },
  computed: {
    // Hall options filtered by current booking's restaurant
    hallOptionsForForm() {
      const restId = this.form.restaurant_id != null ? this.form.restaurant_id : (this.form.restaurant || null);
      const filtered = this.halls.filter(h => {
        // try matching by restaurant_id or restaurant property on hall
        const r = h.restaurant_id != null ? h.restaurant_id : (h.restaurant || null);
        return r == restId;
      });
      return filtered.map(h => ({ value: h.id || h.hall_id, text: h.name || h.ten || h.hall_name || String(h.id || h.hall_id) }));
    }
    ,
    paginatedSuggestionPackages() {
      const start = (this.currentPage - 1) * this.perPage;
      return (this.suggestionPackages || []).slice(start, start + this.perPage);
    }
    ,
    modalHalls() {
      if (this.modalHallsList && this.modalHallsList.length) return this.modalHallsList;
      const restId = this.form && (this.form.restaurant_id || this.form.restaurant);
      if (!restId) return [];
      return (this.halls || []).filter(h => (h.restaurant_id || h.restaurant) == restId);
    },
    restaurantOptions() {
      return (this.restaurants || []).map(r => ({ value: r.id || r.restaurant_id, text: r.name || r.title || r.ten || String(r.id || r.restaurant_id) }));
    },
    modalFoods() {
      if (this.modalFoodsList && this.modalFoodsList.length) return this.modalFoodsList;
      const restId = this.form && (this.form.restaurant_id || this.form.restaurant);
      if (!restId) return [];
      return (this.foods || []).filter(f => (f.restaurant_id || f.restaurant) == restId);
    },
    modalServices() {
      if (this.modalServicesList && this.modalServicesList.length) return this.modalServicesList;
      const restId = this.form && (this.form.restaurant_id || this.form.restaurant);
      if (!restId) return [];
      return (this.services || []).filter(s => (s.restaurant_id || s.restaurant) == restId);
    },
    filteredFoods() {
      // If no restaurant selected, don't show any foods
      const restId = this.form && (this.form.restaurant_id || this.form.restaurant);
      if (!restId) return [];

      const list = (this.modalFoods && this.modalFoods.length) ? this.modalFoods : (this.foods || []);
      // coerce types to Number to handle string IDs coming from API
      const activeType = Number(this.activeFoodTypeId || 0);
      return list.filter(food => Number(food.food_type_id || food.type_id || 0) === activeType);
    }
  },
  watch: {
    'form.hall_id'(newVal, oldVal) {
      this.computePrice();
    },
    'form.number_of_tables'(newVal, oldVal) {
      this.computePrice();
    }
  },
  mounted() {
    console.log('GoiGoiY mounted');
    this.loadRefs()
      .then(() => this.getSuggestionPackages())
      .catch(() => this.getSuggestionPackages());
  },
};
</script>

<style scoped>
.pop-enter-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.pop-enter-from,
.pop-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* Remove vertical borders on bordered tables but keep horizontal lines */
:deep(.table.table-bordered) {
  border: none !important;
}
:deep(.table.table-bordered) td,
:deep(.table.table-bordered) th {
  border-left: none !important;
  border-right: none !important;
  border-top: 1px solid #e9ecef !important; /* keep horizontal separators */
}
:deep(.table.table-bordered tbody tr td),
:deep(.table.table-bordered tbody tr th) {
  border-bottom: 1px solid #e9ecef !important; /* horizontal line between rows */
}

/* Make header bottom border a bit stronger for separation */
:deep(.table.table-bordered thead th) {
  border-bottom: 2px solid #dee2e6 !important;
}
/* Namespaced styles for GoiGoiY modal tab UI (prefix gg-) */
.gg-booking-tabs { padding: 12px 6px; }
.gg-tabs-header { display:flex; gap:12px; margin-bottom:12px; justify-content:center; }
.gg-tabs-header button { background:transparent; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; }
.gg-tabs-header button.active { background:#2b6fef; color:#fff; }
.gg-tab-content { min-height:180px; display:flex; justify-content:center; }

/* grid for items: 3 per row on desktop, responsive to 1 column on small screens */
.gg-grid { width:100%; display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; }
.gg-hall-list, .gg-food-list, .gg-service-list { padding:6px; max-height:360px; overflow:auto; }
.gg-item { cursor:pointer; padding:0; overflow:hidden; position:relative; }
.gg-item-img { width:100%; height:120px; background:#f5f5f5; display:flex; align-items:center; justify-content:center; }
.gg-item-img img { width:100%; height:100%; object-fit:cover; display:block; }
.gg-item-noimg { color:#777; font-size:13px; padding:6px; }
.gg-item-body { padding:10px; }
.gg-item-title { margin:0 0 6px 0; font-size:14px; }
.gg-item-desc { margin:0; font-size:12px; color:#666; max-height:42px; overflow:hidden; text-overflow:ellipsis; }

/* hover/selected visuals */
.gg-item { transition: box-shadow .15s, transform .12s; border:1px solid #e9ecef; border-radius:6px; }
.gg-item:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
.gg-item.selected { border-color:#28a745; box-shadow:0 0 0 3px rgba(40,167,69,0.06); }

/* select button overlay */
.gg-item-action { position:absolute; top:8px; right:8px; z-index:5; }
.gg-select-btn { font-size:12px; padding:6px 8px; border-radius:4px; border:1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.96); cursor:pointer; transition: all .12s; }
.gg-select-btn.selected { background:#28a745; color:#fff; border-color:#28a745; }
.gg-select-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 12px rgba(0,0,0,0.06); }

.gg-food-container .gg-food-type-tabs { display:flex; gap:10px; margin-bottom:10px; justify-content:center; }
.gg-food-type-tabs button { background:transparent; border:none; padding:6px 10px; cursor:pointer; border-radius:6px; }
.gg-food-type-tabs button.active { border-bottom:3px solid #2b6fef; color:#2b6fef; }

/* small screens adjustments */
@media (max-width: 992px) {
  .gg-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 576px) {
  .gg-grid { grid-template-columns: 1fr; }
  .gg-tabs-header { flex-wrap:wrap; }
  .gg-food-type-tabs { flex-wrap:wrap; }
}

/* Toast notification styles (same as Bookings.vue) */
.booking-toast-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  animation: slideInRight 0.35s ease;
}
.booking-toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 280px;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(2,6,23,0.12);
  font-weight: 600;
}
.booking-toast-content i { font-size: 18px; }

@keyframes slideInRight {
  from { transform: translateX(200px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
 
