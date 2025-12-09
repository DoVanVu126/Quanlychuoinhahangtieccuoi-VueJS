<template>
  <div class="container mt-5">
    <h2 class="text-primary mb-4">🍽 Thêm Món Ăn</h2>

    <!-- Spinner trong form -->
    <div v-if="loading" class="form-loading">
      <div class="custom-spinner"></div>
      <span class="loading-text">Đang xử lý...</span>
    </div>

    <b-form @submit.prevent="validateBeforeSubmit">

      <!-- Tên món ăn -->
      <b-form-group label="Tên món ăn" label-for="name">
        <b-form-input
          id="name"
          v-model="form.name"
          required
          placeholder="Nhập tên món ăn"
        ></b-form-input>
        <small class="text-danger" v-if="errors.name">{{ errors.name }}</small>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả" label-for="description">
        <b-form-textarea
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Nhập mô tả món ăn"
        ></b-form-textarea>
        <small class="text-danger" v-if="errors.description">{{ errors.description }}</small>
      </b-form-group>

      <!-- Đơn vị -->
      <b-form-group label="Đơn vị" label-for="unit">
        <b-form-input
          id="unit"
          v-model="form.unit"
          required
          placeholder="Nhập đơn vị (VD: phần, suất)"
        ></b-form-input>
        <small class="text-danger" v-if="errors.unit">{{ errors.unit }}</small>
      </b-form-group>

      <!-- Giá -->
      <b-form-group label="Giá (VNĐ)" label-for="price">
        <!-- dùng v-model để two-way binding với priceDisplay -->
        <b-form-input
          id="price"
          type="text"
          v-model="priceDisplay"
          @input="onPriceInput"
          placeholder="Nhập giá món ăn"
        ></b-form-input>
        <small class="text-danger" v-if="errors.price">{{ errors.price }}</small>
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
        <small class="text-danger" v-if="errors.food_type_id">{{ errors.food_type_id }}</small>
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
        <small class="text-danger" v-if="errors.restaurant_id">{{ errors.restaurant_id }}</small>
      </b-form-group>

      <!-- Ảnh -->
      <b-form-group label="Ảnh món ăn" label-for="image">
        <b-form-file
          id="image"
          @change="handleImageUpload"
          accept="image/*"
          placeholder="Chọn file ảnh..."
        ></b-form-file>
        <small class="text-danger" v-if="errors.image">{{ errors.image }}</small>
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
      errors: {},

      form: {
        name: "",
        description: "",
        unit: "",
        price: null,
        food_type_id: null,
        restaurant_id: null,
        image: null
      },

      // hiển thị giá cho input (string) để xử lý full-width / ký tự lạ
      priceDisplay: "",

      foodTypes: [],
      restaurants: []
    };
  },

  mounted: function() {
    this.fetchFoodTypes();
    this.fetchRestaurants();
  },

  methods: {
    /* ---------- Helpers ---------- */

    // chuyển full-width digits ０-９ -> 0-9 và full-width space -> normal space
    normalizeFullWidthDigits: function(str) {
      if (typeof str !== "string") return String(str || "");
      var normalized = str.replace(/[０-９]/g, function(ch) {
        return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
      });
      return normalized.replace(/\u3000/g, " ");
    },

    // kiểm tra có HTML (simple): nếu innerText khác với original => có tag
    containsHtml: function(text) {
      if (text === null || text === undefined) return false;
      var trimmed = String(text).trim();
      if (trimmed === "") return false;
      if (/<[^>]+>/.test(trimmed)) return true;
      try {
        var tmp = document.createElement("div");
        tmp.innerHTML = trimmed;
        var withoutTags = tmp.textContent || tmp.innerText || "";
        return withoutTags.trim() !== trimmed;
      } catch (e) {
        return false;
      }
    },

    // sanitize: remove tags, collapse whitespace, replace full-width spaces
    sanitizeText: function(text) {
      if (text === null || text === undefined) return "";
      try {
        var tmp = document.createElement("div");
        tmp.innerHTML = text;
        var cleaned = tmp.textContent || tmp.innerText || "";
        cleaned = cleaned.replace(/\u3000/g, " ");
        cleaned = cleaned.replace(/\s+/g, " ").trim();
        return cleaned;
      } catch (e) {
        var s = String(text).replace(/\u3000/g, " ").replace(/\s+/g, " ").trim();
        return s;
      }
    },

    /* ---------- Price input (compatible with BootstrapVue) ---------- */
    // NOTE: BootstrapVue's <b-form-input> emits the new value to @input (not an event object).
    // So this handler accepts either (value) or (event) for maximum compatibility.
    onPriceInput: function(payload) {
      // payload can be: event (with target.value) OR value string
      var raw = "";

      if (payload && payload.target && payload.target.value !== undefined) {
        raw = String(payload.target.value || "");
      } else {
        raw = String(payload || "");
      }

      // normalize full-width digits and spaces
      raw = this.normalizeFullWidthDigits(raw || "");

      // keep only digits (all non-digit -> removed)
      var filtered = raw.replace(/\D+/g, "");

      // update display (v-model bound)
      this.priceDisplay = filtered;

      // update real numeric price
      if (filtered === "") {
        this.form.price = null;
      } else {
        // parse as integer (no decimals expected in input)
        var n = parseInt(filtered, 10);
        this.form.price = !isNaN(n) ? n : null;
      }

      // debug
      try {
        /* eslint-disable no-console */
        console.log("DEBUG PRICE:", this.priceDisplay, this.form.price, typeof this.form.price);
        /* eslint-enable no-console */
      } catch (e) {}
    },

    /* ---------- File upload (no optional chaining) ---------- */
    handleImageUpload: function(e) {
      var file = null;
      if (e && e.target && e.target.files && e.target.files[0]) {
        file = e.target.files[0];
      } else if (e && e instanceof File) {
        // sometimes the handler might pass the File directly
        file = e;
      }

      if (!file) {
        this.form.image = null;
        return;
      }

      // kiểm tra mime (reject pdf)
      if (typeof file.type !== "string" || file.type.indexOf("image/") !== 0) {
        this.errors.image = "Chỉ chấp nhận file ảnh (jpg/jpeg/png/webp/gif).";
        this.form.image = null;
        return;
      }

      // size limit 10MB
      var maxBytes = 10 * 1024 * 1024;
      if (file.size > maxBytes) {
        this.errors.image = "Kích thước ảnh quá lớn (tối đa 10MB).";
        this.form.image = null;
        return;
      }

      this.errors.image = null;
      this.form.image = file;
    },

    /* ---------- Fetch lists ---------- */
    fetchFoodTypes: function() {
      var self = this;
      api.get("/food-types")
        .then(function(res) {
          var list = [];
          if (Array.isArray(res.data)) {
            list = res.data;
          } else if (res.data && res.data.data) {
            list = res.data.data;
          }
          self.foodTypes = list.map(function(ft) {
            return { value: ft.food_type_id, text: ft.name };
          });
        })
        .catch(function(err) {
          console.error("Lỗi tải loại món:", err);
        });
    },

    fetchRestaurants: function() {
      var self = this;
      api.get("/restaurants")
        .then(function(res) {
          var list = [];
          if (Array.isArray(res.data)) {
            list = res.data;
          } else if (res.data && res.data.data) {
            list = res.data.data;
          }
          self.restaurants = list.map(function(r) {
            return { value: r.restaurant_id, text: r.name };
          });
        })
        .catch(function(err) {
          console.error("Lỗi tải nhà hàng:", err);
        });
    },

    /* ---------- Frontend validation (full) ---------- */
    validateForm: function() {
      var self = this;
      self.errors = {};

      function isBlank(s) {
        if (s === null || s === undefined) return true;
        var t = String(s).replace(/\u3000/g, " ").replace(/\s+/g, "").trim();
        return t.length === 0;
      }

      // NAME
      if (isBlank(self.form.name)) {
        self.errors.name = "Tên món không được để trống.";
      } else {
        if (self.containsHtml(self.form.name)) {
          self.errors.name = "Tên món không được chứa HTML/markup.";
        } else {
          var cleanedName = self.sanitizeText(self.form.name);
          if (cleanedName.length > 150) {
            self.errors.name = "Tên món quá dài (tối đa 150 ký tự).";
          }
        }
      }

      // DESCRIPTION - nullable
      if (!isBlank(self.form.description)) {
        if (self.containsHtml(self.form.description)) {
          self.errors.description = "Mô tả không được chứa HTML/markup.";
        } else {
          var cleanedDesc = self.sanitizeText(self.form.description);
          if (cleanedDesc.length > 255) {
            self.errors.description = "Mô tả quá dài (tối đa 255 ký tự).";
          }
        }
      }

      // UNIT
      if (isBlank(self.form.unit)) {
        self.errors.unit = "Đơn vị không được để trống.";
      } else {
        if (self.containsHtml(self.form.unit)) {
          self.errors.unit = "Đơn vị không được chứa HTML/markup.";
        } else {
          var cleanedUnit = self.sanitizeText(self.form.unit);
          if (cleanedUnit.length > 50) {
            self.errors.unit = "Đơn vị quá dài (tối đa 50 ký tự).";
          }
        }
      }

      // PRICE
      if (self.form.price === null || !isFinite(self.form.price)) {
        self.errors.price = "Giá không hợp lệ (phải là số >= 0).";
      } else if (self.form.price < 0) {
        self.errors.price = "Giá phải lớn hơn hoặc bằng 0.";
      }

      // SELECT food_type_id
      if (self.form.food_type_id === null || self.form.food_type_id === undefined) {
        self.errors.food_type_id = "Vui lòng chọn loại món ăn.";
      } else {
        var okFt = false;
        for (var i = 0; i < self.foodTypes.length; i++) {
          if (self.foodTypes[i].value === self.form.food_type_id) {
            okFt = true;
            break;
          }
        }
        if (!okFt) self.errors.food_type_id = "Giá trị loại món không hợp lệ.";
      }

      // SELECT restaurant_id
      if (self.form.restaurant_id === null || self.form.restaurant_id === undefined) {
        self.errors.restaurant_id = "Vui lòng chọn nhà hàng.";
      } else {
        var okR = false;
        for (var j = 0; j < self.restaurants.length; j++) {
          if (self.restaurants[j].value === self.form.restaurant_id) {
            okR = true;
            break;
          }
        }
        if (!okR) self.errors.restaurant_id = "Giá trị nhà hàng không hợp lệ.";
      }

      // IMAGE double-check
      if (self.form.image) {
        if (typeof self.form.image.type !== "string" || self.form.image.type.indexOf("image/") !== 0) {
          self.errors.image = "File phải là ảnh.";
        }
      }

      return Object.keys(self.errors).length === 0;
    },

    /* ---------- Prevent double submit & run validate ---------- */
    validateBeforeSubmit: function() {
      var self = this;
      if (self.loading) return;

      var ok = self.validateForm();
      if (!ok) {
        self.$nextTick(function() {
          var el = document.querySelector(".text-danger");
          if (el) {
            try { el.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
          }
        });
        return;
      }

      self.addFood();
    },

    /* ---------- Submit to backend (sanitize & show backend errors) ---------- */
    addFood: function() {
      var self = this;
      self.loading = true;

      try {
        var name = self.sanitizeText(self.form.name);
        var description = self.sanitizeText(self.form.description);
        var unit = self.sanitizeText(self.form.unit);
        var price = Number(self.form.price);
        var food_type_id = Number(self.form.food_type_id);
        var restaurant_id = Number(self.form.restaurant_id);

        var formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("unit", unit);
        formData.append("price", String(price));
        formData.append("food_type_id", String(food_type_id));
        formData.append("restaurant_id", String(restaurant_id));

        if (self.form.image) {
          formData.append("image", self.form.image);
        }

        api.post("/foods", formData, { headers: { "Content-Type": "multipart/form-data" } })
          .then(function(res) {
            if (self.$bvToast && self.$bvToast.show) {
              self.$bvToast.show("toast-success");
            } else {
              alert("Thêm món ăn thành công!");
            }
            setTimeout(function() { self.$router.push("/mon-an"); }, 700);
          })
          .catch(function(err) {
            console.error("Lỗi addFood:", err && err.response ? err.response.data : err);
            var msg = "Thêm món ăn thất bại!";

            if (err && err.response && err.response.data) {
              var data = err.response.data;
              if (data.errors) {
                var arr = [];
                for (var key in data.errors) {
                  if (data.errors.hasOwnProperty(key)) {
                    var v = data.errors[key];
                    if (Array.isArray(v)) {
                      arr.push(key + ": " + v.join(" | "));
                    } else {
                      arr.push(key + ": " + String(v));
                    }
                  }
                }
                if (arr.length > 0) msg = arr.join("\n");
              } else if (data.message) {
                msg = data.message;
              }
            } else if (err && err.message) {
              msg = err.message;
            }

            if (self.$bvToast && self.$bvToast.toast) {
              self.$bvToast.toast(msg, { title: "❌ Lỗi", variant: "danger", solid: true, autoHideDelay: 6000 });
            } else {
              alert(msg);
            }
          })
          .finally(function() {
            self.loading = false;
          });

      } catch (e) {
        console.error("Unexpected error addFood:", e);
        self.loading = false;
        var msg = "Lỗi không xác định khi gửi dữ liệu.";
        if (self.$bvToast && self.$bvToast.toast) {
          self.$bvToast.toast(msg, { title: "❌ Lỗi", variant: "danger", solid: true });
        } else {
          alert(msg);
        }
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
