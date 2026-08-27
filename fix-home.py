from pathlib import Path

p = Path("server.js")
text = p.read_text()

route = '''app.get("/", (req, res) => {

    res.redirect("/admin/login");

});


'''

# Remove todas as ocorrências anteriores da rota /
while route in text:
    text = text.replace(route, "", 1)

marker = 'app.use(express.static(path.join(__dirname, "public")));'

if marker not in text:
    print("ERRO: express.static do public não encontrado.")
else:
    text = text.replace(
        marker,
        route + marker,
        1
    )

    p.write_text(text)

    print("OK: rota / colocada antes do express.static.")
