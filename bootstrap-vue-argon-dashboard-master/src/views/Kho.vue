<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">KHO NGUYÊN LIỆU</h2>
          <p class="text-light">Theo dõi và quản lý nguyên vật liệu trong kho</p>
        </div>
      </div>
    </base-header>

    <div class="container-fluid mt--7">
      <div
        class="card shadow-lg border-0"
        style="border-radius: 20px; overflow: hidden;"
      >
        <div class="card-body">
          <!-- Bộ lọc nhanh -->
         

          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex gap-2 align-items-center w-50">
              <input
                v-model="searchQuery"
                class="form-control"
                placeholder="Tìm kiếm theo tên mặt hàng..."
              />
              <select v-model="selectedRestaurant" class="form-control" @change="loadItems(1)" style="max-width: 220px">
                <option value="">-- Tất cả nhà hàng --</option>
                <option v-for="r in restaurantOptions" :key="r.id" :value="r.id">NH-{{ r.id }} {{ r.name ? ' - ' + r.name : '' }}</option>
              </select>
              <b-button size="sm" variant="outline-secondary" @click="refreshRestaurants">Làm mới</b-button>
            </div>

            <div class="d-flex gap-2">
              <b-button variant="primary" @click="themHang">+ Thêm Nguyên Liệu</b-button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-items-center">
              <thead class="thead-light">
                <tr>
                  <th>STT</th>
                  <th>Nhà hàng</th>
                  <th>Tên mặt hàng</th>
                  <th>Số lượng</th>
                  <th>Đơn vị</th>
                  <th>Mức đặt lại</th>
                  <th>Hạn sử dụng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredItems" :key="item.id">
                  <td><strong>{{ (currentPage - 1) * perPage + index + 1 }}</strong></td>
                  <td>
                    <div>
                      <span class="badge badge-info">NH-{{ item.restaurant_id }}</span>
                      <div v-if="item.restaurant_name" class="small text-muted mt-1">{{ item.restaurant_name }}</div>
                    </div>
                  </td>
                  <td>{{ item.item_name }}</td>
                  <td>
                    <strong :class="item.quantity < item.reorder_level ? 'text-danger' : 'text-success'">
                      {{ Math.round(item.quantity) }}
                    </strong>
                  </td>
                  <td>{{ item.unit }}</td>
                  <td>
                    <span class="text-muted">{{ Math.round(item.reorder_level) }}</span>
                  </td>
                  <td>
                    <div>
                      <small class="text-muted">{{ formatDate(item.expiry_date) }}</small>
                    </div>
                    <div class="mt-1">
                      <span v-if="item.hsdTrangThai === 'Hết hạn'" class="badge badge-danger">Hết hạn</span>
                      <span v-else-if="item.hsdTrangThai === 'Sắp hết'" class="badge badge-warning">Sắp hết</span>
                      <span v-else-if="item.hsdTrangThai === 'An toàn'" class="badge badge-success">Có HSD</span>
                    </div>
                  </td>
                  <td>
                    <b-button size="sm" variant="outline-primary" @click="suaHang(item)">Sửa</b-button>
                    <b-button size="sm" variant="outline-danger" @click="xoaHang(item)">Xóa</b-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="text-muted">
              Hiển thị {{ items.length }} / {{ total }} mục
            </div>
            <nav aria-label="Pagination">
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                    <i class="fas fa-angle-left"></i>
                    <span class="sr-only">Previous</span>
                  </a>
                </li>
                
                <li 
                  v-for="page in visiblePages" 
                  :key="page" 
                  class="page-item" 
                  :class="{ active: page === currentPage }"
                >
                  <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                    <i class="fas fa-angle-right"></i>
                    <span class="sr-only">Next</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <div class="chatbox-container">
      <transition name="fade">
        <div v-if="!chatOpen" class="chat-toggle" @click="toggleChat">💬</div>
      </transition>

      <transition name="pop">
        <div v-if="chatOpen" class="chat-window">
          <div class="chat-header">
            <div class="chat-avatar">🤖</div>
            <div>
              <div class="chat-title">Trợ lý kho</div>
              <div class="chat-status">Đang hoạt động</div>
            </div>
            <div class="close-btn" @click="toggleChat">×</div>
          </div>

          <div class="chat-body" ref="chatBody">
            <div v-for="(msg, i) in messages" :key="i" :class="['message', msg.sender]">
              <div class="bubble">{{ msg.text }}</div>
            </div>
          </div>

          <div class="chat-input">
            <input
              v-model="newMessage"
              placeholder="Nhập tin nhắn..."
              @keyup.enter="sendMessage"
            />
            <button @click="sendMessage">➤</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      searchQuery: "",
      selectedRestaurant: '',
      restaurantOptions: [],
      chatOpen: false,
      newMessage: "",
      messages: [
        {
          sender: "bot",
          text: "Xin chào 👋! Tôi là trợ lý kho. Hãy chọn:\n1️⃣ Hàng cần nhập\n2️⃣ Hàng sắp/hết hạn\n3️⃣ Báo cáo tồn kho\n4️⃣ Hướng dẫn thao tác",
        },
      ],
      items: [],
      loading: false,
      error: null,
      filterType: 'all', // all, expired, near-expiry, low-stock
      searchTimeout: null,
      // Pagination
      currentPage: 1,
      totalPages: 1,
      perPage: 15,
      total: 0,
    };
  },
  mounted() {
    this.loadItems(1);
    this.loadRestaurantOptions();
  },
  watch: {
    searchQuery(newVal) {
      // Debounce search - đợi 500ms sau khi user ngừng gõ
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.loadItems(1);
      }, 500);
    },
    filterType() {
      this.loadItems(1);
    }
  },
  computed: {
    filteredItems() {
      return this.items;
    },
    expiredCount() {
      return this.items.filter((i) => i.hsdTrangThai === 'Hết hạn').length;
    },
    nearExpiryCount() {
      return this.items.filter((i) => i.hsdTrangThai === 'Sắp hết').length;
    },
    lowStockCount() {
      return this.items.filter((i) => i.trangThai === 'Cần nhập').length;
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    // ---- Load data from API ----
    async loadItems(page = 1) {
      try {
        this.loading = true;
        this.error = null;
        
        // Build query parameters
        let url = `/inventories?page=${page}`;
        
        // Thêm search query
        if (this.searchQuery) {
          url += `&search=${encodeURIComponent(this.searchQuery)}`;
        }
        
        // Thêm filter type
        if (this.filterType === 'expired') {
          url += `&status=expired`;
        } else if (this.filterType === 'near-expiry') {
          url += `&status=near-expiry`;
        } else if (this.filterType === 'low-stock') {
          url += `&low_stock=1`;
        }

        // Lọc theo nhà hàng nếu có
        if (this.selectedRestaurant) {
          url += `&restaurant_id=${encodeURIComponent(this.selectedRestaurant)}`;
        }
        
        const res = await api.get(url);
        
        // Kiểm tra cấu trúc response
        console.log('Full API Response:', res.data);
        
        // Xử lý nhiều dạng response
        let dataArray = [];
        
        // Laravel trả về: {success: true, data: {...}}
        if (res.data.success && res.data.data) {
          // Kiểm tra nếu là paginated response (có data.data)
          if (res.data.data.data && Array.isArray(res.data.data.data)) {
            // Laravel pagination: {success: true, data: {data: [...], current_page: 1, ...}}
            dataArray = res.data.data.data;
            console.log('Extracted from paginated response:', dataArray);
          } else if (Array.isArray(res.data.data)) {
            // data là array trực tiếp
            dataArray = res.data.data;
            console.log('Extracted from res.data.data (array):', dataArray);
          } else {
            console.error('Unexpected response format:', res.data);
            throw new Error('Invalid response format');
          }
        } else if (Array.isArray(res.data)) {
          // Response trực tiếp là array
          dataArray = res.data;
          console.log('Extracted from res.data (direct array):', dataArray);
        } else {
          console.error('Unexpected response format:', res.data);
          throw new Error('Invalid response format');
        }
        
        // Map dữ liệu từ database
        this.items = dataArray.map(item => ({
          id: item.inventory_id,
          restaurant_id: item.restaurant_id,
          // Try common shapes for restaurant name if API includes nested restaurant
          restaurant_name: item.restaurant_name || (item.restaurant && (item.restaurant.name || item.restaurant.restaurant_name)) || '',
          item_name: item.item_name,
          // Normalize numeric fields to numbers for consistent comparison
          quantity: Number(item.quantity) || 0,
          unit: item.unit,
          reorder_level: Number(item.reorder_level) || 20,
          // Try several common expiry field names from different APIs
          expiry_date: item.expiry_date || item.hsd || item.expiry || item.expiryDate || item.best_before || item.expired_at || null,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          hsdTrangThai: this.calculateHSDStatus(item.expiry_date),
          trangThai: this.calculateStockStatus(Number(item.quantity) || 0, Number(item.reorder_level) || 20)
        }));
        
        // Cập nhật thông tin phân trang
        if (res.data.data.current_page) {
          this.currentPage = res.data.data.current_page;
          this.totalPages = res.data.data.last_page;
          this.perPage = res.data.data.per_page;
          this.total = res.data.data.total;
        }
        
        console.log('Mapped items:', this.items);
        console.log('Pagination:', { currentPage: this.currentPage, totalPages: this.totalPages, total: this.total });
        this.loading = false;
      } catch (err) {
        console.error('Lỗi tải kho:', err);
        console.error('Error details:', err.response && err.response.data);
        this.error = 'Không thể tải dữ liệu từ API. Vui lòng kiểm tra backend.';
        this.items = [];
        this.loading = false;
      }
    },

    // Phân trang
    changePage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage) return;
      this.loadItems(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Tính trạng thái HSD
    calculateHSDStatus(expiryDate) {
      if (!expiryDate) return 'Không có HSD';

      // Support numbers (timestamp seconds or ms) and strings
      let expiry;
      try {
        if (typeof expiryDate === 'number') {
          // If seconds, convert to ms
          expiry = expiryDate > 1e12 ? new Date(expiryDate) : new Date(expiryDate * 1000);
        } else if (/^\d+$/.test(String(expiryDate))) {
          const n = Number(expiryDate);
          expiry = n > 1e12 ? new Date(n) : new Date(n * 1000);
        } else {
          expiry = new Date(expiryDate);
        }
      } catch (e) {
        return 'Không có HSD';
      }

      if (!expiry || isNaN(expiry.getTime())) return 'Không có HSD';

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);

      const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) return 'Hết hạn';
      if (daysUntilExpiry <= 7) return 'Sắp hết';
      return 'An toàn';
    },

    // Tính trạng thái tồn kho
    calculateStockStatus(quantity, reorderLevel = 20) {
      const q = Number(quantity) || 0;
      const r = Number(reorderLevel) || 20;
      return q < r ? 'Cần nhập' : 'An toàn';
    },

    // Load danh sách nhà hàng (nếu API hỗ trợ)
    async loadRestaurantOptions() {
      try {
        const res = await api.get('/restaurants');
        if (res && res.data) {
          // support various response shapes
          const data = Array.isArray(res.data) ? res.data : (res.data.data || res.data);
          if (Array.isArray(data)) {
            this.restaurantOptions = data.map(r => ({ id: r.id || r.restaurant_id, name: r.name || r.restaurant_name || '' }));
            return;
          }
        }
      } catch (e) {
        // ignore - fallback to derive from loaded items
      }

      // Fallback: derive from current items
      const map = {};
      this.items.forEach(i => {
        if (i.restaurant_id && !map[i.restaurant_id]) map[i.restaurant_id] = i.restaurant_name || '';
      });
      this.restaurantOptions = Object.keys(map).map(k => ({ id: k, name: map[k] }));
    },

    refreshRestaurants() {
      this.loadRestaurantOptions();
    },

    // Helper: get items a restaurant needs to restock
    getRestaurantNeeds(restaurantId) {
      return this.items.filter(i => String(i.restaurant_id) === String(restaurantId) && i.trangThai === 'Cần nhập');
    },

    // Format item label for chat output, handling array names and numeric formatting
    formatItemLabel(item, opts = {}) {
      const { includeRestaurant = false, includeHSD = false } = opts;
      let name = item.item_name;
      if (Array.isArray(name)) {
        // join without spaces to avoid '0 1 2 3' outputs
        name = name.join('');
      }
      if (name == null || name === '') {
        name = item.name || item.restaurant_name || '(không tên)';
      }
      name = String(name).trim();

      const qty = (item.quantity === null || item.quantity === undefined) ? null : Number(item.quantity);
      const qtyStr = qty === null || Number.isNaN(qty) ? '?' : String(Math.round(qty));
      const unit = item.unit || '';

      const parts = [];
      if (includeRestaurant && item.restaurant_id) parts.push(`NH-${item.restaurant_id}`);
      parts.push(name);

      let suffix = `${qtyStr}${unit ? ' ' + unit : ''}`;
      if (includeHSD && item.expiry_date) suffix += `, HSD: ${this.formatDate(item.expiry_date)}`;

      return `${parts.join(' - ')} (${suffix})`;
    },

    // Format ngày tháng
    formatDate(dateString) {
      if (!dateString) return '-';
      try {
        let d;
        if (typeof dateString === 'number') {
          d = dateString > 1e12 ? new Date(dateString) : new Date(dateString * 1000);
        } else if (/^\d+$/.test(String(dateString))) {
          const n = Number(dateString);
          d = n > 1e12 ? new Date(n) : new Date(n * 1000);
        } else {
          d = new Date(dateString);
        }
        if (!d || isNaN(d.getTime())) return '-';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      } catch (e) {
        return '-';
      }
    },

    // Format ngày hết hạn
    formatExpiryDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },

    // ---- Trang điều hướng ----
    themHang() { 
      this.$router.push("/them-hang");
    },
    
    suaHang(item) { 
      this.$router.push({ path: "/sua-hang", query: { id: item.id } });
    },
    
    async xoaHang(item) {
      if (!confirm(`Bạn có chắc muốn xóa "${item.item_name}"?`)) return;
      
      try {
        this.loading = true;
        await api.delete(`/inventories/${item.id}`);
        alert('Xóa thành công!');
        this.loadItems(this.currentPage);
      } catch (err) {
        console.error('Lỗi xóa:', err);
        alert('Không thể xóa. Vui lòng thử lại.');
        this.loading = false;
      }
    },
    
    lichSuKho() { this.$router.push("/lich-su-kho"); },
    xuatBaoCaoPDF() { this.$router.push("/bao-cao-pdf"); },

    // ---- Chat logic ----
    toggleChat() {
      this.chatOpen = !this.chatOpen;
      this.$nextTick(() => {
        if (this.chatOpen && this.$refs.chatBody)
          this.$refs.chatBody.scrollTop = this.$refs.chatBody.scrollHeight;
      });
    },
    sendMessage() {
      if (!this.newMessage.trim()) return;
      const msg = this.newMessage.trim();
      this.messages.push({ sender: "user", text: msg });
      this.newMessage = "";

      setTimeout(() => {
        const reply = this.generateReply(msg);
        this.messages.push({ sender: "bot", text: reply });
        this.$nextTick(() => {
          this.$refs.chatBody.scrollTop = this.$refs.chatBody.scrollHeight;
        });
      }, 600);
    },
    generateReply(input) {
      const msg = input.trim();
      const lower = msg.toLowerCase();

      // Command: "nhà hàng <id>" => show needs for that restaurant
      const nhMatch = msg.match(/nh(?:à|a) h(?:à|a)ng\s*(\d+)/i) || msg.match(/nh\-?(\d+)/i);
      if (nhMatch) {
        const id = nhMatch[1];
        const needs = this.getRestaurantNeeds(id);
        if (needs.length === 0) return `✅ Nhà hàng NH-${id} không có mặt hàng cần nhập ngay.`;
        return `🔸 Nhà hàng NH-${id} cần nhập (${needs.length}):\n` + needs.map(i => `- ${this.formatItemLabel(i)}`).join('\n');
      }

      // Command: "nhập <id>" or "cần nhập <id>"
      const needMatch = msg.match(/(?:nhập|cần nhập)\s*(\d+)/i);
      if (needMatch) {
        const id = needMatch[1];
        const needs = this.getRestaurantNeeds(id);
        if (needs.length === 0) return `✅ Nhà hàng NH-${id} không cần nhập hàng ngay.`;
        return `📦 Danh sách cần nhập cho NH-${id}:\n` + needs.map(i => `- ${this.formatItemLabel(i)}`).join('\n');
      }

      // Command: "tìm <term> tại <id>" or "tìm <term>"
      const findAt = msg.match(/tìm\s+(.+)\s+tại\s+(\d+)/i);
      if (findAt) {
        const term = findAt[1].trim().toLowerCase();
        const id = findAt[2];
        const results = this.items.filter(i => String(i.restaurant_id) === String(id) && i.item_name && i.item_name.toLowerCase().includes(term));
        if (!results.length) return `🔍 Không tìm thấy "${term}" tại NH-${id}.`;
        return `🔍 Kết quả tìm kiếm tại NH-${id}:\n` + results.map(i => `- ${this.formatItemLabel(i)}`).join('\n');
      }

      // Simple search: "tìm <term>"
      const find = msg.match(/tìm\s+(.+)/i);
      if (find) {
        const term = find[1].trim().toLowerCase();
        const results = this.items.filter(i => i.item_name && i.item_name.toLowerCase().includes(term));
        if (!results.length) return `🔍 Không tìm thấy "${term}" trong kho.`;
        return `🔍 Kết quả tìm kiếm:\n` + results.slice(0, 10).map(i => `- ${this.formatItemLabel(i, { includeRestaurant: true })}`).join('\n');
      }

      if (msg === "1") {
        const canNhap = this.items.filter((i) => i.trangThai === "Cần nhập");
        return canNhap.length
          ? "🔸 Hàng cần nhập:\n" + canNhap.map((i) => `- ${this.formatItemLabel(i)}`).join("\n")
          : "✅ Tất cả hàng đều an toàn.";
      }
      if (msg === "2") {
        const hetHan = this.items.filter((i) => i.hsdTrangThai === "Hết hạn");
        const sapHet = this.items.filter((i) => i.hsdTrangThai === "Sắp hết");
        let response = "";
        if (hetHan.length > 0) {
          response += `� Hàng đã hết hạn (${hetHan.length}):\n` + 
                     hetHan.slice(0, 5).map((i) => `- ${this.formatItemLabel(i, { includeHSD: true })}`).join("\n");
        }
        if (sapHet.length > 0) {
          response += (response ? "\n\n" : "") + 
                     `⚠️ Hàng sắp hết hạn (${sapHet.length}):\n` + 
                     sapHet.slice(0, 5).map((i) => `- ${this.formatItemLabel(i, { includeHSD: true })}`).join("\n");
        }
        return response || "🟢 Không có hàng sắp/hết hạn.";
      }
      if (msg === "3") {
        const tong = this.items.length;
        const canNhap = this.items.filter((i) => i.trangThai === "Cần nhập").length;
        const anToan = this.items.filter((i) => i.trangThai === "An toàn").length;
        const hetHan = this.items.filter((i) => i.hsdTrangThai === "Hết hạn").length;
        const sapHet = this.items.filter((i) => i.hsdTrangThai === "Sắp hết").length;
        return `📊 Báo cáo nhanh:\n- Tổng mặt hàng: ${tong}\n- Cần nhập thêm: ${canNhap}\n- An toàn: ${anToan}\n- Hết hạn: ${hetHan}\n- Sắp hết hạn: ${sapHet}`;
      }
      if (msg === "4" || msg.toLowerCase() === "help")
        return "👉 Hướng dẫn:\n1️⃣ Hàng cần nhập\n2️⃣ Hàng sắp/hết hạn\n3️⃣ Báo cáo tổng\n4️⃣ Hướng dẫn thao tác";
      return "🤔 Tôi không hiểu. Nhập 1, 2, 3 hoặc 4 nhé.";
    },
  },
};
</script>

