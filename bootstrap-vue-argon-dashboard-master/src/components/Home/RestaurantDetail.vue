<template>
  <section class="restaurant-detail-page">
    <HomeHeader />

    <div class="container detail-container" v-if="!loading">
      <div v-if="error" class="text-red-600">{{ error }}</div>

      <div v-else>
        <!-- ===================== THÔNG TIN NHÀ HÀNG ====================== -->
        <div class="detail-header">
          <img
            :src="getImageUrl(restaurant.image_url)"
            alt="restaurant"
            @error="onImgError($event)"
            class="detail-image"
          />

          <div class="detail-meta">
            <h1>{{ restaurant.name }}</h1>

            <p class="muted">
              <i class="fa fa-map-marker detail-icon"></i>
              {{ restaurant.ward }}, {{ restaurant.city }}
            </p>

            <p>
              <i class="fa fa-tag detail-icon"></i>
              <span class="price-label">Giá trung bình / bàn:</span>
              từ ~ {{ formatPrice(restaurant.price_table) }}đ
            </p>

            <p>
              <i class="fa fa-users detail-icon"></i>
              Sức chứa: {{ restaurant.capacity || "—" }}
            </p>

            <p>
              <i class="fa fa-building detail-icon"></i>
              Số sảnh: {{ getHalls(restaurant) }}
            </p>

            <p>
              <i class="fa fa-gift detail-icon"></i>
              Khuyến mãi: {{ getHasPromo(restaurant) ? "Có" : "Không" }}
            </p>

            <div class="detail-actions">
              <button @click="goToBooking" class="btn btn-primary">
                Đặt tiệc
              </button>
              <button @click="goBack" class="btn btn-secondary">Quay lại</button>
            </div>
          </div>
        </div>

        <!-- ===================== MÔ TẢ ====================== -->
        <div class="detail-body">
          <h3>Mô tả</h3>
          <p v-html="restaurant.description || 'Chưa có mô tả.'"></p>

          <div v-if="restaurant.halls && restaurant.halls.length">
            <h3>Danh sách sảnh</h3>
            <ul>
              <li v-for="(h, idx) in restaurant.halls" :key="idx">
                <strong>{{ h.name || 'Sảnh ' + (idx + 1) }}</strong>
                — Sức chứa: {{ h.capacity || "—" }}
              </li>
            </ul>
          </div>
        </div>

        <!-- ===================== ĐÁNH GIÁ ========================== -->
        <div class="reviews-section mt-5">
          <h2 class="review-title">
            <i class="fas fa-star-half-alt"></i> Đánh giá & Nhận xét
          </h2>

          <!-- FORM REVIEW -->
          <div class="review-form-card" v-if="userId">
            <h4 class="review-form-title">
              {{ editing ? "Chỉnh sửa đánh giá" : "Gửi đánh giá của bạn" }}
            </h4>

            <div class="user-info">
              <img
                v-if="user && user.image_url"
                :src="avatarUrl(user.image_url)"
                class="user-avatar"
                @error="handleAvatarError"
              />
              <span>{{ user && user.username ? user.username : 'Bạn' }}</span>
            </div>

            <div
              class="stars-select"
              :class="{ disabled: userHasReview && !editing }"
            >
              <span
                v-for="s in 5"
                :key="s"
                class="star"
                :class="{ active: reviewForm.star_rating >= s }"
                @click="!userHasReview || editing ? (reviewForm.star_rating = s) : null"
              >★</span>
            </div>

            <textarea
              v-model="reviewForm.comment"
              class="review-input"
              :disabled="userHasReview && !editing"
              placeholder="Chia sẻ trải nghiệm của bạn..."
              rows="3"
            ></textarea>

            <div class="review-btns">
              <button
  @click="submitReview"
  class="btn-submit"
  :disabled="userHasReview && !editing || submittingReview"
>
  <span v-if="submittingReview">Đang gửi...</span>
  <span v-else>{{ editing ? "Cập nhật" : "Gửi đánh giá" }}</span>
