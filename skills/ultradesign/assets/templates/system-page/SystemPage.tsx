import { Button } from '@base-ui-components/react/button';
import { Input } from '@base-ui-components/react/input';
import { Menu } from '@base-ui-components/react/menu';
import { Tabs } from '@base-ui-components/react/tabs';
import { useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import s from './SystemPage.module.css';

export type Token = { path: string; value: string | number; resolved: string | number; css: string };
export type TokenCatalog = Record<'colors' | 'typography' | 'rounded' | 'spacing' | 'motion' | 'components', Token[]>;

/** Values are DESIGN.md paths, not CSS literals. Typography values name groups. */
export type SystemRoles = {
  colors: {
    canvas: string; surface: string; field: string; text: string;
    muted: string; border: string; controlBorder: string; focus: string;
  };
  typography: { body: string; title: string; label: string; code: string };
  spacing: { gap: string; section: string; gutter: string; row: string; phoneRow: string };
  radius: string;
};

export type SystemStatus = { id: string; label: string; description: string; glyph: ReactNode; colorToken: string };
export type SpecimenItem = { id: string; title: string; detail: string; status: string; metadata: string };
export type SystemContent = {
  name: string; summary: string; task: string; source: string; typeSample: string;
  items: SpecimenItem[]; statuses: SystemStatus[];
};
export type SystemPageProps = { catalog: TokenCatalog; roles: SystemRoles; content: SystemContent };

const typeProperties: Record<string, string> = { fontFeature: 'fontFeatureSettings', fontVariation: 'fontVariationSettings' };
function typography(tokens: Token[], group: string): CSSProperties {
  const prefix = `${group}.`;
  return Object.fromEntries(tokens.filter(token => token.path.startsWith(prefix)).map(token => {
    const property = token.path.slice(prefix.length);
    return [typeProperties[property] ?? property, `var(${token.css})`];
  }));
}

function groups(tokens: Token[]) {
  return [...new Set(tokens.map(token => token.path.slice(0, token.path.lastIndexOf('.'))))];
}

/** Mount under /system. No product records, palette, fonts, or status language are bundled. */
export function SystemPage({ catalog, roles, content }: SystemPageProps) {
  const id = useId();
  const sortTrigger = useRef<HTMLButtonElement>(null);
  const restoreSortFocus = useRef(false);
  const tokens = Object.values(catalog).flat();
  const byPath = new Map(tokens.map(token => [token.path, token]));
  const variable = (path: string) => {
    const token = byPath.get(path);
    if (!token) throw new Error(`System page role is not a generated token: ${path}`);
    return `var(${token.css})`;
  };
  const theme: Record<string, string | number> = {};
  for (const [role, path] of Object.entries(roles.colors)) theme[`--system-${role}`] = variable(path);
  for (const [role, path] of Object.entries(roles.spacing)) theme[`--system-${role}`] = variable(path);
  theme['--system-radius'] = variable(roles.radius);
  // The same generated type recipes style both the page and their specimens.
  const typeStyles = Object.fromEntries(Object.entries(roles.typography).map(([role, path]) => {
    if (!catalog.typography.some(token => token.path.startsWith(`${path}.`))) {
      throw new Error(`System page typography role is not a generated group: ${path}`);
    }
    return [role, typography(catalog.typography, path)];
  }));
  for (const [role, style] of Object.entries(typeStyles)) {
    for (const [key, value] of Object.entries(style)) {
      theme[`--system-${role}-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`] = String(value);
    }
  }
  const statuses = new Map(content.statuses.map(status => [status.id, status]));
  if (statuses.size !== content.statuses.length || new Set(content.items.map(item => item.id)).size !== content.items.length) {
    throw new Error('System specimen item and status IDs must be unique.');
  }
  for (const item of content.items) {
    if (!statuses.has(item.status)) throw new Error(`Unknown specimen status ${item.status} for ${item.id}`);
  }
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('source');
  const [selectedId, setSelectedId] = useState(content.items[0]?.id ?? '');
  const [note, setNote] = useState('');
  const [validation, setValidation] = useState(false);
  const [savedNote, setSavedNote] = useState('');
  const [feedback, setFeedback] = useState('ready');
  const [playing, setPlaying] = useState({ group: '', iteration: 0 });
  const visible = content.items.filter(item => `${item.id} ${item.title} ${item.detail}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  if (sort === 'title') visible.sort((a, b) => a.title.localeCompare(b.title));
  const selected = visible.find(item => item.id === selectedId);

  function statusGlyph(status: SystemStatus) {
    return <span className={s.status} role="img" aria-label={status.label} title={status.label}
      style={{ color: variable(status.colorToken) }}><span aria-hidden="true">{status.glyph}</span></span>;
  }
  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidation(!note.trim());
    if (note.trim()) setSavedNote(note.trim());
  }

  return <div className={s.system} style={theme as CSSProperties}>
    <a className={s.skip} href={`#${id}-main`}>Skip to system specimens</a>
    <header className={s.heading}>
      <div><h1>{content.name}</h1><p>{content.summary}</p></div>
      <p className={s.source}>{content.source}</p>
    </header>
    <nav className={s.navigation} aria-label="System sections">
      <a href={`#${id}-context`}>In context</a><a href={`#${id}-controls`}>Controls and feedback</a>
      <a href={`#${id}-foundations`}>Foundations</a><a href={`#${id}-recipes`}>Component recipes</a>
    </nav>
    <main id={`${id}-main`}>
      <section id={`${id}-context`} className={s.section} aria-labelledby={`${id}-context-title`}>
        <h2 id={`${id}-context-title`}>In context</h2>
        <p>{content.task}</p>
        <div className={s.toolbar}>
          <label className={s.search} htmlFor={`${id}-search`}>Filter specimen records
            <Input id={`${id}-search`} className={s.input} value={query} onValueChange={setQuery} type="search" />
          </label>
          <Button className={s.button} disabled={!query} onClick={() => setQuery('')}>Clear filter</Button>
          <Menu.Root onOpenChange={(open, details) => {
            if (open) restoreSortFocus.current = false;
            else if (details.reason === 'escape-key') restoreSortFocus.current = true;
          }} onOpenChangeComplete={open => {
            // Hover-close can follow Escape while the pointer is over the popup.
            // Restore once closing completes, not during the focus-manager teardown.
            if (!open && restoreSortFocus.current) {
              restoreSortFocus.current = false;
              sortTrigger.current?.focus({ preventScroll: true });
            }
          }}>
            <Menu.Trigger ref={sortTrigger} className={s.button}>Sort: {sort === 'source' ? 'source order' : 'title'}</Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner sideOffset={4} align="end" className={s.positioner} style={theme as CSSProperties}>
                <Menu.Popup className={s.menu}>
                  <Menu.RadioGroup value={sort} onValueChange={value => setSort(String(value))}>
                    <Menu.RadioItem value="source" className={s.menuItem} closeOnClick>
                      <Menu.RadioItemIndicator>Selected: </Menu.RadioItemIndicator>Source order
                    </Menu.RadioItem>
                    <Menu.RadioItem value="title" className={s.menuItem} closeOnClick>
                      <Menu.RadioItemIndicator>Selected: </Menu.RadioItemIndicator>Title
                    </Menu.RadioItem>
                  </Menu.RadioGroup>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
        <p role="status" className={s.muted}>{visible.length} matching records</p>
        <div className={s.context}>
          <div className={s.list}>
            {visible.length ? <ul aria-label="Specimen records">{visible.map(item => <li key={item.id}>
              <Button className={s.row} aria-pressed={selectedId === item.id} onClick={() => setSelectedId(item.id)}>
                {statusGlyph(statuses.get(item.status)!)}<span><strong>{item.title}</strong><code>{item.id}</code></span>
                <span className={s.metadata}>{item.metadata}</span>
              </Button>
            </li>)}</ul> : <div className={s.panel}><h3>No matching records</h3>
              <p>Clear the filter to return to the supplied specimen.</p><Button className={s.button} onClick={() => setQuery('')}>Clear filter</Button></div>}
          </div>
          <article className={s.panel} aria-label="Selected specimen detail" aria-live="polite" aria-atomic="true">
            {selected ? <><h3>{selected.title}</h3><p>{statuses.get(selected.status)!.label} / {selected.metadata}</p>
              <p className={s.detail}>{selected.detail}</p><code>{selected.id}</code></>
              : <><h3>Select a record</h3><p>Select a visible record to read its detail.</p></>}
          </article>
        </div>
        <ul className={s.legend} aria-label="Status shapes and meanings">{content.statuses.map(status =>
          <li key={status.id}>{statusGlyph(status)}<span><strong>{status.label}</strong> {status.description}</span></li>)}</ul>
      </section>

      <section id={`${id}-controls`} className={s.section} aria-labelledby={`${id}-controls-title`}>
        <h2 id={`${id}-controls-title`}>Controls and feedback</h2>
        <p>Use pointer hover, press, Tab, Enter and Escape on the live controls. Focus is not a painted preview.</p>
        <Tabs.Root defaultValue="review">
          <Tabs.List className={s.tabs} aria-label="Control specimens">
            <Tabs.Tab className={s.tab} value="review">Review note</Tabs.Tab>
            <Tabs.Tab className={s.tab} value="feedback">Feedback states</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="review" className={s.panel}>
            <form onSubmit={saveNote} noValidate className={s.form}>
              <label htmlFor={`${id}-note`}>Review note (required)</label>
              <Input id={`${id}-note`} className={s.input} value={note} onValueChange={value => { setNote(value); setValidation(false); }}
                required aria-invalid={validation || undefined} aria-describedby={`${id}-note-help${validation ? ` ${id}-note-error` : ''}`} />
              <p id={`${id}-note-help`} className={s.muted}>This local interaction specimen saves only in this page's memory. It does not update the product or owner decision log.</p>
              {validation && <p id={`${id}-note-error`} role="alert">Enter a review note before saving.</p>}
              <div className={s.toolbar}><Button type="submit" className={`${s.button} ${s.primary}`}>Save local note</Button>
                <Button type="button" className={s.button} disabled={!note && !savedNote} onClick={() => { setNote(''); setSavedNote(''); setValidation(false); }}>Reset note</Button>
                <Button type="button" className={s.button} disabled aria-describedby={`${id}-publish-help`}>Publish unavailable</Button></div>
              <p id={`${id}-publish-help`} className={s.muted}>Publishing is not connected in this template.</p>
              <p role="status">{savedNote ? `Saved locally: ${savedNote}` : 'No local note saved.'}</p>
            </form>
          </Tabs.Panel>
          <Tabs.Panel value="feedback" className={s.panel}>
            <p>Explicit state specimens; these controls do not start requests or simulate real product failures.</p>
            <div className={s.toolbar}>{['ready', 'empty', 'loading', 'error'].map(state =>
              <Button key={state} className={s.button} aria-pressed={feedback === state} onClick={() => setFeedback(state)}>{state}</Button>)}</div>
            <div className={s.feedback} aria-live="polite">
              {feedback === 'ready' && <p>Ready. Choose a state to inspect its content and semantics.</p>}
              {feedback === 'empty' && <><h3>No records in this specimen</h3><p>A real empty state should name the missing object and a useful next action.</p>
                <Button className={s.button} onClick={() => setFeedback('ready')}>Return to ready</Button></>}
              {feedback === 'loading' && <><p role="status">Loading state specimen. No request is running.</p><div className={s.skeleton} aria-hidden="true" />
                <Button className={s.button} onClick={() => setFeedback('ready')}>Close loading specimen</Button></>}
              {feedback === 'error' && <><h3>Error state specimen</h3><p>No product error occurred. Connect the real error and retry action in your product.</p>
                <Button className={s.button} onClick={() => setFeedback('ready')}>Close error specimen</Button></>}
            </div>
          </Tabs.Panel>
        </Tabs.Root>
      </section>

      <section id={`${id}-foundations`} className={s.section} aria-labelledby={`${id}-foundations-title`}>
        <h2 id={`${id}-foundations-title`}>Foundations from DESIGN.md</h2>
        <h3>Colors</h3>
        <ul className={s.colors}>{catalog.colors.map(token => <li key={token.path} data-token={token.path}>
          <div className={s.swatch} style={{ backgroundColor: variable(token.path) }} aria-hidden="true" />
          <code>{token.path}</code><code>{token.resolved}</code><small>{token.value}</small>
        </li>)}</ul>
        <h3>Typography in context</h3>
        <div className={s.typeList}>{groups(catalog.typography).map(group => <div key={group}>
          <code>{group}</code><p className={s.typeSample} style={typography(catalog.typography, group)}>{content.typeSample}</p>
          <dl className={s.values}>{catalog.typography.filter(token => token.path.startsWith(`${group}.`)).map(token =>
            <div key={token.path} data-token={token.path}><dt>{token.path.split('.').at(-1)}</dt><dd>{token.resolved}</dd></div>)}</dl>
        </div>)}</div>
        <h3>Spacing and shape</h3>
        <div className={s.metrics}>{[...catalog.spacing, ...catalog.rounded].map(token => <div key={token.path} data-token={token.path}>
          <code>{token.path}</code><code>{token.resolved}</code>
          {token.path.startsWith('rounded.') && <span className={s.radiusSample} style={{ borderRadius: variable(token.path) }} aria-hidden="true" />}
        </div>)}</div>
        {!!catalog.motion.length && <><h3>Motion after an action</h3><p>Replay each source recipe. Reduced-motion preference removes the animation.</p>
          {groups(catalog.motion).map(group => {
            const properties = Object.fromEntries(catalog.motion.filter(token => token.path.startsWith(`${group}.`)).map(token => [token.path.split('.').at(-1), variable(token.path)]));
            return <div key={group} className={s.motion}>
              <code>{group}</code><span className={s.motionTrack} aria-hidden="true">
                <span key={playing.group === group ? playing.iteration : 0} data-playing={playing.group === group || undefined}
                  style={{ '--recipe-duration': properties.duration, '--recipe-delay': properties.delay, '--recipe-easing': properties.timingFunction } as CSSProperties} /></span>
              <Button className={s.button} onClick={() => setPlaying({ group, iteration: playing.iteration + 1 })} aria-label={`Replay ${group}`}>Replay</Button>
            </div>;
          })}</>}
      </section>
      <section id={`${id}-recipes`} className={s.section} aria-labelledby={`${id}-recipes-title`}>
        <h2 id={`${id}-recipes-title`}>Component recipes</h2>
        <p>The ledger includes every emitted component leaf, including expanded typography aliases. Edit the design file and regenerate; do not edit the catalog.</p>
        {catalog.components.length ? <details><summary>{catalog.components.length} component token leaves</summary>
          <div className={s.tableScroll}><table><caption>Source aliases and resolved values</caption>
            <thead><tr><th scope="col">Token / CSS property</th><th scope="col">Source value</th><th scope="col">Resolved</th></tr></thead>
            <tbody>{catalog.components.map(token => <tr key={token.path} data-token={token.path}>
              <th scope="row"><code>{token.path}</code><br /><code>{token.css}</code></th>
              <td><code>{token.value}</code></td><td><code>{token.resolved}</code></td>
            </tr>)}</tbody></table></div></details> : <p>No component recipes are defined in DESIGN.md.</p>}
      </section>
    </main>
  </div>;
}
