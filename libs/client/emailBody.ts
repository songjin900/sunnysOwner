import client from "@libs/server/client";
import { getContact } from "./contact";

export const emailBody = async (orderNumber: string,
     customerName: string, 
     orderDate: string,
     totalCostAfterTax: string,
     address: string,
     city: string,
     province: string,
     postCode: string,
     orderItemBody: string,
     ) => {
  try {
    const businessEmail = getContact().businessEmail
    let emailBody = `
    <html>
    <head>
      <title>Your Order is Complete! #${orderNumber}</title>
    </head>
    <body>
      <h1>Thank You for Your Order!</h1>
      <p>Hello ${customerName},</p>
      <p>We are excited to inform you that your order has been successfully completed.</p>
    
      <h2>Order Details</h2>
      <table>
        <tr>
          <td>Order ID:</td>
          <td>#${orderNumber}</td>
        </tr>
        <tr>
          <td>Order Date:</td>
          <td>${orderDate}</td>
        </tr>
        <tr>
          <td>Total Amount:</td>
          <td>${totalCostAfterTax}</td>
        </tr>
      </table>
    
      <h2>Shipping Address</h2>
      <p>${customerName}</p>
      <p>${address}</p>
      <p>${city}, ${province}, ${postCode}</p>
    
      <h2>Order Items</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>` +
          orderItemBody
        +`</tbody>
        <tfoot>
          <tr>
            <td colspan="3">Total:</td>
            <td>$${totalCostAfterTax}</td>
         </tr>
        </tfoot>
      </table>
      <p>(Shipping and HST included)</p>
    
      <p>Thank you for shopping with us. If you have any questions or need further assistance, feel free to contact our support team at ${businessEmail}</p>
    
      <p>Best Regards,</p>
      <p>Sunnys Flowers</p>
    </body>
    </html>
    `;

    return emailBody; // Since the response is already parsed as JSON, we can directly return it
  } catch (err: any) {
    const errorLog = await client.errorLog.create({
      data: {
        errorPage: "/libs/client/emailBody.ts",
        errorMessage: err.message ?? "",
      },
    });
    throw err; // Rethrow the error so the calling function can handle it
  }
};
