require 'elasticsearch/model'

if ENV['https://q9tfytdh:owb2ugz9r77f6ydz@beech-4018235.us-east-1.bonsai.io:443/']
  Elasticsearch::Model.client = Elasticsearch::Client.new({url: ENV['https://q9tfytdh:owb2ugz9r77f6ydz@beech-4018235.us-east-1.bonsai.io:443/'], logs: true})
end