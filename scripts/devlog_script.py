import os
import requests
import datetime
from datetime import timezone

# --- Konfiguration ---
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')

REPO_OWNER = "InnovationOne"  # Passe den Namen an dein Repo an
REPO_NAME = "Project-SI"      # Passe den Namen an dein Repo an

# Heutiges Datum in UTC und "since" auf den 1. des Monats setzen
today = datetime.datetime.now(timezone.utc)
first_day_of_month = today.replace(day=1)
since_date = first_day_of_month.isoformat()

# GitHub-API-URL zum Abruf der Commits
commits_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits?since={since_date}"
headers = {"Authorization": f"token {GITHUB_TOKEN}"}

response = requests.get(commits_url, headers=headers)
if response.status_code != 200:
    print("Fehler beim Abrufen der Commits:", response.text)
    exit(1)

commits = response.json()

# --- Aufbereitung der Commit-Daten ---
commit_summaries = []
for commit in commits:
    commit_date = commit['commit']['author']['date'][:10]
    message = commit['commit']['message']
    commit_summaries.append(f"- {commit_date}: {message}")

commit_text = "\n".join(commit_summaries)
if not commit_text:
    commit_text = "Keine neuen Commits im definierten Zeitraum gefunden."

# --- Commit-Updates in Datei speichern ---
output_dir = "commit_updates"
os.makedirs(output_dir, exist_ok=True)
output_filename = f"commits-{today.year}-{today.month:02d}.txt"

with open(os.path.join(output_dir, output_filename), "w", encoding="utf-8") as f:
    f.write(commit_text)

print(f"Commit-Updates gespeichert in {output_dir}/{output_filename}")
