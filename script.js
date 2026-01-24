let chart;

async function analyze() {
    const url = document.getElementById("url").value;
    const status = document.getElementById("status");

    if (!url) {
        alert("Please paste a YouTube link");
        return;
    }

    status.innerText = "Analyzing comments... ⏳";

    try {
        const response = await fetch("https://nlp.charansai.me/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                video_url: url
            })
        });

        const data = await response.json();

        if (data.error) {
            status.innerText = data.error;
            return;
        }

        status.innerText = `Total Comments Analyzed: ${data.total}`;

        drawChart(
            data.positive,
            data.negative,
            data.neutral
        );

    } catch (error) {
        console.error(error);
        status.innerText = "Server error. Try again.";
    }
}

function drawChart(positive, negative, neutral) {
    const ctx = document.getElementById("sentimentChart");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Positive", "Negative", "Neutral"],
            datasets: [{
                data: [positive, negative, neutral],
                backgroundColor: ["#4CAF50", "#F44336", "#FFC107"]
            }]
        },
        options: {
            responsive: true
        }
    });
}
