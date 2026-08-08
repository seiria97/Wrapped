/* ==========================================================================
   WRITING STUDIO SCRIPT (editor.html)
   Handles text formatting, stickers, photo uploads, background themes,
   the side panel, and the wrap-up preview modal. Loaded alongside the
   shared script.js (navbar, mobile menu, scroll-reveal).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initTextFormatting();
  initStickers();
  initPhotoUpload();
  initThemeSelect();
  initPaperSwatches();
  initDecorationChips();
  initMusicOptions();
  initSignature();
  initWrapFlow();
  prefillFromQueryString();
});

/* ---------- Carry occasion/recipient over from create-gift.html ---------- */
function prefillFromQueryString() {
  var params = new URLSearchParams(window.location.search);
  var recipient = params.get('to');
  var recipientField = document.getElementById('recipientNameField');
  if (recipient && recipientField && !recipientField.value) {
    recipientField.value = recipient;
  }
}

/* ---------- Font style, size, alignment ---------- */
function initTextFormatting() {
  var messageArea = document.getElementById('messageArea');
  var dearLine = document.getElementById('dearLine');
  var fontSelect = document.getElementById('fontSelect');
  var sizeSelect = document.getElementById('sizeSelect');
  var alignButtons = document.querySelectorAll('.toolbar-btn[data-align]');
  if (!messageArea) return;

  fontSelect.addEventListener('change', function () {
    messageArea.classList.remove('font-elegant', 'font-modern');
    dearLine.classList.remove('font-elegant', 'font-modern');
    if (fontSelect.value === 'elegant') {
      messageArea.classList.add('font-elegant');
      dearLine.classList.add('font-elegant');
    } else if (fontSelect.value === 'modern') {
      messageArea.classList.add('font-modern');
      dearLine.classList.add('font-modern');
    }
  });

  sizeSelect.addEventListener('change', function () {
    messageArea.classList.remove('size-small', 'size-medium', 'size-large');
    messageArea.classList.add('size-' + sizeSelect.value);
  });

  alignButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      alignButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      messageArea.style.textAlign = btn.getAttribute('data-align');
    });
  });
}

/* ---------- Stickers: toolbar popover + side-panel chips, both drop onto the paper ---------- */
function initStickers() {
  var stickerToggle = document.getElementById('stickerToggle');
  var stickerPopover = document.getElementById('stickerPopover');
  var stickerLayer = document.getElementById('stickerLayer');
  var diaryPaper = document.getElementById('diaryPaper');
  if (!stickerLayer || !diaryPaper) return;

  if (stickerToggle && stickerPopover) {
    stickerToggle.addEventListener('click', function (event) {
      event.stopPropagation();
      var isOpen = stickerPopover.classList.toggle('open');
      stickerToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', function (event) {
      if (!stickerPopover.contains(event.target) && event.target !== stickerToggle) {
        stickerPopover.classList.remove('open');
        stickerToggle.setAttribute('aria-expanded', 'false');
      }
    });

    stickerPopover.querySelectorAll('button[data-sticker]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        placeSticker(btn.getAttribute('data-sticker'));
        stickerPopover.classList.remove('open');
        stickerToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Side-panel "Decorations" chips also drop a sticker (and toggle selected style)
  document.querySelectorAll('.chip[data-sticker]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      chip.classList.toggle('selected');
      placeSticker(chip.getAttribute('data-sticker'));
    });
  });

  // Line-art icon paths for each sticker type — kept in sync with the
  // matching icons drawn inline in the toolbar popover and side-panel chips.
  var STICKER_ICONS = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5c-4.8-3-9-6.6-9-11A5 5 0 0 1 12 6a5 5 0 0 1 9 3.5c0 4.4-4.2 8-9 11z"/></svg>',
    flower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M12 10c-1.3-1.7-1.3-4 0-5.3 1.3 1.3 1.3 3.6 0 5.3z"/><path d="M12 14c1.3 1.7 1.3 4 0 5.3-1.3-1.3-1.3-3.6 0-5.3z"/><path d="M10 12c-1.7-1.3-4-1.3-5.3 0 1.3 1.3 3.6 1.3 5.3 0z"/><path d="M14 12c1.7-1.3 4-1.3 5.3 0-1.3 1.3-3.6 1.3-5.3 0z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2-4.8-4.3 6.4-.6z"/></svg>',
    ribbon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12C7 6 3 7 3 10c0 3 5 3 9 2Z"/><path d="M12 12c5-6 9-5 9-2 0 3-5 3-9 2Z"/><circle cx="12" cy="12" r="1.4"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c0-6-4-8-4-12a4 4 0 0 1 8 0c0 4-4 6-4 12z"/><path d="M12 9V5"/></svg>'
  };

  /**
   * Drops a new sticker onto the diary paper at a gentle random spot and
   * makes it draggable via pointer events. `key` is one of STICKER_ICONS
   * (heart/flower/star/ribbon/leaf) so the placed mark stays consistent
   * hand-drawn line-art rather than a raw emoji glyph.
   */
  function placeSticker(key) {
    var sticker = document.createElement('span');
    sticker.className = 'placed-sticker';
    sticker.innerHTML = STICKER_ICONS[key] || STICKER_ICONS.heart;

    var top = 8 + Math.random() * 70;
    var left = 8 + Math.random() * 78;
    sticker.style.top = top + '%';
    sticker.style.left = left + '%';

    makeDraggable(sticker, diaryPaper);
    stickerLayer.appendChild(sticker);
  }
}

/**
 * Minimal pointer-based drag: moves `el` freely within `container`'s
 * bounds using percentage offsets so it stays put on resize.
 */
