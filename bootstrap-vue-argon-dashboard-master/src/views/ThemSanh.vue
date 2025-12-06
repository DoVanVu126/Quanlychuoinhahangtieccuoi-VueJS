<template>
  <div class="container mt-5">
    <h2>Thêm Sảnh</h2>

    <!-- Spinner trong form -->
    <div v-if="loading" class="form-loading">
      <div class="custom-spinner"></div>
      <span class="loading-text">Đang xử lý...</span>
    </div>

    <!-- Lỗi tổng -->
    <div v-if="formError" class="alert alert-danger">
      {{ formError }}
    </div>

    <b-form @submit.prevent="addHall">

      <!-- Tên sảnh -->
      <b-form-group label="Tên sảnh">
        <b-form-input v-model="form.name" required></b-form-input>
        <small v-if="errors.name" class="text-danger">
          {{ errors.name[0] }}
        </small>
      </b-form-group>

      <!-- Chọn Nhà hàng -->
      <b-form-group label="Nhà hàng">
        <b-form-select v-model="form.restaurant_id" :options="restaurants">
          <template #first>
            <b-form-select-option :value="null" disabled>
              -- Chọn nhà hàng --
            </b-form-select-option>
          </template>
        </b-form-select>
        <small v-if="errors.restaurant_id" class="text-danger">
          {{ errors.restaurant_id[0] }}
        </small>
      </b-form-group>

      <!-- Sức chứa -->
      <b-form-group label="Sức chứa (người)">
        <b-form-input type="number" v-model="form.capacity" min="1" required></b-form-input>
        <small v-if="errors.capacity" class="text-danger">
          {{ errors.capacity[0] }}
        </small>
      </b-form-group>

      <!-- Giá thuê -->
      <b-form-group label="Giá thuê (VNĐ)">
        <b-form-input type="number" v-model="form.price" min="0" required></b-form-input>
        <small v-if="errors.price" class="text-danger">
          {{ errors.price[0] }}
        </small>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea
          v-model="form.description"
          rows="3"
          placeholder="Nhập mô tả sảnh"
        ></b-form-textarea>
        <small v-if="errors.description" class="text-danger">
          {{ errors.description[0] }}
        </small>
      </b-form-group>

      <!-- Trạng thái -->
      <b-form-group label="Trạng thái (mặc định)">
        <b-form-input value="Có sẵn" disabled></b-form-input>
      </b-form-group>

      <!-- Upload ảnh -->
      <b-form-group label="Ảnh sảnh">
        <b-form-file
          @change="handleImageUpload"
          accept="image/*"
          browse-text="Chọn ảnh"
          placeholder="Chưa chọn ảnh"
        ></b-form-file>

        <small v-if="errors.image" class="text-danger">
          {{ errors.image[0] }}
        </small>

        <div v-if="previewImage" class="mt-3 text-center">
          <img :src="previewImage" class="img-thumbnail preview-img" />
        </div>
      </b-form-group>

      <!-- Nút -->
      <div class="d-flex justify-content-between">
        <b-button type="submit" variant="success" :disabled="loading">
          {{ loading ? "Đang lưu..." : "💾 Lưu" }}
        </b-button>
        <b-button variant="secondary" @click="$router.push('/sanh')">
          ⬅ Quay lại
        </b-button>
      </div>

    </b-form>

    <!-- Toast thành công -->
    <b-toast
      id="toast-success"
      title="✅ Thành công"
      variant="success"
      solid
      auto-hide-delay="3000"
    >
      Thêm sảnh thành công!
    </b-toast>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data: function() {
    return {
      form: {
        name: "",
        restaurant_id: null,
        capacity: "",
        price: "",
        description: "",
        status: "available"
      },
      imageFile: null,
      previewImage: null,
      restaurants: [],

      errors: {},
      formError: "",
      loading: false
    };
  },

  mounted: function() {
    this.fetchRestaurants();
  },

  methods: {
    fetchRestaurants: async function() {
      try {
        var res = await api.get("/restaurants");
        var list = [];

        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && res.data.data) {
          list = res.data.data;
        }

        this.restaurants = list.map(function(r) {
          return {
            value: r.restaurant_id,
            text: r.name
          };
        });
      } catch (err) {
        console.error("Lỗi tải nhà hàng:", err);
      }
    },

    handleImageUpload: function(e) {
      var file = null;
      if (e && e.target && e.target.files && e.target.files[0]) {
        file = e.target.files[0];
      }

      if (file) {
        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },

    addHall: async function() {
      this.loading = true;
      this.errors = {};
      this.formError = "";

      // Frontend validate
      if (!this.form.name) {
        this.formError = "Vui lòng nhập tên sảnh!";
        this.loading = false;
        return;
      }

      if (!this.form.restaurant_id) {
        this.formError = "Vui lòng chọn nhà hàng!";
        this.loading = false;
        return;
      }

      try {
        var formData = new FormData();

        for (var key in this.form) {
          formData.append(key, this.form[key]);
        }

        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        await api.post("/halls", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        // Toast
        if (this.$bvToast && this.$bvToast.show) {
          this.$bvToast.show("toast-success");
        }

        setTimeout(
          function() {
            this.$router.push("/sanh");
          }.bind(this),
          800
        );
      } catch (err) {
        console.error("Lỗi thêm sảnh:", err);

        if (err.response && err.response.status === 422) {
          this.errors = err.response.data.errors || {};
          this.formError = "⚠️ Dữ liệu không hợp lệ!";
        } else if (err.response && err.response.data && err.response.data.message) {
          this.formError = err.response.data.message;
        } else {
          this.formError = "❌ Lỗi hệ thống!";
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 700px;
}

.form-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f1f3f5;
  border-radius: 12px;
  margin-bottom: 15px;
}

.custom-spinner {
  width: 30px;
  height: 30px;
  border: 4px solid #ddd;
  border-top: 4px solid #28a745;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.loading-text {
  font-size: 16px;
  font-weight: 600;
}

.preview-img {
  max-width: 200px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

/* animation xoay */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

h2 {
  font-weight: 600;
  margin-bottom: 20px;
}

.b-form-group {
  margin-bottom: 1.2rem;
}
</style>
