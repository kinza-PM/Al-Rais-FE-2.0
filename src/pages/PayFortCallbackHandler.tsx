// pages/PayFortCallbackHandler.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PayFortUtils } from '../utils/payfort';
import type { TokenizationResponse } from '../types/Payfort';

const PAYFORT_CONFIG = {
    sha_response_phrase: "TestSHAOUT1!",
};

interface PayFortCallbackHandlerProps {
    onTokenReceived?: (tokenData: TokenizationResponse) => void;
    onError?: (error: string) => void;
}

export const PayFortCallbackHandler: React.FC<PayFortCallbackHandlerProps> = ({
    onTokenReceived,
    onError,
}) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Convert URLSearchParams to object
                const responseData: Record<string, string> = {};
                searchParams.forEach((value, key) => {
                    responseData[key] = value;
                });

                // Verify response signature
                const isValid = PayFortUtils.verifyResponseSignature(
                    responseData,
                    PAYFORT_CONFIG.sha_response_phrase
                );

                if (!isValid) {
                    throw new Error('Invalid response signature');
                }

                const tokenResponse = responseData as unknown as TokenizationResponse;

                // Store response in localStorage for parent window
                localStorage.setItem('payfort_token_response', JSON.stringify(tokenResponse));

                // Close the popup and redirect
                setTimeout(() => {
                    if (window.opener) {
                        window.close();
                    } else {
                        navigate('/flight-booking', { replace: true });
                    }
                }, 1000);

                // Call the callback if provided
                if (tokenResponse.status === '00' && onTokenReceived) {
                    onTokenReceived(tokenResponse);
                } else if (tokenResponse.status !== '00' && onError) {
                    onError(tokenResponse.response_message || 'Tokenization failed');
                }

            } catch (error) {
                console.error('PayFort callback error:', error);

                localStorage.setItem('payfort_token_response', JSON.stringify({
                    status: '99',
                    response_message: error instanceof Error ? error.message : 'Callback processing failed'
                }));

                setTimeout(() => {
                    if (window.opener) {
                        window.close();
                    } else {
                        navigate('/flight-booking', { replace: true });
                    }
                }, 1000);

                if (onError) {
                    onError(error instanceof Error ? error.message : 'Callback processing failed');
                }
            }
        };

        handleCallback();
    }, [searchParams, navigate, onTokenReceived, onError]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Processed</h2>
                <p className="text-gray-600 mb-4">
                    Your payment has been processed successfully. Redirecting...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};