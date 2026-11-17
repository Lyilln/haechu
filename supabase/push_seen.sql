-- HAECHU：人在 App 裡就不推播（11/17）
-- iPhone 規定：手機收到推播就一定要跳出來，不能在手機那端偷偷不跳（3 次就會被取消推播權限）。
-- 所以改成：App 開著時每 25 秒告訴伺服器「我正在看」（push_seen），伺服器發推播前看一下，60 秒內有回報的就跳過。
-- 用法：Supabase → SQL Editor → 貼上整段 → Run（跑一次就好）

alter table public.push_subs add column if not exists seen_at timestamptz;

create or replace function public.push_seen(p_endpoint text, p_on boolean)
returns void language sql security definer set search_path = public as $$
  update public.push_subs
     set seen_at = case when p_on then now() else null end
   where endpoint = p_endpoint and user_id = auth.uid();
$$;

grant execute on function public.push_seen(text, boolean) to authenticated;
