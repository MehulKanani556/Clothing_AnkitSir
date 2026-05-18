import mongoose from "mongoose";
import dotenv from "dotenv";
import MainCategory from "../model/mainCategory.model.js";
import Category from "../model/category.model.js";
import SubCategory from "../model/subCategory.model.js";
import { connectDB } from "../DB/connectdb.js";

dotenv.config();

const categoriesData = [
    {
        mainCategory: "SHOP",
        categories: [
            {
                categoryName: "READY-TO-WEAR",
                subCategories: [
                    "New Arrivals (Latest Drops)",
                    "The Iconic Tailoring (Suits & Blazers)",
                    "Atelier Coats & Outerwear",
                    "Silk & Evening Wear",
                    "Knitwear & Cashmere",
                    "The Denim Edit"
                ]
            },
            {
                categoryName: "THE FINISHING TOUCH",
                subCategories: [
                    "Signature Handbags & Trunks",
                    "Luxury Footwear Archive",
                    "Belts & Small Leather Goods",
                    "High Jewellery",
                    "Silk Scarves & Eyewear"
                ]
            },
            {
                categoryName: "THE ANTHOLOGY",
                subCategories: [
                    "The Deep-Rooted Series",
                    "Limited Edition (1 of 100)",
                    "The Resort Collection",
                    "Gift Sets & Lifestyle Objects",
                    "Gender-Neutral Silhouettes"
                ]
            }
        ]
    },
    {
        mainCategory: "Men",
        categories: [
            {
                categoryName: "THE COLLECTION",
                subCategories: [
                    "Men's New Arrivals",
                    "Tailored Suits & Tuxedos",
                    "Formal & Evening Shirts",
                    "Atelier Coats & French Coats",
                    "Leather & Shearling Jackets",
                    "Cashmere & Fine Knitwear",
                    "Luxury Denim & Trousers",
                    "Casual Polos & T-Shirts"
                ]
            },
            {
                categoryName: "OBJECTS OF STYLE",
                subCategories: [
                    "Men's Signature Bags & Trunks",
                    "Document Cases & Briefcases",
                    "Handcrafted Belts",
                    "Timepieces & Watches",
                    "Eyewear: The Signature Series",
                    "Fine Jewelry for Men",
                    "Silk Scarves & Pocket Squares",
                    "Fragrance"
                ]
            },
            {
                categoryName: "THE SHOE ARCHIVE",
                subCategories: [
                    "Oxford & Derby Shoes",
                    "Hand-stitched Loafers",
                    "Chelsea Boots",
                    "Combat & Desert Boots",
                    "Minimalist Sneakers",
                    "Atelier Mules & Sandals",
                    "Artisan Polishing Kits"
                ]
            },
            {
                categoryName: "MAN OF THE MOMENT",
                subCategories: [
                    "Grooming Rituals",
                    "Wallets & Card Holders"
                ]
            }
        ]
    },
    {
        mainCategory: "women",
        categories: [
            {
                categoryName: "THE CLOTHING",
                subCategories: [
                    "New Arrivals (Weekly Drops)",
                    "The Runway Edit (Show Pieces)",
                    "Evening Gowns & Cocktail Dresses",
                    "Sculpted Silk Blouses",
                    "Tailored Blazers & Waistcoats",
                    "Women's Cashmere & Knitwear",
                    "Women's Luxury Denim & Trousers",
                    "Pleated & Pencil Skirts",
                    "Knitwear & Dresses",
                    "Shirts and tops",
                    "T-shirts and sweatshirts",
                    
                    "Swimwear",
                    "Trousers and shorts",
                    "Pajamas and underwear"
                ]
            },
            {
                categoryName: "THE OUTERWEAR",
                subCategories: [
                    "Cashmere Overcoats",
                    "The Iconic Trench Coat",
                    "Shearling & Suede Jackets",
                    "Biker & Leather Bomber Jackets",
                    "Technical Raincoats & Parkas",
                    "Quilted Down & Puffer Jackets",
                    "Evening Capes & Silk Wraps",
                    "Lightweight Spring Jackets",
                    "Oversized Sculptural Coats"
                ]
            },
            {
                categoryName: "OBJECTS OF DESIRE",
                subCategories: [
                    "Signature Handbags & Clutches",
                    "Cross-body & Tote Bags",
                    "Travel Trunks & Vanity Cases",
                    "Belts: Classic & Statement",
                    "HIGH JEWELRY",
                    "Women's Timepieces & Watches",
                    "Women's Eyewear Collection",
                    "Women's Silk Scarves & Bandanas",
                    "Women's Wallets & Card Holders"
                ]
            },
            {
                categoryName: "THE FOOTWEAR",
                subCategories: [
                    "High Heels & Stilettos",
                    "Hand-Painted Leather Loafers",
                    "Chelsea & Combat Boots",
                    "Atelier Mules & Slingbacks",
                    "Summer Espadrilles & Sandals",
                    "Sculptural Wedges",
                    "Velvet & Silk Slippers"
                ]
            },
            {
                categoryName: "THE EDITORIAL",
                subCategories: [
                    "The Signature Finer Series",
                    "The Fragrance Archive",
                    "The Gift Selection"
                ]
            }
        ]
    },
    {
        mainCategory: "lux care",
        categories: [
            {
                categoryName: "SKIN ARCHIVE",
                subCategories: [
                    "New Arrivals: The Glow Series",
                    "Radiant Silk Foundation",
                    "The Invisible Concealer",
                    "Velvet Finishing Powder",
                    "Luminous Face Primers",
                    "Sculpting Bronzer & Contour",
                    "The Deep Forest Serum Foundation"
                ]
            },
            {
                categoryName: "ARTISTRY EDIT",
                subCategories: [
                    "Signature Eyeshadow Palettes",
                    "Precision Liquid Liners",
                    "Volume Definition Mascaras",
                    "Long-wear Brow Sculpt",
                    "LIP RITUALS",
                    "Satin Finish Lipsticks",
                    "High-Shine Gloss Archives",
                    "Matte Velvet Lip Liners",
                    "Nourishing Lip Oils"
                ]
            },
            {
                categoryName: "THE PRESERVATION",
                subCategories: [
                    "Regenerative Night Creams",
                    "Hydrating Day Emulsions",
                    "Vitamin C Brightening Elixirs",
                    "Firming Eye Concentrates",
                    "Detoxifying Clay Masks",
                    "Botanical Face Oils",
                    "Sun Protection (SPF 50+)",
                    "The Cleansing Balm Ritual"
                ]
            },
            {
                categoryName: "BEAUTY OBJECTS",
                subCategories: [
                    "Artisan Brush Sets",
                    "Precision Blending Sponges",
                    "Luxury Vanity Mirrors",
                    "Leather Cosmetic Trunks"
                ]
            },
            {
                categoryName: "THE SCENT STORY",
                subCategories: [
                    "Signature Parfum Intense",
                    "Home Fragrance & Candles",
                    "Travel Size Essentials"
                ]
            }
        ]
    },
    {
        mainCategory: "ACCESSORIES",
        categories: [
            {
                categoryName: "FOR HIM: LEATHER GOODS",
                subCategories: [
                    "Executive Briefcases & Portfolios",
                    "Weekend & Overnight Trunks",
                    "Cross-body Messenger Bags"
                ]
            },
            {
                categoryName: "MEN'S ESSENTIALS",
                subCategories: [
                    "Signature Logo Belts",
                    "Reversible Formal Belts",
                    "Bi-fold Wallets",
                    "Leather Tech & Laptop Sleeves",
                    "Key Pouch & Car Fobs",
                    "Magnetic Money Clips",
                    "Card Holders"
                ]
            },
            {
                categoryName: "FOR HER: THE HANDBAG ARCHIVE",
                subCategories: [
                    "Iconic Totes & Day Bags",
                    "Sculptural Cross-body Bags",
                    "Evening Clutches & Minis",
                    "Micro Bags & Nano Cases",
                    "Continental Long Wallets",
                    "Compact Coin Purses",
                    "Phone Holders with Chain",
                    "Leather Bag Charms"
                ]
            },
            {
                categoryName: "WOMEN'S ESSENTIALS",
                subCategories: [
                    "Continental Zip Wallets",
                    "Women's Compact Coin Purses",
                    "Statement Waist Belts",
                    "Luxury Vanity Cases"
                ]
            },
            {
                categoryName: "THE PRECIOUS EDIT",
                subCategories: [
                    "The Heritage Watch Series (Men)",
                    "Diamond Set Timepieces (Women)",
                    "Interchangeable Leather Straps",
                    "Classic Aviators",
                    "Cat-Eye & Oversized",
                    "Blue Light Signature Series",
                    "Optical Frames",
                    "Foldable Travel Cases",
                    "18K Gold-Plated Frames",
                    "Diamond-Encrusted Watches",
                    "Skeleton Dial Limited Editions Watches",
                    "Interchangeable Leather Straps Watches"
                ]
            },
            {
                categoryName: "TEXTILE & JEWELRY",
                subCategories: [
                    "Silk Ties & Pocket Squares",
                    "Cufflinks & Tie Bars",
                    "Silk Scarves & Twillys",
                    "Rings & Earrings",
                    "Statement Gold Necklaces"
                ]
            }
        ]
    }
];

