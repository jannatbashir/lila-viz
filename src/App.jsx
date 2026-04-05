import { useState, useEffect, useRef } from 'react'

const MAP_CONFIG = {
  AmbroseValley: { scale: 900, originX: -370, originZ: -473, image: '/minimaps/AmbroseValley_Minimap.png' },
  GrandRift: { scale: 581, originX: -290, originZ: -290, image: '/minimaps/GrandRift_Minimap.png' },
  Lockdown: { scale: 1000, originX: -500, originZ: -500, image: '/minimaps/Lockdown_Minimap.jpg' },
}

const EVENT_COLORS = {
  Position: 'rgba(100,160,255,0.4)',
  BotPosition: 'rgba(180,180,180,0.3)',
  Kill: '#ff4444',
  Killed: '#ff8800',
  BotKill: '#ffcc00',
  BotKilled: '#cc44ff',
  KilledByStorm: '#00ccff',
  Loot: '#44ff88',
}

function worldToPixel(x, z, mapId) {
  const cfg = MAP_CONFIG[mapId]
  const u = (x - cfg.originX) / cfg.scale
  const v = (z - cfg.originZ) / cfg.scale
  return { px: u * 1024, py: (1 - v) * 1024 }
}

export default function App() {
  const [selectedMap, setSelectedMap] = useState('AmbroseValley')
  const [selectedDay, setSelectedDay] = useState('all')
  const [selectedMatch, setSelectedMatch] = useState('all')
  const [showBots, setShowBots] = useState(false)
  const [activeLayer, setActiveLayer] = useState('heatmap')
  const [mapData, setMapData] = useState([])
  const [matches, setMatches] = useState([])
  const [summary, setSummary] = useState(null)
  const [playbackMatch, setPlaybackMatch] = useState(null)
  const [playbackEvents, setPlaybackEvents] = useState([])
  const [playbackIndex, setPlaybackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef(null)
  const playbackRef = useRef(null)

  const days = ['all', 'February_10', 'February_11', 'February_12', 'February_13', 'February_14']

  useEffect(() => {
    Promise.all([
      fetch('/matches.json').then(r => r.json()),
      fetch('/summary.json').then(r => r.json()),
    ]).then(([m, s]) => { setMatches(m); setSummary(s) })
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`/map_${selectedMap}.json`)
      .then(r => r.json())
      .then(d => { setMapData(d); setLoading(false) })
  }, [selectedMap])

  const filteredData = mapData.filter(e => {
    if (!showBots && e.is_bot) return false
    if (selectedDay !== 'all' && e.day !== selectedDay) return false
    if (selectedMatch !== 'all' && e.match_id !== selectedMatch) return false
    return true
  })

  const filteredMatches = matches.filter(m => {
    if (m.map_id !== selectedMap) return false
    if (selectedDay !== 'all' && m.day !== selectedDay) return false
    return true
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || loading) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 1024, 1024)

    if (activeLayer === 'heatmap') {
      const positions = filteredData.filter(e => e.event === 'Position' || e.event === 'BotPosition')
      positions.forEach(e => {
        const { px, py } = worldToPixel(e.x, e.z, selectedMap)
        ctx.beginPath()
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 18)
        grad.addColorStop(0, 'rgba(255,50,50,0.08)')
        grad.addColorStop(1, 'rgba(255,50,50,0)')
        ctx.fillStyle = grad
        ctx.arc(px, py, 18, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    if (activeLayer === 'events' || activeLayer === 'all') {
      const eventData = filteredData.filter(e => !['Position', 'BotPosition'].includes(e.event))
      eventData.forEach(e => {
        const { px, py } = worldToPixel(e.x, e.z, selectedMap)
        ctx.beginPath()
        ctx.arc(px, py, 6, 0, Math.PI * 2)
        ctx.fillStyle = EVENT_COLORS[e.event] || '#ffffff'
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }

    if (activeLayer === 'paths' && playbackMatch) {
      const players = {}
      playbackEvents.slice(0, playbackIndex).forEach(e => {
        if (!players[e.user_id]) players[e.user_id] = []
        players[e.user_id].push(e)
      })
      Object.entries(players).forEach(([uid, evts]) => {
        if (evts.length < 2) return
        ctx.beginPath()
        const color = uid.length < 10 ? 'rgba(200,200,200,0.6)' : 'rgba(100,200,255,0.8)'
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        const start = worldToPixel(evts[0].x, evts[0].z, selectedMap)
        ctx.moveTo(start.px, start.py)
        evts.forEach(e => {
          const { px, py } = worldToPixel(e.x, e.z, selectedMap)
          ctx.lineTo(px, py)
        })
        ctx.stroke()
      })
    }
  }, [filteredData, activeLayer, loading, playbackEvents, playbackIndex, selectedMap])

  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = setInterval(() => {
        setPlaybackIndex(i => {
          if (i >= playbackEvents.length) { setIsPlaying(false); return i }
          return i + 10
        })
      }, 50)
    } else {
      clearInterval(playbackRef.current)
    }
    return () => clearInterval(playbackRef.current)
  }, [isPlaying, playbackEvents])

  const loadMatchPlayback = (matchId) => {
    fetch(`/matches/${matchId}.json`)
      .then(r => r.json())
      .then(d => {
        setPlaybackMatch(d)
        setPlaybackEvents(d.events)
        setPlaybackIndex(0)
        setIsPlaying(false)
        setActiveLayer('paths')
      })
  }

  return (
    <div style={{ background: '#0f0f13', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a1a24', borderBottom: '1px solid #2a2a3a', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#e8d5a3', letterSpacing: 2 }}>LILA BLACK</div>
        <div style={{ fontSize: 12, color: '#666', marginLeft: 4 }}>Level Designer Tool</div>
        {summary && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, fontSize: 12, color: '#888' }}>
            <span><b style={{ color: '#e8d5a3' }}>{summary.total_rows?.toLocaleString()}</b> events</span>
            <span><b style={{ color: '#e8d5a3' }}>{summary.unique_players}</b> players</span>
            <span><b style={{ color: '#e8d5a3' }}>{summary.unique_matches}</b> matches</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 53px)' }}>
        {/* Sidebar */}
        <div style={{ width: 260, background: '#13131c', borderRight: '1px solid #2a2a3a', padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Map selector */}
          <div>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Map</div>
            {Object.keys(MAP_CONFIG).map(map => (
              <button key={map} onClick={() => { setSelectedMap(map); setSelectedMatch('all') }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 4, background: selectedMap === map ? '#2a2a4a' : 'transparent', border: selectedMap === map ? '1px solid #4444aa' : '1px solid #2a2a3a', borderRadius: 6, color: selectedMap === map ? '#aaaaff' : '#888', cursor: 'pointer', fontSize: 13 }}>
                {map}
                <span style={{ float: 'right', fontSize: 11, color: '#555' }}>
                  {summary?.maps?.[map]?.toLocaleString()}
                </span>
              </button>
            ))}
          </div>

          {/* Day filter */}
          <div>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Date</div>
            <select value={selectedDay} onChange={e => { setSelectedDay(e.target.value); setSelectedMatch('all') }}
              style={{ width: '100%', background: '#1a1a2a', border: '1px solid #2a2a3a', color: '#ccc', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}>
              {days.map(d => <option key={d} value={d}>{d === 'all' ? 'All Days' : d.replace('_', ' ')}</option>)}
            </select>
          </div>

          {/* Layer controls */}
          <div>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Layer</div>
            {['heatmap', 'events', 'paths', 'all'].map(layer => (
              <button key={layer} onClick={() => setActiveLayer(layer)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 4, background: activeLayer === layer ? '#2a3a2a' : 'transparent', border: activeLayer === layer ? '1px solid #44aa44' : '1px solid #2a2a3a', borderRadius: 6, color: activeLayer === layer ? '#88ff88' : '#888', cursor: 'pointer', fontSize: 13, textTransform: 'capitalize' }}>
                {layer === 'heatmap' ? '🔥 Heatmap' : layer === 'events' ? '💥 Events' : layer === 'paths' ? '🛤 Paths' : '⚡ All'}
              </button>
            ))}
          </div>

          {/* Bot toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#888' }}>Show Bots</span>
            <div onClick={() => setShowBots(!showBots)} style={{ width: 40, height: 22, background: showBots ? '#4444aa' : '#2a2a3a', borderRadius: 11, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 3, left: showBots ? 20 : 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
            </div>
          </div>

          {/* Legend */}
          <div>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Legend</div>
            {Object.entries(EVENT_COLORS).filter(([k]) => !['Position', 'BotPosition'].includes(k)).map(([event, color]) => (
              <div key={event} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#777' }}>{event}</span>
              </div>
            ))}
          </div>

          {/* Match list */}
          <div>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Matches ({filteredMatches.length})</div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {filteredMatches.slice(0, 50).map(m => (
                <div key={m.match_id} onClick={() => { setSelectedMatch(m.match_id); loadMatchPlayback(m.match_id) }}
                  style={{ padding: '8px 10px', marginBottom: 4, background: selectedMatch === m.match_id ? '#2a2a4a' : '#1a1a24', border: selectedMatch === m.match_id ? '1px solid #4444aa' : '1px solid transparent', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>
                  <div style={{ color: '#aaa', marginBottom: 2 }}>{m.match_id.slice(0, 16)}...</div>
                  <div style={{ color: '#555' }}>👤 {m.human_count} humans · 🤖 {m.bot_count} bots · {m.day?.replace('February_', 'Feb ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main map area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <img src={MAP_CONFIG[selectedMap].image} alt={selectedMap}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0.85 }} />
            <canvas ref={canvasRef} width={1024} height={1024}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
            {loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', fontSize: 14, color: '#888' }}>
                Loading {selectedMap}...
              </div>
            )}
          </div>

          {/* Playback controls */}
          {playbackMatch && (
            <div style={{ background: '#13131c', borderTop: '1px solid #2a2a3a', padding: '12px 20px' }}>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>
                PLAYBACK — {playbackMatch.match_id?.slice(0, 24)}... · {playbackEvents.length} events
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setIsPlaying(!isPlaying)}
                  style={{ background: '#2a2a4a', border: '1px solid #4444aa', color: '#aaaaff', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button onClick={() => { setPlaybackIndex(0); setIsPlaying(false) }}
                  style={{ background: '#2a2a3a', border: '1px solid #333', color: '#888', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  ↩ Reset
                </button>
                <input type="range" min={0} max={playbackEvents.length} value={playbackIndex}
                  onChange={e => setPlaybackIndex(Number(e.target.value))}
                  style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: '#555', minWidth: 80 }}>{playbackIndex} / {playbackEvents.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
