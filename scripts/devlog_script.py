import os
import requests
import datetime
from datetime import timezone, timedelta

# --- Konfiguration ---
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
REPO_OWNER = "InnovationOne"
REPO_NAME = "Project-SI"

# Optionale Umgebungsvariablen
env_since = os.environ.get('SINCE_DATE')
env_until = os.environ.get('UNTIL_DATE')

# Zeitraum bestimmen
if env_since:
    since_dt = datetime.datetime.fromisoformat(env_since).replace(tzinfo=timezone.utc)
else:
    today = datetime.datetime.now(timezone.utc)
    first_of_month = today.replace(day=1)
    last_prev = first_of_month - timedelta(days=1)
    since_dt = last_prev.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

if env_until:
    until_dt = datetime.datetime.fromisoformat(env_until).replace(
        hour=23, minute=59, second=59, microsecond=0, tzinfo=timezone.utc)
else:
    today = datetime.datetime.now(timezone.utc)
    first_of_month = today.replace(day=1)
    last_prev = first_of_month - timedelta(days=1)
    until_dt = last_prev.replace(hour=23, minute=59, second=59, microsecond=0)

since_iso = since_dt.isoformat()
until_iso = until_dt.isoformat()

# 1) Alle Commits im Zeitraum abrufen
commits_url = (
    f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits"
    f"?since={since_iso}&until={until_iso}"
)
headers = {"Authorization": f"token {GITHUB_TOKEN}"}
resp = requests.get(commits_url, headers=headers)
resp.raise_for_status()
commits = resp.json()

# 2) Für jeden Commit nur die vollständige Nachricht einholen und formatieren
lines = []
for c in commits:
    sha = c['sha']
    # Detail-Endpoint, um vollständige Message zu bekommen
    detail_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits/{sha}"
    dr = requests.get(detail_url, headers=headers)
    dr.raise_for_status()
    detail = dr.json()

    commit = detail['commit']
    author = commit['author']['name']
    date = commit['author']['date']
    full_message = commit['message']  # Header + Body

    lines.append(f"---\nCommit: {sha}")
    lines.append(f"Author: {author}")
    lines.append(f"Date:   {date}")
    lines.append("Message:")
    for msg_line in full_message.splitlines():
        lines.append(f"    {msg_line}")
    lines.append("")  # Leerzeile zwischen Commits

if not lines:
    lines = ["Keine neuen Commits im definierten Zeitraum gefunden."]

output = "\n".join(lines)

# 3) In Datei schreiben
out_dir = "commit_updates"
os.makedirs(out_dir, exist_ok=True)
start_str = since_dt.strftime("%Y-%m-%d")
end_str   = until_dt.strftime("%Y-%m-%d")
fname = f"commits_{start_str}_to_{end_str}.txt"

with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as f:
    f.write(output)

print(f"Commit-Updates mit vollständigen Nachrichten gespeichert in {out_dir}/{fname}")
