import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { id },
  } = req;

  if (req.method === "GET") {
    const product = await client.product.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        productImage: {
          select: {
            image: true,
            orderIndex: true,
          },
        },
        productSubMenuCategory: {
          include: {
            subMenuCategory: {
              include: {
                menu: true,
              },
            },
          },
        },
      },
    });

    const terms = product?.name.split(" ").map((word) => ({
      name: {
        contains: word,
      },
    }));


    const relatedProducts = await client.product.findMany({
      where: {
        OR: terms,
        AND: {
          id: {
            not: Number(product?.id),
          },
        },
      },
    });

    res.json({
      ok: true,
      product,
      relatedProducts,
    });
  }
}

export default withApiSession(withHandler({ methods: ["GET"], handler }));
