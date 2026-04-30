import React, { useState } from 'react';

interface User {
    uid: string;
    email: string | null;
}

interface SellCarPageProps {
    currentUser: User | null;
    onBack: () => void;
}

interface CarSubmission {
    make: string;
    model: string;
    year: number | '';
    mileage: number | '';
    condition: string;
    description: string;
    price: number | '';
    vehicleNumber: string;
    chassisNumber: string;
    ownerName: string;
    ownerContactNumber: string;
}

const SellCarPage: React.FC<SellCarPageProps> = ({ currentUser, onBack }) => {
    const [step, setStep] = useState(1);
    const [submissionData, setSubmissionData] = useState<CarSubmission>({
        make: '',
        model: '',
        year: '',
        mileage: '',
        condition: 'Good',
        description: '',
        price: '',
        vehicleNumber: '',
        chassisNumber: '',
        ownerName: currentUser?.email?.split('@')[0] || '',
        ownerContactNumber: '',
    });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSubmissionData(prev => ({
            ...prev,
            [name]: name === 'year' || name === 'mileage' || name === 'price' 
                ? (value === '' ? '' : Number(value)) 
                : value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 3);
            setImageFiles(files);
        }
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) {
            setErrorMessage('Please select at least one image');
            return false;
        }

        const formData = new FormData();
        imageFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            setSubmissionStatus('submitting');
            const response = await fetch(`${API_URL}/upload-images`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Image upload failed');
            }

            const data = await response.json();
            setImageUrls(data.imageUrls);
            return true;
        } catch (error: any) {
            setErrorMessage(error.message);
            return false;
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        setErrorMessage('');

        // Validation for step 1
        if (step === 1) {
            if (!submissionData.make || !submissionData.model) {
                setErrorMessage('Please fill in Make and Model');
                return;
            }
            setStep(2);
        } 
        // Validation for step 2
        else if (step === 2) {
            if (!submissionData.year || !submissionData.mileage) {
                setErrorMessage('Please fill in Year and Mileage');
                return;
            }
            setStep(3);
        }
        // Validation for step 3
        else if (step === 3) {
            if (!submissionData.price || !submissionData.vehicleNumber || !submissionData.ownerName || !submissionData.ownerContactNumber) {
                setErrorMessage('Please fill in all required fields');
                return;
            }
            setStep(4);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!currentUser?.uid) {
            setErrorMessage('User not logged in');
            return;
        }

        // Upload images
        const imagesUploaded = await uploadImages();
        if (!imagesUploaded) {
            return;
        }

        try {
            setSubmissionStatus('submitting');
            
            const listingData = {
                ...submissionData,
                sellerUid: currentUser.uid,
                imageUrls: imageUrls,
            };

            const response = await fetch(`${API_URL}/listings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(listingData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit listing');
            }

            setSubmissionStatus('success');
            setTimeout(onBack, 3000);
        } catch (error: any) {
            setSubmissionStatus('error');
            setErrorMessage(error.message);
            console.error('Submission failed:', error);
        }
    };

    const handleBack = () => {
        if (step === 1) {
            onBack();
        } else {
            setStep(step - 1);
        }
    };

    // --- Form Step Renderers ---

    const renderStep1 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">1. Basic Vehicle Info</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Make (Brand) *</label>
                <input 
                    type="text" 
                    name="make"
                    value={submissionData.make}
                    onChange={handleChange}
                    placeholder="Toyota, Mercedes, BMW, etc."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Model *</label>
                <input 
                    type="text" 
                    name="model"
                    value={submissionData.model}
                    onChange={handleChange}
                    placeholder="Camry, S-Class, X5, etc."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition"
                />
            </div>

            <button onClick={handleNext} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-200">
                Next: Vehicle Details
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">2. Vehicle Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Year *</label>
                    <input 
                        type="number" 
                        name="year"
                        value={submissionData.year}
                        onChange={handleChange}
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="2023"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mileage (KM) *</label>
                    <input 
                        type="number" 
                        name="mileage"
                        value={submissionData.mileage}
                        onChange={handleChange}
                        min="0"
                        placeholder="45000"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Condition *</label>
                <select
                    name="condition"
                    value={submissionData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition appearance-none cursor-pointer"
                >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                </select>
            </div>

            <div className="flex space-x-4 pt-4">
                <button onClick={handleBack} type="button" className="w-1/3 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition duration-200">
                    ← Back
                </button>
                <button onClick={handleNext} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-200">
                    Next: Vehicle Numbers
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">3. Registration & Pricing</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle Registration Number *</label>
                <input 
                    type="text" 
                    name="vehicleNumber"
                    value={submissionData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="ABC-1234"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Chassis Number (Optional)</label>
                <input 
                    type="text" 
                    name="chassisNumber"
                    value={submissionData.chassisNumber}
                    onChange={handleChange}
                    placeholder="Vehicle chassis number"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Asking Price (₹) *</label>
                <input 
                    type="number" 
                    name="price"
                    value={submissionData.price}
                    onChange={handleChange}
                    min="0"
                    placeholder="500000"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition"
                />
            </div>

            <div className="flex space-x-4 pt-4">
                <button onClick={handleBack} type="button" className="w-1/3 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition duration-200">
                    ← Back
                </button>
                <button onClick={handleNext} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-200">
                    Next: Owner Details
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">4. Owner & Description</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Owner Name *</label>
                <input 
                    type="text" 
                    name="ownerName"
                    value={submissionData.ownerName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Contact Number *</label>
                <input 
                    type="tel" 
                    name="ownerContactNumber"
                    value={submissionData.ownerContactNumber}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle Description (Max 300 words)</label>
                <textarea
                    name="description"
                    value={submissionData.description}
                    onChange={handleChange}
                    rows={4}
                    maxLength={1500}
                    placeholder="Describe your vehicle condition, features, service history, and reasons for selling..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition resize-none"
                />
            </div>

            <div className="flex space-x-4 pt-4">
                <button onClick={handleBack} type="button" className="w-1/3 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition duration-200">
                    ← Back
                </button>
                <button onClick={handleNext} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-200">
                    Next: Upload Images
                </button>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">5. Upload Vehicle Images</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    Select Images (Max 3)
                </label>
                <p className="text-xs text-gray-400 mb-3">Image 1: Exterior (Required), Image 2: Interior (Optional), Image 3: Other (Optional)</p>
                
                <input 
                    type="file" 
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                />
                <p className="text-xs text-gray-400 mt-2">
                    {imageFiles.length} file(s) selected
                </p>
            </div>

            {imageFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {imageFiles.map((file, index) => (
                        <div key={index} className="p-3 bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-300 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex space-x-4 pt-4">
                <button onClick={handleBack} type="button" className="w-1/3 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition duration-200">
                    ← Back
                </button>
                <button 
                    type="submit" 
                    onClick={handleSubmit}
                    disabled={submissionStatus === 'submitting' || imageFiles.length === 0}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submissionStatus === 'submitting' ? 'Submitting...' : 'SUBMIT FOR VERIFICATION'}
                </button>
            </div>
        </div>
    );

    const renderFormContent = () => {
        if (!currentUser || currentUser.email === null) {
            return (
                <div className="text-center p-8 bg-gray-700 rounded-xl">
                    <h2 className="text-2xl text-red-400 font-bold mb-4">Authentication Required</h2>
                    <p className="text-gray-300 mb-6">Please log in or sign up to submit your car for sale.</p>
                    <button onClick={onBack} className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition">
                        Go to Home
                    </button>
                </div>
            );
        }

        if (submissionStatus === 'success') {
            return (
                <div className="text-center p-12 bg-gray-700 rounded-xl">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-3xl text-green-400 font-bold mb-4">Submission Successful!</h2>
                    <p className="text-gray-300 mb-3">
                        Thank you for submitting your {submissionData.make} {submissionData.model}.
                    </p>
                    <p className="text-gray-400 text-sm">
                        Our admin team will verify your details and contact you via email ({currentUser.email}). Once approved, your listing will go live!
                    </p>
                </div>
            );
        }

        if (submissionStatus === 'error') {
            return (
                <div className="text-center p-12 bg-red-900/50 rounded-xl">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-3xl text-red-400 font-bold mb-4">Submission Failed</h2>
                    <p className="text-red-300 mb-6">{errorMessage || 'There was an issue processing your request.'}</p>
                    <button onClick={() => { setSubmissionStatus('idle'); setErrorMessage(''); }} className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition">
                        Try Again
                    </button>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6 space-x-2">
                    {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`flex-1 h-2 rounded-full transition-all duration-300 ${s <= step ? 'bg-red-600' : 'bg-gray-700'}`}></div>
                    ))}
                </div>

                {errorMessage && (
                    <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
                        {errorMessage}
                    </div>
                )}
                
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </form>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 pt-20">
            <div className="bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-2xl border border-red-600/50 mt-10">
                
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Sell Your Car</h1>
                    <button 
                        onClick={onBack} 
                        className="text-red-400 hover:text-red-500 transition font-medium"
                    >
                        ← Back to Home
                    </button>
                </div>
                <p className="text-gray-400 mb-8">Fill in your vehicle details. Once submitted, our team will verify and list it on the marketplace.</p>

                {renderFormContent()}
            </div>
        </div>
    );
};

export default SellCarPage;
