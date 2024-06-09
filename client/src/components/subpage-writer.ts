//// Orders carousel
let orderIndex = 0;
const slides = $('.carousel-item');

const showSlide = (index: number, animate = true) => {
    const carouselInner = $('.carousel-inner');
    const translateX = -index * 100;

    if (animate) {
        carouselInner.css('transition', 'transform 0.5s ease');
    } else {
        carouselInner.css('transition', 'none');
    }

    carouselInner.css('transform', `translateX(${translateX}%)`);
    
    slides.removeClass('active');
    slides.eq(index).addClass('active');

    if (!animate) {
        requestAnimationFrame(() => {
            carouselInner.css('transition', 'transform 0.5s ease');
        });
    }
}

showSlide(orderIndex);

$('.next').on('click', () => {
    orderIndex++;
    if (orderIndex >= slides.length) {
        orderIndex = 0;
        showSlide(slides.length - 1, false); // Snap to last slide
        requestAnimationFrame(() => {
            showSlide(orderIndex);
        });
    } else {
        showSlide(orderIndex);
    }
});

$('.prev').on('click', () => {
    orderIndex--;
    if (orderIndex < 0) {
        orderIndex = slides.length - 1;
        showSlide(0, false); // Snap to first slide
        requestAnimationFrame(() => {
            showSlide(orderIndex);
        });
    } else {
        showSlide(orderIndex);
    }
});
