import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {

  const {
    body: { email }
  } = req;

  //1. Check if there is token
  //2. If Token: 
  
  //If you enter this page then either your account is deleted or you are NEW
  const maxUserId = await client.user.aggregate({
    _max: {
      id: true,
    },
  });

  let payload = Math.floor(100000 + Math.random() * 900000) + "";

  let nextUserId = 1;

  if (maxUserId?._max?.id) {
    nextUserId = maxUserId._max.id + 1;
  }

  const token = await client.token.create({
    data: {
      payload,      
      user: {
        connectOrCreate: {
          where: {
            email,
          },
          create: {
            email,
            originalEmail: email
          },
        },
      },
    },
  });

 
  if (!token) {
    return res.status(404).end();
  }

  req.session.user = {
    id: token.userId,
  };
  await req.session.save();
  await client.token.deleteMany({
    where: {
      userId: token.userId,
    },
  });

  return res.json({
    ok: true,
  });
}

export default withApiSession(withHandler({ methods: ["POST"], handler, isPrivate: false }));