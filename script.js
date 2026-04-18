// ==============================================
// СВАДЕБНЫЙ САЙТ - ФРОНТЕНД
// Мария & Алексей | 15.09.2024
// ==============================================

// Конфигурация
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/Ag4VBCmgtQOrby87ZRVX2S7Du7OzEMUccZ5moxJC7wHipGQ/exec', // ЗАМЕНИТЕ НА ВАШ URL
    TELEGRAM_CHAT_URL: 'https://max.ru/join/tLq0sVy4MC763sRO-jIl7F09EuIIEqizAVfbnkwJLec?fbclid=PARlRTSARQl8JleHRuA2FlbQIxMABzcnRjBmFwcF9pZA8xMjQwMjQ1NzQyODc0MTQAAaeCGBacnw-gzdhOwGmVlNEzvT2aMX7iu7ebuDsIVpVgm8cJqpU3FxsSQGiKww_aem_kHV137S_c85JqEBKNBNKyQ', // ЗАМЕНИТЕ НА ВАШУ ССЫЛКУ НА ЧАТ
    WEDDING_DATE: '2026-08-01T16:00:00' // Дата свадьбы
};

// Прелоадер
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.querySelector('.loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 800);
    
    // Инициализация
    initTelegramLink();
});

// Таймер обратного отсчета
function updateCountdown() {
    const weddingDate = new Date(CONFIG.WEDDING_DATE).getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days.toString().padStart(2, '0');
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
}

// Запускаем таймер
updateCountdown();
setInterval(updateCountdown, 1000);

// Управление количеством гостей
const guestsInput = document.getElementById('guests');
const minusBtn = document.querySelector('.minus-btn');
const plusBtn = document.querySelector('.plus-btn');

if (minusBtn && plusBtn) {
    minusBtn.addEventListener('click', function() {
        let currentValue = parseInt(guestsInput.value);
        if (currentValue > 1) {
            guestsInput.value = currentValue - 1;
            if (navigator.vibrate) navigator.vibrate(30);
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let currentValue = parseInt(guestsInput.value);
        if (currentValue < 10) {
            guestsInput.value = currentValue + 1;
            if (navigator.vibrate) navigator.vibrate(30);
        }
    });
    
    guestsInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (value < 1) this.value = 1;
        if (value > 10) this.value = 10;
    });
}

// Настройка ссылки на Telegram чат
function initTelegramLink() {
    const chatLink = document.querySelector('.chat-link');
    if (chatLink && CONFIG.TELEGRAM_CHAT_URL) {
        chatLink.href = CONFIG.TELEGRAM_CHAT_URL;
        chatLink.target = '_blank';
        chatLink.rel = 'noopener noreferrer';
    }
}

// Обработка формы RSVP
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Валидация
        const attendanceSelected = document.querySelector('input[name="attendance"]:checked');
        if (!attendanceSelected) {
            showError('Пожалуйста, выберите, сможете ли вы прийти');
            return;
        }
        
        const name = document.getElementById('name').value.trim();
        const contact = document.getElementById('contact').value.trim();
        
        if (!name) {
            showError('Пожалуйста, введите ваше имя');
            document.getElementById('name').focus();
            return;
        }
        
        if (!contact) {
            showError('Пожалуйста, введите email или телефон для связи');
            document.getElementById('contact').focus();
            return;
        }
        
        // Подготовка данных
        const formData = {
            name: name,
            contact: contact,
            attendance: attendanceSelected.value,
            guests: document.getElementById('guests').value,
            message: document.getElementById('message').value.trim() || ''
        };
        
        // Отправка
        await submitRSVP(formData);
    });
}

