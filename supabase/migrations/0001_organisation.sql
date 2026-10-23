create function touch_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table scenarios (
 id uuid primary key default gen_random_uuid(), code text not null unique check(code ~ '^[A-Z0-9-]+$'), name text not null,
 baseline_id uuid references scenarios(id), baseline_snapshot jsonb, status text not null default 'draft' check(status in ('draft','submitted','approved')),
 owner text not null, purpose text not null, source_as_of date not null, review_on date not null, retention_review_on date not null,
 submitted_by text, approved_by text, approval_evidence text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table positions (
 id uuid primary key default gen_random_uuid(), scenario_id uuid not null references scenarios(id), code text not null,
 title text not null, department text not null, parent_code text, fte numeric(6,3) not null check(fte > 0 and fte <= 1),
 annual_rate numeric(16,2) not null check(annual_rate >= 0), currency text not null check(currency ~ '^[A-Z]{3}$'),
 occupancy text not null check(occupancy in ('filled','vacant')), source jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(scenario_id,code), foreign key(scenario_id,parent_code) references positions(scenario_id,code) deferrable initially deferred,
 check(parent_code is null or parent_code <> code)
);
create table actions (
 id uuid primary key default gen_random_uuid(), code text not null unique, scenario_id uuid not null references scenarios(id),
 title text not null, owner text not null, due_on date not null, closed_on date, evidence text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table events (
 id uuid primary key default gen_random_uuid(), scenario_id uuid references scenarios(id), actor text not null, action text not null,
 detail jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table imports (
 id uuid primary key default gen_random_uuid(), scenario_id uuid not null unique references scenarios(id), digest text not null,
 rows integer not null, mapping jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger touch_scenarios before update on scenarios for each row execute function touch_updated();
create trigger touch_positions before update on positions for each row execute function touch_updated();
create trigger touch_actions before update on actions for each row execute function touch_updated();
create trigger touch_imports before update on imports for each row execute function touch_updated();
create trigger touch_events before update on events for each row execute function touch_updated();
create index positions_scenario on positions(scenario_id);
create index actions_scenario on actions(scenario_id);
create view position_costs as select p.*, round(annual_rate * fte,2) as annual_cost_amount from positions p;
create view department_costs as select scenario_id, department, currency,count(*)::int positions,sum(fte) fte,
 sum(case when occupancy='vacant' then fte else 0 end) vacant_fte,sum(annual_cost_amount) annual_cost_amount
 from position_costs group by scenario_id,department,currency;
create view manager_spans as select p.scenario_id,p.code,p.title,count(c.id)::int direct_reports,coalesce(sum(c.fte),0) report_fte
 from positions p left join positions c on c.scenario_id=p.scenario_id and c.parent_code=p.code group by p.scenario_id,p.code,p.title;
create view position_layers as with recursive tree as (
 select scenario_id,code,title,parent_code,1 as layer,array[code] as chain from positions where parent_code is null
 union all select p.scenario_id,p.code,p.title,p.parent_code,t.layer+1,t.chain||p.code from positions p join tree t
 on p.scenario_id=t.scenario_id and p.parent_code=t.code where not p.code=any(t.chain)
) select scenario_id,code,title,parent_code,layer,array_to_string(chain,' > ') as path from tree;
create view review_findings as
 select id as scenario_id,'accuracy_review'::text rule,'Source snapshot exceeds the internal 90-day review interval'::text finding
 from scenarios where source_as_of < current_date-90
 union all select id,'scenario_review','Scenario review date has passed' from scenarios where review_on < current_date
 union all select id,'retention_review','Review continued need for this snapshot' from scenarios where retention_review_on < current_date
 union all select scenario_id,'open_action',code||': '||title from actions where closed_on is null and due_on < current_date;
alter table scenarios enable row level security;
alter table positions enable row level security;
alter table actions enable row level security;
alter table events enable row level security;
alter table imports enable row level security;
revoke all on all tables in schema public from public;
