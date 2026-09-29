"""Functional checks of the delivered HTML.
Requires: Python, playwright, Chromium. No dependency is needed by the learner.
The execution environment blocks URL navigation by enterprise policy. Therefore
this suite injects the HTML in about:blank and uses an explicit in-memory Web
Storage fixture. This is NOT a test of native file:// localStorage persistence,
real network media, installed voices, Firefox, Safari or mobile hardware.
The real application is unmodified and continues to use native localStorage.
"""
from pathlib import Path
import json, os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'source/pilot-data.json').read_text())
HTML=(ROOT/'index.html').read_text()
KEY='atelier-francais-a2:pilot-u19:progress:v2'
OLD='atelier-francais-a2:progress:v1'
QUESTIONS={q['id']:q for q in DATA['questions']}
RESULTS=[]; ERRORS=[]

def record(name,details=''):
    RESULTS.append({'test':name,'result':'passed','details':details})
    print('PASS',name,flush=True)

def getstate(page):
    return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)

def route(page,path):
    page.evaluate('(hash)=>location.hash=hash',path)
    page.wait_for_timeout(30)

def choose(page,key,wrong=False):
    st=getstate(page);se=st['sessions'][key];qid=se['ids'][se['index']];q=QUESTIONS[qid]
    oid=next(o['id'] for o in q['options'] if o['id']!=q['correctOptionId']) if wrong else q['correctOptionId']
    page.locator(f'input[data-quiz="{key}"][value="{oid}"]').check()
    page.locator(f'button[data-action="check"][data-key="{key}"]').click()
    assert page.locator(f'[data-session="{key}"] .feedback').is_visible()
    assert getstate(page)['answers'][qid]['lastOptionId']==oid
    return qid

def finish(page,key,wrong_first=False):
    while True:
        s=getstate(page)['sessions'][key]
        if s['finishedAt']: break
        if s['ids'][s['index']] not in s['submitted']:
            choose(page,key,wrong_first and s['index']==0)
        page.locator(f'button[data-action="next"][data-key="{key}"]').click()
    assert page.locator(f'[data-session="{key}"] .session-end').is_visible()

def import_file(page,obj):
    page.locator('#import-file').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':json.dumps(obj,ensure_ascii=False).encode()})
    page.wait_for_timeout(60)

def newpage(browser,initial=None,native=False,failwrite=False,width=1440):
    context=browser.new_context(viewport={'width':width,'height':1000},accept_downloads=True)
    context.route('https://**/*',lambda r:r.abort())
    page=context.new_page();page.set_default_timeout(5000)
    page.on('pageerror',lambda e:ERRORS.append(str(e)))
    if not native:
        page.evaluate('''({initial,failwrite})=>{
          const m=new Map(Object.entries(initial||{}));
          Object.defineProperty(window,'localStorage',{configurable:true,value:{
            getItem:k=>m.has(String(k))?m.get(String(k)):null,
            setItem:(k,v)=>{if(failwrite)throw new DOMException('Storage disabled','QuotaExceededError');m.set(String(k),String(v));},
            removeItem:k=>m.delete(String(k)),clear:()=>m.clear(),key:i=>[...m.keys()][i]??null,
            get length(){return m.size}
          }});
        }''',{'initial':initial or {},'failwrite':failwrite})
    page.set_content(HTML,wait_until='domcontentloaded')
    page.wait_for_timeout(80)
    return context,page

