<template>
  <div class="suggestion-modal-overlay">
    <div class="suggestion-modal">
      <div class="suggestion-header">
        <h3>Gợi ý menu</h3>
        <div class="suggestion-actions">
          <button type="button" @click="randomPick" class="btn btn-random">Ngẫu nhiên</button>
          <select v-model="previewEventType" class="event-select">
            <option>Đám cưới</option>
            <option>Hội nghị</option>
            <option>Tiệc sinh nhật</option>
          </select>
          <button type="button" class="btn" @click="$emit('close')">Đóng</button>
        </div>
      </div>

      <div v-if="loading" class="muted">Đang tải gói gợi ý...</div>
      <div v-else-if="packages.length === 0" class="muted">Chưa có gói gợi ý cho nhà hàng này.</div>

      <!-- Random preview card -->
      <div class="suggestion-random-container">
        <div class="suggestion-random-card">
          <div class="suggestion-random-left">
            <div class="random-circle">
              <template v-if="!randomPackage">
                <span class="big-question">?</span>
              </template>
              <template v-else>
                <img :src="getImageUrl(randomPackage.image_url)" alt="package" />
              </template>
            </div>
          </div>
          <div class="suggestion-random-body">
            <div class="random-text">
              <template v-if="!randomPackage">
                <p>“Bạn chưa biết chọn món gì? Hãy thử bấm \"Ngẫu nhiên\" để nhận ngay set menu thật hoàn hảo 😉✨”</p>
              </template>
              <template v-else>
                <h4>{{ randomPackage.name }}</h4>
                <div class="meta small">
                  <span>Sảnh: {{ randomPackage.hall ? (randomPackage.hall.name || randomPackage.hall) : (findHallName(randomPackage.hall_id) || '—') }}</span>
                  <span>Tiệc: <strong>{{ previewEventType || randomPackage.event_type || '—' }}</strong></span>
                  <span>Số bàn: <strong>{{ previewNumberOfTables || randomPackage.number_of_tables || '—' }}</strong></span>
                </div>
                <div class="content small">
                  <div class="foods-column">
                    <strong>Món ăn:</strong>
                    <ul>
                      <li v-for="(f, i) in (randomPackage.foods || [])" :key="i">{{ f.name || f.title || ('#' + (f.food_id || f.id || f.menu_id)) }}</li>
                    </ul>
                  </div>
                  <div class="services-column">
                    <strong>Dịch vụ:</strong>
                    <ul>
                      <li v-for="(s, i) in (randomPackage.services || [])" :key="i">{{ s.name || ('#' + (s.service_id || s.id)) }}</li>
                    </ul>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div class="suggestion-random-actions">
            <input v-if="randomPackage" type="number" v-model.number="previewNumberOfTables" min="1" class="tables-input" />
            <button type="button" class="btn btn-apply" :disabled="!randomPackage" @click="applyRandom">ÁP DỤNG</button>
          </div>
        </div>
      </div>

      <div class="suggestion-list">
        <div v-for="pkg in packages" :key="pkg.package_id" class="suggestion-card">
          <div class="suggestion-card-left">
            <img :src="getImageUrl(pkg.image_url)" alt="package" />
          </div>
          <div class="suggestion-card-body">
            <h4>{{ pkg.name }}</h4>
            <div class="meta">
              <span>Sảnh: {{ pkg.hall ? (pkg.hall.name || pkg.hall) : (findHallName(pkg.hall_id) || '—') }}</span>
              <span>Tiệc: {{ pkg.event_type || '—' }}</span>
              <span>Số bàn: {{ pkg.number_of_tables || '—' }}</span>
            </div>
            <div class="content">
              <div class="foods-column">
                <strong>Món ăn:</strong>
                <ul>
                  <li v-for="(f, i) in (pkg.foods || [])" :key="i">{{ f.name || f.title || ('#' + (f.food_id || f.id || f.menu_id)) }}</li>
                </ul>
              </div>
              <div class="services-column">
                <strong>Dịch vụ:</strong>
                <ul>
                  <li v-for="(s, i) in (pkg.services || [])" :key="i">{{ s.name || ('#' + (s.service_id || s.id)) }}</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="suggestion-card-actions">
            <button type="button" class="btn btn-primary" @click="apply(pkg)">Áp dụng</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'SuggestionModal',
  props: { restaurantId: { type: [String, Number], required: false } },
  data() {
    return {
      packages: [],
      loading: false,
      randomPackage: null,
      previewEventType: 'Đám cưới',
      previewNumberOfTables: null,
      // local resource caches for random generation
      _halls: null,
      _foods: null,
      _services: null,
    };
  },
  watch: {
    restaurantId: {
      immediate: true,
      handler() {
        this.fetchPackages();
      }
    }
  },
  methods: {
    async fetchPackages() {
      if (!this.restaurantId) return;
      this.loading = true;
      try {
        const res = await axios.get(`http://localhost:8088/api/suggestion-packages`, { params: { restaurant_id: this.restaurantId } });
        // If API returns a paginator, use data
        this.packages = res.data.data ? res.data.data : res.data;
      } catch (err) {
        console.error('Lỗi fetch suggestion packages', err);
        this.packages = [];
      } finally {
        this.loading = false;
      }
    },

    async _ensureResources() {
      if (!this.restaurantId) return;
      // already loaded
      if (this._halls && this._foods && this._services) return;
      try {
        const [hallsRes, foodsRes, servicesRes] = await Promise.all([
          axios.get(`http://localhost:8088/api/restaurants/${this.restaurantId}/halls`),
          axios.get(`http://localhost:8088/api/restaurants/${this.restaurantId}/foods`),
          axios.get(`http://localhost:8088/api/restaurants/${this.restaurantId}/services`)
        ]);
        this._halls = hallsRes.data && hallsRes.data.data ? hallsRes.data.data : hallsRes.data;
        this._foods = foodsRes.data && foodsRes.data.data ? foodsRes.data.data : foodsRes.data;
        this._services = servicesRes.data && servicesRes.data.data ? servicesRes.data.data : servicesRes.data;
      } catch (err) {
        console.warn('Không thể load resources cho random generation', err);
        this._halls = this._halls || [];
        this._foods = this._foods || [];
        this._services = this._services || [];
      }
    },

    getImageUrl(url) {
      if (!url) return '/img/default-restaurant.jpg';
      if (typeof url === 'string' && url.startsWith('http')) return url;
      if (typeof url === 'string' && url.startsWith('/')) return `http://127.0.0.1:8088${url}`;
      return url;
    },
    apply(pkg) {
      this.$emit('apply-package', pkg);
    },

    async applyRandom() {
      if (!this.randomPackage) return;
      const pkg = Object.assign({}, this.randomPackage);
      if (this.previewEventType) pkg.event_type = this.previewEventType;
      if (this.previewNumberOfTables) pkg.number_of_tables = this.previewNumberOfTables;
      this.$emit('apply-package', pkg);
    },

    async randomPick() {
      // Generate a random package by sampling halls/foods/services of the restaurant
      await this._ensureResources();
      // choose a random hall (may be undefined)
      const halls = this._halls || [];
      const foods = this._foods || [];
      const services = this._services || [];

      const randFrom = (arr) => {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
      };

      const hall = randFrom(halls);

      // choose foods by desired categories:
      // 1 appetizer (khai vị), 2 mains, 1 hotpot (lẩu), 1 dessert, 1 drink
      const lc = (s) => (s || '').toString().toLowerCase();
      const byKeyword = (arr, keywords) => arr.filter(a => keywords.some(k => lc(a.name || a.title || '').includes(k)));

      const appetizers = byKeyword(foods, ['khai', 'salad', 'gỏi', 'starter', 'súp', 'sot']);
      const hotpots = byKeyword(foods, ['lẩu', 'lau']);
      const desserts = byKeyword(foods, ['tráng', 'dessert', 'kem', 'chè', 'cake', 'bánh']);
      const drinks = byKeyword(foods, ['nước', 'drink', 'nước ép', 'nước trái cây', 'cola', 'soda', 'beer', 'rượu', 'tea', 'trà', 'juice']);
      // mains: anything not matched as appetizer/hotpot/dessert/drink
      const usedIds = new Set();
      const filterUnique = (arr) => arr.filter(a => { const id = a.food_id || a.id || a.menu_id || JSON.stringify(a); if (usedIds.has(id)) return false; usedIds.add(id); return true; });

      const pickRandomFrom = (arr, count) => {
        if (!arr || arr.length === 0) return [];
        const pool = arr.slice().sort(() => 0.5 - Math.random());
        return filterUnique(pool).slice(0, count).map(f => ({ ...f }));
      };

      const chosenFoods = [];
      // appetizer 1
      chosenFoods.push(...pickRandomFrom(appetizers.length ? appetizers : foods, 1));
      // hotpot 1
      chosenFoods.push(...pickRandomFrom(hotpots.length ? hotpots : foods, 1));
      // dessert 1
      chosenFoods.push(...pickRandomFrom(desserts.length ? desserts : foods, 1));
      // drink 1
      chosenFoods.push(...pickRandomFrom(drinks.length ? drinks : foods, 1));
      // mains 2 (from remaining foods)
      const remainingForMains = foods.filter(f => !usedIds.has(f.food_id || f.id || f.menu_id || JSON.stringify(f)));
      chosenFoods.push(...pickRandomFrom(remainingForMains.length ? remainingForMains : foods, 2));

      // choose between 0..3 services
      const maxServices = Math.min(3, services.length);
      const sCount = maxServices > 0 ? Math.floor(Math.random() * (maxServices + 1)) : 0;
      const chosenServices = (services.slice().sort(() => 0.5 - Math.random())).slice(0, sCount).map(s => ({ ...s }));

      // determine number of tables: try to use hall capacity if available, else random 5..80
      let tables = null;
      if (this.previewNumberOfTables) tables = this.previewNumberOfTables;
      else if (hall && (hall.capacity || hall.max_tables || hall.number_of_tables)) tables = hall.capacity || hall.max_tables || hall.number_of_tables;
      else tables = Math.floor(Math.random() * 76) + 5;

      const img = (hall && (hall.image_url || hall.image)) || (chosenFoods[0] && (chosenFoods[0].image_url || chosenFoods[0].image)) || null;

      this.randomPackage = {
        package_id: null,
        name: hall ? `Gói ngẫu nhiên: ${hall.name || 'Sảnh'}` : `Gói ngẫu nhiên`,
        image_url: img,
        hall_id: hall ? (hall.hall_id || hall.id) : null,
        hall: hall ? hall : null,
        foods: chosenFoods,
        services: chosenServices,
        event_type: this.previewEventType || 'Đám cưới',
        number_of_tables: tables,
      };
      // set preview fields
      this.previewEventType = this.randomPackage.event_type;
      this.previewNumberOfTables = this.randomPackage.number_of_tables;
    },

    findHallName(hallId) {
      // package may not include hall relation; try to show id
      return hallId ? ('#' + hallId) : null;
    }
  }
}
</script>

