// Variables globales
let currentSlide = 0;
let slides = [];
let carouselInterval;
let backgroundMusic = null;
let isMusicPlaying = false;
let musicInitialized = false;

// Función para inicializar la aplicación
function init() {
    const welcomeBtn = document.getElementById('welcomeBtn');
    const welcomePage = document.getElementById('welcomePage');
    const mainPage = document.getElementById('mainPage');
    
    if (!welcomeBtn || !welcomePage || !mainPage) {
        console.error('Error: No se pudieron encontrar los elementos necesarios');
        return;
    }
    
    // Event listener para el botón de bienvenida
    welcomeBtn.addEventListener('click', function() {
        console.log('Botón clickeado');
        // INTENTAR REPRODUCIR MÚSICA INMEDIATAMENTE AL HACER CLIC
        tryPlayMusic();
        showMainPage(welcomePage, mainPage);
    });
    
    slides = document.querySelectorAll('.carousel-slide');
    console.log('Slides encontradas:', slides.length);
}

// Función para inicializar la música
function initMusic() {
    // Crear elemento de audio si no existe
    if (!backgroundMusic) {
        backgroundMusic = document.createElement('audio');
        backgroundMusic.id = 'backgroundMusic';
        backgroundMusic.preload = 'auto';
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.4;
        
        // Intentar diferentes formatos de audio
        const audioFormats = [
            { src: 'music/cancion.mp3', type: 'audio/mpeg' },
            { src: 'music/cancion.ogg', type: 'audio/ogg' },
            { src: 'music/cancion.wav', type: 'audio/wav' }
        ];
        
        // Agregar fuentes de audio
        audioFormats.forEach(format => {
            const source = document.createElement('source');
            source.src = format.src;
            source.type = format.type;
            backgroundMusic.appendChild(source);
        });
        
        document.body.appendChild(backgroundMusic);
    }
    
    // Event listeners para el audio
    backgroundMusic.addEventListener('loadeddata', function() {
        console.log('🎵 Música cargada correctamente');
        musicInitialized = true;
    });
    
    backgroundMusic.addEventListener('error', function(e) {
        console.error('❌ Error cargando la música:', e);
        console.log('Verifica que el archivo music/cancion.mp3 existe');
    });
    
    backgroundMusic.addEventListener('play', function() {
        isMusicPlaying = true;
        console.log('🎵 Música reproduciéndose');
        updateMusicButton();
    });
    
    backgroundMusic.addEventListener('pause', function() {
        isMusicPlaying = false;
        console.log('⏸️ Música pausada');
        updateMusicButton();
    });
    
    backgroundMusic.addEventListener('ended', function() {
        // Reiniciar la música cuando termine (aunque loop=true debería evitar esto)
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(console.error);
    });
}

// Función para intentar reproducir música
function tryPlayMusic() {
    if (!backgroundMusic) {
        initMusic();
        // Esperar un poco para que se cargue
        setTimeout(() => tryPlayMusic(), 500);
        return;
    }
    
    if (!musicInitialized) {
        console.log('Esperando que se cargue la música...');
        setTimeout(() => tryPlayMusic(), 500);
        return;
    }
    
    // Intentar reproducir
    const playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('✅ Música iniciada exitosamente');
                isMusicPlaying = true;
                // Fade in suave
                backgroundMusic.volume = 0;
                fadeInMusic();
            })
            .catch(error => {
                console.log('⚠️ Reproducción automática bloqueada:', error.message);
                console.log('💡 Se mostrará botón de control para que el usuario inicie manualmente');
                showMusicControlButton();
            });
    }
}

// Función para hacer fade in de la música
function fadeInMusic() {
    let volume = 0;
    const targetVolume = 0.4;
    const fadeInterval = setInterval(() => {
        if (volume < targetVolume) {
            volume += 0.02;
            backgroundMusic.volume = Math.min(volume, targetVolume);
        } else {
            clearInterval(fadeInterval);
        }
    }, 100);
}

