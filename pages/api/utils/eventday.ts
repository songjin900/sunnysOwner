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

    const eventDays = await client.eventDays.findMany({
      where:{
        visibility: true
      }
    })
  
    res.json({
      ok: true,
      eventDays,
    });
  }

}


export default withApiSession(
  withHandler({ methods: ["GET"], handler })
);
