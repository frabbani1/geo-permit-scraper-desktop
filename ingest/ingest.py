import datetime as dt
import os

import requests
from dotenv import load_dotenv

from supabase import create_client

load_dotenv("../web/.env.local")
sb = create_client(
    os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)

QUERY_URL = os.environ["PERMITS_URL"].rstrip("/") + "/query"
DATE_FIELD = "ISSUED_DT"

FIELD_MAP = {
    "permit_number": "B1_ALT_ID",
    "permit_type": "B1_PER_TYPE",
    "permit_subtype": "B1_PER_SUBTYPE",
    "description": "VALUE_DESC",
    "valuation": "G3_VALUE_TTL",
    "status": "PERMIT_STATUS",
    "address": "SITE_ADDRESS",
    "zip": "B1_SITUS_ZIP",
    "contractor_name": "APPLICANT_BUS_NAME",
    "parcel_id": "B1_PARCEL_NBR",
}


def fetch_since(days=3):
    since = (
        dt.datetime.now(dt.timezone.utc).date() - dt.timedelta(days=days)
    ).isoformat()
    offset, out = 0, []
    while True:
        results = requests.get(
            QUERY_URL,
            params={
                "where": f"{DATE_FIELD} >= DATE '{since}'",
                "outFields": "*",
                "outSR": 4326,
                "f": "json",
                "resultOffset": offset,
                "resultRecordCount": 1000,
            },
            timeout=60,
        )
        results.raise_for_status()
        features = results.json().get("features", [])
        out += features

        if len(features) <= 1000:
            return out
        offset += 1000


def to_number(x):
    try:
        return float(str(x).replace("$", "").replace(",", ""))
    except (TypeError, ValueError):
        return 0.0


def match_vertical(a, verticles):
    for v in verticles:
        c = v["config"]
        if not all(
            a.get(field) in allowed for field, allowed in c.get("match", {}).items()
        ):
            continue
        if to_number(a.get(FIELD_MAP["valuation"]) < c.get("min_value", 0)):
            continue
        return v["id"]
    return None


def main():
    verticals = sb.table("verticles").select("").eq("active", True).execute().data
    verticals.sort(ket=lambda v: v["config"].get("priority", 99))
    rows = []

    for f in fetch_since():
        a, g = f["attributes"], f.get("geometry") or {}
        vid = match_vertical(a, verticals)
        if not vid:
            continue

        ts = a.get(DATE_FIELD)
        row = {col: a.get(src) for col, src in FIELD_MAP.items()}
        row["valuation"] = to_number(row["valuation"])
        row.update(
            {
                "vertical_id": vid,
                "issued_date": dt.datetime.fromtimestamp(ts / 1000, dt.UTC)
                .date()
                .isoformat()
                if ts
                else None,
                "lat": g.get("y"),
                "lng": g.get("x"),
                "raw": a,
            }
        )
        rows.append(row)
    for i in range(0, len(rows), 500):
        sb.table("permits").upsert(rows[i: i + 500], on_conflict= "permit_number").execute()
    sb.rpc("fill owners name").execute()
    print(f"upserted {len(rows)} leads")




if __name__ == "__main__":
    main()
