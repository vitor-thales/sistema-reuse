import ChatEngine from '../utils/script.chat.engine.js'; // Adjust path if needed
import { toast } from "../utils/script.toast.js";

// --- State ---
let myUserId = null; 
let activeChatId = null;
let activePartnerId = null;
let activePartnerPublicKey = null;

// --- DOM Elements ---
var overlay;
var body;
var convView;
var chatView;
var convList;
var msgArea;
let scrollBottomBtn;
let currentOffset = 0; // Track pagination
let isLoadingMore = false; // Prevent multiple simultaneous fetches
let hasMoreMessages = true; // Stop fetching if we hit the end

const messagesTab = document.getElementById("messages-tab");

// --- Initialization ---
// Call this function when the user logs in / loads the page.
// You need to provide their ID and Base64 Public Key.
async function initializeMessagingSystem(userId, myPublicKeyBase64) {
    myUserId = userId;
    await ChatEngine.init(userId, myPublicKeyBase64);
    
    await loadMessagesHtml();
    toggleOverlay();
}

export async function loadUserDataAndStart() {
    const res = await fetch("/mensagens/api/userData");
    const json = await res.json();
    const {id, pk} = json;

    initializeMessagingSystem(id, pk);
}

async function loadMessagesHtml() {
    const res = await fetch("/components/messages.html");
    const html = await res.text();

    messagesTab.innerHTML = html;

    overlay = document.getElementById('message-overlay');
    body = document.body;
    convView = document.getElementById('conversations-view');
    chatView = document.getElementById('chat-thread-view');
    convList = document.getElementById('conversations-list');
    msgArea = document.getElementById('chat-messages-area');
    scrollBottomBtn = document.getElementById('scroll-bottom-btn');

    document.querySelector('input[placeholder="Buscar conversas..."]').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = convList.querySelectorAll('[data-conv-id]');
        let visibleCount = 0;

        if(rows.length === 0) return;
        
        rows.forEach(row => {
            const name = row.getAttribute('data-search-name');
            if (name.includes(term)) {
                row.classList.remove('hidden');
                visibleCount++;
            } else {
                row.classList.add('hidden');
            }
        });

        let searchPlaceholder = document.getElementById('search-empty-placeholder');
        if (visibleCount === 0 && term.length > 0) {
            if (!searchPlaceholder) {
                searchPlaceholder = document.createElement('p');
                searchPlaceholder.id = 'search-empty-placeholder';
                searchPlaceholder.className = 'p-8 text-darkgray text-sm text-center italic';
                searchPlaceholder.innerText = 'Nenhum chat encontrado';
                convList.appendChild(searchPlaceholder);
            }
        } else if (searchPlaceholder) {
            searchPlaceholder.remove();
        }
    });

    setupScrollListener();
}

async function loadMoreMessages() {
    if (!activeChatId || isLoadingMore || !hasMoreMessages) return;

    isLoadingMore = true;
    toggleHistoryLoader(true);
    currentOffset += 25; 

    const oldHeight = msgArea.scrollHeight;

    try {
        const res = await fetch(`/mensagens/api/getMessages/${activeChatId}?offset=${currentOffset}`);
        const messages = await res.json();

        toggleHistoryLoader(false);

        if (messages.length === 0) {
            hasMoreMessages = false;
            showNoMoreMessagesIndicator();
            return;
        }

        // messages come from DB ordered DESC, so we reverse to keep chronological order within the batch
        for (const msg of messages.reverse()) { 
            const isMe = msg.idRemetente === myUserId;
            const decryptedText = await ChatEngine.decryptMessage(msg.content, msg.wrappedKey, msg.iv);
            const dbStatus = isMe ? (msg.lida ? 'read' : 'sent') : 'received';
            
            // Call our updated function with the 'true' flag for prepending
            renderMessageBubble(decryptedText, isMe, msg.idMensagem, dbStatus, msg.dataEnvio, true);
        }

        // Maintain scroll position so the user doesn't lose their place
        msgArea.scrollTop = msgArea.scrollHeight - oldHeight;

    } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        toggleHistoryLoader(false);
    } finally {
        isLoadingMore = false;
    }
}

