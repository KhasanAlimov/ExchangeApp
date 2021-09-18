
const allCurrenciesData = 'https://api.changenow.io/v1/currencies?active=true&fixedRate=true';
const APIKey = 'c9155859d90d239f909d2906233816b26cd8cf5ede44702d422667672b58b0cd';

fetch(allCurrenciesData)
  .then(response => response.json())
  .then(data => {

  	// Index of default showed currencies
  	let showedData = [0, 1]

		const currency = d3.selectAll('.currencies')
											.attr('data-index', (d, i) => i);

		// Exchange rates
		const exchangeRates = () => {
			const activeTicker = (i) => data[showedData[i]].ticker,
			ticckers = `${activeTicker(0)}_${activeTicker(1)}`;

			let minAmountData = `https://api.changenow.io/v1/min-amount/${ticckers}?api_key=${APIKey}`;

			fetch(minAmountData)
			 .then(response => response.json())
		  	 .then(minAmountObj => {

		  		const inputField = d3.select('#inputField')
		  		let inputValue = inputField.node().value = minAmountObj.minAmount;

		  		// Estimated amount
		  		const estimateFunc = () => {
		  			if (inputValue < minAmountObj.minAmount) {

		  				d3.select('#estimatedField')
		  				.html('<p class="text-red-500">Not enough amount!</p>')
		  			}else{
			  			const estimatedAmountData = `https://api.changenow.io/v1/exchange-amount/${inputValue}/${ticckers}?api_key=${APIKey}`;

				  		fetch(estimatedAmountData)
							.then(response => response.json())
						  	.then(estAmObj => {

						  		d3.select('#estimatedField')
						  		.text(estAmObj.estimatedAmount)
						  })
					  }
		  		}

		  		estimateFunc()

		  		// Exchange rates on input
		  		inputField.on('input', function() {
		  			inputValue = this.value
		  			estimateFunc()
		  		})
		  		
		  })
	  }

	  exchangeRates()

		// Create active currencies
  	const activeCurrencies = () => {

			currency.append('span')
				.append('img')
				.attr('src', (d, i) => data[showedData[i]].image)
				.attr('alt', (d, i) => data[showedData[i]].name);

			currency.append('span')
				.attr('class', 'uppercase')
				.text((d, i) => data[showedData[i]].ticker)

			currency.append('span')
				.attr('class', 'icons-color')
				.html('<i class="fas fa-angle-down"></i>')
  	}

  	activeCurrencies()

  	// Swap currencies on click
  	const swap = d3.select('#swap')
	.on('click', () => {
		showedData = showedData.reverse()

		currency.html('');
		activeCurrencies();
		exchangeRates()
	});

  	currency.on('click', function(d) {
  		const currentSide = d3.select(this.parentNode);

  		const searchInput = currentSide.append('input')
			  		.attr('type', 'search')
			  		.attr('class', 'absolute inset-0 w-full bg-gray-50 outline-none py-1.5 px-2')

  		const closeIcon = currentSide.append('div')
			  		.attr('class', 'absolute z-10 top-0 bottom-0 right-0 bg-gray-50 flex justify-center items-center')
			  		.style('width', '22px');

  		// Create list with cryptocurrency
  		const selections = currentSide.append('div')
			  		.attr('class', 'absolute z-10 left-0 top-full right-0 rounded-sm bg-gray-50 overflow-auto max-h-40')
			  		.attr('id', 'cryptoList')

			const currenciesList = (d) => {
				const singleCurrency = selections.selectAll('div')
				  		.data(d)
				  		.enter()
				  		.append('div')
				  		.attr('data-index', (d, i) => i)
				  		.attr('class', 'cursor-pointer flex justify-start items-center p-2 hover:bg-gray-200');

	  		singleCurrency.html((d, i) => `
	  			<div>
	  			 <img src="${d.image}" alt="${d.name}">
	  			</div>
	  			<div class="uppercase pl-2">${d.ticker}</div>
	  			<div class="text-gray-400 pl-2" id="currencyName">${d.name}</div>
	  		`);

	  		// change cryptocurrency
	  		singleCurrency.on('click' , function(d, i) {
	  			showedData[sideIndex] = data.indexOf(i);

	  			currency.html('');
		  		activeCurrencies();
		  		exchangeRates()
	  			removeSearchInput()
	  		})
			}

			currenciesList(data)
  		
  		// Search input Items filter
  		searchInput.on('input', function() {
  			let searchValue = this.value.toLowerCase();

  			const filteredCharacters = data.filter((character) => {
		        return (
		            character.name.toLowerCase().includes(searchValue) ||
		            character.ticker.toLowerCase().includes(searchValue)
		        );
		    });
  			selections.html('')
  			currenciesList(filteredCharacters)
  		});

  		let sideIndex = this.getAttribute('data-index')

  		// Remove search input function
  		const removeSearchInput = () => {
  			searchInput.remove()
  			closeIcon.remove()
  			selections.remove()
  		}
  		
  		// Close search input on click
  		closeIcon.append('i')
				  		.attr('class', 'fas fa-times cursor-pointer')
				  		.on('click', () => {
				  			removeSearchInput()
				  		})

  		searchInput.node().focus()

  	})

  });
