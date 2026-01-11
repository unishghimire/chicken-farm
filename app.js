// 1. CONFIGURATION
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
    cart: { type: 'live', qty: 1 },
    admin: { orders: [], filter: 'All', search: '' }
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
                updateHomeStats();
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

function updateHomeStats() {
    if(document.getElementById('live-bird-count')) document.getElementById('live-bird-count').innerText = state.liveStats.totalBirds;
    if(document.getElementById('stat-day')) document.getElementById('stat-day').innerText = state.liveStats.daily.day;
    if(document.getElementById('stat-weight')) document.getElementById('stat-weight').innerText = state.liveStats.daily.weight + 'g';
    if(document.getElementById('stat-feed')) document.getElementById('stat-feed').innerText = state.liveStats.daily.feed + 'kg';
    if(document.getElementById('stat-med')) document.getElementById('stat-med').innerText = state.liveStats.daily.medicine || 'None';
}

// 6. RENDER FUNCTIONS

// --- HOME ---
function renderHome() {
    document.getElementById('app').innerHTML = `
        <div class="fade-in">
            <div class="relative h-[600px] flex items-center justify-center text-center text-white px-4 bg-cover bg-center" style="background-image:url('https://www.farmforward.com/wp-content/uploads/2023/03/broiler-chicken.jpg');">
                <div class="absolute inset-0 bg-black/60"></div>
                <div class="relative z-10 max-w-4xl mx-auto">
                    <h1 class="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-xl text-white uppercase">HIMALAYAN FARM AGRO</h1>
                    <div class="h-1.5 w-24 bg-yellow-400 mx-auto mb-8 rounded-full shadow-lg"></div>
                    <p class="text-xl md:text-3xl mb-10 font-light text-gray-100 drop-shadow-md">Premium Broiler Farm in Lalitpur, Ghusel</p>
                    <button onclick="router('products')" class="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-full text-lg shadow-2xl uppercase border-2 border-green-400 tracking-wider">ORDER LIVE BIRDS</button>
                </div>
            </div>
            <div class="max-w-6xl mx-auto -mt-20 relative z-10 px-4 mb-20">
                <div class="bg-white rounded-2xl shadow-xl p-8 flex justify-around text-center mb-8 border-t-8 border-green-600">
                    <div class="border-r w-1/2">
                        <p class="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">Market Rate</p>
                        <h2 class="text-5xl font-bold text-gray-800 live-price-disp">Rs. ${state.settings.priceLive}</h2>
                        <p class="text-gray-400 text-sm mt-1">Per KG</p>
                    </div>
                    <div class="w-1/2">
                        <p class="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">Live Stock</p>
                        <h2 class="text-5xl font-bold text-blue-600" id="live-bird-count">${state.liveStats.totalBirds}</h2>
                        <p class="text-gray-400 text-sm mt-1">Birds Available</p>
                    </div>
                </div>
                <!-- Daily Log -->
                <div class="bg-gray-900 rounded-2xl shadow-xl p-6 text-white border border-gray-700">
                    <div class="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
                        <h3 class="font-bold text-yellow-400 uppercase tracking-widest">Daily Farm Log</h3>
                        <button onclick="router('records')" class="text-xs text-blue-300 hover:text-white underline">View History</button>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div class="bg-gray-800 rounded-xl p-4"><p class="text-xs text-gray-400 uppercase font-bold">Batch Age</p><h4 id="stat-day" class="text-2xl font-bold">${state.liveStats.daily.day} <span class="text-sm font-normal">Days</span></h4></div>
                        <div class="bg-gray-800 rounded-xl p-4"><p class="text-xs text-gray-400 uppercase font-bold">Avg Weight</p><h4 id="stat-weight" class="text-2xl font-bold">${state.liveStats.daily.weight} <span class="text-sm font-normal">g</span></h4></div>
                        <div class="bg-gray-800 rounded-xl p-4"><p class="text-xs text-gray-400 uppercase font-bold">Feed Today</p><h4 id="stat-feed" class="text-2xl font-bold">${state.liveStats.daily.feed} <span class="text-sm font-normal">kg</span></h4></div>
                        <div class="bg-gray-800 rounded-xl p-4 border border-green-800"><p class="text-xs text-gray-400 uppercase font-bold">Health / Meds</p><h4 id="stat-med" class="text-xl font-bold truncate">${state.liveStats.daily.medicine || "Healthy"}</h4></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- ADMIN DASHBOARD ---
function renderAdminDashboard() {
    document.getElementById('app').innerHTML = `
        <div class="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800">Himalayan Farm Admin</h1>
                <button onclick="auth.signOut().then(()=>router('home'))" class="bg-white border border-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-100">Logout</button>
            </div>

            <!-- Update Daily Log -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h3 class="font-bold text-gray-700 mb-4 border-b pb-2">Daily Production Update</h3>
                <div class="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
                    <div><label class="text-xs font-bold text-gray-500">Day</label><input id="up-day" type="number" class="w-full border p-2 rounded" value="${state.liveStats.daily.day}"></div>
                    <div><label class="text-xs font-bold text-gray-500">Weight (g)</label><input id="up-weight" type="number" class="w-full border p-2 rounded" value="${state.liveStats.daily.weight}"></div>
                    <div><label class="text-xs font-bold text-gray-500">Feed (kg)</label><input id="up-feed" type="number" class="w-full border p-2 rounded" value="${state.liveStats.daily.feed}"></div>
                    <div><label class="text-xs font-bold text-red-500">Mortality</label><input id="up-mortality" type="number" class="w-full border border-red-200 bg-red-50 p-2 rounded" value="0"></div>
                    <div><label class="text-xs font-bold text-gray-500">Medicine</label><input id="up-med" type="text" class="w-full border p-2 rounded" value="${state.liveStats.daily.medicine}"></div>
                    <button onclick="saveDailyStats()" class="bg-green-600 text-white font-bold py-2 rounded shadow hover:bg-green-700">Update Log</button>
                </div>
            </div>

            <!-- Order Management -->
            <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-10">
                <div class="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
                    <div class="flex space-x-2">
                        ${['All', 'Pending', 'Completed', 'Cancelled'].map(f => `<button onclick="setFilter('${f}')" class="px-4 py-2 rounded-md text-sm font-medium transition ${state.admin.filter === f ? 'bg-green-600 text-white shadow' : 'bg-white text-gray-600 border hover:bg-gray-100'}">${f}</button>`).join('')}
                    </div>
                    <input type="text" placeholder="Search orders..." oninput="setSearch(this.value)" class="w-full md:w-64 pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500">
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-100 text-gray-600 uppercase text-xs font-bold"><tr><th class="p-4">Order ID</th><th class="p-4">Customer</th><th class="p-4 text-center">Qty</th><th class="p-4 text-center">Type</th><th class="p-4 text-right">Total</th><th class="p-4 text-center">Status</th><th class="p-4 text-center">Actions</th></tr></thead>
                        <tbody id="admin-orders-body" class="divide-y divide-gray-100 bg-white"><tr><td colspan="7" class="p-8 text-center text-gray-400">Loading orders...</td></tr></tbody>
                    </table>
                </div>
            </div>

            <!-- Settings -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center"><div><p class="text-xs text-gray-500 font-bold uppercase">Total Birds</p><input id="adm-birds" type="number" class="text-xl font-bold text-gray-800 border-none w-24 p-0" value="${state.liveStats.totalBirds}"></div><button onclick="saveStats()" class="text-blue-600 hover:bg-blue-50 p-2 rounded"><i class="fa-solid fa-floppy-disk"></i> Save</button></div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center"><div><p class="text-xs text-gray-500 font-bold uppercase">Price (Rs)</p><input id="adm-p-live" type="number" class="text-xl font-bold text-green-600 border-none w-24 p-0" value="${state.settings.priceLive}"></div><button onclick="savePrices()" class="text-green-600 hover:bg-green-50 p-2 rounded"><i class="fa-solid fa-floppy-disk"></i> Save</button></div>
            </div>
        </div>
        <!-- Modal -->
        <div id="order-modal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4"><div id="modal-content" class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in-up"></div></div>
    `;
    startOrderListener();
}

// 7. ADMIN LOGIC
window.setFilter = (f) => { state.admin.filter = f; renderOrdersTable(); renderAdminDashboard(); };
window.setSearch = (s) => { state.admin.search = s.toLowerCase(); renderOrdersTable(); };

function startOrderListener() {
    db.collection('orders').orderBy('timestamp', 'desc').onSnapshot(snap => {
        state.admin.orders = [];
        snap.forEach(doc => { let d = doc.data(); d.id = doc.id; state.admin.orders.push(d); });
        renderOrdersTable();
    });
}

function renderOrdersTable() {
    const tbody = document.getElementById('admin-orders-body');
    if (!tbody) return;
    const filtered = state.admin.orders.filter(o => {
        return (state.admin.filter === 'All' || o.status === state.admin.filter) &&
               (o.customer.toLowerCase().includes(state.admin.search) || o.phone.includes(state.admin.search));
    });
    if (filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-400">No orders found.</td></tr>`; return; }
    tbody.innerHTML = filtered.map(o => {
        const total = (o.qty * state.settings.priceLive) + (o.method === 'delivery' ? state.settings.deliveryFee : 0);
        const stStyle = o.status==='Completed'?'bg-green-100 text-green-800':(o.status==='Cancelled'?'bg-red-100 text-red-800':'bg-yellow-100 text-yellow-800');
        return `<tr class="hover:bg-gray-50 transition cursor-pointer" onclick="openOrderModal('${o.id}')">
            <td class="p-4 font-mono font-bold text-gray-500">ORD${o.id.slice(0,4).toUpperCase()}</td>
            <td class="p-4"><div class="font-bold text-gray-900">${o.customer}</div><div class="text-xs text-gray-500">${o.phone}</div></td>
            <td class="p-4 text-center font-bold">${o.qty} kg</td>
            <td class="p-4 text-center"><span class="px-2 py-1 rounded text-xs border ${o.method==='pickup'?'bg-blue-50 text-blue-600':'bg-orange-50 text-orange-600'}">${o.method}</span></td>
            <td class="p-4 text-right font-bold text-gray-700">Rs. ${total}</td>
            <td class="p-4 text-center"><span class="px-3 py-1 rounded-full text-xs font-bold ${stStyle}">${o.status}</span></td>
            <td class="p-4 text-center"><button class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">View</button></td>
        </tr>`;
    }).join('');
}