function getFriendlyDate(date) {
    const now = new Date();
    const d = new Date(date);
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (msgDate.getTime() === today.getTime()) return "Hoje";
    if (msgDate.getTime() === yesterday.getTime()) return "Ontem";

    const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
        return d.toLocaleDateString('pt-BR', { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase());
    }

    const options = { day: '2-digit', month: 'short' };
    if (d.getFullYear() !== now.getFullYear()) options.year = 'numeric';
    return d.toLocaleDateString('pt-BR', options);
}

function createBubbleElement(text, isMe, messageId, status, date) {
    const wrapper = document.createElement('div');
    wrapper.className = `flex w-full mb-2 ${isMe ? 'justify-end' : 'justify-start'}`;
    if (messageId) wrapper.setAttribute('data-msg-id', messageId);
    
    let icon = '';
    if (isMe) {
        icon = status === 'read' ? '<i class="fa-solid fa-check-double text-green"></i>' : 
               status === 'sent' ? '<i class="fa-solid fa-check"></i>' : 
               '<i class="fa-solid fa-clock"></i>';
    }

    const messageDate = date ? new Date(date) : new Date();
    const timeStr = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    wrapper.innerHTML = `
        <div class="max-w-[80%] rounded-2xl p-3 text-sm relative break-words overflow-hidden ${
            isMe ? 'bg-mainblue text-white rounded-br-none' : 'bg-white text-darkblue shadow-sm border border-lightgray rounded-bl-none'
        }">
            <p class="whitespace-pre-wrap">${text}</p>
            <div class="flex justify-end items-center mt-1">
                <span class="time-text text-[9px] opacity-50">${timeStr}</span>
                ${isMe ? `<span class="status-icon ml-1 text-[10px] opacity-70">${icon}</span>` : ''}
            </div>
        </div>
    `;
    return wrapper;
}

function setupScrollListener() {
    msgArea.addEventListener('scroll', async () => {
        // If scrolled to top (top is 0) and we have more to load
        if (msgArea.scrollTop === 0 && !isLoadingMore && hasMoreMessages) {
            await loadMoreMessages();
        }

        const distanceFromBottom = msgArea.scrollHeight - msgArea.scrollTop - msgArea.clientHeight;
        if (distanceFromBottom > 300) {
            scrollBottomBtn.classList.remove('hidden');
        } else {
            scrollBottomBtn.classList.add('hidden');
        }
    });
}

function showNoMoreMessagesIndicator() {
    if (document.getElementById('no-more-msg')) return;
    const div = document.createElement('div');
    div.id = 'no-more-msg';
    div.className = 'text-center py-8 text-darkgray/60 text-[10px] uppercase tracking-[0.2em] font-bold';
    div.innerHTML = '--- Fim do histórico ---';
    msgArea.prepend(div);
}

// --- Overlay Controls ---
window.toggleOverlay = function () {
    const isHidden = overlay.classList.contains('hidden');
    if (isHidden) {
        overlay.classList.remove('hidden');
        body.style.overflow = 'hidden'; 
        fetchAndRenderConversations(); // Refresh list on open
    } else {
        overlay.classList.add('hidden');
        body.style.overflow = 'auto'; 
    }
}

window.closeMessages = function (event) {
    if (event.target === overlay) toggleOverlay();
}

window.closeActiveChat = function () {
    activeChatId = null;
    activePartnerId = null;
    activePartnerPublicKey = null;
    chatView.classList.add('translate-x-full'); // Slide out
    convView.classList.remove('-translate-x-full'); // Slide in
}

// --- Fetch & Render Logic ---
// --- Updated Fetch & Render (Now decrypts the sidebar preview!) ---
async function fetchAndRenderConversations() {
    try {
        const res = await fetch('/mensagens/api/getConversations');
        const conversations = await res.json();
        
        convList.innerHTML = ''; // Only clear on initial load or manual refresh
        
        if(conversations.length === 0) {
            convList.innerHTML = `
                <div class="flex flex-col items-center justify-center h-64 p-8 text-center">
                    <div class="w-16 h-16 bg-lightgray rounded-full flex items-center justify-center mb-4">
                        <i class="fa-solid fa-comments text-darkgray/40 text-2xl"></i>
                    </div>
                    <p class="text-darkgray text-sm font-medium">Seus chats irão aparecer aqui!</p>
                </div>`;
            return;
        }

        for (const conv of conversations) {
            renderConversationRow(conv, false); // false = append to bottom
        }
    } catch (err) {
        console.error("Erro ao carregar conversas:", err);
    }
}

