import svgPaths from "./svg-m9zbqoronz";
import imgPastillas1 from "figma:asset/85a00f86b13fea77e55e2799ff7beeec9d6c2c51.png";
import imgPastillero1 from "figma:asset/79eec1c2d47b594c23a42c6afb9c868d02527d36.png";
import imgFlechaCorrecta1 from "figma:asset/ed8f2809e0568b8cefae3b9d06ba336c618d8b92.png";
import imgMas1 from "figma:asset/f315fba62ba76a497fa4394f208c155e5f4c4bab.png";
import imgImage from "figma:asset/d00a5d2fc0487fac8aa7058e6bf3c1ace9e5912b.png";

function RightSide() {
  return (
    <div className="absolute h-[11.336px] right-[14.67px] top-[17.33px] w-[66.662px]" data-name="Right Side">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67 12">
        <g id="Right Side">
          <g id="Battery">
            <path d={svgPaths.p128d180} id="Rectangle" opacity="0.35" stroke="var(--stroke-0, black)" />
            <path d={svgPaths.p3b1e5e00} fill="var(--fill-0, black)" id="Combined Shape" opacity="0.4" />
            <path d={svgPaths.p17d71400} fill="var(--fill-0, black)" id="Rectangle_2" />
          </g>
          <path d={svgPaths.p24912f80} fill="var(--fill-0, black)" id="Wifi" />
          <path d={svgPaths.p9005d40} fill="var(--fill-0, black)" id="Mobile Signal" />
        </g>
      </svg>
    </div>
  );
}

