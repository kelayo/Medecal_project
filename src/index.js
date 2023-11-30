const express = require("express")
const path = require("path")
const app = express()
const hbs = require("hbs")
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const exphbs = require('express-handlebars');

const mongoose = require("mongoose");

// Connect to the first database
const db1 = mongoose.createConnection("mongodb://127.0.0.1:27017/LoginFormPracticeD", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db1.on("error", (error) => {
  console.error("Failed to connect to database 1:", error);
});

db1.once("open", () => {
  console.log("Connected to database 1");
});
// Connect to the second database
const db2 = mongoose.createConnection("mongodb://127.0.0.1:27017/LoginFormPracticeP", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
db2.on("error", (error) => {
  console.error("Failed to connect to database 2:", error);
});

db2.once("open", () => {
  console.log("Connected to database 2");
});

// Define a schema and model for the second database
const logInSchemaP = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required:true,
  },
  gender: {
    type: String,
    required:true,
  },
  idCard:{
    type: String,
    required:true,
  },
  idDoc: {
    type: String,
    required:true,
  },
  diagnosis: {
    type: String,
    required:true,
  }

});

const LogInCollectionP = db2.model('LogInCollectionP', logInSchemaP);

const appointmentSchema = new mongoose.Schema({
  appointmentDate: {
    type: Date,
    required: true,
  }, // Date and time of the appointment
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LogInCollectionP', // Reference to the patient who booked the appointment
  },
});



const logInSchemaD = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    speciality: {
      type: String, 
      required: true,
    },
    idCard :{
      type: String, 
      required: true,
    },
    idnum : {
      type: Number, 
      required: true,
    },
    patients: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LogInCollectionP',
        },
      ],
    appointments: [appointmentSchema],
  });

const LogInCollectionD = db1.model('LogInCollectionD', logInSchemaD);








async function addPatientsToDoctors() {
    try {
      // Find all patients
      const patients = await LogInCollectionP.find();
  
      // Iterate through each patient
      for (const patient of patients) {
        // Find the corresponding doctor by name
        const doctor = await LogInCollectionD.findOne({ idnum: patient.idDoc });
  
        if (doctor) {
          // Check if the patient is not already in the doctor's patients array
          const patientExists = doctor.patients.some((p) => p._id.equals(patient._id));
  
          if (!patientExists) {
            // Create an object with patient information and push it to the doctor's patients array
            const patientInfo = {
              _id: patient._id,
              name: patient.name,
              age: patient.age,
              gender: patient.gender,
              idDoc:patient.idDoc,
              idCard:patient.idCard,
              diagnosis:patient.diagnosis
              // Add other patient properties here
            };
            doctor.patients.push(patientInfo);
  
            // Save the updated doctor
            await doctor.save();
          }
        }
      }
  
      console.log('Patients added to doctors.');
    } catch (error) {
      console.error('Error adding patients to doctors:', error);
    }
  }







const port = process.env.PORT || 3002
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

const tempelatePath = path.join(__dirname, '../tempelates')
const publicPath = path.join(__dirname, '../public')
console.log(publicPath);

app.set('view engine', 'hbs')
app.set('views', tempelatePath)
app.use(express.static(publicPath))

app.use(bodyParser.urlencoded({ extended: true }));




app.get('/signupd', (req, res) => {
    res.render('signupd')
})
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/logind', (req, res) => {
    res.render('logind')
})


app.post('/signupd', async (req, res) => {
  const data = {
      name: req.body.name,
      password: req.body.password,
      speciality: req.body.specialty,
      idCard: req.body.idCard,
      idnum: Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000
  }

  const checking = await LogInCollectionD.findOne({ idCard: req.body.idCard })

  try {
      if (checking) {
          if (checking.idCard === req.body.idCard) {
              const alertMessage = "Doctor with the same ID card already exists! Please try another ID card.";
              return res.render('logind', { errorMessage: alertMessage });
          } else {
              await LogInCollectionD.insertMany([data]);
              return res.render('logind');
          }
      } else {
          await LogInCollectionD.insertMany([data]);
          return res.render('logind');
      }
  } catch (error) {
      console.error(error); // Log the error message to the console
      res.send("Error occurred during signup.");
  }
})


