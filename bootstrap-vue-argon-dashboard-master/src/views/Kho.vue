<template>
  <div>
    <div class="dashboard-container">
      <h1>Quản lý Kho</h1>
      
      <div class="toolbar">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchText" 
            placeholder="Tìm kiếm theo tên, lô hàng, mã..."
          >
        </div>
        <div class="toolbar-buttons">
          <button @click="openModal('add')"> + Thêm Nguyên liệu Mới</button>
          <button @click="goToHistory">Lịch sử kho</button>
          <button id="exportPdfBtn" @click="exportToPDF"> Xuất Báo Cáo PDF</button> 
        </div>
      </div>

      <table ref="inventoryTable" class="inventory-table"> 
        <thead>
          <tr>
            <th>Mã hàng</th>
            <th>Tên hàng</th>
            <th>Tồn kho</th>
            <th>ĐVT</th>
            <th>Lô hàng</th>
            <th>HSD</th>
            <th>Trạng thái HSD</th>
            <th>Trạng thái tồn kho</th>
            <th class="no-print">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredInventory" :key="item.code" :class="item.rowClass">
            <td>{{ item.code }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.stock }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ item.batch }}</td>
            <td>{{ item.expiry }}</td>
            <td>
              <span :class="['status-tag', item.statusHSDClass]">{{ item.statusHSD }}</span>
            </td>
            <td>
              <span :class="['status-tag', item.statusStockClass]">{{ item.statusStock }}</span>
            </td>
            <td class="no-print">
              <span class="status-tag tag-action" @click="openModal('edit', item)">Sửa</span>
              <span class="status-tag tag-action" style="background-color: var(--danger-color);" @click="deleteItem(item)">Xóa</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal" v-if="showModal" @click.self="closeModal">
      <div class="modal-content">
        <span class="close-btn" @click="closeModal">&times;</span>
        
        <h2 id="modalTitle">{{ modalTitle }}</h2>
        
        <form id="inventoryForm" @submit.prevent="saveItem">
          <label for="itemCode">Mã hàng:</label>
          <input type="text" v-model="currentItem.code" :disabled="isEditing" required>
          
          <label for="itemName">Tên hàng:</label>
          <input type="text" v-model="currentItem.name" required>
          
          <label for="quantity">Tồn kho:</label>
          <input type="number" v-model.number="currentItem.stock" required min="0">
          
          <label for="unit">Đơn vị tính:</label>
          <select v-model="currentItem.unit" required>
            <option value="KG">KG</option>
            <option value="Lít">Lít</option>
            <option value="Cái">Cái</option>
            <option value="Hộp">Hộp</option>
            <option value="Chai">Chai</option>
            <option value="Gói">Gói</option>
          </select>
          
          <label for="batch">Lô hàng:</label>
          <input type="text" v-model="currentItem.batch">
          
          <label for="expiryDate">Hạn sử dụng (HSD):</label>
          <input type="date" v-model="currentItem.expiryDateInput">
          
          <div class="modal-footer">
            <button type="button" class="btn-primary" @click="closeModal">Hủy</button>
            <button type="submit" class="btn-primary btn-save">Lưu</button>
          </div>
        </form>
      </div>
    </div>
    
    <div id="chatbox">
      <div @click="toggleChatbox" class="chatbox-header">
        <span class="chatbox-title">Trợ lý kho</span>
        <span class="chatbox-toggle">{{ isChatboxOpen ? '—' : '＋' }}</span>
      </div>

      <template v-if="isChatboxOpen">
        <div style="display:flex;gap:5px;">
          <input 
            v-model="chatSearchText" 
            @keyup.enter="searchProductInfo" 
            type="text" 
            placeholder="Nhập tên sản phẩm..." 
            style="flex-grow:1;padding:8px 12px;border-radius:6px;border:1px solid #ccc;font-size:15px;"
          >
          <button @click="searchProductInfo" class="btn-primary" style="padding: 8px 12px; font-size: 15px; width: 70px;">Tìm</button>
        </div>
        <div id="chatResult" v-html="chatResultHTML" style="font-size:15px;color:#333;"></div>
      </template>
      </div>
  </div>
</template>

<script>
/* NOTE:
  Ensure html2pdf.js is available when using exportToPDF.
  You can either include it via a <script> tag in index.html
  or import it in this component (uncomment the import below):
  // import html2pdf from 'html2pdf.js';
*/

