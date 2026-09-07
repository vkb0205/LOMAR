begin;

alter table public.vendors
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7),
  add column if not exists price_tier text,
  add column if not exists business_hours text,
  add column if not exists specialties text[] not null default '{}';

do $migration$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'vendors_latitude_check'
      and conrelid = 'public.vendors'::regclass
  ) then
    alter table public.vendors
      add constraint vendors_latitude_check
      check (latitude is null or latitude between -90 and 90);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'vendors_longitude_check'
      and conrelid = 'public.vendors'::regclass
  ) then
    alter table public.vendors
      add constraint vendors_longitude_check
      check (longitude is null or longitude between -180 and 180);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'vendors_price_tier_check'
      and conrelid = 'public.vendors'::regclass
  ) then
    alter table public.vendors
      add constraint vendors_price_tier_check
      check (price_tier is null or price_tier in ('$', '$$', '$$$'));
  end if;
end $migration$;

insert into public.vendors (
  id, name, slug, category, description, address, city, phone, image_url,
  rating_avg, rating_count, status, latitude, longitude, price_tier,
  business_hours, specialties
)
values
  ('81000000-0000-0000-0000-000000000001', 'Quyên Nguyễn Bridal', 'quyen-nguyen-bridal-ho-van-hue', 'Váy cưới', 'Thiết kế và cho thuê váy cưới cao cấp với phom dáng thanh lịch.', '115 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '0842 880 066', 'https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=640&h=420&fit=crop&auto=format', 4.90, 218, 'active', 10.8047175, 106.6776156, '$$$', '9:00 - 20:00', array['Váy thiết kế', 'Luxury fitting', 'Tư vấn dáng váy']),
  ('81000000-0000-0000-0000-000000000002', 'TYMIE BRIDAL', 'tymie-bridal-ho-van-hue', 'Váy cưới', 'Studio váy cưới và dịch vụ cưới trọn gói, phù hợp lịch thử nhanh trong một buổi.', '117 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '0931 234 709', 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=640&h=420&fit=crop&auto=format', 4.80, 186, 'active', 10.8046329, 106.6775681, '$$', '8:30 - 21:00', array['Thuê váy cưới', 'Combo chụp ảnh', 'Phụ kiện cô dâu']),
  ('81000000-0000-0000-0000-000000000003', 'Gallery Bridal', 'gallery-bridal-ho-van-hue', 'Chụp ảnh', 'Dịch vụ váy cưới kết hợp concept ảnh nhẹ nhàng.', '119 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '0931 234 709', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=640&h=420&fit=crop&auto=format', 4.70, 152, 'active', 10.8045483, 106.6775207, '$$', '9:00 - 20:30', array['Concept studio', 'Album cưới', 'Makeup cơ bản']),
  ('81000000-0000-0000-0000-000000000004', 'CEM Bridal Studio', 'cem-bridal-studio-ho-van-hue', 'Váy cưới', 'Váy cưới và dịch vụ cưới với nhiều lựa chọn tối giản.', '123 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '0909 593 738', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=640&h=420&fit=crop&auto=format', 4.80, 204, 'active', 10.8043790, 106.6774257, '$$', '8:30 - 20:30', array['Minimal gown', 'Váy đi bàn', 'Phụ kiện veil']),
  ('81000000-0000-0000-0000-000000000005', 'Gia Hưng Studio', 'gia-hung-studio-ho-van-hue', 'Chụp ảnh', 'Studio chụp ảnh cưới lâu năm trên tuyến Hồ Văn Huê.', '131-133 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '0903 122 476', 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=640&h=420&fit=crop&auto=format', 4.60, 171, 'active', 10.8040405, 106.6772359, '$$', '8:00 - 20:00', array['Pre-wedding', 'Ảnh gia đình', 'Album truyền thống']),
  ('81000000-0000-0000-0000-000000000006', 'TuArt Wedding', 'tuart-wedding-ho-van-hue', 'Chụp ảnh', 'Thương hiệu ảnh cưới cao cấp với phong cách editorial.', '147 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '028 3913 8888', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=640&h=420&fit=crop&auto=format', 4.90, 329, 'active', 10.8033606, 106.6768640, '$$$', '9:00 - 21:00', array['Ảnh cưới cao cấp', 'Cinematic film', 'Styling concept']),
  ('81000000-0000-0000-0000-000000000007', 'KTIU LUXURY', 'ktiu-luxury-ho-van-hue', 'Váy cưới', 'Váy cưới luxury và gói chụp ảnh dành cho cô dâu muốn thiết kế nổi bật.', '154 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', null, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=640&h=420&fit=crop&auto=format', 4.70, 143, 'active', 10.8029778, 106.6768535, '$$$', '9:00 - 20:00', array['Luxury gown', 'Đầm reception', 'Ảnh lookbook']),
  ('81000000-0000-0000-0000-000000000008', 'Blossom Hill Bridal', 'blossom-hill-bridal-ho-van-hue', 'Hoa cưới', 'Không gian bridal nhẹ nhàng với thế mạnh phối váy cùng hoa cưới.', '168 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '0903 626 080', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=640&h=420&fit=crop&auto=format', 4.80, 126, 'active', 10.8023890, 106.6765097, '$$', '8:30 - 20:00', array['Hoa cầm tay', 'Romantic styling', 'Concept pastel']),
  ('81000000-0000-0000-0000-000000000009', 'Ahihi Studio', 'ahihi-studio-ho-van-hue', 'Trang điểm', 'Studio váy cưới có gói trang điểm và chụp ảnh linh hoạt.', '170 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '0978 880 150', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=640&h=420&fit=crop&auto=format', 4.60, 118, 'active', 10.8023063, 106.6764589, '$$', '8:00 - 20:00', array['Makeup cô dâu', 'Chụp trong ngày', 'Thuê áo dài']),
  ('81000000-0000-0000-0000-000000000010', 'Vera Studio', 'vera-studio-ho-van-hue', 'Trang điểm', 'Dịch vụ váy cưới, trang điểm và chụp ảnh vừa túi tiền.', '176 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '0908 918 558', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=640&h=420&fit=crop&auto=format', 4.50, 97, 'active', 10.8020585, 106.6763197, '$', '8:00 - 19:30', array['Gói tiết kiệm', 'Makeup tự nhiên', 'Ảnh studio']),
  ('81000000-0000-0000-0000-000000000011', 'Nha Wedding and Studio', 'nha-wedding-studio-ho-van-hue', 'Chụp ảnh', 'Studio cưới phù hợp chụp concept riêng tư và nhẹ nhàng.', '220/18 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '0902 334 225', 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=640&h=420&fit=crop&auto=format', 4.70, 135, 'active', 10.8001962, 106.6752750, '$$', '9:00 - 20:00', array['Ảnh concept', 'Private studio', 'Retouch album']),
  ('81000000-0000-0000-0000-000000000012', 'Phat Pro Studio', 'phat-pro-studio-ho-van-hue', 'Chụp ảnh', 'Studio ảnh cưới tiện làm điểm xuất phát cho lịch tham khảo nhiều nhà cung cấp.', '234 Hồ Văn Huê, Phú Nhuận, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '0981 735 554', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=640&h=420&fit=crop&auto=format', 4.60, 111, 'active', 10.7996047, 106.6750377, '$', '8:30 - 20:00', array['Ảnh cưới nhanh', 'Video highlight', 'Gói cơ bản'])
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

commit;
