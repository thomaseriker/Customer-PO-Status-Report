const fs = require('fs/promises');
const path = require('path');
const ExcelJS = require('exceljs');
const { ALL_COLUMNS } = require('../domain/reportColumns');
const config = require('../config');

function formatDateLabel(d) {
  return d.toISOString().slice(0, 10);
}

function parseDateValue(value) {
  if (!value || typeof value !== 'string') return value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? value : parsed;
}

function parseDateTimeValue(value) {
  if (!value || typeof value !== 'string') return value;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed;
}

function parseNumericValue(value) {
  if (value == null || value === '') return '';

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : '';
  }

  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  }

  return value;
}

function applyHeaderStyling(sheet) {
  sheet.mergeCells('A1:B1');
  const titleCell = sheet.getCell('A1');
  titleCell.font = {
    name: 'Calibri',
    size: 16,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' },
  };

  const infoRows = [2, 3, 4];
  for (const rowIndex of infoRows) {
    const labelCell = sheet.getCell(`A${rowIndex}`);
    const valueCell = sheet.getCell(`B${rowIndex}`);

    labelCell.font = { bold: true, color: { argb: 'FF1F4E78' } };
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    };

    valueCell.font = { bold: true, color: { argb: 'FF1F4E78' } };
    valueCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEAF0FA' },
    };

    for (const cell of [labelCell, valueCell]) {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFB4C6E7' } },
        left: { style: 'thin', color: { argb: 'FFB4C6E7' } },
        bottom: { style: 'thin', color: { argb: 'FFB4C6E7' } },
        right: { style: 'thin', color: { argb: 'FFB4C6E7' } },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    }
  }
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
  applyHeaderStyling(sheet);

  const headerRowIndex = 6;
  const headerRow = sheet.getRow(headerRowIndex);
  headerRow.values = [null, ...ALL_COLUMNS];
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2F5597' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.height = 24;

  for (let col = 1; col <= ALL_COLUMNS.length; col += 1) {
    const cell = headerRow.getCell(col + 1);
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDEEAF6' } },
      left: { style: 'thin', color: { argb: 'FFDEEAF6' } },
      bottom: { style: 'thin', color: { argb: 'FFDEEAF6' } },
      right: { style: 'thin', color: { argb: 'FFDEEAF6' } },
    };
  }

  let rowIndex = headerRowIndex + 1;
  for (const row of rows) {
    const values = [
      row.customerGroup || '',
      row.customerPoNumber || '',
      row.customerMaterialNumber || '',
      parseDateValue(row.requestedDeliveryDate || ''),
      parseDateValue(row.shipDate || ''),
      parseNumericValue(row.originalQuantity),
      parseNumericValue(row.quantityDifference),
      row.unitOfMeasure || '',
      parseNumericValue(row.shipQuantity),
      row.salesOrder || '',
      row.pgMaterial || '',
      row.plantOrShipFrom || '',
      row.cutReason || '',
      row.poLineIdentifier || '',
      row.lifecycleStatus || '',
      parseDateTimeValue(row.lastUpdatedTimestamp || ''),
      parseDateTimeValue(row.sourceFreshnessTimestamp || ''),
      row.manualOverrideFields || '',
      row.manualOverrideNotes || '',
    ];

    const excelRow = sheet.getRow(rowIndex);
    excelRow.values = [null, ...values];

    const isStripedRow = (rowIndex - (headerRowIndex + 1)) % 2 === 1;
    for (let col = 1; col <= ALL_COLUMNS.length; col += 1) {
      const cell = excelRow.getCell(col + 1);

      if (isStripedRow) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFD' },
        };
      }

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE1E6EF' } },
        left: { style: 'thin', color: { argb: 'FFE1E6EF' } },
        bottom: { style: 'thin', color: { argb: 'FFE1E6EF' } },
        right: { style: 'thin', color: { argb: 'FFE1E6EF' } },
      };

      if (col === 7 && typeof cell.value === 'number' && cell.value < 0) {
        cell.font = { color: { argb: 'FF9C0006' }, bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE5E5' },
        };
      }

      if ([6, 7, 9].includes(col)) {
        cell.numFmt = '#,##0.##';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else if ([4, 5].includes(col) && cell.value instanceof Date) {
        cell.numFmt = 'yyyy-mm-dd';
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if ([16, 17].includes(col) && cell.value instanceof Date) {
        cell.numFmt = 'yyyy-mm-dd hh:mm:ss';
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    }

    rowIndex += 1;
  }

  sheet.views = [{ state: 'frozen', xSplit: 1, ySplit: headerRowIndex }];

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
