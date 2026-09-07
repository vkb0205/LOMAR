-- Replaces the product catalog with the reviewed Google Doc Data-tab fixture.
-- IMPORTANT: take a production backup before applying. The impact notice below
-- reports rows whose foreign keys will cascade, be removed, or be set to null.
begin;

alter table public.services
  alter column base_price drop not null,
  add column if not exists max_price numeric(12,2),
  add column if not exists price_unit text,
  add column if not exists price_display text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.services'::regclass
      and conname = 'services_base_price_nonnegative'
  ) then
    alter table public.services
      add constraint services_base_price_nonnegative
      check (base_price is null or base_price >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.services'::regclass
      and conname = 'services_max_price_nonnegative'
  ) then
    alter table public.services
      add constraint services_max_price_nonnegative
      check (max_price is null or max_price >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.services'::regclass
      and conname = 'services_price_range_ordered'
  ) then
    alter table public.services
      add constraint services_price_range_ordered
      check (max_price is null or base_price is not null and max_price >= base_price) not valid;
  end if;
end
$$;

comment on column public.services.base_price is
  'Exact price, approximate price, starting price, or lower bound; null for qualitative pricing.';
comment on column public.services.max_price is
  'Upper bound for a price range; null for exact, starting, and qualitative prices.';
comment on column public.services.price_unit is
  'Normalized unit such as bàn, thiệp, gói, lần, or chiếc.';
comment on column public.services.price_display is
  'Original reference-price wording from the catalog source.';

create temp table _vendor_catalog (
  source_tab text not null,
  source_order integer not null,
  vendor_id uuid not null,
  vendor_name text not null,
  vendor_slug text not null,
  vendor_category text not null,
  service_id uuid primary key,
  service_name text not null,
  service_category text not null,
  price_display text not null,
  base_price numeric(12,2),
  max_price numeric(12,2),
  price_unit text,
  image_url text
) on commit drop;

