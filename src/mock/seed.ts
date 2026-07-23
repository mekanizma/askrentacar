import type {
  AddOn,
  BlogPost,
  Booking,
  Campaign,
  Category,
  Invoice,
  Location,
  MediaAsset,
  NotificationItem,
  Review,
  SiteSettings,
  UserProfile,
  Vehicle,
} from "@/types";
import { slugify } from "@/utils/format";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function pad(n: number, size = 3) {
  return String(n).padStart(size, "0");
}

const CAR_IMAGES = [
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=75",
];

const BRAND_MODELS: Record<string, string[]> = {
  Mercedes: ["C-Class", "E-Class", "GLC", "GLE", "S-Class", "A-Class", "CLA"],
  BMW: ["320i", "520i", "X3", "X5", "M4", "i4", "X1"],
  Audi: ["A4", "A6", "Q5", "Q7", "A3", "e-tron", "RS5"],
  Toyota: ["Corolla", "Camry", "RAV4", "C-HR", "Land Cruiser", "Yaris"],
  Nissan: ["Qashqai", "X-Trail", "Juke", "Leaf", "Navara"],
  Kia: ["Sportage", "Sorento", "Ceed", "EV6", "Stonic"],
  Hyundai: ["Tucson", "Santa Fe", "i20", "Ioniq 5", "Elantra"],
  Honda: ["Civic", "CR-V", "HR-V", "Accord"],
  "Range Rover": ["Evoque", "Velar", "Sport", "Vogue"],
  "Land Rover": ["Discovery", "Defender", "Discovery Sport"],
  Mini: ["Cooper", "Countryman", "Clubman"],
  Volkswagen: ["Golf", "Passat", "Tiguan", "ID.4", "Polo"],
  Ford: ["Focus", "Kuga", "Mustang", "Ranger", "Puma"],
  Renault: ["Clio", "Megane", "Captur", "Kadjar"],
  Peugeot: ["208", "3008", "5008", "508"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
};

const FEATURES = [
  "apple-carplay",
  "android-auto",
  "cruise-control",
  "parking-sensors",
  "rear-camera",
  "leather-seats",
  "panoramic-roof",
  "navigation",
  "bluetooth",
  "keyless",
  "lane-assist",
  "adaptive-cruise",
];

export function createLocations(): Location[] {
  const items: Array<Omit<Location, "id" | "slug"> & { slug: string }> = [
    {
      slug: "ercan-airport",
      name: { tr: "Ercan Havalimanı", en: "Ercan Airport", ru: "Аэропорт Эркан" },
      city: "Lefkoşa",
      address: {
        tr: "Ercan Uluslararası Havalimanı",
        en: "Ercan International Airport",
        ru: "Международный аэропорт Эркан",
      },
      lat: 35.1597,
      lng: 33.5,
      phone: "+90 392 600 5000",
      isAirport: true,
    },
    {
      slug: "girne",
      name: { tr: "Girne", en: "Kyrenia", ru: "Кирения" },
      city: "Girne",
      address: { tr: "Girne Liman Caddesi No:12", en: "Kyrenia Harbour Street 12", ru: "Гавань Кирении 12" },
      lat: 35.3417,
      lng: 33.3167,
      phone: "+90 392 815 1010",
      isAirport: false,
    },
    {
      slug: "lefkosa",
      name: { tr: "Lefkoşa", en: "Nicosia", ru: "Никосия" },
      city: "Lefkoşa",
      address: { tr: "Bedrettin Demirel Cad. No:8", en: "Bedrettin Demirel St. 8", ru: "Бедреттин Демирель 8" },
      lat: 35.1856,
      lng: 33.3823,
      phone: "+90 392 228 2020",
      isAirport: false,
    },
    {
      slug: "gazimagusa",
      name: { tr: "Gazimağusa", en: "Famagusta", ru: "Фамагуста" },
      city: "Gazimağusa",
      address: { tr: "Salamis Yolu No:4", en: "Salamis Road 4", ru: "Саламис Роуд 4" },
      lat: 35.125,
      lng: 33.95,
      phone: "+90 392 366 3030",
      isAirport: false,
    },
    {
      slug: "iskele",
      name: { tr: "İskele", en: "Iskele", ru: "Искеле" },
      city: "İskele",
      address: { tr: "Long Beach Meydanı", en: "Long Beach Square", ru: "Площадь Лонг Бич" },
      lat: 35.286,
      lng: 33.891,
      phone: "+90 392 371 4040",
      isAirport: false,
    },
    {
      slug: "guzelyurt",
      name: { tr: "Güzelyurt", en: "Morphou", ru: "Гюзельюрт" },
      city: "Güzelyurt",
      address: { tr: "Ana Cadde No:21", en: "Main Street 21", ru: "Главная улица 21" },
      lat: 35.198,
      lng: 32.993,
      phone: "+90 392 714 5050",
      isAirport: false,
    },
    {
      slug: "lapta",
      name: { tr: "Lapta", en: "Lapithos", ru: "Лапта" },
      city: "Lapta",
      address: { tr: "Sahil Yolu No:7", en: "Coast Road 7", ru: "Береговая дорога 7" },
      lat: 35.337,
      lng: 33.17,
      phone: "+90 392 821 6060",
      isAirport: false,
    },
    {
      slug: "alsancak",
      name: { tr: "Alsancak", en: "Alsancak", ru: "Алсанжак" },
      city: "Alsancak",
      address: { tr: "Karaoğlanoğlu Cad. No:15", en: "Karaoglanoglu St. 15", ru: "Караогланоглу 15" },
      lat: 35.342,
      lng: 33.21,
      phone: "+90 392 821 7070",
      isAirport: false,
    },
    {
      slug: "catalkoy",
      name: { tr: "Çatalköy", en: "Catalkoy", ru: "Чаталкой" },
      city: "Çatalköy",
      address: { tr: "Beşparmak Cad. No:3", en: "Besparmak St. 3", ru: "Бешпармак 3" },
      lat: 35.334,
      lng: 33.38,
      phone: "+90 392 824 8080",
      isAirport: false,
    },
  ];

  return items.map((item, i) => ({
    ...item,
    id: `loc_${pad(i + 1)}`,
  }));
}

export function createCategories(): Category[] {
  const defs = [
    {
      slug: "economy",
      icon: "wallet",
      image: CAR_IMAGES[14]!,
      name: { tr: "Ekonomi", en: "Economy", ru: "Эконом" },
      description: {
        tr: "Şehir içi konforlu ve uygun fiyatlı araçlar.",
        en: "Affordable city cars with everyday comfort.",
        ru: "Доступные городские автомобили.",
      },
    },
    {
      slug: "suv",
      icon: "mountain",
      image: CAR_IMAGES[5]!,
      name: { tr: "SUV", en: "SUV", ru: "SUV" },
      description: {
        tr: "Aile ve yolculuk için yüksek konumlu SUV'lar.",
        en: "Elevated SUVs for family and coastal trips.",
        ru: "Внедорожники для семьи и поездок.",
      },
    },
    {
      slug: "luxury",
      icon: "crown",
      image: CAR_IMAGES[1]!,
      name: { tr: "Lüks", en: "Luxury", ru: "Люкс" },
      description: {
        tr: "Mercedes, BMW ve Audi premium sınıf.",
        en: "Mercedes, BMW and Audi premium class.",
        ru: "Премиум-класс Mercedes, BMW и Audi.",
      },
    },
    {
      slug: "electric",
      icon: "zap",
      image: CAR_IMAGES[11]!,
      name: { tr: "Elektrikli", en: "Electric", ru: "Электро" },
      description: {
        tr: "Sessiz, sürdürülebilir ve güçlü elektrikli araçlar.",
        en: "Quiet, sustainable and powerful EVs.",
        ru: "Тихие и мощные электромобили.",
      },
    },
    {
      slug: "convertible",
      icon: "sun",
      image: CAR_IMAGES[7]!,
      name: { tr: "Cabrio", en: "Convertible", ru: "Кабриолет" },
      description: {
        tr: "Akdeniz esintisi için açık tavan deneyimi.",
        en: "Open-top Mediterranean driving.",
        ru: "Открытый верх для средиземноморского климата.",
      },
    },
    {
      slug: "family",
      icon: "users",
      image: CAR_IMAGES[12]!,
      name: { tr: "Aile", en: "Family", ru: "Семейные" },
      description: {
        tr: "Geniş bagaj ve yüksek güvenlik.",
        en: "Spacious cabins and high safety.",
        ru: "Просторный салон и безопасность.",
      },
    },
    {
      slug: "sports",
      icon: "gauge",
      image: CAR_IMAGES[3]!,
      name: { tr: "Spor", en: "Sports", ru: "Спорт" },
      description: {
        tr: "Yüksek performanslı spor araçlar.",
        en: "High-performance sports cars.",
        ru: "Спортивные автомобили.",
      },
    },
    {
      slug: "commercial",
      icon: "truck",
      image: CAR_IMAGES[13]!,
      name: { tr: "Ticari", en: "Commercial", ru: "Коммерческие" },
      description: {
        tr: "İş ve transfer için ticari çözümler.",
        en: "Commercial vans for business transfer.",
        ru: "Коммерческий транспорт.",
      },
    },
    {
      slug: "premium",
      icon: "sparkles",
      image: CAR_IMAGES[4]!,
      name: { tr: "Premium", en: "Premium", ru: "Премиум" },
      description: {
        tr: "İş seyahati ve VIP transfer için seçkin filomuz.",
        en: "Elite fleet for VIP and business travel.",
        ru: "Элитный флот для VIP.",
      },
    },
    {
      slug: "crossover",
      icon: "car",
      image: CAR_IMAGES[8]!,
      name: { tr: "Crossover", en: "Crossover", ru: "Кроссовер" },
      description: {
        tr: "Şehir ve doğa dengesinde crossover'lar.",
        en: "Crossovers for city and nature balance.",
        ru: "Кроссоверы для города и природы.",
      },
    },
  ];

  return defs.map((d, i) => ({
    id: `cat_${pad(i + 1)}`,
    vehicleCount: 0,
    featured: i < 6,
    ...d,
  }));
}

function vehicleImages(seed: number, brand: string, model: string): MediaAsset[] {
  const count = 3;
  return Array.from({ length: count }, (_, i) => ({
    id: `img_${seed}_${i}`,
    url: CAR_IMAGES[(seed + i) % CAR_IMAGES.length]!,
    alt: `${brand} ${model} ${i + 1}`,
    type: i === count - 1 ? "360" : "image",
    order: i,
  }));
}

export function createVehicles(categories: Category[]): Vehicle[] {
  const rand = seededRandom(42);
  const brands = Object.keys(BRAND_MODELS);
  const vehicles: Vehicle[] = [];
  const now = new Date("2026-07-01T10:00:00.000Z");

  for (let i = 0; i < 48; i++) {
    const brand = brands[i % brands.length]!;
    const models = BRAND_MODELS[brand]!;
    const model = models[i % models.length]!;
    const category = categories[i % categories.length]!;
    const year = 2019 + (i % 7);
    const fuelPool = ["petrol", "diesel", "hybrid", "electric"] as const;
    const fuel = brand === "Tesla" ? "electric" : fuelPool[i % fuelPool.length]!;
    const transmission = i % 5 === 0 ? "manual" : "automatic";
    const daily = Math.round(35 + (i % 40) * 7 + (category.slug === "luxury" ? 80 : 0));
    const discount = i % 7 === 0 ? 10 + (i % 3) * 5 : 0;
    const rating = Number((3.8 + (i % 12) * 0.1).toFixed(1));
    const slug = slugify(`${brand}-${model}-${year}-${i + 1}`);

    vehicles.push({
      id: `veh_${pad(i + 1)}`,
      slug,
      brand,
      model,
      plate: `KK ${30 + (i % 70)} ${100 + (i % 800)}`,
      chassis: `WDD${100000000 + i}`,
      categoryId: category.id,
      status: pick(rand, ["available", "available", "available", "rented", "maintenance"]),
      featured: i % 8 === 0,
      rating: Math.min(5, rating),
      reviewCount: 4 + (i % 40),
      mileage: 5000 + i * 137,
      specs: {
        year,
        fuel,
        transmission,
        seats: category.slug === "commercial" ? 8 : category.slug === "sports" ? 2 : 5,
        bags: category.slug === "suv" || category.slug === "family" ? 4 : 2,
        doors: category.slug === "sports" ? 2 : 4,
        ac: true,
        engine: fuel === "electric" ? "Dual Motor" : `${1.5 + (i % 3) * 0.5}L`,
        horsepower: 110 + (i % 20) * 15,
        consumption: fuel === "electric" ? "16 kWh/100km" : `${5 + (i % 5)}.${i % 9}L/100km`,
        drivetrain: i % 4 === 0 ? "AWD" : "FWD",
      },
      pricing: {
        daily,
        weekly: Math.round(daily * 6.2),
        monthly: Math.round(daily * 22),
        currency: "EUR",
        discountPercent: discount,
        deposit: Math.round(daily * 4),
        insuranceDaily: Math.round(daily * 0.12),
      },
      features: FEATURES.filter((_, idx) => (i + idx) % 3 !== 0).slice(0, 8),
      included: [
        "48 saate kadar ücretsiz iptal",
        "7/24 yol ve WhatsApp desteği",
        "Ercan Havalimanı teslimatı",
        "Her teslimat öncesi kontrol",
      ],
      images: vehicleImages(i, brand, model),
      videoUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
      description: {
        tr: `${brand} ${model}, KKTC yolları için hazırlanmış premium kiralık araç.`,
        en: `${brand} ${model}, a premium rental prepared for Northern Cyprus roads.`,
        ru: `${brand} ${model}, премиальный автомобиль для аренды в Северном Кипре.`,
      },
      insuranceExpiry: new Date(now.getTime() + (120 + i) * 86400000).toISOString(),
      maintenanceDue: new Date(now.getTime() + (40 + i) * 86400000).toISOString(),
      inspectionDue: new Date(now.getTime() + (200 + i) * 86400000).toISOString(),
      createdAt: new Date(now.getTime() - i * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  categories.forEach((c) => {
    c.vehicleCount = vehicles.filter((v) => v.categoryId === c.id).length;
  });

  return vehicles;
}

export function createAddOns(): AddOn[] {
  return [
    {
      id: "addon_001",
      slug: "full-insurance",
      name: { tr: "Tam Sigorta", en: "Full Insurance", ru: "Полная страховка" },
      description: {
        tr: "Kapsamlı hasar koruması.",
        en: "Comprehensive damage protection.",
        ru: "Полная защита от повреждений.",
      },
      priceDaily: 18,
      icon: "shield",
      mandatory: false,
    },
    {
      id: "addon_002",
      slug: "mini-damage",
      name: { tr: "Mini Hasar", en: "Mini Damage Waiver", ru: "Мини-франшиза" },
      description: {
        tr: "Küçük hasar muafiyetini düşürür.",
        en: "Reduces small damage excess.",
        ru: "Снижает франшизу мелких повреждений.",
      },
      priceDaily: 9,
      icon: "shield-check",
      mandatory: false,
    },
    {
      id: "addon_003",
      slug: "wifi",
      name: { tr: "Wifi", en: "Wifi", ru: "Wi‑Fi" },
      description: {
        tr: "Araç içi yüksek hızlı internet.",
        en: "In-car high-speed internet.",
        ru: "Интернет в автомобиле.",
      },
      priceDaily: 6,
      icon: "wifi",
      mandatory: false,
    },
    {
      id: "addon_004",
      slug: "baby-seat",
      name: { tr: "Bebek Koltuğu", en: "Baby Seat", ru: "Детское кресло" },
      description: {
        tr: "0-4 yaş güvenli bebek koltuğu.",
        en: "Safe baby seat for ages 0-4.",
        ru: "Детское кресло 0-4 года.",
      },
      priceDaily: 5,
      icon: "baby",
      mandatory: false,
    },
    {
      id: "addon_005",
      slug: "extra-driver",
      name: { tr: "Ek Şoför", en: "Extra Driver", ru: "Доп. водитель" },
      description: {
        tr: "İkinci sürücü kaydı.",
        en: "Register a second driver.",
        ru: "Регистрация второго водителя.",
      },
      priceDaily: 7,
      icon: "user-plus",
      mandatory: false,
    },
    {
      id: "addon_006",
      slug: "gps",
      name: { tr: "GPS", en: "GPS", ru: "GPS" },
      description: {
        tr: "Offline haritalı navigasyon cihazı.",
        en: "Offline navigation device.",
        ru: "Навигатор с офлайн-картами.",
      },
      priceDaily: 4,
      icon: "map-pin",
      mandatory: false,
    },
    {
      id: "addon_007",
      slug: "fuel-pack",
      name: { tr: "Yakıt Paketi", en: "Fuel Pack", ru: "Топливный пакет" },
      description: {
        tr: "Dolu depo teslim opsiyonu.",
        en: "Full-to-full convenience pack.",
        ru: "Полный бак при выдаче.",
      },
      priceDaily: 12,
      icon: "fuel",
      mandatory: false,
    },
  ];
}

export function createUsers(): UserProfile[] {
  const users: UserProfile[] = [
    {
      id: "user_001",
      email: "admin@askrentacar.com",
      password: "Admin123!",
      firstName: "Aylin",
      lastName: "Kaya",
      phone: "+90 533 000 0001",
      role: "admin",
      locale: "tr",
      currency: "EUR",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      favoriteVehicleIds: ["veh_001", "veh_008"],
      createdAt: "2025-01-10T10:00:00.000Z",
    },
    {
      id: "user_002",
      email: "demo@askrentacar.com",
      password: "Demo123!",
      firstName: "Emre",
      lastName: "Yıldız",
      phone: "+90 533 000 0002",
      role: "customer",
      locale: "tr",
      currency: "EUR",
      licenseNumber: "KKTC-EH-44521",
      passportNumber: "U12345678",
      favoriteVehicleIds: ["veh_003", "veh_012", "veh_021"],
      createdAt: "2025-02-12T10:00:00.000Z",
    },
  ];

  const firstNames = ["Selin", "Can", "Maria", "Alex", "Elena", "Deniz", "Omar", "Sofia", "John", "Nina"];
  const lastNames = ["Demir", "Çelik", "Brown", "Ivanov", "Smith", "Aksoy", "Petrov", "Costa", "Lee", "Rossi"];

  for (let i = 3; i <= 50; i++) {
    const firstName = firstNames[i % firstNames.length]!;
    const lastName = lastNames[(i * 3) % lastNames.length]!;
    users.push({
      id: `user_${pad(i)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@mail.com`,
      password: "Customer123!",
      firstName,
      lastName,
      phone: `+90 533 100 ${pad(i, 4)}`,
      role: "customer",
      locale: pick(seededRandom(i), ["tr", "en", "ru"]),
      currency: pick(seededRandom(i + 7), ["EUR", "GBP", "TRY"]),
      licenseNumber: `LIC-${10000 + i}`,
      passportNumber: `P${200000 + i}`,
      notes: i % 5 === 0 ? "VIP müşteri" : undefined,
      favoriteVehicleIds: [],
      createdAt: new Date(Date.UTC(2025, i % 12, (i % 27) + 1)).toISOString(),
    });
  }

  return users;
}

export function createBookings(users: UserProfile[], vehicles: Vehicle[], locations: Location[]): Booking[] {
  const rand = seededRandom(99);
  const bookings: Booking[] = [];
  const statuses = ["pending", "confirmed", "delivered", "cancelled", "completed"] as const;

  for (let i = 0; i < 48; i++) {
    const user = users[(i % (users.length - 1)) + 1]!;
    const vehicle = vehicles[i % vehicles.length]!;
    const pickup = locations[i % locations.length]!;
    const dropoff = locations[(i + 2) % locations.length]!;
    const start = new Date(Date.UTC(2026, (i % 8) + 1, (i % 25) + 1, 10));
    const days = 2 + (i % 10);
    const end = new Date(start.getTime() + days * 86400000);
    const dailyRate = vehicle.pricing.daily;
    const subtotal = dailyRate * days;
    const discount = vehicle.pricing.discountPercent
      ? Math.round((subtotal * vehicle.pricing.discountPercent) / 100)
      : 0;
    const extrasTotal = i % 3 === 0 ? 25 * days : 0;
    const insuranceTotal = vehicle.pricing.insuranceDaily * days;
    const taxedBase = subtotal - discount + extrasTotal + insuranceTotal;
    const tax = Math.round(taxedBase * 0.05);
    const total = taxedBase + tax;
    const status = statuses[i % statuses.length]!;

    bookings.push({
      id: `bkg_${pad(i + 1)}`,
      code: `CPD-2026-${pad(i + 1, 4)}`,
      userId: user.id,
      vehicleId: vehicle.id,
      status,
      pickupLocationId: pickup.id,
      dropoffLocationId: dropoff.id,
      pickupAt: start.toISOString(),
      returnAt: end.toISOString(),
      addOns:
        i % 3 === 0
          ? [{ addOnId: "addon_001", quantity: 1, unitPrice: 18 }]
          : [],
      dailyRate,
      days,
      subtotal,
      discount,
      extrasTotal,
      insuranceTotal,
      tax,
      total,
      currency: "EUR",
      customer: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
      paymentMethod: pick(rand, ["card", "cash", "transfer"]),
      paymentStatus: status === "cancelled" ? "refunded" : status === "pending" ? "pending" : "paid",
      notes: i % 11 === 0 ? "Geç teslim olabilir" : undefined,
      createdAt: new Date(start.getTime() - 3 * 86400000).toISOString(),
      updatedAt: start.toISOString(),
    });
  }

  return bookings;
}

export function createReviews(users: UserProfile[], vehicles: Vehicle[]): Review[] {
  const comments = [
    "Teslimat çok hızlı ve araç tertemizdi.",
    "Girne transferi sorunsuz, kesinlikle tavsiye ederim.",
    "Premium hissettiren bir kiralama deneyimi.",
    "Fiyat/performans dengesi mükemmel.",
    "Destek ekibi WhatsApp üzerinden çok ilgiliydi.",
  ];

  return Array.from({ length: 20 }, (_, i) => {
    const user = users[(i % (users.length - 1)) + 1]!;
    const vehicle = vehicles[i % vehicles.length]!;
    return {
      id: `rev_${pad(i + 1)}`,
      vehicleId: vehicle.id,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName[0]}.`,
      rating: 4 + (i % 2),
      title: ["Harika deneyim", "Premium hizmet", "Çok memnunum", "Tekrar kiralarım"][i % 4]!,
      comment: comments[i % comments.length]!,
      createdAt: new Date(Date.UTC(2026, i % 6, (i % 20) + 1)).toISOString(),
      verified: true,
    };
  });
}

export function createBlogPosts(): BlogPost[] {
  const topics = [
    "KKTC'de ilk kez araç kiralamak",
    "Ercan Havalimanı transfer rehberi",
    "Girne sahil yolunda en iyi sürüşler",
    "Elektrikli araç şarj noktaları",
    "Aile tatili için SUV seçimi",
    "Lüks araçlarla vip transfer",
    "Yaz sezonu kampanyaları",
    "Sigorta paketleri nasıl seçilir",
    "Lefkoşa şehir içi park ipuçları",
    "Gazimağusa günübirlik rota",
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const topic = topics[i % topics.length]!;
    const slug = slugify(`${topic}-${i + 1}`);
    const title = {
      tr: topic,
      en: `${topic} (EN)`,
      ru: `${topic} (RU)`,
    };
    const body = {
      tr: `${topic}. Kuzey Kıbrıs'ta premium araç kiralama deneyimini planlarken bilmeniz gereken tüm detaylar bu rehberde. Pickup noktaları, sigorta seçenekleri, sezon fiyatları ve yerel sürüş kültürü hakkında güncel bilgiler bulabilirsiniz.`,
      en: `${topic}. Everything you need to plan a premium rental experience in Northern Cyprus, including pickup points, insurance and seasonal pricing.`,
      ru: `${topic}. Полный гид по премиальной аренде авто в Северном Кипре.`,
    };

    return {
      id: `blog_${pad(i + 1)}`,
      slug,
      title,
      excerpt: {
        tr: body.tr.slice(0, 140) + "…",
        en: body.en.slice(0, 140) + "…",
        ru: body.ru.slice(0, 140) + "…",
      },
      content: body,
      coverImage: CAR_IMAGES[i % CAR_IMAGES.length]!,
      category: ["Travel", "Guides", "Tips", "News"][i % 4]!,
      tags: ["kktc", "rentacar", "girne", "ercan"].slice(0, 2 + (i % 3)),
      author: "ASK Editorial",
      publishedAt: new Date(Date.UTC(2026, i % 7, (i % 27) + 1)).toISOString(),
      readingMinutes: 4 + (i % 6),
      seoTitle: title,
      seoDescription: {
        tr: body.tr.slice(0, 155),
        en: body.en.slice(0, 155),
        ru: body.ru.slice(0, 155),
      },
    };
  });
}

export function createCampaigns(categories: Category[]): Campaign[] {
  return Array.from({ length: 8 }, (_, i) => {
    const discount = 10 + (i % 5) * 5;
    return {
      id: `cmp_${pad(i + 1)}`,
      slug: `summer-deal-${i + 1}`,
      title: {
        tr: `Yaz Fırsatı %${discount}`,
        en: `Summer Deal ${discount}%`,
        ru: `Летняя скидка ${discount}%`,
      },
      description: {
        tr: "Seçili araçlarda sınırlı süreli indirim.",
        en: "Limited-time discount on selected vehicles.",
        ru: "Ограниченная скидка на выбранные авто.",
      },
      code: `SUMMER${discount}`,
      discountPercent: discount,
      image: CAR_IMAGES[(i + 3) % CAR_IMAGES.length]!,
      startsAt: "2026-06-01T00:00:00.000Z",
      endsAt: "2026-09-30T23:59:59.000Z",
      active: i < 10,
      categoryIds: [categories[i % categories.length]!.id],
    };
  });
}

export function createInvoices(bookings: Booking[]): Invoice[] {
  return bookings.slice(0, 80).map((b, i) => ({
    id: `inv_${pad(i + 1)}`,
    bookingId: b.id,
    userId: b.userId,
    number: `INV-2026-${pad(i + 1, 4)}`,
    amount: b.total,
    currency: b.currency,
    issuedAt: b.createdAt,
    status: b.paymentStatus === "paid" ? "paid" : b.paymentStatus === "refunded" ? "void" : "due",
  }));
}

export function createNotifications(users: UserProfile[]): NotificationItem[] {
  return users.slice(0, 20).flatMap((u, i) => [
    {
      id: `ntf_${pad(i * 2 + 1)}`,
      userId: u.id,
      title: "Rezervasyon güncellendi",
      body: "Rezervasyon durumunuz güncellendi.",
      read: i % 2 === 0,
      createdAt: new Date(Date.UTC(2026, 6, (i % 20) + 1)).toISOString(),
      href: "/account/bookings",
    },
  ]);
}

export function createSettings(): SiteSettings {
  return {
    brandName: "ASK RENT A CAR",
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    phone: "+90 392 815 00 00",
    whatsapp: "+905338881122",
    email: "info@askrentacar.com",
    address: {
      tr: "Girne Liman Caddesi No:12, KKTC",
      en: "Kyrenia Harbour Street 12, TRNC",
      ru: "Гавань Кирении 12, ТРСК",
    },
    seo: {
      title: {
        tr: "ASK RENT A CAR | KKTC Premium Araç Kiralama",
        en: "ASK RENT A CAR | Premium Car Rental in Northern Cyprus",
        ru: "ASK RENT A CAR | Премиальная аренда авто на Северном Кипре",
      },
      description: {
        tr: "Ercan, Girne, Lefkoşa ve tüm KKTC noktalarında premium araç kiralama.",
        en: "Premium car rental across Ercan, Kyrenia, Nicosia and Northern Cyprus.",
        ru: "Премиальная аренда автомобилей по всему Северному Кипру.",
      },
      keywords: ["kktc rent a car", "girne araç kiralama", "ercan car rental", "northern cyprus"],
    },
    smtp: {
      host: "smtp.askrentacar.local",
      port: 587,
      user: "noreply@askrentacar.com",
      from: "ASK RENT A CAR <noreply@askrentacar.com>",
    },
    analytics: {
      gaId: "G-MOCK123456",
      gtmId: "GTM-MOCK001",
    },
    maps: {
      embedUrl:
        "https://maps.google.com/maps?q=Kyrenia%20Harbour&t=&z=13&ie=UTF8&iwloc=&output=embed",
      lat: 35.3417,
      lng: 33.3167,
    },
    exchangeRates: {
      EUR: 1,
      GBP: 0.86,
      TRY: 36.5,
    },
  };
}

export interface MockDatabase {
  categories: Category[];
  locations: Location[];
  vehicles: Vehicle[];
  addOns: AddOn[];
  users: UserProfile[];
  bookings: Booking[];
  reviews: Review[];
  blogPosts: BlogPost[];
  campaigns: Campaign[];
  invoices: Invoice[];
  notifications: NotificationItem[];
  settings: SiteSettings;
  media: MediaAsset[];
}

let seedCache: MockDatabase | null = null;

export function createSeedDatabase(): MockDatabase {
  if (seedCache) return seedCache;

  const categories = createCategories();
  const locations = createLocations();
  const vehicles = createVehicles(categories);
  const users = createUsers();
  const bookings = createBookings(users, vehicles, locations);
  const reviews = createReviews(users, vehicles);
  const blogPosts = createBlogPosts();
  const campaigns = createCampaigns(categories);
  const invoices = createInvoices(bookings);
  const notifications = createNotifications(users);
  const settings = createSettings();
  const media = vehicles.flatMap((v) => v.images).slice(0, 48);

  seedCache = {
    categories,
    locations,
    vehicles,
    addOns: createAddOns(),
    users,
    bookings,
    reviews,
    blogPosts,
    campaigns,
    invoices,
    notifications,
    settings,
    media,
  };
  return seedCache;
}
