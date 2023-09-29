import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";
import { Cart } from "@prisma/client";

interface validateQuantity {
  message: string;
  type: "update" | "remove";
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
  } = req;

  //somehow where:{userId} is returning value even user is null
  if (req.method === "GET") { 

    if (!user){
        res.json({
            ok:false,
            quantity: 0
        })
        return;
    }  

    const cartQuantity = await client.cart.aggregate({
      where: {
        userId: user.id,
      },
      _sum: {
        quantity: true,
      },
    });

    res.json({
      ok: true,
      quantity: cartQuantity._sum.quantity,
    });
  }

}

export default withApiSession(
  withHandler({ methods: ["GET"], handler })
);
