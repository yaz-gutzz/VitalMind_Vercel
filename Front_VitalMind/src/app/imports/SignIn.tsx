import svgPaths from "./svg-36nui37tfp";
import imgLogo from "figma:asset/92375b66cc5f6db228cbba4fabc2bd6032c970de.png";
import imgImage from "figma:asset/d00a5d2fc0487fac8aa7058e6bf3c1ace9e5912b.png";

function HomeIndicator() {
  return (
    <div className="absolute bottom-0 h-[34px] left-1/2 translate-x-[-50%] w-[375px]" data-name="Home Indicator">
      <div className="absolute bg-black bottom-[8px] h-[5px] left-[calc(50%+0.5px)] rounded-[100px] translate-x-[-50%] w-[134px]" data-name="Home Indicator" />
    </div>
  );
}

function Copy() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] h-[84px] items-center leading-[1.5] not-italic relative shrink-0 text-black text-center text-nowrap w-[295px] whitespace-pre" data-name="Copy">
      <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold relative shrink-0 text-[24px]">Crea una cuenta</p>
      <p className="font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 text-[14px]">
        {`Ingresa tu correo electrónico `}
        <br aria-hidden="true" />
        para registrarte en esta aplicación
      </p>
    </div>
  );
}

function Field() {
  return (
    <div className="bg-white h-[40px] relative rounded-[8px] shrink-0 w-full" data-name="Field">
      <div aria-hidden="true" className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[16px] h-[40px] items-center px-[16px] py-[8px] relative w-full">
          <p className="[white-space-collapse:collapse] basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#828282] text-[14px] text-nowrap">correoelectrónico@dominio.com</p>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-black h-[40px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[40px] items-center justify-center px-[16px] py-0 relative w-full">
          <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
            <p className="leading-[1.4] whitespace-pre">Continuar</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputButton() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[327px]" data-name="Input + Button">
      <Field />
      <Button />
    </div>
  );
}

function Divider() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-[327px]" data-name="Divider">
      <div className="basis-0 bg-[#e6e6e6] grow h-px min-h-px min-w-px shrink-0" data-name="Divider" />
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#828282] text-[14px] text-center text-nowrap whitespace-pre">o</p>
      <div className="basis-0 bg-[#e6e6e6] grow h-px min-h-px min-w-px shrink-0" data-name="Divider" />
    </div>
  );
}

function Logo() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_1_4797)" id="Logo">
          <path d={svgPaths.p33b7ccc0} fill="var(--fill-0, #4285F4)" id="Vector" />
          <path d={svgPaths.p15123a40} fill="var(--fill-0, #34A853)" id="Vector_2" />
          <path d={svgPaths.p28bf8e80} fill="var(--fill-0, #FBBC05)" id="Vector_3" />
          <path d={svgPaths.p1e563600} fill="var(--fill-0, #EB4335)" id="Vector_4" />
        </g>
        <defs>
          <clipPath id="clip0_1_4797">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Label() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center left-[calc(50%+0.5px)] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Label">
      <Logo />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black text-nowrap">
        <p className="leading-[1.4] whitespace-pre">Continuar con Google</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="[grid-area:1_/_1] bg-[#eeeeee] h-[40px] ml-0 mt-0 relative rounded-[8px] w-[327px]" data-name="Button">
      <Label />
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center left-[calc(50%+0.5px)] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Label">
      <div className="relative shrink-0 size-[20px]" data-name="Logo">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-[-28.84%] max-w-none size-[158.73%] top-[-29.1%]" src={imgLogo} />
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black text-nowrap">
        <p className="leading-[1.4] whitespace-pre">Continuar con Apple</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="[grid-area:1_/_1] bg-[#eeeeee] h-[40px] ml-0 mt-[48px] relative rounded-[8px] w-[327px]" data-name="Button">
      <Label1 />
    </div>
  );
}

function Buttons() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Buttons">
      {[...Array(2).keys()].map((_, i) => (
        <Button1 key={i} />
      ))}
      <Button2 />
    </div>
  );
}

function Content() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[24px] items-center left-[calc(50%+3px)] px-[24px] py-0 top-[calc(50%+121px)] translate-x-[-50%] translate-y-[-50%]" data-name="Content">
      <Copy />
      <InputButton />
      <Divider />
      <Buttons />
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#828282] text-[12px] text-center w-[min-content]">
        <span>{`Al hacer clic en continuar, aceptas nuestros `}</span>
        <span className="text-black">Términos de servicio</span>
        <span>{` y `}</span>
        <span className="text-black">Política de privacidad</span>
      </p>
    </div>
  );
}

function RightSide() {
  return (
    <div className="absolute h-[11.336px] right-[14.67px] top-[17.33px] w-[66.661px]" data-name="Right Side">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67 12">
        <g id="Right Side">
          <g id="Battery">
            <path d={svgPaths.p284dc240} id="Rectangle" opacity="0.35" stroke="var(--stroke-0, black)" />
            <path d={svgPaths.p3b01f0e0} fill="var(--fill-0, black)" id="Combined Shape" opacity="0.4" />
            <path d={svgPaths.p11b4bf10} fill="var(--fill-0, black)" id="Rectangle_2" />
          </g>
          <path d={svgPaths.pc434800} fill="var(--fill-0, black)" id="Wifi" />
          <path d={svgPaths.p28a9ed00} fill="var(--fill-0, black)" id="Mobile Signal" />
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
            <path d={svgPaths.p24372f50} fill="var(--fill-0, black)" />
            <path d={svgPaths.p3aa84e00} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2e6b3780} fill="var(--fill-0, black)" />
            <path d={svgPaths.p12b0b900} fill="var(--fill-0, black)" />
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

function Header() {
  return (
    <div className="absolute h-[56px] left-[-33px] top-[109px] w-[375px]" data-name="Header">
      <p className="absolute font-['Inter:Extra_Bold',_sans-serif] font-extrabold h-[44px] leading-[1.4] left-[calc(50%+43.5px)] not-italic text-[#1742a1] text-[32px] text-center top-[12px] tracking-[-0.64px] translate-x-[-50%] w-[166px]">MedAlert+</p>
    </div>
  );
}

export default function SignIn() {
  return (
    <div className="bg-[#dfe7ed] relative size-full" data-name="Sign In">
      <HomeIndicator />
      <Content />
      <StatusBar />
      <Header />
      <div className="absolute inset-[23.03%_25.07%_61.08%_30.93%] rounded-[52.5px] shadow-[0px_4px_4px_0px_rgba(255,255,255,0.25)]" data-name="Image">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[52.5px]">
          <img alt="" className="absolute h-[171.51%] left-[-7.32%] max-w-none top-[-7.42%] w-[114.63%]" src={imgImage} />
        </div>
      </div>
    </div>
  );
}