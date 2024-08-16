/* Stores the CSS styling */

document.addEventListener('DOMContentLoaded', () => {
    // Add event listener to the form submission
    document.getElementById('goalForm').addEventListener('submit', async (event) => {
        event.preventDefault();  // Prevent the default form submission

        // Collect form data
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);

        // Convert target date to a valid format (if present)
        if (data.targetDate) {
            data.targetDate = new Date(data.targetDate).toISOString();
        }

        // Convert empty optional fields to null
        if (data.dietaryPreferences === "") data.dietaryPreferences = null;
        if (data.medicalConsiderations === "") data.medicalConsiderations = null;

        try {
            // Send the collected data to the back-end server
            const response = await fetch('/goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            // Check the response status
            if (response.ok) {
                const result = await response.json();
                alert(result.message);  // Show success message
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);  // Show error message
            }
        } catch (error) {
            console.error('Error:', error);
            alert('There was a problem submitting your goal.');
        }
    });
});
