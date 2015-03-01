Paperclip::Attachment.default_options[:url] = ':s3_domain_url'
Paperclip::Attachment.default_options[:s3_host_name] = 'sts.us-east-1.amazonaws.com'
Paperclip::Attachment.default_options[:path] = '/:class/:style/:filename'