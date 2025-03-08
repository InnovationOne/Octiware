import os
import requests
import datetime
import openai
from datetime import timezone


# --- Konfiguration ---
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

REPO_OWNER = "InnovationOne"  # Passe an dein GitHub-Repo an
REPO_NAME = "Project-SI"      # Passe an dein GitHub-Repo an

# Hole das heutige Datum in UTC und setze "since" auf den 1. des Monats in UTC
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

# --- Beispiel DevBlog aus externer Datei einlesen (optional) ---
#   Passe den Pfad zu deiner devblog-01.html an, falls sie woanders liegt.
#   Wenn du devblog-02.html ebenfalls einbinden willst, kannst du beide zusammenfassen.
devblog_example = ""
try:
    with open("devblog-01.html", "r", encoding="utf-8") as f:
        devblog_example = f.read()
except FileNotFoundError:
    # Falls die Datei nicht existiert, wird einfach ohne Beispiel weitergemacht
    devblog_example = "<!-- Kein Devblog-Beispiel gefunden -->"

# --- Prompt erstellen ---
prompt = f"""
Du bist ein erfahrener Devblog-Autor. Hier ist ein Beispiel für meinen bisherigen DevBlog:
=== BEISPIEL START ===
{devblog_example}
=== BEISPIEL ENDE ===

Erstelle bitte einen neuen Devlog-Artikel im HTML-Format, der exakt im Stil meines bisherigen DevBlogs gehalten ist. 
Der Artikel soll den gleichen Wortlaut, die gleiche Struktur und das gleiche Layout aufweisen wie das Beispiel. 
Nutze die folgenden GitHub-Commit-Updates als Grundlage:

{commit_text}

Bitte integriere diese Commit-Updates so, dass sie den aktuellen Entwicklungsfortschritt widerspiegeln. 
Erstelle den kompletten Artikel als HTML-Code und achte darauf, dass alle notwendigen HTML-Tags (<html>, <head>, <body> etc.) enthalten sind. 
Verwende passende Überschriften, Abschnitte, Bildcontainer, Platzhalter für Header, Footer und Navigation, sowie alle weiteren typischen Elemente, 
die in meinen bisherigen DevBlogs zu finden sind. Formuliere den DevBlog bitte auf Englisch.
"""

openai.api_key = OPENAI_API_KEY

# --- ChatCompletion-Aufruf ---
#   Wichtig: Hier die korrekte Methode verwenden (openai.ChatCompletion.create),
#   sowie ein passendes Modell (z.B. gpt-3.5-turbo oder gpt-4).
response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "Du bist ein erfahrener Devblog-Autor."},
        {"role": "user", "content": prompt}
    ],
    temperature=0.7,
    max_tokens=1800
)

# Die generierte Antwort
html_content = response.choices[0].message.content

# --- HTML-Ausgabe speichern ---
output_dir = "devlogs"
os.makedirs(output_dir, exist_ok=True)
output_filename = f"devlog-{today.year}-{today.month:02d}.html"

with open(os.path.join(output_dir, output_filename), "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Devlog generiert und gespeichert in {output_dir}/{output_filename}")
