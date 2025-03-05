import mongoose from 'mongoose';

const salesPersonSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true },
  name: { type: String, required: true },
});

export default mongoose.models.SalesPerson ||
  mongoose.model('SalesPerson', salesPersonSchema);
