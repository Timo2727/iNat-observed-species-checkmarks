// Load saved options
chrome.storage.sync.get(['username', 'greenColor', 'pinkColor'], (data) => {
  document.getElementById('username').value = data.username || '';
  document.getElementById('greenColor').value = data.greenColor || '#eaffea';
  document.getElementById('pinkColor').value = data.pinkColor || '#ffe6ff';
});

document.getElementById('save').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const greenColor = document.getElementById('greenColor').value;
  const pinkColor = document.getElementById('pinkColor').value;

  chrome.storage.sync.set({ username, greenColor, pinkColor }, () => {
    document.getElementById('status').textContent = 'Settings saved!';
    setTimeout(() => document.getElementById('status').textContent = '', 1500);
  });
});
