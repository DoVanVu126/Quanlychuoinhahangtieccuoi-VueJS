<template>
  <div class="chatbox">
    <div class="header">Trợ lý kho</div>
    <div class="body">
      <input
        v-model="message"
        class="form-control"
        placeholder="Nhập tên sản phẩm..."
      />
      <button class="btn btn-primary w-100 mt-2" @click="reply">Tìm</button>
      <div class="mt-3 text-muted">{{ replyText }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "",
      replyText: "",
      data: JSON.parse(localStorage.getItem("khoData")) || [],
    };
  },
  methods: {
    reply() {
      const found = this.data.find((i) =>
        i.name.toLowerCase().includes(this.message.toLowerCase())
      );
      this.replyText = found
        ? `${found.name} còn ${found.stock} ${found.unit}`
        : "Không tìm thấy hàng.";
    },
  },
};
</script>

<style scoped>
.chatbox {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 260px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  overflow: hidden;
}
.header {
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  text-align: center;
  padding: 10px;
  font-weight: bold;
}
.body {
  padding: 10px;
}
</style>
