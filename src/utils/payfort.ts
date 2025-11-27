// utils/payfort.ts
import crypto from 'crypto-js';

export class PayFortUtils {
    static generateSignature(params: Record<string, any>, shaPhrase: string): string {
        const sortedKeys = Object.keys(params).sort();
        let signatureString = shaPhrase;

        sortedKeys.forEach(key => {
            signatureString += `${key}=${params[key]}`;
        });

        signatureString += shaPhrase;

        return crypto.SHA256(signatureString).toString(crypto.enc.Hex);
    }

    static verifyResponseSignature(response: Record<string, any>, shaPhrase: string): boolean {
        const { signature: responseSignature, ...paramsToVerify } = response;
        const calculatedSignature = this.generateSignature(paramsToVerify, shaPhrase);
        return calculatedSignature === responseSignature;
    }

    static generateMerchantReference(): string {
        return `TOKEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}