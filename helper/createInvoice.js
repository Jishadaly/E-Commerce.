function generateHr(doc, y) {
  doc.strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
}


function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + '/' + month + '/' + day;
}

function generateTableRow(doc, y, item, quantity, lineTotal) {
  const itemMaxWidth = 250;
  const itemFontSize = 10;

  const lines = doc
      .fontSize(itemFontSize)
      .text(item, 50, y, { width: itemMaxWidth, align: 'left', lineBreak: true });

  const itemHeight = lines.length * itemFontSize + 30;
  doc
      .text(quantity, 370, y, { width: 90, align: 'right' })
      .text(lineTotal, 0, y, { align: 'right' });

  const rowHeight = Math.max(itemHeight, 40);
  return rowHeight;
}

function generateTableRowSales(doc, y, item, quantity, userid, date, lineTotal) {
  const itemMaxWidth = 150;
  const itemFontSize = 6;

  const lines = doc
      .fontSize(itemFontSize)
      .text(item, 50, y, { width: itemMaxWidth, align: 'left', lineBreak: true });

  const itemHeight = lines.length * itemFontSize;

  doc
      .text(quantity, 150, y, { width: 90, align: 'right' })
      .text(userid, 250, y, { width: 90, align: 'right' })
      .text(date, 350, y, { width: 90, align: 'right' })
      .text(lineTotal, 0, y, { align: 'right' });

  const rowHeight = Math.max(itemHeight, 40);
  return rowHeight;
}


module.exports = {
  formatDate,
  generateHr,
  generateTableRow,
  generateTableRowSales
};