const form =
    document.getElementById("loginForm");

const username =
    document.getElementById("username");

const password =
    document.getElementById("password");

const button =
    document.getElementById("loginButton");

const message =
    document.getElementById("message");


function showMessage(text) {

    message.textContent = text;

    message.style.display = "block";

}


form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        button.disabled = true;

        button.textContent =
            "Entrando...";

        message.style.display =
            "none";


        try {

            const response =
                await fetch(
                    "/api/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username:
                                username.value.trim(),

                            password:
                                password.value
                        })
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Não foi possível entrar."
                );

            }


            window.location.href =
                result.redirect;


        } catch (error) {

            showMessage(
                error.message
            );

            button.disabled =
                false;

            button.textContent =
                "Entrar";

        }

    }
);
