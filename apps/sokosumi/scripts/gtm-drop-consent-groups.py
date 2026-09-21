#!/usr/bin/env python3
"""GTM cleanup after the 2026-08-25 app tracking audit (run once).

1. Every tag fired by a "tg - ce - consent_status & X" trigger group is retargeted
   to the plain X trigger. The groups fired at most once per page load, so a
   second view_agent / message_start in an SPA session was dropped. Consent
   gating moves to each tag's *additional consent* check (analytics_storage for
   GA4, ad_storage for Ads / LinkedIn / Meta), which several tags lacked.
2. GA4 - begin_checkout forwards plan + seats.
3. A second Google tag fires on `set_user_id` with send_page_view=false, so the
   first page's hits carry user_id without a duplicate page_view.
4. agent_hired (removed in SOK-805) and onboarding_complete tags/triggers go.
5. Creates a container version. Publish it after a Tag Assistant check.
"""
import json, os, subprocess, sys, time

os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)
A = ["-a", "6307066145", "-c", "226660554"]
W = os.environ.get("GTM_WS", "37")

def gtm(*args, ws=True):
    cmd = ["gtm", *args, *A] + (["-w", W] if ws else []) + ([] if args[1] == "delete" else ["-o", "json"])
    for attempt in range(6):
        r = subprocess.run(cmd, capture_output=True, text=True)
        out = r.stdout
        if "Quota exceeded" in r.stderr + out:
            time.sleep(20); continue
        break
    if r.returncode != 0 or "Error" in r.stderr:
        sys.exit(f"FAILED {' '.join(args[:3])}: {r.stderr.strip()[:300]}")
    time.sleep(1.5)
    dec = json.JSONDecoder()
    for i, ch in enumerate(out):
        if ch in "{[":
            try:
                return dec.raw_decode(out[i:])[0]
            except json.JSONDecodeError:
                continue
    return None

tags = gtm("tags", "list")
trigs = {t["triggerId"]: t for t in gtm("triggers", "list")}
groups = {}
for t in trigs.values():
    if t["type"] == "triggerGroup":
        members = [x["value"] for p in t["parameter"] for x in p.get("list", [])]
        groups[t["triggerId"]] = [m for m in members if m != "7"]

DELETE_TAGS = {"39", "71", "91", "82", "154", "160"}
DELETE_TRIGS = {"37", "38", "156", "158"}
CONSENT = {"gaawe": "analytics_storage", "googtag": "analytics_storage",
           "awct": "ad_storage", "gclidw": "ad_storage", "html": "ad_storage", "sp": "ad_storage"}

def consent(kind):
    return {"consentStatus": "needed",
            "consentType": {"type": "list", "list": [{"type": "template", "value": kind}]}}

def P(name):
    return {"type": "map", "map": [{"type": "template", "key": "parameter", "value": name},
                                   {"type": "template", "key": "parameterValue", "value": "{{dlv - %s}}" % name}]}

def update(tag, firing, params, cs):
    cfg = {"type": tag["type"], "parameter": params, "consentSettings": cs}
    gtm("tags", "update", "-t", tag["tagId"], "-n", tag["name"], "--fingerprint", tag["fingerprint"],
        "--firing-trigger-id", ",".join(firing), "--config", json.dumps(cfg))

for tag in tags:
    if tag["tagId"] in DELETE_TAGS or tag["name"] in ("Ahrefs Analytics", "GCM - set default consent states"):
        continue
    firing = tag.get("firingTriggerId", [])
    new = []
    for f in firing:
        new += groups.get(f, [f])
    new = list(dict.fromkeys(new))
    params = tag.get("parameter", [])
    if tag["tagId"] == "51":  # begin_checkout: plan + seats
        params = [p for p in params if p.get("key") != "eventSettingsTable"]
        params.append({"type": "list", "key": "eventSettingsTable", "list": [P("plan"), P("seats")]})
    kind = "analytics_storage" if tag["name"].startswith("GA4") else "ad_storage" if tag["name"].split(" ")[0] in ("GADS", "Linkedin", "META", "Conversion") else None
    cs = consent(kind) if kind else tag.get("consentSettings", {"consentStatus": "notSet"})
    if new != firing or tag["tagId"] == "51" or cs != tag.get("consentSettings"):
        update(tag, new, params, cs)
        print("updated", tag["tagId"], tag["name"], "->", new, kind)

# user_id on the first page: second Google tag, no page_view.
existing = {t["name"]: t["triggerId"] for t in trigs.values()}
uid_trig = existing.get("ce - set_user_id") or gtm("triggers", "create", "-n", "ce - set_user_id", "--type", "customEvent", "--config", json.dumps(
    {"customEventFilter": [{"type": "equals", "parameter": [
        {"type": "template", "key": "arg0", "value": "{{_event}}"},
        {"type": "template", "key": "arg1", "value": "set_user_id"}]}]}))["triggerId"]
if not any(t["name"] == "GA4 - config - set_user_id" for t in tags): gtm("tags", "create", "-n", "GA4 - config - set_user_id", "--type", "googtag", "--firing-trigger-id", uid_trig, "--config", json.dumps(
    {"parameter": [
        {"type": "template", "key": "tagId", "value": "{{const - GA4 - DataStream - Measurement ID}}"},
        {"type": "list", "key": "configSettingsTable", "list": [
            {"type": "map", "map": [{"type": "template", "key": "parameter", "value": "user_id"},
                                    {"type": "template", "key": "parameterValue", "value": "{{DLV - user_id}}"}]},
            {"type": "map", "map": [{"type": "template", "key": "parameter", "value": "send_page_view"},
                                    {"type": "template", "key": "parameterValue", "value": "false"}]}]}],
     "consentSettings": consent("analytics_storage")}))
print("created set_user_id trigger", uid_trig, "+ config tag")

for tid in DELETE_TAGS:
    gtm("tags", "delete", "-t", tid, "-f"); print("deleted tag", tid)
for tid in list(groups) + sorted(DELETE_TRIGS):
    gtm("triggers", "delete", "--trigger-id", tid, "-f"); print("deleted trigger", tid, trigs[tid]["name"])

v = gtm("versions", "create", "-n", "drop consent trigger groups, set_user_id config, begin_checkout params")
print("version", v.get("containerVersionId") or v.get("containerVersion", {}).get("containerVersionId"))
