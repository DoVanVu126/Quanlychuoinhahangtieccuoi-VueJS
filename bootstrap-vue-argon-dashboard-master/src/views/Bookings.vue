<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">QUẢN LÝ ĐẶT TIỆC</h2>
          <p class="text-light">Danh sách và quản lý các đơn đặt tiệc</p>
        </div>
      </div>
    </base-header>

    <div class="container-fluid mt--7">
      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 class="mb-0">Danh sách đặt tiệc</h4>
              <small class="text-muted">Quản lý trạng thái, chỉnh sửa và xóa đơn</small>
            </div>
          </div>

          <div class="table-responsive">
            <b-table :items="paginatedBookings" :fields="fields" responsive hover bordered>
              <template #cell(booking_id)="row">{{ row.item.booking_id || row.item.id }}</template>
              <template #cell(customer_id)="row">{{ userName(row.item.customer_id) }}</template>
              <template #cell(created_by_user_id)="row">{{ userName(row.item.created_by_user_id) }}</template>
              <template #cell(restaurant_id)="row">{{ restaurantName(row.item.restaurant_id) }}</template>
              <template #cell(hall_id)="row">{{ hallName(row.item.hall_id) }}</template>
              <template #cell(event_type)="row">{{ row.item.event_type || '-' }}</template>
              <template #cell(event_date)="row">{{ formatDate(row.item.event_date) }}</template>
              <template #cell(return_date)="row">
                {{ formatDate(row.item.return_date) }}
              </template>

              <template #cell(event_time)="row">{{ row.item.event_time || '-' }}</template>
              <template #cell(number_of_tables)="row">{{ row.item.number_of_tables || 0 }}</template>
              <template #cell(price)="row">{{ formatPrice(row.item.price) }} VNĐ</template>
              <template #cell(status)="row">{{ row.item.status || '-' }}</template>
              <template #cell(created_at)="row">{{ formatDate(row.item.created_at) }}</template>
              <template #cell(actions)="row">
                <!-- Nút Sửa -->
                <b-button size="sm" variant="warning" :disabled="editingId === (row.item.booking_id || row.item.id)"
                  @click="openEditWithLoading(row.item)">
                  <i v-if="editingId === (row.item.booking_id || row.item.id)" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-edit"></i>
                </b-button>

                <!-- Nút Xóa -->
                <b-button size="sm" variant="danger" class="ml-1"
                  :disabled="deletingId === (row.item.booking_id || row.item.id)"
                  @click="deleteBookingWithLoading(row.item.booking_id || row.item.id)">
                  <i v-if="deletingId === (row.item.booking_id || row.item.id)" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-trash"></i>
                </b-button>
              </template>

            </b-table>
            <div class="d-flex justify-content-center mt-3">
              <b-pagination v-model="currentPage" :total-rows="bookings.length" :per-page="perPage" align="center" />
            </div>
          </div>

          <!-- Edit Booking Modal -->
          <b-modal v-model="showModal" title="Chỉnh sửa đặt tiệc" hide-footer size="lg">
            <b-form @submit.stop.prevent="saveBooking">
              <!-- Display only: Customer, Created By, Restaurant -->
              <b-row>
                <b-col md="4">
                  <b-form-group label="Khách hàng">
                    <div class="form-control-plaintext">{{ userName(form.customer_id) }}</div>
                  </b-form-group>
                </b-col>
                <b-col md="4">
                  <b-form-group label="Người tạo">
                    <div class="form-control-plaintext">{{ userName(form.created_by_user_id) }}</div>
                  </b-form-group>
                </b-col>
                <b-col md="4">
                  <b-form-group label="Nhà hàng">
                    <div class="form-control-plaintext">{{ restaurantName(form.restaurant_id) }}</div>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row>
                <b-col md="6">
                  <b-form-group label="Sảnh" label-for="hall_id">
                    <b-form-select id="hall_id" v-model="form.hall_id" :options="hallOptionsForForm"
                      :placeholder="'- Chọn sảnh -'" />
                  </b-form-group>
                </b-col>
                <b-col md="6">
                  <b-form-group label="Loại tiệc" label-for="event_type">
                    <b-form-select id="event_type" v-model="form.event_type"
                      :options="[{ value: 'Đám cưới', text: 'Đám cưới' }, { value: 'Hội nghị', text: 'Hội nghị' }, { value: 'Tiệc sinh nhật', text: 'Tiệc sinh nhật' }, { value: 'Khác', text: 'Khác' }]"
                      :placeholder="'- Chọn loại -'" />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row>
                <b-col md="4">
                  <b-form-group label="Ngày tổ chức" label-for="event_date">
                    <b-form-input id="event_date" type="date" v-model="form.event_date" />
                  </b-form-group>
                </b-col>
                <b-col md="4">
                  <b-form-group label="Ngày trả" label-for="return_date">
                    <b-form-input id="return_date" type="date" v-model="form.return_date" />
                  </b-form-group>
                </b-col>
                <b-col md="4">
                  <b-form-group label="Giờ" label-for="event_time">
                    <b-form-select id="event_time" v-model="form.event_time"
                      :options="[{ value: '09:00:00', text: '09:00' }, { value: '16:00:00', text: '16:00' }]"
                      :placeholder="'- Chọn giờ -'" />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row>
                <b-col md="4">
                  <b-form-group label="Số bàn" label-for="number_of_tables">
                    <b-form-input id="number_of_tables" type="number" v-model.number="form.number_of_tables" min="0" />
                  </b-form-group>
                </b-col>
                <b-col md="4">
                  <b-form-group label="Giá" label-for="price">
                    <div class="form-control-plaintext">{{ formatPrice(form.price) }} VNĐ</div>
                  </b-form-group>
                </b-col>
                <b-col md="4">
                  <b-form-group label="Trạng thái" label-for="status">
                    <b-form-select id="status" v-model="form.status"
                      :options="[{ value: 'pending', text: 'pending' }, { value: 'completed', text: 'completed' }]"
                      :placeholder="'- Chọn trạng thái -'" />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-form-group label="Ghi chú" label-for="notes">
                <b-form-textarea id="notes" v-model="form.notes" rows="3" />
              </b-form-group>

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
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      bookings: [],
      currentPage: 1,
      perPage: 10,
      users: [],
      restaurants: [],
      halls: [],
      usersById: {},
      restaurantsById: {},
      hallsById: {},
      form: {},
      showModal: false,
      isEditing: false,
      saving: false,
      fields: [
        { key: 'booking_id', label: 'ID', sortable: true },
        { key: 'customer_id', label: 'Khách hàng' },
        { key: 'created_by_user_id', label: 'Người dùng' },
        { key: 'restaurant_id', label: 'Nhà hàng' },
        { key: 'hall_id', label: 'Sảnh' },
        { key: 'event_type', label: 'Loại tiệc' },
        { key: 'event_date', label: 'Ngày đặt' },
        { key: 'event_time', label: 'Giờ' },
        { key: 'return_date', label: 'Ngày trả' },
        { key: 'number_of_tables', label: 'Số bàn' },
        { key: 'price', label: 'Giá' },
        { key: 'status', label: 'Trạng thái' },
        { key: 'notes', label: 'Ghi chú' },
        { key: 'created_at', label: 'Tạo lúc' },
        { key: 'actions', label: 'Hành động' },
      ],
      editingId: null,
      deletingId: null,
    };
  },
  methods: {
    async loadRefs() {
      try {
        const [rRes, hRes, uRes] = await Promise.all([
          api.get('/restaurants'),
          api.get('/halls'),
          api.get('/users'),
        ]);

        const restaurants = Array.isArray(rRes.data) ? rRes.data : (rRes.data.data || rRes.data);
        const halls = Array.isArray(hRes.data) ? hRes.data : (hRes.data.data || hRes.data);
        const users = Array.isArray(uRes.data) ? uRes.data : (uRes.data.data || uRes.data);

        this.restaurants = restaurants || [];
        this.halls = halls || [];
        this.users = users || [];

        this.restaurantsById = {};
        this.hallsById = {};
        this.usersById = {};

        this.restaurants.forEach(r => {
          const id = r.id || r.restaurant_id;
          if (id != null) this.restaurantsById[id] = r;
        });
        this.halls.forEach(h => {
          const id = h.id || h.hall_id;
          if (id != null) this.hallsById[id] = h;
        });
        this.users.forEach(u => {
          const id = u.id || u.user_id || u.customer_id;
          if (id != null) this.usersById[id] = u;
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
    async getBookings() {
      try {
        const res = await api.get('/bookings');
        // handle different response envelopes
        const data = Array.isArray(res.data) ? res.data : (res.data.data || res.data);
        this.bookings = data || [];
        this.currentPage = 1;
      } catch (err) {
        console.error('Lỗi tải đặt tiệc:', err.response || err.message);
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
      d.setHours(d.getHours() + 7); // Fix UTC -> GMT+7 Việt Nam

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');

      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }
    ,
    async openEditModal(b) {
      const id = b.booking_id != null ? b.booking_id : b.id;
      this.isEditing = true;
      try {
        const res = await api.get(`/bookings/${id}`);
        // support envelope { data: {...} } or direct object
        const data = res.data && res.data.data ? res.data.data : res.data;
        const booking = data || res.data || b;

        // normalize form and date fields to YYYY-MM-DD for date inputs
        const normalizeDate = (v) => {
          if (!v) return v;
          // if contains time, take the date part
          if (typeof v === 'string' && v.indexOf(' ') !== -1) return v.split(' ')[0];
          // if ISO-like with T
          if (typeof v === 'string' && v.indexOf('T') !== -1) return v.split('T')[0];
          // otherwise return as-is
          return v;
        };

        // prepare booking_foods / booking_services if present
        let bookingFoods = booking.booking_foods || booking.bookingFoods || booking.foods || [];
        let bookingServices = booking.booking_services || booking.bookingServices || booking.services || [];

        // if arrays empty, try fetching via auxiliary endpoints (if backend provides them)
        if ((!bookingFoods || bookingFoods.length === 0)) {
          try {
            const fRes = await api.get(`/bookings/${id}/foods`);
            const fData = fRes.data && fRes.data.data ? fRes.data.data : fRes.data;
            bookingFoods = Array.isArray(fData) ? fData : bookingFoods;
          } catch (e) {
            // ignore if not available
          }
        }
        if ((!bookingServices || bookingServices.length === 0)) {
          try {
            const sRes = await api.get(`/bookings/${id}/services`);
            const sData = sRes.data && sRes.data.data ? sRes.data.data : sRes.data;
            bookingServices = Array.isArray(sData) ? sData : bookingServices;
          } catch (e) {
            // ignore if not available
          }
        }

        // debug: log what foods/services we received for this booking
        console.debug('openEditModal: booking id=', id, { bookingFoods, bookingServices, booking });

        this.form = {
          ...booking,
          event_date: normalizeDate(booking.event_date),
          return_date: normalizeDate(booking.return_date),
          // ensure number_of_tables field exists
          number_of_tables: (booking.number_of_tables != null) ? booking.number_of_tables : (booking.tables || 0),
          booking_foods: bookingFoods,
          booking_services: bookingServices,
        };

        // compute price after loading booking details
        this.$nextTick(() => this.computePrice());
        this.showModal = true;
      } catch (err) {
        // fallback to using provided row data
        console.error('Lỗi tải chi tiết đặt tiệc:', err.response || err.message);
        this.form = { ...b };
        // try to normalize if possible
        if (this.form.event_date && typeof this.form.event_date === 'string') this.form.event_date = this.form.event_date.split('T')[0].split(' ')[0];
        if (this.form.return_date && typeof this.form.return_date === 'string') this.form.return_date = this.form.return_date.split('T')[0].split(' ')[0];
        // ensure booking_foods/booking_services exist for fallback
        this.form.booking_foods = this.form.booking_foods || this.form.bookingFoods || [];
        this.form.booking_services = this.form.booking_services || this.form.bookingServices || [];
        // compute price from fallback data
        this.$nextTick(() => this.computePrice());
        this.showModal = true;
      }
    },
    async openEditWithLoading(row) {
      const id = row.booking_id || row.id;
      if (this.editingId) return;

      this.editingId = id;
      try {
        await this.openEditModal(row);
      } finally {
        this.editingId = null;
      }
    },

    async saveBooking() {
      this.saving = true;
      console.log('Saving booking...', this.form);
      try {
        const payload = {
          customer_id: this.form.customer_id || null,
          created_by_user_id: this.form.created_by_user_id || null,
          restaurant_id: this.form.restaurant_id || null,
          hall_id: this.form.hall_id || null,
          event_type: this.form.event_type || null,
          event_time: this.form.event_time || null,
          event_date: this.form.event_date || null,
          return_date: this.form.return_date || null,
          number_of_tables: this.form.number_of_tables || 0,
          price: this.form.price || 0,
          status: this.form.status || null,
          notes: this.form.notes || null,
        };
        let res;
        if (this.isEditing && this.form.booking_id) {
          res = await api.post(`/bookings/${this.form.booking_id}?_method=PUT`, payload);
        } else {
          res = await api.post('/bookings', payload);
        }

        console.log('Save response:', res && res.data ? res.data : res);
        this.showModal = false;
        // refresh list
        await this.getBookings();
        window.alert('Lưu đặt tiệc thành công');
      } catch (err) {
        console.error('Lỗi lưu đặt tiệc:', err);
        const msg = (err && err.response && err.response.data && (err.response.data.message || JSON.stringify(err.response.data))) || err.message || String(err);
        window.alert('Lỗi khi lưu: ' + msg);
      } finally {
        this.saving = false;
      }
    },
    async deleteBookingWithLoading(id) {
      if (this.deletingId) return;

      const ok = confirm('Bạn có chắc chắn muốn xóa ?');
      if (!ok) return;

      this.deletingId = id;

      try {
        await api.delete(`/bookings/${id}`);

        const keyFn = b => (b.booking_id != null ? b.booking_id : b.id);
        this.bookings = this.bookings.filter(b => keyFn(b) !== id);

        window.alert('Xóa thành công');
      } catch (err) {
        console.error('Lỗi xóa đặt tiệc:', err.response || err.message);
        window.alert('Xóa thất bại');
      } finally {
        this.deletingId = null;
      }
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
    paginatedBookings() {
      const start = (this.currentPage - 1) * this.perPage;
      return (this.bookings || []).slice(start, start + this.perPage);
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
    console.log('Bookings mounted');
    this.loadRefs()
      .then(() => this.getBookings())
      .catch(() => this.getBookings());
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
  border-top: 1px solid #e9ecef !important;
  /* keep horizontal separators */
}

:deep(.table.table-bordered tbody tr td),
:deep(.table.table-bordered tbody tr th) {
  border-bottom: 1px solid #e9ecef !important;
  /* horizontal line between rows */
}

/* Make header bottom border a bit stronger for separation */
:deep(.table.table-bordered thead th) {
  border-bottom: 2px solid #dee2e6 !important;
}
</style>
