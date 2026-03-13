document.addEventListener('DOMContentLoaded', () => {
    const reactionTarget = document.getElementById('reaction-target');
    const reactionTimeDisplay = document.getElementById('reaction-time-display');
    const messageDisplay = document.getElementById('message-display');
    const gameArea = document.getElementById('game-area'); // Get game-area for dimensions
    const reactionList = document.getElementById('reaction-list'); // New: for listing reaction times
    const averageReactionTimeDisplay = document.getElementById('average-reaction-time'); // New: for average reaction time

    // New: Chart elements
    const reactionTimeChart = document.getElementById('reaction-time-chart');
    const ctx = reactionTimeChart.getContext('2d');

    let startTime;
    let endTime;
    let timeoutId;
    let reactionTimes = [];
    let isWaitingToClick = false;
    let isGameRunning = false; // To prevent multiple start calls

    function updateReactionTimesLog() {
        reactionList.innerHTML = ''; // Clear previous entries
        let totalReactionTime = 0;
        reactionTimes.forEach((time, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Round ${index + 1}: ${time} ms`;
            reactionList.appendChild(listItem);
            totalReactionTime += time;
        });

        if (reactionTimes.length > 0) {
            const average = totalReactionTime / reactionTimes.length;
            averageReactionTimeDisplay.textContent = `Average Reaction Time: ${average.toFixed(2)} ms`;
        } else {
            averageReactionTimeDisplay.textContent = 'Average Reaction Time: --';
        }
        drawGraph(reactionTimes); // New: Update the graph after updating the log
    }

    function drawGraph(data) {
        ctx.clearRect(0, 0, reactionTimeChart.width, reactionTimeChart.height); // Clear canvas

        if (data.length === 0) {
            ctx.fillStyle = '#6c757d';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data to display yet.', reactionTimeChart.width / 2, reactionTimeChart.height / 2);
            return;
        }

        const margin = 30;
        const chartWidth = reactionTimeChart.width - 2 * margin;
        const chartHeight = reactionTimeChart.height - 2 * margin;

        // Find max reaction time for scaling Y-axis
        const maxTime = Math.max(...data);
        // Add a little buffer for better visualization
        const yScale = chartHeight / (maxTime * 1.1);
        const xScale = chartWidth / (data.length - (data.length > 1 ? 1 : 0));

        // Draw X-axis (Attempts)
        ctx.beginPath();
        ctx.moveTo(margin, margin + chartHeight);
        ctx.lineTo(margin + chartWidth, margin + chartHeight);
        ctx.strokeStyle = '#333';
        ctx.stroke();

        // Draw Y-axis (Reaction Time)
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, margin + chartHeight);
        ctx.stroke();

        // X-axis labels
        for (let i = 0; i < data.length; i++) {
            const x = margin + i * xScale;
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${i + 1}`, x, margin + chartHeight + 15); // Attempt number
        }
        ctx.fillText('Attempt', margin + chartWidth / 2, margin + chartHeight + 30);

        // Y-axis labels
        const numYLabels = 5;
        for (let i = 0; i <= numYLabels; i++) {
            const yValue = (maxTime * 1.1 / numYLabels) * i;
            const y = margin + chartHeight - (yValue * yScale);
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${Math.round(yValue)}`, margin - 5, y + 3);
        }
        ctx.textAlign = 'center';
        ctx.fillText('Time (ms)', margin - 20, margin + chartHeight / 2);

        // Plot data
        ctx.beginPath();
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;

        data.forEach((time, index) => {
            const x = margin + index * xScale;
            const y = margin + chartHeight - (time * yScale);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // Draw points
            ctx.fillStyle = '#007bff';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2, true);
            ctx.fill();
        });
        ctx.stroke();

        // Add titles
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Reaction Time Progress (ms)', reactionTimeChart.width / 2, margin / 2);
    }

    function startGame() {
        if (isGameRunning) return;
        isGameRunning = true;

        reactionTarget.removeEventListener('click', startGame);
        reactionTarget.addEventListener('click', recordReaction);

        messageDisplay.textContent = 'Wait for green...';
        reactionTimeDisplay.textContent = 'Reaction Time: --';
        reactionTarget.style.backgroundColor = '#ccc'; // Grey, indicating waiting
        reactionTarget.textContent = '...';
        reactionTarget.style.cursor = 'wait';

        // Randomly position the target
        const gameAreaWidth = gameArea.clientWidth; // 600px
        const gameAreaHeight = gameArea.clientHeight; // 400px
        const targetWidth = reactionTarget.clientWidth; // 150px
        const targetHeight = reactionTarget.clientHeight; // 150px

        const maxX = gameAreaWidth - targetWidth;
        const maxY = gameAreaHeight - targetHeight;

        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);

        reactionTarget.style.position = 'absolute'; // Ensure absolute positioning
        reactionTarget.style.left = `${randomX}px`;
        reactionTarget.style.top = `${randomY}px`;

        const randomDelay = Math.floor(Math.random() * 3000) + 1000; // 1 to 4 seconds

        timeoutId = setTimeout(() => {
            reactionTarget.style.backgroundColor = '#28a745'; // Green for go
            reactionTarget.textContent = 'Click!';
            reactionTarget.style.cursor = 'pointer';
            startTime = Date.now();
            isWaitingToClick = true;
        }, randomDelay);
    }

    function recordReaction() {
        if (!isGameRunning) return; // Game not started yet

        clearTimeout(timeoutId); // Clear any pending 'go' timeout

        if (isWaitingToClick) {
            endTime = Date.now();
            const reactionTime = endTime - startTime;
            reactionTimeDisplay.textContent = `Reaction Time: ${reactionTime} ms`;
            reactionTimes.push(reactionTime);
            updateReactionTimesLog(); // Update the log and graph after recording a reaction
            messageDisplay.textContent = 'Good job! Next round in 1 second...';
            isWaitingToClick = false;

            // Reset target for next round
            reactionTarget.style.backgroundColor = '#007bff'; // Back to blue
            reactionTarget.textContent = 'Click to Start';
            reactionTarget.style.cursor = 'pointer';
            isGameRunning = false; // Allow restart via initial click listener
            reactionTarget.removeEventListener('click', recordReaction);
            reactionTarget.addEventListener('click', startGame);

            setTimeout(startGame, 1000); // Start next round after 1 second

        } else {
            // Clicked too early
            messageDisplay.textContent = 'Too early! Try again. Restarting in 1 second...';
            reactionTimeDisplay.textContent = 'Reaction Time: --';
            reactionTarget.style.backgroundColor = '#dc3545'; // Red for error
            reactionTarget.textContent = 'Too Early!';
            reactionTarget.style.cursor = 'not-allowed';
            isGameRunning = false; // Reset game state

            reactionTarget.removeEventListener('click', recordReaction);
            reactionTarget.addEventListener('click', startGame);

            setTimeout(() => {
                reactionTarget.style.backgroundColor = '#007bff'; // Back to blue
                reactionTarget.textContent = 'Click to Start';
                reactionTarget.style.cursor = 'pointer';
                // No need to call startGame here, user will click to start again
            }, 1000);
        }
    }

    // Initial event listener
    reactionTarget.addEventListener('click', startGame);

    // Optional: Add some basic styling changes for visual feedback on initial state
    reactionTarget.style.backgroundColor = '#007bff';
    reactionTarget.textContent = 'Click to Start';
    reactionTarget.style.cursor = 'pointer';
    updateReactionTimesLog(); // Call once on load to initialize empty log and graph
});
