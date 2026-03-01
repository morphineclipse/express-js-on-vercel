const form = document.getElementById("reg-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json(); 

        if (response.ok) {
            localStorage.setItem("token", data.token);
            
            window.location.href = "/profile";
        } else {
            alert(data.error || "Ошибка входа");
        }
        
        console.log(1);
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка сервера");
    }
});