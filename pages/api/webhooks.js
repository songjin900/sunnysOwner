import Stripe from "stripe";
import { buffer } from "micro";

export const config = {
    api: {
        bodyParser: false,
    }
}

export default async function webhookHandler(req,res){
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
   
    if (req.method === 'POST'){
        const buf = await buffer(req);
        const sig = req.headers('stripe-signature');
        const webhookSecret = process.env.STRIPE_WEBHOOK_KEY;

        let event;

        try{
            if (!sig || !webhookSecret){
                return;
            }
            event = stripe.webhooks.constructEvent(buf,sig, webhookSecret);
        }
        catch (error){
            console.log(`Webhook error: ${error.message}`);
            return res.status(400).send(`Webhook error: ${error.message}`)
        }
        console.log('event', event);
        res.status(200).send()
    }
}