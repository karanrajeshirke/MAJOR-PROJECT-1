// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
  })()



let taxToggle = document.getElementById('flexSwitchCheckDefault');
  let taxInfo = document.getElementsByClassName('tax-info');
  let priceElements = document.getElementsByClassName('price');

  taxToggle.addEventListener('click', () => {
    for (let i = 0; i < taxInfo.length; i++) {
      if (taxToggle.checked) {
       
        let originalPrice = parseFloat(priceElements[i].innerText.replace(/,/g, ''));
        let newPrice = originalPrice * 1.18;
        priceElements[i].innerText = newPrice.toLocaleString("en-IN");

        // Display tax info
        taxInfo[i].style.display = "none";
      } else {
        
        let originalPrice = parseFloat(priceElements[i].innerText.replace(/,/g, ''));
        let newPrice = originalPrice / 1.18;
        priceElements[i].innerText = newPrice.toLocaleString("en-IN");

        // Hide tax info
        taxInfo[i].style.display = "inline";
      }
    }
  });