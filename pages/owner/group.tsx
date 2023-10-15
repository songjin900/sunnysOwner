import Layout from "@components/layout";
import { NextApiRequest, NextPage } from "next";
import Link from "next/link";
import useMutation from "@libs/client/useMutation";
import { useForm } from "react-hook-form";
import Input from "@components/input";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Checkmark from "@components/checkmark";
import { Group, Product } from "@prisma/client";
import Image from "next/image";
import { withSsrSession } from "@libs/server/withSession";
import client from "@libs/server/client";
import { useRouter } from "next/router"

interface productWithGroup extends Group {
    product: Product[];
}

interface groupResponse {
    ok: boolean;
    group: productWithGroup[]
}

interface groupForm {
    id: number,
    name: string
}

const GroupPage: NextPage<{ isLogin: boolean }> = ({ isLogin }) => {
    const [updateGroup] = useMutation("/api/owner/group");
    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<groupForm>();
    const [selectedId, setSelectedId] = useState<number>();
    const [selectedName, setSelectedName] = useState<string>();
    const [showImage, setShowImage] = useState(false);
    const router = useRouter();

    const { data, mutate } = useSWR<groupResponse>(`/api/owner/group`);

    const clearId = () => {
        setSelectedId(-1);
        setSelectedName("");
    }

    const selectedProduct = (id: number, name: string) => {

        if (id && name) {
            setSelectedId(id);
            setSelectedName(name);
        }
    }

    const onValid = ({ id, name }: groupForm) => {
        if (!data || !data?.group)
            return

        const index = data.group.findIndex(item => item.id === id);

        mutate({
            ...data,
            group: [
                ...(data?.group?.slice(0, index) || []),
                {
                    ...(data?.group?.[index] || {}),
                    name: name,
                },
                ...(data?.group?.slice(index + 1) || [])
            ]
        }, false)

        updateGroup({ id, name });

        setShowImage(true);

        const timer = setTimeout(() => {
            setShowImage(false);
        }, 1000);
        return () => clearTimeout(timer);
    }

    useEffect(() => {
        if (selectedId) {
            setValue("id", selectedId)
            setValue("name", selectedName ?? "");
        }
    }, [selectedId, selectedName, setValue])


    useEffect(() => {
        if (!isLogin) {
            router.push("/shop")
        }
    }, [isLogin])

    return (
        <Layout title="Home" hasTabBar>
            {
                <Checkmark showIcon={showImage} />
            }
            <div className="px-4 md:px-20 py-4 bg-gray-100 w-full">
                <div className="flex">
                    <table className=" divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    images
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data?.group?.map((group) =>
                                <tr key={group.id} className={`${selectedId && selectedId === group.id ? "bg-gray-300" : "bg-white"}`} onClick={() => selectedProduct(group.id, group.name)}>
                                    <td className="px-6 py-4 whitespace-nowrap underline">{group.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{group?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex">
                                            {group?.product?.slice(0, 3).map((p) =>
                                                <div key={p.id} className="cursor-pointer text-blue-500 border-2 rounded-md">
                                                    <Link legacyBehavior href={`/products/${p.id}`}>
                                                        <div className="flex gap-11">
                                                            {p.id}
                                                            <Image
                                                                src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${p.image}/imageSlide`}
                                                                width={75}
                                                                height={75}
                                                                alt=""
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>)}
                        </tbody>
                    </table>
                    <div className="flex flex-col">
                        <button className="p-2 rounded-lg text-white bg-green-500" onClick={() => clearId()}>unselect</button>

                        <form className="p-4 space-y-4 w-1/2" onSubmit={handleSubmit(onValid)}>
                            <Input register={register("id", { required: true })} required label="id*" name="id" kind="text" type={""} disabled={true} />
                            <Input register={register("name", { required: true })} required label="Name*" name="name" kind="text" type={""} />
                            <button className="p-2 rounded-lg text-white bg-green-500">Enter</button>
                        </form>
                    </div>
                </div>
            </div>
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
            if (profile) {
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

export default GroupPage;