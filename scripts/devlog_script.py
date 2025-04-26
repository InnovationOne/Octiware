import os
import requests
import datetime
from datetime import timezone, timedelta

# --- Konfiguration --
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
REPO_OWNER = "InnovationOne"
REPO_NAME = "Project-SI"

# Optional per Env-Var übergebene Daten
env_since = os.environ.get('SINCE_DATE')
env_until = os.environ.get('UNTIL_DATE')

# Zeitfenster bestimmen
if env_since:
    since_dt = datetime.datetime.fromisoformat(env_since).replace(tzinfo=timezone.utc)
else:
    today = datetime.datetime.now(timezone.utc)
    first_day_current = today.replace(day=1)
    last_day_prev = first_day_current - timedelta(days=1)
    since_dt = last_day_prev.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

if env_until:
    until_dt = datetime.datetime.fromisoformat(env_until).replace(
        hour=23, minute=59, second=59, microsecond=0, tzinfo=timezone.utc)
else:
    today = datetime.datetime.now(timezone.utc)
    first_day_current = today.replace(day=1)
    last_day_prev = first_day_current - timedelta(days=1)
    until_dt = last_day_prev.replace(hour=23, minute=59, second=59, microsecond=0)

since_iso = since_dt.isoformat()
until_iso = until_dt.isoformat()

# 1) Liste aller Commits im Zeitraum abrufen
commits_url = (
    f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits"
    f"?since={since_iso}&until={until_iso}"
)
headers = {"Authorization": f"token {GITHUB_TOKEN}"}
resp = requests.get(commits_url, headers=headers)
resp.raise_for_status()
commits = resp.json()

# 2) Details für jeden Commit holen und formatieren
lines = []
for c in commits:
    sha = c['sha']
    # Detail-Endpoint pro Commit
    detail_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits/{sha}"
    dr = requests.get(detail_url, headers=headers)
    dr.raise_for_status()
    detail = dr.json()

    commit = detail['commit']
    author = commit['author']['name']
    email = commit['author']['email']
    date = commit['author']['date']
    message = commit['message']
    files = detail.get('files', [])

    # Kopfzeile zum Commit
    lines.append(f"---\nCommit: {sha}")
    lines.append(f"Author: {author} <{email}>")
    lines.append(f"Date:   {date}")
    lines.append("Message:")
    for line in message.splitlines():
        lines.append(f"    {line}")
    lines.append("")  # Leerzeile

    # Geänderte Dateien & Patches
    if files:
        lines.append("Changed files:")
        for f in files:
            fname = f['filename']
            status = f['status']
            additions = f['additions']
            deletions = f['deletions']
            lines.append(f"  - {fname} ({status}, +{additions}/-{deletions})")
            # Den Patch nur anhängen, wenn er nicht zu lang ist:
            patch = f.get('patch')
            if patch:
                lines.append("    Patch:")
                for pline in patch.splitlines():
                    lines.append(f"      {pline}")
        lines.append("")  # Leerzeile zwischen Commits
    else:
        lines.append("No file-level details available.\n")

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

print(f"Commit-Updates mit Details gespeichert in {out_dir}/{fname}")
