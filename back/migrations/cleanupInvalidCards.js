import mongoose from 'mongoose';
import UserModel from '../model/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration Script: Clean up invalid saved cards
 * 
 * This script removes saved cards that are missing required fields:
 * - last4
 * - brand
 * - expiryMonth
 * - expiryYear
 * 
 * Run this script with: node back/migrations/cleanupInvalidCards.js
 */

async function cleanupInvalidCards() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Finding users with saved cards...');
    const users = await UserModel.find({ 'savedCards.0': { $exists: true } });
    console.log(`📊 Found ${users.length} users with saved cards`);

    let totalCardsRemoved = 0;
    let usersUpdated = 0;

    for (const user of users) {
      const originalCardCount = user.savedCards.length;
      
      // Filter out invalid cards
      const validCards = user.savedCards.filter(card => {
        const isValid = card.last4 && 
                       card.brand && 
                       card.expiryMonth && 
                       card.expiryYear &&
                       card.stripePaymentMethodId;
        
        if (!isValid) {
          console.log(`❌ Removing invalid card from user ${user.email || user._id}:`, {
            _id: card._id,
            last4: card.last4 || 'MISSING',
            brand: card.brand || 'MISSING',
            expiryMonth: card.expiryMonth || 'MISSING',
            expiryYear: card.expiryYear || 'MISSING',
            stripePaymentMethodId: card.stripePaymentMethodId || 'MISSING'
          });
        }
        
        return isValid;
      });

      const cardsRemoved = originalCardCount - validCards.length;
      
      if (cardsRemoved > 0) {
        user.savedCards = validCards;
        await user.save();
        totalCardsRemoved += cardsRemoved;
        usersUpdated++;
        console.log(`✅ Updated user ${user.email || user._id}: Removed ${cardsRemoved} invalid card(s), ${validCards.length} valid card(s) remaining`);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Users processed: ${users.length}`);
    console.log(`   Users updated: ${usersUpdated}`);
    console.log(`   Invalid cards removed: ${totalCardsRemoved}`);
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the migration
cleanupInvalidCards();
