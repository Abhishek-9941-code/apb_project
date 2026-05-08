const priceInput = document.getElementById('priceInput');
        const mrpInput   = document.getElementById('mrpInput');
        const discBadge  = document.getElementById('discountBadge');
        const discVal    = document.getElementById('discountVal');

        function calcDiscount() {
            const price = parseFloat(priceInput.value);
            const mrp   = parseFloat(mrpInput.value);
            if (price > 0 && mrp > 0 && mrp > price) {
                const pct = Math.round(((mrp - price) / mrp) * 100);
                discVal.textContent = pct;
                discBadge.style.display = 'inline-flex';
            } else {
                discBadge.style.display = 'none';
            }
        }
        priceInput.addEventListener('input', calcDiscount);
        mrpInput.addEventListener('input', calcDiscount);

        // ── Image preview ──
        const imageInput      = document.getElementById('imageInput');
        const imagePreview    = document.getElementById('imagePreview');
        const imagePreviewWrap = document.getElementById('imagePreviewWrap');
        const removeImgBtn    = document.getElementById('removeImg');
        const uploadZone      = document.getElementById('uploadZone');

        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                imagePreview.src = e.target.result;
                imagePreviewWrap.style.display = 'flex';
                uploadZone.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });

        removeImgBtn.addEventListener('click', () => {
            imageInput.value = '';
            imagePreviewWrap.style.display = 'none';
            uploadZone.style.display = 'block';
        });

        // ── Bootstrap validation + success toast ──
        const form = document.getElementById('addProductForm');
        form.addEventListener('submit', function (e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                form.classList.add('was-validated');
                return;
            }
            // Comment out e.preventDefault() in production (let the form POST normally)
            // e.preventDefault();
            showToast();
        });

        function showToast() {
            const t = document.getElementById('successToast');
            t.style.display = 'flex';
            setTimeout(() => t.style.display = 'none', 3500);
        }

        // ── Reset clears preview too ──
        document.getElementById('resetBtn').addEventListener('click', () => {
            imagePreviewWrap.style.display = 'none';
            uploadZone.style.display = 'block';
            discBadge.style.display = 'none';
            form.classList.remove('was-validated');
        });