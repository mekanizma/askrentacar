# Supabase — ASK RENT A CAR

## Durum
- Schema uygulandı (`supabase/schema.sql`)
- Seed: kategoriler, lokasyonlar, ekstra, 6 araç
- Admin / demo kullanıcılar oluşturuldu
- Uygulama: `NEXT_PUBLIC_DATA_PROVIDER=supabase`

## Hesaplar
| Rol | Email | Şifre |
|-----|-------|-------|
| Admin | admin@askrentacar.com | Admin123! |
| Müşteri | demo@askrentacar.com | Demo123! |

## Yerel çalıştırma
```bash
pnpm install
pnpm dev
```
`.env` içinde `NEXT_PUBLIC_DATA_PROVIDER=supabase` olmalı. Dev sunucusunu yeniden başlat.
