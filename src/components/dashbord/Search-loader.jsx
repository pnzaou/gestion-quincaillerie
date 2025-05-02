
const SearchLoader = () => {
    return (
        <div className="flex justify-center py-4 space-x-2">
            <div
            className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
            />
            <div
            className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
            />
            <div
            className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
            />
        </div>
    );
}

export default SearchLoader;
