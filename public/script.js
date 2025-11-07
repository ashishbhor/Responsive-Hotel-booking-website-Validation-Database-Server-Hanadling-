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

// About Media Slider Functionality
const slides = document.querySelectorAll(".media-slider .slide");
let currentSlide = 0;
const video = document.getElementById("heroVideo");
const muteBtn = document.getElementById("muteBtn");
let isAboutVisible = true; // section visibility flag

// ✅ Make sure video is muted initially for autoplay to work
video.muted = true;

// Show slide logic
function showSlide(index) {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[index].classList.add("active");

  const vid = slides[index].querySelector("video");
  if (vid && isAboutVisible) {
    vid.currentTime = 0;
    vid.play().catch(() => {});
  }
}

// Get slide duration
function getSlideDuration(slide) {
  const vid = slide.querySelector("video");
  if (vid) {
    return new Promise(resolve => {
      if (vid.readyState >= 1) {
        resolve(vid.duration * 1000);
      } else {
        vid.addEventListener("loadedmetadata", () => {
          resolve(vid.duration * 1000);
        });
      }
    });
  } else {
    return Promise.resolve(8000); // images = 5s
  }
}

// Main slider loop
async function startSlider() {
  while (true) {
    showSlide(currentSlide);
    const duration = await getSlideDuration(slides[currentSlide]);
    currentSlide = (currentSlide + 1) % slides.length;
    await new Promise(resolve => setTimeout(resolve, duration));
  }
}

// Mute/unmute button
muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? "🔇" : "🔊";
});

// Pause video when not visible
const aboutSection = document.getElementById("about");
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isAboutVisible = true;
        if (slides[currentSlide].querySelector("video")) {
          slides[currentSlide].querySelector("video").play().catch(() => {});
        }
      } else {
        isAboutVisible = false;
        const activeVid = slides[currentSlide].querySelector("video");
        if (activeVid) activeVid.pause();
      }
    });
  },
  { threshold: 0.3 } // plays only when 30% visible
);

observer.observe(aboutSection);

// Start the slider
startSlider();


// Amount calculateNightsAndTotal
/* ============================================================
      VILLA BOOKING FORM - FULLY ISOLATED JAVASCRIPT FILE
   ============================================================ */

// ✅ Villa database
const villas = [
  { id: 1, name: 'Luxury Villa A', rate: 30000, image: 'https://via.placeholder.com/150x100?text=Villa+A' },
  { id: 2, name: 'Cozy Villa B', rate: 25000, image: 'https://via.placeholder.com/150x100?text=Villa+B' },
  { id: 3, name: 'Premium Villa C', rate: 35000, image: 'https://via.placeholder.com/150x100?text=Villa+C' },
];

// ✅ State object
const state = {
  currentStep: 0,
  userType: null,
  lastBookingID:null,

  formData: {
    // Step 1
    aadhar: '',
    firstName: '',
    lastName: '',
    residentialAddress: '',
    streetAddress1: '',
    streetAddress2: '',
    postCode: '',
    city: '',
    district: '',
    phone: '',
    email: '',

    fullName: '',
    nationality: '',
    visaNumber: '',
    dob: '',
    photo: null,

    // Step 2
    loginEmail: '',
    password: '',
    confirmPassword: '',

    // Step 3
    checkIn: '',
    checkOut: '',
    totalPeople: 1,
    adults: 1,
    children: 0,
    personNames: [''],

    selectedVilla: null,
    nights: 0,
    extraPersons: 0,
    extraCharges: 0,
    totalAmount: 0,
    totalAmountWithGST: 0,

    // Step 5
    upiId: '',
    mobile: '',
  },
  errors: {}
};

// ✅ DOM elements
const progressSteps = document.getElementById("villaProgressSteps");
const form = document.getElementById("villaBookingForm");

/* =====================================
      UPDATE PROGRESS SIDEBAR
======================================*/
function updateProgress() {
  const lis = progressSteps.querySelectorAll("li");
  lis.forEach((li, index) => {
    li.classList.toggle("active", index === state.currentStep);
  });
}

/* =====================================
      HELPERS
======================================*/
function createInputField({ label, name, type = "text", placeholder = "", value = "" }) {
  return `
    <label>${label}</label>
    <input type="${type}" name="${name}" placeholder="${placeholder}" value="${value || ''}" />
    <div class="error-message" id="error-${name}"></div>
  `;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\d{10}$/.test(phone);
}

