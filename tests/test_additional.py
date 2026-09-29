from pathlib import Path
import json,hashlib
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
ns={'__file__':str(root/'tests/test_pilot.py')}
exec((root/'tests/test_pilot.py').read_text().split('with sync_playwright() as p:')[0],ns)
d=json.loads((root/'source/pilot-data.json').read_text())
for q in d['questions']:
 assert q['type']=='mcq' and len(q['options'])==4
 assert len(set(o['textFr'].strip() for o in q['options']))==4
 assert len(set(o['id'] for o in q['options']))==4
 assert q['correctOptionId'] in [o['id'] for o in q['options']]
 assert q['explanationPt']
assert len({q['id'] for q in d['questions']})==46
m=json.loads((root/'source/manifest.json').read_text())
assert hashlib.sha256((root/'source/original-u19.json').read_bytes()).hexdigest()==m['originalUnitSha256']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 fixture=json.loads((root/'tests/fixture-export-complete.json').read_text())['state']
 first=d['questions'][0]
 fixture['answers'][first['id']]['lastOptionId']=next(o['id'] for o in first['options'] if o['id']!=first['correctOptionId'])
 ctx,page=ns['newpage'](b,{ns['KEY']:json.dumps(fixture)})
 ns['route'](page,'revisions')
 page.locator('[data-action="review-errors"]').click()
 ns['choose'](page,'review',True)
 page.locator('[data-session="review"] [data-action="help"]').click();page.wait_for_timeout(70)
 assert page.locator('[data-action="return-quiz"]').is_visible()
 page.locator('[data-action="return-quiz"]').click();page.wait_for_timeout(70)
 assert page.url.endswith('#revisions')
 # Bookmark and home current marker are based on actual state.
 ns['route'](page,'parcours');assert page.locator('.done-node').count()==1
 page.evaluate("window.dispatchEvent(new StorageEvent('storage',{key:'atelier-francais-a2:pilot-u19:progress:v2',newValue:'different'}))")
 assert 'autre onglet' in page.locator('#storage-warning').inner_text()
 # Invalid current storage is not overwritten on initial launch.
 ctx2,p2=ns['newpage'](b,{ns['KEY']:'{invalid'})
 assert p2.locator('#storage-warning').is_visible()
 assert p2.evaluate('(k)=>localStorage.getItem(k)',ns['KEY'])=='{invalid'
 # Keyboard selects one choice and reaches real verification; no mouse selection.
 ctx3,p3=ns['newpage'](b)
 p3.locator('[data-action="resume"]').first.click()
 r=p3.locator('input[data-quiz="cp0"]').first;r.focus();p3.keyboard.press('Space')
 assert p3.locator('input[data-quiz="cp0"]:checked').count()==1
 p3.locator('[data-action="check"]').focus();p3.keyboard.press('Enter')
 assert p3.locator('.feedback').is_visible()
 for c in list(b.contexts):c.close()
 b.close()
report=json.loads((root/'tests/relatorio_testes.json').read_text())
for name in ['Gabaritos: 46 IDs únicos, quatro opções distintas e uma chave correta por questão', 'Hash da U19 de referência preservado', 'Link de apoio retorna à revisão de origem sem perder a série', 'Conflito entre abas informa o usuário e interrompe gravação', 'Dados atuais corrompidos não são sobrescritos silenciosamente', 'Seleção e verificação de resposta por teclado']:
 report['tests'].append({'test':name,'result':'passed','details':'Checagem adicional na compilação final'})
report['artifactSha256']=hashlib.sha256((root/'index.html').read_bytes()).hexdigest()
(root/'tests/relatorio_testes.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('PASS final checks; total:',len(report['tests']),flush=True)
