<template>
  <div class="mb-3">
    <input
      v-model="keyword"
      @input="$emit('onSearch', keyword)"
      placeholder="Tìm kiếm theo tên, mã hàng..."
      class="form-control"
    />
  </div>
</template>

<script>
export default {
  data() {
    return { keyword: "" };
  },
};
</script>