function validateAadhar(aadhar) {
  return /^\d{12}$/.test(aadhar);
}

function calculateNights(checkIn, checkOut) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (outDate <= inDate) return 0;
  return Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
}

/* =====================================
      RENDER STEPS
======================================*/
function renderStep() {
  updateProgress();
  let html = "";
  const fd = state.formData;

  /* -------------------------
      STEP 0 – Login Selection
  ---------------------------*/
  if (state.currentStep === 0) {
    html += `
      <h3>Are you an Indian or a Foreigner?</h3>
      <button type="button" id="btn-indian">Indian</button>
      <button type="button" id="btn-foreigner">Foreigner</button>
    `;
  }

  /* -------------------------
      STEP 1 – Personal Details
  ---------------------------*/
  else if (state.currentStep === 1) {
    if (state.userType === "indian") {
      html += `<h3>Personal Details (Indian)</h3>`;
      html += createInputField({ label: "Aadhar *", name: "aadhar", value: fd.aadhar });
      html += createInputField({ label: "First Name *", name: "firstName", value: fd.firstName });
      html += createInputField({ label: "Last Name *", name: "lastName", value: fd.lastName });

      html += createInputField({ label: "Residential Address *", name: "residentialAddress", value: fd.residentialAddress });
      html += createInputField({ label: "Street Address *", name: "streetAddress1", value: fd.streetAddress1 });
      html += createInputField({ label: "Street Address (Optional)", name: "streetAddress2", value: fd.streetAddress2 });

      html += createInputField({ label: "Post Code *", name: "postCode", value: fd.postCode });
      html += createInputField({ label: "City *", name: "city", value: fd.city });
      html += createInputField({ label: "District *", name: "district", value: fd.district });

      html += `
        <label>Phone *</label>
        <input type="text" name="phone" placeholder="10-digit mobile" value="${fd.phone}" />
        <div class="error-message" id="error-phone"></div>
      `;

      html += createInputField({ label: "Email *", name: "email", type: "email", value: fd.email });
    }

    else {
      html += `<h3>Personal Details (Foreigner)</h3>`;
      html += createInputField({ label: "Full Name *", name: "fullName", value: fd.fullName });
      html += createInputField({ label: "Nationality *", name: "nationality", value: fd.nationality });
      html += createInputField({ label: "Visa Number *", name: "visaNumber", value: fd.visaNumber });
      html += createInputField({ label: "Date of Birth *", name: "dob", type: "date", value: fd.dob });

      html += `
        <label>Upload Passport Photo *</label>
        <input type="file" name="photo" />
        <div class="error-message" id="error-photo"></div>
      `;
    }
  }

  /* -------------------------
      STEP 2 – Account Details
  ---------------------------*/
  else if (state.currentStep === 2) {
    html += `<h3>Account Login Details</h3>`;

    html += createInputField({
      label: "Login Email *",
      name: "loginEmail",
      value: fd.loginEmail,
      type: "email"
    });

    html += createInputField({
      label: "Password *",
      name: "password",
      type: "password",
      value: fd.password
    });

    html += createInputField({
      label: "Confirm Password *",
      name: "confirmPassword",
      type: "password",
      value: fd.confirmPassword
    });
  }

  /* -------------------------
      STEP 3 – Stay Details
  ---------------------------*/
  else if (state.currentStep === 3) {
    html += `<h3>Stay Details</h3>`;

    html += createInputField({
      label: "Check-in Date *",
      name: "checkIn",
      type: "date",
      value: fd.checkIn
    });

    html += createInputField({
      label: "Check-out Date *",
      name: "checkOut",
      type: "date",
      value: fd.checkOut
    });

    html += createInputField({
      label: "Total People *",
      name: "totalPeople",
      type: "number",
      value: fd.totalPeople
    });

    html += createInputField({
      label: "Adults *",
      name: "adults",
      type: "number",
      value: fd.adults
    });

    html += createInputField({
      label: "Children",
      name: "children",
      type: "number",
      value: fd.children
    });

    // Person name inputs
    html += `<h4>People Names *</h4>`;
    for (let i = 0; i < fd.totalPeople; i++) {
      html += `
        <input type="text" name="personName_${i}" placeholder="Person ${i + 1} Name" value="${fd.personNames[i] || ''}" />
      `;
    }

    // Villas
    html += `<h4>Select Villa</h4>`;
    html += `<div id="villaList">`;
    villas.forEach(villa => {
      const selected = fd.selectedVilla?.id === villa.id ? 'selected' : '';
      html += `
        <div class="villa-card ${selected}" data-id="${villa.id}">
          <img src="${villa.image}" />
          <div>
            <strong>${villa.name}</strong><br>
            ₹${villa.rate}/night
          </div>
          <input type="radio" name="selectedVilla" value="${villa.id}" ${selected ? 'checked' : ''} />
        </div>
      `;
    });
    html += `</div>`;

    // Preview box
    if (fd.selectedVilla && fd.checkIn && fd.checkOut) {
      const nights = calculateNights(fd.checkIn, fd.checkOut);
      const extra = Math.max(0, fd.totalPeople - 3);

      state.formData.nights = nights;
      state.formData.extraPersons = extra;
      state.formData.extraCharges = extra * 8000;
      state.formData.totalAmount = (fd.selectedVilla.rate * nights) + state.formData.extraCharges;

      html += `
        <div class="villa-preview-box">
          <h4>Booking Summary</h4>
          <p><strong>Nights:</strong> ${nights}</p>
          <p><strong>Extra Charges:</strong> ₹${state.formData.extraCharges}</p>
          <p><strong>Total:</strong> ₹${state.formData.totalAmount}</p>
        </div>
      `;
    }
  }

  /* -------------------------
      STEP 4 – Summary Page
  ---------------------------*/
  else if (state.currentStep === 4) {
    const gst = state.formData.totalAmount * 0.18;
    const totalWithGST = state.formData.totalAmount + gst;

    state.formData.totalAmountWithGST = totalWithGST;

    html += `<h3>Final Summary</h3>`;

    html += `
      <p><strong>Villa:</strong> ${fd.selectedVilla.name}</p>
      <p><strong>Nights:</strong> ${fd.nights}</p>
      <p><strong>Extra Charges:</strong> ₹${fd.extraCharges}</p>
      <p><strong>Total:</strong> ₹${fd.totalAmount}</p>
      <p><strong>GST (18%):</strong> ₹${gst}</p>
      <p><strong>Grand Total:</strong> ₹${totalWithGST}</p>

      <button type="button" id="btn-proceed">Proceed to Payment</button>
    `;
  }

  /* -------------------------
      STEP 5 – Payment
  ---------------------------*/
    else if (state.currentStep === 5) {
    html += `<h3>Payment</h3>`;

    html += createInputField({
      label: "UPI ID *",
      name: "upiId",
      value: fd.upiId
    });

    // Email OTP (Email is taken from loginEmail set in Step 2)
    html += createInputField({
      label: "Registered Email * (for OTP)",
      name: "loginEmail",
      value: state.formData.loginEmail || fd.email || '',
      type: "email"
    });

    html += `
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center">
        <button type="button" id="btn-send-otp">Send OTP</button>
        <input type="text" id="otp-code" placeholder="Enter OTP" style="flex:1; min-width:160px;" />
        <button type="button" id="btn-verify-otp">Verify OTP</button>
      </div>
      <div class="error-message" id="error-otp"></div>
      <button type="button" id="btn-pay" disabled>Pay Now</button>
    `;
  }

  // Navigation Buttons

  html += `<div style="margin-top:20px;">`;

  if (state.currentStep > 0) {
    html += `<button type="button" id="btn-back">Back</button>`;
  }

  if (state.currentStep !== 0 && state.currentStep !== 4 && state.currentStep !== 5) {
    html += `<button type="button" id="btn-next" disabled>Next</button>`;
  }

  html += `</div>`;

  form.innerHTML = html;

  attachListeners();
  updateErrorMessages();
  toggleNextButton();
}

