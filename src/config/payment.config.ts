import Stripe from 'stripe';
import {PayPalServerSDKClient } from '@paypal/paypal-server-sdk';

// Stripe Configuration
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion: "2025-02-24.acacia" as const,
});



