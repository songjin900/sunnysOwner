import { loadStripe } from "@stripe/stripe-js";

export const checkout = async (price: string) => {
  try {
    const { session } = await fetch(`/api/stripe/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ price }),
    }).then((res) => res.json());

    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_KEY as string
    );
    const error = await stripe?.redirectToCheckout({ sessionId: session.id });

    if (error) {
      if (error instanceof Error) throw new Error(error.message);
    } else {
      throw error;
    }
  } catch (error) {
    console.log(error);
  }
};
