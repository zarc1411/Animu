const { Schema, model } = require('mongoose');

const inventorySchema = new Schema({
  memberID: {
    type: String,
    unique: true,
  },
  coins: Number,
  inventory: [String],
  checkedIn: Boolean,
});

inventorySchema.methods.addCoins = async function(amount) {
  this.coins += amount;

  this.save();
  return true;
};

inventorySchema.methods.deductCoins = async function(amount) {
  this.coins -= amount;

  this.save();
  return true;
};

inventorySchema.methods.checkIn = async function() {
  this.coins += 50;
  this.checkedIn = true;

  this.save();
  return true;
};

model('Inventory', inventorySchema);
