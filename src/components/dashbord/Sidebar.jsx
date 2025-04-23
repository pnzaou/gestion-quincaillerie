import Link from "next/link";
import StockitLogo from "../Stockit-logo";
import NavLinks from "./Nav-links";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import DisconnectBtn from "./Disconnect-btn";

const SideBar = async () => {
    const session = await getServerSession(authOptions)
    return (
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
            <Link
             href="/dashboard"
             className="mb-2 flex h-20 items-end justify-start rounded-md bg-sky-600 p-4 md:h-20"
            >
                <div className="w-32 text-white md:w-40">
                    <StockitLogo/>
                </div>
            </Link>
            <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                <NavLinks session={session}/>
                <DisconnectBtn/>
            </div>
        </div>
    );
}

export default SideBar;
