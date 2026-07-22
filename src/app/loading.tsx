export default function Loading() {
  return (
    <div className="container-premium flex min-h-[50vh] items-center justify-center pt-28">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-accent" aria-label="Yükleniyor" />
    </div>
  );
}
