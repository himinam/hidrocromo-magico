import { carrito, vaciarCarrito, actualizarInterfaz } from './app.js';


const PP_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const PP_SECRET    = import.meta.env.VITE_PAYPAL_SECRET;
const PP_BASE      = import.meta.env.VITE_PAYPAL_ENDPOINT || 'https://sandbox.paypal.com';

let _token       = null;
let _tokenExpiry = 0;


function cargarPaypalSDK() {
    return new Promise((resolve, reject) => {
        if (window.paypal) { resolve(); return; }
        const s  = document.createElement('script');
        s.src    = `https://www.paypal.com/sdk/js?client-id=${PP_CLIENT_ID}&currency=USD&intent=capture`;
        s.onload  = resolve;
        s.onerror = () => reject(new Error('No se pudo cargar el SDK de PayPal'));
        document.head.appendChild(s);
    });
}


async function ppToken() {
    if (_token && Date.now() < _tokenExpiry) return _token;
    const res = await fetch(`${PP_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization:  'Basic ' + btoa(`${PP_CLIENT_ID}:${PP_SECRET}`),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    if (!res.ok) throw new Error('Error al obtener token de PayPal');
    const d    = await res.json();
    _token     = d.access_token;
    _tokenExpiry = Date.now() + (d.expires_in - 120) * 1000;
    return _token;
}


function ppOrderBody() {
    const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);
    return {
        intent: 'CAPTURE',
        purchase_units: [{
            description: 'Hidrocromo Mágico – Esculturas',
            amount: {
                currency_code: 'USD',
                value:         total.toFixed(2),
                breakdown: { item_total: { currency_code: 'USD', value: total.toFixed(2) } }
            },
            items: carrito.map(p => ({
                name:        p.nombre.substring(0, 127),
                unit_amount: { currency_code: 'USD', value: p.precio.toFixed(2) },
                quantity:    String(p.cantidad),
                category:    'PHYSICAL_GOODS'
            }))
        }]
    };
}

function ppTotal() {
    return carrito.reduce((s, p) => s + p.precio * p.cantidad, 0).toFixed(2);
}


async function ppCreateOrder() {
    const token = await ppToken();
    const res = await fetch(`${PP_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            Authorization:      `Bearer ${token}`,
            'Content-Type':     'application/json',
            'PayPal-Request-Id': `hm-${Date.now()}`
        },
        body: JSON.stringify(ppOrderBody())
    });
    if (!res.ok) throw new Error('Error al crear la orden');
    const order = await res.json();
    return order.id;
}

