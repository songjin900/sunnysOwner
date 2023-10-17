import Image from "next/image";
import Link from "next/link";

interface ItemProps {
    title: string;
    id: number;
    price: number;
    image: string;
    stockQuantity: number
}
//shadow-md shadow-gray-400

export default function Item({
    title,
    price,
    id,
    image,
    stockQuantity
}: ItemProps) {
    return (//bg-[#F4F4F4]
        <Link legacyBehavior href={`/products/${id}`}>
            <a className="bg-white p-1 rounded-xl shadow-gray-300 cursor-pointer">
                <div className="flex flex-col h-full">
                    <div className="flex items-end justify-center flex-1 pb-1">
                        <Image
                            src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${image}/shopPage`}
                            className="bg-white rounded-xl border-gray-200"
                            width={400}
                            height={400}
                            alt={""}

                        />
                    </div>
                    <div className={`flex flex-col pl-1 border-t-2 border-gray-200 overflow-hidden ${stockQuantity > 0 ? "": "bg-red-300"}`}>
                        <span className="text-sm md:text-lg font-md text-black pl-1 mt-2 truncate-text truncate">{title}</span>
                        <span className="text-xs md:text-sm text-black pl-1">${price}</span>
                        <span className="text-xs md:text-sm text-black pl-1">Stock: {stockQuantity}</span>
                    </div>
                </div>
            </a>
        </Link>
    );
}