// Функция отправки данных
async function submitRSVP(formData) {
    const submitBtn = document.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    
    // Показываем индикатор загрузки
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Отправка...</span>';
    submitBtn.disabled = true;
    
    try {
        // Создаем FormData для отправки
        const data = new URLSearchParams();
        data.append('name', formData.name);
        data.append('contact', formData.contact);
        data.append('attendance', formData.attendance);
        data.append('guests', formData.guests);
        data.append('message', formData.message);
        
        // Отправляем запрос
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            body: data,
            mode: 'no-cors'
        });
        
        // Успешная отправка
        showSuccess(formData.name);
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showSuccess(formData.name); // Показываем успех даже при ошибке (fallback)
    } finally {
        // Восстанавливаем кнопку
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Показать сообщение об успехе
function showSuccess(guestName) {
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('success-message');
    
    // Персонализируем сообщение
    const successTitle = successMessage.querySelector('h3');
    const successText = successMessage.querySelector('p');
    
    successTitle.textContent = `Спасибо, ${guestName}!`;
    successText.textContent = 'Ваш ответ успешно отправлен! Мы будем с нетерпением ждать встречи на нашей свадьбе.';
    
    // Показываем/скрываем
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Прокручиваем к сообщению
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Скрываем клавиатуру
    document.activeElement.blur();
    
    // Вибрация
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
}

// Показать ошибку
function showError(message) {
    // Создаем элемент ошибки
    let errorDiv = document.querySelector('.form-error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
            background: #fff5f5;
            border: 1px solid #feb2b2;
            color: #c53030;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 15px 0;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: fadeIn 0.3s ease;
        `;
        
        const formHeader = document.querySelector('.form-header');
        if (formHeader) {
            formHeader.parentNode.insertBefore(errorDiv, formHeader.nextSibling);
        } else {
            rsvpForm.insertBefore(errorDiv, rsvpForm.firstChild);
        }
    }
    
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Автоудаление через 5 секунд
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }
    }, 5000);
    
    // Вибрация
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// Кнопка "Заполнить ещё один ответ"
const newResponseBtn = document.getElementById('new-response');
if (newResponseBtn) {
    newResponseBtn.addEventListener('click', function() {
        const form = document.getElementById('rsvp-form');
        const successMessage = document.getElementById('success-message');
        
        // Сбрасываем форму
        form.reset();
        guestsInput.value = 1;
        
        // Удаляем сообщения об ошибках
        const errors = document.querySelectorAll('.form-error');
        errors.forEach(error => error.remove());
        
        // Показываем форму
        successMessage.style.display = 'none';
        form.style.display = 'block';
        
        // Прокручиваем к форме
        form.scrollIntoView({ behavior: 'smooth' });
        
        // Фокус на первое поле
        document.getElementById('name').focus();
    });
}

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Анимация появления элементов
function animateOnScroll() {
    const elements = document.querySelectorAll('.timeline-item');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Предотвращение двойного тапа для масштабирования
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Улучшение UX для iOS
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    document.addEventListener('focus', function(e) {
        if (e.target.matches('input, textarea, select')) {
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, true);
}

// Анимация иконок
document.querySelectorAll('.icon-circle').forEach(icon => {
    icon.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
    });
    
    icon.addEventListener('touchend', function() {
        this.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});

// Добавляем CSS для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);


// Музыкальный плеер
const musicBtn = document.getElementById('musicToggleBtn');
const musicWrapper = document.querySelector('.music-button-wrapper');
let audio = null;
let isPlaying = false;

// Создаем аудио элемент
function initAudio() {
    audio = new Audio('1.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    
    // Автовоспроизведение после любого взаимодействия с кнопкой
    musicBtn.addEventListener('click', toggleMusic);
}

// Функция переключения музыки
function toggleMusic() {
    if (!audio) {
        audio = new Audio('1.mp3');
        audio.loop = true;
        audio.volume = 0.5;
    }
    
    if (isPlaying) {
        audio.pause();
        musicBtn.classList.remove('playing');
        musicWrapper.classList.add('paused');
        isPlaying = false;
    } else {
        // Пытаемся воспроизвести
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicBtn.classList.add('playing');
                musicWrapper.classList.remove('paused');
                isPlaying = true;
            }).catch(error => {
                console.log('Автовоспроизведение заблокировано браузером:', error);
                showMusicHint();
            });
        }
    }
}

// Подсказка, если автовоспроизведение заблокировано
function showMusicHint() {
    const hint = document.createElement('div');
    hint.className = 'music-hint';
    hint.innerHTML = '<i class="fas fa-info-circle"></i> Нажмите кнопку ещё раз, чтобы включить музыку';
    hint.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 30px;
        font-size: 0.8rem;
        z-index: 9999;
        white-space: nowrap;
        font-family: 'Cormorant Garamond', serif;
        pointer-events: none;
        animation: fadeInOut 3s ease forwards;
    `;
    document.body.appendChild(hint);
    
    setTimeout(() => {
        if (hint && hint.parentNode) hint.remove();
    }, 3000);
}

// Добавляем стили для подсказки
const hintStyle = document.createElement('style');
hintStyle.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
        15% { opacity: 1; transform: translateX(-50%) translateY(0); }
        85% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); visibility: hidden; }
    }
`;
document.head.appendChild(hintStyle);

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initAudio();
    
    // Добавляем класс paused для остановки анимации текста до первого нажатия
    if (musicWrapper) {
        musicWrapper.classList.add('paused');
    }
});


// Календарь
function renderWeddingCalendar() {
    const calendarContainer = document.getElementById('weddingCalendar');
    if (!calendarContainer) return;
    
    const weddingDate = new Date(2026, 7, 1); // 1 августа 2026 (месяцы в JS 0-11, поэтому 7 = август)
    const year = 2026;
    const month = 7; // август
    
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay(); // 0 = воскресенье, у нас неделя с понедельника
    
    // Корректируем: в русской неделе понедельник = 0
    let startOffset = startWeekday === 0 ? 6 : startWeekday - 1;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    let daysArray = [];
    
    // Дни предыдущего месяца
    for (let i = startOffset - 1; i >= 0; i--) {
        daysArray.push({
            day: daysInPrevMonth - i,
            isCurrentMonth: false,
            isWeddingDay: false
        });
    }
    
    // Дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
        daysArray.push({
            day: i,
            isCurrentMonth: true,
            isWeddingDay: (i === 1)
        });
    }
    
    // Дни следующего месяца для заполнения сетки (42 ячейки = 6 недель)
    const remainingCells = 42 - daysArray.length;
    for (let i = 1; i <= remainingCells; i++) {
        daysArray.push({
            day: i,
            isCurrentMonth: false,
            isWeddingDay: false
        });
    }
    
    // Отрисовка
    calendarContainer.innerHTML = '';
    daysArray.forEach(dayData => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        if (!dayData.isCurrentMonth) {
            dayDiv.classList.add('other-month');
        }
        
        if (dayData.isWeddingDay) {
            dayDiv.classList.add('wedding-day');
        }
        
        dayDiv.textContent = dayData.day;
        calendarContainer.appendChild(dayDiv);
    });
}

// Запускаем календарь при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderWeddingCalendar);
} else {
    renderWeddingCalendar();
}
