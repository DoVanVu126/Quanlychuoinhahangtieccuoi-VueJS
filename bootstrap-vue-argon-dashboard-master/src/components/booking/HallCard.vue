<template>
  <div class="hallcard-container">
    <div class="hallcard-img-wrapper">
      <img
        :src="hallImageUrl(hall)"
        alt="Hall"
        class="hallcard-img"
        @error="onImgError"
      />

      <div
        v-if="hall.status === 'maintenance'"
        class="hallcard-overlay"
      >
        ĐANG BẢO TRÌ
      </div>
    </div>

    <div class="hallcard-info">
      <h4>{{ hall.name }}</h4>
      <p>{{ hall.description }}</p>
      <p>
        <strong>{{ hall.range }}</strong>
      </p>

      <button
        :class="hall.selected ? 'hallcard-btn-selected' : 'hallcard-btn-select'"
        :disabled="hall.status === 'maintenance'"
        @click="$emit('select', hall)"
      >
        {{ hall.selected ? 'ĐÃ CHỌN' : 'CHỌN' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "HallCard",
  props: ["hall"],
  methods: {
    hallImageUrl(hall) {
      const DEFAULT = "/images/default.png";
      if (!hall) return DEFAULT;

      const val = String(hall.image || hall.image_url || "").trim();
      if (!val) return DEFAULT;

      // Nếu là link tuyệt đối → dùng luôn
      if (/^(data:|https?:)\/\//i.test(val)) return val;
      if (/^\/\//.test(val)) return val;

      // Xóa public/ nếu có
      let clean = val.replace(/^public\//i, "").replace(/^\/+/, "");

      // Nếu chỉ là tên file → auto gán thư mục halls
      if (!clean.includes("/")) {
        clean = "uploads/halls/" + clean;
      }

      // Backend giống RestaurantHeader
      const backend = (process.env.VUE_APP_BACKEND_URL || "http://127.0.0.1:8088")
        .replace(/\/+$/, "");

      return backend + "/" + clean.replace(/^\/+/, "");
    },

    onImgError(e) {
      e.target.src = "/images/default.png";
    }
  }
};
</script>

<style src="../../assets/css/hallcard.css"></style>
