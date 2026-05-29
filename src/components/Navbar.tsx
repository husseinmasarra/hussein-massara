import React, { useState, useRef } from "react";
import { 
  Search, 
  ShoppingBag, 
  User as UserIcon, 
  Sun, 
  Moon, 
  Sparkles, 
  Globe, 
  Camera, 
  X,
  LogOut,
  LayoutDashboard,
  Bell,
  Clock
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useTheme } from "./ThemeContext";
import { User, UserRole, SystemSettings } from "../types";

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  cartCount: number;
  onOpenAdmin: () => void;
  settings: SystemSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onImageSearchResult: (matchedIds: string[], aiExplanation: string) => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenCart,
  cartCount,
  onOpenAdmin,
  settings,
  searchQuery,
  setSearchQuery,
  onImageSearchResult
}: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem("recent-searches");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const saveSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8); // Keep up to 8 of them
      localStorage.setItem("recent-searches", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteSearch = (query: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(item => item !== query);
      localStorage.setItem("recent-searches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllSearches = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("recent-searches");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveSearch(searchQuery);
    }
  };

  // Smart image search triggered with computer image uploaded
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingImage(true);
    setAiExplanation(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch("/api/gemini/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64String })
        });
        const data = await res.json();
        if (data.success) {
          onImageSearchResult(data.matchedProductIds, data.aiResponse);
          setAiExplanation(data.aiResponse);
        }
      } catch (error) {
        console.error("AI Search search error:", error);
      } finally {
        setAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-300 border-b border-gray-200/50 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 shrink-0">
            {settings.logo ? (
              <img 
                src={settings.logo} 
                alt="Logo" 
                className="w-10 h-10 rounded-xl object-cover border-2 border-blue-600 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-xl shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans leading-none">
                {language === "ar" ? settings.appNameAr : settings.appNameEn}
              </h1>
            </div>
          </div>

          {/* Advanced Search Interface */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 relative">
            <div className="relative flex items-center w-full group">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-3">
                <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsFocused(false), 200);
                }}
                className="w-full h-10 py-1 pl-10 pr-12 text-sm transition-all duration-300 border rounded-full bg-slate-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 start-padding"
                style={{
                  paddingStart: "2.5rem",
                  paddingEnd: "3rem"
                }}
              />
              
              {/* AI camera attachment button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title={t("searchImage")}
                className="absolute inset-y-0 right-2 flex items-center pr-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all cursor-pointer"
              >
                {analyzingImage ? (
                  <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>

            {/* Recent Searches Dropdown */}
            {isFocused && (
              <div 
                className="absolute left-0 right-0 z-50 mt-1.5 w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl animate-fade-in"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="p-3 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t("recentSearches")}</span>
                  </div>
                  {recentSearches.length > 0 && (
                    <button
                      onClick={clearAllSearches}
                      className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors cursor-pointer"
                    >
                      {t("clearAll")}
                    </button>
                  )}
                </div>

                {recentSearches.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400 dark:text-slate-500 font-sans italic">
                    {t("noRecentSearches")}
                  </div>
                ) : (
                  <ul className="py-1">
                    {recentSearches.map((term, index) => (
                      <li key={index} className="flex items-center justify-between group/item px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <button
                          onClick={() => {
                            setSearchQuery(term);
                            saveSearch(term);
                            setIsFocused(false);
                          }}
                          className="flex-1 text-start flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200 font-sans cursor-pointer truncate"
                        >
                          <Search className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover/item:text-blue-500 transition-colors" />
                          <span className="truncate">{term}</span>
                        </button>
                        <button
                          onClick={(e) => deleteSearch(term, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer opacity-0 group-hover/item:opacity-100 focus:opacity-100"
                          title={t("delete")}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Right Control Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Lang switcher */}
            <button
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="flex items-center gap-1 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs sm:text-sm font-semibold"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline font-sans">{language === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Dark & Light Theme selection */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title={theme === "light" ? t("nightMode") : t("dayMode")}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-indigo-700" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </button>

            {/* Admin Direct Entrance if admin / employee */}
            {currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.EMPLOYEE) && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1 p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer font-sans text-xs sm:text-sm font-bold"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">{t("adminSection")}</span>
              </button>
            )}

            {/* Cart Trigger Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/80 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-3s font-semibold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse font-mono">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth panel trigger */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2 border-l pl-2 border-gray-200/50 dark:border-slate-800">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans leading-none">{currentUser.username}</div>
                  <span className="text-3s text-gray-400 font-mono italic capitalize font-normal">{currentUser.role.toLowerCase()}</span>
                </div>
                <button
                  onClick={onLogout}
                  title={t("logout")}
                  className="p-2 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-sans text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t("login")}</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Floating AI match banner explanation */}
      {aiExplanation && (
        <div className="bg-blue-500 text-white font-sans text-xs px-4 py-2 flex items-center justify-between no-print animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{aiExplanation}</span>
          </div>
          <button 
            onClick={() => setAiExplanation(null)} 
            className="text-white/80 hover:text-white ml-4 p-1 cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      )}
    </header>
  );
}
