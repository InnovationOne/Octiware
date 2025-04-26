import os
import requests
import datetime
from datetime import timezone, timedelta

# --- Konfiguration ---
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
REPO_OWNER = "InnovationOne"
REPO_NAME = "Project-SI"

# Lese optionale Umgebungsvariablen
env_since = os.environ.get('SINCE_DATE')  # z.B. "2025-03-09"
env_until = os.environ.get('UNTIL_DATE')  # z.B. "2025-03-25"

if env_since:
    # Beginn um 00:00 UTC
    since_dt = datetime.datetime.fromisoformat(env_since).replace(tzinfo=timezone.utc)
else:
    # erstes Datum: erster Tag des Vormonats 00:00 UTC
    today = datetime.datetime.now(timezone.utc)
    first_day_current = today.replace(day=1)
    last_day_prev = first_day_current - timedelta(days=1)
    since_dt = last_day_prev.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

if env_until:
    # Ende um 23:59 UTC
    until_dt = datetime.datetime.fromisoformat(env_until).replace(
        hour=23, minute=59, second=59, microsecond=0, tzinfo=timezone.utc)
else:
    # letztes Datum: letzter Tag des Vormonats 23:59 UTC
    today = datetime.datetime.now(timezone.utc)
    first_day_current = today.replace(day=1)
    last_day_prev = first_day_current - timedelta(days=1)
    until_dt = last_day_prev.replace(hour=23, minute=59, second=59, microsecond=0)

# In ISO-Format für die GitHub-API
since_iso = since_dt.isoformat()
until_iso = until_dt.isoformat()

commits_url = (
    f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits"
    f"?since={since_iso}&until={until_iso}"
)
headers = {"Authorization": f"token {GITHUB_TOKEN}"}

response = requests.get(commits_url, headers=headers)
if response.status_code != 200:
    print("Fehler beim Abrufen der Commits:", response.text)
    exit(1)

commits = response.json()

# --- Aufbereitung ---
commit_summaries = []
for c in commits:
    date = c['commit']['author']['date'][:10]
    msg = c['commit']['message'].splitlines()[0]
    commit_summaries.append(f"- {date}: {msg}")

if not commit_summaries:
    commit_summaries = ["Keine neuen Commits im definierten Zeitraum gefunden."]

commit_text = "\n".join(commit_summaries)

# Datei unter Angabe des realen Zeitraums
out_dir = "commit_updates"
os.makedirs(out_dir, exist_ok=True)
start_str = since_dt.strftime("%Y-%m-%d")
end_str = until_dt.strftime("%Y-%m-%d")
filename = f"commits_{start_str}_to_{end_str}.txt"

with open(os.path.join(out_dir, filename), "w", encoding="utf-8") as f:
    f.write(commit_text)

print(f"Commit-Updates gespeichert in {out_dir}/{filename}")
