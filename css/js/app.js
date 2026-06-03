export let carrito = [];

document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrito();
});

function inicializarCarrito() {
    const contenedorProductos = document.getElementById('contenedor-productos');
    if (!contenedorProductos) return;

    contenedorProductos.addEventListener('click', (e) => {
        if (!e.target.classList.contains('add-cart')) return;
        e.preventDefault();

        const boton = e.target;
        const card  = boton.closest('.product-item-card');

        agregarAlCarrito({
            id:       card ? card.getAttribute('data-name').replace(/\s+/g, '-') : 'producto',
            nombre:   boton.getAttribute('data-name') || 'Escultura',
            precio:   card ? parseFloat(card.getAttribute('data-price')) || 0 : 0,
            cantidad: 1
        });
    });
}

function agregarAlCarrito(productoNuevo) {
    const existe = carrito.some(p => p.nombre === productoNuevo.nombre);
    if (existe) {
        carrito = carrito.map(p => {
            if (p.nombre === productoNuevo.nombre) p.cantidad++;
            return p;
        });
    } else {
        carrito.push(productoNuevo);
    }
    mostrarNotificacion(productoNuevo.nombre);
    actualizarInterfaz();
}

export function vaciarCarrito() {
    carrito = [];
}

export function actualizarInterfaz() {
    let totalPrecio   = 0;
    let totalProductos = 0;
    const miniLista   = document.getElementById('lista-checkout-mini');

    if (miniLista) miniLista.innerHTML = '';

    carrito.forEach(p => {
        totalPrecio    += p.precio * p.cantidad;
        totalProductos += p.cantidad;

        if (miniLista) {
            miniLista.insertAdjacentHTML('beforeend', `
                <div class="d-flex justify-content-between align-items-center bg-black bg-opacity-25 p-2 rounded-3 mb-2 border border-secondary border-opacity-25">
                    <div class="small">
                        <span class="fw-bold text-light">${p.nombre}</span>
                        <br><span class="text-secondary" style="font-size:0.8rem;">Cant: ${p.cantidad}</span>
                    </div>
                    <span class="small fw-semibold text-warning">$${(p.precio * p.cantidad).toFixed(2)}</span>
                </div>`);
        }
    });

    if (totalProductos === 0 && miniLista) {
        miniLista.innerHTML = '<div class="text-center text-secondary py-3 small">Tu bolsa está vacía.</div>';
    }

    const contEl    = document.getElementById('cart-count');
    const totalEl   = document.getElementById('checkout-total-express');
    const flotante  = document.getElementById('btn-flotante-compra');
    const totalFlot = document.getElementById('total-flotante');

    if (contEl)   contEl.textContent   = totalProductos;
    if (totalEl)  totalEl.textContent  = `$${totalPrecio.toFixed(2)} USD`;

    if (flotante && totalFlot) {
        totalFlot.textContent = `$${totalPrecio.toFixed(2)} USD`;
        flotante.classList.toggle('d-none', totalProductos === 0);
    }
}

function mostrarNotificacion(nombre) {
    const el = document.createElement('div');
    el.className = 'position-fixed bottom-0 end-0 m-4 alert alert-success border-0 shadow-lg text-white d-flex align-items-center gap-2';
    el.style.cssText = 'z-index:9999;background:linear-gradient(135deg,#28a745,#1e7e34);';
    el.innerHTML = `<i class="bi bi-check-circle-fill"></i><span><strong>${nombre}</strong> añadido al carrito.</span>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
}
