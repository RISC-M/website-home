const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { validateProject, publishedProjects } = require('./projects.cjs');
const project = (overrides = {}) => ({ title:'A real project', slug:'a-real-project', blurb:'A short description.', published:'2026-10-01', status:'in-progress', github:'https://github.com/RISC-M/example', contributors:[{name:'Example Member', linkedin:'https://www.linkedin.com/in/example/'}], ...overrides });

test('validates required fields, actual dates, statuses, and safe external links', () => {
  assert.doesNotThrow(() => validateProject(project()));
  for (const override of [{published:'2026-02-30'}, {status:'finished'}, {slug:'../escape'}, {github:'javascript:alert(1)'}, {contributors:[]}, {draft:'false'}, {updated:'2026-09-01'}, {contributors:[{name:'Member', linkedin:'https://linkedin.com.evil.test/user'}]}]) {
    assert.throws(() => validateProject(project(override)));
  }
});

test('excludes drafts, sorts by publication date, and rejects duplicate URLs', () => {
  const items = [project(), project({slug:'draft',draft:true,published:'2026-10-18'}), project({slug:'newer',published:'2026-10-10'})].map(data => ({data}));
  assert.deepEqual(publishedProjects(items).map(item => item.data.slug), ['newer','a-real-project']);
  assert.throws(() => publishedProjects([items[0],items[0]]), /Duplicate/);
});

test('build generates escaped project cards, detail routes, sitemap, and excludes draft pages', async () => {
  const root = path.resolve(__dirname, '..');
  const previousDirectory = process.cwd();
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'risc-m-showcase-test-'));
  try {
    fs.cpSync(root, temporary, {recursive:true,filter: file => !['.git','node_modules','_site'].includes(path.basename(file))});
    const write = (name, data) => fs.writeFileSync(path.join(temporary,'content/projects',name), `---\n${JSON.stringify(data,null,2)}\n---\n\n## Overview\n\nProject detail with **formatting**.\n`);
    write('test-older.md',project({title:'Test <Project>',slug:'test-older'}));
    write('test-newer.md',project({slug:'test-newer',status:'completed',published:'2026-10-10',contributors:[...project().contributors,{name:'Second Member',linkedin:'https://linkedin.com/in/second'}]}));
    const Eleventy = (await import('@11ty/eleventy')).default;
    process.chdir(temporary);
    const builder = new Eleventy('.', '_site', {configPath:path.join(temporary, '.eleventy.js')});
    builder.setIsVerbose(false);
    await builder.write();
    const listing = fs.readFileSync(path.join(temporary,'_site/showcase/index.html'),'utf8');
    assert.match(listing,/Test &lt;Project&gt;/);
    assert.match(listing,/data-status="completed"/);
    assert.match(listing,/Second Member/);
    assert.ok(listing.indexOf('href="/showcase/test-newer/"') < listing.indexOf('href="/showcase/test-older/"'));
    assert.match(listing,/showcase-card-primary/);
    assert.match(listing,/target="_blank" rel="noopener noreferrer"/);
    const detail = fs.readFileSync(path.join(temporary,'_site/showcase/test-older/index.html'),'utf8');
    assert.match(detail,/<strong>formatting<\/strong>/);
    assert.match(detail,/https:\/\/www.risc-m.com\/showcase\/test-older\//);
    assert.ok(!fs.existsSync(path.join(temporary,'_site/showcase/your-project-title')));
    assert.match(fs.readFileSync(path.join(temporary,'_site/sitemap.xml'),'utf8'),/showcase\/test-newer/);
  } finally { process.chdir(previousDirectory); fs.rmSync(temporary,{recursive:true,force:true}); }
});

test('browser controls combine filtering, date order, empty states, and shareable URLs', () => {
  const vm = require('node:vm');
  const element = (dataset = {}) => ({ dataset, hidden:false, style:{}, attributes:{}, handlers:{}, classList:{add(){},remove(){}}, setAttribute(key,value){this.attributes[key]=value;}, addEventListener(event,handler){this.handlers[event]=handler;} });
  const cards = [element({status:'completed',published:'2026-10-01',title:'Earlier'}),element({status:'in-progress',published:'2026-10-15',title:'Later'})];
  const grid = element();
  grid.children = [...cards];
  grid.querySelectorAll = () => cards;
  grid.append = card => { grid.children = grid.children.filter(item => item !== card); grid.children.push(card); };
  const filters = ['all','in-progress','completed'].map(statusFilter => element({statusFilter}));
  const sort = element();
  const count = element();
  const empty = element();
  const controls = element();
  controls.hidden = true;
  const elements = {'showcase-grid':grid,'showcase-sort':sort,'showcase-count':count,'showcase-empty':empty};
  const location = {href:'https://www.risc-m.com/showcase/?status=completed&sort=oldest',search:'?status=completed&sort=oldest'};
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../showcase.js'),'utf8'), {
    document:{getElementById:id => elements[id],querySelectorAll:() => filters,querySelector:() => controls},
    window:{location,history:{replaceState(_state,_title,url){location.href=String(url);}}}, URL,URLSearchParams
  });
  assert.equal(controls.hidden,false);
  assert.equal(cards[1].hidden,true);
  assert.equal(count.textContent,'1 project');
  assert.equal(filters[2].attributes['aria-pressed'],'true');
  filters[0].handlers.click();
  assert.equal(count.textContent,'2 projects');
  assert.deepEqual(grid.children.map(card => card.dataset.title),['Earlier','Later']);
  sort.value = 'newest'; sort.handlers.change();
  assert.deepEqual(grid.children.map(card => card.dataset.title),['Later','Earlier']);
  filters[1].handlers.click();
  assert.equal(cards[0].hidden,true);
  assert.match(location.href,/status=in-progress/);
  cards[1].dataset.status='completed';
  filters[1].handlers.click();
  assert.equal(empty.hidden,false);
  assert.equal(count.textContent,'0 projects');
});
