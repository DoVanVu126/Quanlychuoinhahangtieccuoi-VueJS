<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">Quản Lý Khách Hàng</h2>
          <p class="text-light">Danh sách khách hàng đã đặt tiệc</p>
        </div>
      </div>
    </base-header>

    <div class="container-fluid mt--7">
      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden">
        <div class="card-body">
          
          <div class="mb-4">
            <div class="input-group" style="max-width: 500px;">
              <div class="input-group-prepend">
                <span class="input-group-text bg-white border-right-0">
                  <i class="ni ni-zoom-split-in"></i>
                </span>
              </div>
              <input
                v-model="searchQuery"
                class="form-control border-left-0"
                placeholder="Tìm kiếm theo Tên, Email, SĐT..."
                @input="handleSearch"
              />
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-items-center">
              <thead class="thead-light">
                <tr>
                  <th class="text-center" style="width: 80px;">ID</th>
                  <th>Họ và Tên</th>
                  <th>Email</th>
                  <th class="text-center">Số điện thoại</th>
                  <th class="text-center">Ngày tham gia</th>
                  <th class="text-center" style="width: 150px;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in customers" :key="customer.customer_id">
                  <td class="text-center">{{ customer.customer_id }}</td>
                  
                  <td class="font-weight-600">
                    <div class="d-flex align-items-center">
                      <img
                        v-if="customer.image_url"
                        :src="fixImageUrl(customer.image_url)"
                        alt="Avatar"
                        class="avatar rounded-circle mr-3"
                        @error="handleImageError"
                      />
                      <div
                        v-else
                        class="avatar rounded-circle mr-3 bg-gradient-info d-flex align-items-center justify-content-center"
                      >
                        <span class="text-white font-weight-bold">{{ getInitials(customer.username) }}</span>
                      </div>
                      <div>
                        <span class="font-weight-600 d-block">{{ customer.username }}</span>
                        <small class="text-muted" v-if="customer.full_name">{{ customer.full_name }}</small>
                      </div>
                    </div>
                  </td>
                  
                  <td>{{ customer.email }}</td>
                  
                  <td class="text-center">{{ customer.phone || '-' }}</td>
                  
                  <td class="text-center">{{ formatDate(customer.created_at) }}</td>
                  
                  <td class="text-center">
                    <button
                      class="btn btn-sm btn-primary px-3 shadow-sm"
                      @click="goToCustomerDetail(customer.customer_id)"
                      title="Xem lịch sử đặt tiệc & thanh toán"
                    >
                      <i class="ni ni-active-40 mr-1"></i> Xem chi tiết
                    </button>
                  </td>
                </tr>

                <tr v-if="customers.length === 0">
                  <td colspan="6" class="text-center text-muted py-5">
                    <i class="ni ni-folder-17" style="font-size: 2.5rem;"></i>
                    <p class="mb-0 mt-2">Không tìm thấy khách hàng nào</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-4" v-if="totalItems > 0">
            <div class="text-muted small">
              Hiển thị <strong>{{ startItem }}-{{ endItem }}</strong> trên tổng số <strong>{{ totalItems }}</strong>
            </div>
            <nav v-if="lastPage > 1">
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="getCustomers(currentPage - 1)">Trước</button>
                </li>
                
                <li 
                  v-for="page in visiblePages" 
                  :key="page" 
                  class="page-item" 
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="getCustomers(page)">{{ page }}</button>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                  <button class="page-link" @click="getCustomers(currentPage + 1)">Sau</button>
                </li>
              </ul>
            </nav>
          </div>

        </div>
      </div>
    </div>
    
    </div>
</template>

<script>
import api from "@/api";

export default {
  name: "CustomerManagement",
  data() {
    return {
      customers: [],
      currentPage: 1,
      lastPage: 1,
      totalItems: 0,
      perPage: 10,
      searchQuery: "",
      searchTimeout: null,
      backendUrl: process.env.VUE_APP_API_URL || 'http://localhost:8088'
    };
  },
  computed: {
    startItem() {
      return this.customers.length > 0 ? (this.currentPage - 1) * this.perPage + 1 : 0;
    },
    endItem() {
      return Math.min(this.currentPage * this.perPage, this.totalItems);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.lastPage, this.currentPage + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    // 1. Lấy danh sách khách hàng
    async getCustomers(page = 1) {
      try {
        const params = {
          page,
          per_page: this.perPage,
          search: this.searchQuery.trim(),
        };
        
        const res = await api.get(`/customers`, { params });
        
        // Map dữ liệu trả về
        this.customers = res.data.data.map((c) => ({
          customer_id: c.customer_id,
          user_id: c.user_id,
          username: c.username || "",
          full_name: c.full_name || "", // Thêm full_name nếu có
          email: c.email || "",
          phone: c.phone || "",
          image_url: c.image_url || "",
          created_at: c.created_at, 
        }));
        
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
        this.totalItems = res.data.total;
      } catch (err) {
        console.error("❌ Lỗi tải khách hàng:", err);
        this.$bvToast.toast('Không thể tải danh sách khách hàng', {
          title: 'Lỗi', variant: 'danger', solid: true
        });
      }
    },
    
    // 2. Tìm kiếm (Debounce)
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.getCustomers(1);
      }, 500);
    },
    
    // 3. Chuyển trang chi tiết (Logic Mới)
    goToCustomerDetail(customerId) {
      this.$router.push(`/customers-chitiet/${customerId}`);
    },

    // --- Các hàm tiện ích ---
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString('vi-VN');
    },
    
    fixImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      // Dùng biến backendUrl để linh hoạt hơn
      return `${this.backendUrl}/${url.replace(/^\/+/, "")}`;
    },
    
    handleImageError(e) {
      e.target.src = "https://via.placeholder.com/150x150?text=No+Image";
    },
    
    getInitials(name) {
      if (!name) return "?";
      return name.substring(0, 2).toUpperCase();
    },
  },
  
  mounted() {
    this.getCustomers();
  },
};
</script>

<style scoped>
/* CSS tùy chỉnh cho bảng đẹp hơn */
.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  background-color: #f6f9fc;
  border-bottom: 2px solid #e9ecef;
}
.table td {
  vertical-align: middle;
  padding: 1rem 0.75rem;
}
.avatar {
  width: 40px;
  height: 40px;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.pagination .page-link {
  cursor: pointer;
  border-radius: 0.25rem;
  margin: 0 2px;
  border: none;
  color: #525f7f;
}
.pagination .page-item.active .page-link {
  background-color: #5e72e4;
  border-color: #5e72e4;
  color: white;
  box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08);
}
</style>