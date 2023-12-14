// const fs = require('fs');
// const PDFDocument = require('pdfkit');


// function generateHeader(doc) {
// 	doc.image('logo.png', 50, 45, { width: 50 })
// 		.fillColor('#444444')
// 		.fontSize(20)
// 		.text('ACME Inc.', 110, 57)
// 		.fontSize(10)
// 		.text('123 Main Street', 200, 65, { align: 'right' })
// 		.text('New York, NY, 10025', 200, 80, { align: 'right' })
// 		.moveDown();
// }

// function generateFooter(doc) {
// 	doc.fontSize(
// 		10,
// 	).text(
// 		'Payment is due within 15 days. Thank you for your business.',
// 		50,
// 		780,
// 		{ align: 'center', width: 500 },
// 	);
// }



// function createInvoice(invoice,path) {
   
//   let doc = new PDFDocument({ margin: 50 });

// 	generateHeader(); // Invoke `generateHeader` function.
// 	generateFooter(); // Invoke `generateFooter` function.

// 	doc.end();
// 	doc.pipe(fs.createWriteStream(path));
   
// }



// module.exports =  createInvoice ;


const fs = require('fs');
const PDFDocument = require('pdfkit');

function generateHeader(doc) {
  doc.image('logo.png', 50, 45, { width: 50 })
    .fillColor('#444444')
    .fontSize(20)
    .text('ACME Inc.', 110, 57)
    .fontSize(10)
    .text('123 Main Street', 200, 65, { align: 'right' })
    .text('New York, NY, 10025', 200, 80, { align: 'right' })
    .moveDown();
}

function generateFooter(doc) {
  doc.fontSize(10)
    .text('Payment is due within 15 days. Thank you for your business.', 50, 780, { align: 'center', width: 500 });
}

function createInvoice(invoice, path) {
  let doc = new PDFDocument({ margin: 50 });

  generateHeader(doc); // Pass the `doc` object to generateHeader function
  generateFooter(doc); // Pass the `doc` object to generateFooter function

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

module.exports = createInvoice;
