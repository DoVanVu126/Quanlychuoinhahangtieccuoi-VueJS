<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <!-- Card stats -->
      <b-row>
        <!-- Tổng đơn đặt tiệc -->
        <b-col xl="3" md="6">
          <stats-card 
            title="Tổng đơn đặt tiệc"
            type="gradient-red"
            :sub-title="String(stats.totalBookings)"
            icon="ni ni-calendar-grid-58"
            class="mb-4">
            <template slot="footer">
              <span :class="stats.bookingGrowth >= 0 ? 'text-success' : 'text-danger'" class="mr-2">
                {{ stats.bookingGrowth >= 0 ? '+' : '' }}{{ stats.bookingGrowth }}%
              </span>
              <span class="text-nowrap">So với tháng trước</span>
            </template>
          </stats-card>
        </b-col>

        <!-- Doanh thu -->
        <b-col xl="3" md="6">
          <stats-card 
            title="Tổng doanh thu"
            type="gradient-orange"
            :sub-title="formatCurrency(stats.totalRevenue)"
            icon="ni ni-money-coins"
            class="mb-4">
            <template slot="footer">
              <span :class="stats.revenueGrowth >= 0 ? 'text-success' : 'text-danger'" class="mr-2">
                {{ stats.revenueGrowth >= 0 ? '+' : '' }}{{ stats.revenueGrowth }}%
              </span>
              <span class="text-nowrap">So với tháng trước</span>
            </template>
          </stats-card>
        </b-col>

        <!-- Khách hàng mới -->
        <b-col xl="3" md="6">
          <stats-card 
            title="Khách hàng mới"
            type="gradient-green"
            :sub-title="String(stats.newCustomers)"
            icon="ni ni-single-02"
            class="mb-4">
            <template slot="footer">
              <span class="text-success mr-2">+{{ stats.newCustomers }}</span>
              <span class="text-nowrap">Trong tháng này</span>
            </template>
          </stats-card>
        </b-col>

        <!-- Đơn chờ duyệt -->
        <b-col xl="3" md="6">
          <stats-card 
            title="Đơn chờ duyệt"
            type="gradient-info"
            :sub-title="String(stats.pendingBookings)"
            icon="ni ni-time-alarm"
            class="mb-4">
            <template slot="footer">
              <span class="text-warning mr-2">{{ stats.pendingBookings }}</span>
              <span class="text-nowrap">Cần xử lý</span>
            </template>
          </stats-card>
        </b-col>
      </b-row>
    </base-header>

    <!--Charts-->
    <b-container fluid class="mt--7">
      <b-row>
        <!-- Biểu đồ doanh thu -->
        <b-col xl="8" class="mb-5 mb-xl-0">
          <card type="default" header-classes="bg-transparent">
            <b-row align-v="center" slot="header">
              <b-col>
                <h6 class="text-light text-uppercase ls-1 mb-1">Tổng quan</h6>
                <h5 class="h3 text-white mb-0">Doanh thu theo tháng</h5>
              </b-col>
            </b-row>
            <line-chart
              :height="350"
              ref="bigChart"
              :chart-data="revenueChart.chartData"
              :extra-options="revenueChart.extraOptions"
            >
            </line-chart>
          </card>
        </b-col>

        <!-- Biểu đồ trạng thái đơn -->
        <b-col xl="4" class="mb-5 mb-xl-0">
          <card header-classes="bg-transparent">
            <b-row align-v="center" slot="header">
              <b-col>
                <h6 class="text-uppercase text-muted ls-1 mb-1">Trạng thái</h6>
                <h5 class="h3 mb-0">Đơn đặt tiệc</h5>
              </b-col>
            </b-row>

            <bar-chart
              :height="350"
              ref="barChart"
              :chart-data="statusChart.chartData"
            >
            </bar-chart>
          </card>
        </b-col>
      </b-row>

      <!--Tables-->
      <b-row class="mt-5">
        <!-- Đơn đặt tiệc gần đây -->
        <b-col xl="8" class="mb-5 mb-xl-0">
          <card header-classes="bg-transparent">
            <h3 slot="header" class="mb-0">Đơn đặt tiệc gần đây</h3>
            
            <b-table
              :items="recentBookings"
              :fields="bookingFields"
              responsive
              hover
              show-empty
              empty-text="Chưa có dữ liệu"
            >
              <template #cell(status)="data">
                <b-badge :variant="getStatusVariant(data.value)">
                  {{ getStatusText(data.value) }}
                </b-badge>
              </template>
              
              <template #cell(price)="data">
                {{ formatCurrency(data.value) }}
              </template>
            </b-table>
          </card>
        </b-col>

        <!-- Top nhà hàng -->
        <b-col xl="4" class="mb-5 mb-xl-0">
          <card header-classes="bg-transparent">
            <h3 slot="header" class="mb-0">Nhà hàng phổ biến</h3>
            
            <b-list-group flush>
              <b-list-group-item 
                v-for="restaurant in topRestaurants" 
                :key="restaurant.id"
                class="px-0">
                <b-row align-v="center">
                  <b-col>
                    <h5 class="mb-0">{{ restaurant.name }}</h5>
                  </b-col>
                  <b-col cols="auto">
                    <b-badge variant="primary">{{ restaurant.bookings }} đơn</b-badge>
                  </b-col>
                </b-row>
              </b-list-group-item>
            </b-list-group>
          </card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import api from '@/api';
