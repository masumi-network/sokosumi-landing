#!/bin/bash
# One-off: wires the marketing-site events that had no GTM tag (2026-08-25).
# Needs @owntag/gtm-cli authenticated as patrick@masumi.network.
# Run, then review the workspace in the GTM UI and publish the version it creates.
set -e
unset GOOGLE_APPLICATION_CREDENTIALS
G() { gtm "$@" -a 6307066145 -c 226660554 -w 36 -o json 2>/dev/null; }
idof() { python3 -c "import json,sys;s=sys.stdin.read();s=s[s.index('{'):];print(json.JSONDecoder().raw_decode(s)[0]['$1'])"; }

dlv() { G variables create -n "dlv - $1" --type v --config "{\"parameter\":[{\"type\":\"integer\",\"key\":\"dataLayerVersion\",\"value\":\"2\"},{\"type\":\"boolean\",\"key\":\"setDefaultValue\",\"value\":\"false\"},{\"type\":\"template\",\"key\":\"name\",\"value\":\"$1\"}]}" | idof variableId; }
ce() { G triggers create -n "ce - $1" --type customEvent --config "{\"customEventFilter\":[{\"type\":\"equals\",\"parameter\":[{\"type\":\"template\",\"key\":\"arg0\",\"value\":\"{{_event}}\"},{\"type\":\"template\",\"key\":\"arg1\",\"value\":\"$1\"}]}]}" | idof triggerId; }
# Trigger group with "ce - consent_status" (id 7): fires once both have happened, whatever the order.
tg() { G triggers create -n "tg - ce - consent_status & ce - $1" --type triggerGroup --config "{\"parameter\":[{\"type\":\"list\",\"key\":\"triggerIds\",\"list\":[{\"type\":\"triggerReference\",\"value\":\"7\"},{\"type\":\"triggerReference\",\"value\":\"$2\"}]}]}" | idof triggerId; }
P() { echo "{\"type\":\"map\",\"map\":[{\"type\":\"template\",\"key\":\"parameter\",\"value\":\"$1\"},{\"type\":\"template\",\"key\":\"parameterValue\",\"value\":\"{{dlv - $1}}\"}]}"; }
# ga4tag NAME TRIGGER "param1,param2"
ga4tag() {
  local list=""; IFS=, read -ra ps <<< "$3"
  for p in "${ps[@]}"; do [ -n "$p" ] && list="$list$(P $p),"; done
  list=${list%,}
  G tags create -n "GA4 - $1" --type gaawe --firing-trigger-id "$2" --config "{\"parameter\":[{\"type\":\"boolean\",\"key\":\"sendEcommerceData\",\"value\":\"false\"},{\"type\":\"template\",\"key\":\"eventName\",\"value\":\"$1\"},{\"type\":\"template\",\"key\":\"measurementIdOverride\",\"value\":\"{{const - GA4 - DataStream - Measurement ID}}\"},{\"type\":\"list\",\"key\":\"eventSettingsTable\",\"list\":[$list]}]}" | idof tagId
}

echo "vars: form_name=$(dlv form_name) plan=$(dlv plan) seats=$(dlv seats) percent=$(dlv percent)"

# Existing tags: generate_lead gains form_name; sign_up_click gains plan + seats.
G tags update -t 133 --config "{\"parameter\":[{\"type\":\"list\",\"key\":\"eventSettingsTable\",\"list\":[$(P form_name)]}]}" >/dev/null && echo "updated 133 generate_lead"
G tags update -t 164 --config "{\"parameter\":[{\"type\":\"list\",\"key\":\"eventSettingsTable\",\"list\":[$(P location),$(P plan),$(P seats)]}]}" >/dev/null && echo "updated 164 sign_up_click"

for ev in talk_to_sales_click view_pricing pricing_calculator scroll_depth; do
  c=$(ce $ev); g=$(tg $ev $c)
  case $ev in
    talk_to_sales_click) params="location,plan";;
    view_pricing) params="seats";;
    pricing_calculator) params="seats";;
    scroll_depth) params="percent";;
  esac
  t=$(ga4tag $ev $g "$params")
  echo "$ev: ce=$c tg=$g tag=$t"
done

echo "version: $(G versions create --name 'marketing events + params' | idof containerVersionId)  -> publish it in the GTM UI after a Tag Assistant check"
