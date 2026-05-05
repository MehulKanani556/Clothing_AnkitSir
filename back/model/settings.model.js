import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    general: {
        storeName: { type: String, default: 'EO Studio' },
        storeEmail: { type: String, default: 'support@eostudio.com' },
        storePhone: { type: String, default: '+61 2 9876 5432' },
        currency: { type: String, default: 'AUD' },
        timeZone: { type: String, default: 'Australia/Sydney' },
    },
    email: {
        smtpHost: { type: String },
        smtpPort: { type: Number },
        smtpUser: { type: String },
        smtpPass: { type: String },
        fromEmail: { type: String },
        fromName: { type: String },
    },
    payment: {
        stripePublicKey: { type: String },
        stripeSecretKey: { type: String },
        paypalClientId: { type: String },
        isStripeEnabled: { type: Boolean, default: true },
        isPaypalEnabled: { type: Boolean, default: false },
    },
    shipping: {
        flatRate: { type: Number, default: 25 },
        freeShippingThreshold: { type: Number, default: 200 },
        isInternationalShippingEnabled: { type: Boolean, default: false },
    },
    notifications: {
        orderConfirmation: { type: Boolean, default: true },
        shippingUpdate: { type: Boolean, default: true },
        lowStockAlert: { type: Boolean, default: true },
        stockThreshold: { type: Number, default: 5 },
    }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