<style scoped>
.suggestion-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display:flex;
  justify-content:center;
  align-items: flex-start;
  padding-top: 60px;
  z-index: 2000;
}
.suggestion-modal {
  width: 980px;
  max-height: 80vh;
  background: #fff;
  border-radius: 8px;
  overflow: auto;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.suggestion-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
.suggestion-list { display:flex; flex-direction:column; gap:12px }
.suggestion-card { display:flex; border:1px solid #e6e6e6; padding:12px; border-radius:8px }
.suggestion-card-left img { width:160px; height:120px; object-fit:cover; border-radius:6px }
.suggestion-card-body { flex:1; padding: 0 12px }
.suggestion-card-actions { display:flex; align-items:center }
.meta { display:flex; gap:12px; color:#555; font-size:13px; margin-bottom:8px }
.content { display:flex; gap:18px; }
.content ul { margin:6px 0 0 18px }
.foods-column { flex:1 }
.services-column { width:240px }
.btn { padding:8px 12px; border-radius:6px; cursor:pointer }
.btn-ghost { background: #eaeaea; border: none }
.btn-primary { background: #3748ff; color: #fff; border: none }

/* Random preview card styles */
.btn-random { background: #7be08a; border: none; color: #063; padding:10px 16px; border-radius:20px }
.suggestion-random-container { margin-bottom: 12px }
.suggestion-random-card { display:flex; align-items:center; border:1px solid #e6e6e6; padding:18px; border-radius:8px; background:#fafafa }
.suggestion-random-left { width:160px; display:flex; justify-content:center; align-items:center }
.random-circle { width:120px; height:120px; border-radius:8px; background:#fff; display:flex; justify-content:center; align-items:center; border:1px dashed #ddd }
.random-circle img { width:100%; height:100%; object-fit:cover; border-radius:6px }
.big-question { font-size:48px; color:#111; font-weight:700 }
.suggestion-random-body { flex:1; padding: 0 16px }
.suggestion-random-actions { display:flex; flex-direction:column; gap:8px; align-items:center }
.btn-apply { background:#8a8a8a; color:#fff; border:none; padding:8px 14px; border-radius:6px }
.btn-apply:disabled { opacity:0.5 }
.meta.small { font-size:13px; color:#444 }
.content.small { font-size:13px }
.tables-input { width:80px; padding:6px; border-radius:4px; border:1px solid #ccc }
.event-select { margin:0 12px; padding:6px; border-radius:6px }
</style>