// Función para crear y mostrar el botón de control de música
function showMusicControlButton() {
    // Evitar crear múltiples botones
    if (document.getElementById('musicToggle')) {
        return;
    }
    
    const musicButton = document.createElement('button');
    musicButton.id = 'musicToggle';
    musicButton.className = 'music-control-btn';
    musicButton.innerHTML = '🎵 Reproducir Música';
    musicButton.onclick = toggleMusic;
    
    // Agregar estilos inline por si no están en CSS
    Object.assign(musicButton.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'linear-gradient(45deg, #ff6b9d, #c44569)',
        color: 'white',
        border: 'none',
        padding: '15px 20px',
        fontSize: '1rem',
        borderRadius: '50px',
        cursor: 'pointer',
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        zIndex: '1000',
        fontFamily: 'Georgia, serif',
        backdropFilter: 'blur(10px)',
        animation: 'slideInFromRight 1s ease-out'
    });
    
    document.body.appendChild(musicButton);
    
    // Animación de entrada
    setTimeout(() => {
        musicButton.style.transform = 'translateX(0)';
        musicButton.style.opacity = '1';
    }, 100);
}

// Función para actualizar el botón de música
function updateMusicButton() {
    const musicButton = document.getElementById('musicToggle');
    if (musicButton) {
        musicButton.innerHTML = isMusicPlaying ? '🔇 Pausar Música' : '🎵 Reproducir Música';
    }
}

// Función para reproducir/pausar música
function toggleMusic() {
    if (!backgroundMusic) {
        initMusic();
        setTimeout(() => toggleMusic(), 500);
        return;
    }
    
    if (isMusicPlaying) {
        backgroundMusic.pause();
    } else {
        backgroundMusic.play()
            .then(() => {
                console.log('🎵 Música iniciada por el usuario');
                if (backgroundMusic.volume === 0) {
                    fadeInMusic();
                }
            })
            .catch(error => {
                console.error('Error al reproducir música:', error);
            });
    }
}

// Función para mostrar la página principal con transición
function showMainPage(welcomePage, mainPage) {
    console.log('Mostrando página principal');
    
    welcomePage.style.transform = 'translateX(-100%)';
    welcomePage.style.transition = 'transform 0.8s ease-in-out';
    
    setTimeout(() => {
        welcomePage.style.display = 'none';
        mainPage.style.display = 'block';
        
        startCarousel();
        createFloatingHearts();
        
        // Iniciar animación del poema
        setTimeout(() => {
            animatePoem();
            animatePoemLinesSequentially();
        }, 1000);
        
        // Intentar reproducir música después de mostrar la página
        setTimeout(() => {
            if (!isMusicPlaying) {
                tryPlayMusic();
            }
        }, 1500);
        
        console.log('Página principal cargada correctamente');
    }, 800);
}

// Funciones adicionales (mantener las originales)
function startCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
    
    showSlide(currentSlide);
    
    carouselInterval = setInterval(() => {
        nextSlide();
    }, getCarouselSpeed());
}

function showSlide(n) {
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    if (slides[n]) {
        slides[n].classList.add('active');
    }
}

function nextSlide() {
    currentSlide++;
    
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    
    showSlide(currentSlide);
}

function createFloatingHearts() {
    const heartsContainer = document.querySelector('.floating-hearts');
    if (!heartsContainer) return;
    
    const heartEmojis = ['❤️', '💕', '💖', '💗', '💝', '🌹'];
    
    setInterval(() => {
        if (document.querySelectorAll('.floating-hearts .dynamic-heart').length < 3) {
            const heart = document.createElement('span');
            heart.className = 'heart dynamic-heart';
            heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.top = Math.random() * 100 + '%';
            heart.style.animationDuration = (2 + Math.random() * 3) + 's';
            heart.style.animationDelay = Math.random() * 2 + 's';
            
            heartsContainer.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 6000);
        }
    }, 2000);
}

