

  function deletePatient(patientId) {
    // Find the div with the matching data-patient-id attribute
    const patientDiv = document.querySelector(`[data-patient-id="${patientId}"]`);
    
    if (patientDiv) {
      // Remove the div from the DOM
      patientDiv.remove();
      
      // Make an API request to delete the patient from the database
      fetch(`/delete-patient/${patientId}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to delete patient from the database.');
          }
          window.location.reload()
          console.log('Patient deleted from the database.');
        })
        .catch((error) => {
          console.error('Error deleting patient from the database:', error);
        });
    }
  }

  function editPatient(patientId) {
    // Show the edit form/modal for the selected patient
    const editForm = document.getElementById(`editForm_${patientId}`);
    if (editForm) {
      editForm.style.display = 'block';
    }
  }
  function saveEditedPatient(patientId) {
    // Get the edited patient information from the edit form/modal
    const editedName = document.getElementById(`editedName_${patientId}`).value;
    const editedAge = document.getElementById(`editedAge_${patientId}`).value;
    const editedGender = document.getElementById(`editedGender_${patientId}`).value;
  
    // Make an API request to update the patient's information in the database
    fetch(`/edit-patient/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editedName,
        age: editedAge,
        gender: editedGender,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update patient information.');
        }
        console.log('Patient information updated in the database.');
      })
      .catch((error) => {
        console.error('Error updating patient information:', error);
      });
  
    // Hide the edit form/modal after saving
    const editForm = document.getElementById(`editForm_${patientId}`);
    if (editForm) {
      editForm.style.display = 'none';
    }
  }
    

  function goToDiagnosisPage(patientId) {
    // Construct the URL to the diagnosis page, including the patient's ID
    const diagnosisPageUrl = `/diagnosis?patientId=${patientId}`;
  
    // Redirect to the diagnosis page
    window.location.href = diagnosisPageUrl;
  }


  function saveDiagnosis() {
    // Get the patientId and diagnosis from the form
    const patientId = document.getElementById('patientId').value;
    const diagnosis = document.getElementById('diagnosis').value;
  
    // Create a data object with the diagnosis
    const data = {
      diagnosis: diagnosis,
    };
  
    // Send a POST request to save the diagnosis
    fetch(`/save-diagnosis/${patientId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to save diagnosis.');
        }
        console.log('Diagnosis saved successfully.');
  
        // Optionally, redirect back to the patient's page or perform any desired actions
      })
      .catch((error) => {
        console.error('Error saving diagnosis:', error);
      });
  }
function searchPatient() {
  const idCard = document.getElementById("searchIdCard").value;

  // Send an AJAX request to search for the patient by ID card
  fetch(`/searchPatientByIdCard?idCard=${idCard}`)
      .then(response => response.json())
      .then(data => {
          if (data.patient) {
              // Update the displayed patient information
              const patientInfo = document.getElementById("patientInfo");
              patientInfo.dataset.patientId = data.patient._id;
              patientInfo.innerHTML = `
              <div>
                  IdCard: ${data.patient.idCard}<br><br>
                  Name: ${data.patient.name}<br><br>
                  Age: ${data.patient.age}<br><br>
                  Gender: ${data.patient.gender}<br>
                  <button onclick="deletePatient('${data.patient._id}')" id="allButton">Delete</button> 
                  <button onclick="goToDiagnosisPage('${data.patient._id}')" id="allButton">See Diagnosis</button>
                  <button onclick="addDiagnosis('${data.patient._id}')" id="allButton">Add Diagnosis</button>
                </div>
              `;
          } else {
              window.alert("Patient not found.");
          }
      })
      .catch(error => {
          console.error(error);
      });
}


// Function to save a diagnosis
function saveDiagnosis() {
  const patientId = document.getElementById('patientId').value;
  const diagnosis = document.getElementById('diagnosis').value;

  fetch('/saveDiagnosis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ patientId, diagnosis }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Handle successful save, if needed
        console.log('Diagnosis saved successfully');
      } else {
        // Handle error, if needed
        console.error(data.message);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

// Function to display the last diagnosis
function displayLastDiagnosis() {
  const patientId = document.getElementById('patientId').value;

  fetch(`/getLastDiagnosis/${patientId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const lastDiagnosis = data.lastDiagnosis;
        // Display the last diagnosis as needed (e.g., update HTML element)
        document.getElementById('lastDiagnosis').textContent = lastDiagnosis;
      } else {
        // Handle error, if needed
        console.error(data.message);
      }
    })
    .catch(error => {
      console.error(error);
    });
}
function addDiagnosis(patientId) {
  const newDiagnosis = prompt('Enter diagnosis:');
  if (newDiagnosis !== null) {
      fetch('/addDiagnosis', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ patientId, diagnosis: newDiagnosis }),
      })
          .then(response => response.text())
          .then(message => {
              alert(message); // Show a success or error message
              // You may choose to update the displayed diagnoses here
          })
          .catch(error => {
              console.error(error);
              alert('Error adding diagnosis.');
          });
  }
}
function showDiagnosis(patientId) {
  // Redirect to the diagnosis page with the patient's ID as a parameter
  window.location.href = `/diagnosis/${patientId}`;
}
