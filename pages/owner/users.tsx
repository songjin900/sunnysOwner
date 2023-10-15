import Layout from "@components/layout";
import { NextApiRequest, NextPage } from "next";
import client from "@libs/server/client";
import Link from "next/link";
import { withSsrSession } from "@libs/server/withSession";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface OrderResponse {
    id: string
    status: string
}

interface UsersResponse {
    id: string,
    email: string,
    originalEmail: string,
    status: string,
    order: OrderResponse[]
}

const Users: NextPage<{ users: UsersResponse[], isLogin: boolean }> = ({ users, isLogin }) => {
    const router = useRouter()

    useEffect(() => {
        if (!isLogin) {
            router.push("/shop")
        }
    }, [isLogin])
    return (
        <Layout title="Home" hasTabBar>
            <div className="px-4 md:px-20 py-4 bg-gray-100 w-full">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Orig Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Orders
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLogin && users.map((user) => <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{user.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{user.originalEmail}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-blue-800 underline">
                                {
                                    user.order.map((order) =>
                                        <Link key={order.id} legacyBehavior href={`/order/${order.id}/invoice`}>
                                            <div className="cursor-pointer">{order.id} - status: {order.status}</div>
                                        </Link>)
                                }
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </Layout>
    )
}

export const getServerSideProps = withSsrSession(async function (context: { query: { id: any; }; req: NextApiRequest }) {
    let isLogin = false
    try {

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
            else {
                return {
                    props: {
                        isLogin: false
                    }
                }
            }
        }
        catch (err) {
            isLogin = false;
            context.req.session.destroy();
            return {
                props: {
                    isLogin: false
                }
            }
        }
    }
    catch (err) {
        console.log(err);
        return {
            props: {
                isLogin: false
            }
        }
    }

    const users = await client.user.findMany({
        select: {
            id: true,
            email: true,
            originalEmail: true,
            status: true,
            order: {
                select: {
                    id: true,
                    status: true,
                }
            }
        }
    });

    return {
        props: {
            users: JSON.parse(JSON.stringify(users)),
            isLogin: JSON.parse(JSON.stringify(isLogin)),
        },
    };
});

export default Users;