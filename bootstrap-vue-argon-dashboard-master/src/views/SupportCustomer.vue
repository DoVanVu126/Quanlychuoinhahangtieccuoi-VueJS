<template>
  <div>
    <div class="header bg-gradient-primary pb-6 pt-5 pt-md-8">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">Hỗ trợ Khách hàng</h2>
          <p class="text-light mb-0">Gửi thắc mắc của bạn, chúng tôi sẽ phản hồi sớm nhất.</p>
        </div>
      </div>
    </div>

    <div class="container-fluid mt--6">
      <div class="row justify-content-center">
        <div class="col-lg-8 card-wrapper">
          <div class="card bg-secondary shadow border-0">
            <div class="card-header bg-white pb-3">
              <div class="text-muted text-center"><small>Điền thông tin yêu cầu</small></div>
            </div>
            <div class="card-body px-lg-5 py-lg-5">
              <form @submit.prevent="submitTicket">
                
                <div class="form-group mb-3">
                  <label class="form-control-label">Tiêu đề</label>
                  <div class="input-group input-group-alternative shadow-sm">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-tag"></i></span>
                    </div>
                    <input v-model="form.subject" class="form-control" placeholder="Ví dụ: Lỗi thanh toán..." type="text" required>
                  </div>
                </div>

                <div class="form-group mb-3">
                  <label class="form-control-label">Mức độ ưu tiên</label>
                  <div class="input-group input-group-alternative shadow-sm">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-signal"></i></span>
                    </div>
                    <select v-model="form.priority" class="form-control">
                        <option value="low">Thấp</option>
                        <option value="medium">Trung bình</option>
                        <option value="high">Cao</option>
                        <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div class="form-group mb-4">
                  <label class="form-control-label">Nội dung</label>
                  <textarea v-model="form.message" class="form-control form-control-alternative shadow-sm" rows="5" placeholder="Mô tả chi tiết vấn đề..." required></textarea>
                </div>

                <div class="text-center">
                  <b-button 
                    type="submit" 
                    variant="primary" 
                    class="my-4 px-5" 
                    :disabled="isSending"
                  >
                    <span v-if="isSending"><b-spinner small></b-spinner> Đang gửi...</span>
                    <span v-else>Gửi Yêu Cầu</span>
                  </b-button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      form: {
        subject: '',
        priority: 'low',
        message: ''
      },
      isSending: false
    };
  },
  methods: {
    async submitTicket() {
      // Validate sơ bộ
      if (!this.form.subject.trim() || !this.form.message.trim()) {
          this.$bvToast.toast('Vui lòng nhập đầy đủ thông tin', {
             title: 'Cảnh báo', variant: 'warning', solid: true
          });
          return;
      }

      this.isSending = true;
      try {
        await api.post('/api/support-tickets', this.form);
        
        this.$bvToast.toast('Gửi yêu cầu thành công! Vui lòng đợi phản hồi.', {
          title: 'Thành công', variant: 'success', solid: true, autoHideDelay: 5000
        });
        
        // Reset form
        this.form = {
            subject: '',
            priority: 'low',
            message: ''
        };

      } catch (error) {
        console.error(error);
        this.$bvToast.toast('Có lỗi xảy ra. Vui lòng thử lại sau.', {
          title: 'Lỗi', variant: 'danger', solid: true
        });
      } finally {
        this.isSending = false;
      }
    }
  }
};
</script>

<style scoped>
.form-control-label {
    font-weight: 600;
    color: #525f7f;
    font-size: 0.875rem;
}
.input-group-text {
    background-color: #fff;
}
</style>