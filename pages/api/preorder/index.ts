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

  try {
    //Create new order when user click "checkout"
    if (req.method === "POST") {

      if (!user){
        res.json({
          ok: false,
        });
        return;
      }

      //good
      const newOrderExists = await client.order.findFirst({
        where: {
          userId: user.id,
          status: "new",
        },
        select: {
          id: true,
        },
      });

      if (!newOrderExists) {
        res.json({
          ok: false,
        });
        return;
      }

      const cart = await client.cart.findMany({
        where: {
          userId: user.id,
        },
      });

      if (!cart || cart.length === 0) {
        res.json({
          ok: false,
        });
        return;
      }

      const orderId = newOrderExists.id;

      await Promise.all(
        cart.map(async (item) => {
          await client.preOrderItem.create({
            data: {
              quantity: item.quantity,
              order: {
                connect: {
                  id: orderId,
                },
              },
              product: {
                connect: {
                  id: item.productId,
                },
              },
            },
          });
        })
      );

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
