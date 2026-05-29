import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Star, 
  MapPin, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  Bell, 
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Navigation,
  X,
  Plus,
  ChevronDown,
  Calculator,
  Coins
} from "lucide-react";
import { useLanguage } from "./components/LanguageContext";
import { useTheme } from "./components/ThemeContext";
import { 
  Product, 
  Category, 
  User, 
  UserRole, 
  Coupon, 
  Order, 
  OrderStatus, 
  SystemSettings 
} from "./types";

// Import custom components
import Navbar from "./components/Navbar";
import HeroCarousel from "./components/HeroCarousel";
import ProductDetailsModal from "./components/ProductDetailsModal";
import CustomerChat from "./components/CustomerChat";
import TrackingMap from "./components/TrackingMap";
import AdminDashboard from "./components/AdminDashboard";
import AuthModal from "./components/AuthModal";
import CartDrawer from "./components/CartDrawer";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function App() {
  const { language, t } = useLanguage();
  const { theme } = useTheme();

  // DB States synchronized directly with Express API
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    appNameEn: "Cedars Direct Market",
    appNameAr: "متجر الأرز المباشر",
    logo: "",
    heroBanners: [],
    freeDeliveryThresholdUSD: 75,
    deliveryFeeUSD: 5,
    usdToLbpRate: 90000
  });

  // Client states
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem("lebanon-store-user");
    return cached ? JSON.parse(cached) : null;
  });

  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(1500); // Max USD slider
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("default");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // Dialog panels toggles
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // active shipment for map tracking
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Smart notification alert elements
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; time: string; read: boolean }>>([
    { id: "not1", title: "كوبون LEBANON2026 نشط حالياً لتخفيضات تصل إلى 15٪!", time: "Just Now", read: false },
    { id: "not2", title: "خدمة التوصيل المجاني للمنازل تم تفعيلها عند التسوق بـ 75 دولار وأكثر.", time: "5m ago", read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Synchronize data from backend full online database
  const syncData = async () => {
    try {
      const res = await fetch("/api/sync-data");
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);
      setCoupons(data.coupons || []);
      setSettings(data.settings || {});
      setAllOrders(data.orders || []);
    } catch (error) {
      console.error("Direct sync error, fallback state is active", error);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  // Update cart count whenever item state changes
  useEffect(() => {
    const total = cartItems.reduce((count, item) => count + item.quantity, 0);
    setCartCount(total);
  }, [cartItems]);

  // Handle local logins caching
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("lebanon-store-user", JSON.stringify(user));
    // Trigger login alert notification
    addNotification(`أهلاً بك يا ${user.username}! تم تسجيل الدخول بنجاح لحفظ طلبياتك.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("lebanon-store-user");
    setCartItems([]);
    setTrackingOrder(null);
  };

  // Add notification helper
  const addNotification = (title: string) => {
    setNotifications(prev => [
      { id: "not_" + Date.now(), title, time: "Just Now", read: false },
      ...prev
    ]);
  };

  // Search by images callback triggered from Navbar camera AI search
  const handleImageSearchResult = (matchedIds: string[], aiExplanation: string) => {
    if (matchedIds.length > 0) {
      // Filter list manually to first matching product to highlight
      const p = products.find(prod => matchedIds.includes(prod.id));
      if (p) {
        setSelectedProduct(p);
        addNotification(`AI Search Match: تم التعرف على صورة مشابهة للمنتج ${language === 'ar' ? p.nameAr : p.nameEn}`);
      }
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    // Check stock limit
    if (product.stock <= 0) return;

    setCartItems(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });

    // Notify user of successful item addition (Satisfies 39 - Cart does NOT pop up automatically)
    addNotification(`تمت إضافة ${language === "ar" ? product.nameAr : product.nameEn} لسلة المشتريات.`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Place interactive COD order to backend
  const handleCheckout = async (address: string, phone: string, couponCode?: string, discountUSD?: number) => {
    if (!currentUser) {
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return;
    }

    const subtotalUSD = cartItems.reduce((sum, item) => sum + item.product.priceUSD * item.quantity, 0);
    const isFreeDelivery = subtotalUSD >= settings.freeDeliveryThresholdUSD;
    const deliveryCostUSD = isFreeDelivery ? 0 : settings.deliveryFeeUSD;
    const totalUSD = Math.max(0, subtotalUSD + deliveryCostUSD - (discountUSD || 0));

    const orderPayload = {
      userId: currentUser.id,
      userName: currentUser.username,
      items: cartItems.map(item => ({
        productId: item.product.id,
        productNameEn: item.product.nameEn,
        productNameAr: item.product.nameAr,
        productImage: item.product.image,
        quantity: item.quantity,
        priceUSD: item.product.priceUSD
      })),
      subtotalUSD,
      deliveryCostUSD,
      discountUSD: discountUSD || 0,
      totalUSD,
      couponCode,
      address,
      phone
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (data.success) {
        setAllOrders(data.orders);
        setProducts(data.products);
        setCartItems([]);
        setIsCartOpen(false);
        setTrackingOrder(data.order); // Load directly into tracking mode to show Map instantly!

        addNotification(`تم تأكيد طلبيتك كود ${data.order.id}! يمكنك تتبع الشحنة على الخريطة الآن.`);
      }
    } catch (err) {
      console.error("Checkout issue", err);
    }
  };

  // Administration endpoints callbacks
  const handleAdminSaveProduct = async (prod: Product) => {
    try {
      const res = await fetch("/api/products/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prod)
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        addNotification("تم تحديث الفهرس التجاري وحفظ التعديلات بقاعدة البيانات.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/delete/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminSaveCategory = async (cat: Category) => {
    try {
      const res = await fetch("/api/categories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat)
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/delete/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminSaveSettings = async (newSettings: SystemSettings) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        addNotification(`تم تحديث اسم التطبيق إلى ${language === 'ar' ? data.settings.appNameAr : data.settings.appNameEn}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status })
      });
      const data = await res.json();
      if (data.success) {
        setAllOrders(data.orders);
        addNotification(`الطلب ${orderId} تم تعديل حالته إلى: ${status}`);
        if (trackingOrder?.id === orderId) {
          setTrackingOrder(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReview = async (productId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/products/${productId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.username,
          rating,
          comment
        })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        // Refresh selected product if view matches
        if (selectedProduct?.id === productId) {
          setSelectedProduct(data.product);
        }
        addNotification("نشكرك على مشاركة تجربتك! تم حفظ التقييم بنجاح.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logic based on choices (By price range, minimum stars ratings, and stock presence)
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameAr.includes(searchQuery) ||
      p.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.descriptionAr.includes(searchQuery);

    const matchesCategory = selectedCategory === "" || p.categoryId === selectedCategory || p.subCategoryId === selectedCategory;
    const matchesPrice = p.priceUSD <= priceRange;
    const matchesRating = p.ratingAverage >= minRating;
    const matchesInStock = !onlyInStock || p.stock > 0;

    return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesInStock;
  });

  // Apply sorting configuration
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") {
      return a.priceUSD - b.priceUSD;
    } else if (sortBy === "price_desc") {
      return b.priceUSD - a.priceUSD;
    } else if (sortBy === "rating_desc") {
      return b.ratingAverage - a.ratingAverage;
    } else if (sortBy === "name") {
      return language === "ar" ? a.nameAr.localeCompare(b.nameAr) : a.nameEn.localeCompare(b.nameEn);
    }
    return 0; // default (natural database order)
  });

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans flex flex-col justify-between ${
      theme === "dark" 
        ? "bg-slate-950 text-slate-100 dark" 
        : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* 1. STICKY DUAL-LANGUAGE DAY-NIGHT NAVBAR */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartCount}
        onOpenAdmin={() => setIsAdminOpen(true)}
        settings={settings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onImageSearchResult={handleImageSearchResult}
      />

      {/* Floating System Alerts Bell Trigger Overlay */}
      <div className="relative max-w-7xl mx-auto w-full px-4 no-print select-none">
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 bg-red-650 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition cursor-pointer"
            title={t("notifications")}
          >
            <Bell className="w-5 h-5 animate-pulse" />
          </button>

          {/* alerts index list drop */}
          {showNotifications && (
            <div className="absolute right-0 top-14 w-80 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-45 animate-fade-in text-start">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/60 pb-2 flex items-center justify-between">
                <span>{t("notifications")}</span>
                <button onClick={() => setNotifications([])} className="text-[10px] text-red-500 font-bold hover:underline">Clear</button>
              </h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic font-sans">لا توجد إشعارات جديدة حالياً.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-[11px] leading-relaxed">
                      <p className="font-sans text-slate-750 dark:text-slate-200">{n.title}</p>
                      <span className="text-[9px] text-gray-400 font-mono mt-1 block">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. CHOOSE MAIN LAYOUT WRAPPER */}
      <main className="flex-1 px-4 py-6 sm:py-10 mx-auto w-full max-w-7xl space-y-8 select-none">
        
        {/* Dynamic Advertisings Carousel Sliders (Req - 14 / 37) */}
        <HeroCarousel banners={settings.heroBanners} />

        {/* Categories filters node section list (Req - 3) as custom dropdown list selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div>
              <span className="text-2s font-bold tracking-widest text-[#4f46e5] dark:text-indigo-400 uppercase font-mono block mb-1 text-start">
                {t("categoryGroup")}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-start">
                {language === "ar" ? "تصفية المنتجات حسب الأقسام المتاحة بالمتجر" : "Filter products dynamically by clicking the dropdown below"}
              </p>
            </div>

            {selectedCategory !== "" && (
              <button
                onClick={() => {
                  setSelectedCategory("");
                  window.scrollTo({ top: 350, behavior: "smooth" });
                }}
                className="px-4.5 py-2.5 self-start sm:self-auto flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 border border-indigo-200/80 dark:border-slate-850 bg-indigo-50/20 dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>{language === "ar" ? "← العودة للأقسام الإستعراضية" : "← Back to Main Categories"}</span>
              </button>
            )}
          </div>

          {/* Cheerful Custom Category Dropdown List selector */}
          <div className="relative inline-block text-start w-full sm:w-80 z-20">
            <button
              type="button"
              onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
              className="flex items-center justify-between w-full px-5 py-3 text-xs font-black bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-slate-800 dark:text-slate-100 font-sans hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">📁</span>
                <span>
                  {selectedCategory === "" 
                    ? (language === "ar" ? "الرئيسية (أقسام المتجر)" : "Home (Categories)") 
                    : (categories.find(c => c.id === selectedCategory) 
                        ? (language === "ar" 
                            ? categories.find(c => c.id === selectedCategory)?.nameAr 
                            : categories.find(c => c.id === selectedCategory)?.nameEn)
                        : (language === "ar" ? "الرئيسية (أقسام المتجر)" : "Home (Categories)"))}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-350 ${categoryMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {categoryMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setCategoryMenuOpen(false)}
                />
                <div className="absolute right-0 left-0 mt-2 w-full origin-top-right rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xl z-20 overflow-hidden divide-y divide-slate-105 dark:divide-slate-800 animate-scale-up">
                  <div className="py-1 max-h-80 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setCategoryMenuOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-4.5 py-3 text-xs text-start cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent dark:hover:from-slate-800/50 transition-all ${
                        selectedCategory === "" 
                          ? "bg-indigo-50/70 dark:bg-slate-800/75 font-black text-indigo-600 dark:text-indigo-400" 
                          : "font-semibold text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">✨ {language === "ar" ? "الصفحة الرئيسية (الأقسام)" : "Home (Main Categories)"}</span>
                      {selectedCategory === "" && <span className="text-indigo-650 dark:text-indigo-400 font-black">✓</span>}
                    </button>
                    {categories.filter(c => !c.parentId).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setCategoryMenuOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-4.5 py-3 text-xs text-start cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent dark:hover:from-slate-800/50 transition-all ${
                          selectedCategory === cat.id 
                            ? "bg-indigo-50/70 dark:bg-slate-800/75 font-black text-indigo-600 dark:text-indigo-400" 
                            : "font-semibold text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span className="flex items-center gap-2">📁 {language === "ar" ? cat.nameAr : cat.nameEn}</span>
                        {selectedCategory === cat.id && <span className="text-indigo-650 dark:text-indigo-400 font-black">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {/* PRODUCTS AREA (FULL WIDTH) FOR RESPONSIVE RICH DISPLAY */}
        <div className="space-y-6 text-start">
          {/* Visual alert if tracking map is active (Req - 24) */}
          {trackingOrder && (
            <div className="relative bg-white dark:bg-slate-900 border-2 border-[#4f46e5]/20 p-2 sm:p-4 rounded-3xl shadow-xl animate-fade-in-down mb-6">
              <button
                onClick={() => setTrackingOrder(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-650 rounded-full cursor-pointer z-20"
              >
                <X className="w-5 h-5" />
              </button>
              <TrackingMap orderId={trackingOrder.id} userAddress={trackingOrder.address} />
            </div>
          )}

          {selectedCategory === "" ? (
            <div className="space-y-6 animate-fade-in text-start">
              <div className="p-6 bg-slate-100/40 dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/80">
                <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-1.5 font-sans">
                  {language === "ar" ? "أقسام المتجر المتاحة بالتصنيفات" : "Available Store Categories"}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {language === "ar" 
                    ? "جميع المنتجات معروضة ومقسمة بالكامل داخل التصنيفات المعتمدة. للاستعراض والتسوق، يرجى اختيار أحد الأقسام الشاملة بالأسفل مباشرة للتنقل السريع." 
                    : "Products are categorized within corresponding store catalog departments. To browse or purchase items, kindly select one of our premium categories below."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {categories.filter(c => !c.parentId).map((cat) => {
                  const isElectronics = cat.id.includes("electronics");
                  const coverImg = isElectronics 
                    ? "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
                    : "https://images.unsplash.com/photo-1541014741259-df5290db5785?w=800&auto=format&fit=crop&q=80";
                    
                  const desc = isElectronics
                    ? (language === "ar" 
                        ? "اكتشف الهواتف الذكية الأحدث، سماعات الرأس اللاسلكية بنظام العزل النشط، وإكسسوارات الأجهزة المتطورة مع كفالة وسعر صرف حقيقي."
                        : "Discover the latest smartphones, advanced wireless headphones with active noise cancellation, and high-fidelity tech device accessories.")
                    : (language === "ar"
                        ? "تذوق المونة اللبنانية الأصيلة من زعتر بري جنوبي، زيت زيتون بكر ممتاز، حلويات البقلاوة المذهلة ومختارات الشوكولاتة العضوية الفاخرة."
                        : "Savor authentic Lebanese organic thyme, cold-pressed extra virgin olive oil, traditional sweets, and fine mountain chocolates.");

                  const iconObj = isElectronics ? "💻" : "🌾";
                  const childCats = categories.filter(sub => sub.parentId === cat.id);

                  return (
                    <div 
                      key={cat.id}
                      className="flex flex-col justify-between bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-300 group hover:-translate-y-1"
                    >
                      <div>
                        {/* cover banner image of category */}
                        <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-950">
                          <img 
                            src={coverImg} 
                            alt={cat.nameEn} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                          <div className="absolute bottom-4 start-4 flex items-center gap-2">
                            <span className="text-xl bg-white/10 backdrop-blur-md p-1.5 rounded-xl">{iconObj}</span>
                            <h3 className="text-sm sm:text-base font-black text-white font-sans tracking-tight">
                              {language === "ar" ? cat.nameAr : cat.nameEn}
                            </h3>
                          </div>
                        </div>

                        {/* content box body */}
                        <div className="p-6 space-y-4">
                          <p className="text-[11px] sm:text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans font-medium">
                            {desc}
                          </p>

                          {/* list the subcategories of this category */}
                          {childCats.length > 0 && (
                            <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                              <span className="text-[9px] font-black tracking-widest text-[#4f46e5] dark:text-indigo-400 uppercase font-mono block">
                                {language === "ar" ? "الأقسام الفرعية" : "Sections Included"}
                              </span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {childCats.map(sub => (
                                  <button
                                    key={sub.id}
                                    onClick={() => {
                                      setSelectedCategory(sub.id);
                                      window.scrollTo({ top: 350, behavior: "smooth" });
                                    }}
                                    className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition cursor-pointer"
                                  >
                                    {language === "ar" ? sub.nameAr : sub.nameEn}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-6 pt-0">
                        <button
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            window.scrollTo({ top: 350, behavior: "smooth" });
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>{language === "ar" ? `دخول وتصفح الأجهزة والمنتجات` : `Browse Department`}</span>
                          <span className="font-mono">→</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.length === 0 ? (
                <div className="col-span-full py-16 bg-white dark:bg-slate-900/35 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4">
                  <span className="text-4xl block">🔍</span>
                  <p className="text-xs font-bold text-slate-500">
                    {language === "ar" ? "لا توجد أي نتائج مطابقة للتصفية المختارة. حاول تعديل النطاق السعري أو البحث." : "No matching items for the chosen filters. Try modifying your price range or search criteria."}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                      setPriceRange(1500);
                      setMinRating(0);
                      setSortBy("default");
                      setOnlyInStock(false);
                    }}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {language === "ar" ? "إعادة تعيين خيارات التصفية" : "Reset Filters"}
                  </button>
                </div>
              ) : (
                sortedProducts.map((p) => {
                  const lbpPrice = p.priceUSD * (settings.usdToLbpRate || 90000);
                  const isHighlyRated = p.ratingAverage >= 4.5;

                  return (
                    <div
                      key={p.id}
                      className="flex flex-col justify-between bg-white dark:bg-slate-900/45 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-400/30 hover:-translate-y-1 transition duration-300"
                    >
                      {/* Realistic Product Image */}
                      <div className="relative h-44 bg-slate-100 dark:bg-slate-950">
                        <img
                          src={p.image}
                          alt={p.nameEn}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isHighlyRated && (
                          <span className="absolute top-3 right-3 bg-red-650 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                            <Sparkles className="w-3 h-3 fill-current text-white" />
                            <span>POPULAR</span>
                          </span>
                        )}
                        {p.stock <= 3 && p.stock > 0 && (
                          <span className="absolute top-3 start-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                            {t("lowStockAlert")}
                          </span>
                        )}
                      </div>

                      {/* Metadata summary */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Rating average indicators */}
                          <div className="flex items-center gap-1 mb-1.5">
                            <div className="flex text-amber-500">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-3.5 h-3.5 ${
                                    idx < Math.round(p.ratingAverage || 0) 
                                      ? "fill-current" 
                                      : "text-gray-200 dark:text-slate-800"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-700 dark:text-slate-200 font-extrabold font-mono">
                              {p.ratingAverage || "0.0"} ({p.reviews?.filter(r => r.approved !== false).length || 0})
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
                            {language === "ar" ? p.nameAr : p.nameEn}
                          </h4>
                          
                          <p className="text-[11px] text-slate-705 dark:text-slate-300 font-medium line-clamp-2 mt-1.5 font-sans leading-relaxed">
                            {language === "ar" ? p.descriptionAr : p.descriptionEn}
                          </p>
                        </div>

                        {/* Pricing, Detail button, Buy buttons triggers (Req - 8 / 19) */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-baseline justify-between gap-1 mb-3">
                            <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-slate-100">
                              {t("currencyUSD")}{p.priceUSD.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-slate-650 dark:text-slate-300 font-mono">
                              / LBP {lbpPrice.toLocaleString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedProduct(p)}
                              className="h-8.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#2563eb] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all text-[10px] font-extrabold font-sans cursor-pointer text-center"
                            >
                              {t("productDetails")}
                            </button>
                            {p.stock > 0 ? (
                              <button
                                onClick={() => handleAddToCart(p)}
                                className="h-8.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/10 text-white rounded-xl text-[10px] font-extrabold font-sans cursor-pointer flex items-center justify-center gap-1 active:scale-[0.97] transition-all duration-300"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{t("addToCart")}</span>
                              </button>
                            ) : (
                              <span className="text-red-500 font-sans font-bold text-[10px] flex items-center justify-center border rounded-xl border-red-500/10">
                                {t("outOfStock")}
                              </span>
                            )}
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* BOTTOM SECTION FOR FILTERS & HISTORIC DISPATCHES (انقل التصفية وطلباتي السابقة الى اسفل التطبيق) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-start pt-10 border-t border-slate-200/50 dark:border-slate-800/80">
          
          {/* FILTER PANEL */}
          <div className="lg:col-span-7">
            <div className="p-6 bg-white dark:bg-slate-900/45 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-5 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase font-mono tracking-wider">
                  {language === "ar" ? "تصفية وبحث متقدم" : "Advanced Filtering & Search"}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
                {/* Price range slider */}
                <div>
                  <label className="text-3s text-slate-700 dark:text-slate-200 uppercase block mb-1 font-bold font-mono">{t("priceRange")}</label>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-10 pb-0.5 font-mono">
                    <span>$1</span>
                    <span>${priceRange} max</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="1500"
                    step="5"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-blue-600 transition-all cursor-pointer bg-slate-100 dark:bg-slate-800 rounded-lg h-2"
                  />
                </div>

                {/* Stars Rating selection */}
                <div>
                  <label className="text-3s text-slate-700 dark:text-slate-200 uppercase block mb-1.5 font-bold font-mono">{t("minRating")}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => setMinRating(stars === minRating ? 0 : stars)}
                        className={`flex-1 p-2 border rounded-xl transition-all duration-300 transform active:scale-90 cursor-pointer ${
                          stars <= minRating 
                            ? "bg-amber-550/10 border-amber-500 text-amber-500 shadow-md shadow-amber-500/10" 
                            : "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-400"
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                {/* Advanced Sorting dropdown */}
                <div>
                  <label className="text-3s text-slate-750 dark:text-slate-200 uppercase block mb-1.5 font-bold font-mono">
                    {language === "ar" ? "ترتيب المنتجات" : "Product Sorting"}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 hover:border-slate-350 dark:hover:border-slate-700 cursor-pointer transition text-slate-850 dark:text-slate-200"
                  >
                    <option value="default">{language === "ar" ? "الترتيب الافتراضي" : "Default Sort"}</option>
                    <option value="price_asc">{language === "ar" ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</option>
                    <option value="price_desc">{language === "ar" ? "السعر: من الأعلى للأقل" : "Price: High to Low"}</option>
                    <option value="rating_desc">{language === "ar" ? "التقييم: الأعلى تقييماً" : "Highly Rated First"}</option>
                    <option value="name">{language === "ar" ? "الاسم: أبجدياً" : "Alphabetical Index"}</option>
                  </select>
                </div>

                {/* In stock control toggle */}
                <div className="flex flex-col justify-end">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60">
                    <span className="text-3s text-slate-750 dark:text-slate-200 font-bold font-mono uppercase">
                      {language === "ar" ? "المنتجات المتوفرة فقط" : "In-Stock Only"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOnlyInStock(!onlyInStock)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${onlyInStock ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-755"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${onlyInStock ? "right-1 font-bold" : "left-1"}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MY PREVIOUS ORDERS / SHIPMENTS (طلباتي السابقة) */}
          <div className="lg:col-span-12 xl:col-span-5">
            {currentUser && (
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4 backdrop-blur-md text-start h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 font-sans border-b border-slate-100 dark:border-slate-800/60 pb-2">
                    🛡️ {t("prevOrders")}
                  </h4>
                  <div className="space-y-3 px-1 mt-3.5 max-h-[220px] overflow-y-auto">
                    {allOrders.filter(o => o.userId === currentUser.id).length === 0 ? (
                      <p className="text-2s text-gray-400 italic">No previous orders logged.</p>
                    ) : (
                      allOrders.filter(o => o.userId === currentUser.id).map(ord => (
                        <div 
                          key={ord.id} 
                          className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl cursor-pointer hover:border-indigo-500/30 transition shadow-sm"
                          onClick={() => {
                            setTrackingOrder(ord);
                            window.scrollTo({ top: 350, behavior: "smooth" });
                          }}
                        >
                          <div className="flex justify-between text-[10px] font-bold font-mono">
                            <span className="text-red-500">{ord.id}</span>
                            <span className={`capitalize px-2 py-0.5 rounded text-[9px] font-extrabold ${ord.status === "delivered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {ord.status}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-slate-850 dark:text-slate-100 mt-1 flex justify-between">
                            <span>Items: {ord.items.length}</span>
                            <span>Total Price: ${ord.totalUSD}</span>
                          </div>
                          <span className="text-[9px] text-[#4f46e5] font-sans mt-1 block">📍 Click to display shipment route on Map</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-400 leading-relaxed font-sans">
                  {language === "ar" ? "اضغط على أي طلب من طلباتك السابقة لعرض حركة الشحن وسير العمل على الخريطة مباشرة بالأعلى." : "Click on any past shipment record to render the real-time shipping milestones on the map tracker."}
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* 3. FLOATERS CHAT FOR LIVE CUSTOMER SERVICE (Req - 16 / 25) */}
      <CustomerChat currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />

      {/* 4. FOOTER */}
      <footer className="border-t border-gray-200/50 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 text-center select-none no-print">
        <p className="text-3s text-slate-450 uppercase tracking-widest font-mono">
          © 2026 {language === 'ar' ? settings.appNameAr : settings.appNameEn} | COD Only Lebanon Market
        </p>
      </footer>

      {/* MODAL LIGHTBOXES GATEWAY */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        settings={settings}
        coupons={coupons}
        onCheckout={handleCheckout}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        categories={categories}
        users={dbUsersPlaceholder()} // Will load dynamically
        orders={allOrders}
        coupons={coupons}
        settings={settings}
        onSaveProduct={handleAdminSaveProduct}
        onDeleteProduct={handleAdminDeleteProduct}
        onSaveCategory={handleAdminSaveCategory}
        onDeleteCategory={handleAdminDeleteCategory}
        onSaveSettings={handleAdminSaveSettings}
        onUpdateOrderStatus={handleAdminUpdateOrderStatus}
      />

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          usdToLbpRate={settings.usdToLbpRate}
          currentUser={currentUser}
          onAddReview={handleAddReview}
          onAddToCart={handleAddToCart}
        />
      )}

    </div>
  );

  // Helper placeholder for managing registered members list
  function dbUsersPlaceholder() {
    return [
      { id: "u_admin", username: "admin", role: UserRole.ADMIN, phone: "+96170123456" },
      { id: "u_employee", username: "employee", role: UserRole.EMPLOYEE, phone: "+96171456789" },
      { id: "u_merchant", username: "merchant", role: UserRole.MERCHANT, phone: "+96176987654" },
      { id: "u_demo", username: "Hussein", role: UserRole.USER, phone: "+96179112233" }
    ];
  }
}
