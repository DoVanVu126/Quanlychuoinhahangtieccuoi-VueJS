<template>
  <section class="saved-promos-page">

    <!-- HEADER BAR (đẹp + có khung) -->
    <div class="top-bar">

      <!-- Nút Home -->
      <button class="btn-home" @click="$router.push('/home')">
        ⬅️ Trang chủ
      </button>

      <!-- Các bộ lọc -->
      <div class="filters">

        <div class="filter-box">
          <label>🍽 Nhà hàng</label>
          <select v-model="selectedRestaurant" @change="filterPromotions">
            <option value="">Tất cả</option>
            <option
              v-for="r in restaurants"
              :key="r.restaurant_id"
              :value="r.restaurant_id"
            >
              {{ r.name }}
            </option>
          </select>
        </div>

        <div class="filter-box">
          <label>💸 Mức giảm</label>
          <select v-model="selectedDiscount" @change="filterPromotions">
            <option value="">Tất cả</option>
            <option value="10">Từ 10%</option>
            <option value="20">Từ 20%</option>
            <option value="30">Từ 30%</option>
            <option value="50000">Từ 50.000₫</option>
            <option value="100000">Từ 100.000₫</option>
          </select>
        </div>

      </div>
    </div>

    <h2 class="page-title">Mã khuyến mãi đã lưu</h2>

    <div v-if="filteredPromotions.length === 0" class="no-promos">
      Không có mã khuyến mãi phù hợp
    </div>

    <!-- PHẦN DANH SÁCH -->
    <div class="promo-container">
      <div
        v-for="promo in filteredPromotions"
        :key="promo.user_promotion_id"
        class="promo-card"
      >
        <!-- Banner -->
        <div class="promo-banner">
          <img
            :src="promo.image"
            class="banner-img"
            @error="handleImageError"
          />

          <div class="discount-badge">
            <span v-if="promo.discount_type === 'percent'">
              -{{ promo.discount_value }}%
            </span>
            <span v-else>
              -{{ formatMoney(promo.discount_value) }}₫
            </span>
          </div>

          <div class="promo-code-tag">
            <span>{{ promo.promotion_code }}</span>
          </div>
        </div>

        <div class="promo-info">
          <h3 class="promo-title">{{ promo.title }}</h3>
          <p class="restaurant">🍽 {{ getRestaurantName(promo.restaurant_id) }}</p>
          <p class="date">📅 {{ formatDate(promo.start_date) }} → {{ formatDate(promo.end_date) }}</p>
          <p class="desc">{{ promo.description || "Không có mô tả" }}</p>
        </div>

        <div class="promo-actions">
          <button class="btn copy" @click="copyPromoCode(promo.promotion_code)">📋 Copy</button>
          <button class="btn delete" @click="removeSavedPromo(promo.user_promotion_id)">🗑️ Xóa</button>
        </div>

      </div>
    </div>
  </section>
</template>

<script>
import api from "@/api";

