<template>
  <div>
    <!-- Header -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">QUẢN LÝ NGƯỜI DÙNG</h2>
          <p class="text-light">Theo dõi, chỉnh sửa và quản lý người dùng</p>
        </div>
      </div>
    </base-header>

    <!-- Nội dung chính -->
    <div class="container-fluid mt--7 position-relative">
      <!-- Spinner loading -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden">
        <div class="card-body">
          <!-- Thanh công cụ -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="🔍 Tìm kiếm user theo username hoặc email..."
            />
            <div class="d-flex gap-2">
              <router-link to="/users/add" class="btn btn-primary">+ Thêm User</router-link>
              <b-button variant="success" @click="refreshList">↻ Làm mới</b-button>
              <b-button variant="danger" @click="exportPDF">⬇ Xuất PDF</b-button>
            </div>
          </div>

          <!-- Bảng danh sách -->
          <div class="table-responsive">
            <table class="table table-hover align-items-center text-center">
              <thead class="thead-light">
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Ảnh đại diện</th>
                  <th>Vai trò</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.user_id">
                  <td>{{ user.user_id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <div class="avatar-wrapper">
                      <img
                        v-if="user.preloaded"
                        :src="user.fixed_image_url"
                        alt="Avatar"
                        class="avatar-img fade-in"
                        @error="handleImageError($event, user)"
                      />
                      <div v-else class="avatar-loading">
                        <span class="spinner-border spinner-border-sm"></span>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.role }}</td>
                  <td>{{ user.phone || 'Không có' }}</td>
                  <td>{{ user.address || 'Không có' }}</td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <b-button size="sm" variant="outline-primary" @click="editUser(user)">Sửa</b-button>
                    <b-button size="sm" variant="outline-danger" @click="deleteUser(user.user_id)">Xóa</b-button>
                  </td>
                </tr>
                <tr v-if="users.length === 0">
                  <td colspan="9" class="text-center text-muted">Không có user nào phù hợp</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang -->
          <nav v-if="lastPage > 1" class="d-flex justify-content-center mt-3">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="getUsers(currentPage - 1)">Trước</button>
              </li>
              <li v-for="page in lastPage" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <button class="page-link" @click="getUsers(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                <button class="page-link" @click="getUsers(currentPage + 1)">Sau</button>
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
      users: [],
      currentPage: 1,
      lastPage: 1,
      searchQuery: "",
      loading: false,
    };
  },

  methods: {
    async getUsers(page = 1, showLoading = true) {
      if (showLoading) this.loading = true;
      try {
        const res = await api.get("/users", {
          params: { page, search: this.searchQuery || undefined },
        });

        this.users = res.data.data.map((u) => ({
          ...u,
          fixed_image_url: u.image_url ? this.fixImageUrl(u.image_url) : defaultImage,
          preloaded: false,
          phone: u.phone || "",
          address: u.address || "",
        }));

        this.preloadAvatars();

        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
      } catch (err) {
        console.error("❌ Lỗi tải user:", err);
      } finally {
        if (showLoading) this.loading = false;
      }
    },

    preloadAvatars() {
      this.users.forEach((user) => {
        if (!user.fixed_image_url) return;
        const img = new Image();
        img.src = user.fixed_image_url;
        img.onload = () => (user.preloaded = true);
        img.onerror = () => {
          user.fixed_image_url = defaultImage;
          user.preloaded = true;
        };
      });
    },

    fixImageUrl(url) {
      if (!url) return defaultImage;
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },

    handleImageError(e, user) {
      e.target.src = defaultImage;
      e.target.style.border = "1px solid #ddd";
    },

    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    editUser(user) {
      this.$router.push({ name: "EditUser", params: { id: user.user_id } });
    },

    async deleteUser(id) {
  if (!confirm("Bạn có chắc muốn xóa user này không?")) return;
  this.loading = true;
  try {
    await api.delete(`/users/${id}`);
    alert("✅ Xóa thành công");
    this.getUsers(this.currentPage);
  } catch (err) {
    if (err.response) {
      const msg = err.response.data.message || "Xóa không hợp lệ";
      alert("❌ " + msg);
    } else {
      alert("❌ Lỗi kết nối server");
    }
  } finally {
    this.loading = false;
  }
},

    refreshList() {
      this.searchQuery = "";
      this.getUsers();
    },

    exportPDF() {
      window.open("http://127.0.0.1:8088/api/users/export/pdf", "_blank");
    },
  },

  watch: {
    searchQuery() {
      this.getUsers(1, false);
    },
  },

  mounted() {
    this.getUsers();
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

.avatar-wrapper {
  width: 60px;
  height: 60px;
  position: relative;
}

.avatar-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

.avatar-img.fade-in {
  opacity: 1;
}

.avatar-loading {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255,255,255,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}
</style>
