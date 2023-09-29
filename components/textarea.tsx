import { UseFormRegisterReturn } from "react-hook-form";

interface TextAreaProps {
    label?: string;
    name?: string;
    [key: string]: any;
    register: UseFormRegisterReturn;
  }
  
  export default function TextArea({ label, name, register, ...rest }: TextAreaProps) {
    return (
      <div>
        {label ? (
          <label
            htmlFor={name}
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        ) : null}
        <textarea
          id={name}
          {...register}
          className="mt-1 w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          rows={4}
          {...rest}
        />
      </div>
    );
  }