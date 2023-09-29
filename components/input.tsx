import { EventDays } from "@prisma/client";
import type { UseFormRegisterReturn } from "react-hook-form";

interface InputProps {
  label: string;
  name: string;
  kind?: "text" | "phone" | "price" | "event" | "number" | "payment" | "search"
  type: string;
  register?: UseFormRegisterReturn;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  eventDays?: EventDays[];
  ref?: string;
}

export default function Input({
  label,
  name,
  kind = "text",
  register,
  type,
  required,
  disabled = false,
  value,
  eventDays =[],
}: InputProps) {

  return (
    <div className="">
      {label ? (
        <label
          className="mb-1 block text-sm font-medium text-gray-700"
          htmlFor={name}
        >
          {label}
          {kind === "payment" ? (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          ) : null}
        </label>) : null
      }
      {kind === "text" ? (
        <div className="rounded-md relative flex items-center shadow-sm">
          <input
            id={name}
            required={required}
            {...register}
            type={type}
            className={`appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${disabled ?`bg-gray-200` : 'bg-white'}`}
            disabled={disabled}
            value={value}   
          />
        </div>
      ) : null}
      {kind === "search" ? (
        <div className="flex w-full rounded-lg">
          <input
            id={name}
            required={required}
            {...register}
            type={type}
            className="h-8 appearance-none placeholder-gray-400 focus:outline-none pl-4 w-full rounded-lg flex "
            disabled={disabled}
            value={value}  
          />
        </div>
      ) : null}
      {kind === "price" ? (
        <div className="rounded-md relative flex  items-center shadow-sm">
          <div className="absolute left-0 pointer-events-none pl-3 flex items-center justify-center">
            <span className="text-gray-500 text-sm">$</span>
          </div>
          <input
            id={name}
            required={required}
            {...register}
            type={type}
            className="appearance-none pl-7 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
      ) : null}
      {kind === "phone" ? (
        <div className="flex rounded-md shadow-sm">
          <input
            id={name}
            required={required}
            {...register}
            type={type}
            className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md rounded-l-none shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
      ) : null}
      {kind === "number" ? (
        <div className="rounded-md relative flex  items-center shadow-sm">
          <input
            id={name}
            required={required}
            {...register}
            type={type}
            className="appearance-none pl-7 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
      ) : null}
      {kind === "event" ?
        (
          eventDays.map((day) => (
            <div key={day.id} className="grid grid-cols-2 rounded-md shadow-sm bg-gray-200 p-3">
              <div className="flex items-center">
                <input
                  id={name}
                  required={required}
                  {...register}
                  type="checkbox"
                  value={day.id}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                <label htmlFor="default-checkbox" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{day.name}</label>
              </div>
            </div>
          ))
        ) : null}
    </div>
  );
}