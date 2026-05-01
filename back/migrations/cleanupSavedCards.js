import mongoose from 'mongoose';
import UserModel from '../model/user.model.js';
import { config } from 'dotenv';

config();

/**
 * Migration Script: Clean up invalid saved cards
 * 
 * This script removes any saved cards that don't have the required fields
 * for the new Stripe Payment Method structure.
 * 
 * Run this once after deploying the new card saving feature.
 */

async function cleanupSavedCards() {
  try {
    console.log('🔄 Starting saved cards cleanup...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with saved cards
    const users = await UserModel.find({ 
      'savedCards.0': { $exists: true } 
    });

    console.log(`📊 Found ${users.length} users with saved cards`);

    let cleanedCount = 0;
    let totalCardsRemoved = 0;

    for (const user of users) {
      let hasInvalidCards = false;
      const validCards = [];

      for (const card of user.savedCards) {
        // Check if card has new structure (Stripe Payment Method)
        if (card.stripePaymentMethodId && card.last4 && card.brand && 
            card.expiryMonth && card.expiryYear) {
          // Valid new format
          validCards.push(card);
        } else if (card.cardNumber && card.cvv) {
          // Old format - remove it
          hasInvalidCards = true;
          totalCardsRemoved++;
          console.log(`  ❌ Removing old format card for user ${user._id}`);
        } else {
          // Invalid/incomplete card - remove it
          hasInvalidCards = true;
          totalCardsRemoved++;
          console.log(`  ❌ Removing invalid card for user ${user._id}`);
        }
      }

      if (hasInvalidCards) {
        user.savedCards = validCards;
        await user.save();
        cleanedCount++;
        console.log(`  ✅ Cleaned user ${user._id} - ${validCards.length} valid cards remaining`);
      }
    }

    console.log('\n📈 Cleanup Summary:');
    console.log(`  - Users processed: ${users.length}`);
    console.log(`  - Users cleaned: ${cleanedCount}`);
    console.log(`  - Cards removed: ${totalCardsRemoved}`);
    console.log('\n✅ Cleanup completed successfully!');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the migration
cleanupSavedCards();
