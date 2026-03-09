if(!localStorage.getItem("token")){
    window.location.replace("/authorization")
}   

const token = localStorage.getItem("token")
let Username = document.getElementById("firstname")
let surname = document.getElementById("lastname")
let phoneNumber = document.getElementById("phone")
let email = document.getElementById("email")

const saveBtn = document.getElementById("save-btn")

async function getData () {
    try {
        const title = document.getElementById("profile-title")
        const form = document.getElementById("form")
        form.style.display = "none"
        title.textContent = "Загрузка..."
        const response = await fetch("/api-get-user-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token
            })
        });

        const data = await response.json(); 

        if (response.ok) {
            console.log(data)
            form.style.display = ""
            title.textContent = "Личные данные"
            email.value = data.user.email
            Username.value = data.user.name
            surname.value = data.user.surname
            phoneNumber.value = data.user.phoneNumber
        } 
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка сервера");
    }
}
getData()

const form = document.getElementById("form").addEventListener("submit", async(e) =>{
    e.preventDefault()
    let Username = document.getElementById("firstname")
    let surname = document.getElementById("lastname")
    let phoneNumber = document.getElementById("phone")
    let email = document.getElementById("email")

    const phoneNumberRegex = /^\+?[1-9][0-9]{10}$/;
    Username = Username.value
    surname = surname.value
    phoneNumber = phoneNumber.value
    email = email.value
    if(!phoneNumberRegex.test(phoneNumber)){
        alert("Некорректный номер телефона")
        return
    }
    saveBtn.disabled = true
    saveBtn.textContent = "Сохранение..."
    saveBtn.style.backgroundColor = "#ffc107"

    try 
    {
        const response = await fetch("/api-write-user-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Username,
                surname,
                phoneNumber,
                email
            })
        });
        if (response.ok) {
            saveBtn.style.backgroundColor = "#28a745" 
            saveBtn.textContent = "Сохранено"
            
            setTimeout(() => {
                saveBtn.disabled = false
                saveBtn.textContent = "Сохранить"
                saveBtn.style.backgroundColor = "" 
            }, 2000)
        }
    }
     
    catch (error) {
        console.error("Ошибка:", error);
    }
}
)