</button>

              <button v-if="editing" @click="cancelEdit" class="btn-cancel">
                Hủy
              </button>
            </div>
          </div>

          <!-- LIST REVIEW -->
          <div class="review-list mt-4">
             <div v-if="reviewsLoading" class="reviews-loading">
    <div class="reviews-spinner"></div>
    <div class="reviews-loading-text">Đang tải đánh giá...</div>
  </div>
            <p v-if="reviews.length === 0" class="no-review">
              Chưa có đánh giá nào.
            </p>

            <div class="review-card" v-for="r in reviews" :key="r.review_id">
              <img
                :src="r.avatar ? avatarUrl(r.avatar) : defaultAvatar"
                class="review-avatar"
                @error="handleAvatarError"
              />

              <div class="review-info">
                <div class="review-head">
                  <div class="left">
                    <strong>{{ r.user_name }}</strong>
                    <div class="review-stars">
                      <span v-for="n in r.star_rating" :key="n">⭐</span>
                    </div>
                  </div>

                  <div v-if="r.user_id === userId" class="menu-wrapper">
                    <button class="menu-btn" @click="toggleMenu(r.review_id)">⋮</button>

                    <div
                      v-if="openMenuId === r.review_id"
                      class="menu-dropdown"
                      @mouseleave="openMenuId = null"
                    >
                      <div class="menu-item" @click="editReview(r)">✏ Sửa</div>
                      <div class="menu-item delete" @click="deleteReview(r.review_id)">🗑 Xóa</div>
                    </div>
                  </div>
                </div>

                <p class="review-text">{{ r.comment }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="detail-loading">
      <div class="detail-spinner"></div>
      <div class="detail-loading-text">Đang tải chi tiết nhà hàng...</div>
    </div>
  </section>
</template>

<script>
import axios from "axios";
import HomeHeader from "@/components/Home/HomeHeader.vue";

export default {
  name: "RestaurantDetail",
  components: { HomeHeader },
  props: { id: { type: [String, Number], required: true } },

  data() {
    return {
      restaurant: {},
      loading: true,
      error: null,
      reviews: [],
      reviewsLoading: false, // ← loading đánh giá
      reviewForm: { star_rating: 0, comment: "" },
      editing: false,
      editingId: null,
      submittingReview: false,
      openMenuId: null,
      userId: (JSON.parse(localStorage.getItem("user")) || {}).user_id || null,
      user: JSON.parse(localStorage.getItem("user")) || null,
      defaultAvatar: "/img/default-avatar.png",
    };
  },

  computed: {
    userHasReview() {
      return this.reviews.some(r => r.user_id === this.userId);
    }
  },

  mounted() {
    this.fetchRestaurant();
    this.fetchReviews();
  },

  methods: {
    async fetchRestaurant() {
      this.loading = true;
      try {
        const res = await axios.get(`http://localhost:8088/api/restaurants/${this.id}`);
        this.restaurant = res.data.data || res.data;
      } catch {
        this.error = "Không thể tải thông tin nhà hàng.";
      } finally {
        this.loading = false;
      }
    },

    async fetchReviews() {
      this.reviewsLoading = true;
      try {
        const res = await axios.get(`http://localhost:8088/api/reviews/${this.id}`);
        this.reviews = res.data.data || res.data;
      } catch (err) {
        console.error("Lỗi tải đánh giá:", err);
      } finally {
        this.reviewsLoading = false;
      }
    },

    async submitReview() {
  if (this.submittingReview) return; // đang gửi, không làm gì
  if (!this.reviewForm.star_rating) return alert("Bạn chưa chọn số sao!");
  if (!this.editing && this.userHasReview) return alert("Bạn đã đánh giá nhà hàng này rồi!");

  this.submittingReview = true; // khóa nút
  try {
    if (this.editing) {
      await axios.put(`http://localhost:8088/api/reviews/${this.editingId}`, {
        ...this.reviewForm,
      });
    } else {
      await axios.post("http://localhost:8088/api/reviews", {
        restaurant_id: this.id,
        user_id: this.userId,
        ...this.reviewForm,
      });
    }
    await this.fetchReviews(); // tải lại danh sách sau khi submit
    this.cancelEdit();
  } catch (err) {
    console.error("Lỗi gửi đánh giá:", err);
  } finally {
    this.submittingReview = false; // mở khóa nút
  }
},

    editReview(rv) {
      this.editing = true;
      this.editingId = rv.review_id;
      this.reviewForm.star_rating = rv.star_rating;
      this.reviewForm.comment = rv.comment;
    },

    cancelEdit() {
      this.editing = false;
      this.editingId = null;
      this.reviewForm = { star_rating: 0, comment: "" };
    },

    async deleteReview(id) {
      if (!confirm("Xóa đánh giá này?")) return;
      try {
        await axios.delete(`http://localhost:8088/api/reviews/${id}`);
        this.fetchReviews();
      } catch (err) {
        console.error("Lỗi xóa đánh giá:", err);
      }
    },

    toggleMenu(id) {
      this.openMenuId = this.openMenuId === id ? null : id;
    },

    handleAvatarError(e) {
      e.target.src = this.defaultAvatar;
    },

    avatarUrl(url) {
      if (!url) return this.defaultAvatar;
      return url.startsWith("http") ? url : `http://127.0.0.1:8088/${url}`;
    },

    goToBooking() {
      this.$router.push({ name: "DatTiec", query: { restaurant_id: this.id } });
    },
    goBack() { this.$router.go(-1); },

    formatPrice(value) {
      if (!value) return "0";
      return new Intl.NumberFormat("vi-VN").format(value);
    },

    getHalls(rest) {
      if (!rest) return "—";
      return (
        rest.halls_count ||
        rest.hall_count ||
        rest.sanh_count ||
        rest.number_of_halls ||
        (rest.halls && rest.halls.length) ||
        "—"
      );
    },

    getHasPromo(rest) {
      if (!rest) return false;
      return (
        rest.has_promo ||
        rest.hasPromotion ||
        rest.promo ||
        (rest.promotions && rest.promotions.length > 0)
      );
    },

    getImageUrl(url) {
      const DEFAULT = "/img/default-restaurant.jpg";
      if (!url) return DEFAULT;
      return url.startsWith("http") ? url : `http://127.0.0.1:8088/${url}`;
    },

    onImgError(e) { e.target.src = "/img/default-restaurant.jpg"; },
  },
};
</script>

<style scoped>
/* Luxurious, elegant styling for Restaurant detail page */
.detail-container {
  max-width: 1100px;
  margin: 36px auto;
  padding: 28px;
  background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(250,250,250,0.86));
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(16,24,40,0.04);
}

