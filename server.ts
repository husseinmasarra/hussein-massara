import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  Product, 
  Category, 
  User, 
  UserRole, 
  Coupon, 
  Order, 
  OrderStatus, 
  ChatSession, 
  SystemSettings 
} from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body requests with custom payload limit for supporting image uploads in Base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const DB_DIR = path.join(process.cwd(), "src", "data");
const DB_FILE = path.join(DB_DIR, "database.json");

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial Seeds with realistic premium imagery
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    nameEn: "iPhone 15 Pro Max 256GB",
    nameAr: "آيفون 15 برو ماكس 256 جيجابايت",
    descriptionEn: "Experience the ultimate speed and graphics. Crafted in elegant lightweight Titanium, featuring high-fidelity custom cameras.",
    descriptionAr: "اختبر السرعة الفائقة والرسومات المذهلة. مصنع من التيتانيوم الخفيف والفاخر، مع حزمة كاميرات احترافية وعالية الدقة.",
    priceUSD: 1199,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80",
    categoryId: "cat_electronics",
    subCategoryId: "cat_sub_phones",
    stock: 12,
    ratingCount: 3,
    ratingAverage: 4.8,
    reviews: [
      { id: "rev1", userId: "u_demo", userName: "سامي حداد", rating: 5, comment: "هاتف مذهل وسرعة خيالية والتوصيل كان سريع جداً في بيروت!", date: "2026-05-20" },
      { id: "rev2", userId: "u_test", userName: "Mirna S.", rating: 4, comment: "Excellent camera, highly recommended and neat packaging.", date: "2026-05-22" }
    ]
  },
  {
    id: "p2",
    nameEn: "Luxury Chocolate & Baklawa Box",
    nameAr: "علبة شوكولاتة وبقلاوة فاخرة لجميع المناسبات",
    descriptionEn: "Handcrafted selection of traditional Lebanese sweets and premium organic dark chocolates with cedar shape decorations.",
    descriptionAr: "تشكيلة يدوية فاخرة من الحلويات اللبنانية التقليدية البقلاوة الغنية والشوكولاتة الداكنة المستخرجة من الكاكاو العضوي الممتاز.",
    priceUSD: 35,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80",
    categoryId: "cat_food",
    subCategoryId: "cat_sub_sweets",
    stock: 45,
    ratingCount: 2,
    ratingAverage: 5.0,
    reviews: [
      { id: "rev3", userId: "u_guest", userName: "Karim", rating: 5, comment: "طعم رائع جداً، هدية ممتازة للعائلة في ضيافة العيد.", date: "2026-05-25" }
    ]
  },
  {
    id: "p3",
    nameEn: "Organic Lebanese Extra Virgin Olive Oil 1L",
    nameAr: "زيت زيتون لبناني بكر ممتاز عضوي طبيعي 1 لتر",
    descriptionEn: "Cold pressed olive oil from Koura groves, 100% natural and untreated. Rich golden-green appearance and complex flavor.",
    descriptionAr: "زيت زيتون معصور على البارد من بساتين الكورة الخضراء، طبيعي 100٪ بدون أي إضافات، لون ذهبي مخضر ونكهة غنية أصلية.",
    priceUSD: 14,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80",
    categoryId: "cat_food",
    subCategoryId: "cat_sub_grocery",
    stock: 80,
    ratingCount: 1,
    ratingAverage: 5.0,
    reviews: []
  },
  {
    id: "p4",
    nameEn: "Wireless Headset Over-Ear Pro",
    nameAr: "سماعات رأس لاسلكية احترافية مع عزل الضوضاء",
    descriptionEn: "High fidelity wireless stereo sound with active noise cancellations and ultra-comfortable memory foam ear cushions.",
    descriptionAr: "صوت ستيريو لاسلكي عالي الدقة مع ميزة إلغاء الضوضاء النشط ووسادات أذن إسفنجية مريحة للغاية ومقاومة للتعرق.",
    priceUSD: 180,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    categoryId: "cat_electronics",
    subCategoryId: "cat_sub_accessories",
    stock: 25,
    ratingCount: 1,
    ratingAverage: 4.0,
    reviews: []
  },
  {
    id: "p5",
    nameEn: "Premium Zaatar Mix (Wild Lebanese Thyme)",
    nameAr: "زعتر لبناني بلدي فاخر محضر مع السمسم المحمص",
    descriptionEn: "Authentic southern wild Zaatar blend with toasted sesame seeds and local sumac. Rich in antioxidants and freshly packaged.",
    descriptionAr: "خلطة الزعتر البري الجنوبي الأصلي المحضر مع السمسم البلدي المحمص والسماق الطبيعي الفاخر، غني بمضادات الأكسدة ورائحة مميزة.",
    priceUSD: 8,
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500&auto=format&fit=crop&q=80",
    categoryId: "cat_food",
    subCategoryId: "cat_sub_grocery",
    stock: 120,
    ratingCount: 0,
    ratingAverage: 0,
    reviews: []
  },
  {
    id: "p6",
    nameEn: "Smart GPS Sports Fitness Watch Plus",
    nameAr: "ساعة ذكية رياضية لتتبع اللياقة البدنية ومعدل نبضات القلب",
    descriptionEn: "Track all your exercises, heartbeat rhythm, oxygen level, with built-in hybrid map tracking and notification syncing capabilities.",
    descriptionAr: "تتبع جميع مؤشرات اللياقة البدنية، ضربات القلب، مستوى مصل الأكسجين، مع تتبع جي بي إس مباشر ومميزات مزامنة الإشعارات الذكية.",
    priceUSD: 240,
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&auto=format&fit=crop&q=80",
    categoryId: "cat_electronics",
    subCategoryId: "cat_sub_accessories",
    stock: 5,
    ratingCount: 1,
    ratingAverage: 5.0,
    reviews: []
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: "cat_electronics", nameEn: "Electronics", nameAr: "الإلكترونيات والأجهزة" },
  { id: "cat_sub_phones", nameEn: "Smartphones", nameAr: "الهواتف الذكية", parentId: "cat_electronics" },
  { id: "cat_sub_accessories", nameEn: "Tech Accessories", nameAr: "إكسسوارات تقنية", parentId: "cat_electronics" },
  
  { id: "cat_food", nameEn: "Lebanese Food & Pantry", nameAr: "المونة والمأكولات اللبنانية" },
  { id: "cat_sub_sweets", nameEn: "Sweets & Chocolate", nameAr: "الحلويات والشوكولاتة", parentId: "cat_food" },
  { id: "cat_sub_grocery", nameEn: "Organic Spices & Pantry", nameAr: "بهارات ومونة عضوية", parentId: "cat_food" }
];

