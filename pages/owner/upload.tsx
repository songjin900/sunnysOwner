import type { NextPage } from "next";
import Button from "@components/button";
import Input from "@components/input";
import Layout from "@components/layout";
import TextArea from "@components/textarea";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { useEffect, useState } from "react";
import { EventDays, MenuCategory, Product, SubMenuCategory } from "@prisma/client";
import { useRouter } from "next/router";
import Image from "next/image";
import LoadingButton from "@components/loadingButton";
import client from "@libs/server/client";

interface UploadProductForm {
  name: string;
  localImage: string;
  price: number;
  description: string;
  subcategory: string;
  stockQuantity: number;
  eventDay: string[]
  photo: FileList;
  photoTwo: FileList;
  photoThree: FileList;
  photoFour: FileList;
  photoFive: FileList;
}

interface UploadProductMutation {
  ok: boolean;
  product: Product;
}

interface SubMenuWithMenu extends MenuCategory {
  subMenuCategory: SubMenuCategory[]
}

const Upload: NextPage<{ menuCategory: SubMenuWithMenu[]; subMenuCategory: SubMenuCategory[]; eventDays: EventDays[],maxProductId: number }> = ({ menuCategory, subMenuCategory, eventDays,maxProductId }) => {
  const router = useRouter();
  const { register, handleSubmit, watch } = useForm<UploadProductForm>();
  const [uploadProduct, { loading, data }] = useMutation<UploadProductMutation>("/api/owner/upload")
  const [showLoading, setShowLoading] = useState(false);
  const [category, setCategory] = useState(-1);
  const [subcategory, setSubCategory] = useState(-1);

  const uploadFile = async (file: FileList, name: string) => {
    const { uploadURL } = await (await fetch('/api/owner/files')).json();
    const form = new FormData();
    form.append('file', file[0], name);
    const { result: { id } } = await (await fetch(uploadURL, { method: 'POST', body: form })).json();
    return id;
  };

  const onValid = async ({ name, localImage, price, description, stockQuantity, eventDay }: UploadProductForm) => {
    if (loading)
      return;

    if (category === -1 || subcategory === -1)
      return

    if (photo && photo.length === 0 || photoTwo && photoTwo.length === 0)
      return;

    setShowLoading(true);

    let imageName = "";

    let firstChar = "";
    let secondChar = "";

    try {
      firstChar = menuCategory.find((x) => x.id === category)?.category.charAt(0).toUpperCase() || "";
      secondChar = subMenuCategory.find((x)=>x.id === subcategory)?.subCategory?.charAt(0).toUpperCase() || "";
      imageName = firstChar + secondChar;
    }
    catch (er: any) {
      imageName = name;
    }

    let imageArray = [];
    let photoId = null;

    if (photo && photo.length > 0) {
      photoId = await uploadFile(photo, imageName+(maxProductId+1)+"-1");
      imageArray.push({ photoId: photoId, orderIndex: 1 });
    }

    if (photoTwo && photoTwo.length > 0) {
      const id = await uploadFile(photoTwo, imageName+(maxProductId+1)+"-2");
      imageArray.push({ photoId: id, orderIndex: 2 });
    }

    if (photoThree && photoThree.length > 0) {
      const id = await uploadFile(photoThree, imageName+(maxProductId+1)+"-3");
      imageArray.push({ photoId: id, orderIndex: 3 });
    }

    if (photoFour && photoFour.length > 0) {
      const id = await uploadFile(photoFour, imageName+(maxProductId+1)+"-4");
      imageArray.push({ photoId: id, orderIndex: 4 });
    }

    if (photoFive && photoFive.length > 0) {
      const id = await uploadFile(photoFive, imageName+(maxProductId+1)+"-5");
      imageArray.push({ photoId: id, orderIndex: 5 });
    }

    uploadProduct({
      name,
      localImage,
      price,
      description,
      stockQuantity,
      photoId,
      photos: imageArray,
      category,
      subcategory,
      eventDay
    });
    setShowLoading(false);
  }

  useEffect(() => {
    if (data?.ok) {
      router.push(`/products/${data?.product.id}`);
    }
  }, [data, router]);

  const photo = watch("photo");
  const photoTwo = watch("photoTwo");
  const photoThree = watch("photoThree");
  const photoFour = watch("photoFour");
  const photoFive = watch("photoFive");

  const [photoPreview, setPhotoPreview] = useState("");
  const [photoTwoPreview, setPhotoTwoPreview] = useState("");
  const [photoThreePreview, setPhotoThreePreview] = useState("");
  const [photoFourPreview, setPhotoFourPreview] = useState("");
  const [photoFivePreview, setPhotoFivePreview] = useState("");

  useEffect(() => {
    if (photo && photo.length > 0) {
      const file = photo[0];
      setPhotoPreview(URL.createObjectURL(file));
    }
  }, [photo]);

  useEffect(() => {
    if (photoTwo && photoTwo.length > 0) {
      const file = photoTwo[0];
      setPhotoTwoPreview(URL.createObjectURL(file));
    }
  }, [photoTwo]);

  useEffect(() => {
    if (photoThree && photoThree.length > 0) {
      const file = photoThree[0];
      setPhotoThreePreview(URL.createObjectURL(file));
    }
  }, [photoThree]);

  useEffect(() => {
    if (photoFour && photoFour.length > 0) {
      const file = photoFour[0];
      setPhotoFourPreview(URL.createObjectURL(file));
    }
  }, [photoFour]);

  useEffect(() => {
    if (photoFive && photoFive.length > 0) {
      const file = photoFive[0];
      setPhotoFivePreview(URL.createObjectURL(file));
    }
  }, [photoFive]);

  return (
    <Layout canGoBack title="Upload Product">
      <div className="flex justify-center w-full">
        <form className="p-4 space-y-4 w-full bg-gray-100" onSubmit={handleSubmit(onValid)}>
          <h1>Main Image</h1>

          <div className="flex bg-green-200 justify-center items-center">
            <div className="flex-grow">
              {
                photoPreview ? (<Image
                  src={photoPreview}
                  className="max-w-150 text-gray-600 rounded-md flex items-center justify-center"
                  alt=""
                  height={150}
                  width={150}
                />) : (
                  <label className="w-full cursor-pointer border-red-400 text-gray-600 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center border-2 border-dashed  h-48 rounded-md">
                    <svg
                      className="h-12 w-12"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input {...register("photo")} accept="image/*" className="hidden" type="file" />
                  </label>
                )}
            </div>
            <div className="flex-grow">
              {
                photoTwoPreview ? (<Image
                  src={photoTwoPreview}
                  className="max-w-150 text-gray-600 rounded-md"
                  alt=""
                  height={150}
                  width={150}
                />) : (

                  <label className="w-full cursor-pointer text-gray-600 border-red-500 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center border-2 border-dashed h-48 rounded-md">
                    <svg
                      className="h-12 w-12"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input {...register("photoTwo")} accept="image/*" className="hidden" type="file" />
                  </label>
                )}
            </div>
            <div className="flex-grow">
              {
                photoThreePreview ? (<Image
                  src={photoThreePreview}
                  className="max-w-150 text-gray-600 rounded-md"
                  alt=""
                  height={150}
                  width={150}
                />) : (

                  <label className="w-full cursor-pointer text-gray-600 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center border-2 border-dashed border-gray-300 h-48 rounded-md">
                    <svg
                      className="h-12 w-12"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input {...register("photoThree")} accept="image/*" className="hidden" type="file" />
                  </label>
                )}
            </div>
            <div className="flex-grow">
              {
                photoFourPreview ? (<Image
                  src={photoFourPreview}
                  className="max-w-150 text-gray-600 rounded-md"
                  alt=""
                  height={150}
                  width={150}
                />) : (

                  <label className="w-full cursor-pointer text-gray-600 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center border-2 border-dashed border-gray-300 h-48 rounded-md">
                    <svg
                      className="h-12 w-12"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input {...register("photoFour")} accept="image/*" className="hidden" type="file" />
                  </label>
                )}
            </div>

            <div className="flex-grow">
              {
                photoFivePreview ? (<Image
                  src={photoFivePreview}
                  className="max-w-150 text-gray-600 rounded-md"
                  alt=""
                  height={150}
                  width={150}
                />) : (

                  <label className="w-full cursor-pointer text-gray-600 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center border-2 border-dashed border-gray-300 h-48 rounded-md">
                    <svg
                      className="h-12 w-12"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input {...register("photoFive")} accept="image/*" className="hidden" type="file" />
                  </label>
                )}
            </div>
          </div>

          <Input register={register("name", { required: true })} required label="Name" name="name" type="text" />
          <Input register={register("localImage", { required: true })} required label="localImage" name="localImage" type="text" />
          <Input
            required
            register={register("price", { required: true })}
            label="Price"
            name="price"
            type="text"
            kind="price"
          />
          <Input
            register={register("eventDay", { required: true })}
            label="eventDay"
            name="eventDay"
            type="text"
            kind="event"
            eventDays={eventDays}
          />
          <Input
            register={register("stockQuantity", { required: true })}
            label="Qty"
            name="stockQuantity"
            type="number"
            kind="number"
          />

          <TextArea register={register("description", { required: true })} name="description" label="Description" />

          <div className="w-full border-t-2 max-w-[30rem] pt-4 mt-4">
            <span>Type</span>
            <div className="flex flex-col mb-4 pl-2 pt-1">
              {
                  menuCategory.map((menu) => (
                    <div key={menu.id} className="flex flex-col">
                      <div>
                        <div className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 mr-2">{menu.categoryDisplay}</label>
                      </div>
                      <div className="flex flex-col pl-4">
                        {
                          menu.subMenuCategory ?
                            menu.subMenuCategory.filter((sub) => sub.platform === "both").map((subMenu) => (
                              <div key={subMenu.id} className="">
                                <div className="">
                                  <input required id="category-radio" type="radio" value="" name="category-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600
                               dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    onChange={() => { setSubCategory(subMenu.id); setCategory(menu.id) }} />
                                  <label htmlFor="size-radio" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 mr-2"> {subMenu.subCategoryDisplay}</label>
                                </div>
                              </div>
                            )) : null
                        }
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
          {
            loading || showLoading ? <LoadingButton />
              : <Button text={"Upload Product"} />
          }
        </form>
      </div>
    </Layout>
  );
};

export const getServerSideProps = async () => {

  const eventDays = await client.eventDays.findMany({
    // where: {
    //   visibility: true
    // }
  })

  const subMenuCategory = await client.subMenuCategory.findMany({
    // where: {
    //   visibility: true
    // }
  })

  const menuCategory = await client.menuCategory.findMany({
    select: {
      id: true,
      categoryDisplay: true,
      category: true,
      categoryIndex: true,
      description: true,
      subDescription: true,
      subMenuCategory: {
        select: {
          id: true,
          subCategoryDisplay: true,
          subCategory: true,
          subcategoryIndex: true,
          visibility: true,
          platform: true,
          image: true,
          menuCategoryId: true
        }
      }
    }
  })

  const product = await client.product.findFirst({
    orderBy: {
      id: 'desc'
    }
  })

  return {
    props: {
      menuCategory: JSON.parse(JSON.stringify(menuCategory)),
      subMenuCategory: JSON.parse(JSON.stringify(subMenuCategory)),
      eventDays: JSON.parse(JSON.stringify(eventDays)),
      maxProductId: product?.id ?? 0
    },
  };
};

export default Upload;