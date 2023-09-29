import type { NextPage } from "next";
import Button from "@components/button";
import Input from "@components/input";
import Layout from "@components/layout";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from "swr"
import useUser from "@libs/client/useUser";


interface UserDetailForm {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postCode?: string;
  formError?: string;
}

interface UserDetailMutation {
  ok: boolean;
}

const Detail: NextPage = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();

  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<UserDetailForm>();
  const { data: userData } = useSWR("/api/users/me/detail");
  useEffect(() => {
    if (userData?.userDetail?.firstName) setValue("firstName", userData?.userDetail?.firstName);
    if (userData?.userDetail?.lastName) setValue("lastName", userData?.userDetail?.lastName);
    if (userData?.userDetail?.phone) setValue("phone", userData?.userDetail?.phone);
    // if (userData?.userDetail?.email) setValue("email", userData?.userDetail?.email);
    if (userData?.userDetail?.address) setValue("address", userData?.userDetail?.address);
    if (userData?.userDetail?.city) setValue("city", userData?.userDetail?.city);
    if (userData?.userDetail?.province) setValue("province", userData?.userDetail?.province);
    if (userData?.userDetail?.postCode) setValue("postCode", userData?.userDetail?.postCode);

  }, [userData?.userDetail, setValue])

  const [editProfile, { loading, data }] = useMutation<UserDetailMutation>("/api/users/me/detail")

  const onValid = ({ firstName, lastName, address, city, province, postCode, phone }: UserDetailForm) => {
    if (loading)
      return;

    editProfile({ firstName, lastName, address, city, province, postCode, phone })
  }

  useEffect(() => {
    if (data?.ok) {
      router.push(`/profile`);
    }
  }, [data, router])

  return (
    <Layout canGoBack title="Edit Profile">
      <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-[30rem] p-2 my-2 bg-gray-100">
          Email: {user?.email}
        </div>
        <form className="p-4 space-y-4 w-full max-w-[30rem] bg-gray-100" onSubmit={handleSubmit(onValid)}>
          <div className="flex flex-col md:flex-row md:gap-x-4">
            <Input register={register("firstName", { required: true })} required label="*First Name" name="firstName" type="text" />
            <Input register={register("lastName", { required: true })} required label="*Last Name" name="lastName" type="text" />
          </div>
          {/* <Input register={register("email", { required: false })} disabled={disableEmail} required label="Email" name="email" type="text" /> */}
          <div className="flex gap-4">
            <Input register={register("phone", { required: true })} required label="Phone" name="phone" type="text" />
          </div>
          <Input register={register("address", { required: true })} required label="Address" name="address" type="text" />
          <div className="flex flex-col md:flex-row gap-x-4">
            <Input register={register("city", { required: true })} required label="City" name="name" type="city" />
            <div className="flex gap-x-4">
              <Input register={register("province", { required: true })} required label="Province" name="province" type="text" />
              <Input register={register("postCode", { required: true })} required label="Postal Code" name="postCode" type="text" />
            </div>
          </div>
          <div className="flex gap-x-4">
            <Button text={loading ? "loading..." : "Edit Profile"} />
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Detail;