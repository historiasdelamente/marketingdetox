import json, re

with open("c:/Users/jivca/OneDrive/Documentos/TRABAJOIA/apps/historiasdelamente/marketingdetox/output/n8n-workflow-corrected.json", encoding="utf-8") as f:
    w = json.load(f)

nodes = {n['name']: n for n in w['nodes']}
conn = w.get('connections', {})

def get_targets(node_name):
    targets = []
    if node_name in conn:
        for conn_type, target_lists in conn[node_name].items():
            for target_list in target_lists:
                for t in target_list:
                    targets.append(t['node'])
    return targets

# Enable typecast on all Update nodes
for n in w['nodes']:
    if 'Update' in n['name'] and 'airtable' in n['type'].lower():
        if 'options' not in n['parameters']:
            n['parameters']['options'] = {}
        n['parameters']['options']['typecast'] = True

FLOWS = {
    2:  ('Schedule Trigger',  'Buscar enviado2',    'Code in JavaScript1', 'Enviar Correo 1', 'Update record1',  'Enviado1', 'Enviado2',    '0 14 28 3 *'),
    3:  ('Schedule Trigger1', 'Buscar Pendientes1', 'Code in JavaScript2', 'Enviar Correo 2', 'Update record2',  'Enviado2', 'Enviado3',    '0 14 29 3 *'),
    4:  ('Schedule Trigger2', 'Buscar Pendientes2', 'Code in JavaScript3', 'Enviar Correo 3', 'Update record10', 'Enviado3', 'Enviado4',    '0 14 30 3 *'),
    5:  ('Schedule Trigger3', 'Buscar Pendientes3', 'Code in JavaScript4', 'Enviar Correo 4', 'Update record9',  'Enviado4', 'Enviado5',    '0 14 31 3 *'),
    6:  ('Schedule Trigger4', 'Buscar Pendientes4', 'Code in JavaScript5', 'Enviar Correo 5', 'Update record3',  'Enviado5', 'Enviado6',    '0 23 1 4 *'),
    7:  ('Schedule Trigger5', 'Buscar Pendientes5', 'Code in JavaScript6', 'Enviar Correo 6', 'Update record7',  'Enviado6', 'Enviado7',    '0 2 2 4 *'),
    8:  ('Schedule Trigger6', 'Buscar enviado',     'Code in JavaScript7', 'Enviar Correo 7', 'Update record6',  'Enviado7', 'Enviado8',    '0 14 3 4 *'),
    9:  ('Schedule Trigger7', 'Buscar Pendientes6', 'Code in JavaScript8', 'Enviar Correo 8', 'Update record8',  'Enviado8', 'Enviado9',    '0 14 4 4 *'),
    10: ('Schedule Trigger8', 'Buscar Pendientes7', 'Code in JavaScript9', 'Enviar Correo 9', 'Update record11', 'Enviado9', 'COMPLETADO',  '0 18 4 4 *'),
}

errors = []
print('=' * 70)
print('REVISION EXHAUSTIVA - WORKFLOW LANZAMIENTO ABRIL')
print('=' * 70)

