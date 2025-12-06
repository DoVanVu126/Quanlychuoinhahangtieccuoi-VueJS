<template>
  <div class="payment-page">
    <div class="header">
      <button class="back-btn" @click="$router.go(-1)">&#x2190;</button>
      <div class="actions">
        <button @click="printReceipt">In hóa đơn</button>
      </div>
    </div>
    <div class="container">
      <div class="sidebar">
        <h3>{{ $t('payment_methods') }}</h3>
        <ul class="payment-list">
          <li
            v-for="method in paymentMethodsOnly"
            :key="method.value"
            :class="{ selected: selectedMethod === method.value }"
            @click="selectMethod(method.value)"
          >
            <img :src="method.icon" :alt="method.label" />
            <span>{{ method.label }}</span>
          </li>
        </ul>
      </div>
      <div class="main">
        <div class="transaction-details">
          <div class="detail-item">
            <span>{{ $t('order_id_label') }}</span>
            <span><strong>{{ orderId }}</strong></span>
          </div>
          <div class="detail-item">
            <span>{{ $t('transfer_content_label') }}</span>
            <span>{{ transferContent }}</span>
          </div>
          <div class="detail-item">
            <span>{{ $t('total_due_label') }}</span>
            <span><strong>{{ formatMoney(finalTotal) }}</strong></span>
          </div>
        </div>

        <div class="transfer-info">
          <div class="info-header">
            <h4>Thông tin {{ currentPaymentInfo.bankName || selectedMethodLabel }}</h4>
          </div>
          <div class="info-item" v-if="currentPaymentInfo.accountNumber">
            <span class="label">{{ $t('account_label') }}</span>
            <span class="value">{{ currentPaymentInfo.accountNumber }}</span>
            <button @click="copyText(currentPaymentInfo.accountNumber)">
              &#x2398;
            </button>
          </div>
          <div class="info-item" v-if="currentPaymentInfo.accountHolder">
            <span class="label">{{ $t('account_holder_label') }}</span>
            <span class="value">{{ currentPaymentInfo.accountHolder }}</span>
            <button @click="copyText(currentPaymentInfo.accountHolder)">
              &#x2398;
            </button>
          </div>
          <div class="info-item" v-if="currentPaymentInfo.bankName">
            <span class="label">{{ $t('payment_methods') }}</span>
            <span class="value">{{ currentPaymentInfo.bankName }}</span>
            <button @click="copyText(currentPaymentInfo.bankName)">
              &#x2398;
            </button>
          </div>
          <div class="info-item transfer-content-item">
            <span class="label">{{ $t('transfer_content_field_label') }}</span>
            <span class="value">{{ transferContent }}</span>
            <button @click="copyText(transferContent)">&#x2398;</button>
          </div>
        </div>

        <div v-if="selectedMethod === 'bank'" class="bank-select">
          <label for="bank">{{ $t('account_label') }}</label>
          <select id="bank" v-model="selectedBankCode">
            <option value="" disabled>-- {{ $t('no_data') }} --</option>
            <option 
              v-for="bank in bankOptions" 
              :key="bank.code" 
              :value="bank.code"
            >
              {{ bank.bankName }}
            </option>
          </select>
        </div>

        <div class="note">{{ paymentNote }}</div>
        <button
          class="print-btn"
          @click="confirmPayment"
          :disabled="isProcessing"
        >
          {{ isProcessing ? $t('checking_btn') : $t('confirm_payment_btn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Payment',
  data() {
    // Định nghĩa tất cả các phương thức thanh toán chi tiết
    const allPaymentDetails = [
      {
        value: 'momo',
        code: 'momo',
        label: 'MOMO',
        icon: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png',
        accountNumber: '0901234567',
        accountHolder: 'NGUYEN VAN A',
        bankName: 'MOMO',
        type: 'e-wallet'
      },
      // === NGÂN HÀNG ===
      {
        value: 'bank',
        code: 'vcb',
        label: 'Vietcombank',
        icon: 'https://img.icons8.com/ios-filled/50/1976d2/cash-in-hand.png',
        accountNumber: '100012345678',
        accountHolder: 'NGUYEN VAN A',
        bankName: 'Vietcombank',
        type: 'bank'
      },
      {
        value: 'bank',
        code: 'tcb',
        label: 'Techcombank',
        icon: 'https://img.icons8.com/ios-filled/50/1976d2/cash-in-hand.png',
        accountNumber: '190399998888',
        accountHolder: 'NGUYEN VAN A',
        bankName: 'Techcombank',
        type: 'bank'
      },
      {
        value: 'bank',
        code: 'vtb',
        label: 'VietinBank',
        icon: 'https://img.icons8.com/ios-filled/50/1976d2/cash-in-hand.png',
        accountNumber: '108876543210',
        accountHolder: 'NGUYEN VAN A',
        bankName: 'VietinBank',
        type: 'bank'
      },
      {
        value: 'bank',
        code: 'bidv',
        label: 'BIDV',
        icon: 'https://img.icons8.com/ios-filled/50/1976d2/cash-in-hand.png',
        accountNumber: '125123456789',
        accountHolder: 'NGUYEN VAN A',
        bankName: 'BIDV',
        type: 'bank'
      },
      {
        value: 'bank',
        code: 'acb',
        label: 'ACB',
        icon: 'https://img.icons8.com/ios-filled/50/1976d2/cash-in-hand.png',
        accountNumber: '247123456789',
        accountHolder: 'NGUYEN VAN A',
        bankName: 'ACB',
        type: 'bank'
      },
      {
        value: 'bank',
        code: 'stb',
        label: 'Sacombank',
        icon: 'https://img.icons8.com/ios-filled/50/1976d2/cash-in-hand.png',
        accountNumber: '060123456789',
        accountHolder: 'NGUYEN VAN A',
        bankName: 'Sacombank',
        type: 'bank'
      },
      {
        value: 'bank',
        code: 'vpb',
        label: 'VPBank',
        icon: 'https://img.icons8.com/ios-filled/50/1976d2/cash-in-hand.png',
        accountNumber: '700123456789',
        accountHolder: 'NGUYEN VAN A',
        bankName: 'VPBank',
        type: 'bank'
      },
    ];

    const defaultBank = allPaymentDetails.find((m) => m.type === 'bank');
    const defaultBankCode = defaultBank ? defaultBank.code : '';

    return {
      cart: [],
      orderId: '',
      finalTotal: 0,
      selectedMethod: 'momo', 
      selectedBankCode: defaultBankCode, 
      allPaymentDetails: allPaymentDetails,
      isProcessing: false, // Trạng thái đang xử lý thanh toán
    };
  },
  computed: {
    transferContent() {
      return `TT ${this.orderId}`;
    },
    // Danh sách các phương thức chính (MOMO và BANK) hiển thị ở sidebar
    paymentMethodsOnly() {
      const uniqueMethods = [];
      const seenValues = new Set();
      for (const detail of this.allPaymentDetails) {
        if (!seenValues.has(detail.value)) {
          if (detail.value === 'bank') {
            uniqueMethods.push({
              value: 'bank',
              label: 'Chuyển khoản Ngân hàng',
              icon: this.allPaymentDetails.find(d => d.value === 'bank' && d.type === 'bank').icon
            });
          } else {
            uniqueMethods.push({
              value: detail.value,
              label: detail.label,
              icon: detail.icon
            });
          }
          seenValues.add(detail.value);
        }
      }
      return uniqueMethods;
    },
    // Lọc ra các ngân hàng để hiển thị trong <select>
    bankOptions() {
      return this.allPaymentDetails.filter(d => d.type === 'bank');
    },
    // Tên phương thức chính đang chọn
    selectedMethodLabel() {
        const method = this.paymentMethodsOnly.find(m => m.value === this.selectedMethod);
        return method ? method.label : '';
    },
    // Lấy thông tin chi tiết (STK, Tên TK, Ngân hàng) dựa trên selectedMethod và selectedBankCode
    currentPaymentInfo() {
      if (this.selectedMethod === 'bank') {
        return this.allPaymentDetails.find(d => d.code === this.selectedBankCode) || {};
      }
      // Đối với MOMO
      return this.allPaymentDetails.find(d => d.value === this.selectedMethod) || {};
    },
    paymentNote() {
      return `Vui lòng chuyển khoản ${this.formatMoney(
        this.finalTotal
      )} theo thông tin ${this.currentPaymentInfo.bankName || 'đã chọn'} bên dưới với nội dung: ${
        this.transferContent
      }`;
    },
  },
  created() {
    const cartData = localStorage.getItem('cart');
    this.orderId =
      localStorage.getItem('payment_id') ||
      'HDW' + Math.floor(Math.random() * 100000);
    if (cartData) {
      this.cart = JSON.parse(cartData);
      this.finalTotal =
        Number(localStorage.getItem('payment_total')) ||
        this.cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    }
    
    // Khởi tạo selectedBankCode nếu đang ở tab Bank
    if (this.selectedMethod === 'bank' && !this.selectedBankCode) {
        this.selectMethod('bank');
    }
  },
  methods: {
    formatMoney(v) {
      return Number(v).toLocaleString('vi-VN') + ' VNĐ';
    },
    selectMethod(method) {
      this.selectedMethod = method;
      // Khi chọn Bank, đảm bảo selectedBankCode có giá trị
      if (method === 'bank' && !this.selectedBankCode) {
        const firstBank = this.bankOptions[0];
        this.selectedBankCode = firstBank ? firstBank.code : '';
      }
    },
    printReceipt() {
      window.print();
    },
    // === LOGIC XÁC NHẬN THANH TOÁN MÔ PHỎNG ===
    confirmPayment() {
      if (this.isProcessing) return; 

      this.isProcessing = true; // Bật trạng thái loading
      
      // Mô phỏng việc kiểm tra thanh toán qua API (mất 2 giây)
      setTimeout(() => {
        // Giả lập kết quả: 80% thành công, 20% thất bại
        const isSuccess = Math.random() < 0.8; 
        
        this.isProcessing = false; // Tắt trạng thái loading

        if (isSuccess) {
          // Xóa dữ liệu cũ và chuyển hướng đến trang Admin (Thành công)
          localStorage.removeItem('cart');
          localStorage.removeItem('payment_id');
          localStorage.removeItem('payment_total');
          
          this.$router.push({ 
            name: 'AdminPayment', // Giả định route này tồn tại
            params: { 
                status: 'success', 
                orderId: this.orderId,
                paymentMethod: this.currentPaymentInfo.bankName || this.selectedMethodLabel
            } 
          });
        } else {
          // Chuyển hướng đến trang Admin (Thất bại) để xử lý thủ công
          this.$router.push({ 
            name: 'AdminPayment', // Vẫn chuyển về trang admin để xử lý thủ công
            params: { 
                status: 'failed', 
                orderId: this.orderId,
                errorMessage: 'Không nhận được giao dịch chuyển khoản trong thời gian quy định.'
            } 
          });
        }

      }, 2000); // Mô phỏng độ trễ 2 giây
    },
    // ===========================================
    copyText(text) {
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            alert('Đã sao chép: ' + text);
          })
          .catch((err) => {
            console.error('Không thể sao chép văn bản: ', err);
            alert('Không thể sao chép văn bản.');
          });
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          alert('Đã sao chép (fallback): ' + text);
        } catch (err) {
          console.error('Lỗi khi sao chép (fallback):', err);
          alert('Không thể sao chép văn bản.');
        }
        document.body.removeChild(textarea);
      }
    },
  },
};
</script>

