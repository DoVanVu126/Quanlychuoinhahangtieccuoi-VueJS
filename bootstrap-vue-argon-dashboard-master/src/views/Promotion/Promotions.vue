<template>
  <div>
    <!-- Header -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-warning">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">QUẢN LÝ KHUYẾN MÃI</h2>
          <p class="text-light">Theo dõi, thêm, sửa, xóa khuyến mãi</p>
        </div>
      </div>
    </base-header>

    <div class="container-fluid mt--7">
      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden">
        <div class="card-body">
          <!-- Thanh công cụ -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="🔍 Tìm kiếm theo tiêu đề hoặc mã khuyến mãi..."
            />
            <div class="d-flex gap-2">
              <router-link to="/promotions/add" class="btn btn-warning">+ Thêm Khuyến mãi</router-link>
              <b-button variant="success" @click="refreshList">↻ Làm mới</b-button>
            </div>
          </div>

          <!-- Bảng danh sách -->
          <div class="table-responsive">
            <table class="table table-hover align-items-center">
              <thead class="thead-light">
                <tr>
                  <th>ID</th>
                  <th>Mã KM</th>
                  <th>Tiêu đề</th>
                  <th>Mô tả</th>
                  <th>Nhà hàng</th>
                  <th>Loại giảm</th>
                  <th>Giá trị</th>
                  <th>Ảnh</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="promo in filteredPromotions" :key="promo.promotion_id">
                  <td>{{ promo.promotion_id }}</td>
                  <td>{{ promo.promotion_code }}</td>
                  <td>{{ promo.title }}</td>
                  <td>{{ promo.description || 'Không có' }}</td>
                  <td>{{ promo.restaurant && promo.restaurant.name ? promo.restaurant.name : 'Không xác định' }}</td>

                  <td>{{ promo.discount_type }}</td>
                  <td>{{ promo.discount_value }}</td>
                  <td>
                    <img
                      v-if="promo.fixed_image_url"
                      :src="promo.fixed_image_url"
                      alt="ảnh khuyến mãi"
                      class="promo-img fade-in"
                      @error="handleImageError($event)"
                    />
                    <span v-else class="text-muted">Không có</span>
                  </td>
                  <td>{{ formatDate(promo.start_date) }}</td>
                  <td>{{ formatDate(promo.end_date) }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="{
                        'bg-success': promo.status === 'active',
                        'bg-secondary': promo.status !== 'active'
                      }"
                    >
                      {{ promo.status }}
                    </span>
                  </td>
                  <td>
                    <b-button size="sm" variant="outline-primary" @click="editPromotion(promo)">Sửa</b-button>
                    <b-button size="sm" variant="outline-danger" @click="deletePromotion(promo.promotion_id)">Xóa</b-button>
                  </td>
                </tr>
                <tr v-if="filteredPromotions.length === 0">
                  <td colspan="12" class="text-center text-muted">Không có khuyến mãi nào phù hợp</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang -->
          <nav v-if="lastPage > 1" class="d-flex justify-content-center mt-3">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="getPromotions(currentPage - 1)">Trước</button>
              </li>
              <li
                v-for="page in lastPage"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="getPromotions(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                <button class="page-link" @click="getPromotions(currentPage + 1)">Sau</button>
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

export default {
  data() {
    return {
      promotions: [],
      currentPage: 1,
      lastPage: 1,
      searchQuery: ""
    };
  },

  computed: {
    filteredPromotions() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return this.promotions;
      return this.promotions.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.promotion_code && p.promotion_code.toLowerCase().includes(query))
      );
    }
  },

  methods: {
    async getPromotions(page = 1) {
  try {
    const res = await api.get(`/promotions?page=${page}`);

    this.promotions = res.data.data.map((p) => ({
      ...p,
      fixed_image_url: this.fixImageUrl(
        p.image_url || p.image || p.image_path || p.img
      )
    }));

    this.currentPage = res.data.current_page;
    this.lastPage = res.data.last_page;
  } catch (err) {
    console.error("Lỗi tải khuyến mãi:", err);
  }
},

    fixImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },

    handleImageError(e) {
      e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
      e.target.style.border = "2px solid red";
    },

    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    editPromotion(promo) {
      this.$router.push({ name: "EditPromotion", params: { id: promo.promotion_id } });
    },

    async deletePromotion(id) {
      if (!confirm("Bạn có chắc muốn xóa khuyến mãi này không?")) return;
      try {
        await api.delete(`/promotions/${id}`);
        this.getPromotions(this.currentPage);
      } catch (err) {
        console.error("Lỗi xóa khuyến mãi:", err);
      }
    },

    refreshList() {
      this.searchQuery = "";
      this.getPromotions();
    }
  },

  mounted() {
    this.getPromotions();
  }
};
</script>

<style scoped>
.table {
  vertical-align: middle;
  font-size: 0.9rem;
}
.table th {
  font-weight: 600;
}
.btn {
  min-width: 90px;
}
.pagination .page-link {
  cursor: pointer;
}
.promo-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}
.promo-img.fade-in {
  opacity: 1;
}

.badge {
  position: static !important;
  display: inline-block;
  vertical-align: middle;
  font-size: 0.8rem;
}
</style>
