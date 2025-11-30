<template>
  <div>
    <!-- Header -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">Danh sách Yêu cầu Hỗ trợ</h2>
          <p class="text-light">Quản lý các yêu cầu hỗ trợ từ khách hàng</p>
        </div>
      </div>
    </base-header>

    <!-- Nội dung chính -->
    <div class="container-fluid mt--7">
      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden">
        <div class="card-body">
          <!-- Quy trình xử lý -->
          <div class="alert alert-info mb-4" role="alert">
            <i class="ni ni-notification-70 mr-2"></i>
            <strong>Quy trình xử lý:</strong> Đây là danh sách các yêu cầu hỗ trợ mới. Vui lòng 
            <strong>kiểm tra Gmail</strong> của bạn để xem nội dung chi tiết và phản hồi khách hàng. 
            Cập nhật trạng thái tại đây sau khi hoàn tất.
          </div>

          <!-- Bộ lọc -->
          <div class="row mb-4">
            <div class="col-md-6">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white border-right-0">
                    <i class="ni ni-zoom-split-in"></i>
                  </span>
                </div>
                <input
                  v-model="searchQuery"
                  class="form-control border-left-0"
                  placeholder="Tìm kiếm theo tên khách hàng, tiêu đề..."
                  @input="handleSearch"
                />
              </div>
            </div>
            <div class="col-md-3">
              <select v-model="filterStatus" class="form-control" @change="handleFilterChange">
                <option value="">Tất cả trạng thái</option>
                <option value="new">Mới</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="filterPriority" class="form-control" @change="handleFilterChange">
                <option value="">Tất cả mức độ</option>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>
          </div>

          <!-- Bảng danh sách -->
          <div class="table-responsive">
            <table class="table table-hover align-items-center">
              <thead class="thead-light">
                <tr>
                  <th style="width: 100px;">ID</th>
                  <th>Khách hàng</th>
                  <th>Tiêu đề</th>
                  <th class="text-center">Mức độ</th>
                  <th class="text-center">Ngày gửi</th>
                  <th class="text-center" style="width: 180px;">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ticket in tickets" :key="ticket.ticket_id">
                  <td class="font-weight-bold">#{{ ticket.ticket_id }}</td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div
                        class="avatar rounded-circle mr-3 bg-gradient-info d-flex align-items-center justify-content-center"
                        style="width: 35px; height: 35px;"
                      >
                        <span class="text-white font-weight-bold" style="font-size: 0.9rem;">
                          {{ getInitials(ticket.customer_name) }}
                        </span>
                      </div>
                      <div>
                        <div class="font-weight-600">{{ ticket.customer_name }}</div>
                        <small class="text-muted">{{ ticket.customer_email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="cursor-pointer" @click="viewTicket(ticket)">
                      <div class="font-weight-600 text-primary">{{ ticket.subject }}</div>
                      <small class="text-muted">{{ truncateText(ticket.message, 60) }}</small>
                    </div>
                  </td>
                  <td class="text-center">
                    <span
                      class="badge badge-pill"
                      :class="getPriorityBadgeClass(ticket.priority)"
                    >
                      {{ getPriorityLabel(ticket.priority) }}
                    </span>
                  </td>
                  <td class="text-center">{{ formatDate(ticket.created_at) }}</td>
                  <td class="text-center">
                    <select
                      v-model="ticket.status"
                      class="form-control form-control-sm"
                      :class="getStatusClass(ticket.status)"
                      @change="updateTicketStatus(ticket)"
                    >
                      <option value="new">Mới</option>
                      <option value="in_progress">Đang xử lý</option>
                      <option value="resolved">Đã giải quyết</option>
                      <option value="closed">Đã đóng</option>
                    </select>
                  </td>
                </tr>
                <tr v-if="tickets.length === 0">
                  <td colspan="6" class="text-center text-muted py-5">
                    <i class="ni ni-folder-17" style="font-size: 2.5rem;"></i>
                    <p class="mb-0 mt-2">Không có yêu cầu hỗ trợ nào</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang -->
          <div class="d-flex justify-content-between align-items-center mt-4">
            <div class="text-muted small">
              Hiển thị <strong>{{ startItem }}-{{ endItem }}</strong> trên tổng số <strong>{{ totalItems }}</strong> yêu cầu
            </div>
            <nav v-if="lastPage > 1">
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="getTickets(currentPage - 1)" :disabled="currentPage === 1">
                    Trước
                  </button>
                </li>
                
                <li v-if="currentPage > 3" class="page-item">
                  <button class="page-link" @click="getTickets(1)">1</button>
                </li>
                <li v-if="currentPage > 4" class="page-item disabled">
                  <span class="page-link">...</span>
                </li>

                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="getTickets(page)">{{ page }}</button>
                </li>

                <li v-if="currentPage < lastPage - 3" class="page-item disabled">
                  <span class="page-link">...</span>
                </li>
                <li v-if="currentPage < lastPage - 2" class="page-item">
                  <button class="page-link" @click="getTickets(lastPage)">{{ lastPage }}</button>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                  <button class="page-link" @click="getTickets(currentPage + 1)" :disabled="currentPage === lastPage">
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xem chi tiết -->
    <b-modal
      v-model="showDetailModal"
      title="Chi tiết yêu cầu hỗ trợ"
      size="lg"
      ok-only
      ok-title="Đóng"
    >
      <div v-if="selectedTicket" class="ticket-detail">
        <div class="row mb-3">
          <div class="col-md-6">
            <strong>Mã yêu cầu:</strong> #{{ selectedTicket.ticket_id }}
          </div>
          <div class="col-md-6 text-right">
            <span
              class="badge badge-pill badge-lg"
              :class="getPriorityBadgeClass(selectedTicket.priority)"
            >
              {{ getPriorityLabel(selectedTicket.priority) }}
            </span>
          </div>
        </div>

        <div class="mb-3">
          <strong>Khách hàng:</strong> {{ selectedTicket.customer_name }}<br />
          <strong>Email:</strong> {{ selectedTicket.customer_email }}<br />
          <strong>Số điện thoại:</strong> {{ selectedTicket.customer_phone || 'Không có' }}
        </div>

        <div class="mb-3">
          <strong>Tiêu đề:</strong>
          <p class="mt-1">{{ selectedTicket.subject }}</p>
        </div>

        <div class="mb-3">
          <strong>Nội dung:</strong>
          <div class="mt-1 p-3 bg-light rounded">
            {{ selectedTicket.message }}
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <strong>Ngày gửi:</strong> {{ formatDateTime(selectedTicket.created_at) }}
          </div>
          <div class="col-md-6">
            <strong>Trạng thái:</strong>
            <span
              class="badge ml-2"
              :class="getStatusBadgeClass(selectedTicket.status)"
            >
              {{ getStatusLabel(selectedTicket.status) }}
            </span>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import api from "@/api";

export default {
  name: "SupportTickets",
  data() {
    return {
      tickets: [],
      currentPage: 1,
      lastPage: 1,
      totalItems: 0,
      perPage: 10,
      searchQuery: "",
      filterStatus: "",
      filterPriority: "",
      searchTimeout: null,
      showDetailModal: false,
      selectedTicket: null,
    };
  },
  computed: {
    startItem() {
      return this.tickets.length > 0 ? (this.currentPage - 1) * this.perPage + 1 : 0;
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
    async getTickets(page = 1) {
      try {
        const params = {
          page,
          per_page: this.perPage,
          search: this.searchQuery.trim(),
          status: this.filterStatus,
          priority: this.filterPriority,
        };
        
        const res = await api.get(`/support-tickets`, { params });
        
        this.tickets = res.data.data;
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
        this.totalItems = res.data.total;
        this.perPage = res.data.per_page;
      } catch (err) {
        console.error("❌ Lỗi tải yêu cầu hỗ trợ:", err);
        this.$notify({
          type: "danger",
          message: "Không thể tải danh sách yêu cầu hỗ trợ!",
        });
      }
    },
    
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.getTickets(1);
      }, 500);
    },

    handleFilterChange() {
      this.getTickets(1);
    },
    
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },

    formatDateTime(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleString("vi-VN");
    },
    
    getInitials(name) {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    },

    truncateText(text, length) {
      if (!text) return "";
      return text.length > length ? text.substring(0, length) + "..." : text;
    },

    getPriorityLabel(priority) {
      const labels = {
        low: "Thấp",
        medium: "Trung bình",
        high: "Cao",
        urgent: "Khẩn cấp",
      };
      return labels[priority] || priority;
    },

    getPriorityBadgeClass(priority) {
      const classes = {
        low: "badge-success",
        medium: "badge-info",
        high: "badge-warning",
        urgent: "badge-danger",
      };
      return classes[priority] || "badge-secondary";
    },

    getStatusLabel(status) {
      const labels = {
        new: "Mới",
        in_progress: "Đang xử lý",
        resolved: "Đã giải quyết",
        closed: "Đã đóng",
      };
      return labels[status] || status;
    },

    getStatusClass(status) {
      const classes = {
        new: "border-primary text-primary",
        in_progress: "border-warning text-warning",
        resolved: "border-success text-success",
        closed: "border-secondary text-secondary",
      };
      return classes[status] || "";
    },

    getStatusBadgeClass(status) {
      const classes = {
        new: "badge-primary",
        in_progress: "badge-warning",
        resolved: "badge-success",
        closed: "badge-secondary",
      };
      return classes[status] || "badge-secondary";
    },
    
    viewTicket(ticket) {
      this.selectedTicket = ticket;
      this.showDetailModal = true;
    },
    
    async updateTicketStatus(ticket) {
      try {
        await api.put(`/support-tickets/${ticket.ticket_id}`, {
          status: ticket.status,
        });
        
        this.$notify({
          type: "success",
          message: "Cập nhật trạng thái thành công!",
        });
      } catch (err) {
        console.error("❌ Lỗi cập nhật trạng thái:", err);
        this.$notify({
          type: "danger",
          message: "Không thể cập nhật trạng thái!",
        });
        this.getTickets(this.currentPage);
      }
    },
  },
  
  mounted() {
    this.getTickets();
  },
};
</script>

<style scoped>
.table {
  font-size: 0.9rem;
}
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
.font-weight-600 {
  font-weight: 600;
}
.cursor-pointer {
  cursor: pointer;
}
.cursor-pointer:hover .text-primary {
  text-decoration: underline;
}
.pagination .page-link {
  cursor: pointer;
  border-radius: 0.25rem;
  margin: 0 2px;
}
.pagination .page-item.active .page-link {
  background-color: #5e72e4;
  border-color: #5e72e4;
}
.input-group-text {
  background-color: white;
}
.badge-lg {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}
.ticket-detail strong {
  color: #32325d;
}
</style>