<style scoped>
:root {
  --primary-color: #A0522D;
  --secondary-color: #F8F0E5;
  --accent-color: #C07C4A;
  --text-dark: #333;
  --text-light: #666;
  --border-light: #e0e0e0;
  --background-light: #ffffff;
  --background-subtle: #f9f9f9;
  --highlight-color: #1976d2;
  --button-color: #e53935;
  --shadow-light: rgba(0, 0, 0, 0.08);
  --success-color: #4CAF50;
  --error-color: #dc3545;
}
.payment-page {
  font-family: 'Open Sans', 'Poppins', sans-serif;
  background: var(--secondary-color);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 40px;
  background: var(--background-light);
  box-shadow: 0 2px 4px var(--shadow-light);
  border-radius: 16px;
  margin-top: 32px;
  width: 900px;
  max-width: 98vw;
}
.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-dark);
  transition: color 0.2s;
}
.back-btn:hover {
  color: var(--primary-color);
}
.header .actions button {
  background: var(--primary-color);
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease;
}
.header .actions button:hover {
  background: var(--accent-color);
  transform: translateY(-1px);
}
.container {
  display: flex;
  max-width: 900px;
  width: 100%;
  margin: 32px auto 0 auto;
  background: var(--background-light);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-height: 520px;
}
.sidebar {
  width: 280px;
  background: var(--background-subtle);
  border-right: 1px solid var(--border-light);
  padding: 40px 0 40px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.sidebar h3 {
  font-family: 'Poppins', sans-serif;
  margin: 0 0 20px 30px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
}
.payment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.payment-list li {
  display: flex;
  align-items: center;
  padding: 18px 30px;
  cursor: pointer;
  border-left: 5px solid transparent;
  transition: background 0.2s, border-left-color 0.2s, box-shadow 0.2s;
  font-weight: 600;
  color: var(--text-light);
  border-radius: 10px 0 0 10px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.payment-list li:hover {
  background: #f0f0f0;
  box-shadow: 0 4px 12px rgba(160,82,45,0.08);
}
.payment-list li.selected {
  background: #ffebe5;
  border-left: 5px solid var(--primary-color);
  color: var(--primary-color);
  box-shadow: 0 6px 18px rgba(160,82,45,0.12);
}
.payment-list li img {
  width: 32px;
  height: 32px;
  margin-right: 15px;
  filter: grayscale(0%);
}
.main {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.transaction-details {
  width: 100%;
  max-width: 370px;
  background: #fdfdfd;
  border: 1px solid var(--error-color);
  border-radius: 12px;
  padding: 18px 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px var(--shadow-light);
}
.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
}
.detail-item:last-child {
  border-bottom: none;
  font-weight: bold;
  font-size: 1.2em;
  color: var(--error-color);
}
.detail-item span:first-child {
  color: var(--text-light);
  font-size: 16px;
}
.detail-item span:last-child {
  color: var(--text-dark);
  font-weight: 700;
}

/* HIỂN THỊ THÔNG TIN CHUYỂN KHOẢN */
.transfer-info {
  width: 100%;
  max-width: 370px;
  background: var(--background-subtle);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 10px 0;
  margin-bottom: 25px;
  box-shadow: 0 2px 12px var(--shadow-light);
}

.info-header {
  padding: 10px 24px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 5px;
}

.info-header h4 {
  margin: 0;
  font-size: 1.1em;
  color: var(--primary-color);
  font-weight: 700;
  text-align: center;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px dashed #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-size: 15px;
  color: var(--text-light);
  flex-grow: 1;
  text-align: left;
}

.info-item .value {
  font-weight: 700;
  color: var(--text-dark);
  margin-right: 10px;
  max-width: 50%;
  text-align: right;
  overflow-wrap: break-word;
  white-space: nowrap; 
}

.info-item button {
  background: none;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 6px;
  line-height: 1;
  transition: background 0.2s, color 0.2s;
}

.info-item button:hover {
  background: var(--primary-color);
  color: #fff;
}

.transfer-content-item {
  border-top: 2px solid var(--accent-color);
  background-color: #fcefe7;
}

.transfer-content-item .value {
  color: var(--error-color);
  font-size: 1.1em;
}
/* KẾT THÚC HIỂN THỊ THÔNG TIN CHUYỂN KHOẢN */

.bank-select {
  width: 100%;
  max-width: 370px;
  margin-bottom: 25px;
  text-align: center;
}
.bank-select label {
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 8px;
  display: block;
}
.bank-select select {
  padding: 10px 15px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-top: 8px;
  outline: none;
  width: 260px;
  transition: border-color 0.2s;
}
.bank-select select:focus {
  border-color: var(--primary-color);
}
.qr {
  display: none; /* Ẩn QR code */
}

.note {
  font-size: 16px;
  color: var(--text-light);
  margin-bottom: 32px;
  text-align: center;
  line-height: 1.6;
  max-width: 370px;
}
.print-btn {
  /* Màu đỏ đậm cố định */
  background: #c62828; 
  color: #fff;
  border: none;
  padding: 14px 48px;
  font-size: 19px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.2s ease; /* Chỉ giữ hiệu ứng di chuyển */
  box-shadow: 0 6px 18px rgba(229, 57, 53, 0.18);
  margin-top: 8px;
}
.print-btn:hover {
  /* Giữ nguyên màu nền, chỉ di chuyển */
  background: #c62828; 
  transform: translateY(-2px);
}
/* Style cho nút khi đang xử lý (disabled) */
.print-btn:disabled {
  background: #ff7043; /* Màu cam nhạt hơn */
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 1100px) {
  .header, .container {
    max-width: 98vw;
    width: 98vw;
  }
}
@media (max-width: 900px) {
  .container {
    flex-direction: column;
    min-height: unset;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
    flex-direction: row;
    justify-content: flex-start;
    padding: 24px 0;
    overflow-x: auto;
  }
  .sidebar h3 {
    margin: 0 0 0 16px;
    font-size: 17px;
    min-width: 120px; 
  }
  .payment-list {
    display: flex;
    flex-direction: row;
    gap: 8px;
    margin-left: 16px;
  }
  .payment-list li {
    border-radius: 10px;
    margin-bottom: 0;
    min-width: 120px;
    padding: 12px 10px;
  }
}
@media (max-width: 600px) {
  .payment-page {
    padding-bottom: 32px;
  }
  .header {
    padding: 10px 8px;
    font-size: 15px;
    width: 100vw;
    border-radius: 0;
  }
  .container {
    margin: 0;
    border-radius: 0;
    box-shadow: none;
    min-height: unset;
    width: 100vw;
  }
  .main {
    padding: 18px 4px;
  }
  .transaction-details, .note, .bank-select, .transfer-info {
    max-width: 98vw;
    padding: 10px 6px;
  }
  .transfer-info {
    padding: 10px 0;
  }
  .info-item {
    padding: 10px 12px;
  }
  .print-btn {
    padding: 10px 18px;
    font-size: 16px;
    border-radius: 8px;
  }
}
</style>