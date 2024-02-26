chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.match(/https:\/\/calmark\.co\.il\/Admin\/Customers\.aspx\/GetCustomers/)) {
      // Process request details (headers, body)
    }
  },
  { urls: ["<all_urls>"] }, // Match all URLs (optional)
  ["blocking"]
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.url.includes("Admin/Customers.aspx/GetCustomers")) {
      const cookies = details.responseHeaders.find((header) => header.name === "cookie").value;
      const key = details.responseHeaders.find((header) => header.name === "key").value;
      chrome.runtime.sendMessage({ cookies, key });
    }
  },
  { urls: ["https://calmark.co.il/Admin/Customers.aspx/GetCustomers"] },
  ["blocking", "responseHeaders"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (details.url.includes("Admin/Customers.aspx/GetCustomers")) {
      const businessId = JSON.parse(details.requestBody.raw[0].data).businessId;
      chrome.runtime.sendMessage({ businessId });
    }
  },
  { urls: ["https://calmark.co.il/Admin/Customers.aspx/GetCustomers"] },
  ["blocking", "requestBody"]
);
