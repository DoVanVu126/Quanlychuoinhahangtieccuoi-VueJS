<template>
  <div class="home-page">
    <HomeHeader />
    <HeroSection />
    <SearchBox />
    <RestaurantList />
    <WeddingList />
    <PromotionList />
    <HomeFooter />
  </div>
</template>

<script>
import HomeHeader from '@/components/Home/HomeHeader.vue';
import HeroSection from '@/components/Home/HeroSection.vue';
import SearchBox from '@/components/Home/SearchBox.vue';
import RestaurantList from '@/components/Home/RestaurantList.vue';
import WeddingList from '@/components/Home/WeddingList.vue';
import PromotionList from '@/components/Home/PromotionList.vue';
import HomeFooter from '@/components/Home/HomeFooter.vue';

export default {
  name: 'Home',
  components: {
    HomeHeader,
    HeroSection,
    SearchBox,
    RestaurantList,
    WeddingList,
    PromotionList,
    HomeFooter,
  },
};
</script>

<style>
.home-page {
  font-family: 'Poppins', sans-serif;
  background-color: #fff;
}
</style>
