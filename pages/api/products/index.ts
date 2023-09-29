import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    let {
      query: { menuCategoryId, subMenuCategoryId, search, eventDaysId, sort, page },
    } = req;

    const orderBy: any = {};

    if (sort) {
      if (sort === "na") {
        orderBy.name = "asc";
      } else if (sort === "nd") {
        orderBy.name = "desc";
      } else if (sort === "pa") {
        orderBy.price = "asc";
      } else if (sort === "pd") {
        orderBy.price = "desc";
      } else if (sort === "la") {
        orderBy.createdAt = "desc";
      }
    } else {
      orderBy.createdAt = "desc";
    }

    const where: any = {
      stockQuantity: { gt: 0 },
    };

    if (search) {
      where.name = {
        contains: search.toString(),
      };
    } else if (menuCategoryId && subMenuCategoryId) {
      where.productSubMenuCategory = {
        subMenuCategory: {
          id: Number(subMenuCategoryId),
          menuCategoryId: Number(menuCategoryId),
        },
      };
    } else if (menuCategoryId) {
      where.productSubMenuCategory = {
        subMenuCategory: {
          menuCategoryId: Number(menuCategoryId),
        },
      };
    } else if (subMenuCategoryId) {
      where.productSubMenuCategory = {
        subMenuCategory: {
          id: Number(subMenuCategoryId),
        },
      };
    }

    if (eventDaysId) {
      where.productEventDay = {
        some: {
          eventDays: {
            id: Number(eventDaysId),
          },
        },
      };
    }

    //Exclude Accssories
    if (!menuCategoryId && !subMenuCategoryId && !search&& !eventDaysId){
      where.productSubMenuCategory = {
        subMenuCategory: {
          NOT: {
            menuCategoryId: 5
          }
        },
      };
    }

    const productCount = await client.product.count({
      where
    })

    const PER_PAGE = 12
  
    const products = await client.product.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        productEventDay: {
          select: {
            eventDaysId: true,
          },
        },
        productSubMenuCategory: {
          select: {
            id: true,
            subMenuCategoryId: true,
          },
        },
      },

      take: PER_PAGE,
      skip: ((page ? +page : 1) - 1) * PER_PAGE,
    });


    res.json({
      ok: true,
      products,
      pages: Math.ceil(productCount / PER_PAGE),

    });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET"], handler })
);