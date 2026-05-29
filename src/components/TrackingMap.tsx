import { useEffect, useRef, useState } from "react";
import { Truck, MapPin, Navigation, Clock, UserCheck, PhoneCall } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface TrackingMapProps {
  orderId: string;
  userAddress: string;
}

export default function TrackingMap({ orderId, userAddress }: TrackingMapProps) {
  const { language, t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [truckPos, setTruckPos] = useState({ x: 100, y: 150 });
  const [progress, setProgress] = useState(30);
  const [eta, setEta] = useState(15); // Minutes
  const [carrierName, setCarrierName] = useState("شربل سركيس (ديلفري)");
  const [carrierPhone, setCarrierPhone] = useState("+961 70 889 112");

  // City nodes coordinates map scale
  const cities = [
    { id: "tripoli", nameAr: "طرابلس", nameEn: "Tripoli", x: 140, y: 30 },
    { id: "jounieh", nameAr: "جونية", nameEn: "Jounieh", x: 130, y: 100 },
    { id: "beirut", nameAr: "بيروت (المستودع الرئيسي)", nameEn: "Beirut Hub (HQ)", x: 110, y: 150, hq: true },
    { id: "zahle", nameAr: "زحلة", nameEn: "Zahle", x: 230, y: 140 },
    { id: "saida", nameAr: "صيدا (الطلبية هنا)", nameEn: "Sidon Destination", x: 95, y: 220, dest: true },
    { id: "tyre", nameAr: "صور", nameEn: "Tyre", x: 75, y: 280 }
  ];

  useEffect(() => {
    // Progress increment timer
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        if (next >= 100) {
          setEta(0);
          return 100;
        }
        // Substract ETA
        if (next % 6 === 0) {
          setEta(e => Math.max(2, e - 1));
        }
        return next;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Update positions based on progression along roads Beirut -> Sidon
  useEffect(() => {
    const beirut = { x: 110, y: 150 };
    const saida = { x: 95, y: 220 };
    
    // Lerp
    const x = beirut.x + (saida.x - beirut.x) * (progress / 100);
    const y = beirut.y + (saida.y - beirut.y) * (progress / 100);
    
    setTruckPos({ x, y });
  }, [progress]);

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Sea background (Left)
    ctx.fillStyle = "#eff6ff";
    ctx.fillRect(0, 0, 100, canvas.height);
    
    // Draw Coast boundary
    ctx.beginPath();
    ctx.moveTo(110, 0);
    ctx.lineTo(105, 50);
    ctx.lineTo(100, 120);
    ctx.lineTo(85, 180);
    ctx.lineTo(80, 240);
    ctx.lineTo(65, 300);
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Lebanon green mountains background (Right side)
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(100, 0, canvas.width - 100, canvas.height);

    // Draw Main highways connecting cities
    ctx.beginPath();
    ctx.moveTo(140, 30); // Tripoli
    ctx.lineTo(130, 100); // Jounieh
    ctx.lineTo(110, 150); // Beirut
    ctx.lineTo(95, 220); // Saida
    ctx.lineTo(75, 280); // Tyre
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw Beirut -> Zahle highway branch
    ctx.beginPath();
    ctx.moveTo(110, 150);
    ctx.lineTo(230, 140);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Highlight completed transit road
    ctx.beginPath();
    ctx.moveTo(110, 150); // Beirut
    ctx.lineTo(truckPos.x, truckPos.y);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw Cities markers
    cities.forEach(city => {
      // Circle node
      ctx.beginPath();
      ctx.arc(city.x, city.y, city.hq || city.dest ? 7 : 5, 0, 2 * Math.PI);
      ctx.fillStyle = city.hq ? "#2563eb" : city.dest ? "#ef4444" : "#94a3b8";
      ctx.fill();

      // Label
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 10px Cairo, sans-serif";
      // Position offset
      const text = language === "ar" ? city.nameAr : city.nameEn;
      ctx.fillText(text, city.x + 10, city.y + 4);
    });

    // Draw Delivery truck symbol
    ctx.beginPath();
    ctx.arc(truckPos.x, truckPos.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#dc2626";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text for truck
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 9px Cairo, sans-serif";
    ctx.fillText("📦 Carrier", truckPos.x - 20, truckPos.y - 12);

  }, [truckPos, progress, language]);

  return (
    <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-lg font-sans">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Navigation className="w-4.5 h-4.5 text-blue-600 animate-spin" />
          <span>{t("trackOrder")} ({orderId})</span>
        </h4>
        <div className="flex items-center gap-1 text-xs font-bold text-red-600 font-mono">
          <Clock className="w-4 h-4" />
          <span>{eta > 0 ? `${eta} Min ETA` : "شحنتك وصلت!"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Draw Area */}
        <div className="md:col-span-7 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden relative border border-gray-200/50 dark:border-slate-800 flex justify-center">
          <canvas
            ref={canvasRef}
            width={340}
            height={320}
            className="block max-w-full h-auto"
          />
          
          <div className="absolute bottom-3 start-3 bg-white/95 dark:bg-slate-900/95 p-2 rounded-xl border border-gray-100 dark:border-slate-800 text-3s text-slate-700 dark:text-slate-300 pointer-events-none">
            {language === "ar" ? "📍 مسار بيروت - صيدا" : "📍 Transit Route: Beirut to Saida"}
          </div>
        </div>

        {/* Informational Progress Side */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Address */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
              <span className="text-3s text-slate-400 capitalize block font-mono">
                {language === "ar" ? "العنوان المقصود للتسليم" : "ADDRESS"}
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-2">
                {userAddress}
              </p>
            </div>

            {/* Carrier Representative */}
            <div className="flex items-center gap-3 p-3 bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/40 dark:border-slate-800 rounded-xl">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-lg">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-3s text-slate-400 block font-mono">{t("driverStatus")}</span>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{carrierName}</h5>
                <p className="text-3s font-bold text-blue-600 font-mono mt-0.5">{carrierPhone}</p>
              </div>
              <a 
                href={`tel:${carrierPhone}`}
                className="p-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg text-green-600 hover:scale-105 transition-transform"
                title="Call driver"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>

            {/* Steps Track list */}
            <div className="space-y-3 pl-2.5">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-500/30" />
                <span className="text-slate-500 font-sans">
                  {language === "ar" ? "غادرت بيروت (الساعة 08:15)" : "Departed Beirut Hub (08:15 AM)"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`h-2 w-2 rounded-full ${progress >= 60 ? "bg-blue-600 ring-4 ring-blue-500/30" : "bg-gray-300"}`} />
                <span className={progress >= 60 ? "text-slate-500" : "text-slate-400"}>
                  {language === "ar" 
                    ? "مرت عبر الخط الساحلي الدامور" 
                    : "Passed Damour Coastal highway Check"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`h-2 w-2 rounded-full ${progress >= 100 ? "bg-blue-600 ring-4 ring-blue-500/30" : "bg-gray-300 animate-ping"}`} />
                <span className={progress >= 100 ? "text-slate-500 font-semibold" : "text-slate-400 font-medium"}>
                  {progress >= 100 
                    ? (language === "ar" ? "وصلت إلى صيدا! المندوب بانتظارك" : "Arrived in Sidon! Payment COD ready")
                    : (language === "ar" ? "يقترب من صيدا" : "Approaching Saida - final leg")}
                </span>
              </div>
            </div>

          </div>

          {/* Progress gauge */}
          <div className="mt-5 pt-3 border-t border-gray-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-3s font-mono text-slate-500 mb-1">
              <span>{progress}% Transit</span>
              <span>COD ONLY</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-red-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
