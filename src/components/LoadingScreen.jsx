import Image from "next/image";

const LoadingScreen = () => {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <div className="animate-bounce">
          <Image 
           src="/LOGO_LPCY.png"
           width={288}
           height={288}
           alt="logo parcours compagny"
           priority
          />
        </div>
      </div>
    );
}

export default LoadingScreen
  