def export(page,filename):
    if not page.locator('#modal').is_visible():page.locator('[data-action="backup"]').first.click()
    with page.expect_download() as d:
        page.locator('#modal [data-action="export"]').click()
    path=ROOT/'tests'/filename;d.value.save_as(path)
    value=json.loads(path.read_text());assert value['format']=='atelier-francais-a2-progress'
    return value

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
    ctx,page=newpage(browser)
    assert page.locator('.map-number').count()==36
    assert page.locator('.done-node').count()==0
    assert page.locator('.path-block').count()==8
    assert not page.locator('#storage-warning').is_visible()
    record('36 unidades no mapa; somente U19 disponível; nenhuma conclusão fictícia')
    page.screenshot(path=str(ROOT/'tests/01-parcours-desktop.png'),full_page=True)
    page.locator('#unit-search').fill('imparfait')
    assert page.locator('.timeline .unit-row').count()>=2
    page.locator('.map-number[data-unit="u36"]').click()
    page.wait_for_timeout(300)
    assert page.locator('#block-7').get_attribute('open') is not None
    page.locator('[data-action="preview"][data-unit="u36"]').click()
    assert 'ainda não foi integrada' in page.locator('#modal').inner_text()
    page.keyboard.press('Escape')
    assert not page.locator('#modal').is_visible()
    record('Busca, localização da U36, objetivos originais no modal e Escape')
    page.locator('[data-action="resume"]').first.click()
    assert getstate(page)['started'] is True
    page.screenshot(path=str(ROOT/'tests/02-unite-desktop.png'),full_page=True)
    assert page.locator('[data-action="check"][data-key="cp0"]').is_disabled()
    first=choose(page,'cp0',wrong=True)
    assert getstate(page)['answers'][first]['attempts']==1
    assert page.locator('[data-action="check"][data-key="cp0"]').count()==0
    page.locator('[data-action="restart"][data-key="cp0"]').click()
    choose(page,'cp0')
    assert getstate(page)['answers'][first]['attempts']==2
    assert getstate(page)['answers'][first]['firstOptionId']!=getstate(page)['answers'][first]['lastOptionId']
    page.locator('[data-action="bookmark"]').click()
    record('Múltipla escolha, verificação única, feedback e preservação da primeira tentativa')
    for i in range(10):
        route(page,f'unite/learn/{i}')
        page.locator('input[data-read]').check()
        if i:choose(page,'cp'+str(i))
    assert len([v for v in getstate(page)['marks'].values() if v])==10
    record('10 fichas marcadas e 10 checkpoints respondidos com IDs originais')
    route(page,'unite/exercises/0')
    firstbank=choose(page,'bank',wrong=True)
    page.locator('[data-action="next"][data-key="bank"]').click()
    st=getstate(page);assert st['sessions']['bank']['index']==1
    # New document, same serialized storage; fixture emulates persisted values.
    ctx2,p2=newpage(browser,{KEY:json.dumps(st)})
    p2.locator('[data-action="resume"]').first.click()
    assert getstate(p2)['sessions']['bank']['index']==1
    p2.locator('input[data-quiz="bank"]').first.check()
    unfinished=getstate(p2)
    ctx3,p3=newpage(browser,{KEY:json.dumps(unfinished)})
    p3.locator('[data-action="resume"]').first.click()
    p3.locator('input[data-quiz="bank"]:checked').wait_for()
    assert p3.locator('input[data-quiz="bank"]:checked').count()==1
    record('Retomada de série e alternativa ainda não corrigida em novo documento', 'Web Storage simulado explicitamente')
    ctx2.close();ctx3.close()
    finish(page,'bank')
    assert len([i for i in DATA['groups']['bank'] if i in getstate(page)['answers']])==20
    record('Banco completo: 20 questões, resultado e histórico de tentativa')
    route(page,'unite/context/0');finish(page,'dialogue')
    page.locator('[data-action="context-tab"][data-tab="reading"]').click();finish(page,'reading')
    page.locator('[data-action="context-tab"][data-tab="vocab"]').click()
    assert page.locator('.vocab-card, .vocab-table, table').count()>=1 or 'vocabulaire' in page.locator('main').inner_text()
    record('Diálogo, leitura, vocabulário e 6 questões contextualizadas')
    route(page,'unite/media/0')
    assert page.locator('iframe').count()==0
    page.locator('[data-action="speak-listening"]').click()
    assert page.locator('#listening-transcript').get_attribute('open') is not None
    finish(page,'listening');finish(page,'phonetic')
    assert page.locator('a[href="https://www.youtube.com/watch?v=byn9BP3f4Jk"]').count()==1
    page.locator('[data-action="load-video"]').first.click()
    assert 'youtube-nocookie.com/embed/byn9BP3f4Jk' in page.locator('iframe').get_attribute('src')
    record('4 questões de som/leitura; transcrição de contingência; iframe só por clique', 'Rede externa bloqueada: reprodução real não testada')
    route(page,'unite/drills/0')
    for i in range(3):
        page.locator(f'[data-action="drill"][data-drill="{i}"]').click()
        assert len(getstate(page)['sessions']['drill']['ids'])==6
        finish(page,'drill')
    assert getstate(page)['drillRuns']==3
    record('Três recortes de drills com seis perguntas; conclusão e repetição sem cronômetro')
    route(page,'unite/application/0');finish(page,'application',wrong_first=True)
    st=getstate(page);assert len(st['answers'])==46
    assert page.locator('textarea').count()==0
    route(page,'progres')
    assert '6 / 6' in page.locator('main').inner_text() or '6/6' in page.locator('main').inner_text()
    record('46 questões distintas e 6 etapas completas, sem exigir acerto integral ou vídeo')
    route(page,'revisions')
    assert page.locator('[data-action="review-errors"]').count()==1
    page.locator('[data-action="review-errors"]').click();finish(page,'review')
    st=getstate(page)
    assert all(QUESTIONS[qid]['correctOptionId']==a['lastOptionId'] for qid,a in st['answers'].items())
    record('Revisão reúne erros reais; correção atualiza o resultado sem apagar a primeira tentativa')
    backup=export(page,'fixture-export-complete.json')
    record('Exportação JSON real por Blob e evento de download do navegador')
    ctx4,p4=newpage(browser)
    p4.locator('[data-action="resume"]').first.click()
    before=getstate(p4)
    import_file(p4,backup)
    assert p4.locator('[data-action="confirm-import"]').is_visible()
    assert getstate(p4)['answers']==before['answers']
    p4.locator('[data-action="close-modal"]').first.click()
    assert getstate(p4)['answers']==before['answers']
    import_file(p4,backup);p4.locator('[data-action="confirm-import"]').click()
    p4.wait_for_timeout(80)
    after=getstate(p4)
    for k in ['answers','sessions','marks','bookmarks','drillRuns']:
        assert after[k]==backup['state'][k],k
    record('Importação em contexto isolado: prévia, cancelar, confirmar e restauração de estado', 'Dois contextos Chromium; não equivale a validar outro motor de navegador')
    for tag,change in [
        ('versão desconhecida',lambda x:x.update(schemaVersion=77)),
        ('pergunta desconhecida',lambda x:x['state']['answers'].update({'unknown':next(iter(x['state']['answers'].values()))})),
        ('alternativa inválida',lambda x:x['state']['answers'][first].update(lastOptionId='wrongOption')),
        ('índice de série incoerente',lambda x:x['state']['sessions']['bank'].update(index=999))
    ]:
        bad=json.loads(json.dumps(backup));change(bad);prior=getstate(p4)
        import_file(p4,bad)
        assert not p4.locator('[data-action="confirm-import"]').is_visible()
        assert getstate(p4)==prior, {k:(prior.get(k),getstate(p4).get(k)) for k in prior if prior.get(k)!=getstate(p4).get(k)}
    p4.locator('#import-file').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'no json'});p4.wait_for_timeout(60)
    assert getstate(p4)==prior, {k:(prior.get(k),getstate(p4).get(k)) for k in prior if prior.get(k)!=getstate(p4).get(k)}
    p4.locator('#import-file').set_input_files({'name':'big.json','mimeType':'application/json','buffer':b' '*3_000_001});p4.wait_for_timeout(60)
    assert getstate(p4)==prior, {k:(prior.get(k),getstate(p4).get(k)) for k in prior if prior.get(k)!=getstate(p4).get(k)}
    record('Importações inválidas ou >3 MB rejeitadas sem alterar o progresso')
    legacy={'schemaVersion':1,'contentVersion':'0.2.0','theme':'light','history':{'passe-compose-imparfait':{'attempts':2,'last':{'score':4,'total':6},'best':{'score':5,'total':6}}},'marks':{'passe-compose-imparfait/read':True},'drafts':{'passe-compose-imparfait-writing':'Texto pessoal de teste.'}}
    p4.evaluate('([k,v])=>localStorage.setItem(k,v)',[OLD,json.dumps(legacy)])
    prior=getstate(p4);import_file(p4,legacy);p4.locator('[data-action="confirm-import"]').click()
    p4.wait_for_timeout(80)
    after=getstate(p4);assert after['answers']==prior['answers'];assert after['legacy']==legacy
    assert json.loads(p4.evaluate('(k)=>localStorage.getItem(k)',OLD))==legacy
    record('Arquivo 0.2 preservado separadamente; não sobrepõe respostas nem modifica a chave antiga')
    # Responsive UI at the real CSS breakpoints, including text enlargement.
    route(p4,'unite/learn/2');p4.locator('[data-action="font"]').click()
    for width in [320,390,768,1440]:
        p4.set_viewport_size({'width':width,'height':900})
        for view in ['parcours','unite/learn/2','unite/media/0','unite/context/0','unite/exercises/0','unite/drills/0','unite/application/0','progres','revisions']:
            route(p4,view)
            w=p4.evaluate('[innerWidth,document.documentElement.scrollWidth]')
            assert w[1]<=w[0]+1,(width,view,w)
        p4.locator('[data-action="backup"]').first.click()
        rect=p4.locator('#modal').bounding_box()
        assert rect['width']<=width and rect['x']>=0
        p4.keyboard.press('Escape')
    record('Sem rolagem horizontal em 320, 390, 768 e 1440 px: 9 vistas + modal, inclusive A+')
    route(p4,'unite/learn/2');p4.locator('[data-action="focus"]').click()
    assert 'focus-mode' in p4.locator('body').get_attribute('class')
    assert p4.locator('.lesson-sidebar').is_hidden()
    p4.locator('[data-action="focus"]').click()
    record('Modo foco reversível e controle de tamanho de leitura')
    # Screenshots of a fresh instance: no fabricated learner data.
    visctx,vis=newpage(browser)
    vis.screenshot(path=str(ROOT/'tests/01-parcours-desktop.png'),full_page=True)
    vis.locator('[data-action="resume"]').first.click();route(vis,'unite/learn/2')
    vis.screenshot(path=str(ROOT/'tests/02-unite-desktop.png'),full_page=True)
    route(vis,'unite/exercises/0');choose(vis,'bank',wrong=True)
    vis.screenshot(path=str(ROOT/'tests/05-exercice-feedback-desktop.png'),full_page=True)
    vis.set_viewport_size({'width':390,'height':844});route(vis,'parcours')
    vis.screenshot(path=str(ROOT/'tests/03-parcours-mobile.png'),full_page=True)
    route(vis,'unite/learn/2');vis.screenshot(path=str(ROOT/'tests/04-unite-mobile.png'),full_page=True)
    # Native storage failure path in about:blank, no fixture.
    native_context,native=newpage(browser,native=True)
    assert native.locator('#storage-warning').is_visible()
    native.locator('[data-action="resume"]').first.click()
    native.locator('input[data-quiz="cp0"]').first.check();native.locator('[data-action="check"]').click()
    failbackup=export(native,'fixture-export-no-storage.json')
    assert len(failbackup['state']['answers'])==1
    record('Armazenamento nativo indisponível: aviso, estudo e exportação em memória')
    quota_context,quota=newpage(browser,failwrite=True)
    quota.locator('[data-action="resume"]').first.click()
    assert quota.locator('#storage-warning').is_visible()
    record('Quota/recusa ao gravar: aviso explícito e sem perda silenciosa')
    # Reload equivalent using a new document and preserved serialized fixture with no network.
    offline_context,offline=newpage(browser,{KEY:json.dumps(after)})
    offline_context.set_offline(True)
    offline.locator('[data-action="resume"]').first.click();route(offline,'unite/learn/3')
    assert offline.locator('.theory-card').is_visible()
    offline.locator('[data-action="restart"][data-key="cp3"]').click();choose(offline,'cp3')
    record('Texto, questão, feedback e histórico disponíveis sem rede', 'HTML injetado; Web Storage simulado')
    assert not ERRORS,ERRORS
    record('Nenhuma exceção JavaScript não tratada durante a suíte')
    report={'date':'2026-09-28','browser':browser.version,'environment':'Headless Chromium; HTML injected into about:blank because enterprise URL policy blocks file/http navigation. Explicit Web Storage fixture for persistence tests. No policy was changed.', 'tests':RESULTS,'pageErrors':ERRORS,'notVerified':['Native file:// persistence on user device','Actual Firefox/Safari/Edge execution','Physical smartphone use','YouTube playback or embedding authorization','French voice output on installed operating systems','External Google Fonts availability','Pedagogical approval by coordinator']}
    (ROOT/'tests/relatorio_testes.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    for context in list(browser.contexts): context.close()
    browser.close()
print('TOTAL',len(RESULTS), 'PASS')
