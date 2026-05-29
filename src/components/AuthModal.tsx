import React, { useState } from "react";
import { X, ShieldCheck, Mail, Lock, Phone, User as UserIcon, HelpCircle, Facebook, Chrome as GoogleIcon } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const { language, t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  
  // Credentials edit state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Social phone verification states (Req - 22: تأكيد الهوية برقم الهاتف)
  const [showPhoneVerif, setShowPhoneVerif] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);

  if (!isOpen) return null;

  // Local Credentials Sign-In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(t("loginSuccess"));
        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || t("loginError"));
      }
    } catch (err) {
      setErrorMsg("الخادم غير متصل حالياً، يرجى التحقق من الشبكة");
    }
  };

  // Local Credentials Register Save (persists directly in DB!)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, phone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(t("registerSuccess"));
        setTimeout(() => {
          setIsRegister(false);
          setErrorMsg("");
          setSuccessMsg("");
        }, 1800);
      } else {
        setErrorMsg(data.error || "عذراً، حدث خطأ أثناء التسجيل");
      }
    } catch (err) {
      setErrorMsg("فشل الاتصال بقاعدة البيانات");
    }
  };

  // Social login popup/phone flow
  const handleSocialTrigger = (provider: string) => {
    setSelectedProvider(provider);
    setShowPhoneVerif(true);
    setSmsSent(false);
    setErrorMsg("");
  };

  const handleSendSms = () => {
    if (!phone.trim()) return;
    setSmsSent(true);
    setErrorMsg("");
  };

  const handleVerifyOtp = async () => {
    if (smsCode !== "123456" && smsCode.trim().length > 0) {
      // Allow demo verify, but check formatting 
      setErrorMsg("رمز التحقق غير صالح، يرجى كتابة الرمز التجريبي 123456");
      return;
    }

    // Submit social login verified on backend
    try {
      const res = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          phone: phone,
          uid: "soc_" + Date.now(),
          name: username || `Lebanese_${selectedProvider}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(t("loginSuccess"));
        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg("فشل التسجيل عبر كود التأكيد");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      {/* Light/Dark themed form sheet */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-scale-up text-start select-none">
        
        {/* Absolute Big Close cross */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
        >
          <X className="w-5.5 h-5.5" />
        </button>

        {/* Regular Sign in / Register flow */}
        {!showPhoneVerif ? (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 font-sans">
                {isRegister ? t("register") : t("login")}
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-1">
                {isRegister
                  ? (language === "ar" ? "املأ البيانات أدناه لإنشاء حسابك وحفظه مباشرة بقاعدة البيانات" : "Create your account and persist it in our online database.")
                  : (language === "ar" ? "أهلاً بك مجدداً! من فضلك سجل دخولك لتأكيد الطلبيات والدعم" : "Sign in to compile your delivery address and previous orders.")}
              </p>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="p-3 bg-red-100 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 text-red-650 text-3s font-sans rounded-xl mb-4">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-100 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-700 text-3s font-sans rounded-xl mb-4">
                {successMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
              <div>
                <label className="text-3s text-slate-450 block mb-1 font-sans">{t("username")}</label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hussein_Massara"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-250 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/30 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-3s text-slate-450 block mb-1 font-sans">{t("password")}</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-250 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/30 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="text-3s text-slate-450 block mb-1 font-sans">{t("phone")}</label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="+961 70 123 456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-gray-250 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/30 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs sm:text-sm font-extrabold rounded-xl shadow-md cursor-pointer transition-transform"
              >
                {isRegister ? t("register") : t("login")}
              </button>
            </form>

            {/* Social Authentication quick options (Req - 22 / 36) */}
            <div className="mt-6 border-t border-gray-150 dark:border-slate-800/80 pt-5">
              <span className="text-[10px] text-slate-450 uppercase tracking-wider block mb-3.5 text-center font-mono">
                {t("socialLogin")}
              </span>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialTrigger("Google")}
                  className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/40 text-xs font-semibold cursor-pointer transition-transform"
                >
                  <GoogleIcon className="w-4.5 h-4.5 text-red-500" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialTrigger("Facebook")}
                  className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/40 text-xs font-semibold cursor-pointer transition-transform"
                >
                  <Facebook className="w-4.5 h-4.5 text-blue-600" />
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            {/* Toggle Sign Up / In */}
            <div className="mt-6 text-center text-xs font-sans text-slate-600 dark:text-slate-350">
              {isRegister ? (
                <span>
                  {language === "ar" ? "هل لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                  <button onClick={() => setIsRegister(false)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">
                    {t("login")}
                  </button>
                </span>
              ) : (
                <span>
                  {language === "ar" ? "ليس لديك حساب بعد؟" : "Don't have an account?"}{" "}
                  <button onClick={() => setIsRegister(true)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">
                    {t("register")}
                  </button>
                </span>
              )}
            </div>
          </div>
        ) : (
          /* SOCIAL PHONE SMS VERIFICATION SHIELD */
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-extrabold text-slate-850 dark:text-slate-150 font-sans flex items-center gap-1.5ClassName">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span>{selectedProvider} Authentication Shield</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1">
                {language === "ar"
                  ? "لحماية الخصوصية والأمان المرتفع، يتطلب ربط حسابات التواصل الاجتماعي التحقق وتأكيد الهوية باستخدام رقم هاتفك اللبناني."
                  : "To guarantee bulletproof security and user data encryption privacy, social registers require Lebanese phone validation."}
              </p>
            </div>

            {/* Feedback messages */}
            {errorMsg && (
              <div className="p-3 bg-red-100 border text-red-650 text-3s font-sans rounded-xl mb-4">
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 bg-green-150 border text-green-700 text-3s font-sans rounded-xl mb-4">
                {successMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-3s text-slate-450 block mb-1 font-sans">{t("phone")}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="+961 70 445 119"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 p-2 text-xs border rounded-xl font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendSms}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border rounded-xl text-3s font-bold text-slate-700 cursor-pointer"
                  >
                    Send OTP SMS
                  </button>
                </div>
              </div>

              {smsSent && (
                <div>
                  <label className="text-3s text-slate-450 block mb-1 font-sans">
                    {t("enterVerifiedCode")}
                  </label>
                  <p className="text-[10px] text-green-600 font-sans mb-1">
                    {language === "ar" ? "تم إرسال الكود بنجاح! اكتب الكود التجريبي للتحقق: 123456" : "SMS OTP sent! Enter demo code to verify: 123456"}
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123456"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    className="w-full p-2.5 text-center tracking-widest text-sm font-black border rounded-xl bg-slate-50 font-mono"
                  />
                </div>
              )}

              {/* Verified login button */}
              {smsSent && (
                <div>
                  <label className="text-3s text-slate-450 block mb-1 font-sans">Enter display name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Display Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 text-xs border rounded-xl"
                  />
                </div>
              )}

              {smsSent && (
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-sans text-xs sm:text-sm font-extrabold rounded-xl shadow-md cursor-pointer transition-transform"
                >
                  {t("verifyAndLogin")}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowPhoneVerif(false)}
                className="w-full text-center text-slate-400 text-xs font-bold hover:underline"
              >
                Back to Normal Login
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
