import { UserTableSkeleton } from "@/components/skeletons";

const Loading = () => {
    return (
        <div className="md:flex md:flex-col md:items-center md:justify-center md:h-screen">
            <UserTableSkeleton/>
        </div>
    );
}

export default Loading;
