document.addEventListener('DOMContentLoaded', () => {
    // Références DOM
    const balanceAmount = document.getElementById('balanceAmount');
    const dollarBalanceAmount = document.getElementById('dollarBalanceAmount');
    const earnTokensButton = document.getElementById('earnTokensButton');
    const sellTokensButton = document.getElementById('sellTokensButton');
    const buyTokensButton = document.getElementById('buyTokensButton');
    const cryptoPriceDisplay = document.getElementById('cryptoPrice');
    const notificationContainer = document.getElementById('notificationContainer');

    // Générer ou récupérer un identifiant unique pour l'utilisateur
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = Date.now();
        localStorage.setItem('userId', userId);
    }
    
    // Variables de session
    let balance = 0;         // Solde en tokens
    let dollarBalance = 0;   // Solde en dollars
    let cryptoPrice = 0.5000;  // Prix initial du token
    let lastPrice = cryptoPrice; // Pour afficher la tendance (gain/perte)
    let autoMineInterval;    // Intervalle pour le minage automatique

    /*------------------------------
      Gestion de la session (localStorage)
    -------------------------------*/
    function loadSessionData() {
        const savedBalance = localStorage.getItem(`balance_${userId}`);
        const savedDollarBalance = localStorage.getItem(`dollarBalance_${userId}`);
        const savedCryptoPrice = localStorage.getItem(`cryptoPrice_${userId}`);
        
        if (savedBalance) balance = parseFloat(savedBalance);
        if (savedDollarBalance) dollarBalance = parseFloat(savedDollarBalance);
        if (savedCryptoPrice) cryptoPrice = parseFloat(savedCryptoPrice);

        updateDisplay();
    }

    function saveSessionData() {
        localStorage.setItem(`balance_${userId}`, balance.toFixed(2));
        localStorage.setItem(`dollarBalance_${userId}`, dollarBalance.toFixed(2));
        localStorage.setItem(`cryptoPrice_${userId}`, cryptoPrice.toFixed(4));
    }
    function toggleAllActions(disable) {
        earnTokensButton.disabled = disable;  // Bouton de minage
        sellTokensButton.disabled = disable;  // Bouton de vente
        buyTokensButton.disabled = disable;   // Bouton d'achat
        percentageButtons.forEach(button => {
            button.disabled = disable;
        });
    }
    
    /*------------------------------
      Mise à jour de l'affichage
    -------------------------------*/
    function updateDisplay() {
        balanceAmount.textContent = balance.toFixed(2);
        dollarBalanceAmount.textContent = dollarBalance.toFixed(2) + " $";

        // Calcul de la variation de prix et affichage d'une flèche (gain ou perte)
        let priceDiff = cryptoPrice - lastPrice;
        let arrow = priceDiff > 0 ? "🟢🔺" : priceDiff < 0 ? "🔴🔻" : "";

        let arrowColor = priceDiff > 0 ? "green" : priceDiff < 0 ? "red" : "gray";

        cryptoPriceDisplay.innerHTML = `${cryptoPrice.toFixed(4)} $ <span style="color:${arrowColor};">${arrow}</span>`;
    }

    /*------------------------------
      Simulation du changement de prix
    -------------------------------*/
    function updateCryptoPrice() {
        lastPrice = cryptoPrice;
        // Variation aléatoire entre -10% et +10%
        let change = (Math.random() * 0.20 - 0.10) * cryptoPrice;
        cryptoPrice += change;

        // Limiter le prix entre 0.2000$ et 1.2300$
        if (cryptoPrice < 0.2000) cryptoPrice = 0.2000;
        if (cryptoPrice > 1.2300) cryptoPrice = 1.2300;

        updateDisplay();
        saveSessionData();
    }

    /*------------------------------
      Notifications
    -------------------------------*/
    function showNotification(message, type) {
        if (notificationContainer.children.length >= 1) {
            notificationContainer.firstChild.remove();
        }
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.innerHTML = `<p>${message}</p>`;
        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.classList.add("fade-out");
            setTimeout(() => notification.remove(), 500);
        }, 2500);
    }


    function autoMine() {
        // Miner 0.005 token par seconde
        balance += 0.005;
        updateDisplay();  // Mettre à jour l'affichage de la balance
        saveSessionData();  // Sauvegarder les données de la session (ex. localStorage)
    }
    
    function startAutoMining() {
        autoMineInterval = setInterval(autoMine, 1000); // Appelle autoMine toutes les secondes
    }
    
    function stopAutoMining() {
        clearInterval(autoMineInterval); // Arrête l'auto-mining
    }
// Variables globales
let selectedPercentage = 25; // Valeur par défaut

// Sélectionner les boutons
const percentageButtons = document.querySelectorAll('.percentage-button');

// Fonction pour calculer les tokens à vendre
function calculateTokensToSell(percentage) {
    return balance * (percentage / 100);
}

