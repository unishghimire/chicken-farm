// 1. CONFIGURATION// 1. CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBV-aJoP8NEBVXU3zLXjh5jGZX7gYTtUFE",
  authDomain: "chicken-nepal.firebaseapp.com",
  projectId: "chicken-nepal",
  storageBucket: "chicken-nepal.firebasestorage.app",
  messagingSenderId: "181991954442",
  appId: "1:181991954442:web:a86f06c575e53979f0a7f3",
  measurementId: "G-TNT1XYL2MK",
  databaseURL: "https://chicken-nepal-default-rtdb.firebaseio.com"
};

// 2. STATE
const state = {
    user: null,
    settings: { priceLive: 290, availability: true, deliveryFee: 50 },
    liveStats: { totalBirds: 0, daily: { day: 1, weight: 40, feed: 0, mortality: 0, medicine: "None" } },
    cart: { type: 'live', qty: 1 }
};

// 3. INITIALIZE APP
let auth, db, rtdb;
try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    rtdb = firebase.database();
    startListeners();
} catch (e) { console.error("Firebase Error:", e); }

// 4. ROUTER
function router(page) {
    window.scrollTo(0, 0);
    document.getElementById('mobile-menu').classList.add('hidden');
    switch(page) {
        case 'home': renderHome(); break;
        case 'products': renderProducts(); break;
        case 'gallery': renderGallery(); break;
        case 'records': renderRecords(); break;
        case 'about': renderAbout(); break;
        case 'contact': renderContact(); break;
        case 'admin-login': renderAdminLogin(); break;
        case 'admin-dashboard': state.user ? renderAdminDashboard() : router('admin-login'); break;
        default: renderHome();
    }
}

// 5. DATA LISTENERS
function startListeners() {
    auth.onAuthStateChanged(u => {
        state.user = u;
        const btn = document.getElementById('nav-admin-btn');
        if(btn) btn.innerText = u ? 'Dashboard' : 'Admin';
    });
    try {
        rtdb.ref('farmStats').on('value', snap => {
            if(snap.exists()) {
                const val = snap.val();
                state.liveStats.totalBirds = val.totalBirds || 0;
                if(val.daily) state.liveStats.daily = val.daily;
                if(document.getElementById('live-bird-count')) document.getElementById('live-bird-count').innerText = state.liveStats.totalBirds;
                if(document.getElementById('stat-day')) document.getElementById('stat-day').innerText = state.liveStats.daily.day;
            }
        });
        db.collection('settings').doc('general').onSnapshot(doc => {
            if(doc.exists) {
                state.settings = doc.data();
                document.querySelectorAll('.live-price-disp').forEach(e => e.innerText = `Rs. ${state.settings.priceLive}/kg`);
            }
        });
    } catch(e){}
}

// 6. RENDER FUNCTIONS

