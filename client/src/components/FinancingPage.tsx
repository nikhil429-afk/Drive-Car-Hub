// src/components/FinancingPage.tsx
import React, { useState, useMemo } from 'react';

interface FinancingPageProps {
    onBack: () => void;
}

// Helper function to calculate EMI
const calculateEMI = (principal: number, annualRate: number, years: number): number => {
    // Edge case: zero or negative values
    if (principal <= 0 || annualRate < 0 || years <= 0) return 0;

    // Monthly Interest Rate (R)
    const monthlyRate = annualRate / (12 * 100);

    // Total Number of Payments (N)
    const months = years * 12;

    // Formula: EMI = P * R * (1 + R)^N / ((1 + R)^N - 1)
    if (monthlyRate === 0) {
        // Simple division if interest rate is 0
        return principal / months; 
    }

    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;

    return numerator / denominator;
};

const FinancingPage: React.FC<FinancingPageProps> = ({ onBack }) => {
    const [loanAmount, setLoanAmount] = useState(35000);
    const [interestRate, setInterestRate] = useState(6.5); // Annual percentage
    const [loanTermYears, setLoanTermYears] = useState(5);

    // Calculate results using useMemo to optimize performance
    const emiResult = useMemo(() => {
        const emi = calculateEMI(loanAmount, interestRate, loanTermYears);
        const totalInterest = (emi * (loanTermYears * 12)) - loanAmount;
        
        return {
            emi: emi,
            totalInterest: totalInterest > 0 ? totalInterest : 0,
            totalPayment: emi * (loanTermYears * 12),
            months: loanTermYears * 12,
        };
    }, [loanAmount, interestRate, loanTermYears]);

    const { emi, totalInterest, totalPayment, months } = emiResult;

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-10 pt-20">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-10 border border-red-600/30">
                <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                        Car Loan EMI Calculator
                    </h1>
                    <button 
                        onClick={onBack} 
                        className="flex items-center text-red-400 hover:text-red-500 transition font-medium text-sm"
                    >
                        &larr; Back
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* --- Input Controls --- */}
                    <div className="space-y-6">
                        
                        {/* Loan Amount Input */}
                        <div>
                            <label htmlFor="loanAmount" className="text-lg font-semibold text-gray-300 block mb-2">
                                Loan Amount ($): <span className="text-red-500">${loanAmount.toLocaleString()}</span>
                            </label>
                            <input 
                                id="loanAmount" 
                                type="range" 
                                min="1000" 
                                max="200000" 
                                step="500"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-red-600"
                            />
                        </div>

                        {/* Interest Rate Input */}
                        <div>
                            <label htmlFor="interestRate" className="text-lg font-semibold text-gray-300 block mb-2">
                                Annual Interest Rate (%): <span className="text-red-500">{interestRate.toFixed(2)}%</span>
                            </label>
                            <input 
                                id="interestRate" 
                                type="range" 
                                min="0.1" 
                                max="15" 
                                step="0.1"
                                value={interestRate}
                                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-red-600"
                            />
                        </div>

                        {/* Loan Term Input */}
                        <div>
                            <label htmlFor="loanTerm" className="text-lg font-semibold text-gray-300 block mb-2">
                                Loan Term (Years): <span className="text-red-500">{loanTermYears} Years</span>
                            </label>
                            <input 
                                id="loanTerm" 
                                type="range" 
                                min="1" 
                                max="7" 
                                step="1"
                                value={loanTermYears}
                                onChange={(e) => setLoanTermYears(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-red-600"
                            />
                        </div>

                    </div>

                    {/* --- Calculation Results --- */}
                    <div className="bg-gray-700 p-6 rounded-xl shadow-inner border border-red-600/50 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-white mb-6 text-center border-b border-gray-600 pb-3">
                            Payment Breakdown
                        </h3>

                        {/* Monthly EMI Result */}
                        <div className="text-center mb-6 p-4 bg-red-800/20 rounded-lg border-l-4 border-red-500">
                            <p className="text-lg font-medium text-gray-300">Your Monthly Payment (EMI)</p>
                            <p className="text-5xl font-extrabold text-red-400 mt-1">
                                ${emi.toFixed(2).toLocaleString()}
                            </p>
                        </div>
                        
                        {/* Summary Details */}
                        <div className="space-y-3 text-gray-300">
                            <div className="flex justify-between border-b border-gray-600 pb-1">
                                <span className="font-medium">Total Loan Principal:</span>
                                <span className="font-bold text-white">${loanAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-600 pb-1">
                                <span className="font-medium">Total Interest Paid:</span>
                                <span className="font-bold text-red-300">${totalInterest.toFixed(2).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-600 pb-1">
                                <span className="font-medium">Total Payable Amount:</span>
                                <span className="font-bold text-green-400">${totalPayment.toFixed(2).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Total Payments:</span>
                                <span className="font-bold text-white">{months} months</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancingPage;
