"use client"

import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";

const DisconnectBtn = () => {
    return (
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block">
            <button
             className="flex h-[48px]
              w-full grow items-center 
              justify-center gap-2 rounded-md 
              bg-gray-50 p-3 text-sm font-medium 
              hover:bg-sky-100 hover:text-blue-600 
              md:flex-none md:justify-start md:p-2 md:px-3"
              onClick={() => signOut({
                callbackUrl: '/login',
                redirect: true
              })}
            >
                <ArrowRightStartOnRectangleIcon className="w-6" />
                <div className="hidden md:block">Se déconnecter</div>
            </button>
        </div>
    );
}

export default DisconnectBtn;
