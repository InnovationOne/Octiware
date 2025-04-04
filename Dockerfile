FROM ruby:3.4.2-bookworm

WORKDIR /srv/jekyll

# Installiere native Bibliotheken für AVIF/WebP und Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libvips libvips-tools libheif-dev libaom-dev \
    nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# Kopiere nur Gemfile und Gemfile.lock und installiere Gems
COPY Gemfile Gemfile.lock ./
RUN gem update --system && gem install bundler && bundle install

# Restlichen Projektcode kopieren
COPY . .

EXPOSE 4000 35729

CMD ["bundle", "exec", "jekyll", "serve", "--livereload", "--force_polling", "--host", "0.0.0.0"]
