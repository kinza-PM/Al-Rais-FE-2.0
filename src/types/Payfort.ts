// types/payfort.ts
export interface PayFortConfig {
    access_code: string;
    merchant_identifier: string;
    sha_request_phrase: string;
    sha_response_phrase: string;
    payfort_url: string;
}

export interface TokenizationParams {
    service_command: 'TOKENIZATION';
    access_code: string;
    merchant_identifier: string;
    merchant_reference: string;
    language: string;
    return_url: string;
    signature: string;
    card_number?: string;
    expiry_date?: string;
    card_security_code?: string;
    card_holder_name?: string;
}

export interface TokenizationResponse {
    service_command: string;
    access_code: string;
    merchant_identifier: string;
    merchant_reference: string;
    signature: string;
    response_message: string;
    status: string;
    card_bin?: string;
    token_name?: string;
    expiry_date?: string;
    card_holder_name?: string;
    return_url?: string;
}