export default {
  name: 'QuanLyKho',
  data() {
    return {
      // Ngưỡng tồn kho thấp
      STOCK_LOW_THRESHOLD: 50,
      
      // Dữ liệu gốc
      products: [
        { code:'TB-001', name:'Thịt Bò Thăn', stock:150, unit:'KG', batch:'L01-0925', expiry:'27/09/2025' },
        { code:'CA-005', name:'Cá Hồi Fillet', stock:250, unit:'KG', batch:'L03-1025', expiry:'15/10/2025' },
        { code:'GA-002', name:'Gạo Nếp', stock:500, unit:'KG', batch:'L08-2026', expiry:'20/08/2026' },
        { code:'TH-003', name:'Tôm Sú Lớn', stock:80, unit:'KG', batch:'TS-05B', expiry:'29/09/2025' },
        { code:'HL-010', name:'Hải Sâm Khô', stock:5, unit:'Hộp', batch:'HS-02C', expiry:'15/01/2026' },
        { code:'KC-007', name:'Khoai Tây Đà Lạt', stock:200, unit:'KG', batch:'KT-09A', expiry:'05/10/2025' },
        { code:'RV-022', name:'Rượu Vang Đỏ (Chai)', stock:450, unit:'Chai', batch:'RV-2024', expiry:'10/10/2027' },
        { code:'GB-015', name:'Gia Vị Bột Ngọt', stock:30, unit:'Gói', batch:'GVB-06', expiry:'01/06/2026' }
      ],

      // Trạng thái tìm kiếm
      searchText: '',

      // Trạng thái Modal
      showModal: false,
      isEditing: false,
      currentItem: null,
      
      // Trạng thái Chatbox
      chatSearchText: '',
      chatResultHTML: '',
      isChatboxOpen: true // <-- THÊM DÒNG NÀY
    }
  },

  created() {
    // Khởi tạo currentItem an toàn sau khi component được tạo
    this.currentItem = this.getEmptyItem();
  },

  computed: {
    /**
     * Tính toán tiêu đề cho modal
     */
    modalTitle() {
      return this.isEditing ? `Sửa Nguyên liệu: ${this.currentItem.code}` : 'Thêm Nguyên liệu Mới';
    },

    /**
     * Xử lý (thêm trạng thái) và lọc danh sách sản phẩm
     */
    filteredInventory() {
      const filter = this.searchText.toUpperCase();

      // 1. Xử lý: Thêm trạng thái (statusHSD, statusStock) và class vào mỗi item
      const processed = this.products.map(item => {
        const statusHSD = this.checkExpiryStatusHSD(item.expiry);
        const statusStock = this.checkExpiryStatusStock(item.stock);
        return {
          ...item,
          statusHSD,
          statusStock,
          statusHSDClass: this.getExpiryStatusClass(statusHSD),
          statusStockClass: this.getStockStatusClass(statusStock),
          rowClass: this.getRowClass(statusHSD, statusStock)
        };
      });

      // 2. Lọc
      const filtered = processed.filter(item => {
        if (!filter) return true;
        // Tìm kiếm trên nhiều trường
        return item.name.toUpperCase().includes(filter) ||
               item.code.toUpperCase().includes(filter) ||
               item.batch.toUpperCase().includes(filter);
      });

      // 3. Sắp xếp: Ưu tiên Hết hạn > Sắp hết / Tồn thấp > An toàn
      filtered.sort((a, b) => {
        let priorityA = this.getPriority(a);
        let priorityB = this.getPriority(b);
        return priorityA - priorityB;
      });

      return filtered;
    }
  },

  methods: {
    /**
     * Lấy độ ưu tiên để sắp xếp (số nhỏ hơn lên trước)
     */
    getPriority(item) {
      if (item.statusHSD === 'Hết Hạn!') return 1;
      if (item.statusHSD === 'Sắp hết') return 2;
      if (item.statusStock === 'Thấp') return 2.5; // Gần bằng 'Sắp hết'
      return 3; // An toàn
    },

    /**
     * Tạo một item rỗng cho form
     */
    getEmptyItem() {
      return {
        code: '',
        name: '',
        stock: 0,
        unit: 'KG',
        batch: '',
        expiry: '',
        expiryDateInput: '' // Dùng cho <input type="date">
      };
    },
    
    // --- Các hàm tính toán trạng thái (từ code gốc) ---
    checkExpiryStatusHSD(expiryDateStr) {
      if (!expiryDateStr) return 'An toàn';
      const parts = expiryDateStr.split('/');
      if (parts.length < 3) return 'An toàn'; // Xử lý ngày không hợp lệ
      
      const expiryDate = new Date(parts[2], parts[1] - 1, parts[0]);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expiryDate < today) return 'Hết Hạn!';
      
      const thirtyDaysAhead = new Date(today);
      thirtyDaysAhead.setDate(today.getDate() + 30);
      
      if (expiryDate <= thirtyDaysAhead) return 'Sắp hết';

      return 'An toàn';
    },
    
    checkExpiryStatusStock(stock) {
      return stock < this.STOCK_LOW_THRESHOLD ? 'Thấp' : 'An toàn';
    },

    // --- Các hàm helper để lấy class CSS ---
    getExpiryStatusClass(statusHSD) {
      if (statusHSD === 'Hết Hạn!') return 'tag-expired';
      if (statusHSD === 'Sắp hết') return 'tag-low';
      return 'tag-safe';
    },
    
    getStockStatusClass(statusStock) {
      return statusStock === 'Thấp' ? 'tag-stock-low' : 'tag-stock-safe';
    },

    getRowClass(statusHSD, statusStock) {
      if (statusHSD === 'Hết Hạn!') return 'row-danger';
      if (statusHSD === 'Sắp hết' || statusStock === 'Thấp') return 'row-alert';
      return '';
    },

    // --- Các hàm helper chuyển đổi định dạng ngày ---
    /**
     * Chuyển 'dd/mm/yyyy' (lưu trữ) sang 'yyyy-mm-dd' (cho input)
     */
    formatDateForInput(ddmmyyyy) {
      console.log('Formatting date for input:', ddmmyyyy); // Debug log
      if (!ddmmyyyy) return '';
      try {
        const parts = ddmmyyyy.split('/');
        if (parts.length < 3) return '';
        const formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        console.log('Formatted date for input:', formattedDate); // Debug log
        return formattedDate;
      } catch (error) {
        console.error('Error formatting date for input:', error);
        return '';
      }
    },

    /**
     * Chuyển 'yyyy-mm-dd' (từ input) sang 'dd/mm/yyyy' (lưu trữ)
     */
    formatDateForStorage(yyyymmdd) {
      console.log('Formatting date for storage:', yyyymmdd); // Debug log
      if (!yyyymmdd) return '';
      try {
        const parts = yyyymmdd.split('-');
        if (parts.length < 3) return '';
        const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        console.log('Formatted date for storage:', formattedDate); // Debug log
        return formattedDate;
      } catch (error) {
        console.error('Error formatting date for storage:', error);
        return '';
      }
    },

    // --- Các hàm xử lý sự kiện (Modal, Thêm, Sửa, Xóa) ---
    openModal(mode, item = null) {
      console.log('Opening modal:', mode, item); // Debug log
      this.isEditing = (mode === 'edit');
      
      if (this.isEditing && item) {
        // Sao chép item để chỉnh sửa
        this.currentItem = { 
          ...item,
          stock: Number(item.stock), // Đảm bảo stock là số
          // Chuyển đổi HSD sang định dạng input
          expiryDateInput: this.formatDateForInput(item.expiry)
        };
        console.log('Editing item:', this.currentItem); // Debug log
      } else {
        // Tạo item mới
        this.currentItem = this.getEmptyItem();
        console.log('New item:', this.currentItem); // Debug log
      }
      
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.currentItem = this.getEmptyItem();
      this.isEditing = false;
    },

    saveItem() {
      console.log('Saving item...', this.currentItem); // Debug log
      
      // Validate form
      if (!this.currentItem.code || !this.currentItem.name || this.currentItem.stock === undefined || !this.currentItem.unit) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc: Mã hàng, Tên hàng, Tồn kho, Đơn vị tính');
        return;
      }

      // Đảm bảo stock là số dương
      if (this.currentItem.stock < 0) {
        alert('Tồn kho không thể là số âm');
        return;
      }

      // Chuyển đổi ngày HSD từ input về định dạng lưu trữ
      const expiryDateStr = this.currentItem.expiryDateInput ? 
        this.formatDateForStorage(this.currentItem.expiryDateInput) : '';

      // Tạo đối tượng item mới để lưu
      const newItem = {
        code: this.currentItem.code.toUpperCase().trim(),
        name: this.currentItem.name.trim(),
        stock: Number(this.currentItem.stock),
        unit: this.currentItem.unit,
        batch: (this.currentItem.batch || '').trim(),
        expiry: expiryDateStr
      };

      console.log('New/Updated item:', newItem); // Debug log

      try {
        if (this.isEditing) {
          // Cập nhật
          const index = this.products.findIndex(p => p.code === newItem.code);
          if (index !== -1) {
            this.products.splice(index, 1, newItem); // Sử dụng splice thay vì gán trực tiếp
            console.log('Updated products:', this.products); // Debug log
            alert(`Sửa thành công: ${newItem.name}`);
          } else {
            alert('Lỗi: Không tìm thấy sản phẩm để cập nhật!');
            return;
          }
        } else {
          // Thêm mới
          if (this.products.some(p => p.code === newItem.code)) {
            alert('Lỗi: Mã hàng đã tồn tại! Vui lòng nhập mã khác.');
            return;
          }
          this.products.push(newItem);
          console.log('Added new item, products:', this.products); // Debug log
          alert(`Thêm thành công: ${newItem.name}`);
        }

        // Force Vue to re-render the list
        this.products = [...this.products];
        
        this.closeModal();
      } catch (error) {
        console.error('Error saving item:', error);
        alert('Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.');
      }
    },

    deleteItem(itemToDelete) {
      if (confirm(`Bạn có chắc muốn xóa mặt hàng ${itemToDelete.name} (${itemToDelete.code}) không?`)) {
        this.products = this.products.filter(p => p.code !== itemToDelete.code);
        alert(`Đã xóa mặt hàng: ${itemToDelete.name}`);
        // Bảng sẽ tự cập nhật
      }
    },

    /**
     * Chuyển đến trang Lịch sử (giả lập)
     */
    goToHistory() {
      alert("Đang chuyển đến trang Lịch sử kho... (Cần cài đặt Vue Router cho chức năng này)");
      // Trong ứng dụng thật: this.$router.push('/lich-su-kho');
    },

    // --- Chức năng Xuất PDF (từ code gốc) ---
    exportToPDF() {
      // 1. Lấy phần tử bảng qua $refs
      const tableElement = this.$refs.inventoryTable;
      
      if (!tableElement) {
        alert("Lỗi: Không tìm thấy bảng để xuất PDF.");
        return;
      }
      
      // 2. Tạo bản sao của bảng để thao tác
      const content = tableElement.cloneNode(true); 

      // 3. Loại bỏ cột Thao tác (chứa các nút Sửa/Xóa)
      content.querySelectorAll('.no-print').forEach(el => el.remove()); 
      
      // 4. Tạo Tiêu đề Báo cáo
      const header = document.createElement('h2');
      header.innerHTML = 'BÁO CÁO TỒN KHO NGUYÊN VẬT LIỆU';
      header.style.textAlign = 'center';
      header.style.color = '#333';
      header.style.fontSize = '20px';

      const date = document.createElement('p');
      date.innerHTML = `Ngày lập báo cáo: <b>${new Date().toLocaleDateString('vi-VN')}</b>`;
      date.style.textAlign = 'right';
      date.style.fontSize = '12px';
      date.style.marginTop = '15px';

      // 5. Tạo container mới để đóng gói Tiêu đề và Bảng
      const container = document.createElement('div');
      container.style.padding = '10px';
      container.appendChild(header);
      container.appendChild(date);
      container.appendChild(content);

      const filename = `BaoCaoKho_Ngay${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;
      
      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }, 
        pagebreak: { mode: ['css'] }
      };

      // 6. Chuyển đổi và tải xuống (đảm bảo html2pdf đã được load)
      if (window.html2pdf) {
        window.html2pdf().set(opt).from(container).save();
      } else {
        alert("Lỗi: Thư viện html2pdf chưa được tải. Vui lòng kiểm tra file index.html.");
      }
    },

    // --- Chức năng Chatbox (từ code gốc) ---
    searchProductInfo() {
      const val = this.chatSearchText.trim().toLowerCase();
      
      if (!val) { 
        this.chatResultHTML = ''; 
        return; 
      }
      
      // Tìm trong danh sách đã xử lý (filteredInventory) để có trạng thái
      const prod = this.filteredInventory.find(p => 
        p.name.toLowerCase().includes(val) || 
        p.code.toLowerCase().includes(val)
      );

      if (prod) {
        let htmlContent = `<table style='width:100%;font-size:15px;margin-bottom:6px;'>
            <tr><td style="width:30%;"><b>Mã hàng</b></td><td>${prod.code}</td></tr>
            <tr><td><b>Tên hàng</b></td><td>${prod.name}</td></tr>
            <tr><td><b>Tồn kho</b></td><td>${prod.stock} ${prod.unit}</td></tr>
            <tr><td><b>Lô hàng</b></td><td>${prod.batch}</td></tr>
            <tr><td><b>HSD</b></td><td>${prod.expiry}</td></tr>
            <tr><td><b>Trạng thái HSD</b></td><td>${prod.statusHSD}</td></tr>
            <tr><td><b>Trạng thái Tồn kho</b></td><td>${prod.statusStock}</td></tr>
        </table>`;
        htmlContent += this.generateChatNote(prod);
        this.chatResultHTML = htmlContent;
      } else {
        this.chatResultHTML = `<span style="color:#e53935;">Không tìm thấy sản phẩm nào khớp với: <b>${this.chatSearchText}</b></span>`;
      }
    },

    generateChatNote(item) {
      const isStockLow = item.statusStock === 'Thấp';
      let noteContent = '';
      let noteClass = '';
      let title = '';
      
      if (item.statusHSD === 'Hết Hạn!') {
        title = '<b>⚠️ GHI CHÚ QUAN TRỌNG: HẾT HẠN!</b>';
        noteContent += `+ <b>Hành động:</b> Sản phẩm cần được <b>THU HỒI/TIÊU HỦY</b> ngay lập tức.`;
        noteClass = 'note-danger';
      } else if (item.statusHSD === 'Sắp hết') {
        title = '<b>🔔 LƯU Ý HSD: Sắp hết hạn!</b>';
        noteContent += `+ <b>Hành động:</b> Cần đẩy nhanh tiêu thụ để tránh lãng phí.`;
        noteClass = 'note-alert';
      } else {
        title = '<b>✅ TRẠNG THÁI TỐT:</b>';
        noteContent += `+ <b>HSD:</b> Sản phẩm còn hạn sử dụng lâu dài.`;
        noteClass = 'note-safe';
      }
      
      if (isStockLow) {
        if (item.statusHSD !== 'Hết Hạn!') { 
          title = '<b>🔥 CẢNH BÁO: TỒN KHO THẤP!</b>';
          noteContent += `<br>+ <b>NHẬP HÀNG:</b> Tồn kho chỉ còn ${item.stock} ${item.unit}. Cần lên kế hoạch <b>NHẬP HÀNG MỚI</b> ngay.`;
          noteClass = 'note-alert';
        } else {
          noteContent += `<br>+ <b>Tồn kho:</b> ${item.stock} ${item.unit} (Đã hết hạn).`;
        }
      }

      return `<div class="chat-note ${noteClass}">
          ${title}
          <br>${noteContent}
      </div>`;
    },

    // <-- THÊM HÀM NÀY -->
    /**
     * Hàm để đóng/mở chatbox
     */
    toggleChatbox() {
      this.isChatboxOpen = !this.isChatboxOpen;
    }
  }
}
</script>

<style>
/* Toàn bộ CSS gốc của bạn được sao chép vào đây. */
:root {
  --primary-color: #007bff;
  --primary-dark: #0056b3;
  --alert-color: #ffc107;
  --danger-color: #dc3545;
  --stock-low-color: #ff9800;
  --success-color: #28a745;
  --background-light: #f8f9fa;
  --text-dark: #333;
  --shadow-light: rgba(0, 0, 0, 0.05);
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: var(--background-light);
  margin: 0;
  padding: 0;
  color: var(--text-dark);
}

.dashboard-container {
  max-width: 1200px;
  margin: 40px auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px var(--shadow-light);
  padding: 30px;
}

h1 {
  color: var(--primary-color);
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 25px;
  font-weight: 700;
  font-size: 28px;
}

/* --- Thanh Công cụ (Toolbar) --- */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box input {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 300px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}
.search-box input:focus {
  border-color: var(--primary-color);
}

.toolbar-buttons button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
  margin-left: 12px;
}
.toolbar-buttons button:first-child {
  margin-left: 0;
}
.toolbar-buttons button:hover {
  background-color: var(--primary-dark);
}

#exportPdfBtn {
  background-color: #dc3545; 
}
#exportPdfBtn:hover {
  background-color: #c82333;
}


/* --- Bảng Dữ liệu (Inventory Table) --- */
.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th, .inventory-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 15px;
}

.inventory-table thead th {
  background-color: #f1f1f1;
  color: var(--text-dark);
  font-weight: 700;
}

/* Màu nền cho các hàng cảnh báo */
.row-danger {
  background-color: #fce4e4 !important;
  font-weight: 500;
}
.row-alert {
  background-color: #fffde7 !important;
  font-weight: 500;
}

.inventory-table tr:hover {
  background-color: #f9f9f9;
}

/* --- Thẻ trạng thái (Status Tags) --- */
.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  display: inline-block;
}

/* Trạng thái HSD */
.tag-safe { background-color: var(--success-color); }
.tag-low { background-color: var(--alert-color); }
.tag-expired { background-color: var(--danger-color); }

/* Trạng thái Tồn Kho */
.tag-stock-low { background-color: var(--stock-low-color); }
.tag-stock-safe { background-color: var(--success-color); }

.tag-action { 
  background-color: #6c757d; 
  margin-right: 5px;
  cursor: pointer;
  transition: opacity 0.2s;
  font-size: 14px;
}
.tag-action:hover { opacity: 0.8; }

/* Ẩn các nút Thao tác và các thành phần không cần thiết khi in/xuất PDF */
@media print {
  .no-print, .toolbar, #chatbox { /* Thêm .no-print và #chatbox */
    display: none !important;
  }
  .inventory-table {
    box-shadow: none;
    border: 1px solid #ccc;
  }
  .dashboard-container {
    box-shadow: none;
  }
}

/* --- Modal CSS --- */
.modal { 
  /* display: none; Thay bằng v-if */
  position: fixed; 
  z-index: 1000; 
  left: 0; 
  top: 0; 
  width: 100%; 
  height: 100%; 
  overflow: auto; 
  background-color: rgba(0, 0, 0, 0.4); 
}
.modal-content { 
  background-color: #fefefe; 
  margin: 5% auto; 
  padding: 30px; 
  border: 1px solid #888; 
  width: 450px; 
  border-radius: 8px; 
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); 
}
.modal-content h2 { 
  margin-top: 0; 
  color: var(--primary-color); 
  font-weight: 700; 
  border-bottom: 1px solid #eee; 
  padding-bottom: 10px; 
}
.close-btn { 
  color: #aaa; 
  float: right; 
  font-size: 28px; 
  font-weight: bold; 
  transition: color 0.2s; 
}
.close-btn:hover, .close-btn:focus { 
  color: var(--danger-color); 
  text-decoration: none; 
  cursor: pointer; 
}
.modal-content label { 
  display: block; 
  margin-top: 10px; 
  margin-bottom: 5px; 
  font-weight: 500; 
}
.modal-content input, .modal-content select { 
  width: 95%; /* Giảm 1 chút để vừa padding */
  padding: 10px; 
  margin-bottom: 10px; 
  border: 1px solid #ccc; 
  border-radius: 4px; 
}
.modal-footer { 
  margin-top: 20px; 
  text-align: right; 
}

/* Nút bấm chung trong modal */
.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}
.btn-primary:hover {
  background-color: var(--primary-dark);
}
.btn-save { 
  background-color: var(--success-color); 
  margin-left: 10px; 
}
.btn-save:hover { 
  background-color: #1e7e34; 
}


/* --- Chatbox/Note CSS --- */
#chatbox {
  position:fixed;
  bottom:32px;
  right:32px;
  width:340px;
  z-index:9999;
  background:#fff;
  border-radius:12px;
  box-shadow:0 4px 16px #aaa;
  padding:18px 20px;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.chat-note { 
  padding: 8px 10px; 
  border-radius: 4px; 
  margin-top: 5px; 
  font-size: 14px; 
  font-weight: 500; 
}
.note-danger { 
  background-color: #fce4e4; 
  color: var(--danger-color); 
  border: 1px solid var(--danger-color); 
}
.note-alert { 
  background-color: #fffde7; 
  color: #ff9800; 
  border: 1px solid #ff9800; 
}
.note-safe { 
  background-color: #e9f7ef; 
  color: var(--success-color); 
  border: 1px solid var(--success-color); 
}


/* --- THÊM CÁC CLASS MỚI NÀY VÀO CUỐI --- */
.chatbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none; /* Chống chọn text khi click */
}

.chatbox-title {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 17px;
}

.chatbox-toggle {
  font-weight: bold;
  font-size: 20px;
  color: #aaa;
  transition: color 0.2s;
}
.chatbox-toggle:hover {
  color: #333;
}
/* --- HẾT PHẦN THÊM MỚI --- */
</style>