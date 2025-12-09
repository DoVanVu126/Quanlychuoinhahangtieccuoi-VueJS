<template>
  <div>
    <!-- Header -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">QUẢN LÝ MÓN ĂN</h2>
          <p class="text-light">
            Theo dõi, chỉnh sửa và quản lý danh sách món ăn nhà hàng
          </p>
        </div>
      </div>
    </base-header>

    <!-- Nội dung chính -->
    <div class="container-fluid mt--7">
      <div
        class="card shadow-lg border-0"
        style="border-radius: 20px; overflow: hidden; position: relative"
      >
        <!-- LOADING TRONG FORM -->
        <div v-if="loading" class="loading-overlay-form">
          <div class="spinner"></div>
          <p class="loading-text">Đang tải dữ liệu...</p>
        </div>

        <div class="card-body" :class="{ 'blur-content-form': loading }">
          <!-- Thanh công cụ -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="🔍 Tìm kiếm món ăn theo tên, mô tả hoặc nhà hàng..."
            />

            <div class="d-flex gap-2">
              <router-link to="/mon-an/them" class="btn btn-primary">
                + Thêm Món ăn
              </router-link>
              <b-button variant="success" @click="refreshList"
                >↻ Làm mới</b-button
              >
              <b-button variant="danger" @click="exportPDF"
                >⬇ Xuất PDF</b-button
              >
            </div>
          </div>

          <!-- Bảng danh sách -->
          <div class="table-responsive">
            <table class="table table-hover align-items-center">
              <thead class="thead-light">
                <tr>
                  <th>ID</th>
                  <th>Tên món ăn</th>
                  <th>Loại món</th>
                  <th>Nhà hàng</th>
                  <th>Giá (VNĐ)</th>
                  <th>Đơn vị</th>
                  <th>Mô tả</th>
                  <th>Hình ảnh</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="food in foods.data" :key="food.food_id">
                  <td>{{ food.food_id }}</td>
                  <td>{{ food.name }}</td>
                  <td>
                    {{ (food.food_type && food.food_type.name) || "Không có" }}
                  </td>
                  <td>
                    {{
                      (food.restaurant && food.restaurant.name) || "Không có"
                    }}
                  </td>
                  <td>{{ formatPrice(food.price) }}</td>
                  <td>{{ food.unit || "Chưa có" }}</td>
                  <td>{{ food.description || "" }}</td>
                  <td>
                    <img
                      :src="food.fixed_image_url"
                      alt="Hình món ăn"
                      class="food-img fade-in"
                      @error="handleFoodImageError"
                    />
                  </td>
                  <td>
                    <b-button
                      size="sm"
                      variant="outline-primary"
                      @click="editFood(food)"
                      >Sửa</b-button
                    >
                    <b-button
                      size="sm"
                      variant="outline-danger"
                      @click="deleteFood(food.food_id)"
                      >Xóa</b-button
                    >
                  </td>
                </tr>

                <tr v-if="foods.data.length === 0">
                  <td colspan="9" class="text-center text-muted">
                    Không có món ăn nào phù hợp
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang -->
          <nav v-if="lastPage > 1" class="d-flex justify-content-center mt-3">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="getFoods(currentPage - 1)">
                  Trước
                </button>
              </li>

              <li
                v-for="page in lastPage"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="getFoods(page)">
                  {{ page }}
                </button>
              </li>

              <li
                class="page-item"
                :class="{ disabled: currentPage === lastPage }"
              >
                <button class="page-link" @click="getFoods(currentPage + 1)">
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
import defaultImage from "@/assets/no-image.png";

export default {
  data() {
    return {
      foods: { data: [] },
      currentPage: 1,
      lastPage: 1,
      searchQuery: "",
      loading: false,
      baseURL: process.env.VUE_APP_BASE_URL || "http://localhost:8088",
    };
  },
  methods: {
    async getFoods(page = 1) {
      this.loading = true;
      try {
        const res = await api.get(`/foods?page=${page}`);
        this.foods = {
          ...res.data,
          data: res.data.data.map((f) => ({
            ...f,
            fixed_image_url: f.image_url
              ? this.fixFoodImageUrl(f.image_url)
              : defaultImage,
          })),
        };
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
      } catch (err) {
        console.error("Lỗi tải danh sách món ăn:", err);
      } finally {
        this.loading = false;
      }
    },

    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN").format(value);
    },

    editFood(food) {
      this.$router.push({ name: "SuaMonAn", params: { id: food.food_id } });
    },

    async deleteFood(id) {
  // 1) Không cho double click
  if (this.loading === true) return;

  // 2) Validate ID
  if (id === null || id === undefined) {
    alert("❌ ID món ăn không hợp lệ!");
    return;
  }

  // 3) ID phải là số nguyên dương
  let cleanedId = Number(String(id).trim());
  if (!Number.isInteger(cleanedId) || cleanedId <= 0) {
    alert("❌ ID không hợp lệ (phải là số nguyên dương).");
    return;
  }

  // 4) Check ID có nằm trong danh sách hiển thị
  let exists = this.foods.data.some(f => f.food_id === cleanedId);
  if (!exists) {
    alert("❌ Món ăn không tồn tại trong danh sách hiện tại.");
    return;
  }

  // 5) Confirm xóa
  if (!confirm("⚠ Bạn có chắc chắn muốn xóa món ăn này không?")) return;

  // 6) Lock form
  this.loading = true;

  try {
    // 7) Gửi request
    const res = await api.delete(`/foods/${cleanedId}`);

    // 8) Thông báo rõ ràng
    alert("✅ " + ((res.data && res.data.message) || "Xóa thành công!"));

    // 9) Tải lại danh sách tại trang hiện tại
    this.getFoods(this.currentPage);

  } catch (err) {
    console.error("Xóa lỗi:", err);

    let msg = "❌ Xóa thất bại!";

    // Laravel validation or error message
    if (err.response && err.response.data) {
      if (err.response.data.errors) {
        // flatten lỗi Laravel
        let arr = [];
        for (let key in err.response.data.errors) {
          arr.push(`${key}: ${err.response.data.errors[key].join(" | ")}`);
        }
        msg = arr.join("\n");
      } else if (err.response.data.message) {
        msg = "❌ " + err.response.data.message;
      }
    }

    alert(msg);

  } finally {
    // 10) Mở khóa form
    this.loading = false;
  }
},
    refreshList() {
      this.searchQuery = "";
      this.getFoods();
    },

    fixFoodImageUrl(url) {
      if (!url) return defaultImage;
      if (url.startsWith("http")) return url;
      return `${this.baseURL}/${url.replace(/^\/+/, "")}`;
    },

    handleFoodImageError(e) {
      e.target.src = defaultImage;
      e.target.style.border = "1px solid #ddd";
    },

    exportPDF() {
      window.open(`${this.baseURL}/api/foods/export-pdf`, "_blank");
    },
  },
  mounted() {
    this.getFoods();
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
.food-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}
.food-img.fade-in {
  opacity: 1;
}

/* LOADING TRONG FORM */
.loading-overlay-form {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
}

.blur-content-form {
  filter: blur(2px);
  pointer-events: none;
}

/* Spinner */
.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #28a745;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #28a745;
  margin-top: 10px;
  font-weight: 600;
}
</style>
