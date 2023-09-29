import { Product } from "@prisma/client";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Input from "./input";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

interface productResponse {
  ok: boolean;
  products: Product[]
}
interface searchForm {
  word: string;
}

interface searchOpen {
  openSearchBar?: (openSB: boolean) => void,
  closeSearchBarFromLayout: boolean,
  setCloseSearchBar?: (openSB: boolean) => void
}

export default function SearchBar({
  openSearchBar = (openSB: boolean) => { }, closeSearchBarFromLayout,
  setCloseSearchBar = (openSB: boolean) => { }
}: searchOpen) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const { register, handleSubmit, setValue, setError, formState: { errors }, reset, setFocus } = useForm<searchForm>();
  const [search, setSearch] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showItemFound, setShowItemFound] = useState(false);

  const fetcher = (url: string, queryParams: string) => fetch(`${url}?${queryParams}`).then(r => r.json());
  
  const inputRef = useRef(null);

  const closeSearchBar = () => {
    reset();
    setProducts([]);
    openSearchBar(false);
    setSearch("");
    setShowItemFound(false);
    setShowErrorMessage(false);
  }

  useEffect(() => {
    if (closeSearchBarFromLayout) {
      closeSearchBar()
      setCloseSearchBar(false);
    }
  }, [closeSearchBarFromLayout])

  const onValid = ({ word }: searchForm) => {
    if (!word || word.length <= 1) {
      setSearch("");
      setShowItemFound(false);
      setShowErrorMessage(false);
      return;
    }

    setSearch(word);

    fetcher(`/api/products`, `search=${word}&sort=la`)
      .then((searchedData) => {
        if (searchedData?.products.length === 0) {
          setShowErrorMessage(true);
          setShowItemFound(false);
        }
        else {
          setShowItemFound(true);
          setProducts(searchedData.products);
        }
      })
      .catch((error) => {
      });
  }

  const handleButtonClick = () => {
    closeSearchBar();
    router.replace(`/shop?search=${search}`);
  };

  useEffect(() => {
    if (!showErrorMessage)
      return;

    // Hide the div after 5 seconds
    const timeout = setTimeout(() => {
      setShowErrorMessage(false);
    }, 5000);

    // Cleanup the timeout when the component unmounts
    return () => clearTimeout(timeout);
  }, [showErrorMessage]);

  // useEffect(()=>{
  //   setFocus("word")
  // }, [setFocus])

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full justify-center mb-3">
        <form className="space-y-4" onSubmit={handleSubmit(onValid)}>
          <div className="flex">
            <Input register={register("word")} type="text" kind="search" label={""} name={"word"} />
            <button className="ml-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 cursor-pointer text-white hover:text-white hover:bg-green-600 hover:rounded-2xl hover:p-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
      <div className="flex flex-col items-center justify-center">
        {
          showItemFound && products ?
            products.slice(0, Math.min(products.length, 8)).map((product) => (
              <div key={product.id} className="bg-white flex items-center justify-center w-full">
                <Link legacyBehavior href={`/products/${product.id}`}>
                  <div onClick={() => { closeSearchBar() }} className="flex flex-row p-1 w-full cursor-pointer m-1 rounded-lg bg-white border-2 border-gray-200 hover:bg-gray-200">
                    <div className="flex justify-center items-center">
                      <Image
                        width={25}
                        height={25}
                        src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${product.image}/smallimage`}
                        className="bg-white rounded-2xl max-h-[90%]" alt={""} />
                    </div>
                    <div className="flex flex-col pl-2 mt-2 w-full">
                      <span className="text-lg font-md text-gray-800">{product.name}</span>          
                    </div>
                  </div>
                </Link>
              </div>
            ))
            : null
        }

        {
          showItemFound ?
            <div className="flex justify-center items-center">
              <button
                onClick={handleButtonClick}
                className="text-green-500 border-2 border-green-500 p-1 px-2 rounded-2xl my-1 hover:bg-gray-200 bg-white flex"
              >
                See all results
              </button>
            </div>
            :
            search && showErrorMessage ?
              (
                <div className="flex justify-center items-center rounded-xl px-3">
                  <span className="text-lg font-medium text-white ">Sorry, we couldn&#39;t find anything for &#39;{search}&#39;</span>
                </div>
              )
              : null
        }
      </div>

    </div>
  );
}