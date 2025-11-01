<template>
  <div class="wedding-search-box">
    <div class="wedding-search-tab">Nhà hàng</div>
    <div class="wedding-search-content">
      <div class="wedding-search-input-group">
        <i class="fa fa-search wedding-search-icon"></i>
        <input type="text" placeholder="Nhập tên nhà hàng" />
      </div>

      <!-- ✅ Gộp 2 ô ngày trong cùng 1 hàng -->
      <div class="wedding-date-row">
        <div class="wedding-date-group">
          <label>Ngày đặt</label>
          <input type="date" />
        </div>
        <div class="wedding-date-group">
          <label>Ngày trả</label>
          <input type="date" />
        </div>
      </div>

      <button class="wedding-search-btn">TÌM</button>
    </div>
  </div>
</template>

<style src="../../assets/css/search-box.css"></style>