<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">🍽 Sửa Món Ăn</h2>

    <!-- Spinner chỉ hiển thị trong form -->
    <div v-if="loading" class="form-loading">
      <div class="custom-spinner"></div>
      <span class="loading-text">Đang xử lý...</span>
    </div>

    <b-form @submit.prevent="updateFood">

      <!-- Tên món -->
      <b-form-group label="Tên món ăn">
        <b-form-input v-model="form.name" required></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea v-model="form.description" rows="3"></b-form-textarea>
      </b-form-group>

      <!-- Đơn vị -->
      <b-form-group label="Đơn vị">
        <b-form-input v-model="form.unit" placeholder="VD: phần, cái, suất" required></b-form-input>
      </b-form-group>

      <!-- Giá -->
      <b-form-group label="Giá (VNĐ)">
        <b-form-input type="number" min="0" v-model.number="form.price" required></b-form-input>
      </b-form-group>

      <!-- Loại món -->
      <b-form-group label="Loại món ăn">
        <b-form-select v-model="form.food_type_id" :options="foodTypes" required>
          <template #first>
            <b-form-select-option disabled value="">-- Chọn loại món --</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Nhà hàng -->
      <b-form-group label="Nhà hàng">
        <b-form-select v-model="form.restaurant_id" :options="restaurants" required>
          <template #first>
            <b-form-select-option disabled value="">-- Chọn nhà hàng --</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Ảnh -->
      <b-form-group label="Ảnh món ăn">
        <div v-if="previewImage">
          <p>Ảnh mới:</p>
          <img :src="previewImage" class="preview-img" />
        </div>
        <div v-else-if="form.image_url">
          <p>Ảnh hiện tại:</p>
          <img :src="getImageUrl(form.image_url)" class="preview-img" />
        </div>
        <p v-else class="text-muted">Không có ảnh</p>

        <b-form-file
          @change="handleImageUpload"
          accept="image/*"
          placeholder="Chọn ảnh mới nếu muốn thay"
        ></b-form-file>
      </b-form-group>

      <!-- Nút -->
      <div class="d-flex gap-2 mt-3">
        <b-button type="submit" variant="success" :disabled="loading">
          {{ loading ? 'Đang lưu...' : 'Lưu' }}
        </b-button>
        <b-button variant="secondary" @click="$router.push('/mon-an')">
          Hủy
        </b-button>
      </div>

    </b-form>

    <!-- TOAST -->
    <b-toast
      id="toast-success"
      title="✅ Thành công"
      variant="success"
      solid
      auto-hide-delay="3000"
    >
      Cập nhật món ăn thành công!
    </b-toast>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data: function() {
    return {
      loading: false,
      form: {
        name: "",
        description: "",
        unit: "",
        price: 0,
        food_type_id: null,
        restaurant_id: null,
        image_url: null,
        newImage: null
      },
      previewImage: null,
      foodTypes: [],
      restaurants: []
    };
  },

  mounted: function() {
    // gọi đồng thời 3 api
    var self = this;
    Promise.all([
      this.fetchFoodTypes(),
      this.fetchRestaurants(),
      this.loadFood()
    ]).catch(function(err) {
      // lỗi nào đó thì log
      console.error(err);
    });
  },

  methods: {
    // Lấy loại món
    fetchFoodTypes: async function() {
      try {
        var res = await api.get("/food-types");
        var list = [];

        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && res.data.data) {
          list = res.data.data;
        } else {
          list = [];
        }

        this.foodTypes = list.map(function(t) {
          var val = "";
          if (t.food_type_id) val = String(t.food_type_id);
          else if (t.id) val = String(t.id);
          else val = "";
          return {
            value: val,
            text: t.name
          };
        });
      } catch (err) {
        console.error("Lỗi tải loại món:", err);
      }
    },

    // Lấy nhà hàng
    fetchRestaurants: async function() {
      try {
        var res = await api.get("/restaurants");
        var list = [];

        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && res.data.data) {
          list = res.data.data;
        } else {
          list = [];
        }

        this.restaurants = list.map(function(r) {
          var val = "";
          if (r.restaurant_id) val = String(r.restaurant_id);
          else if (r.id) val = String(r.id);
          else val = "";
          return {
            value: val,
            text: r.name
          };
        });
      } catch (err) {
        console.error("Lỗi tải nhà hàng:", err);
      }
    },

    // Load món ăn đang sửa
    loadFood: async function() {
      try {
        var id = this.$route.params.id;
        var res = await api.get("/foods/" + id);
        var data = res.data;

        // nếu API trả object chứa data: {...}, hãy lấy data.data nếu cần
        if (data && data.data && data.data.name) {
          // trường hợp trả về { data: { name: ... } }
          data = data.data;
        }

        this.form.name = data.name || "";
        this.form.description = data.description || "";
        this.form.unit = data.unit || "";
        this.form.price = Number(data.price) || 0;

        this.form.food_type_id =
          data.food_type_id != null ? String(data.food_type_id) : null;

        this.form.restaurant_id =
          data.restaurant_id != null ? String(data.restaurant_id) : null;

        this.form.image_url = data.image_url || null;
        this.previewImage = null;
      } catch (err) {
        console.error("Lỗi tải món ăn:", err);
        alert("Không thể tải món ăn!");
        this.$router.push("/mon-an");
      }
    },

    getImageUrl: function(url) {
      if (!url) return null;
      if (typeof url === "string" && url.indexOf("http") === 0) return url;
      return "http://127.0.0.1:8088/" + String(url).replace(/^\/+/, "");
    },

    handleImageUpload: function(e) {
      var file = null;
      if (e && e.target && e.target.files && e.target.files[0]) {
        file = e.target.files[0];
      }
      if (file) {
        this.form.newImage = file;
        try {
          this.previewImage = URL.createObjectURL(file);
        } catch (err) {
          this.previewImage = null;
        }
      }
    },

    // Cập nhật món ăn có spinner + toast
    updateFood: async function() {
      this.loading = true;
      try {
        var id = this.$route.params.id;
        var formData = new FormData();

        formData.append("name", this.form.name);
        formData.append("description", this.form.description);
        formData.append("unit", this.form.unit);
        formData.append("price", this.form.price);
        formData.append("food_type_id", this.form.food_type_id);
        formData.append("restaurant_id", this.form.restaurant_id);

        if (this.form.newImage) {
          formData.append("image", this.form.newImage);
        }

        await api.post("/foods/" + id + "?_method=PUT", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        // show toast thành công
        if (this.$bvToast && typeof this.$bvToast.show === "function") {
          this.$bvToast.show("toast-success");
        } else if (this.$bvToast && typeof this.$bvToast.toast === "function") {
          // fallback
          this.$bvToast.toast("Cập nhật món ăn thành công!", {
            title: "✅ Thành công",
            variant: "success",
            solid: true,
            autoHideDelay: 3000
          });
        } else {
          // fallback alert nếu toast không được register
          alert("Cập nhật món ăn thành công!");
        }

        // delay nhỏ để người dùng thấy toast rồi chuyển
        setTimeout(
          function() {
            this.$router.push("/mon-an");
          }.bind(this),
          900
        );
      } catch (err) {
        console.error("Lỗi cập nhật:", err);

        if (this.$bvToast && typeof this.$bvToast.toast === "function") {
          this.$bvToast.toast("Cập nhật thất bại!", {
            title: "❌ Lỗi",
            variant: "danger",
            solid: true,
            autoHideDelay: 3000
          });
        } else {
          alert("Cập nhật thất bại!");
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

/* Ảnh preview */
.preview-img {
  width: 160px;
  height: 160px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid #ddd;
  margin-bottom: 10px;
  transition: 0.3s;
}

/* Spinner trong form */
.form-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 15px;
  font-weight: 500;
}

.custom-spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.loading-text {
  font-size: 16px;
  font-weight: 600;
}

/* animation xoay mượt */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preview-img:hover {
  transform: scale(1.05);
}

h2 {
  font-weight: 600;
}
</style>
