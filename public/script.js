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
    checkInInput.addEventListener('change', function() {
        checkOutInput.min = this.value;
        calculateNightsAndTotal();
    });
    
    checkOutInput.addEventListener('change', calculateNightsAndTotal);
    
    // Update total when room type changes
    roomTypeRadios.forEach(radio => {
        radio.addEventListener('change', calculateNightsAndTotal);
    });
    
    // Form submission
    bookingForm.addEventListener('submit', function(e) {
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