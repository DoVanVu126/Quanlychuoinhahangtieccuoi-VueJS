<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-info">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">LỊCH SỬ KHO</h2>
          <p class="text-light">Theo dõi mọi hoạt động nhập, xuất, và điều chỉnh kho</p>
        </div>
      </div>
    </base-header>

    <div class="container-fluid mt--7">
      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden;">
        <div class="card-body">
          
          <div class="filter-section mb-4">
            <h4 class="mb-3">Bộ lọc</h4>
            <div class="d-flex flex-wrap gap-3">
              <div class="form-group mb-0 flex-grow-1" style="min-width: 180px;">
                <label for="startDate">Từ ngày</label>
                <input type="date" id="startDate" v-model="filters.startDate" class="form-control form-control-sm">
              </div>
              <div class="form-group mb-0 flex-grow-1" style="min-width: 180px;">
                <label for="endDate">Đến ngày</label>
                <input type="date" id="endDate" v-model="filters.endDate" class="form-control form-control-sm">
              </div>
              
              <div class="form-group mb-0 flex-grow-1" style="min-width: 180px;">
                <label for="actionType">Hành động</label>
                <select id="actionType" v-model="filters.action" class="form-control form-control-sm">
                  <option value="">Tất cả</option>
                  <option value="Nhập NCC">Nhập NCC</option>
                  <option value="Xuất cho Bếp">Xuất cho Bếp</option>
                  <option value="Kiểm kê">Kiểm kê</option>
                  <option value="Hủy Hàng">Hủy Hàng</option>
                </select>
              </div>

              <div class="form-group mb-0 flex-grow-2" style="min-width: 300px;">
                <label for="search">Tìm kiếm</label>
                <input
                  id="search"
                  v-model="filters.searchQuery"
                  class="form-control form-control-sm"
                  placeholder="Tìm theo tên hàng, mã lô, người thực hiện..."
                />
              </div>
            </div>
          </div>
          
          <hr class="mt-0 mb-4">

          <div class="table-responsive">
            <table class="table table-hover align-items-center">
              <thead class="thead-light">
                <tr>
                  <th>Mã Log</th>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                  <th>Nguyên liệu</th>
                  <th>Mã Lô</th> <th>Số lượng</th>
                  <th>Tồn cuối</th>
                  <th>Người thực hiện</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in filteredLogs" :key="log.id">
                  <td>{{ log.id }}</td>
                  <td>{{ log.timestamp }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="{
                        'badge-success': log.action === 'Nhập NCC',
                        'badge-primary': log.action === 'Xuất cho Bếp',
                        'badge-info': log.action === 'Kiểm kê',
                        'badge-danger': log.action === 'Hủy Hàng',
                      }"
                    >
                      {{ log.action }}
                    </span>
                  </td>
                  <td>{{ log.item }}</td>
                  <td>{{ log.batch }}</td> <td :class="{
                    'text-success font-weight-bold': log.quantity > 0,
                    'text-danger font-weight-bold': log.quantity < 0,
                  }">
                    {{ formatQuantity(log.quantity, log.dvt) }}
                  </td>
                  
                  <td>{{ log.stockAfter }} {{ log.dvt }}</td>
                  <td>{{ log.user }}</td>
                  <td>{{ log.note }}</td>
                </tr>
                
                <tr v-if="filteredLogs.length === 0">
                  <td colspan="9" class="text-center text-muted p-4">
                    Không tìm thấy dữ liệu lịch sử nào.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      filters: {
        searchQuery: "",
        action: "",
        startDate: null,
        endDate: null,
      },
      // === DỮ LIỆU MẪU ĐÃ CHUYÊN NGHIỆP HƠN ===
      historyLogs: [
        { id: "LS-001", timestamp: "01/11/2025 10:30", action: "Nhập NCC", item: "Thịt Bò Thăn (Wagyu A5)", batch: "L01-0925", quantity: 10, dvt: "KG", stockAfter: 25, user: "thu_kho", note: "NCC Hùng Phát (HĐ: #12345)" },
        { id: "LS-002", timestamp: "01/11/2025 09:15", action: "Xuất cho Bếp", item: "Cá Hồi Fillet (Nauy)", batch: "L03-1025", quantity: -5, dvt: "KG", stockAfter: 20, user: "bep_truong", note: "Xuất Bếp Âu (Ca Sáng)" },
        { id: "LS-003", timestamp: "31/10/2025 17:00", action: "Kiểm kê", item: "Hải Sâm Khô", batch: "HS-02C", quantity: 1, dvt: "Hộp", stockAfter: 4, user: "quan_ly_kho", note: "Kiểm kê cuối tháng (Lệch 1)" },
        { id: "LS-004", timestamp: "31/10/2025 14:20", action: "Nhập NCC", item: "Gạo Nếp Cái Hoa Vàng", batch: "L08-2026", quantity: 200, dvt: "KG", stockAfter: 700, user: "thu_kho", note: "NCC Sao Khuê (HĐ: #12311)" },
        { id: "LS-005", timestamp: "31/10/2025 11:00", action: "Xuất cho Bếp", item: "Thịt Bò Thăn (Wagyu A5)", batch: "L01-0925", quantity: -5, dvt: "KG", stockAfter: 15, user: "bep_pho", note: "Xuất Bếp Âu (Ca Trưa)" },
        { id: "LS-006", timestamp: "30/10/2025 08:00", action: "Hủy Hàng", item: "Thịt Gà Ta", batch: "Lô G-0925", quantity: -10, dvt: "KG", stockAfter: 0, user: "quan_ly_kho", note: "Hủy hàng hết HSD (Lô G-0925)" },
        { id: "LS-007", timestamp: "29/10/2025 15:10", action: "Nhập NCC", item: "Cá Hồi Fillet (Nauy)", batch: "L03-1025", quantity: 25, dvt: "KG", stockAfter: 25, user: "thu_kho", note: "NCC Hải Sản Xanh (HĐ: #A998)" },
      ],
    };
  },
  computed: {
    /**
     * Lọc dữ liệu lịch sử dựa trên các bộ lọc (ĐÃ CẬP NHẬT)
     */
    filteredLogs() {
      let logs = this.historyLogs;
      const query = this.filters.searchQuery.toLowerCase();

      // 1. Lọc theo tìm kiếm (tên hàng, người dùng, hoặc mã lô)
      if (query) {
        logs = logs.filter(
          (log) =>
            log.item.toLowerCase().includes(query) ||
            log.user.toLowerCase().includes(query) ||
            (log.batch && log.batch.toLowerCase().includes(query)) // Thêm tìm theo mã lô
        );
      }

      // 2. Lọc theo hành động
      if (this.filters.action) {
        logs = logs.filter((log) => log.action === this.filters.action);
      }

      // 3. Lọc theo ngày bắt đầu
      if (this.filters.startDate) {
        logs = logs.filter(log => this.parseDate(log.timestamp) >= new Date(this.filters.startDate));
      }
      // 4. Lọc theo ngày kết thúc
      if (this.filters.endDate) {
        logs = logs.filter(log => this.parseDate(log.timestamp) <= new Date(this.filters.endDate + "T23:59:59"));
      }

      return logs;
    },
  },
  methods: {
    /**
     * Định dạng số lượng (thêm dấu +)
     */
    formatQuantity(quantity, dvt) {
      if (quantity > 0) {
        return `+${quantity} ${dvt}`;
      }
      // Thêm xử lý cho số 0 (hủy hàng nhưng k thay đổi SL, hoặc kiểm kê)
      if (quantity === 0) {
          return `0 ${dvt}`;
      }
      return `${quantity} ${dvt}`;
    },
    
    /**
     * Chuyển đổi chuỗi ngày "dd/mm/yyyy hh:mm" sang đối tượng Date
     */
    parseDate(timestamp) {
      const parts = timestamp.split(' '); 
      const dateParts = parts[0].split('/'); 
      // [MM]/[DD]/[YYYY]
      const isoFormat = `${dateParts[1]}/${dateParts[0]}/${dateParts[2]} ${parts[1]}`;
      return new Date(isoFormat);
    }
  },
};
</script>

<style scoped>
/* Làm cho bộ lọc linh hoạt hơn trên màn hình nhỏ */
.filter-section .d-flex {
  gap: 1rem;
}

/* Thêm một chút khoảng cách cho các label của form */
.form-group label {
  margin-bottom: .25rem;
  font-size: 0.875rem;
  font-weight: 600;
}
</style>