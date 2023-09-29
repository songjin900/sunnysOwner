import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
    body: {
      firstName,
      lastName,
      address,
      city,
      province,
      postCode,
      phone,
      firstNameB,
      lastNameB,
      addressB,
      cityB,
      provinceB,
      postCodeB,
      phoneB,
      email,
      deliveryDayIndex,
    },
  } = req;

  if (req.method === "POST") {

    if(!user){
      res.json({
        ok: false,
      });
      return;
    }

    //Archive other email.
    //1. User logins with abc.com (Registered) id:1
    //2. User logins with def.com (Registered) id:2
    //3. User decided to change email at the order page to abc.com
    //4. then first abc.com(id:1) will be archived to abc.comarchived999 since we only allow unique email
    
    const payload = Math.floor(1000 + Math.random() * 9000) + "";
    const archiveUserEmail = await client.user.updateMany({
      where: {
        NOT: { id: user.id },
        email,
      },
      data: {
        email: email + "archived" + payload,
        status: 'archived'
      },
    });

    //Update user Email
    await client.user.update({
      where: {
        id: user.id,
      },
      data: {
        email,
      },
    });

    //Possible cases
    // One New
    // One New and many Complete
    // == There must be one New
    //good
    const orderExists = await client.order.findFirst({
      where: {
        userId: user.id,
        status: "new",
      },
    });

    //???
    const userFound = await client.user.findUnique({
      where: {
        id: user.id,
      },
    });

    const orderIdExists = orderExists ? orderExists.id : -1;

    const today = new Date();
    const deliveryDate = new Date();
    deliveryDate.setDate(today.getDate() + Number(deliveryDayIndex));

    await client.order.update({
      where: {
        id: orderIdExists,
      },
      data: {
        deliveryDate: deliveryDate,
      },
    });

    const shippingAddress = await client.shippingAddress.upsert({
      where: {
        orderId: orderIdExists,
      },
      update: {
        firstName,
        lastName,
        address,
        city,
        province,
        postCode,
        phone,
      },

      create: {
        firstName,
        lastName,
        address,
        city,
        province,
        postCode,
        phone,
        order: {
          connect: {
            id: orderIdExists,
          },
        },
      },
    });

    const billingAddress = await client.billingAddress.upsert({
      where: {
        orderId: orderIdExists,
      },
      update: {
        firstName: orderExists?.useSameAddress ? firstName : firstNameB,
        lastName: orderExists?.useSameAddress ? lastName : lastNameB,
        address: orderExists?.useSameAddress ? address : addressB,
        city: orderExists?.useSameAddress ? city : cityB,
        province: orderExists?.useSameAddress ? province : provinceB,
        postCode: orderExists?.useSameAddress ? postCode : postCodeB,
        phone: orderExists?.useSameAddress ? phone : phoneB,
      },
      create: {
        firstName: orderExists?.useSameAddress ? firstName : firstNameB,
        lastName: orderExists?.useSameAddress ? lastName : lastNameB,
        address: orderExists?.useSameAddress ? address : addressB,
        city: orderExists?.useSameAddress ? city : cityB,
        province: orderExists?.useSameAddress ? province : provinceB,
        postCode: orderExists?.useSameAddress ? postCode : postCodeB,
        phone: orderExists?.useSameAddress ? phone : phoneB,
        order: {
          connect: {
            id: orderIdExists,
          },
        },
      },
    });
    res.json({ ok: true, billingAddress });

    // if (useSameAddress) {
    //   const billingAddress = await client.billingAddress.update({
    //     where: {
    //       orderId: orderIdExists,
    //     },
    //     data: {
    //         firstName, lastName, address, city, province, postCode, phone
    //     },
    //   });
    //   res.json({ ok: true, billingAddress });
    // } else {
    //   const billingAddress = await client.billingAddress.upsert({
    //     where: {
    //       orderId: orderIdExists,
    //     },
    //     update: {
    //         firstName, lastName, address, city, province, postCode, phone

    //     },
    //     create: {
    //         firstName, lastName, address, city, province, postCode, phone ,

    //       order: {
    //         connect: {
    //           id: orderIdExists,
    //         },
    //       },
    //     },
    //   });
    //   res.json({ ok: true, billingAddress });

    // }
  }
}

export default withApiSession(withHandler({ methods: ["POST"], handler }));
