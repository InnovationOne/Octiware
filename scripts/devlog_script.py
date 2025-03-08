import os
import requests
import datetime
import openai
from datetime import timezone

# --- Konfiguration ---
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

REPO_OWNER = "InnovationOne"
REPO_NAME = "Project-SI"

today = datetime.datetime.now(timezone.utc)
first_day_of_month = today.replace(day=1)
since_date = first_day_of_month.isoformat()

commits_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits?since={since_date}"
headers = {"Authorization": f"token {GITHUB_TOKEN}"}

response_commits = requests.get(commits_url, headers=headers)
if response_commits.status_code != 200:
    print("Fehler beim Abrufen der Commits:", response_commits.text)
    exit(1)

commits = response_commits.json()

commit_summaries = []
for commit in commits:
    commit_date = commit['commit']['author']['date'][:10]
    message = commit['commit']['message']
    commit_summaries.append(f"- {commit_date}: {message}")

commit_text = "\n".join(commit_summaries)
if not commit_text:
    commit_text = "Keine neuen Commits im definierten Zeitraum gefunden."

# Beispiel-Devblog einlesen
devblog_example = ""
try:
    with open("devblog-01.html", "r", encoding="utf-8") as f:
        devblog_example = f.read()
except FileNotFoundError:
    devblog_example = "<!-- Kein Devblog-Beispiel gefunden -->"

# Prompt
prompt = f"""
Du bist ein erfahrener Devblog-Autor. Hier ist ein Beispiel für meinen bisherigen DevBlog:
=== BEISPIEL START ===
{devblog_example}
=== BEISPIEL ENDE ===

Erstelle einen neuen Devlog-Artikel im HTML-Format, der genau im Stil meines bisherigen DevBlogs gehalten ist. 
Nutze diese GitHub-Commit-Updates als Grundlage:

{commit_text}

Verwende alle HTML-Tags wie im Beispiel, formuliere das Ganze auf Englisch.
"""

openai.api_key = OPENAI_API_KEY

# Neuer Aufruf in openai v1:
completion = openai.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": prompt}
    ],
    temperature=0.7,
    max_tokens=1800
)

html_content = completion.choices[0].message.content

# HTML speichern
output_dir = "devlogs"
os.makedirs(output_dir, exist_ok=True)
output_filename = f"devlog-{today.year}-{today.month:02d}.html"

with open(os.path.join(output_dir, output_filename), "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Devlog generiert und gespeichert in {output_dir}/{output_filename}")
