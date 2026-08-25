#!/bin/bash
# Part 2 of gtm-marketing-events.sh. Part 1 became container version 31
# (new events). This adds the missing params to two existing tags and creates
# version 32, which supersedes 31 — publish 32 only.
# `gtm tags update` replaces the whole tag, so the full body is sent.
set -e
unset GOOGLE_APPLICATION_CREDENTIALS
A="-a 6307066145 -c 226660554"
W=$(gtm workspaces list $A -o json 2>/dev/null | grep -o '"workspaceId": "[0-9]*"' | head -1 | grep -o '[0-9]*')
echo "workspace $W"
G() { gtm "$@" $A -w "$W" -o json; }
fp() { G tags get -t "$1" 2>/dev/null | grep -o '"fingerprint": "[0-9]*"' | head -1 | grep -o '[0-9]*'; }
P() { echo "{\"type\":\"map\",\"map\":[{\"type\":\"template\",\"key\":\"parameter\",\"value\":\"$1\"},{\"type\":\"template\",\"key\":\"parameterValue\",\"value\":\"{{dlv - $1}}\"}]}"; }
MID='{"type":"template","key":"measurementIdOverride","value":"{{const - GA4 - DataStream - Measurement ID}}"}'
ECOM='{"type":"boolean","key":"sendEcommerceData","value":"false"}'

G tags update -t 133 -n "GA4 - generate_lead" --fingerprint "$(fp 133)" --firing-trigger-id 100,142,168 \
  --config "{\"type\":\"gaawe\",\"parameter\":[$ECOM,{\"type\":\"template\",\"key\":\"eventName\",\"value\":\"generate_lead\"},$MID,{\"type\":\"list\",\"key\":\"eventSettingsTable\",\"list\":[$(P form_name)]}]}" >/dev/null \
  && echo "updated 133 generate_lead (+form_name)"

G tags update -t 164 -n "GA4 - sign_up_click" --fingerprint "$(fp 164)" --firing-trigger-id 163 \
  --config "{\"type\":\"gaawe\",\"parameter\":[$ECOM,{\"type\":\"template\",\"key\":\"eventName\",\"value\":\"sign_up_click\"},$MID,{\"type\":\"list\",\"key\":\"eventSettingsTable\",\"list\":[$(P location),$(P plan),$(P seats)]}]}" >/dev/null \
  && echo "updated 164 sign_up_click (+plan, seats)"

echo "== creating version =="
gtm versions create $A -w "$W" -n "generate_lead form_name, sign_up_click plan+seats" -o json | grep -o '"containerVersionId": "[0-9]*"' | head -1
echo "Publish that id: gtm versions publish $A --version-id <id>   (or GTM UI → Versions)"
