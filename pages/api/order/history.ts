import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
  } = req;

  //Checkout page
  if (req.method === "GET"){

    if (!user){
      res.json({
        ok: false,
      });
      return;
    }
    const order = await client.order.findMany({
      where:{
        userId: user.id,
        status: "complete"
      },
      include:{
        billingAddress: true,
        shippingAddress: true,
        orderItem: {
          include:{
            product: true
          }
        }
      }, 
      orderBy: {
        id:"desc"
      }
    })

    res.json({ ok: true, order});
  }

}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handler })
);
