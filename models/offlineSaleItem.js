const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offlineSaleItemSchema = new Schema({
  saleId: {
    type: Schema.Types.ObjectId,
    ref: 'OfflineSale',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  company: String,
  category: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  sellingPriceSnapshot: {
    type: Number,
    required: true,
    min: 0
  },
  costPriceSnapshot: {
    type: Number,
    required: true,
    min: 0
  },
  revenue: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  profit: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

offlineSaleItemSchema.index({ saleId: 1 });
offlineSaleItemSchema.index({ productId: 1 });

module.exports = mongoose.model('OfflineSaleItem', offlineSaleItemSchema);
