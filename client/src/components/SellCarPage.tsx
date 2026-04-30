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

    const uploadImages = async (): Promise<string[] | null> => {
        if (imageFiles.length === 0) {
            setErrorMessage('Please select at least one image');
            return null;
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
            return data.imageUrls;
        } catch (error: any) {
            setErrorMessage(error.message);
            return null;
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
            if (!submissionData.price || !submissionData.vehicleNumber) {
                setErrorMessage('Please fill in all required fields');
                return;
            }
            setStep(4);
        }
        // Validation for step 4
        else if (step === 4) {
            if (!submissionData.ownerName || !submissionData.ownerContactNumber) {
                setErrorMessage('Please fill in owner details');
                return;
            }
            setStep(5);
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
        const uploadedUrls = await uploadImages();
        if (!uploadedUrls) {
            return;
        }

        try {
            setSubmissionStatus('submitting');
            
            const listingData = {
                ...submissionData,
                sellerUid: currentUser.uid,
                imageUrls: uploadedUrls,
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
        <section className="sell-step-card">
            <h2 className="sell-step-title">Step 1: Basic Vehicle Info</h2>
            <p className="sell-step-hint">Tell us about your vehicle make and model.</p>
            
            <div>
                <label className="sell-label">Make (Brand) *</label>
                <input 
                    type="text" 
                    name="make"
                    value={submissionData.make}
                    onChange={handleChange}
                    placeholder="e.g., Toyota, Mercedes, BMW"
                    className="sell-input"
                />
            </div>

            <div>
                <label className="sell-label">Model *</label>
                <input 
                    type="text" 
                    name="model"
                    value={submissionData.model}
                    onChange={handleChange}
                    placeholder="e.g., Camry, S-Class, X5"
                    className="sell-input"
                />
            </div>

            <button onClick={handleNext} className="sell-btn sell-btn-primary sell-btn-full" type="button">
                Next: Vehicle Details →
            </button>
        </section>
    );

    const renderStep2 = () => (
        <section className="sell-step-card">
            <h2 className="sell-step-title">Step 2: Vehicle Details</h2>
            <p className="sell-step-hint">Provide the year, mileage, and condition.</p>
            
            <div className="sell-grid-two">
                <div>
                    <label className="sell-label">Year *</label>
                    <input 
                        type="number" 
                        name="year"
                        value={submissionData.year}
                        onChange={handleChange}
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="2023"
                        className="sell-input"
                    />
                </div>

                <div>
                    <label className="sell-label">Mileage (KM) *</label>
                    <input 
                        type="number" 
                        name="mileage"
                        value={submissionData.mileage}
                        onChange={handleChange}
                        min="0"
                        placeholder="45000"
                        className="sell-input"
                    />
                </div>
            </div>

            <div>
                <label className="sell-label">Condition *</label>
                <select
                    name="condition"
                    value={submissionData.condition}
                    onChange={handleChange}
                    className="sell-select"
                >
                    <option value="Excellent">Excellent - Like New</option>
                    <option value="Good">Good - Well Maintained</option>
                    <option value="Fair">Fair - Some Wear & Tear</option>
                    <option value="Poor">Poor - Needs Repairs</option>
                </select>
            </div>

            <div className="sell-actions">
                <button onClick={handleBack} type="button" className="sell-btn sell-btn-secondary">
                    ← Back
                </button>
                <button onClick={handleNext} className="sell-btn sell-btn-primary" type="button">
                    Next: Registration →
                </button>
            </div>
        </section>
    );

    const renderStep3 = () => (
        <section className="sell-step-card">
            <h2 className="sell-step-title">Step 3: Registration & Pricing</h2>
            
            <div>
                <label className="sell-label">Vehicle Registration Number *</label>
                <input 
                    type="text" 
                    name="vehicleNumber"
                    value={submissionData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="ABC-1234"
                    className="sell-input"
                />
            </div>

            <div>
                <label className="sell-label">Chassis Number (Optional)</label>
                <input 
                    type="text" 
                    name="chassisNumber"
                    value={submissionData.chassisNumber}
                    onChange={handleChange}
                    placeholder="Vehicle chassis number"
                    className="sell-input"
                />
            </div>

            <div>
                <label className="sell-label">Asking Price (INR) *</label>
                <input 
                    type="number" 
                    name="price"
                    value={submissionData.price}
                    onChange={handleChange}
                    min="0"
                    placeholder="500000"
                    className="sell-input"
                />
            </div>

            <div className="sell-actions">
                <button onClick={handleBack} type="button" className="sell-btn sell-btn-secondary">
                    ← Back
                </button>
                <button onClick={handleNext} className="sell-btn sell-btn-primary" type="button">
                    Next: Owner Details
                </button>
            </div>
        </section>
    );

    const renderStep4 = () => (
        <section className="sell-step-card">
            <h2 className="sell-step-title">Step 4: Owner & Description</h2>
            
            <div>
                <label className="sell-label">Owner Name *</label>
                <input 
                    type="text" 
                    name="ownerName"
                    value={submissionData.ownerName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="sell-input"
                />
            </div>

            <div>
                <label className="sell-label">Contact Number *</label>
                <input 
                    type="tel" 
                    name="ownerContactNumber"
                    value={submissionData.ownerContactNumber}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="sell-input"
                />
            </div>

            <div>
                <label className="sell-label">Vehicle Description (Max 300 words)</label>
                <textarea
                    name="description"
                    value={submissionData.description}
                    onChange={handleChange}
                    rows={4}
                    maxLength={1500}
                    placeholder="Describe your vehicle condition, features, service history, and reasons for selling..."
                    className="sell-textarea"
                />
            </div>

            <div className="sell-actions">
                <button onClick={handleBack} type="button" className="sell-btn sell-btn-secondary">
                    ← Back
                </button>
                <button onClick={handleNext} className="sell-btn sell-btn-primary" type="button">
                    Next: Upload Images
                </button>
            </div>
        </section>
    );

    const renderStep5 = () => (
        <section className="sell-step-card">
            <h2 className="sell-step-title">Step 5: Upload Vehicle Images</h2>
            
            <div>
                <label className="sell-label">
                    Select Images (Max 3)
                </label>
                <p className="sell-step-hint">Image 1: Exterior (required), Image 2: Interior, Image 3: Other.</p>
                
                <input 
                    type="file" 
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sell-file-input"
                />
                <p className="sell-file-count">
                    {imageFiles.length} file(s) selected
                </p>
            </div>

            {imageFiles.length > 0 && (
                <div className="sell-grid-three">
                    {imageFiles.map((file, index) => (
                        <div key={index} className="sell-file-pill">
                            <p className="sell-file-name">{file.name}</p>
                            <p className="sell-file-size">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div className="sell-actions">
                <button onClick={handleBack} type="button" className="sell-btn sell-btn-secondary">
                    ← Back
                </button>
                <button 
                    type="submit" 
                    onClick={handleSubmit}
                    disabled={submissionStatus === 'submitting' || imageFiles.length === 0}
                    className="sell-btn sell-btn-success"
                >
                    {submissionStatus === 'submitting' ? 'Submitting...' : 'SUBMIT FOR VERIFICATION'}
                </button>
            </div>
        </section>
    );

    const renderFormContent = () => {
        if (!currentUser || currentUser.email === null) {
            return (
                <div className="sell-state-card sell-state-auth">
                    <h2 className="sell-state-title">Authentication Required</h2>
                    <p className="sell-state-text">Please log in or sign up to submit your car for sale.</p>
                    <button onClick={onBack} className="sell-btn sell-btn-primary">
                        Go to Home
                    </button>
                </div>
            );
        }

        if (submissionStatus === 'success') {
            return (
                <div className="sell-state-card sell-state-success">
                    <div className="sell-state-icon">SUCCESS</div>
                    <h2 className="sell-state-title">Submission Successful</h2>
                    <p className="sell-state-text">
                        Thank you for submitting your {submissionData.make} {submissionData.model}.
                    </p>
                    <p className="sell-state-note">
                        Our admin team will verify your details and contact you via email ({currentUser.email}). Once approved, your listing will go live!
                    </p>
                </div>
            );
        }

        if (submissionStatus === 'error') {
            return (
                <div className="sell-state-card sell-state-error">
                    <div className="sell-state-icon">ERROR</div>
                    <h2 className="sell-state-title">Submission Failed</h2>
                    <p className="sell-state-text">{errorMessage || 'There was an issue processing your request.'}</p>
                    <button onClick={() => { setSubmissionStatus('idle'); setErrorMessage(''); }} className="sell-btn sell-btn-primary">
                        Try Again
                    </button>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="sell-form">
                <div className="sell-progress">
                    {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`sell-progress-segment ${s <= step ? 'is-active' : ''}`}></div>
                    ))}
                </div>

                {errorMessage && (
                    <div className="sell-alert">
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
        <div className="sell-page-shell">
            <div className="sell-page-card">
                
                <div className="sell-page-header">
                    <h1 className="sell-page-title">Sell Your Car</h1>
                    <button 
                        onClick={onBack} 
                        className="sell-page-back"
                    >
                        ← Back to Home
                    </button>
                </div>
                <p className="sell-page-subtitle">Fill in your vehicle details. Once submitted, our team will verify and list it on the marketplace.</p>

                {renderFormContent()}
            </div>
        </div>
    );
};

export default SellCarPage;