const INITIAL_USERS: User[] = [
  { id: "u_admin", username: "admin", role: UserRole.ADMIN, password: "123", phone: "+96170123456" },
  { id: "u_employee", username: "employee", role: UserRole.EMPLOYEE, password: "123", phone: "+96171456789" },
  { id: "u_merchant", username: "merchant", role: UserRole.MERCHANT, password: "123", phone: "+96176987654" },
  { id: "u_demo", username: "Hussein", role: UserRole.USER, password: "123", phone: "+96179112233" }
];

const INITIAL_COUPONS: Coupon[] = [
  { id: "c1", code: "LEBANON2026", discountType: "percentage", value: 15, minOrderValueUSD: 50, active: true },
  { id: "c2", code: "FREEBIE", discountType: "fixed", value: 5, minOrderValueUSD: 20, active: true }
];

const INITIAL_SETTINGS: SystemSettings = {
  appNameEn: "Cedars Direct Market",
  appNameAr: "متجر الأرز المباشر",
  logo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80",
  heroBanners: [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80"
  ],
  freeDeliveryThresholdUSD: 75,
  deliveryFeeUSD: 5,
  usdToLbpRate: 90000, // Standard exchange rate in Lebanon
  requireReviewApproval: true
};

const INITIAL_CHATS: ChatSession[] = [
  {
    userId: "u_demo",
    username: "Hussein",
    unreadAdmin: true,
    unreadUser: false,
    messages: [
      { id: "m1", senderId: "u_demo", senderName: "Hussein", senderRole: UserRole.USER, text: "مرحباً، هل يوجد خدمة التوصيل إلى صيدا والجنوب؟", timestamp: "2026-05-29T08:00:00Z" }
    ]
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord_1001",
    userId: "u_demo",
    userName: "Hussein",
    items: [
      { productId: "p3", productNameEn: "Organic Olive Oil 1L", productNameAr: "زيت زيتون لبناني بكر ممتاز", productImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80", quantity: 2, priceUSD: 14 }
    ],
    subtotalUSD: 28,
    deliveryCostUSD: 5,
    totalUSD: 33,
    discountUSD: 0,
    paymentMethod: "COD",
    status: OrderStatus.NEW,
    date: "2026-05-29T08:15:00Z",
    createdAt: "2026-05-29T08:15:00Z",
    address: "صيدا، الهلالية، شارع السلام، بناية الأمل ط3",
    phone: "+96179112233",
    latitude: 33.5631,
    longitude: 35.3852
  }
];

// Database state
interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  users: User[];
  coupons: Coupon[];
  orders: Order[];
  chats: ChatSession[];
  settings: SystemSettings;
}