async function renderConversationRow(conv, prepend = false) {
    if (convList.querySelector('.fa-comments') || convList.querySelector('p')) {
        if (!convList.querySelector('[data-conv-id]')) {
            convList.innerHTML = '';
        }
    }
    
    let existing = document.querySelector(`[data-conv-id="${conv.idConversa}"]`);
    if (existing) existing.remove();

    const initials = conv.partnerName.substring(0, 2).toUpperCase();
    let snippet = 'Nova conversa';

    if (conv.lastMessageContent && conv.wrappedKey && conv.lastMessageIv) {
        try {
            snippet = await ChatEngine.decryptMessage(conv.lastMessageContent, conv.wrappedKey, conv.lastMessageIv);
        } catch (err) { snippet = '🔒 Mensagem criptografada'; }
    }

    // --- FIX 1: Accurate Unread Dot Logic ---
    // Show dot ONLY if there's a last message AND it's not read AND I am not the sender
    const isUnread = conv.lastMessageContent && !conv.lida && conv.idRemetente !== myUserId;
    const unreadDot = isUnread ? `<div class="unread-dot w-2 h-2 rounded-full bg-mainblue mt-2"></div>` : '';

    // --- ADD 1: Time Formatting for Sidebar ---
    const msgTime = conv.dataEnvio ? new Date(conv.dataEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const el = document.createElement('div');
    el.setAttribute('data-conv-id', conv.idConversa);
    // Add data-search attribute for the search feature
    el.setAttribute('data-search-name', conv.partnerName.toLowerCase());
    el.className = "p-4 flex items-start gap-3 hover:bg-lightgray/50 cursor-pointer transition-colors group";
    el.onclick = () => openChat(conv.idConversa, conv.partnerId, conv.partnerName, initials, conv.partnerPublicKey);
    
    el.innerHTML = `
        <div class="w-12 h-12 flex-shrink-0 rounded-full bg-mainblue/10 flex items-center justify-center text-mainblue font-bold">${initials}</div>
        <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline">
                <h4 class="font-bold text-darkblue text-sm truncate">${conv.partnerName}</h4>
                <span class="text-[10px] text-darkgray">${msgTime}</span>
            </div>
            <p class="text-xs text-darkgray truncate mt-1 snippet-text">${snippet}</p>
        </div>
        <div class="dot-container">${unreadDot}</div>
    `;

    if (prepend) {
        convList.prepend(el);
    } else {
        convList.appendChild(el);
    }
}

// --- Updated openChat (Accepts publicKey so we can send msgs on empty chats) ---
async function openChat(idConversa, partnerId, partnerName, initials, partnerPublicKey) {
    activeChatId = idConversa;
    activePartnerId = partnerId;
    activePartnerPublicKey = partnerPublicKey;

    currentOffset = 0;
    hasMoreMessages = true;
    isLoadingMore = false;

    if(scrollBottomBtn) scrollBottomBtn.classList.add('hidden');
    
    document.getElementById('chat-header-name').innerText = partnerName;
    document.getElementById('chat-header-avatar').innerText = initials;
    msgArea.innerHTML = `<p class="text-xs text-center text-darkgray my-4">Descriptografando...</p>`;
    
    convView.classList.add('-translate-x-full');
    chatView.classList.remove('translate-x-full');

    try {
        const res = await fetch(`/mensagens/api/getMessages/${idConversa}`);
        const encryptedMessages = await res.json();
        msgArea.innerHTML = ''; 

        if (encryptedMessages.length < 25) {
            hasMoreMessages = false;
            showNoMoreMessagesIndicator();
        }

        let lastMessageId = null;
        for (const msg of encryptedMessages) {
            const isMe = msg.idRemetente === myUserId;
            const decryptedText = await ChatEngine.decryptMessage(msg.content, msg.wrappedKey, msg.iv);
            
            // FIX: Pass the 'lida' status from DB
            // If isMe is true and lida is true -> 'read'
            // If isMe is true and lida is false -> 'sent'
            const dbStatus = isMe ? (msg.lida ? 'read' : 'sent') : 'received';
            
            renderMessageBubble(decryptedText, isMe, msg.idMensagem, dbStatus, msg.dataEnvio);
            
            if (!msg.lida && !isMe) lastMessageId = msg.idMensagem;
        }

        if (lastMessageId) {
            ChatEngine.markConversationAsRead(idConversa, lastMessageId, partnerId, myUserId);
            // Immediate UI fix: find the row and remove the dot
            const row = document.querySelector(`[data-conv-id="${idConversa}"]`);
            if (row) {
                const dot = row.querySelector('.unread-dot');
                if (dot) dot.remove();
            }
        }
        scrollToBottom();
    } catch (err) {
        console.error("Chat Error:", err);
    }
}

// --- NEW: Function to trigger a new chat from anywhere in your app ---
// You can call this from a "Contact Company" button on a product page, for example.
window.startNewChat = async function(partnerId, partnerName, partnerPublicKey) {
    try {
        // 1. Tell backend to find or create the conversation ID
        const res = await fetch('/mensagens/api/startConversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partnerId })
        });
        
        const data = await res.json();
        
        if (data.error) {
            alert(data.error);
            return;
        }

        // 2. Open the overlay if it's closed
        const isHidden = overlay.classList.contains('hidden');
        if (isHidden) {
            overlay.classList.remove('hidden');
            body.style.overflow = 'hidden';
        }

        // 3. Immediately open the chat thread view with this user
        const initials = partnerName.substring(0, 2).toUpperCase();
        openChat(data.idConversa, partnerId, partnerName, initials, partnerPublicKey);

    } catch (err) {
        console.error("Erro ao iniciar nova conversa:", err);
    }
}