/* =====================================
      VALIDATION
======================================*/
function validateStep() {
  const errors = {};
  const fd = state.formData;

  switch (state.currentStep) {
    case 0:
      if (!state.userType) errors.userType = "Select one option.";
      break;

    case 1:
      if (state.userType === "indian") {
        if (!validateAadhar(fd.aadhar)) errors.aadhar = "Invalid Aadhar.";
        if (!fd.firstName.trim()) errors.firstName = "Required";
        if (!fd.lastName.trim()) errors.lastName = "Required";
        if (!validatePhone(fd.phone)) errors.phone = "Invalid phone";
        if (!validateEmail(fd.email)) errors.email = "Invalid email";
      } else {
        if (!fd.fullName.trim()) errors.fullName = "Required";
        if (!fd.nationality.trim()) errors.nationality = "Required";
        if (!fd.visaNumber.trim()) errors.visaNumber = "Required";
        if (!fd.dob) errors.dob = "Required";
      }
      break;

    case 2:
      if (!validateEmail(fd.loginEmail)) errors.loginEmail = "Invalid Email";
      if (fd.password.length < 6) errors.password = "Min 6 chars.";
      if (fd.password !== fd.confirmPassword) errors.confirmPassword = "Passwords do not match.";
      break;

    case 3:
      if (!fd.checkIn) errors.checkIn = "Required";
      if (!fd.checkOut) errors.checkOut = "Required";
      if (new Date(fd.checkOut) <= new Date(fd.checkIn)) errors.checkOut = "Invalid checkout date";
      if (!fd.selectedVilla) errors.selectedVilla = "Select a villa";

      // Person names
      for (let i = 0; i < fd.totalPeople; i++) {
        if (!fd.personNames[i] || !fd.personNames[i].trim()) {
          errors.personNames = "Enter all names.";
        }
      }
      break;

    case 5:
      if (!fd.upiId.trim()) errors.upiId = "Required";
      if (!validatePhone(fd.mobile)) errors.mobile = "Invalid mobile";
      break;
  }

  state.errors = errors;
  return Object.keys(errors).length === 0;
}

