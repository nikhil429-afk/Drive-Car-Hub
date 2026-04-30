import React, { useState, useMemo, useEffect } from 'react';
import type { SearchParams, CarListing } from '../types/car'; 

interface ListingsPageProps {
    searchParams: SearchParams;
    onBack: () => void;
}

interface FilterState {
    make: string;
    minYear: string;
    maxPrice: string;
}

const sortOptions = [
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'year_desc', label: 'Year: Newest First' },
    { value: 'year_asc', label: 'Year: Oldest First' },
    { value: 'mileage_asc', label: 'Mileage: Low to High' },
];

const ListingsPage: React.FC<ListingsPageProps> = ({ searchParams, onBack }) => {
    const [listings, setListings] = useState<CarListing[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState<FilterState>({
        make: searchParams.make || '',
        minYear: searchParams.year || '',
        maxPrice: searchParams.priceRange || '',
    });
    
    const [sortOption, setSortOption] = useState(sortOptions[0].value);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const response = await fetch('/api/listings');
            if (response.ok) {
                const data = await response.json();
                setListings(Array.isArray(data) ? data : []);
            } else {
                const text = await response.text().catch(() => '');
                console.error('Failed to fetch listings:', response.status, text);
                setListings([]);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setFilters({
            make: searchParams.make || '',
            minYear: searchParams.year || '',
            maxPrice: searchParams.priceRange || '',
        });
    }, [searchParams]);


    const filteredAndSortedListings = useMemo(() => {
        let list = Array.isArray(listings) ? [...listings] : [];
        
        list = list.filter(car => {
            if (filters.make && car.make.toLowerCase() !== filters.make.toLowerCase()) {
                return false;
            }
            
            const minYear = parseInt(filters.minYear);
            if (!isNaN(minYear) && car.year < minYear) {
                return false;
            }
            
            const maxPrice = filters.maxPrice ? parseInt(filters.maxPrice.replace(/[^0-9]/g, '')) : 0;
            if (maxPrice > 0 && car.price > maxPrice) {
                return false;
            }

            return true;
        });

        list.sort((a, b) => {
            switch (sortOption) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'year_desc':
                    return b.year - a.year;
                case 'year_asc':
                    return a.year - b.year;
                case 'mileage_asc':
                    return a.mileage - b.mileage;
                default:
                    return 0;
            }
        });

        return list;
    }, [listings, filters, sortOption]); 


    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const allMakes = [...new Set((Array.isArray(listings) ? listings : []).map(c => c.make))];

    
    const renderFilterSidebar = () => (
        <div className="p-6 bg-gray-800 rounded-xl sticky top-24 shadow-lg border border-gray-700 space-y-6">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-red-600/50 pb-2">Filter Cars</h3>
            
            <div className="space-y-2">
                <label htmlFor="make" className="text-sm font-medium text-gray-300 block">Make</label>
                <select
                    id="make"
                    name="make"
                    value={filters.make}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white p-2 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">All Makes</option>
                    {allMakes.map(make => <option key={make} value={make}>{make}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="maxPrice" className="text-sm font-medium text-gray-300 block">Max Price</label>
                <select
                    id="maxPrice"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white p-2 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">Any Price</option>
                    <option value="20000">Under ₹20,000</option>
                    <option value="40000">Under ₹40,000</option>
                    <option value="60000">Under ₹60,000</option>
                    <option value="100000">Under ₹100,000</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="minYear" className="text-sm font-medium text-gray-300 block">Min Year</label>
                <select
                    id="minYear"
                    name="minYear"
                    value={filters.minYear}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white p-2 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">Any Year</option>
                    <option value="2023">2023+</option>
                    <option value="2020">2020+</option>
                    <option value="2015">2015+</option>
                    <option value="2010">2010+</option>
                </select>
            </div>

            <button
                onClick={() => setFilters({ make: '', minYear: '', maxPrice: '' })}
                className="w-full py-2 text-sm text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 transition"
            >
                Clear Filters
            </button>
        </div>
    );
    
    const renderCarCard = (car: CarListing) => (
        <div 
            key={car.id} 
            className="bg-gray-800 rounded-xl overflow-hidden shadow-xl transition-all duration-300 transform hover:scale-[1.01] border border-red-600/30 relative"
        >
            {car.verificationStatus === 'verified' && (
                <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                    ✓ Verified
                </div>
            )}
            <img src={car.imageUrls?.[0] || 'https://placehold.co/600x400/1f2937/ffffff?text=Image+Unavailable'} alt={`${car.make} ${car.model}`} className="w-full h-56 object-cover object-center" 
                // Fallback for image loading error
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src = `https://placehold.co/600x400/1f2937/ffffff?text=Image+Unavailable`;
                }}
            />
            <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-1">{car.year} {car.make} {car.model}</h3>
                <p className="text-3xl font-extrabold text-red-500 mb-4">₹{car.price.toLocaleString()}</p>
                
                <div className="text-gray-400 text-sm space-y-2">
                    <p>
                        <span className="font-medium text-gray-300 mr-2">Mileage:</span> 
                        {car.mileage.toLocaleString()} miles
                    </p>
                </div>

                <div className="mt-6">
                    <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-300 font-bold shadow-red-500/50 shadow-md">
                        VIEW DETAILS
                    </button>
                </div>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-extrabold text-white">
                        Car Listings ({filteredAndSortedListings.length})
                    </h1>
                    <button 
                        onClick={onBack} 
                        className="flex items-center text-red-400 hover:text-red-500 transition font-medium text-sm"
                    >
                        &larr; Back to Home
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/4 hidden lg:block">
                        {renderFilterSidebar()}
                    </div>

                    <div className="lg:w-3/4">
                        <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700/50">
                            
                            <div className="flex items-center space-x-3">
                                <label htmlFor="sort" className="text-sm font-medium text-gray-300 hidden sm:block">Sort By:</label>
                                <select
                                    id="sort"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 rounded-lg text-white p-2 text-sm focus:ring-red-500 focus:border-red-500"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            <button className="lg:hidden px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition">
                                Filters (Toggle)
                            </button>
                        </div>
                        
                        {loading ? (
                            <div className="text-center p-10 bg-gray-800 rounded-xl text-white">
                                <p className="text-xl font-semibold mb-2">Loading listings...</p>
                            </div>
                        ) : filteredAndSortedListings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {filteredAndSortedListings.map(renderCarCard)}
                            </div>
                        ) : (
                            <div className="text-center p-10 bg-gray-800 rounded-xl text-white">
                                <p className="text-xl font-semibold mb-2">No Listings Found</p>
                                <p className="text-gray-400">Try clearing your filters or broaden your search criteria.</p>
                                <button
                                    onClick={() => setFilters({ make: '', minYear: '', maxPrice: '' })}
                                    className="mt-4 px-6 py-2 text-sm text-red-400 border border-red-700 rounded-lg hover:bg-red-900/50 transition"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingsPage;