<style scoped>
/* ----- Hiệu ứng Pop (cho cửa sổ chat) ----- */

/* Định nghĩa thời gian và kiểu chuyển động CHỈ KHI MỞ */
.pop-enter-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
  /* 👆 ĐÃ XÓA .pop-leave-active KHỎI ĐÂY ĐỂ TẮT HIỆU ỨNG ĐÓNG */
}

/* KHI ĐÓNG (pop-leave-active) sẽ không có transition, nên sẽ đóng ngay lập tức */


/* Trạng thái "BẮT ĐẦU VÀO" (enter-from)
  và trạng thái "KẾT THÚC RỜI ĐI" (leave-to)
  Cả hai đều là ẩn đi và thu nhỏ lại.
*/
.pop-enter-from,
.pop-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
/* Trạng thái "KẾT THÚC VÀO" (enter-to) và "BẮT ĐẦU RỜI ĐI" (leave-from)
   sẽ tự động lấy style mặc định (scale(1), opacity: 1) */


/* ----- Hiệu ứng Fade (cho nút toggle) ----- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

/* Trạng thái bắt đầu vào và kết thúc rời đi (hoàn toàn trong suốt) */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Nút 💬 mở chat */
.chat-toggle {
  background: linear-gradient(135deg, #0084ff, #00bfa5);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.25s;
}
.chat-toggle:hover {
  transform: scale(1.1);
}

/* Khung chat */
.chatbox-container {
  position: fixed;
  bottom: 20px;
  right: 25px;
  z-index: 1000;
}
.chat-window {
  width: 340px;
  height: 470px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
}

/* Header */
.chat-header {
  background: linear-gradient(135deg, #0084ff, #00bfa5);
  color: #fff;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  position: relative;
}
.chat-avatar {
  background: rgba(255, 255, 255, 0.2);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 20px;
}
.chat-title {
  font-weight: 600;
  font-size: 16px;
}
.chat-status {
  font-size: 12px;
  opacity: 0.85;
}
.close-btn {
  position: absolute;
  right: 10px;
  top: 5px;
  cursor: pointer;
  font-size: 22px;
  opacity: 0.8;
  transition: 0.2s;
}
.close-btn:hover {
  opacity: 1;
}

/* Nội dung chat */
.chat-body {
  flex: 1;
  padding: 12px;
  background: #f0f2f5;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.message {
  margin-bottom: 8px;
  display: flex;
}
.message.user {
  justify-content: flex-end;
}
.message.bot {
  justify-content: flex-start;
}
.bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-line;
}
.message.user .bubble {
  background: #0084ff;
  color: #fff;
  border-bottom-right-radius: 5px;
}
.message.bot .bubble {
  background: #e4e6eb;
  color: #050505;
  border-bottom-left-radius: 5px;
}

/* Thanh nhập */
.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;
  background: #fff;
}
.chat-input input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #ccc;
  outline: none;
  transition: 0.2s;
}
.chat-input input:focus {
  border-color: #0084ff;
}
.chat-input button {
  background: #0084ff;
  border: none;
  color: white;
  font-size: 18px;
  margin-left: 8px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: 0.25s;
}
.chat-input button:hover { 
  background: #0073e6;
}
</style>
