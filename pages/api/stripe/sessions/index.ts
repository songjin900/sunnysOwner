import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";

const stripeClient = require("stripe")(process.env.STRIPE_SECRET_KEY as string);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const {
        body: { price },
      } = req;

      if (!price) {
        return res.status(400).json({ error: "Bad Request!" });
      }

      try {
        const session = await stripeClient.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "cad",
                product_data: {
                  name: "Your Product",
                },
                unit_amount: Math.ceil(Number(price) * 100), // Amount in cents ($20)z
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${req.headers.origin}/stripe/success?sessionId={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/stripe/failure`,
        });

        return res.status(201).json({ session });
      } catch (err: any) {
        await client.errorLog.create({
          data: {
            errorPage: "/api/stripe/sessions/index - After session",
            errorMessage: err.message ?? "",
          },
        });
      }

      // If using HTML forms you can redirect here
      // return res.redirect(303, session.url)
    } catch (error: any) {
      const errorLog = await client.errorLog.create({
        data: {
          errorPage: "/api/stripe/sessions/index",
          errorMessage: error.message ?? "",
        },
      });

      return res.status(500);
      // return res.status(err.statusCode || 500).json({ message: err.message })
    }
  }

  res.setHeader("Allow", "POST");
  res.status(405).end("Method Not Allowed");
};

export default handler;
