document.getElementById('dataForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  // Get key, businessId, and totalPages from the form
  // const totalPages = document.getElementById('totalPages').value;

  // Send a message to the content script to retrieve the cookie
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getCookie' }, function(response) {
      const { cookie, key, businessId, totalPages, companyName } = response;
      // Send message to background script with all required data
      chrome.runtime.sendMessage({ cookie, key, businessId, totalPages, companyName });
    });
  });

  // Update progress bar
  const progressBar = document.querySelector('.progress');
  progressBar.style.width = '0%'; // Reset progress bar
  progressBar.textContent = '0%'; // Reset progress text
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'downloadData') {
    downloadDataToExcel(message.userData, message.companyName);
  } else if (message.action === 'progressUpdate') {
    // Update progress bar
    const progressBar = document.querySelector('.progress');
    const progress = (message.currentPage / message.totalPages) * 100;
    progressBar.style.width = progress + '%';
    progressBar.textContent = progress.toFixed(2) + '%';
  }
});

function downloadDataToExcel(userData, companyName) {
  // Convert userData to Excel format (assuming it's an array of objects)
  const ws = XLSX.utils.json_to_sheet(userData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Convert the workbook to a binary Excel file
  const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

  // Create a Blob from the buffer
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  // Create a temporary link to trigger the download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customers_data_${companyName}.xlsx`;
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);
}
