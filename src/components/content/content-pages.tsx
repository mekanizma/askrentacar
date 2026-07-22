"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Check,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
} from "lucide-react";
import { useBlogPosts, useCampaigns, useCategories } from "@/hooks/use-data";
import { useCompare } from "@/providers/compare-provider";
import { useCurrency } from "@/providers/currency-provider";
import { useLocale } from "@/providers/locale-provider";
import { contentService, localize, vehicleService } from "@/services";
import type { LocaleCode, SiteSettings, Vehicle } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Card,
  Input,
  Label,
  Skeleton,
  Textarea,
} from "@/components/ui/primitives";

const copy = {
  tr: {
    categories: [
      "Filomuz",
      "Her yolculuğa uygun bir sınıf",
      "Ekonomiden premium SUV seçeneklerine, özenle seçilmiş araç kategorilerini keşfedin.",
    ],
    campaigns: [
      "Fırsatlar",
      "Yolculuğunuz daha avantajlı",
      "Aktif kampanyaları inceleyin, kodu rezervasyon sırasında kullanın.",
    ],
    blog: [
      "Sürüş Rehberi",
      "Kıbrıs yollarından hikâyeler",
      "Rotalar, kiralama ipuçları ve premium seyahat rehberleri.",
    ],
    contact: [
      "İletişim",
      "Yolculuğunuzu birlikte planlayalım",
      "Ekibimiz rezervasyon ve transfer talepleriniz için her gün yanınızda.",
    ],
    compare: [
      "Karşılaştır",
      "Doğru aracı yan yana seçin",
      "En fazla üç aracın fiyat ve teknik özelliklerini karşılaştırın.",
    ],
    vehicle: "araç",
    chooseVehicle: "Araç seç",
    searchLabel: "Blog yazılarında ara",
    searchPlaceholder: "Yazılarda ara...",
    readMore: "Devamını oku",
    contactUs: "Bize ulaşın",
    loading: "Yükleniyor...",
    officeLocation: "Ofis konumu",
    name: "Ad soyad",
    email: "E-posta",
    phone: "Telefon",
    message: "Mesajınız",
    sending: "Gönderiliyor...",
    send: "Mesajı gönder",
    sent: "Mesajınız alındı",
    sendFailed: "Mesaj gönderilemedi",
    nameError: "Adınızı girin",
    emailError: "Geçerli bir e-posta girin",
    messageError: "Mesaj en az 10 karakter olmalı",
    emptyCompare: "Karşılaştırma listeniz boş.",
    discover: "Araçları keşfet",
    clear: "Listeyi temizle",
    remove: "kaldır",
    day: "gün",
    model: "model",
    seat: "koltuk",
    automatic: "Otomatik",
    manual: "Manuel",
    petrol: "Benzin",
    diesel: "Dizel",
    hybrid: "Hibrit",
    electric: "Elektrik",
  },
  en: {
    categories: [
      "Our Fleet",
      "A class for every journey",
      "Discover carefully selected vehicle categories, from economy cars to premium SUVs.",
    ],
    campaigns: [
      "Offers",
      "More value for your journey",
      "Explore active campaigns and use the code during booking.",
    ],
    blog: [
      "Driving Guide",
      "Stories from the roads of Cyprus",
      "Routes, rental tips and premium travel guides.",
    ],
    contact: [
      "Contact",
      "Let’s plan your journey together",
      "Our team is available every day for your booking and transfer requests.",
    ],
    compare: [
      "Compare",
      "Choose the right car side by side",
      "Compare prices and specifications for up to three vehicles.",
    ],
    vehicle: "vehicles",
    chooseVehicle: "Choose a vehicle",
    searchLabel: "Search blog posts",
    searchPlaceholder: "Search posts...",
    readMore: "Read more",
    contactUs: "Contact us",
    loading: "Loading...",
    officeLocation: "Office location",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    message: "Your message",
    sending: "Sending...",
    send: "Send message",
    sent: "Your message has been received",
    sendFailed: "Message could not be sent",
    nameError: "Enter your name",
    emailError: "Enter a valid email",
    messageError: "Message must be at least 10 characters",
    emptyCompare: "Your comparison list is empty.",
    discover: "Explore vehicles",
    clear: "Clear list",
    remove: "remove",
    day: "day",
    model: "model",
    seat: "seats",
    automatic: "Automatic",
    manual: "Manual",
    petrol: "Petrol",
    diesel: "Diesel",
    hybrid: "Hybrid",
    electric: "Electric",
  },
  ru: {
    categories: [
      "Наш автопарк",
      "Класс для любого путешествия",
      "Откройте для себя тщательно подобранные категории — от экономичных автомобилей до премиальных внедорожников.",
    ],
    campaigns: [
      "Предложения",
      "Больше выгоды в путешествии",
      "Изучите действующие акции и используйте код при бронировании.",
    ],
    blog: [
      "Гид по вождению",
      "Истории с дорог Кипра",
      "Маршруты, советы по аренде и путеводители для премиальных поездок.",
    ],
    contact: [
      "Контакты",
      "Давайте спланируем поездку вместе",
      "Наша команда ежедневно помогает с бронированием и трансфером.",
    ],
    compare: [
      "Сравнение",
      "Сравните и выберите подходящий автомобиль",
      "Сравните цены и характеристики не более трёх автомобилей.",
    ],
    vehicle: "авто",
    chooseVehicle: "Выбрать автомобиль",
    searchLabel: "Поиск по блогу",
    searchPlaceholder: "Найти публикацию...",
    readMore: "Читать далее",
    contactUs: "Связаться с нами",
    loading: "Загрузка...",
    officeLocation: "Расположение офиса",
    name: "Имя и фамилия",
    email: "Эл. почта",
    phone: "Телефон",
    message: "Ваше сообщение",
    sending: "Отправка...",
    send: "Отправить",
    sent: "Ваше сообщение получено",
    sendFailed: "Не удалось отправить сообщение",
    nameError: "Введите имя",
    emailError: "Введите корректный адрес эл. почты",
    messageError: "Сообщение должно содержать не менее 10 символов",
    emptyCompare: "Список сравнения пуст.",
    discover: "Посмотреть автомобили",
    clear: "Очистить список",
    remove: "удалить",
    day: "день",
    model: "год",
    seat: "мест",
    automatic: "Автомат",
    manual: "Механика",
    petrol: "Бензин",
    diesel: "Дизель",
    hybrid: "Гибрид",
    electric: "Электро",
  },
} as const;

