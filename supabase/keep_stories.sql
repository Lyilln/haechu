-- 限時動態／SNS 貼文保護（貼到 Supabase 的 SQL Editor 按 Run 一次就好）
-- 不管哪支手機（包括還沒更新的舊版 App）把雲端的限動清單蓋成少了幾則，
-- 資料庫都會自動把少掉的那幾則補回去。只有「已刪除」記號超過 14 天的才會真的拿掉。

create or replace function public.kv_keep_union() returns trigger
language plpgsql as $$
declare
  lim bigint := (extract(epoch from now()) * 1000)::bigint - 14 * 86400000;
  extra jsonb;
begin
  if new.k in ('daisuki_sn_stories', 'daisuki_sn_posts', 'daisuki_group_notices')
     and old.v is not null and jsonb_typeof(old.v::jsonb) = 'array'
     and new.v is not null and jsonb_typeof(new.v::jsonb) = 'array' then
    select coalesce(jsonb_agg(o.e), '[]'::jsonb) into extra
    from jsonb_array_elements(old.v::jsonb) as o(e)
    where jsonb_typeof(o.e) = 'object' and o.e ? 'id'
      and not (o.e ? 'del' and (o.e->>'del') ~ '^[0-9]+$' and (o.e->>'del')::bigint < lim)
      and not exists (
        select 1 from jsonb_array_elements(new.v::jsonb) as n(e)
        where jsonb_typeof(n.e) = 'object' and n.e->>'id' = o.e->>'id'
      );
    if jsonb_array_length(extra) > 0 then
      new.v := (new.v::jsonb || extra);
    end if;
  end if;
  return new;
end $$;

drop trigger if exists kv_keep_union on public.kv;
create trigger kv_keep_union before update on public.kv
for each row execute function public.kv_keep_union();