let db: DatabaseSchema = {
  products: INITIAL_PRODUCTS,
  categories: INITIAL_CATEGORIES,
  users: INITIAL_USERS,
  coupons: INITIAL_COUPONS,
  orders: INITIAL_ORDERS,
  chats: INITIAL_CHATS,
  settings: INITIAL_SETTINGS
};

// Load database from file
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const contents = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(contents);
      // Ensure key arrays are set
      db = {
        products: parsed.products || INITIAL_PRODUCTS,
        categories: parsed.categories || INITIAL_CATEGORIES,
        users: parsed.users || INITIAL_USERS,
        coupons: parsed.coupons || INITIAL_COUPONS,
        orders: parsed.orders || INITIAL_ORDERS,
        chats: parsed.chats || INITIAL_CHATS,
        settings: parsed.settings || INITIAL_SETTINGS
      };
    } else {
      saveDB();
    }
  } catch (error) {
    console.error("Error loading database file, falling back to inside-memory storage", error);
  }
}

// Save database to file
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving database file", error);
  }
}

// Initial DB load on boot
loadDB();

// ----------------------------------------------------
// API ROUTES START HERE
// ----------------------------------------------------

// Sync initial data with Client
app.get("/api/sync-data", (req, res) => {
  res.json({
    products: db.products,
    categories: db.categories,
    coupons: db.coupons,
    settings: db.settings,
    orders: db.orders
  });
});

