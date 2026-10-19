create table if not exists camp_guard (
  id integer primary key default 1,
  pass_hash text,
  constraint camp_guard_singleton check (id = 1)
);

insert into camp_guard (id) values (1) on conflict (id) do nothing;

create table if not exists camp_settings (
  id integer primary key default 1,
  families_registered integer,
  families_verified integer,
  individuals integer,
  children integer,
  elderly integer,
  need_food integer,
  need_clothing integer,
  need_shelter integer,
  need_health integer,
  needs_catalog integer,
  stats_updated_on date,
  stats_published boolean not null default false,
  public_note text,
  note_published boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint camp_settings_singleton check (id = 1)
);

insert into camp_settings (id) values (1) on conflict (id) do nothing;

create table if not exists aid_entries (
  id serial primary key,
  delivered_on date not null,
  category text not null,
  title text not null,
  quantity_label text not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists support_channels (
  id serial primary key,
  kind text not null,
  label text not null,
  value text not null,
  confirmed boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
