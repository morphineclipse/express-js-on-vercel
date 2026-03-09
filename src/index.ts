import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json()); 

app.use(express.static(path.join(process.cwd(), "components")))
app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'public', 'js')));
app.use('/', express.static(path.join(__dirname, '..', 'public')));


const USERS_FILE = path.join(__dirname, "users.json");

let users = [];

function loadUsers() {
    if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, "utf-8");
        users = JSON.parse(data);
    }
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

loadUsers();

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

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
        password,
        name,
        surname: "",
        phoneNumber: ""

    };

    users.push(newUser);
    saveUsers();
    console.log(newUser);
    res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

      if (!email) {
          return res.status(400).json({ 
              success: false, 
              message: "Email обязателен" 
          });
      }

      const user = users.find(user => user.email === email);
      
      if (!user) {
          return res.status(401).json({ 
              success: false, 
              message: "Пользователь не найден" 
          });
      }

    if (user.email === email && user.password === password) {
        return res.status(200).json({ 
            success: true,
            message: "Login successful",
            token: Buffer.from(email).toString('base64'),
            user: {
                id: user.id,
                email: user.email
            }
        });
    } else {
        console.log("Login failed: Invalid credentials");
        return res.status(401).json({ message: "Invalid credentials" });
    }
});

app.post("/api-get-user-data", async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ 
                success: false, 
                message: "Токен не предоставлен" 
            });
        }

        let email;
        try {
            email = Buffer.from(token, 'base64').toString('utf-8');
        } catch (e) {
            return res.status(400).json({ 
                success: false, 
                message: "Неверный формат токена" 
            });
        }

        const user = users.find(user => user.email === email);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Пользователь не найден" 
            });
        }

        return res.status(200).json({ 
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || "",
                surname: user.surname || "",
                phoneNumber: user.phoneNumber || ""
            }
        });

    } catch (error) {
        console.error("Error in /api-get-user-data:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Ошибка сервера" 
        });
    }
  
})

app.post("/api-write-user-data", async (req, res) => {
  const {Username, surname, phoneNumber, email} = req.body;
  const user = users.find(user => user.email === email);
  user.name = Username
  user.surname = surname
  user.phoneNumber = phoneNumber
  saveUsers()
          res.status(200).json({ 
            success: true, 
            message: "Данные обновлены" 
        });
})

app.get('/', (req, res) => {
  res.redirect("/main")
})

app.get('/main', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'mainpage', 'mainpage.html'))
})

app.get('/registration', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'registration', 'regUser.html'))
})

app.get('/authorization', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'authorization', 'userAutho.html'))
})

app.get('/profile', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'userPersonalAccount', 'userPersonalAccount.html'))
})

app.get('/faq', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'faq', 'faq.html'))
})

app.get('/avia', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'userCategoryPlane', 'userPlane.html'))
})

app.get('/theatre', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'userCategoryTheatre', 'userTheatre.html'))
})

app.get('/cinema', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'userCategoryCinema', 'userCinema.html'))
})

app.get('/ticket', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'ticket', 'ticket.html'))
})

app.get('/complete', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'complete', 'complete.html'))
})

export default app
