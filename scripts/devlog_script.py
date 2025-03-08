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

# Verwende now(timezone.utc) statt utcnow(), um die Warnung zu vermeiden
today = datetime.datetime.now(timezone.utc)
first_day_of_month = today.replace(day=1)

since_date = first_day_of_month.isoformat()
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

# --- Prompt erstellen ---
prompt = f"""
Erstelle bitte einen neuen Devlog-Artikel im HTML-Format, der exakt im Stil meiner bisherigen Devlogs (siehe angehängte Dateien devblog-01.html und devblog-02.html) gehalten ist. Der Artikel soll den gleichen Wortlaut, die gleiche Struktur und das gleiche Layout aufweisen wie die Beispiele. Nutze die folgenden GitHub-Commit-Updates als Grundlage:

{commit_text}

Bitte integriere diese Commit-Updates so, dass sie den aktuellen Entwicklungsfortschritt widerspiegeln. Erstelle den kompletten Artikel als HTML-Code und achte darauf, dass alle notwendigen HTML-Tags (<html>, <head>, <body> etc.) enthalten sind. Verwende passende Überschriften, Abschnitte, Bildcontainer, Platzhalter für Header, Footer und Navigation, sowie alle weiteren typischen Elemente, die in meinen bisherigen Devlogs zu finden sind. Formuliere den komplen Devlog auf english.
"""

openai.api_key = OPENAI_API_KEY

# Nutze jetzt openai.Chat.create(...) anstatt openai.ChatCompletion.create(...)
response = openai.Chat.create(
    model="gpt-3.5-turbo",  # oder gpt-4, falls du Zugriff hast
    messages=[
        {"role": "system", "content": "Du bist ein erfahrener Devblog-Autor."},
        {"role": "user", "content": prompt}
    ],
    temperature=0.7,
    max_tokens=1500
)

# In der neuen Syntax liegt die Antwort hier
html_content = response.choices[0].message.content

# --- HTML-Ausgabe speichern ---
output_dir = "devlogs"
os.makedirs(output_dir, exist_ok=True)
output_filename = f"devlog-{today.year}-{today.month:02d}.html"

with open(os.path.join(output_dir, output_filename), "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Devlog generiert und gespeichert in {output_dir}/{output_filename}")
