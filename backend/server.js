const express = require('express');
const cors = require('cors');
require('dotenv').config();

const restaurantRoutes = require('./routes/restaurants');
const reviewRoutes = require('./routes/reviews');
const { readJsonFile } = require('./utils/fileManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🍜 Restaurant Review API',
    version: '1.0.0',
    endpoints: {
      restaurants: '/api/restaurants',
      reviews: '/api/reviews',
      stats: '/api/stats'
    }
  });
});

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/stats', async (req, res) => {
  try {
    // อ่านไฟล์ JSON
    const restaurants = await readJsonFile('restaurants.json');
    const reviews = await readJsonFile('reviews.json');

    // จำนวนร้านอาหารทั้งหมด
    const totalRestaurants = restaurants.length;

    // จำนวนรีวิวทั้งหมด
    const totalReviews = reviews.length;

    // สร้าง map สำหรับรวมคะแนนแต่ละร้าน
    const restaurantRatings = restaurants.map((restaurant) => {
      // หารีวิวของร้านนี้
      const restaurantReviews = reviews.filter(
        (review) => review.restaurantId === restaurant.id
      );
      // คำนวณคะแนนเฉลี่ย
      const averageRating =
        restaurantReviews.length > 0
          ? restaurantReviews.reduce((sum, r) => sum + r.rating, 0) /
          restaurantReviews.length
          : 0;
      return { ...restaurant, averageRating };
    });

    // คะแนนเฉลี่ยของร้านทั้งหมด
    const totalRatingSum = restaurantRatings.reduce(
      (sum, r) => sum + r.averageRating,
      0
    );
    const averageRating =
      totalRestaurants > 0
        ? parseFloat((totalRatingSum / totalRestaurants).toFixed(1))
        : 0;

    // top 5 ร้านอาหารตามคะแนนเฉลี่ย
    const topRatedRestaurants = restaurantRatings
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalRestaurants,
        totalReviews,
        averageRating,
        topRatedRestaurants
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ'
    });
  }
});


app.get('/api/stats', async (req, res) => {
  try {
    // TODO: เขียนโค้ดที่นี่

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ'
    });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});