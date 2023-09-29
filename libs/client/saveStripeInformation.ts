export interface stripeInfoResponse {
  ok: boolean;
}

export async function saveStripeInformation(
  orderId: string,
  csID: string,
  amount_total: string,
  city: string,
  country: string,
  line1: string,
  line2: string,
  postal_code: string,
  state: string,
  email: string,
  name: string,
  phone: string,
  piId: string,
  amount_received: string,
  client_secret: string,
  payment_method: string,
  payment_status: string
): Promise<stripeInfoResponse> {
  const response = await fetch("http://localhost:3000/api/stripe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Set the appropriate content type for your API
    },
    body: JSON.stringify({orderId,
        csID,
        amount_total,
        city,
        country,
        line1,
        line2,
        postal_code,
        state,
        email,
        name,
        phone,
        piId,
        amount_received,
        client_secret,
        payment_method,
        payment_status}),
  });

  if (!response.ok) {
    throw new Error("API error occurred"); // Throw an error to handle it in the calling function
  }

  const responseData: stripeInfoResponse = await response.json();
  return responseData;
}
