import requests, json
u = "https://services1.arcgis.com/9yy6msODkIBzkUXU/arcgis/rest/services/Building_Permits/FeatureServer/0/query"
stats = [{"statisticType": "count", "onStatisticField": "B1_ALT_ID", "outStatisticFieldName": "n"}]
r = requests.get(u, params={
    "where": "ISSUED_DT >= DATE '2026-07-01'",
    "outStatistics": json.dumps(stats),
    "groupByFieldsForStatistics": "B1_PER_TYPE,B1_PER_SUB_TYPE",
    "f": "json",
}, timeout=60).json()
rows = sorted(r.get("features", []), key=lambda x: -x["attributes"]["n"])
for f in rows[:30]:
    a = f["attributes"]
    print(a["n"], "|", repr(a["B1_PER_TYPE"]), "|", repr(a["B1_PER_SUB_TYPE"]))
if not rows:
    print(r)