import * as chartConfigs from '@/components/Charts/config';
import LineChart from '@/components/Charts/LineChart';
import BarChart from '@/components/Charts/BarChart';
import StatsCard from '@/components/Cards/StatsCard';

export default {
  components: {
    LineChart,
    BarChart,
    StatsCard
  },
  data() {
    return {
      stats: {
        totalBookings: 0,
        totalRevenue: 0,
        newCustomers: 0,
        pendingBookings: 0,
        bookingGrowth: 0,
        revenueGrowth: 0
      },
      revenueChart: {
        chartData: {
          datasets: [{
            label: 'Doanh thu (triệu đồng)',
            data: []
          }],
          labels: []
        },
        extraOptions: chartConfigs.blueChartOptions
      },
      statusChart: {
        chartData: {
          labels: ['Chờ duyệt', 'Đã xác nhận', 'Hoàn thành', 'Đã hủy'],
          datasets: [{
            label: 'Số lượng',
            data: []
          }]
        }
      },
      recentBookings: [],
      bookingFields: [
        { key: 'booking_id', label: 'Mã', class: 'text-center' },
        { key: 'customer_name', label: 'Khách hàng' },
        { key: 'hall_name', label: 'Sảnh' },
        { key: 'event_date', label: 'Ngày', formatter: this.formatDate },
        { key: 'price', label: 'Giá trị' },
        { key: 'status', label: 'Trạng thái', class: 'text-center' }
      ],
      topRestaurants: []
    };
  },
  methods: {
    formatCurrency(value) {
      if (!value) return '0 đ';
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      }).format(value);
    },
    
    formatDate(value) {
      if (!value) return '';
      return new Date(value).toLocaleDateString('vi-VN');
    },
    
    getStatusVariant(status) {
      const variants = {
        'pending': 'warning',
        'confirmed': 'success',
        'completed': 'primary',
        'cancelled': 'danger'
      };
      return variants[status] || 'secondary';
    },
    
    getStatusText(status) {
      const texts = {
        'pending': 'Chờ duyệt',
        'confirmed': 'Đã xác nhận',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
      };
      return texts[status] || status;
    },
    
    async fetchDashboardStats() {
      try {
        // ⚠️ API này cần tạo trong backend
        const response = await api.get('/api/dashboard/statistics');
        
        this.stats = response.data.stats;
        
        // Update revenue chart
        this.revenueChart.chartData = {
          datasets: [{
            label: 'Doanh thu (triệu đồng)',
            data: response.data.revenueByMonth.map(r => r.revenue / 1000000)
          }],
          labels: response.data.revenueByMonth.map(r => r.month)
        };
        
        // Update status chart
        this.statusChart.chartData.datasets[0].data = [
          response.data.bookingsByStatus.pending || 0,
          response.data.bookingsByStatus.confirmed || 0,
          response.data.bookingsByStatus.completed || 0,
          response.data.bookingsByStatus.cancelled || 0
        ];
        
        this.recentBookings = response.data.recentBookings;
        this.topRestaurants = response.data.topRestaurants;
        
      } catch (error) {
        console.error('Lỗi tải thống kê:', error);
        // Dùng dữ liệu mẫu nếu API chưa có
        this.loadMockData();
      }
    },
    
    loadMockData() {
      // Dữ liệu mẫu để test UI
      this.stats = {
        totalBookings: 248,
        totalRevenue: 3500000000,
        newCustomers: 42,
        pendingBookings: 15,
        bookingGrowth: 12.5,
        revenueGrowth: 8.3
      };
      
      this.revenueChart.chartData = {
        datasets: [{
          label: 'Doanh thu (triệu đồng)',
          data: [120, 150, 180, 200, 190, 220, 250, 280, 300, 320, 340, 350]
        }],
        labels: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']
      };
      
      this.statusChart.chartData.datasets[0].data = [15, 89, 124, 20];
      
      this.recentBookings = [
        { booking_id: 101, customer_name: 'Nguyễn Văn A', hall_name: 'Sảnh VIP 1', event_date: '2025-12-15', price: 150000000, status: 'confirmed' },
        { booking_id: 102, customer_name: 'Trần Thị B', hall_name: 'Sảnh 2', event_date: '2025-12-20', price: 80000000, status: 'pending' },
        { booking_id: 103, customer_name: 'Lê Văn C', hall_name: 'Sảnh VIP 2', event_date: '2025-12-25', price: 200000000, status: 'confirmed' }
      ];
      
      this.topRestaurants = [
        { id: 1, name: 'Nhà hàng Tiệc Cưới ABC', bookings: 45 },
        { id: 2, name: 'Trung tâm Hội nghị XYZ', bookings: 38 },
        { id: 3, name: 'Khách sạn Sunrise', bookings: 32 }
      ];
    }
  },
  mounted() {
    this.fetchDashboardStats();
  }
};
</script>

<style scoped>
.el-table .cell {
  padding-left: 0px;
  padding-right: 0px;
}
</style>