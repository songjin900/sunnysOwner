import ReactLoading from 'react-loading';

interface LoadingProps {
    showLoadingAnimation: boolean
}

export default function LoadingAnimation({
    showLoadingAnimation
}: LoadingProps) {
    return (
        <div>
            {showLoadingAnimation ?
            <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="flex justify-center">
                    <ReactLoading
                        className=""
                        type="bubbles"
                        color='rgb(90, 219, 61)'
                        height={220}
                        width={120}
                    />
                </div>
            </div>
            : null
            }
        </div>
    );
}