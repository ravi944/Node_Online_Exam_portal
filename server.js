const express = require('express');
const mysql2 = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql2');



// Create database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'db6'
});
// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }

  console.log('Connected to database with ID ' + connection.threadId);
});


app.use(bodyParser.urlencoded({ extended: true }));




// serve the home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home.html');
});




// serve static files from the  directory
app.use(express.static('public'));



// admin page
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/admin.html');
});

// valid form login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    connection.query('SELECT qa.*, s.username FROM question_answers qa JOIN students s ON qa.id = s.id', (err, rows) => {
      if (err) throw err;
      let html = `
        <html>
        <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
        </head>
          <body>
            <h1>Question Answers</h1>
            <table class="table table-bordered table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Question 1</th>
                <th>Question 2</th>
                <th>Question 3</th>
                <th>Question 4</th>
                <th>Question 5</th>
                <th>results</th>
                <th>Username</th>
              </tr>
              </thead>
            <tbody>
      `;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        html += `
          <tr>
            <td>${row.id}</td>
            <td>${row.question1}</td>
            <td>${row.question2}</td>
            <td>${row.question3}</td>
            <td>${row.question4}</td>
            <td>${row.question5}</td>
            <td>${row.score}</td>
            <td>${row.username}</td>
          </tr>
        `;
      }
      html += `
            </tbody>
            </table>
            <div style="display: flex; margin-top: 20px;">
            // <button onclick="location.href='/question_paper.html'" type="button" style="background-color: #007bff; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s ease-in-out; margin-right: 10px;">
            //   Create Question Paper 
            // </button>
            <button onclick="window.location.href='/home.html'" style="background-color: #007bff; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s ease-in-out; margin-right: 10px;">
              Go to Home Page
            </button>
          </div>
          
            </div>
          </body>
        </html>
      `;
      res.send(html);
    });
  } else {
    res.send('Invalid credentials');
  }
});




// student form 
app.post('/submitStudent', (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    const sql = `INSERT INTO students (username, email, password,confirm_password) VALUES ('${username}', '${email}','${password}','${confirm_password}')`;
  
    connection.query(sql, (err, result) => {
    if (err) throw err;
  
      res.redirect('/index.html');
      console.log('Redirecting to /index.html');
    });
  });




// index page
app.get('/index.html', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
// answers submission
app.post('/submitAnswers', (req, res) => {
    const q1 = req.body.q1;
    const q2 = req.body.q2;
    const q3 = req.body.q3;
    const q4 = req.body.q4;
    const q5 = req.body.q5;

    var score=0;
     // calculate score
    if (q1 === "b") { score++; }
    if (q2 === "c") { score++; }
    if (q3 === "c") { score++; }
    if (q4 === "d") { score++; }
    if (q5 === "a") { score++; }
    const sql = `INSERT INTO question_answers (question1, question2, question3, question4, question5,score) VALUES ('${q1}', '${q2}','${q3}','${q4}','${q5}','${score}')`;
  
    connection.query(sql, (err, result) => {
      if (err) throw err;
  
      // console.log('Answer submitted: ' + q1 + ', ' + q2+ ', ' +q3+ ', ' +q4+ ', ' +q5+','+score);
      res.send('Answers submitted successfully!');
    });
  });  




app.get('/results.html', (req, res) => {
    res.sendFile(__dirname + '/public/results.html');
    });

app.post('/auth', function(request, response) {
    const email = request.body.email;
    const password = request.body.password;
  
    if (!email || !password) {
      response.send('Please enter email and password!');
      return;
    }  
    connection.query('SELECT score FROM question_answers WHERE id = (SELECT id FROM students WHERE email = ? AND password = ?)', [email, password], function(error, results, fields) {
      if (error) {
        response.send('An error occurred while retrieving the data.');
        return;
        }
      if (!results || !results.length) {
        response.send('Incorrect email or password!');
        return;
        }
       const score = results[0].score;
       response.send('Your results : ' + score);
    });
});
  
  


// start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
