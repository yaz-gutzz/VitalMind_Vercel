import imgImage from "figma:asset/d00a5d2fc0487fac8aa7058e6bf3c1ace9e5912b.png";

export function AppLogo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-[157px] h-[120px] rounded-full shadow-lg overflow-hidden bg-white p-4">
        <img 
          alt="MedAlert+ Logo" 
          className="w-full h-full object-contain" 
          src={imgImage} 
        />
      </div>
      <h1 className="text-[#1742a1] text-center">MedAlert+</h1>
    </div>
  );
}
