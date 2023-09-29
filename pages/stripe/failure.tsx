import { NextPage } from "next";
import Layout from "@components/layout";
import { getContact } from "@libs/client/contact";

const CheckOutFailurePage: NextPage = () => {

    return (
        <Layout title="Payment Failed" hasTabBar>
            <div className="px-4 md:px-20 py-4 bg-gray-100 w-full flex flex-col">
                <div className="text-3xl font-bold">
                    Payment Failed
                </div>
                <div className="text-lg mt-16 mb-6">
                    Sorry, your payment was not complete. If you have any problems, please contact our customer service for assistance.
                </div>
                <div className="">
                    <div className="text-lg mt-1">Please contact {getContact().businessEmail}</div>
                    <div className="text-lg mt-1">Please do not call the store as they do not have access to our web services or database and will be unable to help you with online orders.</div>
                </div>


            </div >
        </Layout>
    )
}

export default CheckOutFailurePage;