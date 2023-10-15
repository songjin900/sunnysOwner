import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {

  const {
    body: { password }
  } = req;

  const admin = await client.admin.findUnique({
    where: {
      password
    }
  });

  if (!admin) {
    return res.status(404).end();
  }

  req.session.admin = {
    id: admin.id,
  };
  await req.session.save();

  return res.json({
    ok: true,
  });
}

export default withApiSession(withHandler({ methods: ["POST"], handler, isPrivate: false }));