FROM ruby:3.2-bookworm

WORKDIR /srv/jekyll
ENV BUNDLE_PATH=/usr/local/bundle

# Installiere neuere libvips und Abhängigkeiten für AVIF & WebP
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips libvips-tools libheif-dev libaom-dev \
  && rm -rf /var/lib/apt/lists/*

# Installiere Jekyll, Bundler und weitere benötigte Gems
RUN gem install jekyll bundler jekyll-sass-converter sass-embedded

CMD ["bundle", "exec", "jekyll", "serve", "--livereload", "--force_polling"]
