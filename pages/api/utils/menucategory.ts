import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

/*
This is specific handler for userDetail
Allows you to GET and POST
*/

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) { 

  if (req.method === "GET") {  
    const menuCategory = await client.menuCategory.findMany({
      where: {
        visibility: true
      },
      select:{
        id: true,
        categoryDisplay:true,
        category: true ,
        categoryIndex: true,
        description:true,
        subDescription: true,
        subMenuCategory: {
          select:{
            id: true,
            subCategoryDisplay: true,
            subCategory:true,
            subcategoryIndex: true,
            visibility:true,
            platform: true,
            image: true,
            menuCategoryId: true
          }
        }
      }
    })
  
    res.json({
      ok: true,
      menuCategory,
    });
  }
}


export default withApiSession(
  withHandler({ methods: ["GET"], handler })
);
 