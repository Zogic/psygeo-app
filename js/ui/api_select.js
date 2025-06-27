
console.log('[load] api_select.js');

//API visibility
const apiInput       = document.getElementById('apiKey');
const toggleBtn      = document.getElementById('toggleApiVisibility');
const toggleIcon = document.getElementById('toggleIcon');

toggleBtn.addEventListener('click', () => {
  const isHidden = apiInput.type === 'password';
  apiInput.type  = isHidden ? 'text' : 'password';

  if (isHidden) {
    // показываем «закрытый» глаз
    toggleIcon.classList.remove('fi-ss-eye');
    toggleIcon.classList.add('fi-ss-eye-crossed');
  } else {
    // возвращаем «открытый» глаз
    toggleIcon.classList.remove('fi-ss-eye-crossed');
    toggleIcon.classList.add('fi-ss-eye');
  }
});