insert into _vendor_catalog (
  source_tab, source_order, vendor_id, vendor_name, vendor_slug, vendor_category,
  service_id, service_name, service_category, price_display, base_price,
  max_price, price_unit, image_url
) values
  ('Studio 1', 1, '7e000000-0000-4000-8000-000000000001', 'Aloha Studio', 'aloha-studio', 'Studio', '7e100000-0000-4000-8000-000000000001', 'Gói chụp hình cưới Studio', 'Studio', '5.990.000đ', 5990000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/10/bi-quyet-chon-hinh-cong-cuoi-dep-lung-linh-4.jpg'),
  ('Studio 1', 2, '7e000000-0000-4000-8000-000000000001', 'Aloha Studio', 'aloha-studio', 'Studio', '7e100000-0000-4000-8000-000000000002', 'Gói chụp hình cưới Phim trường', 'Studio', '6.990.000đ', 6990000, null, null, 'https://alohastudio.vn/wp-content/uploads/2023/05/Phat-tam-Alibaba-101.jpg'),
  ('Studio 1', 3, '7e000000-0000-4000-8000-000000000001', 'Aloha Studio', 'aloha-studio', 'Studio', '7e100000-0000-4000-8000-000000000003', 'Gói chụp hình cưới Ngoại cảnh Sài Gòn', 'Studio', '7.500.000đ', 7500000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/08/BUII2031-scaled.jpg'),
  ('Studio 1', 4, '7e000000-0000-4000-8000-000000000001', 'Aloha Studio', 'aloha-studio', 'Studio', '7e100000-0000-4000-8000-000000000004', 'Gói chụp hình cưới Biển Vũng Tàu', 'Studio', '10.900.000đ', 10900000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/08/BUII2811-scaled.jpg'),
  ('Studio 1', 5, '7e000000-0000-4000-8000-000000000001', 'Aloha Studio', 'aloha-studio', 'Studio', '7e100000-0000-4000-8000-000000000005', 'Gói chụp hình cưới kết hợp du lịch Đà Lạt', 'Studio', '12.900.000đ', 12900000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/08/BUII2169-scaled.jpg'),
  ('Studio 1', 6, '7e000000-0000-4000-8000-000000000002', 'Rin Wedding', 'rin-wedding', 'Studio', '7e100000-0000-4000-8000-000000000006', 'Gói Studio', 'Studio', '9.500.000đ', 9500000, null, null, 'https://rinwedding.vn/_next/image?url=%2Fapi%2Fmedia%2Ffile%2FTHA_5738-1200x630.webp&w=1920&q=100'),
  ('Studio 1', 7, '7e000000-0000-4000-8000-000000000002', 'Rin Wedding', 'rin-wedding', 'Studio', '7e100000-0000-4000-8000-000000000007', 'Gói Ngoại cảnh 2 địa điểm', 'Studio', '13.900.000đ', 13900000, null, null, 'https://rinwedding.vn/_next/image?url=%2Fapi%2Fmedia%2Ffile%2FBa%25CC%2589n%2520sao%2520cu%25CC%2589a%25205.webp%3F2025-12-17T11%3A06%3A10.925Z&w=3840&q=100'),
  ('Studio 1', 8, '7e000000-0000-4000-8000-000000000002', 'Rin Wedding', 'rin-wedding', 'Studio', '7e100000-0000-4000-8000-000000000008', 'Gói Ảnh lớn', 'Studio', '3.500.000đ', 3500000, null, null, 'https://rinwedding.vn/_next/image?url=%2Fapi%2Fmedia%2Ffile%2Fphotography_sm.webp%3F2026-05-08T03%3A52%3A16.639Z&w=3840&q=100'),
  ('Studio 1', 9, '7e000000-0000-4000-8000-000000000003', 'Ahihi Studio', 'ahihi-studio', 'Studio', '7e100000-0000-4000-8000-000000000009', 'Gói chụp Studio Hàn Quốc', 'Studio', '4.900.000đ', 4900000, null, null, 'https://ahihistudio.vn/wp-content/uploads/2023/08/1B6A2020-scaled.jpg'),
  ('Studio 1', 10, '7e000000-0000-4000-8000-000000000003', 'Ahihi Studio', 'ahihi-studio', 'Studio', '7e100000-0000-4000-8000-000000000010', 'Gói chụp Phim trường Alibaba', 'Studio', '5.900.000đ', 5900000, null, null, 'https://ahihistudio.vn/wp-content/uploads/2023/08/9.TBML2444-scaled.jpg'),
  ('Studio 1', 11, '7e000000-0000-4000-8000-000000000003', 'Ahihi Studio', 'ahihi-studio', 'Studio', '7e100000-0000-4000-8000-000000000011', 'Gói chụp Phim trường Lamour', 'Studio', '5.900.000đ', 5900000, null, null, 'https://ahihistudio.vn/wp-content/uploads/2023/08/3.LCUT7023-scaled.jpg'),
  ('Studio 1', 12, '7e000000-0000-4000-8000-000000000003', 'Ahihi Studio', 'ahihi-studio', 'Studio', '7e100000-0000-4000-8000-000000000012', 'Gói chụp Phim trường Paris', 'Studio', '5.900.000đ', 5900000, null, null, 'https://ahihistudio.vn/wp-content/uploads/2023/08/5.1B6A3826-scaled.jpg'),
  ('Studio 1', 13, '7e000000-0000-4000-8000-000000000003', 'Ahihi Studio', 'ahihi-studio', 'Studio', '7e100000-0000-4000-8000-000000000013', 'Gói chụp Ngoại cảnh Sài Gòn', 'Studio', '7.900.000đ', 7900000, null, null, 'https://ahihistudio.vn/wp-content/uploads/2023/08/5.415A9615-scaled.jpg'),
  ('Studio 1', 14, '7e000000-0000-4000-8000-000000000003', 'Ahihi Studio', 'ahihi-studio', 'Studio', '7e100000-0000-4000-8000-000000000014', 'Gói chụp Ngoại cảnh Hồ Cốc - Vũng Tàu', 'Studio', '8.900.000đ', 8900000, null, null, 'https://ahihistudio.vn/wp-content/uploads/2023/08/1.TLV_6912-scaled.jpg'),
  ('Studio 1', 15, '7e000000-0000-4000-8000-000000000003', 'Ahihi Studio', 'ahihi-studio', 'Studio', '7e100000-0000-4000-8000-000000000015', 'Gói chụp Ngoại cảnh Đà Lạt', 'Studio', '12.900.000đ', 12900000, null, null, 'https://ahihistudio.vn/wp-content/uploads/2020/08/4.jpg'),
  ('Váy cưới 1', 1, '7e000000-0000-4000-8000-000000000004', 'Ktiu Studio / Ktiu Luxury', 'ktiu-studio-ktiu-luxury', 'Váy Cưới', '7e100000-0000-4000-8000-000000000016', 'Dịch vụ ngày cưới cơ bản', 'Váy Cưới', '≈ 1.000.000đ', 1000000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/10/album-hoai-hieu-4.jpg'),
  ('Váy cưới 1', 2, '7e000000-0000-4000-8000-000000000004', 'Ktiu Studio / Ktiu Luxury', 'ktiu-studio-ktiu-luxury', 'Váy Cưới', '7e100000-0000-4000-8000-000000000017', 'Thuê váy cưới', 'Váy Cưới', '≈ 3.500.000đ', 3500000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWwC_mTXewEbsLs1iiXbU1HLcxnsyl1azmSX-8W4JT0NaTXYGE6N37Kmcc&s=10'),
  ('Váy cưới 1', 3, '7e000000-0000-4000-8000-000000000004', 'Ktiu Studio / Ktiu Luxury', 'ktiu-studio-ktiu-luxury', 'Váy Cưới', '7e100000-0000-4000-8000-000000000018', 'Pre-wedding phim trường', 'Váy Cưới', '8.900.000đ', 8900000, null, null, 'https://thanhnien.mediacdn.vn/Uploaded/thuyhang/2022_05_21/truc1-3029.jpg'),
  ('Váy cưới 1', 4, '7e000000-0000-4000-8000-000000000004', 'Ktiu Studio / Ktiu Luxury', 'ktiu-studio-ktiu-luxury', 'Váy Cưới', '7e100000-0000-4000-8000-000000000019', 'Pre-wedding ngoại cảnh', 'Váy Cưới', '≈ 12.900.000đ', 12900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-lxbBRokbnXPuAXF31kRVA7X1e30MzSvo4B-CGvGr9eWmKA5tuye7Lgs&s=10'),
  ('Váy cưới 1', 5, '7e000000-0000-4000-8000-000000000004', 'Ktiu Studio / Ktiu Luxury', 'ktiu-studio-ktiu-luxury', 'Váy Cưới', '7e100000-0000-4000-8000-000000000020', 'Gói cưới trọn gói cao cấp', 'Váy Cưới', '≈ 18.900.000đ', 18900000, null, null, 'https://giadinh.mediacdn.vn/296230595582509056/2026/4/6/nghi-thuc-trao-nhan-cuoi-1-17754776803861139568411.jpg'),
  ('Váy cưới 1', 6, '7e000000-0000-4000-8000-000000000005', 'Kim Couture', 'kim-couture', 'Váy Cưới', '7e100000-0000-4000-8000-000000000021', 'Diamond NDM08', 'Váy Cưới', '12.000.000đ', 12000000, null, null, 'https://tulinhboutique.com/cdn/shop/products/tu-linh-boutique-ao-c-i-vay-c-i-cong-chua-alina-36628419149978.jpg?v=1740461106'),
  ('Váy cưới 1', 7, '7e000000-0000-4000-8000-000000000005', 'Kim Couture', 'kim-couture', 'Váy Cưới', '7e100000-0000-4000-8000-000000000022', 'Gold BG65', 'Váy Cưới', '15.000.000đ', 15000000, null, null, 'https://nicolebridal.vn/uploads/content/Nicole-Bridal-A_o-cu_o_i-de_p-hi_nh-13_1784195325_13ac72a7927fe254.jpeg'),
  ('Váy cưới 1', 8, '7e000000-0000-4000-8000-000000000005', 'Kim Couture', 'kim-couture', 'Váy Cưới', '7e100000-0000-4000-8000-000000000023', 'Luxury NLX69', 'Váy Cưới', '20.000.000đ', 20000000, null, null, 'https://kimcouture.vn/wp-content/uploads/2022/11/vay-cuoi-lam-le-Limited-LLM05-1.jpg'),
  ('Váy cưới 1', 9, '7e000000-0000-4000-8000-000000000005', 'Kim Couture', 'kim-couture', 'Váy Cưới', '7e100000-0000-4000-8000-000000000024', 'Limited NLM64', 'Váy Cưới', '45.000.000đ', 45000000, null, null, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/368/426/products/vay-cuoi-dep-kieu-cong-chua.jpg?v=1729238245533'),
  ('Váy cưới 1', 10, '7e000000-0000-4000-8000-000000000005', 'Kim Couture', 'kim-couture', 'Váy Cưới', '7e100000-0000-4000-8000-000000000025', 'Haute Couture HA11', 'Váy Cưới', '120.000.000đ', 120000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaVjgz4IT0-C1yx-jv1FGpVfwyN73dz6Pn2iZKFQumQ_Ph8Vti1q9BvLg&s=10'),
  ('Váy cưới 1', 11, '7e000000-0000-4000-8000-000000000006', 'NancyPham Wedding & Studio', 'nancypham-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000026', 'Chụp ảnh couple studio', 'Váy Cưới', '≈ 3.900.000đ', 3900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxQSAMxKVORWrnAeLTDdeul3Im3xG1RC6vejLtUl2lAJBmL-cO7OIj8Rlk&s=10'),
  ('Váy cưới 1', 12, '7e000000-0000-4000-8000-000000000006', 'NancyPham Wedding & Studio', 'nancypham-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000027', 'Album cưới studio', 'Váy Cưới', '≈ 5.900.000đ', 5900000, null, null, 'https://calibridal.com.vn/wp-content/uploads/2021/06/anh-vien-ao-cuoi-1.jpg'),
  ('Váy cưới 1', 13, '7e000000-0000-4000-8000-000000000006', 'NancyPham Wedding & Studio', 'nancypham-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000028', 'Pre-wedding studio', 'Váy Cưới', '≈ 8.900.000đ', 8900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3KT_St5qCqJ-uw7C_G2MVBJr8FdNthta5ENB0hJq8n5Mhl7Fu158PNkEo&s=10'),
  ('Váy cưới 1', 14, '7e000000-0000-4000-8000-000000000006', 'NancyPham Wedding & Studio', 'nancypham-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000029', 'Pre-wedding ngoại cảnh', 'Váy Cưới', '≈ 12.900.000đ', 12900000, null, null, 'https://chichchoedesign.com/wp-content/uploads/2023/04/442495285_901948371733275_7515867775354818065_n.jpg'),
  ('Váy cưới 1', 15, '7e000000-0000-4000-8000-000000000006', 'NancyPham Wedding & Studio', 'nancypham-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000030', 'Wedding Story cao cấp', 'Váy Cưới', '≈ 18.900.000đ', 18900000, null, null, 'https://quyennguyen.vn/wp-content/uploads/2018/12/vay-cuoi-quyen-nguyen-10.jpg'),
  ('Váy cưới 1', 16, '7e000000-0000-4000-8000-000000000007', 'Hana Studio', 'hana-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000031', 'Gói chụp cơ bản', 'Váy Cưới', '≈ 1.000.000đ', 1000000, null, null, 'https://alohastudio.vn/wp-content/uploads/2017/10/cho-thue-vay-cuoi-dep-gi%C3%A2-re-hcm-51.jpg'),
  ('Váy cưới 1', 17, '7e000000-0000-4000-8000-000000000007', 'Hana Studio', 'hana-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000032', 'Phim trường mini', 'Váy Cưới', '≈ 3.900.000đ', 3900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwGt1AxD_BZ4vkG5T2PHZYxYW9W1YX_xFlbaXVbZxfPCCDGpR2HXZiHD1O&s=10'),
  ('Váy cưới 1', 18, '7e000000-0000-4000-8000-000000000007', 'Hana Studio', 'hana-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000033', 'Phim trường + ngoại cảnh', 'Váy Cưới', '≈ 5.900.000đ', 5900000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/08/BUII2031-scaled.jpg'),
  ('Váy cưới 1', 19, '7e000000-0000-4000-8000-000000000007', 'Hana Studio', 'hana-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000034', 'Hồ Cốc – Hồ Tràm', 'Váy Cưới', '≈ 9.900.000đ', 9900000, null, null, 'https://2hstudio.vn/wp-content/uploads/2025/04/vay-cuoi-chup-tai-phim-truong-dream-future.jpg'),
  ('Váy cưới 1', 20, '7e000000-0000-4000-8000-000000000007', 'Hana Studio', 'hana-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000035', 'Gói ngoại cảnh cao cấp', 'Váy Cưới', '≈ 18.000.000đ', 18000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIACNq8DYun2cU3eoMfoA6qerUXamtyI9QFvik8U-rx7mPw5ajLw-QFVs&s=10'),
  ('Váy cưới 1', 21, '7e000000-0000-4000-8000-000000000008', 'Lucky Anh & Em Studio', 'lucky-anh-em-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000036', 'Thuê trang phục cưới', 'Váy Cưới', '≈ 900.000đ', 900000, null, null, 'https://oms.hotdeal.vn/images/editors/sources/000369527173/369527-369527-body(47).jpg'),
  ('Váy cưới 1', 22, '7e000000-0000-4000-8000-000000000008', 'Lucky Anh & Em Studio', 'lucky-anh-em-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000037', 'Album cưới cơ bản', 'Váy Cưới', '≈ 5.000.000đ', 5000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6Z_oG2HKN5nJ1z3C2pbrlk87LUVWrNSMKjpYR1DM3A7Z632zxLVYzX94&s=10'),
  ('Váy cưới 1', 23, '7e000000-0000-4000-8000-000000000008', 'Lucky Anh & Em Studio', 'lucky-anh-em-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000038', 'Chụp phim trường', 'Váy Cưới', '≈ 6.990.000đ', 6990000, null, null, 'https://tonywedding.vn/wp-content/uploads/2026/08/concept-10225-scaled.jpg'),
  ('Váy cưới 1', 24, '7e000000-0000-4000-8000-000000000008', 'Lucky Anh & Em Studio', 'lucky-anh-em-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000039', 'Chụp Hồ Cốc/Vũng Tàu', 'Váy Cưới', '≈ 11.990.000đ', 11990000, null, null, 'https://greenstudiowedding.com/wp-content/uploads/2025/09/4O0A6487-1.jpeg'),
  ('Váy cưới 1', 25, '7e000000-0000-4000-8000-000000000008', 'Lucky Anh & Em Studio', 'lucky-anh-em-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000040', 'Gói cưới trọn gói', 'Váy Cưới', '≈ 14.900.000đ', 14900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEeyCprvVALmkCM3CKBzlHuZVD6WnoTqNy0tNRz43CfLq4ss7QdS2buxo&s=10'),
  ('Váy cưới 1', 26, '7e000000-0000-4000-8000-000000000009', 'Nicole Bridal Studio', 'nicole-bridal-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000041', 'Váy cưới Crystal', 'Váy Cưới', '3.000.000đ', 3000000, null, null, 'https://quyennguyen.vn/wp-content/uploads/2018/10/vay-cuoi-ngan-co-mu-e1539080816201.jpg'),
  ('Váy cưới 1', 27, '7e000000-0000-4000-8000-000000000009', 'Nicole Bridal Studio', 'nicole-bridal-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000042', 'Pre-wedding 2 váy + 1 vest', 'Váy Cưới', '5.000.000đ', 5000000, null, null, 'https://bizweb.dktcdn.net/100/300/101/products/vay-cuoi-tung-tre-vai-no-tron-trang-kim-sa-bi-vsrd105-gom-0108.jpg?v=1684912049840'),
  ('Váy cưới 1', 28, '7e000000-0000-4000-8000-000000000009', 'Nicole Bridal Studio', 'nicole-bridal-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000043', 'Váy cưới Ruby', 'Váy Cưới', '≈ 8.000.000đ', 8000000, null, null, 'https://jwplanner.vn/wp-content/uploads/2024/10/z4649152483634_fd4f930b9069021c3e2b2d45854e6b32.jpg'),
  ('Váy cưới 1', 29, '7e000000-0000-4000-8000-000000000009', 'Nicole Bridal Studio', 'nicole-bridal-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000044', 'Váy cưới Diamond', 'Váy Cưới', '≈ 12.000.000đ', 12000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFuAjzPDWIBgEIQqZT9tuibNDF460fBe6GTRC75BSAkPcw8E-awCzF-HM&s=10'),
  ('Váy cưới 1', 30, '7e000000-0000-4000-8000-000000000009', 'Nicole Bridal Studio', 'nicole-bridal-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000045', 'Váy Diamond cao cấp', 'Váy Cưới', '15.000.000đ', 15000000, null, null, 'https://linhnga.vn/wp-content/uploads/2022/06/CTH019.jpg'),
  ('Váy cưới 1', 31, '7e000000-0000-4000-8000-000000000010', 'Paris Wedding Studio', 'paris-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000046', 'Couple Shoot cơ bản', 'Váy Cưới', '≈ 4.900.000đ', 4900000, null, null, 'https://bellabridal.vn/public/upload/files/482243548_662551429664914_1318695912858946648_n.jpg'),
  ('Váy cưới 1', 32, '7e000000-0000-4000-8000-000000000010', 'Paris Wedding Studio', 'paris-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000047', 'Album Studio', 'Váy Cưới', '≈ 6.900.000đ', 6900000, null, null, 'https://mimosawedding.vn/wp-content/uploads/2025/05/concept-chup-anh-cuoi-han-quoc-21.jpg'),
  ('Váy cưới 1', 33, '7e000000-0000-4000-8000-000000000010', 'Paris Wedding Studio', 'paris-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000048', 'Chụp phim trường', 'Váy Cưới', '≈ 8.900.000đ', 8900000, null, null, 'https://felywedding.com/wp-content/uploads/2024/08/7.jpg'),
  ('Váy cưới 1', 34, '7e000000-0000-4000-8000-000000000010', 'Paris Wedding Studio', 'paris-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000049', 'Pre-wedding ngoại cảnh', 'Váy Cưới', '≈ 12.900.000đ', 12900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRw34cH3EnTh6_ZpHp1REAEiNGWx8X49VDNWcrGgFGySlrBf-h9QF2f_dK&s=10'),
  ('Váy cưới 1', 35, '7e000000-0000-4000-8000-000000000010', 'Paris Wedding Studio', 'paris-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000050', 'Gói cưới trọn gói', 'Váy Cưới', '≈ 16.900.000đ', 16900000, null, null, 'https://mimosawedding.vn/wp-content/uploads/2025/04/chup-anh-vay-cuoi-22.jpg'),
  ('Váy cưới 1', 36, '7e000000-0000-4000-8000-000000000011', 'Diamond Wedding', 'diamond-wedding', 'Váy Cưới', '7e100000-0000-4000-8000-000000000051', 'Studio Mini Package', 'Váy Cưới', '≈ 4.500.000đ', 4500000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8SXiODG-eywNeKL0Y7d-OQcFbaJSP8fxDJqlCadvv4VD4AyM2IS0lO_Q&s=10'),
  ('Váy cưới 1', 37, '7e000000-0000-4000-8000-000000000011', 'Diamond Wedding', 'diamond-wedding', 'Váy Cưới', '7e100000-0000-4000-8000-000000000052', 'Album cưới cơ bản', 'Váy Cưới', '≈ 6.500.000đ', 6500000, null, null, 'https://septemberstudios.vn/images/pkg/ncsg/hero.jpg'),
  ('Váy cưới 1', 38, '7e000000-0000-4000-8000-000000000011', 'Diamond Wedding', 'diamond-wedding', 'Váy Cưới', '7e100000-0000-4000-8000-000000000053', 'Phim trường Wedding', 'Váy Cưới', '≈ 8.500.000đ', 8500000, null, null, 'https://greenstudiowedding.com/wp-content/uploads/2025/09/901A7554.jpeg'),
  ('Váy cưới 1', 39, '7e000000-0000-4000-8000-000000000011', 'Diamond Wedding', 'diamond-wedding', 'Váy Cưới', '7e100000-0000-4000-8000-000000000054', 'Pre-wedding ngoại cảnh', 'Váy Cưới', '≈ 12.000.000đ', 12000000, null, null, 'https://nicolebridal.vn/uploads/content/cho-thue_-va_y-cu_o_i-chu_p-a_nh-cu_o_i-hi_nh-1_1784194879_d4482b733db30a2a.jpeg'),
  ('Váy cưới 1', 40, '7e000000-0000-4000-8000-000000000011', 'Diamond Wedding', 'diamond-wedding', 'Váy Cưới', '7e100000-0000-4000-8000-000000000055', 'Diamond Full Wedding Package', 'Váy Cưới', '≈ 16.000.000đ', 16000000, null, null, 'https://2hstudio.vn/wp-content/uploads/2025/09/thiet-ke-va-len-ban-phac-thao-cho-vay-cuoi.jpg'),
  ('Váy cưới 1', 41, '7e000000-0000-4000-8000-000000000012', 'Love Story Studio', 'love-story-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000056', 'Couple Story', 'Váy Cưới', '≈ 4.900.000đ', 4900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2RGdZ4-fN8iq1iUtjgGC3R-Af7_121g_lT0wb2JEasqnPAfqUyLtP6cfw&s=10'),
  ('Váy cưới 1', 42, '7e000000-0000-4000-8000-000000000012', 'Love Story Studio', 'love-story-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000057', 'Studio Wedding', 'Váy Cưới', '≈ 6.900.000đ', 6900000, null, null, 'https://greenstudiowedding.com/wp-content/uploads/2025/09/FZ6A8143-1.jpeg'),
  ('Váy cưới 1', 43, '7e000000-0000-4000-8000-000000000012', 'Love Story Studio', 'love-story-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000058', 'Wedding Album', 'Váy Cưới', '≈ 8.900.000đ', 8900000, null, null, 'https://2hstudio.vn/wp-content/uploads/2025/04/chup-anh-cuoi-mang-dam-chat-chau-au3.jpg'),
  ('Váy cưới 1', 44, '7e000000-0000-4000-8000-000000000012', 'Love Story Studio', 'love-story-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000059', 'Outdoor Love Story', 'Váy Cưới', '≈ 12.900.000đ', 12900000, null, null, 'https://studio1nha.vn/upload/DINH5953.jpg'),
  ('Váy cưới 1', 45, '7e000000-0000-4000-8000-000000000012', 'Love Story Studio', 'love-story-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000060', 'Premium Storytelling Package', 'Váy Cưới', '≈ 18.900.000đ', 18900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLV4vHHgemDgWFb0ctQAT-dam6ADAHRC26C-qf9Z7JOY-v3y_gtyehD9k&s=10'),
  ('Váy cưới 1', 46, '7e000000-0000-4000-8000-000000000013', 'TYMIE Bridal', 'tymie-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000061', 'Makeup cô dâu', 'Váy Cưới', '≈ 2.500.000đ', 2500000, null, null, 'https://anhvienmimosa.com.vn/wp-content/uploads/2025/10/chup-anh-vay-cuoi-4.jpg'),
  ('Váy cưới 1', 47, '7e000000-0000-4000-8000-000000000013', 'TYMIE Bridal', 'tymie-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000062', 'Thuê váy cưới', 'Váy Cưới', '≈ 4.500.000đ', 4500000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx13BIntHvfg47iVIojy4MjATnv-ECs4oyQ7Wy3eCR5iz6UXGZ7Y4Hpqw&s=10'),
  ('Váy cưới 1', 48, '7e000000-0000-4000-8000-000000000013', 'TYMIE Bridal', 'tymie-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000063', 'Chụp ảnh studio', 'Váy Cưới', '≈ 6.900.000đ', 6900000, null, null, 'https://2hstudio.vn/wp-content/uploads/2025/07/JIN_0639.jpg'),
  ('Váy cưới 1', 49, '7e000000-0000-4000-8000-000000000013', 'TYMIE Bridal', 'tymie-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000064', 'Pre-wedding Package', 'Váy Cưới', '≈ 9.900.000đ', 9900000, null, null, 'https://phindumpwedding.vn/wp-content/uploads/2025/03/Khong-gian-studio-hien-dai-da-dang-concept-1.jpg'),
  ('Váy cưới 1', 50, '7e000000-0000-4000-8000-000000000013', 'TYMIE Bridal', 'tymie-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000065', 'Premium Bridal Package', 'Váy Cưới', '≈ 15.900.000đ', 15900000, null, null, 'https://noahwedding.com/wp-content/uploads/2024/05/noah-wedding-concept-Ballad-of-Love-16.jpg'),
  ('Váy cưới 1', 51, '7e000000-0000-4000-8000-000000000001', 'Aloha Studio', 'aloha-studio', 'Studio', '7e100000-0000-4000-8000-000000000066', 'Gói Studio', 'Váy Cưới', '6.990.000đ', 6990000, null, null, 'https://demxanh.com/media/news/2810_studio-thai-binh-2.jpg'),
  ('Váy cưới 1', 52, '7e000000-0000-4000-8000-000000000001', 'Aloha Studio', 'aloha-studio', 'Studio', '7e100000-0000-4000-8000-000000000067', 'Gói Phim Trường', 'Váy Cưới', '7.990.000đ', 7990000, null, null, 'https://daknong.1cdn.vn/2025/07/25/1(1).jpg'),
  ('Váy cưới 1', 53, '7e000000-0000-4000-8000-000000000001', 'Aloha Studio', 'aloha-studio', 'Studio', '7e100000-0000-4000-8000-000000000068', 'Ngoại cảnh Sài Gòn', 'Váy Cưới', '7.990.000đ', 7990000, null, null, 'https://soheewedding.com/wp-content/uploads/2026/03/631356312_122266646750254080_2983622310610842388_n-1.jpg'),
  ('Váy cưới 1', 54, '7e000000-0000-4000-8000-000000000001', 'Aloha Studio', 'aloha-studio', 'Studio', '7e100000-0000-4000-8000-000000000069', 'Biển Vũng Tàu', 'Váy Cưới', '16.900.000đ', 16900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZsU_lWkD-c7l44Pu1Nbqogna7c-K3lnwQ6fu4wXtMmSg_xHEvzgPpI4s&s=10'),
  ('Váy cưới 1', 55, '7e000000-0000-4000-8000-000000000001', 'Aloha Studio', 'aloha-studio', 'Studio', '7e100000-0000-4000-8000-000000000070', 'Wedding Trip Đà Lạt', 'Váy Cưới', '20.900.000đ', 20900000, null, null, 'https://camile.vn/wp-content/uploads/2025/05/ATN04199-scaled.webp'),
  ('Váy cưới 1', 56, '7e000000-0000-4000-8000-000000000014', 'Uni Bridal', 'uni-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000071', 'Trendy Collection', 'Váy Cưới', '18–25 triệu', 18000000, 25000000, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVDir5lhYG50jbda90KYC4kIqDJK4Nc4t4M3II9lvg4g&s=10'),
  ('Váy cưới 1', 57, '7e000000-0000-4000-8000-000000000014', 'Uni Bridal', 'uni-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000072', 'Elegant Collection', 'Váy Cưới', '26–49 triệu', 26000000, 49000000, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVDNmI_I8L8ahpQbaL7cMIDX70SURnD11TdI_oh-4i7A&s=10'),
  ('Váy cưới 1', 58, '7e000000-0000-4000-8000-000000000014', 'Uni Bridal', 'uni-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000073', 'Luxury Collection', 'Váy Cưới', '50–100 triệu', 50000000, 100000000, null, 'https://unibridal.vn/wp-content/uploads/2024/11/PRA_24-1.jpg'),
  ('Váy cưới 1', 59, '7e000000-0000-4000-8000-000000000014', 'Uni Bridal', 'uni-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000074', 'Limited Collection', 'Váy Cưới', 'Từ 100 triệu', 100000000, null, null, 'https://alohastudio.vn/wp-content/uploads/2020/10/vay-cuoi-phi-tron-1.jpg'),
  ('Váy cưới 1', 60, '7e000000-0000-4000-8000-000000000014', 'Uni Bridal', 'uni-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000075', 'Couture Collection', 'Váy Cưới', 'Từ 350 triệu', 350000000, null, null, 'https://bizweb.dktcdn.net/100/368/426/products/vay-cuoi-voan-nhe-nhang-jpeg-75728eb5-b4bd-498b-8898-2c8b4397e25d.jpg?v=1690266582833'),
  ('Váy cưới 1', 61, '7e000000-0000-4000-8000-000000000015', 'Kim Tuyền Bridal', 'kim-tuyen-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000076', 'Makeup cô dâu', 'Váy Cưới', '≈ 2.500.000đ', 2500000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0tYKIV0dyi7cjC1o8Cy0RVgkc8dQ_iF1ySu2Uq87x_VCnYznDiGLLUjqh&s=10'),
  ('Váy cưới 1', 62, '7e000000-0000-4000-8000-000000000015', 'Kim Tuyền Bridal', 'kim-tuyen-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000077', 'Thuê váy cưới cơ bản', 'Váy Cưới', '≈ 3.500.000đ', 3500000, null, null, 'https://tonywedding.vn/wp-content/uploads/2024/06/CRIS0506-scaled.jpg'),
  ('Váy cưới 1', 63, '7e000000-0000-4000-8000-000000000015', 'Kim Tuyền Bridal', 'kim-tuyen-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000078', 'Váy cưới thiết kế', 'Váy Cưới', '≈ 5.500.000đ', 5500000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0KZuBPWrI8PdfTIK5gseS6aim2BsWbyBXpm_VvJSeadhuNe2fNM7Y89bh&s=10'),
  ('Váy cưới 1', 64, '7e000000-0000-4000-8000-000000000015', 'Kim Tuyền Bridal', 'kim-tuyen-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000079', 'Album cưới studio', 'Váy Cưới', '≈ 8.900.000đ', 8900000, null, null, 'https://alohastudio.vn/wp-content/uploads/2020/10/vay-cuoi-phi-tron-cong-chua.jpg'),
  ('Váy cưới 1', 65, '7e000000-0000-4000-8000-000000000015', 'Kim Tuyền Bridal', 'kim-tuyen-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000080', 'Gói Bridal cao cấp', 'Váy Cưới', '≈ 15.000.000đ', 15000000, null, null, 'https://tonywedding.vn/wp-content/uploads/2026/06/NG300407-scaled.jpg'),
  ('Váy cưới 1', 66, '7e000000-0000-4000-8000-000000000016', 'Lucky Anh & Em Premium', 'lucky-anh-em-premium', 'Váy Cưới', '7e100000-0000-4000-8000-000000000081', 'Album Studio', 'Váy Cưới', '≈ 5.000.000đ', 5000000, null, null, 'https://wjardin.com/images/2025/06/studio-chup-anh-o-hai-phong-10.jpg'),
  ('Váy cưới 1', 67, '7e000000-0000-4000-8000-000000000016', 'Lucky Anh & Em Premium', 'lucky-anh-em-premium', 'Váy Cưới', '7e100000-0000-4000-8000-000000000082', 'Phim trường cơ bản', 'Váy Cưới', '≈ 6.990.000đ', 6990000, null, null, 'https://demxanh.com/media/news/2511_studio-binh-duong-5.jpg'),
  ('Váy cưới 1', 68, '7e000000-0000-4000-8000-000000000016', 'Lucky Anh & Em Premium', 'lucky-anh-em-premium', 'Váy Cưới', '7e100000-0000-4000-8000-000000000083', 'Phim trường Premium', 'Váy Cưới', '≈ 9.000.000đ', 9000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo9Oud9Neo3M6Nvj8Hq0LIqgOccuCMSqonsAT68vxDgVwW--zB8rZnUM65&s=10'),
  ('Váy cưới 1', 69, '7e000000-0000-4000-8000-000000000016', 'Lucky Anh & Em Premium', 'lucky-anh-em-premium', 'Váy Cưới', '7e100000-0000-4000-8000-000000000084', 'Pre-wedding ngoại cảnh', 'Váy Cưới', '≈ 11.990.000đ', 11990000, null, null, 'https://thiepxinh.net/public/upload//images/mjustudio.jpg'),
  ('Váy cưới 1', 70, '7e000000-0000-4000-8000-000000000016', 'Lucky Anh & Em Premium', 'lucky-anh-em-premium', 'Váy Cưới', '7e100000-0000-4000-8000-000000000085', 'Full Wedding Package', 'Váy Cưới', '≈ 14.900.000đ', 14900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR52NC9zrQKfEyt5aLic8ZzlBGW-1xdnc5ZqdBQi5lszS23aSRqjZn3WUbO&s=10'),
  ('Váy cưới 1', 71, '7e000000-0000-4000-8000-000000000017', 'HongKong Wedding Studio', 'hongkong-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000086', 'Studio Basic', 'Váy Cưới', '≈ 4.900.000đ', 4900000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/11/chup-anh-cuoi-cho-co-dau-chu-re-ngoc-hung.jpg'),
  ('Váy cưới 1', 72, '7e000000-0000-4000-8000-000000000017', 'HongKong Wedding Studio', 'hongkong-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000087', 'Album Wedding', 'Váy Cưới', '≈ 6.900.000đ', 6900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs__36Gzuw6P1NOUf-OzGk4X0revMMH54FRNt2F-qeY5dJenoD8bn3Di4&s=10'),
  ('Váy cưới 1', 73, '7e000000-0000-4000-8000-000000000017', 'HongKong Wedding Studio', 'hongkong-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000088', 'Korean Concept', 'Váy Cưới', '≈ 8.900.000đ', 8900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz9-J4P26QMytlGWNyyPmZnyjCLcTR9ylw8Ikc3_r3MgAbUvpSkMl0_vO5&s=10'),
  ('Váy cưới 1', 74, '7e000000-0000-4000-8000-000000000017', 'HongKong Wedding Studio', 'hongkong-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000089', 'Phim trường Premium', 'Váy Cưới', '≈ 12.900.000đ', 12900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFCWjtlYOHtO3UHSYP_Wv-9XPzqolZagt_fvUd_XJs4DhpMnczZNefFbo&s=10'),
  ('Váy cưới 1', 75, '7e000000-0000-4000-8000-000000000017', 'HongKong Wedding Studio', 'hongkong-wedding-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000090', 'Luxury Wedding Package', 'Váy Cưới', '≈ 17.900.000đ', 17900000, null, null, 'https://tonywedding.vn/wp-content/uploads/2026/07/TAI_7019-scaled.jpg'),
  ('Váy cưới 1', 76, '7e000000-0000-4000-8000-000000000018', 'Mon Amie Wedding', 'mon-amie-wedding', 'Váy Cưới', '7e100000-0000-4000-8000-000000000091', 'Sơ mi nam', 'Váy Cưới', '≈ 450.000đ', 450000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9MHvCxgdBImCafk3WiVxsVvDCwFL-UPhqtHxGA9GnLfJ-Wpfhj4mRysh0&s=10'),
  ('Váy cưới 1', 77, '7e000000-0000-4000-8000-000000000018', 'Mon Amie Wedding', 'mon-amie-wedding', 'Váy Cưới', '7e100000-0000-4000-8000-000000000092', 'Thuê vest cưới', 'Váy Cưới', '≈ 1.500.000đ', 1500000, null, null, 'https://pos.nvncdn.com/a36e05-151378/ps/20230912_xkO9XT3q7j.jpeg?v=1694494037'),
  ('Váy cưới 1', 78, '7e000000-0000-4000-8000-000000000018', 'Mon Amie Wedding', 'mon-amie-wedding', 'Váy Cưới', '7e100000-0000-4000-8000-000000000093', 'Vest may cơ bản', 'Váy Cưới', '≈ 3.800.000đ', 3800000, null, null, 'https://vulcano.vn/media/catalog/product/cache/19988d7e24050500108a003dbb06eb56/1/_/1_4.png'),
  ('Váy cưới 1', 79, '7e000000-0000-4000-8000-000000000018', 'Mon Amie Wedding', 'mon-amie-wedding', 'Váy Cưới', '7e100000-0000-4000-8000-000000000094', 'Vest Premium', 'Váy Cưới', '≈ 8.500.000đ', 8500000, null, null, 'https://lapier.vn/wp-content/uploads/2023/03/web-461-scaled.jpg'),
  ('Váy cưới 1', 80, '7e000000-0000-4000-8000-000000000018', 'Mon Amie Wedding', 'mon-amie-wedding', 'Váy Cưới', '7e100000-0000-4000-8000-000000000095', 'Vest cao cấp', 'Váy Cưới', '≈ 17.000.000đ', 17000000, null, null, 'https://lapier.vn/wp-content/uploads/2023/03/web-461-scaled.jpg'),
  ('Váy cưới 1', 81, '7e000000-0000-4000-8000-000000000019', 'Bella Bridal', 'bella-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000096', 'Classic Collection', 'Váy Cưới', '4.900.000đ', 4900000, null, null, 'https://camile.vn/wp-content/uploads/2022/10/Bst-cuoi-doi-ban-than-camile-21.webp'),
  ('Váy cưới 1', 82, '7e000000-0000-4000-8000-000000000019', 'Bella Bridal', 'bella-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000097', 'Trendy Collection', 'Váy Cưới', '6.900.000đ', 6900000, null, null, 'https://alohastudio.vn/wp-content/uploads/2020/10/v%C3%A1y-c%C6%B0%E1%BB%9Bi-m%C3%A0u-%C4%91%E1%BB%8F-1-683x1024.jpg'),
  ('Váy cưới 1', 83, '7e000000-0000-4000-8000-000000000019', 'Bella Bridal', 'bella-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000098', 'Elegant Collection', 'Váy Cưới', '9.900.000–15.900.000đ', 9900000, 15900000, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvKqgSatfaZxN2XSmOieJlA5b-RIG0wxqmuA_zipSb4FidKpTSlPOGu1Y&s=10'),
  ('Váy cưới 1', 84, '7e000000-0000-4000-8000-000000000019', 'Bella Bridal', 'bella-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000099', 'Luxury Collection', 'Váy Cưới', '17.900.000–26.900.000đ', 17900000, 26900000, null, 'https://tonywedding.vn/wp-content/uploads/2025/12/1b-1-scaled.jpg'),
  ('Váy cưới 1', 85, '7e000000-0000-4000-8000-000000000019', 'Bella Bridal', 'bella-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000100', 'Limited Collection', 'Váy Cưới', '26.900.000–100.000.000đ', 26900000, 100000000, null, 'https://bizweb.dktcdn.net/100/300/101/products/vay-cuoi-kim-tuyen-cup-trang-tung-gan-hoa-beo-choang-vsrd268.jpg?v=1719315755870'),
  ('Váy cưới 1', 86, '7e000000-0000-4000-8000-000000000020', 'BIAN Bridal', 'bian-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000101', 'Váy cưới cơ bản', 'Váy Cưới', '≈ 3.000.000đ', 3000000, null, null, 'https://camile.vn/wp-content/uploads/2024/12/%F0%9D%90%8B%F0%9D%90%A8%F0%9D%90%A8%F0%9D%90%A4-%F0%9D%9F%8F%F0%9D%9F%8E-%F0%9D%90%A8%F0%9D%90%9F-%F0%9D%90%82%F0%9D%90%9A%F0%9D%90%AD%F0%9D%90%A1%F0%9D%90%9E%F0%9D%90%AB%F0%9D%90%A2%F0%9D%90%A7%F0%9D%90%9E-%F0%9D%90%82%F0%9D%90%A8%F0%9D%90%A5%F0%9D%90%A5%F0%9D%90%9E%F0%9D%90%9C%F0%9D%90%AD%F0%9D%90%A2%F0%9D%90%A8%F0%9D%90%A72.webp'),
  ('Váy cưới 1', 87, '7e000000-0000-4000-8000-000000000020', 'BIAN Bridal', 'bian-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000102', 'Váy cưới dáng A', 'Váy Cưới', '≈ 4.000.000đ', 4000000, null, null, 'https://felywedding.com/wp-content/uploads/2021/11/vay-cuoi-duoi-ca-sang-trong-4.jpg'),
  ('Váy cưới 1', 88, '7e000000-0000-4000-8000-000000000020', 'BIAN Bridal', 'bian-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000103', 'Váy cưới Minimalist', 'Váy Cưới', '≈ 5.000.000đ', 5000000, null, null, 'https://bizweb.dktcdn.net/100/300/101/products/3-5ca54a15-6cf0-4a18-a467-286c8a9f48fd.jpg?v=1619001543817'),
  ('Váy cưới 1', 89, '7e000000-0000-4000-8000-000000000020', 'BIAN Bridal', 'bian-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000104', 'Váy cưới đính kết', 'Váy Cưới', '≈ 9.000.000đ', 9000000, null, null, 'https://tramhuynhwedding.com/wp-content/uploads/2024/06/vay-cuoi-cong-chua-dep.jpg'),
  ('Váy cưới 1', 90, '7e000000-0000-4000-8000-000000000020', 'BIAN Bridal', 'bian-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000105', 'Váy cưới Premium', 'Váy Cưới', '≈ 15.000.000đ', 15000000, null, null, 'https://anhvienmimosa.com.vn/wp-content/uploads/2024/05/vay-cuoi-dep-8.jpg'),
  ('Váy cưới 1', 91, '7e000000-0000-4000-8000-000000000021', 'Dâu Bridal', 'dau-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000106', 'Váy cưới cơ bản', 'Váy Cưới', '≈ 3.500.000đ', 3500000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5PCEdDB9gnH0QV1S7ivbfWRT3r65tn0Id6ARUHS6itkDFjh5T1Pf9sQ-M&s=10'),
  ('Váy cưới 1', 92, '7e000000-0000-4000-8000-000000000021', 'Dâu Bridal', 'dau-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000107', 'Váy đi bàn', 'Váy Cưới', '≈ 5.000.000đ', 5000000, null, null, 'https://wjardin.com/images/2025/08/mau-ao-cuoi-don-gian-sang-trong-4.jpg'),
  ('Váy cưới 1', 93, '7e000000-0000-4000-8000-000000000021', 'Dâu Bridal', 'dau-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000108', 'Váy làm lễ', 'Váy Cưới', '≈ 7.500.000đ', 7500000, null, null, 'https://bizweb.dktcdn.net/100/456/597/products/watermarked-lvc039a-1570503150-jpeg.jpg?v=1661865024997'),
  ('Váy cưới 1', 94, '7e000000-0000-4000-8000-000000000021', 'Dâu Bridal', 'dau-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000109', 'Váy thiết kế', 'Váy Cưới', '≈ 10.000.000đ', 10000000, null, null, 'https://lamia.com.vn/storage/anh-seo/tong-hop-top-nhung-mau-vay-cuoi-dep-nhat-nam-2022-danh-cho-co-dau.png'),
  ('Váy cưới 1', 95, '7e000000-0000-4000-8000-000000000021', 'Dâu Bridal', 'dau-bridal', 'Váy Cưới', '7e100000-0000-4000-8000-000000000110', 'Premium Bridal Package', 'Váy Cưới', '≈ 15.000.000đ', 15000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxrMkWUDBTiwvHDWPHPTJdW36CpEBz-5JiebGm5erIrhUykSD0KuIsd5ac&s=10'),
  ('Váy cưới 1', 96, '7e000000-0000-4000-8000-000000000022', 'Ngọc Huy Pro Studio', 'ngoc-huy-pro-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000111', 'Studio Basic', 'Váy Cưới', '≈ 5.900.000đ', 5900000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/10/chup-anh-cuoi-cho-ngoc-huyen-cong-dung.jpg'),
  ('Váy cưới 1', 97, '7e000000-0000-4000-8000-000000000022', 'Ngọc Huy Pro Studio', 'ngoc-huy-pro-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000112', 'Album Wedding', 'Váy Cưới', '≈ 7.900.000đ', 7900000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/10/album-ngoc-huyen-cong-dung-2.jpg'),
  ('Váy cưới 1', 98, '7e000000-0000-4000-8000-000000000022', 'Ngọc Huy Pro Studio', 'ngoc-huy-pro-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000113', 'Chụp phim trường', 'Váy Cưới', '≈ 9.900.000đ', 9900000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/11/album-anh-cuoi-co-dau-chu-re-ngoc-hung-2.jpg'),
  ('Váy cưới 1', 99, '7e000000-0000-4000-8000-000000000022', 'Ngọc Huy Pro Studio', 'ngoc-huy-pro-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000114', 'Pre-wedding ngoại cảnh', 'Váy Cưới', '≈ 13.900.000đ', 13900000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/11/chup-anh-cuoi-cho-co-dau-chu-re-ngan-hieu.jpg'),
  ('Váy cưới 1', 100, '7e000000-0000-4000-8000-000000000022', 'Ngọc Huy Pro Studio', 'ngoc-huy-pro-studio', 'Váy Cưới', '7e100000-0000-4000-8000-000000000115', 'Premium Wedding Package', 'Váy Cưới', '≈ 18.000.000đ', 18000000, null, null, 'https://alohastudio.vn/wp-content/uploads/2024/11/anh-cuoi-co-dau-chu-re-ngoc-hung.jpg'),
  ('Vest 1', 1, '7e000000-0000-4000-8000-000000000023', 'Mon Amie Veston', 'mon-amie-veston', 'Vest', '7e100000-0000-4000-8000-000000000116', 'Bộ Vest Nam Tím B51.002', 'Vest', '5.200.000đ', 5200000, null, null, 'https://pos.nvncdn.com/a36e05-151378/ps/20251128_9wDOFhUpBJ.jpeg?v=1764301014'),
  ('Vest 1', 2, '7e000000-0000-4000-8000-000000000023', 'Mon Amie Veston', 'mon-amie-veston', 'Vest', '7e100000-0000-4000-8000-000000000117', 'Bộ Vest Nam Nâu Đậm C52.026', 'Vest', '6.000.000đ', 6000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDKfVN5qqlAHEhACeFJEyjF6g4SO1cJq1VG5LCjv0HBBtsxNa9pEwrSoM&s=10'),
  ('Vest 1', 3, '7e000000-0000-4000-8000-000000000023', 'Mon Amie Veston', 'mon-amie-veston', 'Vest', '7e100000-0000-4000-8000-000000000118', 'Bộ Vest Nam Đỏ Rượu F74.016', 'Vest', '6.800.000đ', 6800000, null, null, 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mr45fx2yam1075'),
  ('Vest 1', 4, '7e000000-0000-4000-8000-000000000023', 'Mon Amie Veston', 'mon-amie-veston', 'Vest', '7e100000-0000-4000-8000-000000000119', 'Bộ Vest Cao Cấp Xám Tro G84.019', 'Vest', '9.300.000đ', 9300000, null, null, 'https://felywedding.com/wp-content/uploads/2022/04/74-2.jpg'),
  ('Vest 1', 5, '7e000000-0000-4000-8000-000000000023', 'Mon Amie Veston', 'mon-amie-veston', 'Vest', '7e100000-0000-4000-8000-000000000120', 'Bộ Tuxedo Cao Cấp Xanh Vân R617-1', 'Vest', '17.000.000đ', 17000000, null, null, 'https://file.hstatic.net/200000859489/file/9_3d959943d9df422b8723fa62e6bf77f5_grande.jpg'),
  ('Vest 1', 6, '7e000000-0000-4000-8000-000000000024', 'Veston Ken', 'veston-ken', 'Vest', '7e100000-0000-4000-8000-000000000121', 'Ken Xanh 01', 'Vest', '2.350.000đ', 2350000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmJYfLGD9wE2sRAn45XfAMlWjej60bqghv1BOQHB4NYTxYOmipxd61E7Q&s=10'),
  ('Vest 1', 7, '7e000000-0000-4000-8000-000000000024', 'Veston Ken', 'veston-ken', 'Vest', '7e100000-0000-4000-8000-000000000122', 'Ken Xanh 02', 'Vest', '2.350.000đ', 2350000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7WKCJy9EOBzzykVSmfkyo1VLQwMItL2eyMIIpLEzQDIibY1MfsF03vwZ4&s=10'),
  ('Vest 1', 8, '7e000000-0000-4000-8000-000000000024', 'Veston Ken', 'veston-ken', 'Vest', '7e100000-0000-4000-8000-000000000123', 'Caro Đen Mỏng', 'Vest', '2.350.000đ', 2350000, null, null, 'https://novelty.com.vn/public/uploads/files/b.png'),
  ('Vest 1', 9, '7e000000-0000-4000-8000-000000000024', 'Veston Ken', 'veston-ken', 'Vest', '7e100000-0000-4000-8000-000000000124', 'Vest Trắng 2 Nút', 'Vest', '2.350.000đ', 2350000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgH4heJlB8akS2Vrfk1MZhU8t35iWgZfTiik7lXsTTwaGmbYQUfXfbdSI1&s=10'),
  ('Vest 1', 10, '7e000000-0000-4000-8000-000000000024', 'Veston Ken', 'veston-ken', 'Vest', '7e100000-0000-4000-8000-000000000125', 'Nhung Đỏ Cổ Sam', 'Vest', '2.350.000đ', 2350000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIDjb89cW6WBH90oO-151czYHxat4Jg7BUfycxVihA-w&s'),
  ('Vest 1', 11, '7e000000-0000-4000-8000-000000000025', 'Saint Stefano Vest Nam Cưới', 'saint-stefano-vest-nam-cuoi', 'Vest', '7e100000-0000-4000-8000-000000000126', 'Suit Navy Classic', 'Vest', '≈ 2.600.000đ', 2600000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQooDUta9YJ96Y63ANd-R119q-pIyTBmutDrm6CFS1qqg&s'),
  ('Vest 1', 12, '7e000000-0000-4000-8000-000000000025', 'Saint Stefano Vest Nam Cưới', 'saint-stefano-vest-nam-cuoi', 'Vest', '7e100000-0000-4000-8000-000000000127', 'Suit Đen Slim-fit', 'Vest', '≈ 2.800.000đ', 2800000, null, null, 'https://bizweb.dktcdn.net/100/438/408/files/shop-ao-vest-nam-yodyvn.jpg?v=1671610357532'),
  ('Vest 1', 13, '7e000000-0000-4000-8000-000000000025', 'Saint Stefano Vest Nam Cưới', 'saint-stefano-vest-nam-cuoi', 'Vest', '7e100000-0000-4000-8000-000000000128', 'Suit Xám Công Sở', 'Vest', '≈ 3.000.000đ', 3000000, null, null, 'https://m.media-amazon.com/images/I/71I47OKwS0L._AC_UY1000_.jpg'),
  ('Vest 1', 14, '7e000000-0000-4000-8000-000000000025', 'Saint Stefano Vest Nam Cưới', 'saint-stefano-vest-nam-cuoi', 'Vest', '7e100000-0000-4000-8000-000000000129', 'Suit Double-breasted', 'Vest', '≈ 3.290.000đ', 3290000, null, null, 'https://owen.cdn.vccloud.vn/media/catalog/product/cache/d52d7e242fac6dae82288d9a793c0676/v/e/ves231494._40.jpg'),
  ('Vest 1', 15, '7e000000-0000-4000-8000-000000000025', 'Saint Stefano Vest Nam Cưới', 'saint-stefano-vest-nam-cuoi', 'Vest', '7e100000-0000-4000-8000-000000000130', 'Groom Suit Premium', 'Vest', '≈ 3.500.000đ', 3500000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5qvsDeOs-4zck1nDtStm3QUJx6SNLgYhoMDNU2ke_HebOQ4-h_rHTB9fM&s=10'),
  ('Vest 1', 16, '7e000000-0000-4000-8000-000000000026', 'The Suits House', 'the-suits-house', 'Vest', '7e100000-0000-4000-8000-000000000131', 'Bộ Suit Ghi Sáng 6 Khuy 3 Túi', 'Vest', '4.800.000đ', 4800000, null, null, 'https://lapier.vn/wp-content/uploads/2023/04/web-503-scaled.jpg'),
  ('Vest 1', 17, '7e000000-0000-4000-8000-000000000026', 'The Suits House', 'the-suits-house', 'Vest', '7e100000-0000-4000-8000-000000000132', 'Navy 2-Piece Suit', 'Vest', '11.900.000đ', 11900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJL9tLUztlqRuj8luElq9ij95_h24U7YzX6pjQNcja81xw_a0wga6IoHWp&s=10'),
  ('Vest 1', 18, '7e000000-0000-4000-8000-000000000026', 'The Suits House', 'the-suits-house', 'Vest', '7e100000-0000-4000-8000-000000000133', 'La Mer Noire', 'Vest', '11.900.000đ', 11900000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuP3JhnjRmYXn0paDSU6T13iw9zvbodEj2QmfmuYq0yjk5gQ_3aWBq5FFE&s=10'),
  ('Vest 1', 19, '7e000000-0000-4000-8000-000000000026', 'The Suits House', 'the-suits-house', 'Vest', '7e100000-0000-4000-8000-000000000134', 'Luxury Suit Xanh Ánh Xám 626/5', 'Vest', '13.400.000đ', 13400000, null, null, 'https://4menshop.com/cache/image/300x400/images/thumbs/2024/10/ao-vest-trang-tri-tui-mo-2-coi-form-slimfit-av034_small-18727.jpg'),
  ('Vest 1', 20, '7e000000-0000-4000-8000-000000000026', 'The Suits House', 'the-suits-house', 'Vest', '7e100000-0000-4000-8000-000000000135', 'Zenith Black Bespoke 3-Piece Suit', 'Vest', '16.900.000đ', 16900000, null, null, 'https://dongphucvikor.com/wp-content/uploads/2020/07/vest-nam-VM10501-chuan-form-dang-267x400.jpg'),
  ('Vest 1', 21, '7e000000-0000-4000-8000-000000000005', 'Kim Couture', 'kim-couture', 'Váy Cưới', '7e100000-0000-4000-8000-000000000136', 'Áo Vest Kim VK36', 'Vest', '6.000.000đ', 6000000, null, null, 'https://n7media.coolmate.me/image/January2024/may-ao-vest-nam-3581_448.jpg'),
  ('Vest 1', 22, '7e000000-0000-4000-8000-000000000005', 'Kim Couture', 'kim-couture', 'Váy Cưới', '7e100000-0000-4000-8000-000000000137', 'Áo Vest Kim VK34', 'Vest', '6.000.000đ', 6000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSZy2FuEEZwyZ3bUm8dVebQJwLYJTDL5r1d_nZ-IJZywADuxnTmBbMQtc&s=10'),
  ('Vest 1', 23, '7e000000-0000-4000-8000-000000000005', 'Kim Couture', 'kim-couture', 'Váy Cưới', '7e100000-0000-4000-8000-000000000138', 'Áo Vest Kim VK48', 'Vest', '6.000.000đ', 6000000, null, null, 'https://pos.nvncdn.com/6c3cf7-882/ps/20250423_GI676RjG0N.jpeg?v=1745398085'),
  ('Vest 1', 24, '7e000000-0000-4000-8000-000000000005', 'Kim Couture', 'kim-couture', 'Váy Cưới', '7e100000-0000-4000-8000-000000000139', 'Áo Vest Kim VK66', 'Vest', '6.000.000đ', 6000000, null, null, 'https://pos.nvncdn.com/a36e05-151378/ps/20251006_wuY9LQPlWn.jpeg?v=1759721282'),
  ('Vest 1', 25, '7e000000-0000-4000-8000-000000000005', 'Kim Couture', 'kim-couture', 'Váy Cưới', '7e100000-0000-4000-8000-000000000140', 'Áo Vest Kim VK73', 'Vest', '6.000.000đ', 6000000, null, null, 'https://store.bbcosplay.com/news/2024/05/07/vest-la-gi-cung-tim-hieu-chi-tiet-ve-ao-vest6.jpg'),
  ('Vest 1', 26, '7e000000-0000-4000-8000-000000000027', 'Adam Store Hồ Văn Huê', 'adam-store-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000141', 'Vest Hồng Trơn AVTN16', 'Vest', '3.150.000đ', 3150000, null, null, 'https://umvest.vn/wp-content/uploads/2024/04/ao-vest-xanh-den-1050k-1.jpg'),
  ('Vest 1', 27, '7e000000-0000-4000-8000-000000000027', 'Adam Store Hồ Văn Huê', 'adam-store-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000142', 'Vest Xanh Trơn AVTN17', 'Vest', '3.150.000đ', 3150000, null, null, 'https://4men.com.vn/thumbs/2023/05/ao-vest-tron-linen-form-regular-av040-mau-xanh-bien-34210-p.jpg'),
  ('Vest 1', 28, '7e000000-0000-4000-8000-000000000027', 'Adam Store Hồ Văn Huê', 'adam-store-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000143', 'Vest Đen AV4440', 'Vest', '3.300.000đ', 3300000, null, null, 'https://ixi.vn/wp-content/uploads/2024/09/1-69.png'),
  ('Vest 1', 29, '7e000000-0000-4000-8000-000000000027', 'Adam Store Hồ Văn Huê', 'adam-store-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000144', 'Vest Đen Sọc Kẻ Chìm AV432', 'Vest', '3.300.000đ', 3300000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCoLsZJ4de1qyav562F5bA1QeLLesE1FsyxdOiOdeCzg&s'),
  ('Vest 1', 30, '7e000000-0000-4000-8000-000000000027', 'Adam Store Hồ Văn Huê', 'adam-store-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000145', 'Vest Xanh Trơn 2 Hàng Khuy AV429CQ', 'Vest', '3.600.000đ', 3600000, null, null, 'https://www.chapi.vn/img/product/2018/12/4/ao-vest-da-nam-long-cuu-2-khuy-gull-new.jpg'),
  ('Vest 1', 31, '7e000000-0000-4000-8000-000000000028', 'Nicole Bridal', 'nicole-bridal', 'Vest', '7e100000-0000-4000-8000-000000000146', 'Combo Pre-wedding 2 váy + 1 vest', 'Vest', '5.000.000đ', 5000000, null, null, 'https://umvestnam.com/images/stories/virtuemart/product/vest-nam-mau-xanh-duong-xuoc.jpg'),
  ('Vest 1', 32, '7e000000-0000-4000-8000-000000000028', 'Nicole Bridal', 'nicole-bridal', 'Vest', '7e100000-0000-4000-8000-000000000147', 'Gói chụp ảnh cổng Studio', 'Vest', '6.500.000đ', 6500000, null, null, 'https://cavino.vn/wp-content/uploads/2017/01/zile-xanh.jpg'),
  ('Vest 1', 33, '7e000000-0000-4000-8000-000000000028', 'Nicole Bridal', 'nicole-bridal', 'Vest', '7e100000-0000-4000-8000-000000000148', 'Gói trang phục lễ gia tiên', 'Vest', '7.500.000đ', 7500000, null, null, 'https://n7media.coolmate.me/image/January2024/may-ao-vest-nam-3581_901.jpg'),
  ('Vest 1', 34, '7e000000-0000-4000-8000-000000000028', 'Nicole Bridal', 'nicole-bridal', 'Vest', '7e100000-0000-4000-8000-000000000149', 'Combo trang phục cưới cô dâu – chú rể', 'Vest', '8.500.000đ', 8500000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8a_hwB6PUemAO5z9XVvcpGwA-IlKj2ujEyuWYmP99CMtWjKcMDVApCT0&s=10'),
  ('Vest 1', 35, '7e000000-0000-4000-8000-000000000028', 'Nicole Bridal', 'nicole-bridal', 'Vest', '7e100000-0000-4000-8000-000000000150', 'Gói chụp ảnh cưới 1 địa điểm', 'Vest', '9.500.000đ', 9500000, null, null, 'https://file.hstatic.net/1000360022/file/vest-con-duoc-hieu-la-gile_63e055141d104ecab249542317c29bb9.jpg'),
  ('Vest 1', 36, '7e000000-0000-4000-8000-000000000029', 'The Men Store / Vest Nam Hồ Văn Huê', 'the-men-store-vest-nam-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000151', 'Vest Đen Basic', 'Vest', '≈ 1.490.000đ', 1490000, null, null, 'https://store.bbcosplay.com/news/2024/05/07/vest-la-gi-cung-tim-hieu-chi-tiet-ve-ao-vest1.jpg'),
  ('Vest 1', 37, '7e000000-0000-4000-8000-000000000029', 'The Men Store / Vest Nam Hồ Văn Huê', 'the-men-store-vest-nam-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000152', 'Vest Navy Slim-fit', 'Vest', '≈ 1.790.000đ', 1790000, null, null, 'https://vestondep.vn/upload/product/bo-vest-chu-re-mau-xanh-navy-nhat-Mon-Amie-3312.jpg'),
  ('Vest 1', 38, '7e000000-0000-4000-8000-000000000029', 'The Men Store / Vest Nam Hồ Văn Huê', 'the-men-store-vest-nam-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000153', 'Vest Xám Modern Fit', 'Vest', '≈ 2.190.000đ', 2190000, null, null, 'https://cdn.hstatic.net/products/200000053174/kien_-__nh_thump_website__50__f9041ecd245e416da41f9dd9b77854ca_master.jpg'),
  ('Vest 1', 39, '7e000000-0000-4000-8000-000000000029', 'The Men Store / Vest Nam Hồ Văn Huê', 'the-men-store-vest-nam-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000154', 'Tuxedo Đen Cổ Sam', 'Vest', '≈ 2.690.000đ', 2690000, null, null, 'https://vestdep.net/thumb/540-720/upload/vestdep/san-pham/vest-nam-v2/vd395_v2%20(1).jpg'),
  ('Vest 1', 40, '7e000000-0000-4000-8000-000000000029', 'The Men Store / Vest Nam Hồ Văn Huê', 'the-men-store-vest-nam-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000155', 'Suit 3 Mảnh Premium', 'Vest', '≈ 3.490.000đ', 3490000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHuVgPjDwt0CVaXTLAI_EY-JiEWWKACRM2UbsfCpTVKw&s'),
  ('Vest 1', 41, '7e000000-0000-4000-8000-000000000030', 'Nhà may Vest cưới đẹp Hồ Văn Huê', 'nha-may-vest-cuoi-dep-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000156', 'Vest Cưới Classic', 'Vest', '≈ 4.000.000đ', 4000000, null, null, 'https://pos.nvncdn.com/a36e05-151378/ps/20260204_m0AHF0jKTw.jpeg?v=1770172715'),
  ('Vest 1', 42, '7e000000-0000-4000-8000-000000000030', 'Nhà may Vest cưới đẹp Hồ Văn Huê', 'nha-may-vest-cuoi-dep-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000157', 'Vest Navy May Đo', 'Vest', '≈ 5.000.000đ', 5000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmx8XfKynGlten_As0FmXWhZ68Xjv_Ypdj6LDSKsr-cb5t10ALc4lxGKo&s=10'),
  ('Vest 1', 43, '7e000000-0000-4000-8000-000000000030', 'Nhà may Vest cưới đẹp Hồ Văn Huê', 'nha-may-vest-cuoi-dep-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000158', 'Suit Wool May Đo', 'Vest', '≈ 6.000.000đ', 6000000, null, null, 'https://de-obelly.com/media/cache/data/san-pham/%C3%81o_vest/22289000200_-_AS21010000101__(2)-400x600.jpg'),
  ('Vest 1', 44, '7e000000-0000-4000-8000-000000000030', 'Nhà may Vest cưới đẹp Hồ Văn Huê', 'nha-may-vest-cuoi-dep-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000159', 'Tuxedo Chú Rể Cao Cấp', 'Vest', '≈ 7.500.000đ', 7500000, null, null, 'https://prodapi.hoaigiangshop.com/rm/file/media/public/z7197731525026-f3732ab2b3304f9a5783379f76756274-2025-12-09-20-05-24/z7197731525026-f3732ab2b3304f9a5783379f76756274-2025-12-09-20-05-24_530.webp'),
  ('Vest 1', 45, '7e000000-0000-4000-8000-000000000030', 'Nhà may Vest cưới đẹp Hồ Văn Huê', 'nha-may-vest-cuoi-dep-ho-van-hue', 'Vest', '7e100000-0000-4000-8000-000000000160', 'Suit Vải Nhập Khẩu Premium', 'Vest', '≈ 9.000.000đ', 9000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfuOCH6bKgsPJf54t_X2v_rbxrupFDsYnS4p8OZ0Y-0xvetrgKylYpXnel&s=10'),
  ('Vest 1', 46, '7e000000-0000-4000-8000-000000000031', 'Hoàng Vy Mon Amie', 'hoang-vy-mon-amie', 'Vest', '7e100000-0000-4000-8000-000000000161', 'Tuxedo Xanh Cổ Sam', 'Vest', '4.200.000đ', 4200000, null, null, 'https://umvest.vn/wp-content/uploads/2024/04/ao-trang-den-1050k-3.jpg'),
  ('Vest 1', 47, '7e000000-0000-4000-8000-000000000031', 'Hoàng Vy Mon Amie', 'hoang-vy-mon-amie', 'Vest', '7e100000-0000-4000-8000-000000000162', 'Tuxedo Xanh Đen Cổ Bóng', 'Vest', '4.800.000đ', 4800000, null, null, 'https://prodapi.hoaigiangshop.com/rm/file/media/public/ao-vest-nam-trang-ve-den-bong-1-nut/ao-vest-nam-trang-ve-den-bong-1-nut-1_530.webp'),
  ('Vest 1', 48, '7e000000-0000-4000-8000-000000000031', 'Hoàng Vy Mon Amie', 'hoang-vy-mon-amie', 'Vest', '7e100000-0000-4000-8000-000000000163', 'Tuxedo Đen Cổ Sam', 'Vest', '5.000.000đ', 5000000, null, null, 'https://lystailor.com/wp-content/uploads/vest-6-nut-8.jpg'),
  ('Vest 1', 49, '7e000000-0000-4000-8000-000000000031', 'Hoàng Vy Mon Amie', 'hoang-vy-mon-amie', 'Vest', '7e100000-0000-4000-8000-000000000164', 'Tuxedo Trắng Cổ Sam', 'Vest', '5.400.000đ', 5400000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDARGV0Gr2xBNF8WiBoSFxoLylYSsfBa-6E0pOWDV9PDb4l2At4QPqCEo&s=10'),
  ('Vest 1', 50, '7e000000-0000-4000-8000-000000000031', 'Hoàng Vy Mon Amie', 'hoang-vy-mon-amie', 'Vest', '7e100000-0000-4000-8000-000000000165', 'Tuxedo Đen Trẻ Trung 1 Nút', 'Vest', '5.600.000đ', 5600000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8mGhvCdEuF2rJSvH8PmdTLt4LomalH1rLmbe9jLeqdg&s'),
  ('Thiệp cưới 1', 1, '7e000000-0000-4000-8000-000000000032', 'Thiệp Cưới Cao Cấp Forever', 'thiep-cuoi-cao-cap-forever', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000166', 'Thiệp cưới tối giản', 'Thiệp Cưới', '≈ 7.000đ/thiệp', 7000, null, 'thiệp', 'https://felywedding.com/wp-content/uploads/2025/12/thiep-cuoi-vintage-10.jpg'),
  ('Thiệp cưới 1', 2, '7e000000-0000-4000-8000-000000000032', 'Thiệp Cưới Cao Cấp Forever', 'thiep-cuoi-cao-cap-forever', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000167', 'Thiệp cưới in hoa', 'Thiệp Cưới', '≈ 12.000đ/thiệp', 12000, null, 'thiệp', 'https://thiepxinh.net/public/upload//images/category/X116.jpg'),
  ('Thiệp cưới 1', 3, '7e000000-0000-4000-8000-000000000032', 'Thiệp Cưới Cao Cấp Forever', 'thiep-cuoi-cao-cap-forever', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000168', 'Thiệp cưới ép kim', 'Thiệp Cưới', '≈ 18.000đ/thiệp', 18000, null, 'thiệp', 'https://bizweb.dktcdn.net/thumb/1024x1024/100/416/938/products/thiep-cuoi-1890.jpg?v=1666871659227'),
  ('Thiệp cưới 1', 4, '7e000000-0000-4000-8000-000000000032', 'Thiệp Cưới Cao Cấp Forever', 'thiep-cuoi-cao-cap-forever', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000169', 'Thiệp cưới Passport', 'Thiệp Cưới', '≈ 30.000đ/thiệp', 30000, null, 'thiệp', 'https://bizweb.dktcdn.net/thumb/1024x1024/100/416/938/products/thiep-cuoi-1967.jpg?v=1695981742917'),
  ('Thiệp cưới 1', 5, '7e000000-0000-4000-8000-000000000032', 'Thiệp Cưới Cao Cấp Forever', 'thiep-cuoi-cao-cap-forever', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000170', 'Thiệp cưới Luxury đính hoa / dấu sáp', 'Thiệp Cưới', '≈ 55.000đ/thiệp', 55000, null, 'thiệp', 'https://tonywedding.vn/wp-content/uploads/2025/05/CQS95-scaled.jpg'),
  ('Thiệp cưới 1', 6, '7e000000-0000-4000-8000-000000000033', 'Thiệp Cưới Tila', 'thiep-cuoi-tila', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000171', 'Thiệp cưới Minimal Basic', 'Thiệp Cưới', '≈ 6.000đ/thiệp', 6000, null, 'thiệp', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSILCii475h_LvxP0CIqz13vxB8gxYc4aHRBjPGJLkc9-plBJHQ9CGUTNY&s=10'),
  ('Thiệp cưới 1', 7, '7e000000-0000-4000-8000-000000000033', 'Thiệp Cưới Tila', 'thiep-cuoi-tila', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000172', 'Thiệp cưới Floral', 'Thiệp Cưới', '≈ 9.000đ/thiệp', 9000, null, 'thiệp', 'https://mimosawedding.vn/wp-content/uploads/2022/07/thiep-cuoi-gia-re-2.jpg'),
  ('Thiệp cưới 1', 8, '7e000000-0000-4000-8000-000000000033', 'Thiệp Cưới Tila', 'thiep-cuoi-tila', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000173', 'Thiệp cưới Modern', 'Thiệp Cưới', '≈ 12.000đ/thiệp', 12000, null, 'thiệp', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIgZt3BMk56NXozYf59razYgGGWGQ3LmfJShAYTmg84KUK-00ogGwGFHyE&s=10'),
  ('Thiệp cưới 1', 9, '7e000000-0000-4000-8000-000000000033', 'Thiệp Cưới Tila', 'thiep-cuoi-tila', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000174', 'Thiệp cưới ép kim cá nhân hóa', 'Thiệp Cưới', '≈ 18.000đ/thiệp', 18000, null, 'thiệp', 'https://thesimple.vn/cdn/shop/articles/penci_file_1_20260203_093359.jpg?v=1770111487'),
  ('Thiệp cưới 1', 10, '7e000000-0000-4000-8000-000000000033', 'Thiệp Cưới Tila', 'thiep-cuoi-tila', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000175', 'Thiệp cưới Premium Custom Design', 'Thiệp Cưới', '≈ 30.000đ/thiệp', 30000, null, 'thiệp', 'https://tonywedding.vn/wp-content/uploads/2025/05/CQS77-1-scaled.jpg'),
  ('Thiệp cưới 1', 11, '7e000000-0000-4000-8000-000000000034', 'Siêu Thị Thiệp Cưới Cupi', 'sieu-thi-thiep-cuoi-cupi', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000176', 'Thiệp cưới truyền thống Basic', 'Thiệp Cưới', '≈ 5.000đ/thiệp', 5000, null, 'thiệp', 'https://thiepxinh.net/public/upload//images/category/X102-2.jpg'),
  ('Thiệp cưới 1', 12, '7e000000-0000-4000-8000-000000000034', 'Siêu Thị Thiệp Cưới Cupi', 'sieu-thi-thiep-cuoi-cupi', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000177', 'Thiệp cưới hiện đại', 'Thiệp Cưới', '≈ 7.000đ/thiệp', 7000, null, 'thiệp', 'https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/l%C3%A0m%20thi%E1%BB%87p%20c%C6%B0%E1%BB%9Bi%20online/lam-thiep-cuoi-online-thumb.jpg'),
  ('Thiệp cưới 1', 13, '7e000000-0000-4000-8000-000000000034', 'Siêu Thị Thiệp Cưới Cupi', 'sieu-thi-thiep-cuoi-cupi', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000178', 'Thiệp cưới Floral', 'Thiệp Cưới', '≈ 10.000đ/thiệp', 10000, null, 'thiệp', 'https://peonies.vn/wp-content/uploads/2025/08/z6874740396165_111924dd0a1378b45a3b7f2b2a8baf1f.jpg'),
  ('Thiệp cưới 1', 14, '7e000000-0000-4000-8000-000000000034', 'Siêu Thị Thiệp Cưới Cupi', 'sieu-thi-thiep-cuoi-cupi', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000179', 'Thiệp cưới ép kim', 'Thiệp Cưới', '≈ 15.000đ/thiệp', 15000, null, 'thiệp', 'https://tonywedding.vn/wp-content/uploads/2025/05/CQS99-300x200.jpg'),
  ('Thiệp cưới 1', 15, '7e000000-0000-4000-8000-000000000034', 'Siêu Thị Thiệp Cưới Cupi', 'sieu-thi-thiep-cuoi-cupi', 'Thiệp Cưới', '7e100000-0000-4000-8000-000000000180', 'Thiệp cưới Premium Luxury', 'Thiệp Cưới', '≈ 25.000đ/thiệp', 25000, null, 'thiệp', 'https://quangcaobaophuc.com/upload/news/in-an-thiep-cuoi-dep-1758293070.jpg'),
  ('venue 1', 1, '7e000000-0000-4000-8000-000000000035', 'Diamond Place', 'diamond-place', 'Venue', '7e100000-0000-4000-8000-000000000181', 'Sảnh Sapphire, sức chứa 300–400 khách', 'Venue', 'Theo gói tiệc', null, null, null, 'https://dp1.diamondplace.vn/wp-content/uploads/2024/12/sanh-tiec-ruby-diamond-place.webp'),
  ('venue 1', 2, '7e000000-0000-4000-8000-000000000035', 'Diamond Place', 'diamond-place', 'Venue', '7e100000-0000-4000-8000-000000000182', 'Sảnh Grand Ruby, sức chứa 300–500 khách', 'Venue', 'Theo gói tiệc', null, null, null, 'https://dp1.diamondplace.vn/wp-content/uploads/2023/05/sanh-tiec-cuoi-dep-my-destiny.webp'),
  ('venue 1', 3, '7e000000-0000-4000-8000-000000000035', 'Diamond Place', 'diamond-place', 'Venue', '7e100000-0000-4000-8000-000000000183', 'Menu tiệc cưới trọn gói 7–8 món Á Âu', 'Venue', '4.700.000đ/bàn', 4700000, null, 'bàn', 'https://dp2.diamondplace.vn/wp-content/uploads/2024/05/trang-tri-hoa-tuoi-tiec-cuoi-1024x663.webp'),
  ('venue 1', 4, '7e000000-0000-4000-8000-000000000035', 'Diamond Place', 'diamond-place', 'Venue', '7e100000-0000-4000-8000-000000000184', 'Menu tiệc cưới đặc sắc', 'Venue', '5.950.000–7.150.000đ/bàn', 5950000, 7150000, 'bàn', 'https://dp1.diamondplace.vn/wp-content/uploads/2026/05/1200x6282-01.jpg'),
  ('venue 1', 5, '7e000000-0000-4000-8000-000000000035', 'Diamond Place', 'diamond-place', 'Venue', '7e100000-0000-4000-8000-000000000185', 'Menu tiệc cưới VIP', 'Venue', '7.450.000–12.950.000đ/bàn', 7450000, 12950000, 'bàn', 'https://dp2.diamondplace.vn/wp-content/uploads/2025/03/sanh-tiec-moi-sapphire-1-2.webp'),
  ('venue 1', 6, '7e000000-0000-4000-8000-000000000035', 'Diamond Place', 'diamond-place', 'Venue', '7e100000-0000-4000-8000-000000000186', 'Dịch vụ cưới trọn gói A–Z: lễ tân, điều phối, phục vụ', 'Venue', 'Bao gồm trong gói 4.700.000đ/bàn', null, null, 'bàn', 'https://blissfulbrides.vn/wp-content/uploads/2025/09/diamond-au-co-2.jpg'),
  ('venue 1', 7, '7e000000-0000-4000-8000-000000000035', 'Diamond Place', 'diamond-place', 'Venue', '7e100000-0000-4000-8000-000000000187', 'Bia, nước ngọt và nước suối trong 2 giờ', 'Venue', 'Miễn phí trong gói 4.700.000đ/bàn', null, null, 'bàn', 'https://dp1.diamondplace.vn/wp-content/uploads/2024/12/sanh-tiec-ruby-2.webp'),
  ('Makeup', 1, '7e000000-0000-4000-8000-000000000036', 'Ruby Wedding', 'ruby-wedding', 'Make Up', '7e100000-0000-4000-8000-000000000188', 'Makeup cô dâu ngày cưới (full makeup + tóc + phụ kiện)', 'Make Up', '5.000.000 VNĐ/gói', 5000000, null, 'gói', 'https://felywedding.com/wp-content/uploads/2024/01/2.jpg'),
  ('Makeup', 2, '7e000000-0000-4000-8000-000000000036', 'Ruby Wedding', 'ruby-wedding', 'Make Up', '7e100000-0000-4000-8000-000000000189', 'Makeup test cô dâu trước ngày cưới', 'Make Up', '1.500.000 VNĐ/lần', 1500000, null, 'lần', 'https://knt-prod.s3.vn-hcm-1.vietnix.cloud/wp-content/uploads/2022/01/chuyen-gia-trang-diem-Picsart-AiImageEnhancer.jpg'),
  ('Makeup', 3, '7e000000-0000-4000-8000-000000000036', 'Ruby Wedding', 'ruby-wedding', 'Make Up', '7e100000-0000-4000-8000-000000000190', 'Makeup chụp ảnh cưới', 'Make Up', '3.000.000 VNĐ/buổi', 3000000, null, 'buổi', 'https://omni.vn/wp-content/uploads/2024/06/DUCK7859.jpg'),
  ('Makeup', 4, '7e000000-0000-4000-8000-000000000036', 'Ruby Wedding', 'ruby-wedding', 'Make Up', '7e100000-0000-4000-8000-000000000191', 'Makeup đi tiệc / sự kiện', 'Make Up', '1.200.000 VNĐ/lần', 1200000, null, 'lần', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ4nTo02rheRcWeQJViulxtf54C7vVzkfBH1gShaI_ews2Ex-o6Hn0jPg&s=10'),
  ('Makeup', 5, '7e000000-0000-4000-8000-000000000036', 'Ruby Wedding', 'ruby-wedding', 'Make Up', '7e100000-0000-4000-8000-000000000192', 'Combo cô dâu cao cấp (makeup + tóc + styling)', 'Make Up', '8.000.000 VNĐ/gói', 8000000, null, 'gói', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAPI1sjzHFgMqbLJkv6gCG8Czz4Ru3zJgQ_F6xW-XE5qSaUnKvaVEZ2Ic&s=10'),
  ('Makeup', 6, '7e000000-0000-4000-8000-000000000037', 'Helen Nguyễn Studio', 'helen-nguyen-studio', 'Make Up', '7e100000-0000-4000-8000-000000000193', 'Makeup cô dâu phong cách tự nhiên Hàn Quốc', 'Make Up', '4.500.000 VNĐ/gói', 4500000, null, 'gói', 'https://img.vuahanghieu.com/unsafe/0x0/left/top/smart/filters:quality(90)/https://admin.vuahanghieu.com/upload/news/content/2022/10/trang-diem-co-dau-kieu-han-quoc-1-jpg-1665651674-13102022160114.jpg'),
  ('Makeup', 7, '7e000000-0000-4000-8000-000000000037', 'Helen Nguyễn Studio', 'helen-nguyen-studio', 'Make Up', '7e100000-0000-4000-8000-000000000194', 'Makeup test cô dâu', 'Make Up', '1.000.000 VNĐ/lần', 1000000, null, 'lần', 'https://palatinostudio.com/wp-content/uploads/2021/05/phong-cach-makeup-cuoi-2-1-1-min.jpg'),
  ('Makeup', 8, '7e000000-0000-4000-8000-000000000037', 'Helen Nguyễn Studio', 'helen-nguyen-studio', 'Make Up', '7e100000-0000-4000-8000-000000000195', 'Makeup chụp ảnh cưới', 'Make Up', '2.500.000 VNĐ/buổi', 2500000, null, 'buổi', 'https://omni.vn/wp-content/uploads/2024/06/DUCK7859.jpg'),
  ('Makeup', 9, '7e000000-0000-4000-8000-000000000037', 'Helen Nguyễn Studio', 'helen-nguyen-studio', 'Make Up', '7e100000-0000-4000-8000-000000000196', 'Makeup tiệc sang trọng', 'Make Up', '1.500.000 VNĐ/lần', 1500000, null, 'lần', 'https://file.hstatic.net/200000503583/file/makeup-ngay-tet-4.jpg_2b7125ee51d3484f94ad7ff718bb5abf.jpg'),
  ('Makeup', 10, '7e000000-0000-4000-8000-000000000037', 'Helen Nguyễn Studio', 'helen-nguyen-studio', 'Make Up', '7e100000-0000-4000-8000-000000000197', 'Makeup + tạo kiểu tóc cô dâu premium', 'Make Up', '6.500.000 VNĐ/gói', 6500000, null, 'gói', 'https://tonywedding.vn/wp-content/uploads/2025/10/z7063634396678_25da0995ecfabbb75192b80e5a57289f.jpg'),
  ('Makeup', 11, '7e000000-0000-4000-8000-000000000038', 'Ren Bridal Studio', 'ren-bridal-studio', 'Make Up', '7e100000-0000-4000-8000-000000000198', 'Makeup cô dâu phong cách Hàn Quốc', 'Make Up', '3.800.000 VNĐ/gói', 3800000, null, 'gói', 'https://felywedding.com/wp-content/uploads/2024/01/2.jpg'),
  ('Makeup', 12, '7e000000-0000-4000-8000-000000000038', 'Ren Bridal Studio', 'ren-bridal-studio', 'Make Up', '7e100000-0000-4000-8000-000000000199', 'Makeup test cô dâu', 'Make Up', '900.000 VNĐ/lần', 900000, null, 'lần', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCGQ1wB8FbHrDoZjQ_3PIpQed1HUCsH4NvaWo4UhHv6Q&s'),
  ('Makeup', 13, '7e000000-0000-4000-8000-000000000038', 'Ren Bridal Studio', 'ren-bridal-studio', 'Make Up', '7e100000-0000-4000-8000-000000000200', 'Makeup chụp hình cưới', 'Make Up', '2.000.000 VNĐ/buổi', 2000000, null, 'buổi', 'https://khoistudio.vn/wp-content/uploads/2021/05/z2484627572820_bce8b6e2e3d991a7fe2e31d58db560a2-scaled.jpg'),
  ('Makeup', 14, '7e000000-0000-4000-8000-000000000038', 'Ren Bridal Studio', 'ren-bridal-studio', 'Make Up', '7e100000-0000-4000-8000-000000000201', 'Makeup tiệc nhẹ nhàng', 'Make Up', '1.000.000 VNĐ/lần', 1000000, null, 'lần', 'https://nvhphunu.vn/wp-content/uploads/2024/06/2024-06-06_0002a148.png'),
  ('Makeup', 15, '7e000000-0000-4000-8000-000000000038', 'Ren Bridal Studio', 'ren-bridal-studio', 'Make Up', '7e100000-0000-4000-8000-000000000202', 'Combo cô dâu + tóc + phụ kiện', 'Make Up', '5.500.000 VNĐ/gói', 5500000, null, 'gói', 'https://kisswe.com/wp-content/uploads/2020/06/IDY3-692x1024.jpg'),
  ('Trang sức', 1, '7e000000-0000-4000-8000-000000000039', 'Min’s Gem Jewelry', 'min-s-gem-jewelry', 'Trang Sức', '7e100000-0000-4000-8000-000000000203', 'Nhẫn đá thiên nhiên bạc 925 (Strawberry Quartz, Moonstone, Amethyst...)', 'Trang Sức', '800.000 - 3.000.000 VNĐ/chiếc', 800000, 3000000, 'chiếc', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQPqm9016PqH7lV_9NL75PDXJayPWDUZruApJlXcwbv430hdksYDb93XA3&s=10'),
  ('Trang sức', 2, '7e000000-0000-4000-8000-000000000039', 'Min’s Gem Jewelry', 'min-s-gem-jewelry', 'Trang Sức', '7e100000-0000-4000-8000-000000000204', 'Combo nhẫn + mặt dây chuyền + dây bạc đá thiên nhiên', 'Trang Sức', '1.500.000 - 3.500.000 VNĐ/combo', 1500000, 3500000, 'combo', 'https://down-vn.img.susercontent.com/file/vn-11134258-81ztc-msawilmxwtttb5'),
  ('Trang sức', 3, '7e000000-0000-4000-8000-000000000039', 'Min’s Gem Jewelry', 'min-s-gem-jewelry', 'Trang Sức', '7e100000-0000-4000-8000-000000000205', 'Dây chuyền đá thiên nhiên bạc 925', 'Trang Sức', '700.000 - 2.500.000 VNĐ/sản phẩm', 700000, 2500000, 'sản phẩm', 'https://ddreamer.com.vn/cdn/shop/files/daychuyendb-3158.jpg?v=1752497011&width=3840'),
  ('Trang sức', 4, '7e000000-0000-4000-8000-000000000039', 'Min’s Gem Jewelry', 'min-s-gem-jewelry', 'Trang Sức', '7e100000-0000-4000-8000-000000000206', 'Bông tai đá thiên nhiên thủ công', 'Trang Sức', '600.000 - 2.000.000 VNĐ/đôi', 600000, 2000000, 'đôi', 'https://down-vn.img.susercontent.com/file/sg-11134201-824i3-mf55kl9xo45k9d_tn'),
  ('Planner 1', 1, '7e000000-0000-4000-8000-000000000040', 'May Planner', 'may-planner', 'Planner', '7e100000-0000-4000-8000-000000000207', 'Wedding Planner trọn gói (lên ý tưởng, tìm vendor, quản lý toàn bộ lễ cưới)', 'Planner', '80.000.000 - 200.000.000 VNĐ/gói', 80000000, 200000000, 'gói', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4AzT35SrAUVPdByLfnpYUK62COv7iHo14FNHCSHgIB3lp5V1KwJO_eTA&s=10'),
  ('Planner 1', 2, '7e000000-0000-4000-8000-000000000040', 'May Planner', 'may-planner', 'Planner', '7e100000-0000-4000-8000-000000000208', 'Thiết kế concept & moodboard đám cưới (phong cách, màu sắc, chủ đề riêng)', 'Planner', '15.000.000 VNĐ/gói', 15000000, null, 'gói', 'https://peonies.vn/wp-content/uploads/2024/10/mood-board-mau-hong-cho-dam-cuoi-5.jpg'),
  ('Planner 1', 3, '7e000000-0000-4000-8000-000000000040', 'May Planner', 'may-planner', 'Planner', '7e100000-0000-4000-8000-000000000209', 'Trang trí tiệc cưới cao cấp (backdrop, bàn gallery, hoa, không gian tiệc)', 'Planner', '150.000.000 - 500.000.000 VNĐ/gói', 150000000, 500000000, 'gói', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1emwo8naEJFab-1vsGLQ4vIP0yli_Df5NCuISwZbH0_rmN3ns4i3h0VuO&s=10'),
  ('Planner 1', 4, '7e000000-0000-4000-8000-000000000040', 'May Planner', 'may-planner', 'Planner', '7e100000-0000-4000-8000-000000000210', 'Điều phối ngày cưới (quản lý timeline, ekip, nghi thức trong ngày cưới)', 'Planner', '15.000.000 VNĐ/gói', 15000000, null, 'gói', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQfDthB6yo8PNe2kFHOCrbHDo3by_s2OYLBgHBFdSMlfMD_dz1EBJwvvk&s=10'),
  ('Hoa 1', 1, '7e000000-0000-4000-8000-000000000041', 'Tiệm hoa Rosyday', 'tiem-hoa-rosyday', 'Trang Trí', '7e100000-0000-4000-8000-000000000211', 'Hoa cưới cầm tay cô dâu (hoa hồng, mẫu đơn, hoa nhập khẩu)', 'Trang Trí', '1.500.000 - 3.500.000 VNĐ/bó', 1500000, 3500000, 'bó', 'https://aodaitailoc.vn/wp-content/uploads/2025/04/Hoa-cuoi-cam-tay-co-dau-bong-hong-dau-V31.jpg'),
  ('Hoa 1', 2, '7e000000-0000-4000-8000-000000000041', 'Tiệm hoa Rosyday', 'tiem-hoa-rosyday', 'Trang Trí', '7e100000-0000-4000-8000-000000000212', 'Trang trí hoa tươi lễ gia tiên', 'Trang Trí', '8.000.000 - 25.000.000 VNĐ/gói', 8000000, 25000000, 'gói', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzpPPpPkzfsOdD0Umnr5Jh3hYf-zK3jvmK35yiuQaNqt7RPz9RVieZmdU&s=10'),
  ('Hoa 1', 3, '7e000000-0000-4000-8000-000000000041', 'Tiệm hoa Rosyday', 'tiem-hoa-rosyday', 'Trang Trí', '7e100000-0000-4000-8000-000000000213', 'Hoa tươi trang trí bàn gallery, bàn tiệc cưới', 'Trang Trí', '3.000.000 - 15.000.000 VNĐ/gói', 3000000, 15000000, 'gói', 'https://mocmienwedding.com/wp-content/uploads/2025/11/don-vi-trang-tri-sanh-cuoi-tai-quan-3-2.jpg'),
  ('Hoa 1', 4, '7e000000-0000-4000-8000-000000000041', 'Tiệm hoa Rosyday', 'tiem-hoa-rosyday', 'Trang Trí', '7e100000-0000-4000-8000-000000000214', 'Hoa lụa cao cấp trang trí cưới', 'Trang Trí', '5.000.000 - 20.000.000 VNĐ/gói', 5000000, 20000000, 'gói', 'https://thanhcongflower.com/wp-content/uploads/2023/09/ff83efff5f108a4ed301.jpg'),
  ('Hoa 1', 5, '7e000000-0000-4000-8000-000000000042', 'Nabi Flowers', 'nabi-flowers', 'Trang Trí', '7e100000-0000-4000-8000-000000000215', 'Hoa cưới cầm tay phong cách hiện đại', 'Trang Trí', '1.200.000 - 3.000.000 VNĐ/bó', 1200000, 3000000, 'bó', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuQHNfR14FD-Q1BZrsUQuzKI0vMy1sNsCllfohfEEVkzf6BN1oSbJadDM&s=10'),
  ('Hoa 1', 6, '7e000000-0000-4000-8000-000000000042', 'Nabi Flowers', 'nabi-flowers', 'Trang Trí', '7e100000-0000-4000-8000-000000000216', 'Trang trí hoa cưới bàn thờ gia tiên', 'Trang Trí', '10.000.000 - 30.000.000 VNĐ/gói', 10000000, 30000000, 'gói', 'https://bizweb.dktcdn.net/100/080/968/files/mau-trang-tri-ban-tho-gia-tien-dep-ngay-cuoi-theo-phong-cach-rustic.jpg?v=1689136364407'),
  ('Hoa 1', 7, '7e000000-0000-4000-8000-000000000042', 'Nabi Flowers', 'nabi-flowers', 'Trang Trí', '7e100000-0000-4000-8000-000000000217', 'Trang trí cổng hoa cưới', 'Trang Trí', '15.000.000 - 50.000.000 VNĐ/gói', 15000000, 50000000, 'gói', 'https://www.tierra.vn/wp-content/uploads/2025/08/cong-hoa-cuoi-hien-dai-mau-1.jpg'),
  ('Hoa 1', 8, '7e000000-0000-4000-8000-000000000042', 'Nabi Flowers', 'nabi-flowers', 'Trang Trí', '7e100000-0000-4000-8000-000000000218', 'Hoa lụa trang trí không gian cưới', 'Trang Trí', '6.000.000 - 25.000.000 VNĐ/gói', 6000000, 25000000, 'gói', 'https://hoahanhphuc.vn/upload/images/IMG_9828.JPG'),
  ('Hoa 1', 9, '7e000000-0000-4000-8000-000000000043', 'Thơ Fleur - Shop Hoa Tươi', 'tho-fleur-shop-hoa-tuoi', 'Trang Trí', '7e100000-0000-4000-8000-000000000219', 'Hoa cưới custom theo concept riêng', 'Trang Trí', '3.000.000 - 8.000.000 VNĐ/bó', 3000000, 8000000, 'bó', 'https://shophoathuduc.vn/wp-content/uploads/2026/08/dat-hoa-cuoi-cam-tay-co-dau-truoc-bao-lau-2.jpg'),
  ('Hoa 1', 10, '7e000000-0000-4000-8000-000000000043', 'Thơ Fleur - Shop Hoa Tươi', 'tho-fleur-shop-hoa-tuoi', 'Trang Trí', '7e100000-0000-4000-8000-000000000220', 'Trang trí hoa gia tiên cao cấp', 'Trang Trí', '15.000.000 - 50.000.000 VNĐ/gói', 15000000, 50000000, 'gói', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfaL3VMWk8b9OPeKqAHKenabj4N_AZDBye_6GeIEjOXcKEpVE8jt_KKs-9&s=10'),
  ('Hoa 1', 11, '7e000000-0000-4000-8000-000000000043', 'Thơ Fleur - Shop Hoa Tươi', 'tho-fleur-shop-hoa-tuoi', 'Trang Trí', '7e100000-0000-4000-8000-000000000221', 'Hộp hoa / giỏ hoa cao cấp', 'Trang Trí', '1.500.000 - 5.000.000 VNĐ/sản phẩm', 1500000, 5000000, 'sản phẩm', 'https://lamour.vn/wp-content/uploads/2025/02/24.jpg'),
  ('Hoa 1', 12, '7e000000-0000-4000-8000-000000000043', 'Thơ Fleur - Shop Hoa Tươi', 'tho-fleur-shop-hoa-tuoi', 'Trang Trí', '7e100000-0000-4000-8000-000000000222', 'Workshop cắm hoa cưới / trải nghiệm hoa', 'Trang Trí', '800.000 - 2.000.000 VNĐ/người', 800000, 2000000, 'người', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDYGAVruWGmMLhVldycd5KKwCv1Z7TGB0j0bfms2imfFdjsuXx2SAfi4z5&s=10'),
  ('Sức khỏe 1', 1, '7e000000-0000-4000-8000-000000000044', 'Phòng Khám Master', 'phong-kham-master', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000223', 'Tạo sợi lông mày Airbrowns Master Vũ Vương', 'Sức Khỏe', '8.000.000 VNĐ', 8000000, null, null, 'https://cdnphoto.dantri.com.vn/3PDsV1YTrQjiwPRuZb0uWHWO4v4=/thumb_w/1540/2022/06/01/chance-kim-doc-quyen-flybrows-dan-tridocx-1654061605109.jpeg'),
  ('Sức khỏe 1', 2, '7e000000-0000-4000-8000-000000000044', 'Phòng Khám Master', 'phong-kham-master', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000224', 'Phun môi công nghệ cao', 'Sức Khỏe', '6.000.000 VNĐ', 6000000, null, null, 'https://dalieudhyd.vn/wp-content/uploads/2024/12/lieu-phap-phun-moi-la-gi.webp'),
  ('Sức khỏe 1', 3, '7e000000-0000-4000-8000-000000000044', 'Phòng Khám Master', 'phong-kham-master', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000225', 'Điêu khắc chân mày Hairstroke', 'Sức Khỏe', '7.000.000 VNĐ', 7000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWUnuti04q3hzW4J8CqGZ3AOv9fSBnjfDIeGIyK_WO7Pky1kqjQb44w96Z&s=10'),
  ('Sức khỏe 1', 4, '7e000000-0000-4000-8000-000000000045', 'Bệnh viện Mỹ Đức Phú Nhuận', 'benh-vien-my-duc-phu-nhuan', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000226', 'Khám hiếm muộn - vô sinh', 'Sức Khỏe', '300.000 VNĐ/lần', 300000, null, 'lần', 'https://ivfmd.myduchospital.vn/wp-content/uploads/2022/08/OOL7710-1536x1024.jpg.webp'),
  ('Sức khỏe 1', 5, '7e000000-0000-4000-8000-000000000045', 'Bệnh viện Mỹ Đức Phú Nhuận', 'benh-vien-my-duc-phu-nhuan', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000227', 'Khám sản phụ khoa', 'Sức Khỏe', '350.000 VNĐ/lần', 350000, null, 'lần', 'https://myduchospital.vn/wp-content/uploads/2023/10/PORT3993-768x512.jpg'),
  ('Sức khỏe 1', 6, '7e000000-0000-4000-8000-000000000045', 'Bệnh viện Mỹ Đức Phú Nhuận', 'benh-vien-my-duc-phu-nhuan', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000228', 'Siêu âm thai 2D', 'Sức Khỏe', '400.000 VNĐ/lần', 400000, null, 'lần', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxmKhgYzztWjZJUlMhi88c7T5KMmrSm-hU6ze3VB7OFzAInGrImct4Tv76&s=10'),
  ('Sức khỏe 1', 7, '7e000000-0000-4000-8000-000000000045', 'Bệnh viện Mỹ Đức Phú Nhuận', 'benh-vien-my-duc-phu-nhuan', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000229', 'Siêu âm thai 4D', 'Sức Khỏe', '800.000 VNĐ/lần', 800000, null, 'lần', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkSEgeM0LjlX4o3Mjfmn0wXexHXNy0jdsicVPMJnPvJMTn2aG0Urb5h7c&s=10'),
  ('Sức khỏe 1', 8, '7e000000-0000-4000-8000-000000000045', 'Bệnh viện Mỹ Đức Phú Nhuận', 'benh-vien-my-duc-phu-nhuan', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000230', 'Gói khám sức khỏe sinh sản tiền hôn nhân nam', 'Sức Khỏe', '1.500.000 VNĐ/gói', 1500000, null, 'gói', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4T0JrCoo9zC8AHlDUjQ-Z8FDBECKf9Vt8KLiwIK0gm6UvRXufxLZ-3U4&s=10'),
  ('Sức khỏe 1', 9, '7e000000-0000-4000-8000-000000000045', 'Bệnh viện Mỹ Đức Phú Nhuận', 'benh-vien-my-duc-phu-nhuan', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000231', 'Gói khám sức khỏe sinh sản tiền hôn nhân nữ', 'Sức Khỏe', '2.000.000 VNĐ/gói', 2000000, null, 'gói', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4T0JrCoo9zC8AHlDUjQ-Z8FDBECKf9Vt8KLiwIK0gm6UvRXufxLZ-3U4&s=10'),
  ('Sức khỏe 1', 10, '7e000000-0000-4000-8000-000000000045', 'Bệnh viện Mỹ Đức Phú Nhuận', 'benh-vien-my-duc-phu-nhuan', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000232', 'Điều trị hiếm muộn IVF', 'Sức Khỏe', '80.000.000 VNĐ/gói', 80000000, null, 'gói', 'https://ivfmd.myduchospital.vn/wp-content/uploads/2023/04/Ky-thuat-thu-tinh-ong-nghiem-tai-IVF-My-Duc-1.jpg'),
  ('Sức khỏe 1', 11, '7e000000-0000-4000-8000-000000000046', 'Nha Khoa Newport', 'nha-khoa-newport', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000233', 'Tẩy trắng răng', 'Sức Khỏe', '2.500.000 VNĐ', 2500000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-d_-hzWNjNZBq71jF2-6at9MZNAr1PH05zhDuwY0z4B0tjpi7UmhQ_sk-&s=10'),
  ('Sức khỏe 1', 12, '7e000000-0000-4000-8000-000000000046', 'Nha Khoa Newport', 'nha-khoa-newport', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000234', 'Dán sứ Veneer', 'Sức Khỏe', '7.000.000 VNĐ/răng', 7000000, null, 'răng', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAv7lgJYHNpvgPJLXfXkkh-FNsRwdZk65oXMPvGA6dQg&s=10'),
  ('Sức khỏe 1', 13, '7e000000-0000-4000-8000-000000000046', 'Nha Khoa Newport', 'nha-khoa-newport', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000235', 'Bọc răng sứ thẩm mỹ', 'Sức Khỏe', '5.000.000 VNĐ/răng', 5000000, null, 'răng', 'https://dentos.vn/files/1_result-aHMJz6PYOh.webp'),
  ('Sức khỏe 1', 14, '7e000000-0000-4000-8000-000000000046', 'Nha Khoa Newport', 'nha-khoa-newport', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000236', 'Niềng răng mắc cài kim loại', 'Sức Khỏe', '30.000.000 VNĐ/gói', 30000000, null, 'gói', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcpt7rawSAiC6fmzPI_nNAIyphqqtRd4RKaHxw5YdOlPAr82cxQvLspH_f&s=10'),
  ('Sức khỏe 1', 15, '7e000000-0000-4000-8000-000000000046', 'Nha Khoa Newport', 'nha-khoa-newport', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000237', 'Niềng răng trong suốt Invisalign', 'Sức Khỏe', '70.000.000 VNĐ/gói', 70000000, null, 'gói', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDY3GCKyAOSeOae4DNCKY4-iNglbHkVYGk7zgfWwa5XksSZHUmqDFzVDlK&s=10'),
  ('Sức khỏe 1', 16, '7e000000-0000-4000-8000-000000000046', 'Nha Khoa Newport', 'nha-khoa-newport', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000238', 'Cấy ghép Implant', 'Sức Khỏe', '25.000.000 VNĐ/răng', 25000000, null, 'răng', 'https://ranghammat.org.vn/Upload/Bai%20dang%20tham%20khao/Implant/20190531_023654_491706_cay-implant-1080x675max-800x800.jpg'),
  ('Sức khỏe 1', 17, '7e000000-0000-4000-8000-000000000046', 'Nha Khoa Newport', 'nha-khoa-newport', 'Sức Khỏe', '7e100000-0000-4000-8000-000000000239', 'Nhổ răng khôn', 'Sức Khỏe', '1.500.000 VNĐ/răng', 1500000, null, 'răng', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeRVof4ZMjD0X3X-UZz2qq02GrBtMyZ5gfaOvwjbFjxBPsvTckOVOqhJtz&s=10'),
  ('Dịch vụ khác1', 1, '7e000000-0000-4000-8000-000000000047', 'Vải Ren Couture', 'vai-ren-couture', 'Khác', '7e100000-0000-4000-8000-000000000240', 'Ren mi đính kết hạt, cườm, kim sa', 'Khác', '200.000đ', 200000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC1YRDZTn7lkRjHOm9U3p8lkG9RT5-yG7Z2Zricua-fwqoFqSYspOhh4M&s=10'),
  ('Dịch vụ khác1', 2, '7e000000-0000-4000-8000-000000000047', 'Vải Ren Couture', 'vai-ren-couture', 'Khác', '7e100000-0000-4000-8000-000000000241', 'Ren cao cấp / Ren limited', 'Khác', '6.000.000đ', 6000000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIShu5wFIaKh0FlwO72fot-l76tJBxMDUz3Oszz2RrYQJY1S7BPInana4&s=10'),
  ('Dịch vụ khác1', 3, '7e000000-0000-4000-8000-000000000047', 'Vải Ren Couture', 'vai-ren-couture', 'Khác', '7e100000-0000-4000-8000-000000000242', 'Ren couture', 'Khác', '6.000.000đ', 6000000, null, null, 'https://scontent.fsgn2-10.fna.fbcdn.net/v/t39.30808-6/560903535_1131853285793098_5809154355873143511_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=s2048x2048&_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_ohc=fgqENdkBavYQ7kNvwEwnSaq&_nc_oc=AdqUyF7rWUwNblqZU4s2pCMlNi8v9DLUuUS0DjTTf_VJ12unGjLK9CEAcZeM0oHJLaE&_nc_zt=23&_nc_ht=scontent.fsgn2-10.fna&_nc_gid=r2Xc5sk-L2sBA4klEcwKCw&_nc_ss=7b2a8&oh=00_AQL4iLTEgx-b2Dr6Z7YVBlQlNZUldNHe0DqNj5Mc65e_Rw&oe=6A9F9D31'),
  ('Dịch vụ khác1', 4, '7e000000-0000-4000-8000-000000000048', 'FRANK', 'frank', 'Khác', '7e100000-0000-4000-8000-000000000243', 'Calder Slim Carry', 'Khác', '1.690.000đ', 1690000, null, null, 'https://vn.frcnk.com/cdn/shop/files/FRW26-01-calder-slim-carry_2000x2000.jpg?v=1776006130'),
  ('Dịch vụ khác1', 5, '7e000000-0000-4000-8000-000000000049', 'DGHQ – Drap Giường', 'dghq-drap-giuong', 'Khác', '7e100000-0000-4000-8000-000000000244', 'Bộ vỏ chăn Amore', 'Khác', '7.800.000đ', 7800000, null, null, 'https://drapgiuonghanquoc.com/wp-content/uploads/2018/11/45226697_2284724151796692_475784253573955584_n.jpg'),
  ('Dịch vụ khác1', 6, '7e000000-0000-4000-8000-000000000049', 'DGHQ – Drap Giường', 'dghq-drap-giuong', 'Khác', '7e100000-0000-4000-8000-000000000245', 'Bộ vỏ chăn Amore – Drap Modal', 'Khác', '7.800.000đ', 7800000, null, null, 'https://drapgiuonghanquoc.com/wp-content/uploads/2018/11/45226697_2284724151796692_475784253573955584_n-300x300.jpg');

create temp table _existing_vendor_metadata on commit drop as
select distinct on (normalized_name)
  normalized_name,
  owner_id,
  description,
  address,
  city,
  phone,
  email,
  website_url,
  rating_avg,
  rating_count,
  image_url
from (
  select
    lower(regexp_replace(btrim(name), '[[:space:]]+', ' ', 'g')) as normalized_name,
    owner_id,
    description,
    address,
    city,
    phone,
    email,
    website_url,
    rating_avg,
    rating_count,
    image_url,
    updated_at
  from public.vendors
) existing
order by normalized_name, updated_at desc;

do $$
declare
  impact jsonb;
begin
  select jsonb_build_object(
    'vendors', (select count(*) from public.vendors),
    'services', (select count(*) from public.services),
    'favorite_services', (select count(*) from public.user_favorite_services),
    'chat_threads', (select count(*) from public.chat_threads where vendor_id is not null or service_id is not null),
    'chat_messages', (select count(*) from public.chat_messages where suggested_service_id is not null),
    'service_requests', (select count(*) from public.service_requests),
    'vouchers', (select count(*) from public.vouchers where vendor_id is not null),
    'wedding_plan_items', (select count(*) from public.wedding_plan_items),
    'user_plan_items', (select count(*) from public.user_plan_items where service_id is not null),
    'bi_agent_runs', (select count(*) from public.bi_agent_runs where vendor_id is not null),
    'bi_activities', (select count(*) from public.bi_activities where vendor_id is not null),
    'bi_recommendations', (select count(*) from public.bi_recommendations where vendor_id is not null),
    'bi_reports', (select count(*) from public.bi_reports where vendor_id is not null)
  ) into impact;

  raise notice 'Vendor catalog replacement impact: %', impact;
end
$$;

-- This table uses ON DELETE RESTRICT; remove its catalog references explicitly.
delete from public.wedding_plan_items
where service_id in (select id from public.services);

-- All other dependent records follow their declared CASCADE or SET NULL rules.
delete from public.vendors;

with distinct_vendors as (
  select distinct on (vendor_id)
    vendor_id,
    vendor_name,
    vendor_slug,
    vendor_category
  from _vendor_catalog
  order by vendor_id, service_id
),
first_images as (
  select distinct on (vendor_id)
    vendor_id,
    image_url
  from _vendor_catalog
  where image_url is not null and btrim(image_url) <> ''
  order by vendor_id, service_id
)
insert into public.vendors (
  id,
  owner_id,
  name,
  slug,
  category,
  description,
  address,
  city,
  phone,
  email,
  website_url,
  image_url,
  rating_avg,
  rating_count,
  status
)
select
  source.vendor_id,
  existing.owner_id,
  source.vendor_name,
  source.vendor_slug,
  source.vendor_category,
  existing.description,
  existing.address,
  existing.city,
  existing.phone,
  existing.email,
  existing.website_url,
  coalesce(existing.image_url, first_images.image_url),
  coalesce(existing.rating_avg, 0),
  coalesce(existing.rating_count, 0),
  'active'
from distinct_vendors source
left join _existing_vendor_metadata existing
  on existing.normalized_name =
     lower(regexp_replace(btrim(source.vendor_name), '[[:space:]]+', ' ', 'g'))
left join first_images on first_images.vendor_id = source.vendor_id;

insert into public.services (
  id,
  vendor_id,
  category,
  name,
  description,
  base_price,
  max_price,
  price_unit,
  price_display,
  currency,
  thumbnail_url,
  status
)
select
  service_id,
  vendor_id,
  service_category,
  service_name,
  null,
  base_price,
  max_price,
  price_unit,
  price_display,
  'VND',
  image_url,
  'active'
from _vendor_catalog
order by service_id;

alter table public.services
  validate constraint services_base_price_nonnegative;
alter table public.services
  validate constraint services_max_price_nonnegative;
alter table public.services
  validate constraint services_price_range_ordered;

do $$
declare
  actual_vendor_count bigint;
  actual_service_count bigint;
  actual_missing_image_count bigint;
begin
  select count(*) into actual_vendor_count from public.vendors;
  select count(*) into actual_service_count from public.services;
  select count(*) into actual_missing_image_count
  from public.services where thumbnail_url is null;

  if actual_vendor_count <> 49 then
    raise exception 'Expected 49 vendors, found %', actual_vendor_count;
  end if;
  if actual_service_count <> 245 then
    raise exception 'Expected 245 services, found %', actual_service_count;
  end if;
  if actual_missing_image_count <> 0 then
    raise exception 'Expected 0 missing service images, found %', actual_missing_image_count;
  end if;
  if exists (
    select 1
    from (
      values
      ('Studio 1', 15::bigint),
      ('Váy cưới 1', 100::bigint),
      ('Vest 1', 50::bigint),
      ('Thiệp cưới 1', 15::bigint),
      ('venue 1', 7::bigint),
      ('Makeup', 15::bigint),
      ('Trang sức', 4::bigint),
      ('Planner 1', 4::bigint),
      ('Hoa 1', 12::bigint),
      ('Sức khỏe 1', 17::bigint),
      ('Dịch vụ khác1', 6::bigint)
    ) expected(source_tab, expected_count)
    left join (
      select source_tab, count(*) as actual_count
      from _vendor_catalog
      group by source_tab
    ) actual using (source_tab)
    where coalesce(actual.actual_count, 0) <> expected.expected_count
  ) then
    raise exception 'Vendor catalog per-tab service counts do not match the reviewed fixture';
  end if;
  if exists (
    select 1
    from public.services service
    left join public.vendors vendor on vendor.id = service.vendor_id
    where vendor.id is null
  ) then
    raise exception 'Vendor catalog contains orphaned services';
  end if;
end
$$;

commit;