window.openOrderModal = (id) => {
    const order = state.admin.orders.find(o => o.id === id);
    if (!order) return;
    const total = (order.qty * state.settings.priceLive) + (order.method === 'delivery' ? state.settings.deliveryFee : 0);
    const date = order.timestamp ? new Date(order.timestamp.toDate()).toLocaleString() : 'N/A';
    document.getElementById('modal-content').innerHTML = `
        <div class="p-6 bg-gray-50 border-b flex justify-between items-center"><h2 class="text-2xl font-bold text-gray-800">Order #ORD${order.id.slice(0,4).toUpperCase()}</h2><button onclick="document.getElementById('order-modal').classList.add('hidden')" class="text-gray-500 hover:text-red-500 text-xl"><i class="fa-solid fa-times"></i></button></div>
        <div class="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white p-6 rounded-xl shadow-sm border">
                <h3 class="font-bold text-gray-700 mb-4 border-b pb-2">Customer Info</h3>
                <div class="space-y-2 text-sm"><p><strong>Name:</strong> ${order.customer}</p><p><strong>Phone:</strong> ${order.phone}</p><p><strong>Address:</strong> ${order.address}</p><p><strong>Date:</strong> ${date}</p></div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-center items-center">
                <h3 class="font-bold text-gray-700 mb-4">Actions</h3>
                <div class="grid grid-cols-2 gap-3 w-full">
                    ${order.status === 'Pending' ? `<button onclick="changeStatus('${order.id}','Completed',${order.qty})" class="bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold">Complete</button><button onclick="changeStatus('${order.id}','Cancelled')" class="bg-red-600 text-white py-2 rounded hover:bg-red-700 font-bold">Cancel</button>` : ''}
                    <button onclick="printInvoice('${order.id}')" class="col-span-2 bg-gray-800 text-white py-2 rounded hover:bg-black font-bold">Print Invoice</button>
                </div>
            </div>
        </div>`;
    document.getElementById('order-modal').classList.remove('hidden');
};