function updateErrorMessages() {
  Object.keys(state.errors).forEach(key => {
    const el = document.getElementById(`error-${key}`);
    if (el) el.textContent = state.errors[key];
  });
}

function toggleNextButton(enable) {
  const btn = document.getElementById("btn-next");
  if (!btn) return;
  if (enable === undefined) enable = validateStep();
  btn.disabled = !enable;
}

function attachListeners() {
  // STEP 0 buttons
  if (state.currentStep === 0) {
    document.getElementById("btn-indian").onclick = () => {
      state.userType = "indian";
      state.currentStep++;
      renderStep();
    };

    document.getElementById("btn-foreigner").onclick = () => {
      state.userType = "foreigner";
      state.currentStep++;
      renderStep();
    };
    return;
  }

  // INPUT listeners
  form.querySelectorAll("input").forEach(input => {
    input.oninput = e => {
      const { name, value, files } = e.target;

      if (name.startsWith("personName_")) {
        const idx = Number(name.split("_")[1]);
        state.formData.personNames[idx] = value;
      }
      else if (name === "photo") {
        state.formData.photo = files?.[0] || null;
      }
      else if (input.type === "number") {
        state.formData[name] = Number(value);
      }
      else {
        state.formData[name] = value;
      }

      validateStep();
      toggleNextButton();
      updateErrorMessages();
    };
  });

  // Villa selection
  if (state.currentStep === 3) {
    document.querySelectorAll(".villa-card").forEach(card => {
      card.onclick = () => {
        const id = Number(card.dataset.id);
        state.formData.selectedVilla = villas.find(v => v.id === id);
        renderStep();
      };
    });

    form.querySelectorAll('input[name="selectedVilla"]').forEach(radio => {
      radio.onchange = e => {
        const id = Number(e.target.value);
        state.formData.selectedVilla = villas.find(v => v.id === id);
        renderStep();
      };
    });
  }

  // BACK button
  const btnBack = document.getElementById("btn-back");
  if (btnBack) {
    btnBack.onclick = () => {
      state.currentStep--;
      renderStep();
    };
  }

  // NEXT button
  const btnNext = document.getElementById("btn-next");
  if (btnNext) {
    btnNext.onclick = () => {
      if (validateStep()) {
        state.currentStep++;
        renderStep();
      } else {
        updateErrorMessages();
      }
    };
  }


// ✅ PROCEED TO PAYMENT — Create booking before OTP
const btnProceed = document.getElementById("btn-proceed");
if (btnProceed) {
  btnProceed.onclick = async () => {
    // Create booking BEFORE going to Step-5
    await saveBookingToServer(true);  

    // Go to Payment (Step-5)
    state.currentStep = 5;
    renderStep();
  };
}


  // PAY NOW

  if (state.currentStep === 5) {
    const emailInput = form.querySelector('input[name="loginEmail"]');
    const sendBtn = document.getElementById('btn-send-otp');
    const verifyBtn = document.getElementById('btn-verify-otp');
    const payBtn = document.getElementById('btn-pay');
    const otpError = document.getElementById('error-otp');

    sendBtn.onclick = async () => {
      const email = (emailInput.value || '').trim();
      if (!validateEmail(email)) {
        otpError.textContent = 'Enter a valid email first.';
        return;
      }
      otpError.textContent = '';
      try {
        await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        alert('OTP sent to your email');
      } catch {
        otpError.textContent = 'Failed to send OTP. Try again.';
      }
    };

    verifyBtn.onclick = async () => {
      const email = (emailInput.value || '').trim();
      const code = (document.getElementById('otp-code').value || '').trim();
      if (!validateEmail(email) || code.length === 0) {
        otpError.textContent = 'Enter email & OTP code.';
        return;
      }
      try {
        const resp = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code })
        });
        const data = await resp.json();
        if (!data.success) {
          otpError.textContent = data.error || 'OTP verification failed';
          return;
        }
        otpError.textContent = 'OTP verified ✅';
        payBtn.disabled = false;
      } catch {
        otpError.textContent = 'Server error while verifying OTP';
      }
    };

    // REAL PAYMENT (Razorpay)
    payBtn.onclick = async () => {
      if (!validateStep()) {
        updateErrorMessages();
        return;
      }

      // Ensure booking exists on server & we have bookingId
      if (!state.lastBookingId) {
        // create booking now
        await saveBookingToServer(/*silent*/ true);
        if (!state.lastBookingId) {
          alert('Could not create booking. Try again.');
          return;
        }
      }

      // Create order
      const orderResp = await fetch('/api/pay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: state.lastBookingId })
      });
      const orderData = await orderResp.json();
      if (!orderData.success) {
        alert('Failed to create order');
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Grand Horizon Villa',
        description: 'Villa Booking Payment',
        order_id: orderData.orderId,
        handler: async function (response) {
          const verifyResp = await fetch('/api/pay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: state.lastBookingId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const v = await verifyResp.json();
          if (v.success) {
            alert('Payment successful! Email receipt sent.');
            window.location.href = v.receiptUrl; // open PDF receipt
          } else {
            alert('Payment verification failed: ' + (v.error || ''));
          }
        },
        prefill: {
          email: emailInput.value,
          contact: state.formData.mobile || ''
        },
        theme: { color: '#20b2aa' }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    };
  }

}

