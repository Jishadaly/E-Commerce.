const { formatDate, generateHr, generateTableRow } = require('../helper/createInvoice');
const orderModal = require('../model/orderModel');
const PDFDocument = require('pdfkit');
const fs = require("fs");

const downloadInvoice = async (req, res) => {
    try {
        const id = req.query.orderId;
        const order = await orderModal.findById(id).populate('products.product').populate('address')

        const doc = new PDFDocument();
        const fileName = `Invoice-${id}.pdf`;

        // Set response headers to indicate PDF content and file name
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        doc.pipe(res);

        // Header Section
        doc.fillColor("#333333")
        .fontSize(20)
        .text('LapBook', 110, 57, { align: "right" });
    
    doc.fillColor("#444444")
        .fontSize(10)
        .text('Sm Street', { align: 'right' })
        .text('Malapuram,676306', { align: "right" });
    
    

        // Separator line
        // doc.strokeColor('#333333')
        //     .lineWidth()
        //     .moveTo(50, 100)
        //     .lineTo(550, 100)
        //     .stroke();

        // Invoice Information Section
        doc.fillColor("#444444")
            .fontSize(20)
            .text("Invoice", 50, 160);
             generateHr(doc, 185);

        const customerInformationTop = 200;
        const { address, products, couponCode, grandTotal } = order;

        doc.fontSize(10)
            .text("Invoice Number:", 50, customerInformationTop)
            .font("Helvetica-Bold")
            .text(order._id.toString(), 150, customerInformationTop)
            .font("Helvetica")
            .text("Invoice Date:", 50, customerInformationTop + 15)
            .text(formatDate(new Date()), 150, customerInformationTop + 15)
            .text("Total Amount (Rs):", 50, customerInformationTop + 30)
            .text(`Rs ${grandTotal}.00`, 150, customerInformationTop + 30)
            .font("Helvetica-Bold")
            .text(address.name, 300, customerInformationTop)
            .font("Helvetica")
            .text(address.houseName, 300, customerInformationTop + 15)
            .text(`${address.city}, ${address.country}, India`, 300, customerInformationTop + 30)
            .moveDown();

            


        // Invoice table with items
        const invoiceTableTop = 330;

        doc.font("Helvetica-Bold");
        generateTableRow(doc, invoiceTableTop, "Item", "Quantity", "Line Total");
        generateHr(doc, invoiceTableTop + 20);
        doc.font("Helvetica");

        let position = 0;
        for (let i = 0; i < products.length; i++) {
            position = invoiceTableTop + (i + 1) * 30;
            generateTableRow(
                doc,
                position,
                products[i].product.name,
                products[i].quantity.toString(),
                `Rs ${products[i].product.discountPrice}`
            );
        }

        generateHr(doc, position + 20);

        // Pricing details
        const totalPricePosition = position + 40;
        const totalWithDiscountPosition = totalPricePosition + 60;

        doc.font("Helvetica")
            .text("Total Amount (Rs) + shipping charges:", 50, totalPricePosition)
            .text(`Rs ${grandTotal}.00`, 250, totalPricePosition)
            .text("Coupon Code:", 50, totalPricePosition + 15)
            // .text(couponCode, 250, totalPricePosition + 15)
            .text("Coupon Discount (Rs):", 50, totalPricePosition + 30)
            .text(`Rs `, 250, totalPricePosition + 30);

        doc.font("Helvetica-Bold")
            .text("Total + shipping charges:", 50, totalWithDiscountPosition)
            .text(`Rs ${grandTotal}.00`, 250, totalWithDiscountPosition);

        doc.end(); // End the document and send the response
    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating the invoice');
    }
};

module.exports = {
    downloadInvoice
};