window.printInvoice = (id) => {
    const order = state.admin.orders.find(o => o.id === id);
    const total = (order.qty * state.settings.priceLive) + (order.method === 'delivery' ? state.settings.deliveryFee : 0);
    const win = window.open('','','width=800,height=600');
    win.document.write(`<html><head><title>Invoice</title><style>body{font-family:sans-serif;padding:40px;}.header{text-align:center;border-bottom:2px solid #333;margin-bottom:30px;}.row{display:flex;justify-content:space-between;margin-bottom:10px;}.total{font-weight:bold;border-top:1px solid #ccc;padding-top:10px;margin-top:20px;}</style></head><body>
        <div class="header"><h1>HIMALAYAN FARM AGRO</h1><p>Lalitpur, Ghusel</p><p>INVOICE #ORD${order.id.slice(0,4).toUpperCase()}</p></div>
        <div class="row"><span>Customer:</span><span>${order.customer}</span></div><div class="row"><span>Phone:</span><span>${order.phone}</span></div><hr>
        <div class="row"><span>Broiler Chicken (${order.qty}kg)</span><span>Rs. ${order.qty*state.settings.priceLive}</span></div>
        ${order.method==='delivery'?'<div class="row"><span>Delivery</span><span>Rs. '+state.settings.deliveryFee+'</span></div>':''}
        <div class="row total"><span>TOTAL</span><span>Rs. ${total}</span></div>
        <div style="text-align:center;margin-top:50px;font-size:12px;">Thank you for choosing Himalayan Farm Agro!</div></body></html>`);
    win.document.close(); win.print();
};

