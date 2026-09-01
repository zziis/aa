-- =========================================================
-- ZONO V1 — Seeds + Progressive Bird Economy
-- شغّله مرة واحدة في Supabase > SQL Editor
-- =========================================================

begin;

alter table public.profiles
  add column if not exists seeds bigint not null default 0 check (seeds >= 0),
  add column if not exists active_bird_rank integer not null default 0 check (active_bird_rank between 0 and 5),
  add column if not exists bird_plan_started_at timestamptz,
  add column if not exists bird_plan_ends_at timestamptz,
  add column if not exists bird_last_seed_claim timestamptz;

-- أسعار الطيور بالبذور
create or replace function public.zono_bird_price(p_item_id text)
returns bigint
language sql
immutable
as $$
  select case p_item_id
    when 'classic_gold' then 0
    when 'emerald' then 6000
    when 'royal_blue' then 9000
    when 'crimson_phoenix' then 12000
    when 'ivory_cockatiel' then 18000
    when 'obsidian_gold' then 30000
    else null
  end;
$$;

-- ترتيب الطيور: لا يسمح بالرجوع إلى ترتيب أقدم
create or replace function public.zono_bird_rank(p_item_id text)
returns integer
language sql
immutable
as $$
  select case p_item_id
    when 'classic_gold' then 0
    when 'emerald' then 1
    when 'royal_blue' then 2
    when 'crimson_phoenix' then 3
    when 'ivory_cockatiel' then 4
    when 'obsidian_gold' then 5
    else null
  end;
$$;

-- الإنتاج اليومي لكل طائر
create or replace function public.zono_bird_daily_seeds(p_item_id text)
returns bigint
language sql
immutable
as $$
  select case p_item_id
    when 'emerald' then 500
    when 'royal_blue' then 750
    when 'crimson_phoenix' then 1000
    when 'ivory_cockatiel' then 1500
    when 'obsidian_gold' then 2500
    else 0
  end;
$$;

create or replace function public.zono_bird_inventory()
returns table(item_id text)
language sql
security definer
set search_path = public
as $$
  select bi.item_id
  from public.bird_inventory bi
  where bi.user_id = auth.uid()
  order by bi.purchased_at;
$$;

-- الشراء بالبذور + تفعيل الشكل الجديد تلقائياً + قفل القديم
create or replace function public.zono_buy_bird(p_item_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price bigint;
  v_new_rank integer;
  v_current_rank integer;
  v_balance bigint;
  v_daily bigint;
begin
  if auth.uid() is null then
    raise exception 'يجب تسجيل الدخول';
  end if;

  v_price := public.zono_bird_price(p_item_id);
  v_new_rank := public.zono_bird_rank(p_item_id);
  v_daily := public.zono_bird_daily_seeds(p_item_id);

  if v_price is null or v_new_rank is null or v_new_rank <= 0 then
    raise exception 'هذا الطائر غير متاح للشراء';
  end if;

  select seeds, active_bird_rank
    into v_balance, v_current_rank
  from public.profiles
  where id = auth.uid()
  for update;

  if v_new_rank <= coalesce(v_current_rank, 0) then
    raise exception 'لا يمكن شراء أو الرجوع إلى طائر أقدم من طائرك الحالي';
  end if;

  if coalesce(v_balance, 0) < v_price then
    raise exception 'رصيد البذور غير كافٍ';
  end if;

  update public.profiles
  set seeds = seeds - v_price,
      active_bird = p_item_id,
      active_bird_rank = v_new_rank,
      bird_plan_started_at = now(),
      bird_plan_ends_at = now() + interval '500 days',
      bird_last_seed_claim = now()
  where id = auth.uid();

  insert into public.bird_inventory(user_id, item_id)
  values(auth.uid(), p_item_id)
  on conflict (user_id, item_id) do nothing;

  return jsonb_build_object(
    'ok', true,
    'item_id', p_item_id,
    'rank', v_new_rank,
    'price', v_price,
    'daily_seeds', v_daily,
    'duration_days', 500,
    'seeds', v_balance - v_price
  );
end;
$$;

-- لا يسمح بارتداء طائر أقدم؛ التفعيل يتم تلقائياً عند الشراء
create or replace function public.zono_equip_bird(p_item_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_active text;
begin
  if auth.uid() is null then
    raise exception 'يجب تسجيل الدخول';
  end if;

  select active_bird into v_active
  from public.profiles
  where id = auth.uid();

  if p_item_id is distinct from v_active then
    raise exception 'الترقية دائمة ولا يمكن ارتداء طائر أقدم';
  end if;
end;
$$;

-- مكافأة البذور بعد كل 24 ساعة، ولمدة الخطة فقط
create or replace function public.zono_claim_bird_daily_seeds()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_active text;
  v_daily bigint;
  v_last timestamptz;
  v_ends timestamptz;
  v_balance bigint;
begin
  if auth.uid() is null then
    raise exception 'يجب تسجيل الدخول';
  end if;

  select active_bird, bird_last_seed_claim, bird_plan_ends_at, seeds
    into v_active, v_last, v_ends, v_balance
  from public.profiles
  where id = auth.uid()
  for update;

  v_daily := public.zono_bird_daily_seeds(v_active);

  if coalesce(v_daily, 0) <= 0 then
    raise exception 'الطائر الحالي لا يملك إنتاج بذور يومياً';
  end if;

  if v_ends is null or now() > v_ends then
    raise exception 'انتهت مدة إنتاج هذا الطائر (500 يوم)';
  end if;

  if v_last is not null and v_last > now() - interval '24 hours' then
    raise exception 'لم تكتمل 24 ساعة منذ آخر إنتاج للبذور';
  end if;

  update public.profiles
  set seeds = seeds + v_daily,
      bird_last_seed_claim = now()
  where id = auth.uid()
  returning seeds into v_balance;

  return jsonb_build_object(
    'ok', true,
    'reward', v_daily,
    'seeds', v_balance,
    'item_id', v_active,
    'plan_ends_at', v_ends
  );
end;
$$;

grant execute on function public.zono_bird_inventory() to authenticated;
grant execute on function public.zono_bird_price(text) to authenticated;
grant execute on function public.zono_bird_rank(text) to authenticated;
grant execute on function public.zono_bird_daily_seeds(text) to authenticated;
grant execute on function public.zono_buy_bird(text) to authenticated;
grant execute on function public.zono_equip_bird(text) to authenticated;
grant execute on function public.zono_claim_bird_daily_seeds() to authenticated;

commit;

notify pgrst, 'reload schema';

-- اختياري لاختبار حساب المطور فقط (لا تشغله إلا إذا أردت رصيد بذور تجريبي):
-- update public.profiles set seeds = 50000 where role = 'developer';
