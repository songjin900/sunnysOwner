interface LoadingProps {
    showIcon: boolean
}

export default function Checkmark({
    showIcon
}: LoadingProps) {
    return (
        <div>
            {showIcon ?
                <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-44 h-44 text-green-800">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>

                    </div>
                </div>
                : null
            }
        </div>
    );
}