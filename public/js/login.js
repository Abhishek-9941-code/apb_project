// const loginForm = document.getElementById("loginForm");
//       const email = document.getElementById("email");
//       const password = document.getElementById("password");
//       const togglePassword = document.getElementById("togglePassword");

//       togglePassword.addEventListener("click", () => {
//         const icon = togglePassword.querySelector("i");
//         const isPassword = password.getAttribute("type") === "password";
//         password.setAttribute("type", isPassword ? "text" : "password");
//         icon.classList.toggle("fa-eye");
//         icon.classList.toggle("fa-eye-slash");
//       });


      // Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()