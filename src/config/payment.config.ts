import Stripe from 'stripe';
import { Client, Environment, LogLevel, OrdersController} from '@paypal/paypal-server-sdk'

// Stripe Configuration
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion: "2025-02-24.acacia" as const,
});

// paypal Configuration
const environment = process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox;
const logging = {
    logLevel : process.env.NODE_ENV === 'production' ? LogLevel.Error: LogLevel.Info,
    logRequest:{
        logBody:process.env.NODE_ENV !== 'production' ,
    }, 
    logResponse:{
        logBody:process.env.NODE_ENV !== 'production' ,
    }
};

export const paypalClient = new Client({
    clientCredentialsAuthCredentials:{
        oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    },
    environment,
    logging,
});

export const paypalOrdersController = new OrdersController(paypalClient);