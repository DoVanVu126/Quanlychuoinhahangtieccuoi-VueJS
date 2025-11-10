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
    <div class="container-fluid mt--7">
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
                <tr v-for="user in filteredUsers" :key="user.user_id">
                  <td>{{ user.user_id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <img
                      v-if="user.fixed_image_url"
                      :src="user.fixed_image_url"
                      alt="Avatar"
                      width="60"
                      height="60"
                      class="rounded-circle fade-in"
                      @error="handleImageError($event, user)"
                    />
                    <span v-else class="text-muted">Không có</span>
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
                <tr v-if="filteredUsers.length === 0">
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

export default {
  data() {
    return {
      users: [],
      currentPage: 1,
      lastPage: 1,
      searchQuery: "",
    };
  },
  computed: {
    filteredUsers() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return this.users;
      return this.users.filter(
        (u) =>
          (u.username && u.username.toLowerCase().includes(query)) ||
          (u.email && u.email.toLowerCase().includes(query))
      );
    },
  },
  methods: {
    async getUsers(page = 1) {
      try {
        const params = {
          page,
          search: this.searchQuery.trim()
        };
        const res = await api.get(`/users`, { params });
        this.users = res.data.data.map((u) => ({
          ...u,
          fixed_image_url: this.fixImageUrl(u.image_url),
          phone: u.phone || '',
          address: u.address || '',
        }));
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
      } catch (err) {
        console.error("❌ Lỗi tải user:", err);
      }
    },
    fixImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    },
    handleImageError(e, user) {
      console.warn("Avatar lỗi:", user.image_url);
      e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
      e.target.style.border = "2px solid red";
    },
    editUser(user) {
      this.$router.push({ name: "EditUser", params: { id: user.user_id } });
    },
    async deleteUser(id) {
      if (confirm("Bạn có chắc muốn xóa user này không?")) {
        try {
          await api.delete(`/users/${id}`);
          this.getUsers(this.currentPage);
        } catch (err) {
          console.error("❌ Lỗi xóa user:", err);
        }
      }
    },
    refreshList() {
      this.searchQuery = "";
      this.getUsers();
    },
  },
  watch: {
    searchQuery: {
      handler() {
        this.getUsers(1);
      },
      immediate: false,
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
.fade-in {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}
img.rounded-circle {
  object-fit: cover;
  border-radius: 50%;
}
</style>
