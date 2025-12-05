<template>
  <div class="foodcard-container">
    <div class="foodcard-img-wrapper">
      <img
        :src="foodImageUrl(food)"
        alt="Food"
        class="foodcard-img"
        @error="onImgError"
      />
    </div>

    <div class="foodcard-info">
      <h4>{{ food.name }}</h4>
      <p>{{ food.description }}</p>
      <p>Đơn vị: {{ food.unit }}</p>

      <p>
        Loại món:
        {{ food.food_type && food.food_type.name ? food.food_type.name : "Chưa xác định" }}
      </p>

      <p>
        Nhà hàng:
        {{ food.restaurant && food.restaurant.name ? food.restaurant.name : "Chưa xác định" }}
      </p>

      <button
        :class="food.selected ? 'foodcard-btn-selected' : 'foodcard-btn-select'"
        @click="$emit('select', food)"
      >
        {{ food.selected ? "ĐÃ CHỌN" : "CHỌN" }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "FoodCard",
  props: { food: Object },
  methods: {
    foodImageUrl(food) {
      const DEFAULT = "/images/default-food.jpg";
      if (!food) return DEFAULT;

      const val = String(food.image_url || food.image || "").trim();
      if (!val) return DEFAULT;

      if (/^(data:|https?:)\/\//i.test(val)) return val;
      if (/^\/\//.test(val)) return val;

      let clean = val.replace(/^public\//i, "").replace(/^\/+/, "");

      if (!clean.includes("/")) {
        clean = "uploads/foods/" + clean;
      }

      const backend = (process.env.VUE_APP_BACKEND_URL || "http://127.0.0.1:8088")
        .replace(/\/+$/, "");

      return backend + "/" + clean.replace(/^\/+/, "");
    },

    onImgError(e) {
      e.target.src = "/images/default-food.jpg";
    }
  }
};
</script>

<style src="../../assets/css/foodcard.css"></style>