/* =====================================
      API SAVE FUNCTION
======================================*/
async function saveBookingToServer(silent = false) {
  const fd = new FormData();

  fd.append("userType", state.userType);
  fd.append("personalDetails", JSON.stringify({
    aadhar: state.formData.aadhar,
    firstName: state.formData.firstName,
    lastName: state.formData.lastName,
    residentialAddress: state.formData.residentialAddress,
    streetAddress1: state.formData.streetAddress1,
    streetAddress2: state.formData.streetAddress2,
    postCode: state.formData.postCode,
    city: state.formData.city,
    district: state.formData.district,
    fullName: state.formData.fullName,
    nationality: state.formData.nationality,
    visaNumber: state.formData.visaNumber,
    dob: state.formData.dob,
    email: state.formData.email,
    phone: state.formData.phone
  }));

  fd.append("accountDetails", JSON.stringify({
    loginEmail: state.formData.loginEmail
  }));

  fd.append("stayDetails", JSON.stringify({
    checkIn: state.formData.checkIn,
    checkOut: state.formData.checkOut,
    totalPeople: state.formData.totalPeople,
    adults: state.formData.adults,
    children: state.formData.children,
    personNames: state.formData.personNames,
    selectedVilla: state.formData.selectedVilla,
    nights: state.formData.nights,
    extraPersons: state.formData.extraPersons,
    extraCharges: state.formData.extraCharges,
    totalAmount: state.formData.totalAmount,
    totalAmountWithGST: state.formData.totalAmountWithGST
  }));

  fd.append("paymentDetails", JSON.stringify({
    upiId: state.formData.upiId,
    mobile: state.formData.mobile
  }));

  if (state.formData.photo) fd.append("photo", state.formData.photo);

  try {
    const res = await fetch("/api/bookings", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) {
      state.lastBookingId = data.bookingId; // ✅ store for payment
      if (!silent) alert(`Booking saved! ID: ${data.bookingId}. Now verify OTP & Pay.`);
    } else {
      if (!silent) alert("Server error saving booking.");
    }
  } catch (err) {
    if (!silent) alert("Network error. Try again later.");
  }
}

// ✅ Initial Render
renderStep();
