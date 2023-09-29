import MoonLoader from "react-spinners/MoonLoader";

export default function LoadingButton({
}) {
    return (
        <div className=
            "w-full py-2 flex items-center justify-center bg-green-500 rounded-2xl text-white  px-4 border border-transparent"
        >
            <MoonLoader
                color={"#112111"}
                loading={true}
                size={15}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </div>
    );
}