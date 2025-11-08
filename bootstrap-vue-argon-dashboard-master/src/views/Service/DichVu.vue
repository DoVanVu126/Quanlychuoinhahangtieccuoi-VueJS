<template>
  <div>
    <!-- Header -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">QUẢN LÝ DỊCH VỤ</h2>
          <p class="text-light">
            Theo dõi, chỉnh sửa và quản lý dịch vụ nhà hàng
          </p>
        </div>
      </div>
    </base-header>

    <!-- Nội dung chính -->
    <div class="container-fluid mt--7">
      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden">
        <div class="card-body">
          <!-- Thanh công cụ -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="🔍 Tìm kiếm dịch vụ theo tên hoặc mô tả..."
            />

            <div class="d-flex gap-2">
              <router-link to="/dich-vu/them" class="btn btn-primary">
                + Thêm Dịch vụ
              </router-link>
              <b-button variant="success" @click="refreshList">
                ↻ Làm mới
              </b-button>
            </div>
          </div>

          <!-- Bảng danh sách -->
          <div class="table-responsive">
            <table class="table table-hover align-items-center">
              <thead class="thead-light">
                <tr>
                  <th>ID</th>
                  <th>Tên dịch vụ</th>
                  <th>Mô tả</th>
                  <th>Giá (VNĐ)</th>
                  <th>Ảnh</th>
                  <th>Trạng thái</th>
                  <th>Nhà hàng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="service in filteredServices" :key="service.service_id">
                  <td>{{ service.service_id }}</td>
                  <td>{{ service.name }}</td>
                  <td>{{ service.description }}</td>
                  <td>{{ formatPrice(service.price) }}</td>

                  <td>
                    <img
                      v-if="service.fixed_image_url"
                      :src="service.fixed_image_url"
                      alt="Ảnh dịch vụ"
                      class="service-img fade-in"
                      @error="handleImageError($event, service)"
                    />
                    <span v-else class="text-muted">Không có</span>
                  </td>

                  <td>
                    <span
                      class="badge"
                      :class="{
                        'bg-success': service.status === 'available',
                        'bg-warning text-dark': service.status === 'maintenance',
                        'bg-secondary': service.status === 'unavailable',
                      }"
                    >
                      {{ service.status }}
                    </span>
                  </td>

                  <td>
                    {{ service.restaurant && service.restaurant.name ? service.restaurant.name : "Không có" }}
                  </td>

                  <td>
                    <b-button size="sm" variant="outline-primary" @click="editService(service)">
                      Sửa
                    </b-button>
                    <b-button size="sm" variant="outline-danger" @click="deleteService(service.service_id)">
                      Xóa
                    </b-button>
                  </td>
                </tr>

                <tr v-if="filteredServices.length === 0">
                  <td colspan="8" class="text-center text-muted">
                    Không có dịch vụ nào phù hợp
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang -->
          <nav v-if="lastPage > 1" class="d-flex justify-content-center mt-3">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="getServices(currentPage - 1)">
                  Trước
                </button>
              </li>

              <li
                v-for="page in lastPage"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="getServices(page)">
                  {{ page }}
                </button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                <button class="page-link" @click="getServices(currentPage + 1)">
                  Sau
                </button>
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
      services: [],
      currentPage: 1,
      lastPage: 1,
      searchQuery: "",
    };
  },

  computed: {
    filteredServices() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return this.services;
      return this.services.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(query)) ||
          (s.description && s.description.toLowerCase().includes(query))
      );
    },
  },

  methods: {
    // ✅ Lấy danh sách dịch vụ
    async getServices(page = 1) {
      try {
        const res = await api.get(`/services?page=${page}`);
        console.log("📦 Dữ liệu API:", res.data.data);

        // ✅ Xử lý cố định URL ảnh ngay sau khi load
        this.services = res.data.data.map((s) => ({
          ...s,
          fixed_image_url: this.fixImageUrl(s.image_url),
        }));

        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
      } catch (err) {
        console.error("❌ Lỗi tải dịch vụ:", err);
      }
    },

    // ✅ Định dạng giá tiền
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN").format(value);
    },

    // ✅ Chuẩn hóa URL ảnh
    fixImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },

    // ✅ Khi ảnh lỗi
    handleImageError(e, service) {
      console.warn("Ảnh lỗi:", service.image_url);
      e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
      e.target.style.border = "2px solid red";
    },

    editService(service) {
      this.$router.push({
        name: "SuaDichVu",
        params: { id: service.service_id },
      });
    },

    async deleteService(id) {
      if (confirm("Bạn có chắc muốn xóa dịch vụ này không?")) {
        try {
          await api.delete(`/services/${id}`);
          this.getServices(this.currentPage);
        } catch (err) {
          console.error("❌ Lỗi xóa dịch vụ:", err);
        }
      }
    },

    refreshList() {
      this.searchQuery = "";
      this.getServices();
    },
  },

  mounted() {
    this.getServices();
  },
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

/* Ảnh dịch vụ */
.service-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

/* Fade-in khi ảnh load xong */
.service-img.fade-in {
  opacity: 1;
}
</style>