function toggleHistoryLoader(show) {
    let loader = document.getElementById('history-loader');
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'history-loader';
            // Centers the loader and gives it some breathing room
            loader.className = 'w-full flex justify-center py-4 transition-all opacity-100';
            loader.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-mainblue text-xl"></i>';
            msgArea.prepend(loader);
        }
    } else if (loader) {
        loader.remove();
    }
}

function renderMessageBubble(text, isMe, messageId = null, status = 'sending', date = null, isPrepend = false) {
    // 1. Update status if already exists
    if (messageId && messageId !== "pending") {
        let existing = document.querySelector(`[data-msg-id="${messageId}"]`);
        if (existing) {
            updateMessageStatusUI(existing, status, date);
            return;
        }
    }

    // 2. Remove pending
    if (messageId !== "pending") {
        const pendingMsg = document.querySelector(`[data-msg-id="pending"]`);
        if (pendingMsg) {
            pendingMsg.setAttribute('data-msg-id', messageId);
            updateMessageStatusUI(pendingMsg, status, date);
            return;
        }
    }

    // 3. Handle Date Grouping
    const msgDate = date ? new Date(date) : new Date();
    const groupKey = msgDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    let group = document.querySelector(`[data-date-group="${groupKey}"]`);

    if (!group) {
        group = document.createElement('div');
        group.setAttribute('data-date-group', groupKey);
        group.className = "date-section flex flex-col w-full";
        
        // Create Header
        const header = document.createElement('div');
        header.className = "text-center my-6 sticky top-0 z-10"; // sticky top-0 is optional, remove if you want it purely inline
        header.innerHTML = `<span class="bg-lightgray/50 text-darkgray text-[11px] px-3 py-1 rounded-full uppercase tracking-wider font-semibold">${getFriendlyDate(msgDate)}</span>`;
        group.appendChild(header);

        // Place group in the main area
        if (isPrepend) {
            msgArea.prepend(group);
        } else {
            msgArea.appendChild(group);
        }
    }

    // 4. Create and add bubble
    const bubble = createBubbleElement(text, isMe, messageId, status, date);
    
    if (isPrepend) {
        // When prepending history, the header must stay at the top of the group
        const header = group.firstChild;
        header.after(bubble);
    } else {
        group.appendChild(bubble);
        scrollToBottom();
    }
}

