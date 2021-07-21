let db;
let budgetVersion;

// Create a new db request for a "budget" database.
const request = indexedDB.open('BudgetDB', budgetVersion || 21);

request.onupgradeneeded = function (e) {
  console.log('Upgrade needed in IndexDB');

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetTracker', { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log('check db invoked');
  db=request.result;
  let transaction = db.transaction(['BudgetTracker'], 'readwrite');

  const store = transaction.objectStore('BudgetTracker');

  const getAll = store.getAll();
  
  getAll.onsuccess = function () {
  
    console.log(getAll.result.length.toString());
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) =>   response.json())
        .then((res) => {
  
          if (res.length !== 0) {
  
            const transaction = db.transaction(['BudgetTracker'], 'readwrite');

            const currentStore = transaction.objectStore('BudgetTracker');

            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log('success');
  db = e.target.result;

  if (navigator.onLine) {
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  console.log(record)
  
  const transaction = db.transaction(['BudgetTracker'], 'readwrite');
  
           
  

  const store = transaction.objectStore('BudgetTracker');

  store.add(record);
};

window.addEventListener('online', checkDatabase);
