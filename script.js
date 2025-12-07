let costChart, equityChart;

function toggleAdvanced() {
    const adv = document.getElementById("advancedSection");
    adv.style.display = adv.style.display === "none" ? "block" : "none";
}

function formatNumber(num) {
    return num.toLocaleString();
}

function calculate() {
    const rentAmount = +document.getElementById("rentAmount").value;
    const rentInflation = +document.getElementById("rentInflation").value / 100;
    const homePrice = +document.getElementById("homePrice").value;
    const downPayment = +document.getElementById("downPayment").value;
    const interestRate = +document.getElementById("interestRate").value / 100;
    const loanTerm = +document.getElementById("loanTerm").value;
    const hoa = +document.getElementById("hoa").value;
    const roomsRented = +document.getElementById("roomsRented").value;
    const rentPerRoom = +document.getElementById("rentPerRoom").value;
    const occupancyRate = +document.getElementById("occupancyRate").value;
    const taxRate = +document.getElementById("taxRate").value / 100;
    const insuranceRate = +document.getElementById("insuranceRate").value / 100;
    const maintenanceRate = +document.getElementById("maintenanceRate").value / 100;
    const appreciationRate = +document.getElementById("appreciationRate").value / 100;
    const investmentRate = +document.getElementById("investmentRate").value / 100;
    const timeHorizon = +document.getElementById("timeHorizon").value;

    /* Mortgage */
    const P = homePrice - downPayment;
    const r = interestRate / 12;
    const n = loanTerm * 12;
    const mortgagePayment = P*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);

    const annualCosts = mortgagePayment*12 + homePrice*taxRate + homePrice*insuranceRate + homePrice*maintenanceRate + hoa*12;
    const annualRoomIncome = roomsRented*rentPerRoom*12*occupancyRate;
    const netAnnualOwn = annualCosts - annualRoomIncome;
    const monthlyCashflow = (annualRoomIncome/12) - (annualCosts/12);

    let rentTotal=0, rent=rentAmount*12;
    const rentSeries=[], ownSeries=[], years=[];
    for(let i=0;i<timeHorizon;i++){
        rentTotal+=rent;
        rentSeries.push(rentTotal);
        ownSeries.push(netAnnualOwn*(i+1));
        years.push(`Year ${i+1}`);
        rent*=(1+rentInflation);
    }

    /* Break-even */
    let breakEven = "Buying never becomes cheaper within the horizon.";
    for(let i=0;i<timeHorizon;i++){
        if(ownSeries[i]<rentSeries[i]){
            breakEven = `Buying becomes cheaper in ${i+1} years.`;
            break;
        }
    }

    /* Future values */
    const futureHomeValue = homePrice * Math.pow(1 + appreciationRate, timeHorizon);
    const paymentsMade = timeHorizon * 12;
    const remainingBalance = P*((Math.pow(1+r,n)-Math.pow(1+r,paymentsMade))/(Math.pow(1+r,n)-1));
    const equity = futureHomeValue - remainingBalance;
    const investmentValue = downPayment * Math.pow(1 + investmentRate, timeHorizon);

    /* Should buy or rent recommendation */
    const shouldBuy = (netAnnualOwn*timeHorizon < rentTotal || equity > investmentValue) 
        ? "✅ Based on this scenario, you should buy." 
        : "❌ Based on this scenario, you might be better renting.";

    /* Display results */
    document.getElementById("results").style.display="block";
    document.getElementById("chartSection").style.display="block";
    document.getElementById("shouldBuy").innerHTML = shouldBuy;
    document.getElementById("monthlyCashflow").innerHTML = `<strong>Monthly net cashflow:</strong> $${formatNumber(Math.round(monthlyCashflow))}`;
    document.getElementById("breakEven").innerHTML = breakEven;
    document.getElementById("rentCost").innerHTML = `<strong>Total cost of renting:</strong> $${formatNumber(Math.round(rentTotal))}`;
    document.getElementById("ownCost").innerHTML = `<strong>Annual net cost of owning:</strong> $${formatNumber(Math.round(netAnnualOwn))}`;
    document.getElementById("equity").innerHTML = `<strong>Home equity after ${timeHorizon} years:</strong> $${formatNumber(Math.round(equity))}`;
    document.getElementById("investmentValue").innerHTML = `<strong>Value of investing down payment:</strong> $${formatNumber(Math.round(investmentValue))}`;

    /* Charts */
    if(costChart) costChart.destroy();
    if(equityChart) equityChart.destroy();

    costChart = new Chart(document.getElementById("costChart"), {
        type:'line',
        data:{
            labels:years,
            datasets:[
                {label:"Cumulative Renting Cost", data:rentSeries, borderColor:"#ff4444", fill:false},
                {label:"Cumulative Owning Cost", data:ownSeries, borderColor:"#4caf50", fill:false}
            ]
        }
    });

    equityChart = new Chart(document.getElementById("equityChart"), {
        type:'bar',
        data:{
            labels:["Home Equity","Invested Down Payment"],
            datasets:[{label:"Value After Horizon", data:[equity,investmentValue], backgroundColor:["#0078ff","#ffa726"]}]
        }
    });
}
