import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    clerkOrganizationId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    createdByUserId: { type: String, required: true },
  },
  { timestamps: true }
);

const Organization =
  mongoose.models.Organization ||
  mongoose.model('Organization', organizationSchema);

export default Organization;