app.post('/logind', async (req, res) => {
  try {
      const check = await LogInCollectionD.findOne({
          idCard: req.body.idCard,
          password: req.body.password
      });

      if (!check) {
          // Show a pop-up message if the doctor is not found or password is incorrect
          const alertMessage = "Doctor not found or incorrect credentials! Please try again.";
          return res.render('logind', { errorMessage: alertMessage });
      }

      const appear = [];

      // Find all patients associated with the doctor
      const patients = await LogInCollectionP.find({ idDoc: check.idnum });

      // Iterate through each patient
      for (const patient of patients) {
          appear.push(patient);
      }

      return res.render('home', {
          naming: check.name,
          speciality: check.speciality,
          length: check.patients.length,
          idcard:check.idCard,
          appear
      });
  } catch (e) {
      return res.send("Error: " + e.message);
  }
});


app.get('/logout', (req, res) => {


    // For a basic example without session management, you can redirect to the login page
    res.redirect('/');
});



app.listen(port, () => {
    console.log('port connected');
})




//****************************************** */


app.get('/signupP', (req, res) => {
    res.render('signupP')
})
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/loginP', (req, res) => {
    res.render('loginP')
})



app.post('/signupP', async (req, res) => {
  const data = {
      name: req.body.name,
      password: req.body.password,
      age: req.body.age,
      gender: req.body.gender,
      idCard: req.body.idCard,
      idDoc: req.body.idDoc,
      diagnosis: " ",
  }

  // Check if the doctor with the specified idNum exists
  const doctorExists = await LogInCollectionD.exists({ idnum: req.body.idDoc });

  try {
      if (doctorExists) {
          // Check if a patient with the same idCard and idDoc already exists
          const patientExists = await LogInCollectionP.exists({ idCard: req.body.idCard});

          if (patientExists) {
              const alertMessage = "Patient with the same ID card already exists.";
              return res.render('signupP', { errorMessage: alertMessage });
          } else {
              await LogInCollectionP.insertMany([data]);
              // Call addPatientsToDoctors() after user data is inserted.
              await addPatientsToDoctors();
              res.status(201).render("loginp", { naming: req.body.name });
          }
      } else {
          const alertMessage = "Doctor with the specified ID number does not exist.";
          return res.render('signupP', { errorMessage: alertMessage });
      }
  } catch {
      res.send("Error occurred during patient signup.");
  }
});
// Function to generate time options
function generateTimeOptions() {
  const timeOptions = [];
  const today = new Date();
  today.setHours(9, 0, 0, 0); // Set the time to 9:00 AM
  const endTime = new Date();
  endTime.setHours(17, 0, 0, 0); // Set the time to 5:00 PM
  const hourInterval = 60 * 60 * 1000; // 1 hour in milliseconds

  while (today <= endTime) {
    // Format time as "9:00 AM" and push to options
    const formattedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    timeOptions.push(formattedTime);
    today.setTime(today.getTime() + hourInterval);
  }

  return timeOptions;
}


app.post('/loginP', async (req, res) => {
  try {
      const check = await LogInCollectionP.findOne({ idCard: req.body.idCard });

      if (check && check.password === req.body.password) {
          const doc = await LogInCollectionD.findOne({idnum:check.idDoc});
          res.status(201).render("appointments",{doctorName:doc.name,patientId:check._id,namep:check.name,agep:check.age,genderp:check.gender,idcard:check.idCard,patientid:check._id, timeOptions:generateTimeOptions(),idcardi:doc._id});
      } else {
          // res.send("Incorrect ID card or password.");
          const alertMessage = "Incorrect ID card or password.";
          return res.render('logind', { errorMessage: alertMessage });
      }
  } catch (e) {
      res.send("Wrong details");
  }
});



const router = express.Router();
// const Patient = mongoose.model('LogInCollectionP'); // Assuming this is your Patient model


