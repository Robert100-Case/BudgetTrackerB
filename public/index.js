let transactions = [];
let myChart;
let sampleArray=[{key:1,color:"red"},{key:2, color:"blue"}];
let testArray=[];
let indexedDbArray=[];
/*alert(sampleArray[1].color);

sampleArray.push({key:3,color:"green"});
alert(sampleArray[2].color);
*/

indexDbToMongo();

function indexDbToMongo(){

const request = window.indexedDB.open("toDoList", 1);

      // Create schema
      request.onupgradeneeded = event => {
        const db = event.target.result;
        
        // Creates an object store with a listID keypath that can be used to query on.
        const toDoListItems = db.createObjectStore("toDoList", {keyPath: "listID"});
        // Creates a statusIndex that we can query on.
        toDoListItems.createIndex("statusIndex", "status"); 
      }

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["toDoList"], "readwrite");
        const toDoListItems = transaction.objectStore("toDoList");
        const statusIndex = toDoListItems.index("statusIndex");
  
        const getCursorRequest = toDoListItems.openCursor();
        getCursorRequest.onsuccess = e => {
          const cursor = e.target.result;
          if (cursor) {
            //alert("entered cursor code");
            console.log(cursor.value);
            indexedDbArray.name=cursor.value.status.name;
            indexedDbArray.value=cursor.value.status.value;
            indexedDbArray.date=cursor.value.status.date;
            testArray.push(indexedDbArray);
                        
            cursor.continue();
          } else {
            console.log("No documents left!");
          }
          //alert(testArray[0].name); 
            
        
        }}

fetch("/api/transaction/bulk", {
  method: "POST",
  body: JSON.stringify(testArray),//transaction
  headers: {
    Accept: "application/json, text/plain, *//*",
    "Content-Type": "application/json"
    
  }
  
})
.then(response => {    
  alert(response);
  return response.json();
  
})
.then(data => {
  if (data.errors) {
    errorEl.textContent = "Missing Information";
  }
  else {
    // clear form
    //nameEl.value = "";
    //amountEl.value = "";
  }
})
.catch(err => {
  // fetch failed, so save in indexed db
  alert("server offline");
  //saveRecord(transaction);

  // clear form
  //nameEl.value = "";
  //amountEl.value = "";
});
}

function saveRecord(transactionData)
{
  const request = window.indexedDB.open("toDoList", 1);

  // Create schema
  request.onupgradeneeded = event => {
    const db = event.target.result;
    
    // Creates an object store with a listID keypath that can be used to query on.
    const toDoListItems = db.createObjectStore("toDoList", {keyPath: "listID"});
    // Creates a statusIndex that we can query on.
    toDoListItems.createIndex("statusIndex", "status"); 
  }

  request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(["toDoList"], "readwrite");
          const toDoListItems = transaction.objectStore("toDoList");
          const statusIndex = toDoListItems.index("statusIndex");
    
  

        toDoListItems.add({ listID: transactionData.name, status: transactionData });
        alert("record saved in indexdb");
      }
}



fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // save db data on global variable
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
      data: {
        labels,
        datasets: [{
            label: "Total Over Time",
            fill: true,
            backgroundColor: "#6666ff",
            data
        }]
    }
  });
}

function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();
 
 
  
  // also send to server
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
  .then(response => {    
    return response.json();
  })
  .then(data => {
    if (data.errors) {
      errorEl.textContent = "Missing Information";
    }
    else {
      // clear form
      nameEl.value = "";
      amountEl.value = "";
    }
  })
  .catch(err => {
    // fetch failed, so save in indexed db
    alert("server offline");
    saveRecord(transaction);

    // clear form
    nameEl.value = "";
    amountEl.value = "";
  });
}

document.querySelector("#add-btn").onclick = function() {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
  sendTransaction(false);
};





  