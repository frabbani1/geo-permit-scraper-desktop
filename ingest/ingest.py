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
    since = (dt.date.today() - dt.timedelta(days=days)).isoformat()
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
            timout=60,
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


def match_vertical():
    return


def main():
    return


if __name__ == "main":
    main()
