// src/components/FeaturedListings.tsx
import React from 'react';
import type { CarListing } from '../types/car'; // Import the CarListing interface
 // Import the CarListing interface

interface FeaturedListingsProps {
  // We can add props here later if we want to customize what cars are shown
}

const FeaturedListings: React.FC<FeaturedListingsProps> = () => {
  // Mock data for featured cars. In a real app, this would come from an API.
  const featuredCars: CarListing[] = [
    {
      id: 'f1',
      make: 'Tesla',
      model: 'Model 3',
      year: 2022,
      mileage: 15000,
      price: 38500,
      description: 'Well-maintained electric sedan with autopilot. Low mileage.',
      imageUrls: ['https://images.unsplash.com/photo-1593259066378-f75661414434?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'], // Placeholder for Tesla
      isFeatured: true,
      sellerUid: 'system',
      verificationStatus: 'verified',
      status: 'available',
    },
    {
      id: 'f2',
      make: 'Toyota',
      model: 'RAV4',
      year: 2019,
      mileage: 45000,
      price: 24000,
      description: 'Reliable SUV, perfect for families. Recent service.',
      imageUrls: ['https://images.unsplash.com/photo-1542362543-d02283925769?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'], // Placeholder for RAV4
      isFeatured: true,
      sellerUid: 'system',
      verificationStatus: 'verified',
      status: 'available',
    },
    {
      id: 'f3',
      make: 'Porsche',
      model: '911 Carrera',
      year: 2017,
      mileage: 22000,
      price: 85000,
      description: 'Sports car enthusiast dream, pristine condition, low miles.',
      imageUrls: ['https://images.unsplash.com/photo-1549399542-747690669279?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'], // Placeholder for Porsche
      isFeatured: true,
      sellerUid: 'system',
      verificationStatus: 'verified',
      status: 'available',
    },
  ];

  return (
    <section className="relative -mt-24 md:-mt-32 z-10 p-4 md:p-8 bg-gray-900/80 backdrop-blur-sm rounded-t-3xl max-w-7xl mx-auto shadow-lg">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center md:text-left">Featured Listings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredCars.map((car) => (
          <div key={car.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700">
            <img src={car.imageUrls?.[0] || 'https://placehold.co/600x400/1f2937/ffffff?text=Image+Unavailable'} alt={`${car.make} ${car.model}`} className="w-full h-48 object-cover object-center" />
            <div className="p-5">
              <h3 className="text-xl font-semibold text-white mb-2">{car.year} {car.make} {car.model}</h3>
                <p className="text-gray-300 text-sm mb-1">
                <span className="font-medium text-red-400">₹{car.price.toLocaleString()}</span> &bull; {car.mileage.toLocaleString()} miles
              </p>
              <p className="text-gray-400 text-sm mb-3">{car.description}</p>
              <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300 font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-10">
        <button className="px-8 py-3 bg-red-600 hover:bg-red-700 transition duration-300 text-white font-bold rounded-lg shadow-md">
          VIEW ALL LISTINGS
        </button>
      </div>
    </section>
  );
};

export default FeaturedListings;