// Define a route to fetch data from MongoDB and render it using Handlebars
app.get('/patients', async (req, res) => {
  try {
    // Fetch data from MongoDB
    const patients = await LogInCollectionP.find().exec();

    // Render a Handlebars template with the data
    res.render('home', { patients }); // Use your Handlebars template name
  } catch (error) {
    // Handle any errors here
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


const async = require('async'); // Import the 'async' module
const { logging_v2 } = require("googleapis");

// app.delete('/delete-patient/:patientId', async (req, res) => {
//   try {
//     const patientId = req.params.patientId;

//     // Assuming you have Mongoose models for patients in both collections (replace with your actual model names)
//     const deletedPatientP = await LogInCollectionP.findByIdAndRemove(patientId);
//     const deletedPatientD = await LogInCollectionD.findByIdAndRemove(patientId);

//     // Use the 'async' library to run the deletion operations in parallel
//     async.parallel([
//       (callback) => {
//         // Remove the patient from LogInCollectionP
//         LogInCollectionP.findByIdAndRemove(patientId, callback);
//       },
//       (callback) => {
//         // Remove the patient from LogInCollectionD
//         LogInCollectionD.findByIdAndRemove(patientId, callback);
//       },
//     ], (err, results) => {
//       if (err) {
//         console.error('Error deleting patient:', err);
//         return res.status(500).json({ message: 'Internal Server Error' });
//       }

//       if (!deletedPatientP || !deletedPatientD) {
//         return res.status(404).json({ message: 'Patient not found in one or both collections.' });
//       }

//       // If the patient was successfully deleted from both collections
//       res.status(204).send(); // 204 No Content response
//     });
//   } catch (error) {
//     console.error('Error deleting patient:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

  
  // Set up your view engine for Handlebars (assuming you've already configured it)
app.delete('/delete-patient/:patientId', async (req, res) => {
    try {
      const patientId = req.params.patientId;
  
      // Assuming you have Mongoose models for patients in both collections (replace with your actual model names)
      const deletedPatientP = await LogInCollectionP.findByIdAndRemove(patientId);
  
      // Find the doctor who has this patient in their 'patients' array
      const doctor = await LogInCollectionD.findOne({ patients: patientId });
  
      if (!deletedPatientP) {
        return res.status(404).json({ message: 'Patient not found in LogInCollectionP.' });
      }
  
      if (!doctor) {
        return res.status(404).json({ message: 'Patient not found in any doctor\'s list.' });
      }
  
      // Remove the patient ID from the doctor's 'patients' array
      doctor.patients.pull(patientId);
      await doctor.save();
  
      // If the patient was successfully deleted from both collections
      res.status(204).send(); // 204 No Content response
    } catch (error) {
      console.error('Error deleting patient:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
    
  });
  

app.set('view engine', 'hbs');


app.get('/diagnosis', async (req, res) => {
    try {
      const patientId = req.query.patientId;
      // Fetch the patient's diagnosis from the database based on patientId
      const patient = await LogInCollectionP.findById(patientId);
  
      if (!patient) {
        // Handle the case where the patient is not found
        return res.status(404).json({ message: 'Patient not found.' });
      }
  
      // Render the diagnosis template with the patient's data, including diagnosis
      res.render('diagnosis', { patient });
    } catch (error) {
      console.error('Error fetching diagnosis data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.post('/save-diagnosis/:patientId', async (req, res) => {
    try {
      const patientId = req.params.patientId;
      const { diagnosis } = req.body;
  
      // Find the patient by ID and update the diagnosis field
      const patient = await LogInCollectionP.findByIdAndUpdate(patientId, { diagnosis });
  
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found.' });
      }
  
      // If the diagnosis was successfully saved
      res.status(200).json({ message: 'Diagnosis saved successfully.' });
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Import necessary modules and configure your Express app

// Define a route to search for a patient by ID card
app.get('/searchPatientByIdCard', async (req, res) => {
  try {
      // Extract the ID card from the query parameters
      const idCard = req.query.idCard;

      // Perform a database query to find a patient with the specified ID card
      const patient = await LogInCollectionP.findOne({ idCard });

      if (patient) {
          // If a patient is found, send the patient data in JSON format
          res.status(200).json({ patient });
      } else {
          // If no patient is found, send a JSON response with an appropriate message
          res.status(404).json({ message: 'Patient not found' });
      }
  } catch (error) {
      // Handle any errors that may occur during the query
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/addDiagnosis', async (req, res) => {
  const patientId = req.body.patientId;
  const newDiagnosis = req.body.diagnosis;
  
  try {
      // Get the current date and time
      const currentDate = new Date();
      const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

      // Find the patient by ID to get the old diagnoses
      const patient = await LogInCollectionP.findById(patientId);
      
      if (!patient) {
          res.status(404).send('Patient not found.');
          return;
      }

      // Create the new diagnosis string with date and time
      let oldDiagnoses = patient.diagnosis || ''; // Initialize to empty string if no previous diagnosis
      if (oldDiagnoses) {
          oldDiagnoses += '\n'; // Add a new line separator
      }
      oldDiagnoses += `${formattedDate}\n${newDiagnosis}`;

      // Update the patient's diagnosis field with the new combined diagnoses
      await LogInCollectionP.findByIdAndUpdate(patientId, { diagnosis: oldDiagnoses });
      res.status(200).send('Diagnosis added successfully.');
  } catch (error) {
      res.status(500).send('Error adding diagnosis.');
  }
});



app.get('/diagnosis/:patientId', async (req, res) => {
  try {
      // Retrieve the patient's diagnosis data from the database based on patientId
      const patientId = req.params.patientId;
      const patient = await LogInCollectionP.findById(patientId);

      // Check if the patient exists and has diagnosis data
      if (!patient || !patient.diagnosis) {
          return res.render('diagnosis', { diagnoses: [],patient }); // Render the diagnosis template with an empty array
      }

      // Split the diagnosis string into an array of individual diagnoses
      const diagnoses = patient.diagnosis.split('\n');

      // Render the diagnosis template with the diagnoses data
      res.render('diagnosis', { diagnoses, patient});
  } catch (error) {
      console.error(error);
      res.send('Error occurred while fetching diagnosis data.');
  }
});




async function bookAppointment(doctorName, patientId, timeSlot) {
  try {
    // Find the doctor by name (based on the token)
    const doctor = await LogInCollectionD.findOne({ name: doctorName });

    if (!doctor) {
      console.log('Doctor not found.');
      return false;
    }

    // Find the patient by ID (based on the patient's ID)
    const patient = await LogInCollectionP.findById(patientId);

    if (!patient) {
      console.log('Patient not found.');
      return false;
    }

    // Check if the patient is in the doctor's list of patients
    const isPatientInList = doctor.patients.some((p) => p.equals(patient._id));

    if (!isPatientInList) {
      console.log('Patient not found in the doctor\'s patient list.');
      return false;
    }

    // Check if the patient already has an existing appointment with the doctor
    const hasExistingAppointment = doctor.appointments.some((appointment) => {
      return appointment.patientId.equals(patient._id);
    });

    if (hasExistingAppointment) {
      console.log('Patient already has an existing appointment with this doctor.');
      return false;
    }

    // Check if the time slot is available
    const isSlotAvailable = doctor.appointments.every((appointment) => {
      const formattedTime = appointment.appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      return formattedTime !== timeSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    });

    if (isSlotAvailable) {
      // Create a new appointment and add it to the doctor's appointments array
      const newAppointment = {
        appointmentDate: timeSlot.toISOString(),
        patientId: patient._id,
      };

      doctor.appointments.push(newAppointment);

      // Save the updated doctor document
      await doctor.save();

      return true; // Booking successful
    } else {
      return false; // Slot is already booked
    }
  } catch (err) {
    console.error('Error booking appointment:', err);
    return false;
  }
}




app.post('/book-appointment', async (req, res) => {
  try {
    const { doctorName, patientId, timeSlot } = req.body;

    // Parse the user-friendly timeSlot string into a Date object
    const parsedTimeSlot = parseUserFriendlyTime(timeSlot);

    if (!parsedTimeSlot) {
      res.status(400).json({ error: 'Invalid time format' });
      return;
    }
  
    // Call the bookAppointment function with the parsed Date object
    const bookingResult = await bookAppointment(doctorName, patientId, parsedTimeSlot);
    if (bookingResult) {
      // Booking was successful
      res.status(200).json({ message: 'Appointment booked successfully' });
    } else {
      // Booking failed (doctor not found, patient not found, or slot already booked)
      res.status(400).json({ error: 'Appointment booking failed' });
    }
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// app.post('/book-appointment', async (req, res) => {
//   try {
//     const { doctorName, patientId, timeSlot } = req.body;

//     // Parse the user-friendly timeSlot string into a Date object
//     const parsedTimeSlot = parseUserFriendlyTime(timeSlot);

//     if (!parsedTimeSlot) {
//       res.status(400).json({ error: 'Invalid time format' });
//       return;
//     }

//     // Call the bookAppointment function with the parsed Date object
//     const bookingResult = await bookAppointment(doctorName, patientId, parsedTimeSlot);

//     if (bookingResult) {
//       // Booking was successful
//       res.status(200).json({ message: 'Appointment booked successfully' });
//     } else {
//       // Booking failed (doctor not found, patient not found, or slot already booked)
//       res.status(400).json({ error: 'Appointment booking failed' });
//       // Assuming you have a response from your server
      
//     }
//   } catch (error) {
//     console.error('Error booking appointment:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Function to parse user-friendly time into Date
function parseUserFriendlyTime(userFriendlyTime) {
  try {
    const [hours, minutes, period] = userFriendlyTime.split(/:| /);
    const isPM = period.toLowerCase() === 'pm';
    const parsedHours = parseInt(hours, 10) + (isPM ? 12 : 0);
    const parsedMinutes = parseInt(minutes, 10);
    const today = new Date();
    today.setHours(parsedHours, parsedMinutes, 0, 0);
    return today;
  } catch (error) {
    return null; // Invalid time format
  }
}





app.get('/diagnosis/:patientId', async (req, res) => {
  try {
    const patient = await LogInCollectionP.findById(req.body.idcard);
    if (!patient) {
      return res.status(404).send('Patient not found');
    }

    // Render the diagnosis view and pass the patient data
    res.render('diagnosis', { patient });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/today-appointments/:idcard', async (req, res) => {
  try {
    // Assuming you have the doctor's ID available in req.params.idcard
    const doctorId = req.params.idcard;

    // Find the doctor by idCard (not doctorId)
    const doctor = await LogInCollectionD.findOne({ idCard: doctorId });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Extract today's appointments from the doctor object
    const todayAppointments = doctor.appointments;

    // Create an array to store the appointment details with patient names
    const formattedAppointments = [];

    // Iterate through the appointments and access patient names
    for (const appointment of todayAppointments) {
      const patient = await LogInCollectionP.findById(appointment.patientId);
      const patientName = patient ? patient.name : 'Patient not found';

      // Add the appointment details with the patient name to the formattedAppointments array
      formattedAppointments.push({
        appointmentDate: appointment.appointmentDate,
        appointmentid:appointment._id,
        patientName: patientName,
      });
    }

    // Render the Handlebars template with the formatted appointment data
    res.render('today-appointments', { doctor, formattedAppointments });
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Define a custom Handlebars helper for formatting date and time
hbs.registerHelper('formatDate', function (date) {
  // Add your date formatting logic here
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
});

app.post('/delete-appointments', async (req, res) => {
  try {
    const selectedAppointmentIds = req.body.selectedAppointments;

    // Assuming you have the doctor's ID available in req.params.idcard
    const doctorId = req.body.doctorIdCard;

    // Find the doctor by idCard (not doctorId)
    const doctor = await LogInCollectionD.findOne({ idCard: doctorId });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Remove selected appointments from the doctor's appointments array
    doctor.appointments = doctor.appointments.filter(appointment => !selectedAppointmentIds.includes(appointment._id));

    // Save the updated doctor document
    await doctor.save();

    // Redirect to the same page or another appropriate page after deletion
    res.redirect('/today-appointments/' + doctorId);
  } catch (error) {
    console.error('Error deleting appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
const nodemailer = require('nodemailer');

app.post('/send-email', (req, res) => {
  const { user_email, subject, message } = req.body;

  // Create a transporter using nodemailer (you'll need to configure this)
  const transporter = nodemailer.createTransport({
      service: 'Gmail', // e.g., 'Gmail'
      auth: {
          user: 'certificatreussir@gmail.com',
          pass: 'strongMehohoHi@200m2'
      }
  });

  // Email data
  const mailOptions = {
      from: user_email,
      to: 'certificatreussir@gmail.com', // Change to your recipient's email
      subject: subject,
      text: message
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log(error);
          res.send('Error sending email.');
      } else {
          console.log('Email sent: ' + info.response);
          res.send('Email sent successfully.');
      }
  });
});

