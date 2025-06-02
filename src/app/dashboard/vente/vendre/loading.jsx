
const Loading = () => {
    return (
        <div className="mt-6 flow-root">
            <div className="h-7 w-28 bg-gray-400 rounded-sm animate-pulse" />
            <div className="h-3 w-36 mt-4 bg-gray-300 rounded-sm animate-pulse" />
            <div className="px-14 mt-12">
                <div className="flex gap-2">
                    <div className="flex gap-20">
                        <div className="h-10 w-24 bg-gray-300 rounded-sm animate-pulse"/>
                        <div className="h-10 w-44 bg-gray-300 rounded-sm animate-pulse"/>
                    </div>
                    <div className="h-10 w-48 bg-gray-300 rounded-sm animate-pulse"/>
                    <div className="h-10 w-36 bg-gray-300 rounded-sm animate-pulse"/>
                    <div className="h-10 w-32 bg-gray-300 rounded-sm animate-pulse"/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
                    <div className="h-60 w-48 bg-gray-300 rounded-sm animate-pulse"/>
                    <div className="h-60 w-48 bg-gray-300 rounded-sm animate-pulse"/>
                    <div className="h-60 w-48 bg-gray-300 rounded-sm animate-pulse"/>
                    <div className="h-60 w-48 bg-gray-300 rounded-sm animate-pulse"/>
                    <div className="h-60 w-48 bg-gray-300 rounded-sm animate-pulse"/>
                    <div className="h-60 w-48 bg-gray-300 rounded-sm animate-pulse"/>
                    <div className="h-60 w-48 bg-gray-300 rounded-sm animate-pulse"/>
                    <div className="h-60 w-48 bg-gray-300 rounded-sm animate-pulse"/>
                </div>
            </div>
            <div className="px-12 mt-7">
                <div className="flex justify-between">
                    <div className="h-10 w-44 bg-gray-300 rounded-sm animate-pulse"/>
                    <div className="flex gap-3">
                        <div className="h-10 w-10 bg-gray-300 rounded-sm animate-pulse"/>
                        <div className="h-10 w-10 bg-gray-300 rounded-sm animate-pulse"/>
                        <div className="h-10 w-10 bg-gray-300 rounded-sm animate-pulse"/>
                        <div className="h-10 w-10 bg-gray-300 rounded-sm animate-pulse"/>
                    </div>
                    <div className="h-10 w-48 bg-gray-300 rounded-sm animate-pulse"/>
                </div>
            </div>
        </div>
    );
}

export default Loading;
