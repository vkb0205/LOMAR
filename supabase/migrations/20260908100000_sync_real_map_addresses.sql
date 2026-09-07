-- Replace the synthetic map seed with the reviewed Hồ Văn Huê address list.
-- The address list is intentionally the map boundary: other catalog vendors
-- remain available in the catalog but do not receive map coordinates here.
begin;

-- These are the rows created by the old map-only seed. Keep any dependent
-- records intact, but make sure their stale coordinates cannot put them back
-- on the public map.
update public.vendors
set status = 'draft',
    latitude = null,
    longitude = null,
    updated_at = now()
where slug in (
  'quyen-nguyen-bridal-ho-van-hue',
  'tymie-bridal-ho-van-hue',
  'gallery-bridal-ho-van-hue',
  'cem-bridal-studio-ho-van-hue',
  'gia-hung-studio-ho-van-hue',
  'tuart-wedding-ho-van-hue',
  'ktiu-luxury-ho-van-hue',
  'blossom-hill-bridal-ho-van-hue',
  'ahihi-studio-ho-van-hue',
  'vera-studio-ho-van-hue',
  'nha-wedding-studio-ho-van-hue',
  'phat-pro-studio-ho-van-hue'
);

-- The coordinates below are address-level points for the exact street number
-- or range in address.md. Do not replace them with one street midpoint.
insert into public.vendors (
  name,
  slug,
  category,
  description,
  address,
  city,
  phone,
  image_url,
  rating_avg,
  rating_count,
  status,
  latitude,
  longitude,
  price_tier,
  business_hours,
  specialties
)
values
  ('TuArt Wedding', 'tuart-wedding-ho-van-hue', 'Chụp ảnh', null, '147–149 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8033606, 106.6768640, null, null, '{}'),
  ('Win’s Studio', 'wins-studio-ho-van-hue', 'Studio', null, '204 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8008720, 106.6757200, null, null, '{}'),
  ('Sago Wedding', 'sago-wedding-ho-van-hue', 'Chụp ảnh', null, '122 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8044210, 106.6774730, null, null, '{}'),
  ('Ahihi Studio', 'ahihi-studio', 'Studio', null, '170 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8023063, 106.6764589, null, null, '{}'),
  ('CEM Bridal Studio', 'cem-bridal-studio-ho-van-hue', 'Váy cưới', null, '123 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8043790, 106.6774257, null, null, '{}'),
  ('Rin Wedding', 'rin-wedding', 'Chụp ảnh', null, '206 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8007870, 106.6756800, null, null, '{}'),
  ('Cửa Hàng Áo Cưới 1 Nhà', 'cua-hang-ao-cuoi-1-nha-ho-van-hue', 'Váy cưới', null, '111–113 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8048000, 106.6776600, null, null, '{}'),
  ('Jessica Bridal', 'jessica-bridal-ho-van-hue', 'Váy cưới', null, '109 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8049700, 106.6777600, null, null, '{}'),
  ('NancyPham Bridal', 'nancypham-wedding-studio', 'Váy cưới', null, '136 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8038700, 106.6771700, null, null, '{}'),
  ('Studio Trí Nguyễn', 'studio-tri-nguyen-ho-van-hue', 'Studio', null, '160 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8027300, 106.6767200, null, null, '{}'),
  ('Bonjour Studio', 'bonjour-studio-ho-van-hue', 'Studio', null, '150 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8032300, 106.6768700, null, null, '{}'),
  ('Phat Pro Studio', 'phat-pro-studio-ho-van-hue', 'Studio', null, '137 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8038300, 106.6771200, null, null, '{}'),
  ('Phindump Wedding', 'phindump-wedding-ho-van-hue', 'Chụp ảnh', null, '112A Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8047600, 106.6776400, null, null, '{}'),
  ('2H Studio', '2h-studio-ho-van-hue', 'Studio', null, '85–87 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8059800, 106.6783000, null, null, '{}'),
  ('Chụp Hình Cưới Ngôi Sao', 'chup-hinh-cuoi-ngoi-sao-ho-van-hue', 'Chụp ảnh', null, '39 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8079300, 106.6793000, null, null, '{}'),
  ('TYMIE Bridal', 'tymie-bridal', 'Váy cưới', null, '117 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8046329, 106.6775681, null, null, '{}'),
  ('Đức Studio', 'duc-studio-ho-van-hue', 'Studio', null, '230 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.7997700, 106.6751300, null, null, '{}'),
  ('Helen Nguyễn Studio', 'helen-nguyen-studio', 'Trang điểm', null, '118 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8045900, 106.6775450, null, null, '{}'),
  ('KTIU Luxury', 'ktiu-studio-ktiu-luxury', 'Váy cưới', null, '152–156 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8029778, 106.6768535, null, null, '{}'),
  ('Công ty Áo Cưới Thiên Đường', 'cong-ty-ao-cuoi-thien-duong-ho-van-hue', 'Váy cưới', null, '124 Hồ Văn Huê', 'TP. Hồ Chí Minh', null, null, 0, 0, 'active', 10.8043370, 106.6773970, null, null, '{}')
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  address = excluded.address,
  city = excluded.city,
  phone = excluded.phone,
  image_url = excluded.image_url,
  rating_avg = excluded.rating_avg,
  rating_count = excluded.rating_count,
  status = excluded.status,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  price_tier = excluded.price_tier,
  business_hours = excluded.business_hours,
  specialties = excluded.specialties,
  updated_at = now();

-- Only the reviewed address.md locations are map locations. This clears any
-- stale coordinates from unrelated catalog rows without deleting their
-- catalog/service records.
update public.vendors
set latitude = null,
    longitude = null,
    updated_at = now()
where slug not in (
  'tuart-wedding-ho-van-hue',
  'wins-studio-ho-van-hue',
  'sago-wedding-ho-van-hue',
  'ahihi-studio',
  'cem-bridal-studio-ho-van-hue',
  'rin-wedding',
  'cua-hang-ao-cuoi-1-nha-ho-van-hue',
  'jessica-bridal-ho-van-hue',
  'nancypham-wedding-studio',
  'studio-tri-nguyen-ho-van-hue',
  'bonjour-studio-ho-van-hue',
  'phat-pro-studio-ho-van-hue',
  'phindump-wedding-ho-van-hue',
  '2h-studio-ho-van-hue',
  'chup-hinh-cuoi-ngoi-sao-ho-van-hue',
  'tymie-bridal',
  'duc-studio-ho-van-hue',
  'helen-nguyen-studio',
  'ktiu-studio-ktiu-luxury',
  'cong-ty-ao-cuoi-thien-duong-ho-van-hue'
)
and (latitude is not null or longitude is not null);

do $$
declare
  reviewed_count integer;
begin
  select count(*)
  into reviewed_count
  from public.vendors
  where status = 'active'
    and latitude is not null
    and longitude is not null;

  if reviewed_count <> 20 then
    raise exception 'Expected 20 reviewed map vendors, found %', reviewed_count;
  end if;
end
$$;

commit;
