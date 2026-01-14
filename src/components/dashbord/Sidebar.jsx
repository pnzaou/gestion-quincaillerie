"use client"

import Link from "next/link";
import StockitLogo from "../Stockit-logo";
import NavLinks from "./Nav-links";
import DisconnectBtn from "./Disconnect-btn";
import { useState } from "react";
import { Bars3Icon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const SideBar = ({ shopId, session }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Bouton hamburger mobile */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 md:hidden rounded-lg bg-sky-600 p-2 text-white shadow-lg"
            >
                {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>

            {/* Overlay mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 bottom-0 z-40 flex flex-col bg-white border-r border-gray-200 transition-all duration-300
                    ${mobileOpen ? 'left-0' : '-left-64'} md:left-0
                    ${collapsed ? 'md:w-20' : 'md:w-64'}
                `}
            >
                {/* Bouton toggle desktop */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden md:block absolute -right-3 top-20 z-50 rounded-full bg-white border border-gray-200 p-1 shadow-md hover:bg-gray-50"
                >
                    {collapsed ? (
                        <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                    ) : (
                        <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
                    )}
                </button>

                {/* Logo */}
                <Link
                    href={`/shop/${shopId}/dashboard`}
                    className="flex h-20 items-center justify-center bg-sky-600 px-4"
                >
                    {collapsed ? (
                        <div className="text-white text-2xl font-bold">S</div>
                    ) : (
                        <div className="w-32 text-white">
                            <StockitLogo />
                        </div>
                    )}
                </Link>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <NavLinks session={session} shopId={shopId} collapsed={collapsed} />
                </div>

                {/* Disconnect */}
                <div className="border-t border-gray-200 p-3">
                    <DisconnectBtn collapsed={collapsed} />
                </div>
            </aside>

            {/* Spacer pour compenser la sidebar fixe */}
            <div className={`hidden md:block transition-all duration-300 ${collapsed ? 'md:w-20' : 'md:w-64'}`} />
        </>
    );
}

export default SideBar;