// HANDLERS
window.saveDailyStats = () => {
    const day=parseInt(document.getElementById('up-day').value), weight=parseInt(document.getElementById('up-weight').value), feed=parseInt(document.getElementById('up-feed').value), mort=parseInt(document.getElementById('up-mortality').value)||0, med=document.getElementById('up-med').value;
    rtdb.ref('farmStats/daily').set({day,weight,feed,medicine:med,mortality:mort});
    if(mort>0){ rtdb.ref('farmStats/totalBirds').transaction(c=>(c||0)-mort); }
    db.collection('dailyLogs').add({day,weight,feed,mortality:mort,medicine:med,timestamp:firebase.firestore.FieldValue.serverTimestamp(),dateString:new Date().toLocaleDateString()}).then(()=>{alert("Saved!"); document.getElementById('up-mortality').value=0;});
};
window.changeStatus = (id, s, q) => { if(s==='Completed' && prompt(`Order: ${q}kg. Deduct birds from stock?`, Math.ceil(q/2))) rtdb.ref('farmStats/totalBirds').transaction(c=>(c||0)-parseInt(arguments[2])); db.collection('orders').doc(id).update({status:s}).then(()=>document.getElementById('order-modal').classList.add('hidden')); };
window.saveStats = () => rtdb.ref('farmStats').update({totalBirds: parseInt(document.getElementById('adm-birds').value)});
window.savePrices = () => db.collection('settings').doc('general').set({priceLive: parseFloat(document.getElementById('adm-p-live').value)}, {merge:true});

