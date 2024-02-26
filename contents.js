// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getCookie') {
    // Get the cookie from the current tab
    const cookie = document.cookie;
    const key = document.querySelector('.key-saver').textContent;
    const businessId = getCookie('businessId');
    const customers = document.querySelector('#customer-count b').textContent.replace(',','');
    let totalPages = 1;
    if (customers) {
      totalPages = Math.ceil(parseInt(customers) / 100);
    }
    const companyName = document.title.replace(/^Calmark - /, '');
    // Send back the cookie
    sendResponse({ cookie, key, businessId, totalPages, companyName });
  }
});


function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
