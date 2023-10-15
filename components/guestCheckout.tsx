import useMutation from "@libs/client/useMutation";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useForm } from "react-hook-form";
import Input from "@components/input";
import Button from "@components/button";

interface GuestForm {
    email: string;
    errors: string;
}

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export default function GuestCheckout({ updateRegisteredUser = (result: boolean) => { } }) {
    const [addGuest, { loading, data: addGuestData }] = useMutation(`/api/users/guestEnter`);
    const router = useRouter()
    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<GuestForm>();
    //Create a guest account here.
    const onValid = (data : GuestForm) => {
        if (loading)
            return;
  
        addGuest({ password: data?.email });
    }

    useEffect(() => {
        if (addGuestData && addGuestData.ok) {
            updateRegisteredUser(true);
        }
    }, [addGuestData, updateRegisteredUser])

    return (
        <div className="w-full flex flex-col">
            <div className="">
                <span className="text-gray-800 text-lg flex my-4">
                    Enter your email to add a product to your cart.
                </span>
            </div>
            <form className="" onSubmit={handleSubmit(onValid)}>
          
            {
                errors?.email?.message ? 
                <div className="text-red-600 text-lg flex my-2">{errors?.email?.message}</div> 
                : null
            }
                <div className="flex flex-row space-x-3">
                    <label className="pt-2">Email*: </label>
                    <Input register={register("email", { required: true })} required label="" name="email" type="text" />
                    <div className="w-20">
                        <Button text={loading ? "loading..." : "Enter"} />
                    </div>
                </div>
            </form>
        </div>
    )
}
