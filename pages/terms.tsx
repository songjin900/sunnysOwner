import Layout from '@components/layout';
import { NextPage } from 'next';
import { getContact } from '@libs/client/contact';

const TermsPage: NextPage = () => {
  return (
    <Layout title="Terms" hasTabBar>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>

      <h2 className="text-lg font-semibold mb-2">General Terms:</h2>
      <p>
        a. By accessing and using our online flower shop ({"\"the Website\""}), you agree to be bound by these terms and conditions.
      </p>
      <p>
        b. The terms {"\"we,\""} {"\"us,\""} or {"\"our\""} refer to {`Sunny's Flowers`}, and {"\"you\""} or {"\"your\""} refers to the user or customer.
      </p>

      <h2 className="text-lg font-semibold my-2">Product Availability:</h2>
      <p>
        a. All products displayed on the Website are subject to availability. In the event that a particular flower or arrangement becomes unavailable, we reserve the right to substitute it with a comparable alternative of equal or greater value.
      </p>

      <h2 className="text-lg font-semibold my-2">Ordering and Payment:</h2>
      <p>
        a. To place an order, you must provide accurate and up-to-date information, including your name, contact details, and delivery address.
      </p>
      <p>
        b. Payment must be made in full at the time of ordering. We exclusively accept payments through Stripe.
      </p>

      <h2 className="text-lg font-semibold my-2">Delivery:</h2>
      <p>
        a. We strive to deliver all orders promptly and within the specified time frame. However, delivery times are estimates and may be subject to unforeseen circumstances, including but not limited to weather conditions, transportation issues and product availability.
      </p>
      <p>
        b. It is your responsibility to provide accurate delivery information. We will not be held liable for any delays or failed deliveries resulting from incorrect or insufficient information provided by you.
      </p>

      <h2 className="text-lg font-semibold my-2">Quality Assurance:</h2>
      <p>
        a. We take utmost care to ensure that our flowers are fresh and in excellent condition. However, please note that flowers are perishable products, and their lifespan may vary.
      </p>
      <p>
        b. Due to the nature of flowers, we do not offer refunds or exchanges for delivered flowers or live plants.
      </p>

      <h2 className="text-lg font-semibold my-2">Customer Service:</h2>
      <p>
        a. If you encounter any issues with your order, please contact our customer service team @ {getContact().businessEmail}.
      </p>
      <p>
        b. Our customer service team will make reasonable efforts to address your concerns and resolve any issues to your satisfaction.
      </p>

      <h2 className="text-lg font-semibold my-2">Intellectual Property:</h2>
      <p>
        a. All content on the Website, including images, text, and logos, is protected by copyright and other intellectual property laws. You agree not to reproduce, distribute, or modify any content without our prior written consent.
      </p>

      <h2 className="text-lg font-semibold my-2">Limitation of Liability:</h2>
      <p>
       a. We shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your use of the Website or any products purchased through it.
      </p>

      {/* <h2 className="text-lg font-semibold my-2">Governing Law and Jurisdiction:</h2>
      <p>
        a. These terms and conditions shall be governed by and construed in accordance with the laws of [your jurisdiction]. Any disputes arising from these terms and conditions or your use of the Website shall be subject to the exclusive jurisdiction of the courts in [your jurisdiction].
      </p> */}
    </div>
    </Layout>
  );
};

export default TermsPage;
