// We can deal with iframe uploads using this URL:
var options = {iframe: {url: 'upload.php'}}
// 'zone' is an ID but you can also give a DOM node:
var zone = new FileDrop('zbasic', options)

// Do something when a user chooses or drops a file:
zone.event('send', function (files) {
  // FileList might contain multiple items.
  files.each(function (file) {
    // Send the file:
    file.sendTo('upload.php')
  })
})