document.addEventListener('DOMContentLoaded', function () {
    // Open modal when clicking the plus symbol
    document.querySelectorAll('.plus-symbol').forEach(function (plus) {
        plus.addEventListener('click', function () {
            var productHandle = this.getAttribute('data-product-handle');
            console.log('Fetching product with handle:', productHandle); // Log the product handle

            // Check if product handle is null
            if (!productHandle) {
                console.error('Product handle is null or undefined.');
                return; // Exit the function
            }

            // Fetch product details using Shopify's AJAX API with the product handle
            fetch('/products/' + productHandle + '.js')
                .then(response => {
                    console.log('Response Status:', response.status); // Log status
                    if (!response.ok) {
                        throw new Error('Network response was not ok: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(product => {
                    var modal = document.getElementById('product-modal');
                    var modalContent = document.getElementById('product-details');
                    
                    // Check if color and size options exist by their option name
                    var colorOptions = null;
                    var sizeOptions = null;
                    var selectedVariant = null;

                    // Loop through product options and find "Color" and "Size" if they exist
                    product.options.forEach(option => {
                        if (option.name.toLowerCase() === 'color') {
                            colorOptions = option.values;
                        } else if (option.name.toLowerCase() === 'size') {
                            sizeOptions = option.values;
                        }
                    });

                    modalContent.innerHTML = `
    <div class="content"> <!-- Use flexbox for layout -->
        <img src="${product.images[0]}" alt="${product.title}" style="max-width: 130px; height: 200px; object-fit: cover;">
        <div style="flex-grow: 1;">
            <h2 style="margin: 0;">${product.title}</h2>
            <p style="font-weight: bold; font-size: 1.5rem; margin: 10px 0;">${(product.price / 100).toFixed(2)} ${Shopify.currency.active}</p>
            <p style="margin-bottom: 20px;">${product.description}</p>

 ${colorOptions ? `
<div style="width: 100%; margin-bottom: 15px;">
    <label for="color-select" style="font-weight: bold;">Color</label>
    <div id="color-toggle-group" style="display: flex; gap: 1px; margin-top: 5px;">
        ${colorOptions.map((value, index) => `
            <label class="color-toggle">
                <input type="radio" name="color" value="${value}" ${index === 0 ? 'checked' : ''}>
                <span>${value}</span>
            </label>
        `).join('')}
    </div>
</div>
` : ''}



            <!-- Size Section -->
            ${sizeOptions ? `
            <div style="width: 100%; margin-bottom: 20px;">
                <label for="size-select" style="font-weight: bold;">Size</label>
                <select id="size-select" style="width: 100%; padding: 10px; border: 1px solid #ccc;">
                    <option value="" disabled selected>Choose your size</option>
                    ${sizeOptions.map(value => `<option value="${value}">${value}</option>`).join('')}
                </select>
            </div>
            ` : ''}

            
            <button id="add-to-cart" style="width: 100%; background-color: black; color: white; padding: 15px; border: none; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">Add to Cart →</button>
        </div>
    </div>
`;


                  const colorToggles = document.querySelectorAll('.color-toggle');

// Add click event listener to each element
colorToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        // Remove 'active' class from all elements
        colorToggles.forEach(t => t.classList.remove('active'));
        
        // Add 'active' class to the clicked element
        toggle.classList.add('active');
    });
});
                  

                    // Set the first variant as the default
                    selectedVariant = product.variants[0];

                    // Update variant based on selected color/size
                    document.querySelectorAll('input[name="color"]').forEach(input => {
                        input.addEventListener('change', function () {
                            var selectedColor = this.value;
                            updateSelectedVariant(product, selectedColor);
                        });
                    });

                    document.getElementById('size-select')?.addEventListener('change', function () {
                        updateSelectedVariant(product);
                    });

                    function updateSelectedVariant(product, selectedColor) {
                        var selectedSize = document.getElementById('size-select')?.value;
                        product.variants.forEach(variant => {
                            if ((selectedColor && variant.option1 === selectedColor) && (!selectedSize || variant.option2 === selectedSize)) {
                                selectedVariant = variant;
                            }
                        });
                    }

                    // Add to Cart functionality
                    document.getElementById('add-to-cart').addEventListener('click', function () {
                        if (!selectedVariant) {
                            alert('Please select a valid product option.');
                            return;
                        }
                        
                        fetch('/cart/add.js', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                id: selectedVariant.id,
                                quantity: 1
                            })
                        })
                            .then(response => response.json())
                            .then(data => {
                                console.log('Product added to cart:', data);
                                alert('Product added to cart!');
                            })
                            .catch(error => {
                                console.error('Error adding to cart:', error);
                                alert('There was an issue adding the product to the cart.');
                            });
                    });

                    modal.style.display = 'block'; // Show the modal
                })
                .catch(err => console.error('Error fetching product:', err));
        });
    });

    // Close modal when clicking the close button
    document.querySelector('.close').addEventListener('click', function () {
        document.getElementById('product-modal').style.display = 'none';
    });

    // Close modal when clicking outside of modal content
    window.addEventListener('click', function (event) {
        var modal = document.getElementById('product-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
