<template>
  <section class="promotion-list">
    <div class="promotion-list__container">
      <h2 class="promotion-list__title">Sự kiện & khuyến mãi</h2>

      <div class="promotion-list__grid">
        <div
          v-for="(promo, index) in promotions"
          :key="index"
          class="promotion-list__card"
        >
          <img :src="promo.image" :alt="promo.title" class="promotion-list__image" />
          <div class="promotion-list__content">
            <h3 class="promotion-list__card-title">{{ promo.title }}</h3>
          </div>
        </div>
      </div>

      <div class="promotion-list__footer">
        <button class="promotion-list__btn">Xem thêm</button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "PromotionList",
  data() {
    return {
      promotions: [
        { image: "/img/promo1.jpg", title: "Christmas Sale 50%" },
        { image: "/img/promo2.jpg", title: "Ưu đãi đến 20% cho 4 khách mời" },
        { image: "/img/promo3.jpg", title: "Đãi tiệc trọn gói – Ưu đãi lớn" },
      ],
    };
  },
};
</script>

<style scoped>
.promotion-list {
  padding: 60px 0;
  background-color: #fff;
}

.promotion-list__container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.promotion-list__title {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 30px;
}

.promotion-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.promotion-list__card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.promotion-list__card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.promotion-list__image {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.promotion-list__content {
  padding: 15px 20px;
}

.promotion-list__card-title {
  font-size: 18px;
  font-weight: 600;
}

.promotion-list__footer {
  text-align: center;
  margin-top: 25px;
}

.promotion-list__btn {
  background-color: #3b82f6;
  color: #fff;
  font-weight: 500;
  padding: 10px 28px;
  border-radius: 9999px;
  border: none;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.promotion-list__btn:hover {
  background-color: #2563eb;
}
</style>