export default {
  name: "SavedPromotions",
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")),
      savedPromotions: [],
      filteredPromotions: [],
      restaurants: [],

      selectedRestaurant: "",
      selectedDiscount: ""
    };
  },

  mounted() {
    if (!this.user) return this.$router.push("/login");

    this.loadRestaurants();
    this.loadSavedPromotions();
  },

  methods: {
    async loadRestaurants() {
      try {
        const res = await api.get("/restaurants");
        this.restaurants = res.data || [];
      } catch (err) {
        console.error("Lỗi tải nhà hàng:", err);
      }
    },

    async loadSavedPromotions() {
      try {
        const res = await api.get(`/user-promotions?user_id=${this.user.user_id}`);

        this.savedPromotions = res.data.map((p) => ({
          user_promotion_id: p.user_promotion_id,
          promotion_id: p.promotion_id,
          title: p.title,
          description: p.description,
          promotion_code: p.promotion_code,
          discount_type: p.discount_type,
          discount_value: p.discount_value,
          start_date: p.start_date,
          end_date: p.end_date,
          image: p.image
            ? p.image.startsWith("http")
              ? p.image
              : "http://127.0.0.1:8088/" + p.image.replace(/^\/+/, "")
            : "/img/default.jpg",
          restaurant_id: p.restaurant_id
        }));

        this.filteredPromotions = [...this.savedPromotions];
      } catch (err) {
        console.error("Lỗi tải mã:", err);
      }
    },

    // ⭐ FILTER COMBO: theo nhà hàng + theo mức giảm
    filterPromotions() {
      let data = [...this.savedPromotions];

      // Lọc theo nhà hàng
      if (this.selectedRestaurant) {
        data = data.filter(
          (p) => p.restaurant_id == this.selectedRestaurant
        );
      }

      // Lọc theo mức giảm
      if (this.selectedDiscount) {
        const value = Number(this.selectedDiscount);

        data = data.filter((p) => {
          if (p.discount_type === "percent") {
            return p.discount_value >= value;
          } else {
            return p.discount_value >= value;
          }
        });
      }

      this.filteredPromotions = data;
    },

    getRestaurantName(id) {
      const r = this.restaurants.find(r => r.restaurant_id === id);
      return r ? r.name : "Không xác định";
    },

    copyPromoCode(code) {
      navigator.clipboard.writeText(code);
      alert(`Đã copy mã: ${code}`);
    },

    async removeSavedPromo(id) {
      if (!confirm("Bạn chắc chắn muốn xóa?")) return;

      try {
        await api.delete(`/user-promotions/${id}`);
        this.savedPromotions = this.savedPromotions.filter(
          (p) => p.user_promotion_id !== id
        );
        this.filterPromotions();
      } catch (err) {
        alert("Xóa thất bại!");
      }
    },

    handleImageError(e) {
      e.target.src = "/img/default.jpg";
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN");
    },

    formatMoney(num) {
      return new Intl.NumberFormat("vi-VN").format(num);
    }
  }
};
</script>

<style scoped>
/* --- LAYOUT TRANG --- */
.saved-promos-page {
  max-width: 1000px;
  margin: 25px auto;
  padding: 10px;
  background: #f8fafc;
  border-radius: 22px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding-bottom: 40px;
}

/* --- HEADER + FILTERS BAR --- */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 16px 20px;
  border-radius: 16px;
  margin-bottom: 25px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

/* Nút Home */
.btn-home {
  background: #2563eb;
  color: white;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}
.btn-home:hover {
  background: #1e40af;
}

/* Filters */
.filters {
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-box label {
  font-size: 14px;
  font-weight: 600;
}

.filter-box select {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #bfc7d5;
  margin-left: 6px;
  background: #f1f5f9;
  font-weight: 600;
}

/* --- TITLE --- */
.page-title {
  text-align: center;
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 20px;
}

/* --- PROMO GRID --- */
.promo-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 22px;
  padding: 10px;
}

/* --- CARD --- */
.promo-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 22px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  transition: 0.25s ease;
  border: 1px solid #e5e7eb;
}
.promo-card:hover {
  transform: translateY(-6px);
}

/* --- BANNER --- */
.promo-banner {
  position: relative;
}
.banner-img {
  width: 100%;
  height: 170px;
  object-fit: cover;
}

/* Badge giảm giá */
.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #ff5f6d, #ffc371);
  padding: 8px 14px;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
}

/* Code tag */
.promo-code-tag {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: #fff;
  padding: 6px 14px;
  border-radius: 10px;
  border: 2px dashed #2563eb;
  color: #2563eb;
  font-size: 14px;
  font-weight: 700;
}

/* --- INFO --- */
.promo-info {
  padding: 16px;
}
.promo-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}
.restaurant, .date, .desc {
  color: #475569;
  margin: 4px 0;
}

/* --- BUTTONS --- */
.promo-actions {
  display: flex;
  gap: 10px;
  padding: 14px 16px 20px;
}

.btn {
  flex: 1;
  padding: 9px;
  border-radius: 10px;
  color: white;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.copy {
  background: #3b82f6;
}
.copy:hover {
  background: #1d4ed8;
}

.delete {
  background: #ef4444;
}
.delete:hover {
  background: #b91c1c;
}
</style>
