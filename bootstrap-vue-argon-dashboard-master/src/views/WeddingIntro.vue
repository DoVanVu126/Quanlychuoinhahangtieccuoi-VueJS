<template>
    <b-container class="py-5 text-center">

        <b-row>
            <b-col>
                <h1 class="mb-4 font-weight-bold">
                    Nhà Hàng Tiệc Cưới Wedding Palace
                </h1>

                <p class="lead mb-4">
                    Nơi mang đến không gian sang trọng, dịch vụ tận tâm và những khoảnh khắc
                    hoàn hảo cho ngày trọng đại của bạn.
                </p>
            </b-col>
        </b-row>

        <b-row class="justify-content-center mb-4">
            <b-col cols="12" md="8">
                <b-img src="/images/wedding-hall.jpg" alt="Wedding Hall" fluid rounded class="shadow"></b-img>
            </b-col>
        </b-row>

        <b-row class="mt-4">
            <b-col>
                <h3 class="mb-3">Dịch vụ nổi bật</h3>

                <ul class="list-unstyled" style="font-size: 1.1rem;">
                    <li>✨ Sảnh tiệc sang trọng – diện tích linh hoạt</li>
                    <li>✨ Thực đơn đa dạng – chuẩn chất lượng</li>
                    <li>✨ Trang trí chủ đề theo yêu cầu</li>
                    <li>✨ Hệ thống âm thanh – ánh sáng hiện đại</li>
                    <li>✨ Đội ngũ phục vụ chuyên nghiệp</li>
                </ul>

                <b-button variant="primary" size="lg" class="mt-3" to="/home">
                    Đặt tiệc ngay
                </b-button>

            </b-col>
        </b-row>

    </b-container>
</template>

<script>
export default {
    name: "WeddingIntro",
};
</script>

<style scoped>
h1 {
    font-size: 2.2rem;
}

ul li {
    margin-bottom: 8px;
}
</style>
