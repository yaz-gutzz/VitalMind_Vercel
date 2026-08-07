import svgPaths from "../imports/svg-m9zbqoronz";

export function StatusBar() {
  return (
    <div className="h-[44px] w-full overflow-clip" data-name="Status Bar">
      {/* Right Side - Battery, WiFi, Signal */}
      <div className="absolute h-[11.336px] right-[14.67px] top-[17.33px] w-[66.662px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67 12">
          <g id="Right Side">
            <g id="Battery">
              <path d={svgPaths.p128d180} id="Rectangle" opacity="0.35" stroke="black" />
              <path d={svgPaths.p3b1e5e00} fill="black" id="Combined Shape" opacity="0.4" />
              <path d={svgPaths.p17d71400} fill="black" id="Rectangle_2" />
            </g>
            <path d={svgPaths.p24912f80} fill="black" id="Wifi" />
            <path d={svgPaths.p9005d40} fill="black" id="Mobile Signal" />
          </g>
        </svg>
      </div>
      
      {/* Left Side - Time */}
      <div className="absolute h-[21px] left-[21px] top-[12px] w-[54px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 54 21">
          <g id="Time">
            <g id="9:41">
              <path d={svgPaths.p3de63e00} fill="black" />
              <path d={svgPaths.p3029a300} fill="black" />
              <path d={svgPaths.p2e0c43c0} fill="black" />
              <path d={svgPaths.p38350600} fill="black" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
