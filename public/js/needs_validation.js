(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  function markInvalid(input, message) {
    if (!input) return
    input.setCustomValidity(message || 'invalid')
    input.reportValidity?.()
  }

  function clearInvalid(input) {
    if (!input) return
    input.setCustomValidity('')
  }

  const validateRatingGroup = (form) => {
    const ratingInputs = form.querySelectorAll('input[name="review[rating]"]:not([value="0"])')
    const hasChecked = [...ratingInputs].some(input => input.checked)

    if (!hasChecked) {
      const starGroup = form.querySelector('.starability-slot')
      if (starGroup) {
        starGroup.setAttribute('data-invalid', 'true')
      }
      return false
    }

    const starGroup = form.querySelector('.starability-slot')
    if (starGroup) {
      starGroup.removeAttribute('data-invalid')
    }
    return true
  }

  const validateConfirmPassword = (form) => {
    const password = form.querySelector('input[name="password"]')
    const confirm = form.querySelector('input[name="confirm_password"]')

    if (!password || !confirm) return true

    if (confirm.value && password.value !== confirm.value) {
      confirm.setCustomValidity('Passwords do not match.')
      return false
    }

    confirm.setCustomValidity('')
    return true
  }

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      let valid = form.checkValidity()

      if (form.querySelector('input[name="review[rating]"]')) {
        const ratingValid = validateRatingGroup(form)
        valid = valid && ratingValid
      }

      if (!validateConfirmPassword(form)) {
        valid = false
      }

      const comment = form.querySelector('textarea[name="review[comment]"]')
      if (comment) {
        const trimmed = comment.value.trim()
        if (!trimmed || trimmed.length < 3) {
          comment.setCustomValidity('Please add a meaningful review comment.')
          valid = false
        } else {
          comment.setCustomValidity('')
        }
      }

      if (!valid) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)

    form.addEventListener('input', () => {
      const ratingCount = form.querySelectorAll('input[name="review[rating]"]:checked').length
      if (form.querySelector('input[name="review[rating]"]') && ratingCount > 0) {
        const starGroup = form.querySelector('.starability-slot')
        if (starGroup) starGroup.removeAttribute('data-invalid')
      }

      if (form.querySelector('input[name="confirm_password"]')) {
        validateConfirmPassword(form)
      }

      form.querySelectorAll('input, textarea').forEach(input => {
        if (input.validity.valid) {
          clearInvalid(input)
        }
      })
    })

    form.querySelectorAll('input[name="review[rating]"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const starGroup = form.querySelector('.starability-slot')
        if (starGroup) starGroup.removeAttribute('data-invalid')
      })
    })
  })
})()

