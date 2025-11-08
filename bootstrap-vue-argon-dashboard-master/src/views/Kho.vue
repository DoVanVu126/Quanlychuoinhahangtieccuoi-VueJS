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
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="Tìm kiếm theo tên, lô hàng, nhà cung cấp..."
            />

            <div class="d-flex gap-2">
              <b-button variant="primary" @click="themHang">+ Thêm Nguyên Liệu</b-button>
              <b-button variant="info" @click="lichSuKho">Lịch sử kho</b-button>
              <b-button variant="success" @click="xuatBaoCaoPDF">Xuất Báo Cáo PDF</b-button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-items-center">
              <thead class="thead-light">
                <tr>
                  <th>Mã hàng</th>
                  <th>Tên hàng</th>
                  <th>Tồn kho</th>
                  <th>ĐVT</th>
                  <th>Lô hàng</th>
                  <th>HSD</th>
                  <th>Trạng thái HSD</th>
                  <th>Trạng thái tồn kho</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredItems" :key="item.ma">
                  <td>{{ item.ma }}</td>
                  <td>{{ item.ten }}</td>
                  <td>{{ item.ton }}</td>
                  <td>{{ item.dvt }}</td>
                  <td>{{ item.lo }}</td>
                  <td>{{ item.hsd }}</td>
                  <td>
                    <span
                      :class="{
                        'badge badge-danger': item.hsdTrangThai === 'Hết hạn',
                        'badge badge-warning': item.hsdTrangThai === 'Sắp hết',
                        'badge badge-success': item.hsdTrangThai === 'An toàn',
                      }"
                    >
                      {{ item.hsdTrangThai }}
                    </span>
                  </td>
                  <td>
                    <span
                      :class="{
                        'badge badge-success': item.trangThai === 'An toàn',
                        'badge badge-warning': item.trangThai === 'Cần nhập',
                      }"
                    >
                      {{ item.trangThai }}
                    </span>
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
      // Pagination
      currentPage: 1,
      totalPages: 1,
      perPage: 15,
      total: 0,
    };
  },
  mounted() {
    this.loadItems(1);
  },
  computed: {
    filteredItems() {
      return this.items.filter((i) =>
        i.ten.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
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
        const res = await api.get(`/inventories?page=${page}`);
        
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
          ma: `INV-${String(item.inventory_id).padStart(3, '0')}`,
          ten: item.item_name,
          ton: item.quantity,
          dvt: item.unit,
          lo: item.batch || '-',
          hsd: item.expiry_date || '-',
          restaurant_id: item.restaurant_id,
          reorder_level: item.reorder_level || 20,
          hsdTrangThai: this.calculateHSDStatus(item.expiry_date),
          trangThai: this.calculateStockStatus(item.quantity, item.reorder_level)
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
    calculateHSDStatus(hsd) {
      if (!hsd || hsd === '-') return 'An toàn';
      const parts = hsd.split('/');
      if (parts.length !== 3) return 'An toàn';
      
      const [day, month, year] = parts;
      const expiryDate = new Date(year, month - 1, day);
      const today = new Date();
      const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) return 'Hết hạn';
      if (daysUntilExpiry <= 30) return 'Sắp hết';
      return 'An toàn';
    },

    // Tính trạng thái tồn kho
    calculateStockStatus(quantity, reorderLevel = 20) {
      return quantity < reorderLevel ? 'Cần nhập' : 'An toàn';
    },

    // ---- Trang điều hướng ----
    themHang() { this.$router.push("/them-hang"); },
    suaHang(item) { this.$router.push({ path: "/sua-hang", query: { ma: item.ma } }); },
    
    async xoaHang(item) {
      if (!confirm(`Bạn có chắc muốn xóa ${item.ten}?`)) return;
      
      try {
        await api.delete(`/inventories/${item.id}`);
        this.loadItems();
      } catch (err) {
        console.error('Lỗi xóa:', err);
        alert('Không thể xóa. Vui lòng thử lại.');
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
      if (msg === "1") {
        const canNhap = this.items.filter((i) => i.trangThai === "Cần nhập" || i.ton < 20);
        return canNhap.length
          ? "🔸 Hàng cần nhập:\n" + canNhap.map((i) => `- ${i.ten} (${i.ton} ${i.dvt})`).join("\n")
          : "✅ Tất cả hàng đều an toàn.";
      }
      if (msg === "2") {
        const sapHet = this.items.filter((i) => i.hsdTrangThai !== "An toàn");
        return sapHet.length
          ? "⚠️ Hàng sắp/hết hạn:\n" + sapHet.map((i) => `- ${i.ten} (${i.hsdTrangThai})`).join("\n")
          : "🟢 Không có hàng sắp/hết hạn.";
      }
      if (msg === "3") {
        const tong = this.items.length;
        const canNhap = this.items.filter((i) => i.trangThai === "Cần nhập").length;
        const hetHan = this.items.filter((i) => i.hsdTrangThai === "Hết hạn").length;
        const sapHet = this.items.filter((i) => i.hsdTrangThai === "Sắp hết").length;
        return `📊 Báo cáo nhanh:\n- Tổng: ${tong}\n- Cần nhập: ${canNhap}\n- Hết hạn: ${hetHan}\n- Sắp hết hạn: ${sapHet}`;
      }
      if (msg === "4" || msg.toLowerCase() === "help")
        return "👉 Hướng dẫn:\n1️⃣ Hàng cần nhập\n2️⃣ Sắp/hết hạn\n3️⃣ Báo cáo tổng\n4️⃣ Hướng dẫn thao tác";
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
