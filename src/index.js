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


const USERS_FILE = path.join(path.join(process.cwd(), 'src', "users.json"));
const PLANE_FILE = path.join(path.join(process.cwd(), 'src', "planeTickets.json"));
const CINEMA_FILE = path.join(path.join(process.cwd(), 'src', "cinemaTickets.json"));
const THEATRE_FILE = path.join(path.join(process.cwd(), 'src', "theatreTickets.json"));

let users = [];
let plane = [];
let cinema = [];
let theatre = [];


if (fs.existsSync(USERS_FILE) &&
    fs.existsSync(PLANE_FILE) &&
    fs.existsSync(CINEMA_FILE) &&
    fs.existsSync(THEATRE_FILE)) 
    {
    const usersData = fs.readFileSync(USERS_FILE, "utf-8");
    const planeData = fs.readFileSync(PLANE_FILE, "utf-8");
    const cinemaData = fs.readFileSync(CINEMA_FILE, "utf-8");
    const theatreData = fs.readFileSync(THEATRE_FILE, "utf-8");
    users = JSON.parse(usersData);
    plane = JSON.parse(planeData);
    cinema = JSON.parse(cinemaData);
    theatre = JSON.parse(theatreData);
    }

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function checkToken(token){
    if (!token) {
    return false
}
    let user;
    let email;
    try {
        email = Buffer.from(token, 'base64').toString('utf-8');
        return user = users.find(user => user.email === email);
    } 
    catch (e) 
    {
        return false
    }
}

async function getTicketsByIds(ticketIds, category) {
    if (!ticketIds || ticketIds.length === 0) return [];
    
    let tickets = [];
    
    switch(category) {
        case 'avia':
            tickets = plane 
            return tickets.filter(ticket => ticketIds.includes(ticket.id));
            
        case 'theatre':
            tickets = theatre 
            return tickets.filter(ticket => ticketIds.includes(ticket.id));
            
        case 'cinema':
           tickets = cinema 
           return tickets.filter(ticket => ticketIds.includes(ticket.id));
            
        default:
            return [];
    }
}

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
        phoneNumber: "",
        purchasedTicketsAvia: [],
        purchasedTicketCinema: [],
        purchasedTicketsTheatre: []
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
        return res.status(401).json({ message: "Invalid credentials" });
    }
});

