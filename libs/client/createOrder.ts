import client from "@libs/server/client";

export interface OrderDataResponse {
  ok: boolean;
  orderNumber: string;
  orderId: string;
}

export const createOrder = async (
  userId: string
): Promise<OrderDataResponse> => {
  try {
    let url = `${process.env.DEV_URL}/api/payment`;
    if (process.env.NODE_ENV !== "development") {
      url = `${process.env.PROD_URL}/api/payment`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("API error occurred"); // Throw an error to handle it in the calling function
    }

    const data = await response.json();

    return data; // Since the response is already parsed as JSON, we can directly return it
  } catch (err: any) {
    const errorLog = await client.errorLog.create({
      data: {
        errorPage: "/success/tsx",
        errorMessage: err.message ?? "",
      },
    });
    throw err; // Rethrow the error so the calling function can handle it
  }
};
