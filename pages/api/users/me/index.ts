import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  try {
    const profile = await client.user.findUnique({
      where: {
        id: req.session.admin?.id,
      },
    });

    if (!profile || (profile && profile.status !== "active"))
      throw new Error("not in active status");

    if (profile) {
      res.json({
        ok: true,
        profile,
      });
    }
  } catch (Error) {
    await req.session.destroy();
    res.json({
      ok: false,
      profile: {},
    });
  }
}

export default withApiSession(withHandler({ methods: ["GET"], handler }));
