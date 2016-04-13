OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, "591850961799-ksoc5j1j415q94d8n8ha64o3v2986ldm.apps.googleusercontent.com", "mjST6bmYyY5hlte1B0Cw8VAZ", scope: 'profile', image_aspect_ratio: 'square', image_size: 48, access_type: 'online'
end