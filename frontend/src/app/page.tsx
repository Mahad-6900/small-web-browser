
'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties, FormEvent, SyntheticEvent } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Person = {
  _id: string;
  name: string;
};

type Site = {
  _id: string;
  address: string;
  title: string;
  html: string;
  author?: {
    _id?: string;
    name: string;
  } | string;
};

type Visit = {
  _id: string;
  address: string;
  fromAddress: string | null;
  visitedAt: string;
};

const panelStyle: CSSProperties = {
  padding: '22px',
  borderRadius: '15px',
  border: '1px solid rgba(160,170,210,0.15)',
  background: 'rgba(255,255,255,0.035)',
  marginTop: '14px',
};

const secondaryText: CSSProperties = {
  color: '#9da7c5',
  fontSize: '13px',
};

async function getSite(address: string): Promise<Site> {
  const response = await fetch(
    `${API_URL}/sites/address?address=${encodeURIComponent(address)}`
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || 'This address does not exist in Small Web.'
    );
  }

  return data;
}

function createSafeDocument(html: string) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src 'none'; connect-src 'none'; form-action 'none'; base-uri 'none';">
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #25283a;
          background: #ffffff;
          padding: 32px;
          line-height: 1.7;
          max-width: 900px;
          margin: 0 auto;
        }
        h1, h2, h3 { color: #20243a; line-height: 1.3; }
        a { color: #6657d9; text-decoration: underline; }
        p { color: #53596b; }
        img { max-width: 100%; height: auto; }
        code, pre { white-space: pre-wrap; }
      </style>
    </head>
    <body>${html}</body>
  </html>`;
}

function getTextPreview(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 170);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function Home() {
  const [address, setAddress] = useState('');
  const [activeView, setActiveView] = useState('browser');

  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState('');

  const [site, setSite] = useState<Site | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [trail, setTrail] = useState<string[]>([]);
  const [trailIndex, setTrailIndex] = useState(-1);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Site[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [visits, setVisits] = useState<Visit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const [publishAddress, setPublishAddress] = useState('');
  const [publishTitle, setPublishTitle] = useState('');
  const [publishHtml, setPublishHtml] = useState('');
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    async function loadPeople() {
      try {
        const response = await fetch(`${API_URL}/people`);

        if (!response.ok) {
          throw new Error('Unable to load people.');
        }

        const data: Person[] = await response.json();

        setPeople(data);

        const defaultPerson =
          data.find((person) => person.name === 'Mahad Khalid') || data[0];

        if (defaultPerson) {
          setSelectedPerson(defaultPerson._id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to connect to the API.'
        );
      }
    }

    loadPeople();
  }, []);

  async function loadHistory(personId: string) {
    if (!personId) return;

    setHistoryLoading(true);
    setHistoryError('');

    try {
      const response = await fetch(
        `${API_URL}/visits?person=${encodeURIComponent(personId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load browsing history.');
      }

      setVisits(data);
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : 'Unable to load history.'
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    if (selectedPerson) {
      loadHistory(selectedPerson);
    }
  }, [selectedPerson]);

  async function openAddress(
    target: string,
    fromAddress: string | null = site?.address ?? null,
    addToTrail = true
  ) {
    const cleanAddress = target
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');

    if (!cleanAddress || !selectedPerson) return;

    setLoading(true);
    setError('');

    try {
      const result = await getSite(cleanAddress);

      setSite(result);
      setAddress(cleanAddress);

      if (addToTrail) {
        const nextTrail = [
          ...trail.slice(0, trailIndex + 1),
          cleanAddress,
        ];

        setTrail(nextTrail);
        setTrailIndex(nextTrail.length - 1);
      }

      await fetch(`${API_URL}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person: selectedPerson,
          address: cleanAddress,
          fromAddress,
        }),
      });

      loadHistory(selectedPerson);
    } catch (err) {
      setSite(null);
      setError(
        err instanceof Error
          ? err.message
          : 'This address could not be opened.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function moveInHistory(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= trail.length || loading) return;

    const nextAddress = trail[nextIndex];

    setTrailIndex(nextIndex);

    await openAddress(nextAddress, site?.address ?? null, false);
  }

  function handleFrameLoad(event: SyntheticEvent<HTMLIFrameElement>) {
    const frameDocument = event.currentTarget.contentDocument;

    if (!frameDocument || !site) return;

    frameDocument.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();

        const href = link.getAttribute('href')?.trim();

        if (
          !href ||
          href.startsWith('#') ||
          /^(mailto:|javascript:|data:)/i.test(href)
        ) {
          return;
        }

        const target = href
          .replace(/^https?:\/\//i, '')
          .split(/[?#]/)[0]
          .replace(/\/+$/, '');

        if (target) {
          openAddress(target, site.address);
        }
      });
    });
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      setSearchError('Please enter a keyword to search.');
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const response = await fetch(
        `${API_URL}/sites/search?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Search failed.');
      }

      setSearchResults(data);

      if (data.length === 0) {
        setSearchError('No matching pages found. Try another keyword.');
      }
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : 'Unable to search pages.'
      );
    } finally {
      setSearchLoading(false);
    }
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPublishMessage('');
    setPublishError('');

    const cleanAddress = publishAddress
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');

    if (!cleanAddress || !publishTitle.trim() || !publishHtml.trim()) {
      setPublishError('Please complete all three fields.');
      return;
    }

    if (!selectedPerson) {
      setPublishError('Please select a publisher first.');
      return;
    }

    setPublishLoading(true);

    try {
      const response = await fetch(`${API_URL}/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: cleanAddress,
          title: publishTitle.trim(),
          html: publishHtml.trim(),
          author: selectedPerson,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || 'Unable to publish this page.'
        );
      }

      setPublishMessage('Your page has been published successfully.');
      setPublishAddress('');
      setPublishTitle('');
      setPublishHtml('');
    } catch (err) {
      setPublishError(
        err instanceof Error ? err.message : 'Unable to publish this page.'
      );
    } finally {
      setPublishLoading(false);
    }
  }

  const selectedPersonName =
    people.find((person) => person._id === selectedPerson)?.name ||
    'Loading user...';

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>small web</h2>
            <span>A quieter corner of the web</span>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <button
          className={`nav-item ${activeView === 'browser' ? 'active' : ''}`}
          onClick={() => setActiveView('browser')}
        >
          <span>⌘</span> Browse
        </button>

        <button
          className={`nav-item ${activeView === 'search' ? 'active' : ''}`}
          onClick={() => setActiveView('search')}
        >
          <span>⌕</span> Search
        </button>

        <button
          className={`nav-item ${activeView === 'history' ? 'active' : ''}`}
          onClick={() => {
            setActiveView('history');
            if (selectedPerson) loadHistory(selectedPerson);
          }}
        >
          <span>◷</span> History
        </button>

        <div className="sidebar-divider" />

        <div className="sidebar-label">YOUR SPACE</div>

        <button
          className={`nav-item ${activeView === 'publish' ? 'active' : ''}`}
          onClick={() => setActiveView('publish')}
        >
          <span>＋</span> Publish a site
        </button>

        <div className="sidebar-bottom">
          <div className="user-avatar">
            {selectedPersonName
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <strong>{selectedPersonName}</strong>
            <span>Browsing as</span>

            <select
              value={selectedPerson}
              onChange={(event) => setSelectedPerson(event.target.value)}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '7px',
                borderRadius: '7px',
                border: '1px solid rgba(151,157,202,0.2)',
                background: '#12172a',
                color: '#c9c6ee',
                fontSize: '11px',
              }}
            >
              {people.map((person) => (
                <option key={person._id} value={person._id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>
              {activeView === 'browser'
                ? 'Browser'
                : activeView === 'publish'
                  ? 'Publish'
                  : activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </strong>
          </div>

          <div className="topbar-right">
            <span className="connection-dot" />
            Small Web network
          </div>
        </header>

        <section className="content-area">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">YOUR PERSONAL WEB</div>

              <h1>
                {activeView === 'browser' && 'Explore the small web.'}
                {activeView === 'search' && 'Find something interesting.'}
                {activeView === 'history' && 'Your browsing trail.'}
                {activeView === 'publish' && 'Share something new.'}
              </h1>

              <p>A collection of thoughtful pages, made by people.</p>
            </div>

            <div className="date-label">INDEPENDENT BY DESIGN</div>
          </div>

          {activeView === 'browser' && (
            <div className="browser-card">
              <div className="browser-card-header">
                <div className="window-dots">
                  <i /><i /><i />
                </div>

                <span>SMALL WEB BROWSER</span>
                <span className="secure-label">● LOCAL NETWORK</span>
              </div>

              <div className="toolbar-row">
                <button
                  className="navigation-button"
                  disabled={trailIndex <= 0 || loading}
                  onClick={() => moveInHistory(trailIndex - 1)}
                  title="Go back"
                >
                  ←
                </button>

                <button
                  className="navigation-button"
                  disabled={
                    trailIndex < 0 ||
                    trailIndex >= trail.length - 1 ||
                    loading
                  }
                  onClick={() => moveInHistory(trailIndex + 1)}
                  title="Go forward"
                >
                  →
                </button>

                <button
                  className="navigation-button"
                  disabled={!site || loading}
                  onClick={() =>
                    openAddress(address, site?.address ?? null, false)
                  }
                  title="Refresh"
                >
                  ↻
                </button>

                <form
                  className="address-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    openAddress(address);
                  }}
                >
                  <span>⌕</span>

                  <input
                    className="address-input"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Enter a small web address..."
                  />

                  <button
                    className="go-button"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Go ↗'}
                  </button>
                </form>
              </div>

              {error && (
                <div style={{ ...panelStyle, borderColor: 'rgba(239,100,120,0.35)' }}>
                  <strong style={{ color: '#ff9eac' }}>Page unavailable</strong>
                  <p style={{ ...secondaryText, marginTop: '8px' }}>
                    {error}
                  </p>
                  <span style={secondaryText}>
                    Check the address or try another Small Web page.
                  </span>
                </div>
              )}

              {loading && !site && (
                <div className="empty-state">Opening your page...</div>
              )}

              {site && !loading && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      padding: '15px 20px',
                      borderBottom: '1px solid rgba(160,170,210,0.12)',
                      color: '#aeb7d2',
                      fontSize: '11px',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#e9eaff', fontSize: '13px' }}>
                        {site.title}
                      </strong>
                      <div style={{ marginTop: '4px' }}>{site.address}</div>
                    </div>

                    <span>
                      By {typeof site.author === 'object'
                        ? site.author?.name
                        : 'Community member'}
                    </span>
                  </div>

                  <iframe
                    title={site.title}
                    srcDoc={createSafeDocument(site.html)}
                    sandbox="allow-same-origin"
                    onLoad={handleFrameLoad}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '560px',
                      border: 'none',
                      background: '#ffffff',
                    }}
                  />
                </>
              )}

              {!site && !error && !loading && (
                <div className="browser-placeholder">
                  <div className="placeholder-icon">✳</div>
                  <span className="eyebrow">A WORLD OF ITS OWN</span>
                  <h2>Your next discovery<br />starts here.</h2>
                  <p>
                    Enter an address above to explore a page
                    <br />
                    from the Small Web collection.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeView === 'search' && (
            <div className="browser-card simple-panel">
              <div className="eyebrow">DISCOVER SOMETHING NEW</div>
              <h2>Search the Small Web</h2>
              <p>Explore ideas across page titles, addresses and written content.</p>

              <form
                onSubmit={handleSearch}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginTop: '22px',
                }}
              >
                <input
                  className="form-input"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Try design, projects, ideas..."
                  style={{ flex: 1, minWidth: '180px' }}
                />

                <button
                  className="primary-button"
                  type="submit"
                  disabled={searchLoading}
                  style={{
                    height: '42px',
                    minWidth: '105px',
                    padding: '0 20px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(139,119,255,0.18)',
                  }}
                >
                  {searchLoading ? 'Searching...' : 'Search ↗'}
                </button>
              </form>

              {searchError && (
                <p style={{ ...secondaryText, marginTop: '20px' }}>
                  {searchError}
                </p>
              )}

              {searchResults.length > 0 && (
                <div style={{ marginTop: '28px', width: '100%', minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '10px',
                      flexWrap: 'wrap',
                      marginBottom: '12px',
                    }}
                  >
                    <strong style={{ color: '#e9eaff' }}>Search results</strong>
                    <span style={secondaryText}>
                      {searchResults.length} matching pages
                    </span>
                  </div>

                  {searchResults.map((result) => (
                    <button
                      key={result._id}
                      type="button"
                      onClick={() => {
                        setActiveView('browser');
                        openAddress(result.address);
                      }}
                      style={{
                        ...panelStyle,
                        display: 'block',
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        textAlign: 'left',
                        color: '#e9eaff',
                        cursor: 'pointer',
                      }}
                    >
                      <strong
                        style={{
                          display: 'block',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {result.title}
                      </strong>

                      <div
                        style={{
                          ...secondaryText,
                          marginTop: '6px',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {result.address}
                      </div>

                      <p
                        style={{
                          color: '#aeb7d2',
                          fontSize: '13px',
                          lineHeight: 1.7,
                          marginTop: '10px',
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                        }}
                      >
                        {getTextPreview(result.html)}
                        {result.html.length > 170 ? '...' : ''}
                      </p>

                      <div
                        style={{
                          color: '#a99aff',
                          fontSize: '12px',
                          marginTop: '12px',
                        }}
                      >
                        Open page →
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'history' && (
            <div className="browser-card simple-panel">
              <div className="eyebrow">YOUR RECENT ACTIVITY</div>
              <h2>Browsing history</h2>
              <p>Pages visited by {selectedPersonName}.</p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginTop: '24px',
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <strong style={{ color: '#e9eaff', fontSize: '14px' }}>
                  Visited pages
                </strong>

                <button
                  type="button"
                  onClick={() => loadHistory(selectedPerson)}
                  disabled={historyLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '9px',
                    flexShrink: 0,
                    minWidth: '120px',
                    width: '120px',
                    height: '42px',
                    padding: '0 14px',
                    boxSizing: 'border-box',
                    border: '1px solid rgba(139,124,255,0.35)',
                    borderRadius: '10px',
                    background: 'rgba(139,124,255,0.12)',
                    color: '#c4baff',
                    fontSize: '13px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: historyLoading ? 'not-allowed' : 'pointer',
                    opacity: historyLoading ? 0.65 : 1,
                  }}
                >
                  <span style={{ fontSize: '16px', lineHeight: 1 }}>
                    {historyLoading ? '⟳' : '↻'}
                  </span>
                  {historyLoading ? 'Loading' : 'Refresh'}
                </button>
              </div>

              {historyLoading && (
                <p style={{ ...secondaryText, marginTop: '18px' }}>
                  Loading browsing history...
                </p>
              )}

              {historyError && (
                <p style={{ ...secondaryText, marginTop: '18px' }}>
                  {historyError}
                </p>
              )}

              {!historyLoading && visits.length === 0 && !historyError && (
                <div style={panelStyle}>
                  <p style={secondaryText}>
                    No browsing history found for this person yet.
                  </p>
                </div>
              )}

              {!historyLoading && visits.length > 0 && (
                <div
                  style={{
                    marginTop: '12px',
                    maxHeight: '540px',
                    overflowY: 'auto',
                    paddingRight: '4px',
                    width: '100%',
                    minWidth: 0,
                  }}
                >
                  {visits.map((visit, index) => (
                    <button
                      key={visit._id}
                      type="button"
                      onClick={() => {
                        setActiveView('browser');
                        openAddress(visit.address);
                      }}
                      style={{
                        ...panelStyle,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        textAlign: 'left',
                        color: '#e9eaff',
                        cursor: 'pointer',
                        marginTop: index === 0 ? 0 : '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          flexShrink: 0,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '10px',
                          background: 'rgba(139,119,255,0.14)',
                          color: '#b4a5ff',
                        }}
                      >
                        ◷
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <strong
                          style={{
                            display: 'block',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {visit.address}
                        </strong>

                        <span
                          style={{
                            ...secondaryText,
                            display: 'block',
                            marginTop: '5px',
                          }}
                        >
                          {formatDate(visit.visitedAt)}
                        </span>

                        {visit.fromAddress && (
                          <span
                            style={{
                              ...secondaryText,
                              display: 'block',
                              marginTop: '4px',
                              fontSize: '11px',
                              overflowWrap: 'anywhere',
                            }}
                          >
                            From: {visit.fromAddress}
                          </span>
                        )}
                      </div>

                      <span style={{ color: '#a99aff' }}>↗</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'publish' && (
            <div className="browser-card simple-panel">
              <div className="eyebrow">ADD TO THE COLLECTION</div>
              <h2>Publish a site</h2>
              <p>
                Create a page and make it part of the Small Web.
                You are publishing as {selectedPersonName}.
              </p>

              <form
                onSubmit={handlePublish}
                style={{ marginTop: '24px' }}
              >
                <label
                  style={{
                    display: 'block',
                    color: '#c9c6ee',
                    fontSize: '12px',
                    marginBottom: '8px',
                  }}
                >
                  Page address
                </label>

                <input
                  className="form-input"
                  value={publishAddress}
                  onChange={(event) => setPublishAddress(event.target.value)}
                  placeholder="mycreativepage.small"
                  required
                />

                <label
                  style={{
                    display: 'block',
                    color: '#c9c6ee',
                    fontSize: '12px',
                    margin: '18px 0 8px',
                  }}
                >
                  Page title
                </label>

                <input
                  className="form-input"
                  value={publishTitle}
                  onChange={(event) => setPublishTitle(event.target.value)}
                  placeholder="A title for your page"
                  maxLength={100}
                  required
                />

                <label
                  style={{
                    display: 'block',
                    color: '#c9c6ee',
                    fontSize: '12px',
                    margin: '18px 0 8px',
                  }}
                >
                  HTML content
                </label>

                <textarea
                  className="form-textarea"
                  value={publishHtml}
                  onChange={(event) => setPublishHtml(event.target.value)}
                  placeholder={'<h1>Hello, Small Web!</h1>\n<p>Write something worth sharing...</p>'}
                  rows={10}
                  required
                  style={{
                    fontFamily: 'monospace',
                    lineHeight: 1.6,
                  }}
                />

                <p style={{ ...secondaryText, marginTop: '10px' }}>
                  HTML is displayed inside a restricted frame. Scripts and
                  external network requests are blocked.
                </p>

                {publishError && (
                  <p style={{ color: '#ff9eac', marginTop: '16px' }}>
                    {publishError}
                  </p>
                )}

                {publishMessage && (
                  <p style={{ color: '#8fe0b4', marginTop: '16px' }}>
                    {publishMessage}
                  </p>
                )}

                <button
                  className="primary-button"
                  type="submit"
                  disabled={publishLoading}
                  style={{ marginTop: '20px' }}
                >
                  {publishLoading ? 'Publishing...' : 'Publish page ↗'}
                </button>
              </form>
            </div>
          )}

          <footer className="page-footer">
            <span>SMALL WEB PROJECT</span>
          </footer>
        </section>
      </section>
    </main>
  );
}
