import { NextPage } from "next";
import Layout from "@components/layout";

import Link from "next/link";

const Owner: NextPage = () => {
    return (
        <Layout title="OwnerPage" hasTabBar>
            <div className="px-4 md:px-20 py-4 bg-gray-100 w-full">
                <div className="grid grid-cols-4 grid-rows-2 h-1/4 md:h-1/2 gap-2">
                    <Link legacyBehavior href={`/owner/history`}>
                        <div className="bg-green-300 hover:bg-green-500 cursor-pointer rounded-lg flex items-center justify-center">Orders</div>
                    </Link>
                    <Link legacyBehavior href={`/owner/users`}>
                        <div className="bg-green-300 hover:bg-green-500 cursor-pointer rounded-lg flex items-center justify-center">Users</div>
                    </Link>
                    <Link legacyBehavior href={`/owner/upload`}>
                        <div className="bg-green-300 hover:bg-green-500 cursor-pointer rounded-lg flex items-center justify-center">Upload</div>
                    </Link>
                    <Link legacyBehavior href={`/owner/products`}>
                        <div className="bg-green-300 hover:bg-green-500 cursor-pointer rounded-lg flex items-center justify-center">Products</div>
                    </Link>
                    <Link legacyBehavior href={`/owner/group`}>
                        <div className="bg-green-300 hover:bg-green-500 cursor-pointer rounded-lg flex items-center justify-center">Group</div>
                    </Link>
                </div>
            </div >
        </Layout>
    )
}

export default Owner;