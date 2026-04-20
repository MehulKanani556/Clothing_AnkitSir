import mongoose from "mongoose";

export const UserAddressSchema = new mongoose.Schema({
  firstName: { type: String, trim: true, default: null },
  lastName: { type: String, trim: true, default: null },
  country: { type: String, default: null },
  address: { type: String, default: null },
  aptSuite: { type: String, default: null },
  city: { type: String, default: null },
  state: { type: String, default: null },
  zipcode: { type: String, default: null },
  addressType: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' },
  phone: { type: String, trim: true, default: null },
});

const UserSchema = new mongoose.Schema({
  firstName: { type: String, default: null, trim: true },
  lastName: { type: String, default: null, trim: true },
  mobileNo: {
    type: String,
    required: true,
    unique: true,
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: null,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
  fcmToken: {
    type: String,
    default: null
  },
  password: { type: String, select: false },
  address: [UserAddressSchema],
  savedCards: [
    {
      cardNumber: { type: String, required: true },
      cardHolderName: { type: String, required: true },
      expiryDate: { type: String, required: true },
      cvv: { type: String, required: true },
      cardType: { type: String, default: "Card" },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  selectedAddress: { type: mongoose.Schema.Types.ObjectId, default: null },
  selectedCard: { type: mongoose.Schema.Types.ObjectId, default: null },
  otp: { type: Number, default: null },
  avatar: { type: String, default: null },
  resetOtpExpiry: { type: Date, default: null },
  verified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  notificationPreferences: {
    orderUpdates: { type: Boolean, default: true },
    deliveryUpdates: { type: Boolean, default: true },
    paymentAlerts: { type: Boolean, default: true },
    accountActivity: { type: Boolean, default: true },
  },
  refreshToken: {
    type: String,
    default: null,
  },
  sessions: [
    {
      deviceId: String,
      browser: String,
      os: String,
      deviceType: { type: String, default: 'Web' },
      ip: String,
      lastActive: { type: Date, default: Date.now },
      tokenHash: String, // Identification for revocation
      isCurrent: { type: Boolean, default: false }
    }
  ],
  recentlyViewed: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      viewedAt: { type: Date, default: Date.now },
    },
  ],
  isUserDeleted: {
    type: Boolean,
    default: false
  },
  reasonForDeletion: {
    type: String,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletionOtpVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const UserModel = mongoose.model("user", UserSchema);
export default UserModel;