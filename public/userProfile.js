if(!localStorage.getItem("token")){
    window.location.replace("/authorization")
}   

async function getData () {
    const token = localStorage.getItem("token")
    const nameField = document.getElementById("firstname")
    const surnameField = document.getElementById("lastname")
    const phoneNumberField = document.getElementById("phone")
    const emailField = document.getElementById("email")
    try {
        const response = await fetch("http://localhost:3000/api-user-data", {
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
            emailField.value = data.user.email
            nameField.value = data.user.name
            surnameField.value = data.user.surname
            phoneNumberField.value = data.user.phoneNumber
        } 
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка сервера");
    }
}
getData()