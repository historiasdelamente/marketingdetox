import json, urllib.request, ssl

API_URL = "https://n8n-n8n.ya3fud.easypanel.host"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYTc5ZWE4MS04MTRlLTQ3ZmEtYjUwMy03YWZiZmVhZWVmMzEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMGNiOGYwZDktZmVmMS00MTc0LWFjODctYjM3YTE5Y2ZmNzI5IiwiaWF0IjoxNzc0Njg1Njg1fQ.jcd9wAoLLpPeQlAnGudg2oVPeX69wec9l6kQuZxusbk"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_DIR = r"c:\Users\jivca\OneDrive\Documentos\TRABAJOIA\apps\historiasdelamente\marketingdetox\output"

# Read HTMLs
html_files = {
    6: f"{BASE_DIR}\\correo6-preclase1.html",
    7: f"{BASE_DIR}\\correo7-postclase1.html",
    10: f"{BASE_DIR}\\correo10-postclase-final.html",
}

htmls = {}
for dia, path in html_files.items():
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    if not html.startswith("="):
        html = "=" + html
    htmls[dia] = html
    print(f"Correo {dia}: {len(html)} chars loaded")

subjects = {
    6: "={{ $json.fields.Nombre }}, la clase es HOY. Tu cuerpo necesita escuchar esto.",
    7: "={{ $json.fields.Nombre }}, lo que pas\u00f3 hoy en la clase no fue casualidad",
    10: "={{ $json.fields.Nombre }}, ya sabes la verdad. Ahora decide qu\u00e9 haces con ella.",
}

triggers = {
    6: {"cron": "0 23 1 4 *", "filter": 'AND(NOT({Fase}="completado"), {Fase}="pre-clase1")', "next_fase": "post-clase1", "next_dia": 7},
    7: {"cron": "0 2 2 4 *", "filter": 'AND(NOT({Fase}="completado"), {Fase}="post-clase1")', "next_fase": "pre-clase2", "next_dia": 8},
    10: {"cron": "0 18 4 4 *", "filter": 'AND(NOT({Fase}="completado"), OR({Fase}="pre-clase2", {Fase}="post-clase2"))', "next_fase": "completado", "next_dia": 10},
}

airtable_base = {"__rl": True, "value": "appOKA2nGovlyj1dw", "mode": "list", "cachedResultName": "26nov"}
airtable_table = {"__rl": True, "value": "tblPNIejnMmghW4ND", "mode": "list", "cachedResultName": "1 de aril"}

nodes = []
connections = {}
y_pos = 300

