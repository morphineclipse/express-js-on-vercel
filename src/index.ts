import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json()); 
const USERS_FILE = path.join(__dirname, "users.json");

let users = [];

function loadUsers() {
    if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, "utf-8");
        users = JSON.parse(data);
        console.log("Users loaded:", users.length);
    }
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

loadUsers();

/*
    users = [
        {
            id: 1,
            email: "test@mail.com",
            password: "hashedpassword"
        }
    ]
*/

app.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }


    const newUser = {
        id: users.length + 1,
        email,
        password: password
    };

    users.push(newUser);
    saveUsers();
    console.log(newUser);
    res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    else{
        console.log("login succesful")
    }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'components', 'mainpage', 'mainpage.html'))
})

app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'components', 'registration', 'regUser.html'))
})

app.get('/authorization', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'components', 'authorization', 'userAutho.html'))
})

app.get('/profile', (req, res) => {
  if(localStorage.getItem('token')){
    res.sendFile(path.join(__dirname, '..', 'components', 'userPersonalAccount', 'userPersonalAccount.html'))
  }
  else{
    window.location.replace("/authorization")
  }
})

app.get('/faq', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'components', 'faq', 'faq.html'))
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app


