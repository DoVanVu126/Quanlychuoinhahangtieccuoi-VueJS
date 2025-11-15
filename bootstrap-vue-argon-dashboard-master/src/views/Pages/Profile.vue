<template>
  <div class="profile-page">
    <h2>Trang cá nhân</h2>
    <p>Chào mừng, {{ user.name }}</p>
  </div>
</template>

<script>
export default {
  name: "ProfilePage",
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || { name: "Khách" },
    };
  },
};
</script>

<style>
.profile-page {
  padding: 40px;
}
</style>
