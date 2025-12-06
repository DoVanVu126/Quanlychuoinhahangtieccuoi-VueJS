<template>
  <div class="container mt-5">
    <h2 class="text-primary mb-4">🍽 Thêm Món Ăn</h2>

    <!-- Spinner trong form -->
    <div v-if="loading" class="form-loading">
      <div class="custom-spinner"></div>
      <span class="loading-text">Đang xử lý...</span>
    </div>

    <b-form @submit.prevent="addFood">

      <!-- Tên món ăn -->
      <b-form-group label="Tên món ăn" label-for="name">
        <b-form-input
          id="name"
          v-model="form.name"
          required
          placeholder="Nhập tên món ăn"
        ></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả" label-for="description">
        <b-form-textarea
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Nhập mô tả món ăn"
        ></b-form-textarea>
      </b-form-group>

      <!-- Đơn vị -->
      <b-form-group label="Đơn vị" label-for="unit">
        <b-form-input
          id="unit"
          v-model="form.unit"
          required
          placeholder="Nhập đơn vị (VD: phần, suất)"
        ></b-form-input>
      </b-form-group>

      <!-- Giá -->
      <b-form-group label="Giá (VNĐ)" label-for="price">
        <b-form-input
          id="price"
          type="number"
          v-model.number="form.price"
          required
          min="0"
          placeholder="Nhập giá món ăn"
        ></b-form-input>
      </b-form-group>

      <!-- Loại món -->
      <b-form-group label="Loại món ăn" label-for="food_type_id">
        <b-form-select
          id="food_type_id"
          v-model="form.food_type_id"
          :options="foodTypes"
          required
        >
          <template #first>
            <b-form-select-option disabled :value="null">
              -- Chọn loại --
            </b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Nhà hàng -->
      <b-form-group label="Nhà hàng" label-for="restaurant_id">
        <b-form-select
          id="restaurant_id"
          v-model="form.restaurant_id"
          :options="restaurants"
          required
        >
          <template #first>
            <b-form-select-option disabled :value="null">
              -- Chọn nhà hàng --
            </b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Ảnh -->
      <b-form-group label="Ảnh món ăn" label-for="image">
        <b-form-file
          id="image"
          @change="handleImageUpload"
          accept="image/*"
          placeholder="Chọn file ảnh..."
        ></b-form-file>
      </b-form-group>

      <!-- Nút -->
      <div class="d-flex gap-2 mt-3">
        <b-button type="submit" variant="success" :disabled="loading">
          {{ loading ? "Đang lưu..." : "Lưu" }}
        </b-button>
        <b-button variant="secondary" @click="$router.push('/mon-an')">
          Quay lại
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
      Thêm món ăn thành công!
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
        image: null
      },
      foodTypes: [],
      restaurants: []
    };
  },

  mounted: function() {
    this.fetchFoodTypes();
    this.fetchRestaurants();
  },

  methods: {
    // Upload ảnh
    handleImageUpload: function(e) {
      var file = null;
      if (e && e.target && e.target.files && e.target.files[0]) {
        file = e.target.files[0];
      }
      this.form.image = file;
    },

    // Lấy loại món
    fetchFoodTypes: async function() {
      try {
        var res = await api.get("/food-types");
        var list = [];

        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && res.data.data) {
          list = res.data.data;
        }

        this.foodTypes = list.map(function(ft) {
          return {
            value: ft.food_type_id,
            text: ft.name
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

    // Thêm món ăn
    addFood: async function() {
      this.loading = true;

      try {
        var formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("description", this.form.description);
        formData.append("unit", this.form.unit);
        formData.append("price", this.form.price);
        formData.append("food_type_id", this.form.food_type_id);
        formData.append("restaurant_id", this.form.restaurant_id);

        if (this.form.image) {
          formData.append("image", this.form.image);
        }

        await api.post("/foods", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        // show toast
        if (this.$bvToast && this.$bvToast.show) {
          this.$bvToast.show("toast-success");
        }

        // delay rồi chuyển trang
        setTimeout(
          function() {
            this.$router.push("/mon-an");
          }.bind(this),
          800
        );
      } catch (err) {
        console.error("Lỗi thêm món ăn:", err);

        if (this.$bvToast && this.$bvToast.toast) {
          this.$bvToast.toast("Thêm món ăn thất bại!", {
            title: "❌ Lỗi",
            variant: "danger",
            solid: true,
            autoHideDelay: 3000
          });
        } else {
          alert("❌ Thêm món ăn thất bại!");
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
  border: 4px solid #ddd;
  border-top: 4px solid #28a745;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.loading-text {
  font-size: 16px;
  font-weight: 600;
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
