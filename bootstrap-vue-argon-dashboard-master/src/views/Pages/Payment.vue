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
        <h3>Phương thức thanh toán</h3>
        <ul class="payment-list">
          <li v-for="method in paymentMethodsOnly" :key="method.value" :class="{ selected: selectedMethod === method.value }" @click="selectMethod(method.value)">
            <img :src="method.icon" :alt="method.label" />
            <span>{{ method.label }}</span>
          </li>
        </ul>
      </div>
      <div class="main">
        <div class="countdown">{{ formatCountdown }}</div>
        <div class="qr">
          <img :src="qrCodeUrl" alt="QR Code" />
        </div>
        <div class="note">Vui lòng quét mã QR để thanh toán. Mã QR có hiệu lực trong 15 phút.</div>
        <button class="print-btn" @click="confirmPayment" :disabled="isProcessing">{{ isProcessing ? 'Đang xử lý...' : 'Xác nhận đã chuyển khoản' }}</button>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'Payment',
  data() {
    return {
      orderId: localStorage.getItem('payment_id') || 'HDW' + Math.floor(Math.random()*100000),
      finalTotal: Number(localStorage.getItem('payment_total')) || 1500000,
      selectedMethod: 'momo',
      selectedBankCode: '',
      isProcessing: false,
      qrTimestamp: null,
      qrExpiresAt: null,
      qrTtl: 900,
      nowTick: Date.now(),
      qrTimerId: null,
      manualBankName: '',
      languages: [ { code: 'vi', label: 'Tiếng Việt' }, { code: 'en', label: 'English' } ],
      lang: 'vi'
    };
  },
  computed: {
    transferContent() { return `TT ${this.orderId}`; },
    bankOptions() {
      return [
        'Vietcombank','Techcombank','ACB','Sacombank','VPBank','BIDV','MB Bank','VietinBank'
      ].map((n,idx)=>({ bankName: n, code: 'b'+idx }));
    },
    currentPaymentInfo() {
      // mock mapping
      return { bankName: this.manualBankName || (this.selectedBankCode || ''), accountNumber: '100012345678', accountHolder: 'NGUYEN VAN A' };
    },
    qrCodeUrl() {
      const payload = `${this.selectedMethod.toUpperCase()}|${this.finalTotal}|${encodeURIComponent(this.transferContent)}|${this.qrTimestamp||''}`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${payload}`;
    },
    formatCountdown() {
      if (!this.qrExpiresAt) return '';
      const diff = Math.max(0, Math.floor((this.qrExpiresAt - this.nowTick)/1000));
      const mm = String(Math.floor(diff/60)).padStart(2,'0');
      const ss = String(diff%60).padStart(2,'0');
      return `${mm}:${ss}`;
    }
  },
  methods: {
    formatMoney(v){ return Number(v).toLocaleString('vi-VN') + ' VNĐ'; },
    printReceipt(){ window.print(); },
    copyText(text){ if(!text) return; navigator.clipboard?.writeText(text).then(()=>alert('Đã sao chép: '+text)); },
    confirmPayment(){ if(this.isProcessing) return; this.isProcessing=true; setTimeout(()=>{ this.isProcessing=false; localStorage.removeItem('cart'); localStorage.removeItem('payment_total'); this.$router.push({ name:'AdminPayment', params:{ status:'success', orderId:this.orderId }}); }, 1200); },
    refreshQr(){ this.qrTimestamp = Date.now(); this.qrExpiresAt = Date.now()+this.qrTtl*1000; this.nowTick = Date.now(); },
    startQrTimer(){ if(this.qrTimerId) return; this.qrTimerId = setInterval(()=>{ this.nowTick=Date.now(); if(this.qrExpiresAt && this.nowTick>=this.qrExpiresAt) this.refreshQr(); }, 1000); },
    stopQrTimer(){ if(this.qrTimerId){ clearInterval(this.qrTimerId); this.qrTimerId=null; } }
  },
  mounted(){
    // Wire up the language dropdown behavior (keeps the exact structure)
    const customLang = this.$el.querySelector('#custom-lang-select');
    const selectedLang = this.$el.querySelector('#selected-lang');
    const langOptions = this.$el.querySelector('#lang-options');
    if(customLang && selectedLang && langOptions){
      selectedLang.onclick = () => { langOptions.style.display = langOptions.style.display === 'none' ? 'block' : 'none'; };
      langOptions.onclick = (e)=>{ const li = e.target.tagName==='LI'?e.target:e.target.closest('li'); if(li){ selectedLang.innerHTML = li.innerHTML; langOptions.style.display='none'; this.lang = li.getAttribute('data-value') || 'vi'; }};
      document.addEventListener('click', (e)=>{ if(!customLang.contains(e.target)) langOptions.style.display='none'; });
    }

    // Payment item clicks
    this.$el.querySelectorAll('.payment-list li').forEach(li => {
      li.addEventListener('click', ()=>{
        this.$el.querySelectorAll('.payment-list li').forEach(x=>x.classList.remove('selected'));
        li.classList.add('selected');
        const method = li.getAttribute('data-method');
        this.selectedMethod = method || 'momo';
        if(this.selectedMethod==='bank') this.manualBankName = this.selectedBankCode || 'Vietcombank';
        this.refreshQr();
      });
    });

    // bank select change
    const bankSelect = this.$el.querySelector('#bank-select');
    if(bankSelect){ bankSelect.addEventListener('change', ()=>{ this.manualBankName = bankSelect.value; this.refreshQr(); }); }

    // initialize values
    this.refreshQr();
    this.startQrTimer();
  },
  beforeDestroy(){ this.stopQrTimer(); }
}
</script>

<style scoped>
/* copy exact CSS from user's provided sample (trimmed here for brevity) */
:root{ --primary-color:#A0522D; --secondary-color:#F8F0E5; --accent-color:#C07C4A; --text-dark:#333; --text-light:#666; --border-light:#e0e0e0; --background-light:#fff; --background-subtle:#f9f9f9; --button-color:#e53935; --shadow-light:rgba(0,0,0,0.08); --success-color:#4CAF50; --error-color:#dc3545 }
body{ font-family: 'Open Sans', sans-serif; background:var(--secondary-color); margin:0 }
.header{ display:flex; align-items:center; justify-content:space-between; padding:18px 40px; background:var(--background-light); box-shadow:0 2px 4px var(--shadow-light) }
.back-btn{ background:none; border:none; font-size:24px; cursor:pointer; color:var(--text-dark) }
.header .actions{ display:flex; align-items:center; gap:15px }
.container{ display:flex; max-width:900px; margin:40px auto; background:var(--background-light); border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,0.15); overflow:hidden }
.sidebar{ width:280px; background:var(--background-subtle); border-right:1px solid var(--border-light); padding:30px 0 }
.main{ flex:1; padding:50px 40px; display:flex; flex-direction:column; align-items:center }
.transaction-details{ width:100%; max-width:350px; background:#fff; border:1px solid var(--error-color); border-radius:8px; padding:15px 20px; margin-bottom:30px }
.detail-item{ display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #eee }
.qr img{ width:240px; height:240px; border:5px solid var(--primary-color); border-radius:8px; object-fit:contain }
.countdown{ font-size:18px; color:#e53935; font-weight:bold; margin-bottom:12px }
.bank-value{ background:#fff; padding:5px 10px; border-radius:4px; border:1px solid #ddd; font-family:monospace }
.print-btn{ background:var(--button-color); color:#fff; border:none; padding:12px 40px; font-size:17px; border-radius:8px }
/* keep responsive rules minimal */
@media (max-width:900px){ .container{ flex-direction:column } }
</style>
<template>
  <div class="payment-page">
    <div class="header">
      <button class="back-btn" @click="$router.go(-1)">&#x2190;</button>
      <div class="actions">
        <select v-model="lang" class="lang-select" aria-label="Language">
          <option v-for="l in languages" :key="l.code" :value="l.code">{{ l.label }}</option>
        </select>
        <button @click="printReceipt">{{ $t('print_receipt_btn') }}</button>
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
        <div class="payment-grid">
          <div class="left center-column">
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

            <div v-if="selectedMethod === 'bank'" class="bank-select">
              <label for="bank">{{ $t('select_bank_label') }}</label>
              <select id="bank" v-model="selectedBankCode" @change="refreshQr">
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
            
            <div class="transfer-info">
              <div class="info-header">
                <h4>{{ $t('info_title') }} {{ currentPaymentInfo.bankName || selectedMethodLabel }}</h4>
              </div>
              <div class="info-item" v-if="currentPaymentInfo.accountNumber">
                <span class="label">{{ $t('account_label') }}</span>
                <span class="value">{{ currentPaymentInfo.accountNumber }}</span>
                <button @click="copyText(currentPaymentInfo.accountNumber)">{{ $t('copy_btn') }}</button>
              </div>
              <div class="info-item" v-if="currentPaymentInfo.accountHolder">
                <span class="label">{{ $t('account_holder_label') }}</span>
                <span class="value">{{ currentPaymentInfo.accountHolder }}</span>
                <button @click="copyText(currentPaymentInfo.accountHolder)">{{ $t('copy_btn') }}</button>
              </div>
              <div class="info-item" v-if="currentPaymentInfo.bankName && selectedMethod !== 'momo'">
                <span class="label">{{ $t('bank_name_label') }}</span>
                <span class="value">{{ currentPaymentInfo.bankName }}</span>
                <button @click="copyText(currentPaymentInfo.bankName)">{{ $t('copy_btn') }}</button>
              </div>
              <div class="info-item transfer-content-item">
                <span class="label">{{ $t('transfer_content_field_label') }}</span>
                <span class="value">{{ transferContent }}</span>
                <button @click="copyText(transferContent)">{{ $t('copy_btn') }}</button>
              </div>
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

          <div class="right qr-column">
            <div class="qr-card">
              <div class="qr-header">
                <h4>QR {{ selectedMethodLabel }}</h4>
                <div class="qr-controls">
                  <button @click="refreshQr">{{ $t('refresh_btn') }}</button>
                  <div class="countdown">{{ formatCountdown }}</div>
                </div>
              </div>
              <div class="qr-image">
                <img :src="qrCodeUrl" :alt="`${selectedMethodLabel} QR code`" />
              </div>
              <div class="qr-foot">
                <div>{{ $t('order_id_label') }}: <strong>{{ orderId }}</strong></div>
                <div>{{ $t('expiry_time_label') }}: <strong>{{ qrTimestampDisplay }}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Icon ngân hàng chung
const BANK_ICON = 'https://img.icons8.com/ios-filled/50/A0522D/bank.png';

// Dữ liệu chi tiết về các phương thức thanh toán và ngân hàng
const allPaymentDetails = [
  // Ví điện tử
  { value: 'momo', code: 'momo', label: 'MOMO', icon: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png', accountNumber: '0901234567', accountHolder: 'NGUYEN VAN A', bankName: 'MOMO', type: 'e-wallet' },
  // Ngân hàng
  { value: 'bank', code: 'vcb', label: 'Vietcombank', icon: BANK_ICON, accountNumber: '100012345678', accountHolder: 'NGUYEN VAN A', bankName: 'Vietcombank', type: 'bank' },
  { value: 'bank', code: 'tcb', label: 'Techcombank', icon: BANK_ICON, accountNumber: '190399998888', accountHolder: 'NGUYEN VAN A', bankName: 'Techcombank', type: 'bank' },
  { value: 'bank', code: 'vtb', label: 'VietinBank', icon: BANK_ICON, accountNumber: '108876543210', accountHolder: 'NGUYEN VAN A', bankName: 'VietinBank', type: 'bank' },
  { value: 'bank', code: 'bidv', label: 'BIDV', icon: BANK_ICON, accountNumber: '125123456789', accountHolder: 'NGUYEN VAN A', bankName: 'BIDV', type: 'bank' },
  { value: 'bank', code: 'acb', label: 'ACB', icon: BANK_ICON, accountNumber: '247123456789', accountHolder: 'NGUYEN VAN A', bankName: 'ACB', type: 'bank' },
  { value: 'bank', code: 'stb', label: 'Sacombank', icon: BANK_ICON, accountNumber: '060123456789', accountHolder: 'NGUYEN VAN A', bankName: 'Sacombank', type: 'bank' },
  { value: 'bank', code: 'vpb', label: 'VPBank', icon: BANK_ICON, accountNumber: '700123456789', accountHolder: 'NGUYEN VAN A', bankName: 'VPBank', type: 'bank' },
];

// Bản dịch (Mock)
const mockTranslations = {
  'vi': {
    'payment_methods': 'Phương thức thanh toán',
    'order_id_label': 'Mã Đơn hàng:',
    'transfer_content_label': 'Nội dung CK:',
    'total_due_label': 'Tổng tiền cần trả:',
    'select_bank_label': 'Chọn ngân hàng để tạo QR (VietQR):',
    'account_label': 'Số Tài khoản:',
    'account_holder_label': 'Chủ TK:',
    'bank_name_label': 'Ngân hàng:',
    'transfer_content_field_label': 'Nội dung CK bắt buộc',
    'no_data': 'Chọn thông tin',
    'checking_btn': 'Đang kiểm tra...',
    'confirm_payment_btn': 'Xác nhận Thanh toán',
    'copy_btn': 'Sao chép',
    'info_title': 'Thông tin',
    'print_receipt_btn': 'In hóa đơn',
    'refresh_btn': 'Làm mới',
    'expiry_time_label': 'Thời gian hiệu lực',
    'note_base': (amount, info, content) => `Vui lòng chuyển khoản ${amount} theo thông tin ${info} bên dưới với nội dung: ${content}`,
  },
  'en': {
    'payment_methods': 'Payment Methods',
    'order_id_label': 'Order ID:',
    'transfer_content_label': 'Transfer Note:',
    'total_due_label': 'Total Amount Due:',
    'select_bank_label': 'Select bank to generate QR (VietQR):',
    'account_label': 'Account Number:',
    'account_holder_label': 'Account Holder:',
    'bank_name_label': 'Bank Name:',
    'transfer_content_field_label': 'Required Transfer Content',
    'no_data': 'Select data',
    'checking_btn': 'Checking...',
    'confirm_payment_btn': 'Confirm Payment',
    'copy_btn': 'Copy',
    'info_title': 'Info',
    'print_receipt_btn': 'Print Receipt',
    'refresh_btn': 'Refresh',
    'expiry_time_label': 'Expiry Time',
    'note_base': (amount, info, content) => `Please transfer ${amount} using the ${info} details below with the content: ${content}`,
  }
};

export default {
  name: 'Payment',
  data() {
    const defaultBank = allPaymentDetails.find((m) => m.type === 'bank');
    const defaultBankCode = defaultBank ? defaultBank.code : '';

    return {
      // Mock data
      cart: [],
      orderId: '',
      finalTotal: 0, 

      // Payment state
      selectedMethod: 'momo', 
      selectedBankCode: defaultBankCode, 
      isProcessing: false, 

      // Data sources
      allPaymentDetails: allPaymentDetails,
      
      // UI / QR controls
      lang: 'vi',
      languages: [
        { code: 'vi', label: 'Tiếng Việt' },
        { code: 'en', label: 'English' }
      ],
      qrTimestamp: null,
      qrExpiresAt: null,
      qrTtl: 120, // seconds
      nowTick: Date.now(),
      qrTimerId: null,
      translations: mockTranslations,
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
              label: this.$t('method_bank_label') || 'Chuyển khoản Ngân hàng',
              icon: BANK_ICON
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
      return this.allPaymentDetails.find(d => d.value === this.selectedMethod && d.type === 'e-wallet') || {};
    },
    paymentNote() {
        // === SỬA LỖI OPTIONAL CHAINING Ở ĐÂY ===
        const langTranslations = this.translations[this.lang];
        const tFunc = langTranslations ? langTranslations['note_base'] : undefined; 
        // ======================================

        if (typeof tFunc === 'function') {
            return tFunc(
                this.formatMoney(this.finalTotal),
                this.currentPaymentInfo.bankName || this.selectedMethodLabel,
                this.transferContent
            );
        }
        return 'Vui lòng kiểm tra kỹ thông tin chuyển khoản.';
    },
    // QR code URL using a public QR generator (encodes orderId + transfer content + timestamp)
    qrCodeUrl() {
      const info = this.currentPaymentInfo;
      
      // Nếu là bank mà chưa chọn bank code hợp lệ, hiển thị QR trống/lỗi
      if (this.selectedMethod === 'bank' && !info.accountNumber) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('VUI LONG CHON NGAN HANG')}`;
      }

      // Dữ liệu chung cho VietQR/Ví
      const data = [
        info.bankName || 'Unknown',
        info.accountNumber || info.accountHolder || 'UnknownAcc',
        this.finalTotal,
        this.transferContent,
        this.qrTimestamp || ''
      ].join('|');
      
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
    },
    qrTimestampDisplay() {
      if (!this.qrTimestamp) return '-';
      const d = new Date(this.qrTimestamp);
      return d.toLocaleTimeString('vi-VN');
    },
    formatCountdown() {
      if (!this.qrExpiresAt) return '';
      const diff = Math.max(0, Math.floor((this.qrExpiresAt - this.nowTick) / 1000));
      const mm = String(Math.floor(diff / 60)).padStart(2, '0');
      const ss = String(diff % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    },
  },
  watch: {
    lang: {
      handler(newLang) {
        // Giả định đồng bộ ngôn ngữ toàn cục
        document.title = this.$t('title_payment'); 
      },
      immediate: true
    },
    selectedBankCode() {
      // Khi bank code thay đổi, refresh QR ngay lập tức
      this.refreshQr();
    }
  },
  methods: {
    // Giả lập hàm i18n nếu không có plugin
    $t(key) {
        const translations = this.translations[this.lang];
        if (translations && typeof translations[key] === 'string') {
            return translations[key];
        }
        // Trường hợp đặc biệt cho các nhãn không có trong translations object (ví dụ: Chuyển khoản Ngân hàng)
        if (key === 'method_bank_label') return 'Chuyển khoản Ngân hàng';
        
        // === SỬA LỖI OPTIONAL CHAINING Ở ĐÂY ===
        if (key === 'title_payment') return (translations && translations.title_payment) ? translations.title_payment : 'Xác nhận Thanh toán';
        // ======================================
        
        return key;
    },
    formatMoney(v) {
      return Number(v).toLocaleString('vi-VN') + ' VNĐ';
    },
    selectMethod(method) {
      this.selectedMethod = method;
      
      if (method === 'bank') {
        // Đảm bảo bank code được chọn khi chuyển sang Bank
        if (!this.selectedBankCode) {
          const firstBank = this.bankOptions[0];
          this.selectedBankCode = firstBank ? firstBank.code : '';
        }
      } else {
        // Nếu chuyển sang MOMO/VNPAY/..., set selectedBankCode về giá trị mặc định của phương thức đó
        const selectedDetail = this.allPaymentDetails.find(d => d.value === method);
        this.selectedBankCode = selectedDetail ? selectedDetail.code : '';
      }
      
      this.refreshQr();
    },
    printReceipt() {
      window.print();
    },
    // === LOGIC XÁC NHẬN THANH TOÁN MÔ PHỎNG ===
    confirmPayment() {
      if (this.isProcessing) return; 

      this.isProcessing = true; 
      
      setTimeout(() => {
        const isSuccess = Math.random() < 0.8; 
        this.isProcessing = false; 

        const status = isSuccess ? 'success' : 'failed';
        const errorMessage = isSuccess ? '' : 'Không nhận được giao dịch chuyển khoản trong thời gian quy định.';
        
        // Chuyển hướng
        // Giả định route 'AdminPayment' tồn tại
        this.$router.push({ 
          name: 'AdminPayment', 
          params: { 
            status: status, 
            orderId: this.orderId,
            paymentMethod: this.currentPaymentInfo.bankName || this.selectedMethodLabel,
            errorMessage: errorMessage
          } 
        });

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
    // QR helpers
    refreshQr() {
      // set a timestamp and compute expiry
      this.qrTimestamp = Date.now();
      this.qrExpiresAt = Date.now() + this.qrTtl * 1000;
      // Force a tick so computed qrCodeUrl changes
      this.nowTick = Date.now();
    },
    startQrTimer() {
      if (this.qrTimerId) return;
      this.qrTimerId = setInterval(() => {
        this.nowTick = Date.now();
        // if expired, refresh automatically
        if (this.qrExpiresAt && this.nowTick >= this.qrExpiresAt) {
          this.refreshQr();
        }
      }, 1000);
    },
    stopQrTimer() {
      if (this.qrTimerId) {
        clearInterval(this.qrTimerId);
        this.qrTimerId = null;
      }
    }
  },
  created() {
    // Mock Data Initialization (Lấy từ localStorage)
    const cartData = localStorage.getItem('cart');
    this.orderId =
      localStorage.getItem('payment_id') ||
      'HDW' + Math.floor(Math.random() * 1000000);
    if (cartData) {
      this.cart = JSON.parse(cartData);
      this.finalTotal =
        Number(localStorage.getItem('payment_total')) ||
        this.cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    } else {
      // Trường hợp không có data giỏ hàng, set mock total
      this.finalTotal = 1500000; 
      this.orderId = 'HDW' + Math.floor(Math.random() * 1000000);
    }
    
    // Khởi tạo phương thức mặc định
    this.selectMethod(this.selectedMethod);

    // Initialize QR and countdown
    this.refreshQr();
    this.startQrTimer();
  },
  beforeDestroy() {
    this.stopQrTimer();
  }
};
</script>

<style scoped>
/* ======================================================= */
/* Đảm bảo toàn bộ CSS ban đầu của bạn được giữ nguyên ở đây */
/* ======================================================= */
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
  margin-top: 24px;
  width: 1100px;
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
.header .actions {
    display: flex;
    align-items: center;
    gap: 12px;
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
  max-width: 1100px;
  width: 100%;
  margin: 24px auto 0 auto;
  background: var(--background-light);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-height: 520px;
}
.sidebar {
  width: 160px;
  background: var(--background-subtle);
  border-right: 1px solid var(--border-light);
  padding: 24px 0 24px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
}
.transaction-details {
  width: 100%;
  max-width: 420px;
  background: #fdfdfd;
  border: 1px solid var(--error-color);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px var(--shadow-light);
  text-align: left;
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
  max-width: 420px;
  background: var(--background-subtle);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 10px 0;
  margin-bottom: 18px;
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
  max-width: 420px;
  margin-bottom: 18px;
  text-align: left;
}
.bank-select label {
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 8px;
  display: block;
}
.bank-select select {
  padding: 10px 12px;
  font-size: 15px;
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

/* Payment grid and QR styles */
.payment-grid {
  display: flex;
  gap: 28px;
  width: 100%;
  align-items: flex-start;
}
.payment-grid .center-column {
  width: 420px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-right: 12px;
}
.payment-grid .qr-column {
  width: 420px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 6px;
}
.qr-card {
  background: #fff;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  width: 100%;
}
.qr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.qr-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.qr-controls button {
  background: var(--primary-color);
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.countdown {
  font-weight: 700;
  color: var(--error-color);
  min-width: 50px;
  text-align: right;
}
.qr-image img {
  width: 260px;
  height: 260px;
  object-fit: contain;
}
.lang-select {
  margin-right: 12px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #ddd;
}
.qr-foot {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 14px;
    color: var(--text-light);
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--border-light);
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
  .payment-grid {
    flex-direction: column-reverse; /* Đặt QR lên trên Info */
    gap: 0;
  }
  .payment-grid .left, 
  .payment-grid .right {
    width: 100%;
    max-width: 100%;
    align-items: center; 
    padding: 10px 0;
  }
  .qr-card {
    max-width: 350px; 
  }
  .transaction-details, 
  .transfer-info, 
  .bank-select, 
  .note {
    width: 90%; 
    max-width: 370px; 
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