function createSparkles() {
    const welcomePage = document.querySelector('.welcome-page');
    if (!welcomePage) return;
    
    setInterval(() => {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'absolute';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = 'white';
        sparkle.style.borderRadius = '50%';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animation = 'sparkle 2s ease-out forwards';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1';
        
        welcomePage.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 2000);
    }, 500);
}

function animatePoem() {
    const poemElements = document.querySelectorAll('.typewriter-poem');
    
    poemElements.forEach((element, index) => {
        const delay = index === 0 ? 2000 : 2000 + (index * 2000);
        
        setTimeout(() => {
            element.classList.add('show');
            element.style.animationDelay = '0s';
        }, delay);
    });
}

function animatePoemLinesSequentially() {
    const verses = document.querySelectorAll('.poem-verse');
    
    verses.forEach((verse, verseIndex) => {
        const originalHTML = verse.innerHTML;
        const lines = originalHTML.split('<br>');
        
        verse.innerHTML = '';
        verse.style.opacity = '0';
        
        const lineSpans = lines.map(line => {
            const span = document.createElement('span');
            span.innerHTML = line;
            span.style.opacity = '0';
            span.style.transform = 'translateY(10px)';
            span.style.display = 'block';
            span.style.transition = 'all 0.8s ease-out';
            return span;
        });
        
        lineSpans.forEach(span => verse.appendChild(span));
        
        const verseDelay = verseIndex === 0 ? 3000 : 3000 + (verseIndex * 3000);
        
        setTimeout(() => {
            verse.style.opacity = '1';
            
            lineSpans.forEach((span, lineIndex) => {
                setTimeout(() => {
                    span.style.opacity = '1';
                    span.style.transform = 'translateY(0)';
                }, lineIndex * 800);
            });
        }, verseDelay);
    });
}

function isMobile() {
    return window.innerWidth <= 768;
}

function getCarouselSpeed() {
    return isMobile() ? 1500 : 1000;
}

// Event listeners para controles del carrusel
document.addEventListener('keydown', function(e) {
    if (document.getElementById('mainPage').style.display === 'block') {
        if (e.key === 'ArrowRight') {
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            currentSlide--;
            if (currentSlide < 0) {
                currentSlide = slides.length - 1;
            }
            showSlide(currentSlide);
        } else if (e.key === ' ') {
            e.preventDefault();
            if (carouselInterval) {
                clearInterval(carouselInterval);
                carouselInterval = null;
            } else {
                startCarousel();
            }
        } else if (e.key === 'm' || e.key === 'M') {
            // Tecla M para controlar música
            toggleMusic();
        }
    }
});

// Soporte táctil
let touchStartX = 0;
let touchEndX = 0;

function handleGesture() {
    if (touchEndX < touchStartX - 50) {
        nextSlide();
    }
    if (touchEndX > touchStartX + 50) {
        currentSlide--;
        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }
        showSlide(currentSlide);
    }
}

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
});

// Pausar música si la pestaña se oculta (opcional)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isMusicPlaying) {
        // Opcionalmente pausar cuando la pestaña no es visible
        // backgroundMusic.pause();
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando...');
    
    init();
    initMusic(); // Inicializar música inmediatamente
    createSparkles();
    
    console.log('🎵 Sistema de música inicializado');
    console.log('💡 La música se reproducirá al hacer clic en el botón de bienvenida');
    console.log('🎮 Controles disponibles:');
    console.log('- Flecha derecha: siguiente foto');
    console.log('- Flecha izquierda: foto anterior');
    console.log('- Espacebar: pausar/reanudar carrusel');
    console.log('- Tecla M: reproducir/pausar música');
    console.log('');
    console.log('📁 Estructura necesaria:');
    console.log('   📄 index.html');
    console.log('   📄 styles.css');
    console.log('   📄 script.js');
    console.log('   📁 music/');
    console.log('   └── 🎵 cancion.mp3');
    console.log('   📁 IMAGES/');
    console.log('   └── 🖼️ FOTO1.jpg, FOTO2.jpg, etc.');
});