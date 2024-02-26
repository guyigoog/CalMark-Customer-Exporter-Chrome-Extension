chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
  if (message.cookie && message.key && message.businessId && message.totalPages) {
    const allUserData = await fetchData(message.cookie, message.key, message.businessId, message.totalPages);
    chrome.runtime.sendMessage({ action: "downloadData", userData: allUserData, companyName: message.companyName });
  }

});

async function fetchData(cookie, key, businessId, totalPages) {
  const headers = {
    'authority': 'calmark.co.il',
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'no-cache',
    'content-type': 'application/json; charset=UTF-8',
    'cookie': cookie,
    'key': key,
    'origin': 'https://calmark.co.il',
    'pragma': 'no-cache',
    'referer': 'https://calmark.co.il/admin/customers',
    'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest'
  };

  let allUserData = [];
  // Function to fetch data for a given page
  async function fetchPageData(pageNum) {
    const data = {
      "itemsPerPage": 100,
      "currentPage": pageNum,
      "businessId": businessId
    };
    const response = await fetch('https://calmark.co.il/Admin/Customers.aspx/GetCustomers', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    const jsonData = await response.json();
    const parsedData = JSON.parse(jsonData.d);
    return parsedData.Data;
  }

  // Fetch data from each page and append to allUserData
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    debugger;
    console.log(`Fetching data for page ${pageNum}...`);
    const pageData = await fetchPageData(pageNum);
    const usersOnPage = pageData.map(entry => entry.User);
    allUserData.push(...usersOnPage);

    // Send progress update message
    chrome.runtime.sendMessage({ action: 'progressUpdate', currentPage: pageNum, totalPages: totalPages });
  }

  return allUserData;
}
