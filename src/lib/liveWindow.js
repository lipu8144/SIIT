/**
 * Is a notice "live" right now?  Works with starts_at/ends_at or startsAt/endsAt.
 *  • An empty start or end date means "no limit".
 *  • A date picked in the dashboard (e.g. 2026-11-28, which the database stores as
 *    midnight) counts for the WHOLE day — so an End Date of 28 Nov still shows on 28 Nov.
 */
const WHOLE_DAY = /^\d{4}-\d{2}-\d{2}([T ]00:00(:00(\.0+)?)?(Z|[+-]00(:?00)?)?)?$/;
const day = (v) => String(v).slice(0, 10);

export const startMs = (v) => (!v ? null : WHOLE_DAY.test(String(v)) ? new Date(`${day(v)}T00:00:00`).getTime() : new Date(v).getTime());
export const endMs   = (v) => (!v ? null : WHOLE_DAY.test(String(v)) ? new Date(`${day(v)}T23:59:59.999`).getTime() : new Date(v).getTime());

export const isLive = (item, now = Date.now()) => {
  const s = startMs(item.starts_at ?? item.startsAt);
  const e = endMs(item.ends_at ?? item.endsAt);
  return (s == null || now >= s) && (e == null || now <= e);
};
