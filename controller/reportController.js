const orderModal = require('../model/orderModel');
const productModal = require('../model/productModal');
const User = require('../model/userModal');

async function loadReportPage(req, res) {
  try {

    const orderData = await orderModal.find()
    .populate('address')
    .sort({ createdAt: -1 })
    .limit(10);
    res.render('report',{ orderData });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
}

async function monthlyRevenue(req, res) {
  try {
    const monthlyRevenueData = await orderModal.aggregate([
      {
        $match: { status: 'Delivered' } // Fetch revenue for orders with 'Delivered' status
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalRevenue: { $sum: '$grandTotal' },
        },
      },
    ]);
    res.json(monthlyRevenueData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function weeklyRevenue(req, res) {
  try {
    const weeklyRevenueData = await orderModal.aggregate([
      {
        $match: { status: 'Delivered' } // Fetch revenue for orders with 'Delivered' status
      },
      {
        $group: {
          _id: { $week: '$createdAt' },
          totalRevenue: { $sum: '$grandTotal' },
        },
      },
    ]);
    res.json(weeklyRevenueData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function yearlyRevenue(req, res) {
  try {
    const yearlyRevenueData = await orderModal.aggregate([
      {
        $match: { status: 'Delivered' } // Fetch revenue for orders with 'Delivered' status
      },
      {
        $group: {
          _id: { $year: '$createdAt' },
          totalRevenue: { $sum: '$grandTotal' },
        },
      },
    ]);
    res.json(yearlyRevenueData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}




async function getSalesCountByInterval(req, res, interval) {
  try {
    let aggregationPipeline = [];

    switch (interval) {
      case 'monthly':
        aggregationPipeline = [
          {
            $group: {
              _id: { $month: '$orderDate' }, // Group by month
              orders: { $sum: '$orders' } // Calculate total sales count
            }
          }
        ];
        break;
      case 'weekly':
        aggregationPipeline = [
          {
            $group: {
              _id: { $week: '$orderDate' }, // Group by week
              orders: { $sum: '$orders' } // Calculate total sales count
            }
          }
        ];
        break;
      case 'yearly':
        aggregationPipeline = [
          {
            $group: {
              _id: { $year: '$orderDate' }, // Group by year
              orders: { $sum: '$orders' } // Calculate total sales count
            }
          }
        ];
        break;
      default:
        return res.status(400).json({ message: 'Invalid interval' });
    }

    const salesCountData = await productModal.aggregate(aggregationPipeline);
    res.json(salesCountData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Endpoint for fetching monthly sales count
async function monthlySales(req, res) {
  return getSalesCountByInterval(req, res, 'monthly');
}

// Endpoint for fetching weekly sales count
async function weeklySales(req, res) {
  return getSalesCountByInterval(req, res, 'weekly');
}

// Endpoint for fetching yearly sales count
async function yearlySales(req, res) {
  return getSalesCountByInterval(req, res, 'yearly');
}


async function userCounts(req, res) {
  try {
    const interval = req.query.interval; // Get the interval parameter from the query string
    let aggregationOptions = [
      {
        $group: {
          _id: { $dateToString: { format: `%${interval}`, date: '$date' } }, // Group by the specified interval
          userCount: { $sum: 1 }, // Count the number of users
        },
      },
    ];

    // For 'yearly' interval, adjust the date format
    if (interval === 'yearly') {
      aggregationOptions = [
        {
          $group: {
            _id: { $year: '$date' }, // Group by year
            userCount: { $sum: 1 }, // Count the number of users
          },
        },
      ];
    }

    const userCounts = await User.aggregate(aggregationOptions);
    res.json(userCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}






module.exports = {
  loadReportPage,
  monthlyRevenue,
  weeklyRevenue,
  yearlyRevenue,
  monthlySales,
  weeklySales,
  yearlySales,
  userCounts
  
};
