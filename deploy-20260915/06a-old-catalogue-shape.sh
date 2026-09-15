#!/bin/bash
# 06a-old-catalogue-shape.sh — READ-ONLY look at the legacy Postgres: music_jobs columns, whether the engine's raw
# job result is stored, and the gcs buckets of the 23 public tracks. Nothing is written; no secret is printed.
set -u
DBURL=$(sudo grep '^DATABASE_URL=' /opt/playmusicprompts/.env | cut -d= -f2- | tr -d '"')
echo "== music_jobs columns =="; psql "$DBURL" -Atc "select column_name||':'||data_type from information_schema.columns where table_name='music_jobs' order by ordinal_position;" | tr '\n' ' '; echo
echo "== public tracks: bucket of gcsUri, storage, take, job link =="
psql "$DBURL" -Atc "select split_part(\"gcsUri\",'/',3) as bucket, count(*), count(\"storageKey\") as stored, count(distinct \"jobId\") as jobs from music_tracks where \"isPublic\" group by 1;"
echo "== do jobs carry a raw engine result? (json keys of one public track's job) =="
psql "$DBURL" -Atc "select j.\"jobId\" is not null from music_jobs j limit 0;" >/dev/null 2>&1 || true
psql "$DBURL" -Atc "with j as (select mj.* from music_jobs mj join music_tracks t on t.\"jobId\"=mj.id where t.\"isPublic\" limit 1) select column_name from information_schema.columns where table_name='music_jobs' and data_type in ('json','jsonb');"
for col in $(psql "$DBURL" -Atc "select column_name from information_schema.columns where table_name='music_jobs' and data_type in ('json','jsonb');"); do
  echo "-- $col top-level keys (one public job):"
  psql "$DBURL" -Atc "select coalesce((select string_agg(k, ',') from jsonb_object_keys(to_jsonb(mj.\"$col\")) k), '(null/non-object)') from music_jobs mj join music_tracks t on t.\"jobId\"=mj.id where t.\"isPublic\" and mj.\"$col\" is not null limit 1;" 2>&1 | head -2
done
echo "== sample public track (no urls) =="
psql "$DBURL" -Atc "select id, \"jobId\", take, left(prompt,60), genres, moods, \"vocalMode\", \"durationSeconds\", codec, \"sampleRate\", channels, \"storageKey\", \"playCount\", \"likeCount\", \"createdAt\" from music_tracks where \"isPublic\" order by \"createdAt\" limit 3;"
