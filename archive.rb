require 'active_support'
require 'active_support/core_ext/numeric'
require 'octokit'

TOKEN = ENV.fetch('GITHUB_TOKEN')
client = Octokit::Client.new(access_token: TOKEN)
client.auto_paginate = true

ORG = ENV.fetch('ORG')
CUTOFF = ENV.fetch('CUTOFF_DAYS', '90').to_i.days.ago

repos = client.search_repositories("user:#{ORG} archived:false")
repos.items.each do |repo|
  # always archive "DEPRECATED" repositories
  description = repo.description || ""
  unless description.match?(/DEPRECATED/i)
    # if anything has happened with the repository since the CUTOFF, skip it

    if repo.updated_at > CUTOFF || repo.pushed_at > CUTOFF
      next
    end

    events = client.repository_events(repo.full_name, per_page: 1)
    latest_event = events.first
    if latest_event && latest_event.created_at > CUTOFF
      next
    end
  end

  print "Archiving #{repo.name} ... "
  client.edit_repository(repo.full_name, archived: true)
  puts "done"
end
