export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Logo Shield Icon */}
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shield Background - Gradient from turquoise to lime green */}
          <defs>
            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0077FF" />
              <stop offset="50%" stopColor="#32E3C2" />
              <stop offset="100%" stopColor="#5AA622" />
            </linearGradient>
          </defs>
          
          {/* Shield Shape */}
          <path
            d="M100 20 C140 20, 160 30, 160 50 L160 100 C160 140, 140 170, 100 180 C60 170, 40 140, 40 100 L40 50 C40 30, 60 20, 100 20 Z"
            fill="url(#shieldGradient)"
            opacity="0.9"
          />
          
          {/* Heartbeat Line - Sky Blue */}
          <path
            d="M50 90 L70 90 L80 70 L90 110 L100 90 L110 90"
            stroke="#0077FF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Pills - White with plus signs */}
          <g>
            {/* Pill 1 */}
            <ellipse cx="120" cy="80" rx="15" ry="25" fill="white" transform="rotate(45 120 80)" />
            <path d="M120 70 L120 90 M110 80 L130 80" stroke="#32E3C2" strokeWidth="3" strokeLinecap="round" />
            
            {/* Pill 2 */}
            <ellipse cx="140" cy="120" rx="12" ry="20" fill="white" transform="rotate(-20 140 120)" />
            <path d="M140 107 L140 133 M127 120 L153 120" stroke="#5AA622" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          
          {/* Medical Cross - Top center */}
          <g transform="translate(90, 30)">
            <rect x="8" y="0" width="4" height="20" fill="white" rx="2" />
            <rect x="0" y="8" width="20" height="4" fill="white" rx="2" />
          </g>
        </svg>
      </div>

      {/* Brand Name */}
      <div className="text-center">
        <h1 className="text-2xl" style={{ color: '#0A2E50' }}>
          MedAlert<span style={{ color: '#5AA622' }}>+</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Smart Health Assistant</p>
      </div>
    </div>
  );
}

export function BrandLogoSmall({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Small Shield Icon */}
      <div className="w-10 h-10">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shieldGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0077FF" />
              <stop offset="50%" stopColor="#32E3C2" />
              <stop offset="100%" stopColor="#5AA622" />
            </linearGradient>
          </defs>
          
          <path
            d="M100 20 C140 20, 160 30, 160 50 L160 100 C160 140, 140 170, 100 180 C60 170, 40 140, 40 100 L40 50 C40 30, 60 20, 100 20 Z"
            fill="url(#shieldGradientSmall)"
            opacity="0.9"
          />
          
          <path
            d="M50 90 L70 90 L80 70 L90 110 L100 90 L110 90"
            stroke="#ffffff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          <g transform="translate(90, 35)">
            <rect x="7" y="0" width="6" height="20" fill="white" rx="2" />
            <rect x="0" y="7" width="20" height="6" fill="white" rx="2" />
          </g>
        </svg>
      </div>

      {/* Brand Name Small */}
      <div>
        <p className="text-lg" style={{ color: '#0A2E50' }}>
          MedAlert<span style={{ color: '#5AA622' }}>+</span>
        </p>
      </div>
    </div>
  );
}
