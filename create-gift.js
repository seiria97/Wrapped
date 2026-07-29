/* ==========================================================================
   CREATE-GIFT PAGE SCRIPT
   Handles occasion selection and the sticky continue bar. Loaded alongside
   the shared script.js (which handles the navbar, mobile menu, and
   scroll-reveal that this page also uses).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  var occasionGrid = document.getElementById('occasionGrid');
  var continueBtn = document.getElementById('continueBtn');
  var selectionHint = document.getElementById('selectionHint');
  var recipientInput = document.getElementById('recipientName');

  if (!occasionGrid || !continueBtn || !selectionHint) return;

  var occasionCards = occasionGrid.querySelectorAll('.occasion-card');
  var selectedOccasion = null;

  occasionCards.forEach(function (card) {
    card.addEventListener('click', function () {
      selectOccasion(card);
    });
  });

  if (recipientInput) {
    recipientInput.addEventListener('input', updateContinueState);
  }

  /**
   * Marks a single occasion card as selected (single-select) and
   * refreshes the continue bar to reflect the new state.
   */
  function selectOccasion(card) {
    occasionCards.forEach(function (c) { c.classList.remove('selected'); });
    card.classList.add('selected');
    selectedOccasion = card.getAttribute('data-occasion');
    updateContinueState();
  }

  /**
   * Enables the Continue button once an occasion is selected, and updates
   * the hint text to reflect current progress.
   */
  function updateContinueState() {
    var hasOccasion = !!selectedOccasion;
    var recipientName = recipientInput ? recipientInput.value.trim() : '';

    if (!hasOccasion) {
      selectionHint.textContent = 'Choose an occasion to continue';
    } else if (!recipientName) {
      selectionHint.textContent = selectedOccasion + ' selected — add a recipient name (optional)';
    } else {
      selectionHint.textContent = selectedOccasion + ' for ' + recipientName;
    }

    continueBtn.setAttribute('aria-disabled', hasOccasion ? 'false' : 'true');

    // Carry the selection forward to the next step via query params.
    if (hasOccasion) {
      var params = new URLSearchParams();
      params.set('occasion', selectedOccasion);
      if (recipientName) params.set('to', recipientName);
      continueBtn.setAttribute('href', 'editor.html?' + params.toString());
    } else {
      continueBtn.setAttribute('href', '#');
    }
  }

  // Prevent navigating onward before an occasion is chosen.
  continueBtn.addEventListener('click', function (event) {
    if (continueBtn.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      occasionGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
});
