import Image from "next/image";

const StockitLogo = () => {
    return (
        <div className="flex flex-row items-center leading-none text-white">
            <Image
             src="/customer-management-sales-line-svgrepo-com.svg"
             alt="icone du logo"
             width={40}
             height={40}
             className="w-10 h-10"
            />
            <p className="text-[34px]">StockIt</p>
        </div>
    );
}

export default StockitLogo;
