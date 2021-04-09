// Saves options to chrome.storage
function save_options() {
    let opShowAllChars = document.getElementById('opShowAllChars').checked;
    chrome.storage.sync.set({
      showAllChars: opShowAllChars
    }, function() {
      // Update status to let user know options were saved.
      let saveStatus = document.getElementById('saveStatus');
      saveStatus.textContent = 'Options saved.';
      setTimeout(function() {
        saveStatus.textContent = '';
      }, 750);
    });
  }

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value
    chrome.storage.sync.get({
      showAllChars: false
    }, function(items) {
      document.getElementById('opShowAllChars').checked = items.showAllChars;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('saveButton').addEventListener('click',
      save_options);