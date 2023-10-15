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
    body: { id, name },
  } = req;

  if (!admin){
    res.json({ ok: false });
    return;
  }

  if (req.method === "GET") {
    const group = await client.group.findMany({
      include: {
        product: true,
      },
    });
    res.json({
      ok: true,
      group,
    });
  }

  //update Status
  if (req.method === "POST") {
    try {
      const group = await client.group.upsert({
        where: {
          id,
        },
        update: {
          name,
        },
        create: {
          name
        }
      });

      res.json({
        ok: true,
        group,
      });
      return;
    } catch (err) {
      res.json({
        ok: false,
        group: null,
      });
    }
  }
}

export default withApiSession(withHandler({ methods: ["GET","POST"], handler }));
