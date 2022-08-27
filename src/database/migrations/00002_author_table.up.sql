create type author_context as enum ('internal');

create table author (
    id bigint generated always as identity primary key,
    name text not null,
    context author_context not null
);

alter table document
add column author_id bigint references author;

with default_author as (
    insert into author(name, context)
    values ('Default internal author', 'internal')
    returning id
)
update document
set author_id = default_author.id
from default_author;

alter table document alter column author_id set not null;