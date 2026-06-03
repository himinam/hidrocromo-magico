export let carrito = [];
export let idiomaActual = 'es';

const traducciones = {
    es: {
        tituloPagina: "Hidrocromo Mágico",
        titulo: "HIDROCROMO MÁGICO",
        inicio: "Inicio",
        esculturas: "Esculturas",
        galeria: "Galería",
        heroTitulo: "El Arte del Agua y el Color",
        heroSubtitulo: "Colecciones exclusivas de esculturas hidrocromáticas que cobran vida con el agua.",
        btnVerColeccion: "Ver Colección",
        seccionProductos: "Nuestras Esculturas",
        btnAgregar: "Añadir al Carrito",
        total: "Total a pagar:",
        vacio: "Tu bolsa está vacía.",
        btnEliminar: "Eliminar",
        alertaAgregar: "añadido al carrito.",
        alertaVaciar: "Carrito vaciado con éxito.",
        btnPagar: "Proceder al Pago"
    },
    en: {
        tituloPagina: "Magic Hydrochrome",
        titulo: "MAGIC HYDROCHROME",
        inicio: "Home",
        esculturas: "Sculptures",
        galeria: "Gallery",
        heroTitulo: "The Art of Water and Color",
        heroSubtitulo: "Exclusive collections of hydrochromic sculptures that come to life with water.",
        btnVerColeccion: "View Collection",
        seccionProductos: "Our Sculptures",
        btnAgregar: "Add to Cart",
        total: "Total to pay:",
        vacio: "Your bag is empty.",
        btnEliminar: "Remove",
        alertaAgregar: "added to cart.",
        alertaVaciar: "Cart cleared successfully.",
        btnPagar: "Proceed to Checkout"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrito();
    document.getElementById('btn-es')?.addEventListener('click', () => cambiarIdioma('es'));
    document.getElementById('btn-en')?.addEventListener('click', () => cambiarIdioma('en'));
});

function inicializarCarrito() {
    window.carrito = []; // Forzamos inicialización limpia en el navegador
    
    const contenedorProductos = document.getElementById('contenedor-productos');
    if (contenedorProductos) {
        contenedorProductos.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-cart')) return;
            e.preventDefault();

            const boton = e.target;
            const card  = boton.closest('.product-item-card');
            const nombreOriginal = boton.getAttribute('data-name') || 'Escultura';

            agregarAlCarrito({
                id: card && card.getAttribute('data-name') ? card.getAttribute('data-name').replace(/\s+/g, '-') : 'producto',
                nombre: nombreOriginal,
                precio: card ? parseFloat(card.getAttribute('data-price')) || 0 : 0,
                cantidad: 1
            });
        });
    }

    const miniLista = document.getElementById('lista-checkout-mini');
    if (miniLista) {
        miniLista.addEventListener('click', (e) => {
            const botonEliminar = e.target.closest('.btn-eliminar-item');
            if (botonEliminar) {
                const nombreProducto = botonEliminar.getAttribute('data-producto');
                window.carrito = window.carrito.filter(p => p.nombre !== nombreProducto);
                carrito = window.carrito;
                actualizarInterfaz();
            }
        });
    }

    const offcanvas = document.getElementById('checkoutExpressPanel');
    if (offcanvas) {
        offcanvas.addEventListener('shown.bs.offcanvas', () => {
            if (typeof window.ppRenderBoton === 'function') {
                window.ppRenderBoton();
            }
        });
    }
}

function agregarAlCarrito(productoNuevo) {
    const existe = window.carrito.some(p => p.nombre === productoNuevo.nombre);
    if (existe) {
        window.carrito = window.carrito.map(p => {
            if (p.nombre === productoNuevo.nombre) p.cantidad++;
            return p;
        });
    } else {
        window.carrito.push(productoNuevo);
    }
    carrito = window.carrito;
    mostrarNotificacion(productoNuevo.nombre);
    actualizarInterfaz();
}

export function vaciarCarrito() {
    window.carrito = [];
    carrito = [];
    actualizarInterfaz();
}

