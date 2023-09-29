import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {

    const {
      session: { user },
    } = req;

    await client.token.deleteMany({
        where: {
            userId: user?.id
        }
    })
    await req.session.destroy();

    res.json({ ok: true });
}

export default withApiSession(withHandler({ methods: ["POST"], handler, isPrivate: false }));