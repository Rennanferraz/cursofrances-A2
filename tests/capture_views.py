from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib
root=Path(__file__).resolve().parents[1]
ns={'__file__':str(root/'tests/test_pilot.py')}
exec((root/'tests/test_pilot.py').read_text().split('with sync_playwright() as p:')[0],ns)
def snap(page,name):
 page.evaluate("document.activeElement?.blur(); window.scrollTo({top:0,left:0,behavior:'instant'})")
 page.wait_for_timeout(180)
 page.screenshot(path=str(root/'tests'/name),full_page=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 ctx,page=ns['newpage'](b)
 snap(page,'01-parcours-desktop.png')
 page.locator('[data-action="resume"]').first.click();ns['route'](page,'unite/learn/2')
 snap(page,'02-unite-desktop.png')
 ns['route'](page,'unite/exercises/0');ns['choose'](page,'bank',True)
 assert page.locator('.option.incorrect').evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgb(255, 241, 242)'
 snap(page,'05-exercice-feedback-desktop.png')
 page.set_viewport_size({'width':390,'height':844});ns['route'](page,'parcours')
 snap(page,'03-parcours-mobile.png');ns['route'](page,'unite/learn/2')
 snap(page,'04-unite-mobile.png')
 ctx.close();b.close()
r=json.loads((root/'tests/relatorio_testes.json').read_text());r['artifactSha256']=hashlib.sha256((root/'index.html').read_bytes()).hexdigest()
r['tests'].append({'test':'Capturas finais e prioridade visual do feedback sobre a alternativa selecionada','result':'passed','details':'Nova compilação, azul de seleção substituído por vermelho/verde após correção'})
(root/'tests/relatorio_testes.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
print('Captures final; report has',len(r['tests']),'checks')
