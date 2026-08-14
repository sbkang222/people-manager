-- Safe history trigger test. All test data is rolled back at the end.
begin;

do $$
declare
  test_people_id bigint;
  insert_count integer;
  update_count integer;
  delete_count integer;
begin
  insert into public.people (name, company, department, position)
  values ('History Test', 'Test Company', 'Test Department', 'Tester')
  returning id into test_people_id;

  update public.people
  set name = 'History Test Renamed', position = 'Senior Tester'
  where id = test_people_id;

  delete from public.people
  where id = test_people_id;

  select count(*) into insert_count
  from public.people_history
  where people_id = test_people_id
    and person_name = 'History Test Renamed'
    and action = 'INSERT';

  select count(*) into update_count
  from public.people_history
  where people_id = test_people_id
    and person_name = 'History Test Renamed'
    and action = 'UPDATE';

  select count(*) into delete_count
  from public.people_history
  where people_id = test_people_id
    and person_name = 'History Test Renamed'
    and action = 'DELETE';

  if insert_count <> 1 or update_count <> 1 or delete_count <> 1 then
    raise exception
      'History test failed: insert=%, update=%, delete=%',
      insert_count, update_count, delete_count;
  end if;

  raise notice
    'History test passed: people_id=%, insert=%, update=%, delete=%',
    test_people_id, insert_count, update_count, delete_count;
end;
$$;

rollback;
