class Photo < ActiveRecord::Base
  def self.saveUserPhoto(file, user)
    require "base64"

    # directory = "public/photo/"

    # small_path    = directory + name + '_s.gif'
    # normal_path   = directory + name + '_n.jpg'
    # original_path = directory + name + '.jpg'

    image = MiniMagick::Image.read(file.read)

    # image.write original_path

    image.resize "150x150^"
    image.crop "150x150+0+0"
    image.format "jpg"

    enc   = image.to_blob()

    image.resize "60x60"
    image.format "gif"
    # image.write small_path

    enc_s = image.to_blob()

    user.update_attributes({photo: enc, photo_s: enc_s})


    #path = File.join(directory, name + '.jpg')            # create the file path     # Here is type appending, responsively with original filetype
    #File.open(path, "wb") { |f| f.write(file.read) }     # write the file
  end

  def self.savePostPhoto(file, name)
    directory = "public/photo/"

    small_path    = directory + name + '_s.jpg'
    big_path      = directory + name + '_b.jpg'
    original_path = directory + name + '.jpg'

    image_b = MiniMagick::Image.read(file.read)



    require "rubygems"
    require "google/api_client"
    require "google_drive"

# Authorizes with OAuth and gets an access token.
    client = Google::APIClient.new
    auth = client.authorization
    auth.client_id = "591850961799-aqfnchc5slomru688h6bje5f77r2nv6c.apps.googleusercontent.com"
    auth.client_secret = "spc5Vx3BoIfVC4a62teo2TsI"
    auth.scope = [
        "https://www.googleapis.com/auth/drive",
        "https://spreadsheets.google.com/feeds/"
    ]
    auth.redirect_uri = "urn:ietf:wg:oauth:2.0:oob"
    print("1. Open this page:\n%s\n\n" % auth.authorization_uri)
    print("2. Enter the authorization code shown in the page: ")
    auth.code = $stdin.gets.chomp
    auth.fetch_access_token!
    access_token = auth.access_token

# Creates a session.
    session = GoogleDrive.login_with_oauth(access_token)

# Gets list of remote files.
    for file in session.files
      p file.title
    end

# Uploads a local file.
    session.upload_from_file("/path/to/hello.txt", "hello.txt", :convert => false)

# Downloads to a local file.
    file = session.file_by_title("hello.txt")
    file.download_to_file("/path/to/hello.txt")

# Updates content of the remote file.
    file.update_from_file("/path/to/hello.txt")





    # require 'flickraw'
    #
    #
    # FlickRaw.api_key="f6bb4da0186965584d006a50bd8ddda1"
    # FlickRaw.shared_secret="3a5db878f922f55c"
    # token = flickr.get_request_token
    # auth_url = flickr.get_authorize_url(token['oauth_token'], :perms => 'delete')
    # verify = gets.strip
    #
    # begin
    #   flickr.get_access_token(token['oauth_token'], token['oauth_token_secret'], verify)
    #   login = flickr.test.login
    #   puts "You are now authenticated as #{login.username} with token #{flickr.access_token} and secret #{flickr.access_secret}"
    # rescue FlickRaw::FailedResponse => e
    #   puts "Authentication failed : #{e.msg}"
    # end
    #
    # image_b.write original_path
    # flickr.upload_photo 'u0.jpg', :title => "Title", :description => "This is the description"


    # image_b.resize "900x900^"
    # image_b.crop "900x900+450+0"
    # image_b.format "jpg"
    # image_b.write big_path
    #
    # image_s = MiniMagick::Image.open(original_path)
    # image_s.resize "250x200^"
    # image_s.crop "x200+0+0"
    # image_s.format "jpg"
    # image_s.write small_path


    #path = File.join(directory, name + '.jpg')            # create the file path     # Here is type appending, responsively with original filetype
    #File.open(path, "wb") { |f| f.write(file.read) }     # write the file
  end

  def self.del(name)
    directory = "public/photo"
    path = File.join(directory, name + '.jpg')

    File.open(path, "wb") { |f| f.write(file.read) }    #Change to delete
  end
end