// --- RECORDS PAGE (FIXED) ---
function renderRecords() {
    document.getElementById('app').innerHTML = `
        <div class="fade-in max-w-6xl mx-auto px-4 py-12">
            <div class="text-center mb-10">
                <h1 class="text-3xl font-bold text-gray-900">Daily Farm Records</h1>
                <p class="text-gray-500 mt-2">Transparency is our policy. Track our batch growth day by day.</p>
            </div>
            <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead class="bg-gray-800 text-white uppercase tracking-wider">
                            <tr>
                                <th class="p-4">Date</th>
                                <th class="p-4">Batch Day</th>
                                <th class="p-4">Avg Weight (g)</th>
                                <th class="p-4">Feed (kg)</th>
                                <th class="p-4">Mortality</th>
                                <th class="p-4">Medicine/Notes</th>
                            </tr>
                        </thead>
                        <tbody id="public-records-body" class="text-gray-700 divide-y divide-gray-200">
                            <tr><td colspan="6" class="p-6 text-center text-gray-400">Loading records...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    db.collection('dailyLogs').orderBy('timestamp', 'desc').limit(30).get()
    .then(snap => {
        let h = '';
        snap.forEach(doc => {
            const d = doc.data();
            h += `<tr class="hover:bg-green-50 transition duration-150">
                <td class="p-4 font-mono text-gray-500">${d.dateString}</td>
                <td class="p-4 font-bold text-green-700">Day ${d.day}</td>
                <td class="p-4">${d.weight}</td>
                <td class="p-4">${d.feed}</td>
                <td class="p-4 ${d.mortality > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}">${d.mortality}</td>
                <td class="p-4 text-blue-600 italic">${d.medicine}</td>
            </tr>`;
        });
        document.getElementById('public-records-body').innerHTML = h || '<tr><td colspan="6" class="p-8 text-center text-gray-500">No records found. Admin needs to update the daily log first.</td></tr>';
    })
    .catch(error => {
        console.error(error);
        document.getElementById('public-records-body').innerHTML = '<tr><td colspan="6" class="p-8 text-center text-red-500">Error loading data. Please check connection.</td></tr>';
    });
}

// --- HOME ---
function renderHome() {
    document.getElementById('app').innerHTML = `
        <div class="fade-in">
            <div class="relative h-[600px] flex items-center justify-center text-center text-white px-4 bg-cover bg-center bg-no-repeat bg-fixed" style="background-image: url('https://www.farmforward.com/wp-content/uploads/2023/03/broiler-chicken.jpg');">
                <div class="absolute inset-0 bg-black/60"></div>
                <div class="relative z-10 max-w-4xl mx-auto">
                    <h1 class="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-xl text-white">GreenValley Farm</h1>
                    <div class="h-1.5 w-24 bg-yellow-400 mx-auto mb-8 rounded-full shadow-lg"></div>
                    <p class="text-xl md:text-3xl mb-10 font-light text-gray-100 drop-shadow-md">Raising Nepal's Finest Organic Broiler Chicken</p>
                    <button onclick="router('products')" class="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-full text-lg shadow-2xl transition transform hover:-translate-y-1 hover:scale-105 border-2 border-green-400 uppercase tracking-wider">ORDER LIVE BIRDS</button>
                </div>
            </div>
            <div class="max-w-6xl mx-auto -mt-24 relative z-10 px-4 mb-20">
                <div class="bg-white rounded-2xl shadow-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-center border-t-8 border-green-600 mb-8">
                    <div class="border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0"><p class="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">Market Rate</p><h2 class="text-5xl font-extrabold text-gray-800 live-price-disp">Rs. ${state.settings.priceLive}</h2><p class="text-gray-400 text-sm mt-2">Per Kilogram</p></div>
                    <div><p class="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">Live Stock</p><h2 id="live-bird-count" class="text-5xl font-extrabold text-blue-600">${state.liveStats.totalBirds}</h2><p class="text-gray-400 text-sm mt-2">Healthy Birds Available</p></div>
                </div>
                <div class="bg-gray-900 rounded-2xl shadow-xl p-6 text-white border border-gray-700">
                    <div class="flex justify-between items-center border-b border-gray-700 pb-4 mb-6"><h3 class="font-bold text-yellow-400 uppercase tracking-widest">Daily Farm Log</h3><button onclick="router('records')" class="text-xs text-blue-300 hover:text-white underline">View History</button></div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div class="bg-gray-800 rounded-xl p-4"><p class="text-xs text-gray-400 uppercase font-bold">Batch Age</p><h4 class="text-2xl font-bold">${state.liveStats.daily.day} <span class="text-sm font-normal">Days</span></h4></div>
                        <div class="bg-gray-800 rounded-xl p-4"><p class="text-xs text-gray-400 uppercase font-bold">Avg Weight</p><h4 class="text-2xl font-bold">${state.liveStats.daily.weight} <span class="text-sm font-normal">g</span></h4></div>
                        <div class="bg-gray-800 rounded-xl p-4"><p class="text-xs text-gray-400 uppercase font-bold">Feed Today</p><h4 class="text-2xl font-bold">${state.liveStats.daily.feed} <span class="text-sm font-normal">kg</span></h4></div>
                        <div class="bg-gray-800 rounded-xl p-4 border border-green-800"><p class="text-xs text-gray-400 uppercase font-bold">Health / Meds</p><h4 class="text-xl font-bold truncate">${state.liveStats.daily.medicine || "Healthy"}</h4></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- ADMIN DASHBOARD ---
function renderAdminDashboard() {
    document.getElementById('app').innerHTML = `
        <div class="p-6 max-w-6xl mx-auto">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <button onclick="auth.signOut().then(()=>router('home'))" class="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200">Logout</button>
            </div>
            
            <div class="bg-gray-800 text-white p-6 rounded-xl shadow-lg mb-8">
                <h3 class="font-bold text-yellow-400 text-sm uppercase mb-4">Update Daily Log</h3>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div><label class="text-xs text-gray-400">Day</label><input id="up-day" type="number" class="w-full bg-gray-700 p-2 rounded text-white" value="${state.liveStats.daily.day}"></div>
                    <div><label class="text-xs text-gray-400">Wgt (g)</label><input id="up-weight" type="number" class="w-full bg-gray-700 p-2 rounded text-white" value="${state.liveStats.daily.weight}"></div>
                    <div><label class="text-xs text-gray-400">Feed (kg)</label><input id="up-feed" type="number" class="w-full bg-gray-700 p-2 rounded text-white" value="${state.liveStats.daily.feed}"></div>
                    <div><label class="text-xs text-red-300">Mortality</label><input id="up-mortality" type="number" class="w-full bg-gray-700 border-red-500 border p-2 rounded text-white" value="0"></div>
                    <div><label class="text-xs text-gray-400">Medicine</label><input id="up-med" type="text" class="w-full bg-gray-700 p-2 rounded text-white" value="${state.liveStats.daily.medicine || 'None'}"></div>
                </div>
                <button onclick="saveDailyStats()" class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded">UPDATE LOG & SAVE RECORD</button>
            </div>

            <!-- Admin History View -->
            <div class="bg-white rounded-xl shadow border overflow-hidden mb-10">
                <div class="p-4 bg-gray-50 border-b font-bold text-gray-700">Recent Records (Internal)</div>
                <div class="overflow-x-auto h-64 overflow-y-auto">
                    <table class="w-full text-left text-sm"><thead class="bg-gray-100 text-gray-600 sticky top-0"><tr><th class="p-3">Date</th><th class="p-3">Day</th><th class="p-3">Weight</th><th class="p-3">Mortality</th></tr></thead><tbody id="adm-log-hist"><tr><td class="p-4 text-center text-gray-400" colspan="4">Loading...</td></tr></tbody></table>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div class="bg-white p-6 rounded-xl shadow border"><h3 class="font-bold text-gray-500 text-xs uppercase mb-2">Total Birds</h3><div class="flex gap-2"><input id="adm-birds" type="number" class="border p-2 w-full rounded font-bold" value="${state.liveStats.totalBirds}"><button onclick="saveStats()" class="bg-blue-600 text-white px-4 rounded">Save</button></div></div>
                <div class="bg-white p-6 rounded-xl shadow border"><h3 class="font-bold text-gray-500 text-xs uppercase mb-2">Price (Rs/kg)</h3><div class="flex gap-2"><input id="adm-p-live" type="number" class="border p-2 w-full rounded font-bold" value="${state.settings.priceLive}"><button onclick="savePrices()" class="bg-green-600 text-white px-4 rounded">Save</button></div></div>
            </div>
        </div>
    `;
    loadAdminLogs();
}

// 7. LOGIC HANDLERS
window.saveDailyStats = () => {
    const day = parseInt(document.getElementById('up-day').value), weight = parseInt(document.getElementById('up-weight').value), feed = parseInt(document.getElementById('up-feed').value), mort = parseInt(document.getElementById('up-mortality').value)||0, med = document.getElementById('up-med').value;
    rtdb.ref('farmStats/daily').set({day, weight, feed, medicine: med, mortality: mort});
    if(mort>0){ rtdb.ref('farmStats/totalBirds').transaction(c=>(c||0)-mort); }
    db.collection('dailyLogs').add({day, weight, feed, mortality: mort, medicine: med, timestamp: firebase.firestore.FieldValue.serverTimestamp(), dateString: new Date().toLocaleDateString()})
    .then(()=>{alert("Saved!"); document.getElementById('up-mortality').value=0; loadAdminLogs();}).catch(e=>alert(e.message));
};

function loadAdminLogs() {
    db.collection('dailyLogs').orderBy('timestamp', 'desc').limit(10).get().then(snap => {
        let h = ''; snap.forEach(d => { const x=d.data(); h+=`<tr class="border-b"><td class="p-3">${x.dateString}</td><td class="p-3">Day ${x.day}</td><td class="p-3">${x.weight}g</td><td class="p-3 text-red-600">${x.mortality}</td></tr>`; });
        document.getElementById('adm-log-hist').innerHTML = h;
    });
}

// Helper Functions
function renderProducts() { document.getElementById('app').innerHTML = `<div class="max-w-3xl mx-auto px-4 py-12 fade-in"><h1 class="text-3xl font-bold text-center mb-10">Order Fresh Chicken</h1><div class="bg-white rounded-xl shadow-xl p-8 border border-gray-100"><form onsubmit="placeOrder(event)" class="space-y-5"><div class="grid grid-cols-2 gap-5"><input id="c-name" placeholder="Name" required class="border p-3 rounded w-full"><input id="c-phone" type="tel" placeholder="Phone" required class="border p-3 rounded w-full"></div><div class="flex gap-2"><input id="qty" type="number" placeholder="Qty" oninput="calcTotal()" class="border p-3 rounded w-full"><select id="c-method" onchange="calcTotal()" class="border p-3 rounded bg-white"><option value="pickup">Pickup</option><option value="delivery">Delivery (+50)</option></select></div><textarea id="c-addr" placeholder="Address" class="border p-3 rounded w-full hidden"></textarea><div class="flex justify-between items-center font-bold text-xl text-green-900 mt-4"><span>Total:</span><span id="total-disp">Rs. 0</span></div><button class="bg-green-700 text-white w-full py-4 rounded font-bold mt-6 shadow-lg">CONFIRM ORDER</button></form></div></div>`; }
function renderAbout() { document.getElementById('app').innerHTML='<div class="p-10 text-center"><h1 class="text-2xl font-bold">About Us</h1><p class="mt-4">We are a premium broiler farm in Nepal.</p></div>'; }
function renderContact() { document.getElementById('app').innerHTML='<div class="p-10 text-center"><h1 class="text-2xl font-bold">Contact</h1><p class="mt-4">Phone: 9876543210</p></div>'; }
function renderGallery() { document.getElementById('app').innerHTML='<div class="p-10 text-center text-gray-500">Gallery Loading...</div>'; db.collection('gallery').orderBy('timestamp','desc').get().then(s=>{let h='';s.forEach(d=>h+=`<img src="${d.data().url}" class="w-full h-64 object-cover m-2 rounded">`);document.getElementById('app').innerHTML=`<div class="grid grid-cols-3 gap-4 p-4">${h||'No images'}</div>`}); }
function renderAdminLogin() { if(state.user){router('admin-dashboard');return;} document.getElementById('app').innerHTML=`<div class="flex justify-center h-[70vh] items-center"><div class="bg-white p-8 shadow-xl rounded w-full max-w-sm"><h2 class="font-bold text-center mb-4">Admin</h2><input id="le" placeholder="Email" class="border p-2 w-full mb-3"><input id="lp" type="password" placeholder="Pass" class="border p-2 w-full mb-3"><button onclick="auth.signInWithEmailAndPassword(document.getElementById('le').value,document.getElementById('lp').value)" class="bg-green-800 text-white w-full py-2 rounded">Login</button></div></div>`; }

window.calcTotal = () => { const q=document.getElementById('qty').value||0, m=document.getElementById('c-method').value; let t=q*state.settings.priceLive; if(m==='delivery'){t+=50;document.getElementById('c-addr').classList.remove('hidden');}else{document.getElementById('c-addr').classList.add('hidden');} document.getElementById('total-disp').innerText=`Rs. ${t}`; };
window.placeOrder = async (e) => { e.preventDefault(); try{ await db.collection('orders').add({customer:document.getElementById('c-name').value, phone:document.getElementById('c-phone').value, type:'live', qty:document.getElementById('qty').value, method:document.getElementById('c-method').value, address:document.getElementById('c-addr').value||'Pickup', status:'Pending', timestamp:firebase.firestore.FieldValue.serverTimestamp()}); alert("Order Placed!"); router('home'); }catch(e){alert(e.message);} };
window.saveStats = () => rtdb.ref('farmStats').update({totalBirds: parseInt(document.getElementById('adm-birds').value)});
window.savePrices = () => db.collection('settings').doc('general').set({priceLive: parseFloat(document.getElementById('adm-p-live').value)}, {merge:true});

router('home');