for num, (trigger, search, code, gmail, update, filter_val, estado_after, cron) in FLOWS.items():
    print(f'\n--- CORREO {num} ---')

    # 1. Trigger cron
    t = nodes.get(trigger)
    if t:
        rule = t['parameters'].get('rule', {}).get('interval', [{}])[0]
        actual = rule.get('expression', '')
        ok = actual == cron
        print(f'  [{"OK" if ok else "ERR"}] Trigger: {actual}' + ('' if ok else f' (expected {cron})'))
        if not ok: errors.append(f'C{num}: trigger')
    else:
        print(f'  [ERR] Trigger {trigger} NOT FOUND')
        errors.append(f'C{num}: trigger missing')

    # 2. Search filter
    s = nodes.get(search)
    if s:
        expected_filter = '{Estado_Email} = "' + filter_val + '"'
        actual_filter = s['parameters'].get('filterByFormula', '')
        ok = actual_filter == expected_filter
        print(f'  [{"OK" if ok else "ERR"}] Filter: {actual_filter}' + ('' if ok else f' (expected {expected_filter})'))
        if not ok: errors.append(f'C{num}: filter')

        tid = s['parameters'].get('table', {}).get('value', '')
        ok = tid == 'tblPNIejnMmghW4ND'
        print(f'  [{"OK" if ok else "ERR"}] Search table' + ('' if ok else f': {tid}'))
        if not ok: errors.append(f'C{num}: search table')

        fields = s['parameters'].get('options', {}).get('fields', [])
        cf = f'Correo{num}_Enviado'
        ok = cf in fields
        print(f'  [{"OK" if ok else "ERR"}] Search fields: {cf} in {fields}')
        if not ok: errors.append(f'C{num}: search fields')

    # 3. Code node
    c = nodes.get(code)
    if c:
        js = c['parameters'].get('jsCode', '')
        cf = f'Correo{num}_Enviado'
        ff = f'Fecha_envio_{num}'
        ok1 = cf in js
        ok2 = ff in js
        print(f'  [{"OK" if ok1 else "ERR"}] Code: {cf}')
        print(f'  [{"OK" if ok2 else "ERR"}] Code: {ff}')
        if not ok1: errors.append(f'C{num}: code correo field')
        if not ok2: errors.append(f'C{num}: code fecha field')

    # 4. Update node
    u = nodes.get(update)
    if u:
        val = u['parameters'].get('columns', {}).get('value', {})

        ok = val.get('Estado_Email') == estado_after
        print(f'  [{"OK" if ok else "ERR"}] Update Estado: {val.get("Estado_Email")}' + ('' if ok else f' (expected {estado_after})'))
        if not ok: errors.append(f'C{num}: update estado')

        cf = f'Correo{num}_Enviado'
        ok = val.get(cf) == True
        print(f'  [{"OK" if ok else "ERR"}] Update checkbox: {cf}={val.get(cf)}')
        if not ok: errors.append(f'C{num}: update checkbox')

        ff = f'Fecha_envio_{num}'
        ok = ff in val
        print(f'  [{"OK" if ok else "ERR"}] Update fecha: {ff}')
        if not ok: errors.append(f'C{num}: update fecha')

        tid = u['parameters'].get('table', {}).get('value', '')
        ok = tid == 'tblPNIejnMmghW4ND'
        print(f'  [{"OK" if ok else "ERR"}] Update table' + ('' if ok else f': {tid}'))
        if not ok: errors.append(f'C{num}: update table')

        tc = u['parameters'].get('options', {}).get('typecast', False)
        print(f'  [{"OK" if tc else "WARN"}] Typecast: {tc}')

    # 5. Connections
    tt = get_targets(trigger)
    ok = search in tt
    print(f'  [{"OK" if ok else "ERR"}] Connection: {trigger} -> {search}')
    if not ok: errors.append(f'C{num}: connection')

# No seconds triggers
print('\n--- TRIGGERS DE SEGUNDOS ---')
for n in w['nodes']:
    if 'scheduleTrigger' in n['type']:
        rule = n['parameters'].get('rule', {}).get('interval', [{}])[0]
        if rule.get('field') == 'seconds':
            print(f'  [ERR] {n["name"]}: cada {rule.get("secondsInterval")} seg')
            errors.append(f'seconds trigger: {n["name"]}')
print('  [OK] Ninguno' if not any('seconds' in e for e in errors) else '')

print(f'\n{"=" * 70}')
print(f'RESULTADO: {len(errors)} errores')
if errors:
    for e in errors:
        print(f'  - {e}')
else:
    print('TODO PERFECTO - 0 ERRORES')
print(f'{"=" * 70}')

# Save
with open("c:/Users/jivca/OneDrive/Documentos/TRABAJOIA/apps/historiasdelamente/marketingdetox/output/n8n-workflow-corrected.json", "w", encoding="utf-8") as f:
    json.dump(w, f, ensure_ascii=False)
print('\nWorkflow saved with typecast enabled on all Update nodes.')
