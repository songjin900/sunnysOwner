import Layout from "@components/layout";
import { NextPage } from "next";
import client from "@libs/server/client";
import Link from "next/link";

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

const Users: NextPage<{ users: UsersResponse[] }> = ({ users }) => {

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
                        {users.map((user) => <tr key={user.id}>
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

export const getServerSideProps = async () => {

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
        },
    };
};

export default Users;