function updateMessageStatusUI(wrapper, status, date = null) {
    const iconContainer = wrapper.querySelector('.status-icon');
    const timeSpan = wrapper.querySelector('.time-text');
    
    if (iconContainer) {
        if (status === 'sent') {
            iconContainer.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else if (status === 'read') {
            iconContainer.innerHTML = '<i class="fa-solid fa-check-double text-green"></i>';
        } else if (status === 'received') {
            // Received messages usually don't have status icons, 
            // but we clear it just in case of status switches
            iconContainer.innerHTML = ''; 
        }
    }

    if (date && timeSpan) {
        const messageDate = new Date(date);
        timeSpan.innerText = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

function sanitize(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Sending & Receiving ---
window.handleSendMessage = async function(e) {
    e.preventDefault();
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text || !activeChatId || !activePartnerPublicKey) return;

    input.value = '';
    
    // Render with 'pending' status
    renderMessageBubble(sanitize(text), true, "pending", 'sending', new Date());

    try {
        const encryptedPayload = await ChatEngine.encryptAndSign(text, activePartnerPublicKey);
        
        ChatEngine.socket.emit("send_message", {
            idConversa: activeChatId,
            idRemetente: myUserId,
            idDestinatario: activePartnerId,
            ...encryptedPayload
        });
    } catch(err) {
        // If encryption fails, remove the pending bubble or show error
        document.querySelector(`[data-msg-id="pending"]`)?.remove();
        alert("Falha na criptografia. Mensagem não enviada.");
    }
}

window.scrollToBottom = function(smooth = false) {
    if (smooth) {
        msgArea.scroll({
            top: msgArea.scrollHeight,
            behavior: 'smooth'
        });
    } else {
        msgArea.scrollTop = msgArea.scrollHeight;
    }
}

// 1. Confirmed by Server (The message was saved in DB)
window.addEventListener('chat:confirmed', (e) => {
    const data = e.detail;
    // Find the bubble that was "sending" and mark as "sent"
    // We match by temporary logic or ID if you pass it back
    const pendingMsg = document.querySelector(`[data-msg-id="pending"]`);
    if (pendingMsg) {
        pendingMsg.setAttribute('data-msg-id', data.idMensagem);
        updateMessageStatusUI(pendingMsg, 'sent', data.dataEnvio);
    }

    const existingRow = document.querySelector(`[data-conv-id="${data.idConversa}"]`);
    if (existingRow) {
        // We re-render the row to move it to the top and update the text
        const currentName = existingRow.querySelector('h4').innerText;
        renderConversationRow({
            idConversa: data.idConversa,
            partnerName: currentName,
            partnerId: data.idDestinatario,
            partnerPublicKey: activePartnerPublicKey,
            lastMessageContent: data.content,
            wrappedKey: data.keyForSender,
            lastMessageIv: data.iv,
            lida: true, // It's our own message, so it's "read" for us
            idRemetente: myUserId,
            dataEnvio: data.dataEnvio
        }, true); // Prepend to top
    }
});

// 2. Incoming Message (From the other person)
window.addEventListener('chat:message', async (e) => {
    const data = e.detail;
    
    if (activeChatId === data.idConversa) {
        if (!document.querySelector(`[data-msg-id="${data.idMensagem}"]`)) {
            renderMessageBubble(data.decryptedText, false, data.idMensagem, 'received', data.dataEnvio);
            ChatEngine.markConversationAsRead(data.idConversa, data.idMensagem, data.idRemetente, myUserId);
        }
    }

    // FIX: Grab the existing name from the UI so we don't rename them to "Contato"
    const existingRow = document.querySelector(`[data-conv-id="${data.idConversa}"]`);
    const currentName = existingRow 
        ? existingRow.querySelector('h4').innerText 
        : (data.partnerName || "Contato");

    const mockConv = {
        idConversa: data.idConversa,
        partnerName: currentName, 
        partnerId: data.idRemetente === myUserId ? data.idDestinatario : data.idRemetente,
        partnerPublicKey: data.senderPublicKey,
        lastMessageContent: data.content,
        wrappedKey: (data.idRemetente === myUserId) ? data.keyForSender : data.keyForRecipient,
        lastMessageIv: data.iv,
        lida: (activeChatId === data.idConversa),
        idRemetente: data.idRemetente,
        dataEnvio: data.dataEnvio
    };

    renderConversationRow(mockConv, true); 
});

// 3. Recipient Read our Messages
window.addEventListener('chat:read', (e) => {
    const { idConversa, lastReadId } = e.detail;
    if (activeChatId === idConversa) {
        // Mark all our messages up to lastReadId as "read" (double check)
        const allMyMessages = document.querySelectorAll(`[data-msg-id]`);
        allMyMessages.forEach(msg => {
            const msgId = parseInt(msg.getAttribute('data-msg-id'));
            if (msgId <= lastReadId) {
                updateMessageStatusUI(msg, 'read');
            }
        });
    }
});

window.addEventListener('chat:error', (e) => {
    toast.show(e, "error");
});

loadUserDataAndStart();