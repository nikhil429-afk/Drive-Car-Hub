// src/types/car.ts

/**
 * Defines the structure for search parameters used across HeroSection and ListingsPage.
 */
export interface SearchParams {
    make: string;
    year: string;
    priceRange: string;
}

/**
 * Defines the core properties for a vehicle listing.
 */
export interface CarListing {
    id: string;
    make: string;
    model: string;
    year: number;
    mileage: number;
    price: number;
    description: string;
    imageUrls: string[];
    isFeatured: boolean;
    sellerUid: string;
    verificationStatus: "pending" | "verified" | "rejected";
    status: "available" | "sold";
    buyerUid?: string;
    purchaseDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
