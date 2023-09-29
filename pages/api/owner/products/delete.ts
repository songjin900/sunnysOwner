import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {

  //update Status
  if (req.method === "POST") {
    const {
      body: { productId },
    } = req;
    try {
        const deleteEventDay = await client.productEventDay.deleteMany({
            where: {
                productId
            }
        })

        const deleteSubMenuCategory = await client.productSubMenuCategory.deleteMany({
            where: {
                productId
            }
        })

        const deleteProduct = await client.product.delete({
            where: {
                id: productId
            }
        })  

      res.json({
        ok: true,
      });
      return;

    } catch (err) {
      res.json({
        ok: false,
      });
    }
  }
}

export default withApiSession(
  withHandler({ methods: ["POST"], handler })
);