.detail-header {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

.detail-image {
  width: 420px;
  height: 280px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 14px 40px rgba(17,24,39,0.18);
  border: 1px solid rgba(255, 215, 0, 0.06); /* subtle gold edge */
  transition: transform 240ms ease, box-shadow 240ms ease;
}
.detail-image:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 20px 50px rgba(17,24,39,0.22);
}

.detail-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-meta h1 {
  margin: 0 0 6px 0;
  font-size: 28px;
  letter-spacing: 0.6px;
  color: #0f172a; /* deep slate */
  font-weight: 700;
}

.detail-meta p { margin: 2px 0; color: #374151; }
.detail-meta p.muted { color: #6b7280; font-style: italic; }

.price-label { color: #b08b3b; font-weight: 700; } /* warm gold */

.detail-actions { margin-top: 18px; display:flex; gap:10px; align-items:center; }
.btn { padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight:600; transition: all 180ms ease; border: 1px solid transparent; }
.btn-primary {
  background: linear-gradient(90deg,#2b2b7a,#5a50ff);
  color: #fff;
  border-color: rgba(255,215,0,0.08);
  box-shadow: 0 8px 20px rgba(79,70,229,0.18);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(79,70,229,0.22); }
.btn-secondary {
  background: transparent;
  color: #0f172a;
  border: 1px solid rgba(15,23,42,0.06);
  margin-left: 0;
}
.btn-secondary:hover { background: rgba(15,23,42,0.02); transform: translateY(-2px); }

.muted { color: #6b7280; }

.detail-body {
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid rgba(15,23,42,0.04);
}
.detail-body h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  letter-spacing: 1px;
  color: #111827;
  text-transform: uppercase;
  font-weight: 700;
}
.detail-body p {
  color: #374151;
  line-height: 1.75;
}

.detail-body ul { padding-left: 18px; margin-top: 8px; }
.detail-body li { margin-bottom: 8px; color: #374151; }

/* Responsive tweaks */
@media (max-width: 880px) {
  .detail-header { flex-direction: column; align-items: center; }
  .detail-image { width: 100%; height: 220px; }
  .detail-container { padding: 20px; }
  .detail-meta h1 { text-align: center; }
  .detail-actions { justify-content: center; }
}

/* Loading spinner for detail page */
.detail-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 12px; }
.detail-loading-text { margin-top:12px; color:#374151; font-weight:600; }
.detail-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(0,0,0,0.08);
  border-top-color: rgba(176,139,59,0.95); /* warm gold */
  border-radius: 50%;
  animation: detail-spin 0.85s linear infinite;
}
@keyframes detail-spin { to { transform: rotate(360deg); } }

/* Icons near data labels */
.detail-icon { color: #b08b3b; margin-right: 8px; font-size: 16px; width: 18px; text-align:center; }


/* Title */
.review-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 25px;
  color: #222;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Form Card */
.review-form-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 3px 20px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
}

.review-form-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

/* Stars Select */
.stars-select {
  font-size: 30px;
  margin: 5px 0 10px;
}

.star {
  cursor: pointer;
  color: #ddd;
  transition: 0.25s;
}

.star.active {
  color: #ffba00;
  text-shadow: 0 0 8px rgba(255,186,0,0.6);
}

.star:hover {
  transform: scale(1.15);
}

/* Input */
.review-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  resize: none;
  font-size: 15px;
}

/* Buttons */
.review-btns {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.btn-submit {
  background: #ff6d00;
  color: white;
  border: none;
  padding: 9px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
}

.btn-submit:hover {
  background: #e65f00;
}

.btn-cancel {
  background: #ddd;
  padding: 9px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

/* Review Card */
.review-card {
  display: flex;
  gap: 15px;
  background: #fff;
  padding: 18px;
  border-radius: 14px;
  margin-bottom: 15px;
  box-shadow: 0 3px 20px rgba(0,0,0,0.05);
  border: 1px solid #efefef;
}

.review-avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  object-fit: cover;
}

.review-info {
  flex: 1;
}

.review-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-stars {
  color: #ffba00;
}

.review-text {
  margin: 6px 0;
  line-height: 1.5;
  color: #444;
}

.review-foot {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

/* Action Buttons */
.act-edit {
  background: #ffc107;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 8px;
}

.act-delete {
  background: #dc3545;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

/* Menu 3 chấm */
.menu-wrapper {
  position: relative;
}

.menu-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.menu-btn:hover {
  background: rgba(0,0,0,0.05);
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 26px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  border: 1px solid #ddd;
  min-width: 110px;
  z-index: 99;
}

.menu-item {
  padding: 10px 14px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background 0.2s;
  border-bottom: 1px solid #eee;
}

.menu-item:last-child { border-bottom: none; }

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.delete {
  color: #dc3545;
  font-weight: 600;
}

.reviews-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.reviews-spinner {
  width: 36px;
  height: 36px;
  border: 4px solid rgba(0,0,0,0.08);
  border-top-color: #ffba00;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.reviews-loading-text {
  margin-top: 10px;
  color: #374151;
  font-weight: 600;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
