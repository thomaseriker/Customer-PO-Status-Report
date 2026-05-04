const fs = require('fs/promises');
const path = require('path');
const ExcelJS = require('exceljs');
const { ALL_COLUMNS } = require('../domain/reportColumns');
const config = require('../config');

function formatDateLabel(d) {
  return d.toISOString().slice(0, 10);
}

async function buildExcelReport({ subscription, rows, reportDate = new Date() }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('PO Status');

  const generatedAt = new Date();

  sheet.getCell('A1').value = 'Customer PO Status Report';
  sheet.getCell('A2').value = 'Customer';
  sheet.getCell('B2').value = subscription.name || subscription.id;
  sheet.getCell('A3').value = 'Report Date';
  sheet.getCell('B3').value = formatDateLabel(reportDate);
  sheet.getCell('A4').value = 'Generated Timestamp';
  sheet.getCell('B4').value = generatedAt.toISOString();

  const headerRowIndex = 6;
  const headerRow = sheet.getRow(headerRowIndex);
  headerRow.values = [null, ...ALL_COLUMNS];
  headerRow.font = { bold: true };

  let rowIndex = headerRowIndex + 1;
  for (const row of rows) {
    const values = [
      row.customerGroup || '',
      row.customerPoNumber || '',
      row.customerMaterialNumber || '',
      row.requestedDeliveryDate || '',
      row.shipDate || '',
      row.originalQuantity ?? '',
      row.quantityDifference ?? '',
      row.unitOfMeasure || '',
      row.shipQuantity ?? '',
      row.salesOrder || '',
      row.pgMaterial || '',
      row.plantOrShipFrom || '',
      row.cutReason || '',
      row.poLineIdentifier || '',
      row.lifecycleStatus || '',
      row.lastUpdatedTimestamp || '',
      row.sourceFreshnessTimestamp || '',
      row.manualOverrideFields || '',
      row.manualOverrideNotes || '',
    ];

    sheet.getRow(rowIndex).values = [null, ...values];
    rowIndex += 1;
  }

  sheet.columns.forEach((column, idx) => {
    if (idx === 0) return;
    column.width = 24;
  });

  await fs.mkdir(config.outputDir, { recursive: true });
  const filename = `po-status-${subscription.id}-${generatedAt.toISOString().replace(/[:.]/g, '-')}.xlsx`;
  const filePath = path.join(config.outputDir, filename);
  await workbook.xlsx.writeFile(filePath);

  return {
    filePath,
    generatedAt: generatedAt.toISOString(),
    reportDate: formatDateLabel(reportDate),
    rowCount: rows.length,
  };
}

module.exports = {
  buildExcelReport,
};
