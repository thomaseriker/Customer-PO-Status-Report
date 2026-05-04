const FIXED_MVP_COLUMNS = [
  'Customer Group',
  'Customer PO Number',
  'Customer Material Number',
  'Requested Delivery Date',
  'Ship Date',
  'Original Quantity',
  'Quantity Difference',
  'Unit of Measure',
  'Ship Quantity',
  'Sales Order',
  'P&G Material',
  'Plant or Ship From',
  'Cut Reason',
];

const ADDITIONAL_COLUMNS = [
  'PO Line Identifier',
  'Lifecycle Status',
  'Last Updated Timestamp',
  'Source Freshness Timestamp',
  'Manual Override Fields',
  'Manual Override Notes',
];

const ALL_COLUMNS = [...FIXED_MVP_COLUMNS, ...ADDITIONAL_COLUMNS];

module.exports = {
  FIXED_MVP_COLUMNS,
  ADDITIONAL_COLUMNS,
  ALL_COLUMNS,
};