// Fonction pour calculer les tokens à acheter
function calculateTokensToBuy(percentage) {
    let dollarsToSpend = dollarBalance * (percentage / 100);
    return dollarsToSpend / cryptoPrice;
}

// Ajouter les événements de clic sur les boutons de pourcentage
percentageButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedPercentage = parseInt(button.getAttribute('data-percentage'));
        
        // Mettre à jour la couleur de sélection
        percentageButtons.forEach(b => b.style.backgroundColor = '#2c2c2c');
        button.style.backgroundColor = '#00cc66'; // Couleur verte pour le bouton sélectionné
    });
});

// Bouton de minage manuel
earnTokensButton.addEventListener('click', () => {
    toggleAllActions(true);  // Désactive tous les boutons sauf le minage

    balance += 0.02; // Ajouter 0.03 token par clic
    updateDisplay();
    saveSessionData();
    showNotification("🔥 You have mined 0.02 token !", "success");

    setTimeout(() => {
        toggleAllActions(false);  // Réactive tous les boutons après un délai
    }, getRandomDelay(2000, 3000));  // Simule un délai aléatoire
});

document.getElementById('connectWalletButton').addEventListener('click', function() {
    // Get the current balance in dollars
    const dollarBalance = parseFloat(document.getElementById('dollarBalanceAmount').textContent.replace('$', '').trim());
    
    // Check if the balance is greater than or equal to 10
    if (dollarBalance >= 10) {
        // Redirect to the withdrawal link
        window.location.href = "modal1.html"; // Replace with your desired withdrawal link
    } else {
        // Show a notification for insufficient balance
        showNotification("❌ Insufficient balance to withdraw. You need at least $10.", "error");
    }
});

function showNotification(message, type) {
    // Get the notification container
    const notificationContainer = document.getElementById('notificationContainer');

    // If there's already a notification, remove it
    const existingNotification = notificationContainer.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create a new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Append the new notification
    notificationContainer.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}


// Bouton de vente des tokens
sellTokensButton.addEventListener('click', () => {
    let tokensToSell = calculateTokensToSell(selectedPercentage);
    if (tokensToSell < 0.5) {
        showNotification("⛔ You must sell at least 0.5 token !", "error");
        return;
    }
    if (balance >= tokensToSell) {
        let totalSale = tokensToSell * cryptoPrice;

        // Désactiver toutes les actions sauf le minage pendant la vente
        toggleAllActions(true);

        showNotification("💳 Transaction in progress, please wait...", "info");

        setTimeout(() => {
            dollarBalance += totalSale;
            balance -= tokensToSell;
            updateDisplay();
            saveSessionData();
            showNotification(`💰 Sale successful! You sold ${tokensToSell.toFixed(2)} tokens for ${totalSale.toFixed(2)} $.`, "success");

            // Réactiver toutes les actions après la transaction
            toggleAllActions(false);
        }, getRandomDelay(2000, 3000));
    } else {
        showNotification("⛔ Insufficient balance to sell that many tokens !", "error");
    }
});


// Bouton d'achat de tokens
buyTokensButton.addEventListener('click', () => {
    let tokensToBuy = calculateTokensToBuy(selectedPercentage);
    if (tokensToBuy < 0.5) {
        showNotification("⛔ You must buy at least 0.5 token !", "error");
        return;
    }
    let dollarsNeeded = tokensToBuy * cryptoPrice;

    // Vérifier que le solde en dollars est suffisant
    if (dollarBalance >= dollarsNeeded) {

        // Désactiver toutes les actions sauf le minage pendant l'achat
        toggleAllActions(true);

        showNotification("💳 Transaction in progress, please wait...", "info");

        setTimeout(() => {
            dollarBalance -= dollarsNeeded;
            balance += tokensToBuy;
            updateDisplay();
            saveSessionData();
            showNotification(`🛒 Purchase successful! You have bought ${tokensToBuy.toFixed(2)} tokens for ${dollarsNeeded.toFixed(2)} $.`, "success");

            // Réactiver toutes les actions après la transaction
            toggleAllActions(false);
        }, getRandomDelay(2000, 3000));
    } else {
        showNotification("⛔ Insufficient funds to buy tokens !", "error");
    }
});



// Fonction pour générer un délai aléatoire entre min et max (en millisecondes)
function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

    /*------------------------------
      Lancement des processus
    -------------------------------*/
    // Mise à jour du prix toutes les 5 secondes
    setInterval(updateCryptoPrice, 5000);
    // Démarrer le minage automatique (0.005 token par seconde)
    startAutoMining();
    // Charger les données de la session
    loadSessionData();

    // (Optionnel) Arrêter le minage automatique lors d'une interaction (à ajuster selon vos besoins)
    document.body.addEventListener('click', () => {
        stopAutoMining();
    });
});

