<template>
  <div>
    <HomeHeader />
    <main style="min-height: calc(100vh - 70px); padding: 20px;">
      <router-view />
    </main>
  </div>
</template>

<script>
import HomeHeader from "@/components/Home/HomeHeader.vue";

export default {
  name: "UserHeaderLayout",
  components: { HomeHeader },
};
</script>