// OTHER VIEWS
function renderRecords() { document.getElementById('app').innerHTML = `<div class="max-w-6xl mx-auto p-8"><h1 class="text-3xl font-bold mb-6 text-center text-gray-800">Daily Farm Records</h1><div class="bg-white rounded shadow overflow-hidden"><table class="w-full text-left text-sm"><thead class="bg-gray-800 text-white"><tr><th class="p-3">Date</th><th class="p-3">Day</th><th class="p-3">Weight</th><th class="p-3">Mortality</th><th class="p-3">Meds</th></tr></thead><tbody id="rec-body"><tr><td colspan="5" class="p-4 text-center">Loading...</td></tr></tbody></table></div></div>`; db.collection('dailyLogs').orderBy('timestamp','desc').limit(30).get().then(s=>{let h='';s.forEach(d=>{const x=d.data(); h+=`<tr class="border-b"><td class="p-3">${x.dateString}</td><td class="p-3 font-bold">Day ${x.day}</td><td class="p-3">${x.weight}g</td><td class="p-3 text-red-600">${x.mortality}</td><td class="p-3 italic text-blue-600">${x.medicine}</td></tr>`}); document.getElementById('rec-body').innerHTML=h;}); }
function renderProducts() { document.getElementById('app').innerHTML = `<div class="max-w-3xl mx-auto px-4 py-12"><h1 class="text-3xl font-bold text-center mb-8">Order Live Chicken</h1><div class="bg-white p-8 rounded-xl shadow-lg border"><form onsubmit="placeOrder(event)" class="space-y-4"><input id="c-name" placeholder="Full Name" class="border p-3 w-full rounded" required><input id="c-phone" placeholder="Phone Number" class="border p-3 w-full rounded" required><input id="qty" type="number" placeholder="Quantity (kg)" oninput="calcTotal()" class="border p-3 w-full rounded" required><select id="c-method" onchange="calcTotal()" class="border p-3 w-full rounded bg-white"><option value="pickup">Farm Pickup</option><option value="delivery">Home Delivery (+Rs.50)</option></select><textarea id="c-addr" placeholder="Delivery Address" class="border p-3 w-full rounded hidden"></textarea><div class="flex justify-between font-bold text-xl text-green-900"><span>Total Estimate:</span><span id="total-disp">Rs. 0</span></div><button class="bg-green-700 text-white w-full py-4 rounded font-bold shadow hover:bg-green-800">CONFIRM ORDER</button></form></div></div>`; }
function renderAbout() { document.getElementById('app').innerHTML='<div class="p-10 text-center"><h1 class="text-3xl font-bold text-gray-800">About Himalayan Farm Agro</h1><p class="mt-4 text-gray-600 text-lg">We are a premium broiler farm located in the hills of Lalitpur, dedicated to providing organic, antibiotic-free chicken to the Kathmandu Valley.</p></div>'; }
function renderContact() { document.getElementById('app').innerHTML='<div class="p-10 text-center"><h1 class="text-3xl font-bold text-gray-800">Contact Us</h1><p class="mt-4 text-lg"><strong>Phone:</strong> 9876543210<br><strong>Location:</strong> Lalitpur, Ghusel</p></div>'; }
function renderGallery() { document.getElementById('app').innerHTML='<div class="p-10 text-center text-gray-500">Gallery Loading...</div>'; db.collection('gallery').orderBy('timestamp','desc').get().then(s=>{let h='';s.forEach(d=>h+=`<img src="${d.data().url}" class="w-full h-64 object-cover m-2 rounded shadow">`);document.getElementById('app').innerHTML=`<div class="max-w-6xl mx-auto p-4"><h1 class="text-3xl font-bold text-center mb-8">Farm Gallery</h1><div class="grid grid-cols-1 md:grid-cols-3 gap-4">${h||'No images uploaded yet.'}</div></div>`}); }
function renderAdminLogin() { if(state.user){router('admin-dashboard');return;} document.getElementById('app').innerHTML=`<div class="flex justify-center h-[70vh] items-center"><div class="bg-white p-8 shadow-xl rounded w-full max-w-sm"><h2 class="font-bold text-center mb-4">Admin Login</h2><input id="le" placeholder="Email" class="border p-2 w-full mb-3"><input id="lp" type="password" placeholder="Pass" class="border p-2 w-full mb-3"><button onclick="auth.signInWithEmailAndPassword(document.getElementById('le').value,document.getElementById('lp').value)" class="bg-green-800 text-white w-full py-2 rounded">Login</button></div></div>`; }
window.calcTotal = () => { const q=document.getElementById('qty').value||0, m=document.getElementById('c-method').value; let t=q*state.settings.priceLive; if(m==='delivery'){t+=50;document.getElementById('c-addr').classList.remove('hidden');}else{document.getElementById('c-addr').classList.add('hidden');} document.getElementById('total-disp').innerText=`Rs. ${t}`; };
window.placeOrder = async (e) => { e.preventDefault(); try{ await db.collection('orders').add({customer:document.getElementById('c-name').value, phone:document.getElementById('c-phone').value, type:'live', qty:document.getElementById('qty').value, method:document.getElementById('c-method').value, address:document.getElementById('c-addr').value||'Pickup', status:'Pending', timestamp:firebase.firestore.FieldValue.serverTimestamp()}); alert("Order Placed Successfully!"); router('home'); }catch(e){alert(e.message);} };

router('home');
