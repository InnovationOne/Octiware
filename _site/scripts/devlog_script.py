import os
import requests
import datetime
from datetime import timezone, timedelta

# --- Konfiguration ---
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')

REPO_OWNER = "InnovationOne"  # Passe an dein Repo an
REPO_NAME = "Project-SI"      # Passe an dein Repo an

# Heutiges Datum (UTC)
today = datetime.datetime.now(timezone.utc)

# Ersten Tag des aktuellen Monats ermitteln
first_day_current = today.replace(day=1)
# Letzter Tag des Vormonats ist ein Tag vor dem ersten Tag des aktuellen Monats
last_day_previous = first_day_current - timedelta(days=1)
# Erster Tag des Vormonats
first_day_previous = last_day_previous.replace(day=1)

# Konvertiere beide Daten in ISO-Format (z.B. "2025-02-01T00:00:00+00:00")
since_date = first_day_previous.isoformat()
until_date = last_day_previous.isoformat()

# GitHub-API-URL: Alle Commits zwischen seit und bis
commits_url = (
    f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits"
    f"?since={since_date}&until={until_date}"
)
headers = {"Authorization": f"token {GITHUB_TOKEN}"}

response = requests.get(commits_url, headers=headers)
if response.status_code != 200:
    print("Fehler beim Abrufen der Commits:", response.text)
    exit(1)

commits = response.json()

# --- Aufbereitung der Commit-Daten ---
commit_summaries = []
for commit in commits:
    # Extrahiere Datum (YYYY-MM-DD) und Commit-Nachricht
    commit_date = commit['commit']['author']['date'][:10]
    message = commit['commit']['message']
    commit_summaries.append(f"- {commit_date}: {message}")

commit_text = "\n".join(commit_summaries)
if not commit_text:
    commit_text = "Keine neuen Commits im definierten Zeitraum gefunden."

# --- Commit-Updates in Datei speichern ---
output_dir = "commit_updates"
os.makedirs(output_dir, exist_ok=True)
output_filename = f"commits-{first_day_previous.year}-{first_day_previous.month:02d}.txt"

with open(os.path.join(output_dir, output_filename), "w", encoding="utf-8") as f:
    f.write(commit_text)

print(f"Commit-Updates gespeichert in {output_dir}/{output_filename}")
