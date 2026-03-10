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
const PLANE_FILE = path.join(__dirname, "planeTickets.json");

let users = [];
let plane = [];

function loadUsers() {
    if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, "utf-8");
        users = JSON.parse(data);
    }
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function loadPlane() {
    if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(PLANE_FILE, "utf-8");
        plane = JSON.parse(data);
    }
}
loadPlane();
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

app.post("/plane-tickets", async (req, res) => {
    return res.status(200).json({ 
        success: true,
        plane: plane
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

app.get('/ticket/:id', (req, res) => {
    const ticketId = parseInt(req.params.id);
    const ticket = plane.find(t => t.id === ticketId);
    if (ticket) {
        res.send(`
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Купить билеты в авиа, кино, театр. Билетум - Оформление билета.</title>
                <link rel="stylesheet" href="/css/ticket.css">
                <link rel="shortcut icon" href="/icon.png" type="image/x-icon">
            </head>
            <body>

                <script src="/js/checkToken.js" defer></script>
                <header class="header">
                    <div class="container">
                        <div class="logo">
                            <a href="/">Билетум</a>
                        </div>
                        <nav class="nav">
                            <a href="/" class="nav-link">Главная</a>
                            <a href="/avia" class="nav-link">Авиа</a>
                            <a href="/theatre" class="nav-link">Театр</a>
                            <a href="/cinema" class="nav-link">Кино</a>
                        </nav>
                        <div class="header-actions">
                            <a href="/authorization" class="btn btn-outline">Войти</a>
                            <a href="/registration" class="btn btn-primary">Регистрация</a>
                        </div>
                    </div>
                </header>

                <main class="booking-page">
                    <div class="container">

                        <h1 class="booking-title">Оформление билета</h1>
                        
                        <div class="booking-grid">
                            <div class="booking-card flight-info-card">
                                <h2 class="booking-card-title">Информация о отправлении</h2>
                                
                                <div class="flight-details">
                                    <div class="route-points">
                                        <div class="route-from">
                                            <div class="route-city">${ticket.from}</div>
                                            <div class="route-time">${ticket.timeFrom}</div>
                                            <div class="route-date">${ticket.date}</div>
                                        </div>
                                        <div class="route-arrow">→</div>
                                        <div class="route-to">
                                            <div class="route-city">${ticket.to}</div>
                                            <div class="route-time">${ticket.timeTo}</div>
                                            <div class="route-date">${ticket.date}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="flight-info-row">
                                        <span class="info-label">Авиакомпания:</span>
                                        <span class="info-value">${ticket.company}</span>
                                    </div>
                                    
                                    <div class="flight-info-row">
                                        <span class="info-label">Номер рейса:</span>
                                        <span class="info-value">${ticket.number}</span>
                                    </div>
                                    
                                    <div class="flight-price-block">
                                        <span class="price-label">Цена билета:</span>
                                        <span class="price-value">${ticket.price}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="booking-card passenger-card">
                                <h2 class="booking-card-title">Данные пассажира</h2>
                                
                                <form class="passenger-form">
                                    <div class="form-group">
                                        <label for="lastname">Фамилия</label>
                                        <input type="text" id="lastname" name="lastname" placeholder="Иванов" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="firstname">Имя</label>
                                        <input type="text" id="firstname" name="firstname" placeholder="Иван" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="patronymic">Отчество</label>
                                        <input type="text" id="patronymic" name="patronymic" placeholder="Иванович">
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="birthdate">Дата рождения</label>
                                            <input type="date" id="birthdate" name="birthdate" value="1990-01-01">
                                        </div>
                                    
                                            <div class="form-group">
                                                <label for="passport">Серия</label>
                                                <input type="text" id="series" name="series" placeholder="1234" required>
                                            </div>
                                            <div class="form-group">
                                                <label for="passport">Номер</label>
                                                <input type="text" id="passportNumber" name="passportNumber" placeholder="567890" required>
                                            </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="phone">Номер телефона</label>
                                        <input type="tel" id="phone" name="phone" placeholder="+7 (999) 123-45-67" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="email">Электронная почта</label>
                                        <input type="email" id="email" name="email" placeholder="example@mail.ru" required>
                                        <small class="form-hint">На эту почту придёт билет</small>
                                    </div>

                                    <div class="payment-details">
                                        
                                        <div class="form-group">
                                            <label for="card-number">Номер карты</label>
                                            <input type="text" id="card-number" name="card-number" placeholder="1234 5678 9012 3456" inputmode="numeric" maxlength="19">
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="card-expiry">Срок действия</label>
                                                <input type="text" id="card-expiry" name="card-expiry" placeholder="ММ/ГГ" inputmode="numeric" maxlength="5">
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="card-cvv">CVV</label>
                                                <input type="text" id="card-cvv" name="card-cvv" placeholder="123" inputmode="numeric" maxlength="3">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="payment-section">
                                        <div class="final-price">
                                            <span class="final-price-label">К оплате:</span>
                                            <span class="final-price-value">4 990 ₽</span>
                                        </div>

                                        <a href="/complete"><button type="submit" class="btn btn-primary payment-btn">Оплатить</button></a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>

                <footer class="footer">
                    <div class="container">
                        <div class="footer-row">
                            <div class="footer-col">
                                <div class="footer-logo">Билетум</div>
                                <p class="footer-about">Онлайн-сервис для бронирования и покупки билетов на авиарейсы, театральные представления и киносеансы.</p>
                            </div>
                            <div class="footer-col">
                                <h4 class="footer-title">Категории</h4>
                                <div class="footer-links">
                                    <a href="/avia">Авиа</a>
                                    <a href="/theatre">Театр</a>
                                    <a href="/cinema">Кино</a>
                                </div>
                            </div>
                            <div class="footer-col">
                                <h4 class="footer-title">Помощь</h4>
                                <div class="footer-links">
                                    <a href="/faq">Часто задаваемые вопросы</a>
                                </div>
                            </div>
                            <div class="footer-col">
                                <h4 class="footer-title">Контакты</h4>
                                <div class="footer-contacts">
                                    <div>+7(495)123-45-67</div>
                                    <div>support@biletum.ru</div>
                                    <div>Москва, ул. Тверская, д. 1</div>
                                </div>
                            </div>
                        </div>
                        <div class="footer-bottom">
                            <p class="footer-copy">&copy; 2026 Билетум. Все права защищены.</p>
                            <p class="footer-version">Версия 1.0.0</p>
                        </div>
                    </div>
                </footer>
            </body>
            </html>
        `);
    } else {
        res.status(404).send('Ticket not found');
    }
})

app.get('/complete', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'complete', 'complete.html'))
})

export default app
