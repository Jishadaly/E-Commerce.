
const orderModal = require('../model/orderModel');
const User = require('../model/userModal');
const PDFDocument = require('pdfkit');
const orderModel = require('../model/orderModel');



const loadReportPage = async (req, res) => {
  try {

    console.log("Received query status:", req.query.status);
    
    const admin = req.session.admin;
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    let query = { status: "Delivered" };
    if (req.query.status) {
      console.log("Handling 'Daily' status...");

      const currentDate = new Date();
      console.log("Current date:", currentDate);
      if (req.query.status === "Daily") {
        const startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        );
        const endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 1
        );
        query.createdAt = { $gte: startDate, $lt: endDate };
      } else if (req.query.status === "Weekly") {
        const startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - currentDate.getDay()
        );
        const endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + (6 - currentDate.getDay()) + 1
        );
        query.createdAt = { $gte: startDate, $lt: endDate };
      } else if (req.query.status === "Yearly") {
        const startDate = new Date(currentDate.getFullYear(), 0, 1);
        const endDate = new Date(currentDate.getFullYear() + 1, 0, 1);
        query.createdAt = { $gte: startDate, $lt: endDate };
      }
    }

    console.log("Before conditional block");

    if (req.query.startDate && req.query.endDate) {
      console.log("Start Date:", req.query.startDate);
      console.log("End Date:", req.query.endDate);
    
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
      console.log("Query Order Date:", query.createdAt);
    }
    

    const totalOrdersCount = await orderModel.countDocuments(query);
    const totalPages = Math.ceil(totalOrdersCount / perPage);
    const skip = (page - 1) * perPage;

    const orders = await orderModel
      .find(query)
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "products.product",
        model: "Product",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

      const totalRevenue = orders.reduce((acc, order) => acc + orders.grandTotal, 0);
      const totalSales = orders.length;
      
  
      
    res.render("report", {
      orders,
      admin,
      totalRevenue,
      totalPages,
      currentPage: page,
      totalSales,
     
      
    });

  } catch (error) {
    console.log(error.message);
   
  }
};




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





const getDeliveredOrdersData = async () => {
  try {
    const deliveredMonthly = await Order.aggregate([
      {
        $match: { status: 'Delivered' } 
      },
      {
        $group: {
          _id: { $month: '$createdAt' }, 
          count: { $sum: 1 } 
        }
      }
    ]);

    const deliveredYearly = await Order.aggregate([
      {
        $match: { status: 'Delivered' } 
      },
      {
        $group: {
          _id: { $year: '$createdAt' }, 
          count: { $sum: 1 } 
        }
      }
    ]);

   
    const deliveredWeekly = await Order.aggregate([
      {
        $match: { status: 'Delivered' } 
        
      }
    ]);

    return { deliveredMonthly, deliveredYearly, deliveredWeekly };
  } catch (error) {
    console.error(error);
    throw error;
  }
};




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

function generateHr(doc, y) {
  doc.strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

// Function to generate a table row in PDF
function generateTableRow(doc, y, orderId, productName, quantity, price, paymentMethod, status, createdAt, grandTotal) {
  const date = new Date(createdAt);

  doc.fontSize(10)
    .text(orderId.toString(), 50, y)
    .text(productName || '-', 150, y)
    .text(quantity.toString(), 270, y, { width: 50, align: 'right' })
    .text(price.toString(), 350, y, { width: 80, align: 'right' })
    .text(paymentMethod || '-', 460, y)
    .text(status || '-', 540, y)
    .text(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`, 620, y)
    .text(grandTotal.toString(), 700, y, { width: 80, align: 'right' });

  return y + 20; // Increment y position for the next row
}
async function getSalesReport(req, res) {
  try {
    const orders = await orderModal
      .find()
      .populate('products.product')
      .populate('user')
      .populate('address')
      .sort({ createdAt: 'desc' });

    const doc = new PDFDocument();
    const fileName = `Sales-Report-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    const header = ['Order ID', 'Product Name', 'Quantity', 'Price', 'Payment Method', 'Status', 'Created At', 'Grand Total'];
    const rowsPerPage = 50; // Number of rows per page
    let currentRow = 0;
    let hasContent = false;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];

      if (order.products && Array.isArray(order.products) && order.products.length > 0) {
        for (let j = 0; j < order.products.length; j++) {
          const product = order.products[j];

          if (product.product && product.quantity && product.price) {
            const data = [
              order._id ? order._id.toString().substring(0, 15) : '-',
              product.product.name || '-',
              product.quantity.toString() || '-',
              product.price.toString() || '-',
              order.paymentMethod || '-',
              order.status || '-',
              order.createdAt ? order.createdAt.toString() : '-',
              order.grandTotal ? order.grandTotal.toString() : '-'
            ];

            if (currentRow >= rowsPerPage) {
              doc.addPage();
              doc.fontSize(20).text('Sales Report', { align: 'center' }).moveDown();
              doc.fontSize(12).font('Helvetica-Bold');
              generateTableRow(doc, doc.y, ...header);
              currentRow = 0;
              hasContent = false;
            }

            generateTableRow(doc, doc.y + 20, ...data);
            currentRow++;
            hasContent = true;
          }
        }
      }
    }

    if (!hasContent) {
      doc.addPage();
      doc.fontSize(20).text('Sales Report', { align: 'center' }).moveDown();
      doc.fontSize(12).font('Helvetica-Bold');
      generateTableRow(doc, doc.y, ...header);
    }

    doc.end(); // End the document
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating the sales report');
  }
}


module.exports = {
  loadReportPage,
  monthlyRevenue,
  weeklyRevenue,
  yearlyRevenue,
  // monthlySales,
  // weeklySales,
  // yearlySales,
  userCounts,
  getSalesReport,
  getDeliveredOrdersData
  // monthlyDeliveredProducts

};
