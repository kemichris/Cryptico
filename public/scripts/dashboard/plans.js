// container holding all plans
const planContainer = document.querySelector(".available-plans");

// load all available plans
const getPlans = async () => {

  try {

    // fetch plans from backend
    const res = await fetch('/api/users/plans', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // if token invalid
    if (!res.ok) {
      localStorage.clear();
      window.location.href = '/pages/login.html';
      return;
    }

    // convert response to JS object/array
    const planData = await res.json();

    console.log('Available plans:', planData);

    // remove static HTML cards
    planContainer.innerHTML = '';

    // loop through all plans
    planData.forEach(plan => {

      // create card element
      const planCard = document.createElement('div');

      // add class
      planCard.className = 'package-card';

      // build HTML dynamically
      planCard.innerHTML = `
      
        <p class="card-name">${plan.name}</p>

        <p class="card-amount">
          $<span>${plan.price}</span>
        </p>

        <div>
          <p>Minimum Possible Deposit:</p>
          <p>$${plan.minAmount}</p>
        </div>

        <div>
          <p>Maximum Possible Deposit:</p>
          <p>$${plan.maxAmount}</p>
        </div>

        <div>
          <p>Minimum Return:</p>
          <p>$${plan.minRoi}</p>
        </div>

        <div>
          <p>Maximum Return:</p>
          <p>$${plan.maxRoi}</p>
        </div>

        <div>
          <p>Gift Bonus:</p>
          <p>$${plan.giftBonus}</p>
        </div>

        <div>
          <p>Duration:</p>
          <p>${plan.duration} days</p>
        </div>

        <div>
          <p>Top Up Interval:</p>
          <p>${plan.topUpInterval}</p>
        </div>

        <p class="invested-amount">
          Amount to invest: ($${plan.minAmount} default)
        </p>

        <input 
          type="number"
          value="${plan.minAmount}"
          min="${plan.minAmount}"
          max="${plan.maxAmount}"
          class="plan-amount-input"
        >

        <button 
          class="join-plan-btn"
          data-id="${plan._id}"
        >
          Join plan
        </button>
      `;

      // append card to container
      planContainer.appendChild(planCard);

    });

  } catch (error) {

    console.error('Plans error:', error);

  }
};

// run on page load
getPlans();