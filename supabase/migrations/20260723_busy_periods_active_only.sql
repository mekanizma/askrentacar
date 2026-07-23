-- Only active rentals block the calendar (not cancelled / completed).

create or replace function public.get_vehicle_busy_periods(p_vehicle_id uuid)
returns table (start_at timestamptz, end_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select b.pickup_at, b.return_at
  from public.bookings b
  where b.vehicle_id = p_vehicle_id
    and b.status in (
      'pending'::public.booking_status,
      'confirmed'::public.booking_status,
      'delivered'::public.booking_status
    );
$$;

create or replace function public.get_busy_vehicle_ids(
  p_start timestamptz,
  p_end timestamptz
)
returns table (vehicle_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select distinct b.vehicle_id
  from public.bookings b
  where b.status in (
      'pending'::public.booking_status,
      'confirmed'::public.booking_status,
      'delivered'::public.booking_status
    )
    and p_start < b.return_at
    and p_end > b.pickup_at;
$$;

revoke all on function public.get_vehicle_busy_periods(uuid) from public;
revoke all on function public.get_busy_vehicle_ids(timestamptz, timestamptz) from public;
grant execute on function public.get_vehicle_busy_periods(uuid) to anon, authenticated;
grant execute on function public.get_busy_vehicle_ids(timestamptz, timestamptz) to anon, authenticated;