// Authentication endpoints
app.post("/api/auth/register", (req, res) => {
  const { username, password, phone, role } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  const existing = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser: User = {
    id: "u_" + Date.now(),
    username,
    password: password || "123",
    phone: phone || "",
    role: role || UserRole.USER,
    orders: []
  };

  db.users.push(newUser);
  saveDB();

  // Return user omitting password
  const { password: _, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Social login verification mock support
app.post("/api/auth/social", (req, res) => {
  const { provider, phone, uid, name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  let user = db.users.find(u => u.username.toLowerCase() === name.toLowerCase());
  if (!user) {
    user = {
      id: "u_soc_" + Date.now(),
      username: name,
      phone: phone || "",
      role: UserRole.USER,
      socialProvider: provider,
      orders: []
    };
    db.users.push(user);
    saveDB();
  }

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Save settings (AppName, custom logo, threshold, rate rate, banners list)
app.post("/api/settings", (req, res) => {
  const newSettings = req.body;
  db.settings = {
    ...db.settings,
    ...newSettings
  };
  saveDB();
  res.json({ success: true, settings: db.settings });
});

// Save Product (Create or edit)
app.post("/api/products/save", (req, res) => {
  const prod: Product = req.body;
  if (!prod.nameEn || !prod.nameAr) {
    return res.status(400).json({ error: "Missing product name" });
  }

  const idx = db.products.findIndex(p => p.id === prod.id);
  if (idx > -1) {
    // Preserve old reviews and statistics if not sent
    const oldProd = db.products[idx];
    db.products[idx] = {
      ...oldProd,
      ...prod,
      reviews: prod.reviews || oldProd.reviews || [],
      ratingAverage: prod.ratingAverage !== undefined ? prod.ratingAverage : oldProd.ratingAverage,
      ratingCount: prod.ratingCount !== undefined ? prod.ratingCount : oldProd.ratingCount
    };
  } else {
    // Generate new ID
    const newProd: Product = {
      ...prod,
      id: "p_" + Date.now(),
      ratingCount: 0,
      ratingAverage: 0,
      reviews: []
    };
    db.products.push(newProd);
  }
  saveDB();
  res.json({ success: true, products: db.products });
});

app.delete("/api/products/delete/:id", (req, res) => {
  const { id } = req.params;
  db.products = db.products.filter(p => p.id !== id);
  saveDB();
  res.json({ success: true, products: db.products });
});

// Post a review
app.post("/api/products/:id/review", (req, res) => {
  const { id } = req.params;
  const { userId, userName, rating, comment } = req.body;

  const prod = db.products.find(p => p.id === id);
  if (!prod) {
    return res.status(404).json({ error: "Product not found" });
  }

  const requireApproval = db.settings.requireReviewApproval !== false;
  const newReview = {
    id: "r_" + Date.now(),
    userId,
    userName,
    rating: Number(rating),
    comment,
    approved: !requireApproval, // if requireApproval is false, it's auto-approved (true)
    date: new Date().toISOString().split("T")[0]
  };

  prod.reviews = prod.reviews || [];
  prod.reviews.push(newReview);
  
  // Recompute average based on approved reviews
  const approvedReviews = prod.reviews.filter(r => r.approved !== false);
  if (approvedReviews.length > 0) {
    const totalRating = approvedReviews.reduce((sum, rev) => sum + rev.rating, 0);
    prod.ratingCount = approvedReviews.length;
    prod.ratingAverage = Number((totalRating / approvedReviews.length).toFixed(1));
  } else {
    prod.ratingCount = 0;
    prod.ratingAverage = 0;
  }

  saveDB();
  res.json({ success: true, product: prod, products: db.products });
});

// Category setup with Parent nesting standard support
app.post("/api/categories/save", (req, res) => {
  const cat: Category = req.body;
  if (!cat.nameEn || !cat.nameAr) {
    return res.status(400).json({ error: "Missing category title" });
  }

  const idx = db.categories.findIndex(c => c.id === cat.id);
  if (idx > -1) {
    db.categories[idx] = { ...db.categories[idx], ...cat };
  } else {
    cat.id = "cat_" + Date.now();
    db.categories.push(cat);
  }
  saveDB();
  res.json({ success: true, categories: db.categories });
});

app.delete("/api/categories/delete/:id", (req, res) => {
  const { id } = req.params;
  db.categories = db.categories.filter(c => c.id !== id);
  saveDB();
  res.json({ success: true, categories: db.categories });
});

// Place new order (Cash On Delivery only support)
app.post("/api/orders", (req, res) => {
  const ord: Partial<Order> = req.body;
  if (!ord.userId || !ord.items || ord.items.length === 0) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  // Set Lebanese tracking position in Beirut to simulate visual tracking route on standard Leaflet coordinate maps
  const trackingCoords = [
    { name: "Beirut Hub", lat: 33.8938, lng: 35.5018 },
    { name: "Sodeco Crossing", lat: 33.8829, lng: 35.5113 },
    { name: "Hazmieh Inter", lat: 33.8569, lng: 35.5413 },
    { name: "Damour Coastal Road", lat: 33.7317, lng: 35.4497 },
    { name: "Sidon Entrance", lat: 33.5631, lng: 35.3852 }
  ];

  // Pick coordinates or select near Beirut standard
  const randomC = trackingCoords[Math.floor(Math.random() * trackingCoords.length)];

  const newOrder: Order = {
    id: "ord_" + Math.floor(1000 + Math.random() * 9000),
    userId: ord.userId,
    userName: ord.userName || "Customer",
    items: ord.items,
    subtotalUSD: ord.subtotalUSD || 0,
    deliveryCostUSD: ord.deliveryCostUSD || 0,
    totalUSD: ord.totalUSD || 0,
    discountUSD: ord.discountUSD || 0,
    couponCode: ord.couponCode,
    paymentMethod: "COD",
    status: OrderStatus.NEW,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    address: ord.address || "Lebanon Address",
    phone: ord.phone || "+96170000000",
    latitude: ord.latitude || randomC.lat,
    longitude: ord.longitude || randomC.lng
  };

  // Adjust stock of bought products
  newOrder.items.forEach(item => {
    const prod = db.products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  db.orders.push(newOrder);
  saveDB();
  res.json({ success: true, order: newOrder, orders: db.orders, products: db.products });
});

// Update Order status
app.post("/api/orders/update-status", (req, res) => {
  const { orderId, status } = req.body;
  const ord = db.orders.find(o => o.id === orderId);
  if (!ord) {
    return res.status(404).json({ error: "Order not found" });
  }

  ord.status = status as OrderStatus;
  saveDB();
  res.json({ success: true, orders: db.orders });
});

// Support interactive Chat routes (Admin panel talks to User in real-time)
app.get("/api/chats", (req, res) => {
  res.json({ chats: db.chats });
});

app.post("/api/chats/message", (req, res) => {
  const { userId, username, senderRole, text } = req.body;
  if (!userId || !text) {
    return res.status(400).json({ error: "Missing fields" });
  }

  let session = db.chats.find(c => c.userId === userId);
  if (!session) {
    session = {
      userId,
      username: username || "Guest",
      unreadAdmin: true,
      unreadUser: false,
      messages: []
    };
    db.chats.push(session);
  }

  const newMessage = {
    id: "msg_" + Date.now(),
    senderId: senderRole === UserRole.USER ? userId : "u_admin",
    senderName: senderRole === UserRole.USER ? username : "الدعم الفني",
    senderRole,
    text,
    timestamp: new Date().toISOString()
  };

  session.messages.push(newMessage);
  
  if (senderRole === UserRole.USER) {
    session.unreadAdmin = true;
    session.unreadUser = false;
  } else {
    session.unreadUser = true;
    session.unreadAdmin = false;
  }

  saveDB();
  res.json({ success: true, messages: session.messages, chats: db.chats });
});

// Smart Reports generation data
app.get("/api/reports", (req, res) => {
  // Compute totals
  const totalSalesUSD = db.orders
    .filter(o => o.status === OrderStatus.DELIVERED)
    .reduce((sum, o) => sum + o.totalUSD, 0);

  const totalCostUSD = totalSalesUSD * 0.65; // Simulated cost rate of 65% for margins
  const grossProfitUSD = totalSalesUSD - totalCostUSD;

  // Group orders by month/day
  const dailyReport: any = {};
  const monthlyReport: any = {};

  db.orders.forEach(o => {
    const day = o.date.split("T")[0];
    const month = day.substring(0, 7); // YYYY-MM
    const profit = o.status === OrderStatus.DELIVERED ? (o.totalUSD * 0.35) : 0;
    const value = o.totalUSD;

    if (!dailyReport[day]) dailyReport[day] = { sales: 0, profit: 0, count: 0 };
    if (!monthlyReport[month]) monthlyReport[month] = { sales: 0, profit: 0, count: 0 };

    dailyReport[day].sales += value;
    dailyReport[day].count += 1;
    dailyReport[day].profit += profit;

    monthlyReport[month].sales += value;
    monthlyReport[month].count += 1;
    monthlyReport[month].profit += profit;
  });

  res.json({
    totalSalesUSD,
    totalCostUSD,
    grossProfitUSD,
    daily: Object.entries(dailyReport).map(([date, val]: any) => ({ date, ...val })),
    monthly: Object.entries(monthlyReport).map(([month, val]: any) => ({ month, ...val }))
  });
});

// Lazy-loaded Gemini Visual Image Search Support
app.post("/api/gemini/search", async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "Missing image payload for analysis" });
  }

  // Remove data:image header if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      // Fallback mode if Gemini Key is not configured
      const randomProducts = db.products.slice(0, 2);
      return res.json({ 
        success: true, 
        matchedProductIds: randomProducts.map(p => p.id),
        aiResponse: "تم تشغيل وضع المحاكاة الذكي! في حال إضافة مفتاح API الخاص بالجميني، سيتم تحليل الصورة بدقة للعثور على المنتج وإرجاع النتائج الملائمة."
      });
    }

    // Modern SDK initializer compliant with gemini-api SKILL.md
    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const catalogList = db.products.map(p => ({
      id: p.id,
      name: p.nameEn,
      description: p.descriptionEn,
      category: p.categoryId
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        },
        {
          text: `You are an expert e-commerce search assistant for Lebanese Cedars store.
Compare the uploaded product photo against our current catalog:
${JSON.stringify(catalogList, null, 2)}

Determine which products from the catalog are most visually or conceptually similar.
Output a JSON response with the following format:
{
  "matches": ["productId1", "productId2"],
  "explanation": "Brief explanation in Arabic on why this fits what's inside the photo"
}
Ensure the output is strictly valid JSON.`
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const bodyText = response.text || "{}";
    const result = JSON.parse(bodyText.trim());
    
    res.json({
      success: true,
      matchedProductIds: result.matches || [],
      aiResponse: result.explanation || "تم العثور على تشابه مناسب."
    });

  } catch (err: any) {
    console.error("Gemini Image Search failed:", err);
    // Graceful recovery
    res.json({
      success: true,
      matchedProductIds: [db.products[0]?.id].filter(Boolean),
      aiResponse: "عذراً، حدث خطأ أثناء الاتصال بمزود الذكاء الاصطناعي الخاص بالبحث عن طريق الصور. تم فحص الفهرس وعرض منتج مقترح."
    });
  }
});

// Vite Setup for Front-End integration and production assets loading
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Assets fallback
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lebanon E-Commerce Server boot complete! Mode: [${process.env.NODE_ENV || "development"}]`);
    console.log(`Port: ${PORT} (Internal Container Ingress Address http://localhost:${PORT})`);
  });
}

startServer();
