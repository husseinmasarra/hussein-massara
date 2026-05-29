import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    appName: "بوابة الأرز الإلكترونية",
    searchPlaceholder: "ابحث عن السلع، الماركات والمنتجات...",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    register: "إنشاء حساب جديد",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    phone: "رقم الهاتف اللبناني",
    address: "عنوان التوصيل بالتفصيل (يرجى تحديد المدينة والشارع)",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    loginError: "اسم المستخدم أو كلمة المرور خاطئة",
    registerSuccess: "تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن!",
    currencyUSD: "$",
    currencyLBP: "ل.ل.",
    checkout: "تأكيد الطلب",
    cartTitle: "سلة المشتريات",
    emptyCart: "السلة فارغة حالياً. أضف بعض المنتجات الرائعة للبدء!",
    deliveryFee: "تكلفة التوصيل",
    freeDelivery: "توصيل مجاني",
    codOnly: "الدفع نقداً عند الاستلام فقط (COD)",
    totalInvoice: "حساب الفاتورة الإجمالي",
    freeDeliveryAlert: "أضف منتجات بقيمة {amount} للحصول على توصيل مجاني!",
    congratsFreeDelivery: "لقد حصلت على خدمة التوصيل المجاني للطلب!",
    productDetails: "تفاصيل المنتج",
    addToCart: "إضافة إلى السلة",
    stockStatus: "المخزون المتوفر",
    outOfStock: "نفذت الكمية",
    searchImage: "البحث الذكي بالصور",
    chatWithAdmin: "الدردشة مع خدمة العملاء لطلب الدعم",
    rating: "التقييم",
    reviews: "الآراء والتقييمات",
    addReview: "إضافة تقييم",
    reviewPlaceholder: "اكتب تجربتك مع المنتج هنا...",
    submitReview: "إرسال التقييم",
    priceRange: "تصفية حسب نطاق السعر",
    minRating: "الحد الأدنى للتقييم",
    trackOrder: "تتبع شحنتك المباشرة",
    driverStatus: "حالة سائق التوصيل المستلم",
    notifications: "الإشعارات الذكية والعرائض",
    adminDashboard: "لوحة تحكم المدير الإداري",
    categoryGroup: "التصنيفات",
    allProducts: "عرض جميع المنتجات",
    adminSection: "الإدارة الإدارية",
    ordersSection: "تتبع الطلبيات",
    categoriesSection: "إضافة وتحرير التصنيفات",
    usersSection: "المستخدمين النشطين",
    settingsSection: "الإعدادات العامة لموقعك",
    employeesSection: "طاقم الموظفين",
    newOrdersSection: "الطلبيات الجديدة الواردة",
    deliveredOrdersSection: "الطلبيات المسلمة والناجحة",
    merchantsSection: "إدارة التجار والشركاء",
    profitSection: "حساب الأرباح والتقارير",
    inventorySection: "المستودع ومستويات المخزون",
    couponsSection: "أكواد الخصم والكوبونات",
    prevOrders: "طلبياتي السابقة",
    printInvoice: "طباعة الفاتورة",
    printReport: "طباعة التقرير الشامل",
    dayMode: "الوضع النهاري",
    nightMode: "الوضع الليلي",
    exitBtn: "خروج",
    subtotal: "المجموع الفرعي",
    enterVerifiedCode: "رمز تأكيد الهوية المكون من 6 أرقام",
    verifyAndLogin: "تحقق وسجل الدخول",
    socialLogin: "أو سجل الدخول السريع عبر منصات التواصل الاجتماعي",
    deliveryCostLabel: "رسوم التوصيل",
    freeDeliveryThresholdLabel: "حد التوصيل المجاني (دولار)",
    usdToLbpRateLabel: "سعر صرف الدولار مقابل الليرة",
    addCategory: "إضافة تصنيف رئيسي جديد",
    categoryNameAr: "اسم التصنيف بالعربية",
    categoryNameEn: "اسم التصنيف بالإنجليزية",
    parentCategory: "التصنيف الرئيسي (اختياري للاعشاش والطبقات)",
    save: "حفظ",
    delete: "حذف",
    addNewProduct: "إضافة منتج تجاري جديد",
    productNameAr: "اسم المنتج بالعربية",
    productNameEn: "اسم المنتج بالإنجليزية",
    prodDescAr: "الوصف بالعربية",
    prodDescEn: "الوصف بالإنجليزية",
    priceInUSD: "السعر بالدولار (USD)",
    selectProductImage: "رفع صورة المنتج من الكمبيوتر",
    couponCode: "كود الكوبون",
    discountValue: "قيمة الخصم",
    discountType: "نوع الخصم (نسبة مئوية / قيمة ثابتة)",
    minOrderValue: "الحد الأدنى لقيمة الطلب للخصم",
    activeStatus: "الحالة (نشط / معطل)",
    profitMargin: "حساب صافي الأرباح",
    dailyReport: "تقرير المبيعات اليومي",
    monthlyReport: "المبيعات والإيرادات الشهرية",
    lowStockAlert: "تنبيه: سلع قاربت على النفاد من المستودع!",
    supportChatHub: "محادثات الدعم الفني المباشر",
    noChats: "لا توجد رسائل دعم حالياً.",
    orderPlacedSuccess: "تم تقديم طلبك بنجاح! شكراً للتسوق معنا.",
    couponSuccess: "تم تطبيق الكوبون بنجاح!",
    couponError: "الكوبون غير صالح أو لم يصل للحد الأدنى للطلب",
    detailExit: "إغلاق التفاصيل والعودة",
    cartExit: "متابعة التسوق والعودة",
    paymentNote: "يرجى العلم أن الدفع متوفر نقداً فقط عند وصول المندوب للحفاظ على الأمان.",
    uploadLogo: "رفع الشعار من جهازك",
    uploadBanner: "رفع/تعديل غلاف الهيرو للعروضات",
    confirmDelivery: "تم التوصيل بنجاح",
    recentSearches: "الأبحاث الأخيرة",
    clearAll: "مسح الكل",
    noRecentSearches: "لا توجد عمليات بحث أخيرة"
  },
  en: {
    appName: "Cedars Direct Market",
    searchPlaceholder: "Search products, brands, or local fresh goods...",
    login: "Sign In",
    logout: "Sign Out",
    register: "Create New Account",
    username: "Username",
    password: "Password",
    phone: "Lebanese Phone Number",
    address: "Detailed Delivery Address (City, Street, Building)",
    loginSuccess: "Signed in successfully!",
    loginError: "Invalid username or password",
    registerSuccess: "Account created! You can sign in now.",
    currencyUSD: "$",
    currencyLBP: "L.L.",
    checkout: "Confirm Order (Cash)",
    cartTitle: "Shopping Cart",
    emptyCart: "Your cart is currently empty. Add premium goods to start!",
    deliveryFee: "Delivery Fee",
    freeDelivery: "Free Delivery",
    codOnly: "Cash on Delivery only (COD)",
    totalInvoice: "Total Invoice Amount",
    freeDeliveryAlert: "Add {amount} more for free Lebanese delivery!",
    congratsFreeDelivery: "You customized your order to get Free Delivery!",
    productDetails: "Product Details",
    addToCart: "Add to Cart",
    stockStatus: "In-Stock Quantity",
    outOfStock: "Out of Stock",
    searchImage: "Smart Image Search (AI Analysis)",
    chatWithAdmin: "Chat Live Support Representative",
    rating: "Rating",
    reviews: "Customer Reviews",
    addReview: "Post a Review",
    reviewPlaceholder: "Share your rating and thoughts about this product...",
    submitReview: "Submit Review",
    priceRange: "Filter by Price Range",
    minRating: "Minimum Rating Stars",
    trackOrder: "Track Live Delivery Parcel",
    driverStatus: "Delivery Carrier Carrier Status",
    notifications: "Smart System Alerts & Offers",
    adminDashboard: "Managerial Administration Console",
    categoryGroup: "Categories Hub",
    allProducts: "View All Products",
    adminSection: "Dashboard",
    ordersSection: "Active Orders",
    categoriesSection: "Nested Categories Setup",
    usersSection: "Member Users",
    settingsSection: "App Customization Settings",
    employeesSection: "Staff & Workers",
    newOrdersSection: "Incoming New orders",
    deliveredOrdersSection: "Delivered & Settled Orders",
    merchantsSection: "Local Merchants",
    profitSection: "Profits & Financial Auditing",
    inventorySection: "Warehouse Stock Rates",
    couponsSection: "Discounts & Coupons Engine",
    prevOrders: "My Previous Shipments",
    printInvoice: "Print Invoice Document",
    printReport: "Print Summary Statement",
    dayMode: "Light Mode Theme",
    nightMode: "Dark Mode Theme",
    exitBtn: "Close / Exit",
    subtotal: "Subtotal",
    enterVerifiedCode: "6-Digit SMS Verification Pin",
    verifyAndLogin: "Verify & Authenticate Access",
    socialLogin: "Or log in quickly using social auth identity channels",
    deliveryCostLabel: "Standard Delivery Cost",
    freeDeliveryThresholdLabel: "Free Delivery Target Threshold (USD)",
    usdToLbpRateLabel: "Market Exchange Multiplier Rate (LBP/USD)",
    addCategory: "Add New Nested Category Node",
    categoryNameAr: "Category Name in Arabic",
    categoryNameEn: "Category Name in English",
    parentCategory: "Parent Nest (Optional for nested hierarchies)",
    save: "Apply Changes / Save",
    delete: "Drop / Delete",
    addNewProduct: "Introduce New Trade Product",
    productNameAr: "Product Name in Arabic",
    productNameEn: "Product Name in English",
    prodDescAr: "Description in Arabic",
    prodDescEn: "Description in English",
    priceInUSD: "Unit Price (USD)",
    selectProductImage: "Select Product Photo from PC",
    couponCode: "Coupon Key Code",
    discountValue: "Benefit Discount Value",
    discountType: "Reduction Type (Percentage / Absolute USD)",
    minOrderValue: "Minimum Order Cap limit to apply Coupon",
    activeStatus: "Status Token (Active / Disabled)",
    profitMargin: "Net Income calculations",
    dailyReport: "Daily Sale Sheet",
    monthlyReport: "Monthly Revenues & Margins Graph",
    lowStockAlert: "Alert: Warehousing levels depleted!",
    supportChatHub: "Active Support Conversations",
    noChats: "No active conversations are current.",
    orderPlacedSuccess: "Your cash order has been booked! Delivery incoming.",
    couponSuccess: "Discount voucher parsed successfully!",
    couponError: "Invalid coupon or minimum terms unmet",
    detailExit: "Close Product Details Window",
    cartExit: "Continue shopping & Close Cart",
    paymentNote: "Only cash-on-delivery payment is current to keep physical payments straightforward.",
    uploadLogo: "Upload Store Logo from Computer",
    uploadBanner: "Modify Hero Advertising Slide Image",
    confirmDelivery: "Confirm as Successfully Delivered",
    recentSearches: "Recent Searches",
    clearAll: "Clear All",
    noRecentSearches: "No recent searches yet"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");

  useEffect(() => {
    // Sync reading direction token with browser document element
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translation = translations[language][key];
    if (!translation) return key;
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be run under LanguageProvider");
  return context;
}
