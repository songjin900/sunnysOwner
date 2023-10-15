import { NextApiRequest, NextPage } from "next";
import Layout from "@components/layout";

import Link from "next/link";
import { withSsrSession } from "@libs/server/withSession";
import client from "@libs/server/client";
import { useEffect } from "react";
import { useRouter } from "next/router";

const Owner: NextPage<{ isLogin: boolean }> = ({ isLogin }) => {
    const router = useRouter()

    useEffect(() => {
        if (!isLogin) {
            router.push("/shop")
        }
    }, [isLogin])

    return (
        <Layout title="OwnerPage" hasTabBar>
            {
                isLogin ?
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
                    : null
            }
        </Layout>
    )
}

export const getServerSideProps = withSsrSession(async function (context: { query: { id: any; }; req: NextApiRequest }) {
    try {
        let isLogin = false

        try {
            const profile = await client.admin.findUnique({
                where: {
                    id: context.req.session.admin?.id
                },
            });

            //Do not remove this.
            //Somehow context.req.session.user === undefined does not get captured in the if statement
            //so I am forcing it to be catched in the catch block by adding 1 to undefined.
            if (context.req.session.admin) {
                const test = context.req.session.admin?.id + 1;
            }

            if (context.req.session.admin === undefined || context.req.session.admin.id === undefined) {
                isLogin = false;
                context.req.session.destroy();
            }
            if (profile){
                isLogin = true;
            }
        }
        catch (err) {
            isLogin = false;
            context.req.session.destroy();
        }

        return {
            props: {
                isLogin,
            }
        }
    }
    catch (err) {
        console.log(err);
    }
});

export default Owner;