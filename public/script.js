window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 100) {
        navbar.classList.add("scrolled");
        navbar.classList.remove("transparent");
    } else {
        navbar.classList.add("transparent");
        navbar.classList.remove("scrolled");
    }
});

// HERO SECTION BACKGROUND SLIDE 
(function () {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  const heroImages = [
    'assets/pexels-asadphoto-1320679.jpg',
    'assets/pexels-cottonbro-5371559.jpg',
    'assets/pexels-cottonbro-6466302.jpg',
    'assets/pexels-heyho-5997993.jpg',
    'assets/pexels-heyho-7598114.jpg',
    'assets/pexels-heyho-8082224.jpg',
    'assets/pexels-islandhopper-x-339537771-18320915.jpg',
    'assets/pexels-mikhail-nilov-8356067.jpg',
    'assets/pexels-pixabay-271815.jpg',
    'assets/pexels-viniciusvieirafotografia-30615185.jpg'
  ];

  const INTERVAL = 8000;   
  const DURATION = 1500;   

  hero.style.position = hero.style.position || 'relative';
  hero.style.overflow = 'hidden';

  const layerA = document.createElement('div');
  const layerB = document.createElement('div');

  [layerA, layerB].forEach(layer => {
    layer.style.position = 'absolute';
    layer.style.top = 0;
    layer.style.left = 0;
    layer.style.width = '100%';
    layer.style.height = '100%';
    layer.style.backgroundSize = 'cover';
    layer.style.backgroundPosition = 'center';
    layer.style.backgroundRepeat = 'no-repeat';
    layer.style.transition = `opacity ${DURATION}ms ease-in-out`;
    layer.style.willChange = 'opacity, background-image';
    layer.style.pointerEvents = 'none';
  });

  layerA.style.opacity = '1';
  layerB.style.opacity = '0';

  hero.prepend(layerB);
  hero.prepend(layerA);

  function preload(imgs) {
    imgs.forEach(src => {
      const i = new Image();
      i.src = src;
    });
  }
  preload(heroImages);

  let current = 0;
  let showingA = true;

  layerA.style.backgroundImage = `url('${heroImages[current]}')`;
  current = (current + 1) % heroImages.length;
  layerB.style.backgroundImage = `url('${heroImages[current]}')`;

  setInterval(() => {

    if (showingA) {
      layerB.style.opacity = '1';
      layerA.style.opacity = '0';

      setTimeout(() => {
        current = (current + 1) % heroImages.length;
        layerA.style.backgroundImage = `url('${heroImages[current]}')`;
        showingA = false;
      }, DURATION);
    } else {
      layerA.style.opacity = '1';
      layerB.style.opacity = '0';
      setTimeout(() => {
        current = (current + 1) % heroImages.length;
        layerB.style.backgroundImage = `url('${heroImages[current]}')`;
        showingA = true;
      }, DURATION);
    }
  }, INTERVAL);
})();



// Media Slider Functionality
const slides = document.querySelectorAll(".media-slider .slide");
let currentSlide = 0;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    slides[index].classList.add("active");
}

// Auto-slide every 5 seconds
setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}, 5000);

// Amount calculateNightsAndTotal
document.addEventListener('DOMContentLoaded', function () {
    // Calculate nights and total amount when dates change
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    const roomTypeRadios = document.querySelectorAll('input[name="roomType"]');
    const bookingForm = document.getElementById('bookingForm');
    const bookingSummary = document.getElementById('bookingSummary');

    // Set minimum date for check-in (today)
    const today = new Date().toISOString().split('T')[0];
    checkInInput.min = today;

    // Update check-out min date when check-in changes
    checkInInput.addEventListener('change', function () {
        checkOutInput.min = this.value;
        calculateNightsAndTotal();
    });

    checkOutInput.addEventListener('change', calculateNightsAndTotal);

    // Update total when room type changes
    roomTypeRadios.forEach(radio => {
        radio.addEventListener('change', calculateNightsAndTotal);
    });

    // Form submission
    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        showBookingSummary();
    });

    function calculateNightsAndTotal() {
        const checkInDate = new Date(checkInInput.value);
        const checkOutDate = new Date(checkOutInput.value);

        if (checkInInput.value && checkOutInput.value && checkOutDate > checkInDate) {
            const timeDiff = checkOutDate - checkInDate;
            const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            // Get selected room type price
            let roomPrice = 8000; // Default to Deluxe Room
            const selectedRoomType = document.querySelector('input[name="roomType"]:checked').value;

            if (selectedRoomType === 'family') {
                roomPrice = 12000;
            } else if (selectedRoomType === 'villa') {
                roomPrice = 25000;
            }

            const totalAmount = nights * roomPrice;

            // Display nights and total (you can show this somewhere in the form if needed)
            console.log(`Nights: ${nights}, Total: ₹${totalAmount}`);

            return { nights, totalAmount };
        }
        return { nights: 0, totalAmount: 0 };
    }

    function showBookingSummary() {
        const { nights, totalAmount } = calculateNightsAndTotal();

        // Populate summary
        document.getElementById('summaryName').textContent = document.getElementById('fullName').value;
        document.getElementById('summaryCheckIn').textContent = document.getElementById('checkIn').value;
        document.getElementById('summaryCheckOut').textContent = document.getElementById('checkOut').value;
        document.getElementById('summaryNights').textContent = nights;

        const selectedRoomType = document.querySelector('input[name="roomType"]:checked');
        let roomTypeText = 'Deluxe Room';
        if (selectedRoomType.value === 'family') {
            roomTypeText = 'Family Apartment';
        } else if (selectedRoomType.value === 'villa') {
            roomTypeText = 'Luxury Villa';
        }
        document.getElementById('summaryRoomType').textContent = roomTypeText;

        document.getElementById('summaryAdults').textContent = document.getElementById('adults').value;
        document.getElementById('summaryChildren').textContent = document.getElementById('children').value;
        document.getElementById('summaryBranch').textContent = document.getElementById('branch').options[document.getElementById('branch').selectedIndex].text;
        document.getElementById('summaryTotal').textContent = totalAmount.toLocaleString('en-IN');

        // Show summary
        bookingSummary.classList.remove('d-none');

        // Scroll to summary
        bookingSummary.scrollIntoView({ behavior: 'smooth' });

        // In a real application, you would send this data to the server
        // For now, we'll just log it
        const bookingData = {
            email: document.getElementById('loginEmail').value,
            name: document.getElementById('fullName').value,
            dob: document.getElementById('dob').value,
            aadhar: document.getElementById('aadhar').value,
            checkIn: document.getElementById('checkIn').value,
            checkOut: document.getElementById('checkOut').value,
            adults: document.getElementById('adults').value,
            children: document.getElementById('children').value,
            roomType: selectedRoomType.value,
            branch: document.getElementById('branch').value,
            nights: nights,
            totalAmount: totalAmount
        };

        console.log('Booking Data:', bookingData);

        // Send data to server (simulated)
        sendBookingToServer(bookingData);
    }

    function sendBookingToServer(bookingData) {
        // In a real application, you would use fetch or axios to send data to your Express server
        fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                // You could show a success message to the user here
            })
            .catch((error) => {
                console.error('Error:', error);
                // You could show an error message to the user here
            });
    }
});