import Image from "next/image";
import Link from "next/link";

interface ItemProps {
    title: string;
    id: number;
    price: number;
    comments: string;
    kind: "small" | "large";
    image: string;
}

export default function ItemsWide({
    title = "",
    price = 0,
    comments = "",
    id,
    kind = "large",
    image,
}: ItemProps) {
    return (
        <Link legacyBehavior href={`/products/${id}`}>
            <div className={`my-2 p-2 cursor-pointer bg-red-100 rounded-2xl`}>
                <div className="flex flex-col md:flex-row">
                    <div className="flex justify-center">
                        <Image
                            width={150}
                            height={150}
                            src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${image}/smallimage`}
                            className="bg-[#F4F4F4] rounded-2xl" alt={""} />
                    </div>
                    {kind === "large" ?
                        <div className="flex flex-col pl-2 mt-2 w-full">
                            <span className="text-lg font-md text-gray-800">{title}</span>
                            <div className="flex flex-col md:mt-2 md:items-end">
                                <span className="text-sm text-gray-500">${price}</span>
                            </div>
                        </div>
                        : null}
                    {kind === "small" ?
                        <div className="flex flex-col pl-2 mt-2 w-full">
                            <span className="text-lg font-md text-gray-800">{title}</span>
                            <div className="flex flex-col md:mt-2 md:items-end">
                                {/* <span className="text-sm text-gray-500">model-1-2-3</span> */}
                                <span className="text-sm text-gray-500">${price}</span>
                                <span className="text-sm text-gray-500">{comments}</span>
                            </div>
                        </div>
                        : null}
                </div>
            </div>
        </Link>
    );
}