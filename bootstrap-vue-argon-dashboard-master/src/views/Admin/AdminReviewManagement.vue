<template>
  <div>
    <!-- Header -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-info">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">QUẢN LÝ ĐÁNH GIÁ</h2>
          <p class="text-light">Theo dõi, xóa tất cả đánh giá nhà hàng</p>
        </div>
      </div>
    </base-header>

    <!-- Nội dung chính -->
    <div class="container-fluid mt--7">
      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden; position: relative;">
        <!-- LOADING OVERLAY chỉ trong card -->
        <div v-if="loading" class="loading-overlay-card">
          <div class="spinner"></div>
          <p class="loading-text">Đang tải dữ liệu...</p>
        </div>

        <div class="card-body">
          <!-- Thanh công cụ -->
          <div class="d-flex justify-content-end mb-3">
            <b-button variant="success" @click="refreshList">↻ Làm mới</b-button>
          </div>

          <!-- Bảng danh sách đánh giá -->
          <div class="table-responsive">
            <table class="table table-hover align-items-center text-center">
              <thead class="thead-light">
                <tr>
                  <th>ID</th>
                  <th>Nhà hàng</th>
                  <th>Người dùng</th>
                  <th>Avatar</th>
                  <th>Đánh giá sao</th>
                  <th>Bình luận</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="review in filteredReviews" :key="review.review_id">
                  <td>{{ review.review_id }}</td>
                  <td>{{ review.restaurant_name }}</td>
                  <td>{{ review.user_name }}</td>
                  <td>
                    <div class="avatar-wrapper">
                      <img
                        v-if="review.loaded"
                        :src="review.avatar"
                        class="avatar-img fade-in"
                        @error="review.avatar = defaultAvatar"
                      />
                      <div v-else class="avatar-loading">
                        <span class="spinner-border spinner-border-sm"></span>
                      </div>
                    </div>
                  </td>
                  <td>{{ review.star_rating }}</td>
                  <td v-html="review.comment"></td>
                  <td>{{ review.created_at }}</td>
                  <td>
                    <b-button size="sm" variant="outline-danger" @click="deleteReview(review.review_id)">Xóa</b-button>
                  </td>
                </tr>
                <tr v-if="filteredReviews.length === 0">
                  <td colspan="8" class="text-center text-muted">Không có đánh giá nào phù hợp</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang -->
          <nav v-if="lastPage > 1" class="d-flex justify-content-center mt-3">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="getReviews(currentPage - 1)">Trước</button>
              </li>
              <li v-for="page in lastPage" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <button class="page-link" @click="getReviews(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                <button class="page-link" @click="getReviews(currentPage + 1)">Sau</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import defaultAvatar from "@/assets/default-avatar.png";

export default {
  data() {
    return {
      reviews: [],
      currentPage: 1,
      lastPage: 1,
      searchQuery: "",
      loading: false,
      defaultAvatar,
    };
  },
  computed: {
    filteredReviews() {
      if (!this.searchQuery) return this.reviews;
      return this.reviews.filter(r =>
        (r.user_name && r.user_name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (r.comment && r.comment.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (r.restaurant_name && r.restaurant_name.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    }
  },
  methods: {
    async getReviews(page = 1) {
      this.loading = true;
      try {
        const res = await api.get(`/reviews?page=${page}`);
        this.reviews = res.data.data.map(r => {
          const fullAvatar = r.avatar
            ? r.avatar.startsWith("http")
              ? r.avatar
              : `http://127.0.0.1:8088/${r.avatar.replace(/^\/+/, "")}`
            : defaultAvatar;

          return {
            ...r,
            avatar: fullAvatar,
            loaded: false,
          };
        });

        // Preload avatar
        this.reviews.forEach(r => {
          const img = new Image();
          img.src = r.avatar;
          img.onload = () => r.loaded = true;
          img.onerror = () => {
            r.avatar = defaultAvatar;
            r.loaded = true;
          };
        });

        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    deleteReview(id) {
      if (!confirm("Bạn có chắc muốn xóa đánh giá này không?")) return;
      this.loading = true;
      api.delete(`/reviews/${id}`)
        .then(() => this.getReviews(this.currentPage))
        .finally(() => this.loading = false);
    },
    refreshList() {
      this.searchQuery = "";
      this.getReviews();
    },
  },
  mounted() {
    this.getReviews();
  },
};
</script>

<style scoped>
.avatar-wrapper {
  width: 50px;
  height: 50px;
  position: relative;
}

.avatar-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 50%;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

.avatar-img.fade-in {
  opacity: 1;
}

.avatar-loading {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-overlay-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.7);
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #3498db;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-text {
  margin-top: 10px;
  font-weight: 500;
  color: #333;
}
</style>
