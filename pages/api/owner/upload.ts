import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {

  if (req.method === "POST") {
    const {
      body: {
        name,
        localImage,
        price,
        description,
        subcategory,
        stockQuantity,
        photoId,
        photos,
        eventDay,
        size
      },
    } = req;

    const payload = Math.floor(1000 + Math.random() * 9000) + "";

    const product = await client.product.create({
      data: {
        name,
        localImage,
        price: +price,
        description,
        stockQuantity: Number(stockQuantity),
        image: photoId,
        modelNumber: name + payload,
        size
      },
    });

    const subCatMenu = await client.productSubMenuCategory.create({
      data: {
        subMenuCategoryId: Number(subcategory),
        productId: Number(product.id),
      },
    });

    const menuName = await client.subMenuCategory.findFirst({
      where: {
        id: subCatMenu.subMenuCategoryId
      },
      include: {
        menu: true
      }
    })
    
    const firstCharacter = menuName?.menu.category.charAt(0).toUpperCase() || "";
    const secondCharacter= menuName?.subCategory?.charAt(0).toUpperCase() || "";
    const productID = product.id;

    await client.product.update({
      where: {
        id: productID
      },
      data: {
        modelNumber: firstCharacter.toString()+secondCharacter.toString()+productID.toString()
      }
    })

    if (photos) {
      await Promise.all(
        photos.filter((pt:any)=>pt.orderIndex !== 1).map(async (photo: any) => {
          await client.productImage.create({
            data: {
              image: photo.photoId,
              orderIndex: photo.orderIndex,
              product: {
                connect: {
                  id: Number(product.id),
                },
              },
            },
          });
        })
      );
    }

    if (eventDay) {
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
  }
}

export default withApiSession(
  withHandler({ methods: ["POST"], handler })
);