// =========================================================
// DeadTown Bot Presence — Hardened Keep-Alive Edition
// Keeps the bot online 24/7 with a live activity status.
// Requires: Node 18+ / 22+ (global WebSocket). Run: node bot-presence.js
// =========================================================

const token = process.env.DISCORD_BOT_TOKEN;
const ACTIVITY_NAME = process.env.BOT_ACTIVITY_NAME || 'DeadTown Roleplay';

if (!token) {
    console.error('DISCORD_BOT_TOKEN is not set.');
    console.error('Usage: set DISCORD_BOT_TOKEN=YOUR_TOKEN then run: node bot-presence.js');
    process.exit(1);
}

const GATEWAY = 'wss://gateway.discord.gg/?v=10&encoding=json';

let socket = null;
let heartbeatInterval = null;
let heartbeatAck = true;
let reconnectTimer = null;
let watchdogTimer = null;
let sessionId = null;
let lastSeq = null;
let attempt = 0;
let resumeAttempted = false;
let forcedClose = false;

function log(...args) {
    console.log(`[${new Date().toLocaleTimeString()}]`, ...args);
}

function clearAllTimers() {
    if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
    if (watchdogTimer) { clearTimeout(watchdogTimer); watchdogTimer = null; }
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
}

function nextBackoff() {
    // Exponential backoff: 5s -> 8s -> 13s -> 21s -> 34s ... capped at 60s, with jitter
    const base = Math.min(60000, 5000 * Math.pow(1.6, Math.min(attempt, 8)));
    return base + Math.floor(Math.random() * 2000);
}

function sendPresenceUpdate() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    try {
        socket.send(JSON.stringify({
            op: 3,
            d: {
                since: Date.now(),
                activities: [{
                    name: ACTIVITY_NAME,
                    type: 3, // Watching
                    state: '🔥 أفضل سيرفر FiveM عربي',
                    details: 'LOS SANTOS // DEADTOWN RP'
                }],
                status: 'online',
                afk: false
            }
        }));
    } catch (e) { /* ignore */ }
}

function startHeartbeat(intervalMs) {
    clearAllTimers();
    heartbeatAck = true;
    heartbeatInterval = setInterval(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        if (!heartbeatAck) {
            log('⚠️ No heartbeat ack — forcing reconnect');
            forcedClose = true;
            try { socket.close(4000, 'dead heartbeat'); } catch (e) { /* ignore */ }
            return;
        }
        heartbeatAck = false;
        try {
            socket.send(JSON.stringify({ op: 1, d: lastSeq || null }));
        } catch (e) { /* ignore */ }
    }, intervalMs);

    // Watchdog: if no ack after 3 heartbeats, hard reconnect
    watchdogTimer = setTimeout(() => {
        if (!heartbeatAck) {
            log('⚠️ Watchdog timeout — hard reconnecting');
            forcedClose = true;
            try { socket.close(4000, 'watchdog'); } catch (e) { /* ignore */ }
        } else {
            startHeartbeat(intervalMs);
        }
    }, intervalMs * 3);
}

function sendIdentify() {
    socket.send(JSON.stringify({
        op: 2,
        d: {
            token,
            intents: 0,
            properties: { os: 'windows', browser: 'deadtown', device: 'deadtown' },
            presence: {
                since: Date.now(),
                activities: [{
                    name: ACTIVITY_NAME,
                    type: 3,
                    state: '🔥 أفضل سيرفر FiveM عربي',
                    details: 'LOS SANTOS // DEADTOWN RP'
                }],
                status: 'online',
                afk: false
            }
        }
    }));
}

function sendResume() {
    socket.send(JSON.stringify({
        op: 6,
        d: { token, session_id: sessionId, seq: lastSeq }
    }));
}

function connect() {
    clearAllTimers();
    if (socket) {
        try { socket.close(1000); } catch (e) { /* ignore */ }
        socket = null;
    }

    const delay = nextBackoff();
    reconnectTimer = setTimeout(() => {
        log(`⏳ Connecting${sessionId && !forcedClose ? ' (resuming session)' : ''}... (attempt #${attempt + 1})`);
        const s = new WebSocket(GATEWAY);
        socket = s;

        s.onopen = () => {
            attempt = 0;
            forcedClose = false;
            if (sessionId && !resumeAttempted) {
                sendResume();
            } else {
                sendIdentify();
            }
        };

        s.onmessage = (event) => {
            let msg;
            try { msg = JSON.parse(event.data); } catch (e) { return; }
            if (msg.s !== undefined && msg.s !== null) lastSeq = msg.s;

            switch (msg.op) {
                case 10: // Hello
                    startHeartbeat(msg.d.heartbeat_interval);
                    break;
                case 0: // Dispatch
                    if (msg.t === 'READY') {
                        sessionId = msg.d.session_id;
                        resumeAttempted = false;
                        log(`✅ Online as ${msg.d.user.username} (ID: ${msg.d.user.id})`);
                        sendPresenceUpdate();
                    } else if (msg.t === 'RESUMED') {
                        log('✅ Session resumed');
                        sendPresenceUpdate();
                    } else if (msg.t === 'PRESENCE_UPDATE') {
                        // presence accepted
                    }
                    break;
                case 11: // Heartbeat ACK
                    heartbeatAck = true;
                    break;
                case 7: // Reconnect (server requested)
                    log('🔁 Server requested reconnect');
                    forcedClose = true;
                    try { s.close(1000); } catch (e) { /* ignore */ }
                    break;
                case 9: // Invalid session
                    if (msg.d === true && sessionId) {
                        log('♻️ Invalid session (resumable) — retrying resume');
                        resumeAttempted = false;
                    } else {
                        log('🔄 Invalid session — starting fresh');
                        sessionId = null;
                        lastSeq = null;
                        resumeAttempted = false;
                    }
                    clearAllTimers();
                    attempt++;
                    connect();
                    break;
            }
        };

        s.onclose = (event) => {
            log(`❌ Connection closed (code=${event.code}) — reconnecting in a moment...`);
            clearAllTimers();
            if (event.code !== 1000 || !forcedClose) {
                if (sessionId) {
                    resumeAttempted = true;
                } else {
                    resumeAttempted = false;
                }
            }
            attempt++;
            connect();
        };

        s.onerror = (err) => {
            log('⚠️ WebSocket error:', (err && err.message) || 'unknown');
        };
    }, delay);
}

// ---------------------------------------------
// Process resilience — never die silently
// ---------------------------------------------
process.on('uncaughtException', (err) => {
    log('⚠️ Uncaught exception (kept alive):', err.message);
});
process.on('unhandledRejection', (reason) => {
    log('⚠️ Unhandled rejection (kept alive):', reason && reason.message ? reason.message : reason);
});

// Keep the event loop alive even if everything else stalls
setInterval(() => { /* keep-alive no-op */ }, 1000);

log('🎮 DeadTown Bot Presence starting...');
connect();