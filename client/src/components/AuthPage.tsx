// src/components/AuthPage.tsx
import React, { useState } from 'react';
// Firebase imports removed, as we are simulating a MongoDB backend
// We define a mock User type since we no longer receive a real Firebase User object.
interface User {
    uid: string;
    email: string | null;
}

interface AuthPageProps {
    onAuthSuccess: (user: User) => void;
    onBack: () => void;
}

// Global API Constants for the simulated MongoDB backend proxy
const API_KEY = ""; // This will be provided by the Canvas environment
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Auth Initialization (useEffect) is removed as it's no longer necessary

    /**
     * Simulates MongoDB/Backend API Call via Gemini Proxy
     * This function sends the credentials to the Gemini API with strict instructions
     * to mimic a secure authentication service lookup.
     */
    const handleAuth = async (isLoginMode: boolean) => {
        const operation = isLoginMode ? 'Login' : 'Signup';
        
        // System instruction guides the model to act as a secure backend
        // Note: For simulation, we define one set of hardcoded credentials for Login
        const systemPrompt = `You are a mock MongoDB authentication API. 
The only valid credentials for **Login** are email: 'test@example.com' and password: 'password123'. 
If the user provides these exact credentials for Login, respond ONLY with: 'SUCCESS: User authenticated.'

For **Signup**, if the user provides an email and password of at least 6 characters, respond ONLY with: 'SUCCESS: User created.'

For any other scenario (incorrect login, short password, etc.), respond ONLY with: 'FAILURE: Invalid credentials or account does not exist.'
Do NOT include markdown, explanations, or conversational text.`;

        const userQuery = `${operation} attempt: Email: ${email}, Password: ${password}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.1 } // Low temperature for predictable output
        };

        let responseText = '';

        try {
            // No need for backoff implementation here as this is a mock
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const result = await response.json();
            responseText = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'FAILURE: Unknown API response.';

        } catch (err) {
            console.error('Gemini API Error:', err);
            throw new Error('Could not connect to the authentication service.');
        }
        
        // Process the response from the simulated backend
        if (responseText.startsWith('SUCCESS:')) {
            // Mock a successful login/signup user object
            const mockUser: User = {
                uid: email.toLowerCase().replace(/[^a-z0-9]/g, ''), // Generate simple UID from email
                email: email,
            };
            onAuthSuccess(mockUser);
        } else if (responseText.startsWith('FAILURE:')) {
            // Extract error message
            throw new Error(responseText.substring(responseText.indexOf(':') + 1).trim());
        } else {
             throw new Error('Authentication failed due to unpredictable response.');
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic client-side validation
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await handleAuth(isLogin);
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || 'An unexpected error occurred during authentication.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwitchMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setEmail('');
        setPassword('');
    };

    // Card styling to match the site's dark aesthetic
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 pt-20">
            <div className="bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md border border-red-600/50">
                
                {/* Back Button */}
                <button 
                    onClick={onBack} 
                    className="mb-6 text-red-400 hover:text-red-500 transition font-medium"
                >
                    &larr; Back to Home
                </button>

                <h1 className="text-3xl font-bold text-white mb-6 text-center">
                    {isLogin ? 'Welcome Back!' : 'Create Account'}
                </h1>
                
                {error && (
                    <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition duration-150"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition duration-150"
                            placeholder="Minimum 6 characters"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'LOG IN' : 'SIGN UP')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleSwitchMode}
                        className="text-sm text-red-400 hover:text-red-500 transition duration-200"
                    >
                        {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