const seedShopCategories = async () => {
    try {
        await connectDB(process.env.DB_URL);
        console.log("🔗 Connected to Database");

        // Loop through each main category data
        for (const mainCategoryData of categoriesData) {
            // Find existing main category (don't create new ones)
            const mainCategory = await MainCategory.findOne({
                mainCategoryName: mainCategoryData.mainCategory
            });

            if (!mainCategory) {
                console.log(`⚠️  Main Category "${mainCategoryData.mainCategory}" not found in database. Skipping...`);
                continue;
            }

            console.log(`\n📂 Processing Main Category: ${mainCategory.mainCategoryName}`)

            // Create Categories and SubCategories
            for (const categoryData of mainCategoryData.categories) {
                // Check if category already exists
                let category = await Category.findOne({
                    mainCategoryId: mainCategory._id,
                    categoryName: categoryData.categoryName
                });

                if (!category) {
                    category = await Category.create({
                        mainCategoryId: mainCategory._id,
                        categoryName: categoryData.categoryName,
                        categoryImage: ""
                    });
                    console.log(`  ✅ Created Category: ${category.categoryName}`);
                } else {
                    console.log(`  ℹ️  Category already exists: ${category.categoryName}`);
                }

                // Create SubCategories
                for (const subCategoryName of categoryData.subCategories) {
                    // Check if subcategory already exists
                    const existingSubCategory = await SubCategory.findOne({
                        mainCategoryId: mainCategory._id,
                        categoryId: category._id,
                        subCategoryName: subCategoryName
                    });

                    if (!existingSubCategory) {
                        const subCategory = await SubCategory.create({
                            mainCategoryId: mainCategory._id,
                            categoryId: category._id,
                            subCategoryName: subCategoryName,
                            subCategoryImage: ""
                        });
                        console.log(`    ✅ Created SubCategory: ${subCategory.subCategoryName}`);
                    } else {
                        console.log(`    ℹ️  SubCategory already exists: ${subCategoryName}`);
                    }
                }
            }
        }

        console.log("\n🎉 Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Error:", error.message);
        process.exit(1);
    }
};

seedShopCategories();
