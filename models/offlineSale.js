const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offlineSaleSchema = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  customerAddress: String,
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCost: {
    type: Number,
    default: 0,
    min: 0
  },
  totalProfit: {
    type: Number,
    default: 0,
    min: 0
  },
  itemsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    default: 'cash'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

offlineSaleSchema.index({ ownerId: 1, createdAt: -1 });
offlineSaleSchema.index({ customerId: 1 });

module.exports = mongoose.model('OfflineSale', offlineSaleSchema);