function makeDraggable(el, container) {
  var dragging = false;

  el.addEventListener('pointerdown', function (event) {
    dragging = true;
    el.setPointerCapture(event.pointerId);
  });

  el.addEventListener('pointermove', function (event) {
    if (!dragging) return;
    var rect = container.getBoundingClientRect();
    var xPct = ((event.clientX - rect.left) / rect.width) * 100;
    var yPct = ((event.clientY - rect.top) / rect.height) * 100;
    xPct = Math.max(0, Math.min(94, xPct));
    yPct = Math.max(0, Math.min(94, yPct));
    el.style.left = xPct + '%';
    el.style.top = yPct + '%';
  });

  ['pointerup', 'pointercancel'].forEach(function (evt) {
    el.addEventListener(evt, function () { dragging = false; });
  });
}

/* ---------- Photo upload: toolbar button + in-paper slot both use the same input ---------- */
function initPhotoUpload() {
  var photoSlot = document.getElementById('photoSlot');
  var photoInput = document.getElementById('photoInput');
  var toolbarBtn = document.getElementById('addPhotoToolbarBtn');
  if (!photoSlot || !photoInput) return;

  photoSlot.addEventListener('click', function () { photoInput.click(); });
  if (toolbarBtn) toolbarBtn.addEventListener('click', function () { photoInput.click(); });

  photoInput.addEventListener('change', function () {
    var file = photoInput.files && photoInput.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (event) {
      photoSlot.innerHTML = '';
      var img = document.createElement('img');
      img.src = event.target.result;
      img.alt = 'Uploaded photo';
      photoSlot.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- Background theme (toolbar dropdown) ---------- */
function initThemeSelect() {
  var themeSelect = document.getElementById('themeSelect');
  var diaryPaper = document.getElementById('diaryPaper');
  if (!themeSelect || !diaryPaper) return;

  themeSelect.addEventListener('change', function () {
    diaryPaper.setAttribute('data-theme', themeSelect.value);
  });
}

/* ---------- Paper style swatches (side panel) ---------- */
function initPaperSwatches() {
  var swatches = document.querySelectorAll('.swatch[data-paper]');
  var diaryPaper = document.getElementById('diaryPaper');
  if (!swatches.length || !diaryPaper) return;

  var paperColors = {
    vintage: null, // uses the theme's own background
    kraft: '#E7D9C4',
    linen: '#EFEAE2',
    blush: '#F6E3DE'
  };

  swatches.forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      swatches.forEach(function (s) { s.classList.remove('selected'); });
      swatch.classList.add('selected');

      var key = swatch.getAttribute('data-paper');
      if (paperColors[key]) {
        diaryPaper.style.backgroundColor = paperColors[key];
      } else {
        diaryPaper.style.backgroundColor = '';
      }
    });
  });
}

/* ---------- Decoration chips just reuse the sticker selected-state toggle ---------- */
function initDecorationChips() {
  // Click handling lives in initStickers(); nothing further needed here.
}

/* ---------- Music mood picker (UI-only — no audio files bundled) ---------- */
function initMusicOptions() {
  var options = document.querySelectorAll('.music-option');
  if (!options.length) return;

  options.forEach(function (option) {
    option.addEventListener('click', function () {
      options.forEach(function (o) { o.classList.remove('selected'); });
      option.classList.add('selected');
    });
  });

  // "No music" selected by default
  var noneOption = document.querySelector('.music-option[data-music="none"]');
  if (noneOption) noneOption.classList.add('selected');
}

/* ---------- Signature: live preview on the paper ---------- */
function initSignature() {
  var signatureInput = document.getElementById('signatureInput');
  var signaturePreview = document.getElementById('signaturePreview');
  if (!signatureInput || !signaturePreview) return;

  signatureInput.addEventListener('input', function () {
    var value = signatureInput.value.trim();
    signaturePreview.textContent = value;
    signaturePreview.classList.toggle('visible', value.length > 0);
  });
}

/* ---------- Wrap flow: opens the preview modal with a snippet of the letter ---------- */
function initWrapFlow() {
  var wrapBtn = document.getElementById('wrapBtn');
  var overlay = document.getElementById('wrapModalOverlay');
  var closeBtn = document.getElementById('wrapModalClose');
  var previewLine = document.getElementById('wrapPreviewLine');
  var recipientField = document.getElementById('recipientNameField');
  var messageArea = document.getElementById('messageArea');
  var wrapHint = document.getElementById('wrapHint');
  if (!wrapBtn || !overlay) return;

  function updateHint() {
    var hasMessage = messageArea && messageArea.value.trim().length > 0;
    wrapHint.textContent = hasMessage
      ? 'Looking beautiful — ready when you are.'
      : 'Write a little something to wrap your gift.';
  }
  if (messageArea) messageArea.addEventListener('input', updateHint);
  updateHint();

  wrapBtn.addEventListener('click', function () {
    var name = (recipientField && recipientField.value.trim()) || 'someone special';
    var message = (messageArea && messageArea.value.trim()) || '';
    var snippet = message.length > 90 ? message.slice(0, 90).trim() + '…' : message;

    previewLine.textContent = snippet
      ? '"Dear ' + name + ', ' + snippet + '"'
      : '"Dear ' + name + ', your letter is waiting to be written."';

    overlay.classList.add('open');
    requestAnimationFrame(function () {
      overlay.classList.add('visible');
    });
  });

  function closeModal() {
    overlay.classList.remove('visible');
    setTimeout(function () { overlay.classList.remove('open'); }, 350);
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
}
