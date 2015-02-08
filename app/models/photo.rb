class Photo < ActiveRecord::Base
  def self.saveUserPhoto(file, name)
    directory = "public/photo/"

    small_path    = directory + name + '_s.gif'
    normal_path   = directory + name + '_n.jpg'
    original_path = directory + name + '.jpg'

    image = MiniMagick::Image.read(file.read)

    image.write original_path

    image.resize "150x150^"
    image.crop "150x150+0+0"
    image.format "jpg"
    image.write normal_path

    image.resize "60x60"
    image.format "gif"
    image.write small_path


    #path = File.join(directory, name + '.jpg')            # create the file path     # Here is type appending, responsively with original filetype
    #File.open(path, "wb") { |f| f.write(file.read) }     # write the file
  end

  def self.savePostPhoto(file, name)
    directory = "public/photo/"

    small_path    = directory + name + '_s.jpg'
    big_path      = directory + name + '_b.jpg'
    original_path = directory + name + '.jpg'

    image_b = MiniMagick::Image.read(file.read)
    image_b.write original_path

    image_b.resize "900x900^"
    image_b.crop "900x900+450+0"
    image_b.format "jpg"
    image_b.write big_path

    image_s = MiniMagick::Image.open(original_path)
    image_s.resize "250x200^"
    image_s.crop "x200+0+0"
    image_s.format "jpg"
    image_s.write small_path


    #path = File.join(directory, name + '.jpg')            # create the file path     # Here is type appending, responsively with original filetype
    #File.open(path, "wb") { |f| f.write(file.read) }     # write the file
  end

  def self.del(name)
    directory = "public/photo"
    path = File.join(directory, name + '.jpg')

    File.open(path, "wb") { |f| f.write(file.read) }    #Change to delete
  end
end
