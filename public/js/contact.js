const form = document.getElementById("contactForm");
const statusBox = document.getElementById("formStatus");

const WHATSAPP_NUMBER = "5575991190972";


form.addEventListener("submit", async (event) => {

    event.preventDefault();

    statusBox.className = "form-status";
    statusBox.textContent = "Preparando sua solicitação...";


    const formData = new FormData(form);


    const name =
        formData.get("name")?.trim() || "";

    const email =
        formData.get("email")?.trim() || "";

    const phone =
        formData.get("phone")?.trim() || "";

    const service =
        formData.get("service")?.trim() || "";

    const budget =
        formData.get("budget")?.trim() ||
        "Não informado";

    const message =
        formData.get("message")?.trim() || "";


    if (!name || !email || !service || !message) {

        statusBox.className = "form-status error";

        statusBox.textContent =
            "Preencha todos os campos obrigatórios.";

        return;

    }


    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(email)) {

        statusBox.className = "form-status error";

        statusBox.textContent =
            "Digite um e-mail válido.";

        return;

    }


    /*
     * MENSAGEM QUE SERÁ ABERTA NO WHATSAPP
     */

    const whatsappMessage = `

*FROST DEV — NOVA SOLICITAÇÃO DE PROJETO*

━━━━━━━━━━━━━━━━━━━━

*CLIENTE*

Nome: ${name}

E-mail: ${email}

Telefone / WhatsApp: ${phone || "Não informado"}

━━━━━━━━━━━━━━━━━━━━

*PROJETO*

Serviço: ${service}

Orçamento: ${budget}

━━━━━━━━━━━━━━━━━━━━

*DESCRIÇÃO*

${message}

━━━━━━━━━━━━━━━━━━━━

Solicitação enviada através do site da FROST DEV.

`;


    /*
     * CONVERTE A MENSAGEM PARA URL
     */

    const encodedMessage =
        encodeURIComponent(whatsappMessage);


    const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;


    /*
     * ABRE O WHATSAPP
     */

    statusBox.className =
        "form-status success";

    statusBox.textContent =
        "Abrindo o WhatsApp...";


    setTimeout(() => {

        window.location.href =
            whatsappURL;

    }, 500);

});
