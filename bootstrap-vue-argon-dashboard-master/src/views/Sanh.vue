<template>
  <div>
    <!-- Header -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-info">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">QUẢN LÝ SẢNH</h2>
          <p class="text-light">Theo dõi, chỉnh sửa và quản lý sảnh tiệc</p>
        </div>
      </div>
    </base-header>

    <!-- LOADING OVERLAY -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">Đang tải dữ liệu...</p>
    </div>

    <!-- Nội dung chính -->
    <div class="container-fluid mt--7" :class="{ 'blur-content': loading }">
      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden;">
        <div class="card-body">
          <!-- Thanh công cụ -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="🔍 Tìm kiếm sảnh theo tên..."
            />
            <div class="d-flex gap-2">
              <router-link to="/sanh/them" class="btn btn-primary">+ Thêm Sảnh</router-link>
              <b-button variant="success" @click="refreshList">↻ Làm mới</b-button>
            </div>
          </div>

          <!-- Bảng danh sách -->
          <div class="table-responsive">
            <table class="table table-hover align-items-center">
              <thead class="thead-light">
                <tr>
                  <th>ID</th>
                  <th>Tên sảnh</th>
                  <th>Sức chứa</th>
                  <th>Giá (VNĐ)</th>
                  <th>Mô tả</th> <!-- cột mô tả -->
                  <th>Ảnh</th>
                  <th>Trạng thái</th>
                  <th>Nhà hàng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="hall in halls.data" :key="hall.hall_id">
                  <td>{{ hall.hall_id }}</td>
                  <td>{{ hall.name }}</td>
                  <td>{{ hall.capacity || '—' }}</td>
                  <td>{{ formatPrice(hall.price) }}</td>
                  <td class="hall-description">{{ hall.description || '—' }}</td> <!-- mô tả -->
                  <td>
                    <img
                      v-if="hall.fixed_image_url"
                      :src="hall.fixed_image_url"
                      alt="Ảnh sảnh"
                      class="hall-img fade-in"
                      @error="handleImageError($event, hall)"
                    />
                    <span v-else class="text-muted">Không có</span>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="{
                        'bg-success': hall.status === 'available',
                        'bg-warning text-dark': hall.status === 'maintenance',
                        'bg-secondary': hall.status === 'unavailable'
                      }"
                    >
                      {{ hall.status }}
                    </span>
                  </td>
                  <td>{{ hall.restaurant && hall.restaurant.name ? hall.restaurant.name : 'Không có' }}</td>
                  <td>
                    <b-button size="sm" variant="outline-primary" @click="editHall(hall)">Sửa</b-button>
                    <b-button size="sm" variant="outline-danger" @click="deleteHall(hall.hall_id)">Xóa</b-button>
                  </td>
                </tr>
                <tr v-if="halls.data.length === 0">
                  <td colspan="9" class="text-center text-muted">Không có sảnh nào phù hợp</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang -->
          <nav v-if="lastPage > 1" class="d-flex justify-content-center mt-3">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="getHalls(currentPage - 1)">Trước</button>
              </li>
              <li
                v-for="page in lastPage"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="getHalls(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                <button class="page-link" @click="getHalls(currentPage + 1)">Sau</button>
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
      halls: { data: [] },
      currentPage: 1,
      lastPage: 1,
      searchQuery: "",
      loading: false,
    };
  },
  watch: {
    searchQuery() {
      this.getHalls(1);
    }
  },
  methods: {
    async getHalls(page = 1) {
      this.loading = true;
      try {
        const res = await api.get("/halls", {
          params: { page, search: this.searchQuery }
        });
        this.halls = {
          ...res.data,
          data: res.data.data.map(h => ({
            ...h,
            fixed_image_url: h.image_url && h.image_url.startsWith("http")
              ? h.image_url
              : "http://127.0.0.1:8088/" + (h.image_url ? h.image_url.replace(/^\/+/, "") : "")
          }))
        };
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
      } catch (err) {
        console.error("❌ Lỗi tải sảnh:", err);
      } finally {
        this.loading = false;
      }
    },
    formatPrice(value) {
      return value ? new Intl.NumberFormat("vi-VN").format(value) : "—";
    },
    handleImageError(e, hall) {
      e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
      e.target.style.border = "2px solid red";
    },
    editHall(hall) {
      this.$router.push({ name: "SuaSanh", params: { id: hall.hall_id } });
    },
    async deleteHall(id) {
      if (confirm("Bạn có chắc muốn xóa sảnh này không?")) {
        this.loading = true;
        try {
          await api.delete("/halls/" + id);
          this.getHalls(this.currentPage);
        } catch (err) {
          console.error("❌ Lỗi xóa sảnh:", err);
        } finally {
          this.loading = false;
        }
      }
    },
    refreshList() {
      this.searchQuery = "";
      this.getHalls(1);
    }
  },
  mounted() {
    this.getHalls();
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
.hall-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}
.hall-img.fade-in {
  opacity: 1;
}
/* wrap mô tả dài */
.hall-description {
  max-width: 250px;
  word-wrap: break-word;
  white-space: normal;
}

/* ----- LOADING OVERLAY ----- */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.45);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text {
  color: white;
  margin-top: 15px;
  font-size: 18px;
}
.blur-content {
  filter: blur(2px);
  pointer-events: none;
}

/* Badge */
.badge {
  position: static !important;
  display: inline-block;
  vertical-align: middle;
  font-size: 0.8rem;
}
</style>