function useCopy() {
  const { locale } = useLocale();
  return { locale, c: copy[locale] };
}

export function PageHero({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <header className="container-premium pb-10 pt-28 sm:pt-36">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[.28em] text-gold">
        {eyebrow}
      </p>
      <h1 className="max-w-4xl font-display text-4xl font-semibold text-white sm:text-6xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
        {text}
      </p>
    </header>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((x) => (
        <Skeleton key={x} className="h-72" />
      ))}
    </div>
  );
}

export function CategoriesPage() {
  const { locale, c } = useCopy();
  const { data, isLoading } = useCategories();
  return (
    <>
      <PageHero
        eyebrow={c.categories[0]}
        title={c.categories[1]}
        text={c.categories[2]}
      />
      <section className="container-premium pb-24">
        {isLoading ? (
          <LoadingGrid />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data?.map((item) => (
              <Link key={item.id} href={`/vehicles?category=${item.slug}`}>
                <Card className="group h-full overflow-hidden p-0">
                  <div className="relative h-48">
                    <Image
                      src={item.image}
                      alt={localize(item.name, locale)}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl font-semibold">
                        {localize(item.name, locale)}
                      </h2>
                      <Badge>
                        {item.vehicleCount} {c.vehicle}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {localize(item.description, locale)}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function CampaignsPage() {
  const { locale, c } = useCopy();
  const { data, isLoading } = useCampaigns();
  return (
    <>
      <PageHero
        eyebrow={c.campaigns[0]}
        title={c.campaigns[1]}
        text={c.campaigns[2]}
      />
      <section className="container-premium pb-24">
        {isLoading ? (
          <LoadingGrid />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data
              ?.filter((x) => x.active)
              .map((item) => (
                <Card key={item.id} className="overflow-hidden p-0">
                  <div className="relative h-44 bg-slate-900">
                    <Image
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=75"
                      }
                      alt={localize(item.title, locale)}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute right-4 top-4 bg-gold text-slate-950">
                      %{item.discountPercent}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-semibold">
                      {localize(item.title, locale)}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      {localize(item.description, locale)}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <code className="rounded-lg bg-white/10 px-3 py-2 text-gold">
                        {item.code}
                      </code>
                      <Link href="/vehicles">
                        <Button size="sm">{c.chooseVehicle}</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </section>
    </>
  );
}

function localizedBlogCategory(category: string, locale: LocaleCode) {
  const labels: Record<LocaleCode, Record<string, string>> = {
    tr: {
      Travel: "Seyahat",
      Guides: "Rehberler",
      Tips: "İpuçları",
      News: "Haberler",
    },
    en: { Travel: "Travel", Guides: "Guides", Tips: "Tips", News: "News" },
    ru: {
      Travel: "Путешествия",
      Guides: "Путеводители",
      Tips: "Советы",
      News: "Новости",
    },
  };
  return labels[locale][category] ?? category;
}

export function BlogPage() {
  const { locale, c } = useCopy();
  const [q, setQ] = useState("");
  const { data, isLoading } = useBlogPosts(q);
  return (
    <>
      <PageHero eyebrow={c.blog[0]} title={c.blog[1]} text={c.blog[2]} />
      <section className="container-premium pb-24">
        <Input
          aria-label={c.searchLabel}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={c.searchPlaceholder}
          className="mb-8 max-w-md"
        />
        {isLoading ? (
          <LoadingGrid />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data?.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="group h-full overflow-hidden p-0">
                  <div className="relative h-44">
                    <Image
                      src={post.coverImage}
                      alt={localize(post.title, locale)}
                      fill
                      className="object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <Badge>
                      {localizedBlogCategory(post.category, locale)}
                    </Badge>
                    <h2 className="mt-3 text-xl font-semibold">
                      {localize(post.title, locale)}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                      {localize(post.excerpt, locale)}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm text-gold">
                      {c.readMore} <ArrowRight size={15} />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

const contactSchema = (c: (typeof copy)[LocaleCode]) =>
  z.object({
    name: z.string().min(2, c.nameError),
    email: z.string().email(c.emailError),
    phone: z.string().optional(),
    message: z.string().min(10, c.messageError),
  });
type ContactForm = z.infer<ReturnType<typeof contactSchema>>;

export function ContactPage() {
  const { c } = useCopy();
  const [settings, setSettings] = useState<SiteSettings>();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema(c)) });
  useEffect(() => {
    contentService.settings().then(setSettings);
  }, []);
  const submit = async (values: ContactForm) => {
    try {
      await contentService.contact(values);
      toast.success(c.sent);
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : c.sendFailed);
    }
  };
  const contacts = [
    {
      id: "phone",
      Icon: Phone,
      label: settings?.phone,
      href: settings?.phone ? `tel:${settings.phone}` : "#",
    },
    {
      id: "whatsapp",
      Icon: MessageCircle,
      label: settings?.whatsapp,
      href: settings?.whatsapp
        ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
        : "#",
    },
    {
      id: "email",
      Icon: Mail,
      label: settings?.email,
      href: settings?.email ? `mailto:${settings.email}` : "#",
    },
  ] as const;

  return (
    <>
      <PageHero
        eyebrow={c.contact[0]}
        title={c.contact[1]}
        text={c.contact[2]}
      />
      <section className="container-premium grid gap-6 pb-24 lg:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-4">
          <Card>
            <h2 className="mb-5 text-xl font-semibold">{c.contactUs}</h2>
            {contacts.map(({ id, Icon, label, href }) => (
              <a
                key={id}
                href={href}
                className="mb-3 flex min-h-12 items-center gap-3 rounded-xl bg-white/5 px-4 hover:bg-white/10"
              >
                <Icon className="text-gold" size={18} />
                <span>{label ?? c.loading}</span>
              </a>
            ))}
          </Card>
          {settings?.maps.embedUrl && (
            <iframe
              title={c.officeLocation}
              src={settings.maps.embedUrl}
              className="h-72 w-full rounded-3xl border-0"
              loading="lazy"
            />
          )}
        </div>
        <Card>
          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <div>
              <Label htmlFor="name">{c.name}</Label>
              <Input
                id="name"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              <p className="mt-1 text-xs text-red-400">
                {errors.name?.message}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">{c.email}</Label>
                <Input id="email" type="email" {...register("email")} />
                <p className="mt-1 text-xs text-red-400">
                  {errors.email?.message}
                </p>
              </div>
              <div>
                <Label htmlFor="phone">{c.phone}</Label>
                <Input id="phone" {...register("phone")} />
              </div>
            </div>
            <div>
              <Label htmlFor="message">{c.message}</Label>
              <Textarea id="message" {...register("message")} />
              <p className="mt-1 text-xs text-red-400">
                {errors.message?.message}
              </p>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? c.sending : c.send}
            </Button>
          </form>
        </Card>
      </section>
    </>
  );
}

export function ComparePage() {
  const { c } = useCopy();
  const { formatFrom } = useCurrency();
  const { ids, clear, toggle } = useCompare();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  useEffect(() => {
    Promise.all(ids.map(vehicleService.byId)).then((items) =>
      setVehicles(items.filter(Boolean) as Vehicle[]),
    );
  }, [ids]);
  return (
    <>
      <PageHero
        eyebrow={c.compare[0]}
        title={c.compare[1]}
        text={c.compare[2]}
      />
      <section className="container-premium pb-24">
        {!ids.length ? (
          <Card className="py-16 text-center">
            <p className="text-slate-400">{c.emptyCompare}</p>
            <Link href="/vehicles">
              <Button className="mt-5">{c.discover}</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="mb-5 flex justify-end">
              <Button variant="ghost" onClick={clear}>
                <Trash2 size={16} /> {c.clear}
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v) => (
                <Card key={v.id} className="relative">
                  <button
                    onClick={() => toggle(v.id)}
                    aria-label={`${v.brand} ${v.model} ${c.remove}`}
                    className="absolute right-4 top-4 rounded-full bg-white/10 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="relative mb-4 h-40">
                    <Image
                      src={v.images[0]!.url}
                      alt={`${v.brand} ${v.model}`}
                      fill
                      className="rounded-2xl object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-semibold">
                    {v.brand} {v.model}
                  </h2>
                  <p className="mt-2 text-2xl font-semibold text-gold">
                    {formatFrom(v.pricing.daily, v.pricing.currency)}
                    <span className="text-sm text-slate-400"> / {c.day}</span>
                  </p>
                  <ul className="mt-5 space-y-3 text-sm text-slate-300">
                    {[
                      `${v.specs.year} ${c.model}`,
                      c[v.specs.transmission],
                      c[v.specs.fuel],
                      `${v.specs.seats} ${c.seat}`,
                      `${v.specs.horsepower} HP`,
                    ].map((x) => (
                      <li key={x} className="flex items-center gap-2">
                        <Check size={15} className="text-gold" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

export function TextPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { title: string; body: string }[];
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} text={intro} />
      <article className="container-premium pb-24">
        <Card className="mx-auto max-w-4xl p-6 sm:p-10">
          {sections.map((section) => (
            <section key={section.title} className="mb-8 last:mb-0">
              <h2 className="mb-3 text-xl font-semibold text-white">
                {section.title}
              </h2>
              <p className="whitespace-pre-line leading-7 text-slate-400">
                {section.body}
              </p>
            </section>
          ))}
        </Card>
      </article>
    </>
  );
}