async function ppCaptureOrder(orderId) {
    const token = await ppToken();
    const res = await fetch(`${PP_BASE}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return res.json();
}

async function ppGetOrder(orderId) {
    const token = await ppToken();
    const res = await fetch(`${PP_BASE}/v2/checkout/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
}

function ppMostrarConfirmacion(orderId, monto) {
    document.getElementById('pp-payment-options').classList.add('d-none');
    const conf = document.getElementById('pp-confirmacion');
    conf.classList.remove('d-none');
    conf.classList.add('d-flex');
    document.getElementById('pp-conf-order-id').textContent = `ID de orden: ${orderId}`;
    document.getElementById('pp-conf-monto').textContent    = `$${monto} USD`;
    vaciarCarrito();
    actualizarInterfaz();
}

function ppToast(msg, tipo = 'warning') {
    const el = document.createElement('div');
    el.className = `position-fixed bottom-0 end-0 m-4 alert alert-${tipo} border-0 shadow-lg d-flex align-items-center gap-2`;
    el.style.cssText = 'z-index:10001;max-width:360px;';
    el.innerHTML = `<i class="bi bi-${tipo === 'danger' ? 'x-circle' : 'exclamation-triangle'}-fill"></i><span>${msg}</span>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4500);
}

async function ppRenderBoton() {
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = '';

    if (carrito.length === 0) {
        container.innerHTML = '<p class="text-secondary small text-center py-3">Agrega productos para continuar.</p>';
        return;
    }

    try {
        await cargarPaypalSDK();
    } catch {
        container.innerHTML = '<p class="text-danger small text-center py-3">Error al cargar PayPal. Verifica tu conexión.</p>';
        return;
    }

    paypal.Buttons({
        createOrder: () => ppCreateOrder(),

        onApprove: async (data) => {
            try {
                const details = await ppCaptureOrder(data.orderID);
                const monto   = details.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? ppTotal();
                ppMostrarConfirmacion(data.orderID, monto);
            } catch {
                ppToast('Error al capturar el pago. Inténtalo de nuevo.', 'danger');
            }
        },

        onError: () => ppToast('Ocurrió un error en PayPal. Inténtalo de nuevo.', 'danger'),

        style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'paypal', height: 48 }
    }).render('#paypal-button-container');
}

async function ppGenerarQR() {
    if (carrito.length === 0) {
        ppToast('Agrega productos al carrito primero.');
        return;
    }

    const wrap = document.getElementById('pp-qr-wrap');
    wrap.innerHTML = `
        <div class="d-flex flex-column align-items-center gap-2 py-4">
            <div class="spinner-border text-secondary" style="width:2.5rem;height:2.5rem;" role="status"></div>
            <span style="color:#555;font-size:.85rem;">Creando orden en PayPal...</span>
        </div>`;

    try {
        const orderId     = await ppCreateOrder();
        const approvalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;

        wrap.innerHTML = '<div id="pp-qr-canvas" class="d-flex justify-content-center"></div>';

        new QRCode(document.getElementById('pp-qr-canvas'), {
            text:         approvalUrl,
            width:        210,
            height:       210,
            colorDark:    '#000000',
            colorLight:   '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        document.getElementById('pp-qr-hint').classList.remove('d-none');

        const btnV            = document.getElementById('pp-btn-verificar');
        btnV.classList.remove('d-none');
        btnV.disabled         = false;
        btnV.textContent      = '✅ Ya pagué — Verificar';
        btnV.dataset.orderId  = orderId;

    } catch {
        wrap.innerHTML = '<p class="text-danger small text-center py-3 mb-0">Error al generar el QR. Inténtalo de nuevo.</p>';
    }
}

async function ppVerificarPago() {
    const btn     = document.getElementById('pp-btn-verificar');
    const orderId = btn.dataset.orderId;

    btn.disabled  = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Verificando...';

    try {
        let order = await ppGetOrder(orderId);

        if (order.status === 'APPROVED') {
            order = await ppCaptureOrder(orderId);
        }

        if (order.status === 'COMPLETED') {
            const monto = order.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? ppTotal();
            ppMostrarConfirmacion(orderId, monto);
        } else {
            btn.disabled    = false;
            btn.textContent = '✅ Ya pagué — Verificar';
            ppToast('El pago aún no ha sido completado. Escanea el QR y aprueba en PayPal.');
        }
    } catch {
        btn.disabled    = false;
        btn.textContent = '✅ Ya pagué — Verificar';
        ppToast('Error al verificar. Inténtalo de nuevo.', 'danger');
    }
}

function ppSetModo(modo) {
    const tabNormal = document.getElementById('pp-tab-normal');
    const tabQR     = document.getElementById('pp-tab-qr');
    const panelNorm = document.getElementById('pp-panel-normal');
    const panelQR   = document.getElementById('pp-panel-qr');

    const activeStyle   = 'background:linear-gradient(135deg,#0070ba,#003087);color:white;border:none;border-radius:12px;';
    const inactiveStyle = 'background:transparent;color:#6c757d;border:1px solid #6c757d;border-radius:12px;';

    if (modo === 'normal') {
        tabNormal.style.cssText = activeStyle;
        tabQR.style.cssText     = inactiveStyle;
        panelNorm.classList.remove('d-none');
        panelQR.classList.add('d-none');
        ppRenderBoton();
    } else {
        tabQR.style.cssText     = activeStyle;
        tabNormal.style.cssText = inactiveStyle;
        panelQR.classList.remove('d-none');
        panelNorm.classList.add('d-none');
        ppGenerarQR();
    }
}

function ppReset() {
    document.getElementById('pp-payment-options').classList.remove('d-none');
    const conf = document.getElementById('pp-confirmacion');
    conf.classList.add('d-none');
    conf.classList.remove('d-flex');

    document.getElementById('pp-qr-wrap').innerHTML = '';
    document.getElementById('pp-qr-hint').classList.add('d-none');

    const btnV = document.getElementById('pp-btn-verificar');
    btnV.classList.add('d-none');
    delete btnV.dataset.orderId;

    document.getElementById('paypal-button-container').innerHTML = '';
    ppSetModo('normal');
}

document.addEventListener('DOMContentLoaded', () => {
    const offcanvas = document.getElementById('checkoutExpressPanel');
    if (!offcanvas) return;

    offcanvas.addEventListener('show.bs.offcanvas', ppReset);
    offcanvas.addEventListener('hide.bs.offcanvas', () => {
        document.getElementById('paypal-button-container').innerHTML = '';
    });

    document.getElementById('pp-tab-normal')
        ?.addEventListener('click', () => ppSetModo('normal'));
    document.getElementById('pp-tab-qr')
        ?.addEventListener('click', () => ppSetModo('qr'));
    document.getElementById('pp-btn-verificar')
        ?.addEventListener('click', ppVerificarPago);
});