for dia in [6, 7, 10]:
    t = triggers[dia]
    prefix = f"C{dia}"

    trigger_name = f"Trigger {prefix}"
    search_name = f"Buscar {prefix}"
    wait_name = f"Espera {prefix}"
    loop_name = f"Loop {prefix}"
    wait2_name = f"WaitLoop {prefix}"
    code_name = f"Code {prefix}"
    gmail_name = f"Gmail {prefix}"
    update_name = f"Update {prefix}"
    wait3_name = f"WaitRet {prefix}"

    code_js = (
        "const items = [];\n"
        "for (const item of $input.all()) {\n"
        "  const r = item.json;\n"
        "  items.push({\n"
        "    json: {\n"
        "      id: r.id,\n"
        "      nombre: r.Nombre || r.fields?.Nombre || 'Amiga',\n"
        "      email: r.Email || r.fields?.Email || '',\n"
        "      fields: { Nombre: r.Nombre || r.fields?.Nombre || 'Amiga', Email: r.Email || r.fields?.Email || '' }\n"
        "    }\n"
        "  });\n"
        "}\n"
        "return items;"
    )

    update_id_expr = "={{ $('" + code_name + "').item.json.id }}"

    nodes.extend([
        {"id": f"cls-{dia}-01", "name": trigger_name, "type": "n8n-nodes-base.scheduleTrigger", "typeVersion": 1.2, "position": [0, y_pos], "parameters": {"rule": {"interval": [{"field": "cronExpression", "expression": t["cron"]}]}}},
        {"id": f"cls-{dia}-02", "name": search_name, "type": "n8n-nodes-base.airtable", "typeVersion": 2.1, "position": [260, y_pos], "credentials": {"airtableTokenApi": {"id": "I6MzXs3yhZ7WACUS", "name": "lanza"}}, "parameters": {"operation": "search", "base": airtable_base, "table": airtable_table, "filterByFormula": t["filter"], "options": {"fields": ["Nombre", "Email", "Estado_Email", "Dia_Secuencia", "Fase"]}}},
        {"id": f"cls-{dia}-03", "name": wait_name, "type": "n8n-nodes-base.wait", "typeVersion": 1.1, "position": [500, y_pos], "parameters": {"amount": 3}},
        {"id": f"cls-{dia}-04", "name": loop_name, "type": "n8n-nodes-base.splitInBatches", "typeVersion": 3, "position": [700, y_pos], "parameters": {"batchSize": 1, "options": {}}},
        {"id": f"cls-{dia}-05", "name": wait2_name, "type": "n8n-nodes-base.wait", "typeVersion": 1.1, "position": [900, y_pos + 100], "parameters": {"amount": 10}},
        {"id": f"cls-{dia}-06", "name": code_name, "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [1100, y_pos + 100], "parameters": {"jsCode": code_js}},
        {"id": f"cls-{dia}-07", "name": gmail_name, "type": "n8n-nodes-base.gmail", "typeVersion": 2.1, "position": [1320, y_pos + 100], "credentials": {"gmailOAuth2": {"id": "oZBzsi8UC8Cblo5M", "name": "javier crecevd"}}, "parameters": {"sendTo": "={{ $json.email }}", "subject": subjects[dia], "message": htmls[dia], "options": {"appendAttribution": False, "senderName": "Javier  Vieira  Historias de la mente"}}},
        {"id": f"cls-{dia}-08", "name": update_name, "type": "n8n-nodes-base.airtable", "typeVersion": 2.1, "position": [1560, y_pos + 100], "credentials": {"airtableTokenApi": {"id": "I6MzXs3yhZ7WACUS", "name": "lanza"}}, "parameters": {"operation": "update", "base": airtable_base, "table": airtable_table, "columns": {"mappingMode": "defineBelow", "value": {"id": update_id_expr, "Estado_Email": f"Enviado{dia}", "Dia_Secuencia": t["next_dia"], "Fase": t["next_fase"]}, "matchingColumns": ["id"], "schema": [{"id": "id", "displayName": "id", "required": False, "defaultMatch": True, "display": True, "type": "string", "readOnly": True, "removed": False}]}, "options": {"typecast": True}}},
        {"id": f"cls-{dia}-09", "name": wait3_name, "type": "n8n-nodes-base.wait", "typeVersion": 1.1, "position": [1780, y_pos + 100], "parameters": {"amount": 3}},
    ])

    connections[trigger_name] = {"main": [[{"node": search_name, "type": "main", "index": 0}]]}
    connections[search_name] = {"main": [[{"node": wait_name, "type": "main", "index": 0}]]}
    connections[wait_name] = {"main": [[{"node": loop_name, "type": "main", "index": 0}]]}
    connections[loop_name] = {"main": [[], [{"node": wait2_name, "type": "main", "index": 0}]]}
    connections[wait2_name] = {"main": [[{"node": code_name, "type": "main", "index": 0}]]}
    connections[code_name] = {"main": [[{"node": gmail_name, "type": "main", "index": 0}]]}
    connections[gmail_name] = {"main": [[{"node": update_name, "type": "main", "index": 0}]]}
    connections[update_name] = {"main": [[{"node": wait3_name, "type": "main", "index": 0}]]}
    connections[wait3_name] = {"main": [[{"node": loop_name, "type": "main", "index": 0}]]}

    y_pos += 400

nodes.append({
    "id": "cls-note", "name": "Nota Clases", "type": "n8n-nodes-base.stickyNote", "typeVersion": 1,
    "position": [-200, 100],
    "parameters": {"content": "## Triggers Fijos de Clase\n\nCorreo 6: Pre-clase 1 (Mie 1 abr 6pm COL)\nCorreo 7: Post-clase 1 (Mie 1 abr 9pm COL)\nCorreo 10: Post-clase final (Sab 4 abr 1pm COL)\n\nBuscan personas en la Fase correcta.", "width": 380, "height": 200}
})

wf_data = json.dumps({
    "name": "Triggers Clase - Correos 6, 7, 10",
    "nodes": nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1", "timezone": "America/Bogota", "saveDataSuccessExecution": "all", "saveDataErrorExecution": "all"}
}, ensure_ascii=False).encode("utf-8")

req = urllib.request.Request(
    f"{API_URL}/api/v1/workflows",
    data=wf_data,
    headers={"X-N8N-API-KEY": API_KEY, "Content-Type": "application/json", "Accept": "application/json"},
    method="POST"
)
with urllib.request.urlopen(req, context=ctx) as resp:
    result = json.loads(resp.read().decode())
    print(f"\nWorkflow created!")
    print(f"  ID: {result['id']}")
    print(f"  Name: {result['name']}")
    print(f"  Nodes: {len(result['nodes'])}")
    print(f"  Active: {result['active']}")
