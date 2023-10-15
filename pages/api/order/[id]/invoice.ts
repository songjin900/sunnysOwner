import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { admin },
    query: { id },
  } = req;

  //Get order by order id and user
  if (req.method === "GET") {

    if (!admin){
      res.json({
        ok: false,
      });
      return;
    }
    
    //good
    const order = await client.order.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        billingAddress: true,
        shippingAddress: true,
        orderItem: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order){
      res.json({ok:false});
    }

    res.json({ ok: true, order });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET"], handler})
);
