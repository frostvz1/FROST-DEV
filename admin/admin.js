const container =
    document.getElementById("messagesContainer");

const totalMessages =
    document.getElementById("totalMessages");

const newMessages =
    document.getElementById("newMessages");

const todayMessages =
    document.getElementById("todayMessages");

const loading =
    document.getElementById("loading");

const refreshButton =
    document.getElementById("refreshButton");


function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;

}


function formatDate(date) {

    return new Date(date).toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


function isToday(date) {

    const today = new Date();
    const target = new Date(date);

    return (
        today.getDate() === target.getDate() &&
        today.getMonth() === target.getMonth() &&
        today.getFullYear() === target.getFullYear()
    );

}


function renderMessages(messages) {

    totalMessages.textContent =
        messages.length;

    newMessages.textContent =
        messages.filter(
            message => message.status === "novo"
        ).length;

    todayMessages.textContent =
        messages.filter(
            message => isToday(message.createdAt)
        ).length;


    if (messages.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Nenhuma solicitação recebida.
            </div>
        `;

        return;

    }


    const orderedMessages =
        [...messages].reverse();


    container.innerHTML =
        orderedMessages.map(message => {

            return `
                <article class="message-card">

                    <div class="message-header">

                        <div>

                            <div class="message-name">
                                ${escapeHTML(message.name)}
                            </div>

                            <div class="message-email">
                                ${escapeHTML(message.email)}
                            </div>

                        </div>

                        <div class="message-date">
                            ${formatDate(message.createdAt)}
                        </div>

                    </div>


                    <div class="message-details">

                        <span class="detail-tag">
                            ${escapeHTML(message.service)}
                        </span>

                        ${
                            message.budget
                            ? `
                                <span class="detail-tag">
                                    ${escapeHTML(message.budget)}
                                </span>
                            `
                            : ""
                        }

                        ${
                            message.phone
                            ? `
                                <span class="detail-tag">
                                    ${escapeHTML(message.phone)}
                                </span>
                            `
                            : ""
                        }

                        <span class="detail-tag">
                            ${escapeHTML(message.status)}
                        </span>

                    </div>


                    <div class="message-text">
                        ${escapeHTML(message.message)}
                    </div>

                </article>
            `;

        }).join("");

}


async function loadMessages() {

    loading.textContent =
        "Carregando...";

    try {

        const response =
            await fetch("/api/messages");

        if (!response.ok) {
            throw new Error("Erro HTTP");
        }

        const messages =
            await response.json();

        renderMessages(messages);

        loading.textContent =
            `${messages.length} solicitação(ões)`;

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="error">
                Não foi possível carregar as solicitações.
            </div>
        `;

        loading.textContent =
            "Erro";

    }

}


refreshButton.addEventListener(
    "click",
    loadMessages
);


loadMessages();


/*
 * LOGOUT DO ADMINISTRADOR
 */

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            logoutButton.disabled = true;

            logoutButton.textContent =
                "Saindo...";


            try {

                const response =
                    await fetch(
                        "/api/admin/logout",
                        {
                            method: "POST"
                        }
                    );


                if (!response.ok) {
                    throw new Error(
                        "Não foi possível sair."
                    );
                }


                window.location.href =
                    "/admin/login";


            } catch (error) {

                logoutButton.disabled = false;

                logoutButton.textContent =
                    "Sair";

                alert(
                    error.message
                );

            }

        }
    );

}