function Time() {
  return (
    <div className="absolute h-[21px] left-[21px] top-[12px] w-[54px]" data-name="Time">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 54 21">
        <g id="Time">
          <g id="9:41">
            <path d={svgPaths.p3de63e00} fill="var(--fill-0, black)" />
            <path d={svgPaths.p3029a300} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2e0c43c0} fill="var(--fill-0, black)" />
            <path d={svgPaths.p38350600} fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function LeftSide() {
  return (
    <div className="absolute contents left-[21px] top-[12px]" data-name="Left Side">
      <Time />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="absolute h-[44px] left-0 overflow-clip top-0 w-[375px]" data-name="Status Bar">
      <RightSide />
      <LeftSide />
    </div>
  );
}

function IconChevronLeft() {
  return <div className="absolute left-[16px] size-[24px] top-1/2 translate-y-[-50%]" data-name="Icon/Chevron_Left" />;
}

function Header() {
  return <div className="absolute h-[56px] left-[-39px] top-[118px] w-[375px]" data-name="Header" />;
}

function Header1() {
  return (
    <div className="absolute bg-white h-[726px] left-0 top-[83px] w-[375px]" data-name="Header">
      <div className="h-[726px] overflow-clip relative rounded-[inherit] w-[375px]">
        <IconChevronLeft />
        <Header />
        <p className="absolute font-['Inter:Extra_Bold',_sans-serif] font-extrabold h-[44px] leading-[1.4] left-[calc(50%+12.5px)] not-italic text-[#1742a1] text-[32px] text-center top-[166px] tracking-[-0.64px] translate-x-[-50%] w-[166px]">MedAlert+</p>
        <div className="absolute bg-[#e5f1f7] h-[463px] left-[-13px] top-[224px] w-[388px]" />
        <p className="absolute font-['Inter:Bold',_sans-serif] font-bold h-[31px] leading-[1.4] left-[94.5px] not-italic text-[16px] text-black text-center top-[242px] tracking-[-0.32px] translate-x-[-50%] w-[197px]">Mis medicamentos</p>
        <div className="absolute h-[48px] left-[19px] top-[304px] w-[337px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 337 48">
            <path d={svgPaths.p1e210e00} fill="var(--fill-0, white)" id="Rectangle 111141364" />
          </svg>
        </div>
        <div className="absolute bg-white h-[48px] left-[19px] rounded-[12px] top-[380px] w-[337px]" />
        <div className="absolute bg-white h-[48px] left-[19px] rounded-[12px] top-[452px] w-[337px]" />
        <p className="absolute font-['Inter:Extra_Bold',_sans-serif] font-extrabold h-[31px] leading-[1.4] left-[52.5px] not-italic text-[16px] text-black text-center top-[511px] tracking-[-0.32px] translate-x-[-50%] w-[197px]">Mi Stock</p>
        <div className="absolute bg-white h-[48px] left-[19px] rounded-[12px] top-[546px] w-[337px]" />
        <div className="absolute bg-[rgba(46,158,223,0.89)] h-[51px] left-1/2 rounded-[12px] top-[611px] translate-x-[-50%] w-[337px]" />
        <div className="absolute font-['Inter:Bold',_sans-serif] font-bold h-[45px] leading-[1.4] left-[51.5px] not-italic text-[0px] text-black text-center top-[248px] tracking-[-0.32px] translate-x-[-50%] w-[197px]">
          <p className="mb-0 text-[16px]">&nbsp;</p>
          <p className="font-['Inter:Medium',_sans-serif] font-medium text-[14px]">Mis dosis</p>
        </div>
        <p className="absolute font-['Inter:Semi_Bold',_sans-serif] font-semibold h-[31px] leading-[1.4] left-[184px] not-italic text-[20px] text-center text-white top-[621px] tracking-[-0.4px] translate-x-[-50%] w-[234px]">Guardar</p>
        <div className="absolute left-[309px] size-[33px] top-[311px]" data-name="pastillas 1">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgPastillas1} />
        </div>
        <div className="absolute left-[314px] size-[33px] top-[387px]" data-name="pastillas 2">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgPastillas1} />
        </div>
        <p className="absolute font-['Inter:Bold',_sans-serif] font-bold h-[45px] leading-[1.4] left-[67.5px] not-italic text-[13px] text-black text-center top-[311px] tracking-[-0.26px] translate-x-[-50%] w-[197px]">Paracetamol</p>
        <p className="absolute font-['Inter:Bold',_sans-serif] font-bold h-[45px] leading-[1.4] left-[57.5px] not-italic text-[13px] text-black text-center top-[387px] tracking-[-0.26px] translate-x-[-50%] w-[197px]">Penicilina</p>
        <p className="absolute font-['Inter:Bold',_sans-serif] font-bold h-[45px] leading-[1.4] left-[101.5px] not-italic text-[13px] text-black text-center top-[459px] tracking-[-0.26px] translate-x-[-50%] w-[197px]">Ceftazidima-Ceftriaxona</p>
        <div className="absolute left-[23px] size-[34px] top-[553px]" data-name="pastillero 1">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgPastillero1} />
        </div>
        <div className="absolute left-[325px] size-[22px] top-[559px]" data-name="flecha-correcta 1">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgFlechaCorrecta1} />
        </div>
        <p className="absolute font-['Inter:Bold',_sans-serif] font-bold h-[45px] leading-[1.4] left-[133.5px] not-italic text-[16px] text-black text-center top-[549px] tracking-[-0.32px] translate-x-[-50%] w-[197px]">Dosis fdgjgdg vjkjnv</p>
        <div className="absolute left-[318px] size-[24px] top-[463px]" data-name="mas 1">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgMas1} />
        </div>
        <div className="absolute inset-[6.32%_26.93%_77.2%_31.2%] rounded-[1px]" data-name="Image">
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[1px]">
            <img alt="" className="absolute h-[171.51%] left-[-7.32%] max-w-none top-[-7.42%] w-[114.63%]" src={imgImage} />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e6e6e6] border-[0px_0px_0.5px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function IconChevronLeft1() {
  return <div className="absolute left-[16px] size-[24px] top-1/2 translate-y-[-50%]" data-name="Icon/Chevron_Left" />;
}

function Header2() {
  return (
    <div className="absolute bg-white h-[42px] left-0 top-[33px] w-[375px]" data-name="Header">
      <div className="h-[42px] overflow-clip relative rounded-[inherit] w-[375px]">
        <IconChevronLeft1 />
        <p className="absolute font-['Inter:Semi_Bold',_sans-serif] font-semibold h-[23px] leading-[1.4] left-[61px] not-italic text-[16px] text-black text-center top-[10px] tracking-[-0.32px] translate-x-[-50%] w-[106px]">Hola, Guzmàn</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#e6e6e6] border-[0px_0px_0.5px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function IconHome() {
  return (
    <div className="absolute left-[26px] size-[24px] top-[12px]" data-name="Icon/Home">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon/Home">
          <path d={svgPaths.p2e9f4a80} fill="var(--fill-0, black)" id="Subtract" />
        </g>
      </svg>
    </div>
  );
}

function TabBarItem() {
  return (
    <div className="absolute h-[49px] left-[calc(50%-142.5px)] top-0 translate-x-[-50%] w-[76px]" data-name="Tab Bar Item">
      <IconHome />
    </div>
  );
}

function IconSearch() {
  return (
    <div className="absolute left-[26px] size-[24px] top-[12px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon/Search">
          <path d={svgPaths.p19568f00} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M21 21L16.65 16.65" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function TabBarItem1() {
  return (
    <div className="absolute h-[49px] left-[calc(50%-46.5px)] opacity-50 top-0 translate-x-[-50%] w-[76px]" data-name="Tab Bar Item">
      <IconSearch />
    </div>
  );
}

function IconTransfer() {
  return (
    <div className="absolute left-[26px] size-[24px] top-[12px]" data-name="Icon/Transfer">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon/Transfer">
          <path d="M1 8H17" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
          <path d="M23 16L7 16" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
          <path d="M4.5 4L1 8L4.5 11.5" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M19.5 12L23 16L19.5 19.5" id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function TabBarItem2() {
  return (
    <div className="absolute h-[49px] left-[calc(50%+46.5px)] opacity-50 top-0 translate-x-[-50%] w-[76px]" data-name="Tab Bar Item">
      <IconTransfer />
    </div>
  );
}

function IconWallet() {
  return (
    <div className="absolute left-[26px] size-[24px] top-[12px]" data-name="Icon/Wallet">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon/Wallet">
          <path d={svgPaths.pb27a100} fill="var(--fill-0, black)" id="wallet" />
        </g>
      </svg>
    </div>
  );
}

function TabBarItem3() {
  return (
    <div className="absolute h-[49px] left-[calc(50%+141.5px)] opacity-50 top-0 translate-x-[-50%] w-[76px]" data-name="Tab Bar Item">
      <IconWallet />
    </div>
  );
}

function Tabs() {
  return (
    <div className="absolute h-[49px] left-0 overflow-clip right-0 top-0" data-name="Tabs">
      <TabBarItem />
      <TabBarItem1 />
      <TabBarItem2 />
      <TabBarItem3 />
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="absolute bottom-[8px] contents left-[calc(50%+1.5px)] translate-x-[-50%]" data-name="Home Indicator">
      <div className="absolute bg-black bottom-[8px] h-[5px] left-[calc(50%+1.5px)] rounded-[100px] translate-x-[-50%] w-[134px]" data-name="Home Indicator" />
    </div>
  );
}

function TabBar() {
  return (
    <div className="absolute backdrop-blur-[10px] backdrop-filter bg-white bottom-[-21px] h-[83px] left-[calc(50%+3px)] shadow-[0px_-0.5px_0px_0px_rgba(0,0,0,0.1)] translate-x-[-50%] w-[375px]" data-name="Tab Bar">
      <Tabs />
      <HomeIndicator />
    </div>
  );
}

export default function Booking() {
  return (
    <div className="bg-[#e5f1f7] relative size-full" data-name="Booking">
      <StatusBar />
      <Header1 />
      <Header2 />
      <TabBar />
    </div>
  );
}