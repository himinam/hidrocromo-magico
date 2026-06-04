import { carrito, vaciarCarrito, actualizarInterfaz } from './app.js';


const PP_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

function cargarPaypalSDK() {
    return new Promise((resolve, reject) => {
        if (window.paypal) { resolve(); return; }
        const s  = document.createElement('script');
        s.src    = `https://www.paypal.com/sdk/js?client-id=${PP_CLIENT_ID}&currency=USD`;
        s.onload  = resolve;
        s.onerror = () => reject(new Error('No se pudo cargar el SDK de PayPal'));
        document.head.appendChild(s);
    });
}

function ppTotal() {
    return carrito.reduce((s, p) => s + p.precio * p.cantidad, 0).toFixed(2);
}

function ppMostrarConfirmacion(orderId, monto) {
    // Oculta las opciones y muestra la confirmación de éxito
    const opciones = document.getElementById('pp-payment-options');
    if (opciones) opciones.classList.add('d-none');
    
    const conf = document.getElementById('pp-confirmacion');
    if (conf) {
        conf.classList.remove('d-none');
        conf.classList.add('d-flex');
    }
    
    const txtOrder = document.getElementById('pp-conf-order-id');
    if (txtOrder) txtOrder.textContent = `ID de orden: ${orderId}`;
    
    const txtMonto = document.getElementById('pp-conf-monto');
    if (txtMonto) txtMonto.textContent = `$${monto} USD`;
    
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
    if (!container) return;
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
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    description: 'Hidrocromo Mágico – Esculturas',
                    amount: {
                        currency_code: 'USD',
                        value: ppTotal(),
                        breakdown: {
                            item_total: { currency_code: 'USD', value: ppTotal() }
                        }
                    },
                    items: carrito.map(p => ({
                        name: p.nombre.substring(0, 127),
                        unit_amount: { currency_code: 'USD', value: p.precio.toFixed(2) },
                        quantity: String(p.cantidad)
                    }))
                }]
            });
        },

        onApprove: async (data, actions) => {
            try {
                const details = await actions.order.capture();
                const monto = details.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || ppTotal();
                ppMostrarConfirmacion(details.id, monto);
            } catch (err) {
                ppToast('Error al procesar el pago con PayPal.', 'danger');
            }
        },

        onError: (err) => {
            console.error('Paypal Error:', err);
            ppToast('Ocurrió un error en la pasarela de PayPal.', 'danger');
        },

        style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'paypal', height: 48 }
    }).render('#paypal-button-container');
}

function ppReset() {
    const opciones = document.getElementById('pp-payment-options');
    if (opciones) opciones.classList.remove('d-none');
    
    const conf = document.getElementById('pp-confirmacion');
    if (conf) {
        conf.classList.add('d-none');
        conf.classList.remove('d-flex');
    }
    
    ppRenderBoton();
}

document.addEventListener('DOMContentLoaded', () => {
    const offcanvas = document.getElementById('checkoutExpressPanel');
    if (!offcanvas) return;

    offcanvas.addEventListener('show.bs.offcanvas', ppReset);
    offcanvas.addEventListener('hide.bs.offcanvas', () => {
        const container = document.getElementById('paypal-button-container');
        if (container) container.innerHTML = '';
    });
    
    // Ejecución inicial limpia
    ppRenderBoton();
});