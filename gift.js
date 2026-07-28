document.addEventListener('DOMContentLoaded', function () {
  var gift;
  try { gift = JSON.parse(decodeURIComponent(escape(atob(window.location.hash.slice(1))))); } catch (error) { gift = null; }
  if (!gift) return;
  document.title = (gift.title || 'A Gift for You') + ' — Wrapped';
  document.getElementById('giftOccasion').textContent = gift.occasion || 'A special gift';
  document.getElementById('giftRecipient').textContent = gift.recipient || 'you';
  document.getElementById('giftTitle').textContent = gift.title || 'A little something for you.';
  document.getElementById('giftMessage').textContent = gift.message || 'Someone made you a gift with Wrapped.';
  var card = document.getElementById('receivedGift');
  card.classList.remove('theme-blush', 'theme-lavender', 'theme-sage', 'theme-gold');
  card.classList.add(gift.theme || 'theme-blush');
});