export function actualizarInterfaz() {
    let totalPrecio   = 0;
    let totalProductos = 0;
    
    const miniLista = document.getElementById('lista-checkout-mini');
    if (miniLista) miniLista.innerHTML = '';

    window.carrito.forEach(p => {
        totalPrecio    += p.precio * p.cantidad;
        totalProductos += p.cantidad;

        let nombreTraducido = p.nombre;
        if (idiomaActual === 'en') {
            if (p.nombre === "Hidrocromo Mágico") nombreTraducido = "Magic Hydrochrome";
            if (p.nombre === "Escultura Cascada") nombreTraducido = "Waterfall Sculpture";
        }

        if (miniLista) {
            miniLista.insertAdjacentHTML('beforeend', `
                <div class="d-flex justify-content-between align-items-center bg-black bg-opacity-25 p-2 rounded-3 mb-2 border border-secondary border-opacity-25">
                    <div class="small">
                        <span class="fw-bold text-light">${nombreTraducido}</span>
                        <br><span class="text-secondary" style="font-size:0.8rem;">${idiomaActual === 'es' ? 'Cant' : 'Qty'}: ${p.cantidad}</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span class="small fw-semibold text-warning">$${(p.precio * p.cantidad).toFixed(2)}</span>
                        <button class="btn btn-sm btn-outline-danger border-0 p-1 btn-eliminar-item" data-producto="${p.nombre}" style="background: transparent;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#dc3545" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                            </svg>
                        </button>
                    </div>
                </div>`);
        }
    });

    if (totalProductos === 0 && miniLista) {
        miniLista.innerHTML = `<div class="text-center text-secondary py-3 small">${traducciones[idiomaActual].vacio}</div>`;
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

    // Le notificamos a PayPal que actualice su render de botones con el nuevo precio total
    if (typeof window.ppRenderBoton === 'function' && document.getElementById('paypal-button-container')?.innerHTML !== "") {
        window.ppRenderBoton();
    }
}

function mostrarNotificacion(nombre) {
    const el = document.createElement('div');
    el.className = 'position-fixed bottom-0 end-0 m-4 alert alert-success border-0 shadow-lg text-white d-flex align-items-center gap-2';
    el.style.cssText = 'z-index:9999;background:linear-gradient(135deg,#28a745,#1e7e34);';
    const textoAlerta = traducciones[idiomaActual].alertaAgregar;
    el.innerHTML = `<i class="bi bi-check-circle-fill"></i><span><strong>${nombre}</strong> ${textoAlerta}</span>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
}

export function cambiarIdioma(idioma) {
    idiomaActual = idioma;
    document.querySelectorAll('[data-key]').forEach(elemento => {
        const llave = elemento.getAttribute('data-key');
        if (traducciones[idioma]?.[llave]) elemento.textContent = traducciones[idioma][llave];
    });
    document.getElementById('btn-es')?.classList.toggle('active', idioma === 'es');
    document.getElementById('btn-en')?.classList.toggle('active', idioma === 'en');
    actualizarInterfaz(); 
}

// Inicialización de filtros de productos (permanece intacto)
document.addEventListener('DOMContentLoaded', () => {
    const translations = {
        es: { "price-title": "PRECIO", "category-title": "Categoría", "cat-all": "Todas las piezas", "cat-animals": "Animales Reales", "cat-modern": "Arte Moderno", "cat-premium": "Premium / Colección", "effect-title": "Efecto Hidrocromo", "eff-pure": "Cromo Espejo Puro", "eff-gold": "Baño Dorado Metálico", "eff-spectrum": "Efecto Tornasol / Espectro", "search-title": "Buscar por Nombre", "main-title": "Esculturas Destacadas", "add-btn": "Agregar al carrito", "placeholder": "Ej: León...", "showing": "Mostrando", "products": "productos", "product": "producto" },
        en: { "price-title": "PRICE", "category-title": "Category", "cat-all": "All pieces", "cat-animals": "Real Animals", "cat-modern": "Modern Art", "cat-premium": "Premium / Collection", "effect-title": "Hydrochrome Effect", "eff-pure": "Pure Mirror Chrome", "eff-gold": "Metallic Gold Plating", "eff-spectrum": "Iridescent / Spectrum Effect", "search-title": "Search by Name", "main-title": "Featured Sculptures", "add-btn": "Add to Cart", "placeholder": "Ex: Lion...", "showing": "Showing", "products": "products", "product": "product" }
    };

    const languageSelect = document.getElementById('languageSelect');
    const priceMinInput = document.getElementById('priceMin');
    const priceMaxInput = document.getElementById('priceMax');
    const categoryRadios = document.getElementsByName('catRadio');
    const effectCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    const searchInput = document.getElementById('searchProduct');
    const productCards = document.querySelectorAll('.product-item-card');
    const itemsFoundCount = document.getElementById('items-found-count');

    function updateLanguage() {
        if (!languageSelect) return;
        const lang = languageSelect.value;
        document.querySelectorAll('[data-translate]').forEach(elem => {
            const key = elem.getAttribute('data-translate');
            if (translations[lang][key]) elem.textContent = translations[lang][key];
        });
        if (searchInput) searchInput.placeholder = translations[lang]['placeholder'];
        productCards.forEach(card => {
            const titleElem = card.querySelector('.product-title');
            const descElem = card.querySelector('p');
            const priceElem = card.querySelector('h5');
            const price = card.getAttribute('data-price') || "0"; 
            if (titleElem) titleElem.textContent = titleElem.getAttribute(`data-${lang}`);
            if (descElem) descElem.textContent = descElem.getAttribute(`data-${lang}`);
            if (priceElem) priceElem.textContent = `$${parseFloat(price).toFixed(2)} USD`; 
        });
        filterProducts();
    }

    function filterProducts() {
        if (!languageSelect) return;
        const lang = languageSelect.value;
        const minPrice = priceMinInput ? (parseFloat(priceMinInput.value) || 0) : 0;
        const maxPrice = priceMaxInput ? (parseFloat(priceMaxInput.value) || Infinity) : Infinity;
        const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let selectedCategory = 'all';
        for (const radio of categoryRadios) { if (radio.checked) { selectedCategory = radio.value; break; } }
        const activeEffects = Array.from(effectCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        let visibleCount = 0;

        productCards.forEach(card => {
            const productPrice = parseFloat(card.getAttribute('data-price')) || 0;
            const productCategory = card.getAttribute('data-category');
            const productEffect = card.getAttribute('data-effect');
            const nameEs = (card.getAttribute('data-name-es') || '').toLowerCase();
            const nameEn = (card.getAttribute('data-name-en') || '').toLowerCase();

            const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;
            const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory;
            const matchesEffect = activeEffects.length === 0 || activeEffects.includes(productEffect);
            const matchesSearch = nameEs.includes(searchText) || nameEn.includes(searchText);

            if (matchesPrice && matchesCategory && matchesEffect && matchesSearch) {
                card.style.display = '';
                visibleCount++;
            } else { card.style.display = 'none'; }
        });

        if (itemsFoundCount) {
            const textShowing = translations[lang]['showing'];
            const textProduct = visibleCount === 1 ? translations[lang]['product'] : translations[lang]['products'];
            itemsFoundCount.textContent = `${textShowing} ${visibleCount} ${textProduct}`;
        }
    }

    languageSelect?.addEventListener('change', updateLanguage);
    priceMinInput?.addEventListener('input', filterProducts);
    priceMaxInput?.addEventListener('input', filterProducts);
    searchInput?.addEventListener('input', filterProducts);
    categoryRadios.forEach(radio => radio.addEventListener('change', filterProducts));
    effectCheckboxes.forEach(checkbox => checkbox.addEventListener('change', filterProducts));
    updateLanguage();
});

// Exponer estados reactivos a la ventana global
window.vaciarCarrito = vaciarCarrito;
window.actualizarInterfaz = actualizarInterfaz;