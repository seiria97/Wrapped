document.addEventListener('DOMContentLoaded', function () {
  var params = new URLSearchParams(window.location.search);
  var occasion = params.get('occasion') || 'A special';
  var recipient = params.get('to') || 'someone special';
  var title = document.getElementById('giftTitle');
  var message = document.getElementById('giftMessage');
  var titlePreview = document.getElementById('previewTitle');
  var messagePreview = document.getElementById('previewMessage');
  var characterCount = document.getElementById('characterCount');
  var photoInput = document.getElementById('photoInput');
  var photoList = document.getElementById('photoList');
  var previewPhotos = document.getElementById('previewPhotos');
  var giftPreview = document.getElementById('giftPreview');
  var files = [];

  document.getElementById('previewOccasion').textContent = occasion;
  document.getElementById('previewRecipient').textContent = recipient;
  document.getElementById('recipientPrompt').textContent = 'Write a note for ' + recipient + '.';
  title.placeholder = occasion + ' wishes for ' + recipient;

  function updateTextPreview() {
    titlePreview.textContent = title.value.trim() || 'A little something for you.';
    messagePreview.textContent = message.value.trim() || 'Your words will appear here, ready to make someone smile.';
    characterCount.textContent = message.value.length;
  }
  title.addEventListener('input', updateTextPreview);
  message.addEventListener('input', updateTextPreview);

  photoInput.addEventListener('change', function () {
    files = files.concat(Array.prototype.slice.call(photoInput.files).filter(function (file) { return file.type.indexOf('image/') === 0; })).slice(0, 4);
    photoInput.value = '';
    renderPhotos();
  });
  function renderPhotos() {
    photoList.innerHTML = '';
    previewPhotos.innerHTML = '';
    if (!files.length) { previewPhotos.innerHTML = '<div class="preview-placeholder">Your memories</div>'; return; }
    files.forEach(function (file, index) {
      var url = URL.createObjectURL(file);
      var item = document.createElement('div'); item.className = 'photo-chip';
      item.innerHTML = '<img alt="Selected memory"><button type="button" aria-label="Remove photo">×</button>';
      item.querySelector('img').src = url;
      item.querySelector('button').addEventListener('click', function () { files.splice(index, 1); renderPhotos(); });
      photoList.appendChild(item);
      var preview = document.createElement('img'); preview.src = url; preview.alt = 'Gift memory'; previewPhotos.appendChild(preview);
    });
  }
  document.querySelectorAll('.theme-option').forEach(function (button) {
    button.addEventListener('click', function () {
      document.querySelectorAll('.theme-option').forEach(function (option) { option.classList.remove('selected'); });
      button.classList.add('selected');
      giftPreview.className = 'gift-preview-card theme-' + button.dataset.theme;
    });
  });
  document.getElementById('giftForm').addEventListener('submit', function (event) {
    event.preventDefault();
    localStorage.setItem('wrappedGift', JSON.stringify({ occasion: occasion, recipient: recipient, title: title.value, message: message.value, theme: giftPreview.className }));
    document.getElementById('successDialog').hidden = false;
  });
  document.getElementById('closeDialog').addEventListener('click', function () { document.getElementById('successDialog').hidden = true; });
});
