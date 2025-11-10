<template>
  <section class="wedding-list">
    <div class="wedding-list__container">
      <h2 class="wedding-list__title">Những tiệc nổi bật</h2>

      <div class="wedding-list__grid">
        <div
          v-for="(wedding, index) in weddings"
          :key="index"
          class="wedding-list__card"
        >
          <img :src="wedding.image" :alt="wedding.title" class="wedding-list__image" />
          <div class="wedding-list__content">
            <h3 class="wedding-list__card-title">{{ wedding.title }}</h3>
            <p class="wedding-list__venue">{{ wedding.venue }}</p>
          </div>
        </div>
      </div>

      <div class="wedding-list__footer">
        <button class="wedding-list__btn">Xem thêm</button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "WeddingList",
  data() {
    return {
      weddings: [
        {
          image: "/img/wedding1.jpg",
          title: "Dear My Princess",
          venue: "Nhà hàng Riverside Palace (Quận 4)",
        },
        {
          image: "/img/wedding2.jpg",
          title: "Sắc thái thanh khiết",
          venue: "Nhà hàng White Palace",
        },
        {
          image: "/img/wedding3.jpg",
          title: "Khu vườn bí ẩn",
          venue: "Nhà hàng GEM Center",
        },
      ],
    };
  },
};
</script>

<style scoped>
.wedding-list {
  padding: 60px 0;
  background-color: #fff;
}

.wedding-list__container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.wedding-list__title {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 30px;
}

.wedding-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.wedding-list__card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.wedding-list__card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.wedding-list__image {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.wedding-list__content {
  padding: 15px 20px;
}

.wedding-list__card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
}

.wedding-list__venue {
  font-size: 14px;
  color: #666;
}

.wedding-list__footer {
  text-align: center;
  margin-top: 25px;
}

.wedding-list__btn {
  background-color: #3b82f6;
  color: #fff;
  font-weight: 500;
  padding: 10px 28px;
  border-radius: 9999px;
  border: none;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.wedding-list__btn:hover {
  background-color: #2563eb;
}
</style>
