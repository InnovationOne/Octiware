# _plugins/build_full_wiki_tree.rb
module Jekyll
  class BuildFullWikiTree < Generator
    safe true
    priority :low

    def generate(site)
      tree = {}
      wiki_dir = File.join(site.source, '_wiki')

      Dir.glob("#{wiki_dir}/**/*.md").each do |file_path|
        rel_path = file_path.sub(/^#{Regexp.escape(wiki_dir)}\//, '').sub(/\.md$/, '')
        parts = rel_path.split("/")
        url = "/wiki/#{rel_path}.html"

        pointer = tree
        parts.each_with_index do |part, i|
          if i == parts.size - 1
            # Letztes Segment => tatsächliche Datei
            if pointer[part].is_a?(Hash)
              pointer[part]["link"] = url
            else
              pointer[part] = url
            end
          else
            unless pointer[part].is_a?(Hash)
              pointer[part] = {} if pointer[part].nil?
              if pointer[part].is_a?(String)
                pointer[part] = { "link" => pointer[part] }
              end
            end
            pointer = pointer[part]
          end
        end
      end

      site.config["wiki_tree"] = tree
    end
  end
end
