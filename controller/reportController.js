const orderModal = require('../model/orderModel');
const productModal = require('../model/productModal');
const User = require('../model/userModal');

async function loadReportPage(req, res) {
  try {

    const orderData = await orderModal.find()
      .populate('address')
      .sort({ createdAt: -1 })
      .limit(10);
    res.render('report', { orderData });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
}

async function monthlyRevenue(req, res) {
  try {
    const monthlyRevenueData = await orderModal.aggregate([
      {
        $match: { status: 'Delivered' }
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
        $match: { status: 'Delivered' }
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
        $match: { status: 'Delivered' }
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
              _id: { $month: '$orderDate' },
              orders: { $sum: '$orders' }
            }
          }
        ];
        break;
      case 'weekly':
        aggregationPipeline = [
          {
            $group: {
              _id: { $week: '$orderDate' },
              orders: { $sum: '$orders' }
            }
          }
        ];
        break;
      case 'yearly':
        aggregationPipeline = [
          {
            $group: {
              _id: { $year: '$orderDate' },
              orders: { $sum: '$orders' }
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


async function monthlySales(req, res) {
  return getSalesCountByInterval(req, res, 'monthly');
}


async function weeklySales(req, res) {
  return getSalesCountByInterval(req, res, 'weekly');
}


async function yearlySales(req, res) {
  return getSalesCountByInterval(req, res, 'yearly');
}


async function userCounts(req, res) {
  try {
    const interval = req.query.interval;
    let aggregationOptions = [
      {
        $group: {
          _id: { $dateToString: { format: `%${interval}`, date: '$date' } },
          userCount: { $sum: 1 },
        },
      },
    ];


    if (interval === 'yearly') {
      aggregationOptions = [
        {
          $group: {
            _id: { $year: '$date' },
            userCount: { $sum: 1 },
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


// sales report

async function getSalesReport(req,res){

  try {
    console.log(req.body);
  } catch (error) {
    
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
  userCounts,
  getSalesReport

};
