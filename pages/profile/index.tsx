import type { NextPage } from "next";
import Layout from "@components/layout";
import useUser from "@libs/client/useUser"
import Link from "next/link";
import useMutation from "@libs/client/useMutation";
import { useRouter } from "next/router";


const Profile: NextPage = () => {

    const { user, isLoading } = useUser();
    const router = useRouter()

    let name = "";
    if (user) {
        name = user.email ? user.email : ""
    }
    const [logoutUser, { loading, data: logoutData }] = useMutation("/api/users/logout")

    const onLogoutClicked = () => {
        logoutUser({});
        
        router.push(`/enter`);
    }

    return (
        <Layout hasTabBar title="Profile">
            <div className="bg-gray-100 w-full p-2 md:min-h-[38rem]">
                <div className="flex pl-5 items-cente pt-5 pb-2">
                    <div className="text-3xl">Hi</div>
                    <div className={"text-orange-300"}>{name}</div>
                </div>
                <div className="grid grid-rows-4 grid-cols-1 md:grid-rows-2 md:grid-cols-2 lg:grid-cols-4 bg-gray-100 p-2 md:gap-2">
                    {user?.accountType === "registered" ?
                        <Link legacyBehavior href={`/order/history`}>
                            <a className="bg-white p-2 cursor-pointer flex items-center md:items-start border h-[4rem] hover:border-orange-400 md:h-[15rem] md:rounded-2xl hover:md:shadow-2xl hover:md:shadow-orange-300 ">
                                <div className="flex flex-col pl-2">
                                    <span className="text-lg font-md text-gray-800">Order History - customer</span>
                                </div>
                            </a>
                        </Link> : null}
                    <Link legacyBehavior href={`/owner/history`}>
                        <a className="bg-white p-2 cursor-pointer flex items-center md:items-start border h-[4rem] hover:border-orange-400 md:h-[15rem] md:rounded-2xl hover:md:shadow-2xl hover:md:shadow-orange-300 ">
                            <div className="flex flex-col pl-2">
                                <span className="text-lg font-md text-gray-800">Sales - owner</span>
                            </div>
                        </a>
                    </Link>
                    {user?.accountType === "registered" ?
                        <Link legacyBehavior href={`/profile/detail`}>
                            <a className="bg-white p-2 cursor-pointer flex items-center md:items-start border h-[4rem] hover:border-orange-400 md:h-[15rem] md:rounded-2xl hover:md:shadow-2xl hover:md:shadow-orange-300 ">
                                <div className="flex flex-col pl-2">
                                    <span className="text-lg font-md text-gray-800">Personal Details</span>
                                </div>
                            </a>
                        </Link> : null}
                    {user?.accountType === "registered" ?
                            <button onClick={()=>onLogoutClicked()} className="bg-white p-2 cursor-pointer flex items-center md:items-start border h-[4rem] hover:border-orange-400 md:h-[15rem] md:rounded-2xl hover:md:shadow-2xl hover:md:shadow-orange-300 ">
                                <div className="flex flex-col pl-2">
                                    <span className="text-lg font-md text-gray-800">Sign Out</span>
                                </div>
                            </button>
                         : null}
                </div>
            </div>
        </Layout>
    );
};

export default Profile;