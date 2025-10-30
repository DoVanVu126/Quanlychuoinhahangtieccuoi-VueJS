<template>
  <div>
    <!-- Header -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">KHO NGUYÊN LIỆU</h2>
          <p class="text-light">Theo dõi và quản lý nguyên vật liệu trong kho</p>
        </div>
      </div>
    </base-header>

    <!-- Nội dung chính -->
    <div class="container-fluid mt--7">
      <div
        class="card shadow-lg border-0"
        style="margin-top: -80px; border-radius: 20px; overflow: hidden;"
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

          <!-- Bảng dữ liệu -->
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
        </div>
      </div>
    </div>

    <!-- Chatbox -->
    <div class="chatbox-container">
      <div class="chat-toggle" @click="toggleChat">
        💬
      </div>

      <transition name="fade">
        <div v-if="chatOpen" class="chat-window">
          <div class="chat-header">
            <strong>🤖 Trợ lý kho</strong>
            <span @click="toggleChat" class="close-btn">×</span>
          </div>

          <div class="chat-body">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['message', msg.sender]"
            >
              {{ msg.text }}
            </div>
          </div>

          <div class="chat-input">
            <input
              v-model="newMessage"
              placeholder="Nhập tin nhắn..."
              @keyup.enter="sendMessage"
            />
            <button @click="sendMessage">Gửi</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: "",
      items: [
        { ma: "TB-001", ten: "Thịt Bò Thăn", ton: 15, dvt: "KG", lo: "L01-0925", hsd: "27/09/2025", hsdTrangThai: "Hết hạn", trangThai: "Cần nhập" },
        { ma: "CA-005", ten: "Cá Hồi Fillet", ton: 25, dvt: "KG", lo: "L03-1025", hsd: "15/10/2025", hsdTrangThai: "Sắp hết", trangThai: "An toàn" },
        { ma: "GA-002", ten: "Gạo Nếp", ton: 500, dvt: "KG", lo: "L08-2026", hsd: "20/08/2026", hsdTrangThai: "An toàn", trangThai: "An toàn" },
        { ma: "HL-010", ten: "Hải Sâm Khô", ton: 3, dvt: "Hộp", lo: "HS-02C", hsd: "15/01/2026", hsdTrangThai: "An toàn", trangThai: "Cần nhập" },
      ],
      chatOpen: false,
      messages: [
        { sender: 'bot', text: 'Xin chào! Tôi là trợ lý kho. Bạn muốn xem tồn kho hay tình hình nguyên liệu?' },
      ],
      newMessage: '',
    };
  },
  computed: {
    filteredItems() {
      return this.items.filter((i) =>
        i.ten.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    // ---- Điều hướng trang ----
    themHang() { this.$router.push("/them-hang"); },
    suaHang(item) { this.$router.push({ path: "/sua-hang", query: { ma: item.ma } }); },
    xoaHang(item) { this.$router.push({ path: "/xoa-hang", query: { ma: item.ma } }); },
    lichSuKho() { this.$router.push("/lich-su-kho"); },
    xuatBaoCaoPDF() { this.$router.push("/bao-cao-pdf"); },

    // ---- Chatbox ----
    toggleChat() {
      this.chatOpen = !this.chatOpen;
    },

    sendMessage() {
      if (!this.newMessage.trim()) return;

      const msg = this.newMessage.trim();
      this.messages.push({ sender: 'user', text: msg });
      this.newMessage = '';

      setTimeout(() => {
        const reply = this.generateReply(msg.toLowerCase());
        this.messages.push({ sender: 'bot', text: reply });
      }, 500);
    },

    generateReply(input) {
      const low = input.toLowerCase();

      // Hàng cần nhập
      if (low.includes('cần nhập') || low.includes('thiếu') || low.includes('hết hàng')) {
        const canNhap = this.items.filter(i => i.trangThai === 'Cần nhập' || i.ton < 20);
        if (canNhap.length === 0) return 'Tất cả hàng trong kho đều ở mức an toàn.';
        return '🔸 Hàng cần nhập:\n' + canNhap.map(i => `- ${i.ten} (${i.ton} ${i.dvt})`).join('\n');
      }

      // Hàng sắp hoặc hết hạn
      if (low.includes('hết hạn') || low.includes('sắp hết')) {
        const sapHet = this.items.filter(i => i.hsdTrangThai !== 'An toàn');
        if (sapHet.length === 0) return 'Hiện không có hàng nào sắp hoặc đã hết hạn.';
        return '⚠️ Hàng sắp/hết hạn:\n' + sapHet.map(i => `- ${i.ten} (${i.hsdTrangThai})`).join('\n');
      }

      // Báo cáo tổng kho
      if (low.includes('tình hình') || low.includes('tồn kho') || low.includes('báo cáo')) {
        const tong = this.items.length;
        const canNhap = this.items.filter(i => i.trangThai === 'Cần nhập').length;
        const hetHan = this.items.filter(i => i.hsdTrangThai === 'Hết hạn').length;
        const sapHet = this.items.filter(i => i.hsdTrangThai === 'Sắp hết').length;

        return `📊 Báo cáo nhanh:\n- Tổng số mặt hàng: ${tong}\n- Cần nhập: ${canNhap}\n- Hết hạn: ${hetHan}\n- Sắp hết hạn: ${sapHet}`;
      }

      // Hướng dẫn thao tác
      if (low.includes('thêm')) {
        return 'Bạn có thể nhấn nút “+ Thêm Nguyên Liệu” để thêm hàng mới nhé!';
      }
      if (low.includes('pdf') || low.includes('báo cáo')) {
        return 'Để xuất báo cáo PDF, nhấn nút “Xuất Báo Cáo PDF” nha.';
      }

      return 'Tôi chưa hiểu rõ câu hỏi. Bạn có thể hỏi “Hàng nào cần nhập?” hoặc “Tình hình kho hôm nay?”.';
    },
  },
};
</script>

<style scoped>
.card {
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

/* Chatbox */
.chatbox-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}
.chat-toggle {
  background: #28a745;
  color: white;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}
.chat-toggle:hover {
  transform: scale(1.1);
}

.chat-window {
  width: 320px;
  height: 420px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-header {
  background: #28a745;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}
.message {
  padding: 8px 12px;
  border-radius: 12px;
  margin-bottom: 6px;
  max-width: 80%;
  white-space: pre-line;
}
.message.user {
  background: #007bff;
  color: white;
  align-self: flex-end;
}
.message.bot {
  background: #e9ecef;
  align-self: flex-start;
}
.chat-input {
  display: flex;
  border-top: 1px solid #ddd;
}
.chat-input input {
  flex: 1;
  border: none;
  padding: 8px 10px;
}
.chat-input button {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 15px;
}
.close-btn {
  cursor: pointer;
  font-size: 20px;
}

/* Hiệu ứng mở */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
