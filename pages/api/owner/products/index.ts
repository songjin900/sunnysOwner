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
  } = req;

  if (!admin){
    res.json({ ok: false });
    return;
  }
  
  if (req.method === "GET") {
    const products = await client.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stockQuantity: true,
        image: true,
        localImage: true,
        productEventDay: {
          select: {
            eventDaysId: true,
          },
        },
        description: true
      },
    });
    res.json({
      ok: true,
      products: products,
    });
  }

  //update Status
  if (req.method === "POST") {
    const {
      body: { id, name, price, stockQuantity, eventDay, description, size },
    } = req;
    try {
      const product = await client.product.update({
        where: {
          id,
        },
        data: {
          name,
          price: Number(price),
          stockQuantity: Number(stockQuantity),
          description,
          size
        },
      });

      if (eventDay) {
        await client.productEventDay.deleteMany({
          where: {
            productId: id,
          },
        });

        await Promise.all(
          eventDay.map(async (et: number) => {
            await client.productEventDay.create({
              data: {
                productId: Number(product.id),
                eventDaysId: Number(et),
              },
            });
          })
        );
      }

      res.json({
        ok: true,
        product,
      });
      return;
    } catch (err) {
      res.json({
        ok: false,
        product: null,
      });
    }
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handler })
);
