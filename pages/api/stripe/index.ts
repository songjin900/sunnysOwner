import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: {
      csID,
      amount_total,
      city,
      country,
      line1,
      line2,
      post_code,
      state,
      email,
      name,
      phone,
      piId,
      amount_received,
      client_secret,
      payment_method,
      payment_status,
      orderId,
    },
  } = req;

  try {
    //Create new order when user click "checkout"
    if (req.method === "POST") {
      const stripePayment = await client.stripePayment.create({
        data: {
          csID,
          amount_total,
          city,
          country,
          line1,
          line2,
          post_code,
          state,
          email,
          name,
          phone,
          piId,
          amount_received,
          client_secret,
          payment_method,
          payment_status,
          order:{
            connect:{
              id: orderId 
            }
          }
        },
      });
      res.json({
        ok: true,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
    });
  }
}

export default withApiSession(withHandler({ methods: ["POST"], handler }));
