create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net;

select cron.schedule(
  'returnlab-heartbeat-every-six-hours',
  '0 */6 * * *',
  $cron$
    select net.http_get(
      url := 'https://returnlab-site.vercel.app/api/heartbeat',
      timeout_milliseconds := 10000
    );
  $cron$
);
