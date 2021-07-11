  
let db;

//create a new db request
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore("budgetStore", { autoIncrement: true });
    }
};

request.onsuccess = (e) => {
    console.log(`Success! ${event.type}`);
    if (navigator.onLine) {
        checkDB();
    }
};

request.onerror = (e) => {
    console.log(`Whoops ${e.target.errorCode}`);
};

const checkDB = () => {
    db = request.result;

    console.log("Checking Database!");

    //open transaction
    let transaction = db.transaction(['budgetStore'], 'readwrite');

    //access budgetStore object
    const store = transaction.objectStore('budgetStore');

    //get all records from store
    const getAll = store.getAll();

    //if request is successful
    getAll.onsuccess = () => {
        if(getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            }).then((response) => response.json())
            .then((res) => {
              // If our returned response is not empty
              if (res.length !== 0) {
                // Open another transaction to BudgetStore with the ability to read and write
                transaction = db.transaction(['budgetStore'], 'readwrite');
    
                // Assign the current store to a variable
                const currentStore = transaction.objectStore('budgetStore');
    
                // Clear existing entries because our bulk add was successful
                currentStore.clear();
                console.log('Clearing store');
              }
            });
        }
    };
};

const saveRecord = (record) => {
    db = request.result;

    console.log('Record saved!');

    const transaction = db.transaction(['budgetStore'], 'readwrite');

    const store = transaction.objectStore('budgetStore');

    store.add(record);
};

window.addEventListener('online', checkDB);