app.post("/api-get-user-data", async (req, res) => {
    try {
        const { token } = req.body;

        let user = checkToken(token)
        
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
                phoneNumber: user.phoneNumber || "",
                purchasedTicketsAvia: user.purchasedTicketsAvia || "",
                purchasedTicketCinema: user.purchasedTicketCinema || "",
                purchasedTicketsTheatre: user.purchasedTicketsTheatre || ""
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

app.post("/api-get-tickets", async (req, res) => {
    const {token} = req.body

    let user = checkToken(token)

    try {
        if (user.purchasedTicketsAvia.length === 0 && 
            user.purchasedTicketsTheatre.length === 0 && 
            user.purchasedTicketsCinema.length === 0) {
            
            return res.status(200).json({
                success: true,
                ticketsNotFound: true,
                tickets: []
            });
        }

        const [aviaTickets] = await Promise.all([
            getTicketsByIds(user.purchasedTicketsAvia, 'avia'),
        ]);

        const [theatreTickets] = await Promise.all([
            getTicketsByIds(user.purchasedTicketsTheatre, 'theatre'),
        ]);

        const [cinemaTickets] = await Promise.all([
            getTicketsByIds(user.purchasedTicketsCinema, 'cinema'),
        ]);

        const allTickets = [
            ...aviaTickets.map(ticket => ({ ...ticket, category: 'avia' })),
            ...theatreTickets.map(ticket => ({ ...ticket, category: 'theatre' })),
            ...cinemaTickets.map(ticket => ({ ...ticket, category: 'cinema' })),
        ];

        allTickets.sort((a, b) => {
            return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        });

        return res.status(200).json({
            success: true,
            ticketsNotFound: false,
            tickets: allTickets,
            totalCount: allTickets.length
        });

    } catch (error) {
        console.error('Ошибка при получении билетов:', error);
        return res.status(500).json({
            success: false,
            message: 'Ошибка сервера при получении билетов'
        });
    }
})

app.post("/api-write-avia-ticket", async (req, res) => {
    const {ticketId, token} = req.body

    let user = checkToken(token)

    user.purchasedTicketsAvia.push(ticketId)
    saveUsers()
    return res.status(200).json({
        success: true,
        message: "Id билета успешно записан в историю пользователя"
    })
})

app.post("/api-write-theatre-ticket", async (req, res) => {
    const {ticketId, token} = req.body

    let user = checkToken(token)

    user.purchasedTicketsTheatre.push(ticketId)
    saveUsers()
    return res.status(200).json({
        success: true,
        message: "Id билета успешно записан в историю пользователя"
    })
})

app.post("/api-write-cinema-ticket", async (req, res) => {
    const {ticketId, token} = req.body

    let user = checkToken(token)

    user.purchasedTicketsCinema.push(ticketId)
    saveUsers()
    return res.status(200).json({
        success: true,
        message: "Id билета успешно записан в историю пользователя"
    })
})

app.post("/api-write-user-data", async (req, res) => {
  const {Username, surname, phoneNumber, token} = req.body;

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

app.post("/theatre-tickets", async (req, res) => {
    return res.status(200).json({ 
        success: true,
        theatre: theatre
    });
})

app.post("/cinema-tickets", async (req, res) => {
    return res.status(200).json({ 
        success: true,
        cinema: cinema
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

app.get('/cinema-ticket', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'ticket', 'ticketCinema.html'))
})

app.get('/avia-ticket/:id', (req, res) => {
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
                <link rel="stylesheet" href="/css/ticketAvia.css">
                <link rel="shortcut icon" href="/icon.png" type="image/x-icon">
            </head>
            <body>
                <script src="/js/ticketAvia.js" defer></script>
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

                <main id="booking" class="booking-page">
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
                                
                                <form id="form" class="passenger-form">
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
                                                <input type="text" id="series" name="series" placeholder="1234" maxlength="4" required>
                                            </div>
                                            <div class="form-group">
                                                <label for="passport">Номер</label>
                                                <input type="text" id="passportNumber" name="passportNumber" placeholder="567890" maxlength="6" required>
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
                                            <input type="text" id="card-number" name="card-number" required placeholder="1234 5678 9012 3456">
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="card-expiry">Срок действия</label>
                                                <input type="text" id="card-expiry" name="card-expiry" required placeholder="ММ/ГГ">
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="card-cvv">CVV</label>
                                                <input type="text" id="card-cvv" name="card-cvv" required placeholder="123">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="payment-section">
                                        <div class="final-price">
                                            <span class="final-price-label">К оплате:</span>
                                            <span class="final-price-value">4 990 ₽</span>
                                        </div>

                                        <button type="submit" id="pay" class="btn btn-primary payment-btn">Оплатить</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
                
                <main style="display: none;" id="payment" class="payment-processing-page">
                    <div class="container">
                        <div id="payment" class="payment-card">
                            <div id="container" class="animation-container">
                                <div class="loader-circle" id="loader"></div>
                                <svg class="checkmark hidden" id="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                    <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                                    <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                                </svg>
                            </div>
                            <h1 id="status-title"></h1>
                            <p id="status-message"></p>
                            <a href="/profile" class="btn btn-primary" id="continue-btn" style="display: none;">Перейти к билетам</a>
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

app.get('/theatre-ticket/:id', (req, res) => {
    const ticketId = parseInt(req.params.id);
    const ticket = theatre.find(t => t.id === ticketId);
    if (ticket) {
        res.send(`
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Купить билеты в авиа, кино, театр. Билетум - Оформление билета.</title>
                <link rel="stylesheet" href="/css/ticketTheatre.css">
                <link rel="shortcut icon" href="/icon.png" type="image/x-icon">
            </head>
            <body>
                <script src="/js/ticketTheatre.js" defer></script>
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

                <main id="booking" class="booking-page">
                        <div class="container">

                            <h1 class="booking-title">Оформление билета</h1>
                            
                            <div class="booking-grid">
                                <div class="booking-card event-info-card">
                                    <h2 class="booking-card-title">Событие</h2>
                                    
                                    <div class="event-details">
                                        <div class="event-points">
                                            <div class="event-info">
                                                <div class="event-title">${ticket.name}</div>
                                                <div class="event-location">${ticket.fullAddress}</div>
                                                <div class="event-time">${ticket.time}</div>
                                                <div class="event-date">${ticket.date}</div>
                                            </div>
                                        </div>
                                        
                                        <div class="event-price-block">
                                            <span class="price-label">Цена билета:</span>
                                            <span class="price-value">${ticket.price}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="booking-card visitor-card">
                                    <h2 class="booking-card-title">Данные посетителя</h2>
                                    
                                    <form id="form" class="visitor-form">
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
                                                <label for="phone">Номер телефона</label>
                                                <input type="tel" id="phone" name="phone" placeholder="+7 (999) 123-45-67" required>
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="email">Электронная почта</label>
                                                <input type="email" id="email" name="email" placeholder="example@mail.ru" required>
                                                <small class="form-hint">На эту почту придёт билет</small>
                                            </div>
                                        </div>
                                        <div class="payment-details">
                                            
                                            <div class="form-group">
                                                <label for="card-number">Номер карты</label>
                                                <input type="text" id="card-number" name="card-number" required placeholder="1234 5678 9012 3456">
                                            </div>
                                            
                                            <div class="form-row">
                                                <div class="form-group">
                                                    <label for="card-expiry">Срок действия</label>
                                                    <input type="text" id="card-expiry" name="card-expiry" required placeholder="ММ/ГГ">
                                                </div>
                                                
                                                <div class="form-group">
                                                    <label for="card-cvv">CVV</label>
                                                    <input type="text" id="card-cvv" name="card-cvv" required placeholder="123">
                                                </div>
                                            </div>
                                        </div>

                                        <br>

                                        <div class="payment-section">
                                            <div class="final-price">
                                                <span class="final-price-label">К оплате:</span>
                                                <span class="final-price-value">${ticket.price}</span>
                                            </div>

                                            <button type="submit" id="pay" class="btn btn-primary payment-btn">Оплатить</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </main>
                    
                    <main style="display: none;" id="payment" class="payment-processing-page">
                        <div class="container">
                            <div id="payment" class="payment-card">
                                <div id="container" class="animation-container">
                                    <div class="loader-circle" id="loader"></div>
                                    <svg class="checkmark hidden" id="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                        <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                                        <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                                    </svg>
                                </div>
                                <h1 id="status-title"></h1>
                                <p id="status-message"></p>
                                <a href="/profile" class="btn btn-primary" id="continue-btn" style="display: none;">Перейти к билетам</a>
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

app.get('/cinema-ticket/:id', (req, res) => {
    const ticketId = parseInt(req.params.id);
    const ticket = cinema.find(t => t.id === ticketId);
    if (ticket) {
        res.send(`
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Купить билеты в авиа, кино, театр. Билетум - Оформление билета.</title>
                <link rel="stylesheet" href="/css/ticketTheatre.css">
                <link rel="shortcut icon" href="/icon.png" type="image/x-icon">
            </head>
            <body>
                <script src="/js/ticketCinema.js" defer></script>
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

                <main id="booking" class="booking-page">
                        <div class="container">

                            <h1 class="booking-title">Оформление билета</h1>
                            
                            <div class="booking-grid">
                                <div class="booking-card event-info-card">
                                    <h2 class="booking-card-title">Событие</h2>
                                    
                                    <div class="event-details">
                                        <div class="event-points">
                                            <div class="event-info">
                                                <div class="event-title">${ticket.name}</div>
                                                <div class="event-location">${ticket.fullAddress}</div>
                                                <div class="event-time">${ticket.time}</div>
                                                <div class="event-date">${ticket.date}</div>
                                            </div>
                                        </div>
                                        
                                        <div class="event-price-block">
                                            <span class="price-label">Цена билета:</span>
                                            <span class="price-value">${ticket.price}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="booking-card visitor-card">
                                    <h2 class="booking-card-title">Данные посетителя</h2>
                                    
                                    <form id="form" class="visitor-form">
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
                                                <label for="phone">Номер телефона</label>
                                                <input type="tel" id="phone" name="phone" placeholder="+7 (999) 123-45-67" required>
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="email">Электронная почта</label>
                                                <input type="email" id="email" name="email" placeholder="example@mail.ru" required>
                                                <small class="form-hint">На эту почту придёт билет</small>
                                            </div>
                                        </div>
                                        <div class="payment-details">
                                            
                                            <div class="form-group">
                                                <label for="card-number">Номер карты</label>
                                                <input type="text" id="card-number" name="card-number" required placeholder="1234 5678 9012 3456">
                                            </div>
                                            
                                            <div class="form-row">
                                                <div class="form-group">
                                                    <label for="card-expiry">Срок действия</label>
                                                    <input type="text" id="card-expiry" name="card-expiry" required placeholder="ММ/ГГ">
                                                </div>
                                                
                                                <div class="form-group">
                                                    <label for="card-cvv">CVV</label>
                                                    <input type="text" id="card-cvv" name="card-cvv" required placeholder="123">
                                                </div>
                                            </div>
                                        </div>

                                        <br>

                                        <div class="payment-section">
                                            <div class="final-price">
                                                <span class="final-price-label">К оплате:</span>
                                                <span class="final-price-value">${ticket.price}</span>
                                            </div>

                                            <button type="submit" id="pay" class="btn btn-primary payment-btn">Оплатить</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </main>
                    
                    <main style="display: none;" id="payment" class="payment-processing-page">
                        <div class="container">
                            <div id="payment" class="payment-card">
                                <div id="container" class="animation-container">
                                    <div class="loader-circle" id="loader"></div>
                                    <svg class="checkmark hidden" id="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                        <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                                        <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                                    </svg>
                                </div>
                                <h1 id="status-title"></h1>
                                <p id="status-message"></p>
                                <a href="/profile" class="btn btn-primary" id="continue-btn" style="display: none;">Перейти к билетам</a>
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server started");
});

export default app
