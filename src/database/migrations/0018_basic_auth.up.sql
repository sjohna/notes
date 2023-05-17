create table "user" (
    id bigint generated always as identity primary key,
    user_name text not null,
    salt bytea not null,
    password_hash bytea not null
);

create table session (
    id bigint generated always as identity primary key,
    user_id bigint not null references "user"(id),
    token text not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz,
    closed_at timestamptz
);