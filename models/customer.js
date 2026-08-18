const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

customerSchema.index({ ownerId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
