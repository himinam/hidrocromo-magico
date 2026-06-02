// 1. Crear el arreglo donde se guardarán los productos del carrito
let carrito = [];

// 2. Esperar a que el HTML esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrito();
});

function inicializarCarrito() {
    const contenedorProductos = document.getElementById('contenedor-productos');

    if (contenedorProductos) {
        contenedorProductos.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-cart')) {
                e.preventDefault(); 
                
                const boton = e.target;
                
                // Extraemos la información del HTML
                const infoProducto = {
                    id: boton.closest('.product-item-card') ? boton.closest('.product-item-card').getAttribute('data-name').replace(/\s+/g, '-') : 'producto', 
                    nombre: boton.getAttribute('data-name') || 'Escultura',
                    // 🔥 MODIFICACIÓN DE RAÍZ: Ignoramos el HTML y forzamos el precio en 0 temporalmente
                    precio: 0.00, 
                    cantidad: 1
                };

                // Añadir al carrito
                agregarAlCarrito(infoProducto);
            }
        });
    }
}

// 3. Función para procesar el producto
function agregarAlCarrito(productoNuevo) {
    // Verificar si el producto ya existe en el carrito
    const existe = carrito.some(producto => producto.nombre === productoNuevo.nombre);
    
    if (existe) {
        carrito = carrito.map(producto => {
            if (producto.nombre === productoNuevo.nombre) {
                producto.cantidad++;
                return producto; 
            } else {
                return producto; 
            }
        });
    } else {
        carrito.push(productoNuevo);
    }

    console.log('Contenido del carrito actual:', carrito); 
    
    // Lanzar la alerta visual de Bootstrap
    mostrarNotificacion(productoNuevo.nombre);
    
    // Actualizar la interfaz en pantalla (artículos y precios)
    actualizarInterfaz();
}

// 4. Función para actualizar los números y la pasarela en la misma pantalla
function actualizarInterfaz() {
    let totalPrecio = 0;
    let totalProductos = 0;
    const contenedorMiniLista = document.getElementById('lista-checkout-mini');

    // Limpiar el contenedor del panel lateral si existe para renderizar al momento
    if (contenedorMiniLista) contenedorMiniLista.innerHTML = '';

    // Calcular totales recorriendo el carrito y llenar el desglose de la pasarela
    carrito.forEach(producto => {
        totalPrecio += producto.precio * producto.cantidad;
        totalProductos += producto.cantidad;

        if (contenedorMiniLista) {
            const itemHTML = `
                <div class="d-flex justify-content-between align-items-center bg-black bg-opacity-25 p-2 rounded-3 mb-2 border border-secondary border-opacity-25">
                    <div class="small">
                        <span class="fw-bold text-light">${producto.nombre}</span>
                        <br><span class="text-secondary" style="font-size:0.8rem;">Cant: ${producto.cantidad}</span>
                    </div>
                    <span class="small fw-semibold text-warning">$${(producto.precio * producto.cantidad).toFixed(2)}</span>
                </div>`;
            contenedorMiniLista.insertAdjacentHTML('beforeend', itemHTML);
        }
    });

    // Mensaje por si vacían el carrito
    if (totalProductos === 0 && contenedorMiniLista) {
        contenedorMiniLista.innerHTML = `<div class="text-center text-secondary py-3 small">Tu bolsa está vacía.</div>`;
    }

    // 1. Actualizar el contador amarillo en la Navbar superior (Bolsa)
    const contadorContador = document.getElementById('cart-count');
    if (contadorContador) {
        contadorContador.textContent = totalProductos;
    }
    
    // 2. Actualizar el total de la Pasarela de Pago Lateral
    const totalPasarela = document.getElementById('checkout-total-express');
    if (totalPasarela) {
        totalPasarela.textContent = `$${totalPrecio.toFixed(2)} USD`;
    }

    // 3. Controlar el comportamiento del Botón Flotante de abajo
    const barraFlotante = document.getElementById('btn-flotante-compra');
    const totalFlotante = document.getElementById('total-flotante');

    if (barraFlotante && totalFlotante) {
        totalFlotante.textContent = `$${totalPrecio.toFixed(2)} USD`;
        
        if (totalProductos > 0) {
            barraFlotante.classList.remove('d-none');
        } else {
            barraFlotante.classList.add('d-none');
        }
    }
}

// Alerta flotante de Bootstrap
function mostrarNotificacion(nombreProducto) {
    const alerta = document.createElement('div');
    alerta.className = 'position-fixed bottom-0 end-0 m-4 alert alert-success border-0 shadow-lg text-white d-flex align-items-center gap-2';
    alerta.style.zIndex = '9999';
    alerta.style.background = 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)';
    alerta.innerHTML = `
        <i class="bi bi-check-circle-fill"></i>
        <span><strong>${nombreProducto}</strong> añadido al carrito.</span>
    `;

    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.remove();
    }, 2500);
}