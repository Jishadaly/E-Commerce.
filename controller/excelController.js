const orderModal = require('../model/orderModel');
const ExcelJS = require('exceljs');
const fs = require("fs");
const path = require("path");

const getExcelSalesReport = async (req, res) => {
    try {
        const orders = await orderModal.find({status:"Delivered"})
        .populate('products.product')
        .populate('address');

    console.log("orders"+orders);         

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');
        let serialNumber = 1;

        worksheet.columns = [
            { header: 'Serial Number', key: 'Sno', width: 10 },
            { header: 'UserID', key: 'userId', width: 10 },
            { header: 'orderModal Date', key: 'orderDate', width: 15, style: { numFmt: 'yyyy-mm-dd' } },
            { header: 'Name', key: 'userName', width: 10 },
            { header: 'Product', key: 'productName', width: 25 },
            { header: 'Quantity', key: 'quantity', width: 5 },
            { header: 'Total Amount', key: 'totalAmount', width: 10 },
            { header: 'orderModal status', key: 'orderStatus', width: 10 },
            { header: 'Payment Method', key: 'paymentMethod', width: 10 },
            { header: 'Address', key: 'address', width: 55 },
        ];

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });

        orders.forEach((order) => {
            order.products.forEach((product) => {
                const fullAddress = `${order.address.street}, ${order.address.city}, ${order.address.country}, ${order.address.pincode}`;
                const salesData = {
                    Sno: serialNumber++,
                    userId: order.user._id,
                    orderDate: order.createdAt,
                    userName: order.address.name,
                    productName: product.product.name,
                    quantity: product.quantity,
                    totalAmount: order.grandTotal,
                    orderStatus: order.status,
                    paymentMethod: order.paymentMethod,
                    address: fullAddress,
                };
                console.log("/////////////////"+salesData);
                

                worksheet.addRow(salesData);
            });
        });

        const exportPath = path.resolve("public", "salesReport", "salesReport.xlsx");

        await workbook.xlsx.writeFile(exportPath);
        res.download(exportPath, 'sales_report.xlsx', (err) => {
            if (err) {
                res.status(500).send('Error sending the file');
            }
        });

        console.log("||||||||||||");
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error generating the report');
    }
};

module.exports = {
    getExcelSalesReport
};
