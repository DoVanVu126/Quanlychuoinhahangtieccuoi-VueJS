<template>
  <div class="foodcard-container">
    <div class="foodcard-img-wrapper">
      <img :src="food.image_url || '/images/default-food.jpg'" alt="Food" class="foodcard-img" />
    </div>
    <div class="foodcard-info">
      <h4>{{ food.name }}</h4>
      <p>{{ food.description }}</p>
      <p>Đơn vị: {{ food.unit }}</p>
      <p>Loại món: {{ food.food_type && food.food_type.name ? food.food_type.name : 'Chưa xác định' }}</p>
      <p>Nhà hàng: {{ food.restaurant && food.restaurant.name ? food.restaurant.name : 'Chưa xác định' }}</p>


      <button :class="food.selected ? 'foodcard-btn-selected' : 'foodcard-btn-select'" @click="$emit('select', food)">
        {{ food.selected ? "ĐÃ CHỌN" : "CHỌN" }}
      </button>
    </div>
  </div>
</template>

<script>
export default { name: "FoodCard", props: { food: Object } };
</script>

<style src="../../assets/css/foodcard.css"></style>
