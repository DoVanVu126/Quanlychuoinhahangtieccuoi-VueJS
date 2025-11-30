<template>
  <footer class="custom-footer">
    <div class="footer-content">
      <div class="footer-logo">
        <img src="/img/logo.png" alt="logo" />
      </div>

      <h2 class="footer-title">Đặt tiệc dễ dàng – Trải nghiệm trọn vẹn</h2>

      <div class="footer-icons">
        <i class="fab fa-facebook"></i>
        <i class="fab fa-instagram"></i>
        <i class="fab fa-google"></i>
      </div>

      <p class="footer-contact">
        SDT: 0919384275 &nbsp;&nbsp;&nbsp; Email: dovu1262004@gmail.com
      </p>

      <!-- Minimap on the right -->
      <div class="footer-map">
        <iframe :src="mapSrc" frameborder="0" scrolling="no" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'HomeFooter',
  props: {
    mapLat: { type: Number, default: 21.028511 },
    mapLng: { type: Number, default: 105.804817 },
    mapZoom: { type: Number, default: 13 }
  },
  computed: {
    mapSrc() {
      const lat = this.mapLat;
      const lon = this.mapLng;
      const zoom = this.mapZoom;
      // small bbox around the point
      const delta = 0.02 / (zoom / 10);
      const left = lon - delta;
      const right = lon + delta;
      const top = lat + delta;
      const bottom = lat - delta;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');

.custom-footer {
  background: url("/img/banner-footer.jpg") no-repeat center bottom;
  background-size: 100% auto;
  background-color: #cbe4e8;
  padding: 70px 0 70px 0;
  width: 100%;
  height: 100%;
  font-family: "Times New Roman", serif;
}

/* Khung footer được canh giữa */
.footer-content {
  max-width: 1430px;
  margin: auto;
  position: relative;
  text-align: center;
}

/* Vòng tròn logo - đảm bảo luôn căn giữa và không bị cắt khó hiểu */
.footer-logo {
  width: 230px;
  height: 230px;
  background: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: absolute;
  left: 40px; /* cho cách trái một chút (tuỳ chỉnh nếu cần) */
  top: 55%;
  transform: translateY(-50%);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.03); /* viền nhạt giống mẫu */
}

/* Ảnh nằm gọn trong vòng tròn, giữ tỉ lệ, không bị crop lạ */
.footer-logo img {
  display: block;
  max-width: 80%;
  max-height: 80%;
  width: auto;
  height: auto;
  object-fit: contain; /* giữ tỉ lệ, không cắt */
}

/* Minimap styles */
.footer-map {
  position: absolute;
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}
.footer-map iframe { width:100%; height:100%; border:0; }

@media (max-width: 768px) {
  .footer-map { position: static; transform: none; margin-top: 18px; width: 90%; height: 160px; }
}

.footer-title {
  font-size: 50px;
  font-family: "Great Vibes", cursive;
  font-weight: 600;
  margin-bottom: 25px;

  color: #f5d178; /* vàng ánh kim */
  -webkit-text-stroke: 0.01px #ecd45c; /* viền chữ đậm để nổi trên nền tối */
  text-shadow: 0 0 8px rgba(0,0,0,0.55);
}

/* Icon */
.footer-icons i {
  font-size: 24px;
  margin: 0 10px;
  cursor: pointer;
}

/* Liên hệ */
.footer-contact {
  margin-top: 20px;
  font-size: 16px;
  color: aliceblue;
}
</style>
